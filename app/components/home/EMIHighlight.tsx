import { Check } from "lucide-react";

export default function EMIHighlight() {
  const plans = [
    {
      title: "3 Month EMI",
      price: "₹4,999",
      total: "TOTAL ₹14,997 + GST",
      bullets: [
        "Split into 3 easy installments",
        "No processing fee",
        "Instant approval",
      ],
      isRecommended: false,
      badge: null,
    },
    {
      title: "6 Month EMI",
      price: "₹2,999",
      total: "TOTAL ₹17,994 + GST",
      bullets: [
        "Split into 6 easy installments",
        "0% interest for 6 months",
        "No processing fee",
        "Instant approval",
      ],
      isRecommended: true,
      badge: "0% INTEREST",
    },
    {
      title: "12 Month EMI",
      price: "₹1,599",
      total: "TOTAL ₹19,188 + GST",
      bullets: [
        "Lowest monthly payment",
        "Flexible tenure",
        "CIBIL 730+ required",
      ],
      isRecommended: false,
      badge: "LOWEST EMI",
    },
  ];

  return (
    <section className="py-12 md:py-20 relative z-10 bg-transparent overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[#D50032]/3 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full mb-3 border border-[#D50032]/25 bg-[#D50032]/5">
            <span className="text-[#D50032] font-extrabold text-xs tracking-wider uppercase flex items-center gap-1">
              💳 Easy Payments
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black mb-3 text-gray-900 tracking-tight">
            Flexible <span className="text-[#D50032]">EMI & Payment Plans</span>
          </h2>
          <p className="text-base sm:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Invest in your trading career with our convenient payment options
          </p>
        </div>

        {/* Plans Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 items-stretch max-w-6xl mx-auto">
          {plans.map((plan, idx) => {
            return (
              <div
                key={idx}
                className={`relative rounded-[32px] p-8 bg-white flex flex-col justify-between transition-all duration-350 select-none ${
                  plan.isRecommended
                    ? "border-2 border-[#D50032] shadow-[0_20px_50px_rgba(213,0,50,0.06)] md:-translate-y-2 scale-[1.01]"
                    : "border border-gray-150 shadow-[0_12px_40px_rgba(0,0,0,0.015)] hover:border-gray-300"
                }`}
              >
                {/* Top Badge Overlay */}
                {plan.badge && (
                  <div
                    className={`absolute -top-3.5 left-1/2 -translate-x-1/2 px-5 py-1 rounded-full text-[10px] font-black tracking-widest uppercase shadow-sm z-20 ${
                      plan.isRecommended
                        ? "bg-[#D50032] text-white"
                        : "bg-gray-950 text-white"
                    }`}
                  >
                    {plan.badge}
                  </div>
                )}

                <div>
                  {/* Recommended Title Label */}
                  {plan.isRecommended && (
                    <div className="text-[#D50032] font-black text-xs uppercase tracking-wider mb-2 flex items-center gap-1">
                      ★ RECOMMENDED
                    </div>
                  )}

                  {/* Plan Duration Title */}
                  <h3 className="text-sm font-extrabold text-gray-400 uppercase tracking-widest leading-none mb-6">
                    {plan.title}
                  </h3>

                  {/* Price */}
                  <div className="flex items-baseline gap-1.5 mb-2.5">
                    <span className="text-4xl md:text-5xl font-black text-[#D50032] tracking-tighter leading-none">
                      {plan.price}
                    </span>
                    <span className="text-gray-500 font-semibold text-sm leading-none">
                      /month
                    </span>
                  </div>

                  {/* Total Label */}
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-8 border-b border-gray-100 pb-6">
                    {plan.total}
                  </div>

                  {/* Bullets List */}
                  <div className="space-y-4 mb-8">
                    {plan.bullets.map((bullet, bIdx) => (
                      <div key={bIdx} className="flex items-center gap-3 text-left">
                        <div className="w-5 h-5 rounded-full bg-[#ECFDF5] border border-emerald-100 flex items-center justify-center flex-shrink-0">
                          <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                        </div>
                        <span className="text-gray-700 text-sm font-medium leading-tight">
                          {bullet}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Choose Plan Action Button */}
                <div className="w-full mt-auto">
                  {plan.isRecommended ? (
                    <button
                      className="w-full py-4 rounded-2xl bg-[#D50032] hover:bg-[#b00029] text-white font-extrabold text-sm hover:shadow-[0_8px_25px_rgba(213,0,50,0.35)] transition-all duration-300 transform active:scale-98 cursor-pointer flex items-center justify-center gap-1"
                    >
                      CHOOSE PLAN
                    </button>
                  ) : (
                    <button
                      className="w-full py-4 rounded-2xl border border-[#D50032] text-[#D50032] font-extrabold text-sm bg-white hover:bg-[#D50032]/5 transition-all duration-300 transform active:scale-98 cursor-pointer flex items-center justify-center border-solid"
                    >
                      CHOOSE PLAN
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
