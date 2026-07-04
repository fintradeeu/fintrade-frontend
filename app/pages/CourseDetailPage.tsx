import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import api from "../services/api";
import CourseCheckoutModal from "../components/CourseCheckoutModal";
import { Dialog, DialogContent } from "../components/ui/dialog";
import { ChevronLeft, BookOpen, Clock, Users, Award, Shield, CheckCircle, ArrowRight, Play, LineChart, Trophy } from "lucide-react";
import { Button } from "../components/ui/button";
import { motion } from "motion/react";

// Reusable scroll reveal component using framer motion (slow 0.5s time get)
function ScrollReveal({ 
  children, 
  className = "", 
  delay = 0,
  duration = 0.5,
  y = 20,
  x = 0
}: { 
  children: React.ReactNode; 
  className?: string; 
  delay?: number;
  duration?: number;
  y?: number;
  x?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y, x }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration, ease: [0.16, 1, 0.3, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Static course details fallback
const staticCourseDetails: Record<string, { description: string; highlights: string[]; outcomes: string[]; modules: { title: string; lessons: string[] }[] }> = {
  FMF: {
    description: "Master the fundamentals of financial markets and start your trading journey with confidence. Learn from real-world market analysts and build a foundation in stock analysis, derivatives, and emotional discipline.",
    highlights: [
      "Industry Recognized Certification",
      "Practical Market Simulator Exposure",
      "Dedicated Mentor Support & Live Q&A",
      "30 Days of Structured Learning",
      "Interactive Doubt Sessions",
      "Syllabus aligned with industry standards"
    ],
    outcomes: [
      "Professional Retail Trader",
      "Financial Markets Advisor",
      "Equity Research Assistant",
      "Risk Management Consultant"
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
    description: "Deep dive into research methodologies, comprehensive technical analysis, and fundamental equity research. Built specifically for professionals, graduates, and traders aiming to build a career in stock market research or make data-driven long-term investments.",
    highlights: [
      "Professional Equity Research Report Training",
      "Structural Fundamental Valuation & DCF Models",
      "Placement Assistance & Portfolio Showcase",
      "Comprehensive Sector-wise research training",
      "Direct guidance from SEBI Registered Analysts",
      "1-on-1 Portfolio review & feedback"
    ],
    outcomes: [
      "Equity Research Associate",
      "Investment Analyst",
      "Valuation Specialist",
      "Portfolio Advisor"
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
      "Practical Prop Desk Simulator & Capital Placement Pathway",
      "Access to funded prop trading challenges",
      "Intraday order flow & depth analysis",
      "Recruitment assistance at leading prop trading houses"
    ],
    outcomes: [
      "Proprietary Desk Trader",
      "Derivatives Analyst",
      "Quant Trading Strategist",
      "Fund Operations Manager"
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

const getStaticDetails = (title: string = "") => {
  const t = title.toUpperCase();
  if (t.includes("FMF") || t.includes("FOUNDATION") || t.includes("BASIC")) return staticCourseDetails.FMF;
  if (t.includes("CARP") || t.includes("ANALYST") || t.includes("RESEARCH")) return staticCourseDetails.CARP;
  if (t.includes("CPTP") || t.includes("PROFESSIONAL") || t.includes("PROP")) return staticCourseDetails.CPTP;
  return staticCourseDetails.FMF; // Default fallback
};

const mockCourses: any[] = [
  {
    id: 13,
    title: "Course 2",
    name: "Course 2",
    difficulty_level: "beginner",
    level: "Beginner",
    duration_hours: "10",
    duration: "10 Days",
    price: "1299",
    original_price: "0",
    savings: null,
    short_description: "Course 2",
    description: "Course 2.",
    icon: "BookOpen",
    modules: []
  },
  {
    id: 11,
    title: "c2",
    name: "c2",
    difficulty_level: "beginner",
    level: "Beginner",
    duration_hours: "20",
    duration: "20 Days",
    price: "23233",
    original_price: "199",
    savings: null,
    short_description: "asdfgh",
    description: "asdfgh.",
    icon: "BookOpen",
    modules: []
  },
  {
    id: 10,
    title: "Course1",
    name: "Course1",
    difficulty_level: "beginner",
    level: "Beginner",
    duration_hours: "30",
    duration: "30 Days",
    price: "4999",
    original_price: "0",
    savings: null,
    short_description: "Course1",
    description: "Course1.",
    icon: "BookOpen",
    modules: []
  },
  {
    id: 9,
    title: "c1",
    name: "c1",
    difficulty_level: "beginner",
    level: "Beginner",
    duration_hours: "10",
    duration: "10 Days",
    price: "20",
    original_price: "299",
    savings: "279",
    short_description: "abcdefgh",
    description: "abcdefgh.",
    icon: "BookOpen",
    modules: []
  },
  {
    id: 8,
    title: "a",
    name: "a",
    difficulty_level: "beginner",
    level: "Beginner",
    duration_hours: "10",
    duration: "10 Days",
    price: "500",
    original_price: "1000",
    savings: "500",
    short_description: "a",
    description: "a.",
    icon: "BookOpen",
    modules: []
  }
];

export default function CourseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem("token");

  const [course, setCourse] = useState<any>(null);
  const [availableBatches, setAvailableBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [showKycModal, setShowKycModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await api.get(`/courses/${id}`);
        setCourse(res.data);
        
        try {
          const batchRes = await api.get(`/batches/public/list?course_id=${id}`);
          setAvailableBatches(batchRes.data || []);
        } catch (batchErr) {
          console.warn("Failed to fetch active batches for course detail page:", batchErr);
        }
      } catch (err) {
        console.error("Failed to fetch course details from API, attempting local fallback:", err);
        // Attempt fallback from mockCourses
        const matchedMock = mockCourses.find(c => String(c.id) === String(id));
        if (matchedMock) {
          setCourse(matchedMock);
        } else {
          // If not found in mockCourses, create a generic fallback based on the ID
          const mockDetail = getStaticDetails(String(id));
          setCourse({
            id: id,
            title: id,
            price: "1299",
            description: mockDetail.description,
            modules: mockDetail.modules
          });
        }
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchCourse();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#D50032] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Course not found</h2>
        <Button onClick={() => navigate("/")} className="bg-[#D50032] hover:bg-[#b00029] text-white">
          Back to Home
        </Button>
      </div>
    );
  }

  const staticDetails = getStaticDetails(course.title);

  // Derive level and duration strings
  const levelBadge = course.difficulty_level
    ? course.difficulty_level.charAt(0).toUpperCase() + course.difficulty_level.slice(1)
    : "Beginner";

  const displayDuration = course.duration_hours ? `${course.duration_hours} Days` : "Self-paced";

  // Calculate savings/price info
  const priceNum = Number(course.price || 0);
  const originalPriceNum = Number(course.original_price || 0);
  let discountPercentage = 0;
  if (originalPriceNum > priceNum) {
    discountPercentage = Math.round(((originalPriceNum - priceNum) / originalPriceNum) * 100);
  }

  const handleEnrollClick = async () => {
    if (!isAuthenticated) {
      navigate("/register");
      return;
    }
    setShowCheckoutModal(true);
  };

  // Icons array for Highlights
  const highlightIcons = [BookOpen, Clock, Users, Award, Shield, CheckCircle];

  return (
    <div className="flex-1 bg-white font-sans overflow-hidden">
      {/* Course Hero Header (same UI as shivalik) */}
      <section className="py-12 md:py-16 my-4 bg-gray-50/50">
        <div className="w-full max-w-7xl mx-auto px-6 lg:px-8">
          {/* Back Button */}
          <ScrollReveal delay={0.05} y={-10}>
            <div className="mb-8">
              <button
                onClick={() => navigate("/")}
                className="flex items-center cursor-pointer space-x-1 text-[#666666] hover:text-[#D50032] transition-colors duration-200 font-light"
              >
                <ChevronLeft className="w-5 h-5" />
                <span className="lg:text-lg text-base">Back to Home</span>
              </button>
            </div>
          </ScrollReveal>

          {/* Hero details */}
          <div className="grid lg:grid-cols-1 gap-8">
            <div className="space-y-6 text-left">
              <ScrollReveal delay={0.1} y={20}>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="px-3.5 py-1 rounded-full text-xs font-bold text-[#D50032] bg-[#FFF5F6] border border-[#D50032]/8 inline-block">
                      {levelBadge} Program
                    </span>
                    <span className="px-3.5 py-1 rounded-full text-xs font-bold text-[#D50032] bg-[#FFF5F6] border border-[#D50032]/8 inline-block">
                      {displayDuration}
                    </span>
                  </div>
                  <h1 className="text-4xl md:text-5xl lg:text-[54px] leading-tight font-extrabold text-gray-900 tracking-tight">
                    {course.title}
                  </h1>
                  <p className="text-lg md:text-2xl font-semibold text-[#D50032]">
                    Become a Professional Trader.
                  </p>
                </div>
              </ScrollReveal>
              
              <ScrollReveal delay={0.2} y={25}>
                <p className="lg:text-xl text-lg leading-relaxed font-light text-[#666666] max-w-3xl whitespace-pre-line">
                  {course.description || course.short_description || "Elite trading program delivering institutional grade research and strategies. Prepared to act, not just plan."}
                </p>
              </ScrollReveal>

              {/* Action and Pricing */}
              <ScrollReveal delay={0.3} y={30}>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-6 pt-4">
                  <div className="bg-white border border-gray-100 rounded-2xl p-4 px-6 flex items-center gap-4 shadow-sm w-fit">
                    <div>
                      <span className="text-xs text-gray-400 font-medium block">Enrollment Fee</span>
                      <div className="flex items-baseline gap-2 mt-1">
                        {originalPriceNum > priceNum && (
                          <span className="text-base md:text-lg font-medium text-gray-400 line-through">
                            ₹{originalPriceNum.toLocaleString("en-IN")}
                          </span>
                        )}
                        <span className="text-2xl md:text-3xl font-black text-gray-900">
                          ₹{priceNum.toLocaleString("en-IN")}
                          <span className="text-xs font-normal text-gray-400 ml-1">+ GST</span>
                        </span>
                      </div>
                    </div>
                    {discountPercentage > 0 && (
                      <div className="bg-green-50 text-emerald-600 border border-emerald-100 px-2.5 py-1 text-xs font-black rounded-lg">
                        {discountPercentage}% OFF
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={handleEnrollClick}
                    disabled={enrollLoading}
                    className="bg-[#D50032] hover:bg-black text-white px-8 py-4 text-base font-bold transition-all duration-200 ease-in-out hover:scale-105 flex items-center justify-center gap-2 rounded-xl h-auto"
                  >
                    {enrollLoading ? "Checking Enrollment..." : "Enroll Now"}
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </div>
                {availableBatches.length > 0 && (
                  <div className="mt-6 space-y-3">
                    <span className="text-xs text-[#0B2A5B] font-extrabold uppercase tracking-wider block">Cohort Batches &amp; Schedules:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl">
                      {availableBatches.map((batch: any) => {
                        const statusColors: Record<string, string> = {
                          "Registration Open": "bg-emerald-50 text-emerald-700 border-emerald-200",
                          "Running": "bg-blue-50 text-blue-700 border-blue-200",
                          "Upcoming": "bg-amber-50 text-amber-700 border-amber-200",
                          "Completed": "bg-gray-50 text-gray-600 border-gray-200"
                        };
                        const statusColor = statusColors[batch.status] || "bg-gray-50 text-gray-600 border-gray-200";
                        return (
                          <div key={batch.id} className="text-xs bg-[#F4F1EA]/30 border border-[#0B2A5B]/10 p-3.5 px-4 rounded-xl flex flex-col gap-1.5 shadow-sm hover:border-[#0B2A5B]/30 transition-all text-left">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[#0B2A5B] font-extrabold text-sm truncate">🎯 {batch.name}</span>
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${statusColor} shrink-0`}>
                                {batch.status}
                              </span>
                            </div>
                            <div className="space-y-1 text-gray-500 font-medium text-[11px]">
                              <div className="flex items-center gap-1.5">
                                <span>📅</span>
                                <span>Batch: {new Date(batch.start_date).toLocaleDateString(undefined, { dateStyle: "medium" })} – {new Date(batch.end_date).toLocaleDateString(undefined, { dateStyle: "medium" })}</span>
                              </div>
                              {batch.status === "Registration Open" && (
                                <div className="flex items-center gap-1.5 text-red-500 font-semibold">
                                  <span>⏰</span>
                                  <span>Reg. Closes: {new Date(batch.registration_end_date).toLocaleDateString(undefined, { dateStyle: "medium" })}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* Program Highlights Section (Grid like shivalik) */}
      <section className="py-12 md:py-16 bg-white border-t border-gray-100">
        <div className="w-full max-w-7xl mx-auto px-6 lg:px-8">
          <ScrollReveal delay={0.05} y={15}>
            <div className="mb-10 text-left">
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">Program Highlights</h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(course.marketing_highlights && Array.isArray(course.marketing_highlights) && course.marketing_highlights.some((h: any) => h && h.trim())
              ? course.marketing_highlights.filter((h: any) => h && h.trim())
              : staticDetails.highlights
            ).map((highlight: string, idx: number) => {
              const HighlightIcon = highlightIcons[idx % highlightIcons.length];
              return (
                <ScrollReveal key={idx} delay={idx * 0.05} y={20}>
                  <div
                    className="flex items-start gap-4 border border-gray-100 rounded-2xl p-5 hover:border-[#D50032] hover:-translate-y-1 group transition-all duration-300 shadow-sm"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-xl bg-[#FFF5F6] border border-[#D50032]/8 flex items-center justify-center">
                        <HighlightIcon className="w-5 h-5 text-[#D50032]" strokeWidth={2} />
                      </div>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-gray-800 leading-snug mt-1.5 text-left">
                      {highlight}
                    </h3>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>



      {/* Course Outcomes Section (Same as shivalik) */}
      <section className="py-12 md:py-16 bg-white border-t border-gray-100">
        <div className="w-full max-w-7xl mx-auto px-6 lg:px-8">
          <ScrollReveal delay={0.05} y={15}>
            <div className="mb-8 text-left">
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">Outcomes</h2>
            </div>
          </ScrollReveal>
          
          <ul className="space-y-5 pl-1">
            {staticDetails.outcomes.map((outcome: string, idx: number) => (
              <ScrollReveal key={idx} delay={idx * 0.05} x={-15} y={0}>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-2.5 h-2.5 mt-2 rounded-full bg-[#D50032]" aria-hidden="true" />
                  <span className="text-lg lg:text-xl font-medium text-[#666666] text-left">
                    {outcome}
                  </span>
                </li>
              </ScrollReveal>
            ))}
          </ul>
        </div>
      </section>

      {/* KYC Required Modal */}
      <Dialog open={showKycModal} onOpenChange={setShowKycModal}>
        <DialogContent className="sm:max-w-lg bg-transparent border-none shadow-none p-0 z-[10001] overflow-visible">
          <div
            className="max-h-[90vh] overflow-y-auto"
            style={{
              background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)",
              borderRadius: "24px",
              padding: "0",
              boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.07)",
              position: "relative",
            }}
          >
            <div style={{ height: "4px", background: "linear-gradient(90deg, #22c55e, #16a34a, #4ade80)", width: "100%" }} />

            <div className="p-6 sm:p-9" style={{ textAlign: "center", position: "relative" }}>
              <div style={{
                width: "88px", height: "88px",
                background: "linear-gradient(135deg, rgba(34,197,94,0.2), rgba(22,163,74,0.15))",
                borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 16px",
                border: "2px solid rgba(34,197,94,0.4)",
                boxShadow: "0 0 40px rgba(34,197,94,0.25)",
              }}>
                <div style={{
                  width: "60px", height: "60px",
                  background: "linear-gradient(135deg, #22c55e, #16a34a)",
                  borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 8px 24px rgba(34,197,94,0.4)",
                }}>
                  <CheckCircle style={{ color: "white", width: "32px", height: "32px" }} />
                </div>
              </div>

              <div style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)",
                borderRadius: "999px", padding: "4px 14px", marginBottom: "16px",
              }}>
                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#22c55e" }} />
                <span style={{ color: "#4ade80", fontSize: "12px", fontWeight: 600, letterSpacing: "0.05em" }}>
                  EXAM CLEARED
                </span>
              </div>

              <h3 style={{ color: "white", fontSize: "26px", fontWeight: 800, marginBottom: "8px", lineHeight: 1.2 }}>
                Congratulations! 🎉
              </h3>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px", marginBottom: "28px", lineHeight: 1.6 }}>
                You've successfully passed the entrance exam. One final step before you begin your journey.
              </p>

              <div style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "16px",
                padding: "20px",
                marginBottom: "28px",
                textAlign: "left",
              }}>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", marginBottom: "16px" }}>
                  NEXT STEPS
                </p>
                {[
                  { icon: "✅", label: "Entrance Exam", done: true },
                  { icon: "📋", label: "KYC & Contract Signing", done: false, active: true },
                  { icon: "💳", label: "Payment & Enrollment", done: false },
                ].map((step, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: "12px",
                    padding: "8px 12px",
                    borderRadius: "10px",
                    marginBottom: i < 2 ? "6px" : 0,
                    background: step.active ? "rgba(34,197,94,0.1)" : "transparent",
                    border: step.active ? "1px solid rgba(34,197,94,0.2)" : "1px solid transparent",
                  }}>
                    <span style={{ fontSize: "16px" }}>{step.icon}</span>
                    <span style={{
                      color: step.done ? "rgba(255,255,255,0.35)" : step.active ? "#4ade80" : "rgba(255,255,255,0.5)",
                      fontSize: "13px",
                      fontWeight: step.active ? 700 : 500,
                      textDecoration: step.done ? "line-through" : "none",
                    }}>
                      {step.label}
                    </span>
                    {step.active && (
                      <span style={{
                        marginLeft: "auto", fontSize: "10px", fontWeight: 700,
                        color: "#22c55e", letterSpacing: "0.05em",
                      }}>
                        → NOW
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-3 w-full mt-4">
                <button
                  onClick={() => setShowKycModal(false)}
                  className="w-full sm:flex-1 h-12 rounded-xl border border-white/12 bg-white/6 text-white/60 text-sm font-semibold hover:bg-white/10 transition-all duration-200 cursor-pointer"
                >
                  Maybe Later
                </button>
                <button
                  onClick={() => {
                    setShowKycModal(false);
                    navigate(`/student/contract-kyc?course_id=${course.id}`);
                  }}
                  className="w-full sm:flex-[2] h-12 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-bold shadow-lg shadow-green-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
                >
                  Complete KYC Now →
                </button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Checkout Modal */}
      {showCheckoutModal && (
        <CourseCheckoutModal
          course={course}
          onClose={() => setShowCheckoutModal(false)}
          onSuccess={() => {
            setShowCheckoutModal(false);
            alert("Payment successful!");
            window.location.href = `/student/contract-kyc?course_id=${course.id}`;
          }}
        />
      )}
    </div>
  );
}
