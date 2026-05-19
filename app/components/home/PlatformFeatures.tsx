import { Rocket, Headphones, BarChart3, Shield, Zap, Gift } from "lucide-react";
import { Card } from "../ui/card";

const features = [
  { icon: Rocket, title: "Live Market Sessions", desc: "Trade alongside mentors during live market hours with real-time guidance" },
  { icon: Headphones, title: "24/7 Doubt Support", desc: "Get answers to your trading questions anytime via AI tutor and mentor chat" },
  { icon: BarChart3, title: "Real-Time Analytics", desc: "Track your performance with detailed analytics and progress dashboards" },
  { icon: Shield, title: "Risk-Free Practice", desc: "Master strategies on our simulator with ₹10 Lakh virtual capital before going live" },
  { icon: Zap, title: "Weekly Assignments", desc: "Hands-on practice with market-based assignments reviewed by experts" },
  { icon: Gift, title: "Exclusive Community", desc: "Join a private community of 1200+ traders for networking and shared insights" },
];

export default function PlatformFeatures() {
  return (
    <section className="py-20 bg-white relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-2 rounded-full mb-4 border border-[#D50032]/30" style={{ background: "rgba(213,0,50,0.08)" }}>
            <span className="text-[#D50032] font-semibold text-sm">🎯 Platform Highlights</span>
          </div>
          <h2 className="text-4xl font-bold mb-4" style={{ color: "#121212" }}>What You'll Get</h2>
          <p className="text-xl text-gray-600">Everything included in your FinTrade journey</p>
        </div>
        <div 
          className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-x-auto md:overflow-x-visible pb-6 md:pb-0 snap-x snap-mandatory scrollbar-hide px-4 -mx-4 md:px-0 md:mx-0 items-stretch"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {features.map((f, i) => (
            <div key={i} className="flex-shrink-0 w-[280px] sm:w-[340px] md:w-full md:flex-shrink snap-center flex">
              <Card className="w-full p-6 border-2 border-gray-100 hover:border-[#D50032] transition-all hover:shadow-xl group">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform" style={{ background: "rgba(213,0,50,0.1)" }}>
                    <f.icon className="h-7 w-7" style={{ color: "#D50032" }} />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-2" style={{ color: "#121212" }}>{f.title}</h4>
                    <p className="text-gray-600 text-sm">{f.desc}</p>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </section>
  );
}
