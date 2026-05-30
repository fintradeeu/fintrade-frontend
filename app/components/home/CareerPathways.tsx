import { useState } from "react";
import { TrendingUp, Search, Users, Building, ArrowUpRight, Award, DollarSign } from "lucide-react";

interface CareerDetail {
  title: string;
  color: string;
  bgLight: string;
  borderLight: string;
  iconColor: string;
  roles: string[];
  skills: string[];
  salaryRange: string;
  desc: string;
  metric: string;
}

export default function CareerPathways() {
  const [activeNode, setActiveNode] = useState<number>(0);

  const careerData: CareerDetail[] = [
    {
      title: "Trading Roles",
      color: "#D50032",
      bgLight: "#FFF0F2",
      borderLight: "rgba(213,0,50,0.15)",
      iconColor: "text-[#D50032]",
      roles: ["Prop Trader", "Derivatives Dealer", "Options Strategist", "Quantitative Trader", "Arbitrageur"],
      skills: ["Price Action Trading", "Risk Mitigation", "F&O Hedging", "Algorithmic Execution", "Order Flow Analysis"],
      salaryRange: "₹6 LPA - ₹18 LPA+",
      metric: "Top Prop desks integration",
      desc: "Deploying institutional capital, designing quantitative arbitrage models, and managing complex futures & options spreads during live market hours inside leading prop trading firms."
    },
    {
      title: "Research & Analyst",
      color: "#3B82F6",
      bgLight: "#EFF6FF",
      borderLight: "rgba(59,130,246,0.15)",
      iconColor: "text-blue-500",
      roles: ["Equity Research Analyst", "Technical Analyst", "Financial Analyst", "Market Researcher", "Valuation Associate"],
      skills: ["Fundamental Analysis", "Technical Chart Patterns", "Balance Sheet Valuation", "Report Writing", "Macro Modeling"],
      salaryRange: "₹5 LPA - ₹12 LPA",
      metric: "SEBI advisory standards",
      desc: "Conducting rigorous micro and macro financial due diligence, audit of corporate balance sheets, chart auditing, and publishing actionable buy/sell equity research recommendations."
    },
    {
      title: "Broking & Advisory",
      color: "#10B981",
      bgLight: "#ECFDF5",
      borderLight: "rgba(16,185,129,0.15)",
      iconColor: "text-emerald-500",
      roles: ["Wealth Manager", "Investment Advisor", "Broking Executive", "Portfolio Manager Analyst", "HNIs Relationship Manager"],
      skills: ["Asset Allocation", "Portfolio Construction", "Client Advising", "Financial Planning", "Brokerage Operations"],
      salaryRange: "₹4 LPA - ₹10 LPA",
      metric: "Personalized wealth planning",
      desc: "Constructing and reviewing private client portfolios, providing specialized investment guidance, and managing operational advisory streams in retail and institutional broking firms."
    },
    {
      title: "Institutional & Corporate",
      color: "#8B5CF6",
      bgLight: "#F5F3FF",
      borderLight: "rgba(139,92,246,0.15)",
      iconColor: "text-purple-500",
      roles: ["Treasury Analyst", "Corporate Finance Executive", "Fund Manager Assistant", "Risk Officer", "Venture Associate"],
      skills: ["Treasury Management", "Hedging Policies", "Corporate Valuation", "Enterprise Risk Management", "Capital Structuring"],
      salaryRange: "₹8 LPA - ₹22 LPA+",
      metric: "Large treasury exposure",
      desc: "Handling high-volume corporate treasury accounts, managing asset liability matching (ALM), deploying enterprise hedging instruments, and assisting fund managers in large asset allocations."
    }
  ];

  return (
    <div className="w-full bg-white relative z-10 overflow-hidden">
      <div className="w-full">
        
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 px-4.5 py-1.5 rounded-full mb-3 border border-[#D50032]/25 bg-[#D50032]/5">
            <span className="text-[#D50032] font-extrabold text-xs tracking-wider uppercase flex items-center gap-1">
              💼 Career Pathways
            </span>
          </div>
          <h2 className="text-3xl md:text-4.5xl font-black mb-3 text-gray-900 tracking-tight">
            Placement & <span className="text-[#D50032]">Career Opportunities</span>
          </h2>
          <p className="text-base sm:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
            FinTrade graduates are equipped for a wide range of roles across India's financial ecosystem.
          </p>
          <p className="text-xs text-gray-400 font-semibold italic mt-2 tracking-wide">
            Hover any node to explore roles • Orbits pause on hover
          </p>
        </div>

        {/* Orbit Grid System */}
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Side: Dynamic Concentric Orbits (lg:col-span-7) */}
          <div className="lg:col-span-7 flex items-center justify-center relative min-h-[280px] sm:min-h-[340px] md:min-h-[600px] overflow-hidden select-none">
            <div className="relative w-full max-w-[340px] md:max-w-[560px] aspect-square flex items-center justify-center orbit-wrapper">
              
              {/* Central Core Circle (Your Career Logo) */}
              <div className="absolute w-20 h-20 md:w-28 md:h-28 rounded-full bg-[#D50032] flex flex-col items-center justify-center shadow-[0_10px_35px_rgba(213,0,50,0.35)] z-30 transition-transform duration-300 hover:scale-105">
                <span className="text-3xl md:text-4.5xl font-black text-white tracking-tighter leading-none font-sans">F</span>
                <span className="text-[8px] md:text-[9.5px] font-black text-white/95 tracking-widest leading-none mt-1 uppercase font-sans text-center">
                  YOUR<br />CAREER
                </span>
              </div>

              {/* Orbit 1 (Inner, Red) */}
              <div 
                className="absolute rounded-full border border-[#D50032]/12 flex items-center justify-center animate-orbit-ring-1 orbit-ring-animate"
                style={{
                  width: "calc(var(--ring-scale, 1) * 120px)",
                  height: "calc(var(--ring-scale, 1) * 120px)",
                }}
              >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                  <div className="animate-orbit-node-1 orbit-node-animate">
                    <button 
                      onMouseEnter={() => setActiveNode(0)}
                      onTouchStart={() => setActiveNode(0)}
                      className={`w-9 h-9 md:w-12 md:h-12 rounded-full border-2 border-[#D50032] bg-white flex items-center justify-center shadow-lg transition-transform duration-300 cursor-pointer ${activeNode === 0 ? 'scale-120' : 'hover:scale-115'}`}
                      aria-label="Trading Roles Pathway"
                    >
                      <TrendingUp className="w-4.5 h-4.5 md:w-5.5 md:h-5.5 text-[#D50032] stroke-[2.5]" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Orbit 2 (Second, Blue) */}
              <div 
                className="absolute rounded-full border border-blue-500/12 flex items-center justify-center animate-orbit-ring-2 orbit-ring-animate"
                style={{
                  width: "calc(var(--ring-scale, 1) * 180px)",
                  height: "calc(var(--ring-scale, 1) * 180px)",
                }}
              >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                  <div className="animate-orbit-node-2 orbit-node-animate">
                    <button 
                      onMouseEnter={() => setActiveNode(1)}
                      onTouchStart={() => setActiveNode(1)}
                      className={`w-9 h-9 md:w-12 md:h-12 rounded-full border-2 border-blue-500 bg-white flex items-center justify-center shadow-lg transition-transform duration-300 cursor-pointer ${activeNode === 1 ? 'scale-120' : 'hover:scale-115'}`}
                      aria-label="Research & Analyst Pathway"
                    >
                      <Search className="w-4.5 h-4.5 md:w-5.5 md:h-5.5 text-blue-500 stroke-[2.5]" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Orbit 3 (Third, Green) */}
              <div 
                className="absolute rounded-full border border-emerald-500/12 flex items-center justify-center animate-orbit-ring-3 orbit-ring-animate"
                style={{
                  width: "calc(var(--ring-scale, 1) * 240px)",
                  height: "calc(var(--ring-scale, 1) * 240px)",
                }}
              >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                  <div className="animate-orbit-node-3 orbit-node-animate">
                    <button 
                      onMouseEnter={() => setActiveNode(2)}
                      onTouchStart={() => setActiveNode(2)}
                      className={`w-9 h-9 md:w-12 md:h-12 rounded-full border-2 border-emerald-500 bg-white flex items-center justify-center shadow-lg transition-transform duration-300 cursor-pointer ${activeNode === 2 ? 'scale-120' : 'hover:scale-115'}`}
                      aria-label="Broking & Advisory Pathway"
                    >
                      <Users className="w-4.5 h-4.5 md:w-5.5 md:h-5.5 text-emerald-500 stroke-[2.5]" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Orbit 4 (Outer, Purple) */}
              <div 
                className="absolute rounded-full border border-purple-500/12 flex items-center justify-center animate-orbit-ring-4 orbit-ring-animate"
                style={{
                  width: "calc(var(--ring-scale, 1) * 300px)",
                  height: "calc(var(--ring-scale, 1) * 300px)",
                }}
              >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                  <div className="animate-orbit-node-4 orbit-node-animate">
                    <button 
                      onMouseEnter={() => setActiveNode(3)}
                      onTouchStart={() => setActiveNode(3)}
                      className={`w-9 h-9 md:w-12 md:h-12 rounded-full border-2 border-purple-500 bg-white flex items-center justify-center shadow-lg transition-transform duration-300 cursor-pointer ${activeNode === 3 ? 'scale-120' : 'hover:scale-115'}`}
                      aria-label="Institutional & Corporate Pathway"
                    >
                      <Building className="w-4.5 h-4.5 md:w-5.5 md:h-5.5 text-purple-500 stroke-[2.5]" />
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Right Side: Interactive Panel (lg:col-span-5) */}
          <div className="lg:col-span-5 flex flex-col justify-center h-full">
            <div className="relative w-full min-h-[360px] bg-[#FAFBFD] border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-[0_15px_40px_rgba(0,0,0,0.015)] transition-all duration-500">
              
              {/* Pathway Detail State */}
              <div className="space-y-5 animate-fade-in" key={activeNode}>
                {/* Category Pill Tag */}
                <div 
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold tracking-wider uppercase border"
                  style={{ 
                    backgroundColor: careerData[activeNode].bgLight, 
                    color: careerData[activeNode].color,
                    borderColor: careerData[activeNode].borderLight
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: careerData[activeNode].color }} />
                  {careerData[activeNode].title}
                </div>

                {/* Title & Entry Salary */}
                <div>
                  <h4 className="text-2xl font-black text-gray-950 tracking-tight leading-tight flex items-center gap-2">
                    {careerData[activeNode].title}
                    <ArrowUpRight className={`w-5 h-5 ${careerData[activeNode].iconColor}`} />
                  </h4>
                  
                  <div className="flex items-center gap-1.5 mt-2.5 text-gray-700">
                    <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                      <DollarSign className="w-4.5 h-4.5 stroke-[2.5]" />
                    </div>
                    <div className="text-sm font-bold">
                      Average Entry Salary: <span className="text-gray-900 font-extrabold">{careerData[activeNode].salaryRange}</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-500 text-sm leading-relaxed font-medium">
                  {careerData[activeNode].desc}
                </p>

                <div className="w-full h-[1px] bg-gray-100" />

                {/* Typical Roles */}
                <div className="space-y-2">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">
                    Typical Opportunities
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {careerData[activeNode].roles.map((role, rIdx) => (
                      <span 
                        key={rIdx} 
                        className="px-2.5 py-1 text-[11px] font-bold text-gray-700 bg-white border border-gray-100 rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.01)] hover:border-gray-200 transition-colors"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Required Skills */}
                <div className="space-y-2">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">
                    Key Competencies Taught
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {careerData[activeNode].skills.map((skill, sIdx) => (
                      <span 
                        key={sIdx} 
                        className="px-2.5 py-1 text-[11px] font-extrabold text-[#D50032] bg-[#D50032]/5 border border-[#D50032]/10 rounded-lg"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          </div>

        </div>

        {/* Orbit Legend at the bottom */}
        <div className="flex flex-wrap justify-center gap-6 md:gap-8 mt-12 border-t border-gray-100 pt-8">
          {[
            { label: "Trading Roles", color: "bg-[#D50032]" },
            { label: "Research & Analyst", color: "bg-blue-500" },
            { label: "Broking & Advisory", color: "bg-emerald-500" },
            { label: "Institutional & Corporate", color: "bg-purple-500" }
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs font-bold text-gray-700">
              <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
              {item.label}
            </div>
          ))}
        </div>

      </div>

      {/* Hardware-Accelerated Animations Style Block */}
      <style>{`
        /* Responsive Rings Sizes */
        :root {
          --ring-scale: 1;
        }
        @media (min-width: 768px) {
          :root {
            --ring-scale: 1.76;
          }
        }

        /* Clockwise Rotations */
        @keyframes orbit-cw-1 {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes orbit-cw-2 {
          from { transform: rotate(45deg); }
          to { transform: rotate(405deg); }
        }
        @keyframes orbit-cw-3 {
          from { transform: rotate(180deg); }
          to { transform: rotate(540deg); }
        }
        @keyframes orbit-cw-4 {
          from { transform: rotate(90deg); }
          to { transform: rotate(450deg); }
        }

        /* Counter-Clockwise Rotations for Lock Node Upright */
        @keyframes orbit-ccw-1 {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        @keyframes orbit-ccw-2 {
          from { transform: rotate(-45deg); }
          to { transform: rotate(-405deg); }
        }
        @keyframes orbit-ccw-3 {
          from { transform: rotate(-180deg); }
          to { transform: rotate(-540deg); }
        }
        @keyframes orbit-ccw-4 {
          from { transform: rotate(-90deg); }
          to { transform: rotate(-450deg); }
        }

        /* Speed and Loops */
        .animate-orbit-ring-1 {
          animation: orbit-cw-1 15s linear infinite;
        }
        .animate-orbit-node-1 {
          animation: orbit-ccw-1 15s linear infinite;
        }

        .animate-orbit-ring-2 {
          animation: orbit-cw-2 26s linear infinite;
        }
        .animate-orbit-node-2 {
          animation: orbit-ccw-2 26s linear infinite;
        }

        .animate-orbit-ring-3 {
          animation: orbit-cw-3 38s linear infinite;
        }
        .animate-orbit-node-3 {
          animation: orbit-ccw-3 38s linear infinite;
        }

        .animate-orbit-ring-4 {
          animation: orbit-cw-4 52s linear infinite;
        }
        .animate-orbit-node-4 {
          animation: orbit-ccw-4 52s linear infinite;
        }

        /* Pause on Hover */
        .orbit-wrapper:hover .orbit-ring-animate {
          animation-play-state: paused !important;
        }
        .orbit-wrapper:hover .orbit-node-animate {
          animation-play-state: paused !important;
        }

        /* Micro Fade-In Animation */
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}
