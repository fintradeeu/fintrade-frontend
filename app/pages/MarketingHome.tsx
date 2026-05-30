import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import api from "../services/api";
import { Play, TrendingUp, Award, Users, BookOpen, LineChart, Video, CheckCircle, Star, ArrowRight, BarChart3, Brain, Target, Trophy, X, FileText, Search, Phone, Download, Instagram, Youtube, Linkedin, Twitter, Facebook, ChevronRight, ChevronLeft, ChevronDown, Shield, UserCheck, Monitor, Wifi, Activity, ClipboardCheck, GitBranch, Cpu, Clock } from "lucide-react";
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
import CareerPathways from "../components/home/CareerPathways";
import ModuleRoadmap from "../components/home/ModuleRoadmap";
import ProgramModules from "../components/home/ProgramModules";
import logo from "../../imports/fintrade_logo.png";
import CourseCheckoutModal from "../components/CourseCheckoutModal";
import { motion } from "motion/react";

// Interactive Cursor Glow
function CursorGlow() {
  return null;
}


// Dynamic "Popping" Ambient Glow
function AmbientGlow() {
  return null;
}

// Reusable Framer Motion Scroll Reveal Component
function ScrollReveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 35 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
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

const benefits = [
  {
    num: "01",
    title: "Full Trading Program",
    desc: "Institutional curriculum from foundations to professional-level execution.",
    icon: BookOpen,
  },
  {
    num: "02",
    title: "3 Tested Strategies",
    desc: "Three proven, back-tested trading strategies for consistent performance.",
    icon: TrendingUp,
  },
  {
    num: "03",
    title: "Risk Policy Manual",
    desc: "Comprehensive risk management guidelines to protect capital at all times.",
    icon: FileText,
  },
  {
    num: "04",
    title: "Performance Audit System",
    desc: "Structured periodic audits to track, analyze and improve your trading.",
    icon: BarChart3,
  },
  {
    num: "05",
    title: "Simulated $200k Account",
    desc: "Practice with a $200,000 simulated prop account to build confidence.",
    icon: Shield,
  },
  {
    num: "06",
    title: "90 Day Performance Report",
    desc: "Detailed 90-day performance review with actionable improvement insights.",
    icon: Award,
  },
  {
    num: "07",
    title: "Control Drawdown",
    desc: "Learn to manage and minimize drawdown through disciplined trading rules.",
    icon: Target,
  },
  {
    num: "08",
    title: "Manage 5-7 Figure Capital",
    desc: "Training to confidently handle large institutional-scale capital.",
    icon: Trophy,
  },
  {
    num: "09",
    title: "Management",
    desc: "Holistic trading management skills covering psychology, strategy and ops.",
    icon: Brain,
  },
];

const servicesCards = [
  { icon: UserCheck, title: 'Mentor', desc: 'One-on-one expert guidance from seasoned market professionals.' },
  { icon: Monitor, title: 'Online Class', desc: 'Live, interactive online sessions accessible from anywhere.' },
  { icon: Wifi, title: 'Live Market Sessions', desc: 'Real-time market participation and analysis with experts.' },
  { icon: Activity, title: 'Real Time Trading', desc: 'Hands-on trading during live market hours under supervision.' },
  { icon: ClipboardCheck, title: 'Practical Evaluation', desc: 'Structured assessments to measure and certify your progress.' },
  { icon: GitBranch, title: 'Strategy Building', desc: 'Develop personalised trading strategies backed by data.' },
  { icon: Cpu, title: 'AI-Integrated Financial Course', desc: 'Modern curriculum powered by AI tools and analytical methods.' },
  { icon: LineChart, title: 'AI-Analytics', desc: 'Leverage AI-driven analytics for smarter market insights.' },
];

// Course Card Component to handle local state for Program Details Dialog
export function CourseCard({ course, onEnroll }: { course: any, onEnroll?: () => void }) {
  const isAuthenticated = !!localStorage.getItem("token");
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [enrollLoading, setEnrollLoading] = useState(false);

  const courseKey = course.name.includes("FMF") ? "FMF" : course.name.includes("CARP") ? "CARP" : "CPTP";
  const details = courseDetails[courseKey];

  const handleEnrollClick = async () => {
    if (!isAuthenticated) {
      window.location.href = "/register";
      return;
    }

    setEnrollLoading(true);
    try {
      const res = await api.get("/exams/entrance");
      const matchingExam = (res.data || []).find(
        (exam: any) => Number(exam.course_id) === Number(course.id) && exam.is_active
      );

      setIsDetailsOpen(false);
      if (matchingExam) {
        try {
          const allRes = await api.get("/exams/all");
          const attemptedExam = (allRes.data?.entrance_exams || []).find(
            (exam: any) => Number(exam.id) === Number(matchingExam.id)
          );
          const alreadyPassed = attemptedExam?.attempts?.some((attempt: any) => attempt.passed);
          if (alreadyPassed) {
            onEnroll?.();
            return;
          }
        } catch {
          // If attempt history cannot be loaded, continue to the specific exam page.
        }
        window.location.href = `/student/entrance-exam?exam_id=${matchingExam.id}&course_id=${course.id}`;
      } else {
        window.location.href = `/student/entrance-exam?course_id=${course.id}`;
      }
    } catch {
      window.location.href = `/student/entrance-exam?course_id=${course.id}`;
    } finally {
      setEnrollLoading(false);
    }
  };

  // Format level badge to match mockup (Foundation -> Beginner)
  let levelBadge = course.level || "Beginner";
  if (levelBadge === "Foundation") levelBadge = "Beginner";

  // Format duration to Hours for consistency with mockup image
  let displayDuration = "30 Hours";
  if (course.duration) {
    const match = course.duration.match(/\d+/);
    if (match) {
      displayDuration = `${match[0]} Hours`;
    } else {
      displayDuration = course.duration;
    }
  }

  // Calculate discount percentage dynamically
  const priceNum = parseFloat(course.price?.replace(/[^\d]/g, "") || "0");
  const originalPriceNum = course.originalPrice ? parseFloat(course.originalPrice.replace(/[^\d]/g, "") || "0") : 0;
  let discountPercentage = 40; // Default
  if (originalPriceNum && priceNum && originalPriceNum > priceNum) {
    discountPercentage = Math.round(((originalPriceNum - priceNum) / originalPriceNum) * 100);
  }

  // Determine if this is the "Most Popular" card
  const isMostPopular = course.name.includes("CARP") || levelBadge === "Intermediate";

  // Modules count fallback
  const modulesCount = course.modules?.length || (course.name.includes("FMF") ? 6 : course.name.includes("CARP") ? 12 : 18);

  return (
    <>
      <div
        className={`w-full h-full flex flex-col group transition-all duration-300 relative bg-white rounded-[32px] p-8 ${isMostPopular
          ? "border-2 border-[#FFD2D6] shadow-[0_15px_40px_rgba(213,0,50,0.04)]"
          : "border border-gray-100 shadow-[0_10px_35px_rgba(0,0,0,0.015)]"
          } hover:shadow-2xl hover:scale-[1.01]`}
      >
        {/* Most Popular overlapping badge */}
        {isMostPopular && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-5 py-1.5 rounded-full text-[11px] font-black text-white bg-[#D50032] shadow-[0_4px_12px_rgba(213,0,50,0.25)] uppercase tracking-wider z-20">
            Most Popular
          </div>
        )}

        {/* Top Badges and Duration */}
        <div className="flex flex-col items-start w-full mb-4">
          <span className="px-3.5 py-1 rounded-full text-xs font-bold text-[#D50032] bg-[#FFF5F6] border border-[#D50032]/8 inline-block mb-3.5">
            {levelBadge}
          </span>
          <div className="flex items-center gap-2 text-2xl sm:text-3.5xl font-black text-[#D50032] tracking-tight leading-none">
            <Clock className="w-6.5 h-6.5 text-[#D50032] stroke-[2.5]" />
            <span>{displayDuration}</span>
          </div>
        </div>

        {/* Title and description */}
        <div className="flex flex-col mb-5">
          <h3 className="text-xl sm:text-2xl font-black text-[#121212] mb-3 leading-snug tracking-tight">
            {course.name}
          </h3>
          <p className="text-sm text-gray-500 font-medium leading-relaxed">
            {course.shortDescription}
          </p>
        </div>

        {/* Price block - gray rounded container */}
        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex items-center justify-between gap-4 mb-5">
          <div className="flex items-baseline gap-2.5">
            <span className="text-2xl sm:text-3xl font-black text-[#121212] tracking-tight leading-none">
              {course.price}
            </span>
            {course.originalPrice && (
              <span className="text-sm sm:text-base text-gray-400 line-through font-semibold leading-none">
                {course.originalPrice}
              </span>
            )}
          </div>
          <span className="bg-green-50 text-emerald-600 border border-emerald-100 px-2.5 py-1 text-xs font-black rounded-lg uppercase tracking-wider">
            {discountPercentage}% OFF
          </span>
        </div>

        {/* Modules Count */}
        <div className="flex items-center gap-2 text-sm text-gray-500 font-bold mb-5 pl-1">
          <BookOpen className="w-4.5 h-4.5 text-gray-400" />
          <span>{modulesCount} Modules</span>
        </div>

        {/* Divider */}
        <hr className="border-gray-100 w-full mb-5" />

        {/* Card Footer Actions */}
        <button
          onClick={() => { setIsDetailsOpen(true); }}
          className="flex items-center justify-between w-full mt-auto pt-1 text-left cursor-pointer group/footer"
        >
          <span className="text-[#D50032] font-extrabold text-sm sm:text-base group-hover/footer:text-[#FF3D00] transition-colors leading-none">
            View Program Details
          </span>
          <div className="w-9 h-9 rounded-full bg-[#FFF5F6] group-hover/footer:bg-[#D50032] group-hover/footer:scale-105 flex items-center justify-center text-[#D50032] group-hover/footer:text-white transition-all duration-300">
            <ChevronRight className="w-4.5 h-4.5 stroke-[2.5]" />
          </div>
        </button>
      </div>

      {/* Program Details Dialog */}
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
              <Button
                onClick={handleEnrollClick}
                disabled={enrollLoading}
                className="w-full sm:w-auto h-12 text-sm font-semibold rounded-xl px-8 shadow-lg hover:shadow-xl bg-gradient-to-r from-[#D50032] to-[#FF0000] text-white hover:from-[#D50032] hover:to-[#D50032] transition-all duration-300"
              >
                {enrollLoading ? "Opening Exam..." : "Enroll Now"}
              </Button>
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
  const [searchOpen, setSearchOpen] = useState(false);
  const isAuthenticated = !!localStorage.getItem("token");
  const [activeSlide, setActiveSlide] = useState(0);
  const [currentBgIdx, setCurrentBgIdx] = useState(0);

  useEffect(() => {
    const bgTimer = setInterval(() => {
      setCurrentBgIdx((prev) => (prev + 1) % 3);
    }, 1500);
    return () => clearInterval(bgTimer);
  }, []);

  const slides = [
    {
      title: "Start Your Trading Career",
      subtitle: "From beginner to funded professional in 90 days",
      buttonText: "Explore Programs",
      link: "#courses"
    },
    {
      title: "Learn from the Best",
      subtitle: "Get 1-on-1 mentorship from seasoned market experts",
      buttonText: "Meet Mentors",
      link: "/about"
    },
    {
      title: "Trade with Our Capital",
      subtitle: "Pass the challenge and unlock live trading accounts up to ₹50 Lakhs",
      buttonText: "Learn More",
      link: "#courses"
    }
  ];

  const [apiCourses, setApiCourses] = useState<any[]>([]);
  const [isCoursesExpanded, setIsCoursesExpanded] = useState(false);
  const [cmsSettings, setCmsSettings] = useState<any>({});
  const [blogStories, setBlogStories] = useState<any[]>([]);
  const [marketUpdates, setMarketUpdates] = useState<any[]>([]);
  const [selectedCourseForCheckout, setSelectedCourseForCheckout] = useState<any | null>(null);

  // States and refs for premium mobile autoslide behavior
  const coursesContainerRef = useRef<HTMLDivElement>(null);
  const [activeCourseIdx, setActiveCourseIdx] = useState(0);
  const [isCoursesPaused, setIsCoursesPaused] = useState(false);
  const touchTimeoutRef = useRef<any>(null);

  // States and refs for premium blog mobile autoslide behavior
  const blogScrollRef = useRef<HTMLDivElement>(null);
  const [blogActiveIndex, setBlogActiveIndex] = useState(0);
  const [isBlogPaused, setIsBlogPaused] = useState(false);
  const blogTouchTimeoutRef = useRef<any>(null);

  // States and refs for acronym vertical scroll reveal
  const acronymRef = useRef<HTMLDivElement>(null);
  const [isAcronymVisible, setIsAcronymVisible] = useState(false);

  // Responsive hook to scale curved timeline sizing
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  useEffect(() => {
    const handleResize = () => {
      setIsMobileViewport(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsAcronymVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
      }
    );

    if (acronymRef.current) {
      observer.observe(acronymRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const blogStoriesCount = blogStories.length > 0 ? blogStories.length : 4;

  const handleBlogScroll = () => {
    if (!blogScrollRef.current) return;
    const container = blogScrollRef.current;
    const cardWidth = container.firstElementChild?.getBoundingClientRect().width || 0;
    const gap = 16; // gap-4 is 16px
    const scrollLeft = container.scrollLeft;
    const currentIdx = Math.round(scrollLeft / (cardWidth + gap));
    if (currentIdx !== blogActiveIndex && currentIdx >= 0 && currentIdx < blogStoriesCount) {
      setBlogActiveIndex(currentIdx);
    }
  };

  const handleBlogTouchStart = () => {
    setIsBlogPaused(true);
    if (blogTouchTimeoutRef.current) clearTimeout(blogTouchTimeoutRef.current);
  };

  const handleBlogTouchEnd = () => {
    if (blogTouchTimeoutRef.current) clearTimeout(blogTouchTimeoutRef.current);
    blogTouchTimeoutRef.current = setTimeout(() => {
      setIsBlogPaused(false);
    }, 8000);
  };

  const coursesCount = isCoursesExpanded 
    ? (apiCourses.length > 0 ? apiCourses.length : 5) 
    : 3;

  // Handle manual scroll synchronization
  const handleCoursesScroll = () => {
    if (!coursesContainerRef.current) return;
    const container = coursesContainerRef.current;
    const cardWidth = container.firstElementChild?.getBoundingClientRect().width || 0;
    const gap = 24; // gap-6
    const scrollLeft = container.scrollLeft;
    const currentIdx = Math.round(scrollLeft / (cardWidth + gap));
    if (currentIdx !== activeCourseIdx && currentIdx >= 0 && currentIdx < coursesCount) {
      setActiveCourseIdx(currentIdx);
    }
  };

  // Autoslide Timer on Mobile
  useEffect(() => {
    if (isCoursesPaused) return;

    const timer = setInterval(() => {
      if (window.innerWidth < 768 && coursesContainerRef.current) {
        const nextIdx = (activeCourseIdx + 1) % coursesCount;
        setActiveCourseIdx(nextIdx);

        const container = coursesContainerRef.current;
        const cardWidth = container.firstElementChild?.getBoundingClientRect().width || 0;
        const gap = 24;
        container.scrollTo({
          left: nextIdx * (cardWidth + gap),
          behavior: "smooth"
        });
      }
    }, 4000);

    return () => clearInterval(timer);
  }, [activeCourseIdx, isCoursesPaused, coursesCount]);

  // Autoslide Timer on Mobile for Blog section
  useEffect(() => {
    if (isBlogPaused) return;

    const timer = setInterval(() => {
      if (window.innerWidth < 768 && blogScrollRef.current) {
        const nextIdx = (blogActiveIndex + 1) % blogStoriesCount;
        setBlogActiveIndex(nextIdx);

        const container = blogScrollRef.current;
        const cardWidth = container.firstElementChild?.getBoundingClientRect().width || 0;
        const gap = 16;
        container.scrollTo({
          left: nextIdx * (cardWidth + gap),
          behavior: "smooth"
        });
      }
    }, 4000);

    return () => clearInterval(timer);
  }, [blogActiveIndex, isBlogPaused, blogStoriesCount]);

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
      } catch (err) { }
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

  // States and refs for Why Choose FinTrade mobile autoslide
  const whyChooseScrollRef = useRef<HTMLDivElement>(null);
  const [whyChooseActiveIndex, setWhyChooseActiveIndex] = useState(0);
  const [isWhyChoosePaused, setIsWhyChoosePaused] = useState(false);
  const whyChooseTouchTimeoutRef = useRef<any>(null);
  const whyChooseCardsCount = 4;

  const handleWhyChooseScroll = () => {
    if (!whyChooseScrollRef.current) return;
    const container = whyChooseScrollRef.current;
    const cardWidth = container.firstElementChild?.getBoundingClientRect().width || 0;
    const gap = 24; // md:gap-6 (24px)
    const scrollLeft = container.scrollLeft;
    const currentIdx = Math.round(scrollLeft / (cardWidth + gap));
    if (currentIdx !== whyChooseActiveIndex && currentIdx >= 0 && currentIdx < whyChooseCardsCount) {
      setWhyChooseActiveIndex(currentIdx);
    }
  };

  useEffect(() => {
    if (isWhyChoosePaused) return;

    const timer = setInterval(() => {
      if (window.innerWidth < 768 && whyChooseScrollRef.current) {
        const nextIdx = (whyChooseActiveIndex + 1) % whyChooseCardsCount;
        setWhyChooseActiveIndex(nextIdx);

        const container = whyChooseScrollRef.current;
        const cardWidth = container.firstElementChild?.getBoundingClientRect().width || 0;
        const gap = 24;
        container.scrollTo({
          left: nextIdx * (cardWidth + gap),
          behavior: "smooth"
        });
      }
    }, 4000);

    return () => clearInterval(timer);
  }, [whyChooseActiveIndex, isWhyChoosePaused]);

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
      videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-tablet-displaying-financial-charts-40433-large.mp4"
    },
    {
      title: "Trading Simulator Walkthrough",
      subtitle: "Experience Real Markets, Zero Risk",
      duration: "2:10",
      thumbnail: "https://images.unsplash.com/photo-1612178991541-b48cc8e92a4d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
      videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-financial-data-on-a-monitor-screen-40431-large.mp4"
    },
    {
      title: "What Our Alumni Say",
      subtitle: "Hear from Placed Traders",
      duration: "4:55",
      thumbnail: "https://images.unsplash.com/photo-1659353221405-29b7d087f9e5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
      videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-business-charts-on-a-laptop-42171-large.mp4"
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
      {/* Dynamic Popping Ambient Glow */}
      <AmbientGlow />
      <CursorGlow />

      {/* Video Modal */}
      {videoOpen && (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-5xl aspect-video rounded-2xl overflow-hidden shadow-2xl bg-black">
            <button onClick={() => { setVideoOpen(false); setActiveVideoIdx(null); }} className="absolute top-4 right-4 z-10 text-white/70 hover:text-white bg-black/20 hover:bg-black/40 rounded-full p-2 transition-all">
              <X size={24} />
            </button>
            <video
              src={activeVideoIdx !== null && showcaseVideos[activeVideoIdx]?.videoUrl ? showcaseVideos[activeVideoIdx].videoUrl : "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"}
              autoPlay
              muted
              controls
              loop
              playsInline
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      )}

      {/* Ticker Strip - Positioned directly after header in normal flow */}
      <div className="relative z-[90] bg-[#121212]">
        <TickerStrip />
      </div>

      <div className="relative z-[50]">

        {/* Hero Section (Premium Dark Integrated Theme) */}
        <section
          className="relative pt-6 pb-8 md:pt-10 md:pb-10 overflow-hidden select-none bg-[#0b0f19] text-white"
        >
          {/* Auto Slider Background */}
          <div className="absolute inset-0 z-0">
            {["/background.jpg", "/backgroundimage-1.avif", "/backgroundimage-2.avif"].map((img, idx) => (
              <div
                key={img}
                className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out"
                style={{
                  backgroundImage: `linear-gradient(to bottom, rgba(11, 15, 25, 0.88), rgba(11, 15, 25, 0.96)), url('${img}')`,
                  opacity: currentBgIdx === idx ? 1 : 0,
                }}
              />
            ))}
          </div>

          {/* Subtle Accent Concentric Vectors / Glow Blobs */}
          <div className="absolute -top-40 -left-40 w-[450px] h-[450px] rounded-full border border-white/5 opacity-40 z-[1] pointer-events-none" />
          <div className="absolute -top-10 -right-10 w-[550px] h-[550px] rounded-full border border-white/5 opacity-40 z-[1] pointer-events-none" />
          <div className="absolute top-[40%] left-[10%] w-[300px] h-[300px] rounded-full bg-[#D50032]/5 blur-[90px] z-[1] pointer-events-none" />

          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 text-center">
            <ScrollReveal>

              {/* Top Pill Badge */}
              <div className="inline-flex items-center px-4.5 py-1.5 rounded-full mb-6 border border-white/10 bg-white/5 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-[#D50032] mr-2 inline-block animate-pulse" />
                <span className="text-[10px] md:text-xs font-black tracking-widest uppercase text-white/80">
                  India's First Structured Prop Trading Academy
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl md:text-6.5xl font-black mb-6 tracking-tight leading-none text-white font-sans max-w-4xl mx-auto uppercase">
                India&apos;s Trading <span className="text-[#D50032]">Powerhouse</span>
              </h1>

              {/* Subtitle */}
              <p className="text-sm sm:text-base md:text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed mb-10 font-medium">
                Learn to Earn — India's first structured Prop Trading Academy with paper trading capital. Build consistency, confidence, and profitability from basics to professional-level trading.
              </p>

              {/* Action Buttons Row */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4.5 max-w-2xl mx-auto mb-6">
                <Link to="/courses" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-[#D50032] hover:bg-[#FF3D00] text-white rounded-2xl px-8 py-5 h-auto text-base font-bold shadow-lg shadow-[#D50032]/20 transition-all hover:scale-105"
                  >
                    Apply Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>

                <button
                  onClick={() => { setActiveVideoIdx(0); setVideoOpen(true); }}
                  className="w-full sm:w-auto bg-white/5 hover:bg-white/10 text-white border border-white/15 rounded-2xl px-6 py-5 h-auto text-base font-bold transition-all inline-flex items-center justify-center gap-2.5"
                >
                  <span className="w-6 h-6 rounded-full bg-[#D50032] flex items-center justify-center shadow-sm">
                    <Play className="h-2.5 w-2.5 text-white ml-0.5 fill-white" />
                  </span>
                  Watch: The FinTrade Story
                </button>

                <a
                  href="#"
                  onClick={handleDownloadClick}
                  className="w-full sm:w-auto bg-white/5 hover:bg-white/10 text-white border border-white/15 rounded-2xl px-6 py-5 h-auto text-base font-bold transition-all inline-flex items-center justify-center gap-2.5"
                >
                  <Download className="h-4.5 w-4.5 text-white" />
                  Download Brochure
                </a>
              </div>

              {/* High-Impact Performance Metrics Row - Temporarily hidden for future admin integration */}
              {false && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-6 relative py-6 px-4 bg-white/[0.02] border border-white/5 backdrop-blur-sm rounded-[24px]">
                  {[
                    { val: "250+", lbl: "Traders Trained" },
                    { val: "₹25Cr+", lbl: "Capital Managed" },
                    { val: "20+", lbl: "Years Experience" },
                    { val: "95%", lbl: "Success Focus" }
                  ].map((m, idx) => (
                    <div key={idx} className="flex flex-col items-center justify-center text-center relative">
                      {idx > 0 && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[1px] h-8 bg-white/10 hidden md:block" />}
                      <span className="text-3xl md:text-4xl font-extrabold text-[#D50032] leading-none mb-1.5 font-sans">
                        {m.val}
                      </span>
                      <span className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">
                        {m.lbl}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Start Your Trading Career Slider Card */}
              <div className="relative max-w-4xl mx-auto mt-2 bg-[#131b2e]/40 border border-white/10 rounded-[32px] p-8 md:p-10 text-center shadow-[0_30px_70px_rgba(0,0,0,0.4)] overflow-hidden select-none backdrop-blur-xl">

                {/* Subtle Red Top Accent Bar */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-1 bg-[#D50032] rounded-b-full shadow-[0_0_15px_#D50032]" />

                {/* Slider content wrapper */}
                <div className="min-h-[110px] flex flex-col justify-center items-center px-6">
                  <h3 className="text-2xl md:text-3.5xl font-black tracking-tight text-white mb-2 leading-none font-sans">
                    {slides[activeSlide].title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-400 font-semibold mb-6 max-w-lg">
                    {slides[activeSlide].subtitle}
                  </p>
                  <Link to={slides[activeSlide].link}>
                    <Button
                      className="bg-[#D50032] hover:bg-[#FF3D00] text-white rounded-xl px-7 py-3 h-auto text-xs md:text-sm font-bold shadow-md shadow-[#D50032]/10 transition-all hover:scale-105"
                    >
                      {slides[activeSlide].buttonText}
                      <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>

                {/* Slider Left Arrow Navigation */}
                <button
                  onClick={() => setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length)}
                  className="w-8 h-8 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center text-white absolute left-4 md:left-6 top-1/2 -translate-y-1/2 cursor-pointer transition-all hover:scale-105 active:scale-95 animate-none"
                  style={{ background: "rgba(255,255,255,0.05)" }}
                  aria-label="Previous Slide"
                >
                  <ChevronLeft className="w-4 h-4 text-white" />
                </button>

                {/* Slider Right Arrow Navigation */}
                <button
                  onClick={() => setActiveSlide((prev) => (prev + 1) % slides.length)}
                  className="w-8 h-8 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center text-white absolute right-4 md:right-6 top-1/2 -translate-y-1/2 cursor-pointer transition-all hover:scale-105 active:scale-95 animate-none"
                  style={{ background: "rgba(255,255,255,0.05)" }}
                  aria-label="Next Slide"
                >
                  <ChevronRight className="w-4 h-4 text-white" />
                </button>

                {/* Slider Pagination Dots */}
                <div className="flex justify-center items-center gap-1.5 mt-8">
                  {slides.map((_, dotIdx) => (
                    <button
                      key={dotIdx}
                      onClick={() => setActiveSlide(dotIdx)}
                      className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${activeSlide === dotIdx ? "bg-[#D50032] w-5" : "bg-white/20 hover:bg-white/45"}`}
                      aria-label={`Go to slide ${dotIdx + 1}`}
                    />
                  ))}
                </div>

              </div>

            </ScrollReveal>
          </div>
        </section>

        {/* What is FinTrade & Acronym Section */}
        <section className="py-6 md:py-10 relative z-10 bg-white overflow-hidden border-b border-gray-100">
          {/* Decorative subtle background glows */}
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#D50032]/5 rounded-full blur-[120px] pointer-events-none" />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header: What FINTRADE Stands For */}
            <ScrollReveal>
              <div className="text-center mb-12 md:mb-16">
                <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full mb-4 border border-[#D50032]/20 bg-[#D50032]/5">
                  <span className="text-xs font-bold text-[#D50032] flex items-center gap-1">
                    💡 Discover FinTrade
                  </span>
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 text-gray-900 tracking-tight">
                  What <span className="text-[#D50032]">FINTRADE</span> Stands For
                </h2>
                <p className="text-base sm:text-lg text-gray-500 max-w-2xl mx-auto font-medium leading-relaxed">
                  Every letter reflects a core principle that shapes how we educate, train, and transform traders.
                </p>
              </div>
            </ScrollReveal>

            {/* Acronym Rows Stack */}
            <div ref={acronymRef} className="max-w-4xl mx-auto space-y-4">
              {[
                {
                  letter: "F",
                  title: "Financial Foundations",
                  desc: "Building strong financial foundations for growth and stability.",
                },
                {
                  letter: "I",
                  title: "Intelligence",
                  desc: "Using smart insights and knowledge to make better decisions.",
                },
                {
                  letter: "N",
                  title: "Networking",
                  desc: "Connecting people, ideas, and opportunities to create impact.",
                },
                {
                  letter: "T",
                  title: "Trading Strategy",
                  desc: "Mastering professional market execution and advanced trading systems.",
                },
                {
                  letter: "R",
                  title: "Risk Management",
                  desc: "Prioritizing capital preservation, risk-reward ratios, and strategic sizing.",
                },
                {
                  letter: "A",
                  title: "Analytics",
                  desc: "Turning live market data into actionable and profitable insights.",
                },
                {
                  letter: "D",
                  title: "Discipline",
                  desc: "Cultivating emotional control, patience, and consistent trading habits.",
                },
                {
                  letter: "E",
                  title: "Excellence",
                  desc: "Striving for continuous improvement and professional standards.",
                },
              ].map((item, idx) => {
                return (
                  <div
                    key={idx}
                    style={{ transitionDelay: `${idx * 150}ms` }}
                    className={`w-full rounded-2xl md:rounded-[24px] border border-gray-100 bg-[#FAFBFD]/30 p-4 md:p-5 flex items-center gap-4 md:gap-6 shadow-[0_8px_30px_rgba(0,0,0,0.005)] hover:border-[#D50032]/25 hover:shadow-[0_12px_45px_rgba(213,0,50,0.03)] hover:bg-white select-none relative overflow-hidden transition-all duration-700 ease-out transform ${
                      isAcronymVisible 
                        ? "opacity-100 translate-y-0" 
                        : "opacity-0 translate-y-8 pointer-events-none"
                    } group`}
                  >
                    {/* Glowing light background hover effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#D50032]/0 via-[#D50032]/[0.01] to-[#D50032]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    {/* Letter Square Box */}
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-[#FFF0F2] border border-[#D50032]/10 flex items-center justify-center flex-shrink-0 z-10 transition-transform duration-300 group-hover:scale-105">
                      <span className="text-xl md:text-2xl font-black text-[#D50032] font-sans">
                        {item.letter}
                      </span>
                    </div>

                    {/* Divider Line */}
                    <div className="h-8 w-[1px] bg-gray-200 flex-shrink-0 z-10 hidden md:block" />

                    {/* Title & Description Container */}
                    <div className="flex-1 flex flex-col md:flex-row md:items-center gap-1 md:gap-8 z-10">
                      {/* Title */}
                      <div className="w-full md:w-48 flex-shrink-0 text-left">
                        <span className="font-extrabold text-base md:text-lg text-gray-900 tracking-normal group-hover:text-[#D50032] transition-colors duration-300">
                          {item.title}
                        </span>
                      </div>
                      {/* Description */}
                      <div className="text-left">
                        <p className="text-gray-500 text-xs md:text-sm font-medium leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </div>

                    {/* Right Glowing Red Dot */}
                    <div className="flex-shrink-0 pr-1 md:pr-2 z-10">
                      <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-[#D50032] opacity-40 group-hover:opacity-100 group-hover:scale-125 transition-all duration-300 shadow-[0_0_8px_rgba(213,0,50,0.5)]" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 1. Featured Courses Section */}
        <section id="courses" className="pt-6 pb-2 md:py-8 relative z-10 bg-transparent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal>
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
                ref={coursesContainerRef}
                onScroll={handleCoursesScroll}
                onMouseEnter={() => setIsCoursesPaused(true)}
                onMouseLeave={() => setIsCoursesPaused(false)}
                onTouchStart={() => {
                  setIsCoursesPaused(true);
                  if (touchTimeoutRef.current) clearTimeout(touchTimeoutRef.current);
                }}
                onTouchEnd={() => {
                  touchTimeoutRef.current = setTimeout(() => {
                    setIsCoursesPaused(false);
                  }, 5000);
                }}
                className="flex md:grid md:grid-cols-3 gap-6 md:gap-8 overflow-x-auto md:overflow-x-visible pt-5 pb-4 md:pb-0 snap-x snap-mandatory scrollbar-hide px-4 -mx-4 md:px-0 md:mx-0 items-stretch"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {(apiCourses.length > 0
                  ? apiCourses.map((c: any) => {
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
                    })
                  : [
                      {
                        id: 13,
                        name: "Course 2",
                        level: "Beginner",
                        duration: "10 Days",
                        price: "₹1,299",
                        originalPrice: null,
                        savings: null,
                        shortDescription: "Course 2",
                        fullDescription: "Course 2.",
                        icon: BookOpen,
                        modules: [],
                      },
                      {
                        id: 11,
                        name: "c2",
                        level: "Beginner",
                        duration: "20 Days",
                        price: "₹23,233",
                        originalPrice: "₹199",
                        savings: null,
                        shortDescription: "asdfgh",
                        fullDescription: "asdfgh.",
                        icon: BookOpen,
                        modules: [],
                      },
                      {
                        id: 10,
                        name: "Course1",
                        level: "Beginner",
                        duration: "30 Days",
                        price: "₹4,999",
                        originalPrice: null,
                        savings: null,
                        shortDescription: "Course1",
                        fullDescription: "Course1.",
                        icon: BookOpen,
                        modules: [],
                      },
                      {
                        id: 9,
                        name: "c1",
                        level: "Beginner",
                        duration: "10 Days",
                        price: "₹20",
                        originalPrice: "₹299",
                        savings: "₹279",
                        shortDescription: "abcdefgh",
                        fullDescription: "abcdefgh.",
                        icon: BookOpen,
                        modules: [],
                      },
                      {
                        id: 8,
                        name: "a",
                        level: "Beginner",
                        duration: "10 Days",
                        price: "₹500",
                        originalPrice: "₹1,000",
                        savings: "₹500",
                        shortDescription: "a",
                        fullDescription: "a.",
                        icon: BookOpen,
                        modules: [],
                      }
                    ]
                ).slice(0, isCoursesExpanded ? undefined : 3).map((course, i) => (
                  <div key={i} className="flex-shrink-0 w-[290px] sm:w-[350px] md:w-full md:flex-shrink snap-center flex">
                    <CourseCard course={course} onEnroll={() => setSelectedCourseForCheckout(course)} />
                  </div>
                ))}
              </div>

              {((apiCourses.length > 3) || (apiCourses.length === 0)) && (
                <div className="mt-8 text-center">
                  <Button 
                    onClick={() => {
                      setIsCoursesExpanded(!isCoursesExpanded);
                      if (isCoursesExpanded) {
                        document.getElementById("courses")?.scrollIntoView({ behavior: "smooth" });
                      }
                    }}
                    className="bg-[#0B2A5B] text-[#F4F1EA] hover:bg-[#1a3d7a] px-8 py-2.5 rounded-full font-semibold transition-all shadow-md"
                  >
                    {isCoursesExpanded ? "View Less" : "View More Courses"}
                  </Button>
                </div>
              )}
            </ScrollReveal>
          </div>
        </section>

        {/* 2. Live Classes Section */}
        <section className="pt-2 pb-6 md:py-8 relative z-10 bg-white" style={{ backdropFilter: "blur(2px)" }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal>
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
                              <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" /> LIVE NOW
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
            </ScrollReveal>
          </div>
        </section>

        <ProgramModules apiCourses={apiCourses.length > 0 ? apiCourses : null} />

        {/* Program Benefits Section */}
        <section className="py-6 md:py-8 bg-transparent relative z-10 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 text-center">
            <ScrollReveal>
              <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full mb-4 border border-[#D50032]/20 bg-[#D50032]/5">
                <span className="text-xs font-bold text-[#D50032] flex items-center gap-1">
                  🎁 Key Advantages
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 text-gray-900 tracking-tight text-center uppercase">
                Program <span className="text-[#D50032]">Benefits</span>
              </h2>
              <p className="text-base sm:text-lg text-gray-500 max-w-3xl mx-auto font-medium text-center leading-relaxed">
                Everything you need to become a consistently profitable, professional trader.
              </p>
            </ScrollReveal>
          </div>

          {/* Marquee Wrapper */}
          <div className="relative w-full flex overflow-x-hidden py-4">
            <div className="animate-marquee flex gap-6 whitespace-nowrap" style={{ display: 'flex', minWidth: '100%' }}>
              {benefits.concat(benefits).map((b, idx) => {
                const Icon = b.icon;
                return (
                  <div
                    key={idx}
                    className="w-[280px] sm:w-[320px] p-6 bg-white border border-gray-100 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.015)] hover:shadow-[0_12px_40px_rgba(213,0,50,0.04)] hover:border-[#D50032]/10 transition-all duration-300 flex-shrink-0 flex flex-col group select-none whitespace-normal text-left"
                  >
                    <div className="flex items-start justify-between mb-5">
                      {/* Number Badge */}
                      <span className="text-2xl font-black text-[#D50032]/15 group-hover:text-[#D50032]/30 transition-colors duration-300">
                        {b.num}
                      </span>
                      {/* Icon Box */}
                      <div className="w-10 h-10 rounded-xl bg-[#D50032]/5 text-[#D50032] flex items-center justify-center shadow-sm border border-[#D50032]/10 group-hover:scale-110 transition-transform duration-300">
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>

                    <div>
                      <h3 className="font-extrabold text-gray-900 text-base sm:text-lg mb-2 group-hover:text-[#D50032] transition-colors duration-300">
                        {b.title}
                      </h3>
                      <p className="text-gray-500 text-xs sm:text-sm leading-relaxed font-medium">
                        {b.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <style>{`
            @keyframes marquee {
              0% { transform: translate3d(0, 0, 0); }
              100% { transform: translate3d(-50%, 0, 0); }
            }
            .animate-marquee {
              animation: marquee 18s linear infinite;
            }
            .animate-marquee:hover {
              animation-play-state: paused;
            }
          `}</style>
          </div>
        </section>

        {/* Learning Path Section */}
        <section className="py-4 md:py-6 bg-transparent relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal>
              {/* Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full mb-4 border border-[#D50032]/20 bg-[#D50032]/5">
                  <span className="text-xs font-bold text-[#D50032] flex items-center gap-1">
                    🗺️ Course Roadmap
                  </span>
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 text-gray-900 tracking-tight text-center">
                  Your <span className="text-[#D50032]">Learning Path</span>
                </h2>
                <p className="text-base sm:text-lg text-gray-500 max-w-2xl mx-auto font-medium text-center">
                  A structured roadmap from beginner to professional trader
                </p>
              </div>

              {/* Curved Learning Path Card (Fully Responsive - Zero Scroll) */}
              <div className="w-full bg-white border border-gray-100 rounded-[24px] md:rounded-[40px] shadow-[0_15px_50px_rgba(0,0,0,0.02)] p-4 sm:p-6 md:p-8 relative overflow-hidden">
                <div className="w-full relative">
                  <div className={`relative w-full select-none ${isMobileViewport ? "aspect-[1000/1350]" : "aspect-[1000/680]"}`}>

                    {/* Curve Line SVG */}
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 600" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
                      {/* Dashed base line (locked path) */}
                      <path
                        d="M 200,520 C 300,520 400,450 500,380 C 600,310 700,310 800,240 C 900,170 800,130 550,120 C 450,110 360,110 360,110"
                        className="stroke-gray-200 stroke-[3.5px] lg:stroke-[6px]"
                        strokeLinecap="round"
                        strokeDasharray="12 10"
                      />

                      {/* Completed gold path (1 to 3) */}
                      <path
                        d="M 200,520 C 300,520 400,450 500,380"
                        stroke="url(#completedGradient)"
                        className="stroke-[5px] lg:stroke-[8px]"
                        strokeLinecap="round"
                      />

                      {/* Gradient Definitions */}
                      <defs>
                        <linearGradient id="completedGradient" x1="0%" y1="100%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#10B981" />
                          <stop offset="100%" stopColor="#D50032" />
                        </linearGradient>
                      </defs>
                    </svg>

                    {/* Render Steps */}
                    {[
                      { num: "1", title: "Market Foundations", desc: "Markets, exchanges & instruments", status: "completed", x: 20, y: 86.6, align: isMobileViewport ? "right" : "bottom", isStart: true },
                      { num: "2", title: "Technical Analysis", desc: "Chart patterns & price action", status: "completed", x: 35, y: 76.6, align: isMobileViewport ? "left" : "top" },
                      { num: "3", title: "Risk Management", desc: "Position sizing & capital protection", status: "current", x: 50, y: 63.3, align: isMobileViewport ? "right" : "bottom", isCurrent: true },
                      { num: "4", title: "Trading Psychology", desc: "Emotional discipline & consistency", status: "locked", x: 65, y: 53.3, align: isMobileViewport ? "left" : "top" },
                      { num: "5", title: "Options & Derivatives", desc: "Options pricing, Greeks & hedging", status: "locked", x: 80, y: 40, align: isMobileViewport ? "left" : "bottom" },
                      {num: "6", title: "Advanced Strategies", desc: "Algo trading & quant analysis", status: "locked", x: 72, y: 26.6, align: isMobileViewport ? "left" : "top"},
                      {num: "7", title: "Trading Simulator", desc: "Live practice with virtual capital", status: "locked", x: 55, y: 20, align: isMobileViewport ? "right" : "bottom"},
                      { num: "8", title: "Certification & Placement", desc: "Final assessment & placement", status: "locked", x: 36, y: 18.3, align: isMobileViewport ? "top" : "top", isSummit: true },
                    ].map((step, idx) => {
                      const isCompleted = step.status === "completed";
                      const isCurrent = step.status === "current";

                      return (
                        <div key={idx}>
                          {/* Node Circle */}
                          <div
                            className="absolute -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center transition-all duration-300 hover:scale-115 cursor-pointer origin-center"
                            style={{ left: `${step.x}%`, top: `${step.y}%` }}
                          >
                            {isCurrent ? (
                              <div className="relative flex items-center justify-center">
                                {/* Outer pulse rings */}
                                <div className={`absolute rounded-full bg-[#D50032]/25 animate-ping ${isMobileViewport ? 'w-5 h-5' : 'w-12 h-12'}`} />
                                <div className={`absolute rounded-full bg-[#D50032]/40 ${isMobileViewport ? 'w-3.5 h-3.5' : 'w-9 h-9'}`} />
                                {/* Inner circle */}
                                <div className={`rounded-full bg-[#D50032] border-2 border-white shadow-md flex items-center justify-center text-white font-extrabold relative z-30 ${isMobileViewport ? 'w-3 h-3 text-[5.5px]' : 'w-8 h-8 text-sm'}`}>
                                  {step.num}
                                </div>
                                {/* Current Module Pill Badge */}
                                <div className={`absolute bg-[#D50032] text-white font-black uppercase rounded-full shadow-sm z-30 whitespace-nowrap ${isMobileViewport ? 'top-4 px-1 py-0.5 text-[4.5px]' : 'top-10 px-2.5 py-0.5 text-[9px]'}`}>
                                  Current Module
                                </div>
                              </div>
                            ) : isCompleted ? (
                              <div className={`rounded-full bg-emerald-500 border-2 border-white shadow flex items-center justify-center text-white z-30 ${isMobileViewport ? 'w-3 h-3' : 'w-7 h-7'}`}>
                                <CheckCircle className={`fill-emerald-500 stroke-white stroke-[3px] ${isMobileViewport ? 'w-1.5 h-1.5' : 'w-5 h-5'}`} />
                              </div>
                            ) : (
                              <div className={`rounded-full bg-gray-200 border-2 border-white shadow flex items-center justify-center text-gray-500 font-extrabold z-30 ${isMobileViewport ? 'w-3 h-3 text-[5.5px]' : 'w-7 h-7 text-xs'}`}>
                                {step.num}
                              </div>
                            )}

                            {/* Start Label */}
                            {step.isStart && (
                              <div className={`absolute font-black uppercase text-gray-400 tracking-wider ${isMobileViewport ? '-top-3.5 text-[5.5px]' : '-top-6 text-[10px]'}`}>
                                Start
                              </div>
                            )}

                            {/* Summit Label */}
                            {step.isSummit && (
                              <div className={`absolute font-black uppercase text-[#D50032] tracking-wider flex items-center gap-0.5 ${isMobileViewport ? 'bottom-3.5 text-[5.5px]' : 'bottom-8 text-[10px]'}`}>
                                🏆 Summit
                              </div>
                            )}
                          </div>

                          {/* Label Container */}
                          <div
                            className={`absolute -translate-y-1/2 z-10 ${step.align === "left" ? "text-right" : (step.align === "top" || step.align === "bottom") ? "text-center" : "text-left"}`}
                            style={{
                              width: `${isMobileViewport ? 105 : 200}px`,
                              left: step.align === "left"
                                ? `calc(${step.x}% - ${isMobileViewport ? 117 : 220}px)`
                                : (step.align === "top" || step.align === "bottom")
                                  ? `calc(${step.x}% - ${isMobileViewport ? 52 : 100}px)`
                                  : `calc(${step.x}% + ${isMobileViewport ? 12 : 20}px)`,
                              top: isMobileViewport
                                ? step.num === "8"
                                  ? `calc(${step.y}% - 40px)`
                                  : step.num === "7"
                                    ? `calc(${step.y}% - 18px)`
                                    : step.num === "6"
                                      ? `calc(${step.y}% + 18px)`
                                      : step.num === "3"
                                        ? `calc(${step.y}% + 22px)` // Shifts down to clear the "CURRENT MODULE" badge!
                                        : step.align === "top"
                                          ? `calc(${step.y}% - 22px)`
                                          : step.align === "bottom"
                                            ? `calc(${step.y}% + 22px)`
                                            : `${step.y}%`
                                : step.align === "top"
                                  ? `calc(${step.y}% - 58px)`
                                  : step.align === "bottom"
                                    ? `calc(${step.y}% + 58px)`
                                    : `${step.y}%`
                            }}
                          >
                            <h3
                              className={`font-black tracking-normal mb-1.5 ${
                                isCurrent ? "text-[#D50032]" : isCompleted ? "text-gray-900" : "text-gray-400"
                              } ${isMobileViewport ? 'text-[8.5px] leading-tight mb-0.5 font-black' : 'text-sm sm:text-base font-black'}`}
                            >
                              {step.title}
                            </h3>
                            <p className={`font-semibold leading-normal inline-block ${isMobileViewport ? 'text-gray-455 text-[6.8px] leading-tight max-w-[100px]' : 'text-gray-500 text-[10px] sm:text-xs max-w-[200px]'}`}>
                              {step.desc}
                            </p>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Bottom Legend */}
                <div className="flex justify-center items-center gap-4 sm:gap-6 mt-4 pt-4 border-t border-gray-100 text-[9px] sm:text-xs font-semibold text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-emerald-500" />
                    Completed
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-[#D50032]" />
                    Current
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-gray-200" />
                    Locked
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Our Services Section */}
        <section className="pt-6 pb-2 md:py-8 bg-transparent relative z-10 overflow-hidden border-t border-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 text-center">
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full mb-4 border border-[#D50032]/20 bg-[#D50032]/5">
              <span className="text-xs font-bold text-[#D50032] flex items-center gap-1">
                ⚙️ What We Offer
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 text-gray-900 tracking-tight text-center uppercase">
              Our <span className="text-[#D50032]">Services</span>
            </h2>
            <p className="text-base sm:text-lg text-gray-500 max-w-3xl mx-auto font-medium text-center leading-relaxed">
              We provide dynamic, modern tools and programs to support your journey.
            </p>
          </div>

          {/* Single marquee */}
          <div className="relative w-full flex flex-col gap-6 overflow-x-hidden py-4 select-none">
            {/* Row 1 - Forward */}
            <div className="animate-marquee flex gap-6 whitespace-nowrap" style={{ display: 'flex', minWidth: '100%' }}>
              {servicesCards.concat(servicesCards).map((s, idx) => {
                const Icon = s.icon;
                return (
                  <div
                    key={idx}
                    className="w-[280px] sm:w-[320px] p-6 bg-white border border-gray-100 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.015)] hover:shadow-[0_12px_40px_rgba(213,0,50,0.04)] hover:border-[#D50032]/10 transition-all duration-300 flex-shrink-0 flex flex-col group select-none whitespace-normal text-left"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-[#FFF5F6] border border-[#D50032]/8 text-[#D50032] flex items-center justify-center mb-5 group-hover:scale-105 transition-transform duration-300">
                      <Icon className="h-6 w-6 stroke-[2.5]" />
                    </div>

                    <div>
                      <h3 className="font-extrabold text-gray-900 text-base sm:text-lg mb-2 group-hover:text-[#D50032] transition-colors duration-300">
                        {s.title}
                      </h3>
                      <p className="text-gray-500 text-xs sm:text-sm leading-relaxed font-medium">
                        {s.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </section>

        {/* 4. Vertical Video Section */}
        <VerticalVideoSection />

        {/* 5. FinTrade Blog Section */}
        <section className="py-4 md:py-6 relative z-10 bg-transparent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal>
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-4 gap-4">
                <div>
                  <div className="inline-block px-3 py-1 rounded-full mb-1 border border-[#D50032]/30" style={{ background: "rgba(213,0,50,0.08)" }}>
                    <span className="text-[#D50032] font-semibold text-xs">✍️ Latest from Blog</span>
                  </div>
                  <h2 className="text-2xl font-bold mb-1.5" style={{ color: "#121212" }}>Market Insights & Articles</h2>
                  <p className="text-sm text-gray-500">Stay updated with our research and trading strategies</p>
                </div>
                <Link to="/category/technical-analysis">
                  <Button variant="outline" className="border-2 border-[#D50032] text-[#D50032] hover:bg-[#D50032] hover:text-white transition-all duration-300 py-1.5 px-3.5 text-sm h-9">
                    View All Articles
                    <ArrowRight className="ml-2.5 h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>

              <div className="grid lg:grid-cols-12 gap-5 items-stretch">
                {/* Featured Video (Left Side) */}
                <div className="lg:col-span-5">
                  {marketUpdates.length > 0 ? (
                    <Card 
                      onClick={() => { setActiveVideoIdx(0); setVideoOpen(true); }}
                      className="overflow-hidden border-0 shadow-md relative group h-full flex flex-col cursor-pointer"
                    >
                      <div className="relative flex-1 min-h-[180px]">
                        <img
                          src={marketUpdates[0].thumbnail_url || "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80"}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          alt={marketUpdates[0].title}
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <div className="w-14 h-14 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl" style={{ background: "#D50032", boxShadow: "0 0 30px rgba(213,0,50,0.5)" }}>
                            <Play className="h-5 w-5 text-white ml-0.5" />
                          </div>
                        </div>
                      </div>
                      <div className="p-4 bg-white">
                        <h3 className="text-base font-bold mb-1" style={{ color: "#121212" }}>{marketUpdates[0].title}</h3>
                        <p className="text-xs text-gray-500 line-clamp-2">{marketUpdates[0].content}</p>
                      </div>
                    </Card>
                  ) : (
                    <Card 
                      onClick={() => { setActiveVideoIdx(0); setVideoOpen(true); }}
                      className="overflow-hidden border-0 shadow-md relative group h-full flex flex-col cursor-pointer"
                    >
                      <div className="relative flex-1 min-h-[180px]">
                        <img
                          src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80"
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          alt="Featured Video"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <div className="w-14 h-14 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl" style={{ background: "#D50032", boxShadow: "0 0 30px rgba(213,0,50,0.5)" }}>
                            <Play className="h-5 w-5 text-white ml-0.5" />
                          </div>
                        </div>
                      </div>
                      <div className="p-4 bg-white">
                        <h3 className="text-base font-bold mb-1" style={{ color: "#121212" }}>FinTrade: Master the Market Dynamics</h3>
                        <p className="text-xs text-gray-500">Watch our exclusive masterclass on market analysis and risk management techniques for 2026.</p>
                      </div>
                    </Card>
                  )}
                </div>

                {/* Blog Stories (4 Cards) */}
                <div
                  ref={blogScrollRef}
                  onScroll={handleBlogScroll}
                  onTouchStart={handleBlogTouchStart}
                  onTouchEnd={handleBlogTouchEnd}
                  className="lg:col-span-7 flex md:grid md:grid-cols-2 gap-4 overflow-x-auto lg:overflow-x-visible pb-6 lg:pb-0 snap-x snap-mandatory scrollbar-hide px-4 -mx-4 lg:px-0 lg:mx-0 items-stretch"
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                  {blogStories.length > 0 ? blogStories.map((story, i) => (
                    <Card key={i} className="min-w-[85vw] sm:min-w-[300px] md:min-w-0 flex flex-col border-0 shadow-md group hover:-translate-y-1 transition-all duration-300 snap-center">
                      <div className="h-32 overflow-hidden relative">
                        <img src={story.thumbnail_url || "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80"} alt={story.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2.5 py-0.5 rounded-full text-[10px] font-bold text-[#D50032]">
                          Blog
                        </div>
                      </div>
                      <div className="p-4 flex flex-col flex-1">
                        <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1.5">
                          <span className="flex items-center gap-1"><FileText size={12} />Read</span>
                          <span>5 min read</span>
                        </div>
                        <h3 className="font-bold text-sm mb-1 line-clamp-2 hover:text-[#D50032] transition-colors cursor-pointer" style={{ color: "#121212" }}>{story.title}</h3>
                        <p className="text-xs text-gray-500 mb-2 line-clamp-2 flex-1">{story.content}</p>
                        <Link to="/blog" className="text-[#D50032] font-semibold text-xs flex items-center group-hover:gap-1.5 transition-all">
                          Read Story <ChevronRight size={14} />
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
                    <Card key={i} className="min-w-[85vw] sm:min-w-[300px] md:min-w-0 flex flex-col border-0 shadow-md group hover:-translate-y-1 transition-all duration-300 snap-center">
                      <div className="h-32 overflow-hidden relative">
                        <img src={post.img} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2.5 py-0.5 rounded-full text-[10px] font-bold text-[#D50032]">
                          {post.category}
                        </div>
                      </div>
                      <div className="p-4 flex flex-col flex-1">
                        <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1.5">
                          <span className="flex items-center gap-1"><FileText size={12} /> Article</span>
                          <span>{post.readTime}</span>
                        </div>
                        <h3 className="font-bold text-sm mb-1 line-clamp-2 hover:text-[#D50032] transition-colors cursor-pointer" style={{ color: "#121212" }}>{post.title}</h3>
                        <p className="text-xs text-gray-500 mb-2 line-clamp-2 flex-1">{post.desc}</p>
                        <button className="text-[#D50032] font-semibold text-xs flex items-center group-hover:gap-1.5 transition-all mt-auto self-start">
                          Read Full Article <ChevronRight size={16} />
                        </button>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Mobile Dot Indicators for Blog Section */}
                <div className="flex md:hidden gap-1.5 justify-center items-center mt-1 w-full">
                  {Array.from({ length: blogStoriesCount }).map((_, idx) => {
                    const isActive = idx === blogActiveIndex;
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          setIsBlogPaused(true);
                          setBlogActiveIndex(idx);
                          const container = blogScrollRef.current;
                          if (container) {
                            const cardWidth = container.firstElementChild?.getBoundingClientRect().width || 0;
                            const gap = 16;
                            container.scrollTo({
                              left: idx * (cardWidth + gap),
                              behavior: "smooth"
                            });
                          }
                          if (blogTouchTimeoutRef.current) clearTimeout(blogTouchTimeoutRef.current);
                          blogTouchTimeoutRef.current = setTimeout(() => {
                            setIsBlogPaused(false);
                          }, 8000);
                        }}
                        className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${isActive ? "w-5 bg-[#D50032]" : "w-1.5 bg-gray-300 hover:bg-gray-400"
                          }`}
                      />
                    );
                  })}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* 6.5 Certification Section (Moved below Modules) */}
        <CertificatePreview />

        {/* EMI & Payment Plans Section */}
        <EMIHighlight />

        {/* Placement & Career Opportunities Orbit Section */}
        <CareerPathways />


        {/* 8. Why Choose FinTrade */}
        <section id="about" className="py-6 md:py-8 bg-white relative z-10 overflow-hidden">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

            <ScrollReveal>
              {/* Section Header */}
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-1.5 px-4.5 py-1.5 rounded-full mb-3 border border-[#D50032]/25 bg-[#D50032]/5">
                  <span className="text-[#D50032] font-extrabold text-xs tracking-wider uppercase">💡 Our Edge</span>
                </div>
                <h2 className="text-3xl md:text-4.5xl font-black mb-3 text-gray-900 tracking-tight">
                  Why Choose <span className="text-[#D50032]">FinTrade</span>
                </h2>
                <p className="text-base sm:text-lg text-gray-500 max-w-xl mx-auto leading-relaxed">
                  Everything you need to become a successful trader
                </p>
              </div>

              {/* Cards Grid / Carousel */}
              <div
                ref={whyChooseScrollRef}
                onScroll={handleWhyChooseScroll}
                onTouchStart={() => {
                  setIsWhyChoosePaused(true);
                  if (whyChooseTouchTimeoutRef.current) clearTimeout(whyChooseTouchTimeoutRef.current);
                }}
                onTouchEnd={() => {
                  if (whyChooseTouchTimeoutRef.current) clearTimeout(whyChooseTouchTimeoutRef.current);
                  whyChooseTouchTimeoutRef.current = setTimeout(() => {
                    setIsWhyChoosePaused(false);
                  }, 8000);
                }}
                className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 overflow-x-auto md:overflow-x-visible pb-6 md:pb-0 snap-x snap-mandatory scrollbar-hide px-4 -mx-4 md:px-0 md:mx-0 items-stretch"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {[
                  { icon: Brain, title: "AI Tutor Support", description: "Get personalized AI-powered guidance throughout your learning journey with real-time doubt resolution.", num: "01" },
                  { icon: BookOpen, title: "Structured Curriculum", description: "Follow a proven step-by-step curriculum designed by industry professionals and expert traders.", num: "02" },
                  { icon: LineChart, title: "Real Trading Simulation", description: "Practice with our advanced trading simulator using virtual capital in real market conditions.", num: "03" },
                  { icon: Trophy, title: "Placement Opportunities", description: "Get access to placement support with leading prop trading firms and financial institutions.", num: "04" },
                ].map((feature, i) => (
                  <div key={i} className="flex-shrink-0 w-[270px] sm:w-[320px] md:w-full md:flex-shrink snap-center flex">
                    <div className="w-full flex flex-col justify-between overflow-hidden rounded-[28px] border border-gray-100/90 bg-white p-7 shadow-[0_12px_40px_rgba(0,0,0,0.012)] hover:-translate-y-1.5 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] hover:border-[#D50032]/10 transition-all duration-300 group select-none">
                      <div>
                        {/* Top Row */}
                        <div className="flex justify-between items-center w-full">
                          {/* Circular pink icon container */}
                          <div className="w-12 h-12 rounded-full bg-[#FFF0F2] flex items-center justify-center flex-shrink-0">
                            <feature.icon className="h-6 w-6 text-[#D50032]" />
                          </div>

                          {/* Large translucent numbers */}
                          <span className="text-5xl font-black text-gray-100/80 tracking-tighter leading-none font-sans">
                            {feature.num}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-lg font-black text-gray-950 mt-6 tracking-tight text-left">
                          {feature.title}
                        </h3>

                        {/* Description */}
                        <p className="text-gray-500 text-sm leading-relaxed mt-2.5 text-left">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Mobile Dot Indicators for Why Choose Section */}
              <div className="flex md:hidden gap-1.5 justify-center items-center mt-4 w-full">
                {Array.from({ length: whyChooseCardsCount }).map((_, idx) => {
                  const isActive = idx === whyChooseActiveIndex;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setIsWhyChoosePaused(true);
                        setWhyChooseActiveIndex(idx);
                        const container = whyChooseScrollRef.current;
                        if (container) {
                          const cardWidth = container.firstElementChild?.getBoundingClientRect().width || 0;
                          const gap = 24;
                          container.scrollTo({
                            left: idx * (cardWidth + gap),
                            behavior: "smooth"
                          });
                        }
                        if (whyChooseTouchTimeoutRef.current) clearTimeout(whyChooseTouchTimeoutRef.current);
                        whyChooseTouchTimeoutRef.current = setTimeout(() => {
                          setIsWhyChoosePaused(false);
                        }, 8000);
                      }}
                      className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                        isActive ? "w-5 bg-[#D50032]" : "w-1.5 bg-gray-300 hover:bg-gray-400"
                      }`}
                    />
                  );
                })}
              </div>
            </ScrollReveal>

          </div>
        </section>

        {/* Leadership Section */}
        <section className="py-12 bg-white relative z-10 border-t border-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal>
              <ExpertProfile />
            </ScrollReveal>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-6 md:py-8 bg-white relative z-10 overflow-hidden">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal>
              <div className="relative bg-white border border-[#D50032]/8 rounded-[32px] p-8 md:p-12 text-center shadow-[0_15px_40px_rgba(213,0,50,0.02)] overflow-hidden select-none">

                {/* Top glowing red gradient bar */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 md:w-44 h-1.5 bg-gradient-to-r from-[#D50032] via-[#FF4D6D] to-[#D50032] rounded-b-full shadow-[0_2px_10px_rgba(213,0,50,0.4)]" />

                {/* Heading */}
                <h2 className="text-3xl md:text-5xl font-black tracking-tight text-gray-950 leading-tight font-sans">
                  THE MARKET'S MOVING,<br />
                  <span className="text-[#D50032]">ARE YOU?</span>
                </h2>

                {/* Subtitle */}
                <p className="text-gray-600 font-semibold text-sm sm:text-base max-w-xl mx-auto leading-relaxed mt-4.5 mb-8">
                  Join hundreds of traders who have transformed their financial future with The FinTrade Academy.
                </p>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4.5">
                  <Link to="/courses" className="w-full sm:w-auto">
                    <button className="w-full sm:w-auto py-3.5 px-8 rounded-2xl bg-gradient-to-r from-[#D50032] to-[#FF3D00] text-white font-extrabold text-sm hover:shadow-[0_8px_25px_rgba(213,0,50,0.35)] transition-all duration-300 transform active:scale-98 cursor-pointer flex items-center justify-center gap-1">
                      Apply Now <span>→</span>
                    </button>
                  </Link>

                  <a href="#" onClick={handleDownloadClick} className="w-full sm:w-auto">
                    <button className="w-full sm:w-auto py-3.5 px-8 rounded-2xl border border-[#D50032] text-[#D50032] font-extrabold text-sm bg-white hover:bg-[#D50032]/5 transition-all duration-300 transform active:scale-98 cursor-pointer flex items-center justify-center gap-1.5 shadow-[0_4px_12px_rgba(0,0,0,0.01)] border-solid">
                      <Download className="w-4.5 h-4.5 stroke-[2.5]" />
                      Download Brochure
                    </button>
                  </a>
                </div>

                {/* Bottom glowing red gradient bar */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 md:w-44 h-1.5 bg-gradient-to-r from-[#D50032] via-[#FF4D6D] to-[#D50032] rounded-t-full shadow-[0_-2px_10px_rgba(213,0,50,0.4)]" />

              </div>
            </ScrollReveal>
          </div>
        </section>



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
              window.location.href = "/student/modules";
            }}
          />
        )}
      </div>
    </div>
  );
}
