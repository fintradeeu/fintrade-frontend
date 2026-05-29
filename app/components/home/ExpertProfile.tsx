import { useState } from "react";
import { X } from "lucide-react";

interface StatItem {
  value: string;
  label: string;
}

interface LeaderModalData {
  name: string;
  title: string;
  monogram: string;
  headerDetail: string;
  stats: StatItem[];
  bio: string;
  tags: string[];
}

export default function ExpertProfile() {
  const [activeLeader, setActiveLeader] = useState<number | null>(null);

  const leadersData: LeaderModalData[] = [
    {
      name: "Het Vyas",
      title: "Founder & COO",
      monogram: "HV",
      headerDetail: "📈 ₹50 Cr+ Live Market Experience",
      stats: [
        { value: "₹50 Cr+", label: "Market Experience" },
        { value: "Prop Trading", label: "Platform" },
        { value: "Forex • Equity • Derivatives", label: "Expertise" }
      ],
      bio: "EdTech entrepreneur and Founder of The FinTrade, India's first structured prop trading academy and capital allocation platform. He built a full-stack ecosystem to bridge trading education with real income opportunities for retail traders, students, and professionals. With ₹50 Cr+ in live market experience across Forex, equity, and derivatives, he founded The FinTrade to address the 95% trader failure rate caused by gaps in traditional education systems.",
      tags: [
        "₹50 Cr+ Live Market Experience",
        "Forex, Equity & Derivatives",
        "EdTech Entrepreneur",
        "India's First Prop Trading Academy"
      ]
    },
    {
      name: "Chirag Panchal",
      title: "Managing Director & CEO",
      monogram: "CP",
      headerDetail: "💼 22+ Years Media Leadership",
      stats: [
        { value: "22+ Years", label: "Leadership" },
        { value: "5 Media", label: "Platforms Built" },
        { value: "Strategy & Growth", label: "Expertise" }
      ],
      bio: "Media strategist and entrepreneur with 22+ years of leadership experience in the Gujarati media industry. He has successfully built and scaled platforms such as TV9 Gujarati, GSTV, Zee 24 Kalak, TV13 Gujarati, and News Capital, combining strong strategic vision with execution excellence. With expertise in content, marketing, and revenue growth, he specializes in market positioning, audience engagement, growth strategy, end-to-end project execution, and team leadership.",
      tags: [
        "22+ Years Media Leadership",
        "TV9 Gujarati, GSTV, Zee 24 Kalak",
        "Market Positioning Expert",
        "Growth Strategy & Execution"
      ]
    },
    {
      name: "Bhargav Dave",
      title: "VP, Training & Development",
      monogram: "BD",
      headerDetail: "🪙 ₹25 Cr+ Capital Managed",
      stats: [
        { value: "20+ Years", label: "Experience" },
        { value: "₹25 Cr+", label: "Capital Managed" },
        { value: "250+", label: "Traders Trained" }
      ],
      bio: "Highly respected capital market professional with 20+ years of expertise in proprietary trading, derivatives strategies, investment advisory, and financial market education. As Assistant Vice President at Junomoneta Finsol Pvt Ltd, he has successfully managed ₹25+ crore in trading capital while leading and mentoring a team of professional traders. Known for his sharp market insight, disciplined risk management, and strategic execution, Bhargav has trained 250+ traders and delivered 150+ institutional programs through reputed platforms including NISM and NSE Academy.",
      tags: [
        "₹25 Cr+ Capital Managed",
        "250+ Traders Trained",
        "150+ Institutional Programs",
        "NISM & NSE Academy"
      ]
    }
  ];

  return (
    <div className="w-full bg-transparent relative z-10">
      <div className="w-full">
        
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 px-4.5 py-1.5 rounded-full mb-3 border border-[#D50032]/25 bg-[#D50032]/5">
            <span className="text-[#D50032] font-extrabold text-xs tracking-wider uppercase">
              👥 Our Team
            </span>
          </div>
          <h2 className="text-3xl md:text-4.5xl font-black mb-3 text-gray-900 tracking-tight">
            Meet Our <span className="text-[#D50032]">Leadership</span>
          </h2>
          <p className="text-base sm:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Visionary leaders who built FinTrade to reshape India's trading education landscape
          </p>
        </div>

        {/* Leadership Grid Layout */}
        <div className="grid lg:grid-cols-12 gap-8 max-w-5xl mx-auto items-stretch select-none">
          
          {/* Column 1: Featured Left Tall Card - Het Vyas (lg:col-span-6) */}
          <div className="lg:col-span-6 flex">
            <div className="w-full bg-white border border-gray-100/90 rounded-[28px] p-6 sm:p-7 shadow-[0_12px_40px_rgba(0,0,0,0.012)] hover:-translate-y-1.5 hover:shadow-[0_20px_50px_rgba(0,0,0,0.04)] hover:border-[#D50032]/10 transition-all duration-300 flex flex-col justify-between items-stretch">
              <div>
                
                {/* Header Profile Info */}
                <div className="flex items-center gap-4.5">
                  {/* Large Circular Avatar Monogram */}
                  <div className="w-18 h-18 rounded-full bg-[#FFF0F2] border border-[#D50032]/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xl font-extrabold text-[#D50032] tracking-tighter">HV</span>
                  </div>
                  
                  {/* Name & Title */}
                  <div className="space-y-1">
                    <h3 className="text-xl font-black text-gray-900 tracking-tight leading-none">
                      Het Vyas
                    </h3>
                    <p className="text-sm font-extrabold text-[#D50032] leading-none">
                      Founder & COO
                    </p>
                  </div>
                </div>

                {/* Horizontal Divider */}
                <div className="w-full h-[1px] bg-gray-100 my-6" />

                {/* Bio Description */}
                <p className="text-gray-500 text-sm leading-relaxed text-left">
                  EdTech entrepreneur with ₹50 Cr+ live market experience, founder of India's first structured prop trading academy.
                </p>

                {/* Highlight Badges */}
                <div className="flex flex-wrap gap-2 mt-8">
                  {[
                    "₹50 Cr+ Live Market Experience",
                    "Forex, Equity & Derivatives",
                    "EdTech Entrepreneur"
                  ].map((tag, tIdx) => (
                    <span
                      key={tIdx}
                      className="px-3.5 py-1.5 text-[11px] font-bold text-gray-600 bg-[#FFF0F2]/50 border border-gray-100 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

              </div>

              {/* Read Full Profile Link */}
              <div className="mt-6 pt-1">
                <button 
                  onClick={() => setActiveLeader(0)}
                  className="text-xs font-black text-[#D50032] tracking-wider uppercase flex items-center gap-1 hover:gap-2 transition-all duration-300 self-start cursor-pointer border-none bg-transparent"
                >
                  Read Full Profile <span className="text-sm leading-none mt-0.5">→</span>
                </button>
              </div>

            </div>
          </div>

          {/* Column 2: Two Stacked Profile Cards on Right - Chirag & Bhargav (lg:col-span-6) */}
          <div className="lg:col-span-6 flex flex-col gap-6 items-stretch justify-between">
            
            {/* Top Card: Chirag Panchal */}
            <div className="w-full bg-white border border-gray-100/90 rounded-[28px] p-6 sm:p-7 shadow-[0_12px_40px_rgba(0,0,0,0.012)] hover:-translate-y-1.5 hover:shadow-[0_20px_50px_rgba(0,0,0,0.04)] hover:border-[#D50032]/10 transition-all duration-300 flex flex-col justify-between items-stretch">
              <div>
                
                {/* Header Profile Info */}
                <div className="flex items-center gap-4">
                  {/* Circular Avatar Monogram */}
                  <div className="w-14 h-14 rounded-full bg-[#FFF0F2] border border-[#D50032]/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-base font-extrabold text-[#D50032] tracking-tighter">CP</span>
                  </div>
                  
                  {/* Name & Title */}
                  <div className="space-y-1">
                    <h3 className="text-lg font-black text-gray-900 tracking-tight leading-none">
                      Chirag Panchal
                    </h3>
                    <p className="text-xs font-extrabold text-[#D50032] leading-none">
                      Managing Director & CEO
                    </p>
                  </div>
                </div>

                {/* Bio Description */}
                <p className="text-gray-500 text-sm leading-relaxed mt-4 text-left">
                  Media strategist with 22+ years of leadership experience. Built TV9 Gujarati, GSTV, Zee 24 Kalak and more.
                </p>

              </div>

              {/* Read Profile Link */}
              <div className="mt-6 pt-1">
                <button 
                  onClick={() => setActiveLeader(1)}
                  className="text-xs font-black text-[#D50032] tracking-wider uppercase flex items-center gap-1 hover:gap-2 transition-all duration-300 self-start cursor-pointer border-none bg-transparent"
                >
                  Read Full Profile <span className="text-sm leading-none mt-0.5">→</span>
                </button>
              </div>
            </div>

            {/* Bottom Card: Bhargav Dave */}
            <div className="w-full bg-white border border-gray-100/90 rounded-[28px] p-6 sm:p-7 shadow-[0_12px_40px_rgba(0,0,0,0.012)] hover:-translate-y-1.5 hover:shadow-[0_20px_50px_rgba(0,0,0,0.04)] hover:border-[#D50032]/10 transition-all duration-300 flex flex-col justify-between items-stretch">
              <div>
                
                {/* Header Profile Info */}
                <div className="flex items-center gap-4">
                  {/* Circular Avatar Monogram */}
                  <div className="w-14 h-14 rounded-full bg-[#FFF0F2] border border-[#D50032]/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-base font-extrabold text-[#D50032] tracking-tighter">BD</span>
                  </div>
                  
                  {/* Name & Title */}
                  <div className="space-y-1">
                    <h3 className="text-lg font-black text-gray-900 tracking-tight leading-none">
                      Bhargav Dave
                    </h3>
                    <p className="text-xs font-extrabold text-[#D50032] leading-none">
                      VP, Training & Development
                    </p>
                  </div>
                </div>

                {/* Bio Description */}
                <p className="text-gray-500 text-sm leading-relaxed mt-4 text-left">
                  20+ years in capital markets, ₹25 Cr+ managed, 250+ traders trained via NISM & NSE Academy programs.
                </p>

              </div>

              {/* Read Profile Link */}
              <div className="mt-6 pt-1">
                <button 
                  onClick={() => setActiveLeader(2)}
                  className="text-xs font-black text-[#D50032] tracking-wider uppercase flex items-center gap-1 hover:gap-2 transition-all duration-300 self-start cursor-pointer border-none bg-transparent"
                >
                  Read Full Profile <span className="text-sm leading-none mt-0.5">→</span>
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Dynamic Modal Dialog Dossier */}
      {activeLeader !== null && (
        <div 
          className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 bg-gray-950/60 backdrop-blur-sm overflow-y-auto animate-modal-bg"
          onClick={() => setActiveLeader(null)}
        >
          {/* Modal Container */}
          <div 
            className="relative bg-white rounded-[24px] md:rounded-[32px] max-w-2xl w-full p-5 sm:p-8 shadow-2xl my-auto select-none animate-modal-box max-h-[90vh] sm:max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button X */}
            <button 
              onClick={() => setActiveLeader(null)}
              className="absolute top-4 right-4 md:top-6 md:right-6 text-gray-400 hover:text-gray-700 transition-colors p-1.5 cursor-pointer bg-transparent border-none rounded-full hover:bg-gray-50 z-20"
              aria-label="Close dossier"
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3.5 md:gap-4.5 text-left">
              <div className="w-14 h-14 md:w-18 md:h-18 rounded-full bg-[#FFF0F2] border border-[#D50032]/10 flex items-center justify-center flex-shrink-0">
                <span className="text-lg md:text-xl font-black text-[#D50032] tracking-tighter">
                  {leadersData[activeLeader].monogram}
                </span>
              </div>
              <div className="space-y-1">
                <h3 className="text-xl md:text-2xl font-black text-gray-950 tracking-tight leading-none">
                  {leadersData[activeLeader].name}
                </h3>
                <p className="text-xs md:text-sm font-extrabold text-[#D50032] leading-none mt-1">
                  {leadersData[activeLeader].title}
                </p>
                <p className="text-[10px] md:text-xs font-extrabold text-gray-400 leading-none mt-2 uppercase tracking-wide">
                  {leadersData[activeLeader].headerDetail}
                </p>
              </div>
            </div>

            {/* Featured stats row (3 cards) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mt-6">
              {leadersData[activeLeader].stats.map((stat, sIdx) => (
                <div 
                  key={sIdx}
                  className="bg-[#FFF5F6] border border-[#D50032]/8 rounded-xl md:rounded-2xl p-3 md:p-4 flex flex-col justify-center items-center text-center shadow-[0_2px_8px_rgba(213,0,50,0.01)]"
                >
                  <span className="text-sm md:text-base lg:text-lg font-black text-[#D50032] leading-tight tracking-tight break-words">
                    {stat.value}
                  </span>
                  <span className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-wider mt-1.5 leading-none">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Divider line */}
            <div className="w-full h-[1px] bg-gray-100 my-6" />

            {/* Deep bio content */}
            <p className="text-gray-500 text-xs sm:text-sm md:text-base leading-relaxed text-left font-medium">
              {leadersData[activeLeader].bio}
            </p>

            {/* Tags/Badges group */}
            <div className="flex flex-wrap gap-2 mt-6">
              {leadersData[activeLeader].tags.map((tag, tIdx) => (
                <span
                  key={tIdx}
                  className="px-3.5 py-1.5 text-[11px] font-bold text-gray-600 bg-[#FFF0F2]/50 border border-gray-100 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>

          </div>
        </div>
      )}

      {/* hardware acceleration styles */}
      <style>{`
        @keyframes modal-fade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modal-scale {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-modal-bg {
          animation: modal-fade 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-modal-box {
          animation: modal-scale 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}
