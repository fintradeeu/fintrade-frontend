import { useState, useEffect, useRef } from "react";
import { Award, CheckCircle, Shield, Calendar, CreditCard, ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "../ui/card";
import logo from "../../../imports/fintrade_logo.png";

export default function CertificatePreview() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const parentWidth = containerRef.current.clientWidth;
        // Base width of the certificate canvas is 680px
        const newScale = parentWidth / 680;
        setScale(newScale);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    // Extra trigger after a short delay to ensure correct mounting width
    const timer = setTimeout(handleResize, 100);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev === 0 ? 1 : 0));
    }, 3000);
    return () => clearInterval(interval);
  }, [isHovered]);

  const handlePrev = () => {
    setActiveSlide((prev) => (prev === 0 ? 1 : 0));
  };

  const handleNext = () => {
    setActiveSlide((prev) => (prev === 0 ? 1 : 0));
  };

  return (
    <section className="py-4 bg-transparent relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6">
          <div className="inline-block px-4 py-2 rounded-full mb-2 border border-[#D50032]/30" style={{ background: "rgba(213,0,50,0.08)" }}>
            <span className="text-[#D50032] font-semibold text-sm">🏅 Certification</span>
          </div>
          <h2 className="text-4xl font-bold mb-2" style={{ color: "#121212" }}>Industry-Recognized Certificate</h2>
          <p className="text-xl text-gray-600">Earn a verified certificate upon course completion</p>
        </div>
        <div className="grid lg:grid-cols-12 gap-8 items-center">
          {/* Certificate Preview Card Slider */}
          <div className="lg:col-span-7 flex flex-col items-center">
            <div 
              ref={containerRef} 
              className="w-full relative overflow-hidden rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] bg-white group/slider"
              style={{ height: `${480 * scale}px` }}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {/* Scale Container */}
              <div 
                className="absolute inset-0"
                style={{ 
                  transform: `scale(${scale})`, 
                  transformOrigin: "top left",
                  width: "680px",
                  height: "480px"
                }}
              >
                {/* Slide 1 - Research Analyst Certificate */}
                <div 
                  className="absolute inset-0 transition-all duration-700 ease-in-out flex bg-white"
                  style={{ 
                    opacity: activeSlide === 0 ? 1 : 0,
                    transform: `translateX(${activeSlide === 0 ? "0px" : "-30px"})`,
                    pointerEvents: activeSlide === 0 ? "auto" : "none",
                    width: "680px",
                    height: "480px"
                  }}
                >
                  {/* Left Side (Red Stripe) */}
                  <div className="w-[15%] bg-[#C62828] flex flex-col items-center pt-6 relative h-full">
                     <div className="w-full px-2">
                       <img src={logo} alt="FinTrade Logo" className="w-full invert brightness-0" style={{ filter: "brightness(0) invert(1)" }} />
                     </div>
                     <div className="absolute bottom-0 left-0 right-0 h-2 bg-[#FFD700]/80" />
                  </div>
                  
                  {/* Main Certificate Body */}
                  <div className="flex-1 p-8 flex flex-col items-center text-center relative h-full bg-white">
                     <div className="text-[#C62828] font-serif text-5xl font-light tracking-[0.15em] mb-1">CERTIFICATE</div>
                     <div className="text-gray-800 font-bold tracking-[0.2em] text-sm border-t border-[#C62828]/30 pt-1 mb-6 uppercase">Of Completion</div>
                     
                     <div className="text-2xl font-bold text-gray-800 mb-6 px-2">Professional Research Analyst Program</div>
                     
                     <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-4">This certificate is proudly presented to</div>
                     
                     <div className="text-5xl mb-6 text-[#C62828]" style={{ fontFamily: "'Dancing Script', cursive, serif" }}>Rohan Singh</div>
                     <div className="w-[60%] h-[1px] bg-gray-300 mb-6" />
                     
                     <p className="text-[10px] text-gray-600 max-w-md mb-10 leading-relaxed px-4">
                       For successfully completing the course and gaining practical knowledge in global trade operations, financial instruments, and risk mitigation strategies.
                     </p>
                     
                     {/* Bottom Details Section */}
                     <div className="grid grid-cols-3 w-full items-end mt-auto gap-4 pb-2">
                        {/* Signature 1 */}
                        <div className="flex flex-col items-center">
                           <div className="w-24 h-8 mb-1 flex items-center justify-center opacity-80 italic text-gray-700 text-lg">H. Vyas</div>
                           <div className="w-full h-[1px] bg-gray-300 mb-1" />
                           <div className="text-[8px] font-bold text-[#C62828]">HET VYAS</div>
                           <div className="text-[6px] text-gray-500 uppercase">(Founder/COO)</div>
                        </div>
                        
                        {/* Gold Seal */}
                        <div className="flex flex-col items-center justify-center">
                           <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#D4AF37] via-[#FFD700] to-[#F9E272] flex flex-col items-center justify-center shadow-lg border-4 border-white">
                              <div className="text-[6px] font-black text-[#8B7355] border-b border-[#8B7355]/30">CERTIFIED</div>
                              <div className="flex gap-0.5 mt-0.5">
                                 <span className="text-[6px]">★</span>
                                 <span className="text-[8px]">★</span>
                                 <span className="text-[6px]">★</span>
                              </div>
                           </div>
                        </div>
                        
                        {/* Signature 2 */}
                        <div className="flex flex-col items-center">
                           <div className="w-24 h-8 mb-1 flex items-center justify-center opacity-80 italic text-gray-700 text-lg">C. Panchal</div>
                           <div className="w-full h-[1px] bg-gray-300 mb-1" />
                           <div className="text-[8px] font-bold text-[#C62828]">CHIRAG PANCHAL</div>
                           <div className="text-[6px] text-gray-500 uppercase">(MD/CEO)</div>
                        </div>
                     </div>
                     
                     {/* Bottom Footer Details */}
                     <div className="flex justify-between w-full mt-6 text-[8px] text-gray-500">
                        <div className="flex items-center gap-1">
                           <Calendar className="h-3 w-3 text-[#C62828]" />
                           <div className="text-left">
                              <div className="font-bold">DATE OF COMPLETION</div>
                              <div className="text-[#C62828]">24TH JANUARY, 2025</div>
                           </div>
                        </div>
                        <div className="flex items-center gap-1">
                           <CreditCard className="h-3 w-3 text-[#C62828]" />
                           <div className="text-right">
                              <div className="font-bold uppercase">Certificate Number</div>
                              <div className="text-[#C62828]">FT-CPRA-250124</div>
                           </div>
                        </div>
                     </div>
                  </div>
                </div>

                {/* Slide 2 - Professional Trading Certificate */}
                <div 
                  className="absolute inset-0 transition-all duration-700 ease-in-out bg-white overflow-hidden flex items-center justify-center"
                  style={{ 
                    opacity: activeSlide === 1 ? 1 : 0,
                    transform: `translateX(${activeSlide === 1 ? "0px" : "30px"})`,
                    pointerEvents: activeSlide === 1 ? "auto" : "none",
                    width: "680px",
                    height: "480px"
                  }}
                >
                  <img 
                    src="/CERTIFICATE 02 (1) (1)_page-0001.jpg" 
                    alt="Professional Trading Program Certificate" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Slider Arrows (Only show on hover) */}
              <button 
                onClick={handlePrev}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-gray-800 flex items-center justify-center shadow-md transition-all duration-300 opacity-0 group-hover/slider:opacity-100 z-20"
                aria-label="Previous Certificate"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button 
                onClick={handleNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-gray-800 flex items-center justify-center shadow-md transition-all duration-300 opacity-0 group-hover/slider:opacity-100 z-20"
                aria-label="Next Certificate"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            {/* Dots Indicators */}
            <div className="flex justify-center gap-2 mt-4 z-20">
              <button 
                onClick={() => setActiveSlide(0)} 
                className={`h-2 rounded-full transition-all duration-300 ${activeSlide === 0 ? 'bg-[#D50032] w-6' : 'bg-gray-300 w-2'}`} 
                aria-label="Certificate 1"
              />
              <button 
                onClick={() => setActiveSlide(1)} 
                className={`h-2 rounded-full transition-all duration-300 ${activeSlide === 1 ? 'bg-[#D50032] w-6' : 'bg-gray-300 w-2'}`} 
                aria-label="Certificate 2"
              />
            </div>
          </div>

          {/* Certificate Info */}
          <div className="lg:col-span-5 space-y-6">
            {[
              {
                icon: Award,
                title: "Industry-Recognized",
                desc: "Our certificates are recognized by leading prop trading firms and financial institutions across India.",
              },
              {
                icon: Shield,
                title: "Verified & Tamper-Proof",
                desc: "Each certificate comes with a unique verification ID. Employers can verify authenticity instantly.",
              },
              {
                icon: CheckCircle,
                title: "Skill-Based Assessment",
                desc: "Certificates are awarded based on exam performance, project work, and trading simulator results.",
              },
            ].map((item, i) => (
              <div key={i} className="flex gap-4 items-start p-4 rounded-xl hover:bg-[#D50032]/5 transition-colors">
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(213,0,50,0.1)" }}>
                  <item.icon className="h-6 w-6" style={{ color: "#D50032" }} />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1" style={{ color: "#121212" }}>{item.title}</h4>
                  <p className="text-gray-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap" rel="stylesheet" />
    </section>
  );
}

