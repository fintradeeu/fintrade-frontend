import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router";
import { motion } from "motion/react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { toast } from "sonner";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  CheckCircle, ArrowRight, ArrowLeft, User, Phone, Mail,
  Camera, Fingerprint, FileText, Download, Shield, Lock, GraduationCap, Calendar, Upload, X, RefreshCw, Sparkles, BadgeCheck
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
  const isDrawingRef = useRef(false);
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
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const getCanvasPos = (e: TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches[0].clientX;
      const clientY = e.touches[0].clientY;
      const x = ((clientX - rect.left) / rect.width) * canvas.width;
      const y = ((clientY - rect.top) / rect.height) * canvas.height;
      return { x, y };
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        e.preventDefault();
        isDrawingRef.current = true;
        lastPos.current = getCanvasPos(e);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isDrawingRef.current && e.touches.length === 1) {
        e.preventDefault();
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
      }
    };

    const handleTouchEnd = () => {
      isDrawingRef.current = false;
    };

    canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
    canvas.addEventListener("touchend", handleTouchEnd, { passive: false });

    return () => {
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchend", handleTouchEnd);
    };
  }, [step]);

  const startDraw = (e: React.MouseEvent) => {
    isDrawingRef.current = true;
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;
    lastPos.current = { x, y };
  };

  const draw = (e: React.MouseEvent) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;

    ctx.beginPath();
    ctx.moveTo(lastPos.current!.x, lastPos.current!.y);
    ctx.lineTo(x, y);
    ctx.strokeStyle = "#1a1a2e";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.stroke();
    lastPos.current = { x, y };
    setHasDrawn(true);
  };

  const endDraw = () => {
    isDrawingRef.current = false;
  };

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

  // ── Webcam Selfie & Upload helpers ─────────────────────────
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBiometricFile(file);
    setSelfiePreview(URL.createObjectURL(file));
    setBiometricDone(true);
    toast.success("Photo uploaded successfully!");
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
      if (!fullName || !fullName.trim()) {
        toast.error("Full Name is required.");
        return;
      }
      if (!dob) {
        toast.error("Date of Birth is required.");
        return;
      }
      
      // Calculate age and verify it's at least 18
      const dobDate = new Date(dob);
      const today = new Date();
      let age = today.getFullYear() - dobDate.getFullYear();
      const monthDiff = today.getMonth() - dobDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dobDate.getDate())) {
        age--;
      }
      if (age < 18) {
        toast.error("You must be at least 18 years old to proceed with KYC verification.");
        return;
      }

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

  const stepLabels = ["Details", "Mobile", "Email", "Docs", "Biometric", "Status", "Contract"];
  const fieldClass = "h-12 bg-white/85 border-white/70 focus:border-[#D50032] focus:bg-white rounded-2xl transition-all text-sm font-semibold text-slate-800 font-sans shadow-[0_12px_30px_-22px_rgba(11,42,91,0.55)] placeholder-slate-400 focus:shadow-[0_18px_40px_-24px_rgba(213,0,50,0.55)]";
  const labelClass = "text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 font-sans";

  return (
    <div className="min-h-screen flex items-center justify-center py-8 px-4 bg-[#07111f] relative overflow-hidden font-sans text-slate-800">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_16%,rgba(213,0,50,0.30),transparent_28%),radial-gradient(circle_at_86%_12%,rgba(43,121,255,0.22),transparent_30%),linear-gradient(135deg,#07111f_0%,#101827_48%,#f8fafc_48%,#eef3fb_100%)]" />
      <div className="absolute inset-0 opacity-[0.18] bg-[linear-gradient(rgba(255,255,255,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.18)_1px,transparent_1px)] bg-[size:44px_44px]" />
      <div className="kyc-aurora absolute left-[-18%] top-[18%] h-64 w-[68%] rotate-[-12deg] rounded-full bg-[#D50032]/20 blur-3xl" />
      <div className="kyc-aurora kyc-aurora-delay absolute right-[-18%] bottom-[8%] h-72 w-[62%] rotate-[10deg] rounded-full bg-[#2b79ff]/18 blur-3xl" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />

      {/* Dynamic Keyframe Animations Injection */}
      <style>{`
        @keyframes scanline {
          0% { top: 0%; opacity: 0.3; }
          50% { top: 100%; opacity: 0.95; }
          100% { top: 0%; opacity: 0.3; }
        }
        .animate-scan {
          position: absolute;
          animation: scanline 2.5s infinite linear;
        }
        @keyframes radar-pulse {
          0% { transform: scale(0.7); opacity: 0.95; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        .animate-radar-1 {
          animation: radar-pulse 2s infinite cubic-bezier(0.1, 0.8, 0.3, 1);
        }
        .animate-radar-2 {
          animation: radar-pulse 2s infinite cubic-bezier(0.1, 0.8, 0.3, 1);
          animation-delay: 0.6s;
        }
        .animate-radar-3 {
          animation: radar-pulse 2s infinite cubic-bezier(0.1, 0.8, 0.3, 1);
          animation-delay: 1.2s;
        }
        .step-slide {
          animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes auroraDrift {
          0%, 100% { transform: translate3d(0, 0, 0) rotate(-12deg) scale(1); opacity: 0.82; }
          50% { transform: translate3d(42px, -18px, 0) rotate(-8deg) scale(1.08); opacity: 1; }
        }
        @keyframes shineSweep {
          0% { transform: translateX(-120%) skewX(-16deg); }
          100% { transform: translateX(220%) skewX(-16deg); }
        }
        @keyframes floatIn {
          from { opacity: 0; transform: translateY(18px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .kyc-aurora { animation: auroraDrift 8s ease-in-out infinite; }
        .kyc-aurora-delay { animation-delay: -3.4s; }
        .shine-sweep::after {
          content: "";
          position: absolute;
          inset: -40% auto -40% 0;
          width: 34%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.52), transparent);
          animation: shineSweep 4.8s ease-in-out infinite;
        }
        .kyc-shell { animation: floatIn 0.65s cubic-bezier(0.16, 1, 0.3, 1) both; }
      `}</style>

      <div className="w-full max-w-5xl relative z-10">
        
        {/* Main Onboarding Card */}
        <Card className="kyc-shell bg-white/78 backdrop-blur-2xl border border-white/70 rounded-[2rem] p-4 sm:p-6 md:p-8 shadow-[0_34px_90px_-32px_rgba(0,0,0,0.58),0_18px_45px_-28px_rgba(213,0,50,0.42)] relative overflow-hidden flex flex-col justify-between min-h-[640px] text-slate-800">
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.92),transparent_38%),linear-gradient(180deg,rgba(255,255,255,0.62),rgba(255,255,255,0.34))]" />
          <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full border border-[#D50032]/12" />
          <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full border border-[#0B2A5B]/10" />
          
          <div className="relative z-10">
            {/* Header Bar */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 mb-8 rounded-[1.5rem] border border-white/80 bg-white/70 px-4 sm:px-5 py-4 shadow-[0_18px_44px_-34px_rgba(11,42,91,0.75)]">
              <Link to="/" className="group flex items-center gap-4 hover:opacity-95 transition-opacity">
                <span className="relative grid h-14 w-14 place-items-center rounded-2xl bg-white shadow-[0_16px_36px_-24px_rgba(213,0,50,0.9)] ring-1 ring-red-100 overflow-hidden shine-sweep">
                  <img src="/F-LOGO--RED.png" alt="FinTrade Logo" className="relative z-10 h-9 w-auto object-contain" />
                </span>
                <span>
                  <span className="block text-xl sm:text-2xl font-black text-[#0B2A5B] tracking-tight leading-tight">FT EDUTECH</span>
                  <span className="mt-1 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                    <Sparkles className="h-3 w-3 text-[#D50032]" /> Premium eKYC onboarding
                  </span>
                </span>
              </Link>
              
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[10px] font-extrabold tracking-wide bg-[#0B2A5B] text-white border border-white/20 shadow-[0_14px_32px_-22px_rgba(11,42,91,0.9)] uppercase font-sans">
                  <Lock className="h-3 w-3 text-red-200" /> Bank-grade encrypted
                </span>
                <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[10px] font-extrabold tracking-wide bg-red-50 text-[#D50032] border border-red-100 shadow-sm uppercase font-sans">
                  <Shield className="h-3 w-3" /> Secure verification
                </span>
              </div>
            </div>

            {/* Modern Horizontal Stepper Timeline */}
            <div className="mb-8 rounded-[1.5rem] border border-white/80 bg-white/55 p-4 sm:p-5 shadow-[0_18px_50px_-40px_rgba(11,42,91,0.85)] font-sans">
              <div className="relative flex justify-between items-start w-full">
                {/* Track background */}
                <div className="absolute top-[22px] left-4 right-4 h-[4px] bg-slate-200/70 rounded-full -z-0" />
                {/* Active track fill */}
                <div 
                  className="absolute top-[22px] left-4 h-[4px] bg-gradient-to-r from-[#D50032] via-[#FF4D70] to-[#0B2A5B] rounded-full transition-all duration-700 ease-out shadow-[0_0_18px_rgba(213,0,50,0.38)] -z-0" 
                  style={{ width: `${(step / 6) * 100}%` }}
                />

                {stepLabels.map((s, i) => {
                  const isCompleted = i < step;
                  const isActive = i === step;
                  return (
                    <motion.div
                      key={i}
                      className="flex flex-col items-center relative z-10 min-w-0"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: i * 0.035 }}
                    >
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xs font-black border transition-all duration-300 ${
                        isCompleted 
                          ? "bg-[#0B2A5B] border-[#0B2A5B] text-white shadow-[0_16px_34px_-22px_rgba(11,42,91,0.95)] scale-100" 
                          : isActive 
                            ? "bg-[#D50032] border-[#D50032] text-white shadow-[0_16px_38px_-18px_rgba(213,0,50,0.75)] scale-110 ring-8 ring-[#D50032]/10" 
                            : "bg-white/95 border-white text-slate-400 shadow-sm"
                      }`}>
                        {isCompleted ? <CheckCircle className="h-4 w-4" /> : i + 1}
                      </div>
                      <span className={`text-[10px] font-extrabold mt-3 transition-all duration-300 hidden md:block uppercase tracking-[0.16em] ${
                        isActive 
                          ? "text-[#D50032] scale-105 font-black" 
                          : isCompleted 
                            ? "text-slate-600 font-bold" 
                            : "text-slate-400"
                      }`}>
                        {s}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Notifications */}
            {kycAlreadyDone && (
              <div className="mb-6 flex items-start gap-3 bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
                <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-emerald-800 text-sm font-sans">KYC Already Verified</p>
                  <p className="text-xs text-emerald-700 font-medium mt-0.5 font-sans font-sans">Your KYC status is active. You can review/download your contract and proceed to payment details directly.</p>
                </div>
              </div>
            )}
            
            {rejectionReason && step === 3 && (
              <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 animate-bounce">
                <X className="h-5 w-5 flex-shrink-0 text-red-600" />
                <div>
                  <p className="text-sm font-semibold text-red-800 font-sans font-sans">KYC rejected — upload all documents again</p>
                  <p className="mt-1 text-xs text-red-700/80 font-sans">Admin reason: {rejectionReason}</p>
                </div>
              </div>
            )}

            {/* Step 0: Personal Details */}
            {step === 0 && (
              <div className="space-y-6 step-slide rounded-[1.5rem] border border-white/80 bg-white/62 p-4 sm:p-5 shadow-[0_22px_58px_-42px_rgba(11,42,91,0.95)]">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
                  <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-red-50 to-white border border-white shadow-[0_14px_32px_-22px_rgba(213,0,50,0.75)] text-[#D50032]">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-[#0B2A5B] tracking-tight">Personal Details</h2>
                    <p className="text-xs text-slate-500 font-semibold font-sans">Enter your profile information. Applicant must be 18+ years old.</p>
                  </div>
                  </div>
                  <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-emerald-700">
                    <BadgeCheck className="h-3.5 w-3.5" /> Live encrypted
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className={labelClass}>Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input 
                        value={fullName} 
                        onChange={(e) => setFullName(e.target.value)} 
                        className={`${fieldClass} pl-11`}
                        placeholder="Enter your full name" 
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className={labelClass}>Date of Birth (Minimum 18 Years)</Label>
                    <div className="relative">
                      <Input
                        type="date"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className={`${fieldClass} w-full pr-11`}
                        onClick={(e) => e.currentTarget.showPicker()}
                      />
                      <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className={labelClass}>Student's Qualification</Label>
                  <Select value={qualification} onValueChange={(val) => setQualification(val)}>
                    <SelectTrigger className={`${fieldClass} w-full`}>
                      <SelectValue placeholder="Select Qualification" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-100 bg-white">
                      <SelectItem value="SSC" className="font-medium text-slate-700 focus:bg-slate-50 focus:text-slate-900 cursor-pointer">Secondary School Certificate (SSC)</SelectItem>
                      <SelectItem value="HSC" className="font-medium text-slate-700 focus:bg-slate-50 focus:text-slate-900 cursor-pointer">Higher Secondary Certificate (HSC)</SelectItem>
                      <SelectItem value="UNDER-GRADUATE" className="font-medium text-slate-700 focus:bg-slate-50 focus:text-slate-900 cursor-pointer">Under Graduate Degree (UG)</SelectItem>
                      <SelectItem value="POST GRADUATE" className="font-medium text-slate-700 focus:bg-slate-50 focus:text-slate-900 cursor-pointer">Post Graduate Degree (PG)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className={labelClass}>Residential Address</Label>
                  <div className="relative">
                    <FileText className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input 
                      value={address} 
                      onChange={(e) => setAddress(e.target.value)} 
                      className={`${fieldClass} pl-11`}
                      placeholder="Enter full address with postal code"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Mobile OTP */}
            {step === 1 && (
              <div className="space-y-6 step-slide">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-50 border border-red-100 shadow-sm animate-pulse text-[#D50032]">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-[#0B2A5B]">Mobile Verification</h2>
                    <p className="text-xs text-slate-400 font-semibold font-sans font-sans">Enter verification code sent to your registered mobile</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-sans">Mobile Number</Label>
                  <Input value={mobile} readOnly className="bg-slate-100/70 border-slate-200 rounded-xl py-5 font-bold text-slate-500 cursor-not-allowed" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-sans">Enter Verification OTP</Label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Input
                      value={mobileOtp}
                      onChange={(e) => setMobileOtp(e.target.value)}
                      placeholder="Enter OTP"
                      maxLength={6}
                      className="text-center text-lg tracking-widest font-black bg-slate-50/50 border-slate-200 focus:border-[#D50032] focus:bg-white rounded-xl py-5 max-w-xs transition-all shadow-sm text-slate-800 placeholder-slate-300"
                    />
                    <Button 
                      variant="outline" 
                      type="button" 
                      className="rounded-xl border-slate-200 hover:border-[#D50032] text-slate-700 hover:text-[#D50032] hover:bg-red-50 font-bold px-6 py-5 h-auto transition-all duration-300 shadow-sm bg-white" 
                      onClick={handleResendMobileOtp}
                    >
                      Resend SMS OTP
                    </Button>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 font-medium font-sans font-sans font-sans">Please enter the 6-digit OTP code sent via SMS. If you did not receive it, click resend.</p>
              </div>
            )}

            {/* Step 2: Email OTP */}
            {step === 2 && (
              <div className="space-y-6 step-slide">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-50 border border-red-100 shadow-sm animate-pulse text-[#D50032]">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-[#0B2A5B]">Email Verification</h2>
                    <p className="text-xs text-slate-400 font-semibold font-sans font-sans font-sans font-sans">Verification code sent to {email}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-sans">Email Address</Label>
                  <Input value={email} className="bg-slate-100/70 border-slate-200 rounded-xl py-5 font-bold text-slate-500 cursor-not-allowed" readOnly />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-sans">Enter OTP</Label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Input
                      value={emailOtp}
                      onChange={(e) => setEmailOtp(e.target.value)}
                      placeholder="Enter OTP"
                      maxLength={6}
                      className="text-center text-lg tracking-widest font-black bg-slate-50/50 border-slate-200 focus:border-[#D50032] focus:bg-white rounded-xl py-5 max-w-xs transition-all shadow-sm text-slate-800 placeholder-slate-300"
                    />
                    <Button 
                      variant="outline" 
                      type="button" 
                      className="rounded-xl border-slate-200 hover:border-[#D50032] text-slate-700 hover:text-[#D50032] hover:bg-red-50 font-bold px-6 py-5 h-auto transition-all duration-300 shadow-sm bg-white" 
                      onClick={handleSendEmailOtp}
                    >
                      Resend Email OTP
                    </Button>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 font-medium font-sans">Please enter the 6-digit OTP code sent to your registered email address.</p>
              </div>
            )}

            {/* Step 3: KYC Documents */}
            {step === 3 && (
              <div className="space-y-6 step-slide">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-50 border border-red-100 shadow-sm text-[#D50032]">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-[#0B2A5B]">KYC Documents</h2>
                    <p className="text-xs text-slate-400 font-semibold font-sans font-sans">Provide identity numbers and upload official document files</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-sans">Aadhaar Number *</Label>
                    <Input 
                      value={aadhaar} 
                      onChange={(e) => setAadhaar(e.target.value)} 
                      className="bg-slate-50/50 border-slate-200 focus:border-[#D50032] focus:bg-white rounded-xl py-5 transition-all text-sm font-semibold text-slate-800 font-sans shadow-sm placeholder-slate-400"
                      placeholder="12-digit Aadhaar number" 
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-sans">PAN Number *</Label>
                    <Input 
                      value={pan} 
                      onChange={(e) => setPan(e.target.value)} 
                      className="bg-slate-50/50 border-slate-200 focus:border-[#D50032] focus:bg-white rounded-xl py-5 transition-all text-sm font-semibold text-slate-800 font-sans shadow-sm placeholder-slate-400"
                      placeholder="10-digit PAN string" 
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  {([
                    {
                      label: "Aadhaar Card (Front & Back)",
                      file: aadhaarFile,
                      accept: "image/*,application/pdf",
                      onFile: (f: File) => { setAadhaarFile(f); setAadhaarUploaded(true); },
                      icon: <Fingerprint className="h-5 w-5" />,
                    },
                    {
                      label: "PAN Card",
                      file: panFile,
                      accept: "image/*,application/pdf",
                      onFile: (f: File) => { setPanFile(f); setPanUploaded(true); },
                      icon: <FileText className="h-5 w-5" />,
                    },
                    {
                      label: "Passport Size Photo",
                      file: photoFile,
                      accept: "image/*",
                      onFile: (f: File) => { setPhotoFile(f); setPhotoUploaded(true); },
                      icon: <Camera className="h-5 w-5" />,
                    },
                  ] as const).map((doc, i) => (
                    <div key={i}
                      className={`border border-dashed rounded-2xl p-4 transition-all duration-300 transform hover:scale-[1.005] ${
                        doc.file 
                          ? "border-emerald-300 bg-emerald-50/20 shadow-sm text-emerald-700" 
                          : "border-slate-200 bg-slate-50/30 hover:bg-slate-50/80 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm transition-all duration-300 ${
                            doc.file ? "bg-emerald-50 border-emerald-100 text-emerald-600 scale-105" : "bg-white border-slate-100 text-[#D50032]"
                          }`}>
                            {doc.file ? <CheckCircle className="h-5 w-5" /> : doc.icon}
                          </div>
                          <div>
                            <div className="font-bold text-sm text-[#0B2A5B] font-sans">{doc.label}</div>
                            <div className="text-[11px] text-slate-400 font-semibold mt-0.5 font-sans">
                              {doc.file ? (
                                <span className="text-emerald-600 font-bold">{doc.file.name}</span>
                              ) : "JPG, PNG or PDF (max 5MB)"}
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
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all duration-300 shadow-sm ${
                              doc.file 
                                ? "border-emerald-200 text-emerald-600 bg-white hover:bg-emerald-50" 
                                : "border-[#D50032] text-[#D50032] bg-white hover:bg-[#D50032] hover:text-white"
                            }`}
                          >
                            <Upload className="h-3.5 w-3.5" />
                            {doc.file ? "Change" : "Browse File"}
                          </span>
                        </label>
                      </div>
                      {/* Image preview */}
                      {doc.file && doc.file.type.startsWith("image/") && (
                        <div className="mt-3 relative rounded-xl overflow-hidden border border-emerald-100 bg-slate-900/5 transition-all">
                          <img
                            src={URL.createObjectURL(doc.file)}
                            alt="preview"
                            className="h-28 w-full object-contain p-2 rounded-xl"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Signature & Biometric */}
            {step === 4 && (
              <div className="space-y-6 step-slide">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-50 border border-red-100 shadow-sm text-[#D50032]">
                    <Fingerprint className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-[#0B2A5B]">Signature &amp; Biometric</h2>
                    <p className="text-xs text-slate-400 font-semibold font-sans">Draw your digital signature and capture a live audit selfie</p>
                  </div>
                </div>

                {/* ── Signature Canvas ─────────────────────── */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-sans">Digital Signature <span className="text-[10px] text-slate-400 normal-case font-medium ml-1">(Draw with pointer/finger)</span></Label>
                    {hasDrawn && (
                      <button onClick={clearSignature} className="flex items-center gap-1 text-[11px] font-bold text-[#D50032] hover:underline transition-all font-sans">
                        <RefreshCw className="h-3 w-3" /> Reset Pad
                      </button>
                    )}
                  </div>
                  <div
                    className={`border rounded-2xl overflow-hidden shadow-sm transition-all duration-300 ${
                      signed ? "border-emerald-200 bg-emerald-50/10" : "border-slate-200 bg-white"
                    }`}
                  >
                    <canvas
                      ref={canvasRef}
                      width={500}
                      height={140}
                      className="w-full touch-none cursor-crosshair bg-slate-50/50"
                      onMouseDown={startDraw}
                      onMouseMove={draw}
                      onMouseUp={endDraw}
                      onMouseLeave={endDraw}
                    />
                    <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-100 bg-slate-50/80 font-sans font-sans">
                      {signed ? (
                        <span className="text-xs text-emerald-600 font-bold flex items-center gap-1.5 animate-fadeIn">
                          <CheckCircle className="h-4 w-4" /> Signature captured &amp; encrypted
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 font-semibold">Draw your legal signature inside the canvas above</span>
                      )}
                      <Button
                        size="sm"
                        onClick={saveSignature}
                        disabled={signed || !hasDrawn}
                        className={`font-bold rounded-lg text-xs shadow-sm px-4 transition-all ${
                          signed 
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white" 
                            : "bg-[#D50032] hover:bg-red-700 text-white"
                        }`}
                      >
                        {signed ? "Saved ✓" : "Save Signature"}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* ── Webcam Selfie ────────────────────────── */}
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-sans">Live Selfie Audit Trail</Label>
                  <div
                    className={`border border-dashed rounded-2xl overflow-hidden transition-all bg-slate-50/30 ${
                      biometricDone ? "border-emerald-300 bg-emerald-50/20" : "border-slate-200"
                    }`}
                  >
                    {biometricDone && selfiePreview ? (
                      <div className="p-6 flex flex-col items-center gap-3 font-sans">
                        <div className="relative">
                          <img src={selfiePreview} alt="selfie" className="w-28 h-28 rounded-full object-cover border-4 border-emerald-400 shadow-md shadow-emerald-100" />
                          <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-1 border-2 border-white">
                            <CheckCircle className="h-4 w-4 text-white" />
                          </div>
                        </div>
                        <p className="text-xs text-emerald-600 font-bold">Biometric verification audit selfie captured</p>
                        <button
                          onClick={() => { setBiometricDone(false); setSelfiePreview(null); setBiometricFile(null); }}
                          className="text-xs text-slate-400 hover:text-red-500 font-semibold flex items-center gap-1 mt-1 transition-colors"
                        >
                          <RefreshCw className="h-3 w-3" /> Retake Photo
                        </button>
                      </div>
                    ) : cameraOpen ? (
                      <div className="p-4 flex flex-col items-center gap-3 font-sans">
                        <div className="relative rounded-2xl overflow-hidden w-full max-w-xs border border-slate-200 shadow-lg bg-black">
                          <video ref={videoRef} autoPlay playsInline muted className="w-full rounded-2xl" style={{ transform: "scaleX(-1)" }} />
                          
                          {/* Glowing Neon Biometric Scan Line */}
                          <div className="absolute left-0 right-0 h-1 bg-[#D50032] opacity-90 animate-scan shadow-[0_0_10px_#D50032] pointer-events-none" />
                          
                          <div className="absolute inset-0 border-4 border-[#D50032]/30 rounded-2xl pointer-events-none" style={{ boxShadow: "inset 0 0 25px rgba(213,0,50,0.25)" }} />
                        </div>
                        <div className="flex gap-3 mt-1">
                          <Button onClick={capturePhoto} className="bg-[#D50032] hover:bg-red-700 text-white rounded-xl font-bold px-6 shadow-sm">
                            <Camera className="mr-1.5 h-4 w-4" /> Capture Photo
                          </Button>
                          <Button variant="outline" onClick={stopCamera} className="border-slate-200 rounded-xl font-bold text-slate-600 bg-white">
                            <X className="mr-1.5 h-4 w-4" /> Close Camera
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-6 flex flex-col items-center gap-4 font-sans">
                        <div className="w-16 h-16 rounded-full border-2 border-dashed border-[#D50032]/40 flex items-center justify-center bg-red-50/20">
                          <Camera className="h-6 w-6 text-[#D50032]" />
                        </div>
                        <p className="text-slate-500 text-xs font-semibold text-center max-w-sm font-sans">
                          Capture a live, front-facing photo using your camera or upload a photo file.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 items-center justify-center w-full mt-2">
                          <Button 
                            onClick={openCamera} 
                            className="w-full sm:w-auto bg-[#D50032] hover:bg-red-700 text-white rounded-xl font-bold px-6 shadow-md shadow-red-100"
                          >
                            <Camera className="mr-1.5 h-4 w-4" /> Open Camera Feed
                          </Button>
                          <span className="text-xs text-slate-400 font-semibold uppercase sm:px-2">OR</span>
                          <label className="w-full sm:w-auto flex items-center justify-center gap-1.5 cursor-pointer bg-white border border-slate-200 hover:border-slate-300 text-slate-700 rounded-xl font-bold px-6 py-2.5 shadow-sm text-sm transition-all">
                            <Upload className="h-4 w-4 text-slate-500" />
                            <span>Upload Photo</span>
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={handlePhotoUpload} 
                              className="hidden" 
                            />
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Verification */}
            {step === 5 && (
              <div className="text-center py-6 step-slide">
                <div className="flex items-center gap-3 mb-6 justify-center">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-50 border border-red-100 shadow-sm text-[#D50032]">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div className="text-left font-sans font-sans">
                    <h2 className="text-lg font-bold text-[#0B2A5B]">KYC Verification</h2>
                    <p className="text-xs text-slate-400 font-semibold font-sans">Processing your verification documents package</p>
                  </div>
                </div>
                {verifying ? (
                  <div className="flex flex-col items-center gap-4 py-8 font-sans">
                    {/* Radar Sonar Glow Rings */}
                    <div className="relative w-24 h-24 flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full bg-[#D50032]/10 border border-[#D50032]/25 animate-radar-1" />
                      <div className="absolute inset-0 rounded-full bg-[#D50032]/10 border border-[#D50032]/25 animate-radar-2" />
                      <div className="absolute inset-0 rounded-full bg-[#D50032]/10 border border-[#D50032]/25 animate-radar-3" />
                      
                      <div className="w-14 h-14 rounded-full bg-red-50 border border-red-100 flex items-center justify-center z-10 shadow-md">
                        <Shield className="h-6 w-6 text-[#D50032] animate-pulse" />
                      </div>
                    </div>
                    <p className="font-extrabold text-[#0B2A5B] text-sm mt-4 tracking-tight">Checking credentials package...</p>
                    <p className="text-xs text-slate-400 font-semibold max-w-xs leading-relaxed font-sans">Verifying document integrity and signatures against FinTrade registry</p>
                  </div>
                ) : verified ? (
                  <div className="flex flex-col items-center gap-4 py-8 font-sans">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center bg-emerald-50 border-2 border-emerald-400 shadow-lg shadow-emerald-100/50 animate-bounce">
                      <CheckCircle className="h-10 w-10 text-emerald-600" />
                    </div>
                    <h3 className="text-xl font-bold text-emerald-600">eKYC Verified Successfully!</h3>
                    <p className="text-slate-500 text-xs font-semibold max-w-sm">All verification parameters match. Your portal account profile is set as active.</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-5 py-6 bg-slate-50/50 border border-slate-100 rounded-2xl p-4 font-sans font-sans">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center bg-[#0B2A5B]/5">
                      <Shield className="h-6 w-6 text-[#0B2A5B]" />
                    </div>
                    <div className="space-y-1 font-sans">
                      <p className="font-bold text-[#0B2A5B] text-sm">Package Waiting for Approval</p>
                      <p className="text-xs text-slate-400 font-semibold font-sans">Status: {kycStatus === "pending" ? "Pending Admin Verification" : kycStatus.toUpperCase()}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 w-full max-w-xs text-left text-xs bg-white border border-slate-100 rounded-xl p-4 shadow-sm font-sans">
                      {[
                        { label: "Aadhaar Card", ok: aadhaarUploaded },
                        { label: "PAN Card", ok: panUploaded },
                        { label: "Signature", ok: signed },
                        { label: "Live Selfie", ok: biometricDone },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-2">
                          {item.ok ? <CheckCircle className="h-4 w-4 text-emerald-600 animate-fadeIn" /> : <div className="w-3.5 h-3.5 rounded-full bg-slate-100 border border-slate-200" />}
                          <span className={`font-bold ${item.ok ? "text-slate-700" : "text-slate-400"}`}>{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 6: Contract */}
            {step === 6 && (
              <div className="space-y-6 step-slide">
                <div className="flex items-center justify-between font-sans">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-50 border border-red-100 shadow-sm animate-pulse text-[#D50032]">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-[#0B2A5B]">Your Contract</h2>
                      <p className="text-xs text-slate-400 font-semibold">Review, accept terms &amp; download agreement dossier</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold text-white bg-emerald-600 shadow-sm">
                    <CheckCircle className="h-3 w-3" /> VERIFIED
                  </div>
                </div>

                {/* Contract Preview - Styled like premium dossier paper sheet */}
                <div
                  className="rounded-2xl border border-slate-200 overflow-y-auto p-6 space-y-4 shadow-inner transition-all duration-300 animate-fadeIn text-slate-800"
                  style={{ maxHeight: 320, background: "#FCFAF2", fontFamily: "Georgia, serif" }}
                >
                  <div className="text-center border-b border-amber-900/10 pb-4">
                    <p className="text-[10px] text-amber-900/60 uppercase tracking-widest font-sans font-bold">FinTrade Education Pvt. Ltd.</p>
                    <h3 className="text-base font-bold text-slate-900 mt-1">TRADING EDUCATION AGREEMENT</h3>
                    <p className="text-[10px] text-slate-400 mt-1 font-sans">Issued: {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-sans">
                    {[
                      ["Student Name", fullName],
                      ["Mobile", mobile],
                      ["Email", email],
                      ["Aadhaar", aadhaar],
                      ["PAN", pan],
                      ["Date of Birth", dob],
                      ["Qualification", qualification],
                    ].map(([k, v], i) => (
                      <div key={i} className="bg-white/80 rounded-lg p-2.5 border border-amber-900/5 shadow-sm font-sans font-sans">
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{k}</div>
                        <div className="font-bold text-slate-800 mt-0.5">{v}</div>
                      </div>
                    ))}
                  </div>
                  <div className="text-xs text-slate-700 space-y-2.5 pt-2 font-sans leading-relaxed">
                    <p className="font-bold text-slate-900">Terms &amp; Conditions</p>
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
                  <div className="pt-4 border-t border-amber-900/10 flex items-center justify-between font-sans">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Digitally signed by</p>
                      <p className="font-bold text-base text-slate-800" style={{ fontFamily: "cursive" }}>{fullName}</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold bg-white px-3 py-1.5 rounded-lg border border-emerald-100 shadow-sm">
                      <Lock className="h-3.5 w-3.5" /> Sealed Dossier
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 transition-all hover:bg-slate-100/50">
                  <input
                    type="checkbox"
                    id="agree"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="w-4 h-4 accent-[#D50032] rounded cursor-pointer"
                  />
                  <label htmlFor="agree" className="text-xs text-slate-600 font-bold cursor-pointer select-none font-sans">
                    I have read and agree to all the terms and conditions outlined in this trading agreement
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons & Navigation Row */}
          <div className="mt-8 relative z-10 font-sans">
            {step === 6 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <Button
                  onClick={handleDownload}
                  disabled={!agreed}
                  variant="outline"
                  className="w-full border-[#D50032] text-[#D50032] hover:bg-red-50/50 rounded-2xl font-bold py-6 shadow-sm transition-all duration-300"
                  size="lg"
                >
                  <Download className="mr-2 h-5 w-5" />
                  Download Contract
                </Button>
                <Button
                  onClick={() => setShowCheckout(true)}
                  disabled={!agreed || !course}
                  className={`w-full font-bold rounded-2xl py-6 shadow-md transition-all duration-300 ${
                    (agreed && course) 
                      ? "bg-gradient-to-r from-[#D50032] to-[#FF4D70] text-white hover:brightness-105" 
                      : "bg-slate-100 text-slate-400 cursor-not-allowed"
                  }`}
                  size="lg"
                >
                  Process to Pay
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            )}

            {step === 6 && !course && agreed && (
              <p className="text-center text-xs font-semibold text-[#D50032] mb-4">
                No course was selected for payment context. Check and select a course to activate payment.
              </p>
            )}

            <div className="flex justify-between gap-3 pt-5 border-t border-white/70">
              <Button
                variant="outline"
                onClick={back}
                disabled={step === 0}
                className="border-white/80 hover:border-[#D50032] hover:text-[#D50032] rounded-2xl px-5 sm:px-6 py-5 font-black text-slate-600 bg-white/75 shadow-[0_14px_30px_-24px_rgba(11,42,91,0.85)] transition-all duration-300"
              >
                <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
              </Button>
              {step < 6 ? (
                <Button
                  onClick={handleContinue}
                  className="relative overflow-hidden bg-gradient-to-r from-[#D50032] via-[#f0184a] to-[#0B2A5B] hover:brightness-110 text-white rounded-2xl px-5 sm:px-7 py-5 font-black shadow-[0_18px_38px_-18px_rgba(213,0,50,0.75)] transition-all duration-300 animate-fadeIn"
                  disabled={verifying}
                >
                  {step === 5 ? (verified ? "View Contract" : "Refresh Status") : "Continue"}
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              ) : (
                <Link to="/">
                  <Button className="bg-[#0B2A5B] hover:bg-[#1a3d7a] text-white rounded-2xl px-6 py-5 font-black shadow-[0_18px_38px_-20px_rgba(11,42,91,0.75)]">
                    Back to Home
                  </Button>
                </Link>
              )}
            </div>
          </div>

        </Card>

        {/* Checkout Modal overlay */}
        {showCheckout && course && (
          <CourseCheckoutModal
            course={course}
            onClose={() => setShowCheckout(false)}
            onSuccess={() => {
              setShowCheckout(false);
              navigate("/student/dashboard");
            }}
          />
        )}
      </div>
    </div>
  );
}

