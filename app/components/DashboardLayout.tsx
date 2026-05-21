import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation } from "react-router";
import { Menu, X, LogOut, Home, Users, BookOpen, Video, FileQuestion, IndianRupee, Bot, TrendingUp, BarChart3, Settings, Award, GraduationCap, MessageCircle, LineChart, Target, Briefcase, Shield, Newspaper, FileText, Trophy, LayoutTemplate } from "lucide-react";
import { Button } from "./ui/button";
import logo from "../../imports/fintrade_logo.png";

interface NavItem {
  label: string;
  path: string;
  icon: ReactNode;
}

interface DashboardLayoutProps {
  children: ReactNode;
  role?: "student" | "teacher" | "admin";
  /** @deprecated Use `role` instead */
  userRole?: "student" | "teacher" | "admin";
  userName?: string;
  navItems?: NavItem[];
}

// Navigation configurations based on role
const getNavItemsByRole = (role: string): NavItem[] => {
  switch (role) {
    case "student":
      return [
        { label: "Dashboard", path: "/student/dashboard", icon: <Home size={20} /> },
        { label: "Courses", path: "/student/courses", icon: <BookOpen size={20} /> },
        { label: "Modules", path: "/student/modules", icon: <GraduationCap size={20} /> },
        { label: "Lectures", path: "/student/lectures", icon: <Video size={20} /> },
        { label: "Assignments", path: "/student/assignments", icon: <FileText size={20} /> },
        { label: "AI Tutor", path: "/student/ai-tutor", icon: <Bot size={20} /> },
        { label: "Exams", path: "/student/exams", icon: <FileQuestion size={20} /> },
        { label: "Performance", path: "/student/performance", icon: <BarChart3 size={20} /> },
        { label: "Leaderboard", path: "/student/leaderboard", icon: <Trophy size={20} /> },
        { label: "Simulator", path: "/student/simulator", icon: <LineChart size={20} /> },
        { label: "Placement", path: "/student/placement", icon: <Briefcase size={20} /> },
        { label: "Certificate", path: "/student/certificate", icon: <Award size={20} /> },
      ];
    case "teacher":
      return [
        { label: "Dashboard", path: "/teacher/dashboard", icon: <Home size={20} /> },
        { label: "Courses", path: "/teacher/courses", icon: <BookOpen size={20} /> },
        { label: "Students", path: "/teacher/students", icon: <Users size={20} /> },
        { label: "Lectures", path: "/teacher/lectures", icon: <Video size={20} /> },
        { label: "Doubt Sessions", path: "/teacher/doubt-sessions", icon: <MessageCircle size={20} /> },
        { label: "Assignments", path: "/teacher/assignments", icon: <FileText size={20} /> },
        { label: "Exams", path: "/teacher/exams", icon: <FileQuestion size={20} /> },
        { label: "Reports", path: "/teacher/reports", icon: <BarChart3 size={20} /> },
      ];
    case "admin":
      return [
        { label: "Dashboard", path: "/admin/dashboard", icon: <Home size={20} /> },
        { label: "Students", path: "/admin/students", icon: <Users size={20} /> },
        { label: "Courses", path: "/admin/courses", icon: <BookOpen size={20} /> },
        { label: "Lectures", path: "/admin/lectures", icon: <Video size={20} /> },
        { label: "Exams", path: "/admin/exams", icon: <FileQuestion size={20} /> },
        { label: "Payments & Coupons", path: "/admin/payments", icon: <IndianRupee size={20} /> },
        { label: "Login Details", path: "/admin/login-details", icon: <Users size={20} /> },
        { label: "Blog & CMS", path: "/admin/news", icon: <Newspaper size={20} /> },
        { label: "Site Content", path: "/admin/cms", icon: <LayoutTemplate size={20} /> },
        { label: "Admin Roles", path: "/admin/roles", icon: <Shield size={20} /> },
        { label: "AI Chatbot", path: "/admin/ai-chatbot", icon: <Bot size={20} /> },
        { label: "Simulator", path: "/admin/simulator", icon: <TrendingUp size={20} /> },
        { label: "Reports", path: "/admin/reports", icon: <BarChart3 size={20} /> },
        { label: "Contracts", path: "/admin/contracts", icon: <FileText size={20} /> },
        { label: "Settings", path: "/admin/settings", icon: <Settings size={20} /> },
      ];
    default:
      return [];
  }
};

const getUserNameByRole = (role: string): string => {
  switch (role) {
    case "student":
      return "Rahul Sharma";
    case "teacher":
      return "Priya Patel";
    case "admin":
      return "Vikram Desai";
    default:
      return "User";
  }
};

export function DashboardLayout({
  children,
  role: roleProp,
  userRole,
  userName: userNameProp,
  navItems: customNavItems,
}: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  // Resolve role: prefer `role` prop, fall back to `userRole` alias
  const role = roleProp || userRole || "student";

  const navItems = customNavItems || getNavItemsByRole(role);

  // Auto-read userName from localStorage if not provided
  const [autoName, setAutoName] = useState("User");
  useEffect(() => {
    if (!userNameProp) {
      try {
        const stored = localStorage.getItem("user");
        if (stored) {
          const parsed = JSON.parse(stored);
          setAutoName(parsed.full_name || getUserNameByRole(role));
        }
      } catch { /* ignore */ }
    }
  }, [userNameProp, role]);

  const displayName = userNameProp || autoName || getUserNameByRole(role);

  // Restore sidebar scroll position
  useEffect(() => {
    const savedScroll = sessionStorage.getItem("sidebar-scroll");
    const nav = document.querySelector("#sidebar-nav");
    if (savedScroll && nav) {
      nav.scrollTop = parseInt(savedScroll, 10);
    }
  }, [location.pathname]);

  const handleNavClick = () => {
    const nav = document.querySelector("#sidebar-nav");
    if (nav) {
      sessionStorage.setItem("sidebar-scroll", nav.scrollTop.toString());
    }
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Mobile Header */}
      <div className="lg:hidden text-[#0B2A5B] p-4 flex items-center justify-between sticky top-0 z-40 border-b border-[#0B2A5B]/10" style={{ background: '#ECE8DD' }}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-[#DDD8C9] rounded-lg transition-colors"
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <img 
            src={logo} 
            alt="FinTrade" 
            className="h-10" 
          />
        </div>
        <div className="text-sm font-medium">{displayName}</div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`
            fixed lg:sticky top-0 left-0 h-screen text-[#0B2A5B]
            transition-transform duration-300 ease-in-out z-30 border-r border-[#0B2A5B]/10
            ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
            w-64 flex flex-col
          `}
          style={{ background: '#ECE8DD' }}
        >
          <div className="p-6 border-b border-[#0B2A5B]/10 hidden lg:block overflow-hidden">
            <div className="flex items-center justify-center overflow-hidden" style={{ height: 60 }}>
              <Link to="/" className="flex items-center justify-center h-full w-full">
                <img 
                  src={logo} 
                  alt="FinTrade" 
                  className="h-full w-full object-contain" 
                  style={{ 
                    transform: "scale(3.5) translateY(-4px)",
                    transformOrigin: "center center"
                  }}
                />
              </Link>
            </div>
            <p className="text-xs text-[#0B2A5B]/60 capitalize mt-2 text-center font-bold tracking-wide">{role} Portal</p>
          </div>

          {/* Navigation */}
          <nav id="sidebar-nav" className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={handleNavClick}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                      ${
                        isActive
                          ? "text-white shadow-lg font-bold"
                          : "hover:bg-[#DDD8C9] text-[#0B2A5B]/80 font-semibold"
                      }
                    `}
                    style={isActive ? { 
                      background: 'linear-gradient(135deg, #D50032 0%, #FF0000 100%)',
                      boxShadow: '0 4px 12px rgba(213,0,50, 0.3)'
                    } : {}}
                  >
                    <span className={isActive ? "scale-110" : ""}>{item.icon}</span>
                    <span className="text-sm">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* User Info */}
          <div className="p-4 border-t border-[#0B2A5B]/10">
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg mb-2" style={{ background: '#DDD8C9' }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-md" style={{ background: '#D50032' }}>
                <span className="text-white font-bold text-sm">
                  {displayName.split(" ").map(n => n[0]).join("")}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-extrabold truncate text-sm text-[#0B2A5B]">{displayName}</p>
                <p className="text-xs text-[#0B2A5B]/70 capitalize font-bold">{role}</p>
              </div>
            </div>
            <Button
                onClick={() => {
                  localStorage.removeItem("token");
                  localStorage.removeItem("user");
                  window.location.href = "/login";
                }}
                className="w-full bg-[#C2A86A] text-[#0B2A5B] hover:bg-[#d4bd8a] shadow-lg shadow-[#C2A86A]/20 font-bold"
              >
                <LogOut size={16} className="mr-2" />
                Logout
              </Button>
          </div>
        </aside>

        {/* Overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-20 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 min-h-screen lg:ml-0">
          <div className="p-4 md:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}

// Export as both named and default for compatibility
export default DashboardLayout;
