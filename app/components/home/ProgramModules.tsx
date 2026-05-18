import { useState } from "react";
import { ChevronDown, ChevronUp, Clock, BookOpen, Layers, ChevronLeft, ChevronRight } from "lucide-react";

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
    title: "PROFESSIONAL TRADING MINDSET FOUNDATION",
    duration: "2 Days",
    modules: [
      {
        num: 1,
        title: "Trader’s Mindset & Market Psychology",
        overview: "Understanding psychological biases, developing emotional discipline, and establishing a professional risk-first perspective to avoid common trading pitfalls."
      },
      {
        num: 2,
        title: "Professional Trading Mindset Foundation",
        overview: "Establishing the daily operational routines, journaling methods, and cognitive framing needed for long-term consistency and stress management."
      }
    ]
  },
  {
    title: "FINANCIAL MARKET FOUNDATION",
    duration: "30 Days",
    modules: [
      {
        num: 1,
        title: "Introduction to Financial Market",
        overview: "Mastering the fundamentals of equity, debt, commodity, and currency markets, and how capital flows through global economic systems."
      },
      {
        num: 2,
        title: "Understanding Security Market",
        overview: "Deep-dive into stock exchanges (NSE & BSE), clearing corporations, depository participants, and order matching algorithms."
      },
      {
        num: 3,
        title: "Methods of analysing Financial Security",
        overview: "Comparing fundamental, technical, and quantitative approaches to evaluating financial instruments for short-term trading and investing."
      }
    ]
  },
  {
    title: "MARKET ANALYSIS AND TRADING STRATEGY DEVELOPMENT",
    duration: "30 Days",
    modules: [
      {
        num: 1,
        title: "Fundamental Analysis Framework",
        overview: "Reading balance sheets, income statements, cash flows, and key valuation metrics like P/E, D/E, and ROCE to evaluate company health."
      },
      {
        num: 2,
        title: "Application of Fundamental Analysis",
        overview: "Applying macro and micro-economic analysis to industry sectors, assessing competitive moats, and predicting earnings growth."
      },
      {
        num: 3,
        title: "Technical Analysis for Trading and Investing",
        overview: "Mastering support/resistance, trend lines, volume analysis, and major indicators like RSI, MACD, and Moving Averages."
      },
      {
        num: 4,
        title: "Trading & Analytics Software",
        overview: "Hands-on training with professional trading terminals, charting tools, market depth screens, and data scanning software."
      }
    ]
  },
  {
    title: "ADVANCED INSTITUTIONAL TRADING AND RISK MANAGEMENT",
    duration: "30 Days",
    modules: [
      {
        num: 1,
        title: "Applied Technical Analysis",
        overview: "Advanced price action, multiple timeframe analysis, multi-indicator confluence, and high-probability setup recognition."
      },
      {
        num: 2,
        title: "Mechanics of Derivative Market",
        overview: "Understanding futures, options, open interest, cost of carry, option Greeks, and institutional positioning data."
      },
      {
        num: 3,
        title: "Options & Futures Strategies",
        overview: "Designing spreads, straddles, strangles, iron condors, and hedging setups for various market regimes and volatility states."
      },
      {
        num: 4,
        title: "Professional Risk Management",
        overview: "Position sizing models, value at risk (VaR), correlation management, drawdown control, and institutional risk metrics."
      }
    ]
  },
  {
    title: "MARKET APPLICATION AND EXECUTION",
    duration: "5 Days",
    modules: [
      {
        num: 1,
        title: "Trading Lab & Back testing Mastery",
        overview: "Validating strategy rules historically, running statistical backtests, and optimizing parameters without curve-fitting."
      },
      {
        num: 2,
        title: "Real World Market Execution",
        overview: "Executing trades in a live desk environment, managing order slippage, handling live positions under stress, and post-trade analysis."
      }
    ]
  }
];export default function ProgramModules() {
  const [activeSectionIdx, setActiveSectionIdx] = useState(0);
  const [activeModuleNum, setActiveModuleNum] = useState<number | null>(1);

  const toggleModule = (moduleNum: number) => {
    setActiveModuleNum((prev) => (prev === moduleNum ? null : moduleNum));
  };

  const currentSection = programSections[activeSectionIdx];

  return (
    <section className="py-16 relative z-10" style={{ background: "linear-gradient(to bottom, transparent, rgba(213,0,50,0.01), transparent)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-2 rounded-full mb-4 border border-[#D50032]/30" style={{ background: "rgba(213,0,50,0.08)" }}>
            <span className="text-[#D50032] font-semibold text-sm">📚 Program Curriculum</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: "#121212" }}>
            Certified Professional Trading Program
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A comprehensive, rigorous 5-stage institutional curriculum designed to take you from a beginner to an expert funded trader.
          </p>
        </div>

        {/* Dynamic Selector & Accordions Layout */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Navigation Phases (Desktop) */}
          <div className="hidden lg:flex lg:col-span-5 flex-col gap-3.5">
            {programSections.map((sec, idx) => {
              const isActive = activeSectionIdx === idx;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    setActiveSectionIdx(idx);
                    setActiveModuleNum(1); // Default to first module of new section
                  }}
                  className={`text-left p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden group ${
                    isActive
                      ? "border-[#D50032] bg-white shadow-[0_8px_30px_rgba(213,0,50,0.06)]"
                      : "border-gray-200 bg-white/60 hover:bg-white hover:border-gray-300 hover:shadow-md"
                  }`}
                >
                  {/* Left accent bar for active tab */}
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#D50032]" />
                  )}

                  <div className="flex justify-between items-start mb-2 pl-2">
                    <span className={`text-xs font-bold uppercase tracking-wider ${isActive ? "text-[#D50032]" : "text-gray-400"}`}>
                      Stage 0{idx + 1}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${
                        isActive
                          ? "bg-[#D50032]/10 text-[#D50032] border-[#D50032]/20"
                          : "bg-gray-100 text-gray-500 border-gray-200"
                      }`}
                    >
                      <Clock className="w-3 h-3" />
                      {sec.duration}
                    </span>
                  </div>

                  <h3
                    className={`text-sm font-extrabold tracking-wide uppercase leading-snug pl-2 ${
                      isActive ? "text-[#121212]" : "text-gray-600 group-hover:text-gray-800"
                    }`}
                  >
                    {sec.title}
                  </h3>
                </button>
              );
            })}
          </div>

          {/* Stage Selector: Navigation Phases (Mobile/Tablet Slider) */}
          <div className="lg:hidden w-full flex flex-col gap-4">
            {/* The Active Slide Card */}
            <div className="relative">
              {programSections.map((sec, idx) => {
                const isActive = activeSectionIdx === idx;
                if (!isActive) return null;
                return (
                  <div
                    key={idx}
                    className="w-full p-6 rounded-2xl border border-[#D50032] bg-white shadow-[0_8px_30px_rgba(213,0,50,0.06)] relative overflow-hidden whitespace-normal break-words transition-all duration-300 animate-fadeIn"
                  >
                    {/* Left Accent Red Bar */}
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#D50032]" />

                    <div className="flex justify-between items-start mb-3 pl-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#D50032]">
                        Stage 0{idx + 1}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border bg-[#D50032]/10 text-[#D50032] border-[#D50032]/20">
                        <Clock className="w-3 h-3" />
                        {sec.duration}
                      </span>
                    </div>

                    <h3 className="text-sm font-extrabold tracking-wide uppercase leading-snug pl-2 text-[#121212]">
                      {sec.title}
                    </h3>
                  </div>
                );
              })}
            </div>

            {/* Slider Navigation & Pagination */}
            <div className="flex items-center justify-between px-2">
              {/* Prev Button */}
              <button
                onClick={() => {
                  setActiveSectionIdx((prev) => (prev > 0 ? prev - 1 : programSections.length - 1));
                  setActiveModuleNum(1);
                }}
                className="w-10 h-10 rounded-full bg-white border border-gray-150 flex items-center justify-center shadow-sm hover:shadow-md transition-all active:scale-95 text-[#D50032]"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Pagination Dots */}
              <div className="flex items-center gap-2">
                {programSections.map((_, idx) => {
                  const isActive = activeSectionIdx === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setActiveSectionIdx(idx);
                        setActiveModuleNum(1);
                      }}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        isActive ? "w-6 bg-[#D50032]" : "w-2 bg-gray-200"
                      }`}
                    />
                  );
                })}
              </div>

              {/* Next Button */}
              <button
                onClick={() => {
                  setActiveSectionIdx((prev) => (prev < programSections.length - 1 ? prev + 1 : 0));
                  setActiveModuleNum(1);
                }}
                className="w-10 h-10 rounded-full bg-white border border-gray-150 flex items-center justify-center shadow-sm hover:shadow-md transition-all active:scale-95 text-[#D50032]"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Right Column: Module Accordions */}
          <div className="lg:col-span-7 flex flex-col gap-4 w-full">
            {/* Phase title heading for mobile or reference */}
            <div className="flex items-center gap-4 mb-4 p-5 rounded-2xl bg-white border border-gray-155 shadow-[0_8px_30px_rgba(0,0,0,0.03)] lg:hidden">
              <div className="w-12 h-12 rounded-2xl bg-[#D50032]/10 flex items-center justify-center flex-shrink-0 text-[#D50032]">
                <Layers className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Selected Stage</span>
                <h4 className="text-sm font-extrabold uppercase text-gray-800 leading-snug">
                  {currentSection.title} ({currentSection.duration})
                </h4>
              </div>
            </div>

            {/* Accordions */}
            {currentSection.modules.map((mod) => {
              const isExpanded = activeModuleNum === mod.num;
              return (
                <div
                  key={mod.num}
                  onClick={() => toggleModule(mod.num)}
                  className={`rounded-2xl border bg-white transition-all duration-300 cursor-pointer overflow-hidden ${
                    isExpanded
                      ? "border-gray-200 shadow-[0_8px_30px_rgba(0,0,0,0.03)]"
                      : "border-gray-150 shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:border-gray-200"
                  }`}
                >
                  {/* Accordion Header */}
                  <div className="p-6 flex justify-between items-start gap-4 select-none">
                    <div className="space-y-1">
                      <span className="text-sm font-medium text-gray-800">
                        Module {mod.num}
                      </span>
                      <h3
                        className={`text-lg sm:text-xl font-semibold leading-snug transition-colors duration-300 ${
                          isExpanded ? "text-[#D50032]" : "text-gray-500"
                        }`}
                      >
                        {mod.title}
                      </h3>
                    </div>
                    <div className="flex-shrink-0 pt-1">
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-[#D50032]" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-[#D50032]" />
                      )}
                    </div>
                  </div>

                  {/* Accordion Body */}
                  <div
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      isExpanded ? "max-h-[300px] border-t border-gray-100" : "max-h-0"
                    }`}
                  >
                    <div className="p-6 bg-white text-sm sm:text-base leading-relaxed text-gray-500">
                      <span className="font-semibold text-gray-900 mr-1.5">Overview :</span>
                      {mod.overview}
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
