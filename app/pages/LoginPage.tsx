import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { GoogleLogin } from "@react-oauth/google";
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
  Lock,
  Sparkles,
  TrendingUp,
  Award,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  MapPin
} from "lucide-react";
import logo from "../../imports/fintrade_logo.png";
import api from "../services/api";
import { isGoogleAuthConfigured } from "../config/googleAuth";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const hostname = typeof window !== "undefined" ? window.location.hostname.toLowerCase() : "";
  const isAffiliatePortal = hostname === "affiliate.thefintrade.com" || hostname.startsWith("affiliate.");

  const handleStudentRedirect = async () => {
    try {
      const res = await api.get("/courses/enrolled");
      if (res.data && res.data.length > 0) {
        navigate("/student/dashboard");
      } else {
        navigate("/");
      }
    } catch {
      navigate("/");
    }
  };

  const redirectAfterLogin = async (user: any) => {
    const roles = user.roles || [];
    const isSuperAdmin = roles.some((r: any) => r.name === "super_admin");
    const isAdmin = roles.some((r: any) => r.name === "admin");
    const isFaculty = roles.some((r: any) => r.name === "faculty");
    const isDistributor = roles.some((r: any) => r.name === "distributor");
    const isFranchiseIB = roles.some((r: any) => r.name === "franchise_ib");

    const hostname = typeof window !== "undefined" ? window.location.hostname.toLowerCase() : "";
    const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1";

    if (isAffiliatePortal && !isDistributor && !isFranchiseIB) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setErrorMsg("This portal is only for IB and Franchise IB accounts. Please use the main FinTrade login.");
      setStep("credentials");
      return;
    }

    if (!isAffiliatePortal && !isLocalhost && (isDistributor || isFranchiseIB)) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setErrorMsg("IB and Franchise IB accounts must login from affiliate.thefintrade.com/login.");
      setStep("credentials");
      return;
    }

    if (isSuperAdmin) {
      navigate("/superadmin/dashboard");
    } else if (isAdmin) {
      navigate("/admin/dashboard");
    } else if (isFaculty) {
      navigate("/teacher/dashboard");
    } else if (isFranchiseIB) {
      navigate("/franchise-ib/dashboard");
    } else if (isDistributor) {
      navigate("/distributor/dashboard");
    } else {
      await handleStudentRedirect();
    }
  };

  // OTP state
  const [step, setStep] = useState<"credentials" | "otp" | "forgot_email" | "forgot_reset" | "google_complete">("credentials");
  const [otpToken, setOtpToken] = useState("");
  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
  const [channels, setChannels] = useState<string[]>([]);
  const [countdown, setCountdown] = useState(0);
  const [resending, setResending] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Password reset state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [googlePhone, setGooglePhone] = useState("");
  const [googleCity, setGoogleCity] = useState("");
  const [googlePassword, setGooglePassword] = useState("");
  const [googleConfirmPassword, setGoogleConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showGooglePassword, setShowGooglePassword] = useState(false);
  const [showGoogleConfirmPassword, setShowGoogleConfirmPassword] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Countdown timer
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

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const response = await api.post("/auth/forgot-password", { email });
      const { otp_token, expires_in_seconds, channels: ch } = response.data;

      setOtpToken(otp_token);
      setChannels(ch || ["email"]);
      setCountdown(expires_in_seconds || 300);
      setStep("forgot_reset");
      setOtpCode(["", "", "", "", "", ""]);
      setNewPassword("");
      setConfirmPassword("");

      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || "Failed to send reset code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const code = otpCode.join("");
    if (code.length !== 6) {
      setErrorMsg("Please enter the 6-digit verification code.");
      return;
    }

    if (newPassword.length < 8) {
      setErrorMsg("Password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/reset-password", {
        otp_token: otpToken,
        code,
        new_password: newPassword,
      });

      setSuccessMsg(response.data.message || "Password reset successfully!");
      setStep("credentials");
      setPassword("");
      setOtpCode(["", "", "", "", "", ""]);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || "Failed to reset password. Please verify your OTP code.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", { email, password });
      if (response.data.access_token) {
        const { access_token, user } = response.data;
        localStorage.setItem("token", access_token);
        localStorage.setItem("user", JSON.stringify(user));
        await redirectAfterLogin(user);
        return;
      }

      const { otp_token, expires_in_seconds, channels: ch } = response.data;
      setOtpToken(otp_token);
      setChannels(ch || []);
      setCountdown(expires_in_seconds || 300);
      setStep("otp");
      setOtpCode(["", "", "", "", "", ""]);

      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || "Invalid credentials or login failed.");
    } finally {
      setLoading(false);
    }
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
      await redirectAfterLogin(user);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || "Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setErrorMsg("");
    setLoading(true);
    try {
      const response = await api.post("/auth/google", {
        token: credentialResponse.credential,
      });
      const { access_token, user } = response.data;
      localStorage.setItem("token", access_token);
      localStorage.setItem("user", JSON.stringify(user));

      if (!user.phone || !user.has_password) {
        setGooglePhone(user.phone || "");
        setGoogleCity(user.city || "");
        setGooglePassword("");
        setGoogleConfirmPassword("");
        setStep("google_complete");
        return;
      }
      await redirectAfterLogin(user);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || "Google sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleCompleteProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (googlePhone.trim().length < 8) {
      setErrorMsg("Please enter a valid mobile number.");
      return;
    }
    if (googlePassword.length < 8) {
      setErrorMsg("Password must be at least 8 characters long.");
      return;
    }
    if (googlePassword !== googleConfirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/auth/google/complete-profile", {
        phone: googlePhone,
        city: googleCity,
        password: googlePassword,
      });
      const user = response.data;
      localStorage.setItem("user", JSON.stringify(user));
      await redirectAfterLogin(user);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || "Failed to save mobile number and password.");
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
      otpRefs.current[0]?.focus();
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
    if (fullCode.length === 6 && step === "otp") {
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
    if (pasted.length === 6 && step === "otp") {
      handleVerifyOTP(pasted);
    } else {
      otpRefs.current[pasted.length]?.focus();
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
          <div className="space-y-5">
            {/* Logo Container — Aligned to Left */}
            <div className="flex items-center">
              <div className="inline-flex items-center h-[90px] w-[260px] overflow-hidden p-2 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-xl shadow-2xl">
                <img
                  src="/fintrade_logo_dark.png"
                  alt="FinTrade"
                  className="h-full w-full object-contain scale-[3.8] -translate-x-4"
                />
              </div>
            </div>

            {/* Back to Home Button — Set directly under the logo */}
            <div>
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white transition-all bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md group"
              >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform text-[#D50032]" />
                <span>Back to Home</span>
              </Link>
            </div>

            <div className="space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#D50032]/20 text-[#FF4D70] border border-[#D50032]/30">
                <Sparkles size={12} /> Premier Trading Academy
              </span>
              <h1 className="text-4xl font-extrabold tracking-tight text-white leading-tight">
                Empower Your <br />
                <span className="bg-gradient-to-r from-[#D50032] via-[#FF4D70] to-[#C2A86A] bg-clip-text text-transparent">
                  Financial Future
                </span>
              </h1>
              <p className="text-gray-400 text-base leading-relaxed">
                Log in to access your interactive courses, real-time market simulator, live mentor sessions, and AI tutor.
              </p>
            </div>

            {/* Feature Pills */}
            <div className="space-y-3 pt-2">
              {[
                { icon: <TrendingUp className="text-[#FF4D70]" size={18} />, title: "Real-Time Simulator", desc: "Practice risk-free with live market quotes" },
                { icon: <Award className="text-[#C2A86A]" size={18} />, title: "Certified Curriculum", desc: "SEBI-guided professional trading modules" },
                { icon: <BookOpen className="text-[#3B82F6]" size={18} />, title: "Live Mentor Sessions", desc: "Direct guidance from institutional traders" },
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

          {/* Bottom Badge */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-gray-500">
            <span className="flex items-center gap-1.5 text-gray-400">
              <ShieldCheck size={14} className="text-[#D50032]" /> SSL Encrypted & Secure Portal
            </span>
            <span>v2.5 Professional</span>
          </div>
        </div>

        {/* Right Side — Glassmorphic Login Form Card */}
        <div className="lg:col-span-7 w-full max-w-md mx-auto lg:max-w-none">
          <div className="relative rounded-3xl bg-[#12121c]/85 backdrop-blur-2xl border border-white/10 shadow-2xl p-6 sm:p-10 overflow-hidden">
            {/* Top Accent Gradient Bar */}
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

            {/* STEP 1: CREDENTIALS FORM */}
            {step === "credentials" && (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="h-2 w-2 rounded-full bg-[#D50032]"></span>
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Authentication</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                    {isAffiliatePortal ? "Affiliate Portal Login" : "Welcome Back"}
                  </h2>
                  <p className="text-sm text-gray-400 mt-1">
                    {isAffiliatePortal
                      ? "Enter your IB or Franchise IB credentials to access your dashboard"
                      : "Sign in with your registered email or mobile number"}
                  </p>
                </div>

                {successMsg && (
                  <div className="p-3.5 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-sm flex items-center gap-2.5">
                    <CheckCircle2 size={18} className="shrink-0 text-green-400" />
                    <span>{successMsg}</span>
                  </div>
                )}

                {errorMsg && (
                  <div className="p-3.5 rounded-xl bg-[#D50032]/10 border border-[#D50032]/30 text-[#FF4D70] text-sm flex items-start gap-2.5">
                    <AlertCircle size={18} className="shrink-0 text-[#FF4D70] mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Email or Mobile Number
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <Input
                        id="email"
                        name="email"
                        type="text"
                        autoComplete="username"
                        placeholder="rahul.sharma@example.com or +919876543210"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-11 h-12 bg-white/[0.04] border-white/15 text-white placeholder:text-gray-500 rounded-xl focus:border-[#D50032] focus:ring-2 focus:ring-[#D50032]/40 transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                        Password
                      </Label>
                      <button
                        type="button"
                        onClick={() => {
                          setStep("forgot_email");
                          setErrorMsg("");
                          setSuccessMsg("");
                        }}
                        className="text-xs font-semibold text-[#FF4D70] hover:text-[#D50032] hover:underline transition-colors"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-11 pr-11 h-12 bg-white/[0.04] border-white/15 text-white placeholder:text-gray-500 rounded-xl focus:border-[#D50032] focus:ring-2 focus:ring-[#D50032]/40 transition-all"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        className="rounded border-white/20 bg-white/10 text-[#D50032] focus:ring-[#D50032] focus:ring-offset-0"
                      />
                      <span className="text-xs text-gray-400">Keep me logged in</span>
                    </label>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    disabled={loading}
                    className="w-full h-12 text-base font-bold text-white bg-gradient-to-r from-[#D50032] via-[#FF0000] to-[#b00029] hover:from-[#e60036] hover:to-[#c4002e] rounded-xl shadow-lg shadow-[#D50032]/25 hover:shadow-xl hover:shadow-[#D50032]/35 active:scale-[0.99] transition-all disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                        Authenticating...
                      </span>
                    ) : (
                      "Sign In to Portal"
                    )}
                  </Button>
                </form>

                {isGoogleAuthConfigured && !isAffiliatePortal && (
                  <div className="pt-2">
                    <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/10" />
                      </div>
                      <div className="relative flex justify-center text-xs">
                        <span className="px-3 bg-[#12121c] text-gray-400 font-medium">Or continue with</span>
                      </div>
                    </div>

                    <div className="flex justify-center">
                      <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => setErrorMsg("Google sign-in failed. Please try again.")}
                        size="large"
                        width="100%"
                        text="signin_with"
                        theme="filled_black"
                        shape="circle"
                      />
                    </div>
                  </div>
                )}

                {!isAffiliatePortal && (
                  <div className="pt-4 border-t border-white/10 text-center">
                    <p className="text-sm text-gray-400">
                      Don't have an account yet?{" "}
                      <Link to="/register" className="font-bold text-[#FF4D70] hover:text-white hover:underline transition-colors">
                        Create Student Account
                      </Link>
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: GOOGLE COMPLETE PROFILE */}
            {step === "google_complete" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">Complete Your Account</h2>
                  <p className="text-sm text-gray-400 mt-1">
                    Please provide your contact details and set a password to finalize your profile.
                  </p>
                </div>

                {errorMsg && (
                  <div className="p-3.5 rounded-xl bg-[#D50032]/10 border border-[#D50032]/30 text-[#FF4D70] text-sm flex items-start gap-2.5">
                    <AlertCircle size={18} className="shrink-0 text-[#FF4D70] mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleGoogleCompleteProfile} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="google-phone" className="text-xs font-semibold text-gray-300 uppercase">
                      Mobile Number
                    </Label>
                    <div className="relative">
                      <Smartphone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <Input
                        id="google-phone"
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={googlePhone}
                        onChange={(e) => setGooglePhone(e.target.value)}
                        className="pl-11 h-12 bg-white/[0.04] border-white/15 text-white rounded-xl focus:border-[#D50032] focus:ring-2 focus:ring-[#D50032]/40"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="google-city" className="text-xs font-semibold text-gray-300 uppercase">
                      City
                    </Label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <Input
                        id="google-city"
                        type="text"
                        placeholder="e.g., Mumbai"
                        value={googleCity}
                        onChange={(e) => setGoogleCity(e.target.value)}
                        className="pl-11 h-12 bg-white/[0.04] border-white/15 text-white rounded-xl focus:border-[#D50032] focus:ring-2 focus:ring-[#D50032]/40"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="google-password" className="text-xs font-semibold text-gray-300 uppercase">
                      Create Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <Input
                        id="google-password"
                        type={showGooglePassword ? "text" : "password"}
                        placeholder="At least 8 characters"
                        value={googlePassword}
                        onChange={(e) => setGooglePassword(e.target.value)}
                        className="pl-11 pr-11 h-12 bg-white/[0.04] border-white/15 text-white rounded-xl focus:border-[#D50032]"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowGooglePassword(!showGooglePassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showGooglePassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="google-confirm-password" className="text-xs font-semibold text-gray-300 uppercase">
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <Input
                        id="google-confirm-password"
                        type={showGoogleConfirmPassword ? "text" : "password"}
                        placeholder="Confirm password"
                        value={googleConfirmPassword}
                        onChange={(e) => setGoogleConfirmPassword(e.target.value)}
                        className="pl-11 pr-11 h-12 bg-white/[0.04] border-white/15 text-white rounded-xl focus:border-[#D50032]"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowGoogleConfirmPassword(!showGoogleConfirmPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showGoogleConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    disabled={loading}
                    className="w-full h-12 text-base font-bold text-white bg-gradient-to-r from-[#D50032] to-[#b00029] rounded-xl shadow-lg"
                  >
                    {loading ? "Saving..." : "Save & Access Dashboard"}
                  </Button>
                </form>
              </div>
            )}

            {/* STEP 3: OTP VERIFICATION */}
            {step === "otp" && (
              <div className="space-y-6 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#D50032]/10 border border-[#D50032]/30 text-[#FF4D70] mb-2">
                  <ShieldCheck size={32} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Verify Your Identity</h2>
                  <p className="text-sm text-gray-400 mt-1">
                    Enter the 6-digit verification code sent to:
                  </p>
                  <div className="mt-3 flex flex-wrap justify-center gap-2">
                    {channels.includes("email") && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/5 border border-white/10 text-gray-200">
                        <Mail size={12} className="text-[#FF4D70]" /> {email}
                      </span>
                    )}
                    {channels.includes("sms") && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/5 border border-white/10 text-gray-200">
                        <Smartphone size={12} className="text-[#FF4D70]" /> Phone SMS
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
                  {loading ? "Verifying..." : "Verify & Continue"}
                </Button>

                <div className="flex items-center justify-between pt-2 text-xs">
                  <button
                    type="button"
                    onClick={() => { setStep("credentials"); setErrorMsg(""); setOtpCode(["", "", "", "", "", ""]); }}
                    className="text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
                  >
                    <ArrowLeft size={14} /> Change Email / Back
                  </button>
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={resending || countdown > 270}
                    className="font-bold text-[#FF4D70] hover:underline disabled:opacity-40"
                  >
                    {resending ? "Sending..." : "Resend OTP"}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: FORGOT PASSWORD EMAIL ENTRY */}
            {step === "forgot_email" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">Reset Your Password</h2>
                  <p className="text-sm text-gray-400 mt-1">
                    Enter your registered email address and we'll send you a 6-digit verification code.
                  </p>
                </div>

                {errorMsg && (
                  <div className="p-3.5 rounded-xl bg-[#D50032]/10 border border-[#D50032]/30 text-[#FF4D70] text-sm flex items-center gap-2">
                    <AlertCircle size={18} />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleForgotPasswordSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="forgot-email" className="text-xs font-semibold text-gray-300 uppercase">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <Input
                        id="forgot-email"
                        type="email"
                        placeholder="rahul.sharma@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-11 h-12 bg-white/[0.04] border-white/15 text-white rounded-xl focus:border-[#D50032]"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    disabled={loading}
                    className="w-full h-12 font-bold text-white bg-gradient-to-r from-[#D50032] to-[#b00029] rounded-xl shadow-lg"
                  >
                    {loading ? "Sending Code..." : "Send Verification Code"}
                  </Button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => { setStep("credentials"); setErrorMsg(""); setSuccessMsg(""); }}
                      className="text-xs text-gray-400 hover:text-white inline-flex items-center gap-1 transition-colors"
                    >
                      <ArrowLeft size={14} /> Back to Login
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* STEP 5: FORGOT PASSWORD RESET */}
            {step === "forgot_reset" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">Create New Password</h2>
                  <p className="text-sm text-gray-400 mt-1">
                    Enter the code sent to <strong className="text-white">{email}</strong> and set a new password.
                  </p>
                </div>

                {errorMsg && (
                  <div className="p-3.5 rounded-xl bg-[#D50032]/10 border border-[#D50032]/30 text-[#FF4D70] text-sm flex items-center gap-2">
                    <AlertCircle size={18} />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                  <div>
                    <Label className="text-xs font-semibold text-gray-300 uppercase block mb-2 text-center">
                      6-Digit Verification Code
                    </Label>
                    <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
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
                          className="w-10 h-12 text-center text-xl font-bold bg-white/[0.06] border border-white/15 rounded-xl text-white outline-none focus:border-[#D50032]"
                          style={{ borderColor: digit ? "#D50032" : "rgba(255,255,255,0.15)" }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-password" className="text-xs font-semibold text-gray-300 uppercase">
                      New Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <Input
                        id="new-password"
                        type={showNewPassword ? "text" : "password"}
                        placeholder="At least 8 characters"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="pl-11 pr-11 h-12 bg-white/[0.04] border-white/15 text-white rounded-xl focus:border-[#D50032]"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password" className="text-xs font-semibold text-gray-300 uppercase">
                      Confirm New Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <Input
                        id="confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-11 pr-11 h-12 bg-white/[0.04] border-white/15 text-white rounded-xl focus:border-[#D50032]"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    disabled={loading}
                    className="w-full h-12 font-bold text-white bg-gradient-to-r from-[#D50032] to-[#b00029] rounded-xl shadow-lg"
                  >
                    {loading ? "Resetting Password..." : "Reset Password & Login"}
                  </Button>

                  <div className="flex items-center justify-between pt-2 text-xs">
                    <button
                      type="button"
                      onClick={() => { setStep("forgot_email"); setErrorMsg(""); }}
                      className="text-gray-400 hover:text-white flex items-center gap-1"
                    >
                      <ArrowLeft size={14} /> Back
                    </button>
                    <button
                      type="button"
                      onClick={handleForgotPasswordSubmit}
                      disabled={countdown > 270}
                      className="font-bold text-[#FF4D70] hover:underline disabled:opacity-40"
                    >
                      Resend Code
                    </button>
                  </div>
                </form>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
