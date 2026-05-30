import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { toast } from "sonner";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  CheckCircle, ArrowRight, ArrowLeft, User, Phone, Mail,
  Camera, Fingerprint, FileText, Download, Shield, Lock, GraduationCap
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
      .catch((err) => console.error("Error loading user profile details", err));

    // 2. Fetch current KYC status and restore saved details if any
    api.get("/kyc/status")
      .then((res) => {
        if (res.data && res.data.status !== "not_started") {
          if (res.data.full_name) setFullName(res.data.full_name);
          if (res.data.dob) setDob(res.data.dob);
          if (res.data.qualification) setQualification(res.data.qualification);
          if (res.data.address) setAddress(res.data.address);
          if (res.data.mobile) setMobile(res.data.mobile);
          if (res.data.aadhaar_number) setAadhaar(res.data.aadhaar_number);
          if (res.data.pan_number) setPan(res.data.pan_number);
          if (res.data.mobile_verified) setMobileOtp("123456");
          if (res.data.email_verified) setEmailOtp("654321");
          if (res.data.aadhaar_doc_url) setAadhaarUploaded(true);
          if (res.data.pan_doc_url) setPanUploaded(true);
          if (res.data.photo_url) setPhotoUploaded(true);
          if (res.data.signature_url) setSigned(true);
          if (res.data.biometric_selfie_url) setBiometricDone(true);
          if (res.data.status === "verified" || res.data.status === "approved") setVerified(true);
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

  const next = () => {
    if (step === 5 && !verified) {
      setVerifying(true);
      setTimeout(() => { 
        setVerifying(false); 
        setVerified(true); 
        setStep(6); 
      }, 2500);
      return;
    }
    setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  };
  
  const back = () => setStep((s) => Math.max(s - 1, 0));

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
      } catch (err: any) {
        toast.error("Failed to save KYC details to database.");
        return;
      }
      next();
      return;
    }
    
    if (step === 1) {
      if (mobileOtp !== "123456") {
        toast.error("Invalid mobile OTP");
        return;
      }
      try {
        await api.post("/kyc/verify-mobile-otp", { otp: mobileOtp });
      } catch (e) {}
      next();
      return;
    }

    if (step === 2) {
      if (emailOtp !== "654321") {
        toast.error("Invalid email OTP");
        return;
      }
      try {
        await api.post("/kyc/verify-email-otp", { otp: emailOtp });
      } catch (e) {}
      next();
      return;
    }

    if (step === 3) {
      if (!aadhaarUploaded || !panUploaded || !photoUploaded) {
        toast.error("Please upload all documents to proceed.");
        return;
      }
      // Submit mock document upload to update backend fields
      try {
        const dummyFile = new File(["dummy"], "dummy.jpg", { type: "image/jpeg" });
        const fd1 = new FormData(); fd1.append("file", dummyFile);
        await api.post("/kyc/upload-document?doc_type=aadhaar", fd1);
        const fd2 = new FormData(); fd2.append("file", dummyFile);
        await api.post("/kyc/upload-document?doc_type=pan", fd2);
        const fd3 = new FormData(); fd3.append("file", dummyFile);
        await api.post("/kyc/upload-document?doc_type=photo", fd3);
      } catch (e) {}
      next();
      return;
    }

    if (step === 4) {
      if (!signed || !biometricDone) {
        toast.error("Please capture signature and selfie to proceed.");
        return;
      }
      try {
        const dummyFile = new File(["dummy"], "dummy.jpg", { type: "image/jpeg" });
        const fd1 = new FormData(); fd1.append("file", dummyFile);
        await api.post("/kyc/upload-signature", fd1);
        const fd2 = new FormData(); fd2.append("file", dummyFile);
        await api.post("/kyc/upload-biometric", fd2);
      } catch (e) {}
      next();
      return;
    }

    if (step === 5) {
      if (!verified) {
        setVerifying(true);
        setTimeout(async () => {
          setVerifying(false);
          setVerified(true);
          setStep(6);
        }, 2500);
      } else {
        setStep(6);
      }
      return;
    }

    next();
  };

  const handleGenerateContractOnBackend = async () => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const courseId = searchParams.get("course_id");
      await api.post("/kyc/generate-contract", {
        course_id: courseId ? Number(courseId) : null,
        terms_accepted: true
      });
    } catch (e) {
      console.error("Failed to generate contract on backend database", e);
    }
  };

  const handleDownload = async () => {
    // Generate contract on database side
    await handleGenerateContractOnBackend();

    const content = `
FINTRADE TRADING EDUCATION AGREEMENT
======================================
Student Name   : ${fullName}
Mobile         : ${mobile}
Email          : ${dummyData.email}
Aadhaar        : ${aadhaar}
PAN            : ${pan}
Date of Birth  : ${dob}
Address        : ${address}

KYC Status     : ✓ VERIFIED
Contract Date  : ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}

TERMS & CONDITIONS
------------------
This agreement is entered into between FinTrade Education Pvt. Ltd. ("Company") 
and the above-named student ("Student").

1. The Student agrees to abide by all FinTrade platform rules and community guidelines.
2. Course fees are non-refundable after 7 days of enrollment.
3. All course material is proprietary and may not be shared or redistributed.
4. Trading simulation is for educational purposes only; no real capital is at risk.
5. FinTrade holds the right to revoke access for breach of terms.
6. Placement assistance is merit-based and not guaranteed.
7. This contract is governed by the laws of India.

Signed digitally by: ${fullName}
Date: ${new Date().toLocaleDateString("en-IN")}

© 2026 FinTrade Education Pvt. Ltd. | Mumbai, India
    `.trim();
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `FinTrade_Contract_${fullName.replace(" ", "_")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
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
                  <Input value={dob} onChange={(e) => setDob(e.target.value)} className="mt-2 bg-gray-50" />
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
                  <p className="text-sm text-gray-500">OTP sent to {mobile}</p>
                </div>
              </div>
              <div>
                <Label>Mobile Number</Label>
                <Input value={mobile} onChange={(e) => setMobile(e.target.value)} className="mt-2 bg-gray-50" />
              </div>
              <div>
                <Label>Enter OTP</Label>
                <div className="flex gap-3 mt-2">
                  <Input
                    value={mobileOtp}
                    onChange={(e) => setMobileOtp(e.target.value)}
                    placeholder="6-digit OTP"
                    maxLength={6}
                    className="text-center text-xl tracking-widest font-bold"
                    style={{ letterSpacing: "0.5em" }}
                  />
                  <Button variant="outline" className="whitespace-nowrap border-[#D50032] text-[#D50032]" onClick={() => setMobileOtp("123456")}>
                    Auto-fill Demo
                  </Button>
                </div>
                {mobileOtp === "123456" && (
                  <div className="flex items-center gap-2 mt-3 text-green-600 text-sm">
                    <CheckCircle className="h-4 w-4" /> OTP verified successfully!
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-400">Demo OTP: <span className="font-bold text-gray-600">123456</span>. Resend OTP in 30s.</p>
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
                  <Button variant="outline" className="whitespace-nowrap border-[#D50032] text-[#D50032]" onClick={() => setEmailOtp("654321")}>
                    Auto-fill Demo
                  </Button>
                </div>
                {emailOtp === "654321" && (
                  <div className="flex items-center gap-2 mt-3 text-green-600 text-sm">
                    <CheckCircle className="h-4 w-4" /> Email verified successfully!
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-400">Demo OTP: <span className="font-bold text-gray-600">654321</span>.</p>
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
                  <Label>Aadhaar Number</Label>
                  <Input value={aadhaar} onChange={(e) => setAadhaar(e.target.value)} className="mt-2 bg-gray-50" />
                </div>
                <div>
                  <Label>PAN Number</Label>
                  <Input value={pan} onChange={(e) => setPan(e.target.value)} className="mt-2 bg-gray-50" />
                </div>
              </div>
              {[
                { label: "Aadhaar Card (Front & Back)", state: aadhaarUploaded, setState: setAadhaarUploaded },
                { label: "PAN Card", state: panUploaded, setState: setPanUploaded },
                { label: "Passport Photo", state: photoUploaded, setState: setPhotoUploaded },
              ].map((doc, i) => (
                <div key={i}
                  className="border-2 border-dashed rounded-xl p-4 flex items-center justify-between cursor-pointer transition-all hover:border-[#D50032]"
                  style={{ borderColor: doc.state ? "#4CAF50" : "#d1d5db", background: doc.state ? "rgba(76,175,80,0.05)" : "#fafafa" }}
                  onClick={() => doc.setState(true)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: doc.state ? "rgba(76,175,80,0.1)" : "rgba(213,0,50,0.08)" }}>
                      {doc.state ? <CheckCircle className="h-5 w-5 text-green-600" /> : <FileText className="h-5 w-5" style={{ color: "#D50032" }} />}
                    </div>
                    <div>
                      <div className="font-medium text-sm" style={{ color: "#121212" }}>{doc.label}</div>
                      <div className="text-xs text-gray-500">{doc.state ? "File selected ✓" : "Click to upload (demo)"}</div>
                    </div>
                  </div>
                  {!doc.state && (
                    <Button size="sm" variant="outline" className="border-[#D50032] text-[#D50032]">Upload</Button>
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
                  <p className="text-sm text-gray-500">Sign and verify your identity</p>
                </div>
              </div>
              {/* Signature */}
              <div>
                <Label className="mb-2 block">Digital Signature</Label>
                <div
                  className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all hover:border-[#D50032]"
                  style={{ borderColor: signed ? "#4CAF50" : "#d1d5db", background: signed ? "rgba(76,175,80,0.05)" : "#fafafa" }}
                  onClick={() => setSigned(true)}
                >
                  {signed ? (
                    <div className="flex flex-col items-center gap-2">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                      <p className="font-bold text-green-700" style={{ fontFamily: "cursive", fontSize: 22 }}>{fullName}</p>
                      <p className="text-xs text-green-600">Signature captured</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-400 text-sm mb-2">Click to sign digitally (demo)</p>
                      <Button size="sm" style={{ background: "#D50032", color: "white" }}>Draw Signature</Button>
                    </div>
                  )}
                </div>
              </div>
              {/* Biometric */}
              <div>
                <Label className="mb-2 block">Biometric Selfie Verification</Label>
                <div
                  className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all hover:border-[#D50032]"
                  style={{ borderColor: biometricDone ? "#4CAF50" : "#d1d5db", background: biometricDone ? "rgba(76,175,80,0.05)" : "#fafafa" }}
                  onClick={() => setBiometricDone(true)}
                >
                  {biometricDone ? (
                    <div className="flex flex-col items-center gap-2">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                      <p className="text-sm text-green-600 font-medium">Face verified successfully</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-20 h-20 rounded-full border-4 border-dashed flex items-center justify-center" style={{ borderColor: "#D50032" }}>
                        <Camera className="h-8 w-8" style={{ color: "#D50032" }} />
                      </div>
                      <p className="text-gray-400 text-sm">Click to capture selfie (demo)</p>
                      <Button size="sm" style={{ background: "#D50032", color: "white" }}>Open Camera</Button>
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
                  <p className="text-gray-600">All documents submitted. Click below to process verification.</p>
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
                {step === 5 ? (verified ? "View Contract" : "Verify KYC") : "Continue"}
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
