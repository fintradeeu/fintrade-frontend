import { useEffect, useState } from "react";
import { Shield, Info, CheckCircle, Tag, Eye } from "lucide-react";
import { motion } from "motion/react";
import api from "../services/api";
import { Button } from "../components/ui/button";

function ScrollReveal({
  children,
  className = "",
  delay = 0,
  duration = 1.2
}: {
  children: any;
  className?: string;
  delay?: number;
  duration?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration, ease: [0.16, 1, 0.3, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function CookiePolicy() {
  const [loading, setLoading] = useState(false);
  const [accepted, setAccepted] = useState(false);

  // Automatically log policy page view on mount
  useEffect(() => {
    (async () => {
      try {
        await api.post("/auth/cookie-consent", { consent_type: "viewed" });
      } catch (err) {
        console.warn("Logging page view to backend failed:", err);
      }
    })();

    const storedConsent = localStorage.getItem("cookie_consent");
    if (storedConsent === "accepted") {
      setAccepted(true);
    }
  }, []);

  const handleAccept = async () => {
    setLoading(true);
    try {
      localStorage.setItem("cookie_consent", "accepted");
      await api.post("/auth/cookie-consent", { consent_type: "accepted" });
      setAccepted(true);
    } catch (err) {
      console.error("Accepting cookies failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-16 relative z-10 bg-transparent overflow-hidden font-sans" style={{ background: "radial-gradient(circle at 50% 50%, #FFFFFF 0%, #F8F8F8 50%, #F4F4F4 100%)" }}>
      {/* Background blur decorative element */}
      <div className="absolute top-1/3 left-1/4 -translate-x-1/2 w-[400px] h-[400px] bg-[#D50032]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-1.5 px-4.5 py-1.5 rounded-full mb-3 border border-[#D50032]/25 bg-[#D50032]/5">
              <span className="text-[#D50032] font-extrabold text-xs tracking-wider uppercase">🍪 COMPLIANCE</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black mb-3 text-gray-900 tracking-tight">
              Cookie <span className="text-[#D50032]">Policy</span>
            </h1>
            <p className="text-sm text-gray-500 font-medium">
              Effective Date: June 16, 2026 • Last updated: June 29, 2026
            </p>
          </div>
        </ScrollReveal>

        {/* Introduction Panel */}
        <ScrollReveal delay={0.1}>
          <div className="bg-white border border-[#0B2A5B]/10 rounded-3xl p-6 md:p-8 shadow-sm mb-8">
            <h2 className="text-xl font-bold text-[#0B2A5B] flex items-center gap-2 mb-4">
              <Shield className="text-[#D50032] shrink-0" size={24} />
              About Our Use of Cookies
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed mb-4">
              At <strong>FT EDUTECH</strong> (operating as <strong>FinTrade</strong>), we value your privacy and transparency. This Cookie Policy explains how cookies, tracking pixels, and local storage technologies are utilized to optimize features on our platform, personalize education, and coordinate analysis.
            </p>
            <p className="text-slate-600 text-sm leading-relaxed mb-6">
              You can opt-in to accept all cookies or configure your preferences. Opting out of optional cookies may impact some page functionalities.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 border-t border-slate-100 pt-6">
              <div className="flex-grow">
                <p className="text-sm font-extrabold text-[#0B2A5B]">Your Cookie Status:</p>
                <p className="text-xs text-slate-500 mt-1">
                  {accepted 
                    ? "✓ You have accepted cookies on this browser. Your preferences have been saved."
                    : "You have not accepted cookies. Choose options below."}
                </p>
              </div>
              {!accepted ? (
                <Button 
                  onClick={handleAccept} 
                  disabled={loading}
                  className="w-full sm:w-auto bg-[#D50032] hover:bg-[#b00029] text-white font-extrabold px-6 py-2.5 h-auto text-sm rounded-xl shadow-lg shadow-[#D50032]/10 transition-transform active:scale-95 border-0 cursor-pointer"
                >
                  {loading ? "Saving..." : "Accept All Cookies"}
                </Button>
              ) : (
                <div className="flex items-center gap-1.5 text-green-600 font-extrabold text-sm bg-green-50 px-4 py-2 rounded-xl border border-green-200">
                  <CheckCircle size={16} /> Accepted
                </div>
              )}
            </div>
          </div>
        </ScrollReveal>

        {/* Detailed Breakdown */}
        <ScrollReveal delay={0.2}>
          <div className="space-y-6">
            {/* Required Cookies */}
            <div className="bg-white/60 border border-slate-150 rounded-2xl p-6 shadow-sm">
              <h3 className="font-extrabold text-md text-[#0B2A5B] flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                1. Strictly Necessary Cookies
              </h3>
              <p className="text-slate-500 text-xs leading-relaxed">
                These cookies are crucial for the basic operation of the platform. They store login details, keep student dashboard layouts responsive, check exam proctoring state, and enable seamless routing. Because they are vital for system integrity, they cannot be turned off.
              </p>
            </div>

            {/* Performance Cookies */}
            <div className="bg-white/60 border border-slate-150 rounded-2xl p-6 shadow-sm">
              <h3 className="font-extrabold text-md text-[#0B2A5B] flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                2. Analytics & Performance Cookies
              </h3>
              <p className="text-slate-500 text-xs leading-relaxed">
                We track general analytics metrics such as page count, navigation speed, loading delays, and clicked links. This aggregate info helps us identify courses that are most popular, resolve formatting errors, and optimize the entrance exam interface dynamically.
              </p>
            </div>

            {/* Marketing Cookies */}
            <div className="bg-white/60 border border-slate-150 rounded-2xl p-6 shadow-sm">
              <h3 className="font-extrabold text-md text-[#0B2A5B] flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D50032]" />
                3. Advertising & Marketing Tracking
              </h3>
              <p className="text-slate-500 text-xs leading-relaxed">
                These cookies record distributor referral codes (like your IB code) to attributes sales correctly, process promotional discount coupon usage, and display targeted announcements. They ensure our affiliate marketing programs credit partners accurately.
              </p>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
