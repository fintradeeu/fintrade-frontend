import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useGoogleLogin } from "@react-oauth/google";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
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
      className="w-full text-white shadow-lg"
      style={{ background: "#121212", boxShadow: "0 0 20px rgba(18,18,18,0.18)" }}
      size="lg"
      disabled={loading}
      onClick={() => googleRegister()}
    >
      {loading ? "Signing in..." : "Sign up with Google"}
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
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "linear-gradient(135deg, #121212 0%, #2d2d2d 100%)" }}>
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#D50032] rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#D50032] rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-5xl relative z-10">
        <Link to="/login" className="inline-flex items-center gap-2 text-white hover:text-[#D50032] transition-colors mb-6">
          <ArrowLeft size={20} />
          <span>Back to Login</span>
        </Link>

        <Card className="p-8 bg-white shadow-2xl border-none">
          <div className="flex items-start justify-between gap-4 mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2" style={{ color: "#121212" }}>IB Self Registration</h2>
              <p className="text-gray-600">Create your Introducing Broker account and submit your documents for SuperAdmin review.</p>
            </div>
            <div className="hidden sm:flex items-center h-[44px] w-[140px] overflow-hidden">
              <img src={logo} alt="FinTrade" className="h-full w-full object-contain scale-[2.4]" />
            </div>
          </div>

          {errorMsg && <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">{errorMsg}</div>}
          {successMsg && <div className="mb-6 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm">{successMsg}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-[#121212] mb-3">Personal Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label htmlFor="ib_name">Full Name</Label><Input id="ib_name" value={form.full_name} onChange={(e) => updateForm("full_name", e.target.value)} className="mt-1 bg-gray-50" required /></div>
                <div><Label htmlFor="ib_email">Email Address</Label><Input id="ib_email" type="email" value={form.email} onChange={(e) => updateForm("email", e.target.value)} className="mt-1 bg-gray-50" required /></div>
                <div><Label htmlFor="ib_phone">Mobile Number</Label><Input id="ib_phone" type="tel" value={form.phone} onChange={(e) => updateForm("phone", e.target.value)} className="mt-1 bg-gray-50" required /></div>
                <div><Label htmlFor="ib_city">City</Label><Input id="ib_city" value={form.city} onChange={(e) => updateForm("city", e.target.value)} className="mt-1 bg-gray-50" required /></div>
                <div><Label htmlFor="ib_region">Region</Label><Input id="ib_region" value={form.region} onChange={(e) => updateForm("region", e.target.value)} placeholder="Gujarat / Mumbai / North India" className="mt-1 bg-gray-50" required /></div>
                <div><Label htmlFor="ib_photo">Profile Photo</Label><Input id="ib_photo" type="file" accept=".jpg,.jpeg,.png,.webp" onChange={(e) => setFiles((prev) => ({ ...prev, profile_photo: e.target.files?.[0] }))} className="mt-1 bg-gray-50" required /></div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-[#121212] mb-3">Login Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ib_password">Password</Label>
                  <div className="relative mt-1">
                    <Input id="ib_password" type={showPassword ? "text" : "password"} minLength={8} value={form.password} onChange={(e) => updateForm("password", e.target.value)} className="bg-gray-50 pr-12" required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900">
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
                <div><Label htmlFor="ib_confirm_password">Confirm Password</Label><Input id="ib_confirm_password" type={showPassword ? "text" : "password"} minLength={8} value={form.confirm_password} onChange={(e) => updateForm("confirm_password", e.target.value)} className="mt-1 bg-gray-50" required /></div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-[#121212] mb-3">KYC Documents</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label htmlFor="ib_aadhaar">Aadhaar Card</Label><Input id="ib_aadhaar" type="file" accept=".jpg,.jpeg,.png,.webp,.pdf" onChange={(e) => setFiles((prev) => ({ ...prev, aadhaar_card: e.target.files?.[0] }))} className="mt-1 bg-gray-50" required /></div>
                <div><Label htmlFor="ib_pan">PAN Card</Label><Input id="ib_pan" type="file" accept=".jpg,.jpeg,.png,.webp,.pdf" onChange={(e) => setFiles((prev) => ({ ...prev, pan_card: e.target.files?.[0] }))} className="mt-1 bg-gray-50" required /></div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-[#121212] mb-3">Bank Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label htmlFor="ib_holder">Account Holder Name</Label><Input id="ib_holder" value={form.bank_account_holder_name} onChange={(e) => updateForm("bank_account_holder_name", e.target.value)} className="mt-1 bg-gray-50" required /></div>
                <div><Label htmlFor="ib_bank">Bank Name</Label><Input id="ib_bank" value={form.bank_name} onChange={(e) => updateForm("bank_name", e.target.value)} className="mt-1 bg-gray-50" required /></div>
                <div><Label htmlFor="ib_account">Account Number</Label><Input id="ib_account" value={form.bank_account_number} onChange={(e) => updateForm("bank_account_number", e.target.value)} className="mt-1 bg-gray-50" required /></div>
                <div><Label htmlFor="ib_ifsc">IFSC Code</Label><Input id="ib_ifsc" value={form.bank_ifsc_code} onChange={(e) => updateForm("bank_ifsc_code", e.target.value.toUpperCase())} className="mt-1 bg-gray-50" required /></div>
                <div><Label htmlFor="ib_upi">UPI ID</Label><Input id="ib_upi" value={form.bank_upi_id} onChange={(e) => updateForm("bank_upi_id", e.target.value)} className="mt-1 bg-gray-50" /></div>
              </div>
            </div>

            <Button type="submit" className="w-full text-white shadow-lg" style={{ background: "#D50032", boxShadow: "0 0 20px rgba(213,0,50, 0.3)" }} size="lg" disabled={loading}>
              {loading ? "Creating IB Account..." : "Create IB Account"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  const isAffiliateRegister = window.location.hostname.toLowerCase().includes("affiliate.");
  if (isAffiliateRegister) {
    return <AffiliateIBRegisterForm />;
  }

  const initialRefCode = localStorage.getItem("distributor_code") || new URLSearchParams(window.location.search).get("ref") || "";
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
      const { access_token, user } = response.data;
      
      localStorage.setItem("token", access_token);
      localStorage.setItem("user", JSON.stringify(user));
      
      navigate("/");
    } catch (err: any) {
      let errorMessage = "Registration failed. Email might already exist.";
      if (err.response?.data?.detail) {
        if (Array.isArray(err.response.data.detail)) {
          errorMessage = err.response.data.detail.map((e: any) => e.msg).join(", ");
        } else if (typeof err.response.data.detail === 'string') {
          errorMessage = err.response.data.detail;
        }
      }
      setErrorMsg(errorMessage);
    } finally {
      setLoading(false);
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
            <div className="flex items-center h-[110px] w-[300px] overflow-hidden">
              <img
                src="/fintrade_logo_dark.png"
                alt="FinTrade"
                className="h-full w-full object-contain scale-[4.5] -translate-x-6 -translate-y-2"
                style={{
                  transformOrigin: "center center"
                }}
              />
            </div>
            <p className="text-gray-300">Professional Trading Education Platform</p>
          </div>
          <h2 className="text-3xl font-bold mb-4">Start Your Journey</h2>
          <p className="text-gray-300 text-lg leading-relaxed mb-6">
            Join the FinTrade community to master trading fundamentals and advanced strategies.
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

        {/* Right Side - Register Form */}
        <Card className="p-8 bg-white shadow-2xl border-none">
          <div className="lg:hidden mb-6 flex justify-between items-center">
            <Link to="/" className="inline-flex items-center gap-2 hover:text-[#D50032] transition-colors" style={{ color: '#121212' }}>
              <ArrowLeft size={20} />
              <span>Back to Home</span>
            </Link>
            <div className="flex items-center h-[30px] w-[100px] overflow-hidden">
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

          <h2 className="text-3xl font-bold mb-2" style={{ color: '#121212' }}>
            {referralCode && !leadCaptured ? "Share Your Details" : "Create an Account"}
          </h2>
          <p className="text-gray-600 mb-8">
            {referralCode && !leadCaptured
              ? "Fill this form first so your IB can guide your admission journey."
              : "Fill in your details to get started"}
          </p>

          {errorMsg && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
              {errorMsg}
            </div>
          )}

          <form onSubmit={referralCode && !leadCaptured ? handleReferralLeadSubmit : handleRegister} className="space-y-4">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                name="name"
                type="text"
                autoComplete="name"
                placeholder="Rahul Sharma"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1 bg-gray-50 border-gray-300 focus:border-[#D50032] focus:ring-[#D50032]"
                required
              />
            </div>

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
                className="mt-1 bg-gray-50 border-gray-300 focus:border-[#D50032] focus:ring-[#D50032]"
                required
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 bg-gray-50 border-gray-300 focus:border-[#D50032] focus:ring-[#D50032]"
                required
              />
            </div>

            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                name="city"
                type="text"
                autoComplete="address-level2"
                placeholder="Mumbai"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="mt-1 bg-gray-50 border-gray-300 focus:border-[#D50032] focus:ring-[#D50032]"
                required
              />
            </div>

            {(!referralCode || leadCaptured) && <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-gray-50 border-gray-300 focus:border-[#D50032] focus:ring-[#D50032] pr-12"
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
            </div>}

            <Button
              type="submit"
              className="w-full text-white shadow-lg mt-6"
              style={{ background: '#D50032', boxShadow: '0 0 20px rgba(213,0,50, 0.3)' }}
              size="lg"
              disabled={loading}
            >
              {loading ? (referralCode && !leadCaptured ? "Saving..." : "Registering...") : (referralCode && !leadCaptured ? "Continue to Registration" : "Sign Up")}
            </Button>
          </form>

          {isGoogleAuthConfigured && (!referralCode || leadCaptured) && (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              <GoogleRegisterButton
                loading={loading}
                onLoadingChange={setLoading}
                onError={setErrorMsg}
              />
            </>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link to="/login" className="hover:underline font-semibold" style={{ color: '#D50032' }}>
                Login here
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
