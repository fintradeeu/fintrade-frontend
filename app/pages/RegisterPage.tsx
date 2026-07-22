import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useGoogleLogin } from "@react-oauth/google";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Eye,
  EyeOff,
  ArrowLeft,
  ShieldCheck,
  Mail,
  Smartphone,
  User,
  MapPin,
  Lock,
  Building,
  CreditCard,
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  TrendingUp,
  Award,
  BookOpen
} from "lucide-react";
import logo from "../../imports/fintrade_logo.png";
import api from "../services/api";
import { isGoogleAuthConfigured } from "../config/googleAuth";

type GoogleRegisterButtonProps = {
  loading: boolean;
  onLoadingChange: (loading: boolean) => void;
  onError: (message: string) => void;
};

function GoogleRegisterButton({ loading, onLoadingChange, onError }: GoogleRegisterButtonProps) {
  const navigate = useNavigate();
  const googleRegister = useGoogleLogin({
    flow: "implicit",
    scope: [
      "openid",
      "email",
      "profile",
      "https://www.googleapis.com/auth/user.phonenumbers.read",
      "https://www.googleapis.com/auth/user.addresses.read",
    ].join(" "),
    onSuccess: async (tokenResponse) => {
      onError("");
      onLoadingChange(true);

      try {
        const response = await api.post("/auth/google", {
          access_token: tokenResponse.access_token,
        });
        const { access_token, user } = response.data;
        localStorage.setItem("token", access_token);
        localStorage.setItem("user", JSON.stringify(user));
        navigate("/");
      } catch (err: any) {
        onError(err.response?.data?.detail || "Google sign-in failed. Please try again.");
      } finally {
        onLoadingChange(false);
      }
    },
    onError: () => onError("Google sign-in failed. Please try again."),
  });

  return (
    <Button
      type="button"
      className="w-full h-12 font-bold text-white bg-white/10 hover:bg-white/15 border border-white/20 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
      disabled={loading}
      onClick={() => googleRegister()}
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
        />
        <path
          fill="#34A853"
          d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.25 21.32 7.33 24 12 24z"
        />
        <path
          fill="#FBBC05"
          d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
        />
        <path
          fill="#EA4335"
          d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.94 1.19 15.23 0 12 0 7.33 0 3.25 2.68 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
        />
      </svg>
      {loading ? "Signing up..." : "Sign up with Google"}
    </Button>
  );
}

function AffiliateIBRegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    city: "",
    password: "",
    confirm_password: "",
    region: "",
    bank_account_holder_name: "",
    bank_name: "",
    bank_account_number: "",
    bank_ifsc_code: "",
    bank_upi_id: "",
  });
  const [files, setFiles] = useState<{
    profile_photo?: File;
    aadhaar_card?: File;
    pan_card?: File;
  }>({});
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const updateForm = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (form.password !== form.confirm_password) {
      setErrorMsg("Password and confirm password do not match.");
      return;
    }

    setLoading(true);
    try {
      const payload = new FormData();
      Object.entries(form).forEach(([key, value]) => payload.append(key, value));
      if (files.profile_photo) payload.append("profile_photo", files.profile_photo);
      if (files.aadhaar_card) payload.append("aadhaar_card", files.aadhaar_card);
      if (files.pan_card) payload.append("pan_card", files.pan_card);

      const res = await api.post("/distributor/self-register", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSuccessMsg(
        `IB account created successfully. Referral code: ${res.data.referral_code}. Your verification status is ${res.data.verification_status}.`
      );
      setForm({
        full_name: "",
        email: "",
        phone: "",
        city: "",
        password: "",
        confirm_password: "",
        region: "",
        bank_account_holder_name: "",
        bank_name: "",
        bank_account_number: "",
        bank_ifsc_code: "",
        bank_upi_id: "",
      });
      setFiles({});
    } catch (err: any) {
      let message = "IB registration failed. Please check your details and try again.";
      if (err.response?.data?.detail) {
        message = Array.isArray(err.response.data.detail)
          ? err.response.data.detail.map((item: any) => item.msg).join(", ")
          : err.response.data.detail;
      }
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-[#0a0a0f] text-white">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#D50032]/25 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-[#C2A86A]/15 rounded-full blur-[150px]"></div>
      </div>

      <div className="w-full max-w-4xl relative z-10 space-y-6">
        <Link to="/login" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-all bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full border border-white/10">
          <ArrowLeft size={16} className="text-[#D50032]" />
          <span>Back to Login</span>
        </Link>

        <div className="relative rounded-3xl bg-[#12121c]/90 backdrop-blur-2xl border border-white/10 shadow-2xl p-6 sm:p-10 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#D50032] via-[#FF4D70] to-[#C2A86A]"></div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-white/10">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#D50032]/20 text-[#FF4D70] border border-[#D50032]/30 mb-2">
                IB Partner Portal
              </span>
              <h2 className="text-3xl font-extrabold text-white">Introducing Broker Registration</h2>
              <p className="text-sm text-gray-400 mt-1">Create your IB partner account and submit credentials for review.</p>
            </div>
            <div className="h-10 w-32 overflow-hidden shrink-0">
              <img src={logo} alt="FinTrade" className="h-full w-full object-contain scale-[2.2]" />
            </div>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-[#D50032]/10 border border-[#D50032]/30 text-[#FF4D70] text-sm flex items-start gap-2.5">
              <AlertCircle size={18} className="shrink-0 text-[#FF4D70] mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-sm flex items-start gap-2.5">
              <CheckCircle2 size={18} className="shrink-0 text-green-400 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 1. Personal Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#C2A86A] flex items-center gap-2">
                <User size={16} /> 1. Personal & Contact Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold text-gray-300">Full Name</Label>
                  <Input value={form.full_name} onChange={(e) => updateForm("full_name", e.target.value)} className="mt-1 bg-white/[0.04] border-white/15 text-white h-11 rounded-xl" required />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-gray-300">Email Address</Label>
                  <Input type="email" value={form.email} onChange={(e) => updateForm("email", e.target.value)} className="mt-1 bg-white/[0.04] border-white/15 text-white h-11 rounded-xl" required />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-gray-300">Mobile Number</Label>
                  <Input type="tel" value={form.phone} onChange={(e) => updateForm("phone", e.target.value)} className="mt-1 bg-white/[0.04] border-white/15 text-white h-11 rounded-xl" required />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-gray-300">City</Label>
                  <Input value={form.city} onChange={(e) => updateForm("city", e.target.value)} className="mt-1 bg-white/[0.04] border-white/15 text-white h-11 rounded-xl" required />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-gray-300">Region</Label>
                  <Input value={form.region} onChange={(e) => updateForm("region", e.target.value)} placeholder="e.g. Gujarat / Mumbai" className="mt-1 bg-white/[0.04] border-white/15 text-white h-11 rounded-xl" required />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-gray-300">Profile Photo</Label>
                  <Input type="file" accept=".jpg,.jpeg,.png,.webp" onChange={(e) => setFiles((prev) => ({ ...prev, profile_photo: e.target.files?.[0] }))} className="mt-1 bg-white/[0.04] border-white/15 text-gray-300 h-11 rounded-xl file:bg-[#D50032] file:text-white file:border-none file:rounded-md file:px-2 file:py-1 text-xs" required />
                </div>
              </div>
            </div>

            {/* 2. Login Details */}
            <div className="space-y-4 pt-4 border-t border-white/10">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#C2A86A] flex items-center gap-2">
                <Lock size={16} /> 2. Security & Password
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold text-gray-300">Password</Label>
                  <div className="relative mt-1">
                    <Input type={showPassword ? "text" : "password"} minLength={8} value={form.password} onChange={(e) => updateForm("password", e.target.value)} className="bg-white/[0.04] border-white/15 text-white h-11 rounded-xl pr-10" required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-semibold text-gray-300">Confirm Password</Label>
                  <Input type={showPassword ? "text" : "password"} minLength={8} value={form.confirm_password} onChange={(e) => updateForm("confirm_password", e.target.value)} className="mt-1 bg-white/[0.04] border-white/15 text-white h-11 rounded-xl" required />
                </div>
              </div>
            </div>

            {/* 3. KYC Documents */}
            <div className="space-y-4 pt-4 border-t border-white/10">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#C2A86A] flex items-center gap-2">
                <FileText size={16} /> 3. Verification & KYC Documents
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold text-gray-300">Aadhaar Card File</Label>
                  <Input type="file" accept=".jpg,.jpeg,.png,.webp,.pdf" onChange={(e) => setFiles((prev) => ({ ...prev, aadhaar_card: e.target.files?.[0] }))} className="mt-1 bg-white/[0.04] border-white/15 text-gray-300 h-11 rounded-xl file:bg-[#D50032] file:text-white file:border-none file:rounded-md file:px-2 file:py-1 text-xs" required />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-gray-300">PAN Card File</Label>
                  <Input type="file" accept=".jpg,.jpeg,.png,.webp,.pdf" onChange={(e) => setFiles((prev) => ({ ...prev, pan_card: e.target.files?.[0] }))} className="mt-1 bg-white/[0.04] border-white/15 text-gray-300 h-11 rounded-xl file:bg-[#D50032] file:text-white file:border-none file:rounded-md file:px-2 file:py-1 text-xs" required />
                </div>
              </div>
            </div>

            {/* 4. Bank Details */}
            <div className="space-y-4 pt-4 border-t border-white/10">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#C2A86A] flex items-center gap-2">
                <CreditCard size={16} /> 4. Commission Bank Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold text-gray-300">Account Holder Name</Label>
                  <Input value={form.bank_account_holder_name} onChange={(e) => updateForm("bank_account_holder_name", e.target.value)} className="mt-1 bg-white/[0.04] border-white/15 text-white h-11 rounded-xl" required />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-gray-300">Bank Name</Label>
                  <Input value={form.bank_name} onChange={(e) => updateForm("bank_name", e.target.value)} className="mt-1 bg-white/[0.04] border-white/15 text-white h-11 rounded-xl" required />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-gray-300">Account Number</Label>
                  <Input value={form.bank_account_number} onChange={(e) => updateForm("bank_account_number", e.target.value)} className="mt-1 bg-white/[0.04] border-white/15 text-white h-11 rounded-xl" required />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-gray-300">IFSC Code</Label>
                  <Input value={form.bank_ifsc_code} onChange={(e) => updateForm("bank_ifsc_code", e.target.value.toUpperCase())} className="mt-1 bg-white/[0.04] border-white/15 text-white h-11 rounded-xl" required />
                </div>
                <div className="md:col-span-2">
                  <Label className="text-xs font-semibold text-gray-300">UPI ID (Optional)</Label>
                  <Input value={form.bank_upi_id} onChange={(e) => updateForm("bank_upi_id", e.target.value)} className="mt-1 bg-white/[0.04] border-white/15 text-white h-11 rounded-xl" />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={loading}
              className="w-full h-12 text-base font-bold text-white bg-gradient-to-r from-[#D50032] via-[#FF0000] to-[#b00029] hover:from-[#e60036] hover:to-[#c4002e] rounded-xl shadow-lg shadow-[#D50032]/25 active:scale-[0.99] transition-all"
            >
              {loading ? "Submitting IB Application..." : "Complete IB Self Registration"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

function FranchiseIBRegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    mobile_no: "",
    password: "",
    confirm_password: "",
    pan_number: "",
    aadhaar_number: "",
    bank_account_holder_name: "",
    bank_name: "",
    bank_account_number: "",
    bank_ifsc_code: "",
  });
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const updateForm = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (form.password !== form.confirm_password) {
      setErrorMsg("Password and confirm password do not match.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        full_name: form.full_name,
        email: form.email,
        mobile_no: form.mobile_no,
        password: form.password,
        pan_number: form.pan_number || undefined,
        aadhaar_number: form.aadhaar_number || undefined,
        bank_account_holder_name: form.bank_account_holder_name || undefined,
        bank_name: form.bank_name || undefined,
        bank_account_number: form.bank_account_number || undefined,
        bank_ifsc_code: form.bank_ifsc_code || undefined,
      };

      const res = await api.post("/franchise-ibs/", payload);
      setSuccessMsg(
        `Franchise IB account created successfully! Referral code: ${res.data.referral_code}. Redirecting to login...`
      );

      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err: any) {
      let message = "Franchise IB registration failed. Please check your details and try again.";
      if (err.response?.data?.detail) {
        message = Array.isArray(err.response.data.detail)
          ? err.response.data.detail.map((item: any) => item.msg).join(", ")
          : err.response.data.detail;
      }
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-[#0a0a0f] text-white">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#D50032]/25 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-[#C2A86A]/15 rounded-full blur-[150px]"></div>
      </div>

      <div className="w-full max-w-4xl relative z-10 space-y-6">
        <Link to="/login" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-all bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full border border-white/10">
          <ArrowLeft size={16} className="text-[#D50032]" />
          <span>Back to Login</span>
        </Link>

        <div className="relative rounded-3xl bg-[#12121c]/90 backdrop-blur-2xl border border-white/10 shadow-2xl p-6 sm:p-10 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#D50032] via-[#FF4D70] to-[#C2A86A]"></div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-white/10">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#C2A86A]/20 text-[#C2A86A] border border-[#C2A86A]/30 mb-2">
                Franchise Partner Program
              </span>
              <h2 className="text-3xl font-extrabold text-white">Franchise IB Application</h2>
              <p className="text-sm text-gray-400 mt-1">Apply to become an official FinTrade Franchise IB partner.</p>
            </div>
            <div className="h-10 w-32 overflow-hidden shrink-0">
              <img src={logo} alt="FinTrade" className="h-full w-full object-contain scale-[2.2]" />
            </div>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-[#D50032]/10 border border-[#D50032]/30 text-[#FF4D70] text-sm flex items-start gap-2.5">
              <AlertCircle size={18} className="shrink-0 text-[#FF4D70] mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-sm flex items-start gap-2.5">
              <CheckCircle2 size={18} className="shrink-0 text-green-400 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#C2A86A] flex items-center gap-2">
                <User size={16} /> 1. Personal & Contact Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs font-semibold text-gray-300">Full Name</Label>
                  <Input value={form.full_name} onChange={(e) => updateForm("full_name", e.target.value)} className="mt-1 bg-white/[0.04] border-white/15 text-white h-11 rounded-xl" required />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-gray-300">Email Address</Label>
                  <Input type="email" value={form.email} onChange={(e) => updateForm("email", e.target.value)} className="mt-1 bg-white/[0.04] border-white/15 text-white h-11 rounded-xl" required />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-gray-300">Mobile Number</Label>
                  <Input type="tel" value={form.mobile_no} onChange={(e) => updateForm("mobile_no", e.target.value)} className="mt-1 bg-white/[0.04] border-white/15 text-white h-11 rounded-xl" required />
                </div>
              </div>
            </div>

            {/* Login Details */}
            <div className="space-y-4 pt-4 border-t border-white/10">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#C2A86A] flex items-center gap-2">
                <Lock size={16} /> 2. Security Credentials
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold text-gray-300">Password</Label>
                  <div className="relative mt-1">
                    <Input type={showPassword ? "text" : "password"} minLength={8} value={form.password} onChange={(e) => updateForm("password", e.target.value)} className="bg-white/[0.04] border-white/15 text-white h-11 rounded-xl pr-10" required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-semibold text-gray-300">Confirm Password</Label>
                  <Input type={showPassword ? "text" : "password"} minLength={8} value={form.confirm_password} onChange={(e) => updateForm("confirm_password", e.target.value)} className="mt-1 bg-white/[0.04] border-white/15 text-white h-11 rounded-xl" required />
                </div>
              </div>
            </div>

            {/* KYC Numbers */}
            <div className="space-y-4 pt-4 border-t border-white/10">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#C2A86A] flex items-center gap-2">
                <FileText size={16} /> 3. Verification Numbers
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold text-gray-300">Aadhaar Number</Label>
                  <Input value={form.aadhaar_number} onChange={(e) => updateForm("aadhaar_number", e.target.value)} placeholder="12-digit Aadhaar" className="mt-1 bg-white/[0.04] border-white/15 text-white h-11 rounded-xl" />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-gray-300">PAN Number</Label>
                  <Input value={form.pan_number} onChange={(e) => updateForm("pan_number", e.target.value.toUpperCase())} placeholder="10-character PAN" className="mt-1 bg-white/[0.04] border-white/15 text-white h-11 rounded-xl" />
                </div>
              </div>
            </div>

            {/* Bank Details */}
            <div className="space-y-4 pt-4 border-t border-white/10">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#C2A86A] flex items-center gap-2">
                <CreditCard size={16} /> 4. Bank Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold text-gray-300">Account Holder Name</Label>
                  <Input value={form.bank_account_holder_name} onChange={(e) => updateForm("bank_account_holder_name", e.target.value)} className="mt-1 bg-white/[0.04] border-white/15 text-white h-11 rounded-xl" />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-gray-300">Bank Name</Label>
                  <Input value={form.bank_name} onChange={(e) => updateForm("bank_name", e.target.value)} className="mt-1 bg-white/[0.04] border-white/15 text-white h-11 rounded-xl" />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-gray-300">Account Number</Label>
                  <Input value={form.bank_account_number} onChange={(e) => updateForm("bank_account_number", e.target.value)} className="mt-1 bg-white/[0.04] border-white/15 text-white h-11 rounded-xl" />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-gray-300">IFSC Code</Label>
                  <Input value={form.bank_ifsc_code} onChange={(e) => updateForm("bank_ifsc_code", e.target.value.toUpperCase())} className="mt-1 bg-white/[0.04] border-white/15 text-white h-11 rounded-xl" />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={loading}
              className="w-full h-12 text-base font-bold text-white bg-gradient-to-r from-[#D50032] via-[#FF0000] to-[#b00029] rounded-xl shadow-lg shadow-[#D50032]/25 active:scale-[0.99] transition-all"
            >
              {loading ? "Submitting Application..." : "Submit Franchise IB Application"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  const params = new URLSearchParams(window.location.search);
  const isFranchiseRegister =
    window.location.pathname.includes("/register-franchise") ||
    params.get("type") === "franchise_ib" ||
    params.get("role") === "franchise_ib";
  if (isFranchiseRegister) {
    return <FranchiseIBRegisterForm />;
  }

  const isAffiliateRegister =
    window.location.hostname.toLowerCase().includes("affiliate.") ||
    params.get("type") === "ib" ||
    params.get("role") === "ib" ||
    params.get("role") === "distributor";
  if (isAffiliateRegister) {
    return <AffiliateIBRegisterForm />;
  }

  const initialRefCode = new URLSearchParams(window.location.search).get("ref") || localStorage.getItem("distributor_code") || "";
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [password, setPassword] = useState("");
  const [referralCode] = useState(initialRefCode);
  const [leadCaptured, setLeadCaptured] = useState(() => !initialRefCode || localStorage.getItem(`referral_lead_done_${initialRefCode}`) === "true");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // OTP state
  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [otpToken, setOtpToken] = useState("");
  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
  const [channels, setChannels] = useState<string[]>([]);
  const [countdown, setCountdown] = useState(0);
  const [resending, setResending] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleVerifyOTP = async (codeStr?: string) => {
    const code = codeStr || otpCode.join("");
    if (code.length !== 6) return;

    setErrorMsg("");
    setLoading(true);

    try {
      const response = await api.post("/auth/verify-otp", {
        otp_token: otpToken,
        code,
      });
      const { access_token, user } = response.data;

      localStorage.setItem("token", access_token);
      localStorage.setItem("user", JSON.stringify(user));
      navigate("/");
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || "Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResending(true);
    setErrorMsg("");

    try {
      const response = await api.post("/auth/resend-otp", {
        otp_token: otpToken,
      });
      const { otp_token: newToken, expires_in_seconds, channels: ch } = response.data;
      setOtpToken(newToken);
      setChannels(ch || []);
      setCountdown(expires_in_seconds || 300);
      setOtpCode(["", "", "", "", "", ""]);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || "Failed to resend code.");
    } finally {
      setResending(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...otpCode];
    newCode[index] = value.slice(-1);
    setOtpCode(newCode);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    const fullCode = newCode.join("");
    if (fullCode.length === 6) {
      handleVerifyOTP(fullCode);
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otpCode[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 0) return;
    const newCode = [...otpCode];
    for (let i = 0; i < 6; i++) {
      newCode[i] = pasted[i] || "";
    }
    setOtpCode(newCode);
    if (pasted.length === 6) {
      handleVerifyOTP(pasted);
    } else {
      otpRefs.current[pasted.length]?.focus();
    }
  };

  const handleReferralLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      await api.post("/distributor/referral-leads", {
        referral_code: referralCode,
        full_name: fullName,
        email,
        mobile_no: phone,
        city,
      });
      localStorage.setItem("distributor_code", referralCode);
      localStorage.setItem(`referral_lead_done_${referralCode}`, "true");
      setLeadCaptured(true);
    } catch (err: any) {
      let errorMessage = "Could not save your details. Please check the referral link and try again.";
      if (err.response?.data?.detail) {
        errorMessage = Array.isArray(err.response.data.detail)
          ? err.response.data.detail.map((item: any) => item.msg).join(", ")
          : err.response.data.detail;
      }
      setErrorMsg(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const refCode = referralCode || localStorage.getItem("distributor_code") || new URLSearchParams(window.location.search).get("ref") || undefined;
      const response = await api.post("/auth/register", {
        full_name: fullName,
        email,
        phone,
        city,
        password,
        referral_code: refCode
      });

      if (response.data.otp_token) {
        const { otp_token, expires_in_seconds, channels: ch } = response.data;
        setOtpToken(otp_token);
        setChannels(ch || []);
        setCountdown(expires_in_seconds || 300);
        setStep("otp");
        setOtpCode(["", "", "", "", "", ""]);
        setTimeout(() => otpRefs.current[0]?.focus(), 100);
        return;
      }

      const { access_token, user } = response.data;
      localStorage.setItem("token", access_token);
      localStorage.setItem("user", JSON.stringify(user));
      navigate("/");
    } catch (err: any) {
      let errorMessage = "Registration failed. Email might already exist.";
      if (err.response?.data?.detail) {
        if (Array.isArray(err.response.data.detail)) {
          errorMessage = err.response.data.detail.map((e: any) => e.msg).join(", ");
        } else if (typeof err.response.data.detail === "string") {
          errorMessage = err.response.data.detail;
        }
      }
      setErrorMsg(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-[#0a0a0f] text-white selection:bg-[#D50032] selection:text-white font-sans">
      {/* Background Animated Glowing Orbs & Ambient Grid */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#D50032]/25 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-[#C2A86A]/15 rounded-full blur-[150px] animate-pulse"></div>
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-[#3B82F6]/15 rounded-full blur-[130px]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:24px_24px] opacity-40"></div>
      </div>

      <div className="w-full max-w-6xl grid lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
        
        {/* Left Side — Branding & Features */}
        <div className="lg:col-span-5 hidden lg:flex flex-col justify-between space-y-8 pr-4">
          <div className="space-y-6">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition-all bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform text-[#D50032]" />
              <span>Back to Home</span>
            </Link>

            {/* Logo Container */}
            <div className="inline-flex items-center h-[90px] w-[260px] overflow-hidden p-2 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-xl shadow-2xl">
              <img
                src="/fintrade_logo_dark.png"
                alt="FinTrade"
                className="h-full w-full object-contain scale-[3.8] -translate-x-4"
              />
            </div>

            <div className="space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#D50032]/20 text-[#FF4D70] border border-[#D50032]/30">
                <Sparkles size={12} /> Join FinTrade Academy
              </span>
              <h1 className="text-4xl font-extrabold tracking-tight text-white leading-tight">
                Master the Art of <br />
                <span className="bg-gradient-to-r from-[#D50032] via-[#FF4D70] to-[#C2A86A] bg-clip-text text-transparent">
                  Stock Trading
                </span>
              </h1>
              <p className="text-gray-400 text-base leading-relaxed">
                Create your student account to unlock institutional trading courses, practical simulator practice, and mentor guidance.
              </p>
            </div>

            {/* Feature Pills */}
            <div className="space-y-3 pt-2">
              {[
                { icon: <TrendingUp className="text-[#FF4D70]" size={18} />, title: "Paper Trading Simulator", desc: "Test strategies risk-free with virtual capital" },
                { icon: <Award className="text-[#C2A86A]" size={18} />, title: "Recognized Certification", desc: "Earn completion credentials after passing exams" },
                { icon: <BookOpen className="text-[#3B82F6]" size={18} />, title: "Live Cohort Batches", desc: "Interactive class sessions with expert tutors" },
              ].map((feat, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.07] hover:border-white/20 transition-all hover:bg-white/[0.06] group"
                >
                  <div className="p-2.5 rounded-xl bg-black/50 border border-white/10 group-hover:scale-110 transition-transform">
                    {feat.icon}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">{feat.title}</h4>
                    <p className="text-xs text-gray-400">{feat.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-gray-500">
            <span className="flex items-center gap-1.5 text-gray-400">
              <ShieldCheck size={14} className="text-[#D50032]" /> SSL Encrypted & Data Protected
            </span>
            <span>Join 10,000+ Learners</span>
          </div>
        </div>

        {/* Right Side — Glassmorphic Form Card */}
        <div className="lg:col-span-7 w-full max-w-md mx-auto lg:max-w-none">
          <div className="relative rounded-3xl bg-[#12121c]/85 backdrop-blur-2xl border border-white/10 shadow-2xl p-6 sm:p-10 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#D50032] via-[#FF4D70] to-[#C2A86A]"></div>

            {/* Mobile Header Logo */}
            <div className="lg:hidden flex items-center justify-between mb-6 pb-4 border-b border-white/10">
              <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white">
                <ArrowLeft size={16} /> Home
              </Link>
              <div className="h-8 w-28 overflow-hidden">
                <img src={logo} alt="FinTrade" className="h-full w-full object-contain scale-[2.2]" />
              </div>
            </div>

            {step === "credentials" ? (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="h-2 w-2 rounded-full bg-[#D50032]"></span>
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">New Student</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                    {referralCode && !leadCaptured ? "Share Your Details" : "Create Account"}
                  </h2>
                  <p className="text-sm text-gray-400 mt-1">
                    {referralCode && !leadCaptured
                      ? "Fill this form first so your IB can guide your admission journey."
                      : "Fill in your details below to get started on FinTrade"}
                  </p>
                </div>

                {errorMsg && (
                  <div className="p-3.5 rounded-xl bg-[#D50032]/10 border border-[#D50032]/30 text-[#FF4D70] text-sm flex items-start gap-2.5">
                    <AlertCircle size={18} className="shrink-0 text-[#FF4D70] mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <form onSubmit={referralCode && !leadCaptured ? handleReferralLeadSubmit : handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-xs font-semibold text-gray-300 uppercase">
                      Full Name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <Input
                        id="fullName"
                        name="name"
                        type="text"
                        autoComplete="name"
                        placeholder="Rahul Sharma"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="pl-11 h-12 bg-white/[0.04] border-white/15 text-white placeholder:text-gray-500 rounded-xl focus:border-[#D50032] focus:ring-2 focus:ring-[#D50032]/40"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs font-semibold text-gray-300 uppercase">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        placeholder="rahul.sharma@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-11 h-12 bg-white/[0.04] border-white/15 text-white placeholder:text-gray-500 rounded-xl focus:border-[#D50032] focus:ring-2 focus:ring-[#D50032]/40"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-xs font-semibold text-gray-300 uppercase">
                        Phone Number
                      </Label>
                      <div className="relative">
                        <Smartphone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          autoComplete="tel"
                          placeholder="+91 98765 43210"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="pl-11 h-12 bg-white/[0.04] border-white/15 text-white placeholder:text-gray-500 rounded-xl focus:border-[#D50032] focus:ring-2 focus:ring-[#D50032]/40"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="city" className="text-xs font-semibold text-gray-300 uppercase">
                        City
                      </Label>
                      <div className="relative">
                        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <Input
                          id="city"
                          name="city"
                          type="text"
                          autoComplete="address-level2"
                          placeholder="Mumbai"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="pl-11 h-12 bg-white/[0.04] border-white/15 text-white placeholder:text-gray-500 rounded-xl focus:border-[#D50032] focus:ring-2 focus:ring-[#D50032]/40"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {(!referralCode || leadCaptured) && (
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-xs font-semibold text-gray-300 uppercase">
                        Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          autoComplete="new-password"
                          placeholder="Create a strong password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-11 pr-11 h-12 bg-white/[0.04] border-white/15 text-white placeholder:text-gray-500 rounded-xl focus:border-[#D50032] focus:ring-2 focus:ring-[#D50032]/40"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                  )}

                  <Button
                    type="submit"
                    size="lg"
                    disabled={loading}
                    className="w-full h-12 text-base font-bold text-white bg-gradient-to-r from-[#D50032] via-[#FF0000] to-[#b00029] hover:from-[#e60036] hover:to-[#c4002e] rounded-xl shadow-lg shadow-[#D50032]/25 active:scale-[0.99] transition-all mt-4"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                        Processing...
                      </span>
                    ) : referralCode && !leadCaptured ? (
                      "Continue to Registration"
                    ) : (
                      "Create Free Account"
                    )}
                  </Button>
                </form>

                {isGoogleAuthConfigured && (!referralCode || leadCaptured) && (
                  <div className="pt-2">
                    <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/10" />
                      </div>
                      <div className="relative flex justify-center text-xs">
                        <span className="px-3 bg-[#12121c] text-gray-400 font-medium">Or continue with</span>
                      </div>
                    </div>

                    <GoogleRegisterButton
                      loading={loading}
                      onLoadingChange={setLoading}
                      onError={setErrorMsg}
                    />
                  </div>
                )}

                <div className="pt-4 border-t border-white/10 text-center">
                  <p className="text-sm text-gray-400">
                    Already registered?{" "}
                    <Link to="/login" className="font-bold text-[#FF4D70] hover:text-white hover:underline transition-colors">
                      Log in here
                    </Link>
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#D50032]/10 border border-[#D50032]/30 text-[#FF4D70] mb-2">
                  <ShieldCheck size={32} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Verify Your Contact Number</h2>
                  <p className="text-sm text-gray-400 mt-1">
                    Enter the 6-digit verification code sent to your registered contact:
                  </p>
                  <div className="mt-3 flex flex-wrap justify-center gap-2">
                    {channels.includes("email") && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/5 border border-white/10 text-gray-200">
                        <Mail size={12} className="text-[#FF4D70]" /> {email}
                      </span>
                    )}
                    {channels.includes("sms") && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/5 border border-white/10 text-gray-200">
                        <Smartphone size={12} className="text-[#FF4D70]" /> {phone}
                      </span>
                    )}
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-3.5 rounded-xl bg-[#D50032]/10 border border-[#D50032]/30 text-[#FF4D70] text-sm flex items-center justify-center gap-2">
                    <AlertCircle size={18} />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="flex justify-center gap-2.5 sm:gap-3 py-2" onPaste={handleOtpPaste}>
                  {otpCode.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => { otpRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className="w-11 h-14 sm:w-12 sm:h-14 text-center text-2xl font-black bg-white/[0.06] border-2 rounded-xl text-white outline-none transition-all focus:border-[#D50032] focus:ring-2 focus:ring-[#D50032]/40"
                      style={{
                        borderColor: digit ? "#D50032" : "rgba(255,255,255,0.15)",
                        background: digit ? "rgba(213,0,50,0.15)" : "rgba(255,255,255,0.04)"
                      }}
                    />
                  ))}
                </div>

                <div className="text-xs text-gray-400">
                  {countdown > 0 ? (
                    <span>
                      Code expires in <strong className="text-[#FF4D70]">{formatTime(countdown)}</strong>
                    </span>
                  ) : (
                    <span className="text-[#FF4D70] font-semibold">Code expired. Please request a new one.</span>
                  )}
                </div>

                <Button
                  onClick={() => handleVerifyOTP()}
                  disabled={loading || otpCode.join("").length !== 6}
                  className="w-full h-12 text-base font-bold text-white bg-gradient-to-r from-[#D50032] to-[#b00029] rounded-xl shadow-lg disabled:opacity-50"
                >
                  {loading ? "Verifying..." : "Verify & Complete Registration"}
                </Button>

                <div className="flex items-center justify-between pt-2 text-xs">
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        if (otpToken) {
                          await api.post("/auth/cancel-registration", { otp_token: otpToken });
                        }
                      } catch (err) {
                        console.error("Failed to cancel registration:", err);
                      }
                      setStep("credentials");
                      setErrorMsg("");
                      setOtpCode(["", "", "", "", "", ""]);
                    }}
                    className="text-gray-400 hover:text-white flex items-center gap-1"
                  >
                    <ArrowLeft size={14} /> Back
                  </button>
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={resending || countdown > 270}
                    className="font-bold text-[#FF4D70] hover:underline disabled:opacity-40"
                  >
                    {resending ? "Sending..." : "Resend Code"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
