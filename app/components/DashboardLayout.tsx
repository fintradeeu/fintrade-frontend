import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import {
  Menu, X, LogOut, Home, Users, BookOpen, Video, FileQuestion,
  IndianRupee, Bot, TrendingUp, BarChart3, Settings, Award,
  GraduationCap, MessageCircle, LineChart, Briefcase, Shield,
  Newspaper, FileText, Trophy, LayoutTemplate, UserCircle
} from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogContent } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import logo from "../../imports/fintrade_logo.png";
import api from "../services/api";

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

const getNavItemsByRole = (role: string): NavItem[] => {
  switch (role) {
    case "student":
      return [
        { label: "Dashboard", path: "/student/dashboard", icon: <Home size={20} /> },
        { label: "Profile", path: "/student/profile", icon: <UserCircle size={20} /> },
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
        { label: "Invoice", path: "/student/invoice", icon: <IndianRupee size={20} /> },
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
        { label: "User Management", path: "/admin/students", icon: <Users size={20} /> },
        { label: "Courses", path: "/admin/courses", icon: <BookOpen size={20} /> },
        { label: "Module Students", path: "/admin/module-students", icon: <GraduationCap size={20} /> },
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

const getFallbackName = (role: string): string => {
  switch (role) {
    case "student": return "Rahul Sharma";
    case "teacher": return "Priya Patel";
    case "admin": return "Vikram Desai";
    default: return "User";
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
  const [showLockedModal, setShowLockedModal] = useState(false);
  const [enrolledCount, setEnrolledCount] = useState<number | null>(null);
  const [autoName, setAutoName] = useState("User");
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({ full_name: "", email: "", phone: "" });

  const location = useLocation();
  const navigate = useNavigate();

  const role = roleProp || userRole || "student";
  const navItems = customNavItems || getNavItemsByRole(role);
  const displayName = userNameProp || autoName || getFallbackName(role);

  // Load user data from localStorage
  useEffect(() => {
    if (!userNameProp) {
      try {
        const stored = localStorage.getItem("user");
        if (stored) {
          const parsed = JSON.parse(stored);
          setAutoName(parsed.full_name || getFallbackName(role));
        }
      } catch { /* ignore */ }
    }
  }, [userNameProp, role]);

  // Load profile form when modal opens
  useEffect(() => {
    if (profileOpen) {
      try {
        const stored = localStorage.getItem("user");
        if (stored) {
          const parsed = JSON.parse(stored);
          setProfileForm({
            full_name: parsed.full_name || "",
            email: parsed.email || "",
            phone: parsed.phone || "",
          });
        }
      } catch { /* ignore */ }
    }
  }, [profileOpen]);

  // Restrict access for un-enrolled students
  useEffect(() => {
    if (role === "student") {
      api.get("/courses/enrolled")
        .then((res) => {
          setEnrolledCount(res.data.length);
          const allowedUnenrolledRoutes = [
            "/student/profile", "/student/courses",
            "/student/contract-kyc", "/student/exams", "/student/entrance-exam",
            "/student/invoice"
          ];
          if (res.data.length === 0 && !allowedUnenrolledRoutes.includes(location.pathname)) {
            navigate("/student/courses");
          }
        })
        .catch(() => {
          navigate("/login");
        });
    }
  }, [role, navigate, location.pathname]);

  // Restore sidebar scroll position
  useEffect(() => {
    const savedScroll = sessionStorage.getItem("sidebar-scroll");
    const nav = document.querySelector("#sidebar-nav");
    if (savedScroll && nav) {
      (nav as HTMLElement).scrollTop = parseInt(savedScroll, 10);
    }
  }, [location.pathname]);

  const handleNavClick = () => {
    const nav = document.querySelector("#sidebar-nav");
    if (nav) {
      sessionStorage.setItem("sidebar-scroll", (nav as HTMLElement).scrollTop.toString());
    }
    setIsSidebarOpen(false);
  };

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (e) {
      console.error("Logout API failed", e);
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.put("/auth/my-profile", profileForm);
      localStorage.setItem("user", JSON.stringify(res.data));
      setAutoName(profileForm.full_name);
    } catch (err) {
      console.error("Profile update failed", err);
    }
    setProfileOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5]">

      {/* Mobile Header */}
      <div
        className="lg:hidden text-[#0B2A5B] p-4 flex items-center justify-between sticky top-0 z-40 border-b border-[#0B2A5B]/10"
        style={{ background: "#ECE8DD" }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-[#DDD8C9] rounded-lg transition-colors"
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <img src={logo} alt="FinTrade" className="h-10" />
        </div>

        {/* Profile icon (mobile) */}
        <button
          onClick={() => setProfileOpen(true)}
          className="flex items-center gap-2 text-sm font-medium hover:text-[#D50032] transition-colors"
        >
          <UserCircle size={24} />
          <span className="max-w-[120px] truncate">{displayName}</span>
        </button>
      </div>

      {/* Profile Modal */}
      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className="sm:max-w-md bg-white rounded-2xl p-6 shadow-2xl z-[9999]">
          <h2 className="text-2xl font-bold mb-4 text-[#0B2A5B]">My Profile</h2>
          <form onSubmit={handleProfileSave} className="space-y-4">
            <div>
              <Label htmlFor="full_name" className="text-[#0B2A5B]">Full Name</Label>
              <Input
                id="full_name"
                value={profileForm.full_name}
                onChange={e => setProfileForm({ ...profileForm, full_name: e.target.value })}
                className="w-full mt-1"
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-[#0B2A5B]">Email</Label>
              <Input
                id="email"
                type="email"
                value={profileForm.email}
                onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                className="w-full mt-1"
              />
            </div>
            <div>
              <Label htmlFor="phone" className="text-[#0B2A5B]">Phone</Label>
              <Input
                id="phone"
                value={profileForm.phone}
                onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                className="w-full mt-1"
              />
            </div>
            <div className="flex justify-between items-center mt-4 gap-3">
              <Button
                type="submit"
                className="flex-1 bg-[#C2A86A] text-[#0B2A5B] hover:bg-[#d4bd8a] font-bold"
              >
                Save Changes
              </Button>
              <Button
                type="button"
                onClick={handleLogout}
                className="flex-1 bg-[#D50032] text-white hover:bg-[#b00029] font-bold"
              >
                <LogOut size={16} className="mr-2" />
                Logout
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`
            fixed lg:sticky top-0 left-0 h-screen text-[#0B2A5B]
            transition-transform duration-300 ease-in-out z-30 border-r border-[#0B2A5B]/10
            ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
            w-64 flex flex-col
          `}
          style={{ background: "#ECE8DD" }}
        >
          {/* Sidebar Logo */}
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
            <p className="text-xs text-[#0B2A5B]/60 capitalize mt-2 text-center font-bold tracking-wide">
              {role} Portal
            </p>
          </div>

          {/* Sidebar Profile (desktop) */}
          <div className="hidden lg:flex items-center justify-between px-4 py-3 border-b border-[#0B2A5B]/10">
            <button
              onClick={() => setProfileOpen(true)}
              className="flex items-center gap-2 text-sm font-semibold hover:text-[#D50032] transition-colors"
            >
              <UserCircle size={20} />
              <span className="truncate max-w-[130px]">{displayName}</span>
            </button>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-1 rounded hover:bg-[#DDD8C9] text-[#0B2A5B]/70 hover:text-[#D50032] transition-colors"
            >
              <LogOut size={18} />
            </button>
          </div>

          {/* Navigation */}
          <nav id="sidebar-nav" className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                const allowedUnenrolledRoutes = [
                  "/student/profile", "/student/courses",
                  "/student/contract-kyc", "/student/exams", "/student/entrance-exam"
                ];
                const isLocked =
                  role === "student" &&
                  enrolledCount === 0 &&
                  !allowedUnenrolledRoutes.includes(item.path);

                return (
                  <Link
                    key={item.path}
                    to={isLocked ? "#" : item.path}
                    onClick={(e) => {
                      if (isLocked) {
                        e.preventDefault();
                        setShowLockedModal(true);
                      } else {
                        handleNavClick();
                      }
                    }}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                      ${
                        isActive
                          ? "text-white shadow-lg font-bold"
                          : "hover:bg-[#DDD8C9] text-[#0B2A5B]/80 font-semibold"
                      }
                    `}
                    style={
                      isActive
                        ? {
                            background: "linear-gradient(135deg, #D50032 0%, #FF0000 100%)",
                            boxShadow: "0 4px 12px rgba(213,0,50,0.3)",
                          }
                        : {}
                    }
                  >
                    {item.icon}
                    <span className="text-sm">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>
        </aside>

        {/* Mobile overlay */}
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

      {/* Locked Modal */}
      <Dialog open={showLockedModal} onOpenChange={setShowLockedModal}>
        <DialogContent className="sm:max-w-md bg-white rounded-2xl p-6 text-center shadow-2xl z-[9999]">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-50 rounded-full flex items-center justify-center">
            <BookOpen className="h-8 w-8 text-[#D50032]" />
          </div>
          <h2 className="text-2xl font-bold text-[#121212] mb-2">Feature Locked</h2>
          <p className="text-gray-600 mb-6">
            You must enroll in a course to access this area of the student portal.
            Visit the Courses tab to get started!
          </p>
          <Button
            onClick={() => setShowLockedModal(false)}
            className="w-full bg-[#D50032] hover:bg-[#b00029] text-white rounded-xl"
          >
            Got it
          </Button>
        </DialogContent>
      </Dialog>

    </div>
  );
}

export default DashboardLayout;
