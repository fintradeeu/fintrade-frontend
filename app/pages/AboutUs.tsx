import { useState, useEffect } from "react";
import { Users, TrendingUp, Target, Award, ArrowRight, Shield, UserCheck, BookOpen, LineChart, ChevronRight } from "lucide-react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Card } from "../components/ui/card";
import { leaders } from "../data/leaders";
import { Button } from "../components/ui/button";

export default function AboutUs() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [vmSlide, setVmSlide] = useState(0);
  
  const slides = [
    "/background.jpg",
    "/backgroundimage-1.avif",
    "/backgroundimage-2.avif"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const vmTimer = setInterval(() => {
      setVmSlide((prev) => (prev === 0 ? 1 : 0));
    }, 2000);
    return () => clearInterval(vmTimer);
  }, []);

  return (
    <div className="bg-white min-h-screen relative select-none">
      
      {/* Hero Section Wrapper with background slider */}
      <div className="relative w-full overflow-hidden pb-20">
        <div className="absolute inset-0 z-0">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
                index === currentSlide ? "opacity-100" : "opacity-0"
              }`}
            >
              <div className="absolute inset-0 bg-black/20 z-10" />
              <img
                src={slide}
                alt={`Background ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>

        {/* Top Background Accents */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#D50032]/5 blur-[120px] pointer-events-none z-0" />
        <div className="absolute top-[30%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#D50032]/5 blur-[150px] pointer-events-none z-0" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-16">
          
          {/* Header Block */}
        <div className="text-center mb-16 pt-8">
          <div className="inline-flex items-center gap-1.5 px-4.5 py-1.5 rounded-full mb-4 border border-white/20 bg-white/10 backdrop-blur-md shadow-sm">
            <span className="text-white font-black text-xs tracking-wider uppercase">
              📢 Who We Are
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6.5xl font-black mb-6 tracking-tight leading-none text-white font-sans uppercase drop-shadow-lg">
            About <span className="text-[#D50032]">FinTrade</span>
          </h1>
          <p className="text-base sm:text-xl text-gray-200 max-w-3xl mx-auto font-medium leading-relaxed drop-shadow-md">
            Building India's most trusted prop trading education and capital allocation ecosystem
          </p>

          {/* Slide Indicators */}
          <div className="flex justify-center gap-2 mt-8">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentSlide ? "w-8 bg-[#D50032]" : "w-2 bg-white/40 hover:bg-white/60"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Stats Counters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            { val: "1,200+", lbl: "Students Trained" },
            { val: "95%", lbl: "Failure Rate Addressed" },
            { val: "₹50+", lbl: "Crore Live Market Exp." }
          ].map((m, idx) => (
            <Card key={idx} className="flex flex-col items-center justify-center text-center p-8 bg-[#D50032] border-none rounded-2xl shadow-xl transition-all hover:bg-black duration-300 group cursor-pointer">
              <span className="text-4xl md:text-5xl font-black text-white leading-none mb-3 font-sans transition-colors duration-300">
                {m.val}
              </span>
              <span className="text-xs font-black text-white/90 uppercase tracking-widest leading-none transition-colors duration-300">
                {m.lbl}
              </span>
            </Card>
          ))}
        </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-10 pb-20">
        {/* Main Section */}
        <div className="max-w-6xl mx-auto mb-6 items-stretch px-4">
          
          {/* Card 1: About Us (Full Width) */}
          <div className="w-full flex">
            <Card className="w-full p-8 md:p-10 bg-white border border-gray-100 rounded-[36px] shadow-[0_12px_45px_rgba(0,0,0,0.015)] flex flex-col justify-between transition-all hover:shadow-[0_20px_50px_rgba(0,0,0,0.03)] hover:border-[#D50032]/10 duration-300">
              <div>
                <div className="flex items-center gap-2 mb-6">

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

            </Card>
          </div>

        </div>

        {/* Vision & Mission Slider */}
        <div className="max-w-6xl mx-auto mb-6 relative overflow-hidden min-h-[280px]">
          <AnimatePresence mode="wait">
            {vmSlide === 0 ? (
              <motion.div
                key="vision"
                initial={{ x: "100%", opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: "-100%", opacity: 0 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                className="w-full px-4"
              >
                <Card className="p-8 bg-white border border-gray-100 rounded-[36px] shadow-[0_12px_45px_rgba(0,0,0,0.015)] flex gap-4 items-start mx-auto max-w-5xl transition-all hover:shadow-[0_20px_50px_rgba(0,0,0,0.03)] hover:border-[#D50032]/10">
                  <div className="flex-1">
                    <h3 className="font-black text-gray-950 text-2xl tracking-tight mb-3">Our Vision</h3>
                    <p className="text-gray-600 text-base md:text-lg leading-relaxed mb-6">
                      To build India's most trusted, full-stack <strong className="text-gray-950 font-bold">Prop Trading Education & Capital Allocation ecosystem</strong> — transforming retail traders into consistently profitable, funded professionals.
                    </p>
                    <ul className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {[
                        "Trusted Education Platform",
                        "Capital Allocation Ecosystem",
                        "Funded Professionals"
                      ].map((bullet, idx) => (
                        <li key={idx} className="flex items-center gap-2.5 text-sm md:text-base font-bold text-gray-700">
                          <span className="w-2.5 h-2.5 flex-shrink-0 rounded bg-[#D50032]" />
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="mission"
                initial={{ x: "100%", opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: "-100%", opacity: 0 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                className="w-full px-4"
              >
                <Card className="p-8 bg-white border border-gray-100 rounded-[36px] shadow-[0_12px_45px_rgba(0,0,0,0.015)] flex gap-4 items-start mx-auto max-w-5xl transition-all hover:shadow-[0_20px_50px_rgba(0,0,0,0.03)] hover:border-[#D50032]/10">
                  <div className="flex-1">
                    <h3 className="font-black text-gray-950 text-2xl tracking-tight mb-3">Our Mission</h3>
                    <p className="text-gray-600 text-base md:text-lg leading-relaxed mb-6">
                      To empower aspiring traders by providing them with the right knowledge, discipline, and capital required to succeed in global markets and achieve lasting financial freedom.
                    </p>
                    <ul className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {[
                        "Practical Learning Approach",
                        "Discipline & Risk Management",
                        "Pathway to Financial Freedom"
                      ].map((bullet, idx) => (
                        <li key={idx} className="flex items-center gap-2.5 text-sm md:text-base font-bold text-gray-700">
                          <span className="w-2.5 h-2.5 flex-shrink-0 rounded bg-[#D50032]" />
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Slider Controls */}
          <div className="flex justify-center gap-2 mt-6">
            <button onClick={() => setVmSlide(0)} className={`h-1.5 rounded-full transition-all duration-300 ${vmSlide === 0 ? "w-8 bg-[#D50032]" : "w-2 bg-gray-300 hover:bg-gray-400"}`} aria-label="Show Vision" />
            <button onClick={() => setVmSlide(1)} className={`h-1.5 rounded-full transition-all duration-300 ${vmSlide === 1 ? "w-8 bg-[#D50032]" : "w-2 bg-gray-300 hover:bg-gray-400"}`} aria-label="Show Mission" />
          </div>
        </div>

        {/* Leadership Section */}
        <div className="border-t border-gray-100 pt-12">
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
            {leaders.map((leader, i) => (
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

                <Link to={`/leader/${leader.id}`} className="text-[#D50032] font-black text-xs tracking-wider uppercase flex items-center gap-1 group-hover:gap-2 transition-all self-start mt-auto">
                  Read Full Profile <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </Card>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
