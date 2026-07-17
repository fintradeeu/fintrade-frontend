import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import DashboardLayout from "../../components/DashboardLayout";
import { Card } from "../../components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import api from "../../services/api";
import { Users, BookOpen, Award, BarChart3, Star, TrendingUp } from "lucide-react";

// Real-time data now fetched from backend

export default function AdminReports() {
  const navigate = useNavigate();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [checkingRole, setCheckingRole] = useState(true);
  const [stats, setStats] = useState({
    total_students: 0,
    total_courses: 0,
    total_certificates: 0,
    total_simulator_accounts: 0,
    total_feedback: 0,
    avg_feedback_rating: 0,
    total_placements_eligible: 0,
    revenue_trend: [] as any[],
    exam_pass_rate: [] as any[],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isSuper = false;
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        const parsed = JSON.parse(stored);
        isSuper = parsed?.roles?.some((r: any) => r.name === "super_admin");
        setIsSuperAdmin(isSuper);
        if (!isSuper) {
          navigate("/admin/dashboard");
          return;
        }
      } else {
        navigate("/admin/dashboard");
        return;
      }
    } catch (err) {
      console.error(err);
      navigate("/admin/dashboard");
      return;
    } finally {
      setCheckingRole(false);
    }

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

  if (checkingRole || !isSuperAdmin) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D50032]"></div>
      </div>
    );
  }

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
          <h3 className="text-xl font-semibold text-[#0B2A5B] mb-6">Revenue Trend (6 Months)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.revenue_trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#0B2A5B20" />
              <XAxis dataKey="month" stroke="#0B2A5B" />
              <YAxis stroke="#0B2A5B" />
              <Tooltip formatter={(value: number) => `₹${(value / 100000).toFixed(1)}L`} />
              <Line type="monotone" dataKey="revenue" stroke="#C2A86A" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6 bg-white shadow-lg">
          <h3 className="text-xl font-semibold text-[#0B2A5B] mb-6">Exam Pass Rate (6 Months)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.exam_pass_rate}>
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
