import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Clock, BookOpen, Layers, Play, Video, FileAudio, FileText, HelpCircle, Download } from "lucide-react";
import api from "../../services/api";

interface Module {
  num: number;
  title: string;
  overview: string;
  lessons?: any[];
}

interface ProgramSection {
  title: string;
  duration: string;
  modules: Module[];
}

const programSections: ProgramSection[] = [
  {
    title: "Course 2",
    duration: "10 Days",
    modules: [
      {
        num: 1,
        title: "Introduction to Course 2",
        overview: "Mastering the fundamentals and starting your trading journey in Course 2.",
        lessons: [
          { id: 1, title: "FinTrade Platform Tour", content_type: "video", duration_minutes: 12 },
          { id: 2, title: "Setting Up Your Demat Account", content_type: "pdf", duration_minutes: 15 },
          { id: 3, title: "Core Concepts of Financial Markets", content_type: "text", duration_minutes: 20 },
          { id: 4, title: "Module 1 Assessment Quiz", content_type: "quiz", duration_minutes: 10 }
        ]
      }
    ]
  },
  {
    title: "c2",
    duration: "20 Days",
    modules: [
      {
        num: 1,
        title: "Introduction to c2",
        overview: "Deep dive into c2 trading systems and research methodologies.",
        lessons: [
          { id: 5, title: "Overview of Advanced Technicals", content_type: "video", duration_minutes: 25 },
          { id: 6, title: "Constructing Key Support Channels", content_type: "text", duration_minutes: 30 },
          { id: 7, title: "Trend Analysis Assessment", content_type: "quiz", duration_minutes: 15 }
        ]
      }
    ]
  },
  {
    title: "Course1",
    duration: "30 Days",
    modules: [
      {
        num: 1,
        title: "Introduction to Course1",
        overview: "Professional grade trading strategies and advanced risk management in Course1.",
        lessons: [
          { id: 8, title: "Institutional Order Flow", content_type: "video", duration_minutes: 45 },
          { id: 9, title: "Risk Sizing Calculator Guide", content_type: "pdf", duration_minutes: 20 },
          { id: 10, title: "Discipline Rules & Execution Check", content_type: "quiz", duration_minutes: 15 }
        ]
      }
    ]
  },
  {
    title: "c1",
    duration: "10 Days",
    modules: [
      {
        num: 1,
        title: "Introduction to c1",
        overview: "Applied technical analysis and intraday setups in c1.",
        lessons: [
          { id: 11, title: "Intraday Price Action Setups", content_type: "video", duration_minutes: 30 },
          { id: 12, title: "RSI & VWAP Divergence Guide", content_type: "text", duration_minutes: 25 }
        ]
      }
    ]
  },
  {
    title: "a",
    duration: "10 Days",
    modules: [
      {
        num: 1,
        title: "Introduction to a",
        overview: "Capital allocation and proprietary desk simulation in course a.",
        lessons: [
          { id: 13, title: "Simulated Prop Desk Onboarding", content_type: "video", duration_minutes: 20 },
          { id: 14, title: "Equity Curve Optimization", content_type: "text", duration_minutes: 30 }
        ]
      }
    ]
  }
];

export default function ProgramModules({ apiCourses }: { apiCourses?: any[] | null }) {
  const [expandedStageIdx, setExpandedStageIdx] = useState<number | null>(0);
  const [courses, setCourses] = useState<any[]>([]);
  const [mobileActiveModKey, setMobileActiveModKey] = useState<string | null>(null);

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
    if (apiCourses && apiCourses.length > 0) {
      setCourses(apiCourses);
      return;
    }

    const fetchCourses = async () => {
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
          setCourses(detailed);
        }
      } catch (err) {
        console.error("Failed to fetch courses in ProgramModules", err);
      }
    };
    fetchCourses();
  }, [apiCourses]);

  const sectionsToUse: any[] = courses.length > 0 
    ? courses.map((c: any) => ({
        title: c.title,
        duration: c.duration_hours ? `${c.duration_hours} Days` : "TBD",
        modules: c.modules?.length > 0 ? c.modules.map((m: any, i: number) => ({
          num: i + 1,
          title: m.title,
          overview: m.description || "No description provided.",
          lessons: m.lessons || []
        })) : [
          { num: 1, title: "Curriculum Pending", overview: "The syllabus for this course is currently being prepared.", lessons: [] }
        ]
      }))
    : programSections;

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
                <div key={idx} className="relative flex flex-row items-center w-full">
                  {/* Circular Node dot indicator on the timeline */}
                  <div className="absolute left-1/2 -translate-x-1/2 z-20 flex items-center justify-center">
                    <button
                      onClick={() => toggleStage(idx)}
                      className={`w-3.5 h-3.5 sm:w-6 h-6 rounded-full border-2 sm:border-4 border-white transition-all duration-300 shadow-md ${
                        isExpanded 
                          ? "bg-[#D50032] scale-110 shadow-[0_0_12px_rgba(213,0,50,0.5)]" 
                          : "bg-gray-200 hover:bg-gray-300"
                      }`}
                    />
                  </div>

                  {/* Stage Card - Responsive Alternating Layout */}
                  <div className={`w-[calc(50%-12px)] sm:w-[calc(50%-20px)] md:w-[calc(50%-28px)] ${
                    isLeft 
                      ? "mr-auto pr-2 sm:pr-6 md:pr-10 text-left" 
                      : "ml-auto pl-2 sm:pl-6 md:pl-10 text-left"
                  }`}>
                    <div
                      onClick={() => toggleStage(idx)}
                      className={`w-full p-2.5 sm:p-4.5 md:p-5 bg-white border rounded-xl sm:rounded-2xl transition-all duration-300 cursor-pointer text-left ${
                        isExpanded
                          ? "border-[#D50032] shadow-[0_12px_45px_rgba(213,0,50,0.04)] relative ring-1 ring-[#D50032]/10"
                          : "border-gray-100 shadow-[0_8px_35px_rgba(0,0,0,0.015)] hover:border-gray-200 hover:shadow-[0_12px_45px_rgba(0,0,0,0.02)]"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2 sm:gap-4">
                        <div className="flex-1 min-w-0">
                          <span className={`text-[8px] sm:text-xs font-black uppercase tracking-widest leading-none block mb-1 sm:mb-2 ${
                            isExpanded ? "text-[#D50032]" : "text-gray-400"
                          }`}>
                            Stage 0{idx + 1}
                          </span>
                          <h3 className="text-xs sm:text-lg font-black text-gray-900 leading-snug tracking-tight mb-1 truncate">
                            {sec.title}
                          </h3>
                          <span className={`text-[9px] sm:text-xs font-bold leading-none uppercase tracking-wider block ${
                            isExpanded ? "text-[#D50032]/85" : "text-gray-400"
                          }`}>
                            {sec.duration} • {sec.modules.length} Modules
                          </span>
                        </div>
                        <div className={`w-5 h-5 sm:w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                          isExpanded ? "bg-[#D50032]/5 text-[#D50032]" : "bg-gray-50 text-gray-400"
                        }`}>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" /> : <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />}
                        </div>
                      </div>

                      {/* Accordion Body: Sequential expanded Module Cards */}
                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-gray-100 space-y-2.5 transition-all duration-500 ease-in-out">
                          {sec.modules.map((mod: any, modIdx: number) => {
                            const mobileKey = `${idx}-${modIdx}`;
                            const isMobileActive = mobileActiveModKey === mobileKey;

                            return (
                              <div
                                key={modIdx}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const key = `${idx}-${modIdx}`;
                                  setMobileActiveModKey(prev => prev === key ? null : key);
                                }}
                                className="group relative bg-white hover:bg-gray-50/50 border border-gray-100 rounded-xl p-3 sm:p-3.5 shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:shadow-[0_8px_30px_rgba(213,0,50,0.02)] transition-all cursor-pointer select-none"
                              >
                                <div className="flex items-center justify-between gap-3">
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-6 h-6 rounded-full bg-[#D50032]/5 text-[#D50032] border border-[#D50032]/10 flex items-center justify-center text-[10px] sm:text-[11px] font-black flex-shrink-0">
                                      {mod.num}
                                    </div>
                                    <h4 className="font-extrabold text-gray-900 text-sm sm:text-base leading-snug group-hover:text-[#D50032] transition-colors">
                                      {mod.title}
                                    </h4>
                                  </div>
                                  <span className="text-[10px] md:hidden font-bold text-gray-400">
                                    {isMobileActive ? "Hide Syllabus" : "View Syllabus"}
                                  </span>
                                </div>

                                {/* Floating Hover Details Card (Desktop only) */}
                                <div
                                  className={`hidden md:group-hover:flex absolute top-1/2 -translate-y-1/2 w-[340px] bg-white border border-gray-150 shadow-[0_20px_50px_rgba(0,0,0,0.12)] rounded-2xl p-5 z-[100] flex-col text-left transition-all duration-300 pointer-events-none ${
                                    isLeft ? "left-full ml-6" : "right-full mr-6"
                                  }`}
                                >
                                  {/* Pointing triangle arrow */}
                                  <div
                                    className={`absolute top-1/2 -translate-y-1/2 border-[8px] border-transparent z-10 ${
                                      isLeft
                                        ? "right-full border-r-white filter drop-shadow-[-1px_0_0_rgba(0,0,0,0.08)]"
                                        : "left-full border-l-white filter drop-shadow-[1px_0_0_rgba(0,0,0,0.08)]"
                                    }`}
                                  />

                                  {/* Header */}
                                  <div className="flex items-center gap-2 mb-3">
                                    <span className="text-[10px] font-black bg-[#D50032]/5 text-[#D50032] border border-[#D50032]/10 px-2 py-0.5 rounded-md uppercase tracking-wider">
                                      Module {mod.num}
                                    </span>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                      • Detailed Syllabus
                                    </span>
                                  </div>
                                  <h4 className="font-extrabold text-gray-900 text-base leading-snug mb-2">
                                    {mod.title}
                                  </h4>
                                  <p className="text-gray-500 text-xs font-medium leading-relaxed mb-4">
                                    {mod.overview}
                                  </p>

                                  {/* Lessons list */}
                                  {mod.lessons && mod.lessons.length > 0 && (
                                    <div className="border-t border-gray-100 pt-3">
                                      <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                                        📚 Lectures & Topics ({mod.lessons.length})
                                      </h5>
                                      <div className="space-y-2">
                                        {mod.lessons.slice(0, 4).map((lesson: any, lessonIdx: number) => (
                                          <div
                                            key={lessonIdx}
                                            className="flex items-start justify-between gap-3 p-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                                          >
                                            <div className="flex items-center gap-2 overflow-hidden">
                                              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100">
                                                {getTypeIcon(lesson.content_type)}
                                              </div>
                                              <span className="text-gray-700 text-xs font-bold truncate max-w-[200px]">
                                                {lesson.title}
                                              </span>
                                            </div>
                                            {lesson.duration_minutes && (
                                              <span className="flex-shrink-0 flex items-center gap-0.5 text-[10px] font-semibold text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">
                                                <Clock className="w-2.5 h-2.5" />
                                                {lesson.duration_minutes}m
                                              </span>
                                            )}
                                          </div>
                                        ))}
                                        {mod.lessons.length > 4 && (
                                          <div className="text-center pt-1">
                                            <span className="text-[10px] font-bold text-[#D50032]">
                                              + {mod.lessons.length - 4} more lectures in curriculum
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>                                {/* Mobile Inline Details */}
                                {isMobileActive && (
                                  <div className="md:hidden mt-3 p-4 bg-gray-50 border border-gray-200/60 rounded-xl space-y-3.5 block text-left transition-all animate-in fade-in slide-in-from-top-2 duration-300">
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
                                    <p className="text-gray-500 text-xs font-medium leading-relaxed">
                                      {mod.overview}
                                    </p>

                                    {mod.lessons && mod.lessons.length > 0 && (
                                      <div className="border-t border-gray-200/80 pt-3">
                                        <h5 className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                                          📚 Lectures & Topics ({mod.lessons.length})
                                        </h5>
                                        <div className="space-y-2">
                                          {mod.lessons.map((lesson: any, lessonIdx: number) => (
                                            <div
                                              key={lessonIdx}
                                              className="flex items-center justify-between gap-3 p-2 rounded-lg bg-white border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.01)]"
                                            >
                                              <div className="flex items-center gap-2 overflow-hidden">
                                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100">
                                                  {getTypeIcon(lesson.content_type)}
                                                </div>
                                                <span className="text-gray-700 text-xs font-extrabold truncate max-w-[170px]">
                                                  {lesson.title}
                                                </span>
                                              </div>
                                              {lesson.duration_minutes && (
                                                <span className="flex-shrink-0 flex items-center gap-0.5 text-[9px] font-semibold text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                                                  <Clock className="w-2.5 h-2.5 text-gray-400" />
                                                  {lesson.duration_minutes}m
                                                </span>
                                              )}
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
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
