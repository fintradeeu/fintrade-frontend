import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { toast } from "sonner";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  CheckCircle, ArrowRight, ArrowLeft, User, Phone, Mail,
  Camera, Fingerprint, FileText, Download, Shield, Lock, GraduationCap, Calendar, Upload, X, RefreshCw
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import logo from "../../../imports/fintrade_logo.png";
import api from "../../services/api";
import CourseCheckoutModal from "../../components/CourseCheckoutModal";

const TOTAL_STEPS = 7;

function StepBar({ current }: { current: number }) {
  const steps = [
    "Personal Details", "Mobile OTP", "Email OTP",
    "KYC Docs", "Signature & Biometric", "Verification", "Contract"
  ];
  return (
    <div className="w-full mb-10">
      <div className="flex items-center justify-between mb-2">
        {steps.map((s, i) => (
          <div key={i} className="flex flex-col items-center flex-1">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mb-1 transition-all"
              style={{
                background: i < current ? "#D50032" : i === current ? "#D50032" : "#e5e7eb",
                color: i <= current ? "white" : "#9ca3af",
                boxShadow: i === current ? "0 0 0 4px rgba(213,0,50,0.2)" : "none",
              }}
            >
              {i < current ? <CheckCircle className="h-4 w-4" /> : i + 1}
            </div>
            <span className="text-xs text-center hidden md:block" style={{ color: i <= current ? "#D50032" : "#9ca3af", fontWeight: i === current ? 700 : 400 }}>
              {s}
            </span>
          </div>
        ))}
      </div>
      <div className="relative h-1.5 rounded-full bg-gray-200 mt-1">
        <div
          className="absolute left-0 top-0 h-full rounded-full transition-all duration-500"
          style={{ width: `${(current / (TOTAL_STEPS - 1)) * 100}%`, background: "linear-gradient(90deg, #D50032, #FF4D70)" }}
        />
      </div>
    </div>
  );
}

export default function ContractKYC() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [mobileOtp, setMobileOtp] = useState("");
  const [emailOtp, setEmailOtp] = useState("");
  const [aadhaarUploaded, setAadhaarUploaded] = useState(false);
  const [panUploaded, setPanUploaded] = useState(false);
  const [photoUploaded, setPhotoUploaded] = useState(false);
  const [signed, setSigned] = useState(false);
  const [biometricDone, setBiometricDone] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [dbSignatureUrl, setDbSignatureUrl] = useState<string | null>(null);
  const [dbSelfieUrl, setDbSelfieUrl] = useState<string | null>(null);
  const [dbAadhaarDocUrl, setDbAadhaarDocUrl] = useState<string | null>(null);
  const [dbPanDocUrl, setDbPanDocUrl] = useState<string | null>(null);
  const [dbPhotoUrl, setDbPhotoUrl] = useState<string | null>(null);

  // Real file references
  const [aadhaarFile, setAadhaarFile] = useState<File | null>(null);
  const [panFile, setPanFile] = useState<File | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [biometricFile, setBiometricFile] = useState<File | null>(null);

  // Canvas signature pad
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  // Webcam selfie
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);

  // Dynamic user data states (clean, no dummy defaults)
  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [qualification, setQualification] = useState("");
  const [address, setAddress] = useState("");
  const [mobile, setMobile] = useState("");
  const [aadhaar, setAadhaar] = useState("");
  const [pan, setPan] = useState("");
  const [email, setEmail] = useState("");

  // Target course state for checkouts
  const [course, setCourse] = useState<any>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [kycAlreadyDone, setKycAlreadyDone] = useState(false);
  const [kycStatus, setKycStatus] = useState("not_started");
  const [rejectionReason, setRejectionReason] = useState("");

  // Load existing KYC & target course contexts
  useEffect(() => {
    // 1. Fetch current profile details to pre-populate fields
    api.get("/auth/me")
      .then((res) => {
        if (res.data) {
          if (res.data.full_name) setFullName(res.data.full_name);
          if (res.data.phone) setMobile(res.data.phone);
          if (res.data.email) setEmail(res.data.email);
        }
      })
      .catch((err) => {
        console.error("Error loading user profile details", err);
        navigate("/login");
      });

    // 2. Fetch current KYC status and restore saved details if any
    api.get("/kyc/status")
      .then(async (res) => {
        if (res.data && res.data.status !== "not_started") {
          setKycStatus(res.data.status);
          setRejectionReason(res.data.rejection_reason || "");
          if (res.data.full_name) setFullName(res.data.full_name);
          if (res.data.dob) setDob(res.data.dob);
          if (res.data.qualification) setQualification(res.data.qualification);
          if (res.data.address) setAddress(res.data.address);
          if (res.data.mobile) setMobile(res.data.mobile);
          if (res.data.aadhaar_number) setAadhaar(res.data.aadhaar_number);
          if (res.data.pan_number) setPan(res.data.pan_number);
          if (res.data.mobile_verified) setMobileOtp("");
          if (res.data.email_verified) setEmailOtp("");
          if (res.data.status === "rejected") {
            setAadhaarUploaded(false);
            setPanUploaded(false);
            setPhotoUploaded(false);
            setSigned(false);
            setBiometricDone(false);
            setStep(3);
          } else if (res.data.aadhaar_doc_url) {
            setAadhaarUploaded(true);
            setDbAadhaarDocUrl(res.data.aadhaar_doc_url);
          }
          if (res.data.pan_doc_url) {
            setPanUploaded(true);
            setDbPanDocUrl(res.data.pan_doc_url);
          }
          if (res.data.photo_url) {
            setPhotoUploaded(true);
            setDbPhotoUrl(res.data.photo_url);
          }
          if (res.data.signature_url) {
            setSigned(true);
            setDbSignatureUrl(res.data.signature_url);
          }
          if (res.data.biometric_selfie_url) {
            setBiometricDone(true);
            setDbSelfieUrl(res.data.biometric_selfie_url);
          }
          if (res.data.status === "verified" || res.data.status === "approved") {
            setVerified(true);
            // KYC already completed — skip to contract step
            setStep(6);
            setKycAlreadyDone(true);
          } else if (
            res.data.status === "pending" &&
            res.data.aadhaar_doc_url && res.data.pan_doc_url && res.data.photo_url &&
            res.data.signature_url && res.data.biometric_selfie_url
          ) {
            // Finalize submissions created by the older approval-gated flow.
            const completed = await handleGenerateContractOnBackend(false);
            if (completed) {
              setKycStatus("verified");
              setVerified(true);
              setStep(6);
            }
          }
        }
      })
      .catch((err) => console.error("Error loading KYC status", err));

    // 3. Fetch target course context if present in the URL
    const searchParams = new URLSearchParams(window.location.search);
    const courseId = searchParams.get("course_id");
    if (courseId) {
      api.get(`/courses/${courseId}`)
        .then((res) => {
          setCourse(res.data);
        })
        .catch((err) => {
          console.error("Failed to fetch course details for KYC checkout flow", err);
        });
    }
  }, []);

  useEffect(() => {
    if (step !== 5 && step !== 6) return;
    const checkReview = async () => {
      try {
        const { data } = await api.get("/kyc/status");
        setKycStatus(data.status);
        if (data.status === "verified" || data.status === "approved") {
          if (step === 5) {
            setVerified(true);
            setStep(6);
          }
        } else if (
          data.status === "pending" && data.aadhaar_doc_url && data.pan_doc_url &&
          data.photo_url && data.signature_url && data.biometric_selfie_url
        ) {
          const completed = await handleGenerateContractOnBackend(false);
          if (completed) {
            setKycStatus("verified");
            setVerified(true);
            setStep(6);
          }
        } else if (data.status === "rejected") {
          setRejectionReason(data.rejection_reason || "Please upload all documents again.");
          setAadhaarUploaded(false); setPanUploaded(false); setPhotoUploaded(false);
          setSigned(false); setBiometricDone(false);
          setAadhaarFile(null); setPanFile(null); setPhotoFile(null);
          setSignatureFile(null); setBiometricFile(null);
          setStep(3);
          toast.error("Your KYC was rejected. Please fill and upload all documents again.");
        }
      } catch (error) {
        console.error("Unable to refresh KYC review status", error);
      }
    };
    const timer = window.setInterval(checkReview, 10000);
    return () => window.clearInterval(timer);
  }, [step]);

  // Trigger Email OTP automatically when entering Step 2
  useEffect(() => {
    if (step === 2) {
      handleSendEmailOtp();
    }
  }, [step]);

  // ── Canvas Signature helpers ──────────────────────────────
  const getCanvasPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top };
  };
  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDrawing(true);
    lastPos.current = getCanvasPos(e);
  };
  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const pos = getCanvasPos(e);
    ctx.beginPath();
    ctx.moveTo(lastPos.current!.x, lastPos.current!.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = "#1a1a2e";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.stroke();
    lastPos.current = pos;
    setHasDrawn(true);
  };
  const endDraw = () => setIsDrawing(false);
  const clearSignature = () => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    setSigned(false);
    setSignatureFile(null);
  };
  const saveSignature = () => {
    if (!hasDrawn) { toast.error("Please draw your signature first."); return; }
    const canvas = canvasRef.current!;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], "signature.png", { type: "image/png" });
      setSignatureFile(file);
      setSigned(true);
      toast.success("Signature saved!");
    });
  };

  // ── Webcam Selfie helpers ─────────────────────────────────
  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      setCameraStream(stream);
      setCameraOpen(true);
      setTimeout(() => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      }, 100);
    } catch {
      toast.error("Cannot access camera. Please allow camera permission.");
    }
  };
  const capturePhoto = () => {
    const video = videoRef.current!;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")!.drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], "selfie.png", { type: "image/png" });
      setBiometricFile(file);
      setSelfiePreview(canvas.toDataURL("image/png"));
      setBiometricDone(true);
      stopCamera();
      toast.success("Selfie captured!");
    });
  };
  const stopCamera = () => {
    cameraStream?.getTracks().forEach((t) => t.stop());
    setCameraStream(null);
    setCameraOpen(false);
  };

  const next = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const handleResendMobileOtp = async () => {
    try {
      await api.post("/kyc/send-mobile-otp");
      toast.success("A verification OTP code has been sent to your mobile number.");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to send SMS OTP. Please try again.");
    }
  };

  const handleSendEmailOtp = async () => {
    try {
      await api.post("/kyc/send-email-otp");
      toast.success("A verification OTP code has been sent to your email address.");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to send email OTP. Please try again.");
    }
  };

  const handleContinue = async () => {
    if (step === 0) {
      // Save personal details to backend
      try {
        await api.post("/kyc/submit", {
          full_name: fullName,
          dob: dob,
          qualification: qualification,
          address: address,
          mobile: mobile,
          aadhaar_number: aadhaar,
          pan_number: pan
        });
        
        // Trigger Twilio SMS OTP immediately
        try {
          await api.post("/kyc/send-mobile-otp");
          toast.success("A verification OTP code has been sent to your mobile number.");
        } catch (e: any) {
          toast.error(e.response?.data?.detail || "Failed to send SMS OTP. Please try again from the verification screen.");
        }
      } catch (err: any) {
        toast.error("Failed to save KYC details to database.");
        return;
      }
      next();
      return;
    }
    
    if (step === 1) {
      if (!mobileOtp || mobileOtp.length < 4) {
        toast.error("Please enter a valid OTP code.");
        return;
      }
      try {
        await api.post("/kyc/verify-mobile-otp", { otp: mobileOtp });
        toast.success("Mobile OTP verified successfully!");
        next();
      } catch (err: any) {
        toast.error(err.response?.data?.detail || "Invalid mobile OTP code. Please try again.");
      }
      return;
    }

    if (step === 2) {
      if (!emailOtp || emailOtp.length < 6) {
        toast.error("Please enter a valid 6-digit OTP code.");
        return;
      }
      try {
        await api.post("/kyc/verify-email-otp", { otp: emailOtp });
        toast.success("Email OTP verified successfully!");
        next();
      } catch (err: any) {
        toast.error(err.response?.data?.detail || "Invalid email OTP code. Please try again.");
      }
      return;
    }

    if (step === 3) {
      if (!aadhaar || !aadhaar.trim()) {
        toast.error("Aadhaar Number is mandatory.");
        return;
      }
      const cleanAadhaar = aadhaar.trim();
      if (!/^\d{12}$/.test(cleanAadhaar)) {
        toast.error("Aadhaar Number must be exactly 12 digits.");
        return;
      }

      if (!pan || !pan.trim()) {
        toast.error("PAN Number is mandatory.");
        return;
      }
      const cleanPan = pan.trim().toUpperCase();
      if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(cleanPan)) {
        toast.error("PAN Number must be a valid 10-character alphanumeric format (e.g. ABCDE1234F).");
        return;
      }

      if (!(aadhaarFile || aadhaarUploaded) || !(panFile || panUploaded) || !(photoFile || photoUploaded)) {
        toast.error("Please upload all 3 documents to proceed.");
        return;
      }

      // Save Aadhaar and PAN numbers to backend database
      try {
        await api.post("/kyc/submit", {
          full_name: fullName,
          dob: dob,
          qualification: qualification,
          address: address,
          mobile: mobile,
          aadhaar_number: cleanAadhaar,
          pan_number: cleanPan
        });
        setKycStatus("pending");
        setRejectionReason("");
      } catch (err: any) {
        toast.error("Failed to save Aadhaar/PAN details to database.");
        return;
      }

      // Upload selected files
      try {
        if (aadhaarFile) {
          const fd1 = new FormData(); fd1.append("file", aadhaarFile);
          await api.post("/kyc/upload-document?doc_type=aadhaar", fd1, {
            headers: { "Content-Type": undefined }
          });
        }
        if (panFile) {
          const fd2 = new FormData(); fd2.append("file", panFile);
          await api.post("/kyc/upload-document?doc_type=pan", fd2, {
            headers: { "Content-Type": undefined }
          });
        }
        if (photoFile) {
          const fd3 = new FormData(); fd3.append("file", photoFile);
          await api.post("/kyc/upload-document?doc_type=photo", fd3, {
            headers: { "Content-Type": undefined }
          });
        }
        toast.success("Documents processed successfully!");
      } catch (e: any) {
        const errorMsg = typeof e.response?.data?.detail === "string"
          ? e.response.data.detail
          : "Document upload failed. Please try again.";
        toast.error(errorMsg);
        return;
      }
      next();
      return;
    }

    if (step === 4) {
      if (!(signatureFile || signed) || !(biometricFile || biometricDone)) {
        toast.error("Please draw your signature and capture a selfie to proceed.");
        return;
      }
      try {
        if (signatureFile) {
          const fd1 = new FormData(); fd1.append("file", signatureFile);
          await api.post("/kyc/upload-signature", fd1, {
            headers: { "Content-Type": undefined }
          });
        }
        if (biometricFile) {
          const fd2 = new FormData(); fd2.append("file", biometricFile);
          await api.post("/kyc/upload-biometric", fd2, {
            headers: { "Content-Type": undefined }
          });
        }
        const submitted = await handleGenerateContractOnBackend(false);
        if (!submitted) return;
        setKycStatus("verified");
        setVerified(true);
        setStep(6);
        toast.success("KYC completed successfully. Your documents were sent to admin for review.");
      } catch (e: any) {
        const errorMsg = typeof e.response?.data?.detail === "string"
          ? e.response.data.detail
          : "Upload failed. Please try again.";
        toast.error(errorMsg);
        return;
      }
      return;
    }

    if (step === 5) {
      setVerifying(true);
      try {
        const { data } = await api.get("/kyc/status");
        setKycStatus(data.status);
        if (data.status === "verified" || data.status === "approved") {
          setVerified(true);
          setStep(6);
        } else if (
          data.status === "pending" && data.aadhaar_doc_url && data.pan_doc_url &&
          data.photo_url && data.signature_url && data.biometric_selfie_url
        ) {
          const completed = await handleGenerateContractOnBackend(false);
          if (completed) {
            setKycStatus("verified");
            setVerified(true);
            setStep(6);
          }
        } else {
          toast.info("Please complete all required KYC documents.");
        }
      } finally {
        setVerifying(false);
      }
      return;
    }

    next();
  };

  const handleGenerateContractOnBackend = async (termsAccepted = true) => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const courseId = searchParams.get("course_id");
      await api.post("/kyc/generate-contract", {
        course_id: courseId ? Number(courseId) : null,
        terms_accepted: termsAccepted
      });
      return true;
    } catch (e) {
      console.error("Failed to generate contract on backend database", e);
      toast.error("Could not submit your documents for review. Please try again.");
      return false;
    }
  };

  const handleDownload = async () => {
    // Generate contract on database side
    await handleGenerateContractOnBackend(true);

    // Resolve Aadhaar, PAN, and Photo document URLs
    let aadhaarImgSrc = "";
    if (aadhaarFile) {
      aadhaarImgSrc = URL.createObjectURL(aadhaarFile);
    } else if (dbAadhaarDocUrl) {
      const base = api.defaults.baseURL || window.location.origin;
      const cleanBase = base.replace(/\/+$/, "");
      const cleanPath = dbAadhaarDocUrl.startsWith("/") ? dbAadhaarDocUrl : `/${dbAadhaarDocUrl}`;
      aadhaarImgSrc = `${cleanBase}${cleanPath}`;
    }

    let panImgSrc = "";
    if (panFile) {
      panImgSrc = URL.createObjectURL(panFile);
    } else if (dbPanDocUrl) {
      const base = api.defaults.baseURL || window.location.origin;
      const cleanBase = base.replace(/\/+$/, "");
      const cleanPath = dbPanDocUrl.startsWith("/") ? dbPanDocUrl : `/${dbPanDocUrl}`;
      panImgSrc = `${cleanBase}${cleanPath}`;
    }

    let photoImgSrc = "";
    if (photoFile) {
      photoImgSrc = URL.createObjectURL(photoFile);
    } else if (dbPhotoUrl) {
      const base = api.defaults.baseURL || window.location.origin;
      const cleanBase = base.replace(/\/+$/, "");
      const cleanPath = dbPhotoUrl.startsWith("/") ? dbPhotoUrl : `/${dbPhotoUrl}`;
      photoImgSrc = `${cleanBase}${cleanPath}`;
    }

    // Get signature image source
    let signatureImgSrc = "";
    if (canvasRef.current && hasDrawn) {
      signatureImgSrc = canvasRef.current.toDataURL("image/png");
    } else if (dbSignatureUrl) {
      const base = api.defaults.baseURL || window.location.origin;
      const cleanBase = base.replace(/\/+$/, "");
      const cleanPath = dbSignatureUrl.startsWith("/") ? dbSignatureUrl : `/${dbSignatureUrl}`;
      signatureImgSrc = `${cleanBase}${cleanPath}`;
    }

    // Get selfie image source
    let selfieImgSrc = "";
    if (selfiePreview) {
      selfieImgSrc = selfiePreview;
    } else if (dbSelfieUrl) {
      const base = api.defaults.baseURL || window.location.origin;
      const cleanBase = base.replace(/\/+$/, "");
      const cleanPath = dbSelfieUrl.startsWith("/") ? dbSelfieUrl : `/${dbSelfieUrl}`;
      selfieImgSrc = `${cleanBase}${cleanPath}`;
    }

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Popup blocked. Please allow popups to download the contract as PDF.");
      return;
    }

    const logoUrl = window.location.origin + logo;

    const htmlContent = `
      <html>
      <head>
        <title>FinTrade_Contract_${fullName.replace(/\s+/g, "_")}</title>
        <style>
          @page { size: A4; margin: 15mm; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1f2937; line-height: 1.5; margin: 0; padding: 0; background: #fff; }
          .container { max-width: 800px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; border-bottom: 3px solid #D50032; padding-bottom: 15px; margin-bottom: 25px; display: flex; flex-direction: column; align-items: center; }
          .logo { height: 45px; margin-bottom: 8px; }
          .title { font-size: 20px; font-weight: 800; color: #0B2A5B; margin: 4px 0; text-transform: uppercase; letter-spacing: 0.5px; }
          .subtitle { font-size: 11px; color: #6b7280; margin: 0; text-transform: uppercase; font-weight: 600; }
          .section { margin-bottom: 22px; page-break-inside: avoid; }
          .section-title { font-size: 13px; font-weight: 800; color: #D50032; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
          .grid { display: grid; grid-template-cols: 1fr 1fr; gap: 12px; margin-bottom: 10px; }
          .info-block { background: #f9fafb; border: 1px solid #e5e7eb; padding: 10px 14px; border-radius: 6px; }
          .info-label { font-size: 10px; color: #6b7280; text-transform: uppercase; font-weight: 750; }
          .info-value { font-size: 13px; font-weight: 600; color: #111827; margin-top: 2px; }
          .terms-list { font-size: 11px; color: #374151; padding-left: 18px; margin: 0; }
          .terms-item { margin-bottom: 6px; text-align: justify; }
          .media-grid { display: grid; grid-template-cols: 1fr 1fr; gap: 15px; margin-top: 10px; page-break-inside: avoid; }
          .media-card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; text-align: center; background: #fff; }
          .media-title { font-size: 11px; font-weight: 700; color: #4b5563; margin-bottom: 8px; text-transform: uppercase; }
          .media-img { max-height: 90px; max-width: 100%; object-fit: contain; border: 1px solid #f3f4f6; border-radius: 4px; }
          .footer-sign { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 15px; page-break-inside: avoid; }
          .seal-box { display: flex; align-items: center; gap: 8px; color: #16a34a; font-weight: bold; font-size: 11px; }
          .stamp { border: 2px solid #16a34a; padding: 3px 6px; border-radius: 4px; text-transform: uppercase; transform: rotate(-5deg); font-family: monospace; font-size: 12px; font-weight: 800; }
          .sign-box { text-align: center; }
          .sign-line { border-top: 1px solid #111827; width: 170px; margin-top: 40px; padding-top: 4px; font-size: 10px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="${logoUrl}" class="logo" alt="Logo" onerror="this.style.display='none'" />
            <div class="title">Trading Education Agreement</div>
            <div class="subtitle">FinTrade LMS Onboarding & Verification Dossier</div>
          </div>

          <div class="section">
            <div class="section-title">1. Student Profile & Personal Details</div>
            <div class="grid">
              <div class="info-block"><div class="info-label">Student Full Name</div><div class="info-value">${fullName}</div></div>
              <div class="info-block"><div class="info-label">Date of Birth</div><div class="info-value">${dob}</div></div>
              <div class="info-block"><div class="info-label">Email Address</div><div class="info-value">${email}</div></div>
              <div class="info-block"><div class="info-label">Mobile Number</div><div class="info-value">${mobile}</div></div>
              <div class="info-block"><div class="info-label">Educational Qualification</div><div class="info-value">${qualification}</div></div>
              <div class="info-block"><div class="info-label">Residential Address</div><div class="info-value">${address}</div></div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">2. Identity Verification & KYC Information</div>
            <div class="grid">
              <div class="info-block"><div class="info-label">Aadhaar Number</div><div class="info-value">${aadhaar}</div></div>
              <div class="info-block"><div class="info-label">PAN Number</div><div class="info-value">${pan}</div></div>
              <div class="info-block"><div class="info-label">Mobile OTP Verification Status</div><div class="info-value">✓ VERIFIED</div></div>
              <div class="info-block"><div class="info-label">Email OTP Verification Status</div><div class="info-value">✓ VERIFIED</div></div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">3. Terms & Conditions of Enrollment</div>
            <ol class="terms-list">
              <li class="terms-item">The Student agrees to abide by all FinTrade platform rules and community guidelines.</li>
              <li class="terms-item">Course fees are non-refundable after 7 days of enrollment.</li>
              <li class="terms-item">All course material is proprietary and may not be shared or redistributed.</li>
              <li class="terms-item">Trading simulation is for educational purposes only; no real capital is at risk.</li>
              <li class="terms-item">FinTrade holds the right to revoke access for breach of terms.</li>
              <li class="terms-item">Placement assistance is merit-based and not guaranteed.</li>
              <li class="terms-item">This contract is governed by the laws of India.</li>
            </ol>
          </div>

          <div class="section">
            <div class="section-title">4. Digital Signatures & Biometric Audit Trail</div>
            <div class="media-grid">
              <div class="media-card">
                <div class="media-title">Recorded Digital Signature</div>
                ${signatureImgSrc ? `<img src="${signatureImgSrc}" class="media-img" />` : `<div style="height: 60px; display: flex; align-items: center; justify-content: center; color: #888; font-size: 10px; border: 1px dashed #ccc; border-radius: 4px;">Signature Image Not Loaded</div>`}
              </div>
              <div class="media-card">
                <div class="media-title">Biometric Audit Selfie</div>
                ${selfieImgSrc ? `<img src="${selfieImgSrc}" class="media-img" />` : `<div style="height: 60px; display: flex; align-items: center; justify-content: center; color: #888; font-size: 10px; border: 1px dashed #ccc; border-radius: 4px;">Biometric Image Not Loaded</div>`}
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">5. Uploaded Verification Documents</div>
            <div class="media-grid" style="grid-template-cols: 1fr 1fr 1fr;">
              <div class="media-card">
                <div class="media-title">Aadhaar Card</div>
                ${aadhaarImgSrc ? `<img src="${aadhaarImgSrc}" class="media-img" />` : `<div style="height: 60px; display: flex; align-items: center; justify-content: center; color: #888; font-size: 10px; border: 1px dashed #ccc; border-radius: 4px;">Aadhaar Not Loaded</div>`}
              </div>
              <div class="media-card">
                <div class="media-title">PAN Card</div>
                ${panImgSrc ? `<img src="${panImgSrc}" class="media-img" />` : `<div style="height: 60px; display: flex; align-items: center; justify-content: center; color: #888; font-size: 10px; border: 1px dashed #ccc; border-radius: 4px;">PAN Not Loaded</div>`}
              </div>
              <div class="media-card">
                <div class="media-title">Passport Size Photo</div>
                ${photoImgSrc ? `<img src="${photoImgSrc}" class="media-img" />` : `<div style="height: 60px; display: flex; align-items: center; justify-content: center; color: #888; font-size: 10px; border: 1px dashed #ccc; border-radius: 4px;">Photo Not Loaded</div>`}
              </div>
            </div>
          </div>

          <div class="footer-sign">
            <div class="seal-box">
              <div class="stamp">Verified</div>
              <div>
                <div style="font-size: 9px; color: #6b7280; font-weight: normal; text-transform: uppercase;">KYC Status</div>
                <div style="color: #111827; font-weight: bold;">APPROVED & STAMPED</div>
                <div style="font-size: 8px; color: #6b7280; font-weight: normal; margin-top: 1px;">Dossier Sealed: ${new Date().toLocaleString("en-IN")}</div>
              </div>
            </div>
            <div class="sign-box">
              <div class="sign-line">Student Digital Signature Auth</div>
              <div style="font-size: 9px; color: #6b7280; margin-top: 2px;">IP Address logged & stamped</div>
            </div>
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 600);
          }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4" style={{ background: "linear-gradient(135deg, #fafafa 0%, #F5F5F5 100%)" }}>
      {/* Glow */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "10%", right: "5%", width: 400, height: 400, borderRadius: "50%", background: "#D50032", filter: "blur(120px)", opacity: 0.07 }} />
        <div style={{ position: "absolute", bottom: "5%", left: "5%", width: 350, height: 350, borderRadius: "50%", background: "#D50032", filter: "blur(100px)", opacity: 0.06 }} />
      </div>

      <div className="w-full max-w-2xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/"><img src={logo} alt="FinTrade" className="h-12 mx-auto mb-4" /></Link>
          <h1 className="text-2xl font-bold" style={{ color: "#121212" }}>Contract & KYC Verification</h1>
          <p className="text-gray-500 text-sm mt-1">Complete your onboarding to activate your account</p>
          <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-full text-xs" style={{ background: "rgba(213,0,50,0.08)", color: "#D50032" }}>
            <Shield className="h-3 w-3" /> Secure digital verification
          </div>
        </div>

        <Card className="p-8 shadow-2xl border border-gray-200 bg-white" style={{ boxShadow: "0 20px 60px rgba(213,0,50,0.08), 0 4px 20px rgba(0,0,0,0.06)" }}>
          {kycAlreadyDone && (
            <div className="mb-6 flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl p-4">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-green-800 text-sm">KYC Already Verified</p>
                <p className="text-xs text-green-700 mt-0.5">Your KYC is already completed. You can download your contract and proceed to payment directly.</p>
              </div>
            </div>
          )}
          {rejectionReason && step === 3 && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
              <X className="h-5 w-5 flex-shrink-0 text-red-600" />
              <div>
                <p className="text-sm font-semibold text-red-800">KYC rejected — upload all documents again</p>
                <p className="mt-1 text-xs text-red-700">Admin reason: {rejectionReason}</p>
              </div>
            </div>
          )}
          <StepBar current={step} />

          {/* Step 0: Personal Details */}
          {step === 0 && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "rgba(213,0,50,0.1)" }}>
                  <User className="h-5 w-5" style={{ color: "#D50032" }} />
                </div>
                <div>
                  <h2 className="text-xl font-bold" style={{ color: "#121212" }}>Personal Details</h2>
                  <p className="text-sm text-gray-500">Basic information about you</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Full Name</Label>
                  <Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-2 bg-gray-50" />
                </div>
                <div>
                  <Label>Date of Birth</Label>
                  <div className="relative mt-2">
                    <Input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full bg-gray-50 pr-10"
                      onClick={(e) => e.currentTarget.showPicker()}
                    />
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>
              <div>
                <Label>Student's Qualification</Label>
                <div className="mt-2">
                  <Select value={qualification} onValueChange={(val) => setQualification(val)}>
                    <SelectTrigger className="w-full bg-gray-50">
                      <SelectValue placeholder="Select Qualification" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SSC">SSC</SelectItem>
                      <SelectItem value="HSC">HSC</SelectItem>
                      <SelectItem value="UNDER-GRADUATE">UNDER-GRADUATE</SelectItem>
                      <SelectItem value="POST GRADUATE">POST GRADUATE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Residential Address</Label>
                <Input value={address} onChange={(e) => setAddress(e.target.value)} className="mt-2 bg-gray-50" />
              </div>
            </div>
          )}

          {/* Step 1: Mobile OTP */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "rgba(213,0,50,0.1)" }}>
                  <Phone className="h-5 w-5" style={{ color: "#D50032" }} />
                </div>
                <div>
                  <h2 className="text-xl font-bold" style={{ color: "#121212" }}>Mobile Verification</h2>
                  <p className="text-sm text-gray-500">Verification code sent to {mobile}</p>
                </div>
              </div>
              <div>
                <Label>Mobile Number</Label>
                <Input value={mobile} readOnly className="mt-2 bg-gray-100 cursor-not-allowed" />
              </div>
              <div>
                <Label>Enter Verification Code</Label>
                <div className="flex gap-3 mt-2">
                  <Input
                    value={mobileOtp}
                    onChange={(e) => setMobileOtp(e.target.value)}
                    placeholder="6-digit OTP"
                    maxLength={6}
                    className="text-center text-xl tracking-widest font-bold"
                    style={{ letterSpacing: "0.5em" }}
                  />
                  <Button variant="outline" type="button" className="whitespace-nowrap border-[#D50032] text-[#D50032]" onClick={handleResendMobileOtp}>
                    Resend SMS OTP
                  </Button>
                </div>
              </div>
              <p className="text-xs text-gray-400">Please enter the 6-digit verification code sent via SMS.</p>
            </div>
          )}

          {/* Step 2: Email OTP */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "rgba(213,0,50,0.1)" }}>
                  <Mail className="h-5 w-5" style={{ color: "#D50032" }} />
                </div>
                <div>
                  <h2 className="text-xl font-bold" style={{ color: "#121212" }}>Email Verification</h2>
                  <p className="text-sm text-gray-500">OTP sent to {email}</p>
                </div>
              </div>
              <div>
                <Label>Email Address</Label>
                <Input value={email} className="mt-2 bg-gray-50" readOnly />
              </div>
              <div>
                <Label>Enter OTP</Label>
                <div className="flex gap-3 mt-2">
                  <Input
                    value={emailOtp}
                    onChange={(e) => setEmailOtp(e.target.value)}
                    placeholder="6-digit OTP"
                    maxLength={6}
                    className="text-center text-xl tracking-widest font-bold"
                    style={{ letterSpacing: "0.5em" }}
                  />
                  <Button variant="outline" type="button" className="whitespace-nowrap border-[#D50032] text-[#D50032]" onClick={handleSendEmailOtp}>
                    Resend Email OTP
                  </Button>
                </div>
              </div>
              <p className="text-xs text-gray-400">Please enter the 6-digit verification code sent to your email.</p>
            </div>
          )}

          {/* Step 3: KYC Documents */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "rgba(213,0,50,0.1)" }}>
                  <FileText className="h-5 w-5" style={{ color: "#D50032" }} />
                </div>
                <div>
                  <h2 className="text-xl font-bold" style={{ color: "#121212" }}>KYC Documents</h2>
                  <p className="text-sm text-gray-500">Upload your identity documents</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Aadhaar Number <span className="text-[#D50032]">*</span></Label>
                  <Input value={aadhaar} onChange={(e) => setAadhaar(e.target.value)} className="mt-2 bg-gray-50" placeholder="12-digit number" />
                </div>
                <div>
                  <Label>PAN Number <span className="text-[#D50032]">*</span></Label>
                  <Input value={pan} onChange={(e) => setPan(e.target.value)} className="mt-2 bg-gray-50" placeholder="10-character alphanumeric" />
                </div>
              </div>
              {([
                {
                  label: "Aadhaar Card (Front & Back)",
                  file: aadhaarFile,
                  accept: "image/*,application/pdf",
                  onFile: (f: File) => { setAadhaarFile(f); setAadhaarUploaded(true); },
                  icon: <Fingerprint className="h-5 w-5" style={{ color: "#D50032" }} />,
                },
                {
                  label: "PAN Card",
                  file: panFile,
                  accept: "image/*,application/pdf",
                  onFile: (f: File) => { setPanFile(f); setPanUploaded(true); },
                  icon: <FileText className="h-5 w-5" style={{ color: "#D50032" }} />,
                },
                {
                  label: "Passport Size Photo",
                  file: photoFile,
                  accept: "image/*",
                  onFile: (f: File) => { setPhotoFile(f); setPhotoUploaded(true); },
                  icon: <Camera className="h-5 w-5" style={{ color: "#D50032" }} />,
                },
              ] as const).map((doc, i) => (
                <div key={i}
                  className="border-2 border-dashed rounded-xl p-4 transition-all"
                  style={{ borderColor: doc.file ? "#4CAF50" : "#d1d5db", background: doc.file ? "rgba(76,175,80,0.04)" : "#fafafa" }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: doc.file ? "rgba(76,175,80,0.1)" : "rgba(213,0,50,0.08)" }}>
                        {doc.file ? <CheckCircle className="h-5 w-5 text-green-600" /> : doc.icon}
                      </div>
                      <div>
                        <div className="font-medium text-sm" style={{ color: "#121212" }}>{doc.label}</div>
                        <div className="text-xs text-gray-500">
                          {doc.file ? (
                            <span className="text-green-600 font-semibold">✓ {doc.file.name}</span>
                          ) : "No file chosen — click Upload to browse"}
                        </div>
                      </div>
                    </div>
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept={doc.accept}
                        className="hidden"
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) doc.onFile(f); }}
                      />
                      <span
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all"
                        style={{
                          borderColor: doc.file ? "#4CAF50" : "#D50032",
                          color: doc.file ? "#4CAF50" : "#D50032",
                          background: doc.file ? "rgba(76,175,80,0.06)" : "rgba(213,0,50,0.06)",
                        }}
                      >
                        <Upload className="h-3.5 w-3.5" />
                        {doc.file ? "Change" : "Upload"}
                      </span>
                    </label>
                  </div>
                  {/* Image preview */}
                  {doc.file && doc.file.type.startsWith("image/") && (
                    <div className="mt-3">
                      <img
                        src={URL.createObjectURL(doc.file)}
                        alt="preview"
                        className="h-24 w-full object-contain rounded-lg border border-green-100"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Step 4: Signature & Biometric */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "rgba(213,0,50,0.1)" }}>
                  <Fingerprint className="h-5 w-5" style={{ color: "#D50032" }} />
                </div>
                <div>
                  <h2 className="text-xl font-bold" style={{ color: "#121212" }}>Signature & Biometric</h2>
                  <p className="text-sm text-gray-500">Draw your signature and take a selfie</p>
                </div>
              </div>

              {/* ── Signature Canvas ─────────────────────── */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Digital Signature <span className="text-xs text-gray-400 ml-1">(Draw with mouse or finger)</span></Label>
                  {hasDrawn && (
                    <button onClick={clearSignature} className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors">
                      <RefreshCw className="h-3 w-3" /> Clear
                    </button>
                  )}
                </div>
                <div
                  className="border-2 rounded-xl overflow-hidden"
                  style={{ borderColor: signed ? "#4CAF50" : "#d1d5db", background: "#fff" }}
                >
                  <canvas
                    ref={canvasRef}
                    width={500}
                    height={160}
                    className="w-full touch-none cursor-crosshair"
                    style={{ display: "block", background: signed ? "rgba(76,175,80,0.03)" : "#fafafa" }}
                    onMouseDown={startDraw}
                    onMouseMove={draw}
                    onMouseUp={endDraw}
                    onMouseLeave={endDraw}
                    onTouchStart={startDraw}
                    onTouchMove={draw}
                    onTouchEnd={endDraw}
                  />
                  <div className="flex items-center justify-between px-4 py-2 border-t border-gray-100 bg-gray-50">
                    {signed ? (
                      <span className="text-xs text-green-600 font-semibold flex items-center gap-1">
                        <CheckCircle className="h-3.5 w-3.5" /> Signature saved
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">Draw your signature above</span>
                    )}
                    <Button
                      size="sm"
                      onClick={saveSignature}
                      disabled={signed || !hasDrawn}
                      style={{ background: signed ? "#4CAF50" : "#D50032", color: "white", fontSize: 12 }}
                    >
                      {signed ? "✓ Saved" : "Save Signature"}
                    </Button>
                  </div>
                </div>
              </div>

              {/* ── Webcam Selfie ────────────────────────── */}
              <div>
                <Label className="mb-2 block">Biometric Selfie Verification</Label>
                <div
                  className="border-2 border-dashed rounded-xl overflow-hidden"
                  style={{ borderColor: biometricDone ? "#4CAF50" : "#d1d5db", background: biometricDone ? "rgba(76,175,80,0.04)" : "#fafafa" }}
                >
                  {biometricDone && selfiePreview ? (
                    <div className="p-4 flex flex-col items-center gap-3">
                      <div className="relative">
                        <img src={selfiePreview} alt="selfie" className="w-32 h-32 rounded-full object-cover border-4 border-green-400 shadow-lg" />
                        <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                          <CheckCircle className="h-4 w-4 text-white" />
                        </div>
                      </div>
                      <p className="text-sm text-green-600 font-semibold">Selfie captured successfully</p>
                      <button
                        onClick={() => { setBiometricDone(false); setSelfiePreview(null); setBiometricFile(null); }}
                        className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1"
                      >
                        <RefreshCw className="h-3 w-3" /> Retake
                      </button>
                    </div>
                  ) : cameraOpen ? (
                    <div className="p-4 flex flex-col items-center gap-3">
                      <div className="relative rounded-xl overflow-hidden w-full max-w-xs">
                        <video ref={videoRef} autoPlay playsInline muted className="w-full rounded-xl" style={{ transform: "scaleX(-1)" }} />
                        <div className="absolute inset-0 border-4 border-[#D50032] rounded-xl pointer-events-none" style={{ boxShadow: "inset 0 0 20px rgba(213,0,50,0.2)" }} />
                      </div>
                      <div className="flex gap-3">
                        <Button onClick={capturePhoto} style={{ background: "#D50032", color: "white" }}>
                          <Camera className="mr-2 h-4 w-4" /> Capture
                        </Button>
                        <Button variant="outline" onClick={stopCamera} className="border-gray-300">
                          <X className="mr-2 h-4 w-4" /> Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 flex flex-col items-center gap-3">
                      <div className="w-20 h-20 rounded-full border-4 border-dashed flex items-center justify-center" style={{ borderColor: "#D50032" }}>
                        <Camera className="h-8 w-8" style={{ color: "#D50032" }} />
                      </div>
                      <p className="text-gray-500 text-sm">Take a live selfie to verify your identity</p>
                      <Button onClick={openCamera} style={{ background: "#D50032", color: "white" }}>
                        <Camera className="mr-2 h-4 w-4" /> Open Camera
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Verification */}
          {step === 5 && (
            <div className="text-center py-8">
              <div className="flex items-center gap-3 mb-8 justify-center">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "rgba(213,0,50,0.1)" }}>
                  <Shield className="h-5 w-5" style={{ color: "#D50032" }} />
                </div>
                <div className="text-left">
                  <h2 className="text-xl font-bold" style={{ color: "#121212" }}>KYC Verification</h2>
                  <p className="text-sm text-gray-500">Processing your submitted documents</p>
                </div>
              </div>
              {verifying ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-20 h-20 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: "#D50032", borderTopColor: "transparent" }} />
                  <p className="font-semibold text-gray-600">Verifying your KYC...</p>
                  <p className="text-sm text-gray-400">This usually takes a few seconds</p>
                </div>
              ) : verified ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-24 h-24 rounded-full flex items-center justify-center" style={{ background: "rgba(76,175,80,0.1)", border: "3px solid #4CAF50" }}>
                    <CheckCircle className="h-12 w-12 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-green-600">KYC Verified! ✓</h3>
                  <p className="text-gray-500">Your identity has been successfully verified.</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-5">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: "rgba(213,0,50,0.1)" }}>
                    <Shield className="h-10 w-10" style={{ color: "#D50032" }} />
                  </div>
                  <p className="text-gray-600">All documents are submitted and waiting for admin approval.</p>
                  <p className="text-sm text-gray-400">Status: {kycStatus === "pending" ? "Pending review" : kycStatus}</p>
                  <div className="grid grid-cols-2 gap-3 w-full max-w-xs text-left text-sm">
                    {[
                      { label: "Aadhaar", ok: aadhaarUploaded },
                      { label: "PAN", ok: panUploaded },
                      { label: "Signature", ok: signed },
                      { label: "Biometric", ok: biometricDone },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2">
                        {item.ok ? <CheckCircle className="h-4 w-4 text-green-600" /> : <div className="w-4 h-4 rounded-full bg-gray-200 border border-gray-300" />}
                        <span style={{ color: item.ok ? "#4CAF50" : "#9ca3af" }}>{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 6: Contract */}
          {step === 6 && (
            <div className="space-y-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "rgba(213,0,50,0.1)" }}>
                    <FileText className="h-5 w-5" style={{ color: "#D50032" }} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold" style={{ color: "#121212" }}>Your Contract</h2>
                    <p className="text-sm text-gray-500">Review and download your agreement</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold text-white" style={{ background: "#4CAF50" }}>
                  <CheckCircle className="h-3 w-3" /> Verified
                </div>
              </div>

              {/* Contract Preview */}
              <div
                className="rounded-xl border-2 border-gray-200 overflow-y-auto p-6 space-y-4"
                style={{ maxHeight: 340, background: "#fafafa", fontFamily: "Georgia, serif" }}
              >
                <div className="text-center border-b border-gray-200 pb-4">
                  <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">FinTrade Education Pvt. Ltd.</p>
                  <h3 className="text-lg font-bold" style={{ color: "#121212" }}>TRADING EDUCATION AGREEMENT</h3>
                  <p className="text-xs text-gray-500 mt-1">Date: {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {[
                    ["Student Name", fullName],
                    ["Mobile", mobile],
                    ["Email", email],
                    ["Aadhaar", aadhaar],
                    ["PAN", pan],
                    ["Date of Birth", dob],
                    ["Qualification", qualification],
                  ].map(([k, v], i) => (
                    <div key={i} className="bg-white rounded-lg p-3 border border-gray-100">
                      <div className="text-xs text-gray-400">{k}</div>
                      <div className="font-semibold text-sm" style={{ color: "#121212" }}>{v}</div>
                    </div>
                  ))}
                </div>
                <div className="text-sm text-gray-600 space-y-3 pt-2">
                  <p className="font-bold" style={{ color: "#121212" }}>Terms & Conditions</p>
                  {[
                    "The Student agrees to abide by all FinTrade platform rules and community guidelines.",
                    "Course fees are non-refundable after 7 days of enrollment.",
                    "All course material is proprietary and may not be shared or redistributed.",
                    "Trading simulation is for educational purposes only; no real capital is at risk.",
                    "FinTrade holds the right to revoke access for breach of terms.",
                    "Placement assistance is merit-based and not guaranteed.",
                    "This contract is governed by the laws of India.",
                  ].map((t, i) => (
                    <div key={i} className="flex gap-2">
                      <span className="text-[#D50032] font-bold flex-shrink-0">{i + 1}.</span>
                      <span>{t}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400">Digitally signed by</p>
                    <p className="font-bold text-lg" style={{ fontFamily: "cursive", color: "#121212" }}>{fullName}</p>
                  </div>
                  <div className="flex items-center gap-2 text-green-600 text-sm">
                    <Lock className="h-4 w-4" /> Verified & Sealed
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-200">
                <input
                  type="checkbox"
                  id="agree"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="w-4 h-4 accent-[#D50032]"
                />
                <label htmlFor="agree" className="text-sm text-gray-600 cursor-pointer">
                  I have read and agree to the terms and conditions of this contract
                </label>
              </div>

              {/* Action Buttons: Download Contract & Process to Pay */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <Button
                  onClick={handleDownload}
                  disabled={!agreed}
                  variant="outline"
                  className="w-full border-[#D50032] text-[#D50032] hover:bg-[#D50032]/10"
                  size="lg"
                >
                  <Download className="mr-2 h-5 w-5" />
                  Download Contract
                </Button>
                <Button
                  onClick={() => setShowCheckout(true)}
                  disabled={!agreed || !course}
                  className="w-full font-bold text-white shadow-lg"
                  style={{
                    background: (agreed && course) ? "linear-gradient(90deg, #D50032, #FF4D70)" : "#e5e7eb",
                    color: (agreed && course) ? "white" : "#9ca3af",
                    cursor: (agreed && course) ? "pointer" : "not-allowed",
                  }}
                  size="lg"
                >
                  Process to Pay
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
              {!course && agreed && (
                <p className="text-center text-xs text-[#D50032]/70 mt-2">
                  No course was selected for payment context. Check and select a course to activate payment.
                </p>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
            <Button
              variant="outline"
              onClick={back}
              disabled={step === 0}
              className="border-gray-300 hover:border-[#D50032]"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            {step < 6 ? (
              <Button
                onClick={handleContinue}
                style={{ background: "#D50032", color: "white" }}
                disabled={verifying}
              >
                {step === 5 ? (verified ? "View Contract" : "Refresh Status") : "Continue"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Link to="/">
                <Button style={{ background: "#121212", color: "white" }}>
                  Back to Home
                </Button>
              </Link>
            )}
          </div>
        </Card>

        {/* Inline Checkout Modal Overlay */}
        {showCheckout && course && (
          <CourseCheckoutModal
            course={course}
            onClose={() => setShowCheckout(false)}
            onSuccess={() => {
              setShowCheckout(false);
              navigate("/student/dashboard"); // Navigate to student dashboard on successful payment
            }}
          />
        )}

        <p className="text-center text-xs text-gray-400 mt-6">
          🔒 256-bit encrypted • Secured by FinTrade • Mumbai, India
        </p>
      </div>
    </div>
  );
}
