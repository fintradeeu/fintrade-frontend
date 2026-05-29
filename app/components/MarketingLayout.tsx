import { useEffect, useMemo, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router";
import { Search, Phone, Instagram, Facebook, Youtube, Linkedin, X, Download, UserCircle, Save, Mail, Smartphone, AlertTriangle, Menu, LogIn } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import logo from "../../imports/fintrade_logo.png";
import api from "../services/api";

export default function MarketingLayout() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [showViolationModal, setShowViolationModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("entrance_violation_popup") === "true") {
      setShowViolationModal(true);
      localStorage.removeItem("entrance_violation_popup");
    }
  }, []);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (e) {
      console.error("Logout API failed", e);
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setProfileOpen(false);
    navigate("/login");
  };

  const [profileForm, setProfileForm] = useState({
    full_name: "",
    email: "",
    phone: "",
  });
  const isAuthenticated = !!localStorage.getItem("token");
  const initials = useMemo(() => {
    return (profileForm.full_name || "User")
      .split(" ")
      .filter(Boolean)
      .map((name) => name[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [profileForm.full_name]);

  useEffect(() => {
    if (!profileOpen || !isAuthenticated) return;

    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setProfileForm({
          full_name: user.full_name || "",
          email: user.email || "",
          phone: user.phone || "",
        });
      } catch {
        // API data below will refresh the form.
      }
    }

  }, [profileOpen, isAuthenticated]);

  const handleProfileSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setProfileSaving(true);

    try {
      // Call backend API to update the profile in the database
      const res = await api.put("/auth/my-profile", profileForm);

      // Update localStorage with the latest server data
      localStorage.setItem("user", JSON.stringify(res.data));
      setProfileOpen(false);
    } catch (err) {
      console.error("Profile update failed", err);
      // Fallback local storage update
      const storedUser = localStorage.getItem("user");
      const currentUser = storedUser ? JSON.parse(storedUser) : {};
      localStorage.setItem(
        "user",
        JSON.stringify({
          ...currentUser,
          full_name: profileForm.full_name,
          email: profileForm.email,
          phone: profileForm.phone || null,
        })
      );
      setProfileOpen(false);
    } finally {
      setProfileSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans" style={{ background: "radial-gradient(circle at 50% 50%, #FFFFFF 0%, #F8F8F8 50%, #F4F4F4 100%)" }}>

      {/* Search Overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-[9998] flex items-start justify-center pt-32" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }} onClick={() => setSearchOpen(false)}>
          <div className="w-full max-w-2xl mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 p-4 border-b border-gray-100">
              <Search className="h-5 w-5 text-gray-400" />
              <input autoFocus type="text" placeholder="Search courses, topics, videos..." className="flex-1 text-lg outline-none bg-transparent" style={{ color: "#121212" }} />
              <button onClick={() => setSearchOpen(false)} className="text-gray-400 hover:text-gray-600 text-sm font-medium px-2 py-1 rounded bg-gray-100">ESC</button>
            </div>
            <div className="p-4 text-sm text-gray-500">
              <p className="font-medium mb-3" style={{ color: "#121212" }}>Popular Searches</p>
              <div className="flex flex-wrap gap-2">
                {["Technical Analysis", "Options Trading", "Risk Management", "NIFTY", "Candlestick Patterns", "Trading Psychology"].map((t) => (
                  <span key={t} className="px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer hover:bg-[#D50032] hover:text-white transition-colors" style={{ background: "rgba(213,0,50,0.08)", color: "#D50032" }}>{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Utility Top Bar */}
      <div className="w-full z-[101] bg-[#121212] text-white" style={{ borderBottom: "1px solid rgba(213,0,50,0.2)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12 text-sm">
            <div className="flex items-center gap-4">
              <a href="tel:+919876543210" className="flex items-center gap-2 text-white bg-[#D50032] px-3.5 py-1.5 rounded-full font-bold shadow-[0_0_15px_rgba(213,0,50,0.45)] hover:bg-[#FF0000] hover:scale-105 transition-all duration-300">
                <Phone className="h-3.5 w-3.5 fill-current" /> <span className="hidden sm:inline">+91 92746 75947</span><span className="sm:hidden">Call</span>
              </a>
              <span className="text-gray-600 hidden sm:inline">|</span>
              <span className="text-gray-400 hidden sm:inline">Support & Info</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {[
                  { icon: Instagram, href: "https://www.instagram.com/the.fintrade/", label: "Instagram" },
                  { icon: Facebook, href: "https://www.facebook.com/profile.php?id=61589528075521", label: "Facebook" },
                  { icon: Youtube, href: "https://www.youtube.com/@The_FinTrade", label: "YouTube" },
                  { icon: Linkedin, href: "https://www.linkedin.com/in/the-fintrade-7230b040a/", label: "LinkedIn" },
                  { icon: X, href: "#", label: "X" },
                ].map((s) => (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded flex items-center justify-center text-gray-400 hover:text-[#D50032] transition-colors" title={s.label}>
                    <s.icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
              <span className="text-gray-600">|</span>
              <a href="#" className="flex items-center gap-2 text-gray-300 hover:text-[#D50032] transition-colors font-medium">
                <Download className="h-4 w-4" /> Download App
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Navbar */}
      <nav className="sticky top-0 z-[100] bg-white/90 border-b border-gray-100 shadow-[0_4px_30px_rgba(0,0,0,0.05)] backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 -translate-x-4 md:-translate-x-8">
            <div className="flex-shrink-0 flex items-center h-[50px] w-[140px] md:h-[60px] md:w-[220px]">
              <Link to="/" className="flex items-center justify-center h-full w-full overflow-hidden">
                <img
                  src={logo}
                  alt="FinTrade"
                  className="h-full w-full object-contain scale-[2.5] md:scale-[3.5] -translate-x-2 md:-translate-x-6 -translate-y-1 md:-translate-y-1.5"
                  style={{
                    filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.08))",
                    transformOrigin: "center center"
                  }}
                />
              </Link>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <Link to="/" className="text-gray-700 hover:text-[#D50032] transition-colors font-medium">Home</Link>
              <Link to="/courses" className="text-gray-700 hover:text-[#D50032] transition-colors font-medium">Courses</Link>
              <Link to="/markets" className="text-gray-700 hover:text-[#D50032] transition-colors font-medium">Markets</Link>
              <Link to="/category/all" className="text-gray-700 hover:text-[#D50032] transition-colors font-medium">Categories</Link>
              <Link to="/updates" className="text-gray-700 hover:text-[#D50032] transition-colors font-medium">Update</Link>
              <Link to="/blog" className="text-gray-700 hover:text-[#D50032] transition-colors font-medium">Blog</Link>
              <Link to="/about" className="text-gray-700 hover:text-[#D50032] transition-colors font-medium">About</Link>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setSearchOpen(true)} className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-gray-600 hover:text-[#D50032] hover:bg-[#D50032]/10 transition-all" title="Search">
                <Search className="h-4 w-4 md:h-5 md:w-5" />
              </button>
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={() => setProfileOpen(true)}
                  className="w-11 h-11 rounded-full flex items-center justify-center text-gray-700 hover:text-[#D50032] hover:bg-[#D50032]/10 transition-all"
                  title="Profile"
                  aria-label="Profile"
                >
                  <UserCircle className="h-8 w-8" />
                </button>
              ) : (
                <Link to="/login" className="inline-block select-none">
                  <button 
                    className="h-10 px-5 rounded-full bg-[#D50032] hover:bg-[#b00029] text-white font-extrabold text-xs sm:text-sm tracking-wide flex items-center gap-2 transition-all duration-300 shadow-[0_4px_12px_rgba(213,0,50,0.22)] hover:shadow-[0_6px_18px_rgba(213,0,50,0.32)] hover:scale-105 active:scale-95 border-0 cursor-pointer"
                  >
                    <LogIn className="h-3.5 w-3.5 sm:h-4 sm:w-4 stroke-[3]" />
                    <span>Login</span>
                  </button>
                </Link>
              )}
              {/* Mobile menu trigger */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden w-8 h-8 rounded-full flex items-center justify-center text-gray-600 hover:text-[#D50032] hover:bg-[#D50032]/10 transition-all active:scale-95"
                title="Menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Drawer */}
      <div
        className={`fixed inset-0 z-[1000] transition-opacity duration-300 ${isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      >
        {/* Backdrop overlay */}
        <div
          className="absolute inset-0 bg-black/55 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
        {/* Drawer Panel */}
        <aside
          className={`absolute top-0 left-0 bottom-0 w-64 bg-white shadow-2xl z-10 flex flex-col transition-transform duration-300 ease-out transform ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            }`}
        >
          {/* Drawer Header */}
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div className="h-[40px] w-[100px] overflow-hidden flex items-center justify-start">
              <img
                src={logo}
                alt="FinTrade"
                className="h-full w-full object-contain scale-[2.2] -translate-x-2 -translate-y-0.5"
                style={{ transformOrigin: "left center" }}
              />
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Drawer Links */}
          <nav className="flex-1 p-5 overflow-y-auto space-y-2">
            {[
              { label: "Home", path: "/" },
              { label: "Courses", path: "/courses" },
              { label: "Markets", path: "/markets" },
              { label: "Categories", path: "/category/all" },
              { label: "Update", path: "/updates" },
              { label: "Blog", path: "/blog" },
              { label: "About", path: "/about" },
            ].map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center px-4 py-3 rounded-xl font-bold text-sm text-gray-700 hover:text-[#D50032] hover:bg-[#D50032]/5 transition-all"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Drawer Footer */}
          <div className="p-5 border-t border-gray-100 bg-gray-50/50">
            {isAuthenticated ? (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setProfileOpen(true);
                }}
                className="w-full flex items-center gap-2.5 px-4 py-3 bg-[#FFF0F2] text-[#D50032] font-extrabold text-xs tracking-wider uppercase rounded-xl transition-all hover:bg-[#D50032] hover:text-white"
              >
                <UserCircle className="h-5 w-5" />
                View Profile
              </button>
            ) : (
              <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="w-full">
                <Button className="w-full bg-[#D50032] hover:bg-[#b00029] text-white font-extrabold py-3 rounded-xl text-xs tracking-wider uppercase shadow-md shadow-[#D50032]/10 transition-all hover:scale-[1.02]">
                  Login / Register
                </Button>
              </Link>
            )}
          </div>
        </aside>
      </div>

      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>

      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className="sm:max-w-[460px] bg-white p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100">
            <DialogTitle className="text-[#121212] flex items-center gap-3">
              <span className="w-11 h-11 rounded-full bg-[#D50032] text-white flex items-center justify-center text-sm font-bold">
                {initials}
              </span>
              Profile
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleProfileSave} className="px-6 py-5 space-y-4">
            <div>
              <Label htmlFor="publicProfileName">Full Name</Label>
              <div className="relative mt-2">
                <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="publicProfileName"
                  value={profileForm.full_name}
                  onChange={(event) => setProfileForm((current) => ({ ...current, full_name: event.target.value }))}
                  className="pl-10 bg-gray-50 border-gray-300 focus:border-[#D50032] focus:ring-[#D50032]"
                  disabled={profileSaving}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="publicProfileEmail">Email Address</Label>
              <div className="relative mt-2">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="publicProfileEmail"
                  type="email"
                  value={profileForm.email}
                  onChange={(event) => setProfileForm((current) => ({ ...current, email: event.target.value }))}
                  className="pl-10 bg-gray-50 border-gray-300 focus:border-[#D50032] focus:ring-[#D50032]"
                  disabled={profileSaving}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="publicProfilePhone">Phone Number</Label>
              <div className="relative mt-2">
                <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="publicProfilePhone"
                  type="tel"
                  value={profileForm.phone}
                  onChange={(event) => setProfileForm((current) => ({ ...current, phone: event.target.value }))}
                  className="pl-10 bg-gray-50 border-gray-300 focus:border-[#D50032] focus:ring-[#D50032]"
                  disabled={profileSaving}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <Button
                type="submit"
                className="flex-1 bg-[#D50032] hover:bg-[#b00029] text-white font-bold"
                disabled={profileSaving}
              >
                <Save className="mr-2 h-4 w-4" />
                {profileSaving ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                type="button"
                onClick={handleLogout}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold border border-gray-200"
              >
                Logout
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="py-12 relative z-10" style={{ background: "#121212", color: "white" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/about" className="hover:text-[#D50032] transition-colors">About Us</Link></li>
                <li><a href="#" className="hover:text-[#D50032] transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-[#D50032] transition-colors">Press</a></li>
                <li><Link to="/blog" className="hover:text-[#D50032] transition-colors">Blog</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Courses</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/courses" className="hover:text-[#D50032] transition-colors">Basic Trading</Link></li>
                <li><Link to="/courses" className="hover:text-[#D50032] transition-colors">Intermediate Trading</Link></li>
                <li><Link to="/courses" className="hover:text-[#D50032] transition-colors">Advanced Trading</Link></li>
                <li><Link to="/courses" className="hover:text-[#D50032] transition-colors">Master Trading</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/updates" className="hover:text-[#D50032] transition-colors">Market Updates</Link></li>
                <li><Link to={isAuthenticated ? "/student/lectures" : "/login"} className="hover:text-[#D50032] transition-colors">Live Classes</Link></li>
                <li><Link to={isAuthenticated ? "/student/ai-tutor" : "/login"} className="hover:text-[#D50032] transition-colors">AI Tutor</Link></li>
                <li><a href="#" className="hover:text-[#D50032] transition-colors">Help Center</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Connect</h4>
              <div className="flex gap-4">
                <a href="https://www.facebook.com/profile.php?id=61589528075521" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#D50032] transition-colors"><Facebook className="h-5 w-5" /></a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#D50032] transition-colors"><X className="h-5 w-5" /></a>
                <a href="https://www.linkedin.com/in/the-fintrade-7230b040a/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#D50032] transition-colors"><Linkedin className="h-5 w-5" /></a>
                <a href="https://www.instagram.com/the.fintrade/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#D50032] transition-colors"><Instagram className="h-5 w-5" /></a>
                <a href="https://www.youtube.com/@The_FinTrade" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#D50032] transition-colors"><Youtube className="h-5 w-5" /></a>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 text-center text-gray-500 text-sm">
            <p>&copy; {new Date().getFullYear()} FinTrade. All rights reserved.</p>
          </div>
        </div>
      </footer>
      {/* Proctoring Violation Warning Modal */}
      {showViolationModal && (
        <div className="fixed inset-0 z-[99999] bg-[#121212]/95 backdrop-blur-md flex items-center justify-center p-4">
          <Card className="max-w-xl w-full p-8 bg-white border-t-4 border-red-500 shadow-2xl relative">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center animate-bounce">
                <AlertTriangle size={36} className="text-red-500" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-center text-[#0B2A5B] mb-2">Proctored Exam Warning</h2>
            <p className="text-center text-red-600 font-semibold mb-6">
              System detected tab switching or application switching during your entrance exam!
            </p>

            <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 mb-8 space-y-3">
              <h3 className="font-bold text-[#0B2A5B] text-sm uppercase tracking-wider mb-2">Rules & Regulations:</h3>
              <p className="text-xs text-gray-600 leading-relaxed flex items-start gap-2">
                <span className="text-red-500 font-bold">•</span>
                <span>Opening another tab, browser window, or minimizing the screen is strictly prohibited.</span>
              </p>
              <p className="text-xs text-gray-600 leading-relaxed flex items-start gap-2">
                <span className="text-red-500 font-bold">•</span>
                <span>Your exam attempt has been terminated, and all progress up to the point of violation has been auto-submitted.</span>
              </p>
              <p className="text-xs text-gray-600 leading-relaxed flex items-start gap-2">
                <span className="text-red-500 font-bold">•</span>
                <span>You can review your attempt status and start another attempt by clicking below.</span>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => {
                  setShowViolationModal(false);
                  navigate("/student/entrance-exam");
                }}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold h-12 text-md shadow-lg shadow-green-600/20"
              >
                Start Same Exam
              </Button>
              <Button
                onClick={() => setShowViolationModal(false)}
                variant="outline"
                className="flex-1 border-2 border-red-200 text-red-600 hover:bg-red-50 font-bold h-12 text-md"
              >
                Close
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
