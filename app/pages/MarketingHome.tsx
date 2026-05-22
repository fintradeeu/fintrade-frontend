import { useState, useEffect } from "react";
import { Link } from "react-router";
import api from "../services/api";
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
import ProgramModules from "../components/home/ProgramModules";
import logo from "../../imports/fintrade_logo.png";
import CourseCheckoutModal from "../components/CourseCheckoutModal";

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
        background: "rgba(213,0,50, 0.15)",
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
        borderRadius: "50%", background: "#D50032", filter: "blur(140px)",
        opacity: 0.12, animation: "glow-slow-drift 35s linear infinite"
      }} />
      <div style={{
        position: "absolute", top: "40%", right: "-15%", width: 900, height: 900,
        borderRadius: "50%", background: "#D50032", filter: "blur(150px)",
        opacity: 0.1, animation: "glow-slow-drift 45s linear infinite reverse"
      }} />
      <div style={{
        position: "absolute", bottom: "-10%", left: "30%", width: 700, height: 700,
        borderRadius: "50%", background: "#D50032", filter: "blur(130px)",
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
            background: "#D50032",
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
        .scrollbar-hide::-webkit-scrollbar { display: none; }
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
              style={{ background: "rgba(213,0,50,0.2)", border: "2px solid #D50032" }}
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

const courseDetails: Record<string, { description: string; highlights: string[]; modules: { title: string; lessons: string[] }[] }> = {
  FMF: {
    description: "Master the fundamentals of financial markets and start your trading journey with confidence. Learn from real-world market analysts and build a foundation in stock analysis, derivatives, and emotional discipline.",
    highlights: [
      "Industry Recognized Certification",
      "Practical Market Simulator Exposure",
      "Dedicated Mentor Support & Live Q&A"
    ],
    modules: [
      {
        title: "Module 1: Introduction to Financial Markets",
        lessons: [
          "Basics of Stocks, Debentures, and Mutual Funds",
          "How Stock Exchanges (NSE/BSE) & Demat Accounts operate",
          "Navigating a Trading Terminal (Placing orders, bid-ask spreads)"
        ]
      },
      {
        title: "Module 2: Technical Analysis Core",
        lessons: [
          "Introduction to Candlestick charts & basic patterns",
          "Drawing Support & Resistance lines like a pro",
          "Trend analysis (Uptrends, Downtrends, Consolidation) and Moving Averages"
        ]
      },
      {
        title: "Module 3: Introduction to Derivatives & F&O",
        lessons: [
          "What are Futures & Options contracts?",
          "Index trading vs. Equity trading",
          "Understanding Margins, Leverage, and contract expiry"
        ]
      },
      {
        title: "Module 4: Risk Management & Trading Psychology",
        lessons: [
          "Position sizing principles (Calculating risk per trade)",
          "Placing hard Stop-Losses and profit-taking targets",
          "Managing fear and greed: Standard rules of trading discipline"
        ]
      }
    ]
  },
  CARP: {
    description: "Deep dive into research methodologies, comprehensive technical analysis, and fundamental equity research. Built specifically for professionals, graduates, and traders aiming to build a career in stock market research or make informed, data-driven long-term investments.",
    highlights: [
      "Professional Equity Research Report Training",
      "Structural Fundamental Valuation & DCF Models",
      "Placement Assistance & Portfolio Showcase"
    ],
    modules: [
      {
        title: "Module 1: Advanced Technical Analysis",
        lessons: [
          "Deep dive into complex Chart Patterns (Double Tops/Bottoms, Head & Shoulders, Flags)",
          "Master leading & lagging indicators (RSI, MACD, Bollinger Bands, Fibonacci Retracements)",
          "Multi-timeframe analysis for high-probability setups"
        ]
      },
      {
        title: "Module 2: Fundamental Analysis & Financial Statements",
        lessons: [
          "Deconstruct Balance Sheets, Income Statements, and Cash Flow Statements",
          "Analyzing key financial ratios (P/E, P/B, EV/EBITDA, ROE, Debt-to-Equity)",
          "Red-flag detection: Identifying bookkeeping anomalies and accounting quality"
        ]
      },
      {
        title: "Module 3: Valuation Methodologies & Economic Analysis",
        lessons: [
          "Relative Valuation (Peer comparison) and Absolute Valuation (Discounted Cash Flow modeling)",
          "Macro-economic indicators (GDP, inflation, interest rates) and their market impact",
          "Sector-wise research frameworks (Banking, IT, Auto, Pharma, FMCG)"
        ]
      },
      {
        title: "Module 4: Equity Research Report Writing & Ethics",
        lessons: [
          "Drafting a professional 'Initiating Coverage' research report",
          "Structuring Investment Thesis, Target Pricing, and Risk factors",
          "Regulatory norms, SEBI guidelines, and financial analyst ethics"
        ]
      }
    ]
  },
  CPTP: {
    description: "Professional grade trading strategies, advanced risk management, and portfolio construction. Master derivatives strategies, options pricing models (Greeks), institutional price action, and order flow analysis. Includes intensive trading simulator training and a career pathway to corporate desks.",
    highlights: [
      "Advanced Options Greeks & Hedging Strategies",
      "Institutional Price Action & Order Flow Analysis",
      "Practical Prop Desk Simulator & Capital Placement Pathway"
    ],
    modules: [
      {
        title: "Module 1: Advanced Options Trading & Option Greeks",
        lessons: [
          "Deep dive into Options Greeks (Delta, Gamma, Vega, Theta) and their effects on premium",
          "Constructing advanced options strategies (Spreads, Iron Condors, Straddles, Strangles)",
          "Dynamic adjustments, delta hedging, and risk management of complex options portfolios"
        ]
      },
      {
        title: "Module 2: Intraday & Swing Trading Systems",
        lessons: [
          "High-probability intraday setups (Gap trading, VWAP, Breakouts, Mean Reversion)",
          "Volume Profile analysis and identifying Value Areas (VAH/VAL/POC)",
          "Development and backtesting of automated/rules-based trading strategies"
        ]
      },
      {
        title: "Module 3: Institutional Order Flow & Price Action",
        lessons: [
          "Reading order book dynamics, market depth (Level 2 data), and time & sales",
          "Identifying institutional buying/selling footprints (Smart Money concepts)",
          "Trade execution psychology and managing large position sizes"
        ]
      },
      {
        title: "Module 4: Capital Allocation & Professional Desk Recruitment",
        lessons: [
          "Advanced portfolio construction and Sharpe/Sortino ratio optimization",
          "Proprietary desk simulation rules: Maximum drawdown limits, daily loss limits",
          "Career preparation, placement guidance, and interview masterclass for prop trading desks"
        ]
      }
    ]
  }
};

// Course Card Component to handle local state for Read More and Program Details Dialog
export function CourseCard({ course, onEnroll }: { course: any, onEnroll?: () => void }) {
  const isAuthenticated = !!localStorage.getItem("token");
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [showFullTitle, setShowFullTitle] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const MAX_DESC_LENGTH = 100;
  const MAX_TITLE_LENGTH = 45;

  const courseKey = course.name.includes("FMF") ? "FMF" : course.name.includes("CARP") ? "CARP" : "CPTP";
  const details = courseDetails[courseKey];

  return (
    <>
      <Card
        className="w-full flex flex-col group transition-all duration-500 overflow-hidden rounded-2xl border border-gray-200 hover:border-[#D50032]/50 hover:shadow-2xl"
      >
        {/* Gradient Header */}
        <div className="relative px-6 pt-6 pb-4 min-h-[210px] flex flex-col justify-between overflow-hidden bg-gradient-to-br from-[#D50032] via-[#E60036] to-[#FF3366]">
          {/* Ambient subtle pattern/glow in header */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
          <div className="relative z-10">
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
                <button onClick={(e) => { e.preventDefault(); setShowFullTitle(!showFullTitle); }} className="text-white/80 text-[10px] ml-1 hover:underline">
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
              {showFullDesc || course.shortDescription.length <= MAX_DESC_LENGTH ? course.shortDescription : `${course.shortDescription.substring(0, MAX_DESC_LENGTH)}...`}
              {course.shortDescription.length > MAX_DESC_LENGTH && (
                <button onClick={(e) => { e.preventDefault(); setShowFullDesc(!showFullDesc); }} className="text-[#D50032] font-bold ml-1 hover:underline">
                  {showFullDesc ? "Read Less" : "Read More"}
                </button>
              )}
            </p>
          </div>

          <div className="flex-1" />

          <div className="border-t border-gray-100 pt-5 mb-5">
            <div className="flex items-end justify-between">
              <div>
                {course.originalPrice && (
                  <div className="text-sm text-gray-400 line-through">{course.originalPrice}</div>
                )}
                <div className="text-3xl font-extrabold tracking-tight" style={{ color: "#121212" }}>
                  {course.price}<span className="text-sm font-normal text-gray-500 ml-1">+ GST</span>
                </div>
              </div>
              {course.savings && (
                <div className="px-3 py-1.5 rounded-lg bg-green-50/80 border border-green-200 text-green-700 flex flex-col items-end shadow-sm">
                  <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest leading-none mb-1">You Save</span>
                  <span className="text-sm font-extrabold leading-none">{course.savings}</span>
                </div>
              )}
            </div>
          </div>

          <Button
            onClick={() => { setIsDetailsOpen(true); }}
            className="w-full h-12 text-base font-semibold rounded-xl bg-gradient-to-r from-[#D50032] to-[#FF0000] text-white hover:from-[#D50032] hover:to-[#D50032] transition-all duration-300 group-hover:shadow-lg shadow-[0_4px_15px_rgba(213,0,50,0.2)]"
          >
            View Program Details
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </Card>

      {/* Program Details Modal */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-2xl bg-white text-[#121212] rounded-3xl overflow-hidden border border-gray-100 shadow-2xl p-0 z-[10000] max-h-[90vh] flex flex-col">
          {/* Header Gradient (Fixed) */}
          <div className="relative px-8 py-8 text-white flex-shrink-0 overflow-hidden bg-gradient-to-br from-[#D50032] via-[#E60036] to-[#FF3366]">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <span className="px-3 py-1 rounded-full text-xs font-bold text-white border border-white/20 bg-white/10 shadow-sm backdrop-blur-md">
                  {course.level} Program
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold text-white border border-white/20 bg-white/10 shadow-sm backdrop-blur-md">
                  {course.duration}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight tracking-tight">{course.name}</h2>
              <p className="text-white/80 text-sm mt-2 font-medium tracking-wide">Complete Program Overview & Course Curriculum</p>
            </div>
          </div>

          {/* Body & Actions (Scrollable if content is taller than viewport) */}
          <div className="p-8 flex-1 overflow-y-auto">
            <div className="space-y-6">
              <div>
                <h4 className="font-bold text-[#121212] text-sm uppercase tracking-wider mb-2.5">About this Program</h4>
                <p className="text-gray-600 text-sm leading-relaxed font-medium">{course.fullDescription}</p>
              </div>

              <div>
                <h4 className="font-bold text-[#121212] text-sm uppercase tracking-wider mb-3">Key Highlights</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {details.highlights.map((highlight, idx) => (
                    <div key={idx} className="flex flex-col p-4 rounded-2xl bg-gray-50 border border-gray-100 text-center hover:shadow-md transition-shadow">
                      <span className="text-[#D50032] text-xl mb-1.5">✓</span>
                      <span className="text-xs font-semibold text-gray-800 leading-snug">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <span className="text-xs text-gray-400 font-medium">Program Enrollment Fee</span>
                  <div className="text-3xl font-extrabold text-[#121212] tracking-tight">
                    {course.price}
                    <span className="text-sm font-normal text-gray-500 ml-1">+ GST</span>
                  </div>
                </div>
                {course.savings && (
                  <div className="px-4 py-2 rounded-xl bg-green-50 border border-green-200 text-green-700 flex flex-col items-end shadow-sm">
                    <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest leading-none mb-1">You Save</span>
                    <span className="text-base font-extrabold leading-none">{course.savings} instantly</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions Footer */}
            <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end mt-8 pt-6 border-t border-gray-100">
              <Button
                onClick={() => setIsDetailsOpen(false)}
                variant="outline"
                className="w-full sm:w-auto h-12 text-sm font-semibold rounded-xl border-gray-200 text-gray-600 hover:border-[#D50032] hover:text-[#D50032] hover:bg-[#D50032]/5 transition-all duration-300"
              >
                Close Details
              </Button>
              {isAuthenticated ? (
                <Button
                  onClick={() => {
                    setIsDetailsOpen(false);
                    onEnroll();
                  }}
                  className="w-full sm:w-auto h-12 text-sm font-semibold rounded-xl px-8 shadow-lg hover:shadow-xl bg-gradient-to-r from-[#D50032] to-[#FF0000] text-white hover:from-[#D50032] hover:to-[#D50032] transition-all duration-300"
                >
                  Enroll Now
                </Button>
              ) : (
                <Link to="/register" className="w-full sm:w-auto">
                  <Button
                    className="w-full h-12 text-sm font-semibold rounded-xl px-8 shadow-lg hover:shadow-xl bg-gradient-to-r from-[#D50032] to-[#FF0000] text-white hover:from-[#D50032] hover:to-[#D50032] transition-all duration-300"
                  >
                    Enroll Now
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}


export default function MarketingHome() {
  const [videoOpen, setVideoOpen] = useState(false);
  const [activeVideoIdx, setActiveVideoIdx] = useState<number | null>(null);
  const [selectedCourseForCheckout, setSelectedCourseForCheckout] = useState<any>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const isAuthenticated = !!localStorage.getItem("token");

  const [apiCourses, setApiCourses] = useState<any[]>([]);
  const [cmsSettings, setCmsSettings] = useState<any>({});
  const [blogStories, setBlogStories] = useState<any[]>([]);
  const [marketUpdates, setMarketUpdates] = useState<any[]>([]);


  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await api.get("/courses");
        if (res.data && res.data.length > 0) {
          const detailed = await Promise.all(
            res.data.map(async (c: any) => {
              try {
                const det = await api.get(`/courses/${c.id}`);
                return det.data;
              } catch {
                return c;
              }
            })
          );
          setApiCourses(detailed);
        }
      } catch (err) {}
    };
    fetchFeatured();

    const fetchCMSAndNews = async () => {
      try {
        const res = await api.get("/settings/public");
        const settingsObj = res.data.reduce((acc: any, s: any) => ({ ...acc, [s.key]: s.value }), {});
        setCmsSettings(settingsObj);
      } catch (err) { console.error("CMS fetch failed", err); }
      
      try {
        const res = await api.get("/news");
        setBlogStories(res.data.filter((n: any) => n.type === "Blog Story").slice(0, 4));
        setMarketUpdates(res.data.filter((n: any) => n.type === "Market Update").slice(0, 1));
      } catch (err) { console.error("News fetch failed", err); }
    };
    fetchCMSAndNews();

  }, []);

  // Brochure Download Flow State
  const [brochureOpen, setBrochureOpen] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [leadData, setLeadData] = useState({ name: "", email: "", contact: "", city: "" });

  const triggerBrochureDownload = () => {
    const link = document.createElement("a");
    link.href = "/brochure.pdf";
    link.download = "brochure.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("authToken");
    if (token) {
      triggerBrochureDownload();
    } else {
      setBrochureOpen(true);
    }
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
      triggerBrochureDownload();
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
    { headline: "FII net buyers at ₹2,840 Cr; DII adds ₹1₹20 Cr", source: "MoneyControl", time: "6h ago", tag: "FII/DII" },
    { headline: "Bank NIFTY surges 1.1% led by HDFC, ICICI Bank", source: "LiveMint", time: "8h ago", tag: "BANKING" },
    { headline: "Gold prices inch higher on global uncertainty", source: "Business Standard", time: "10h ago", tag: "GOLD" },
    { headline: "IT stocks rally; Infosys, TCS lead gains on strong Q4 outlook", source: "NDTV Profit", time: "12h ago", tag: "IT" },
  ];

  return (
    <div className="flex-1 relative">
      {/* Ambient Red Glow Blobs (Higher Z-Index but behind content) */}
      <AmbientGlow />
      <CursorGlow />

      {/* Video Modal */}
      {videoOpen && (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-5xl aspect-video rounded-2xl overflow-hidden shadow-2xl">
            <button onClick={() => { setVideoOpen(false); setActiveVideoIdx(null); }} className="absolute top-4 right-4 z-10 text-white/70 hover:text-white bg-black/20 hover:bg-black/40 rounded-full p-2 transition-all">
              <X size={24} />
            </button>
            <iframe
              src={activeVideoIdx !== null && showcaseVideos[activeVideoIdx].videoUrl ? showcaseVideos[activeVideoIdx].videoUrl : "https://www.youtube.com/embed/dQw4w9WgXcQ"}
              title="Testimonial Video"
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}

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
                <div className="inline-block px-4 py-2 rounded-full mb-6 border border-[#D50032]/30" style={{ background: "rgba(213,0,50, 0.08)" }}>
                  <span className="text-[#D50032] font-medium">🎯 India's Premier Trading Education</span>
                </div>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 leading-[1.1] uppercase tracking-tight" style={{ color: "#121212" }}>
                  India&apos;s Trading <br />
                  <span className="bg-gradient-to-r from-[#D50032] via-[#FF4D70] to-[#D50032] bg-clip-text text-transparent">
                    Powerhouse
                  </span>
                </h1>
                <p className="text-base md:text-lg text-gray-600 mb-8 leading-relaxed font-medium">
                  We are not building another trading course company. We are building <span className="text-[#D50032]">India's first Trader-to-Funded Professional Pipeline</span> — where every student has a pathway to professional capital.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <Link to={isAuthenticated ? "/student/courses" : "/register"} className="block w-full sm:w-auto">
                    <Button
                      size="lg"
                      className="w-full sm:w-auto shadow-xl hover:shadow-2xl transition-all hover:scale-105 text-lg px-8 py-6 bg-gradient-to-r from-[#D50032] to-[#FF0000] text-white hover:from-[#D50032] hover:to-[#D50032]"
                      style={{ boxShadow: "0 10px 40px rgba(213,0,50, 0.4)" }}
                    >
                      Apply Now
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <a href="#" onClick={handleDownloadClick} className="block w-full sm:w-auto">
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full sm:w-auto border-2 border-[#D50032] text-[#D50032] hover:bg-[#D50032] hover:text-white text-lg px-8 py-6 transition-all duration-300"
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
                  style={{ background: "linear-gradient(135deg, rgba(213,0,50,0.08) 0%, rgba(213,0,50,0.03) 100%)", filter: "blur(20px)" }}
                />
                <Card
                  className="relative overflow-hidden shadow-2xl border border-gray-200 cursor-pointer group"
                  style={{ boxShadow: "0 20px 60px rgba(213,0,50, 0.12), 0 4px 20px rgba(0,0,0,0.08)" }}
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
                        style={{ background: "#D50032", boxShadow: "0 0 40px rgba(213,0,50,0.6)" }}
                      >
                        <Play className="h-9 w-9 text-white ml-1" />
                      </div>
                    </div>
                    <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold text-white animate-pulse" style={{ background: "#D50032" }}>
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
                        <Users className="h-3 w-3" style={{ color: "#D50032" }} /> 1,200+ students
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Star className="h-3 w-3 fill-current" style={{ color: "#D50032" }} /> 4.9 rating
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Award className="h-3 w-3" style={{ color: "#D50032" }} /> Certified
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
        <section id="courses" className="py-8 relative z-10" style={{ background: "linear-gradient(to bottom, transparent, rgba(213,0,50, 0.02), transparent)" }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <div className="inline-block px-4 py-2 rounded-full mb-4 border border-[#D50032]/30" style={{ background: "rgba(213,0,50, 0.08)" }}>
                <span className="text-[#D50032] font-semibold text-sm">🎓 Professional Certifications</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: "#121212" }}>Our Professional Programs</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Master trading with our industry-leading certifications
              </p>
            </div>
            <div
              className="flex md:grid md:grid-cols-3 gap-6 md:gap-8 overflow-x-auto md:overflow-x-visible pb-8 md:pb-0 snap-x snap-mandatory scrollbar-hide px-4 -mx-4 md:px-0 md:mx-0 items-stretch"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {(apiCourses.length > 0 ? apiCourses.map((c: any) => {
                const diff = c.difficulty_level || "beginner";
                return {
                  ...c,
                  name: c.title,
                  level: diff.charAt(0).toUpperCase() + diff.slice(1),
                  duration: c.duration_hours ? `${c.duration_hours} Days` : "Self-paced",
                  originalPrice: c.original_price && Number(c.original_price) > 0 ? `\u20B9${Number(c.original_price).toLocaleString("en-IN")}` : null,
                  price: `\u20B9${Number(c.price).toLocaleString("en-IN")}`,
                  savings: c.original_price && Number(c.original_price) > Number(c.price) ? `\u20B9${(Number(c.original_price) - Number(c.price)).toLocaleString("en-IN")}` : null,
                  shortDescription: c.short_description || c.description || "Professional trading course",
                  fullDescription: c.description || c.short_description || "Professional trading course.",
                  icon: diff === "beginner" ? BookOpen : diff === "intermediate" ? LineChart : Trophy,
                  modules: (c.modules || []).sort((a: any, b: any) => a.order - b.order),
                };
              }) : [
                {
                  name: "Financial Market Foundation (FMF)",
                  level: "Foundation",
                  duration: "30 Days",
                  originalPrice: "₹20,000",
                  price: "₹12,000",
                  savings: "₹8,000",
                  shortDescription: "Master the fundamentals of financial markets.",
                  fullDescription: "Master the fundamentals of financial markets and start your trading journey with confidence.",
                  icon: BookOpen,
                },
                {
                  name: "Certified Analyst & Research Program (CARP)",
                  level: "Intermediate",
                  duration: "60 Days",
                  originalPrice: "₹50,000",
                  price: "₹30,000",
                  savings: "₹20,000",
                  shortDescription: "Deep dive into research methodologies and analysis.",
                  fullDescription: "Deep dive into research methodologies, technical analysis, and fundamental research.",
                  icon: LineChart,
                },
                {
                  name: "Certified Professional Trading Program (CPTP)",
                  level: "Professional",
                  duration: "90 Days",
                  originalPrice: "₹75,000",
                  price: "₹45,000",
                  savings: "₹30,000",
                  shortDescription: "Professional grade trading strategies.",
                  fullDescription: "Professional grade trading strategies, advanced risk management, and portfolio construction.",
                  icon: Trophy,
                },
              ]).slice(0, 3).map((course, i) => (
                <div key={i} className="flex-shrink-0 w-[290px] sm:w-[350px] md:w-full md:flex-shrink snap-center flex">
                  <CourseCard course={course} onEnroll={() => setSelectedCourseForCheckout(course)} />
                </div>
              ))}
            </div>

            {apiCourses.length > 3 && (
              <div className="mt-8 text-center">
                <Link to={isAuthenticated ? "/student/courses" : "/register"}>
                  <Button className="bg-[#0B2A5B] text-[#F4F1EA] hover:bg-[#1a3d7a] px-8 py-2 rounded-full font-semibold transition-all">
                    View More Courses
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </section>

        <ProgramModules apiCourses={apiCourses.length > 0 ? apiCourses : null} />

        {/* 2. Live Classes Section */}
        <section className="py-8 relative z-10" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(248,248,248,0.4) 100%)", backdropFilter: "blur(2px)" }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-6">
              <div className="inline-block px-4 py-2 rounded-full mb-4 border border-[#D50032]/30" style={{ background: "rgba(213,0,50,0.08)" }}>
                <span className="text-[#D50032] font-semibold text-sm">📡 Real-Time Learning</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: "#121212" }}>Live Classes</h2>
              <p className="text-xl text-gray-600">Learn from expert traders in real-time</p>
            </div>
            <div
              className="flex md:grid md:grid-cols-3 gap-6 md:gap-8 overflow-x-auto md:overflow-x-visible pb-8 md:pb-0 snap-x snap-mandatory scrollbar-hide px-4 -mx-4 md:px-0 md:mx-0 items-stretch"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {[
                { title: "Technical Analysis Masterclass", instructor: "Amit Desai", date: "April 18, 2026", time: "10:00 AM IST", students: 145, status: "live" },
                { title: "Options Trading Strategies", instructor: "Priya Sharma", date: "April 19, 2026", time: "2:00 PM IST", students: 132, status: "upcoming" },
                { title: "Risk Management Fundamentals", instructor: "Rajesh Kumar", date: "April 20, 2026", time: "4:00 PM IST", students: 178, status: "upcoming" },
              ].map((lecture, i) => (
                <div key={i} className="flex-shrink-0 w-[290px] sm:w-[350px] md:w-full md:flex-shrink snap-center flex">
                  <Card className={`w-full flex flex-col overflow-hidden rounded-2xl transition-all duration-300 hover:shadow-2xl ${lecture.status === "live" ? "border-2 border-[#D50032] shadow-xl" : "border border-gray-200 hover:border-[#D50032]/50"}`}>
                    {/* Image Header */}
                    <div className="relative h-44 bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center overflow-hidden">
                      <img src="https://images.unsplash.com/photo-1616587896649-79b16d8b173d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080" alt="Live class" className="absolute inset-0 w-full h-full object-cover opacity-25" />
                      <div className="relative z-10 flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center border-2 border-white/40 mb-3">
                          <Video className="h-7 w-7 text-white" />
                        </div>
                        {lecture.status === "live" ? (
                          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold text-white animate-pulse" style={{ background: "#D50032" }}>
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
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(213,0,50,0.08)" }}>
                            <Users className="h-4 w-4" style={{ color: "#D50032" }} />
                          </div>
                          <span className="font-medium">{lecture.instructor}</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-600">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(213,0,50,0.08)" }}>
                            <CheckCircle className="h-4 w-4" style={{ color: "#D50032" }} />
                          </div>
                          <span>{lecture.date} • {lecture.time}</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-600">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(213,0,50,0.08)" }}>
                            <Star className="h-4 w-4" style={{ color: "#D50032" }} />
                          </div>
                          <span>{lecture.students} students enrolled</span>
                        </div>
                      </div>

                      {/* Spacer */}
                      <div className="flex-1" />

                      {/* CTA — always at bottom */}
                      <Link to={isAuthenticated ? "/student/lectures" : "/login"} className="block">
                        <Button
                          className={`w-full h-12 text-base font-semibold rounded-xl transition-all duration-300 ${lecture.status === "live"
                            ? "!bg-gradient-to-r !from-[#D50032] !to-[#FF0000] !text-white hover:!from-[#FF0000] hover:!to-[#FF0000]"
                            : "!bg-[#121212] !text-white hover:!bg-[#D50032] hover:!text-white"
                            }`}
                          style={{
                            boxShadow: lecture.status === "live" ? "0 8px 30px rgba(213,0,50,0.3)" : "none"
                          }}
                        >
                          {lecture.status === "live" ? "Join Now" : "Register Now"}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </Card>
                </div>
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
                <div className="absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2" style={{ background: "linear-gradient(to right, #D50032, #121212)" }} />
                <div className="grid grid-cols-5 gap-4 relative">
                  {[
                    { title: "Entrance Exam", desc: "Test your baseline knowledge", icon: CheckCircle },
                    { title: "Course Learning", desc: "Structured curriculum & modules", icon: BookOpen },
                    { title: "Monthly Exams", desc: "Track your progress", icon: Award },
                    { title: "Trading Simulator", desc: "Practice with virtual capital", icon: LineChart },
                    { title: "Placement", desc: "Join trading firms", icon: Trophy },
                  ].map((step, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4 relative z-10 border-4 border-white shadow-lg" style={{ background: i <= 2 ? "#D50032" : "#121212" }}>
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
                    <div className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: i <= 2 ? "#D50032" : "#121212" }}>
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
        <section className="py-8 relative z-10" style={{ background: "linear-gradient(to right, rgba(255,255,255,0.5), rgba(213,0,50, 0.03), rgba(255,255,255,0.5))" }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-6">
              <div>
                <div className="inline-block px-4 py-2 rounded-full mb-2 border border-[#D50032]/30" style={{ background: "rgba(213,0,50,0.08)" }}>
                  <span className="text-[#D50032] font-semibold text-sm">✍️ Latest from Blog</span>
                </div>
                <h2 className="text-4xl font-bold mb-4" style={{ color: "#121212" }}>Market Insights & Articles</h2>
                <p className="text-xl text-gray-600">Stay updated with our research and trading strategies</p>
              </div>
              <Link to="/category/technical-analysis">
                <Button variant="outline" className="border-2 border-[#D50032] text-[#D50032] hover:bg-[#D50032] hover:text-white transition-all duration-300">
                  View All Articles
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="grid lg:grid-cols-12 gap-8 items-stretch">
              {/* Featured Video (Left Side) */}
              <div className="lg:col-span-5">
                {marketUpdates.length > 0 ? (
                  <Card className="overflow-hidden border-0 shadow-2xl relative group h-full flex flex-col">
                    <div className="relative flex-1 min-h-[300px]">
                      <img
                        src={marketUpdates[0].thumbnail_url || "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80"}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        alt={marketUpdates[0].title}
                      />
                      {marketUpdates[0].video_url && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <a href={marketUpdates[0].video_url} target="_blank" rel="noreferrer" className="w-20 h-20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl hover:bg-red-700" style={{ background: "#D50032", boxShadow: "0 0 30px rgba(213,0,50,0.5)" }}>
                            <Play className="h-8 w-8 text-white ml-1" />
                          </a>
                        </div>
                      )}
                    </div>
                    <div className="p-6 bg-white">
                      <h3 className="text-2xl font-bold mb-2" style={{ color: "#121212" }}>{marketUpdates[0].title}</h3>
                      <p className="text-gray-600 line-clamp-3">{marketUpdates[0].content}</p>
                    </div>
                  </Card>
                ) : (
                  <Card className="overflow-hidden border-0 shadow-2xl relative group h-full flex flex-col">
                    <div className="relative flex-1 min-h-[300px]">
                      <img
                        src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80"
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        alt="Featured Video"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="w-20 h-20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl" style={{ background: "#D50032", boxShadow: "0 0 30px rgba(213,0,50,0.5)" }}>
                          <Play className="h-8 w-8 text-white ml-1" />
                        </div>
                      </div>
                    </div>
                    <div className="p-6 bg-white">
                      <h3 className="text-2xl font-bold mb-2" style={{ color: "#121212" }}>FinTrade: Master the Market Dynamics</h3>
                      <p className="text-gray-600">Watch our exclusive masterclass on market analysis and risk management techniques for 2026.</p>
                    </div>
                  </Card>
                )}
              </div>

              {/* Blog Stories (4 Cards) */}
              <div
                className="lg:col-span-7 flex md:grid md:grid-cols-2 gap-6 overflow-x-auto lg:overflow-x-visible pb-6 lg:pb-0 snap-x snap-mandatory scrollbar-hide px-4 -mx-4 lg:px-0 lg:mx-0 items-stretch"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {blogStories.length > 0 ? blogStories.map((story, i) => (
                  <Card key={i} className="min-w-[85vw] sm:min-w-[300px] md:min-w-0 flex flex-col border-0 shadow-lg group hover:-translate-y-1 transition-all duration-300 snap-center">
                    <div className="h-48 overflow-hidden relative">
                      <img src={story.thumbnail_url || "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80"} alt={story.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-[#D50032]">
                        Blog
                      </div>
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                        <span className="flex items-center gap-1"><FileText size={14} />Read</span>
                        <span>5 min read</span>
                      </div>
                      <h3 className="font-bold text-lg mb-2 line-clamp-2 hover:text-[#D50032] transition-colors cursor-pointer" style={{ color: "#121212" }}>{story.title}</h3>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-1">{story.content}</p>
                      <Link to="/blog" className="text-[#D50032] font-semibold text-sm flex items-center group-hover:gap-2 transition-all">
                        Read Story <ChevronRight size={16} />
                      </Link>
                    </div>
                  </Card>
                )) : [
                  {
                    title: "How to Start Option Trading in India",
                    category: "Options",
                    readTime: "8 min read",
                    img: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80",
                    desc: "A comprehensive guide for beginners looking to enter the derivative markets safely."
                  },
                  {
                    title: "Top 5 Mistakes Day Traders Make",
                    category: "Psychology",
                    readTime: "5 min read",
                    img: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=800&q=80",
                    desc: "Avoid these common psychological traps that destroy trading accounts."
                  },
                  {
                    title: "Understanding Institutional Order Flow",
                    category: "Advanced",
                    readTime: "12 min read",
                    img: "https://images.unsplash.com/photo-1535320903710-d993d3d77d29?auto=format&fit=crop&w=800&q=80",
                    desc: "Learn to read the market like smart money and trade alongside the institutions."
                  },
                  {
                    title: "Building a Winning Trading System",
                    category: "Strategy",
                    readTime: "10 min read",
                    img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
                    desc: "Step-by-step process to backtest and deploy your own profitable strategy."
                  }
                ].map((post, i) => (
                  <Card key={i} className="min-w-[85vw] sm:min-w-[300px] md:min-w-0 flex flex-col border-0 shadow-lg group hover:-translate-y-1 transition-all duration-300 snap-center">
                    <div className="h-48 overflow-hidden relative">
                      <img src={post.img} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-[#D50032]">
                        {post.category}
                      </div>
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                        <span className="flex items-center gap-1"><FileText size={14} /> Article</span>
                        <span>{post.readTime}</span>
                      </div>
                      <h3 className="font-bold text-lg mb-2 line-clamp-2 hover:text-[#D50032] transition-colors cursor-pointer" style={{ color: "#121212" }}>{post.title}</h3>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-1">{post.desc}</p>
                      <button className="text-[#D50032] font-semibold text-sm flex items-center group-hover:gap-2 transition-all mt-auto self-start">
                        Read Full Article <ChevronRight size={16} />
                      </button>
                    </div>
                  </Card>
                ))}
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
              <div className="inline-block px-4 py-2 rounded-full mb-4 border border-[#D50032]/30" style={{ background: "rgba(213,0,50,0.08)" }}>
                <span className="text-[#D50032] font-semibold text-sm">💡 Our Edge</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: "#121212" }}>Why Choose FinTrade</h2>
              <p className="text-xl text-gray-600">Everything you need to become a successful trader</p>
            </div>
            <div
              className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-8 overflow-x-auto md:overflow-x-visible pb-6 md:pb-0 snap-x snap-mandatory scrollbar-hide px-4 -mx-4 md:px-0 md:mx-0 items-stretch"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {[
                { icon: Brain, title: "AI Tutor Support", description: "Get 24/7 assistance from our AI-powered trading assistant for doubts and guidance", num: "01" },
                { icon: BookOpen, title: "Structured Curriculum", description: "Follow a proven learning path from basics to advanced strategies with expert content", num: "02" },
                { icon: LineChart, title: "Real Trading Simulation", description: "Practice with ₹10 lakh virtual capital in realistic market conditions without risk", num: "03" },
                { icon: Trophy, title: "Placement Opportunities", description: "Top performers get placed in leading prop trading firms and financial institutions", num: "04" },
              ].map((feature, i) => (
                <div key={i} className="flex-shrink-0 w-[260px] sm:w-[320px] md:w-full md:flex-shrink snap-center flex">
                  <Card className="w-full flex flex-col overflow-hidden rounded-2xl border border-gray-200 hover:border-[#D50032]/50 transition-all duration-300 hover:shadow-2xl group bg-white">
                    <div className="flex flex-col flex-1 p-7 text-center">
                      {/* Number Badge */}
                      <div className="text-xs font-bold text-gray-300 mb-4 tracking-widest">{feature.num}</div>
                      {/* Icon */}
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mx-auto mb-5 group-hover:scale-110 transition-transform duration-300" style={{ background: "linear-gradient(135deg, rgba(213,0,50,0.08), rgba(213,0,50,0.15))" }}>
                        <feature.icon className="h-8 w-8" style={{ color: "#D50032" }} />
                      </div>
                      <h3 className="text-lg font-bold mb-3" style={{ color: "#121212" }}>{feature.title}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                    </div>
                    {/* Bottom accent */}
                    <div className="h-1 w-full" style={{ background: "linear-gradient(to right, transparent, #D50032, transparent)" }} />
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </section>




        {/* CTA Section */}
        <section
          className="py-16 relative z-10"
          style={{ background: "#D50032" }}
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black uppercase tracking-wide text-white mb-8 leading-tight">
              <div>THE MARKET'S MOVING,</div>
              <div>ARE YOU?</div>
            </h2>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
              <Link to={isAuthenticated ? "/student/courses" : "/register"} className="block w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto rounded-full text-lg font-bold px-10 py-7 !bg-white hover:!bg-white !text-[#D50032] hover:!text-[#D50032] shadow-[0_4px_25px_rgba(255,255,255,0.15)] transition-all duration-300 transform hover:scale-105 border-none"
                >
                  Apply Now
                </Button>
              </Link>
              <a href="#" onClick={handleDownloadClick} className="block w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto rounded-full text-lg font-bold px-10 py-7 border-2 border-white bg-transparent text-white hover:bg-white hover:text-[#D50032] transition-all duration-300 transform hover:scale-105"
                >
                  <Download className="mr-2 h-5 w-5" />
                  Download Brochure
                </Button>
              </a>
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
                  <li><a href="#about" className="hover:text-[#D50032] transition-colors">About Us</a></li>
                  <li><a href="#" className="hover:text-[#D50032] transition-colors">Careers</a></li>
                  <li><a href="#" className="hover:text-[#D50032] transition-colors">Press</a></li>
                  <li><a href="#" className="hover:text-[#D50032] transition-colors">Blog</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-4">Courses</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><Link to={isAuthenticated ? "/student/courses" : "/register"} className="hover:text-[#D50032] transition-colors">Basic Trading</Link></li>
                  <li><Link to={isAuthenticated ? "/student/courses" : "/register"} className="hover:text-[#D50032] transition-colors">Intermediate Trading</Link></li>
                  <li><Link to={isAuthenticated ? "/student/courses" : "/register"} className="hover:text-[#D50032] transition-colors">Advanced Trading</Link></li>
                  <li><Link to={isAuthenticated ? "/student/courses" : "/register"} className="hover:text-[#D50032] transition-colors">Master Trading</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-4">Resources</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#market-updates" className="hover:text-[#D50032] transition-colors">Market Updates</a></li>
                  <li><Link to={isAuthenticated ? "/student/lectures" : "/login"} className="hover:text-[#D50032] transition-colors">Live Classes</Link></li>
                  <li><Link to={isAuthenticated ? "/student/ai-tutor" : "/login"} className="hover:text-[#D50032] transition-colors">AI Tutor</Link></li>
                  <li><a href="#" className="hover:text-[#D50032] transition-colors">Help Center</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-4">Contact</h4>
                <ul className="space-y-2 text-gray-400">
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4" style={{ color: "#D50032" }} />{cmsSettings.contact_email || "contact@fintrade.in"}</li>
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4" style={{ color: "#D50032" }} />{cmsSettings.contact_phone || "+91 98765 43210"}</li>
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4" style={{ color: "#D50032" }} />{cmsSettings.address || "Mumbai, India"}</li>
                </ul>
                <div className="flex gap-3 mt-4">
                  {[
                    { icon: Instagram, href: "https://www.instagram.com/the.fintrade/", label: "Instagram" },
                    { icon: Facebook, href: "https://www.facebook.com/profile.php?id=61589528075521", label: "Facebook" },
                    { icon: Youtube, href: "https://www.youtube.com/@The_FinTrade", label: "YouTube" },
                    { icon: Linkedin, href: "https://www.linkedin.com/in/the-fintrade-7230b040a/", label: "LinkedIn" },
                  ].map((s, i) => (
                    <a key={i} href={s.href} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors" style={{ background: "rgba(213,0,50, 0.2)" }} title={s.label}>
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
                <Label htmlFor="name">Full Name <span className="text-[#D50032]">*</span></Label>
                <Input id="name" placeholder="John Doe" value={leadData.name} onChange={(e) => setLeadData({ ...leadData, name: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contact">Mobile Number <span className="text-[#D50032]">*</span></Label>
                <Input id="contact" placeholder="+91 98765 43210" value={leadData.contact} onChange={(e) => setLeadData({ ...leadData, contact: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" placeholder="john@example.com" value={leadData.email} onChange={(e) => setLeadData({ ...leadData, email: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" placeholder="Mumbai" value={leadData.city} onChange={(e) => setLeadData({ ...leadData, city: e.target.value })} />
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
              <Button variant="link" className="text-xs text-[#D50032]" onClick={() => setOtpSent(false)}>Edit Mobile Number</Button>
            </div>
          )}

          <DialogFooter>
            {!otpSent ? (
              <Button className="w-full" style={{ background: "#D50032", color: "white" }} onClick={sendOTP} disabled={!leadData.name || !leadData.contact}>
                Get OTP
              </Button>
            ) : (
              <Button className="w-full" style={{ background: "#D50032", color: "white" }} onClick={verifyAndDownload} disabled={otp.length !== 6}>
                Verify & Download
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {selectedCourseForCheckout && (
        <CourseCheckoutModal
          course={selectedCourseForCheckout}
          onClose={() => setSelectedCourseForCheckout(null)}
          onSuccess={() => {
            setSelectedCourseForCheckout(null);
            alert('Enrollment successful! You can now access your dashboard.');
            window.location.href = '/student/dashboard';
          }}
        />
      )}
    </div>
  );
}
