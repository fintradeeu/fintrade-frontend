import { CreditCard, CheckCircle, IndianRupee } from "lucide-react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";

export default function EMIHighlight() {
  return (
    <section className="py-8 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card
          className="overflow-hidden border-2 border-[#D50032]/20 hover:border-[#D50032]/40 transition-all"
          style={{
            background: "linear-gradient(135deg, rgba(213,0,50,0.03) 0%, rgba(213,0,50,0.08) 50%, rgba(213,0,50,0.03) 100%)",
          }}
        >
          <div className="grid md:grid-cols-2 gap-0">
            {/* Left Content */}
            <div className="p-8 md:p-10 flex flex-col justify-center">
              <div className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-4 self-start" style={{ background: "#D50032", color: "white" }}>
                💰 EASY EMI
              </div>
              <h3 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: "#121212" }}>
                Learn Now, <span style={{ color: "#D50032" }}>Pay in Easy EMIs</span>
              </h3>
              <p className="text-gray-600 mb-6 text-lg">
                Don't let finances hold you back. Start your trading journey with affordable monthly installments.
              </p>
              <div className="space-y-3 mb-6">
                {[
                  "Course EMI options available for 6 months and 12 months tenures",
                  "6 Months is No Cost EMI & 12 Months is 15% Interest p.a.",
                  "EMI basis loans available exclusively for customers with CIBIL score of 730 and above",
                  "Up to 5% cashback on payments made with any credit card",
                  "Flat 5% discount on the course (applicable 3 months after installing payment gateway)",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" style={{ color: "#D50032" }} />
                    <span className="text-gray-700 font-medium text-sm md:text-base">{item}</span>
                  </div>
                ))}
              </div>
              <Button
                className="self-start shadow-lg hover:shadow-xl transition-all hover:scale-105 bg-gradient-to-r from-[#D50032] to-[#FF0000] text-white hover:from-[#FF0000] hover:to-[#FF0000] transition-all duration-300"
                style={{ boxShadow: "0 4px 20px rgba(213,0,50,0.4)" }}
              >
                <CreditCard className="mr-2 h-5 w-5" />
                Check EMI Options
              </Button>
            </div>

            {/* Right Visual */}
            <div className="hidden md:flex items-center justify-center p-10" style={{ background: "linear-gradient(135deg, #121212 0%, #1a1a1a 100%)" }}>
              <div className="text-center">
                <div className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ background: "rgba(213,0,50,0.2)", border: "3px solid #D50032" }}>
                  <CreditCard className="h-12 w-12 text-white" />
                </div>
                <div className="text-5xl font-extrabold text-white mb-2">6 & 12</div>
                <div className="text-gray-400 text-lg">Month EMI Tenures</div>
                <div className="mt-4 inline-block px-4 py-2 rounded-full text-sm font-medium" style={{ background: "rgba(213,0,50,0.2)", color: "#D50032" }}>
                  0% Interest (6 Months)
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
