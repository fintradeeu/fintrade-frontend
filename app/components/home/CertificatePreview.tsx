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
                {/* Slide 1 - Certification 1 */}
                <div 
                  className="absolute inset-0 transition-all duration-700 ease-in-out bg-white overflow-hidden flex items-center justify-center p-2"
                  style={{ 
                    opacity: activeSlide === 0 ? 1 : 0,
                    transform: `translateX(${activeSlide === 0 ? "0px" : "-30px"})`,
                    pointerEvents: activeSlide === 0 ? "auto" : "none",
                    width: "680px",
                    height: "480px"
                  }}
                >
                  <img 
                    src="/certificate-1.png" 
                    alt="FinTrade Certified Trading Program Certificate" 
                    className="w-full h-full object-contain drop-shadow-md rounded-lg"
                  />
                </div>

                {/* Slide 2 - Certification 2 */}
                <div 
                  className="absolute inset-0 transition-all duration-700 ease-in-out bg-white overflow-hidden flex items-center justify-center p-2"
                  style={{ 
                    opacity: activeSlide === 1 ? 1 : 0,
                    transform: `translateX(${activeSlide === 1 ? "0px" : "30px"})`,
                    pointerEvents: activeSlide === 1 ? "auto" : "none",
                    width: "680px",
                    height: "480px"
                  }}
                >
                  <img 
                    src="/certificate-2.png" 
                    alt="FinTrade Certified Professional Program Certificate" 
                    className="w-full h-full object-contain drop-shadow-md rounded-lg"
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

