import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router";
import api from "../services/api";
import { Play, TrendingUp, Award, Users, BookOpen, LineChart, Video, CheckCircle, Star, ArrowRight, BarChart3, Brain, Target, Trophy, X, FileText, Search, Phone, Download, Instagram, Youtube, Linkedin, Twitter, Facebook, ChevronRight, ChevronLeft, ChevronDown, Shield, UserCheck, Monitor, Wifi, Activity, ClipboardCheck, GitBranch, Cpu, Clock, Mail, MapPin } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../components/ui/input-otp";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion";
import ShareButton from "../components/ShareButton";
import StudentStats from "../components/home/StudentStats";
import VerticalVideoSection from "../components/home/VerticalVideoSection";
import { AnimatePresence } from "framer-motion";

import EMIHighlight from "../components/home/EMIHighlight";
import KeyInsights from "../components/home/KeyInsights";
import CertificatePreview from "../components/home/CertificatePreview";
import PlatformFeatures from "../components/home/PlatformFeatures";
import CareerPathways from "../components/home/CareerPathways";
import ModuleRoadmap from "../components/home/ModuleRoadmap";
import ProgramModules from "../components/home/ProgramModules";
import CourseCheckoutModal from "../components/CourseCheckoutModal";
import { motion } from "motion/react";

const getImageUrl = (path?: string) => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) return path;
  const base = api.defaults.baseURL || "";
  const cleanBase = base.endsWith("/") ? base.slice(0, -1) : base;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
};

const getBgImageUrl = (path?: string) => {
  if (!path) return "";
  if (path.startsWith("/background") || path.startsWith("/static")) return path;
  return getImageUrl(path);
};

const officeCountries = [
  { code: "in", logo_url: "", country: "India", address: "10th Floor, Shivalik Complex, Panchvati Circle, Ahmedabad, Gujarat 380006", email: "india@thefintrade.com", phone: "+91 92746 75947", contact: "Mansi Patel" },
  { code: "ae", logo_url: "", country: "UAE", address: "Business Bay, Dubai, United Arab Emirates", email: "uae@thefintrade.com", phone: "+971 52 418 9042", contact: "Ahmed Khan" },
  { code: "gb", logo_url: "", country: "United Kingdom", address: "Canary Wharf, London E14, United Kingdom", email: "uk@thefintrade.com", phone: "+44 20 4571 8840", contact: "Oliver Bennett" },
  { code: "us", logo_url: "", country: "United States", address: "Wall Street, New York, NY 10005, United States", email: "usa@thefintrade.com", phone: "+1 212 555 0186", contact: "Sophia Carter" },
  { code: "ca", logo_url: "", country: "Canada", address: "Bay Street, Toronto, ON M5J, Canada", email: "canada@thefintrade.com", phone: "+1 416 555 0148", contact: "Liam Martin" },
  { code: "au", logo_url: "", country: "Australia", address: "George Street, Sydney NSW 2000, Australia", email: "australia@thefintrade.com", phone: "+61 2 8015 6820", contact: "Emily Wilson" },
  { code: "sg", logo_url: "", country: "Singapore", address: "Marina Bay Financial Centre, Singapore 018981", email: "singapore@thefintrade.com", phone: "+65 3159 2147", contact: "Wei Tan" },
  { code: "de", logo_url: "", country: "Germany", address: "Taunusanlage, Frankfurt am Main 60329, Germany", email: "germany@thefintrade.com", phone: "+49 69 2475 0190", contact: "Lukas Weber" },
  { code: "fr", logo_url: "", country: "France", address: "La Defense, Paris 92800, France", email: "france@thefintrade.com", phone: "+33 1 89 71 2044", contact: "Camille Laurent" },
  { code: "jp", logo_url: "", country: "Japan", address: "Marunouchi, Chiyoda-ku, Tokyo 100-0005, Japan", email: "japan@thefintrade.com", phone: "+81 3 4578 9120", contact: "Kenji Sato" },
  { code: "za", logo_url: "", country: "South Africa", address: "Sandton Financial District, Johannesburg 2196, South Africa", email: "africa@thefintrade.com", phone: "+27 10 500 7812", contact: "Aisha Naidoo" },
];

// Interactive Cursor Glow
function CursorGlow() {
  return null;
}


// Dynamic "Popping" Ambient Glow
function AmbientGlow() {
  return null;
}

function OfficePresenceStrip({ offices = officeCountries }: { offices?: typeof officeCountries }) {
  if (!offices || offices.length === 0) return null;

  const getOfficeLogo = (office: any, size = 40) => {
    if (office.logo_url) return getImageUrl(office.logo_url);
    return `https://flagcdn.com/w${size}/${(office.code || "in").toLowerCase()}.png`;
  };

  return (
    <div className="relative z-[80] mt-5 left-1/2 w-screen -translate-x-1/2 overflow-visible border-y border-[#0B2A5B]/10 bg-[#F4F1EA] shadow-[0_12px_32px_rgba(0,0,0,0.08)]">
      <div className="overflow-visible">
        <div className="flex w-full items-center gap-0 px-1 py-2">
          <div className="flex h-5 w-[132px] flex-shrink-0 items-center gap-1.5 border-r border-[#0B2A5B]/15 px-2.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#D50032] shadow-[0_0_10px_#D50032]" />
            <span className="whitespace-nowrap text-[9px] font-black uppercase tracking-[0.18em] text-[#D50032] font-sans">
              Global Offices
            </span>
          </div>
            {offices.map((office, index) => (
              <div
                key={office.country}
                className="group relative flex h-5 min-w-0 flex-1 items-center justify-center gap-1 border-r border-[#0B2A5B]/15 px-0.5 text-left transition-opacity duration-200 hover:opacity-100"
              >
                <button
                  type="button"
                  className="h-5 w-6 flex-shrink-0 overflow-hidden rounded-[3px] bg-white shadow-sm ring-1 ring-[#0B2A5B]/10 transition-transform duration-200 group-hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#D50032]"
                  aria-label={`${office.country} office details`}
                >
                  <img
                    src={getOfficeLogo(office, 40)}
                    alt={`${office.country} flag`}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </button>
                <span className="min-w-0 whitespace-nowrap text-[10px] font-extrabold text-[#0B2A5B] font-sans 2xl:text-[11px]">
                  {office.country}
                </span>

                <div
                  className={`pointer-events-none absolute bottom-[calc(100%+10px)] z-[999] w-72 rounded-xl border border-white/12 bg-[#101827]/98 p-4 text-left opacity-0 shadow-[0_24px_60px_rgba(0,0,0,0.55)] backdrop-blur-xl transition-all duration-300 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:opacity-100 ${index < 2 ? "left-0" : index > officeCountries.length - 3 ? "right-0" : "left-1/2 -translate-x-1/2 group-hover:-translate-x-1/2 group-focus-within:-translate-x-1/2"} translate-y-2`}
                >
                  <div className="mb-3 flex items-center gap-2 border-b border-white/10 pb-3">
                    <span className="h-8 w-11 overflow-hidden rounded-md bg-white ring-1 ring-white/20">
                      <img
                        src={getOfficeLogo(office, 80)}
                        alt={`${office.country} flag`}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </span>
                    <div>
                      <p className="text-sm font-black text-white">{office.country} Office</p>
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#D50032]">TheFinTrade network</p>
                    </div>
                  </div>
                  <div className="space-y-2.5 text-xs font-semibold text-white/72">
                    <p className="flex gap-2 leading-relaxed">
                      <MapPin className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[#D50032]" />
                      <span>{office.address}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 flex-shrink-0 text-[#D50032]" />
                      <span>{office.email}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 flex-shrink-0 text-[#D50032]" />
                      <span>{office.phone}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <UserCheck className="h-3.5 w-3.5 flex-shrink-0 text-[#D50032]" />
                      <span>{office.contact}</span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

// Reusable Framer Motion Scroll Reveal Component
function ScrollReveal({
  children,
  className = "",
  delay = 0,
  duration = 1.5,
  mobileDirection = "up",
  desktopDirection = "up"
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  mobileDirection?: "up" | "down" | "left" | "right";
  desktopDirection?: "up" | "down" | "left" | "right";
}) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const dir = isMobile ? mobileDirection : desktopDirection;

  const initial = {
    opacity: 0,
    x: dir === "left" ? -50 : dir === "right" ? 50 : 0,
    y: dir === "up" ? 20 : dir === "down" ? -20 : 0
  };

  return (
    <motion.div
      initial={initial}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration, ease: [0.16, 1, 0.3, 1], delay }}
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

const termsList = [
  {
    num: "1",
    title: "Acceptance of Terms",
    content: "By registering, accessing, or using TheFinTrade platform, you acknowledge that you have read, understood, and agreed to these Terms and Conditions, our Privacy Policy, and any other applicable policies."
  },
  {
    num: "2",
    title: "Nature of Services",
    content: "TheFinTrade provides educational content, training programs, webinars, mentorship sessions, assessments, and learning management services related to financial markets, trading, investing, and related subjects.\n\nTheFinTrade is an educational platform and does not provide investment advice, portfolio management services, or guaranteed profit opportunities."
  },
  {
    num: "3",
    title: "Eligibility",
    content: "Users must be at least 18 years old to register and purchase courses. By using the platform, you confirm that all information provided is accurate and complete."
  },
  {
    num: "4",
    title: "User Accounts",
    content: "Users are responsible for:\n• Maintaining the confidentiality of login credentials.\n• Restricting unauthorized access to their account.\n• Ensuring account information remains accurate and updated.\n• All activities conducted under their account.\n\nTheFinTrade reserves the right to suspend or terminate accounts involved in fraudulent, abusive, or unauthorized activities."
  },
  {
    num: "5",
    title: "Course Enrollment and Access",
    content: "Upon successful payment and verification, users will receive access to purchased courses subject to the course validity period.\n\nCourse access is personal and non-transferable.\n\nUsers shall not:\n• Share login credentials.\n• Resell course access.\n• Record, distribute, or reproduce course content without authorization."
  },
  {
    num: "6",
    title: "KYC Verification",
    content: "Certain programs may require Know Your Customer (KYC) verification.\n\nUsers agree to provide accurate identification documents when requested.\n\nFailure to complete KYC requirements may result in restricted access to specific services or programs."
  },
  {
    num: "7",
    title: "Assessments and Entrance Tests",
    content: "Some courses may require completion of entrance assessments.\n\nTheFinTrade reserves the right to establish qualification criteria, attempt limits, waiting periods, and eligibility requirements for enrollment.\n\nAssessment results are final unless otherwise specified."
  },
  {
    num: "8",
    title: "Payments and Fees",
    content: "All payments made through the platform are subject to applicable taxes and payment gateway charges.\n\nUsers agree to pay all applicable fees associated with course enrollment.\n\nTheFinTrade reserves the right to revise pricing at any time without prior notice."
  },
  {
    num: "9",
    title: "Coupons and Promotional Offers",
    content: "Promotional offers, discounts, and coupon codes:\n• Are valid only during specified periods.\n• Cannot be combined unless explicitly stated.\n• May be modified or withdrawn without notice.\n• Have no cash value.\n\nTheFinTrade reserves the right to reject or cancel coupons used fraudulently or in violation of promotional terms."
  },
  {
    num: "10",
    title: "Refund Policy",
    content: "Refund eligibility shall be governed by the refund policy published on the website.\n\nRefund requests must comply with applicable refund conditions and timelines.\n\nTheFinTrade reserves the right to reject refund requests that do not satisfy the stated policy requirements."
  },
  {
    num: "11",
    title: "Intellectual Property",
    content: "All content available on TheFinTrade, including:\n• Videos\n• Documents\n• PDFs\n• Presentations\n• Graphics\n• Logos\n• Course materials\n• Website content\n\nis owned by or licensed to TheFinTrade and protected by applicable intellectual property laws.\n\nUnauthorized copying, redistribution, resale, or commercial use is strictly prohibited."
  },
  {
    num: "12",
    title: "Educational Disclaimer",
    content: "TheFinTrade provides educational and informational content only.\n\nNothing on the platform shall be interpreted as:\n• Investment advice\n• Financial advice\n• Trading recommendations\n• Portfolio management services\n• Guaranteed returns\n\nTrading and investing involve substantial risk, including the possible loss of capital.\n\nPast performance does not guarantee future results.\n\nUsers are solely responsible for their investment and trading decisions."
  },
  {
    num: "13",
    title: "Limitation of Liability",
    content: "TheFinTrade shall not be liable for:\n• Trading losses\n• Investment losses\n• Business interruptions\n• Loss of profits\n• Indirect or consequential damages\n\narising from the use of educational content, platform services, or reliance upon information provided through the platform."
  },
  {
    num: "14",
    title: "User Conduct",
    content: "Users agree not to:\n• Violate any applicable laws.\n• Upload harmful, abusive, or unlawful content.\n• Attempt unauthorized access to systems.\n• Disrupt platform operations.\n• Misrepresent their identity.\n\nViolation may result in suspension or permanent termination of access."
  },
  {
    num: "15",
    title: "Privacy",
    content: "The collection and use of personal information shall be governed by the Privacy Policy published on the website."
  },
  {
    num: "16",
    title: "Suspension and Termination",
    content: "TheFinTrade may suspend, restrict, or terminate user access without prior notice if:\n• Terms are violated.\n• Fraudulent activity is detected.\n• Payment disputes arise.\n• Platform security is compromised."
  },
  {
    num: "17",
    title: "Modification of Services",
    content: "TheFinTrade reserves the right to modify, update, suspend, or discontinue any course, feature, program, or service at any time."
  },
  {
    num: "18",
    title: "Governing Law",
    content: "These Terms and Conditions shall be governed by and interpreted in accordance with the laws of India.\n\nAny disputes arising from these Terms shall be subject to the exclusive jurisdiction of the courts located in Ahmedabad, Gujarat, India."
  },
  {
    num: "19",
    title: "Contact Information",
    content: "For questions regarding these Terms and Conditions, please contact:\n\nTheFinTrade\nWebsite: www.thefintrade.com\nEmail: info@thefintrade.com\nPhone: +91 92746 75947\nAddress: 10th floor, Shivalik complex, nr. Panchvati Circle, opposite Bank of Baroda, Panchavati Society, Ambawadi, Ahmedabad, Gujarat 380006"
  },
  {
    num: "20",
    title: "Acceptance",
    content: "By using TheFinTrade, registering an account, or purchasing a course, you acknowledge and agree to these Terms and Conditions."
  }
];

export function CourseCard({ course, onEnroll }: { course: any, onEnroll?: () => void }) {
  const navigate = useNavigate();

  const getIcon = () => {
    if (!course.icon) return BookOpen;
    if (typeof course.icon === 'function') return course.icon;
    const map: Record<string, any> = { BookOpen, LineChart, Trophy };
    return map[course.icon] || BookOpen;
  };
  const IconComponent = getIcon();

  return (
    <div
      className="w-full h-full flex flex-col justify-between bg-[#F9FAFB]/60 rounded-2xl border border-gray-200/60 p-8 hover:bg-white hover:border-[#D50032]/30 hover:shadow-lg transition-all duration-300 min-h-[240px] text-left select-none relative group"
    >
      <div className="flex flex-col items-start w-full">
        {/* Red outline Icon */}
        <div className="text-[#D50032] mb-6">
          <IconComponent className="w-10 h-10 stroke-[1.5]" />
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-6 tracking-tight leading-snug">
          {course.name}
        </h3>
      </div>

      {/* Learn More Button */}
      <button
        onClick={() => navigate(`/courses/${course.id}`)}
        className="inline-flex items-center justify-center gap-1.5 border border-[#D50032] text-[#D50032] hover:bg-[#D50032] hover:text-white transition-all duration-300 bg-white rounded px-5 py-2 text-sm font-semibold tracking-wide self-start cursor-pointer group/btn"
      >
        <span>Learn More</span>
        <ChevronRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
      </button>
    </div>
  );
}

export default function MarketingHome() {
  const navigate = useNavigate();
  const [videoOpen, setVideoOpen] = useState(false);
  const [activeVideoIdx, setActiveVideoIdx] = useState<number | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const isAuthenticated = !!localStorage.getItem("token");
  const [faqOpenIndex, setFaqOpenIndex] = useState<number | null>(null);
  const [activeTermIndex, setActiveTermIndex] = useState(0);
  const [termsSearchQuery, setTermsSearchQuery] = useState("");
  const [termsMobileOpenIdx, setTermsMobileOpenIdx] = useState<number | null>(null);
  const [expandedBatchTitles, setExpandedBatchTitles] = useState<Record<string, boolean>>({});

  const [isRegModalOpen, setIsRegModalOpen] = useState(false);
  const [selectedLectureForReg, setSelectedLectureForReg] = useState<any>(null);
  const [regForm, setRegForm] = useState({ full_name: "", email: "", mobile_no: "", city: "" });
  const [isSubmittingReg, setIsSubmittingReg] = useState(false);
  const [regSuccess, setRegSuccess] = useState(false);

  const [regOtp, setRegOtp] = useState("");
  const [isRegOtpSent, setIsRegOtpSent] = useState(false);
  const [isSendingRegOtp, setIsSendingRegOtp] = useState(false);

  useEffect(() => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const u = JSON.parse(userStr);
        setRegForm({
          full_name: u.full_name || "",
          email: u.email || "",
          mobile_no: u.phone || "",
          city: u.city || ""
        });
      }
    } catch (e) { }
  }, []);

  const sendRegistrationOTP = async () => {
    if (!regForm.email) {
      alert("Please enter your email address.");
      return;
    }
    setIsSendingRegOtp(true);
    try {
      await api.post("/lectures/send-otp", {
        email: regForm.email,
        lecture_title: selectedLectureForReg?.title || null
      });
      setIsRegOtpSent(true);
      alert("OTP sent to your email address. Please check your inbox.");
    } catch (error: any) {
      console.error("Failed to send OTP", error);
      const msg = error.response?.data?.detail || "Failed to send OTP. Please check your details.";
      alert(msg);
    } finally {
      setIsSendingRegOtp(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingReg(true);
    try {
      await api.post("/lectures/register", {
        lecture_id: selectedLectureForReg?.id || null,
        lecture_title: selectedLectureForReg?.title || null,
        otp: regOtp,
        ...regForm
      });
      setRegSuccess(true);
      setTimeout(() => {
        setIsRegModalOpen(false);
        setRegSuccess(false);
        setIsRegOtpSent(false);
        setRegOtp("");
      }, 5000);
    } catch (error: any) {
      console.error("Failed to register", error);
      const msg = error.response?.data?.detail || "Failed to register. Please try again.";
      alert(msg);
    } finally {
      setIsSubmittingReg(false);
    }
  };

  const [activeSlide, setActiveSlide] = useState(0);
  const [currentBgIdx, setCurrentBgIdx] = useState(0);
  const [heroBackgrounds, setHeroBackgrounds] = useState<string[]>([
    "/background.jpg",
    "/backgroundimage-1.avif",
    "/backgroundimage-2.avif"
  ]);

  // Roadmap path animation states
  const pathRef = useRef<SVGPathElement>(null);
  const [pathLength, setPathLength] = useState(1200);

  useEffect(() => {
    if (pathRef.current) {
      try {
        setPathLength(pathRef.current.getTotalLength());
      } catch (e) {
        // Fallback if SVG isn't fully ready
        setPathLength(1200);
      }
    }
  }, []);

  useEffect(() => {
    const bgTimer = setInterval(() => {
      setCurrentBgIdx((prev) => (prev + 1) % (heroBackgrounds.length || 1));
    }, 1500);
    return () => clearInterval(bgTimer);
  }, [heroBackgrounds.length]);

  const [slides, setSlides] = useState<any[]>([
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
  ]);

  const [heroButtons, setHeroButtons] = useState<any>({
    btn1_name: "Apply Now",
    btn2_name: "The FinTrade",
    btn2_youtube_url: "",
    btn3_name: "Download Brochure",
    btn3_file_url: "/brochure.pdf"
  });

  const [apiCourses, setApiCourses] = useState<any[]>([]);
  const [apiBatches, setApiBatches] = useState<any[]>([]);
  const [selectedBatchForModal, setSelectedBatchForModal] = useState<any | null>(null);
  const [isBatchesExpanded, setIsBatchesExpanded] = useState(false);
  const [isCoursesExpanded, setIsCoursesExpanded] = useState(false);
  const [cmsSettings, setCmsSettings] = useState<any>({});
  const [apiBenefits, setApiBenefits] = useState<any[]>([]);
  const [apiServices, setApiServices] = useState<any[]>([]);
  const [apiQuickTips, setApiQuickTips] = useState<any[]>([]);
  const [apiWhyChoose, setApiWhyChoose] = useState<any[]>([]);
  const [apiLeadership, setApiLeadership] = useState<any[]>([]);
  const [showcaseVideos, setShowcaseVideos] = useState<any[]>([
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
  ]);
  const [blogStories, setBlogStories] = useState<any[]>([]);
  const [marketUpdates, setMarketUpdates] = useState<any[]>([]);
  const [selectedCourseForCheckout, setSelectedCourseForCheckout] = useState<any | null>(null);
  const [customVideoUrl, setCustomVideoUrl] = useState<string>("");
  const [sectionVisibility, setSectionVisibility] = useState<any>({});
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [emiConfig, setEmiConfig] = useState<any>({});
  const [certConfig, setCertConfig] = useState<any>({});
  const [liveClasses, setLiveClasses] = useState<any[]>([]);
  const [globalOffices, setGlobalOffices] = useState<any[]>([]);

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

  const hasMarketUpdate = marketUpdates.length > 0;
  const visibleBlogStories = blogStories.slice(0, hasMarketUpdate ? 5 : 6);
  const blogCardsCount = (hasMarketUpdate ? 1 : 0) + (visibleBlogStories.length > 0 ? visibleBlogStories.length : 6);

  const handleBlogScroll = () => {
    if (!blogScrollRef.current) return;
    const container = blogScrollRef.current;
    const cardWidth = container.firstElementChild?.getBoundingClientRect().width || 0;
    const gap = 16; // gap-4 is 16px
    const scrollLeft = container.scrollLeft;
    const currentIdx = Math.round(scrollLeft / (cardWidth + gap));
    if (currentIdx !== blogActiveIndex && currentIdx >= 0 && currentIdx < blogCardsCount) {
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
    : Math.min(apiCourses.length > 0 ? apiCourses.length : 5, 3);

  // Handle manual scroll synchronization
  const handleCoursesScroll = () => {
    if (!coursesContainerRef.current) return;
    const container = coursesContainerRef.current;
    const cardWidth = container.firstElementChild?.getBoundingClientRect().width || 0;
    const gap = window.innerWidth >= 768 ? 32 : 24;
    const scrollLeft = container.scrollLeft;
    const currentIdx = Math.round(scrollLeft / (cardWidth + gap));
    if (currentIdx !== activeCourseIdx && currentIdx >= 0 && currentIdx < coursesCount) {
      setActiveCourseIdx(currentIdx);
    }
  };

  // Autoslide Timer for Courses (Autoplays slide transition like Shivalik)
  useEffect(() => {
    if (isCoursesPaused) return;

    const timer = setInterval(() => {
      if (coursesContainerRef.current) {
        const nextIdx = (activeCourseIdx + 1) % coursesCount;
        setActiveCourseIdx(nextIdx);

        const container = coursesContainerRef.current;
        const cardWidth = container.firstElementChild?.getBoundingClientRect().width || 0;
        const gap = window.innerWidth >= 768 ? 32 : 24;
        container.scrollTo({
          left: nextIdx * (cardWidth + gap),
          behavior: "smooth"
        });
      }
    }, 4500);

    return () => clearInterval(timer);
  }, [activeCourseIdx, isCoursesPaused, coursesCount]);

  // Autoslide Timer on Mobile for Blog section
  useEffect(() => {
    if (isBlogPaused) return;

    const timer = setInterval(() => {
      if (window.innerWidth < 768 && blogScrollRef.current) {
        const nextIdx = (blogActiveIndex + 1) % blogCardsCount;
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
  }, [blogActiveIndex, isBlogPaused, blogCardsCount]);

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

    const fetchBatches = async () => {
      try {
        const res = await api.get("/batches/public/list");
        if (res.data && res.data.length > 0) {
          setApiBatches(res.data);
        }
      } catch (err) { console.error("Failed to fetch public batches", err); }
    };
    fetchBatches();

    const fetchCMSAndNews = async () => {
      try {
        const res = await api.get("/settings/public");
        const settingsObj = res.data.reduce((acc: any, s: any) => ({ ...acc, [s.key]: s.value }), {});
        setCmsSettings(settingsObj);
      } catch (err) { console.error("CMS fetch failed", err); }

      try {
        const res = await api.get("/settings/landing-page");
        if (res.data) {
          if (res.data.benefits) setApiBenefits(res.data.benefits);
          if (res.data.services) setApiServices(res.data.services);
          if (res.data.quick_tips) setApiQuickTips(res.data.quick_tips);
          if (res.data.why_choose) setApiWhyChoose(res.data.why_choose);
          if (res.data.leadership) setApiLeadership(res.data.leadership);
          if (res.data.hero_buttons) setHeroButtons(res.data.hero_buttons);
          if (res.data.carousel_slides) setSlides(res.data.carousel_slides);
          if (res.data.hero_backgrounds && res.data.hero_backgrounds.length > 0) {
            setHeroBackgrounds(res.data.hero_backgrounds);
          }
          if (res.data.section_visibility) setSectionVisibility(res.data.section_visibility);
          if (res.data.emi) setEmiConfig(res.data.emi);
          if (res.data.certificate) setCertConfig(res.data.certificate);
          if (res.data.live_classes) setLiveClasses(res.data.live_classes);
          if (Array.isArray(res.data.global_offices)) {
            setGlobalOffices(res.data.global_offices);
          }
          if (res.data.showcase_videos && res.data.showcase_videos.length > 0) {
            setShowcaseVideos(res.data.showcase_videos);
          }
        }
      } catch (err) { console.error("Landing page fetch failed", err); }

      try {
        const [blogsRes, updatesRes] = await Promise.all([
          api.get("/news", { params: { type: "Blog Story", limit: 6 } }),
          api.get("/news", { params: { type: "Market Update", limit: 1 } }),
        ]);

        setBlogStories(blogsRes.data || []);
        setMarketUpdates(updatesRes.data || []);
      } catch (err) { console.error("News fetch failed", err); }

      try {
        const res = await api.get("/feedback/landing");
        setTestimonials(res.data);
      } catch (err) { console.error("Testimonials fetch failed", err); }
    };
    fetchCMSAndNews();

  }, []);

  // States and refs for Why Choose FinTrade mobile autoslide
  const whyChooseScrollRef = useRef<HTMLDivElement>(null);
  const [whyChooseActiveIndex, setWhyChooseActiveIndex] = useState(0);
  const [isWhyChoosePaused, setIsWhyChoosePaused] = useState(false);
  const whyChooseTouchTimeoutRef = useRef<any>(null);

  // Icon mapping for dynamic icons
  const iconMap: Record<string, any> = {
    Play, TrendingUp, Award, Users, BookOpen, LineChart, Video, CheckCircle, Star, ArrowRight, BarChart3, Brain, Target, Trophy, X, FileText, Search, Phone, Download, Instagram, Youtube, Linkedin, Twitter, Facebook, ChevronRight, ChevronLeft, ChevronDown, Shield, UserCheck, Monitor, Wifi, Activity, ClipboardCheck, GitBranch, Cpu, Clock
  };

  const benefitsList = (apiBenefits && apiBenefits.length > 0) ? apiBenefits : benefits;
  const servicesList = (apiServices && apiServices.length > 0) ? apiServices : servicesCards;

  const whyChooseList = (apiWhyChoose && apiWhyChoose.length > 0) ? apiWhyChoose : [
    { icon: Brain, title: "AI Tutor Support", desc: "Get personalized AI-powered guidance throughout your learning journey with real-time doubt resolution.", num: "01" },
    { icon: BookOpen, title: "Structured Curriculum", desc: "Follow a proven step-by-step curriculum designed by industry professionals and expert traders.", num: "02" },
    { icon: LineChart, title: "Real Trading Simulation", desc: "Practice with our advanced trading simulator using virtual capital in real market conditions.", num: "03" },
    { icon: Trophy, title: "Placement Opportunities", desc: "Get access to placement support with leading prop trading firms and financial institutions.", num: "04" },
  ];
  const whyChooseCardsCount = whyChooseList.length;

  const filteredTerms = termsList.filter(
    (item) =>
      item.title.toLowerCase().includes(termsSearchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(termsSearchQuery.toLowerCase())
  );
  const activeTerm = filteredTerms[activeTermIndex] || filteredTerms[0] || termsList[0];

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
    link.href = heroButtons.btn3_file_url || "/brochure.pdf";
    link.download = "brochure.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadClick = (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const u = JSON.parse(userStr);
        setLeadData({
          name: u.full_name || u.name || "",
          email: u.email || "",
          contact: u.phone || u.mobile_no || u.contact || "",
          city: u.city || ""
        });
      }
    } catch (err) {
      console.error("Error autofilling brochure lead details:", err);
    }
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
      triggerBrochureDownload();
    }
  };

  const getActiveVideoUrl = () => {
    if (customVideoUrl) return customVideoUrl;
    if (activeVideoIdx !== null) {
      return showcaseVideos[activeVideoIdx]?.url || showcaseVideos[activeVideoIdx]?.videoUrl || "";
    }
    return "";
  };

  const activeVideoUrl = getActiveVideoUrl();
  const isYouTube = activeVideoUrl && (activeVideoUrl.includes("youtube.com") || activeVideoUrl.includes("youtu.be"));

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
            <button onClick={() => { setVideoOpen(false); setActiveVideoIdx(null); setCustomVideoUrl(""); }} className="absolute top-4 right-4 z-10 text-white/70 hover:text-white bg-black/20 hover:bg-black/40 rounded-full p-2 transition-all">
              <X size={24} />
            </button>
            {isYouTube ? (
              <iframe
                src={(() => {
                  if (!activeVideoUrl) return "";
                  if (activeVideoUrl.includes("youtube.com/embed/")) return activeVideoUrl;
                  if (activeVideoUrl.includes("youtube.com/watch")) {
                    try {
                      const urlObj = new URL(activeVideoUrl);
                      const v = urlObj.searchParams.get("v");
                      if (v) return `https://www.youtube.com/embed/${v}`;
                    } catch (e) { }
                  }
                  if (activeVideoUrl.includes("youtu.be/")) {
                    try {
                      const parts = activeVideoUrl.split("youtu.be/");
                      if (parts[1]) {
                        const id = parts[1].split("?")[0];
                        return `https://www.youtube.com/embed/${id}`;
                      }
                    } catch (e) { }
                  }
                  return activeVideoUrl;
                })()}
                className="w-full h-full object-contain"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video
                src={getImageUrl(activeVideoUrl) || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"}
                autoPlay
                muted
                controls
                loop
                playsInline
                className="w-full h-full object-contain"
              />
            )}
          </div>
        </div>
      )}


      <div className="relative z-[50]">

        {/* Hero Section (Premium Dark Integrated Theme) */}
        {sectionVisibility.show_hero_slider !== false && (
          <section
            className="relative pt-6 pb-0 md:pt-10 md:pb-0 overflow-visible select-none bg-[#0b0f19] text-white"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            {/* Auto Slider Background */}
            <div className="absolute top-0 left-0 right-0 h-[240px] md:h-[400px] z-0 overflow-hidden">
              {heroBackgrounds.map((img, idx) => (
                <div
                  key={img + "-" + idx}
                  className="absolute inset-0 bg-cover bg-no-repeat bg-top transition-opacity duration-1000 ease-in-out"
                  style={{
                    backgroundImage: `linear-gradient(to bottom, rgba(11, 15, 25, 0), rgba(11, 15, 25, 0.95)), url('${getBgImageUrl(img)}')`,
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


                {/* Main Headline */}
                <h1 className="text-xl sm:text-3xl md:text-5xl lg:text-6xl font-black mb-6 tracking-tight leading-none text-white font-sans max-w-4xl mx-auto uppercase sm:whitespace-nowrap">
                  India&apos;s Trading <span className="text-[#D50032]">Powerhouse</span>
                </h1>

                {/* Subtitle */}
                <p className="text-xs sm:text-sm md:text-base text-gray-300 max-w-2xl mx-auto leading-relaxed mb-4 font-medium">
                  Learn to Earn — India's first structured Prop Trading Academy with paper trading capital. Build consistency, confidence, and profitability from basics to professional-level trading.
                </p>

                {/* Action Buttons Row */}
                <div className="flex flex-row flex-wrap justify-center items-center gap-1.5 sm:gap-3 max-w-full mx-auto mb-6 px-1">
                  <Link to="/courses" className="inline-block">
                    <Button
                      className="bg-[#D50032] hover:bg-black text-white rounded-lg sm:rounded-xl px-2.5 sm:px-4 py-2 sm:py-2.5 text-[10px] sm:text-xs md:text-sm font-bold shadow-lg shadow-[#D50032]/20 transition-all hover:scale-105 whitespace-nowrap inline-flex items-center justify-center gap-1.5 sm:gap-2 border-0 cursor-pointer h-9 sm:h-11"
                    >
                      {heroButtons.btn1_name || "Apply Now"}
                    </Button>
                  </Link>

                  <button
                    onClick={() => {
                      if (heroButtons.btn2_youtube_url) {
                        setCustomVideoUrl(heroButtons.btn2_youtube_url);
                        setActiveVideoIdx(null);
                        setVideoOpen(true);
                      } else {
                        setCustomVideoUrl("");
                        setActiveVideoIdx(0);
                        setVideoOpen(true);
                      }
                    }}
                    className="bg-[#D50032] hover:bg-black text-white rounded-lg sm:rounded-xl px-2.5 sm:px-4 py-2 sm:py-2.5 text-[10px] sm:text-xs md:text-sm font-bold shadow-lg shadow-[#D50032]/20 transition-all hover:scale-105 whitespace-nowrap inline-flex items-center justify-center gap-1.5 sm:gap-2 border-0 cursor-pointer h-9 sm:h-11"
                  >
                    <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-white flex items-center justify-center shadow-sm flex-shrink-0">
                      <Play className="h-2 w-2 sm:h-2.5 sm:w-2.5 text-[#D50032] ml-0.5 fill-[#D50032]" />
                    </span>
                    <span>{heroButtons.btn2_name || "The FinTrade"}</span>
                  </button>

                  <a
                    href="#"
                    onClick={handleDownloadClick}
                    className="bg-[#D50032] hover:bg-black text-white rounded-lg sm:rounded-xl px-2.5 sm:px-4 py-2 sm:py-2.5 text-[10px] sm:text-xs md:text-sm font-bold shadow-lg shadow-[#D50032]/20 transition-all hover:scale-105 whitespace-nowrap inline-flex items-center justify-center gap-1.5 sm:gap-2 border-0 cursor-pointer h-9 sm:h-11 text-center"
                  >
                    <Download className="h-3.5 w-3.5 sm:h-4.5 sm:w-4.5 text-white flex-shrink-0" />
                    <span>{heroButtons.btn3_name || "Download Brochure"}</span>
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
                <div className="relative max-w-4xl mx-auto mt-2 bg-[#131b2e]/40 border border-white/10 rounded-[24px] sm:rounded-[32px] p-4 pt-6 md:p-10 text-center shadow-[0_30px_70px_rgba(0,0,0,0.4)] overflow-hidden select-none backdrop-blur-xl">

                  {/* Subtle Red Top Accent Bar */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 sm:w-28 h-1 sm:h-1.5 bg-[#D50032] rounded-b-full shadow-[0_0_15px_#D50032]" />

                  {/* Slider content wrapper */}
                  <div className="min-h-auto md:min-h-[110px] flex flex-col justify-center items-center px-4 sm:px-6">
                    <h3 className="text-base xs:text-lg sm:text-2xl md:text-3.5xl font-black tracking-tight text-white mb-1.5 md:mb-2 leading-none font-sans sm:whitespace-nowrap">
                      {slides[activeSlide].title}
                    </h3>
                    <p className="text-[10px] sm:text-xs md:text-sm text-gray-400 font-semibold mb-3 md:mb-6 max-w-lg">
                      {slides[activeSlide].subtitle}
                    </p>
                    <Link to={slides[activeSlide].link}>
                      <Button
                        className="bg-[#D50032] hover:bg-black text-white rounded-lg sm:rounded-xl px-4 sm:px-5 py-2 sm:py-2 text-[10px] sm:text-xs md:text-sm font-bold shadow-md shadow-[#D50032]/10 transition-all hover:scale-105 h-8 sm:h-10 border-0 cursor-pointer"
                      >
                        {slides[activeSlide].buttonText}
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
                  <div className="flex justify-center items-center gap-1.5 mt-4 md:mt-8">
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

                <OfficePresenceStrip offices={globalOffices} />

              </ScrollReveal>
            </div>
          </section>
        )}

        {/* What is FinTrade & Acronym Section */}
        {sectionVisibility.show_timeline !== false && (
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
                      className={`w-full rounded-2xl md:rounded-[24px] border border-gray-100 bg-[#FAFBFD]/30 p-4 md:p-5 flex items-center gap-4 md:gap-6 shadow-[0_8px_30px_rgba(0,0,0,0.005)] hover:border-[#D50032]/25 hover:shadow-[0_12px_45px_rgba(213,0,50,0.03)] hover:bg-white select-none relative overflow-hidden transition-all duration-700 ease-out transform ${isAcronymVisible
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
        )}

        {/* 1. Featured Courses Section */}
        {sectionVisibility.show_courses !== false && (
          <section id="courses" className="pt-6 pb-2 md:py-8 relative z-10 bg-transparent" style={{ fontFamily: "sans-serif" }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <ScrollReveal>
                <div className="text-left mb-10">
                  <h2 className="text-4xl md:text-5xl lg:text-[54px] font-light text-gray-900 mb-3 tracking-tight">Our Courses</h2>
                  <p className="text-base lg:text-xl text-gray-500 max-w-2xl mt-2 leading-relaxed">
                    Industry-driven curriculum designed to transform learners into professionals
                  </p>
                </div>
              </ScrollReveal>

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
                className="flex gap-6 md:gap-8 overflow-x-auto pt-5 pb-6 snap-x snap-mandatory scrollbar-hide px-4 -mx-4 md:px-0 md:mx-0 items-stretch"
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
                  <ScrollReveal
                    key={i}
                    delay={i * 0.12}
                    mobileDirection="left"
                    className="flex-shrink-0 w-[290px] sm:w-[350px] md:w-[calc((100%-64px)/3)] snap-center flex"
                  >
                    <CourseCard course={course} onEnroll={() => setSelectedCourseForCheckout(course)} />
                  </ScrollReveal>
                ))}
              </div>

              {/* Swiper-style pagination dots (Visible on Mobile & Desktop to match Shivalik) */}
              {coursesCount > 1 && (
                <div className={`justify-center items-center gap-2 mt-6 ${coursesCount > 3 ? "flex" : "flex md:hidden"}`}>
                  {Array.from({ length: coursesCount }).map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setActiveCourseIdx(idx);
                        const container = coursesContainerRef.current;
                        if (container) {
                          const cardWidth = container.firstElementChild?.getBoundingClientRect().width || 0;
                          const gap = window.innerWidth >= 768 ? 32 : 24;
                          container.scrollTo({
                            left: idx * (cardWidth + gap),
                            behavior: "smooth"
                          });
                        }
                      }}
                      className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${activeCourseIdx === idx
                        ? "bg-[#D50032] w-6"
                        : "bg-[#D50032]/20 w-2.5 hover:bg-[#D50032]/40"
                        }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              )}

              {((apiCourses.length > 0 ? apiCourses.length : 5) > 3) && (
                <ScrollReveal delay={0.2}>
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
                </ScrollReveal>
              )}
            </div>
          </section>
        )}

        {/* 1.5. Public Batches & Cohorts Section */}
        {apiBatches.length > 0 && (
          <section id="batches" className="pt-6 pb-2 md:py-8 relative z-10 bg-transparent border-t border-gray-100/50" style={{ fontFamily: "sans-serif" }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <ScrollReveal>
                <div className="text-left mb-10">
                  <h2 className="text-4xl md:text-5xl lg:text-[54px] font-light text-gray-900 mb-3 tracking-tight">Batches &amp; Cohorts</h2>
                  <p className="text-base lg:text-xl text-gray-500 max-w-2xl mt-2 leading-relaxed">
                    Join our upcoming cohorts to learn alongside peers with dedicated support and structured timelines.
                  </p>
                </div>
              </ScrollReveal>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {apiBatches.slice(0, isBatchesExpanded ? undefined : 3).map((batch: any, i: number) => {
                  const statusColors: Record<string, string> = {
                    "Registration Open": "bg-emerald-50 text-emerald-700 border-emerald-200",
                    "Running": "bg-blue-50 text-blue-700 border-blue-200",
                    "Upcoming": "bg-amber-50 text-amber-700 border-amber-200",
                    "Completed": "bg-gray-50 text-gray-600 border-gray-200"
                  };
                  const statusColor = statusColors[batch.status] || "bg-gray-50 text-gray-600 border-gray-200";

                  return (
                    <ScrollReveal key={batch.id} delay={i * 0.1} y={20}>
                      <div className="flex flex-col justify-between h-full bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl hover:border-[#D50032]/30 transition-all duration-300">
                        <div>
                          <div className="flex flex-col items-start mb-4 gap-2 w-full min-w-0">
                            <div className="w-full">
                              <h3 
                                className={`text-xl font-bold text-gray-900 leading-tight ${expandedBatchTitles[batch.id] ? '' : 'truncate'}`} 
                                title={batch.name}
                              >
                                {batch.name}
                              </h3>
                              {batch.name && batch.name.length > 25 && (
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setExpandedBatchTitles(prev => ({
                                      ...prev,
                                      [batch.id]: !prev[batch.id]
                                    }));
                                  }}
                                  className="text-[#D50032] text-[11px] font-bold mt-1 hover:underline focus:outline-none"
                                >
                                  {expandedBatchTitles[batch.id] ? "Read Less" : "Read More"}
                                </button>
                              )}
                            </div>
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${statusColor}`}>
                              {batch.status}
                            </span>
                          </div>
                          
                          <div className="space-y-3 mb-6">
                            <div className="flex items-start gap-3">
                              <span className="text-[#D50032] mt-0.5">📅</span>
                              <div>
                                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-0.5">Batch Duration</p>
                                <p className="text-sm text-gray-800 font-medium">
                                  {new Date(batch.start_date).toLocaleDateString(undefined, { dateStyle: "medium" })} – {new Date(batch.end_date).toLocaleDateString(undefined, { dateStyle: "medium" })}
                                </p>
                              </div>
                            </div>
                            
                            {(batch.status === "Upcoming" || batch.status === "Registration Open") && (
                              <div className="flex items-start gap-3">
                                <span className="text-[#D50032] mt-0.5">⏰</span>
                                <div>
                                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-0.5">Registration Closes</p>
                                  <p className="text-sm text-red-600 font-medium">
                                    {new Date(batch.registration_end_date).toLocaleDateString(undefined, { dateStyle: "medium" })}
                                  </p>
                                </div>
                              </div>
                            )}

                            {batch.assigned_courses && batch.assigned_courses.length > 0 && (
                              <div className="flex items-start gap-3 pt-2">
                                <span className="text-[#D50032] mt-0.5">📚</span>
                                <div>
                                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Included Courses</p>
                                  <div className="flex flex-wrap gap-1.5">
                                    {batch.assigned_courses.filter((ac: any) => !ac.is_batch_only).map((ac: any) => (
                                      <span key={ac.id} className="text-[10px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md border border-gray-200">
                                        {ac.title || `Course ${ac.id}`}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <Button 
                          onClick={() => setSelectedBatchForModal(batch)}
                          className="w-full bg-white border-2 border-[#D50032] text-[#D50032] hover:bg-[#D50032] hover:text-white transition-colors duration-300 rounded-xl h-11 font-bold"
                        >
                          View &amp; Enroll
                        </Button>
                      </div>
                    </ScrollReveal>
                  );
                })}
              </div>

              {apiBatches.length > 3 && (
                <ScrollReveal delay={0.2}>
                  <div className="mt-8 text-center">
                    <Button
                      onClick={() => {
                        setIsBatchesExpanded(!isBatchesExpanded);
                        if (isBatchesExpanded) {
                          document.getElementById("batches")?.scrollIntoView({ behavior: "smooth" });
                        }
                      }}
                      className="bg-[#0B2A5B] text-[#F4F1EA] hover:bg-[#1a3d7a] px-8 py-2.5 rounded-full font-semibold transition-all shadow-md"
                    >
                      {isBatchesExpanded ? "View Less" : "View All Batches"}
                    </Button>
                  </div>
                </ScrollReveal>
              )}
            </div>

            {/* Batch Courses Selection Modal */}
            <Dialog open={!!selectedBatchForModal} onOpenChange={(open) => !open && setSelectedBatchForModal(null)}>
              <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-white border-none shadow-2xl rounded-2xl">
                <div className="bg-[#0B2A5B] p-6 text-white relative">
                  <DialogTitle className="text-xl font-bold">Select a Course to Enroll</DialogTitle>
                  <DialogDescription className="text-[#F4F1EA]/80 mt-2">
                    {selectedBatchForModal?.name} includes multiple courses. Please select the course you'd like to view and enroll in.
                  </DialogDescription>
                </div>
                <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
                  {selectedBatchForModal?.assigned_courses?.filter((ac: any) => !ac.is_batch_only).length > 0 ? (
                    selectedBatchForModal.assigned_courses
                      .filter((ac: any) => !ac.is_batch_only)
                      .map((ac: any) => (
                      <Link 
                        key={ac.id} 
                        to={`/courses/${ac.id}?batch=${selectedBatchForModal.id}`}
                        onClick={() => setSelectedBatchForModal(null)}
                        className="block"
                      >
                        <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-[#D50032]/30 bg-gray-50/50 hover:bg-red-50/30 transition-all group">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#D50032]/10 flex items-center justify-center">
                              <BookOpen className="w-5 h-5 text-[#D50032]" />
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 group-hover:text-[#D50032] transition-colors">{ac.title || `Course ${ac.id}`}</p>
                              <p className="text-xs text-gray-500 line-clamp-1">{ac.short_description || "Professional trading course"}</p>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#D50032]" />
                        </div>
                      </Link>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">No courses assigned to this batch yet.</p>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </section>
        )}

        {/* 2. Live Classes Section */}
        {sectionVisibility.show_live_classes !== false && (
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
                  {(liveClasses && liveClasses.length > 0
                    ? liveClasses.filter((lecture: any) => lecture.is_visible !== false)
                    : [
                      { title: "Technical Analysis Masterclass", instructor: "Amit Desai", date: "April 18, 2026", time: "10:00 AM IST", students: 145, status: "live" },
                      { title: "Options Trading Strategies", instructor: "Priya Sharma", date: "April 19, 2026", time: "2:00 PM IST", students: 132, status: "upcoming" },
                      { title: "Risk Management Fundamentals", instructor: "Rajesh Kumar", date: "April 20, 2026", time: "4:00 PM IST", students: 178, status: "upcoming" },
                    ]
                  ).map((lecture, i) => (
                    <div key={i} className="flex-shrink-0 w-[290px] sm:w-[350px] md:w-full md:flex-shrink snap-center flex">
                      <Card className={`w-full flex flex-col overflow-hidden rounded-2xl transition-all duration-300 hover:shadow-2xl ${lecture.status === "live" ? "border-2 border-[#D50032] shadow-xl" : "border border-gray-200 hover:border-[#D50032]/50"}`}>
                        {/* Image Header */}
                        <div className="relative h-44 bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center overflow-hidden">
                          <img
                            src={lecture.thumbnail ? getImageUrl(lecture.thumbnail) : "https://images.unsplash.com/photo-1616587896649-79b16d8b173d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"}
                            alt="Live class"
                            className="absolute inset-0 w-full h-full object-cover opacity-25"
                          />
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
                          {lecture.status === "live" ? (
                            <Link to={isAuthenticated ? "/student/lectures" : "/login"} className="block">
                              <Button
                                className="w-full h-12 text-base font-semibold rounded-xl transition-all duration-300 !bg-gradient-to-r !from-[#D50032] !to-[#FF0000] !text-white hover:!from-[#FF0000] hover:!to-[#FF0000]"
                                style={{ boxShadow: "0 8px 30px rgba(213,0,50,0.3)" }}
                              >
                                Join Now
                                <ArrowRight className="ml-2 h-4 w-4" />
                              </Button>
                            </Link>
                          ) : (
                            <Button
                              onClick={() => {
                                setSelectedLectureForReg(lecture);
                                setIsRegModalOpen(true);
                              }}
                              className="w-full h-12 text-base font-semibold rounded-xl transition-all duration-300 !bg-[#121212] !text-white hover:!bg-[#D50032] hover:!text-white block"
                            >
                              Register Now
                            </Button>
                          )}
                        </div>
                      </Card>
                    </div>
                  ))}
                </div>
              </ScrollReveal>
            </div>
          </section>
        )}

        {/* Section 4: Showcase Videos ("Watch Our Students") */}
        {sectionVisibility.show_showcase_videos !== false && (
          <section className="py-12 relative z-10 bg-[#0B0F19] text-white overflow-hidden">
            {/* Subtle background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#D50032]/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <ScrollReveal>
                <div className="text-center mb-10">
                  <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full mb-4 border border-[#D50032]/30 bg-[#D50032]/10">
                    <span className="text-[#D50032] font-semibold text-xs uppercase tracking-wider">🎥 Showcase</span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 tracking-tight uppercase">
                    Watch Our <span className="text-[#D50032]">Students</span>
                  </h2>
                  <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto font-medium">
                    Real stories and live walkthroughs from the FinTrade community.
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 md:gap-8">
                  {showcaseVideos.map((video, idx) => (
                    <Card
                      key={idx}
                      onClick={() => {
                        const targetUrl = video.url || video.videoUrl;
                        if (targetUrl) {
                          setCustomVideoUrl(targetUrl);
                          setActiveVideoIdx(idx);
                          setVideoOpen(true);
                        }
                      }}
                      className="overflow-hidden border border-white/10 bg-white/[0.02] backdrop-blur-md shadow-lg group hover:-translate-y-1 transition-all duration-300 snap-center cursor-pointer flex flex-col justify-between"
                    >
                      <div className="relative aspect-video overflow-hidden">
                        <img
                          src={video.thumbnail ? getImageUrl(video.thumbnail) : "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800"}
                          alt={video.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-black/45 flex items-center justify-center group-hover:bg-black/35 transition-colors">
                          <div className="w-12 h-12 rounded-full bg-[#D50032] hover:bg-black text-white flex items-center justify-center shadow-lg transition-all group-hover:scale-110">
                            <Play className="h-5 w-5 text-white ml-0.5 fill-white" />
                          </div>
                        </div>
                        {video.duration && (
                          <div className="absolute bottom-3 right-3 bg-black/75 px-2.5 py-0.5 rounded text-[10px] font-bold text-white tracking-wider">
                            {video.duration}
                          </div>
                        )}
                      </div>
                      <div className="p-5 flex flex-col flex-grow justify-between text-left">
                        <div>
                          <h3 className="font-extrabold text-white text-base sm:text-lg mb-2 line-clamp-1 group-hover:text-[#D50032] transition-colors duration-300">
                            {video.title}
                          </h3>
                          <p className="text-gray-400 text-xs sm:text-sm leading-relaxed font-medium line-clamp-2">
                            {video.subtitle}
                          </p>
                        </div>
                        <div className="mt-4 flex items-center text-[#D50032] text-xs font-black uppercase tracking-wider group-hover:gap-1.5 transition-all">
                          Watch Video <ChevronRight size={14} className="ml-1" />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollReveal>
            </div>
          </section>
        )}

        {sectionVisibility.show_modules !== false && (
          <ScrollReveal>
            <ProgramModules apiCourses={apiCourses.length > 0 ? apiCourses : null} />
          </ScrollReveal>
        )}

        {/* Program Benefits Section */}
        {sectionVisibility.show_benefits !== false && (
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
            <ScrollReveal>
              <div className="relative w-full flex overflow-x-hidden py-4">
                <div className="animate-marquee flex gap-6 whitespace-nowrap" style={{ display: 'flex', minWidth: '100%' }}>
                  {benefitsList.concat(benefitsList).map((b, idx) => {
                    const IconComponent = typeof b.icon === 'function' ? b.icon : (iconMap[b.icon] || BookOpen);
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
                          <div className="w-10 h-10 rounded-xl bg-[#D50032]/5 text-[#D50032] flex items-center justify-center shadow-sm border border-[#D50032]/10 group-hover:scale-110 transition-transform duration-300 overflow-hidden">
                            {typeof b.icon === 'string' && b.icon.startsWith("/uploads") ? (
                              <img src={getImageUrl(b.icon)} alt={b.title} className="w-full h-full object-cover" />
                            ) : (
                              <IconComponent className="h-5 w-5" />
                            )}
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

                @keyframes pathFlow {
                  0% { stroke-dashoffset: var(--path-length); }
                  50% { stroke-dashoffset: 0; }
                  100% { stroke-dashoffset: var(--path-length); }
                }
              `}</style>
              </div>
            </ScrollReveal>
          </section>
        )}

        {/* Learning Path Section */}
        {sectionVisibility.show_roadmap !== false && (
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

                        {/* Completed/Hovered path overlay with fill animation */}
                        <path
                          ref={pathRef}
                          d="M 200,520 C 300,520 400,450 500,380 C 600,310 700,310 800,240 C 900,170 800,130 550,120 C 450,110 360,110 360,110"
                          stroke="url(#completedGradient)"
                          className="stroke-[5px] lg:stroke-[8px]"
                          strokeLinecap="round"
                          style={{
                            strokeDasharray: pathLength || 1200,
                            "--path-length": pathLength || 1200,
                            animation: "pathFlow 6s ease-in-out infinite",
                          } as any}
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
                        { num: "1", title: "Market Foundations", desc: "Markets, exchanges & instruments", status: "completed", x: 20, y: 86.6, align: isMobileViewport ? "right" : "left", isStart: true },
                        { num: "2", title: "Technical Analysis", desc: "Chart patterns & price action", status: "completed", x: 35, y: 76.6, align: isMobileViewport ? "left" : "left" },
                        { num: "3", title: "Risk Management", desc: "Position sizing & capital protection", status: "completed", x: 50, y: 63.3, align: isMobileViewport ? "right" : "left" },
                        { num: "4", title: "Trading Psychology", desc: "Emotional discipline & consistency", status: "completed", x: 65, y: 53.3, align: isMobileViewport ? "left" : "left" },
                        { num: "5", title: "Options & Derivatives", desc: "Options pricing, Greeks & hedging", status: "completed", x: 80, y: 40, align: isMobileViewport ? "left" : "left" },
                        { num: "6", title: "Advanced Strategies", desc: "Algo trading & quant analysis", status: "completed", x: 72, y: 26.6, align: isMobileViewport ? "left" : "right" },
                        { num: "7", title: "Trading Simulator", desc: "Live practice with virtual capital", status: "completed", x: 55, y: 20, align: isMobileViewport ? "right" : "right" },
                        { num: "8", title: "Certification & Placement", desc: "Final assessment & placement", status: "completed", x: 36, y: 18.3, align: isMobileViewport ? "top" : "left", isSummit: true },
                      ].map((step, idx) => {
                        // Status is static by default
                        const displayStatus = step.status;

                        const isCompleted = displayStatus === "completed";
                        const isCurrent = displayStatus === "current";

                        return (
                          <div key={idx}>
                            {/* Node Circle */}
                            <div
                              className="absolute -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center transition-all duration-300 hover:scale-115 origin-center"
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
                                width: `${isMobileViewport ? 130 : 250}px`,
                                left: step.align === "left"
                                  ? `calc(${step.x}% - ${isMobileViewport ? 142 : 270}px)`
                                  : (step.align === "top" || step.align === "bottom")
                                    ? `calc(${step.x}% - ${isMobileViewport ? 65 : 125}px)`
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
                                className={`tracking-tight mb-1 transition-colors duration-300 ${isCurrent ? "text-[#D50032] font-black" : isCompleted ? "text-slate-900 font-extrabold" : "text-slate-600 font-bold"
                                  } ${isMobileViewport ? 'text-xs leading-tight' : 'text-base sm:text-lg'}`}
                              >
                                {step.title}
                              </h3>
                              <p className={`font-medium leading-relaxed inline-block transition-colors duration-300 ${isCurrent ? "text-[#D50032]/85" : isCompleted ? "text-slate-600" : "text-slate-500"
                                } ${isMobileViewport ? 'text-[10px] leading-tight' : 'text-xs sm:text-sm'}`}>
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
        )}

        {/* Our Services Section */}
        {sectionVisibility.show_services !== false && (
          <section className="pt-6 pb-2 md:py-8 bg-transparent relative z-10 overflow-hidden border-t border-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 text-center">
              <ScrollReveal>
                <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full mb-4 border border-[#D50032]/25 bg-[#D50032]/5">
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
              </ScrollReveal>
            </div>

            {/* Single marquee */}
            <ScrollReveal>
              <div className="relative w-full flex flex-col gap-6 overflow-x-hidden py-4 select-none">
                {/* Row 1 - Forward */}
                <div className="animate-marquee flex gap-6 whitespace-nowrap" style={{ display: 'flex', minWidth: '100%' }}>
                  {servicesList.concat(servicesList).map((s, idx) => {
                    const IconComponent = typeof s.icon === 'function' ? s.icon : (iconMap[s.icon] || UserCheck);
                    return (
                      <div
                        key={idx}
                        className="w-[280px] sm:w-[320px] p-6 bg-white border border-gray-100 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.015)] hover:shadow-[0_12px_40px_rgba(213,0,50,0.04)] hover:border-[#D50032]/10 transition-all duration-300 flex-shrink-0 flex flex-col group select-none whitespace-normal text-left"
                      >
                        <div className="w-12 h-12 rounded-2xl bg-[#FFF5F6] border border-[#D50032]/8 text-[#D50032] flex items-center justify-center mb-5 group-hover:scale-105 transition-transform duration-300 overflow-hidden">
                          {typeof s.icon === 'string' && s.icon.startsWith("/uploads") ? (
                            <img src={getImageUrl(s.icon)} alt={s.title} className="w-full h-full object-cover" />
                          ) : (
                            <IconComponent className="h-6 w-6 stroke-[2.5]" />
                          )}
                        </div>

                        <div>
                          <h3 className="font-extrabold text-gray-950 text-base sm:text-lg mb-2 group-hover:text-[#D50032] transition-colors duration-300">
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
            </ScrollReveal>
          </section>
        )}

        {/* 4. Vertical Video Section */}
        {sectionVisibility.show_quick_tips !== false && (
          <ScrollReveal>
            <VerticalVideoSection videos={apiQuickTips} />
          </ScrollReveal>
        )}

        {/* 5. FinTrade Blog Section */}
        {sectionVisibility.show_blog !== false && (
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

                <div
                  ref={blogScrollRef}
                  onScroll={handleBlogScroll}
                  onTouchStart={() => {
                    setIsBlogPaused(true);
                    if (blogTouchTimeoutRef.current) clearTimeout(blogTouchTimeoutRef.current);
                  }}
                  onTouchEnd={() => {
                    if (blogTouchTimeoutRef.current) clearTimeout(blogTouchTimeoutRef.current);
                    blogTouchTimeoutRef.current = setTimeout(() => setIsBlogPaused(false), 8000);
                  }}
                  className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch overflow-x-auto md:overflow-x-visible pb-4 md:pb-0 snap-x snap-mandatory -mx-4 px-4 md:mx-0 md:px-0"
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                  {/* Featured Video (Card 1, only when a Market Update exists) */}
                  {hasMarketUpdate && (
                    <div className="flex flex-col h-full flex-shrink-0 w-[85vw] sm:w-[360px] md:w-full snap-center">
                      <Card
                        onClick={() => { setActiveVideoIdx(0); setVideoOpen(true); }}
                        className="flex-1 flex flex-col overflow-hidden border-0 shadow-md relative group cursor-pointer"
                      >
                        <div className="aspect-[16/10] overflow-hidden relative bg-gray-100 flex items-center justify-center">
                          <img
                            src={getImageUrl(marketUpdates[0].thumbnail_url) || "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80"}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            alt={marketUpdates[0].title}
                          />
                          <div className="absolute inset-0 bg-black/45 flex items-center justify-center group-hover:bg-black/35 transition-colors">
                            <div className="w-14 h-14 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl" style={{ background: "#D50032", boxShadow: "0 0 30px rgba(213,0,50,0.5)" }}>
                              <Play className="h-5 w-5 text-white ml-0.5 fill-white" />
                            </div>
                          </div>
                        </div>
                        <div className="p-4 bg-white flex flex-col flex-1">
                          <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1.5">
                            <span className="flex items-center gap-1"><Video size={12} /> Video</span>
                            <span>10 min watch</span>
                          </div>
                          <h3 className="font-bold text-sm mb-2 line-clamp-2 hover:text-[#D50032] transition-colors" style={{ color: "#121212" }}>{marketUpdates[0].title}</h3>
                          <p className="text-xs text-gray-500 line-clamp-2 mb-3 flex-1">{marketUpdates[0].description || marketUpdates[0].content}</p>
                          <div className="text-[#D50032] font-semibold text-xs flex items-center group-hover:gap-1.5 transition-all mt-auto self-start">
                            Watch Video <ChevronRight size={16} />
                          </div>
                        </div>
                      </Card>
                    </div>
                  )}

                  {/* Blog Stories */}
                  {visibleBlogStories.length > 0 ? visibleBlogStories.map((story, i) => (
                    <div key={i} className="flex flex-col h-full flex-shrink-0 w-[85vw] sm:w-[360px] md:w-full snap-center">
                      <Card onClick={() => navigate(`/article/${story.id}`)} className="flex-1 flex flex-col border-0 shadow-md group hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                        <div className="aspect-[16/10] overflow-hidden relative bg-gray-100 flex items-center justify-center">
                          <img src={getImageUrl(story.thumbnail_url) || "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80"} alt={story.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2.5 py-0.5 rounded-full text-[10px] font-bold text-[#D50032] shadow-sm">
                            Article
                          </div>
                        </div>
                        <div className="p-4 flex flex-col flex-1">
                          <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1.5">
                            <span className="flex items-center gap-1"><FileText size={12} />{story.author_name ? `By ${story.author_name}` : "Read"}</span>
                            <span>5 min read</span>
                          </div>
                          <h3 className="font-bold text-sm mb-2 line-clamp-2 hover:text-[#D50032] transition-colors flex-1" style={{ color: "#121212" }}>{story.title}</h3>
                          <div className="text-[#D50032] font-semibold text-xs flex items-center group-hover:gap-1.5 transition-all mt-auto self-start">
                            Read Story <ChevronRight size={16} />
                          </div>
                        </div>
                      </Card>
                    </div>
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
                    },
                    {
                      title: "How to Manage Risk Like a Pro",
                      category: "Risk Management",
                      readTime: "6 min read",
                      img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
                      desc: "Protect your capital with these essential risk management rules."
                    }
                  ].map((post, i) => (
                    <div key={i} className="flex flex-col h-full flex-shrink-0 w-[85vw] sm:w-[360px] md:w-full snap-center">
                      <Card className="flex-1 flex flex-col border-0 shadow-md group hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                        <div className="aspect-[16/10] overflow-hidden relative">
                          <img src={post.img} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2.5 py-0.5 rounded-full text-[10px] font-bold text-[#D50032] shadow-sm">
                            {post.category}
                          </div>
                        </div>
                        <div className="p-4 flex flex-col flex-1">
                          <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1.5">
                            <span className="flex items-center gap-1"><FileText size={12} /> Article</span>
                            <span>{post.readTime}</span>
                          </div>
                          <h3 className="font-bold text-sm mb-2 line-clamp-2 hover:text-[#D50032] transition-colors flex-1" style={{ color: "#121212" }}>{post.title}</h3>
                          <div className="text-[#D50032] font-semibold text-xs flex items-center group-hover:gap-1.5 transition-all mt-auto self-start">
                            Read Full Article <ChevronRight size={16} />
                          </div>
                        </div>
                      </Card>
                    </div>
                  ))}
                </div>

                {/* Mobile Dot Indicators for Blog Section */}
                <div className="flex md:hidden gap-1.5 justify-center items-center mt-5 w-full">
                  {Array.from({ length: blogCardsCount }).map((_, idx) => {
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
                            container.scrollTo({ left: idx * (cardWidth + 20), behavior: "smooth" });
                          }
                          if (blogTouchTimeoutRef.current) clearTimeout(blogTouchTimeoutRef.current);
                          blogTouchTimeoutRef.current = setTimeout(() => setIsBlogPaused(false), 8000);
                        }}
                        className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${isActive ? "w-5 bg-[#D50032]" : "w-1.5 bg-gray-300 hover:bg-gray-400"
                          }`}
                      />
                    );
                  })}
                </div>
              </ScrollReveal>
            </div>
          </section>
        )}

        {/* 6.5 Certification Section (Moved below Modules) */}
        {sectionVisibility.show_certificate !== false && (
          <ScrollReveal>
            <CertificatePreview certConfig={certConfig} />
          </ScrollReveal>
        )}

        {/* EMI & Payment Plans Section */}
        {sectionVisibility.show_emi !== false && (
          <ScrollReveal>
            <EMIHighlight emiConfig={emiConfig} />
          </ScrollReveal>
        )}

        {/* Section 15: Terms & Conditions */}
        {sectionVisibility.show_terms !== false && (
          <section id="terms" className="py-16 relative z-10 bg-transparent overflow-hidden border-t border-gray-100">
            {/* Ambient Red Glow */}
            <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#D50032]/5 rounded-full blur-[140px] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <ScrollReveal>
                {/* Section Header */}
                <div className="text-center mb-12">
                  <div className="inline-flex items-center gap-1.5 px-4.5 py-1.5 rounded-full mb-3 border border-[#D50032]/25 bg-[#D50032]/5">
                    <span className="text-[#D50032] font-extrabold text-xs tracking-wider uppercase">📋 LEGAL POLICY</span>
                  </div>
                  <h2 className="text-3xl md:text-5xl font-black mb-3 text-gray-900 tracking-tight">
                    Terms & <span className="text-[#D50032]">Conditions</span>
                  </h2>
                  <p className="text-base sm:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed font-medium">
                    Effective Date: June 16, 2026 • Please review our official terms and guidelines below.
                  </p>
                </div>

                {/* Search Bar */}
                <div className="max-w-xl mx-auto mb-8 relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search terms, refund policies, KYC..."
                    value={termsSearchQuery}
                    onChange={(e) => {
                      setTermsSearchQuery(e.target.value);
                      setActiveTermIndex(0);
                    }}
                    className="w-full pl-11 pr-4 py-3 bg-white/80 backdrop-blur-md border border-gray-200/80 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D50032]/30 focus:border-[#D50032] transition-all shadow-sm text-gray-900"
                  />
                  {termsSearchQuery && (
                    <button
                      onClick={() => setTermsSearchQuery("")}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-[#D50032] transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Main Content Workspace */}
                {filteredTerms.length === 0 ? (
                  <div className="text-center py-16 bg-white/50 backdrop-blur border border-gray-150 rounded-3xl shadow-sm">
                    <FileText className="mx-auto text-gray-300 mb-3 h-10 w-10 stroke-[1.5]" />
                    <p className="font-bold text-[#0B2A5B] text-lg">No clauses match your search</p>
                    <p className="text-sm text-gray-500 mt-1">Try searching for keywords like "refund", "eligibility", or "KYC"</p>
                  </div>
                ) : (
                  <div className="grid lg:grid-cols-12 gap-8 items-start">
                    {/* Desktop Sidebar (Left Column) - Visible on lg screens */}
                    <div className="hidden lg:block lg:col-span-4 w-full">
                      <div className="flex flex-col gap-2.5 max-h-[580px] overflow-y-auto overflow-x-hidden pr-3 pl-4 py-1.5 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                        {filteredTerms.map((term, index) => {
                          const isSelected = (filteredTerms[activeTermIndex]?.num === term.num) || (activeTermIndex === index);
                          return (
                            <button
                              key={term.num}
                              onClick={() => setActiveTermIndex(index)}
                              className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 flex items-center gap-4 select-none relative overflow-hidden group ${isSelected
                                ? "bg-white border-[#D50032]/30 shadow-md shadow-[#D50032]/[0.02]"
                                : "bg-white/40 border-gray-100 hover:border-gray-200 hover:bg-white/70"
                                }`}
                            >
                              {/* Selected Indicator Pill */}
                              {isSelected && (
                                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#D50032] rounded-r-md" />
                              )}
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 transition-colors ${isSelected ? "bg-[#FFF0F2] text-[#D50032]" : "bg-gray-100 text-gray-400 group-hover:bg-gray-200 group-hover:text-gray-600"
                                }`}>
                                {term.num}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className={`font-bold text-sm tracking-tight transition-colors line-clamp-1 ${isSelected ? "text-[#D50032]" : "text-gray-700 group-hover:text-gray-900"
                                  }`}>
                                  {term.title}
                                </h3>
                                <p className="text-xs text-gray-400 line-clamp-1 mt-1 font-medium">
                                  {term.content.replace(/\n/g, " ")}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Desktop Detailed View (Right Column) - Visible on lg screens */}
                    <div className="hidden lg:block lg:col-span-8 bg-white border border-gray-100/90 rounded-3xl p-8 min-h-[480px] shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-[#D50032]/[0.01] rounded-bl-full pointer-events-none" />
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={activeTerm.num}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -15 }}
                          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                          className="h-full flex flex-col justify-between"
                        >
                          <div>
                            {/* Top row / Badge */}
                            <div className="flex items-center gap-2.5 mb-6">
                              <div className="px-3.5 py-1 bg-[#FFF0F2] text-[#D50032] font-black text-xs rounded-lg uppercase tracking-wider">
                                Section {activeTerm.num}
                              </div>
                              <div className="h-1.5 w-1.5 rounded-full bg-gray-300" />
                              <span className="text-xs text-gray-400 font-bold">TheFinTrade Legal Framework</span>
                            </div>

                            {/* Title */}
                            <h3 className="text-2xl font-black text-gray-950 mb-6 tracking-tight font-sans">
                              {activeTerm.title}
                            </h3>

                            {/* Content body */}
                            <div className="text-gray-600 font-medium text-base leading-relaxed space-y-4 whitespace-pre-line text-left">
                              {activeTerm.content}
                            </div>
                          </div>

                          {/* Footer branding note */}
                          <div className="mt-12 pt-6 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400 font-semibold">
                            <span>Copyright &copy; {new Date().getFullYear()} TheFinTrade. All rights reserved.</span>
                            <span className="text-[#D50032]">Ahmedabad, Gujarat, India</span>
                          </div>
                        </motion.div>
                      </AnimatePresence>
                    </div>

                    {/* Mobile View Accordion Stack - Visible below lg screens */}
                    <div className="block lg:hidden lg:col-span-12 space-y-4">
                      {filteredTerms.map((term, index) => {
                        const isOpen = termsMobileOpenIdx === index;
                        return (
                          <div
                            key={term.num}
                            className="bg-white border border-gray-100/90 rounded-2xl overflow-hidden shadow-sm transition-all"
                          >
                            <button
                              onClick={() => {
                                setTermsMobileOpenIdx(isOpen ? null : index);
                              }}
                              className="w-full flex items-center justify-between p-5 text-left font-bold"
                            >
                              <div className="flex items-center gap-3.5">
                                <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${isOpen ? "bg-[#FFF0F2] text-[#D50032]" : "bg-gray-100 text-gray-400"
                                  }`}>
                                  {term.num}
                                </span>
                                <span className={`text-base font-black transition-colors ${isOpen ? "text-[#D50032]" : "text-gray-900"}`}>
                                  {term.title}
                                </span>
                              </div>
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 shrink-0 ${isOpen ? "bg-[#D50032] text-white rotate-180 shadow-sm" : "bg-gray-100 text-gray-500 hover:bg-gray-250"
                                }`}>
                                <ChevronDown className="w-3.5 h-3.5" />
                              </div>
                            </button>

                            <div
                              className="transition-all duration-300 ease-in-out overflow-hidden animate-none"
                              style={{
                                maxHeight: isOpen ? "600px" : "0px",
                                opacity: isOpen ? 1 : 0
                              }}
                            >
                              <div className="px-5 pb-5 pt-1 text-sm text-gray-600 leading-relaxed font-medium border-t border-slate-50 whitespace-pre-line text-left">
                                {term.content}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </ScrollReveal>
            </div>
          </section>
        )}

        {/* 8. Why Choose FinTrade */}
        {sectionVisibility.show_why_choose !== false && (
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
                  {whyChooseList.map((feature, i) => {
                    const IconComponent = typeof feature.icon === 'function' ? feature.icon : (iconMap[feature.icon] || Brain);
                    return (
                      <div key={i} className="flex-shrink-0 w-[270px] sm:w-[320px] md:w-full md:flex-shrink snap-center flex">
                        <div className="w-full flex flex-col justify-between overflow-hidden rounded-[28px] border border-gray-100/90 bg-white p-7 shadow-[0_12px_40px_rgba(0,0,0,0.012)] hover:-translate-y-1.5 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] hover:border-[#D50032]/10 transition-all duration-300 group select-none">
                          <div>
                            {/* Top Row */}
                            <div className="flex justify-between items-center w-full">
                              {/* Circular pink icon container */}
                              <div className="w-12 h-12 rounded-full bg-[#FFF0F2] flex items-center justify-center flex-shrink-0 overflow-hidden">
                                {typeof feature.icon === 'string' && feature.icon.startsWith("/uploads") ? (
                                  <img src={getImageUrl(feature.icon)} alt={feature.title} className="w-full h-full object-cover" />
                                ) : (
                                  <IconComponent className="h-6 w-6 text-[#D50032]" />
                                )}
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
                              {feature.desc || feature.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
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
                        className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${isActive ? "w-5 bg-[#D50032]" : "w-1.5 bg-gray-300 hover:bg-gray-400"
                          }`}
                      />
                    );
                  })}
                </div>
              </ScrollReveal>

            </div>
          </section>
        )}



        {/* Testimonials Section */}
        {sectionVisibility.show_testimonials !== false && testimonials.length > 0 && (
          <section className="py-16 bg-[#07162C] text-white relative z-10 overflow-hidden border-t border-[#0b192e] shadow-inner select-none">
            {/* Subtle gold decorative glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#C2A86A]/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <ScrollReveal>
                <div className="text-center mb-12">
                  <div className="inline-flex items-center gap-1.5 px-4.5 py-1.5 rounded-full mb-3 border border-[#C2A86A]/20 bg-[#C2A86A]/5">
                    <span className="text-[#C2A86A] font-extrabold text-xs tracking-wider uppercase">💬 Feedback</span>
                  </div>
                  <h2 className="text-3xl md:text-4.5xl font-black mb-3 tracking-tight">
                    What Our <span className="text-[#C2A86A]">Traders</span> Say
                  </h2>
                  <p className="text-sm sm:text-base text-gray-400 max-w-xl mx-auto leading-relaxed">
                    Hear from students who completed our prop training and successfully qualified for trading capital.
                  </p>
                </div>

                {/* Testimonials Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {testimonials.map((testi, i) => (
                    <Card
                      key={testi.id || i}
                      className="p-6 border border-[#C2A86A]/10 bg-[#0B203E]/50 backdrop-blur-md text-white rounded-[24px] flex flex-col justify-between hover:border-[#C2A86A]/30 transition-all duration-300 group shadow-lg"
                    >
                      <div>
                        {/* Quote icon & stars */}
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-4xl text-[#C2A86A]/20 font-serif leading-none">“</span>
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                size={14}
                                className={star <= testi.rating ? "fill-[#C2A86A] text-[#C2A86A]" : "text-[#F4F1EA]/20"}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Review comments */}
                        <p className="text-gray-300 text-sm leading-relaxed mb-6 italic">
                          "{testi.comments || "Excellent course and mentor support!"}"
                        </p>
                      </div>

                      {/* User info */}
                      <div className="border-t border-[#C2A86A]/10 pt-4 mt-auto">
                        <div className="font-bold text-sm text-[#F4F1EA]">
                          {testi.user_name || "Verified Student"}
                        </div>
                        {testi.course_title && (
                          <div className="inline-block mt-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold text-[#C2A86A] bg-[#C2A86A]/10 uppercase tracking-wider">
                            {testi.course_title}
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollReveal>
            </div>
          </section>
        )}

        {/* FAQ Section */}
        {sectionVisibility.show_faq !== false && (
          <section className="py-20 bg-gray-50 relative z-10 overflow-hidden">
            {/* Glowing background details */}
            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-72 h-72 bg-[#D50032]/5 rounded-full filter blur-[80px] -z-10 pointer-events-none" />
            <div className="absolute top-1/3 right-0 w-80 h-80 bg-red-500/5 rounded-full filter blur-[100px] -z-10 pointer-events-none" />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

              {/* Section Header */}
              <div className="text-center mb-16">
                <ScrollReveal mobileDirection="up">
                  <span className="px-3.5 py-1 rounded-full text-xs font-bold text-[#D50032] bg-[#D50032]/5 border border-[#D50032]/10 uppercase tracking-widest">
                    Support & Policies
                  </span>
                  <h2 className="text-3xl md:text-5xl font-black tracking-tight text-gray-950 mt-4 leading-tight font-sans uppercase">
                    Frequently Asked <span className="text-[#D50032]">Questions</span>
                  </h2>
                  <p className="text-gray-500 font-semibold text-sm sm:text-base mt-3 max-w-xl mx-auto">
                    Return & Refund Policy Guidelines
                  </p>
                </ScrollReveal>
              </div>

              {/* Accordion Questions */}
              <ScrollReveal mobileDirection="up" delay={0.2}>
                <div className="space-y-4">
                  {[
                    {
                      q: "Can I request a refund after purchasing a course?",
                      a: "No. All course purchases made through FinTrade are final. We do not offer refunds, returns, or cancellations once the payment has been successfully processed."
                    },
                    {
                      q: "Why does FinTrade not provide refunds?",
                      a: "Our courses provide immediate access to proprietary educational content, learning resources, and training materials. As these digital services are made available upon enrollment, we are unable to offer refunds after purchase."
                    },
                    {
                      q: "What if I am unable to attend the course after enrollment?",
                      a: "We recommend reviewing the course details carefully before enrolling. In case of genuine concerns, you may contact our support team, and we will evaluate available options at our discretion. However, refunds will not be provided."
                    },
                    {
                      q: "Can I transfer my course enrollment to another person?",
                      a: "Course enrollments are generally non-transferable and are intended solely for the registered participant. Any exceptional requests will be reviewed on a case-by-case basis by FinTrade management."
                    },
                    {
                      q: "What should I do if I made a payment by mistake?",
                      a: "If you believe a payment was made in error or you were charged incorrectly, please contact our support team immediately. We will investigate the issue and provide appropriate assistance. However, completed course purchases are not eligible for refunds."
                    },
                    {
                      q: "What law governs disputes related to FinTrade?",
                      a: "All disputes shall be governed and construed in accordance with the laws of India, and shall be subject to the exclusive jurisdiction of the competent courts at Ahmedabad, Gujarat."
                    }
                  ].map((faq, index) => {
                    const isOpen = faqOpenIndex === index;
                    return (
                      <div
                        key={index}
                        className={`bg-white border rounded-2xl transition-all duration-300 overflow-hidden ${isOpen
                          ? "border-[#D50032] shadow-[0_8px_30px_rgba(213,0,50,0.04)]"
                          : "border-gray-200/80 hover:border-gray-300 hover:shadow-sm"
                          }`}
                      >
                        <button
                          onClick={() => setFaqOpenIndex(isOpen ? null : index)}
                          className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 font-semibold text-gray-950 cursor-pointer focus:outline-none select-none"
                        >
                          <span className={`text-base md:text-lg transition-colors duration-300 ${isOpen ? "text-[#D50032]" : "text-gray-900"}`}>
                            {faq.q}
                          </span>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 shrink-0 ${isOpen ? "bg-[#D50032] text-white rotate-180" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                            }`}>
                            <ChevronDown className="w-4 h-4" />
                          </div>
                        </button>

                        <div
                          className="transition-all duration-300 ease-in-out overflow-hidden"
                          style={{
                            maxHeight: isOpen ? "200px" : "0px",
                            opacity: isOpen ? 1 : 0
                          }}
                        >
                          <div className="px-6 pb-6 pt-1 text-sm md:text-base text-gray-600 leading-relaxed font-medium border-t border-slate-50">
                            {faq.a}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollReveal>

            </div>
          </section>
        )}

        {/* CTA Section */}
        {sectionVisibility.show_cta !== false && (
          <section className="py-6 md:py-8 bg-white relative z-10 overflow-hidden">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <ScrollReveal mobileDirection="left">
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
        )}



        {/* Registration Modal */}
        <Dialog open={isRegModalOpen} onOpenChange={(open) => {
          setIsRegModalOpen(open);
          if (!open) {
            setIsRegOtpSent(false);
            setRegOtp("");
          }
        }}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Register for {selectedLectureForReg?.title || "Live Class"}</DialogTitle>
              <DialogDescription>
                {isRegOtpSent
                  ? `Enter the 6-digit OTP sent to ${regForm.email}`
                  : "Please fill in your details to reserve your spot."}
              </DialogDescription>
            </DialogHeader>

            {regSuccess ? (
              <div className="py-6 text-center">
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Registered Successfully!</h3>
                <p className="text-sm text-gray-500">Meeting link you will get on your mail.</p>
              </div>
            ) : (
              <form onSubmit={handleRegisterSubmit}>
                {!isRegOtpSent ? (
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="reg-name">Full Name <span className="text-[#D50032]">*</span></Label>
                      <Input id="reg-name" required placeholder="John Doe" value={regForm.full_name} onChange={(e) => setRegForm({ ...regForm, full_name: e.target.value })} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="reg-contact">Mobile Number <span className="text-[#D50032]">*</span></Label>
                      <Input id="reg-contact" required placeholder="+91 98765 43210" value={regForm.mobile_no} onChange={(e) => setRegForm({ ...regForm, mobile_no: e.target.value })} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="reg-email">Email Address <span className="text-[#D50032]">*</span></Label>
                      <Input id="reg-email" required type="email" placeholder="john@example.com" value={regForm.email} onChange={(e) => setRegForm({ ...regForm, email: e.target.value })} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="reg-city">City</Label>
                      <Input id="reg-city" placeholder="Mumbai" value={regForm.city} onChange={(e) => setRegForm({ ...regForm, city: e.target.value })} />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-6 py-8">
                    <InputOTP maxLength={6} value={regOtp} onChange={setRegOtp}>
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                    <Button variant="link" className="text-xs text-[#D50032]" onClick={() => { setIsRegOtpSent(false); setRegOtp(""); }}>
                      Edit Details
                    </Button>
                  </div>
                )}
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsRegModalOpen(false)}>
                    Cancel
                  </Button>
                  {!isRegOtpSent ? (
                    <Button type="button" onClick={sendRegistrationOTP} disabled={isSendingRegOtp || !regForm.full_name || !regForm.email || !regForm.mobile_no} className="bg-[#D50032] hover:bg-[#b00029] text-white">
                      {isSendingRegOtp ? "Sending OTP..." : "Verify Email"}
                    </Button>
                  ) : (
                    <Button type="submit" disabled={isSubmittingReg || regOtp.length !== 6} className="bg-[#D50032] hover:bg-[#b00029] text-white">
                      {isSubmittingReg ? "Registering..." : "Confirm Registration"}
                    </Button>
                  )}
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>

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
              {isAuthenticated ? (
                <Button className="w-full" style={{ background: "#D50032", color: "white" }} onClick={() => {
                  alert("Your brochure download will start shortly.");
                  setBrochureOpen(false);
                  triggerBrochureDownload();
                }} disabled={!leadData.name || !leadData.contact}>
                  Download Now
                </Button>
              ) : !otpSent ? (
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
