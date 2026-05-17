import { BarChart3 } from "lucide-react";
import { Card } from "../ui/card";

const insightsPlaceholder = [
  { label: "Market Sentiment", value: "—", description: "Data coming soon" },
  { label: "Trading Volume", value: "—", description: "Data coming soon" },
  { label: "Top Sector", value: "—", description: "Data coming soon" },
  { label: "FII/DII Flow", value: "—", description: "Data coming soon" },
];

export default function KeyInsights() {
  return (
    <section className="py-20 bg-transparent relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-2 rounded-full mb-4 border border-[#E53935]/30" style={{ background: "rgba(229,57,53,0.08)" }}>
            <span className="text-[#E53935] font-semibold text-sm">🔍 Key Insights</span>
          </div>
          <h2 className="text-4xl font-bold mb-4" style={{ color: "#121212" }}>Key Market Insights</h2>
          <p className="text-xl text-gray-600">Real-time data and analytics (data will be integrated soon)</p>
        </div>
        <div 
          className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 overflow-x-auto md:overflow-x-visible pb-6 md:pb-0 snap-x snap-mandatory scrollbar-hide px-4 -mx-4 md:px-0 md:mx-0 items-stretch"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {insightsPlaceholder.map((insight, i) => (
            <div key={i} className="flex-shrink-0 w-[240px] sm:w-[300px] md:w-full md:flex-shrink snap-center flex">
              <Card
                className="w-full p-6 text-center border-2 border-dashed border-gray-200 hover:border-[#E53935]/30 transition-all flex flex-col items-center justify-center"
                style={{ background: "rgba(229,57,53,0.02)" }}
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-4" style={{ background: "rgba(229,57,53,0.1)" }}>
                  <BarChart3 className="h-7 w-7" style={{ color: "#E53935" }} />
                </div>
                <div className="text-3xl font-bold mb-2" style={{ color: "#121212" }}>{insight.value}</div>
                <div className="text-sm font-semibold mb-1" style={{ color: "#121212" }}>{insight.label}</div>
                <div className="text-xs text-gray-400">{insight.description}</div>
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
