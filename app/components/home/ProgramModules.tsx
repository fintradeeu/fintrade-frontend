import { useState, useEffect, useRef } from "react";
import { ChevronDown, ChevronUp, Clock, BookOpen, Layers, Play, Video, FileAudio, FileText, HelpCircle, Download } from "lucide-react";
import api from "../../services/api";
import { motion } from "motion/react";
interface Module {
  num: number;
  title: string;
  overview: string;
  lessons?: any[];
}
// dgdd
interface ProgramSection {
  title: string;
  duration: string;
  modules: Module[];
}

const programSections: ProgramSection[] = [
  {
    title: "PROFESSIONAL TRADING MINDSET FOUNDATION",
    duration: "2 Days",
    modules: [
      { num: 1, title: "Trader’s Mindset & Market Psychology", overview: "Psychology foundation for retail and professional trading." },
      { num: 2, title: "Professional Trading Mindset Foundation", overview: "Developing discipline and professional trading habits." }
    ]
  },
  {
    title: "FINANCIAL MARKET FOUNDATION",
    duration: "30 Days",
    modules: [
      { num: 1, title: "Introduction to Financial Market", overview: "Understanding how financial markets work." },
      { num: 2, title: "Understanding Security Market", overview: "Market participants, stock exchanges, and demat accounts." },
      { num: 3, title: "Methods of analysing Financial Security", overview: "Overview of technical and fundamental analysis." }
    ]
  },
  {
    title: "MARKET ANALYSIS AND TRADING STRATEGY DEVELOPMENT",
    duration: "30 Days",
    modules: [
      { num: 1, title: "Fundamental Analysis Framework", overview: "Evaluating balance sheets and cash flows." },
      { num: 2, title: "Application of Fundamental Analysis", overview: "Valuation methodologies and DCF models." },
      { num: 3, title: "Technical Analysis for Trading and Investing", overview: "Candlesticks, trends, indicators, and chart patterns." },
      { num: 4, title: "Trading & Analytics Software", overview: "Using charting software and trading terminals." }
    ]
  },
  {
    title: "ADVANCED INSTITUTIONAL TRADING AND RISK MANAGEMENT",
    duration: "30 Days",
    modules: [
      { num: 1, title: "Applied Technical Analysis", overview: "Advanced indicators and order book dynamics." },
      { num: 2, title: "Mechanics of Derivative Market", overview: "Introduction to Futures & Options trading." },
      { num: 3, title: "Options & Futures Strategies", overview: "Spreads, straddles, hedging, and Greeks." },
      { num: 4, title: "Professional Risk Management", overview: "Position sizing, risk manual, and drawdown control." }
    ]
  },
  {
    title: "MARKET APPLICATION AND EXECUTION",
    duration: "5 Days",
    modules: [
      { num: 1, title: "Trading Lab & Back testing Mastery", overview: "Testing strategy rules on historical data." },
      { num: 2, title: "Real World Market Execution", overview: "Live trading execution under guidance." }
    ]
  }
];

export default function ProgramModules({ apiCourses }: { apiCourses?: any[] | null }) {
  const [expandedStageIdx, setExpandedStageIdx] = useState<number | null>(0);
  const [timelineSections, setTimelineSections] = useState<any[]>(programSections);
  const [activeModKey, setActiveModKey] = useState<string | null>(null);
  const [expandedDescKeys, setExpandedDescKeys] = useState<Set<string>>(new Set());

  const stageRefs = useRef<(HTMLDivElement | null)[]>([]);

  const toggleDesc = (key: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedDescKeys(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video": return <Video className="text-[#D50032] w-3.5 h-3.5" />;
      case "audio": return <FileAudio className="text-blue-500 w-3.5 h-3.5" />;
      case "quiz": return <HelpCircle className="text-purple-500 w-3.5 h-3.5" />;
      case "pdf": return <Download className="text-orange-500 w-3.5 h-3.5" />;
      default: return <FileText className="text-gray-400 w-3.5 h-3.5" />;
    }
  };

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        const res = await api.get("/settings/landing-page");
        if (res.data && res.data.program_modules && res.data.program_modules.length > 0) {
          setTimelineSections(res.data.program_modules);
        } else {
          setTimelineSections(programSections);
        }
      } catch (err) {
        console.error("Failed to fetch timeline config", err);
        setTimelineSections(programSections);
      }
    };
    fetchTimeline();
  }, []);

  const sectionsToUse: any[] = timelineSections;



  const toggleStage = (idx: number) => {
    setExpandedStageIdx((prev) => (prev === idx ? null : idx));
  };

  return (
    <section className="py-4 md:py-6 relative z-10 bg-transparent">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full mb-4 border border-[#D50032]/20 bg-[#D50032]/5">
            <span className="text-xs font-bold text-[#D50032] flex items-center gap-1">
              📋 Program Structure
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 text-gray-900 tracking-tight text-center uppercase">
            Certified Professional <span className="text-[#D50032]">Trading Program</span>
          </h2>
          <p className="text-base sm:text-lg text-gray-500 max-w-2xl mx-auto font-medium text-center leading-relaxed">
            A comprehensive 5-stage program spanning 105 days — from mindset to live market execution.
          </p>
        </div>

        {/* Timeline Container */}
        <div className="relative">
          {/* Centered Vertical Line on All Screen Sizes */}
          <div className="absolute left-1/2 top-0 bottom-0 w-[2px] sm:w-[3px] bg-gradient-to-b from-[#D50032]/20 via-[#D50032]/30 to-[#D50032]/10 -translate-x-1/2 z-0" />

          <div className="space-y-6 md:space-y-8 relative z-10">
            {sectionsToUse.map((sec, idx) => {
              const isExpanded = expandedStageIdx === idx;
              const isLeft = idx % 2 === 0;

              return (
                <motion.div
                  key={idx}
                  ref={(el) => { stageRefs.current[idx] = el; }}
                  data-idx={idx}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.8, delay: idx * 0.2, ease: "easeOut" }}
                  className="relative flex flex-row items-center w-full transition-all duration-500"
                >
                  {/* Circular Node dot indicator on the timeline */}
                  <div className="absolute left-1/2 -translate-x-1/2 z-20 flex items-center justify-center">
                    <button
                      onClick={() => toggleStage(idx)}
                      className={`w-3.5 h-3.5 sm:w-6 h-6 rounded-full border-2 sm:border-4 border-white transition-all duration-300 shadow-md ${isExpanded
                          ? "bg-[#D50032] scale-110 shadow-[0_0_12px_rgba(213,0,50,0.5)]"
                          : "bg-gray-200 hover:bg-gray-300"
                        }`}
                    />
                  </div>

                  {/* Stage Card - Responsive Alternating Layout */}
                  <div className={`w-[calc(50%-12px)] sm:w-[calc(50%-20px)] md:w-[calc(50%-28px)] ${isLeft
                      ? "mr-auto pr-2 sm:pr-6 md:pr-10 text-left"
                      : "ml-auto pl-2 sm:pl-6 md:pl-10 text-left"

                      < div
                      onClick={() => toggleStage(idx)}
                    className={`w-full p-2.5 sm:p-4.5 md:p-5 bg-white border rounded-xl sm:rounded-2xl transition-all duration-300 cursor-pointer text-left ${isExpanded
                        ? "border-[#D50032] shadow-[0_12px_45px_rgba(213,0,50,0.04)] relative ring-1 ring-[#D50032]/10"
                        : "border-gray-100 shadow-[0_8px_35px_rgba(0,0,0,0.015)] hover:border-gray-200 hover:shadow-[0_12px_45px_rgba(0,0,0,0.02)]"
                      }`}
                  >
                    <div className="flex justify-between items-center gap-2 sm:gap-4">
                      <div className="flex-1 min-w-0">
                        <span className={`text-[8px] sm:text-xs font-black uppercase tracking-widest leading-normal block mb-0.5 sm:mb-2 ${isExpanded ? "text-[#D50032]" : "text-gray-400"
                          }`}>
                          Stage 0{idx + 1}
                        </span>
                        <h3 className="text-xs sm:text-lg font-black text-gray-900 leading-tight tracking-tight mb-0.5 sm:mb-1 truncate">
                          {sec.title}
                        </h3>
                        <span className={`text-[9px] sm:text-xs font-bold leading-normal uppercase tracking-wider block ${isExpanded ? "text-[#D50032]/85" : "text-gray-400"
                          }`}>
                          {sec.duration} • {sec.modules.length} Modules
                        </span>
                      </div>
                      <div className={`w-5 h-5 sm:w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${isExpanded ? "bg-[#D50032]/5 text-[#D50032]" : "bg-gray-50 text-gray-400"
                        }`}>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" /> : <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />}
                      </div>
                    </div>

                    {/* Accordion Body: Sequential expanded Module Cards */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-gray-100 space-y-2.5 transition-all duration-500 ease-in-out">
                        {sec.modules.map((mod: any, modIdx: number) => {
                          const modKey = `${idx}-${modIdx}`;
                          const isActive = activeModKey === modKey;

                          return (
                            <div
                              key={modIdx}
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveModKey(prev => prev === modKey ? null : modKey);
                              }}
                              className="group relative bg-white hover:bg-gray-50/50 border border-gray-100 rounded-xl p-2 sm:p-3.5 shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:shadow-[0_8px_30px_rgba(213,0,50,0.02)] transition-all cursor-pointer select-none"
                            >
                              <div className="flex items-center justify-between gap-1.5 sm:gap-3">
                                <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 flex-1">
                                  <div className="w-5 h-5 sm:w-6 h-6 rounded-full bg-[#D50032]/5 text-[#D50032] border border-[#D50032]/10 flex items-center justify-center text-[9px] sm:text-[11px] font-black flex-shrink-0">
                                    {mod.num}
                                  </div>
                                  <h4 className="font-extrabold text-gray-900 text-[11px] sm:text-base leading-snug group-hover:text-[#D50032] transition-colors truncate sm:whitespace-normal">
                                    {mod.title}
                                  </h4>
                                </div>
                                <div className="w-5 h-5 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center flex-shrink-0 border border-gray-150 transition-all">
                                  {isActive ? <ChevronUp className="w-3 h-3 text-[#D50032]" /> : <ChevronDown className="w-3 h-3" />}
                                </div>
                              </div>

                              {/* Inline Details */}
                              {isActive && (
                                <div className="mt-3 p-4 bg-gray-50 border border-gray-200/60 rounded-xl space-y-3.5 block text-left transition-all animate-in fade-in slide-in-from-top-2 duration-300">
                                  {/* Header */}
                                  <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-black bg-[#D50032]/5 text-[#D50032] border border-[#D50032]/10 px-2 py-0.5 rounded-md uppercase tracking-wider">
                                      Module {mod.num}
                                    </span>
                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                                      • Detailed Syllabus
                                    </span>
                                  </div>
                                  <h4 className="font-extrabold text-gray-900 text-sm leading-snug">
                                    {mod.title}
                                  </h4>

                                  {/* Overview Description with Read More / Read Less */}
                                  <div className="text-gray-500 text-xs font-medium leading-relaxed">
                                    <span>
                                      {!mod.overview || mod.overview.length <= 50 || expandedDescKeys.has(modKey)
                                        ? mod.overview
                                        : `${mod.overview.slice(0, 45)}...`}
                                    </span>
                                    {mod.overview && mod.overview.length > 50 && (
                                      <button
                                        onClick={(e) => toggleDesc(modKey, e)}
                                        className="text-[9px] font-black text-[#D50032] hover:text-[#FF3D00] focus:outline-none ml-1 uppercase tracking-wider inline-block cursor-pointer"
                                      >
                                        {expandedDescKeys.has(modKey) ? "Read Less" : "Read More"}
                                      </button>
                                    )}
                                  </div>

                                  {mod.lessons && mod.lessons.length > 0 && (
                                    <div className="border-t border-gray-200/80 pt-3">
                                      <h5 className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                                        📚 Lectures & Topics ({mod.lessons.length})
                                      </h5>
                                      <div className="flex flex-col gap-2">
                                        {mod.lessons.map((lesson: any, lessonIdx: number) => (
                                          <div
                                            key={lessonIdx}
                                            className="flex flex-col gap-1.5 p-2 rounded-lg bg-white border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.01)] text-left"
                                          >
                                            <span className="text-gray-700 text-[10px] sm:text-xs font-extrabold leading-snug break-words">
                                              {lesson.title}
                                            </span>
                                            <div className="flex items-center gap-1 text-[8px] sm:text-[9px] font-semibold text-gray-400 uppercase">
                                              {getTypeIcon(lesson.content_type)}
                                              {lesson.duration_minutes && (
                                                <span className="flex items-center gap-0.5 ml-1">
                                                  <Clock className="w-2.5 h-2.5 text-gray-400" />
                                                  {lesson.duration_minutes}m
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}

                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
                </motion.div>
          );
            })}
        </div>
      </div>
    </div>
    </section >
  );
}
