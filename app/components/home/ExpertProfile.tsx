import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { leaders } from "../../data/leaders";

export default function ExpertProfile({ leaders: _leadersProp }: { leaders?: any }) {
  return (
    <div className="w-full bg-transparent relative z-10">
      <div className="w-full">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-1.5 px-4.5 py-1.5 rounded-full mb-4 border border-[#D50032]/25 bg-[#D50032]/5">
            <span className="text-[#D50032] font-black text-xs tracking-wider uppercase">
              👥 Our Team
            </span>
          </div>
          <h2 className="text-3xl md:text-4.5xl font-black mb-4 text-gray-900 tracking-tight">
            Meet Our <span className="text-[#D50032]">Leadership</span>
          </h2>
          <p className="text-base sm:text-lg text-gray-500 max-w-2xl mx-auto font-medium">
            Visionary leaders who built FinTrade to reshape India's trading education landscape
          </p>
        </div>

        {/* Leaders Profile Grid */}
        <div 
          className="flex md:grid md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto px-4 select-none overflow-x-auto snap-x snap-mandatory pb-6"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <style>{`
            .overflow-x-auto::-webkit-scrollbar { display: none; }
          `}</style>
          {leaders.map((leader, i) => (
            <div key={i} className="min-w-[280px] w-[80vw] sm:w-[320px] md:w-auto md:min-w-0 flex-shrink-0 snap-center p-5 bg-white border border-gray-100 rounded-[28px] shadow-[0_10px_35px_rgba(0,0,0,0.012)] hover:-translate-y-1.5 hover:shadow-[0_20px_50px_rgba(0,0,0,0.04)] hover:border-[#D50032]/10 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="mb-6 overflow-hidden rounded-[20px] w-full aspect-square bg-gray-50 flex items-center justify-center border border-gray-100 relative group-hover:border-[#D50032]/20 transition-colors">
                  <img 
                    src={leader.image} 
                    alt={leader.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                </div>
                <div className="text-center mb-6">
                  <h3 className="font-black text-gray-950 text-xl leading-snug">{leader.name}</h3>
                  <p className="text-[#D50032] text-xs font-black tracking-wide uppercase mt-1.5">{leader.role}</p>
                </div>
              </div>

              <Link to={`/leader/${leader.id}`} className="text-[#D50032] font-black text-xs tracking-wider uppercase flex items-center justify-center gap-1 group-hover:gap-2 transition-all w-full py-3.5 rounded-xl bg-gray-50 group-hover:bg-[#FFF0F2] mt-auto">
                Read Full Profile <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
