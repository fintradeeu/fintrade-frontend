import { useState, useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { Card } from "../../components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import api from "../../services/api";
import { Users, BookOpen, Award, BarChart3, Star, TrendingUp } from "lucide-react";

// Fallback/Sample data for charts since backend only provides totals
const revenueData = [
  { month: "Oct", revenue: 1200000 },
  { month: "Nov", revenue: 1450000 },
  { month: "Dec", revenue: 1680000 },
  { month: "Jan", revenue: 1820000 },
  { month: "Feb", revenue: 2100000 },
  { month: "Mar", revenue: 2450000 },
];

const examData = [
  { month: "Oct", passRate: 88 },
  { month: "Nov", passRate: 91 },
  { month: "Dec", passRate: 89 },
  { month: "Jan", passRate: 93 },
  { month: "Feb", passRate: 94 },
  { month: "Mar", passRate: 92 },
];

export default function AdminReports() {
  const [stats, setStats] = useState({
    total_students: 0,
    total_courses: 0,
    total_certificates: 0,
    total_simulator_accounts: 0,
    total_feedback: 0,
    avg_feedback_rating: 0,
    total_placements_eligible: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await api.get("/admin/reports");
        setStats(res.data);
      } catch (err) {
        console.error("Failed to load reports", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  return (
    <DashboardLayout role="admin">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0B2A5B] mb-2">Analytics & Reports</h1>
        <p className="text-[#0B2A5B]/70">Comprehensive platform performance metrics</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="p-6 bg-white shadow-lg border-l-4 border-l-[#0B2A5B]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#0B2A5B]/60 mb-1">Total Students</p>
              <p className="text-3xl font-bold text-[#0B2A5B]">{loading ? "..." : stats.total_students}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-full text-blue-600">
              <Users size={24} />
            </div>
          </div>
        </Card>
        
        <Card className="p-6 bg-white shadow-lg border-l-4 border-l-[#D50032]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#0B2A5B]/60 mb-1">Active Courses</p>
              <p className="text-3xl font-bold text-[#0B2A5B]">{loading ? "..." : stats.total_courses}</p>
            </div>
            <div className="p-3 bg-red-50 rounded-full text-red-600">
              <BookOpen size={24} />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white shadow-lg border-l-4 border-l-[#C2A86A]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#0B2A5B]/60 mb-1">Certificates Issued</p>
              <p className="text-3xl font-bold text-[#0B2A5B]">{loading ? "..." : stats.total_certificates}</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-full text-yellow-600">
              <Award size={24} />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white shadow-lg border-l-4 border-l-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#0B2A5B]/60 mb-1">Simulator Accs</p>
              <p className="text-3xl font-bold text-[#0B2A5B]">{loading ? "..." : stats.total_simulator_accounts}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-full text-green-600">
              <BarChart3 size={24} />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <Card className="p-6 bg-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#0B2A5B]/60 mb-1">Eligible for Placement</p>
              <p className="text-3xl font-bold text-[#0B2A5B]">{loading ? "..." : stats.total_placements_eligible}</p>
            </div>
            <div className="p-3 bg-indigo-50 rounded-full text-indigo-600">
              <TrendingUp size={24} />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#0B2A5B]/60 mb-1">Avg Course Rating</p>
              <p className="text-3xl font-bold text-[#0B2A5B]">{loading ? "..." : stats.avg_feedback_rating.toFixed(1)} / 5.0</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-full text-orange-600">
              <Star size={24} />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6 bg-white shadow-lg">
          <h3 className="text-xl font-semibold text-[#0B2A5B] mb-6">Revenue Trend (Sample)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#0B2A5B20" />
              <XAxis dataKey="month" stroke="#0B2A5B" />
              <YAxis stroke="#0B2A5B" />
              <Tooltip formatter={(value: number) => `₹${(value / 100000).toFixed(1)}L`} />
              <Line type="monotone" dataKey="revenue" stroke="#C2A86A" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6 bg-white shadow-lg">
          <h3 className="text-xl font-semibold text-[#0B2A5B] mb-6">Exam Pass Rate (Sample)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={examData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#0B2A5B20" />
              <XAxis dataKey="month" stroke="#0B2A5B" />
              <YAxis stroke="#0B2A5B" domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="passRate" fill="#0B2A5B" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </DashboardLayout>
  );
}
