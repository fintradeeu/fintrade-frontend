import { Search, Users, Building } from "lucide-react";

export default function CareerPathways() {
  return (
    <div className="w-full bg-white relative z-10 overflow-hidden">
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
          <p className="text-base sm:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
            FinTrade graduates are equipped for a wide range of roles across India's financial ecosystem.
          </p>
          <p className="text-xs text-gray-400 font-semibold italic mt-2 tracking-wide">
            Orbits pause on hover
          </p>
        </div>

        {/* Orbit Centered System */}
        <div className="flex items-center justify-center relative overflow-hidden select-none py-4 md:py-8">
          <div className="relative w-full max-w-[340px] md:max-w-[560px] aspect-square flex items-center justify-center orbit-wrapper">
            
            {/* Central Core Circle (Your Career Logo) */}
            <div className="absolute w-20 h-20 md:w-28 md:h-28 rounded-full bg-[#D50032] flex flex-col items-center justify-center shadow-[0_10px_35px_rgba(213,0,50,0.35)] z-30 transition-transform duration-300 hover:scale-105">
              <span className="text-3xl md:text-4.5xl font-black text-white tracking-tighter leading-none font-sans">F</span>
              <span className="text-[8px] md:text-[9.5px] font-black text-white/95 tracking-widest leading-none mt-1 uppercase font-sans text-center">
                YOUR<br />CAREER
              </span>
            </div>

            {/* Orbit 1 (Inner, Blue - Research & Analyst) */}
            <div 
              className="absolute rounded-full border border-blue-500/12 flex items-center justify-center animate-orbit-ring-2 orbit-ring-animate"
              style={{
                width: "calc(var(--ring-scale, 1) * 150px)",
                height: "calc(var(--ring-scale, 1) * 150px)",
              }}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                <div className="animate-orbit-node-2 orbit-node-animate">
                  <div 
                    className="w-9 h-9 md:w-12 md:h-12 rounded-full border-2 border-blue-500 bg-white flex items-center justify-center shadow-lg transition-transform duration-300 hover:scale-110"
                    aria-label="Research & Analyst Pathway"
                  >
                    <Search className="w-4.5 h-4.5 md:w-5.5 md:h-5.5 text-blue-500 stroke-[2.5]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Orbit 2 (Middle, Green - Broking & Advisory) */}
            <div 
              className="absolute rounded-full border border-emerald-500/12 flex items-center justify-center animate-orbit-ring-3 orbit-ring-animate"
              style={{
                width: "calc(var(--ring-scale, 1) * 225px)",
                height: "calc(var(--ring-scale, 1) * 225px)",
              }}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                <div className="animate-orbit-node-3 orbit-node-animate">
                  <div 
                    className="w-9 h-9 md:w-12 md:h-12 rounded-full border-2 border-emerald-500 bg-white flex items-center justify-center shadow-lg transition-transform duration-300 hover:scale-110"
                    aria-label="Broking & Advisory Pathway"
                  >
                    <Users className="w-4.5 h-4.5 md:w-5.5 md:h-5.5 text-emerald-500 stroke-[2.5]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Orbit 3 (Outer, Purple - Institutional & Corporate) */}
            <div 
              className="absolute rounded-full border border-purple-500/12 flex items-center justify-center animate-orbit-ring-4 orbit-ring-animate"
              style={{
                width: "calc(var(--ring-scale, 1) * 300px)",
                height: "calc(var(--ring-scale, 1) * 300px)",
              }}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                <div className="animate-orbit-node-4 orbit-node-animate">
                  <div 
                    className="w-9 h-9 md:w-12 md:h-12 rounded-full border-2 border-purple-500 bg-white flex items-center justify-center shadow-lg transition-transform duration-300 hover:scale-110"
                    aria-label="Institutional & Corporate Pathway"
                  >
                    <Building className="w-4.5 h-4.5 md:w-5.5 md:h-5.5 text-purple-500 stroke-[2.5]" />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Orbit Legend at the bottom */}
        <div className="flex flex-wrap justify-center gap-6 md:gap-8 mt-12 border-t border-gray-100 pt-8">
          {[
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
      `}</style>
    </div>
  );
}
