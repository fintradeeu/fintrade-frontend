import { Link } from "react-router";
import { Button } from "../components/ui/button";
import { Lock, ArrowLeft } from "lucide-react";

export default function LockedPage({ title }: { title: string }) {
  return (
    <div className="flex-1 relative flex items-center justify-center p-4 overflow-hidden min-h-[80vh]">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-[#D50032]/5 to-[#0B2A5B]/5 rounded-full blur-3xl" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#D50032]/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-md w-full text-center relative z-10 space-y-6 bg-white/60 backdrop-blur-xl p-8 rounded-3xl border border-white shadow-[0_8px_40px_rgba(0,0,0,0.04)]">
        <div className="relative inline-flex items-center justify-center">
          <div className="absolute inset-0 bg-[#D50032]/20 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
          <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#121212] to-[#2a2a2a] text-white shadow-xl">
            <Lock size={28} className="text-white/90" />
          </div>
        </div>
        
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#121212] mb-2">{title}</h1>
          <p className="text-gray-500 text-base leading-relaxed font-medium">
            We're building something extraordinary here. This feature is currently in development and will be available soon.
          </p>
        </div>

        <div className="pt-2">
          <Link to="/">
            <Button className="w-full h-12 text-base font-bold rounded-xl bg-gradient-to-r from-[#D50032] to-[#FF0000] text-white hover:from-[#B30029] hover:to-[#D50032] shadow-[0_8px_20px_rgba(213,0,50,0.2)] hover:shadow-[0_8px_25px_rgba(213,0,50,0.3)] transition-all duration-300 flex items-center justify-center gap-2">
              <ArrowLeft size={18} /> Return to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
