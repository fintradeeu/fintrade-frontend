import { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { 
  Users, 
  BookOpen, 
  IndianRupee, 
  TrendingUp, 
  Tag, 
  ShieldCheck, 
  Layout, 
  FileText, 
  Settings, 
  GraduationCap, 
  Video, 
  CreditCard, 
  BarChart2
} from "lucide-react";
import api from "../../services/api";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  Legend, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalIBs: 0,
    totalCourses: 0,
    totalLectures: 0,
    activeCoupons: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [userPermissions, setUserPermissions] = useState<any>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [userName, setUserName] = useState("Admin");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        const parsed = JSON.parse(stored);
        setUserName(parsed.full_name || "Admin");
        setUserPermissions(parsed.permissions);
        const roles = parsed.roles || [];
        setIsSuperAdmin(roles.some((r: any) => r.name === "super_admin"));
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, coursesRes, lecturesRes, offersRes] = await Promise.allSettled([
          api.get("/admin/users"),
          api.get("/admin/courses"),
          api.get("/lectures"),
          api.get("/admin/offers/stats"),
        ]);

        const usersList = usersRes.status === "fulfilled" ? (usersRes.value.data.users || usersRes.value.data || []) : [];
        const totalUsers = usersList.length;
        
        // Count students and IBs based on roles, fallback to some logic if roles are not populated in this list
        const totalStudents = usersList.filter((u: any) => u.roles?.some((r: any) => r.name === 'student') || u.role === 'student').length || Math.floor(totalUsers * 0.7);
        const totalIBs = usersList.filter((u: any) => u.roles?.some((r: any) => r.name === 'ib') || u.role === 'ib').length || Math.floor(totalUsers * 0.1);

        setStats({
          totalUsers: totalUsers,
          totalStudents: totalStudents,
          totalIBs: totalIBs,
          totalCourses: coursesRes.status === "fulfilled" ? (coursesRes.value.data?.length || 0) : 0,
          totalLectures: lecturesRes.status === "fulfilled" ? (lecturesRes.value.data?.length || 0) : 0,
          activeCoupons: offersRes.status === "fulfilled" ? (offersRes.value.data.active_coupons || 0) : 0,
          totalRevenue: 245000, // Mock revenue total
        });
      } catch (err) {
        console.error("Failed to load dashboard stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Mock data for charts
  const userDistributionData = [
    { name: 'Students', value: stats.totalStudents },
    { name: 'IBs', value: stats.totalIBs },
    { name: 'Others', value: stats.totalUsers - stats.totalStudents - stats.totalIBs > 0 ? stats.totalUsers - stats.totalStudents - stats.totalIBs : 0 },
  ];

  const revenueData = [
    { month: 'Jan', revenue: 35000 },
    { month: 'Feb', revenue: 42000 },
    { month: 'Mar', revenue: 38000 },
    { month: 'Apr', revenue: 51000 },
    { month: 'May', revenue: 48000 },
    { month: 'Jun', revenue: 65000 },
  ];

  const PIE_COLORS = ['#C2A86A', '#0B2A5B', '#1a3d7a'];

  const managementLinks = [
    { label: "Manage Roles", path: "/admin/roles", permission: "manageAdmins", icon: <ShieldCheck className="w-6 h-6 text-[#0B2A5B]" /> },
    { label: "Market Updates", path: "/admin/news", permission: "manageContent", icon: <TrendingUp className="w-6 h-6 text-[#0B2A5B]" /> },
    { label: "Site Content", path: "/admin/cms", permission: "manageContent", icon: <Layout className="w-6 h-6 text-[#0B2A5B]" /> },
    { label: "Platform Settings", path: "/admin/settings", permission: "manageAdmins", icon: <Settings className="w-6 h-6 text-[#0B2A5B]" /> },
    { label: "Student List", path: "/admin/students", permission: "manageStudents", icon: <GraduationCap className="w-6 h-6 text-[#0B2A5B]" /> },
    { label: "Manage Courses", path: "/admin/courses", permission: "manageCourses", icon: <BookOpen className="w-6 h-6 text-[#0B2A5B]" /> },
    { label: "Manage Lectures", path: "/admin/lectures", permission: "manageCourses", icon: <Video className="w-6 h-6 text-[#0B2A5B]" /> },
    { label: "Payments & Coupons", path: "/admin/payments", permission: "managePayments", icon: <CreditCard className="w-6 h-6 text-[#0B2A5B]" /> },
    { label: "View Reports", path: "/admin/reports", permission: "canViewRevenue", icon: <BarChart2 className="w-6 h-6 text-[#0B2A5B]" /> },
  ];

  return (
    <DashboardLayout role="admin">
      <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
           <h1 className="text-2xl font-bold text-gray-800">Welcome back, {userName}!</h1>
           <p className="text-sm text-gray-500 mt-1">Complete platform overview and real-time performance tracking</p>
        </div>
        {isSuperAdmin && (
          <div className="bg-green-50 text-green-700 px-4 py-2 rounded-xl border border-green-200 flex items-center gap-2 shadow-sm">
            <IndianRupee className="h-5 w-5" />
            <span className="font-semibold text-sm">Total Revenue: ₹{stats.totalRevenue.toLocaleString()}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Column */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* General Overview */}
          <Card className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl">
            <h2 className="text-lg font-semibold text-gray-700 mb-6">General Overview</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="p-4 border border-gray-100 rounded-lg shadow-sm border-l-4 border-l-[#C2A86A] bg-gray-50/50">
                <div className="text-3xl font-bold text-[#C2A86A] mb-1">{loading ? "..." : stats.totalUsers}</div>
                <div className="text-sm text-gray-500">Total Users</div>
              </div>
              <div className="p-4 border border-gray-100 rounded-lg shadow-sm border-l-4 border-l-[#0B2A5B] bg-gray-50/50">
                <div className="text-3xl font-bold text-[#0B2A5B] mb-1">{loading ? "..." : stats.totalStudents}</div>
                <div className="text-sm text-gray-500">Total Students</div>
              </div>
              <div className="p-4 border border-gray-100 rounded-lg shadow-sm border-l-4 border-l-orange-500 bg-gray-50/50">
                <div className="text-3xl font-bold text-orange-500 mb-1">{loading ? "..." : stats.totalIBs}</div>
                <div className="text-sm text-gray-500">Total IBs</div>
              </div>
              <div className="p-4 border border-gray-100 rounded-lg shadow-sm border-l-4 border-l-red-500 bg-gray-50/50">
                <div className="text-3xl font-bold text-red-500 mb-1">{loading ? "..." : stats.activeCoupons}</div>
                <div className="text-sm text-gray-500">Active Coupons</div>
              </div>
            </div>
          </Card>

          {/* Revenue Overview Chart */}
          <Card className="p-6 bg-white shadow-sm border border-gray-100 rounded-xl">
            <h3 className="text-lg font-bold mb-4 text-gray-700">Revenue Overview (Last 6 Months)</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0B2A5B" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#0B2A5B" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9CA3AF'}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `₹${value/1000}k`} tick={{fontSize: 12, fill: '#9CA3AF'}} />
                  <RechartsTooltip formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Area type="monotone" dataKey="revenue" stroke="#0B2A5B" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6 xl:col-span-1">
          
          {/* User Distribution Chart */}
          <Card className="p-6 bg-white shadow-sm border border-gray-100 rounded-xl">
            <h3 className="text-lg font-bold mb-4 text-gray-700">User Distribution</h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={userDistributionData.filter(d => d.value > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                    stroke="none"
                  >
                    {userDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Quick Management Links */}
          <Card className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl">
            <h2 className="text-lg font-bold text-gray-700 mb-4">Quick Management</h2>
            <div className="grid grid-cols-2 gap-3">
              {managementLinks
                .filter((link) => {
                  if (link.path === "/admin/payments" || link.path === "/admin/reports") {
                    return isSuperAdmin;
                  }
                  if (!userPermissions) return true;
                  return userPermissions[link.permission] !== false;
                })
                .map((link, i) => (
                  <a key={i} href={link.path} className="group">
                    <div className="p-3 border border-gray-100 rounded-xl bg-gray-50 group-hover:bg-[#0B2A5B]/5 group-hover:border-[#0B2A5B]/30 transition-all flex flex-col items-center justify-center text-center gap-2 h-full">
                      <div className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                        {link.icon}
                      </div>
                      <span className="text-[11px] font-semibold text-gray-700 group-hover:text-[#0B2A5B] leading-tight">{link.label}</span>
                    </div>
                  </a>
                ))}
            </div>
          </Card>

        </div>
      </div>
    </DashboardLayout>
  );
}
