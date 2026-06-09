import { useState, useEffect } from "react";
import { Users, TrendingUp, Target, Award, ArrowRight, Shield, UserCheck, BookOpen, LineChart, ChevronRight } from "lucide-react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import ExpertProfile from "../components/home/ExpertProfile";
import api from "../services/api";

const getImageUrl = (path?: string) => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) return path;
  const base = api.defaults.baseURL || "";
  const cleanBase = base.endsWith("/") ? base.slice(0, -1) : base;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
};


// Reusable Framer Motion Scroll Reveal Component
function ScrollReveal({ 
  children, 
  className = "", 
  delay = 0,
  duration = 1.5
}: { 
  children: any; 
  className?: string; 
  delay?: number;
  duration?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration, ease: [0.16, 1, 0.3, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function AboutUs() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [vmSlide, setVmSlide] = useState(0);
  const [dynamicSlides, setDynamicSlides] = useState<string[]>([]);
  const [dynamicStats, setDynamicStats] = useState<any[]>([]);
  const [dynamicText, setDynamicText] = useState<string[]>([]);
  const [dynamicVision, setDynamicVision] = useState<any>(null);
  const [dynamicMission, setDynamicMission] = useState<any>(null);
  const [dynamicLeaders, setDynamicLeaders] = useState<any[]>([]);
  
  useEffect(() => {
    api.get("/settings/about-us").then(res => {
      if (res.data) {
        const slides = res.data.slides || res.data.about_us_slides;
        if (slides?.length > 0) {
          setDynamicSlides(slides.map(getImageUrl));
        }
        
        const stats = res.data.stats || res.data.about_us_stats;
        if (stats?.length > 0) {
          setDynamicStats(stats);
        }
        
        const text = res.data.text || res.data.about_us_text;
        if (text?.length > 0) {
          setDynamicText(text);
        }
        
        const vision = res.data.vision || res.data.about_us_vision;
        if (vision) {
          setDynamicVision({
            title: vision.title || "",
            text: vision.content || vision.text || "",
            bullets: vision.bullets || []
          });
        }
        
        const mission = res.data.mission || res.data.about_us_mission;
        if (mission) {
          setDynamicMission({
            title: mission.title || "",
            text: mission.content || mission.text || "",
            bullets: mission.bullets || []
          });
        }

        const leadership = res.data.leadership;
        if (leadership?.length > 0) {
          setDynamicLeaders(leadership);
        }
      }
    }).catch(console.error);
  }, []);

  const defaultSlides = [
    "/background.jpg",
    "/backgroundimage-1.avif",
    "/backgroundimage-2.avif"
  ];
  
  const slides = dynamicSlides.length > 0 ? dynamicSlides : defaultSlides;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  useEffect(() => {
    const vmTimer = setInterval(() => {
      setVmSlide((prev) => (prev === 0 ? 1 : 0));
    }, 6000);
    return () => clearInterval(vmTimer);
  }, []);

  return (
    <div className="bg-white min-h-screen relative select-none">
      
      {/* Hero Section Wrapper with background slider */}
      <div className="relative w-full overflow-hidden pb-10 md:pb-20">
        <div className="absolute inset-0 z-0">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
                index === currentSlide ? "opacity-100" : "opacity-0"
              }`}
            >
              <div className="absolute inset-0 bg-black/60 z-10" />
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

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-6 md:pt-16">
          
          {/* Header Block */}
          <ScrollReveal>
            <div className="text-center mb-8 md:mb-16 pt-2 md:pt-8">
              <div className="inline-flex items-center gap-1.5 px-4.5 py-1.5 rounded-full mb-4 border border-white/20 bg-white/10 backdrop-blur-md shadow-sm">
                <span className="text-white font-black text-xs tracking-wider uppercase">
                  📢 Who We Are
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6.5xl font-black mb-6 tracking-tight leading-none text-white font-sans uppercase drop-shadow-lg">
                About <span className="text-[#D50032]">FinTrade</span>
              </h1>
              <p className="text-base sm:text-xl text-white max-w-3xl mx-auto font-sans font-medium leading-relaxed drop-shadow-lg">
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
          </ScrollReveal>

          {/* Stats Counters */}
          <ScrollReveal delay={0.12}>
            <div className="flex flex-row flex-wrap justify-center gap-3 md:grid md:grid-cols-3 md:gap-6 max-w-5xl mx-auto px-4 md:px-0">
              {(dynamicStats.length > 0 ? dynamicStats : [
                { val: "1,200+", lbl: "Students Trained" },
                { val: "95%", lbl: "Failure Rate Addressed" },
                { val: "₹50+", lbl: "Crore Live Market Exp." }
              ]).map((m, idx) => (
                <Card key={idx} className="flex flex-row md:flex-col items-center justify-center text-center gap-2 md:gap-3 p-3.5 md:p-8 bg-[#D50032] border-none rounded-xl md:rounded-2xl shadow-lg md:shadow-xl transition-all hover:bg-black hover:scale-105 duration-300 group cursor-pointer w-auto flex-1 min-w-[140px] sm:min-w-[180px] md:min-w-0 md:w-full">
                  <span className="text-base sm:text-lg md:text-5xl font-black text-white leading-none font-sans transition-colors duration-300 whitespace-nowrap">
                    {m.val || m.value}
                  </span>
                  <span className="text-[10px] sm:text-xs font-black text-white/90 uppercase tracking-wider md:tracking-widest leading-tight transition-colors duration-300">
                    {m.lbl || m.label}
                  </span>
                </Card>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-6 pb-10 md:pt-10 md:pb-20">
        {/* Main Section */}
        <ScrollReveal>
          <div className="max-w-6xl mx-auto mb-6 items-stretch px-4">
            
            {/* Card 1: About Us (Full Width) */}
            <div className="w-full flex">
              <Card className="w-full p-8 md:p-10 bg-white border border-gray-100 rounded-[36px] shadow-[0_12px_45px_rgba(0,0,0,0.015)] flex flex-col justify-between transition-all hover:shadow-[0_20px_50px_rgba(0,0,0,0.03)] hover:border-[#D50032]/10 duration-300">
                <div>
                  <div className="flex items-center gap-2 mb-6">
                    <h3 className="font-black text-gray-950 text-xl tracking-tight">About Us</h3>
                  </div>

                  <div className="space-y-4 text-gray-600 text-sm md:text-base leading-relaxed">
                    {(dynamicText.length > 0 ? dynamicText : [
                      "FinTrade is a <strong class=\"text-gray-900 font-bold\">results-driven prop trading academy</strong> focused on developing skilled and disciplined traders. We combine practical learning, live market exposure, and structured mentorship to bridge the gap between knowledge and real trading performance.",
                      "Our programs are designed to build consistency, confidence, and profitability, guiding students from basics to <strong class=\"text-gray-900 font-bold\">professional-level trading</strong>.",
                      "At FinTrade, we don't just teach trading — <span class=\"text-[#D50032]\">we build traders</span>."
                    ]).map((txt: string, idx: number) => (
                      <p key={idx} dangerouslySetInnerHTML={{ __html: txt }} className={idx === 2 && dynamicText.length === 0 ? "text-gray-950 font-extrabold text-base md:text-lg border-l-4 border-[#D50032] pl-4 py-1 bg-red-50/30" : ""} />
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </ScrollReveal>

        {/* Vision & Mission Slider */}
        <ScrollReveal delay={0.12}>
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
                      <h3 className="font-black text-gray-950 text-2xl tracking-tight mb-3">
                        {dynamicVision?.title || "Our Vision"}
                      </h3>
                      <p className="text-gray-600 text-base md:text-lg leading-relaxed mb-6">
                        {dynamicVision?.text || "To build India's most trusted, full-stack Prop Trading Education & Capital Allocation ecosystem — transforming retail traders into consistently profitable, funded professionals."}
                      </p>
                      <ul className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {(dynamicVision?.bullets?.length > 0 ? dynamicVision.bullets : [
                          "Trusted Education Platform",
                          "Capital Allocation Ecosystem",
                          "Funded Professionals"
                        ]).map((bullet: string, idx: number) => (
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
                      <h3 className="font-black text-gray-950 text-2xl tracking-tight mb-3">
                        {dynamicMission?.title || "Our Mission"}
                      </h3>
                      <p className="text-gray-600 text-base md:text-lg leading-relaxed mb-6">
                        {dynamicMission?.text || "To empower aspiring traders by providing them with the right knowledge, discipline, and capital required to succeed in global markets and achieve lasting financial freedom."}
                      </p>
                      <ul className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {(dynamicMission?.bullets?.length > 0 ? dynamicMission.bullets : [
                          "Practical Learning Approach",
                          "Discipline & Risk Management",
                          "Pathway to Financial Freedom"
                        ]).map((bullet: string, idx: number) => (
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
        </ScrollReveal>

        {/* Leadership Section */}
        <ScrollReveal>
          <div className="border-t border-gray-100 pt-12">
            <ExpertProfile leaders={dynamicLeaders} />
          </div>
        </ScrollReveal>

      </div>
    </div>
  );
}
