import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import {
  Menu, X, LogOut, Home, Users, BookOpen, Video, FileQuestion,
  IndianRupee, Bot, TrendingUp, BarChart3, Settings, Award,
  GraduationCap, MessageCircle, LineChart, Briefcase, Shield,
  Newspaper, FileText, Trophy, LayoutTemplate, UserCircle, Handshake, Globe, Smartphone
} from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogContent } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import logo from "../../imports/fintrade_logo.png";
import api from "../services/api";
import ActivityTracker from "./ActivityTracker";
import CourseCheckoutModal from "./CourseCheckoutModal";

interface NavItem {
  label: string;
  path: string;
  icon: ReactNode;
}

interface DashboardLayoutProps {
  children: ReactNode;
  role?: "student" | "teacher" | "admin" | "super_admin" | "distributor" | "franchise_ib";
  /** @deprecated Use `role` instead */
  userRole?: "student" | "teacher" | "admin" | "super_admin" | "distributor" | "franchise_ib";
  userName?: string;
  navItems?: NavItem[];
}

const getNavItemsByRole = (role: string): NavItem[] => {
  switch (role) {
    case "super_admin":
      return [
        { label: "Dashboard", path: "/superadmin/dashboard", icon: <Home size={20} /> },
        { label: "Student Access Control", path: "/superadmin/student-access", icon: <Shield size={20} /> },
        { label: "Batch Management", path: "/admin/batches", icon: <Users size={20} /> },
        { label: "User Management", path: "/admin/students", icon: <Users size={20} /> },
        { label: "Student Management", path: "/admin/student-management", icon: <GraduationCap size={20} /> },
        { label: "Payments & Coupons", path: "/admin/payments", icon: <IndianRupee size={20} /> },
        { label: "IB Management", path: "/admin/introducing-brokers", icon: <Handshake size={20} /> },
        { label: "Franchise IBs", path: "/admin/franchise-ibs", icon: <Handshake size={20} /> },
        { label: "Commission Management", path: "/admin/commissions", icon: <IndianRupee size={20} /> },
        { label: "IB Revenue Analytics", path: "/admin/franchise-ib-revenue", icon: <BarChart3 size={20} /> },
        { label: "Courses", path: "/admin/courses", icon: <BookOpen size={20} /> },
        { label: "Module Students", path: "/admin/module-students", icon: <GraduationCap size={20} /> },
        { label: "Lectures", path: "/admin/lectures", icon: <Video size={20} /> },
        { label: "Live Class Registrations", path: "/admin/live-class-registrations", icon: <Users size={20} /> },
        { label: "Exams", path: "/admin/exams", icon: <FileQuestion size={20} /> },
        { label: "Assignments", path: "/admin/assignments", icon: <FileText size={20} /> },
        { label: "Login Details", path: "/admin/login-details", icon: <Users size={20} /> },
        { label: "Blog & CMS", path: "/admin/news", icon: <Newspaper size={20} /> },
        { label: "Advisors", path: "/admin/advisors", icon: <Users size={20} /> },
        { label: "Site Content", path: "/admin/cms", icon: <LayoutTemplate size={20} /> },
        { label: "Global Offices", path: "/admin/global-offices", icon: <Globe size={20} /> },
        { label: "Feedback Forms", path: "/admin/feedback-forms", icon: <FileText size={20} /> },
        { label: "Doubt Panel", path: "/admin/doubt-forms", icon: <MessageCircle size={20} /> },
        { label: "Admin Roles", path: "/admin/roles", icon: <Shield size={20} /> },
        { label: "AI Chatbot", path: "/admin/ai-chatbot", icon: <Bot size={20} /> },
        { label: "Simulator", path: "/admin/simulator", icon: <TrendingUp size={20} /> },
        { label: "Reports", path: "/admin/reports", icon: <BarChart3 size={20} /> },
        { label: "Contracts", path: "/admin/contracts", icon: <FileText size={20} /> },
        { label: "Cookie Consents", path: "/admin/cookie-consents", icon: <Shield size={20} /> },
        { label: "Mobile Devices", path: "/superadmin/mobile-devices", icon: <Smartphone size={20} /> },
        { label: "Settings", path: "/admin/settings", icon: <Settings size={20} /> },
      ];
    case "student":
      return [
        { label: "Dashboard", path: "/student/batch-dashboard", icon: <Home size={20} /> },
        { label: "Profile", path: "/student/profile", icon: <UserCircle size={20} /> },
        { label: "Courses", path: "/student/courses", icon: <BookOpen size={20} /> },
        { label: "Modules", path: "/student/modules", icon: <GraduationCap size={20} /> },
        { label: "Lectures", path: "/student/lectures", icon: <Video size={20} /> },
        { label: "Assignments", path: "/student/assignments", icon: <FileText size={20} /> },
        { label: "AI Tutor", path: "/student/ai-tutor", icon: <Bot size={20} /> },
        { label: "Doubt Solving", path: "/student/doubt-forms", icon: <MessageCircle size={20} /> },
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
        { label: "Batch Management", path: "/admin/batches", icon: <Users size={20} /> },
        { label: "User Management", path: "/admin/students", icon: <Users size={20} /> },
        { label: "Student Management", path: "/admin/student-management", icon: <GraduationCap size={20} /> },
        { label: "Payments & Coupons", path: "/admin/payments", icon: <IndianRupee size={20} /> },
        { label: "Franchise IBs", path: "/admin/franchise-ibs", icon: <Handshake size={20} /> },
        { label: "Courses", path: "/admin/courses", icon: <BookOpen size={20} /> },
        { label: "Module Students", path: "/admin/module-students", icon: <GraduationCap size={20} /> },
        { label: "Lectures", path: "/admin/lectures", icon: <Video size={20} /> },
        { label: "Live Class Registrations", path: "/admin/live-class-registrations", icon: <Users size={20} /> },
        { label: "Exams", path: "/admin/exams", icon: <FileQuestion size={20} /> },
        { label: "Assignments", path: "/admin/assignments", icon: <FileText size={20} /> },
        { label: "Login Details", path: "/admin/login-details", icon: <Users size={20} /> },
        { label: "Blog & CMS", path: "/admin/news", icon: <Newspaper size={20} /> },
        { label: "Advisors", path: "/admin/advisors", icon: <Users size={20} /> },
        { label: "Site Content", path: "/admin/cms", icon: <LayoutTemplate size={20} /> },
        { label: "Global Offices", path: "/admin/global-offices", icon: <Globe size={20} /> },
        { label: "Feedback Forms", path: "/admin/feedback-forms", icon: <FileText size={20} /> },
        { label: "Doubt Panel", path: "/admin/doubt-forms", icon: <MessageCircle size={20} /> },
        { label: "Admin Roles", path: "/admin/roles", icon: <Shield size={20} /> },
        { label: "AI Chatbot", path: "/admin/ai-chatbot", icon: <Bot size={20} /> },
        { label: "Simulator", path: "/admin/simulator", icon: <TrendingUp size={20} /> },
        { label: "Contracts", path: "/admin/contracts", icon: <FileText size={20} /> },
        { label: "Cookie Consents", path: "/admin/cookie-consents", icon: <Shield size={20} /> },
        { label: "Settings", path: "/admin/settings", icon: <Settings size={20} /> },
      ];
    case "distributor":
      return [
        { label: "Dashboard", path: "/distributor/dashboard", icon: <Home size={20} /> },
        { label: "Wallet", path: "/distributor/wallet", icon: <IndianRupee size={20} /> },
      ];
    case "franchise_ib":
      return [
        { label: "Dashboard", path: "/franchise-ib/dashboard", icon: <Home size={20} /> },
        { label: "Manage Students", path: "/franchise-ib/students", icon: <Users size={20} /> },
        { label: "Wallet & Withdrawals", path: "/franchise-ib/wallet", icon: <IndianRupee size={20} /> },
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
    case "super_admin": return "Super Admin";
    case "distributor": return "Introducing Broker (IB)";
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
  const [isKycVerified, setIsKycVerified] = useState<boolean>(true);
  
  // Partial payment states
  const [pendingBalance, setPendingBalance] = useState<number>(0);
  const [pendingCourse, setPendingCourse] = useState<any | null>(null);
  const [pendingDueDate, setPendingDueDate] = useState<string | null>(null);
  const [accessBlocked, setAccessBlocked] = useState<boolean>(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);

  const [autoName, setAutoName] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("user");
        if (stored) {
          const parsed = JSON.parse(stored);
          return parsed.full_name || "User";
        }
      } catch { /* ignore */ }
    }
    return "User";
  });
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({ full_name: "", email: "", phone: "" });

  const location = useLocation();
  const navigate = useNavigate();

  const [resolvedRole, setResolvedRole] = useState<string>(() => {
    if (roleProp) return roleProp;
    if (userRole) return userRole;
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("user");
        if (stored) {
          const parsed = JSON.parse(stored);
          const roles = parsed.roles || [];
          if (roles.some((r: any) => r.name === "super_admin")) return "super_admin";
          if (roles.some((r: any) => r.name === "admin")) return "admin";
          if (roles.some((r: any) => r.name === "faculty")) return "teacher";
          if (roles.some((r: any) => r.name === "franchise_ib")) return "franchise_ib";
          if (roles.some((r: any) => r.name === "distributor")) return "distributor";
        }
      } catch { /* ignore */ }
    }
    return "student";
  });
  const [userPermissions, setUserPermissions] = useState<any>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("user");
        if (stored) {
          const parsed = JSON.parse(stored);
          return parsed.permissions || null;
        }
      } catch { /* ignore */ }
    }
    return null;
  });
  
  let baseNavItems = customNavItems || getNavItemsByRole(resolvedRole);
  if ((resolvedRole === "admin" || resolvedRole === "super_admin") && userPermissions) {
    baseNavItems = baseNavItems.filter((item) => {
      switch (item.path) {
        case "/admin/dashboard":
        case "/superadmin/dashboard":
          return userPermissions.viewDashboard !== false;
        case "/admin/students":
        case "/admin/student-management":
          return userPermissions.manageStudents !== false;
        case "/admin/introducing-brokers":
          return resolvedRole === "super_admin";
        case "/admin/commissions":
          return resolvedRole === "super_admin";
        case "/admin/courses":
          return userPermissions.manageCourses !== false;
        case "/admin/module-students":
          return userPermissions.viewModuleStudents !== false;
        case "/admin/lectures":
          return userPermissions.viewLectures !== false;
        case "/admin/live-class-registrations":
          return userPermissions.viewLectures !== false;
        case "/admin/exams":
          return userPermissions.manageExams !== false;
        case "/admin/payments":
          return userPermissions.managePayments !== false;
        case "/admin/login-details":
          return userPermissions.viewLoginDetails !== false;
        case "/admin/news":
          return userPermissions.manageContent !== false;
        case "/admin/cms":
        case "/admin/global-offices":
          return userPermissions.viewSiteContent !== false;
        case "/admin/roles":
          return userPermissions.manageAdmins !== false;
        case "/admin/ai-chatbot":
          return userPermissions.viewAIChatbot !== false;
        case "/admin/simulator":
          return userPermissions.viewSimulator !== false;
        case "/admin/reports":
          return userPermissions.canViewRevenue !== false;
        case "/admin/contracts":
          return userPermissions.viewContracts !== false;
        case "/admin/settings":
          return userPermissions.viewSettings !== false;
        default:
          return true;
      }
    });
  } else if (resolvedRole === "teacher" && userPermissions) {
    baseNavItems = baseNavItems.filter((item) => {
      switch (item.path) {
        case "/teacher/courses":
          return userPermissions.manageCourses !== false;
        case "/teacher/students":
          return userPermissions.manageStudents !== false;
        case "/teacher/lectures":
          return userPermissions.manageLectures !== false;
        case "/teacher/doubt-sessions":
          return userPermissions.manageDoubts !== false;
        case "/teacher/assignments":
          return userPermissions.manageAssignments !== false;
        case "/teacher/exams":
          return userPermissions.manageExams !== false;
        case "/teacher/reports":
          return userPermissions.viewReports !== false;
        default:
          return true;
      }
    });
  }
  const navItems = baseNavItems;
  const displayName = userNameProp || autoName || getFallbackName(resolvedRole);

  // Load user data from localStorage
  useEffect(() => {
    if (!userNameProp) {
      try {
        const stored = localStorage.getItem("user");
        if (stored) {
          const parsed = JSON.parse(stored);
          setAutoName(parsed.full_name || getFallbackName(roleProp || userRole || "student"));
          setUserPermissions(parsed.permissions);
          
          const roles = parsed.roles || [];
          const actualRole = roles.some((r: any) => r.name === "super_admin") ? "super_admin" :
                             roles.some((r: any) => r.name === "admin") ? "admin" :
                             roles.some((r: any) => r.name === "faculty") ? "teacher" :
                             roles.some((r: any) => r.name === "distributor") ? "distributor" : 
                             roles.some((r: any) => r.name === "franchise_ib") ? "franchise_ib" : "student";
          setResolvedRole(actualRole);
        }
      } catch { /* ignore */ }
    }
  }, [userNameProp, roleProp, userRole]);

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

  // Restrict access for students based on enrollment and KYC verification
  useEffect(() => {
    if (resolvedRole === "student") {
      Promise.all([
        api.get("/courses/enrolled"),
        api.get("/kyc/status"),
        api.get("/batches/student/dashboard").catch(() => null)
      ])
        .then(([enrolledRes, kycRes, batchRes]) => {
          const enrolled = enrolledRes.data;
          setEnrolledCount(enrolled.length);
          
          let pendingAmt = 0;
          let pCourse = null;
          let pDueDate: string | null = null;
          let pAccessBlocked = false;
          for (const e of enrolled) {
            const coursePrice = e.course?.price || 0;
            const enrollmentDiscount = e.discount_applied || 0;
            const effective = coursePrice - enrollmentDiscount;
            const paid = e.price_paid || 0;
            if (paid < effective) {
              pendingAmt = Math.round((pendingAmt + (effective - paid)) * 100) / 100;
              pCourse = e.course;
              pDueDate = e.payment_due_date || null;
            }
            if (e.access_blocked) pAccessBlocked = true;
          }
          setPendingBalance(pendingAmt);
          setPendingCourse(pCourse);
          setPendingDueDate(pDueDate);
          setAccessBlocked(pAccessBlocked);
          
          const kycStatus = kycRes.data?.status || "not_started";
          const verified = kycStatus === "verified" || kycStatus === "approved";
          setIsKycVerified(verified);

          const isBatchLocked = batchRes?.data?.is_locked === true;

          const allowedUnenrolledRoutes = [
            "/student/profile", "/student/courses",
            "/student/contract-kyc", "/student/exams", "/student/entrance-exam",
            "/student/invoice"
          ];

          if (enrolled.length === 0) {
            if (!allowedUnenrolledRoutes.includes(location.pathname)) {
              navigate("/student/courses");
            }
          } else if (!verified) {
            const allowedUnverifiedRoutes = [
              "/student/contract-kyc",
              "/student/profile",
              "/student/invoice",
              "/student/courses"
            ];
            if (!allowedUnverifiedRoutes.includes(location.pathname)) {
              const courseId = enrolled[0]?.course_id;
              navigate(courseId ? `/student/contract-kyc?course_id=${courseId}` : "/student/contract-kyc");
            }
          } else if (isBatchLocked) {
            const allowedLockedRoutes = [
              "/student/batch-dashboard",
              "/student/profile",
              "/student/invoice",
              "/student/contract-kyc",
              "/student/courses"
            ];
            if (!allowedLockedRoutes.includes(location.pathname)) {
              navigate("/student/batch-dashboard");
            }
          }
        })
        .catch(() => {
          navigate("/login");
        });
    }
  }, [resolvedRole, navigate, location.pathname]);

  // Guard teacher routes based on dynamic permissions
  useEffect(() => {
    if (resolvedRole === "teacher" && userPermissions) {
      const path = location.pathname;
      if (path.startsWith("/teacher/courses") && userPermissions.manageCourses === false) {
        navigate("/teacher/dashboard");
      } else if (path.startsWith("/teacher/students") && userPermissions.manageStudents === false) {
        navigate("/teacher/dashboard");
      } else if (path.startsWith("/teacher/lectures") && userPermissions.manageLectures === false) {
        navigate("/teacher/dashboard");
      } else if (path.startsWith("/teacher/doubt-sessions") && userPermissions.manageDoubts === false) {
        navigate("/teacher/dashboard");
      } else if (path.startsWith("/teacher/assignments") && userPermissions.manageAssignments === false) {
        navigate("/teacher/dashboard");
      } else if (path.startsWith("/teacher/exams") && userPermissions.manageExams === false) {
        navigate("/teacher/dashboard");
      } else if (path.startsWith("/teacher/reports") && userPermissions.viewReports === false) {
        navigate("/teacher/dashboard");
      }
    }
  }, [resolvedRole, userPermissions, location.pathname, navigate]);

  // Restore sidebar scroll position
  useEffect(() => {
    const savedScroll = sessionStorage.getItem("sidebar-scroll");
    const nav = document.querySelector("#sidebar-nav");
    if (savedScroll && nav) {
      (nav as HTMLElement).scrollTop = parseInt(savedScroll, 10);
    }
  }, [location.pathname]);

  // Request Geolocation and send to backend
  useEffect(() => {
    const trackLocation = async () => {
      try {
        const hasTracked = sessionStorage.getItem("location_tracked");
        if (hasTracked) return;
        
        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              try {
                await api.post("/api/v1/device/location", {
                  device_id: localStorage.getItem("device_id") || "web-browser",
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude
                });
                sessionStorage.setItem("location_tracked", "true");
              } catch (e) {
                console.error("Failed to sync location to backend", e);
              }
            },
            async (error) => {
              if (error.code === error.PERMISSION_DENIED) {
                try {
                  await api.post("/api/v1/device/location", {
                    device_id: localStorage.getItem("device_id") || "web-browser",
                    permission_status: "DENIED"
                  });
                  sessionStorage.setItem("location_tracked", "true");
                } catch (e) {
                  console.error("Failed to sync denied status to backend", e);
                }
              }
            }
          );
        }
      } catch (err) {
        console.error("Error with geolocation tracking", err);
      }
    };

    trackLocation();
  }, []);

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
      <ActivityTracker />

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
              {resolvedRole === "distributor" ? "Introducing Broker (IB)" : resolvedRole} Portal
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
                  "/student/contract-kyc", "/student/exams", "/student/entrance-exam",
                  "/student/invoice"
                ];
                const allowedUnverifiedRoutes = [
                  "/student/contract-kyc",
                  "/student/profile",
                  "/student/invoice",
                  "/student/courses"
                ];
                const isLocked =
                  resolvedRole === "student" &&
                  (enrolledCount === 0
                    ? !allowedUnenrolledRoutes.includes(item.path)
                    : (!isKycVerified && !allowedUnverifiedRoutes.includes(item.path)));

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
        <main className="flex-1 min-w-0 min-h-screen lg:ml-0">
          <div className="p-4 md:p-6 lg:p-8">
            {accessBlocked && resolvedRole === "student" && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-600 p-4 rounded-r-lg shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5"><Shield className="text-red-600 w-5 h-5" /></div>
                  <div>
                    <h3 className="text-red-800 font-bold text-lg">Access Suspended</h3>
                    <p className="text-red-700 mt-1">
                      Your access to platform features has been suspended by the administrator due to a pending payment. 
                      Please contact your Franchise IB or the administration to resolve this.
                    </p>
                  </div>
                </div>
              </div>
            )}
            {pendingBalance > 0 && resolvedRole === "student" && (
              <div className="mb-6 bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-lg shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5"><Shield className="text-orange-500 w-5 h-5" /></div>
                  <div>
                    <h3 className="text-orange-800 font-bold text-lg">Pending Payment Action Required</h3>
                    <p className="text-orange-700 mt-1">
                      You have an outstanding balance of{" "}
                      <strong className="font-bold">
                        ₹{pendingBalance.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                      </strong>{" "}
                      for your enrolled course. Please clear your dues to ensure uninterrupted access to the curriculum and exams.
                    </p>
                    {pendingDueDate && (
                      <p className="text-orange-600 font-semibold text-sm mt-1">
                        ⏰ Payment Due By:{" "}
                        {new Date(pendingDueDate).toLocaleString("en-IN", {
                          day: "2-digit", month: "short", year: "numeric",
                          hour: "2-digit", minute: "2-digit"
                        })}
                      </p>
                    )}
                  </div>
                </div>
                <Button 
                  onClick={() => setShowCheckoutModal(true)}
                  className="bg-orange-600 text-white hover:bg-orange-700 whitespace-nowrap px-6 font-bold"
                >
                  Pay Balance
                </Button>
              </div>
            )}
            {children}
          </div>
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
            {enrolledCount === 0
              ? "You must enroll in a course to access this area of the student portal. Visit the Courses tab to get started!"
              : "You must complete your eKYC verification to access this area of the student portal. Visit the KYC tab to get started!"}
          </p>
          <Button
            onClick={() => setShowLockedModal(false)}
            className="w-full bg-[#D50032] hover:bg-[#b00029] text-white rounded-xl"
          >
            Got it
          </Button>
        </DialogContent>
      </Dialog>

      {pendingCourse && showCheckoutModal && (
        <CourseCheckoutModal
          course={pendingCourse}
          pendingAmount={pendingBalance}
          onClose={() => setShowCheckoutModal(false)}
          onSuccess={() => {
            setShowCheckoutModal(false);
            window.location.reload();
          }}
        />
      )}

    </div>
  );
}

export default DashboardLayout;
