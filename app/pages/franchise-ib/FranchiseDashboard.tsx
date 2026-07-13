import { useState, useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Users, BarChart3, Tag, Link as LinkIcon, Copy, Sparkles, Award } from "lucide-react";
import api from "../../services/api";

export default function FranchiseDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [userName, setUserName] = useState("Franchise IB");

  const studentPortalOrigin = import.meta.env.VITE_STUDENT_APP_URL || (
    window.location.hostname.toLowerCase().includes("affiliate.")
      ? "https://www.thefintrade.com"
      : window.location.origin
  );
  
  const ibReferralLink = stats?.referral_code
    ? `${studentPortalOrigin}/register?ref=${encodeURIComponent(stats.referral_code)}&type=ib`
    : "";

  const studentReferralLink = stats?.referral_code
    ? `${studentPortalOrigin}/register?ref=${encodeURIComponent(stats.referral_code)}`
    : "";

  const fetchData = async () => {
    try {
      const statsRes = await api.get("/franchise-ibs/dashboard");
      setStats(statsRes.data);
    } catch (err) {
      console.error("Failed to fetch Franchise IB dashboard data:", err);
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUserName(parsed.full_name || "Franchise IB");
      } catch (e) {
        console.error("Failed to parse user profile:", e);
      }
    }
    fetchData();
  }, []);

  const handleCopyCode = () => {
    if (stats?.referral_code) {
      navigator.clipboard.writeText(stats.referral_code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleCopyLink = (link: string, setter: any) => {
    if (link) {
      navigator.clipboard.writeText(link);
      setter(true);
      setTimeout(() => setter(false), 2000);
    }
  };

  return (
    <DashboardLayout role="franchise_ib">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0B2A5B] mb-2 flex items-center gap-2">
          Welcome back, {userName}! <Sparkles className="text-[#C2A86A]" size={28} />
        </h1>
        <p className="text-[#0B2A5B]/70">Track your Franchise network, monitor sub-IBs, student enrollments, and check your performance metrics in real-time.</p>
      </div>

      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6 bg-white shadow-lg border-l-4 border-blue-500 rounded-xl hover:shadow-xl transition-all hover:scale-[1.01]">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-xl">
              <Users className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-[#0B2A5B]/60">Total Sub-IBs</p>
              <p className="text-3xl font-bold text-[#0B2A5B] mt-1">{stats?.total_ibs_under || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white shadow-lg border-l-4 border-orange-500 rounded-xl hover:shadow-xl transition-all hover:scale-[1.01]">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-50 rounded-xl">
              <Users className="text-orange-600" size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-[#0B2A5B]/60">Total Students</p>
              <p className="text-3xl font-bold text-[#0B2A5B] mt-1">{stats?.total_students_under || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white shadow-lg border-l-4 border-green-500 rounded-xl hover:shadow-xl transition-all hover:scale-[1.01]">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-50 rounded-xl">
              <BarChart3 className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-[#0B2A5B]/60">Total Enrollments</p>
              <p className="text-3xl font-bold text-[#0B2A5B] mt-1">{stats?.total_courses_purchased || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white shadow-lg border-l-4 border-purple-500 rounded-xl hover:shadow-xl transition-all hover:scale-[1.01]">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-50 rounded-xl">
              <Tag className="text-purple-600" size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-[#0B2A5B]/60">Total Revenue</p>
              <p className="text-3xl font-bold text-[#0B2A5B] mt-1">
                ₹{stats?.total_revenue?.toLocaleString() || 0}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        <Card className="p-6 bg-white shadow-lg border-l-4 border-[#C2A86A] rounded-xl hover:shadow-xl transition-all hover:scale-[1.01]">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-50 rounded-xl">
              <LinkIcon className="text-[#C2A86A]" size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#0B2A5B]/60">Your Master Referral Code</p>
              <div className="flex flex-col gap-2 mt-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xl font-bold text-[#0B2A5B] tracking-wider truncate">
                    {stats?.referral_code || "---"}
                  </span>
                  <button
                    onClick={handleCopyCode}
                    className="p-1.5 hover:bg-gray-100 rounded-lg text-[#0B2A5B]/60 hover:text-black transition-colors flex items-center gap-1"
                    title="Copy Code"
                  >
                    {copiedCode ? <span className="text-xs font-bold text-green-600">Copied!</span> : <Copy size={16} />}
                  </button>
                </div>
                {stats?.referral_code && (
                  <>
                    <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-gray-100">
                      <span className="text-xs text-blue-600 truncate max-w-[220px]" title={ibReferralLink}>
                        IB Invite: {ibReferralLink}
                      </span>
                      <button
                        onClick={() => handleCopyLink(ibReferralLink, setCopiedLink)}
                        className="p-1 hover:bg-gray-100 rounded text-blue-600 hover:text-blue-800 transition-colors flex items-center"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-gray-100">
                      <span className="text-xs text-blue-600 truncate max-w-[220px]" title={studentReferralLink}>
                        Student Invite: {studentReferralLink}
                      </span>
                      <button
                        onClick={() => handleCopyLink(studentReferralLink, setCopiedCode)}
                        className="p-1 hover:bg-gray-100 rounded text-blue-600 hover:text-blue-800 transition-colors flex items-center"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-[#0B2A5B] to-[#123E7E] text-white shadow-xl rounded-xl flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-6">
              <Award className="text-[#C2A86A]" size={28} />
            </div>
            <h3 className="text-xl font-bold mb-3">Franchise IB Program</h3>
            <p className="text-white/80 text-sm leading-relaxed mb-6">
              As a Franchise IB, you can recruit new Introducing Brokers (IBs) under your network. 
              You earn commissions not just from your direct student enrollments, but also from all students enrolled through your sub-IBs.
            </p>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
