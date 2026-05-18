import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import logo from "../../imports/fintrade_logo.png";
import api from "../services/api";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", { email, password });
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
      setErrorMsg(err.response?.data?.detail || "Invalid credentials or login failed.");
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

        {/* Right Side - Login Form */}
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
                type="email"
                placeholder="rahul.sharma@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 bg-gray-50 border-gray-300 focus:border-[#D50032] focus:ring-[#D50032]"
                required
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-2">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
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
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-gray-300" />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <a href="#" className="text-sm hover:underline" style={{ color: '#D50032' }}>
                Forgot Password?
              </a>
            </div>

            <Button
              type="submit"
              className="w-full text-white shadow-lg"
              style={{ background: '#D50032', boxShadow: '0 0 20px rgba(213,0,50, 0.3)' }}
              size="lg"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>



          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link to="/register" className="hover:underline font-semibold" style={{ color: '#D50032' }}>
                Register here
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}