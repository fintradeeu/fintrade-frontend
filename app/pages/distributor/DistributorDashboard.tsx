import { useState, useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Home, Users, BarChart3, Tag, Link as LinkIcon, Copy } from "lucide-react";
import api from "../../services/api";

const navItems = [
  { label: "Dashboard", path: "/distributor/dashboard", icon: <Home size={20} /> },
];

export default function DistributorDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);

  const fetchData = async () => {
    try {
      const statsRes = await api.get("/distributor/stats");
      setStats(statsRes.data);
      const refsRes = await api.get("/distributor/referrals");
      setReferrals(refsRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
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
    <DashboardLayout navItems={navItems} userRole="distributor" userName="Distributor">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0B2A5B] mb-2">Distributor Dashboard</h1>
        <p className="text-[#0B2A5B]/70">Track your referrals and performance metrics</p>
      </div>

      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4 bg-white shadow-lg border-l-4 border-blue-500">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="text-blue-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-[#0B2A5B]/60">Total Referrals</p>
              <p className="text-2xl font-bold text-[#0B2A5B]">{stats?.total_students_referred || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-white shadow-lg border-l-4 border-green-500">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <BarChart3 className="text-green-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-[#0B2A5B]/60">Total Enrollments</p>
              <p className="text-2xl font-bold text-[#0B2A5B]">{stats?.total_courses_purchased || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-white shadow-lg border-l-4 border-purple-500">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Tag className="text-purple-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-[#0B2A5B]/60">Revenue Generated</p>
              <p className="text-2xl font-bold text-[#0B2A5B]">₹{stats?.total_revenue_generated?.toLocaleString() || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-white shadow-lg border-l-4 border-orange-500">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 rounded-lg">
              <LinkIcon className="text-orange-600" size={20} />
            </div>
            <div className="flex-1">
              <p className="text-sm text-[#0B2A5B]/60">Your Referral Code</p>
              <div className="flex items-center justify-between">
                <p className="text-lg font-bold text-[#0B2A5B]">{stats?.referral_code || "---"}</p>
                <button onClick={handleCopy} className="text-gray-500 hover:text-black">
                  {copied ? <span className="text-xs text-green-600">Copied!</span> : <Copy size={16} />}
                </button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6 bg-white shadow-lg overflow-hidden">
        <h2 className="text-xl font-bold mb-4">Recent Referrals</h2>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#F4F1EA]">
                <TableHead className="text-[#0B2A5B]">Student Name</TableHead>
                <TableHead className="text-[#0B2A5B]">Student Email</TableHead>
                <TableHead className="text-[#0B2A5B]">Enrolled Course</TableHead>
                <TableHead className="text-[#0B2A5B]">Date Referred</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {referrals.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium text-[#0B2A5B]">{r.student_name}</TableCell>
                  <TableCell className="text-[#0B2A5B]/70">{r.student_email}</TableCell>
                  <TableCell className="text-[#0B2A5B]">{r.course_title || "Pending Enrollment"}</TableCell>
                  <TableCell className="text-[#0B2A5B]">{new Date(r.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {referrals.length === 0 && (
            <div className="py-8 text-center text-gray-500">
              You haven't referred any students yet. Share your referral code to get started!
            </div>
          )}
        </div>
      </Card>
    </DashboardLayout>
  );
}
