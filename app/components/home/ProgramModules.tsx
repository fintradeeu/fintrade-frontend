import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Clock, BookOpen, Layers } from "lucide-react";
import api from "../../services/api";

interface Module {
  num: number;
  title: string;
  overview: string;
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
        overview: "Mastering the fundamentals and starting your trading journey in Course 2."
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
        overview: "Deep dive into c2 trading systems and research methodologies."
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
        overview: "Professional grade trading strategies and advanced risk management in Course1."
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
        overview: "Applied technical analysis and intraday setups in c1."
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
        overview: "Capital allocation and proprietary desk simulation in course a."
      }
    ]
  }
];

export default function ProgramModules({ apiCourses }: { apiCourses?: any[] | null }) {
  const [expandedStageIdx, setExpandedStageIdx] = useState<number | null>(0);
  const [courses, setCourses] = useState<any[]>([]);

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

  const sectionsToUse: ProgramSection[] = courses.length > 0 
    ? courses.map((c: any) => ({
        title: c.title,
        duration: c.duration_hours ? `${c.duration_hours} Days` : "TBD",
        modules: c.modules?.length > 0 ? c.modules.map((m: any, i: number) => ({
          num: i + 1,
          title: m.title,
          overview: m.description || "No description provided."
        })) : [
          { num: 1, title: "Curriculum Pending", overview: "The syllabus for this course is currently being prepared." }
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
          {/* Centered Vertical Line on Desktop, Left-aligned on Mobile */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-[3px] bg-gradient-to-b from-[#D50032]/20 via-[#D50032]/30 to-[#D50032]/10 -translate-x-1/2 z-0" />

          <div className="space-y-6 md:space-y-8 relative z-10">
            {sectionsToUse.map((sec, idx) => {
              const isExpanded = expandedStageIdx === idx;
              const isLeft = idx % 2 === 0;

              return (
                <div key={idx} className="relative flex flex-col md:flex-row items-center w-full">
                  {/* Circular Node dot indicator on the timeline */}
                  <div className="absolute left-4 md:left-1/2 -translate-x-1/2 z-20 flex items-center justify-center">
                    <button
                      onClick={() => toggleStage(idx)}
                      className={`w-6 h-6 rounded-full border-4 border-white transition-all duration-300 shadow-md ${
                        isExpanded 
                          ? "bg-[#D50032] scale-110 shadow-[0_0_12px_rgba(213,0,50,0.5)]" 
                          : "bg-gray-200 hover:bg-gray-300"
                      }`}
                    />
                  </div>

                  {/* Stage Card */}
                  <div className={`w-full md:w-[calc(50%-28px)] ${
                    isLeft 
                      ? "md:mr-auto pl-10 md:pl-0 md:pr-10 text-left" 
                      : "md:ml-auto pl-10 md:pl-10 text-left"
                  }`}>
                    <div
                      onClick={() => toggleStage(idx)}
                      className={`w-full p-4.5 sm:p-5 bg-white border rounded-2xl transition-all duration-300 cursor-pointer text-left ${
                        isExpanded
                          ? "border-[#D50032] shadow-[0_12px_45px_rgba(213,0,50,0.04)] relative ring-1 ring-[#D50032]/10"
                          : "border-gray-100 shadow-[0_8px_35px_rgba(0,0,0,0.015)] hover:border-gray-200 hover:shadow-[0_12px_45px_rgba(0,0,0,0.02)]"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <span className={`text-[10px] sm:text-xs font-black uppercase tracking-widest leading-none block mb-2 ${
                            isExpanded ? "text-[#D50032]" : "text-gray-400"
                          }`}>
                            Stage 0{idx + 1}
                          </span>
                          <h3 className="text-base sm:text-lg font-black text-gray-900 leading-snug tracking-tight mb-1.5">
                            {sec.title}
                          </h3>
                          <span className={`text-[11px] sm:text-xs font-bold leading-none uppercase tracking-wider block ${
                            isExpanded ? "text-[#D50032]/85" : "text-gray-400"
                          }`}>
                            {sec.duration} • {sec.modules.length} Modules
                          </span>
                        </div>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                          isExpanded ? "bg-[#D50032]/5 text-[#D50032]" : "bg-gray-50 text-gray-400"
                        }`}>
                          {isExpanded ? <ChevronUp className="w-4 h-4 stroke-[2.5]" /> : <ChevronDown className="w-4 h-4 stroke-[2.5]" />}
                        </div>
                      </div>

                      {/* Accordion Body: Sequential expanded Module Cards */}
                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-gray-100 space-y-2.5 transition-all duration-500 ease-in-out">
                          {sec.modules.map((mod, modIdx) => (
                            <div key={modIdx} className="bg-white hover:bg-gray-50/50 border border-gray-100 rounded-xl p-3 sm:p-3.5 shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:shadow-[0_8px_30px_rgba(213,0,50,0.02)] transition-all">
                              <div className="flex items-center gap-2.5 mb-1.5">
                                <div className="w-6 h-6 rounded-full bg-[#D50032]/5 text-[#D50032] border border-[#D50032]/10 flex items-center justify-center text-[10px] sm:text-[11px] font-black flex-shrink-0">
                                  {mod.num}
                                </div>
                                <h4 className="font-extrabold text-gray-900 text-sm sm:text-base leading-snug">
                                  {mod.title}
                                </h4>
                              </div>
                              <p className="text-gray-500 text-xs sm:text-sm font-medium leading-relaxed pl-8">
                                <span className="font-bold text-gray-700 mr-1 text-xs">Overview:</span>
                                {mod.overview}
                              </p>
                            </div>
                          ))}
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
