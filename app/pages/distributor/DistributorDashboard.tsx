import { useState, useEffect, useMemo } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Home, Users, BarChart3, Tag, Link as LinkIcon, Copy, Sparkles, Award } from "lucide-react";
import api from "../../services/api";
import RegisterStudentModal from "../../components/RegisterStudentModal";

const navItems = [
  { label: "Dashboard", path: "/distributor/dashboard", icon: <Home size={20} /> },
  { label: "Wallet", path: "/distributor/wallet", icon: <Tag size={20} /> },
];

export default function DistributorDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const studentPortalOrigin = import.meta.env.VITE_STUDENT_APP_URL || (
    window.location.hostname.toLowerCase().includes("affiliate.")
      ? "https://www.thefintrade.com"
      : window.location.origin
  );
  const studentReferralLink = stats?.referral_code
    ? `${studentPortalOrigin}/register?ref=${encodeURIComponent(stats.referral_code)}`
    : "";
  const [userName, setUserName] = useState("Introducing Broker");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "enrolled">("all");
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

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

  const handleCopyCode = () => {
    if (stats?.referral_code) {
      navigator.clipboard.writeText(stats.referral_code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleCopyLink = () => {
    if (studentReferralLink) {
      navigator.clipboard.writeText(studentReferralLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const filteredReferrals = useMemo(() => {
    const start = fromDate ? new Date(`${fromDate}T00:00:00`) : null;
    const end = toDate ? new Date(`${toDate}T23:59:59`) : null;

    return referrals.filter((referral) => {
      const referralDate = new Date(referral.created_at);
      const isEnrolled = Boolean(referral.enrolled || referral.course_id || referral.course_title);

      if (start && referralDate < start) return false;
      if (end && referralDate > end) return false;
      if (statusFilter === "pending" && isEnrolled) return false;
      if (statusFilter === "enrolled" && !isEnrolled) return false;

      return true;
    });
  }, [referrals, fromDate, toDate, statusFilter]);

  const clearFilters = () => {
    setFromDate("");
    setToDate("");
    setStatusFilter("all");
  };

  return (
    <DashboardLayout navItems={navItems} role="distributor">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#0B2A5B] mb-2 flex items-center gap-2">
            Welcome back, {userName}! <Sparkles className="text-[#C2A86A]" size={28} />
          </h1>
          <p className="text-[#0B2A5B]/70">Track your referral network, monitor enrollments, and check your performance metrics in real-time.</p>
        </div>
        <Button onClick={() => setIsRegisterModalOpen(true)} className="bg-[#0B2A5B] text-white hover:bg-[#123E7E]">
          Register Student
        </Button>
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
              <p className="text-sm font-medium text-[#0B2A5B]/60">Student Registration Referral</p>
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
                  <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-gray-100">
                    <span className="text-xs text-blue-600 truncate max-w-[180px]" title={studentReferralLink}>
                      {studentReferralLink}
                    </span>
                    <button
                      onClick={handleCopyLink}
                      className="p-1 hover:bg-gray-100 rounded text-blue-600 hover:text-blue-800 transition-colors flex items-center"
                      title="Copy student registration link"
                    >
                      {copiedLink ? <span className="text-[10px] font-bold text-green-600">Copied!</span> : <LinkIcon size={14} />}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 mb-8">
        {/* Recent Referrals Table */}
        <Card className="lg:col-span-2 p-6 bg-white shadow-lg rounded-xl overflow-hidden">
          <div className="flex flex-col gap-4 mb-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-bold text-[#0B2A5B]">Recent Referrals</h2>
              <span className="text-sm font-semibold text-[#0B2A5B]/60">
                {filteredReferrals.length} of {referrals.length}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3">
              <div>
                <label className="text-xs font-semibold text-[#0B2A5B]/70">From Date</label>
                <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="mt-1 bg-[#F4F1EA]" />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#0B2A5B]/70">To Date</label>
                <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="mt-1 bg-[#F4F1EA]" />
              </div>
              <div className="flex items-end gap-2">
                <Button type="button" variant={statusFilter === "pending" ? "default" : "outline"} onClick={() => setStatusFilter(statusFilter === "pending" ? "all" : "pending")} className={statusFilter === "pending" ? "bg-orange-600 text-white hover:bg-orange-700" : "bg-white text-[#0B2A5B]"}>
                  Pending
                </Button>
                <Button type="button" variant={statusFilter === "enrolled" ? "default" : "outline"} onClick={() => setStatusFilter(statusFilter === "enrolled" ? "all" : "enrolled")} className={statusFilter === "enrolled" ? "bg-green-700 text-white hover:bg-green-800" : "bg-white text-[#0B2A5B]"}>
                  Enrolled
                </Button>
                <Button type="button" variant="outline" onClick={clearFilters} className="bg-white text-[#0B2A5B]">
                  Clear
                </Button>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#F4F1EA] hover:bg-[#F4F1EA]">
                  <TableHead className="text-[#0B2A5B] font-semibold">Student Name</TableHead>
                  <TableHead className="text-[#0B2A5B] font-semibold">Student Email</TableHead>
                  <TableHead className="text-[#0B2A5B] font-semibold">Course</TableHead>
                  <TableHead className="text-[#0B2A5B] font-semibold">Status</TableHead>
                  <TableHead className="text-[#0B2A5B] font-semibold">Journey</TableHead>
                  <TableHead className="text-[#0B2A5B] font-semibold">Date Referred</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReferrals.map((r) => {
                  const isEnrolled = Boolean(r.enrolled || r.course_id || r.course_title);
                  return (
                  <TableRow key={r.id} className="hover:bg-gray-50">
                    <TableCell className="font-semibold text-[#0B2A5B]">{r.student_name}</TableCell>
                    <TableCell className="text-[#0B2A5B]/70">{r.student_email}</TableCell>
                    <TableCell className="text-[#0B2A5B]">
                      {r.enrolled_courses?.length ? r.enrolled_courses.join(", ") : r.course_title || "Pending Enrollment"}
                    </TableCell>
                    <TableCell>
                      <Badge className={isEnrolled ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}>
                        {isEnrolled ? "Enrolled" : "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1.5 min-w-[260px]">
                        <Badge className={r.registered ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}>Registration</Badge>
                        <Badge
                          title={r.entrance_exam_course_title ? `${r.entrance_exam_course_title} - ${r.entrance_exam_score ?? 0}%` : undefined}
                          className={r.entrance_exam_given ? (r.entrance_exam_passed ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700") : "bg-gray-100 text-gray-600"}
                        >
                          Entrance Exam
                        </Badge>
                        <Badge className={r.kyc_done ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}>KYC</Badge>
                        <Badge className={r.fees_paid ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}>Fees Paid</Badge>
                        <Badge className={r.course_completed ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}>Completed</Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-[#0B2A5B]">{new Date(r.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            {referrals.length === 0 && (
              <div className="py-12 text-center text-gray-500 font-medium">
                You haven't referred any students yet. Share your referral code to get started!
              </div>
            )}
            {referrals.length > 0 && filteredReferrals.length === 0 && (
              <div className="py-12 text-center text-gray-500 font-medium">
                No referrals match the selected filters.
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

      {isRegisterModalOpen && (
        <RegisterStudentModal
          onClose={() => setIsRegisterModalOpen(false)}
          onSuccess={() => {
            setIsRegisterModalOpen(false);
            fetchData();
          }}
          apiPrefix="/distributor"
        />
      )}
    </DashboardLayout>
  );
}
