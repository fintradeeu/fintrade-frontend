import { Award, CheckCircle, Shield, Calendar, CreditCard } from "lucide-react";
import { Card } from "../ui/card";
import logo from "../../../imports/fintrade_logo.png";

export default function CertificatePreview() {
  return (
    <section className="py-4 bg-transparent relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6">
          <div className="inline-block px-4 py-2 rounded-full mb-2 border border-[#E53935]/30" style={{ background: "rgba(229,57,53,0.08)" }}>
            <span className="text-[#E53935] font-semibold text-sm">🏅 Certification</span>
          </div>
          <h2 className="text-4xl font-bold mb-2" style={{ color: "#121212" }}>Industry-Recognized Certificate</h2>
          <p className="text-xl text-gray-600">Earn a verified certificate upon course completion</p>
        </div>
        <div className="grid lg:grid-cols-12 gap-8 items-center">
          {/* Certificate Preview Card */}
          <div className="lg:col-span-7">
            <Card className="p-0 border-0 shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden bg-white aspect-auto md:aspect-[1.414/1] relative min-h-[480px] md:min-h-0">
              <div className="flex h-full min-h-[480px] md:min-h-0">
                {/* Left Side (Red Stripe) */}
                <div className="w-[12%] md:w-[15%] bg-[#C62828] flex flex-col items-center pt-4 md:pt-6 relative">
                   <div className="w-full px-1 md:px-2">
                     <img src={logo} alt="FinTrade Logo" className="w-full invert brightness-0" style={{ filter: "brightness(0) invert(1)" }} />
                   </div>
                   <div className="absolute bottom-0 left-0 right-0 h-2 bg-[#FFD700]/80" />
                </div>
                
                {/* Main Certificate Body */}
                <div className="flex-1 p-4 md:p-8 flex flex-col items-center text-center relative">
                   <div className="text-[#C62828] font-serif text-3xl md:text-5xl font-light tracking-[0.1em] md:tracking-[0.15em] mb-1">CERTIFICATE</div>
                   <div className="text-gray-800 font-bold tracking-[0.15em] md:tracking-[0.2em] text-[10px] md:text-sm border-t border-[#C62828]/30 pt-1 mb-4 md:mb-6 uppercase">Of Completion</div>
                   
                   <div className="text-lg md:text-2xl font-bold text-gray-800 mb-4 md:mb-6 px-2">Professional Research Analyst Program</div>
                   
                   <div className="text-[8px] md:text-[10px] text-gray-500 uppercase tracking-widest mb-2 md:mb-4">This certificate is proudly presented to</div>
                   
                   <div className="text-3xl md:text-5xl mb-4 md:mb-6 text-[#C62828]" style={{ fontFamily: "'Dancing Script', cursive, serif" }}>Rohan Singh</div>
                   <div className="w-[70%] md:w-[60%] h-[1px] bg-gray-300 mb-4 md:mb-6" />
                   
                   <p className="text-[8px] md:text-[10px] text-gray-600 max-w-md mb-6 md:mb-10 leading-relaxed px-4">
                     For successfully completing the course and gaining practical knowledge in global trade operations, financial instruments, and risk mitigation strategies.
                   </p>
                   
                   {/* Bottom Details Section */}
                   <div className="grid grid-cols-3 w-full items-end mt-auto gap-2 md:gap-4 pb-2">
                      {/* Signature 1 */}
                      <div className="flex flex-col items-center">
                         <div className="w-16 md:w-24 h-6 md:h-8 mb-1 flex items-center justify-center opacity-80 italic text-gray-700 text-xs md:text-lg">H. Vyas</div>
                         <div className="w-full h-[1px] bg-gray-300 mb-1" />
                         <div className="text-[6px] md:text-[8px] font-bold text-[#C62828]">HET VYAS</div>
                         <div className="text-[5px] md:text-[6px] text-gray-500 uppercase">(Founder/COO)</div>
                      </div>
                      
                      {/* Gold Seal */}
                      <div className="flex flex-col items-center justify-center">
                         <div className="w-10 h-10 md:w-16 md:h-16 rounded-full bg-gradient-to-tr from-[#D4AF37] via-[#FFD700] to-[#F9E272] flex flex-col items-center justify-center shadow-lg border-2 md:border-4 border-white">
                            <div className="text-[4px] md:text-[6px] font-black text-[#8B7355] border-b border-[#8B7355]/30">CERTIFIED</div>
                            <div className="flex gap-0.5 mt-0.5">
                               <span className="text-[4px] md:text-[6px]">★</span>
                               <span className="text-[5px] md:text-[8px]">★</span>
                               <span className="text-[4px] md:text-[6px]">★</span>
                            </div>
                         </div>
                      </div>
                      
                      {/* Signature 2 */}
                      <div className="flex flex-col items-center">
                         <div className="w-16 md:w-24 h-6 md:h-8 mb-1 flex items-center justify-center opacity-80 italic text-gray-700 text-xs md:text-lg">C. Panchal</div>
                         <div className="w-full h-[1px] bg-gray-300 mb-1" />
                         <div className="text-[6px] md:text-[8px] font-bold text-[#C62828]">CHIRAG PANCHAL</div>
                         <div className="text-[5px] md:text-[6px] text-gray-500 uppercase">(MD/CEO)</div>
                      </div>
                   </div>
                   
                   {/* Bottom Footer Details */}
                   <div className="flex justify-between w-full mt-4 md:mt-6 text-[7px] md:text-[8px] text-gray-500">
                      <div className="flex items-center gap-1">
                         <Calendar className="h-2 w-2 md:h-3 md:w-3 text-[#C62828]" />
                         <div className="text-left">
                            <div className="font-bold">DATE OF COMPLETION</div>
                            <div className="text-[#C62828]">24TH JANUARY, 2025</div>
                         </div>
                      </div>
                      <div className="flex items-center gap-1">
                         <CreditCard className="h-2 w-2 md:h-3 md:w-3 text-[#C62828]" />
                         <div className="text-right">
                            <div className="font-bold uppercase">Certificate Number</div>
                            <div className="text-[#C62828]">FT-CPRA-250124</div>
                         </div>
                      </div>
                   </div>
                </div>
              </div>
            </Card>
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
              <div key={i} className="flex gap-4 items-start p-4 rounded-xl hover:bg-[#E53935]/5 transition-colors">
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(229,57,53,0.1)" }}>
                  <item.icon className="h-6 w-6" style={{ color: "#E53935" }} />
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
