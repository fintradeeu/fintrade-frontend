import { useState, useEffect } from "react";
import { Check, CreditCard, ShieldCheck, Percent } from "lucide-react";
import { motion } from "motion/react";

interface EMIPaymentItem {
  title: string;
  tagline: string;
  color: string;
  bullets: string[];
  btnText: string;
}

interface EMIConfig {
  heading?: string;
  subheading?: string;
  plans?: EMIPaymentItem[];
}

interface EMIHighlightProps {
  emiConfig?: EMIConfig;
}

function hexToRgb(hex?: string) {
  if (!hex) return "213, 0, 50";
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const fullHex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
  return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : "213, 0, 50";
}

export default function EMIHighlight({ emiConfig }: EMIHighlightProps) {
  const heading = emiConfig?.heading || "Flexible EMI & Payment Plans";
  const subheading = emiConfig?.subheading || "Invest in your trading career with our convenient payment options and banking rewards";

  const defaultPlans = [
    {
      title: "Flexible EMI Options",
      tagline: "No Cost & Low-Interest Plans",
      color: "#D50032",
      btnText: "Choose Plan",
      bullets: [
        "EMI tenures available for 6 Months and 12 Months.",
        "6-Month Tenure: 100% No-Cost EMI (0% interest).",
        "12-Month Tenure: Competitive rate of 15% Interest P.A."
      ]
    },
    {
      title: "Eligibility & Cashbacks",
      tagline: "CIBIL Check & Credit Rewards",
      color: "#16a34a",
      btnText: "Check Eligibility",
      bullets: [
        "EMI loans offered exclusively for customers with 730 & above CIBIL score.",
        "Get up to 5% Cashback instantly on your tuition payment.",
        "Cashback is applicable on payments made with any Credit Card."
      ]
    },
    {
      title: "Special Gateway Discount",
      tagline: "Upcoming Gateway Offer",
      color: "#2563eb",
      btnText: "Explore Discount",
      bullets: [
        "Enjoy a flat 5% Discount on the total course fee.",
        "Discount launches after 3 months of installing our payment gateway.",
        "Automatic early-bird reward directly at the checkout terminal."
      ]
    }
  ];

  const plans = (emiConfig?.plans && emiConfig.plans.length > 0) ? emiConfig.plans : defaultPlans;

  const paymentDetails = plans.map((plan, i) => {
    const color = plan.color || (i === 0 ? "#D50032" : i === 1 ? "#16a34a" : "#2563eb");
    return {
      icon: i === 0 ? CreditCard : i === 1 ? ShieldCheck : Percent,
      title: plan.title || `Plan ${i + 1}`,
      tagline: plan.tagline || "Easy payment option",
      color: color,
      bgColor: `rgba(${hexToRgb(color)}, 0.03)`,
      borderColor: `rgba(${hexToRgb(color)}, 0.12)`,
      btnText: plan.btnText || "Choose Plan",
      bullets: plan.bullets || []
    };
  });

  const [activeSlide, setActiveSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % paymentDetails.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [isHovered, paymentDetails.length]);

  return (
    <section className="py-12 md:py-16 relative z-10 bg-transparent overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[#D50032]/3 rounded-full blur-[130px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10"
      >
        
        {/* Section Header */}
        <div className="text-center mb-10 select-none">
          <div className="inline-flex items-center gap-1.5 px-4.5 py-1.5 rounded-full mb-3 border border-[#D50032]/25 bg-[#D50032]/5">
            <span className="text-[#D50032] font-extrabold text-xs tracking-wider uppercase flex items-center gap-1">
              💳 Easy Payments
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black mb-3 text-gray-900 tracking-tight">
            {heading.split(" ").map((w, idx) => (
              <span key={idx}>
                {idx === heading.split(" ").length - 1 ? (
                  <span className="text-[#D50032]">{w}</span>
                ) : (
                  w + " "
                )}
              </span>
            ))}
          </h2>
          <p className="text-base sm:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
            {subheading}
          </p>
        </div>

        {/* Premium Payment Details Grid - Desktop */}
        <div className="hidden md:grid md:grid-cols-3 gap-8 md:gap-6 items-stretch max-w-6xl mx-auto">
          {paymentDetails.map((detail, idx) => {
            const IconComponent = detail.icon;
            return (
              <div
                key={idx}
                className="relative rounded-[32px] p-8 bg-white border flex flex-col justify-between transition-all duration-300 select-none hover:shadow-xl hover:-translate-y-1 group"
                style={{
                  borderColor: detail.borderColor,
                }}
              >
                <div>
                  {/* Top Bar with Icon */}
                  <div 
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-105"
                    style={{
                      backgroundColor: detail.bgColor,
                      color: detail.color,
                      border: `1.5px solid ${detail.borderColor}`,
                    }}
                  >
                    <IconComponent className="w-6.5 h-6.5 stroke-[2.2]" />
                  </div>

                  {/* Title & Tagline */}
                  <h3 className="text-xl font-black text-gray-900 mb-1 tracking-tight">
                    {detail.title}
                  </h3>
                  <p 
                    className="text-xs font-extrabold uppercase tracking-widest mb-6"
                    style={{ color: detail.color }}
                  >
                    {detail.tagline}
                  </p>

                  {/* Divider */}
                  <hr className="border-gray-100 w-full mb-6" />

                  {/* Bullets List */}
                  <div className="space-y-4 mb-4">
                    {detail.bullets.map((bullet, bIdx) => (
                      <div key={bIdx} className="flex items-start gap-3 text-left">
                        <div 
                          className="w-5.5 h-5.5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{
                            backgroundColor: detail.bgColor,
                            border: `1px solid ${detail.borderColor}`,
                          }}
                        >
                          <Check 
                            className="w-3.5 h-3.5 stroke-[3]" 
                            style={{ color: detail.color }}
                          />
                        </div>
                        <span className="text-gray-600 text-sm font-semibold leading-relaxed">
                          {bullet}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Choose Plan Action Button */}
                <div className="w-full mt-auto pt-8">
                  <button
                    className="w-full py-4 rounded-2xl font-extrabold text-sm text-white transition-all duration-300 transform active:scale-98 cursor-pointer flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg border-0"
                    style={{
                      backgroundColor: detail.color,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = "0.9";
                      e.currentTarget.style.boxShadow = `0 8px 25px rgba(${hexToRgb(detail.color)}, 0.25)`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = "1";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    {detail.btnText}
                  </button>
                </div>

              </div>
            );
          })}
        </div>

        {/* Premium Payment Details Auto-Slider - Mobile */}
        <div 
          className="md:hidden relative max-w-sm mx-auto"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onTouchStart={() => setIsHovered(true)}
          onTouchEnd={() => setIsHovered(false)}
        >
          {/* Slider Window */}
          <div className="overflow-hidden rounded-[32px]">
            <div 
              className="flex transition-transform duration-700 ease-in-out"
              style={{
                transform: `translateX(-${activeSlide * (100 / paymentDetails.length)}%)`,
                width: `${paymentDetails.length * 100}%`,
              }}
            >
              {paymentDetails.map((detail, idx) => {
                const IconComponent = detail.icon;
                return (
                  <div
                    key={idx}
                    className="flex-shrink-0 px-2"
                    style={{ width: `${100 / paymentDetails.length}%` }}
                  >
                    <div
                      className="relative rounded-[32px] p-6.5 bg-white border flex flex-col justify-between transition-all duration-300 min-h-[440px]"
                      style={{
                        borderColor: detail.borderColor,
                      }}
                    >
                      <div>
                        {/* Top Bar with Icon */}
                        <div 
                          className="w-12.5 h-12.5 rounded-2xl flex items-center justify-center mb-5"
                          style={{
                            backgroundColor: detail.bgColor,
                            color: detail.color,
                            border: `1.5px solid ${detail.borderColor}`,
                          }}
                        >
                          <IconComponent className="w-5.5 h-5.5 stroke-[2.2]" />
                        </div>

                        {/* Title & Tagline */}
                        <h3 className="text-lg font-black text-gray-900 mb-0.5 tracking-tight">
                          {detail.title}
                        </h3>
                        <p 
                          className="text-[10px] font-extrabold uppercase tracking-widest mb-4"
                          style={{ color: detail.color }}
                        >
                          {detail.tagline}
                        </p>

                        {/* Divider */}
                        <hr className="border-gray-100 w-full mb-4" />

                        {/* Bullets List */}
                        <div className="space-y-3 mb-2">
                          {detail.bullets.map((bullet, bIdx) => (
                            <div key={bIdx} className="flex items-start gap-2.5 text-left">
                              <div 
                                className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                                style={{
                                  backgroundColor: detail.bgColor,
                                  border: `1px solid ${detail.borderColor}`,
                                }}
                              >
                                <Check 
                                  className="w-3.5 h-3.5 stroke-[3]" 
                                  style={{ color: detail.color }}
                                />
                              </div>
                              <span className="text-gray-600 text-xs font-semibold leading-relaxed">
                                {bullet}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Choose Plan Action Button */}
                      <div className="w-full mt-auto pt-6">
                        <button
                          className="w-full py-3.5 rounded-2xl font-extrabold text-xs text-white transition-all duration-300 transform active:scale-98 cursor-pointer flex items-center justify-center gap-1.5 shadow-md border-0"
                          style={{
                            backgroundColor: detail.color,
                          }}
                        >
                          {detail.btnText}
                        </button>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-5">
            {paymentDetails.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveSlide(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  activeSlide === idx ? "bg-[#D50032] w-5" : "bg-gray-200 w-1.5"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

      </motion.div>
    </section>
  );
}
