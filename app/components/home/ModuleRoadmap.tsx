import { useEffect, useRef } from "react";
import { CheckCircle, BookOpen, LineChart, Award, Trophy, Brain, Target, Zap } from "lucide-react";

const modules = [
  { id: 1, title: "Market Foundations", desc: "Understanding stock markets, exchanges, and instruments", icon: BookOpen, status: "completed" as const },
  { id: 2, title: "Technical Analysis", desc: "Chart patterns, indicators, and price action", icon: LineChart, status: "completed" as const },
  { id: 3, title: "Risk Management", desc: "Position sizing, stop-loss strategies, and capital protection", icon: Target, status: "active" as const },
  { id: 4, title: "Trading Psychology", desc: "Emotional discipline, bias management, and consistency", icon: Brain, status: "upcoming" as const },
  { id: 5, title: "Options & Derivatives", desc: "Options pricing, Greeks, and strategy building", icon: Zap, status: "upcoming" as const },
  { id: 6, title: "Advanced Strategies", desc: "Algo trading, quant analysis, portfolio optimization", icon: Award, status: "upcoming" as const },
  { id: 7, title: "Trading Simulator", desc: "Live market practice with virtual capital", icon: LineChart, status: "upcoming" as const },
  { id: 8, title: "Certification & Placement", desc: "Final assessment and placement preparation", icon: Trophy, status: "upcoming" as const },
];

function getColor(s: string) { return s === "upcoming" ? "#9CA3AF" : "#D50032"; }
function getBg(s: string) { return s === "upcoming" ? "rgba(156,163,175,0.1)" : "rgba(213,0,50,0.1)"; }

export default function ModuleRoadmap() {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        const maxScroll = scrollWidth - clientWidth;
        
        if (scrollLeft >= maxScroll - 10) {
          scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          scrollRef.current.scrollBy({ left: 300, behavior: "smooth" });
        }
      }
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-4 relative z-10" style={{ background: "linear-gradient(to bottom, transparent, rgba(213,0,50,0.02), transparent)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6">
          <div className="inline-block px-4 py-2 rounded-full mb-2 border border-[#D50032]/30" style={{ background: "rgba(213,0,50,0.08)" }}>
            <span className="text-[#D50032] font-semibold text-sm">🗺️ Course Roadmap</span>
          </div>
          <h2 className="text-4xl font-bold mb-2" style={{ color: "#121212" }}>Your Learning Path</h2>
          <p className="text-xl text-gray-600">A structured roadmap from beginner to professional trader</p>
        </div>

        {/* Desktop Grid */}
        <div className="hidden lg:grid grid-cols-4 gap-6">
          {modules.map((mod) => (
            <div
              key={mod.id}
              className="p-5 rounded-2xl border-2 transition-all hover:shadow-xl hover:scale-[1.02] cursor-pointer"
              style={{
                borderColor: mod.status === "active" ? "#D50032" : `${getColor(mod.status)}30`,
                background: mod.status === "active" ? "rgba(213,0,50,0.05)" : "white",
                boxShadow: mod.status === "active" ? "0 0 30px rgba(213,0,50,0.15)" : "0 2px 8px rgba(0,0,0,0.06)",
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: getBg(mod.status), color: getColor(mod.status), border: `2px solid ${getColor(mod.status)}` }}>
                  {mod.status === "completed" ? <CheckCircle className="h-5 w-5" /> : mod.id}
                </div>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: getBg(mod.status) }}>
                  <mod.icon className="h-5 w-5" style={{ color: getColor(mod.status) }} />
                </div>
              </div>
              <h4 className="font-bold mb-1" style={{ color: mod.status === "upcoming" ? "#9CA3AF" : "#121212" }}>{mod.title}</h4>
              <p className="text-xs" style={{ color: mod.status === "upcoming" ? "#D1D5DB" : "#6B7280" }}>{mod.desc}</p>
              {mod.status === "active" && (
                <div className="mt-3 px-3 py-1 rounded-full text-xs font-bold inline-block animate-pulse" style={{ background: "#D50032", color: "white" }}>Current Module</div>
              )}
            </div>
          ))}
        </div>

        {/* Mobile/Tablet Slider */}
        <div className="lg:hidden">
          <div 
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto pb-8 snap-x snap-mandatory scrollbar-hide px-4 -mx-4"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {modules.map((mod) => (
              <div
                key={mod.id}
                className="flex-shrink-0 w-[280px] snap-center p-5 rounded-2xl border-2 transition-all hover:shadow-xl cursor-pointer bg-white"
                style={{
                  borderColor: mod.status === "active" ? "#D50032" : `${getColor(mod.status)}30`,
                  boxShadow: mod.status === "active" ? "0 0 30px rgba(213,0,50,0.15)" : "0 2px 8px rgba(0,0,0,0.06)",
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: getBg(mod.status), color: getColor(mod.status), border: `2px solid ${getColor(mod.status)}` }}>
                    {mod.status === "completed" ? <CheckCircle className="h-5 w-5" /> : mod.id}
                  </div>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: getBg(mod.status) }}>
                    <mod.icon className="h-5 w-5" style={{ color: getColor(mod.status) }} />
                  </div>
                </div>
                <h4 className="font-bold mb-1" style={{ color: mod.status === "upcoming" ? "#9CA3AF" : "#121212" }}>{mod.title}</h4>
                <p className="text-xs mb-3" style={{ color: mod.status === "upcoming" ? "#D1D5DB" : "#6B7280" }}>{mod.desc}</p>
                {mod.status === "active" && (
                  <div className="px-3 py-1 rounded-full text-xs font-bold inline-block animate-pulse" style={{ background: "#D50032", color: "white" }}>Current Module</div>
                )}
              </div>
            ))}
          </div>
          <style>{`
            .scrollbar-hide::-webkit-scrollbar { display: none; }
          `}</style>
        </div>
      </div>
    </section>
  );
}
