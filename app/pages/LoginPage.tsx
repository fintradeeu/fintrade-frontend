import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Eye, EyeOff, ArrowLeft, ShieldCheck, Mail, Smartphone } from "lucide-react";
import logo from "../../imports/fintrade_logo.png";
import api from "../services/api";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

  // Step 1: Submit credentials
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", { email, password });
      // Check if backend bypassed OTP and returned a token directly
      if (response.data.access_token) {
        const { access_token, user } = response.data;
        localStorage.setItem("token", access_token);
        localStorage.setItem("user", JSON.stringify(user));

        const roles = user.roles || [];
        const isSuperAdmin = roles.some((r: any) => r.name === "super_admin");
        const isAdmin = roles.some((r: any) => r.name === "admin");
        const isFaculty = roles.some((r: any) => r.name === "faculty");
        const isDistributor = roles.some((r: any) => r.name === "distributor");

        if (isSuperAdmin || isAdmin) {
          navigate("/admin/dashboard");
        } else if (isFaculty) {
          navigate("/teacher/dashboard");
        } else if (isDistributor) {
          navigate("/distributor/dashboard");
        } else {
          navigate("/student/dashboard");
        }
        return;
      }

      // Normal user flow: OTP required (if enabled in backend)
      const { otp_token, expires_in_seconds, channels: ch } = response.data;

      setOtpToken(otp_token);
      setChannels(ch || []);
      setCountdown(expires_in_seconds || 300);
      setStep("otp");
      setOtpCode(["", "", "", "", "", ""]);

      // Auto-focus first OTP input
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || "Invalid credentials or login failed.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Submit OTP
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

      // Determine dashboard based on role
      const roles = user.roles || [];
      const isSuperAdmin = roles.some((r: any) => r.name === "super_admin");
      const isAdmin = roles.some((r: any) => r.name === "admin");
      const isFaculty = roles.some((r: any) => r.name === "faculty");
      const isDistributor = roles.some((r: any) => r.name === "distributor");

      if (isSuperAdmin || isAdmin) {
        navigate("/admin/dashboard");
      } else if (isFaculty) {
        navigate("/teacher/dashboard");
      } else if (isDistributor) {
        navigate("/distributor/dashboard");
      } else {
        navigate("/student/dashboard");
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || "Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
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

  // OTP input handlers
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only digits

    const newCode = [...otpCode];
    newCode[index] = value.slice(-1); // Take only last digit
    setOtpCode(newCode);

    // Auto-advance to next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits entered
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


  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #121212 0%, #2d2d2d 100%)' }}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#D50032] rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#D50032] rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center relative z-10">
        {/* Left Side - Branding */}
        <div className="hidden lg:block text-white">
          <Link to="/" className="inline-flex items-center gap-2 text-white hover:text-[#D50032] transition-colors mb-8">
            <ArrowLeft size={20} />
            <span>Back to Home</span>
          </Link>
          <div className="mb-8 flex flex-col gap-4">
            <div className="flex items-center h-[85px] w-[240px] pb-3 overflow-hidden">
              <img
                src={logo}
                alt="FinTrade"
                className="h-full w-full object-contain scale-[3.5] -translate-x-4 -translate-y-1.5"
                style={{
                  filter: "invert(1) hue-rotate(180deg) brightness(1.35) contrast(1.05) drop-shadow(0 4px 12px rgba(255,255,255,0.08))",
                  transformOrigin: "center center"
                }}
              />
            </div>
            <p className="text-gray-300">Professional Trading Education Platform</p>
          </div>
          <h2 className="text-3xl font-bold mb-4">Welcome Back</h2>
          <p className="text-gray-300 text-lg leading-relaxed mb-6">
            Access your personalized dashboard to continue your trading education journey. Track your
            progress, attend live lectures, and practice on our advanced simulator.
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: '#D50032' }}>
                <span className="text-white text-xs">✓</span>
              </div>
              <span>Real-time market simulations</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: '#D50032' }}>
                <span className="text-white text-xs">✓</span>
              </div>
              <span>Expert mentor support</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: '#D50032' }}>
                <span className="text-white text-xs">✓</span>
              </div>
              <span>AI-powered learning assistance</span>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form / OTP Form */}
        <Card className="p-8 bg-white shadow-2xl border-none">
          <div className="lg:hidden mb-6 flex justify-between items-center">
            <Link to="/" className="inline-flex items-center gap-2 hover:text-[#D50032] transition-colors" style={{ color: '#121212' }}>
              <ArrowLeft size={20} />
              <span>Back to Home</span>
            </Link>
            <div className="flex items-center h-[45px] w-[140px] overflow-hidden">
              <img
                src={logo}
                alt="FinTrade"
                className="h-full w-full object-contain scale-[2.5] -translate-x-1"
                style={{
                  filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.08))",
                  transformOrigin: "center center"
                }}
              />
            </div>
          </div>

          {step === "credentials" ? (
            /* ── STEP 1: Email + Password ─────────────────────────── */
            <>
              <h2 className="text-3xl font-bold mb-2" style={{ color: '#121212' }}>Login to Your Account</h2>
              <p className="text-gray-600 mb-8">Enter your credentials to access your dashboard</p>

              {errorMsg && (
                <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
                  {errorMsg}
                </div>
              )}


              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="rahul.sharma@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-2 bg-gray-50 border-gray-300 focus:border-[#E53935] focus:ring-[#E53935]"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="password">Password</Label>
                  <div className="relative mt-2">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-gray-50 border-gray-300 focus:border-[#E53935] focus:ring-[#E53935] pr-12"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded border-gray-300" />
                    <span className="text-sm text-gray-600">Remember me</span>
                  </label>
                  <a href="#" className="text-sm hover:underline" style={{ color: '#E53935' }}>
                    Forgot Password?
                  </a>
                </div>

                <Button
                  type="submit"
                  className="w-full text-white shadow-lg"
                  style={{ background: '#E53935', boxShadow: '0 0 20px rgba(229, 57, 53, 0.3)' }}
                  size="lg"
                  disabled={loading}

                >
                  {loading ? "Verifying..." : "Login"}
                </Button>
              </form>

              <div className="mt-8 text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{" "}
                  <Link to="/register" className="hover:underline font-semibold" style={{ color: '#E53935' }}>
                    Register here
                  </Link>
                </p>
              </div>
            </>
          ) : (
            /* ── STEP 2: OTP Verification ─────────────────────────── */
            <>
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ background: 'rgba(229, 57, 53, 0.1)' }}>
                  <ShieldCheck className="h-8 w-8" style={{ color: '#E53935' }} />
                </div>
                <h2 className="text-2xl font-bold mb-2" style={{ color: '#121212' }}>Verify Your Identity</h2>
                <p className="text-gray-600 text-sm">
                  We've sent a 6-digit verification code to:
                </p>
                <div className="mt-3 space-y-1">
                  {channels.includes("email") && (
                    <div className="inline-flex items-center gap-2 text-sm text-gray-700 bg-gray-50 px-3 py-1.5 rounded-full">
                      <Mail size={14} style={{ color: '#E53935' }} />
                      <span>{email}</span>
                    </div>
                  )}
                  {channels.includes("sms") && (
                    <div className="inline-flex items-center gap-2 text-sm text-gray-700 bg-gray-50 px-3 py-1.5 rounded-full ml-2">
                      <Smartphone size={14} style={{ color: '#E53935' }} />
                      <span>Phone</span>
                    </div>
                  )}
                </div>
              </div>

              {errorMsg && (
                <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm text-center">
                  {errorMsg}
                </div>
              )}

              {/* OTP Input */}
              <div className="flex justify-center gap-3 mb-6" onPaste={handleOtpPaste}>
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
                    className="w-12 h-14 text-center text-2xl font-bold border-2 rounded-xl transition-all duration-200 outline-none"
                    style={{
                      borderColor: digit ? '#E53935' : '#e5e7eb',
                      background: digit ? 'rgba(229,57,53,0.04)' : '#f9fafb',
                      color: '#121212',
                    }}
                    onFocus={(e) => { e.target.style.borderColor = '#E53935'; e.target.style.boxShadow = '0 0 0 3px rgba(229,57,53,0.1)'; }}
                    onBlur={(e) => { if (!digit) { e.target.style.borderColor = '#e5e7eb'; } e.target.style.boxShadow = 'none'; }}
                  />
                ))}
              </div>

              {/* Timer */}
              <div className="text-center mb-6">
                {countdown > 0 ? (
                  <p className="text-sm text-gray-500">
                    Code expires in <span className="font-semibold" style={{ color: '#E53935' }}>{formatTime(countdown)}</span>
                  </p>
                ) : (
                  <p className="text-sm text-red-500 font-medium">Code expired. Please request a new one.</p>
                )}
              </div>

              {/* Verify Button */}
              <Button
                onClick={() => handleVerifyOTP()}
                className="w-full text-white shadow-lg mb-4"
                style={{ background: '#E53935', boxShadow: '0 0 20px rgba(229, 57, 53, 0.3)' }}
                size="lg"
                disabled={loading || otpCode.join("").length !== 6}
              >
                {loading ? "Verifying..." : "Verify & Login"}
              </Button>

              {/* Resend / Back */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => { setStep("credentials"); setErrorMsg(""); setOtpCode(["", "", "", "", "", ""]); }}
                  className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1 transition-colors"
                >
                  <ArrowLeft size={14} /> Back
                </button>
                <button
                  onClick={handleResendOTP}
                  disabled={resending || countdown > 270}
                  className="text-sm font-medium hover:underline transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ color: '#E53935' }}
                >
                  {resending ? "Sending..." : "Resend Code"}
                </button>
              </div>

            </>
          )}

        </Card>
      </div>
    </div>
  );
}
