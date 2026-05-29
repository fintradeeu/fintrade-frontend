import { Check, CreditCard, ShieldCheck, Percent } from "lucide-react";
import { motion } from "motion/react";

export default function EMIHighlight() {
  const paymentDetails = [
    {
      icon: CreditCard,
      title: "Flexible EMI Options",
      tagline: "No Cost & Low-Interest Plans",
      color: "#D50032",
      hoverColor: "#b00029",
      bgColor: "rgba(213, 0, 50, 0.03)",
      borderColor: "rgba(213, 0, 50, 0.12)",
      btnText: "Choose Plan",
      bullets: [
        <>EMI tenures available for <strong>6 Months</strong> and <strong>12 Months</strong>.</>,
        <><strong>6-Month Tenure:</strong> 100% <strong>No-Cost EMI</strong> (0% interest).</>,
        <><strong>12-Month Tenure:</strong> Competitive rate of <strong>15% Interest P.A.</strong></>,
      ],
    },
    {
      icon: ShieldCheck,
      title: "Eligibility & Cashbacks",
      tagline: "CIBIL Check & Credit Rewards",
      color: "#16a34a",
      hoverColor: "#15803d",
      bgColor: "rgba(22, 163, 74, 0.03)",
      borderColor: "rgba(22, 163, 74, 0.12)",
      btnText: "Check Eligibility",
      bullets: [
        <>EMI loans offered exclusively for customers with <strong>730 & above CIBIL</strong> score.</>,
        <>Get <strong>up to 5% Cashback</strong> instantly on your tuition payment.</>,
        <>Cashback is applicable on payments made with <strong>any Credit Card</strong>.</>,
      ],
    },
    {
      icon: Percent,
      title: "Special Gateway Discount",
      tagline: "Upcoming Gateway Offer",
      color: "#2563eb",
      hoverColor: "#1d4ed8",
      bgColor: "rgba(37, 99, 235, 0.03)",
      borderColor: "rgba(37, 99, 235, 0.12)",
      btnText: "Explore Discount",
      bullets: [
        <>Enjoy a flat <strong>5% Discount</strong> on the total course fee.</>,
        <>Discount launches <strong>after 3 months of installing our payment gateway</strong>.</>,
        <>Automatic early-bird reward directly at the checkout terminal.</>,
      ],
    },
  ];

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
            Flexible <span className="text-[#D50032]">EMI & Payment Plans</span>
          </h2>
          <p className="text-base sm:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Invest in your trading career with our convenient payment options and banking rewards
          </p>
        </div>

        {/* Premium Payment Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 items-stretch max-w-6xl mx-auto">
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
                      backgroundColor: "#D50032",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#b00029";
                      e.currentTarget.style.boxShadow = "0 8px 25px rgba(213, 0, 50, 0.25)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#D50032";
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

      </motion.div>
    </section>
  );
}
