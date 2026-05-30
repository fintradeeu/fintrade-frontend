import { Users, TrendingUp, Target, Award, ArrowRight, Shield, UserCheck, BookOpen, LineChart, ChevronRight } from "lucide-react";
import { Link } from "react-router";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";

export default function AboutUs() {
  return (
    <div className="bg-white min-h-screen relative overflow-hidden pt-10 pb-20 select-none">
      
      {/* Top Background Accents */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#D50032]/5 blur-[120px] pointer-events-none" />
      <div className="absolute top-[30%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#D50032]/5 blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Block */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-1.5 px-4.5 py-1.5 rounded-full mb-4 border border-[#D50032]/25 bg-[#D50032]/5">
            <span className="text-[#D50032] font-black text-xs tracking-wider uppercase">
              📢 Who We Are
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6.5xl font-black mb-6 tracking-tight leading-none text-gray-950 font-sans uppercase">
            About <span className="text-[#D50032]">FinTrade</span>
          </h1>
          <p className="text-base sm:text-xl text-gray-600 max-w-3xl mx-auto font-medium leading-relaxed">
            Building India's most trusted prop trading education and capital allocation ecosystem
          </p>
        </div>

        {/* Stats Counters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">
          {[
            { val: "1,200+", lbl: "Students Trained" },
            { val: "95%", lbl: "Failure Rate Addressed" },
            { val: "₹50+", lbl: "Crore Live Market Exp." }
          ].map((m, idx) => (
            <Card key={idx} className="flex flex-col items-center justify-center text-center p-8 bg-white border border-gray-100 rounded-3xl shadow-[0_12px_40px_rgba(0,0,0,0.015)] transition-all hover:shadow-[0_20px_50px_rgba(213,0,50,0.03)] hover:border-[#D50032]/10 duration-300">
              <span className="text-4xl md:text-5xl font-black text-[#D50032] leading-none mb-3 font-sans">
                {m.val}
              </span>
              <span className="text-xs font-black text-gray-400 uppercase tracking-widest leading-none">
                {m.lbl}
              </span>
            </Card>
          ))}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-6xl mx-auto mb-20 items-stretch">
          
          {/* Card 1: About Us (Left Side, spanning 12 cols on mobile, 6 cols on desktop) */}
          <div className="lg:col-span-6 flex">
            <Card className="w-full p-8 md:p-10 bg-white border border-gray-100 rounded-[36px] shadow-[0_12px_45px_rgba(0,0,0,0.015)] flex flex-col justify-between transition-all hover:shadow-[0_20px_50px_rgba(0,0,0,0.03)] hover:border-[#D50032]/10 duration-300">
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-[#FFF0F2] flex items-center justify-center text-[#D50032]">
                    <span className="font-extrabold text-sm">FT</span>
                  </div>
                  <h3 className="font-black text-gray-950 text-xl tracking-tight">About Us</h3>
                </div>

                <div className="space-y-4 text-gray-600 text-sm md:text-base leading-relaxed">
                  <p>
                    FinTrade is a <strong className="text-gray-900 font-bold">results-driven prop trading academy</strong> focused on developing skilled and disciplined traders. We combine practical learning, live market exposure, and structured mentorship to bridge the gap between knowledge and real trading performance.
                  </p>
                  <p>
                    Our programs are designed to build consistency, confidence, and profitability, guiding students from basics to <strong className="text-gray-900 font-bold">professional-level trading</strong>.
                  </p>
                  <p className="text-gray-950 font-extrabold text-base md:text-lg border-l-4 border-[#D50032] pl-4 py-1 bg-red-50/30">
                    At FinTrade, we don't just teach trading — <span className="text-[#D50032]">we build traders</span>.
                  </p>
                </div>
              </div>

              {/* Growth Trajectory Visualizer */}
              <div className="mt-10 pt-6 border-t border-gray-100">
                <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-4">
                  Growth Trajectory
                </span>
                <div className="relative h-24 w-full flex items-end">
                  {/* SVG Custom Graph */}
                  <svg className="w-full h-full" viewBox="0 0 300 80" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="graphGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#D50032" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#D50032" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    {/* Area under curve */}
                    <path
                      d="M 10 70 C 60 65, 110 50, 160 45 C 210 40, 250 25, 290 10 L 290 80 L 10 80 Z"
                      fill="url(#graphGrad)"
                    />
                    {/* Line curve */}
                    <path
                      d="M 10 70 C 60 65, 110 50, 160 45 C 210 40, 250 25, 290 10"
                      fill="none"
                      stroke="#D50032"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                    {/* Nodes along the curve */}
                    <circle cx="10" cy="70" r="4.5" fill="#D50032" stroke="#FFFFFF" strokeWidth="1.5" />
                    <circle cx="90" cy="58" r="4.5" fill="#D50032" stroke="#FFFFFF" strokeWidth="1.5" />
                    <circle cx="170" cy="43" r="4.5" fill="#D50032" stroke="#FFFFFF" strokeWidth="1.5" />
                    <circle cx="250" cy="22" r="4.5" fill="#D50032" stroke="#FFFFFF" strokeWidth="1.5" />
                    <circle cx="290" cy="10" r="5.5" fill="#D50032" stroke="#FFFFFF" strokeWidth="2.5" />
                  </svg>
                  {/* Years Overlay */}
                  <div className="absolute inset-x-0 bottom-[-18px] flex justify-between text-[9px] font-bold text-gray-400 tracking-wider">
                    <span>2021</span>
                    <span>2022</span>
                    <span>2023</span>
                    <span>2024</span>
                    <span>2025</span>
                    <span className="text-[#D50032]">Now</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Side Stack: Our Vision & The FinTrade Transformation */}
          <div className="lg:col-span-6 flex flex-col gap-8">
            
            {/* Card 2: Our Vision */}
            <Card className="p-8 bg-white border border-gray-100 rounded-[36px] shadow-[0_12px_45px_rgba(0,0,0,0.015)] flex-1 flex flex-col justify-between transition-all hover:shadow-[0_20px_50px_rgba(0,0,0,0.03)] hover:border-[#D50032]/10 duration-300">
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-[#FFF0F2] flex items-center justify-center text-[#D50032] flex-shrink-0">
                  <Target className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-black text-gray-950 text-xl tracking-tight mb-3">Our Vision</h3>
                  <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-6">
                    To build India's most trusted, full-stack <strong className="text-gray-950 font-bold">Prop Trading Education & Capital Allocation ecosystem</strong> — transforming retail traders into consistently profitable, funded professionals.
                  </p>
                  
                  <ul className="space-y-2.5">
                    {[
                      "Trusted Education Platform",
                      "Capital Allocation Ecosystem",
                      "Funded Professionals"
                    ].map((bullet, idx) => (
                      <li key={idx} className="flex items-center gap-2.5 text-sm font-bold text-gray-700">
                        <span className="w-2.5 h-2.5 rounded bg-[#D50032]" />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>

            {/* Card 3: The FinTrade Transformation */}
            <Card className="p-8 bg-white border border-gray-100 rounded-[36px] shadow-[0_12px_45px_rgba(0,0,0,0.015)] transition-all hover:shadow-[0_20px_50px_rgba(0,0,0,0.03)] hover:border-[#D50032]/10 duration-300">
              <div className="flex gap-4 items-start mb-6">
                <div className="w-10 h-10 rounded-xl bg-[#FFF0F2] flex items-center justify-center text-[#D50032] flex-shrink-0">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-black text-gray-950 text-lg tracking-tight mb-0.5">The FinTrade Transformation</h3>
                  <p className="text-gray-400 text-xs font-semibold">From retail trader to funded professional</p>
                </div>
              </div>

              {/* Progress/Timeline Visualizer */}
              <div className="mt-8 relative py-4">
                <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-6">
                  Your Transformation
                </span>
                
                <div className="flex items-center justify-between relative px-2">
                  {/* Gray background connector line */}
                  <div className="absolute top-[13px] left-8 right-8 h-[3px] bg-gray-100 z-0" />
                  {/* Red completed line */}
                  <div className="absolute top-[13px] left-8 w-1/2 h-[3px] bg-[#D50032] z-0" />

                  {/* Stage 1 */}
                  <div className="flex flex-col items-center z-10">
                    <div className="w-7 h-7 rounded-full bg-[#D50032]/10 border border-[#D50032] flex items-center justify-center text-xs font-extrabold text-[#D50032] shadow-sm">
                      ✓
                    </div>
                    <span className="text-[10px] font-extrabold text-gray-800 tracking-tight mt-2.5 whitespace-nowrap">
                      Retail Trader
                    </span>
                  </div>

                  {/* Stage 2 */}
                  <div className="flex flex-col items-center z-10">
                    <div className="w-7 h-7 rounded-full bg-[#D50032] text-white flex items-center justify-center text-xs font-extrabold shadow-sm">
                      ✓
                    </div>
                    <span className="text-[10px] font-extrabold text-gray-850 tracking-tight mt-2.5 whitespace-nowrap">
                      Disciplined Trader
                    </span>
                  </div>

                  {/* Stage 3 */}
                  <div className="flex flex-col items-center z-10">
                    <div className="w-7 h-7 rounded-full bg-white border-2 border-[#D50032] flex items-center justify-center text-xs font-extrabold text-[#D50032] shadow-sm relative">
                      <span className="absolute inset-1 rounded-full bg-[#D50032]/20 animate-ping" />
                      ★
                    </div>
                    <span className="text-[10px] font-extrabold text-[#D50032] tracking-tight mt-2.5 whitespace-nowrap">
                      Funded Professional
                    </span>
                  </div>
                </div>
              </div>
            </Card>

          </div>
        </div>

        {/* Leadership Section */}
        <div className="border-t border-gray-100 pt-20">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-1.5 px-4.5 py-1.5 rounded-full mb-4 border border-[#D50032]/25 bg-[#D50032]/5">
              <span className="text-[#D50032] font-black text-xs tracking-wider uppercase">
                👥 Our Team
              </span>
            </div>
            <h2 className="text-3xl sm:text-4.5xl font-black mb-4 text-gray-900 tracking-tight">
              Meet Our <span className="text-[#D50032]">Leadership</span>
            </h2>
            <p className="text-base sm:text-lg text-gray-500 max-w-2xl mx-auto font-medium">
              Visionary leaders who built FinTrade to reshape India's trading education landscape
            </p>
          </div>

          {/* Leaders Profile Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: "Het Vyas",
                role: "Founder & COO",
                initials: "HV",
                bio: "EdTech entrepreneur with ₹50 Cr+ live market experience, founder of India's first structured prop trading academy.",
                tags: ["₹50 Cr+ Live Market Experience", "Forex, Equity & Derivatives", "EdTech Entrepreneur"]
              },
              {
                name: "Chirag Panchal",
                role: "Managing Director & CEO",
                initials: "CP",
                bio: "Media strategist with 22+ years of leadership experience. Built TV9 Gujarati, GSTV, Zee 24 Kalak and more.",
                tags: ["22+ Yrs Leadership", "Media Strategist", "Business Strategy"]
              },
              {
                name: "Bhargav Dave",
                role: "VP, Training & Development",
                initials: "BD",
                bio: "20+ years in capital markets, ₹25 Cr+ managed, 250+ traders trained via NISM & NIF Academy programs.",
                tags: ["20+ Yrs Capital Markets", "₹25 Cr+ Managed", "250+ Traders Trained"]
              }
            ].map((leader, i) => (
              <Card key={i} className="p-7 bg-white border border-gray-100 rounded-[28px] shadow-[0_10px_35px_rgba(0,0,0,0.012)] hover:-translate-y-1.5 hover:shadow-[0_20px_50px_rgba(0,0,0,0.04)] hover:border-[#D50032]/10 transition-all duration-300 flex flex-col justify-between group">
                <div>
                  <div className="flex items-center gap-3.5 mb-6">
                    <div className="w-12 h-12 rounded-full bg-[#FFF0F2] text-[#D50032] flex items-center justify-center font-extrabold text-sm tracking-tight border border-[#D50032]/10 group-hover:scale-105 transition-all duration-300">
                      {leader.initials}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-gray-950 text-base leading-snug">{leader.name}</h3>
                      <p className="text-[#D50032] text-xs font-black tracking-wide uppercase mt-0.5">{leader.role}</p>
                    </div>
                  </div>

                  <p className="text-gray-500 text-xs md:text-sm leading-relaxed mb-6 font-medium text-left">
                    {leader.bio}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-8">
                    {leader.tags.map((tag, tIdx) => (
                      <span key={tIdx} className="px-3 py-1.5 rounded-full text-[10px] font-bold text-gray-650 bg-gray-50 border border-gray-100">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <button className="text-[#D50032] font-black text-xs tracking-wider uppercase flex items-center gap-1 group-hover:gap-2 transition-all self-start mt-auto">
                  Read Full Profile <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </Card>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
