import { useState, useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Home, Users, BarChart3, Tag, Link as LinkIcon, Copy, Sparkles, Award } from "lucide-react";
import api from "../../services/api";

const navItems = [
  { label: "Dashboard", path: "/distributor/dashboard", icon: <Home size={20} /> },
];

export default function DistributorDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);
  const [userName, setUserName] = useState("Introducing Broker");

  const fetchData = async () => {
    try {
      const statsRes = await api.get("/distributor/stats");
      setStats(statsRes.data);
      const refsRes = await api.get("/distributor/referrals");
      setReferrals(refsRes.data);
    } catch (err) {
      console.error("Failed to fetch IB dashboard data:", err);
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUserName(parsed.full_name || "Introducing Broker (IB)");
      } catch (e) {
        console.error("Failed to parse user profile:", e);
      }
    }
    fetchData();
  }, []);

  const handleCopy = () => {
    if (stats?.referral_code) {
      navigator.clipboard.writeText(stats.referral_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <DashboardLayout navItems={navItems} role="distributor">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0B2A5B] mb-2 flex items-center gap-2">
          Welcome back, {userName}! <Sparkles className="text-[#C2A86A]" size={28} />
        </h1>
        <p className="text-[#0B2A5B]/70">Track your referral network, monitor enrollments, and check your performance metrics in real-time.</p>
      </div>

      <div className="grid md:grid-cols-4 gap-6 mb-8">
        {/* Total Referrals Card */}
        <Card className="p-6 bg-white shadow-lg border-l-4 border-blue-500 rounded-xl hover:shadow-xl transition-all hover:scale-[1.01]">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-xl">
              <Users className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-[#0B2A5B]/60">Total Referrals</p>
              <p className="text-3xl font-bold text-[#0B2A5B] mt-1">{stats?.total_students_referred || 0}</p>
            </div>
          </div>
        </Card>

        {/* Total Enrollments Card */}
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

        {/* Revenue Generated Card */}
        <Card className="p-6 bg-white shadow-lg border-l-4 border-purple-500 rounded-xl hover:shadow-xl transition-all hover:scale-[1.01]">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-50 rounded-xl">
              <Tag className="text-purple-600" size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-[#0B2A5B]/60">Revenue Generated</p>
              <p className="text-3xl font-bold text-[#0B2A5B] mt-1">
                ₹{stats?.total_revenue_generated?.toLocaleString() || 0}
              </p>
            </div>
          </div>
        </Card>

        {/* Referral Code Card */}
        <Card className="p-6 bg-white shadow-lg border-l-4 border-[#C2A86A] rounded-xl hover:shadow-xl transition-all hover:scale-[1.01]">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-50 rounded-xl">
              <LinkIcon className="text-[#C2A86A]" size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#0B2A5B]/60">IB Referral Code</p>
              <div className="flex items-center justify-between mt-1 gap-2">
                <span className="text-2xl font-bold text-[#0B2A5B] tracking-wider truncate">
                  {stats?.referral_code || "---"}
                </span>
                <button
                  onClick={handleCopy}
                  className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-black transition-colors"
                  title="Copy Code"
                >
                  {copied ? <span className="text-xs font-bold text-green-600">Copied!</span> : <Copy size={18} />}
                </button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 mb-8">
        {/* Recent Referrals Table */}
        <Card className="lg:col-span-2 p-6 bg-white shadow-lg rounded-xl overflow-hidden">
          <h2 className="text-xl font-bold text-[#0B2A5B] mb-4">Recent Referrals</h2>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#F4F1EA] hover:bg-[#F4F1EA]">
                  <TableHead className="text-[#0B2A5B] font-semibold">Student Name</TableHead>
                  <TableHead className="text-[#0B2A5B] font-semibold">Student Email</TableHead>
                  <TableHead className="text-[#0B2A5B] font-semibold">Enrolled Course</TableHead>
                  <TableHead className="text-[#0B2A5B] font-semibold">Date Referred</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {referrals.map((r) => (
                  <TableRow key={r.id} className="hover:bg-gray-50">
                    <TableCell className="font-semibold text-[#0B2A5B]">{r.student_name}</TableCell>
                    <TableCell className="text-[#0B2A5B]/70">{r.student_email}</TableCell>
                    <TableCell className="text-[#0B2A5B]">{r.course_title || "Pending Enrollment"}</TableCell>
                    <TableCell className="text-[#0B2A5B]">{new Date(r.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {referrals.length === 0 && (
              <div className="py-12 text-center text-gray-500 font-medium">
                You haven't referred any students yet. Share your referral code to get started!
              </div>
            )}
          </div>
        </Card>

        {/* Benefits/IB Info Card */}
        <Card className="p-6 bg-gradient-to-br from-[#0B2A5B] to-[#123E7E] text-white shadow-xl rounded-xl flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-6">
              <Award className="text-[#C2A86A]" size={28} />
            </div>
            <h3 className="text-xl font-bold mb-3">Introducing Broker Program</h3>
            <p className="text-white/80 text-sm leading-relaxed mb-6">
              Invite students to join FinTrade LMS using your unique referral code.
              They receive an immediate <span className="font-semibold text-[#C2A86A]">{stats?.discount_percentage || 10}% discount</span> on any course enrollment, and you generate commissions directly linked to their educational journey.
            </p>
          </div>
          <div className="border-t border-white/15 pt-4 text-xs text-white/60">
            For support or program updates, contact the FinTrade Partnerships Team.
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
