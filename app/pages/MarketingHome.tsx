import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Play, TrendingUp, Award, Users, BookOpen, LineChart, Video, CheckCircle, Star, ArrowRight, BarChart3, Brain, Target, Trophy, X, FileText, Search, Phone, Download, Instagram, Youtube, Linkedin, Twitter, Facebook, ChevronRight, ChevronDown } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../components/ui/input-otp";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion";
import TickerStrip from "../components/TickerStrip";
import ShareButton from "../components/ShareButton";
import StudentStats from "../components/home/StudentStats";
import VerticalVideoSection from "../components/home/VerticalVideoSection";
import ExpertProfile from "../components/home/ExpertProfile";
import EMIHighlight from "../components/home/EMIHighlight";
import KeyInsights from "../components/home/KeyInsights";
import CertificatePreview from "../components/home/CertificatePreview";
import PlatformFeatures from "../components/home/PlatformFeatures";
import ModuleRoadmap from "../components/home/ModuleRoadmap";
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

// Course Card Component to handle local state for Read More
function CourseCard({ course }: { course: any }) {
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [showFullTitle, setShowFullTitle] = useState(false);
  const MAX_DESC_LENGTH = 100;
  const MAX_TITLE_LENGTH = 45;

  return (
    <Card 
      className="w-full flex flex-col group transition-all duration-500 overflow-hidden rounded-2xl border border-gray-200 hover:border-[#E53935]/50 hover:shadow-2xl"
    >
      {/* Gradient Header */}
      <div className="relative px-6 pt-6 pb-4 min-h-[210px] flex flex-col justify-between" style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)" }}>
        <div>
          <div className="flex items-start justify-between mb-3">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)" }}>
              <course.icon className="h-7 w-7 text-white" />
            </div>
            <div className="px-3 py-1 rounded-full text-xs font-bold text-white border border-white/30" style={{ background: "rgba(255,255,255,0.1)" }}>
              {course.duration}
            </div>
          </div>
          <h3 className="text-lg font-bold text-white mb-1 leading-snug">
            {showFullTitle || course.name.length <= MAX_TITLE_LENGTH ? course.name : `${course.name.substring(0, MAX_TITLE_LENGTH)}...`}
            {course.name.length > MAX_TITLE_LENGTH && (
              <button onClick={(e) => { e.preventDefault(); setShowFullTitle(!showFullTitle); }} className="text-[#E53935] text-[10px] ml-1 hover:underline">
                {showFullTitle ? "Read Less" : "Read More"}
              </button>
            )}
          </h3>
        </div>
        <span className="text-white/70 text-xs font-medium uppercase tracking-widest block">{course.level} Program</span>
      </div>

      {/* Card Body */}
      <div className="flex flex-col flex-1 p-4 bg-white">
        <div className="text-gray-600 text-sm mb-4 leading-relaxed">
          <p>
            {showFullDesc || course.description.length <= MAX_DESC_LENGTH ? course.description : `${course.description.substring(0, MAX_DESC_LENGTH)}...`}
            {course.description.length > MAX_DESC_LENGTH && (
              <button onClick={(e) => { e.preventDefault(); setShowFullDesc(!showFullDesc); }} className="text-[#E53935] font-bold ml-1 hover:underline">
                {showFullDesc ? "Read Less" : "Read More"}
              </button>
            )}
          </p>
        </div>

        <div className="flex-1" />

        <div className="border-t border-gray-100 pt-5 mb-5">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-sm text-gray-400 line-through">{course.originalPrice}</div>
              <div className="text-3xl font-extrabold tracking-tight" style={{ color: "#121212" }}>
                {course.price}<span className="text-sm font-normal text-gray-500 ml-1">+ GST</span>
              </div>
            </div>
            <div className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: "rgba(76,175,80,0.1)", color: "#2e7d32" }}>
              Save {course.savings}
            </div>
          </div>
        </div>

        <Link to="/student/courses" className="block">
          <Button 
            className="w-full h-12 text-base font-semibold rounded-xl transition-all duration-300 group-hover:shadow-lg"
            style={{ background: "#121212", color: "white" }}
          >
            View Program Details
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>
    </Card>
  );
}

export default function MarketingHome() {
  const [videoOpen, setVideoOpen] = useState(false);
  const [activeVideoIdx, setActiveVideoIdx] = useState<number | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);

  // Brochure Download Flow State
  const [brochureOpen, setBrochureOpen] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [leadData, setLeadData] = useState({ name: "", email: "", contact: "", city: "" });

  const handleDownloadClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setBrochureOpen(true);
  };

  const sendOTP = () => {
    if (leadData.name && leadData.contact) {
      setOtpSent(true);
    }
  };

  const verifyAndDownload = () => {
    if (otp.length === 6) {
      alert("Verification successful! Your brochure download will start shortly.");
      setBrochureOpen(false);
      setOtpSent(false);
      setOtp("");
      // Trigger actual download logic here
    }
  };

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

      {/* Search Overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-[9998] flex items-start justify-center pt-32" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }} onClick={() => setSearchOpen(false)}>
          <div className="w-full max-w-2xl mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 p-4 border-b border-gray-100">
              <Search className="h-5 w-5 text-gray-400" />
              <input autoFocus type="text" placeholder="Search courses, topics, videos..." className="flex-1 text-lg outline-none bg-transparent" style={{ color: "#121212" }} />
              <button onClick={() => setSearchOpen(false)} className="text-gray-400 hover:text-gray-600 text-sm font-medium px-2 py-1 rounded bg-gray-100">ESC</button>
            </div>
            <div className="p-4 text-sm text-gray-500">
              <p className="font-medium mb-3" style={{ color: "#121212" }}>Popular Searches</p>
              <div className="flex flex-wrap gap-2">
                {["Technical Analysis", "Options Trading", "Risk Management", "NIFTY", "Candlestick Patterns", "Trading Psychology"].map((t) => (
                  <span key={t} className="px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer hover:bg-red-50 hover:text-[#E53935] transition-colors" style={{ background: "rgba(229,57,53,0.08)", color: "#E53935" }}>{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Utility Top Bar */}
      <div className="w-full z-[101] bg-[#121212] text-white" style={{ borderBottom: "1px solid rgba(229,57,53,0.2)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12 text-sm">
            <div className="flex items-center gap-4">
              <a href="tel:+919876543210" className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors">
                <Phone className="h-4 w-4" /> <span className="hidden sm:inline">+91 98765 43210</span><span className="sm:hidden">Call</span>
              </a>
              <span className="text-gray-600 hidden sm:inline">|</span>
              <span className="text-gray-400 hidden sm:inline">Support & Info</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {[
                  { icon: Instagram, href: "https://www.instagram.com/the.fintrade/", label: "Instagram" },
                  { icon: Facebook, href: "https://www.facebook.com/profile.php?id=61589528075521", label: "Facebook" },
                  { icon: Youtube, href: "https://www.youtube.com/@The_FinTrade", label: "YouTube" },
                  { icon: Linkedin, href: "https://www.linkedin.com/in/the-fintrade-7230b040a/", label: "LinkedIn" },
                  { icon: X, href: "#", label: "X" },
                ].map((s) => (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded flex items-center justify-center text-gray-400 hover:text-[#E53935] transition-colors" title={s.label}>
                    <s.icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
              <span className="text-gray-600">|</span>
              <a href="#" className="flex items-center gap-2 text-gray-300 hover:text-[#E53935] transition-colors font-medium">
                <Download className="h-4 w-4" /> Download App
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Navbar */}
      <nav className="sticky top-0 z-[100] bg-white/90 border-b border-gray-100 shadow-[0_4px_30px_rgba(0,0,0,0.05)] backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex-shrink-0 flex items-center h-[50px] w-[140px] md:h-[60px] md:w-[220px]">
              <Link to="/" className="flex items-center justify-center h-full w-full overflow-hidden">
                <img 
                  src={logo} 
                  alt="FinTrade" 
                  className="h-full w-full object-contain scale-[2.5] md:scale-[3.5] -translate-y-1 md:-translate-y-1.5" 
                  style={{ 
                    filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.08))",
                    transformOrigin: "center center"
                  }}
                />
              </Link>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#courses" className="text-gray-700 hover:text-[#E53935] transition-colors font-medium">Courses</a>
              <a href="#markets" className="text-gray-700 hover:text-[#E53935] transition-colors font-medium">Markets</a>
              <a href="#" className="text-gray-700 hover:text-[#E53935] transition-colors font-medium">Categories</a>
              <a href="#market-updates" className="text-gray-700 hover:text-[#E53935] transition-colors font-medium">Update</a>
              <a href="#" className="text-gray-700 hover:text-[#E53935] transition-colors font-medium">Blog</a>
              <a href="#about" className="text-gray-700 hover:text-[#E53935] transition-colors font-medium">About</a>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setSearchOpen(true)} className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-gray-600 hover:text-[#E53935] hover:bg-red-50 transition-all" title="Search">
                <Search className="h-4 w-4 md:h-5 md:w-5" />
              </button>
              <Link to="/login" className="hidden sm:block">
                <Button variant="ghost" className="text-gray-700 hover:text-[#E53935] hover:bg-red-50" size="lg">Login</Button>
              </Link>
              <Link to="/student/entrance-exam">
                <Button
                  className="shadow-md hover:shadow-xl transition-all hover:scale-105 h-9 px-4 md:h-11 md:px-8"
                  style={{ background: "linear-gradient(135deg, #E53935 0%, #b71c1c 100%)", color: "white", boxShadow: "0 4px 20px rgba(229, 57, 53, 0.4)" }}
                >
                  <span className="sm:hidden text-xs">Start</span>
                  <span className="hidden sm:inline">Start Learning</span>
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
        <section className="relative py-10 md:py-16 overflow-hidden" style={{ background: "radial-gradient(circle at 80% 20%, rgba(255,255,255,0.8) 0%, transparent 100%)" }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
          <div className="grid md:grid-cols-2 gap-10 md:gap-20 items-center">
            {/* Left Content */}
            <div className="relative z-10 pl-2 md:pl-6">
              <div className="inline-block px-4 py-2 rounded-full mb-6 border border-[#E53935]/30" style={{ background: "rgba(229, 57, 53, 0.08)" }}>
                <span className="text-[#E53935] font-medium">🎯 India's Premier Trading Education</span>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 leading-[1.1] uppercase tracking-tight" style={{ color: "#121212" }}>
                India&apos;s Trading <br />
                <span className="bg-gradient-to-r from-[#E53935] via-[#ff6f60] to-[#E53935] bg-clip-text text-transparent">
                  Powerhouse
                </span>
              </h1>
              <p className="text-base md:text-lg text-gray-600 mb-8 leading-relaxed font-medium">
                We are not building another trading course company. We are building <span className="text-[#E53935]">India's first Trader-to-Funded Professional Pipeline</span> — where every student has a pathway to professional capital.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <Link to="/student/contract-kyc" className="block w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto shadow-xl hover:shadow-2xl transition-all hover:scale-105 text-lg px-8 py-6"
                    style={{ background: "linear-gradient(135deg, #E53935 0%, #b71c1c 100%)", color: "white", boxShadow: "0 10px 40px rgba(229, 57, 53, 0.4)" }}
                  >
                    Apply Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <a href="#" onClick={handleDownloadClick} className="block w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto border-2 border-[#E53935] text-[#E53935] hover:bg-red-50 text-lg px-8 py-6"
                  >
                    <Download className="mr-2 h-5 w-5" />
                    Download Brochure
                  </Button>
                </a>
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
                    <div className="ml-auto">
                      <ShareButton title="Watch: The FinTrade Story" variant="icon" />
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>
      {/* 1. Featured Courses Section */}
      <section id="courses" className="py-8 relative z-10" style={{ background: "linear-gradient(to bottom, transparent, rgba(229, 57, 53, 0.02), transparent)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="inline-block px-4 py-2 rounded-full mb-4 border border-[#E53935]/30" style={{ background: "rgba(229, 57, 53, 0.08)" }}>
              <span className="text-[#E53935] font-semibold text-sm">🎓 Professional Certifications</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: "#121212" }}>Our Professional Programs</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Master trading with our industry-leading certifications
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid md:grid-cols-3 md:gap-8 items-stretch">
            {[
              { 
                name: "Financial Market Foundation (FMF)", 
                level: "Foundation", 
                duration: "30 Days", 
                originalPrice: "₹20,000",
                price: "₹12,000",
                savings: "₹8,000",
                description: "Master the fundamentals of financial markets and start your trading journey with confidence.", 
                icon: BookOpen,
              },
              { 
                name: "Certified Analyst & Research Program (CARP)", 
                level: "Intermediate", 
                duration: "60 Days", 
                originalPrice: "₹50,000",
                price: "₹30,000",
                savings: "₹20,000",
                description: "Deep dive into research methodologies, technical analysis, and fundamental research.", 
                icon: LineChart,
              },
              { 
                name: "Certified Professional Trading Program (CPTP)", 
                level: "Professional", 
                duration: "90 Days", 
                originalPrice: "₹75,000",
                price: "₹45,000",
                savings: "₹30,000",
                description: "Professional grade trading strategies, advanced risk management, and portfolio construction.", 
                icon: Trophy,
              },
            ].map((course, i) => (
              <CourseCard key={i} course={course} />
            ))}
          </div>
        </div>
      </section>



      {/* 2. Live Classes Section */}
      <section className="py-8 relative z-10" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(248,248,248,0.4) 100%)", backdropFilter: "blur(2px)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <div className="inline-block px-4 py-2 rounded-full mb-4 border border-[#E53935]/30" style={{ background: "rgba(229,57,53,0.08)" }}>
              <span className="text-[#E53935] font-semibold text-sm">📡 Real-Time Learning</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: "#121212" }}>Live Classes</h2>
            <p className="text-xl text-gray-600">Learn from expert traders in real-time</p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid md:grid-cols-3 md:gap-8 items-stretch">
            {[
              { title: "Technical Analysis Masterclass", instructor: "Amit Desai", date: "April 18, 2026", time: "10:00 AM IST", students: 145, status: "live" },
              { title: "Options Trading Strategies", instructor: "Priya Sharma", date: "April 19, 2026", time: "2:00 PM IST", students: 132, status: "upcoming" },
              { title: "Risk Management Fundamentals", instructor: "Rajesh Kumar", date: "April 20, 2026", time: "4:00 PM IST", students: 178, status: "upcoming" },
            ].map((lecture, i) => (
              <Card key={i} className={`w-full flex flex-col overflow-hidden rounded-2xl transition-all duration-300 hover:shadow-2xl ${lecture.status === "live" ? "border-2 border-[#E53935] shadow-xl" : "border border-gray-200 hover:border-[#E53935]/50"}`}>
                {/* Image Header */}
                <div className="relative h-44 bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1616587896649-79b16d8b173d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080" alt="Live class" className="absolute inset-0 w-full h-full object-cover opacity-25" />
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center border-2 border-white/40 mb-3">
                      <Video className="h-7 w-7 text-white" />
                    </div>
                    {lecture.status === "live" ? (
                      <div className="flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold text-white animate-pulse" style={{ background: "#E53935" }}>
                        <span className="w-2 h-2 rounded-full bg-white animate-ping" /> LIVE NOW
                      </div>
                    ) : (
                      <div className="px-4 py-1.5 rounded-full text-xs font-bold text-white border border-white/30" style={{ background: "rgba(255,255,255,0.1)" }}>
                        UPCOMING
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Card Body */}
                <div className="flex flex-col flex-1 p-6 bg-white">
                  <h3 className="font-bold text-lg mb-4 leading-snug" style={{ color: "#121212" }}>{lecture.title}</h3>
                  <div className="space-y-3 mb-6 text-sm">
                    <div className="flex items-center gap-3 text-gray-700">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(229,57,53,0.08)" }}>
                        <Users className="h-4 w-4" style={{ color: "#E53935" }} />
                      </div>
                      <span className="font-medium">{lecture.instructor}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(229,57,53,0.08)" }}>
                        <CheckCircle className="h-4 w-4" style={{ color: "#E53935" }} />
                      </div>
                      <span>{lecture.date} • {lecture.time}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(229,57,53,0.08)" }}>
                        <Star className="h-4 w-4" style={{ color: "#E53935" }} />
                      </div>
                      <span>{lecture.students} students enrolled</span>
                    </div>
                  </div>
                  
                  {/* Spacer */}
                  <div className="flex-1" />

                  {/* CTA — always at bottom */}
                  <Link to="/student/lectures" className="block">
                    <Button 
                      className="w-full h-12 text-base font-semibold rounded-xl transition-all duration-300"
                      style={{ 
                        background: lecture.status === "live" ? "linear-gradient(135deg, #E53935, #b71c1c)" : "#121212", 
                        color: "white",
                        boxShadow: lecture.status === "live" ? "0 8px 30px rgba(229,57,53,0.3)" : "none"
                      }}
                    >
                      {lecture.status === "live" ? "Join Now" : "Register Now"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Learning Journey Section */}
      <section className="py-6 bg-transparent relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <h2 className="text-4xl font-bold mb-2" style={{ color: "#121212" }}>Your Learning Journey</h2>
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

      {/* 4. Vertical Video Section */}
      <VerticalVideoSection />

      {/* 5. FinTrade Blog Section */}
      <section className="py-8 relative z-10" style={{ background: "linear-gradient(to right, rgba(255,255,255,0.5), rgba(229, 57, 53, 0.03), rgba(255,255,255,0.5))" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-6">
            <div>
              <div className="inline-block px-4 py-2 rounded-full mb-2 border border-[#E53935]/30" style={{ background: "rgba(229,57,53,0.08)" }}>
                <span className="text-[#E53935] font-semibold text-sm">✍️ Latest from Blog</span>
              </div>
              <h2 className="text-4xl font-bold mb-4" style={{ color: "#121212" }}>Market Insights & Articles</h2>
              <p className="text-xl text-gray-600">Stay updated with our research and trading strategies</p>
            </div>
            <Link to="/category/technical-analysis">
              <Button variant="outline" className="border-2 border-[#E53935] text-[#E53935] hover:bg-red-50">
                View All Articles
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          
          <div className="grid lg:grid-cols-12 gap-8 items-stretch">
            {/* Featured Video (Left Side) */}
            <div className="lg:col-span-5">
              <Card className="overflow-hidden border-0 shadow-2xl relative group h-full flex flex-col">
                <div className="relative flex-1 min-h-[300px]">
                  <img 
                    src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80" 
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    alt="Featured Video"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl" style={{ background: "#E53935", boxShadow: "0 0 30px rgba(229,57,53,0.5)" }}>
                      <Play className="h-8 w-8 text-white ml-1" />
                    </div>
                  </div>
                </div>
                <div className="p-6 bg-white">
                  <h3 className="text-2xl font-bold mb-2" style={{ color: "#121212" }}>FinTrade: Master the Market Dynamics</h3>
                  <p className="text-gray-600">Watch our exclusive masterclass on market analysis and risk management techniques for 2026.</p>
                </div>
              </Card>
            </div>

            {/* Blog Stories (4 Cards) */}
            <div className="lg:col-span-7 grid md:grid-cols-2 gap-6">
              {[
                {
                  title: "How to Start Option Trading in India",
                  category: "Options",
                  readTime: "8 min read",
                  img: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80",
                  desc: "A comprehensive guide for beginners looking to enter the derivative markets safely."
                },
                {
                  title: "Mastering Risk Management in 2026",
                  category: "Strategies",
                  readTime: "12 min read",
                  img: "https://images.unsplash.com/photo-1612178991541-b48cc8e92a4d?auto=format&fit=crop&w=800&q=80",
                  desc: "Why protecting your capital is more important than chasing profits."
                },
                {
                  title: "Top 5 Chart Patterns for NIFTY 50",
                  category: "Technical",
                  readTime: "6 min read",
                  img: "https://images.unsplash.com/photo-1642390192305-67c805260177?auto=format&fit=crop&w=800&q=80",
                  desc: "Learn the most reliable candlestick formations used by professional traders."
                },
                {
                  title: "Psychology of a Consistent Trader",
                  category: "Mindset",
                  readTime: "10 min read",
                  img: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=800&q=80",
                  desc: "Overcoming emotional biases and building a disciplined trading routine."
                }
              ].map((blog, i) => (
                <Card key={i} className="group overflow-hidden border-0 bg-white hover:shadow-xl transition-all duration-300 cursor-pointer">
                  <div className="relative h-32 overflow-hidden">
                    <img src={blog.img} alt={blog.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between text-[10px] text-gray-500 mb-2 uppercase font-bold tracking-widest">
                      <span className="text-[#E53935]">{blog.category}</span>
                      <span>{blog.readTime}</span>
                    </div>
                    <h3 className="text-sm font-bold mb-2 group-hover:text-[#E53935] transition-colors line-clamp-2" style={{ color: "#121212" }}>{blog.title}</h3>
                    <p className="text-xs text-gray-500 line-clamp-2">{blog.desc}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>



      {/* 6. Curriculum Roadmap Section */}
      <section className="py-6 relative z-10" style={{ background: "#121212" }}>
        <ModuleRoadmap />
      </section>

      {/* 6.5 Certification Section (Moved below Modules) */}
      <CertificatePreview />

      {/* 7. EMI Options Section */}
      <EMIHighlight />



      {/* 8. Why Choose FinTrade */}
      <section id="about" className="py-8 relative z-10" style={{ background: "linear-gradient(to bottom, rgba(255,255,255,0.8), rgba(248,248,248,0.6))" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="inline-block px-4 py-2 rounded-full mb-4 border border-[#E53935]/30" style={{ background: "rgba(229,57,53,0.08)" }}>
              <span className="text-[#E53935] font-semibold text-sm">💡 Our Edge</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: "#121212" }}>Why Choose FinTrade</h2>
            <p className="text-xl text-gray-600">Everything you need to become a successful trader</p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-8 items-stretch">
            {[
              { icon: Brain, title: "AI Tutor Support", description: "Get 24/7 assistance from our AI-powered trading assistant for doubts and guidance", num: "01" },
              { icon: BookOpen, title: "Structured Curriculum", description: "Follow a proven learning path from basics to advanced strategies with expert content", num: "02" },
              { icon: LineChart, title: "Real Trading Simulation", description: "Practice with ₹10 lakh virtual capital in realistic market conditions without risk", num: "03" },
              { icon: Trophy, title: "Placement Opportunities", description: "Top performers get placed in leading prop trading firms and financial institutions", num: "04" },
            ].map((feature, i) => (
              <Card key={i} className="w-full flex flex-col overflow-hidden rounded-2xl border border-gray-200 hover:border-[#E53935]/50 transition-all duration-300 hover:shadow-2xl group bg-white">
                <div className="flex flex-col flex-1 p-7 text-center">
                  {/* Number Badge */}
                  <div className="text-xs font-bold text-gray-300 mb-4 tracking-widest">{feature.num}</div>
                  {/* Icon */}
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mx-auto mb-5 group-hover:scale-110 transition-transform duration-300" style={{ background: "linear-gradient(135deg, rgba(229,57,53,0.08), rgba(229,57,53,0.15))" }}>
                    <feature.icon className="h-8 w-8" style={{ color: "#E53935" }} />
                  </div>
                  <h3 className="text-lg font-bold mb-3" style={{ color: "#121212" }}>{feature.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                </div>
                {/* Bottom accent */}
                <div className="h-1 w-full" style={{ background: "linear-gradient(to right, transparent, #E53935, transparent)" }} />
              </Card>
            ))}
          </div>
        </div>
      </section>




      {/* CTA Section */}
      <section className="py-8 relative z-10" style={{ background: "linear-gradient(135deg, #E53935 0%, #b71c1c 100%)" }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Start Your Trading Journey Today</h2>
          <p className="text-xl text-white/90 mb-8">Join 1200+ students learning to trade professionally</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/student/entrance-exam" className="block w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto shadow-2xl hover:shadow-3xl transition-all text-lg px-8 py-6" style={{ background: "white", color: "#E53935", boxShadow: "0 0 40px rgba(255, 255, 255, 0.3)" }}>
                Start Entrance Exam
                <ArrowRight className="ml-2 h-6 w-6" />
              </Button>
            </Link>
            <Link to="/student/contract-kyc" className="block w-full sm:w-auto">
              <Button 
                size="lg" 
                variant="outline" 
                className="w-full sm:w-auto text-lg px-8 py-6 border-2 hover:bg-white/10 transition-colors"
                style={{ background: "transparent", borderColor: "white", color: "white" }}
              >
                <FileText className="mr-2 h-5 w-5" />
                View Contract & KYC
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
                {[
                  { icon: Instagram, href: "https://www.instagram.com/the.fintrade/", label: "Instagram" },
                  { icon: Facebook, href: "https://www.facebook.com/profile.php?id=61589528075521", label: "Facebook" },
                  { icon: Youtube, href: "https://www.youtube.com/@The_FinTrade", label: "YouTube" },
                  { icon: Linkedin, href: "https://www.linkedin.com/in/the-fintrade-7230b040a/", label: "LinkedIn" },
                ].map((s, i) => (
                  <a key={i} href={s.href} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors" style={{ background: "rgba(229, 57, 53, 0.2)" }} title={s.label}>
                    <s.icon className="h-5 w-5 text-white" />
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
      {/* Brochure Modal */}
      <Dialog open={brochureOpen} onOpenChange={setBrochureOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{otpSent ? "Verify Mobile" : "Download Brochure"}</DialogTitle>
            <DialogDescription>
              {otpSent 
                ? `Enter the 6-digit OTP sent to ${leadData.contact}` 
                : "Enter your details to receive the comprehensive course brochure."}
            </DialogDescription>
          </DialogHeader>
          
          {!otpSent ? (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="John Doe" value={leadData.name} onChange={(e) => setLeadData({...leadData, name: e.target.value})} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contact">Mobile Number</Label>
                <Input id="contact" placeholder="+91 98765 43210" value={leadData.contact} onChange={(e) => setLeadData({...leadData, contact: e.target.value})} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" placeholder="john@example.com" value={leadData.email} onChange={(e) => setLeadData({...leadData, email: e.target.value})} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" placeholder="Mumbai" value={leadData.city} onChange={(e) => setLeadData({...leadData, city: e.target.value})} />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-6 py-8">
              <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
              <Button variant="link" className="text-xs text-[#E53935]" onClick={() => setOtpSent(false)}>Edit Mobile Number</Button>
            </div>
          )}

          <DialogFooter>
            {!otpSent ? (
              <Button className="w-full" style={{ background: "#E53935", color: "white" }} onClick={sendOTP} disabled={!leadData.name || !leadData.contact}>
                Get OTP
              </Button>
            ) : (
              <Button className="w-full" style={{ background: "#E53935", color: "white" }} onClick={verifyAndDownload} disabled={otp.length !== 6}>
                Verify & Download
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}