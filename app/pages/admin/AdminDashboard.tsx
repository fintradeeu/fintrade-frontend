import { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Users, BookOpen, IndianRupee, TrendingUp, Video, FileQuestion, Tag, Newspaper } from "lucide-react";
import api from "../../services/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalLectures: 0,
    activeCoupons: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, coursesRes, lecturesRes, offersRes] = await Promise.allSettled([
          api.get("/admin/users"),
          api.get("/admin/courses"),
          api.get("/lectures"),
          api.get("/admin/offers/stats"),
        ]);

        setStats({
          totalUsers: usersRes.status === "fulfilled" ? (usersRes.value.data.users?.length || usersRes.value.data.length || 0) : 0,
          totalCourses: coursesRes.status === "fulfilled" ? (coursesRes.value.data?.length || 0) : 0,
          totalLectures: lecturesRes.status === "fulfilled" ? (lecturesRes.value.data?.length || 0) : 0,
          activeCoupons: offersRes.status === "fulfilled" ? (offersRes.value.data.active_coupons || 0) : 0,
        });
      } catch (err) {
        console.error("Failed to load dashboard stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { label: "Total Users", value: stats.totalUsers, icon: <Users className="h-6 w-6" />, color: "#4CAF50", bg: "rgba(76, 175, 80, 0.1)" },
    { label: "Active Courses", value: stats.totalCourses, icon: <BookOpen className="h-6 w-6" />, color: "#2196F3", bg: "rgba(33, 150, 243, 0.1)" },
    { label: "Scheduled Lectures", value: stats.totalLectures, icon: <Video className="h-6 w-6" />, color: "#9C27B0", bg: "rgba(156, 39, 176, 0.1)" },
    { label: "Active Coupons", value: stats.activeCoupons, icon: <Tag className="h-6 w-6" />, color: "#E53935", bg: "rgba(229, 57, 53, 0.1)" },
  ];

  return (
    <DashboardLayout role="admin">
      <div className="mb-8">
        <h1 className="text-3xl font-bold" style={{ color: "#121212" }}>Admin Dashboard</h1>
        <p className="text-gray-600">Complete platform overview and real-time performance tracking</p>
      </div>

      {/* Live Stats */}
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        {statCards.map((card, i) => (
          <Card key={i} className="p-6 border-2 border-gray-100 hover:border-[#E53935] transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: card.bg }}>
                <span style={{ color: card.color }}>{card.icon}</span>
              </div>
              <div>
                <div className="text-2xl font-bold" style={{ color: "#121212" }}>
                  {loading ? "..." : card.value}
                </div>
                <div className="text-sm text-gray-600">{card.label}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6 bg-white shadow-sm border border-gray-100 h-full">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: "#121212" }}>
            <TrendingUp className="h-5 w-5" style={{ color: "#E53935" }} />
            Quick Management Links
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Manage Roles", path: "/admin/roles" },
              { label: "Market Updates", path: "/admin/news" },
              { label: "Platform Settings", path: "/admin/settings" },
              { label: "Student List", path: "/admin/students" },
              { label: "Manage Courses", path: "/admin/courses" },
              { label: "Manage Lectures", path: "/admin/lectures" },
              { label: "Payments & Coupons", path: "/admin/payments" },
              { label: "View Reports", path: "/admin/reports" },
            ].map((link, i) => (
              <a key={i} href={link.path}>
                <Button variant="outline" className="w-full text-xs h-10 border-gray-200 hover:border-[#E53935] hover:text-[#E53935] bg-white">
                  {link.label}
                </Button>
              </a>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
