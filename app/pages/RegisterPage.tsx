import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import logo from "../../imports/fintrade_logo.png";
import api from "../services/api";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);
    
    try {
      const response = await api.post("/auth/register", {
        full_name: fullName,
        email,
        phone,
        password
      });
      const { access_token, user } = response.data;
      
      localStorage.setItem("token", access_token);
      localStorage.setItem("user", JSON.stringify(user));
      
      // Navigate to student dashboard since new registrations are students by default
      navigate("/student/dashboard");
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || "Registration failed. Email might already exist.");
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
          <div className="mb-8">
            <img src={logo} alt="FinTrade" className="h-16 mb-6" />
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
          <div className="lg:hidden mb-6">
            <Link to="/" className="inline-flex items-center gap-2 hover:text-[#D50032] transition-colors" style={{ color: '#121212' }}>
              <ArrowLeft size={20} />
              <span>Back to Home</span>
            </Link>
          </div>

          <h2 className="text-3xl font-bold mb-2" style={{ color: '#121212' }}>Create an Account</h2>
          <p className="text-gray-600 mb-8">Fill in your details to get started</p>

          {errorMsg && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
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
            </div>

            <Button
              type="submit"
              className="w-full text-white shadow-lg mt-6"
              style={{ background: '#D50032', boxShadow: '0 0 20px rgba(213,0,50, 0.3)' }}
              size="lg"
              disabled={loading}
            >
              {loading ? "Registering..." : "Sign Up"}
            </Button>
          </form>

          <div className="mt-8 text-center">
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
