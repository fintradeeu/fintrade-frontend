import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { Play, TrendingUp, Award, Users, BookOpen, LineChart, Video, CheckCircle, Star, ArrowRight, BarChart3, Brain, Target, Trophy, X, FileText } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import TickerStrip from "../components/TickerStrip";
import logo from "../../imports/fintrade_logo.png";

// Interactive Cursor Glow
function CursorGlow() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        left: mousePos.x,
        top: mousePos.y,
        width: 150,
        height: 150,
        borderRadius: "50%",
        background: "rgba(229, 57, 53, 0.15)",
        filter: "blur(40px)",
        pointerEvents: "none",
        zIndex: 40, // Above ambient glows but below text/content buttons
        transform: "translate(-50%, -50%)",
        transition: "left 0.1s ease-out, top 0.1s ease-out",
      }}
    />
  );
}

// Dynamic "Popping" Ambient Glow
function AmbientGlow() {
  const [blobs, setBlobs] = useState<{ id: number; x: number; y: number; size: number }[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const id = Date.now();
      const newBlob = {
        id,
        x: Math.random() * 100,
        y: Math.random() * 80 + 10, // Avoid extreme edges
        size: Math.random() * 400 + 300,
      };

      setBlobs((prev) => [...prev, newBlob]);

      // Remove blob after 5 seconds
      setTimeout(() => {
        setBlobs((prev) => prev.filter((b) => b.id !== id));
      }, 5000);
    }, 1800); // Shorter interval (1.8s) for more activity

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 5, overflow: "hidden" }}>
      {/* Increased base glows for better visibility */}
      <div style={{
        position: "absolute", top: "5%", left: "-10%", width: 800, height: 800,
        borderRadius: "50%", background: "#E53935", filter: "blur(140px)",
        opacity: 0.12, animation: "glow-slow-drift 35s linear infinite"
      }} />
      <div style={{
        position: "absolute", top: "40%", right: "-15%", width: 900, height: 900,
        borderRadius: "50%", background: "#E53935", filter: "blur(150px)",
        opacity: 0.1, animation: "glow-slow-drift 45s linear infinite reverse"
      }} />
      <div style={{
        position: "absolute", bottom: "-10%", left: "30%", width: 700, height: 700,
        borderRadius: "50%", background: "#E53935", filter: "blur(130px)",
        opacity: 0.08, animation: "glow-slow-drift 40s linear infinite"
      }} />

      {/* Dynamic Popping Blobs (Boosted Opacity) */}
      {blobs.map((blob) => (
        <div
          key={blob.id}
          style={{
            position: "absolute",
            left: `${blob.x}%`,
            top: `${blob.y}%`,
            width: blob.size,
            height: blob.size,
            borderRadius: "50%",
            background: "#E53935",
            filter: "blur(120px)",
            opacity: 0,
            transform: "translate(-50%, -50%)",
            animation: "glow-pop-in-out 5s ease-in-out forwards",
          }}
        />
      ))}

      <style>{`
        @keyframes glow-slow-drift {
          0% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(80px, 40px) scale(1.1); }
          66% { transform: translate(-40px, 80px) scale(0.9); }
          100% { transform: translate(0, 0) scale(1); }
        }
        @keyframes glow-pop-in-out {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.6); }
          20% { opacity: 0.18; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.22; transform: translate(-50%, -50%) scale(1.1); }
          80% { opacity: 0.15; transform: translate(-50%, -50%) scale(1.2); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(1.4); }
        }
      `}</style>
    </div>
  );
}

// Video modal component
function VideoModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.85)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl mx-4 rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <X className="h-5 w-5" />
        </button>
        <div className="aspect-video bg-gray-900 flex items-center justify-center">
          <div className="text-center text-white">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: "rgba(229,57,53,0.2)", border: "2px solid #E53935" }}
            >
              <Play className="h-10 w-10 text-white ml-1" />
            </div>
            <p className="text-xl font-semibold mb-2">FinTrade Story</p>
            <p className="text-gray-400 text-sm">Your video/commercial will play here</p>
            <p className="text-gray-500 text-xs mt-2">Upload your video file to replace this placeholder</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MarketingHome() {
  const [videoOpen, setVideoOpen] = useState(false);
  const [activeVideoIdx, setActiveVideoIdx] = useState<number | null>(null);

  const showcaseVideos = [
    {
      title: "FinTrade Student Story",
      subtitle: "From Zero to Prop Trader in 9 Months",
      duration: "3:24",
      thumbnail: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
    },
    {
      title: "Trading Simulator Walkthrough",
      subtitle: "Experience Real Markets, Zero Risk",
      duration: "2:10",
      thumbnail: "https://images.unsplash.com/photo-1612178991541-b48cc8e92a4d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
    },
    {
      title: "What Our Alumni Say",
      subtitle: "Hear from Placed Traders",
      duration: "4:55",
      thumbnail: "https://images.unsplash.com/photo-1659353221405-29b7d087f9e5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
    },
  ];

  const marketNewsItems = [
    { headline: "NIFTY touches 52-week high on strong FII buying", source: "Economic Times", time: "2h ago", tag: "NIFTY" },
    { headline: "RBI holds repo rate at 6.5% for 7th consecutive meeting", source: "Mint", time: "5h ago", tag: "RBI" },
    { headline: "FII net buyers at ₹2,840 Cr; DII adds ₹1,120 Cr", source: "MoneyControl", time: "6h ago", tag: "FII/DII" },
    { headline: "Bank NIFTY surges 1.1% led by HDFC, ICICI Bank", source: "LiveMint", time: "8h ago", tag: "BANKING" },
    { headline: "Gold prices inch higher on global uncertainty", source: "Business Standard", time: "10h ago", tag: "GOLD" },
    { headline: "IT stocks rally; Infosys, TCS lead gains on strong Q4 outlook", source: "NDTV Profit", time: "12h ago", tag: "IT" },
  ];

  return (
    <div className="min-h-screen" style={{ 
      background: "radial-gradient(circle at 50% 50%, #FFFFFF 0%, #F8F8F8 50%, #F4F4F4 100%)",
      position: "relative" 
    }}>
      {/* Ambient Red Glow Blobs (Higher Z-Index but behind content) */}
      <AmbientGlow />
      <CursorGlow />

      {/* Video Modal */}
      {videoOpen && <VideoModal onClose={() => setVideoOpen(false)} />}
      {activeVideoIdx !== null && <VideoModal onClose={() => setActiveVideoIdx(null)} />}

      {/* Navbar */}
      <nav className="sticky top-0 z-[100] bg-white border-b border-gray-200 shadow-sm backdrop-blur-md bg-white/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex-shrink-0 overflow-hidden" style={{ height: 60, width: 220 }}>
              <Link to="/" className="flex items-center h-full w-full">
                <img 
                  src={logo} 
                  alt="FinTrade" 
                  className="h-full w-full object-contain" 
                  style={{ 
                    filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.08))",
                    transform: "scale(3.5) translateY(-4px)", // Shifted up to hide subtitle artifacts
                    transformOrigin: "center center"
                  }}
                />
              </Link>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#courses" className="text-gray-700 hover:text-[#E53935] transition-colors font-medium">Courses</a>
              <a href="#markets" className="text-gray-700 hover:text-[#E53935] transition-colors font-medium">Markets</a>
              <a href="#market-updates" className="text-gray-700 hover:text-[#E53935] transition-colors font-medium">Market Updates</a>
              <a href="#about" className="text-gray-700 hover:text-[#E53935] transition-colors font-medium">About</a>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/login">
                <Button variant="ghost" className="text-gray-700 hover:text-[#E53935] hover:bg-red-50" size="lg">Login</Button>
              </Link>
              <Link to="/student/contract-kyc">
                <Button
                  variant="outline"
                  className="border-2 border-[#E53935] text-[#E53935] hover:bg-red-50 hidden lg:flex"
                  size="lg"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  View Contract & KYC Demo
                </Button>
              </Link>
              <Link to="/student/entrance-exam">
                <Button
                  className="shadow-md hover:shadow-xl transition-all hover:scale-105"
                  style={{ background: "linear-gradient(135deg, #E53935 0%, #b71c1c 100%)", color: "white", boxShadow: "0 4px 20px rgba(229, 57, 53, 0.4)" }}
                  size="lg"
                >
                  Start Learning
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Ticker Strip - Now Sticky below Navbar */}
      <div className="sticky top-20 z-[90]">
        <TickerStrip />
      </div>

      <div className="relative z-[50]">

        {/* Hero Section (Soft gradient background) */}
        <section className="relative py-24 md:py-32 overflow-hidden" style={{ background: "radial-gradient(circle at 80% 20%, rgba(255,255,255,0.8) 0%, transparent 100%)" }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
          <div className="grid md:grid-cols-2 gap-20 items-center">
            {/* Left Content */}
            <div className="relative z-10">
              <div className="inline-block px-4 py-2 rounded-full mb-6 border border-[#E53935]/30" style={{ background: "rgba(229, 57, 53, 0.08)" }}>
                <span className="text-[#E53935] font-medium">🎯 India's Premier Trading Education</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-[1.1] uppercase tracking-tight" style={{ color: "#121212" }}>
                India&apos;s Trading <br />
                <span className="bg-gradient-to-r from-[#E53935] via-[#ff6f60] to-[#E53935] bg-clip-text text-transparent">
                  Powerhouse
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 mb-10 leading-relaxed font-medium">
                We are not building another trading course company. <br className="hidden md:block" />
                We are building <span className="text-[#E53935]">India's first Trader-to-Funded Professional Pipeline</span> — where every student has a pathway to professional capital.
              </p>
              <div className="flex flex-wrap gap-4">
                <a href="#courses">
                  <Button
                    size="lg"
                    className="shadow-xl hover:shadow-2xl transition-all hover:scale-105 text-lg px-8 py-6"
                    style={{ background: "linear-gradient(135deg, #E53935 0%, #b71c1c 100%)", color: "white", boxShadow: "0 10px 40px rgba(229, 57, 53, 0.4)" }}
                  >
                    Explore Courses
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </a>
                <Link to="/student/entrance-exam">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-2 border-[#E53935] text-[#E53935] hover:bg-red-50 text-lg px-8 py-6"
                  >
                    Start Entrance Exam
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right - Video Card */}
            <div className="relative">
              <div
                className="absolute -inset-4 rounded-2xl"
                style={{ background: "linear-gradient(135deg, rgba(229,57,53,0.08) 0%, rgba(229,57,53,0.03) 100%)", filter: "blur(20px)" }}
              />
              <Card
                className="relative overflow-hidden shadow-2xl border border-gray-200 cursor-pointer group"
                style={{ boxShadow: "0 20px 60px rgba(229, 57, 53, 0.12), 0 4px 20px rgba(0,0,0,0.08)" }}
                onClick={() => setVideoOpen(true)}
              >
                {/* Thumbnail */}
                <div className="relative h-64 overflow-hidden bg-gray-900">
                  <img
                    src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=900"
                    alt="FinTrade Story"
                    className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.3)" }}>
                    <div
                      className="w-20 h-20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-2xl"
                      style={{ background: "#E53935", boxShadow: "0 0 40px rgba(229,57,53,0.6)" }}
                    >
                      <Play className="h-9 w-9 text-white ml-1" />
                    </div>
                  </div>
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold text-white animate-pulse" style={{ background: "#E53935" }}>
                    ● WATCH
                  </div>
                  <div className="absolute bottom-3 right-3 px-2 py-1 rounded bg-black/70 text-white text-xs font-medium">
                    3:24
                  </div>
                </div>
                {/* Card Info */}
                <div className="p-5 bg-white">
                  <h3 className="font-bold text-lg mb-1" style={{ color: "#121212" }}>Watch: The FinTrade Story</h3>
                  <p className="text-gray-500 text-sm">See how we train India's most disciplined traders</p>
                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Users className="h-3 w-3" style={{ color: "#E53935" }} /> 1,200+ students
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Star className="h-3 w-3 fill-current" style={{ color: "#E53935" }} /> 4.9 rating
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Award className="h-3 w-3" style={{ color: "#E53935" }} /> Certified
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Trust / Stats Section */}
      <section className="py-16 bg-white relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 text-center border-2 border-gray-100 hover:border-[#E53935] transition-all shadow-sm hover:shadow-lg">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ background: "rgba(229, 57, 53, 0.1)" }}>
                <Users className="h-8 w-8" style={{ color: "#E53935" }} />
              </div>
              <div className="text-4xl font-bold mb-2" style={{ color: "#121212" }}>1200+</div>
              <div className="text-gray-600">Active Students</div>
            </Card>
            <Card className="p-8 text-center border-2 border-gray-100 hover:border-[#E53935] transition-all shadow-sm hover:shadow-lg">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ background: "rgba(229, 57, 53, 0.1)" }}>
                <Award className="h-8 w-8" style={{ color: "#E53935" }} />
              </div>
              <div className="text-4xl font-bold mb-2" style={{ color: "#121212" }}>78%</div>
              <div className="text-gray-600">Completion Rate</div>
            </Card>
            <Card className="p-8 text-center border-2 border-gray-100 hover:border-[#E53935] transition-all shadow-sm hover:shadow-lg">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ background: "rgba(229, 57, 53, 0.1)" }}>
                <Target className="h-8 w-8" style={{ color: "#E53935" }} />
              </div>
              <div className="text-4xl font-bold mb-2" style={{ color: "#121212" }}>15+</div>
              <div className="text-gray-600">Cities (Mumbai, Ahmedabad, Bengaluru)</div>
            </Card>
          </div>
        </div>
      </section>

      {/* ===== PLACEMENTS SECTION (moved up) ===== */}
      <section id="markets" className="py-20 relative z-10" style={{ background: "linear-gradient(135deg, #121212 0%, #1a1a1a 100%)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-block px-4 py-2 rounded-full mb-4 border border-[#E53935]/40" style={{ background: "rgba(229,57,53,0.1)" }}>
              <span className="text-[#E53935] font-semibold text-sm">🏆 Placement Highlights</span>
            </div>
            <h2 className="text-4xl font-bold mb-4 text-white">Our Students Get Placed</h2>
            <p className="text-xl text-gray-400">Top performers join India's leading prop trading firms</p>
          </div>
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            {[
              { stat: "₹8-12 LPA", label: "Average Starting Package", icon: TrendingUp },
              { stat: "85%", label: "Placement Rate (Top Batch)", icon: Award },
              { stat: "30+", label: "Partner Trading Firms", icon: Users },
              { stat: "9 Months", label: "Average Time to Placement", icon: Trophy },
            ].map((item, i) => (
              <Card key={i} className="p-6 text-center border border-[#E53935]/20" style={{ background: "rgba(255,255,255,0.05)" }}>
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-4" style={{ background: "rgba(229,57,53,0.15)" }}>
                  <item.icon className="h-7 w-7" style={{ color: "#E53935" }} />
                </div>
                <div className="text-3xl font-bold text-white mb-1">{item.stat}</div>
                <div className="text-gray-400 text-sm">{item.label}</div>
              </Card>
            ))}
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Rahul Sharma", role: "Junior Trader", firm: "Nuvama Wealth", city: "Mumbai", package: "₹10 LPA", img: "https://images.unsplash.com/photo-1659353221405-29b7d087f9e5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200" },
              { name: "Priya Verma", role: "Equity Analyst", firm: "Zerodha Capital", city: "Bengaluru", package: "₹9.5 LPA", img: "https://images.unsplash.com/photo-1659353221405-29b7d087f9e5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200" },
              { name: "Amit Patel", role: "Options Trader", firm: "SAMCO Securities", city: "Ahmedabad", package: "₹11 LPA", img: "https://images.unsplash.com/photo-1659353221405-29b7d087f9e5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200" },
            ].map((p, i) => (
              <Card key={i} className="p-6 border border-[#E53935]/20 hover:border-[#E53935]/50 transition-all" style={{ background: "rgba(255,255,255,0.06)" }}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full overflow-hidden border-2" style={{ borderColor: "#E53935" }}>
                    <img src={p.img} alt={p.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="font-bold text-white">{p.name}</div>
                    <div className="text-gray-400 text-sm">{p.role}</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Firm</span>
                    <span className="text-white font-medium">{p.firm}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Location</span>
                    <span className="text-white">{p.city}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Package</span>
                    <span className="font-bold" style={{ color: "#E53935" }}>{p.package}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses Section (Subtle Warm Section) */}
      <section id="courses" className="py-24 relative z-10" style={{ background: "linear-gradient(to bottom, transparent, rgba(229, 57, 53, 0.02), transparent)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4" style={{ color: "#121212" }}>Featured Courses</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Master trading with our structured curriculum designed for all skill levels
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: "Basic Trading", level: "Beginner", duration: "3 months", price: "₹25,000", description: "Foundation of markets, technical analysis, and risk management", icon: BookOpen },
              { name: "Intermediate Trading", level: "Intermediate", duration: "3 months", price: "₹35,000", description: "Advanced chart patterns, indicators, and trading psychology", icon: LineChart },
              { name: "Advanced Trading", level: "Advanced", duration: "3 months", price: "₹45,000", description: "Options, futures, derivatives, and portfolio management", icon: BarChart3 },
              { name: "Master Trading", level: "Expert", duration: "3 months", price: "₹55,000", description: "Algorithmic trading, quantitative analysis, and institutional strategies", icon: Trophy },
            ].map((course, i) => (
              <Card key={i} className="group hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-gray-100 hover:border-[#E53935]">
                <div className="h-2 w-full" style={{ background: "#E53935" }} />
                <div className="p-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4" style={{ background: "rgba(229, 57, 53, 0.1)" }}>
                    <course.icon className="h-6 w-6" style={{ color: "#E53935" }} />
                  </div>
                  <h3 className="text-xl font-bold mb-2" style={{ color: "#121212" }}>{course.name}</h3>
                  <div className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-3" style={{ background: "rgba(229, 57, 53, 0.1)", color: "#E53935" }}>
                    {course.level}
                  </div>
                  <p className="text-gray-600 text-sm mb-4 min-h-[60px]">{course.description}</p>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4" style={{ color: "#E53935" }} />
                      Duration: {course.duration}
                    </div>
                    <div className="flex items-center gap-2 text-sm font-bold" style={{ color: "#121212" }}>
                      <CheckCircle className="h-4 w-4" style={{ color: "#E53935" }} />
                      {course.price}
                    </div>
                  </div>
                  <Link to="/student/courses">
                    <Button className="w-full group-hover:shadow-lg transition-all" style={{ background: "#E53935", color: "white" }}>
                      View Course
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Learning Journey Section */}
      <section className="py-20 bg-transparent relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4" style={{ color: "#121212" }}>Your Learning Journey</h2>
            <p className="text-xl text-gray-600">From beginner to professional trader in 5 structured steps</p>
          </div>
          <div className="relative">
            <div className="hidden md:block">
              <div className="absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2" style={{ background: "linear-gradient(to right, #E53935, #121212)" }} />
              <div className="grid grid-cols-5 gap-4 relative">
                {[
                  { title: "Entrance Exam", desc: "Test your baseline knowledge", icon: CheckCircle },
                  { title: "Course Learning", desc: "Structured curriculum & modules", icon: BookOpen },
                  { title: "Monthly Exams", desc: "Track your progress", icon: Award },
                  { title: "Trading Simulator", desc: "Practice with virtual capital", icon: LineChart },
                  { title: "Placement", desc: "Join trading firms", icon: Trophy },
                ].map((step, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4 relative z-10 border-4 border-white shadow-lg" style={{ background: i <= 2 ? "#E53935" : "#121212" }}>
                      <step.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="font-bold text-center mb-2" style={{ color: "#121212" }}>{step.title}</h3>
                    <p className="text-sm text-gray-600 text-center">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="md:hidden space-y-6">
              {[
                { title: "Entrance Exam", desc: "Test your baseline knowledge", icon: CheckCircle },
                { title: "Course Learning", desc: "Structured curriculum & modules", icon: BookOpen },
                { title: "Monthly Exams", desc: "Track your progress", icon: Award },
                { title: "Trading Simulator", desc: "Practice with virtual capital", icon: LineChart },
                { title: "Placement", desc: "Join trading firms", icon: Trophy },
              ].map((step, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: i <= 2 ? "#E53935" : "#121212" }}>
                    <step.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-1" style={{ color: "#121212" }}>{step.title}</h3>
                    <p className="text-sm text-gray-600">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Live Classes Section (Off-white contrast) */}
      <section className="py-24 relative z-10" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(248,248,248,0.4) 100%)", backdropFilter: "blur(2px)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4" style={{ color: "#121212" }}>Live Classes</h2>
            <p className="text-xl text-gray-600">Learn from expert traders in real-time</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: "Technical Analysis Masterclass", instructor: "Amit Desai", date: "April 18, 2026", time: "10:00 AM IST", students: 145 },
              { title: "Options Trading Strategies", instructor: "Priya Sharma", date: "April 19, 2026", time: "2:00 PM IST", students: 132 },
              { title: "Risk Management Fundamentals", instructor: "Rajesh Kumar", date: "April 20, 2026", time: "4:00 PM IST", students: 178 },
            ].map((lecture, i) => (
              <Card key={i} className="overflow-hidden border-2 border-gray-100 hover:border-[#E53935] transition-all hover:shadow-xl">
                <div className="relative h-48 bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
                  <div className="absolute inset-0 opacity-20">
                    <img src="https://images.unsplash.com/photo-1616587896649-79b16d8b173d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080" alt="Live class" className="w-full h-full object-cover" />
                  </div>
                  <div className="relative z-10">
                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white">
                      <Video className="h-8 w-8 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 px-2 py-1 rounded-full text-xs font-bold text-white animate-pulse" style={{ background: "#E53935" }}>LIVE</div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-lg mb-3" style={{ color: "#121212" }}>{lecture.title}</h3>
                  <div className="space-y-2 mb-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2"><Users className="h-4 w-4" style={{ color: "#E53935" }} />{lecture.instructor}</div>
                    <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4" style={{ color: "#E53935" }} />{lecture.date} • {lecture.time}</div>
                    <div className="flex items-center gap-2"><Star className="h-4 w-4" style={{ color: "#E53935" }} />{lecture.students} students enrolled</div>
                  </div>
                  <div className="flex gap-2">
                    <Link to="/student/lectures" className="flex-1">
                      <Button className="w-full" style={{ background: "#E53935", color: "white" }}>Join Live</Button>
                    </Link>
                    <Button variant="outline" className="border-2 border-gray-200 hover:border-[#E53935]">Details</Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ===== MARKET UPDATES (2-column) ===== */}
      <section id="market-updates" className="py-20 bg-transparent relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4" style={{ color: "#121212" }}>Market Updates</h2>
            <p className="text-xl text-gray-600">Stay updated with the latest market analysis and trading insights</p>
          </div>
          <div className="grid lg:grid-cols-5 gap-8">
            {/* Left: Video Cards (wider) */}
            <div className="lg:col-span-3">
              <h3 className="text-lg font-bold mb-5 flex items-center gap-2" style={{ color: "#121212" }}>
                <Video className="h-5 w-5" style={{ color: "#E53935" }} /> Video Analysis
              </h3>
              <div className="grid sm:grid-cols-2 gap-5">
                {[
                  { title: "NIFTY Market Analysis Today", source: "YouTube", views: "12K", thumbnail: "https://images.unsplash.com/photo-1612178991541-b48cc8e92a4d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600" },
                  { title: "Risk Management Strategies Explained", source: "Uploaded", views: "8.5K", thumbnail: "https://images.unsplash.com/photo-1612178991541-b48cc8e92a4d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600" },
                  { title: "Candlestick Patterns for Day Trading", source: "YouTube", views: "15K", thumbnail: "https://images.unsplash.com/photo-1612178991541-b48cc8e92a4d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600" },
                  { title: "Options Chain Analysis Tutorial", source: "YouTube", views: "9.2K", thumbnail: "https://images.unsplash.com/photo-1612178991541-b48cc8e92a4d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600" },
                ].map((news, i) => (
                  <Card key={i} className="overflow-hidden border-2 border-gray-100 hover:border-[#E53935] transition-all hover:shadow-xl group">
                    <div className="relative h-36 bg-gray-900 overflow-hidden">
                      <img src={news.thumbnail} alt={news.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "rgba(229, 57, 53, 0.9)" }}>
                          <Play className="h-6 w-6 text-white ml-0.5" />
                        </div>
                      </div>
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded text-xs font-medium bg-black/70 text-white">{news.source}</div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-sm mb-2 line-clamp-2" style={{ color: "#121212" }}>{news.title}</h3>
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <div className="flex items-center gap-1"><Video className="h-3 w-3" style={{ color: "#E53935" }} />{news.views} views</div>
                        <button className="font-medium hover:underline" style={{ color: "#E53935" }}>Watch</button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
            {/* Right: Text News (narrower) */}
            <div className="lg:col-span-2">
              <h3 className="text-lg font-bold mb-5 flex items-center gap-2" style={{ color: "#121212" }}>
                <FileText className="h-5 w-5" style={{ color: "#E53935" }} /> Latest Headlines
              </h3>
              <div className="space-y-4">
                {marketNewsItems.map((item, i) => (
                  <Card key={i} className="p-4 border-2 border-gray-100 hover:border-[#E53935] transition-all hover:shadow-md group cursor-pointer">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-2 h-2 rounded-full mt-1" style={{ background: "#E53935" }} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(229,57,53,0.1)", color: "#E53935" }}>{item.tag}</span>
                          <span className="text-xs text-gray-400">{item.time}</span>
                        </div>
                        <h4 className="font-semibold text-sm leading-snug group-hover:text-[#E53935] transition-colors" style={{ color: "#121212" }}>{item.headline}</h4>
                        <p className="text-xs text-gray-500 mt-1">{item.source}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== VIDEO SHOWCASE SECTION (Premium Dark/Glass Section) ===== */}
      <section className="py-24 relative z-10" style={{ background: "linear-gradient(to right, rgba(255,255,255,0.5), rgba(229, 57, 53, 0.03), rgba(255,255,255,0.5))" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-block px-4 py-2 rounded-full mb-4 border border-[#E53935]/30" style={{ background: "rgba(229,57,53,0.08)" }}>
              <span className="text-[#E53935] font-semibold text-sm">🎬 FinTrade in Action</span>
            </div>
            <h2 className="text-4xl font-bold mb-4" style={{ color: "#121212" }}>Our Stories, Your Inspiration</h2>
            <p className="text-xl text-gray-600">Short films, ads, and student journeys</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {showcaseVideos.map((vid, i) => (
              <Card
                key={i}
                className="overflow-hidden border-2 border-gray-100 hover:border-[#E53935] transition-all hover:shadow-2xl group cursor-pointer"
                onClick={() => setActiveVideoIdx(i)}
              >
                <div className="relative h-52 overflow-hidden bg-gray-900">
                  <img src={vid.thumbnail} alt={vid.title} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.35)" }}>
                    <div className="w-16 h-16 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl" style={{ background: "#E53935", boxShadow: "0 0 30px rgba(229,57,53,0.5)" }}>
                      <Play className="h-7 w-7 text-white ml-1" />
                    </div>
                  </div>
                  <div className="absolute bottom-3 right-3 px-2 py-1 rounded bg-black/70 text-white text-xs font-medium">{vid.duration}</div>
                </div>
                <div className="p-5 bg-white">
                  <h3 className="font-bold text-base mb-1" style={{ color: "#121212" }}>{vid.title}</h3>
                  <p className="text-sm text-gray-500">{vid.subtitle}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why FinTrade */}
      <section id="about" className="py-20 bg-transparent relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4" style={{ color: "#121212" }}>Why Choose FinTrade</h2>
            <p className="text-xl text-gray-600">Everything you need to become a successful trader</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Brain, title: "AI Tutor Support", description: "Get 24/7 assistance from our AI-powered trading assistant for doubts and guidance" },
              { icon: BookOpen, title: "Structured Curriculum", description: "Follow a proven learning path from basics to advanced strategies with expert content" },
              { icon: LineChart, title: "Real Trading Simulation", description: "Practice with ₹10 lakh virtual capital in realistic market conditions without risk" },
              { icon: Trophy, title: "Placement Opportunities", description: "Top performers get placed in leading prop trading firms and financial institutions" },
            ].map((feature, i) => (
              <Card key={i} className="p-8 text-center border-2 border-gray-100 hover:border-[#E53935] transition-all hover:shadow-xl group">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 group-hover:scale-110 transition-transform" style={{ background: "rgba(229, 57, 53, 0.1)" }}>
                  <feature.icon className="h-10 w-10" style={{ color: "#E53935" }} />
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ color: "#121212" }}>{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 relative z-10 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4" style={{ color: "#121212" }}>Student Success Stories</h2>
            <p className="text-xl text-gray-600">Hear from our successful traders</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: "Rahul Sharma", city: "Mumbai", testimonial: "FinTrade helped me become a disciplined trader. The structured approach and real trading simulator gave me confidence to trade professionally.", rating: 5 },
              { name: "Priya Verma", city: "Bengaluru", testimonial: "The AI tutor and live classes are game-changers. I went from zero knowledge to getting placed at a prop trading firm in just 9 months.", rating: 5 },
              { name: "Amit Patel", city: "Ahmedabad", testimonial: "Best investment I made in my career. The curriculum is comprehensive and the monthly exams keep you accountable. Highly recommend!", rating: 5 },
            ].map((testimonial, i) => (
              <Card key={i} className="p-6 border-2 border-gray-100 hover:border-[#E53935] transition-all hover:shadow-xl bg-white">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2" style={{ borderColor: "#E53935" }}>
                    <img src="https://images.unsplash.com/photo-1659353221405-29b7d087f9e5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200" alt={testimonial.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-bold" style={{ color: "#121212" }}>{testimonial.name}</h4>
                    <p className="text-sm text-gray-600">{testimonial.city}</p>
                  </div>
                </div>
                <div className="flex gap-1 mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (<Star key={i} className="h-4 w-4 fill-current" style={{ color: "#E53935" }} />))}
                </div>
                <p className="text-gray-700 italic">"{testimonial.testimonial}"</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 relative z-10" style={{ background: "linear-gradient(135deg, #E53935 0%, #b71c1c 100%)" }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Start Your Trading Journey Today</h2>
          <p className="text-xl text-white/90 mb-8">Join 1200+ students learning to trade professionally</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/student/entrance-exam">
              <Button size="lg" className="shadow-2xl hover:shadow-3xl transition-all text-lg px-8 py-6" style={{ background: "white", color: "#E53935", boxShadow: "0 0 40px rgba(255, 255, 255, 0.3)" }}>
                Start Entrance Exam
                <ArrowRight className="ml-2 h-6 w-6" />
              </Button>
            </Link>
            <Link to="/student/contract-kyc">
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8 py-6 border-2 hover:bg-white/10 transition-colors"
                style={{ background: "transparent", borderColor: "white", color: "white" }}
              >
                <FileText className="mr-2 h-5 w-5" />
                View Contract & KYC Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 relative z-10" style={{ background: "#121212", color: "white" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#about" className="hover:text-[#E53935] transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-[#E53935] transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-[#E53935] transition-colors">Press</a></li>
                <li><a href="#" className="hover:text-[#E53935] transition-colors">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Courses</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/student/courses" className="hover:text-[#E53935] transition-colors">Basic Trading</Link></li>
                <li><Link to="/student/courses" className="hover:text-[#E53935] transition-colors">Intermediate Trading</Link></li>
                <li><Link to="/student/courses" className="hover:text-[#E53935] transition-colors">Advanced Trading</Link></li>
                <li><Link to="/student/courses" className="hover:text-[#E53935] transition-colors">Master Trading</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#market-updates" className="hover:text-[#E53935] transition-colors">Market Updates</a></li>
                <li><Link to="/student/lectures" className="hover:text-[#E53935] transition-colors">Live Classes</Link></li>
                <li><Link to="/student/ai-tutor" className="hover:text-[#E53935] transition-colors">AI Tutor</Link></li>
                <li><a href="#" className="hover:text-[#E53935] transition-colors">Help Center</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4" style={{ color: "#E53935" }} />contact@fintrade.in</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4" style={{ color: "#E53935" }} />+91 98765 43210</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4" style={{ color: "#E53935" }} />Mumbai, India</li>
              </ul>
              <div className="flex gap-3 mt-4">
                {["𝕏", "in", "f"].map((s, i) => (
                  <a key={i} href="#" className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors" style={{ background: "rgba(229, 57, 53, 0.2)" }}>
                    <span className="text-white">{s}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>© 2026 FinTrade. All rights reserved. Learn to Earn with Discipline.</p>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
}