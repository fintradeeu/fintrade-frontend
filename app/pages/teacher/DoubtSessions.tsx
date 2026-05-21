import DashboardLayout from "../../components/DashboardLayout";
import { Card } from "../../components/ui/card";
import { MessageCircle, Clock } from "lucide-react";

export default function DoubtSessions() {
  return (
    <DashboardLayout role="teacher">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0B2A5B] mb-2">Doubt Sessions</h1>
        <p className="text-[#0B2A5B]/70">Resolve student queries and schedule sessions</p>
      </div>

      <Card className="p-12 bg-white shadow-lg text-center mt-8 max-w-2xl mx-auto">
        <div className="w-20 h-20 bg-[#C2A86A]/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <MessageCircle className="text-[#C2A86A]" size={40} />
        </div>
        <h3 className="text-2xl font-bold text-[#0B2A5B] mb-3">Coming Soon</h3>
        <p className="text-[#0B2A5B]/60 mb-6 max-w-md mx-auto">
          The doubt sessions feature is being developed. Soon you'll be able to schedule and resolve student queries in real-time.
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-[#0B2A5B]/50">
          <Clock size={16} />
          <span>Expected launch: Next update</span>
        </div>
      </Card>
    </DashboardLayout>
  );
}
