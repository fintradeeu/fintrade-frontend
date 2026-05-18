import { CreditCard, CheckCircle, IndianRupee } from "lucide-react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";

export default function EMIHighlight() {
  return (
    <section className="py-8 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card
          className="overflow-hidden border-2 border-[#E53935]/20 hover:border-[#E53935]/40 transition-all"
          style={{
            background: "linear-gradient(135deg, rgba(229,57,53,0.03) 0%, rgba(229,57,53,0.08) 50%, rgba(229,57,53,0.03) 100%)",
          }}
        >
          <div className="grid md:grid-cols-2 gap-0">
            {/* Left Content */}
            <div className="p-8 md:p-10 flex flex-col justify-center">
              <div className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-4 self-start" style={{ background: "#E53935", color: "white" }}>
                💰 EASY EMI
              </div>
              <h3 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: "#121212" }}>
                Learn Now, <span style={{ color: "#E53935" }}>Pay in Easy EMIs</span>
              </h3>
              <p className="text-gray-600 mb-6 text-lg">
                Don't let finances hold you back. Start your trading journey with affordable monthly installments.
              </p>
              <div className="space-y-3 mb-6">
                {[
                  "EMIs starting at ₹2,999/month",
                  "0% interest for select courses",
                  "No hidden charges or processing fees",
                  "Flexible tenure: 3, 6, or 9 months",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 flex-shrink-0" style={{ color: "#E53935" }} />
                    <span className="text-gray-700 font-medium">{item}</span>
                  </div>
                ))}
              </div>
              <Button
                className="self-start shadow-lg hover:shadow-xl transition-all hover:scale-105 bg-gradient-to-r from-[#E53935] to-[#b71c1c] text-white hover:from-[#b71c1c] hover:to-[#b71c1c] transition-all duration-300"
                style={{ boxShadow: "0 4px 20px rgba(229,57,53,0.4)" }}
              >
                <CreditCard className="mr-2 h-5 w-5" />
                Check EMI Options
              </Button>
            </div>

            {/* Right Visual */}
            <div className="hidden md:flex items-center justify-center p-10" style={{ background: "linear-gradient(135deg, #121212 0%, #1a1a1a 100%)" }}>
              <div className="text-center">
                <div className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ background: "rgba(229,57,53,0.2)", border: "3px solid #E53935" }}>
                  <IndianRupee className="h-12 w-12 text-white" />
                </div>
                <div className="text-5xl font-extrabold text-white mb-2">₹2,999</div>
                <div className="text-gray-400 text-lg">/month onwards</div>
                <div className="mt-4 inline-block px-4 py-2 rounded-full text-sm font-medium" style={{ background: "rgba(229,57,53,0.2)", color: "#E53935" }}>
                  0% Interest Available
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
