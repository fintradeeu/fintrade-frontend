import { useState } from "react";
import { TrendingUp, Search, Users, Building2, Briefcase } from "lucide-react";

interface Category {
  id: string;
  icon: React.ComponentType<any>;
  title: string;
  color: string;
  roles: string[];
  orbitR: number;
  speed: number;
  startDeg: number;
}

const categories: Category[] = [
  {
    id: 'trading',
    icon: TrendingUp,
    title: 'Trading Roles',
    color: '#E63229',
    roles: ['Equity Trader','Derivatives Trader','Intraday Trader','Options Trader','Commodity Trader','Currency Trader','Prop Trader','Technical Trader','Algo Trading Executive','Dealer / Terminal Operator'],
    orbitR: 115, speed: 60, startDeg: 0,
  },
  {
    id: 'research',
    icon: Search,
    title: 'Research & Analyst',
    color: '#2563eb',
    roles: ['Equity Research Analyst','Technical Analyst','Investment Analyst','Portfolio Analyst'],
    orbitR: 175, speed: 80, startDeg: 90,
  },
  {
    id: 'broking',
    icon: Users,
    title: 'Broking & Advisory',
    color: '#16a34a',
    roles: ['Relationship Manager','Investment Advisor','Financial Consultant','Client Acquisition Executive','RM Capital Markets'],
    orbitR: 235, speed: 100, startDeg: 180,
  },
  {
    id: 'institutional',
    icon: Building2,
    title: 'Institutional & Corporate',
    color: '#9333ea',
    roles: ['Proprietary Trading Firms','Stock Broking Companies','Investment Advisory Firms','AMCs','Hedge Funds','Research Firms','PMS'],
    orbitR: 295, speed: 120, startDeg: 270,
  },
];

export default function CareerPathways() {
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

  const activeCat = categories.find((cat) => cat.id === activeCategoryId);

  return (
    <div className="w-full bg-white py-10 pb-20" style={{ overflow: "visible", position: "relative", zIndex: 5000 }}>
      <div className="w-full">
        
        {/* Section Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-4.5 py-1.5 rounded-full mb-3 border border-[#D50032]/25 bg-[#D50032]/5">
            <span className="text-[#D50032] font-extrabold text-xs tracking-wider uppercase flex items-center gap-1">
              💼 Career Pathways
            </span>
          </div>
          <h2 className="text-3xl md:text-4.5xl font-black mb-3 text-gray-900 tracking-tight">
            Placement & <span className="text-[#D50032]">Career Opportunities</span>
          </h2>
          <p className="text-base sm:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed px-4">
            FinTrade graduates are equipped for a wide range of roles across India's financial ecosystem.
          </p>
          <p className="text-xs text-gray-400 font-semibold italic mt-2 tracking-wide">
            Orbits pause on hover • Hover icons to explore roles
          </p>
        </div>
 
        {/* Orbit Centered System */}
        <div 
          className="flex items-center justify-center relative overflow-visible select-none py-4 md:py-8"
          onMouseLeave={() => setActiveCategoryId(null)}
        >
          <div className="relative w-full max-w-[340px] md:max-w-[560px] aspect-square flex items-center justify-center orbit-wrapper" style={{ zIndex: 2000 }}>
            
            {/* Central Core Circle (Your Career Logo) */}
            <div className="absolute w-20 h-20 md:w-28 md:h-28 rounded-full bg-[#D50032] flex flex-col items-center justify-center shadow-[0_10px_35px_rgba(213,0,50,0.35)] z-30 transition-transform duration-300 hover:scale-105">
              <span className="text-3xl md:text-4.5xl font-black text-white tracking-tighter leading-none font-sans">F</span>
              <span className="text-[8px] md:text-[9.5px] font-black text-white/95 tracking-widest leading-none mt-1 uppercase font-sans text-center">
                YOUR<br />CAREER
              </span>
            </div>

            {/* Concentric Orbiting Rings & Nodes */}
            {categories.map((cat) => {
              const isSelected = activeCategoryId === cat.id;
              const IconComponent = cat.icon;

              return (
                <div 
                  key={cat.id}
                  className="absolute rounded-full flex items-center justify-center orbit-ring-animate pointer-events-none"
                  style={{
                    width: `calc(var(--ring-scale, 1) * ${cat.orbitR}px)`,
                    height: `calc(var(--ring-scale, 1) * ${cat.orbitR}px)`,
                    border: isSelected ? `2px solid ${cat.color}35` : `1.5px solid ${cat.color}12`,
                    animationName: 'orbit-rotation',
                    animationDuration: `${cat.speed / 3}s`,
                    animationTimingFunction: 'linear',
                    animationIterationCount: 'infinite',
                    // Pass dynamic starting angle values via CSS variables
                    ['--start-deg' as any]: `${cat.startDeg}deg`,
                    ['--counter-deg' as any]: `${-cat.startDeg}deg`,
                    zIndex: isSelected ? 1000 : 0,
                  }}
                >
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-auto">
                    <div 
                      className="orbit-node-animate relative"
                      style={{
                        animationName: 'orbit-node-rotation',
                        animationDuration: `${cat.speed / 3}s`,
                        animationTimingFunction: 'linear',
                        animationIterationCount: 'infinite',
                        ['--start-deg' as any]: `${cat.startDeg}deg`,
                        ['--counter-deg' as any]: `${-cat.startDeg}deg`,
                      }}
                    >
                      <button 
                        onMouseEnter={() => setActiveCategoryId(cat.id)}
                        className="w-9 h-9 md:w-12 md:h-12 rounded-full border-2 bg-white flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-115 cursor-pointer relative group/btn"
                        style={{ 
                          borderColor: cat.color,
                          boxShadow: isSelected ? `0 0 15px ${cat.color}45` : undefined,
                        }}
                        aria-label={cat.title}
                      >
                        <IconComponent 
                          className="w-4.5 h-4.5 md:w-5.5 md:h-5.5 stroke-[2.5] transition-transform duration-300 group-hover/btn:scale-105" 
                          style={{ color: cat.color }}
                        />
                      </button>

                      {/* Floating dynamic content popup matching the second image layout */}
                      {isSelected && (
                        <div 
                          className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-[260px] md:w-[320px] bg-white border-2 rounded-[24px] p-4.5 shadow-xl z-50 text-left animate-fade-in cursor-default pointer-events-auto select-text"
                          style={{ borderColor: cat.color, zIndex: 1000 }}
                        >
                          <h4 className="text-xs md:text-sm font-black mb-3 uppercase tracking-wide" style={{ color: cat.color }}>
                            {cat.title}
                          </h4>
                          <div className="flex flex-wrap gap-1.5 md:gap-2">
                            {cat.roles.map((role, idx) => (
                              <span 
                                key={idx}
                                className="px-3 py-1 rounded-full text-[9px] md:text-[11px] font-bold border transition-all duration-300 hover:scale-[1.03]"
                                style={{
                                  borderColor: `${cat.color}25`,
                                  backgroundColor: `${cat.color}08`,
                                  color: '#374151'
                                }}
                              >
                                {role}
                              </span>
                            ))}
                          </div>
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

      {/* Hardware-Accelerated Dynamic Animations Style Block */}
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

        /* Clockwise Rotation with Custom Start Degrees */
        @keyframes orbit-rotation {
          from { transform: rotate(var(--start-deg, 0deg)); }
          to { transform: rotate(calc(var(--start-deg, 0deg) + 360deg)); }
        }

        /* Counter-Clockwise Rotation to Keep Icons Upright */
        @keyframes orbit-node-rotation {
          from { transform: rotate(var(--counter-deg, 0deg)); }
          to { transform: rotate(calc(var(--counter-deg, 0deg) - 360deg)); }
        }

        /* Basic Animation Triggers */
        .orbit-ring-animate {
          animation-name: orbit-rotation;
          animation-iteration-count: infinite;
          animation-timing-function: linear;
        }
        .orbit-node-animate {
          animation-name: orbit-node-rotation;
          animation-iteration-count: infinite;
          animation-timing-function: linear;
        }

        /* Continues orbiting smoothly even on hover */

        /* Fade-in Animation for Hover Card */
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}
