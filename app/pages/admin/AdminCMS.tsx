import { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "../../components/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Megaphone, Trash2, Plus, Save, RefreshCw, Globe, Phone, Video,
  Star, BookOpen, CheckCircle2, XCircle, LayoutTemplate, Link as LinkIcon,
  AlertTriangle, Info, Users, Award, TrendingUp, Layers, Newspaper, Flame
} from "lucide-react";
import api from "../../services/api";
import { confirmPopup } from "../../utils/popup";

const getImageUrl = (path?: string) => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) return path;
  const base = api.defaults.baseURL || "";
  const cleanBase = base.endsWith("/") ? base.slice(0, -1) : base;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
};

// ── Types ─────────────────────────────────────────────────────────────
interface Announcement {
  id: number;
  title: string;
  content: string;
  priority: number;
  is_active: boolean;
  published_at: string;
  expires_at?: string;
}

interface Course {
  id: number;
  title: string;
  slug: string;
  price: number;
  original_price?: number;
  is_published: boolean;
  is_featured: boolean;
  is_popular?: boolean;
  marketing_highlights?: string[];
  difficulty_level: string;
}

interface ShowcaseVideo {
  title: string;
  subtitle: string;
  duration: string;
  thumbnail: string;
  url: string;
}

interface BenefitItem {
  num: string;
  title: string;
  desc: string;
  icon: string;
}

interface ServiceItem {
  icon: string;
  title: string;
  desc: string;
}

interface QuickTipItem {
  id: string;
  num: string;
  title: string;
  author: string;
  views: string;
  thumbnail: string;
  embedUrl: string;
}

interface WhyChooseItem {
  num: string;
  title: string;
  desc: string;
  icon: string;
}

interface StatItem {
  value: string;
  label: string;
}

interface LeadershipItem {
  name: string;
  title: string;
  monogram: string;
  headerDetail: string;
  stats: StatItem[];
  bio: string;
  tags: string[];
  profile_image?: string;
}

interface HeroButtonsConfig {
  btn1_name: string;
  btn2_name: string;
  btn2_youtube_url: string;
  btn3_name: string;
  btn3_file_url: string;
}

interface CarouselSlideItem {
  title: string;
  subtitle: string;
  buttonText: string;
  link: string;
}

interface LiveClassItem {
  title: string;
  instructor: string;
  date: string;
  time: string;
  status: "live" | "upcoming";
  students: number;
  thumbnail: string;
  is_visible: boolean;
  lecture_link?: string;
  scheduled_at?: string;
}

interface SectionVisibilityConfig {
  show_announcements: boolean;
  show_hero_slider: boolean;
  show_courses: boolean;
  show_live_classes: boolean;
  show_timeline: boolean;
  show_benefits: boolean;
  show_services: boolean;
  show_quick_tips: boolean;
  show_why_choose: boolean;
  show_leadership: boolean;
  show_certificate: boolean;
  show_emi: boolean;
  show_showcase_videos: boolean;
  show_blog: boolean;
  show_modules: boolean;
  show_roadmap: boolean;
  show_career_pathways: boolean;
  show_cta: boolean;
  show_testimonials?: boolean;
  show_terms?: boolean;
}

interface EMIPaymentItem {
  title: string;
  tagline: string;
  color: string;
  bullets: string[];
  btnText: string;
}

interface EMIConfig {
  heading: string;
  subheading: string;
  plans?: EMIPaymentItem[];
}

interface CertificateConfig {
  heading: string;
  subheading: string;
  cert1_image?: string;
  cert2_image?: string;
  benefit1_title?: string;
  benefit1_desc?: string;
  benefit2_title?: string;
  benefit2_desc?: string;
  benefit3_title?: string;
  benefit3_desc?: string;
}

interface AboutUsStat {
  val: string;
  lbl: string;
}

interface AboutUsVisionMission {
  text: string;
  bullets: string[];
}

interface LandingConfig {
  hero?: { title: string; highlight: string; subtitle: string; badge: string };
  contact?: { phone: string; phone_href: string };
  social?: { instagram: string; facebook: string; youtube: string; linkedin: string };
  showcase_videos?: ShowcaseVideo[];
  benefits?: BenefitItem[];
  services?: ServiceItem[];
  quick_tips?: QuickTipItem[];
  why_choose?: WhyChooseItem[];
  leadership?: LeadershipItem[];
  hero_buttons?: HeroButtonsConfig;
  carousel_slides?: CarouselSlideItem[];
  live_classes?: LiveClassItem[];
  section_visibility?: SectionVisibilityConfig;
  emi?: EMIConfig;
  certificate?: CertificateConfig;
  program_modules?: any[];
  hero_backgrounds?: string[];
  about_us_slides?: string[];
  about_us_stats?: AboutUsStat[];
  about_us_text?: string[];
  about_us_vision?: AboutUsVisionMission;
  about_us_mission?: AboutUsVisionMission;
}

// ── Sub-components ────────────────────────────────────────────────────

function TabBtn({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${
        active ? "bg-[#E53935] text-white shadow-lg" : "text-gray-600 hover:bg-gray-100"
      }`}
    >
      {icon} {label}
    </button>
  );
}

function Toast({ message, type }: { message: string; type: "success" | "error" }) {
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl text-white font-semibold text-sm transition-all ${
      type === "success" ? "bg-green-600" : "bg-red-600"
    }`}>
      {type === "success" ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
      {message}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────

export default function AdminCMS() {
  const [activeTab, setActiveTab] = useState<"announcements" | "courses" | "settings" | "videos" | "benefits" | "services" | "quick_tips" | "why_choose" | "leadership" | "hero_slider" | "live_classes" | "certificate" | "emi" | "modules_timeline" | "reviews" | "articles" | "about_us">("announcements");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Announcements state
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [newAnn, setNewAnn] = useState({ title: "", content: "", priority: 1 });

  // Courses state
  const [courses, setCourses] = useState<Course[]>([]);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  // Reviews state
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // Landing config state
  const [config, setConfig] = useState<LandingConfig>({});
  const [configLoading, setConfigLoading] = useState(true);

  // Articles state
  const [articles, setArticles] = useState<any[]>([]);
  const [articlesLoading, setArticlesLoading] = useState(false);

  // About Us CMS state
  const [aboutUsConfig, setAboutUsConfig] = useState<any>({
    slides: [],
    stats: [],
    text: [],
    vision: { title: "", content: "" },
    mission: { title: "", content: "" }
  });
  const [aboutUsLoading, setAboutUsLoading] = useState(true);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Fetch Data ──────────────────────────────────────────────────────
  const fetchAnnouncements = useCallback(async () => {
    try {
      const res = await api.get("/dashboard/admin/announcements");
      setAnnouncements(res.data);
    } catch { /* silent */ }
  }, []);

  const fetchCourses = useCallback(async () => {
    try {
      const res = await api.get("/admin/courses");
      setCourses(res.data.courses || res.data || []);
    } catch { /* silent */ }
  }, []);

  const fetchConfig = useCallback(async () => {
    try {
      setConfigLoading(true);
      const res = await api.get("/settings/landing-page");
      setConfig(res.data);
    } catch { /* silent */ }
    finally { setConfigLoading(false); }
  }, []);

  const fetchReviews = useCallback(async () => {
    setReviewsLoading(true);
    try {
      const res = await api.get("/feedback");
      setReviews(res.data);
    } catch { /* silent */ }
    finally { setReviewsLoading(false); }
  }, []);

  const fetchArticles = useCallback(async () => {
    setArticlesLoading(true);
    try {
      const res = await api.get("/admin/news");
      setArticles(res.data);
    } catch { /* silent */ }
    finally { setArticlesLoading(false); }
  }, []);

  const fetchAboutUsConfig = useCallback(async () => {
    try {
      setAboutUsLoading(true);
      const res = await api.get("/settings/about-us");
      setAboutUsConfig(res.data || {
        slides: [],
        stats: [],
        text: [],
        vision: { title: "", content: "" },
        mission: { title: "", content: "" }
      });
    } catch { /* silent */ }
    finally { setAboutUsLoading(false); }
  }, []);

  const toggleArticleVisibility = async (id: number, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "published" ? "draft" : "published";
      await api.put(`/admin/news/${id}`, { status: newStatus });
      fetchArticles();
      showToast(`Article status updated to ${newStatus}!`, "success");
    } catch {
      showToast("Failed to update article status", "error");
    }
  };

  const toggleReviewVisibility = async (id: number, show: boolean) => {
    try {
      await api.put(`/feedback/${id}/toggle-visibility?show_on_landing_page=${show}`);
      fetchReviews();
      showToast("Review visibility updated!", "success");
    } catch {
      showToast("Failed to update review visibility", "error");
    }
  };

  const deleteReview = async (id: number) => {
    if (!(await confirmPopup("Delete this student review?"))) return;
    try {
      await api.delete(`/feedback/${id}`);
      fetchReviews();
      showToast("Review deleted", "success");
    } catch {
      showToast("Failed to delete review", "error");
    }
  };

  useEffect(() => {
    fetchAnnouncements();
    fetchCourses();
    fetchConfig();
    fetchReviews();
    fetchArticles();
    fetchAboutUsConfig();
  }, [fetchAnnouncements, fetchCourses, fetchConfig, fetchReviews, fetchArticles, fetchAboutUsConfig]);

  // ── Announcements CRUD ──────────────────────────────────────────────
  const createAnnouncement = async () => {
    if (!newAnn.title || !newAnn.content) return;
    try {
      await api.post("/dashboard/admin/announcements", newAnn);
      setNewAnn({ title: "", content: "", priority: 1 });
      fetchAnnouncements();
      showToast("Announcement published!", "success");
    } catch {
      showToast("Failed to create announcement", "error");
    }
  };

  const deleteAnnouncement = async (id: number) => {
    if (!(await confirmPopup("Delete this announcement?"))) return;
    try {
      await api.delete(`/dashboard/admin/announcements/${id}`);
      fetchAnnouncements();
      showToast("Deleted", "success");
    } catch {
      showToast("Failed to delete", "error");
    }
  };

  // ── Course CMS Actions ──────────────────────────────────────────────
  const toggleFeatured = async (course: Course) => {
    try {
      await api.put(`/admin/courses/${course.id}`, { is_featured: !course.is_featured });
      fetchCourses();
      showToast(`${course.is_featured ? "Removed from" : "Added to"} featured`, "success");
    } catch {
      showToast("Failed to update", "error");
    }
  };

  const togglePopular = async (course: Course) => {
    try {
      await api.put(`/admin/courses/${course.id}`, { is_popular: !course.is_popular });
      fetchCourses();
      showToast(`${course.is_popular ? "Removed from" : "Set as"} most popular`, "success");
    } catch {
      showToast("Failed to update", "error");
    }
  };

  const saveHighlights = async (course: Course) => {
    try {
      await api.put(`/admin/courses/${course.id}`, {
        marketing_highlights: course.marketing_highlights,
        original_price: course.original_price,
      });
      fetchCourses();
      setEditingCourse(null);
      showToast("Course highlights saved!", "success");
    } catch {
      showToast("Failed to save highlights", "error");
    }
  };

  // ── Config Save ─────────────────────────────────────────────────────
  const saveConfig = async (section: Partial<LandingConfig>) => {
    try {
      await api.put("/admin/settings/landing-page", section);
      fetchConfig();
      showToast("Saved!", "success");
    } catch {
      showToast("Failed to save", "error");
    }
  };

  const saveAboutUsConfig = async (updatedFields: any) => {
    try {
      const res = await api.put("/admin/settings/about-us", updatedFields);
      if (res.data) {
        setAboutUsConfig(res.data);
      } else {
        fetchAboutUsConfig();
      }
      showToast("About Us content saved!", "success");
    } catch {
      showToast("Failed to save About Us content", "error");
    }
  };

  return (
    <DashboardLayout role="admin">
      {toast && <Toast {...toast} />}

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(229,57,53,0.1)" }}>
            <LayoutTemplate className="h-5 w-5 text-[#E53935]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#121212" }}>Site Content Manager</h1>
            <p className="text-gray-500 text-sm">Control what appears on the public landing page</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <TabBtn active={activeTab === "announcements"} onClick={() => setActiveTab("announcements")} icon={<Megaphone size={16} />} label="Announcements" />
        <TabBtn active={activeTab === "hero_slider"} onClick={() => setActiveTab("hero_slider")} icon={<LayoutTemplate size={16} />} label="Section 1: Hero & Carousel" />
        <TabBtn active={activeTab === "courses"} onClick={() => setActiveTab("courses")} icon={<BookOpen size={16} />} label="Section 2: Professional Programs" />
        <TabBtn active={activeTab === "live_classes"} onClick={() => setActiveTab("live_classes")} icon={<Video size={16} />} label="Section 3: Live Classes" />
        <TabBtn active={activeTab === "videos"} onClick={() => setActiveTab("videos")} icon={<Video size={16} />} label="Section 4: Showcase Videos" />
        <TabBtn active={activeTab === "modules_timeline"} onClick={() => setActiveTab("modules_timeline")} icon={<Layers size={16} />} label="Section 4.5: Program Modules" />
        <TabBtn active={activeTab === "benefits"} onClick={() => setActiveTab("benefits")} icon={<LayoutTemplate size={16} />} label="Section 5: Program Benefits" />
        <TabBtn active={activeTab === "services"} onClick={() => setActiveTab("services")} icon={<Globe size={16} />} label="Section 6: Our Services" />
        <TabBtn active={activeTab === "quick_tips"} onClick={() => setActiveTab("quick_tips")} icon={<Video size={16} />} label="Section 7: Quick Tips" />
        <TabBtn active={activeTab === "why_choose"} onClick={() => setActiveTab("why_choose")} icon={<LayoutTemplate size={16} />} label="Section 8: Why Choose Us" />
        <TabBtn active={activeTab === "leadership"} onClick={() => setActiveTab("leadership")} icon={<Users size={16} />} label="Section 9: Leadership Team" />
        <TabBtn active={activeTab === "certificate"} onClick={() => setActiveTab("certificate")} icon={<Award size={16} />} label="Section 10: Certificate Showcase" />
        <TabBtn active={activeTab === "emi"} onClick={() => setActiveTab("emi")} icon={<TrendingUp size={16} />} label="Section 11: EMI & Payment Plans" />
        <TabBtn active={activeTab === "reviews"} onClick={() => setActiveTab("reviews")} icon={<Star size={16} />} label="Section 9.5: Student Reviews" />
        <TabBtn active={activeTab === "articles"} onClick={() => setActiveTab("articles")} icon={<Newspaper size={16} />} label="Section 12: Articles Moderation" />
        <TabBtn active={activeTab === "about_us"} onClick={() => setActiveTab("about_us")} icon={<Users size={16} />} label="Section 13: About Us Page" />
        <TabBtn active={activeTab === "settings"} onClick={() => setActiveTab("settings")} icon={<Globe size={16} />} label="Site Settings" />
      </div>

      {/* ── TAB: Announcements ─────────────────────────────────────── */}
      {activeTab === "announcements" && (
        <div className="space-y-6">
          {/* Create Form */}
          <Card className="p-6 border border-gray-100 shadow-sm">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: "#121212" }}>
              <Plus size={18} className="text-[#E53935]" /> New Announcement
            </h2>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor="ann-title">Title</Label>
                <Input
                  id="ann-title"
                  value={newAnn.title}
                  onChange={e => setNewAnn(p => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. New Batch Starting June 1st"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="ann-priority">Priority (1 = highest)</Label>
                <Input
                  id="ann-priority"
                  type="number"
                  min={1}
                  max={10}
                  value={newAnn.priority}
                  onChange={e => setNewAnn(p => ({ ...p, priority: Number(e.target.value) }))}
                  className="mt-1"
                />
              </div>
            </div>
            <div className="mb-4">
              <Label htmlFor="ann-content">Content</Label>
              <textarea
                id="ann-content"
                value={newAnn.content}
                onChange={e => setNewAnn(p => ({ ...p, content: e.target.value }))}
                placeholder="Announcement text that appears in the ticker..."
                rows={3}
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#E53935]/30 focus:border-[#E53935]"
              />
            </div>
            <Button
              onClick={createAnnouncement}
              className="bg-[#E53935] text-white hover:bg-[#b71c1c]"
              disabled={!newAnn.title || !newAnn.content}
            >
              <Megaphone size={16} className="mr-2" /> Publish Announcement
            </Button>
          </Card>

          {/* Announcements List */}
          <Card className="p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold" style={{ color: "#121212" }}>
                Active Announcements ({announcements.length})
              </h2>
              <Button variant="ghost" size="sm" onClick={fetchAnnouncements}>
                <RefreshCw size={14} className="mr-1" /> Refresh
              </Button>
            </div>
            {announcements.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Megaphone size={40} className="mx-auto mb-3 opacity-30" />
                <p>No announcements yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {announcements.map(ann => (
                  <div key={ann.id} className={`flex items-start justify-between p-4 rounded-xl border ${ann.is_active ? "border-green-200 bg-green-50/50" : "border-gray-200 bg-gray-50/50"}`}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm" style={{ color: "#121212" }}>{ann.title}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${ann.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                          {ann.is_active ? "Active" : "Inactive"}
                        </span>
                        <span className="text-xs bg-[#E53935]/10 text-[#E53935] px-2 py-0.5 rounded-full font-bold">
                          P{ann.priority}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">{ann.content}</p>
                    </div>
                    <button
                      onClick={() => deleteAnnouncement(ann.id)}
                      className="ml-4 p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ── TAB: Hero & Carousel ──────────────────────────────────── */}
      {activeTab === "hero_slider" && !configLoading && (
        <div className="space-y-6">
          <Card className="p-4 border border-blue-100 bg-blue-50/50">
            <div className="flex items-start gap-3">
              <Info size={18} className="text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-700">
                Manage the main <strong>Landing Page Hero Slider</strong>. You can upload background images and configure the floating carousel text cards.
              </p>
            </div>
          </Card>

          <Card className="p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold" style={{ color: "#121212" }}>Hero Background Images</h2>
              <Button onClick={() => saveConfig({ hero_backgrounds: config.hero_backgrounds })} className="bg-[#E53935] text-white hover:bg-[#b71c1c]">
                <Save size={16} className="mr-2" /> Save Hero Backgrounds
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {(config.hero_backgrounds || []).map((slideUrl, idx) => (
                <div key={idx} className="relative group rounded-xl overflow-hidden border border-gray-200 shadow-sm aspect-video">
                  <img src={getImageUrl(slideUrl)} alt={`Hero Background ${idx + 1}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={async () => {
                        const newSlides = [...(config.hero_backgrounds || [])];
                        newSlides.splice(idx, 1);
                        setConfig(p => ({ ...p, hero_backgrounds: newSlides }));
                      }}
                      className="p-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors transform hover:scale-110"
                      title="Remove this background"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                  <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 text-white text-xs rounded-md backdrop-blur-sm">
                    Background {idx + 1}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 border-t border-gray-100 pt-6">
              <Label className="text-gray-700 font-bold mb-2 block">Upload New Hero Background</Label>
              <div className="flex items-center gap-4">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    if (!e.target.files || e.target.files.length === 0) return;
                    const file = e.target.files[0];
                    const formData = new FormData();
                    formData.append("file", file);

                    try {
                      showToast("Uploading background image...", "success");
                      const res = await api.post("/admin/upload", formData, {
                        headers: { "Content-Type": "multipart/form-data" }
                      });
                      if (res.data && res.data.url) {
                        const newSlides = [...(config.hero_backgrounds || []), res.data.url];
                        setConfig(p => ({ ...p, hero_backgrounds: newSlides }));
                        showToast("Background uploaded successfully!", "success");
                      }
                    } catch {
                      showToast("Background upload failed.", "error");
                    }
                  }}
                  className="cursor-pointer max-w-md h-12 flex items-center"
                />
              </div>
            </div>
          </Card>

          <Card className="p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold" style={{ color: "#121212" }}>Carousel Floating Cards</h2>
              <Button onClick={() => saveConfig({ carousel_slides: config.carousel_slides })} className="bg-[#E53935] text-white hover:bg-[#b71c1c]">
                <Save size={16} className="mr-2" /> Save Carousel Cards
              </Button>
            </div>

            <div className="space-y-4">
              {(config.carousel_slides || []).map((slide, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-gray-50 border border-gray-100 relative">
                  <div className="absolute top-4 right-4 flex items-center gap-3">
                    <span className="bg-gray-200 text-gray-600 px-3 py-1 text-[10px] font-black rounded-full uppercase tracking-wider">Card #{idx + 1}</span>
                    <button
                      onClick={async () => {
                        if (!(await confirmPopup("Remove this carousel card?"))) return;
                        const list = [...(config.carousel_slides || [])];
                        list.splice(idx, 1);
                        setConfig(p => ({ ...p, carousel_slides: list }));
                      }}
                      className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 font-semibold transition-colors"
                      title="Remove this card"
                    >
                      <Trash2 size={14} /> Remove
                    </button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4 max-w-4xl">
                    <div>
                      <Label className="text-xs">Title</Label>
                      <Input
                        value={slide.title || ""}
                        onChange={e => {
                          const list = [...(config.carousel_slides || [])];
                          list[idx] = { ...list[idx], title: e.target.value };
                          setConfig(p => ({ ...p, carousel_slides: list }));
                        }}
                        className="bg-white mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Subtitle</Label>
                      <Input
                        value={slide.subtitle || ""}
                        onChange={e => {
                          const list = [...(config.carousel_slides || [])];
                          list[idx] = { ...list[idx], subtitle: e.target.value };
                          setConfig(p => ({ ...p, carousel_slides: list }));
                        }}
                        className="bg-white mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Button Text</Label>
                      <Input
                        value={slide.buttonText || ""}
                        onChange={e => {
                          const list = [...(config.carousel_slides || [])];
                          list[idx] = { ...list[idx], buttonText: e.target.value };
                          setConfig(p => ({ ...p, carousel_slides: list }));
                        }}
                        className="bg-white mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Button Link</Label>
                      <Input
                        value={slide.link || ""}
                        onChange={e => {
                          const list = [...(config.carousel_slides || [])];
                          list[idx] = { ...list[idx], link: e.target.value };
                          setConfig(p => ({ ...p, carousel_slides: list }));
                        }}
                        placeholder="e.g. #courses or /about"
                        className="bg-white mt-1"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-100">
              <Button
                type="button"
                variant="outline"
                onClick={async () => {
                  const list = [...(config.carousel_slides || [])];
                  list.push({ title: "", subtitle: "", buttonText: "", link: "" });
                  setConfig(p => ({ ...p, carousel_slides: list }));
                }}
                className="border border-[#E53935] text-[#E53935] hover:bg-[#E53935]/5"
              >
                <Plus size={16} className="mr-2" /> Add Carousel Card
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* ── TAB: Featured Courses ──────────────────────────────────── */}
      {activeTab === "courses" && (
        <div className="space-y-4">
          <Card className="p-4 border border-blue-100 bg-blue-50/50">
            <div className="flex items-start gap-3">
              <Info size={18} className="text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-700">
                Toggle which courses appear on the public landing page. You can also set a <strong>strikethrough price</strong> and up to <strong>3 marketing highlights</strong> for each featured course.
              </p>
            </div>
          </Card>

          {courses.map(course => (
            <Card key={course.id} className="p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${course.is_published ? "bg-green-500" : "bg-gray-300"}`} title={course.is_published ? "Published" : "Draft"} />
                  <span className="font-semibold text-sm" style={{ color: "#121212" }}>{course.title}</span>
                  <span className="text-xs text-gray-400 capitalize">{course.difficulty_level}</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => togglePopular(course)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                      course.is_popular
                        ? "bg-[#D50032] text-white shadow-md"
                        : "border border-gray-300 text-gray-600 hover:border-[#D50032] hover:text-[#D50032]"
                    }`}
                  >
                    <Flame size={14} fill={course.is_popular ? "white" : "none"} />
                    {course.is_popular ? "Most Popular" : "Set Popular"}
                  </button>
                  <button
                    onClick={() => toggleFeatured(course)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                      course.is_featured
                        ? "bg-[#E53935] text-white shadow-md"
                        : "border border-gray-300 text-gray-600 hover:border-[#E53935] hover:text-[#E53935]"
                    }`}
                  >
                    <Star size={14} fill={course.is_featured ? "white" : "none"} />
                    {course.is_featured ? "Featured" : "Set Featured"}
                  </button>
                  {course.is_featured && (
                    <button
                      onClick={() => setEditingCourse(editingCourse?.id === course.id ? null : { ...course })}
                      className="px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:border-[#E53935] hover:text-[#E53935] transition-colors"
                    >
                      Edit Details
                    </button>
                  )}
                </div>
              </div>

              {/* Inline editing panel */}
              {editingCourse?.id === course.id && (
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Current Price (₹)</Label>
                      <p className="text-sm font-bold text-gray-800 mt-1">₹{course.price.toLocaleString()}</p>
                    </div>
                    <div>
                      <Label htmlFor={`op-${course.id}`}>Strikethrough Price (₹)</Label>
                      <Input
                        id={`op-${course.id}`}
                        type="number"
                        value={editingCourse.original_price || ""}
                        onChange={e => setEditingCourse(p => p ? { ...p, original_price: Number(e.target.value) } : p)}
                        placeholder="e.g. 20000"
                        className="mt-1 h-8"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Marketing Highlights (3 bullet points)</Label>
                    <div className="space-y-2 mt-2">
                      {[0, 1, 2].map(i => (
                        <Input
                          key={i}
                          value={editingCourse.marketing_highlights?.[i] || ""}
                          onChange={e => {
                            const hl = [...(editingCourse.marketing_highlights || ["", "", ""])];
                            hl[i] = e.target.value;
                            setEditingCourse(p => p ? { ...p, marketing_highlights: hl } : p);
                          }}
                          placeholder={`Highlight ${i + 1} (e.g. Industry Recognized Certification)`}
                          className="h-8 text-sm"
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button size="sm" onClick={() => saveHighlights(editingCourse)} className="bg-[#E53935] text-white hover:bg-[#b71c1c]">
                      <Save size={14} className="mr-1" /> Save Changes
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingCourse(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* ── TAB: Live Classes ───────────────────────────────────────── */}
      {activeTab === "live_classes" && !configLoading && (
        <div className="space-y-6">
          <Card className="p-4 border border-blue-100 bg-blue-50/50">
            <div className="flex items-start gap-3">
              <Info size={18} className="text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-700">
                Manage the schedule and details for <strong>Live Classes Section</strong> on the landing page. You can add, edit, or delete live classes. Toggle which classes are visible on the website and upload custom image thumbnails!
              </p>
            </div>
          </Card>

          <div className="space-y-6">
            {(config.live_classes || []).map((lecture, idx) => (
              <Card key={idx} className="p-6 border border-gray-100 shadow-sm relative group hover:border-[#E53935]/30 transition-all duration-300">
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-400">Class #{idx + 1}</span>
                  <button
                    onClick={async () => {
                      if (!(await confirmPopup("Remove this live class?"))) return;
                      const list = [...(config.live_classes || [])];
                      list.splice(idx, 1);
                      setConfig(p => ({ ...p, live_classes: list }));
                    }}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    title="Remove this class"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="grid md:grid-cols-12 gap-5">
                  {/* Title */}
                  <div className="md:col-span-6">
                    <Label htmlFor={`lc-title-${idx}`}>Lecture Title</Label>
                    <Input
                      id={`lc-title-${idx}`}
                      value={lecture.title}
                      onChange={e => {
                        const list = [...(config.live_classes || [])];
                        list[idx] = { ...list[idx], title: e.target.value };
                        setConfig(p => ({ ...p, live_classes: list }));
                      }}
                      placeholder="e.g. Technical Analysis Masterclass"
                      className="mt-1"
                    />
                  </div>

                  {/* Instructor */}
                  <div className="md:col-span-4">
                    <Label htmlFor={`lc-instructor-${idx}`}>Instructor Name</Label>
                    <Input
                      id={`lc-instructor-${idx}`}
                      value={lecture.instructor}
                      onChange={e => {
                        const list = [...(config.live_classes || [])];
                        list[idx] = { ...list[idx], instructor: e.target.value };
                        setConfig(p => ({ ...p, live_classes: list }));
                      }}
                      placeholder="e.g. Amit Desai"
                      className="mt-1"
                    />
                  </div>

                  {/* Status Selection */}
                  <div className="md:col-span-2">
                    <Label htmlFor={`lc-status-${idx}`}>Status</Label>
                    <select
                      id={`lc-status-${idx}`}
                      value={lecture.status}
                      onChange={e => {
                        const list = [...(config.live_classes || [])];
                        list[idx] = { ...list[idx], status: e.target.value as "live" | "upcoming" };
                        setConfig(p => ({ ...p, live_classes: list }));
                      }}
                      className="mt-1 flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="live">Live</option>
                      <option value="upcoming">Upcoming</option>
                    </select>
                  </div>

                  {/* Date */}
                  <div className="md:col-span-4">
                    <Label htmlFor={`lc-date-${idx}`}>Date Label</Label>
                    <Input
                      id={`lc-date-${idx}`}
                      value={lecture.date}
                      onChange={e => {
                        const list = [...(config.live_classes || [])];
                        list[idx] = { ...list[idx], date: e.target.value };
                        setConfig(p => ({ ...p, live_classes: list }));
                      }}
                      placeholder="e.g. April 18, 2026"
                      className="mt-1"
                    />
                  </div>

                  {/* Time */}
                  <div className="md:col-span-4">
                    <Label htmlFor={`lc-time-${idx}`}>Time Label</Label>
                    <Input
                      id={`lc-time-${idx}`}
                      value={lecture.time}
                      onChange={e => {
                        const list = [...(config.live_classes || [])];
                        list[idx] = { ...list[idx], time: e.target.value };
                        setConfig(p => ({ ...p, live_classes: list }));
                      }}
                      placeholder="e.g. 10:00 AM IST"
                      className="mt-1"
                    />
                  </div>

                  {/* Students Enrolled */}
                  <div className="md:col-span-2">
                    <Label htmlFor={`lc-students-${idx}`}>Students Count</Label>
                    <Input
                      id={`lc-students-${idx}`}
                      type="number"
                      value={lecture.students}
                      onChange={e => {
                        const list = [...(config.live_classes || [])];
                        list[idx] = { ...list[idx], students: Number(e.target.value) };
                        setConfig(p => ({ ...p, live_classes: list }));
                      }}
                      placeholder="145"
                      className="mt-1"
                    />
                  </div>

                  {/* Show on Site Select checkbox */}
                  <div className="md:col-span-2 flex items-center gap-2 pt-6">
                    <input
                      id={`lc-visible-${idx}`}
                      type="checkbox"
                      checked={lecture.is_visible}
                      onChange={e => {
                        const list = [...(config.live_classes || [])];
                        list[idx] = { ...list[idx], is_visible: e.target.checked };
                        setConfig(p => ({ ...p, live_classes: list }));
                      }}
                      className="w-4 h-4 rounded text-[#E53935] focus:ring-[#E53935]"
                    />
                    <Label htmlFor={`lc-visible-${idx}`} className="cursor-pointer">Show on site</Label>
                  </div>

                  {/* Scheduled Datetime */}
                  <div className="md:col-span-6">
                    <Label htmlFor={`lc-scheduled-${idx}`}>Scheduled Datetime (For 1-hour email notification)</Label>
                    <Input
                      id={`lc-scheduled-${idx}`}
                      type="datetime-local"
                      value={lecture.scheduled_at || ""}
                      onChange={e => {
                        const list = [...(config.live_classes || [])];
                        list[idx] = { ...list[idx], scheduled_at: e.target.value };
                        setConfig(p => ({ ...p, live_classes: list }));
                      }}
                      className="mt-1"
                    />
                  </div>

                  {/* Lecture Link */}
                  <div className="md:col-span-6">
                    <Label htmlFor={`lc-link-${idx}`}>Lecture Link (Join URL sent 1 hour before class)</Label>
                    <Input
                      id={`lc-link-${idx}`}
                      value={lecture.lecture_link || ""}
                      onChange={e => {
                        const list = [...(config.live_classes || [])];
                        list[idx] = { ...list[idx], lecture_link: e.target.value };
                        setConfig(p => ({ ...p, live_classes: list }));
                      }}
                      placeholder="e.g. https://zoom.us/j/123456789"
                      className="mt-1"
                    />
                  </div>

                  {/* Custom Thumbnail Image Uploader */}
                  <div className="md:col-span-12">
                    <Label className="text-gray-700 font-bold">Class Thumbnail Image</Label>
                    <p className="text-[10px] text-gray-500 mb-1">Recommended: Widescreen thumbnail (16:9 ratio), e.g., 1280x720 pixels.</p>
                    <div className="flex items-center gap-3 mt-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          if (!e.target.files || e.target.files.length === 0) return;
                          const file = e.target.files[0];
                          const formData = new FormData();
                          formData.append("file", file);

                          try {
                            showToast("Uploading class thumbnail...", "success");
                            const res = await api.post("/admin/upload", formData, {
                              headers: { "Content-Type": "multipart/form-data" }
                            });
                            if (res.data && res.data.url) {
                              const list = [...(config.live_classes || [])];
                              list[idx] = { ...list[idx], thumbnail: res.data.url };
                              setConfig(p => ({ ...p, live_classes: list }));
                              showToast("Thumbnail uploaded!", "success");
                            }
                          } catch {
                            showToast("Upload failed.", "error");
                          }
                        }}
                        className="cursor-pointer h-10 py-1.5 text-xs flex-1 max-w-sm"
                      />
                      {lecture.thumbnail && (
                        <div className="relative w-20 h-12 rounded border border-gray-200 overflow-hidden flex-shrink-0">
                          <img src={getImageUrl(lecture.thumbnail)} alt="preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="flex gap-4">
            <Button
              onClick={async () => {
                const list = [...(config.live_classes || [])];
                list.push({
                  title: "",
                  instructor: "",
                  date: "",
                  time: "",
                  status: "upcoming",
                  students: 100,
                  thumbnail: "",
                  is_visible: true,
                  lecture_link: ""
                });
                setConfig(p => ({ ...p, live_classes: list }));
              }}
              variant="outline"
              className="border border-[#E53935] text-[#E53935] hover:bg-[#E53935]/5"
            >
              <Plus size={16} className="mr-2" /> Add Live Class Card
            </Button>

            <Button
              onClick={() => saveConfig({ live_classes: config.live_classes })}
              className="bg-[#E53935] text-white hover:bg-[#b71c1c]"
            >
              <Save size={16} className="mr-2" /> Save Live Classes
            </Button>
          </div>
        </div>
      )}

      {/* ── TAB: Site Settings ────────────────────────────────────── */}
      {activeTab === "settings" && !configLoading && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Section Visibility Toggles */}
          <Card className="p-6 border border-gray-100 shadow-sm md:col-span-2">
            <h2 className="text-base font-bold mb-2 flex items-center gap-2" style={{ color: "#121212" }}>
              <Globe size={16} className="text-[#E53935]" /> Section Visibility Toggles
            </h2>
            <p className="text-xs text-gray-500 mb-4 font-semibold">Enable or disable specific sections on the landing page</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {[
                { key: "show_announcements", label: "Ticker Announcements" },
                { key: "show_hero_slider", label: "Hero & Carousel" },
                { key: "show_courses", label: "Professional Programs" },
                { key: "show_live_classes", label: "Live Classes" },
                { key: "show_modules", label: "Program Modules" },
                { key: "show_timeline", label: "Course Acronym T-I-N-T-R-A-D-E" },
                { key: "show_roadmap", label: "Learning Path (Roadmap)" },
                { key: "show_benefits", label: "Program Benefits" },
                { key: "show_services", label: "Our Services" },
                { key: "show_quick_tips", label: "Quick Tips (Videos)" },
                { key: "show_why_choose", label: "Why Choose Us" },
                { key: "show_leadership", label: "Leadership Team" },
                { key: "show_testimonials", label: "Student Testimonials" },
                { key: "show_certificate", label: "Certificate Showcase" },
                { key: "show_emi", label: "EMI & Payment Plans" },
                { key: "show_career_pathways", label: "Placement & Career Pathways" },
                { key: "show_cta", label: "CTA (Enrollment Banner)" },
                { key: "show_showcase_videos", label: "Watch Our Students" },
                { key: "show_blog", label: "Market Insights (Blog)" },
                { key: "show_terms", label: "Terms & Conditions (Section 15)" },
              ].map(item => {
                const checked = config.section_visibility?.[item.key as keyof SectionVisibilityConfig] !== false;
                return (
                  <div key={item.key} className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50 border border-gray-100 hover:border-[#E53935]/25 transition-all">
                    <input
                      id={`vis-${item.key}`}
                      type="checkbox"
                      checked={checked}
                      onChange={e => {
                        setConfig(p => ({
                          ...p,
                          section_visibility: {
                            ...(p.section_visibility || {
                              show_announcements: true,
                              show_hero_slider: true,
                              show_courses: true,
                              show_live_classes: true,
                              show_modules: true,
                              show_timeline: true,
                              show_roadmap: true,
                              show_benefits: true,
                              show_services: true,
                              show_quick_tips: true,
                              show_why_choose: true,
                              show_leadership: true,
                              show_testimonials: true,
                              show_certificate: true,
                              show_emi: true,
                              show_career_pathways: true,
                              show_cta: true,
                              show_showcase_videos: true,
                              show_blog: true,
                              show_terms: true,
                            }),
                            [item.key]: e.target.checked
                          }
                        }));
                      }}
                      className="w-4 h-4 rounded text-[#E53935] focus:ring-[#E53935]"
                    />
                    <Label htmlFor={`vis-${item.key}`} className="cursor-pointer text-xs font-semibold text-gray-700">{item.label}</Label>
                  </div>
                );
              })}
            </div>
            <Button size="sm" onClick={() => saveConfig({ section_visibility: config.section_visibility })} className="bg-[#E53935] text-white hover:bg-[#b71c1c] w-full">
              <Save size={14} className="mr-1" /> Save Section Visibility
            </Button>
          </Card>

          {/* Hero Section */}
          <Card className="p-6 border border-gray-100 shadow-sm">
            <h2 className="text-base font-bold mb-4 flex items-center gap-2" style={{ color: "#121212" }}>
              <Globe size={16} className="text-[#E53935]" /> Hero Section
            </h2>
            <div className="space-y-3">
              <div>
                <Label htmlFor="hero-badge">Badge Text</Label>
                <Input
                  id="hero-badge"
                  value={config.hero?.badge || ""}
                  onChange={e => setConfig(p => ({ ...p, hero: { ...p.hero!, badge: e.target.value } }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="hero-title">Main Title</Label>
                <Input
                  id="hero-title"
                  value={config.hero?.title || ""}
                  onChange={e => setConfig(p => ({ ...p, hero: { ...p.hero!, title: e.target.value } }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="hero-highlight">Highlighted Word (Red Gradient)</Label>
                <Input
                  id="hero-highlight"
                  value={config.hero?.highlight || ""}
                  onChange={e => setConfig(p => ({ ...p, hero: { ...p.hero!, highlight: e.target.value } }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="hero-subtitle">Subtitle</Label>
                <textarea
                  id="hero-subtitle"
                  value={config.hero?.subtitle || ""}
                  onChange={e => setConfig(p => ({ ...p, hero: { ...p.hero!, subtitle: e.target.value } }))}
                  rows={3}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#E53935]/30 focus:border-[#E53935]"
                />
              </div>
              <Button size="sm" onClick={() => saveConfig({ hero: config.hero })} className="bg-[#E53935] text-white hover:bg-[#b71c1c] w-full">
                <Save size={14} className="mr-1" /> Save Hero
              </Button>
            </div>
          </Card>

          {/* Contact & Social */}
          <div className="space-y-4">
            <Card className="p-6 border border-gray-100 shadow-sm">
              <h2 className="text-base font-bold mb-4 flex items-center gap-2" style={{ color: "#121212" }}>
                <Phone size={16} className="text-[#E53935]" /> Contact Info
              </h2>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="phone-display">Display Phone</Label>
                  <Input
                    id="phone-display"
                    value={config.contact?.phone || ""}
                    onChange={e => setConfig(p => ({ ...p, contact: { ...p.contact!, phone: e.target.value } }))}
                    placeholder="+91 98765 43210"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="phone-href">Phone URL (tel:)</Label>
                  <Input
                    id="phone-href"
                    value={config.contact?.phone_href || ""}
                    onChange={e => setConfig(p => ({ ...p, contact: { ...p.contact!, phone_href: e.target.value } }))}
                    placeholder="tel:+919876543210"
                    className="mt-1"
                  />
                </div>
                <Button size="sm" onClick={() => saveConfig({ contact: config.contact })} className="bg-[#E53935] text-white hover:bg-[#b71c1c] w-full">
                  <Save size={14} className="mr-1" /> Save Contact
                </Button>
              </div>
            </Card>

            <Card className="p-6 border border-gray-100 shadow-sm">
              <h2 className="text-base font-bold mb-4 flex items-center gap-2" style={{ color: "#121212" }}>
                <LinkIcon size={16} className="text-[#E53935]" /> Social Media Links
              </h2>
              <div className="space-y-3">
                {(["instagram", "facebook", "youtube", "linkedin"] as const).map(platform => (
                  <div key={platform}>
                    <Label htmlFor={platform} className="capitalize">{platform}</Label>
                    <Input
                      id={platform}
                      value={config.social?.[platform] || ""}
                      onChange={e => setConfig(p => ({ ...p, social: { ...p.social!, [platform]: e.target.value } }))}
                      className="mt-1 text-xs"
                    />
                  </div>
                ))}
                <Button size="sm" onClick={() => saveConfig({ social: config.social })} className="bg-[#E53935] text-white hover:bg-[#b71c1c] w-full">
                  <Save size={14} className="mr-1" /> Save Social Links
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ── TAB: Section 10: Certificate Showcase ──────────────────── */}
      {activeTab === "certificate" && !configLoading && (
        <div className="space-y-6">
          <Card className="p-4 border border-blue-100 bg-blue-50/50">
            <div className="flex items-start gap-3">
              <Info size={18} className="text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-700">
                Configure headings, sample dual certificates, and exactly 3 benefit cards (such as Shareability or Verification details) to showcase the certification value.
              </p>
            </div>
          </Card>

          {/* Certificate Configuration */}
          <Card className="p-6 border border-gray-100 shadow-sm">
            <h2 className="text-base font-bold mb-2 flex items-center gap-2" style={{ color: "#121212" }}>
              <Award size={16} className="text-[#E53935]" /> Industry-Recognized Certificate Config
            </h2>
            <p className="text-xs text-gray-500 mb-4 font-semibold">Customize headings, sample certificates, and benefit cards for the certification block</p>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor="cert-heading">Section Heading</Label>
                <Input
                  id="cert-heading"
                  value={config.certificate?.heading || ""}
                  onChange={e => setConfig(p => ({ ...p, certificate: { ...(p.certificate || { heading: "", subheading: "" }), heading: e.target.value } }))}
                  placeholder="e.g. Industry-Recognized Certificate"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="cert-subheading">Section Subheading</Label>
                <Input
                  id="cert-subheading"
                  value={config.certificate?.subheading || ""}
                  onChange={e => setConfig(p => ({ ...p, certificate: { ...(p.certificate || { heading: "", subheading: "" }), subheading: e.target.value } }))}
                  placeholder="e.g. Boost your profile with dual certifications..."
                  className="mt-1"
                />
              </div>

              {/* Uploader Cert 1 */}
              <div>
                <Label className="text-gray-700 font-bold">Certificate 1 Image</Label>
                <p className="text-[10px] text-gray-500 mb-1">Recommended: Landscape certificate image (e.g. 1024x768 px).</p>
                <div className="flex items-center gap-3 mt-1">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      if (!e.target.files || e.target.files.length === 0) return;
                      const file = e.target.files[0];
                      const formData = new FormData();
                      formData.append("file", file);
                      try {
                        showToast("Uploading certificate 1...", "success");
                        const res = await api.post("/admin/upload", formData, {
                          headers: { "Content-Type": "multipart/form-data" }
                        });
                        if (res.data && res.data.url) {
                          setConfig(p => ({ ...p, certificate: { ...(p.certificate || { heading: "", subheading: "" }), cert1_image: res.data.url } }));
                          showToast("Certificate 1 image uploaded!", "success");
                        }
                      } catch {
                        showToast("Upload failed.", "error");
                      }
                    }}
                    className="cursor-pointer h-10 py-1.5 text-xs flex-1"
                  />
                  {config.certificate?.cert1_image && (
                    <div className="relative w-16 h-10 rounded border border-gray-200 overflow-hidden flex-shrink-0">
                      <img src={getImageUrl(config.certificate.cert1_image)} alt="preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              {/* Uploader Cert 2 */}
              <div>
                <Label className="text-gray-700 font-bold">Certificate 2 Image</Label>
                <p className="text-[10px] text-gray-500 mb-1">Recommended: Landscape certificate image (e.g. 1024x768 px).</p>
                <div className="flex items-center gap-3 mt-1">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      if (!e.target.files || e.target.files.length === 0) return;
                      const file = e.target.files[0];
                      const formData = new FormData();
                      formData.append("file", file);
                      try {
                        showToast("Uploading certificate 2...", "success");
                        const res = await api.post("/admin/upload", formData, {
                          headers: { "Content-Type": "multipart/form-data" }
                        });
                        if (res.data && res.data.url) {
                          setConfig(p => ({ ...p, certificate: { ...(p.certificate || { heading: "", subheading: "" }), cert2_image: res.data.url } }));
                          showToast("Certificate 2 image uploaded!", "success");
                        }
                      } catch {
                        showToast("Upload failed.", "error");
                      }
                    }}
                    className="cursor-pointer h-10 py-1.5 text-xs flex-1"
                  />
                  {config.certificate?.cert2_image && (
                    <div className="relative w-16 h-10 rounded border border-gray-200 overflow-hidden flex-shrink-0">
                      <img src={getImageUrl(config.certificate.cert2_image)} alt="preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Three Benefits Cards inside Certificate showcase */}
            <div className="border-t border-gray-100 pt-4 mt-4">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">Certificate Features (Exactly 3 Benefit Cards)</h3>
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                {[1, 2, 3].map(i => {
                  const titleKey = `benefit${i}_title` as keyof CertificateConfig;
                  const descKey = `benefit${i}_desc` as keyof CertificateConfig;
                  return (
                    <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                      <Label className="text-[10px] text-gray-400 font-bold uppercase">Benefit #{i}</Label>
                      <div>
                        <Label className="text-xs">Title</Label>
                        <Input
                          value={String(config.certificate?.[titleKey] || "")}
                          onChange={e => setConfig(p => ({
                            ...p,
                            certificate: {
                              ...(p.certificate || { heading: "", subheading: "" }),
                              [titleKey]: e.target.value
                            }
                          }))}
                          placeholder={`e.g. Shareable Certificate`}
                          className="mt-1 h-8 text-xs bg-white"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Description</Label>
                        <Input
                          value={String(config.certificate?.[descKey] || "")}
                          onChange={e => setConfig(p => ({
                            ...p,
                            certificate: {
                              ...(p.certificate || { heading: "", subheading: "" }),
                              [descKey]: e.target.value
                            }
                          }))}
                          placeholder={`e.g. Share on LinkedIn and Resume`}
                          className="mt-1 h-8 text-xs bg-white"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <Button size="sm" onClick={() => saveConfig({ certificate: config.certificate })} className="bg-[#E53935] text-white hover:bg-[#b71c1c] w-full">
              <Save size={14} className="mr-1" /> Save Certificate Settings
            </Button>
          </Card>
        </div>
      )}

      {/* ── TAB: Section 11: EMI & Payment Plans ────────────────────── */}
      {activeTab === "emi" && !configLoading && (
        <div className="space-y-6">
          <Card className="p-4 border border-blue-100 bg-blue-50/50">
            <div className="flex items-start gap-3">
              <Info size={18} className="text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-700">
                Configure headings, taglines, button labels, bullet items, and custom Hex theme colors (with real-time square previews) for exactly three payment plans to showcase in the EMI section.
              </p>
            </div>
          </Card>

          {/* EMI & Payment Plans Configuration */}
          <Card className="p-6 border border-gray-100 shadow-sm">
            <h2 className="text-base font-bold mb-2 flex items-center gap-2" style={{ color: "#121212" }}>
              <TrendingUp size={16} className="text-[#E53935]" /> EMI & Payment Plans Config
            </h2>
            <p className="text-xs text-gray-500 mb-4 font-semibold">Customize EMI headings, and configure details for all 3 flexible payment plans</p>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor="emi-heading">Section Heading</Label>
                <Input
                  id="emi-heading"
                  value={config.emi?.heading || ""}
                  onChange={e => setConfig(p => ({ ...p, emi: { ...(p.emi || { heading: "", subheading: "" }), heading: e.target.value } }))}
                  placeholder="e.g. Affordable EMI Options & Flexible Payment Plans"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="emi-subheading">Section Subheading</Label>
                <Input
                  id="emi-subheading"
                  value={config.emi?.subheading || ""}
                  onChange={e => setConfig(p => ({ ...p, emi: { ...(p.emi || { heading: "", subheading: "" }), subheading: e.target.value } }))}
                  placeholder="e.g. Learn today, pay in easy monthly installments..."
                  className="mt-1"
                />
              </div>
            </div>

            {/* Plans Array loop */}
            <div className="border-t border-gray-100 pt-4 mt-4">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">Payment Plans (Exactly 3 Cards)</h3>
              <div className="space-y-4 mb-4">
                {[0, 1, 2].map(idx => {
                  const plansList = config.emi?.plans || [
                    { title: "Standard Plan", tagline: "Start learning now", color: "#D50032", btnText: "Apply Standard", bullets: ["Benefit 1", "Benefit 2", "Benefit 3"] },
                    { title: "Pro Plan", tagline: "For serious traders", color: "#121212", btnText: "Apply Pro", bullets: ["Benefit 1", "Benefit 2", "Benefit 3"] },
                    { title: "Elite Plan", tagline: "1-on-1 VIP access", color: "#FF3D00", btnText: "Apply Elite", bullets: ["Benefit 1", "Benefit 2", "Benefit 3"] },
                  ];
                  const plan = plansList[idx] || { title: "", tagline: "", color: "#D50032", btnText: "", bullets: ["", "", ""] };
                  return (
                    <div key={idx} className="p-5 rounded-2xl bg-gray-50 border border-gray-100 grid md:grid-cols-12 gap-4 relative">
                      <span className="absolute top-4 right-4 bg-gray-200 text-gray-600 px-3 py-1 text-[10px] font-black rounded-full uppercase tracking-wider">Plan #{idx + 1}</span>
                      
                      <div className="md:col-span-4 space-y-3">
                        <div>
                          <Label className="text-xs">Plan Title</Label>
                          <Input
                            value={plan.title}
                            onChange={e => {
                              const list = [...plansList];
                              list[idx] = { ...list[idx], title: e.target.value };
                              setConfig(p => ({ ...p, emi: { ...(p.emi || { heading: "", subheading: "" }), plans: list } }));
                            }}
                            className="bg-white mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Tagline</Label>
                          <Input
                            value={plan.tagline}
                            onChange={e => {
                              const list = [...plansList];
                              list[idx] = { ...list[idx], tagline: e.target.value };
                              setConfig(p => ({ ...p, emi: { ...(p.emi || { heading: "", subheading: "" }), plans: list } }));
                            }}
                            className="bg-white mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Theme Color (Hex, e.g. #D50032)</Label>
                          <div className="flex gap-2 mt-1">
                            <Input
                              value={plan.color}
                              onChange={e => {
                                const list = [...plansList];
                                list[idx] = { ...list[idx], color: e.target.value };
                                setConfig(p => ({ ...p, emi: { ...(p.emi || { heading: "", subheading: "" }), plans: list } }));
                              }}
                              className="bg-white flex-1"
                            />
                            <div className="w-10 h-10 rounded border border-gray-200 animate-pulse" style={{ backgroundColor: plan.color || "#D50032" }} />
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs">Button Text</Label>
                          <Input
                            value={plan.btnText}
                            onChange={e => {
                              const list = [...plansList];
                              list[idx] = { ...list[idx], btnText: e.target.value };
                              setConfig(p => ({ ...p, emi: { ...(p.emi || { heading: "", subheading: "" }), plans: list } }));
                            }}
                            className="bg-white mt-1"
                          />
                        </div>
                      </div>

                      <div className="md:col-span-8 space-y-3">
                        <Label className="text-xs font-bold text-gray-700">Plan Bullet Points (Exactly 3)</Label>
                        {[0, 1, 2].map(bIdx => {
                          const currentBullets = plan.bullets || ["", "", ""];
                          return (
                            <div key={bIdx} className="flex items-center gap-2">
                              <span className="text-xs font-bold text-gray-400">Bullet #{bIdx + 1}:</span>
                              <Input
                                value={currentBullets[bIdx] || ""}
                                onChange={e => {
                                  const list = [...plansList];
                                  const bulletsCopy = [...currentBullets];
                                  bulletsCopy[bIdx] = e.target.value;
                                  list[idx] = { ...list[idx], bullets: bulletsCopy };
                                  setConfig(p => ({ ...p, emi: { ...(p.emi || { heading: "", subheading: "" }), plans: list } }));
                                }}
                                placeholder={`e.g. Interest-free payments`}
                                className="bg-white flex-1"
                              />
                            </div>
                          );
                        })}
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>

            <Button size="sm" onClick={() => saveConfig({ emi: config.emi })} className="bg-[#E53935] text-white hover:bg-[#b71c1c] w-full">
              <Save size={14} className="mr-1" /> Save EMI Settings
            </Button>
          </Card>
        </div>
      )}

      {/* ── TAB: Showcase Videos ──────────────────────────────────── */}
      {activeTab === "videos" && !configLoading && (
        <div className="space-y-4">
          <Card className="p-4 border border-amber-100 bg-amber-50/50">
            <div className="flex items-start gap-3">
              <AlertTriangle size={18} className="text-amber-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-amber-700">
                These 3 showcase videos appear in the "Watch Our Students" section on the landing page. Update the thumbnail URL and video URL for each slot.
              </p>
            </div>
          </Card>

          {(() => {
            const defaultShowcaseVideos = [
              { title: "FinTrade Student Story", subtitle: "From Zero to Prop Trader in 9 Months", thumbnail: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800", url: "", duration: "3:24" },
              { title: "Trading Simulator Walkthrough", subtitle: "Experience Real Markets, Zero Risk", thumbnail: "https://images.unsplash.com/photo-1612178991541-b48cc8e92a4d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800", url: "", duration: "2:10" },
              { title: "What Our Alumni Say", subtitle: "Hear from Placed Traders", thumbnail: "https://images.unsplash.com/photo-1659353221405-29b7d087f9e5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800", url: "", duration: "4:55" },
            ];
            const showcaseVids = config.showcase_videos && config.showcase_videos.length > 0
              ? config.showcase_videos
              : defaultShowcaseVideos;

            return showcaseVids.map((video, idx) => {
              const isFileSource = video.url?.startsWith("/uploads") || video._sourceType === "file";
              return (
                <Card key={idx} className="p-6 border border-gray-100 shadow-sm">
                  <h3 className="text-sm font-bold mb-4 text-[#0B2A5B]">Video Slot {idx + 1}</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Title</Label>
                      <Input
                        value={video.title || ""}
                        onChange={e => {
                          const vids = [...showcaseVids];
                          vids[idx] = { ...vids[idx], title: e.target.value };
                          setConfig(p => ({ ...p, showcase_videos: vids }));
                        }}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Input
                        value={video.subtitle || ""}
                        onChange={e => {
                          const vids = [...showcaseVids];
                          vids[idx] = { ...vids[idx], subtitle: e.target.value };
                          setConfig(p => ({ ...p, showcase_videos: vids }));
                        }}
                        className="mt-1"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Thumbnail Image URL</Label>
                      <Input
                        value={video.thumbnail || ""}
                        onChange={e => {
                          const vids = [...showcaseVids];
                          vids[idx] = { ...vids[idx], thumbnail: e.target.value };
                          setConfig(p => ({ ...p, showcase_videos: vids }));
                        }}
                        className="mt-1"
                      />
                      {video.thumbnail && (
                        <img
                          src={video.thumbnail}
                          alt="preview"
                          className="mt-2 h-20 w-36 object-cover rounded-lg border border-gray-200"
                          onError={e => (e.currentTarget.style.display = "none")}
                        />
                      )}
                    </div>

                    {/* Video Source Selection & File Upload / URL Text Field */}
                    <div className="md:col-span-2 space-y-4 pt-2 border-t border-gray-100 mt-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <Label className="text-xs font-bold text-[#0B2A5B]">Video Option (Choose URL or File Upload)</Label>
                        <div className="flex rounded-lg overflow-hidden border border-gray-200 p-0.5 bg-gray-50">
                          <button
                            type="button"
                            onClick={async () => {
                              const vids = [...showcaseVids];
                              vids[idx] = { ...vids[idx], _sourceType: "url" };
                              if (vids[idx].url?.startsWith("/uploads")) {
                                vids[idx].url = "";
                              }
                              setConfig(p => ({ ...p, showcase_videos: vids }));
                            }}
                            className={`px-3 py-1 text-[11px] font-bold rounded-md transition-all ${
                              !isFileSource
                                ? "bg-[#E53935] text-white shadow-sm"
                                : "text-gray-500 hover:text-gray-900"
                            }`}
                          >
                            Paste Video URL
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              const vids = [...showcaseVids];
                              vids[idx] = { ...vids[idx], _sourceType: "file" };
                              if (!vids[idx].url?.startsWith("/uploads")) {
                                vids[idx].url = "";
                              }
                              setConfig(p => ({ ...p, showcase_videos: vids }));
                            }}
                            className={`px-3 py-1 text-[11px] font-bold rounded-md transition-all ${
                              isFileSource
                                ? "bg-[#E53935] text-white shadow-sm"
                                : "text-gray-500 hover:text-gray-900"
                            }`}
                          >
                            Upload Video File
                          </button>
                        </div>
                      </div>

                      {isFileSource ? (
                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                          <Label className="text-xs">Upload Video File *</Label>
                          <div className="flex items-center gap-3 mt-1.5">
                            <Input
                              type="file"
                              accept="video/*"
                              onChange={async (e) => {
                                if (!e.target.files || e.target.files.length === 0) return;
                                const file = e.target.files[0];
                                const formData = new FormData();
                                formData.append("file", file);
                                try {
                                  showToast("Uploading video...", "success");
                                  const res = await api.post("/admin/upload", formData, {
                                    headers: { "Content-Type": "multipart/form-data" }
                                  });
                                  if (res.data && res.data.url) {
                                    const vids = [...showcaseVids];
                                    vids[idx] = { ...vids[idx], url: res.data.url, _sourceType: "file" };
                                    setConfig(p => ({ ...p, showcase_videos: vids }));
                                    showToast("Video uploaded!", "success");
                                  }
                                } catch {
                                  showToast("Upload failed.", "error");
                                }
                              }}
                              className="cursor-pointer h-10 py-1.5 text-xs bg-white flex-1"
                            />
                            {video.url && video.url.startsWith("/uploads") && (
                              <span className="text-xs bg-green-100 border border-green-200 text-green-800 px-3 py-2 rounded-lg font-mono truncate max-w-[200px]" title={video.url}>
                                {video.url.split("/").pop()}
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <Label>Video URL *</Label>
                          <Input
                            value={video.url || ""}
                            onChange={e => {
                              const vids = [...showcaseVids];
                              vids[idx] = { ...vids[idx], url: e.target.value, _sourceType: "url" };
                              setConfig(p => ({ ...p, showcase_videos: vids }));
                            }}
                            placeholder="e.g. https://www.youtube.com/embed/..."
                            className="mt-1"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            });
          })()}

          <Button
            onClick={async () => {
              const defaultShowcaseVideos = [
                { title: "FinTrade Student Story", subtitle: "From Zero to Prop Trader in 9 Months", thumbnail: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800", url: "", duration: "3:24" },
                { title: "Trading Simulator Walkthrough", subtitle: "Experience Real Markets, Zero Risk", thumbnail: "https://images.unsplash.com/photo-1612178991541-b48cc8e92a4d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800", url: "", duration: "2:10" },
                { title: "What Our Alumni Say", subtitle: "Hear from Placed Traders", thumbnail: "https://images.unsplash.com/photo-1659353221405-29b7d087f9e5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800", url: "", duration: "4:55" },
              ];
              const showcaseVids = config.showcase_videos && config.showcase_videos.length > 0
                ? config.showcase_videos
                : defaultShowcaseVideos;
              saveConfig({ showcase_videos: showcaseVids });
            }}
            className="bg-[#E53935] text-white hover:bg-[#b71c1c]"
          >
            <Save size={16} className="mr-2" /> Save All Videos
          </Button>
        </div>
      )}

      {/* ── TAB: Program Modules Timeline ───────────────────────────── */}
      {activeTab === "modules_timeline" && !configLoading && (
        <div className="space-y-6">
          <Card className="p-4 border border-blue-100 bg-blue-50/50">
            <div className="flex items-start gap-3">
              <Info size={18} className="text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-700">
                Manage the stages and respective modules for the <strong>Certified Professional Trading Program</strong> vertical timeline on the landing page.
              </p>
            </div>
          </Card>

          {(() => {
            const defaultProgramModules = [
              {
                title: "PROFESSIONAL TRADING MINDSET FOUNDATION",
                duration: "2 Days",
                modules: [
                  { num: 1, title: "Trader’s Mindset & Market Psychology", overview: "Psychology foundation for retail and professional trading." },
                  { num: 2, title: "Professional Trading Mindset Foundation", overview: "Developing discipline and professional trading habits." }
                ]
              },
              {
                title: "FINANCIAL MARKET FOUNDATION",
                duration: "30 Days",
                modules: [
                  { num: 1, title: "Introduction to Financial Market", overview: "Understanding how financial markets work." },
                  { num: 2, title: "Understanding Security Market", overview: "Market participants, stock exchanges, and demat accounts." },
                  { num: 3, title: "Methods of analysing Financial Security", overview: "Overview of technical and fundamental analysis." }
                ]
              },
              {
                title: "MARKET ANALYSIS AND TRADING STRATEGY DEVELOPMENT",
                duration: "30 Days",
                modules: [
                  { num: 1, title: "Fundamental Analysis Framework", overview: "Evaluating balance sheets and cash flows." },
                  { num: 2, title: "Application of Fundamental Analysis", overview: "Valuation methodologies and DCF models." },
                  { num: 3, title: "Technical Analysis for Trading and Investing", overview: "Candlesticks, trends, indicators, and chart patterns." },
                  { num: 4, title: "Trading & Analytics Software", overview: "Using charting software and trading terminals." }
                ]
              },
              {
                title: "ADVANCED INSTITUTIONAL TRADING AND RISK MANAGEMENT",
                duration: "30 Days",
                modules: [
                  { num: 1, title: "Applied Technical Analysis", overview: "Advanced indicators and order book dynamics." },
                  { num: 2, title: "Mechanics of Derivative Market", overview: "Introduction to Futures & Options trading." },
                  { num: 3, title: "Options & Futures Strategies", overview: "Spreads, straddles, hedging, and Greeks." },
                  { num: 4, title: "Professional Risk Management", overview: "Position sizing, risk manual, and drawdown control." }
                ]
              },
              {
                title: "MARKET APPLICATION AND EXECUTION",
                duration: "5 Days",
                modules: [
                  { num: 1, title: "Trading Lab & Back testing Mastery", overview: "Testing strategy rules on historical data." },
                  { num: 2, title: "Real World Market Execution", overview: "Live trading execution under guidance." }
                ]
              }
            ];

            const stagesList = config.program_modules && config.program_modules.length > 0
              ? config.program_modules
              : defaultProgramModules;

            return (
              <div className="space-y-6">
                {stagesList.map((stage, sIdx) => (
                  <Card key={sIdx} className="p-6 border border-gray-200 shadow-sm relative space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                      <h3 className="font-bold text-base text-[#0B2A5B]">Stage #{sIdx + 1}</h3>
                      <button
                        type="button"
                        onClick={async () => {
                          if (!(await confirmPopup("Remove this entire stage?"))) return;
                          const list = [...stagesList];
                          list.splice(sIdx, 1);
                          setConfig(p => ({ ...p, program_modules: list }));
                        }}
                        className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 font-semibold"
                      >
                        <Trash2 size={14} className="mr-1" /> Remove Stage
                      </button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label>Stage Title</Label>
                        <Input
                          value={stage.title || ""}
                          onChange={e => {
                            const list = [...stagesList];
                            list[sIdx] = { ...list[sIdx], title: e.target.value };
                            setConfig(p => ({ ...p, program_modules: list }));
                          }}
                          placeholder="e.g. PROFESSIONAL TRADING MINDSET FOUNDATION"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Duration Label</Label>
                        <Input
                          value={stage.duration || ""}
                          onChange={e => {
                            const list = [...stagesList];
                            list[sIdx] = { ...list[sIdx], duration: e.target.value };
                            setConfig(p => ({ ...p, program_modules: list }));
                          }}
                          placeholder="e.g. 2 Days"
                          className="mt-1"
                        />
                      </div>
                    </div>

                    {/* Modules list inside stage */}
                    <div className="pt-2">
                      <div className="flex items-center justify-between mb-3">
                        <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Modules in Stage #{sIdx + 1}</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            const list = [...stagesList];
                            const mods = [...(list[sIdx].modules || [])];
                            mods.push({ num: mods.length + 1, title: "", overview: "" });
                            list[sIdx] = { ...list[sIdx], modules: mods };
                            setConfig(p => ({ ...p, program_modules: list }));
                          }}
                          className="h-8 text-xs border-[#E53935] text-[#E53935] hover:bg-[#E53935]/5"
                        >
                          <Plus size={12} className="mr-1" /> Add Module Card
                        </Button>
                      </div>

                      <div className="space-y-3">
                        {(stage.modules || []).map((mod: any, mIdx: number) => (
                          <div key={mIdx} className="p-4 bg-gray-50 rounded-xl border border-gray-150 relative group">
                            <button
                              type="button"
                              onClick={async () => {
                                const list = [...stagesList];
                                const mods = [...(list[sIdx].modules || [])];
                                mods.splice(mIdx, 1);
                                // Re-index module numbers
                                const reindexed = mods.map((m, i) => ({ ...m, num: i + 1 }));
                                list[sIdx] = { ...list[sIdx], modules: reindexed };
                                setConfig(p => ({ ...p, program_modules: list }));
                              }}
                              className="absolute top-3 right-3 p-1 text-gray-400 hover:text-red-500 rounded transition-colors animate-none"
                              title="Delete module"
                            >
                              <Trash2 size={14} />
                            </button>

                            <div className="grid md:grid-cols-12 gap-3 pr-6">
                              <div className="md:col-span-1 flex items-center justify-center">
                                <span className="w-6 h-6 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center text-xs font-black">
                                  {mod.num}
                                </span>
                              </div>
                              <div className="md:col-span-4">
                                <Label className="text-xs">Module Title</Label>
                                <Input
                                  value={mod.title || ""}
                                  onChange={e => {
                                    const list = [...stagesList];
                                    const mods = [...(list[sIdx].modules || [])];
                                    mods[mIdx] = { ...mods[mIdx], title: e.target.value };
                                    list[sIdx] = { ...list[sIdx], modules: mods };
                                    setConfig(p => ({ ...p, program_modules: list }));
                                  }}
                                  placeholder="e.g. Trader’s Mindset & Market Psychology"
                                  className="mt-1 h-8 text-xs bg-white"
                                />
                              </div>
                              <div className="md:col-span-7">
                                <Label className="text-xs">Overview Description</Label>
                                <Input
                                  value={mod.overview || ""}
                                  onChange={e => {
                                    const list = [...stagesList];
                                    const mods = [...(list[sIdx].modules || [])];
                                    mods[mIdx] = { ...mods[mIdx], overview: e.target.value };
                                    list[sIdx] = { ...list[sIdx], modules: mods };
                                    setConfig(p => ({ ...p, program_modules: list }));
                                  }}
                                  placeholder="e.g. Psychology foundation for retail and professional trading..."
                                  className="mt-1 h-8 text-xs bg-white"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                ))}

                <div className="flex gap-4 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={async () => {
                      const list = [...stagesList];
                      list.push({ title: "", duration: "", modules: [] });
                      setConfig(p => ({ ...p, program_modules: list }));
                    }}
                    className="border border-[#E53935] text-[#E53935] hover:bg-[#E53935]/5"
                  >
                    <Plus size={16} className="mr-2" /> Add Stage Block
                  </Button>

                  <Button
                    onClick={() => saveConfig({ program_modules: stagesList })}
                    className="bg-[#E53935] text-white hover:bg-[#b71c1c]"
                  >
                    <Save size={16} className="mr-2" /> Save All Stages & Modules
                  </Button>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ── TAB: Program Benefits ──────────────────────────────────── */}
      {activeTab === "benefits" && !configLoading && (
        <div className="space-y-6">
          <Card className="p-4 border border-blue-100 bg-blue-50/50">
            <div className="flex items-start gap-3">
              <Info size={18} className="text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-700">
                Manage the cards appearing in the <strong>Program Benefits Section</strong> on the home page. You can add, edit, or delete benefits. Choose an icon name from Lucide React to match the card style.
              </p>
            </div>
          </Card>

          <div className="space-y-4">
            {(config.benefits || []).map((benefit, idx) => (
              <Card key={idx} className="p-6 border border-gray-100 shadow-sm relative group hover:border-[#E53935]/30 transition-all duration-300">
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-400">Card #{idx + 1}</span>
                  <button
                    onClick={async () => {
                      if (!(await confirmPopup("Remove this benefit card?"))) return;
                      const list = [...(config.benefits || [])];
                      list.splice(idx, 1);
                      setConfig(p => ({ ...p, benefits: list }));
                    }}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    title="Remove this benefit card"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="grid md:grid-cols-12 gap-4">
                  {/* Badge Number */}
                  <div className="md:col-span-2">
                    <Label htmlFor={`b-num-${idx}`}>Number Badge</Label>
                    <Input
                      id={`b-num-${idx}`}
                      value={benefit.num}
                      onChange={e => {
                        const list = [...(config.benefits || [])];
                        list[idx] = { ...list[idx], num: e.target.value };
                        setConfig(p => ({ ...p, benefits: list }));
                      }}
                      placeholder="e.g. 01"
                      className="mt-1"
                    />
                  </div>

                  {/* Title */}
                  <div className="md:col-span-6">
                    <Label htmlFor={`b-title-${idx}`}>Benefit Title</Label>
                    <Input
                      id={`b-title-${idx}`}
                      value={benefit.title}
                      onChange={e => {
                        const list = [...(config.benefits || [])];
                        list[idx] = { ...list[idx], title: e.target.value };
                        setConfig(p => ({ ...p, benefits: list }));
                      }}
                      placeholder="e.g. Risk Policy Manual"
                      className="mt-1"
                    />
                  </div>

                  {/* Logo Upload / Icon selector */}
                  <div className="md:col-span-12">
                    <Label className="text-gray-700 font-bold">Benefit Custom Logo (PNG/SVG) — Or Custom Lucide Icon</Label>
                    <div className="grid md:grid-cols-2 gap-4 mt-2">
                      <div className="flex flex-col gap-2">
                        <Label className="text-xs text-gray-500 font-bold">Lucide Icon Selection</Label>
                        <div className="flex gap-2">
                          <select
                            value={["BookOpen", "TrendingUp", "FileText", "BarChart3", "Shield", "Award", "Target", "Trophy", "Brain"].includes(benefit.icon) ? benefit.icon : "Custom"}
                            onChange={e => {
                              const val = e.target.value;
                              if (val !== "Custom") {
                                const list = [...(config.benefits || [])];
                                list[idx] = { ...list[idx], icon: val };
                                setConfig(p => ({ ...p, benefits: list }));
                              }
                            }}
                            className="flex h-10 w-1/2 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          >
                            <option value="BookOpen">BookOpen</option>
                            <option value="TrendingUp">TrendingUp</option>
                            <option value="FileText">FileText</option>
                            <option value="BarChart3">BarChart3</option>
                            <option value="Shield">Shield</option>
                            <option value="Award">Award</option>
                            <option value="Target">Target</option>
                            <option value="Trophy">Trophy</option>
                            <option value="Brain">Brain</option>
                            <option value="Custom">Custom / Other</option>
                          </select>
                          <Input
                            value={benefit.icon.startsWith("/uploads") ? "" : benefit.icon}
                            onChange={e => {
                              const list = [...(config.benefits || [])];
                              list[idx] = { ...list[idx], icon: e.target.value };
                              setConfig(p => ({ ...p, benefits: list }));
                            }}
                            placeholder="Or type Lucide icon name..."
                            className="flex-1"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <Label className="text-xs text-gray-500 font-bold">Custom Image Upload</Label>
                        <p className="text-[10px] text-gray-400 font-normal">Recommended: Square logo/icon (1:1 ratio) with transparent background, e.g., 128x128 px.</p>
                        <div className="flex items-center gap-3">
                          <Input
                            key={benefit.icon}
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              if (!e.target.files || e.target.files.length === 0) return;
                              const file = e.target.files[0];
                              const formData = new FormData();
                              formData.append("file", file);

                              try {
                                showToast("Uploading benefit logo...", "success");
                                const res = await api.post("/admin/upload", formData, {
                                  headers: { "Content-Type": "multipart/form-data" }
                                });
                                if (res.data && res.data.url) {
                                  const list = [...(config.benefits || [])];
                                  list[idx] = { ...list[idx], icon: res.data.url };
                                  setConfig(p => ({ ...p, benefits: list }));
                                  showToast("Benefit logo uploaded!", "success");
                                }
                              } catch {
                                showToast("Upload failed.", "error");
                              }
                            }}
                            className="flex-1 cursor-pointer h-10 py-1.5"
                          />
                          {benefit.icon.startsWith("/uploads") && (
                            <Button
                              type="button"
                              variant="outline"
                              onClick={async () => {
                                const list = [...(config.benefits || [])];
                                list[idx] = { ...list[idx], icon: "BookOpen" };
                                setConfig(p => ({ ...p, benefits: list }));
                              }}
                              className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 h-10 px-3 flex items-center gap-1.5"
                            >
                              <Trash2 size={14} /> Remove Image
                            </Button>
                          )}
                          {benefit.icon.startsWith("/uploads") && (
                            <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                              <img src={getImageUrl(benefit.icon)} alt="icon preview" className="w-full h-full object-cover" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="md:col-span-12">
                    <Label htmlFor={`b-desc-${idx}`}>Description</Label>
                    <textarea
                      id={`b-desc-${idx}`}
                      value={benefit.desc}
                      onChange={e => {
                        const list = [...(config.benefits || [])];
                        list[idx] = { ...list[idx], desc: e.target.value };
                        setConfig(p => ({ ...p, benefits: list }));
                      }}
                      placeholder="Provide a clear description of the benefit..."
                      rows={2}
                      className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#E53935]/30 focus:border-[#E53935]"
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="flex gap-4">
            <Button
              onClick={async () => {
                const list = [...(config.benefits || [])];
                const nextNum = String(list.length + 1).padStart(2, "0");
                list.push({
                  num: nextNum,
                  title: "",
                  desc: "",
                  icon: "BookOpen"
                });
                setConfig(p => ({ ...p, benefits: list }));
              }}
              variant="outline"
              className="border border-[#E53935] text-[#E53935] hover:bg-[#E53935]/5"
            >
              <Plus size={16} className="mr-2" /> Add Benefit Card
            </Button>

            <Button
              onClick={() => saveConfig({ benefits: config.benefits })}
              className="bg-[#E53935] text-white hover:bg-[#b71c1c]"
            >
              <Save size={16} className="mr-2" /> Save Program Benefits
            </Button>
          </div>
        </div>
      )}

      {/* ── TAB: Our Services ─────────────────────────────────────── */}
      {activeTab === "services" && !configLoading && (
        <div className="space-y-6">
          <Card className="p-4 border border-blue-100 bg-blue-50/50">
            <div className="flex items-start gap-3">
              <Info size={18} className="text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-700">
                Manage the cards appearing in the <strong>Our Services Section</strong> on the home page. You can add, edit, or delete services. Choose a Lucide React icon name to match the card style.
              </p>
            </div>
          </Card>

          <div className="space-y-4">
            {(config.services || []).map((service, idx) => (
              <Card key={idx} className="p-6 border border-gray-100 shadow-sm relative group hover:border-[#E53935]/30 transition-all duration-300">
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-400">Card #{idx + 1}</span>
                  <button
                    onClick={async () => {
                      if (!(await confirmPopup("Remove this service card?"))) return;
                      const list = [...(config.services || [])];
                      list.splice(idx, 1);
                      setConfig(p => ({ ...p, services: list }));
                    }}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    title="Remove this service card"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="grid md:grid-cols-12 gap-4">
                  {/* Title */}
                  <div className="md:col-span-8">
                    <Label htmlFor={`s-title-${idx}`}>Service Title</Label>
                    <Input
                      id={`s-title-${idx}`}
                      value={service.title}
                      onChange={e => {
                        const list = [...(config.services || [])];
                        list[idx] = { ...list[idx], title: e.target.value };
                        setConfig(p => ({ ...p, services: list }));
                      }}
                      placeholder="e.g. Mentor"
                      className="mt-1"
                    />
                  </div>

                  {/* Logo Upload / Icon selector */}
                  <div className="md:col-span-12">
                    <Label className="text-gray-700 font-bold">Service Custom Logo (PNG/SVG) — Or Custom Lucide Icon</Label>
                    <div className="grid md:grid-cols-2 gap-4 mt-2">
                      <div className="flex flex-col gap-2">
                        <Label className="text-xs text-gray-500 font-bold">Lucide Icon Selection</Label>
                        <div className="flex gap-2">
                          <select
                            value={["UserCheck", "Monitor", "Wifi", "Activity", "ClipboardCheck", "GitBranch", "Cpu", "LineChart", "BookOpen", "Trophy"].includes(service.icon) ? service.icon : "Custom"}
                            onChange={e => {
                              const val = e.target.value;
                              if (val !== "Custom") {
                                const list = [...(config.services || [])];
                                list[idx] = { ...list[idx], icon: val };
                                setConfig(p => ({ ...p, services: list }));
                              }
                            }}
                            className="flex h-10 w-1/2 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          >
                            <option value="UserCheck">UserCheck</option>
                            <option value="Monitor">Monitor</option>
                            <option value="Wifi">Wifi</option>
                            <option value="Activity">Activity</option>
                            <option value="ClipboardCheck">ClipboardCheck</option>
                            <option value="GitBranch">GitBranch</option>
                            <option value="Cpu">Cpu</option>
                            <option value="LineChart">LineChart</option>
                            <option value="BookOpen">BookOpen</option>
                            <option value="Trophy">Trophy</option>
                            <option value="Custom">Custom / Other</option>
                          </select>
                          <Input
                            value={service.icon.startsWith("/uploads") ? "" : service.icon}
                            onChange={e => {
                              const list = [...(config.services || [])];
                              list[idx] = { ...list[idx], icon: e.target.value };
                              setConfig(p => ({ ...p, services: list }));
                            }}
                            placeholder="Or type Lucide icon name..."
                            className="flex-1"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <Label className="text-xs text-gray-500 font-bold">Custom Image Upload</Label>
                        <p className="text-[10px] text-gray-400 font-normal">Recommended: Square logo/icon (1:1 ratio) with transparent background, e.g., 128x128 px.</p>
                        <div className="flex items-center gap-3">
                          <Input
                            key={service.icon}
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              if (!e.target.files || e.target.files.length === 0) return;
                              const file = e.target.files[0];
                              const formData = new FormData();
                              formData.append("file", file);

                              try {
                                showToast("Uploading service logo...", "success");
                                const res = await api.post("/admin/upload", formData, {
                                  headers: { "Content-Type": "multipart/form-data" }
                                });
                                if (res.data && res.data.url) {
                                  const list = [...(config.services || [])];
                                  list[idx] = { ...list[idx], icon: res.data.url };
                                  setConfig(p => ({ ...p, services: list }));
                                  showToast("Service logo uploaded!", "success");
                                }
                              } catch {
                                showToast("Upload failed.", "error");
                              }
                            }}
                            className="flex-1 cursor-pointer h-10 py-1.5"
                          />
                          {service.icon.startsWith("/uploads") && (
                            <Button
                              type="button"
                              variant="outline"
                              onClick={async () => {
                                const list = [...(config.services || [])];
                                list[idx] = { ...list[idx], icon: "UserCheck" };
                                setConfig(p => ({ ...p, services: list }));
                              }}
                              className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 h-10 px-3 flex items-center gap-1.5"
                            >
                              <Trash2 size={14} /> Remove Image
                            </Button>
                          )}
                          {service.icon.startsWith("/uploads") && (
                            <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                              <img src={getImageUrl(service.icon)} alt="icon preview" className="w-full h-full object-cover" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="md:col-span-12">
                    <Label htmlFor={`s-desc-${idx}`}>Description</Label>
                    <textarea
                      id={`s-desc-${idx}`}
                      value={service.desc}
                      onChange={e => {
                        const list = [...(config.services || [])];
                        list[idx] = { ...list[idx], desc: e.target.value };
                        setConfig(p => ({ ...p, services: list }));
                      }}
                      placeholder="Provide a clear description of the service..."
                      rows={2}
                      className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#E53935]/30 focus:border-[#E53935]"
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="flex gap-4">
            <Button
              onClick={async () => {
                const list = [...(config.services || [])];
                list.push({
                  title: "",
                  desc: "",
                  icon: "UserCheck"
                });
                setConfig(p => ({ ...p, services: list }));
              }}
              variant="outline"
              className="border border-[#E53935] text-[#E53935] hover:bg-[#E53935]/5"
            >
              <Plus size={16} className="mr-2" /> Add Service Card
            </Button>

            <Button
              onClick={() => saveConfig({ services: config.services })}
              className="bg-[#E53935] text-white hover:bg-[#b71c1c]"
            >
              <Save size={16} className="mr-2" /> Save Services
            </Button>
          </div>
        </div>
      )}

      {/* ── TAB: Quick Tips ─────────────────────────────────────── */}
      {activeTab === "quick_tips" && !configLoading && (
        <div className="space-y-6">
          <Card className="p-4 border border-blue-100 bg-blue-50/50">
            <div className="flex items-start gap-3">
              <Info size={18} className="text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-700">
                Manage the short video cards in the <strong>Quick Tips (Shorts)</strong> section on the home page.
                Each card needs a title, author, view count, thumbnail image URL, and a YouTube embed URL.
              </p>
            </div>
          </Card>

          <div className="space-y-4">
            {(config.quick_tips || []).map((tip, idx) => (
              <Card key={idx} className="p-6 border border-gray-100 shadow-sm relative group hover:border-[#E53935]/30 transition-all duration-300">
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-400">Card #{idx + 1}</span>
                  <button
                    onClick={async () => {
                      if (!(await confirmPopup("Remove this quick tip card?"))) return;
                      const list = [...(config.quick_tips || [])];
                      list.splice(idx, 1);
                      setConfig(p => ({ ...p, quick_tips: list }));
                    }}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    title="Remove this card"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="grid md:grid-cols-12 gap-4">
                  {/* Number Badge */}
                  <div className="md:col-span-2">
                    <Label htmlFor={`qt-num-${idx}`}>Number Badge</Label>
                    <Input
                      id={`qt-num-${idx}`}
                      value={tip.num}
                      onChange={e => {
                        const list = [...(config.quick_tips || [])];
                        list[idx] = { ...list[idx], num: e.target.value };
                        setConfig(p => ({ ...p, quick_tips: list }));
                      }}
                      placeholder="e.g. #1"
                      className="mt-1"
                    />
                  </div>

                  {/* Title */}
                  <div className="md:col-span-5">
                    <Label htmlFor={`qt-title-${idx}`}>Video Title</Label>
                    <Input
                      id={`qt-title-${idx}`}
                      value={tip.title}
                      onChange={e => {
                        const list = [...(config.quick_tips || [])];
                        list[idx] = { ...list[idx], title: e.target.value };
                        setConfig(p => ({ ...p, quick_tips: list }));
                      }}
                      placeholder="e.g. Risk Management Tips"
                      className="mt-1"
                    />
                  </div>

                  {/* Author */}
                  <div className="md:col-span-3">
                    <Label htmlFor={`qt-author-${idx}`}>Author Name</Label>
                    <Input
                      id={`qt-author-${idx}`}
                      value={tip.author}
                      onChange={e => {
                        const list = [...(config.quick_tips || [])];
                        list[idx] = { ...list[idx], author: e.target.value };
                        setConfig(p => ({ ...p, quick_tips: list }));
                      }}
                      placeholder="e.g. Rahul S."
                      className="mt-1"
                    />
                  </div>

                  {/* Views */}
                  <div className="md:col-span-2">
                    <Label htmlFor={`qt-views-${idx}`}>Views</Label>
                    <Input
                      id={`qt-views-${idx}`}
                      value={tip.views}
                      onChange={e => {
                        const list = [...(config.quick_tips || [])];
                        list[idx] = { ...list[idx], views: e.target.value };
                        setConfig(p => ({ ...p, quick_tips: list }));
                      }}
                      placeholder="e.g. 12K"
                      className="mt-1"
                    />
                  </div>

                  {/* Embed URL */}
                  <div className="md:col-span-6">
                    <Label htmlFor={`qt-embed-${idx}`}>YouTube Embed URL</Label>
                    <Input
                      id={`qt-embed-${idx}`}
                      value={tip.embedUrl}
                      onChange={e => {
                        const list = [...(config.quick_tips || [])];
                        list[idx] = { ...list[idx], embedUrl: e.target.value };
                        setConfig(p => ({ ...p, quick_tips: list }));
                      }}
                      placeholder="https://www.youtube.com/embed/VIDEO_ID"
                      className="mt-1"
                    />
                  </div>

                  {/* Thumbnail Uploader */}
                  <div className="md:col-span-6">
                    <Label htmlFor={`qt-thumb-${idx}`}>Thumbnail Image</Label>
                    <p className="text-[10px] text-gray-500 mb-1">Recommended: Vertical short video thumbnail (9:16 ratio), e.g., 1080x1920 pixels.</p>
                    <Input
                      id={`qt-thumb-${idx}`}
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        if (!e.target.files || e.target.files.length === 0) return;
                        const file = e.target.files[0];
                        const formData = new FormData();
                        formData.append("file", file);

                        try {
                          showToast("Uploading thumbnail...", "success");
                          const res = await api.post("/admin/upload", formData, {
                            headers: { "Content-Type": "multipart/form-data" }
                          });
                          if (res.data && res.data.url) {
                            const list = [...(config.quick_tips || [])];
                            list[idx] = { ...list[idx], thumbnail: res.data.url };
                            setConfig(p => ({ ...p, quick_tips: list }));
                            showToast("Thumbnail uploaded successfully!", "success");
                          }
                        } catch {
                          showToast("Upload failed.", "error");
                        }
                      }}
                      className="mt-1 text-sm file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#E53935]/10 file:text-[#E53935] hover:file:bg-[#E53935]/20 cursor-pointer"
                    />
                    {tip.thumbnail && (
                      <div className="mt-2 flex items-center gap-3">
                        <img
                          src={getImageUrl(tip.thumbnail)}
                          alt="preview"
                          className="h-20 w-12 object-cover rounded-lg border border-gray-200"
                          style={{ aspectRatio: "9/16" }}
                          onError={e => (e.currentTarget.style.display = "none")}
                        />
                        <span className="text-xs text-gray-500 truncate max-w-[200px]" title={tip.thumbnail}>
                          {tip.thumbnail}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="flex gap-4">
            <Button
              onClick={async () => {
                const list = [...(config.quick_tips || [])];
                const nextNum = `#${list.length + 1}`;
                list.push({
                  id: `v${Date.now()}`,
                  num: nextNum,
                  title: "",
                  author: "",
                  views: "0",
                  thumbnail: "",
                  embedUrl: ""
                });
                setConfig(p => ({ ...p, quick_tips: list }));
              }}
              variant="outline"
              className="border border-[#E53935] text-[#E53935] hover:bg-[#E53935]/5"
            >
              <Plus size={16} className="mr-2" /> Add Quick Tip Card
            </Button>

            <Button
              onClick={() => saveConfig({ quick_tips: config.quick_tips })}
              className="bg-[#E53935] text-white hover:bg-[#b71c1c]"
            >
              <Save size={16} className="mr-2" /> Save Quick Tips
            </Button>
          </div>
        </div>
      )}

      {/* ── TAB: Why Choose Us ────────────────────────────────────── */}
      {activeTab === "why_choose" && !configLoading && (
        <div className="space-y-6">
          <Card className="p-4 border border-blue-100 bg-blue-50/50">
            <div className="flex items-start gap-3">
              <Info size={18} className="text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-700">
                Manage the cards appearing in the <strong>Why Choose FinTrade (Our Edge) Section</strong> on the home page. You can add, edit, or delete cards. Choose an icon name from Lucide React to match the card style.
              </p>
            </div>
          </Card>

          <div className="space-y-4">
            {(config.why_choose || []).map((item, idx) => (
              <Card key={idx} className="p-6 border border-gray-100 shadow-sm relative group hover:border-[#E53935]/30 transition-all duration-300">
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-400">Card #{idx + 1}</span>
                  <button
                    onClick={async () => {
                      if (!(await confirmPopup("Remove this card?"))) return;
                      const list = [...(config.why_choose || [])];
                      list.splice(idx, 1);
                      setConfig(p => ({ ...p, why_choose: list }));
                    }}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    title="Remove this card"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="grid md:grid-cols-12 gap-4">
                  {/* Badge Number */}
                  <div className="md:col-span-2">
                    <Label htmlFor={`wc-num-${idx}`}>Number Badge</Label>
                    <Input
                      id={`wc-num-${idx}`}
                      value={item.num}
                      onChange={e => {
                        const list = [...(config.why_choose || [])];
                        list[idx] = { ...list[idx], num: e.target.value };
                        setConfig(p => ({ ...p, why_choose: list }));
                      }}
                      placeholder="e.g. 01"
                      className="mt-1"
                    />
                  </div>

                  {/* Title */}
                  <div className="md:col-span-6">
                    <Label htmlFor={`wc-title-${idx}`}>Card Title</Label>
                    <Input
                      id={`wc-title-${idx}`}
                      value={item.title}
                      onChange={e => {
                        const list = [...(config.why_choose || [])];
                        list[idx] = { ...list[idx], title: e.target.value };
                        setConfig(p => ({ ...p, why_choose: list }));
                      }}
                      placeholder="e.g. AI Tutor Support"
                      className="mt-1"
                    />
                  </div>

                  {/* Logo Upload / Icon selector */}
                  <div className="md:col-span-12">
                    <Label className="text-gray-700 font-bold">Why Choose Us Custom Logo (PNG/SVG) — Or Custom Lucide Icon</Label>
                    <div className="grid md:grid-cols-2 gap-4 mt-2">
                      <div className="flex flex-col gap-2">
                        <Label className="text-xs text-gray-500 font-bold">Lucide Icon Selection</Label>
                        <div className="flex gap-2">
                          <select
                            value={["Brain", "BookOpen", "LineChart", "Trophy", "TrendingUp", "Award", "Target", "Shield", "Cpu"].includes(item.icon) ? item.icon : "Custom"}
                            onChange={e => {
                              const val = e.target.value;
                              if (val !== "Custom") {
                                const list = [...(config.why_choose || [])];
                                list[idx] = { ...list[idx], icon: val };
                                setConfig(p => ({ ...p, why_choose: list }));
                              }
                            }}
                            className="flex h-10 w-1/2 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          >
                            <option value="Brain">Brain</option>
                            <option value="BookOpen">BookOpen</option>
                            <option value="LineChart">LineChart</option>
                            <option value="Trophy">Trophy</option>
                            <option value="TrendingUp">TrendingUp</option>
                            <option value="Award">Award</option>
                            <option value="Target">Target</option>
                            <option value="Shield">Shield</option>
                            <option value="Cpu">Cpu</option>
                            <option value="Custom">Custom / Other</option>
                          </select>
                          <Input
                            value={item.icon.startsWith("/uploads") ? "" : item.icon}
                            onChange={e => {
                              const list = [...(config.why_choose || [])];
                              list[idx] = { ...list[idx], icon: e.target.value };
                              setConfig(p => ({ ...p, why_choose: list }));
                            }}
                            placeholder="Or type Lucide icon name..."
                            className="flex-1"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <Label className="text-xs text-gray-500 font-bold">Custom Image Upload</Label>
                        <p className="text-[10px] text-gray-400 font-normal">Recommended: Square logo/icon (1:1 ratio) with transparent background, e.g., 128x128 px.</p>
                        <div className="flex items-center gap-3">
                          <Input
                            key={item.icon}
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              if (!e.target.files || e.target.files.length === 0) return;
                              const file = e.target.files[0];
                              const formData = new FormData();
                              formData.append("file", file);

                              try {
                                showToast("Uploading why choose us logo...", "success");
                                const res = await api.post("/admin/upload", formData, {
                                  headers: { "Content-Type": "multipart/form-data" }
                                });
                                if (res.data && res.data.url) {
                                  const list = [...(config.why_choose || [])];
                                  list[idx] = { ...list[idx], icon: res.data.url };
                                  setConfig(p => ({ ...p, why_choose: list }));
                                  showToast("Why Choose Us logo uploaded!", "success");
                                }
                              } catch {
                                showToast("Upload failed.", "error");
                              }
                            }}
                            className="flex-1 cursor-pointer h-10 py-1.5"
                          />
                          {item.icon.startsWith("/uploads") && (
                            <Button
                              type="button"
                              variant="outline"
                              onClick={async () => {
                                const list = [...(config.why_choose || [])];
                                list[idx] = { ...list[idx], icon: "Brain" };
                                setConfig(p => ({ ...p, why_choose: list }));
                              }}
                              className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 h-10 px-3 flex items-center gap-1.5"
                            >
                              <Trash2 size={14} /> Remove Image
                            </Button>
                          )}
                          {item.icon.startsWith("/uploads") && (
                            <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                              <img src={getImageUrl(item.icon)} alt="icon preview" className="w-full h-full object-cover" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="md:col-span-12">
                    <Label htmlFor={`wc-desc-${idx}`}>Description</Label>
                    <Input
                      id={`wc-desc-${idx}`}
                      value={item.desc}
                      onChange={e => {
                        const list = [...(config.why_choose || [])];
                        list[idx] = { ...list[idx], desc: e.target.value };
                        setConfig(p => ({ ...p, why_choose: list }));
                      }}
                      placeholder="Card description..."
                      className="mt-1"
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="flex gap-4">
            <Button
              onClick={async () => {
                const list = [...(config.why_choose || [])];
                const nextIdxStr = String(list.length + 1).padStart(2, "0");
                list.push({
                  num: nextIdxStr,
                  title: "",
                  desc: "",
                  icon: "Brain"
                });
                setConfig(p => ({ ...p, why_choose: list }));
              }}
              variant="outline"
              className="border border-[#E53935] text-[#E53935] hover:bg-[#E53935]/5"
            >
              <Plus size={16} className="mr-2" /> Add Card
            </Button>

            <Button
              onClick={() => saveConfig({ why_choose: config.why_choose })}
              className="bg-[#E53935] text-white hover:bg-[#b71c1c]"
            >
              <Save size={16} className="mr-2" /> Save Why Choose Us
            </Button>
          </div>
        </div>
      )}

      {/* ── TAB: Leadership Team ────────────────────────────────────── */}
      {activeTab === "leadership" && !configLoading && (
        <div className="space-y-6">
          <Card className="p-4 border border-blue-100 bg-blue-50/50">
            <div className="flex items-start gap-3">
              <Info size={18} className="text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-700">
                Manage the team members appearing in the <strong>Meet Our Leadership Section</strong> on the home page. You can add, edit, or delete leaders. Each leader profile contains full info including custom bio, comma-separated tags, and 3 custom stats cards.
              </p>
            </div>
          </Card>

          <div className="space-y-6">
            {(config.leadership || []).map((leader, idx) => (
              <Card key={idx} className="p-6 border border-gray-100 shadow-sm relative group hover:border-[#E53935]/30 transition-all duration-300">
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-400">Leader #{idx + 1}</span>
                  <button
                    onClick={async () => {
                      if (!(await confirmPopup("Remove this leader profile?"))) return;
                      const list = [...(config.leadership || [])];
                      list.splice(idx, 1);
                      setConfig(p => ({ ...p, leadership: list }));
                    }}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    title="Remove this leader"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="grid md:grid-cols-12 gap-5">
                  {/* Name */}
                  <div className="md:col-span-4">
                    <Label htmlFor={`ld-name-${idx}`}>Full Name</Label>
                    <Input
                      id={`ld-name-${idx}`}
                      value={leader.name}
                      onChange={e => {
                        const list = [...(config.leadership || [])];
                        list[idx] = { ...list[idx], name: e.target.value };
                        setConfig(p => ({ ...p, leadership: list }));
                      }}
                      placeholder="e.g. Het Vyas"
                      className="mt-1"
                    />
                  </div>

                  {/* Title */}
                  <div className="md:col-span-4">
                    <Label htmlFor={`ld-title-${idx}`}>Role / Title</Label>
                    <Input
                      id={`ld-title-${idx}`}
                      value={leader.title}
                      onChange={e => {
                        const list = [...(config.leadership || [])];
                        list[idx] = { ...list[idx], title: e.target.value };
                        setConfig(p => ({ ...p, leadership: list }));
                      }}
                      placeholder="e.g. Founder & COO"
                      className="mt-1"
                    />
                  </div>

                  {/* Monogram */}
                  <div className="md:col-span-2">
                    <Label htmlFor={`ld-mono-${idx}`}>Monogram</Label>
                    <Input
                      id={`ld-mono-${idx}`}
                      value={leader.monogram}
                      onChange={e => {
                        const list = [...(config.leadership || [])];
                        list[idx] = { ...list[idx], monogram: e.target.value };
                        setConfig(p => ({ ...p, leadership: list }));
                      }}
                      placeholder="e.g. HV"
                      className="mt-1"
                    />
                  </div>

                  {/* Profile Image Uploader */}
                  <div className="md:col-span-12 border-t border-gray-100 pt-4 mt-2">
                    <Label className="text-gray-700 font-bold">Profile Portrait</Label>
                    <p className="text-xs text-gray-500 mb-2">
                      Recommended: Square image (1:1 aspect ratio), e.g., 512x512 pixels. Ensure the face is centered with some space (headroom padding) at the top so the head does not get cropped.
                    </p>
                    <div className="flex items-center gap-3">
                      <Input
                        key={leader.profile_image}
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          if (!e.target.files || e.target.files.length === 0) return;
                          const file = e.target.files[0];
                          const formData = new FormData();
                          formData.append("file", file);
                          try {
                            showToast("Uploading portrait...", "success");
                            const res = await api.post("/admin/upload", formData, {
                              headers: { "Content-Type": "multipart/form-data" }
                            });
                            if (res.data && res.data.url) {
                              const list = [...(config.leadership || [])];
                              list[idx] = { ...list[idx], profile_image: res.data.url };
                              setConfig(p => ({ ...p, leadership: list }));
                              showToast("Portrait uploaded!", "success");
                            }
                          } catch {
                            showToast("Upload failed.", "error");
                          }
                        }}
                        className="cursor-pointer h-10 py-1.5 text-xs flex-1 max-w-md"
                      />
                      {leader.profile_image && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={async () => {
                            const list = [...(config.leadership || [])];
                            list[idx] = { ...list[idx], profile_image: "" };
                            setConfig(p => ({ ...p, leadership: list }));
                          }}
                          className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 h-10 px-3 flex items-center gap-1.5"
                        >
                          <Trash2 size={14} /> Remove Image
                        </Button>
                      )}
                      {leader.profile_image && (
                        <div className="relative w-10 h-10 rounded-full overflow-hidden border border-gray-200 flex-shrink-0">
                          <img src={getImageUrl(leader.profile_image)} alt="preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Header Detail */}
                  <div className="md:col-span-12">
                    <Label htmlFor={`ld-header-${idx}`}>Header Detail (Icon + Text)</Label>
                    <Input
                      id={`ld-header-${idx}`}
                      value={leader.headerDetail}
                      onChange={e => {
                        const list = [...(config.leadership || [])];
                        list[idx] = { ...list[idx], headerDetail: e.target.value };
                        setConfig(p => ({ ...p, leadership: list }));
                      }}
                      placeholder="e.g. 📈 ₹50 Cr+ Live Market Experience"
                      className="mt-1"
                    />
                  </div>

                  {/* Stats Cards (3 cards) */}
                  <div className="md:col-span-12 border-t border-gray-50 pt-4 mt-2">
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">Stat Badges (Exactly 3)</h4>
                    <div className="grid md:grid-cols-3 gap-4">
                      {Array.from({ length: 3 }).map((_, sIdx) => {
                        const leaderStats = leader.stats || [];
                        const statItem = leaderStats[sIdx] || { value: "", label: "" };
                        return (
                          <div key={sIdx} className="p-4 bg-gray-50 rounded-xl border border-gray-100/50 space-y-2">
                            <Label className="text-[10px] text-gray-400 font-bold uppercase">Badge #{sIdx + 1}</Label>
                            <div>
                              <Label className="text-xs">Value</Label>
                              <Input
                                value={statItem.value}
                                onChange={e => {
                                  const list = [...(config.leadership || [])];
                                  const currentStats = [...(list[idx].stats || [])];
                                  while (currentStats.length <= sIdx) {
                                    currentStats.push({ value: "", label: "" });
                                  }
                                  currentStats[sIdx] = { ...currentStats[sIdx], value: e.target.value };
                                  list[idx] = { ...list[idx], stats: currentStats };
                                  setConfig(p => ({ ...p, leadership: list }));
                                }}
                                placeholder="e.g. ₹50 Cr+"
                                className="mt-1 h-8 text-xs"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Label</Label>
                              <Input
                                value={statItem.label}
                                onChange={e => {
                                  const list = [...(config.leadership || [])];
                                  const currentStats = [...(list[idx].stats || [])];
                                  while (currentStats.length <= sIdx) {
                                    currentStats.push({ value: "", label: "" });
                                  }
                                  currentStats[sIdx] = { ...currentStats[sIdx], label: e.target.value };
                                  list[idx] = { ...list[idx], stats: currentStats };
                                  setConfig(p => ({ ...p, leadership: list }));
                                }}
                                placeholder="e.g. Market Experience"
                                className="mt-1 h-8 text-xs"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="md:col-span-12">
                    <Label htmlFor={`ld-bio-${idx}`}>Full Biography Dossier</Label>
                    <textarea
                      id={`ld-bio-${idx}`}
                      value={leader.bio}
                      onChange={e => {
                        const list = [...(config.leadership || [])];
                        list[idx] = { ...list[idx], bio: e.target.value };
                        setConfig(p => ({ ...p, leadership: list }));
                      }}
                      placeholder="Enter detailed dossier bio..."
                      className="mt-1 flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      rows={4}
                    />
                  </div>

                  {/* Tags */}
                  <div className="md:col-span-12">
                    <Label htmlFor={`ld-tags-${idx}`}>Badges / Tags (Comma separated)</Label>
                    <Input
                      id={`ld-tags-${idx}`}
                      value={(leader.tags || []).join(", ")}
                      onChange={e => {
                        const list = [...(config.leadership || [])];
                        const cleanTags = e.target.value.split(",").map(t => t.trim()).filter(Boolean);
                        list[idx] = { ...list[idx], tags: cleanTags };
                        setConfig(p => ({ ...p, leadership: list }));
                      }}
                      placeholder="e.g. ₹50 Cr+ Live Market Experience, Forex Expert, EdTech Founder"
                      className="mt-1"
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="flex gap-4">
            <Button
              onClick={async () => {
                const list = [...(config.leadership || [])];
                list.push({
                  name: "",
                  title: "",
                  monogram: "",
                  headerDetail: "",
                  stats: [
                    { value: "", label: "" },
                    { value: "", label: "" },
                    { value: "", label: "" }
                  ],
                  bio: "",
                  tags: [],
                  profile_image: ""
                });
                setConfig(p => ({ ...p, leadership: list }));
              }}
              variant="outline"
              className="border border-[#E53935] text-[#E53935] hover:bg-[#E53935]/5"
            >
              <Plus size={16} className="mr-2" /> Add Leader Profile
            </Button>

            <Button
              onClick={() => saveConfig({ leadership: config.leadership })}
              className="bg-[#E53935] text-white hover:bg-[#b71c1c]"
            >
              <Save size={16} className="mr-2" /> Save Leadership Team
            </Button>
          </div>
        </div>
      )}

      {/* ── TAB: Hero & Carousel ──────────────────────────────────── */}
      {activeTab === "hero_slider" && !configLoading && (
        <div className="space-y-6">
          <Card className="p-4 border border-blue-100 bg-blue-50/50">
            <div className="flex items-start gap-3">
              <Info size={18} className="text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-700">
                Configure the primary Hero Section buttons and the three slides in the landing page Carousel. You can customize action button names, link them to specific pages, attach YouTube videos, or upload brochure PDF files.
              </p>
            </div>
          </Card>

          {/* Hero Action Buttons */}
          <Card className="p-6 border border-gray-100 shadow-sm">
            <h2 className="text-lg font-bold mb-5 flex items-center gap-2" style={{ color: "#121212" }}>
              <LayoutTemplate size={18} className="text-[#E53935]" /> Hero Section Action Buttons
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Button 1 */}
              <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                  <span className="w-5.5 h-5.5 rounded-full bg-[#E53935]/10 text-[#E53935] flex items-center justify-center font-bold text-xs">1</span>
                  <span className="font-bold text-sm text-gray-800">Primary Button</span>
                </div>
                <div>
                  <Label htmlFor="btn1-name">Button Label</Label>
                  <Input
                    id="btn1-name"
                    value={config.hero_buttons?.btn1_name || ""}
                    onChange={e => setConfig(p => ({
                      ...p,
                      hero_buttons: {
                        ...(p.hero_buttons || { btn1_name: "", btn2_name: "", btn2_youtube_url: "", btn3_name: "", btn3_file_url: "" }),
                        btn1_name: e.target.value
                      }
                    }))}
                    placeholder="e.g. Apply Now"
                    className="mt-1 bg-white"
                  />
                </div>
                <div>
                  <Label>Redirect Destination</Label>
                  <p className="text-xs text-gray-400 font-semibold mt-1.5">Fixed redirection to <code className="bg-gray-200 px-1 py-0.5 rounded">/courses</code></p>
                </div>
              </div>

              {/* Button 2 */}
              <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                  <span className="w-5.5 h-5.5 rounded-full bg-[#E53935]/10 text-[#E53935] flex items-center justify-center font-bold text-xs">2</span>
                  <span className="font-bold text-sm text-gray-800">Secondary Video Button</span>
                </div>
                <div>
                  <Label htmlFor="btn2-name">Button Label</Label>
                  <Input
                    id="btn2-name"
                    value={config.hero_buttons?.btn2_name || ""}
                    onChange={e => setConfig(p => ({
                      ...p,
                      hero_buttons: {
                        ...(p.hero_buttons || { btn1_name: "", btn2_name: "", btn2_youtube_url: "", btn3_name: "", btn3_file_url: "" }),
                        btn2_name: e.target.value
                      }
                    }))}
                    placeholder="e.g. Watch: The FinTrade Story"
                    className="mt-1 bg-white"
                  />
                </div>
                <div>
                  <Label htmlFor="btn2-url">YouTube Video URL</Label>
                  <Input
                    id="btn2-url"
                    value={config.hero_buttons?.btn2_youtube_url || ""}
                    onChange={e => setConfig(p => ({
                      ...p,
                      hero_buttons: {
                        ...(p.hero_buttons || { btn1_name: "", btn2_name: "", btn2_youtube_url: "", btn3_name: "", btn3_file_url: "" }),
                        btn2_youtube_url: e.target.value
                      }
                    }))}
                    placeholder="e.g. https://www.youtube.com/watch?v=..."
                    className="mt-1 bg-white text-xs"
                  />
                </div>
              </div>

              {/* Button 3 */}
              <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                  <span className="w-5.5 h-5.5 rounded-full bg-[#E53935]/10 text-[#E53935] flex items-center justify-center font-bold text-xs">3</span>
                  <span className="font-bold text-sm text-gray-800">Brochure Button</span>
                </div>
                <div>
                  <Label htmlFor="btn3-name">Button Label</Label>
                  <Input
                    id="btn3-name"
                    value={config.hero_buttons?.btn3_name || ""}
                    onChange={e => setConfig(p => ({
                      ...p,
                      hero_buttons: {
                        ...(p.hero_buttons || { btn1_name: "", btn2_name: "", btn2_youtube_url: "", btn3_name: "", btn3_file_url: "" }),
                        btn3_name: e.target.value
                      }
                    }))}
                    placeholder="e.g. Download Brochure"
                    className="mt-1 bg-white"
                  />
                </div>
                <div>
                  <Label htmlFor="brochure-file">Brochure File (PDF)</Label>
                  <Input
                    id="brochure-file"
                    type="file"
                    accept=".pdf"
                    onChange={async (e) => {
                      if (!e.target.files || e.target.files.length === 0) return;
                      const file = e.target.files[0];
                      const formData = new FormData();
                      formData.append("file", file);

                      try {
                        showToast("Uploading brochure PDF...", "success");
                        const res = await api.post("/admin/upload", formData, {
                          headers: { "Content-Type": "multipart/form-data" }
                        });
                        if (res.data && res.data.url) {
                          setConfig(p => ({
                            ...p,
                            hero_buttons: {
                              ...(p.hero_buttons || { btn1_name: "", btn2_name: "", btn2_youtube_url: "", btn3_name: "", btn3_file_url: "" }),
                              btn3_file_url: res.data.url
                            }
                          }));
                          showToast("Brochure PDF uploaded successfully!", "success");
                        }
                      } catch {
                        showToast("Failed to upload PDF brochure.", "error");
                      }
                    }}
                    className="mt-1 bg-white text-xs cursor-pointer h-10 py-1.5"
                  />
                  {config.hero_buttons?.btn3_file_url && (
                    <div className="mt-2.5 flex items-center justify-between text-xs bg-white px-3 py-2 rounded-lg border border-gray-200">
                      <span className="truncate text-gray-500 font-semibold max-w-[150px]">{config.hero_buttons.btn3_file_url}</span>
                      <a href={config.hero_buttons.btn3_file_url} target="_blank" rel="noreferrer" className="text-[#E53935] hover:underline font-bold flex-shrink-0">View File</a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Carousel slides */}
          <Card className="p-6 border border-gray-100 shadow-sm">
            <h2 className="text-lg font-bold mb-5 flex items-center gap-2" style={{ color: "#121212" }}>
              <LayoutTemplate size={18} className="text-[#E53935]" /> Carousel Slides (3 Slides)
            </h2>

            <div className="space-y-6">
              {[0, 1, 2].map((idx) => {
                const slide = (config.carousel_slides || [])[idx] || { title: "", subtitle: "", buttonText: "", link: "/" };
                return (
                  <div key={idx} className="p-6 rounded-2xl bg-gray-50 border border-gray-100 relative">
                    <span className="absolute top-4 right-4 bg-gray-200 text-gray-600 px-3 py-1 text-[10px] font-black rounded-full uppercase tracking-wider">Slide #{idx + 1}</span>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`slide-title-${idx}`}>Slide Title</Label>
                        <Input
                          id={`slide-title-${idx}`}
                          value={slide.title}
                          onChange={e => {
                            const list = [...(config.carousel_slides || [{ title: "", subtitle: "", buttonText: "", link: "/" }, { title: "", subtitle: "", buttonText: "", link: "/" }, { title: "", subtitle: "", buttonText: "", link: "/" }])];
                            list[idx] = { ...list[idx], title: e.target.value };
                            setConfig(p => ({ ...p, carousel_slides: list }));
                          }}
                          placeholder="e.g. Learn from the Best"
                          className="mt-1 bg-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`slide-subtitle-${idx}`}>Slide Subtitle</Label>
                        <Input
                          id={`slide-subtitle-${idx}`}
                          value={slide.subtitle}
                          onChange={e => {
                            const list = [...(config.carousel_slides || [{ title: "", subtitle: "", buttonText: "", link: "/" }, { title: "", subtitle: "", buttonText: "", link: "/" }, { title: "", subtitle: "", buttonText: "", link: "/" }])];
                            list[idx] = { ...list[idx], subtitle: e.target.value };
                            setConfig(p => ({ ...p, carousel_slides: list }));
                          }}
                          placeholder="e.g. Get 1-on-1 mentorship..."
                          className="mt-1 bg-white text-xs sm:text-sm"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`slide-btn-text-${idx}`}>Button Text</Label>
                        <Input
                          id={`slide-btn-text-${idx}`}
                          value={slide.buttonText}
                          onChange={e => {
                            const list = [...(config.carousel_slides || [{ title: "", subtitle: "", buttonText: "", link: "/" }, { title: "", subtitle: "", buttonText: "", link: "/" }, { title: "", subtitle: "", buttonText: "", link: "/" }])];
                            list[idx] = { ...list[idx], buttonText: e.target.value };
                            setConfig(p => ({ ...p, carousel_slides: list }));
                          }}
                          placeholder="e.g. Meet Mentors"
                          className="mt-1 bg-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`slide-link-${idx}`}>Redirect Destination</Label>
                        <select
                          id={`slide-link-${idx}`}
                          value={slide.link}
                          onChange={e => {
                            const list = [...(config.carousel_slides || [{ title: "", subtitle: "", buttonText: "", link: "/" }, { title: "", subtitle: "", buttonText: "", link: "/" }, { title: "", subtitle: "", buttonText: "", link: "/" }])];
                            list[idx] = { ...list[idx], link: e.target.value };
                            setConfig(p => ({ ...p, carousel_slides: list }));
                          }}
                          className="mt-1 flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                          <option value="/">Home (/)</option>
                          <option value="/courses">Courses (/courses)</option>
                          <option value="/markets">Markets (/markets)</option>
                          <option value="/category/advanced">Categories (/category/advanced)</option>
                          <option value="/updates">Updates (/updates)</option>
                          <option value="/blog">Blog (/blog)</option>
                          <option value="/about">About (/about)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Hero Background Slider Images */}
          <Card className="p-6 border border-gray-100 shadow-sm">
            <h2 className="text-lg font-bold mb-5 flex items-center gap-2" style={{ color: "#121212" }}>
              <Globe size={18} className="text-[#E53935]" /> Hero Background Slider Images (Exactly 3 Images)
            </h2>
            <p className="text-xs text-gray-500 mb-4 font-semibold">
              These 3 background images slide dynamically in the background of the Hero section. You can upload a new background image file or paste an image URL.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[0, 1, 2].map((idx) => {
                const defaultBgs = ["/background.jpg", "/backgroundimage-1.avif", "/backgroundimage-2.avif"];
                const bgList = config.hero_backgrounds && config.hero_backgrounds.length > 0
                  ? config.hero_backgrounds
                  : defaultBgs;
                const bgUrl = bgList[idx] || "";

                return (
                  <div key={idx} className="p-5 rounded-2xl bg-gray-50 border border-gray-100 space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                      <span className="w-5.5 h-5.5 rounded-full bg-[#E53935]/10 text-[#E53935] flex items-center justify-center font-bold text-xs">{idx + 1}</span>
                      <span className="font-bold text-sm text-gray-800">Background Image {idx + 1}</span>
                    </div>

                    <div>
                      <Label htmlFor={`bg-url-${idx}`}>Image URL</Label>
                      <Input
                        id={`bg-url-${idx}`}
                        value={bgUrl}
                        onChange={e => {
                          const list = [...bgList];
                          list[idx] = e.target.value;
                          setConfig(p => ({ ...p, hero_backgrounds: list }));
                        }}
                        placeholder="e.g. /background.jpg or https://"
                        className="mt-1 bg-white text-xs"
                      />
                    </div>

                    <div>
                      <Label htmlFor={`bg-file-${idx}`}>Or Upload Image File</Label>
                      <Input
                        id={`bg-file-${idx}`}
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          if (!e.target.files || e.target.files.length === 0) return;
                          const file = e.target.files[0];
                          const formData = new FormData();
                          formData.append("file", file);

                          try {
                            showToast("Uploading background image...", "success");
                            const res = await api.post("/admin/upload", formData, {
                              headers: { "Content-Type": "multipart/form-data" }
                            });
                            if (res.data && res.data.url) {
                              const list = [...bgList];
                              list[idx] = res.data.url;
                              setConfig(p => ({ ...p, hero_backgrounds: list }));
                              showToast("Background image uploaded!", "success");
                            }
                          } catch {
                            showToast("Upload failed.", "error");
                          }
                        }}
                        className="mt-1 bg-white text-xs cursor-pointer h-10 py-1.5"
                      />
                    </div>

                    {bgUrl && (
                      <div className="mt-2 relative h-24 w-full rounded-lg border border-gray-200 overflow-hidden bg-gray-900">
                        <img
                          src={getImageUrl(bgUrl)}
                          alt={`Background ${idx + 1} preview`}
                          className="w-full h-full object-cover"
                          onError={e => (e.currentTarget.style.display = "none")}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          <Button
            onClick={() => saveConfig({
              hero_buttons: config.hero_buttons,
              carousel_slides: config.carousel_slides,
              hero_backgrounds: config.hero_backgrounds
            })}
            className="bg-[#E53935] text-white hover:bg-[#b71c1c]"
          >
            <Save size={16} className="mr-2" /> Save Hero & Carousel Settings
          </Button>
        </div>
      )}

      {/* ── TAB: Student Reviews Moderation ─────────────────────────── */}
      {activeTab === "reviews" && (
        <div className="space-y-6">
          <Card className="p-4 border border-blue-100 bg-blue-50/50">
            <div className="flex items-start gap-3">
              <Info size={18} className="text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-700">
                Moderate student and public reviews. Reviews with the <strong>"Show on Landing Page"</strong> toggle enabled will appear in the Testimonials Carousel section on the main landing page.
              </p>
            </div>
          </Card>

          <Card className="p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Submitted Reviews ({reviews.length})</h2>
                <p className="text-xs text-gray-500">Enable or disable reviews for display on the landing page</p>
              </div>
              <Button variant="ghost" size="sm" onClick={fetchReviews}>
                <RefreshCw size={14} className="mr-1" /> Refresh List
              </Button>
            </div>

            {reviewsLoading ? (
              <div className="flex justify-center items-center py-12">
                <RefreshCw className="h-8 w-8 text-[#E53935] animate-spin" />
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <Star size={48} className="mx-auto mb-3 opacity-20" />
                <p className="font-medium text-sm">No reviews submitted yet</p>
                <p className="text-xs text-gray-400 mt-1">Distribute feedback forms to students to gather testimonials.</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {reviews.map((rev) => (
                  <Card key={rev.id} className="p-5 border border-gray-100 shadow-sm hover:shadow transition-all relative flex flex-col justify-between">
                    <div>
                      {/* Top info and delete button */}
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-0.5">
                            Course Review
                          </span>
                          <h4 className="font-bold text-sm text-gray-800 line-clamp-1">
                            {rev.course_title || "General / Unknown Course"}
                          </h4>
                        </div>
                        <button
                          onClick={() => deleteReview(rev.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete Submission"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      {/* Stars */}
                      <div className="flex items-center gap-1 mb-3">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={14}
                            className={star <= rev.rating ? "fill-[#C2A86A] text-[#C2A86A]" : "text-gray-200"}
                          />
                        ))}
                        <span className="text-xs font-bold text-[#C2A86A] ml-1 bg-[#C2A86A]/10 px-1.5 py-0.5 rounded">
                          {rev.rating}/5
                        </span>
                      </div>

                      {/* Comment */}
                      <p className="text-gray-600 text-sm mb-4 leading-relaxed bg-gray-50/50 p-3 rounded-lg border border-gray-50 italic">
                        "{rev.comments || "No comments"}"
                      </p>
                    </div>

                    {/* Bottom moderation controls */}
                    <div className="border-t border-gray-100 pt-4 mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <div className="font-semibold text-xs text-gray-800">
                          {rev.user_name || "Anonymous"}
                        </div>
                        {rev.email && (
                          <div className="text-[10px] text-gray-400">
                            {rev.email}
                          </div>
                        )}
                        <div className="text-[9px] text-gray-400">
                          {new Date(rev.created_at).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100/80 transition-all px-3 py-1.5 rounded-xl border border-gray-100">
                        <input
                          id={`show-landing-${rev.id}`}
                          type="checkbox"
                          checked={rev.show_on_landing_page}
                          onChange={(e) => toggleReviewVisibility(rev.id, e.target.checked)}
                          className="w-4 h-4 rounded text-[#E53935] focus:ring-[#E53935]"
                        />
                        <Label
                          htmlFor={`show-landing-${rev.id}`}
                          className="cursor-pointer text-xs font-bold text-gray-700 select-none whitespace-nowrap"
                        >
                          Show on Landing Page
                        </Label>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ── TAB: Articles & Blogs Moderation ─────────────────────────── */}
      {activeTab === "articles" && (
        <div className="space-y-6">
          <Card className="p-4 border border-blue-100 bg-blue-50/50">
            <div className="flex items-start gap-3">
              <Info size={18} className="text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-700">
                Moderate articles, blogs, and market updates submitted by content editors. Articles with status <strong>"Published"</strong> will be visible on the public website. Draft articles require approval to go live.
              </p>
            </div>
          </Card>

          <Card className="p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Submitted Articles ({articles.length})</h2>
                <p className="text-xs text-gray-500">Enable or disable visibility of articles on the landing page/blog</p>
              </div>
              <Button variant="ghost" size="sm" onClick={fetchArticles}>
                <RefreshCw size={14} className="mr-1" /> Refresh List
              </Button>
            </div>

            {articlesLoading ? (
              <div className="flex justify-center items-center py-12">
                <RefreshCw className="h-8 w-8 text-[#E53935] animate-spin" />
              </div>
            ) : articles.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <Newspaper size={48} className="mx-auto mb-3 opacity-20" />
                <p className="font-medium text-sm">No articles found</p>
                <p className="text-xs text-gray-400 mt-1">Create updates or stories in the Blog & CMS section first.</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {articles.map((art) => (
                  <Card key={art.id} className="p-5 border border-gray-100 shadow-sm hover:shadow transition-all relative flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-0.5">
                            {art.type || "Blog Story"}
                          </span>
                          <h4 className="font-bold text-sm text-gray-800 line-clamp-2">
                            {art.title}
                          </h4>
                        </div>
                      </div>

                      {art.description && (
                        <p className="text-gray-600 text-xs mb-4 line-clamp-3 bg-gray-50/50 p-2.5 rounded border border-gray-50">
                          {art.description}
                        </p>
                      )}
                    </div>

                    <div className="border-t border-gray-100 pt-4 mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <div className="text-[10px] text-gray-400">
                          Views: {art.views_count || 0}
                        </div>
                        <div className="text-[9px] text-gray-400">
                          Created: {new Date(art.created_at || Date.now()).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100/80 transition-all px-3 py-1.5 rounded-xl border border-gray-100">
                        <input
                          id={`show-article-${art.id}`}
                          type="checkbox"
                          checked={art.status === "published"}
                          onChange={() => toggleArticleVisibility(art.id, art.status)}
                          className="w-4 h-4 rounded text-[#E53935] focus:ring-[#E53935]"
                        />
                        <Label
                          htmlFor={`show-article-${art.id}`}
                          className="cursor-pointer text-xs font-bold text-gray-700 select-none whitespace-nowrap"
                        >
                          Visible on Site
                        </Label>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ── TAB: About Us Page ─────────────────────────────────────── */}
      {activeTab === "about_us" && !aboutUsLoading && (
        <div className="space-y-6">
          <Card className="p-4 border border-blue-100 bg-blue-50/50">
            <div className="flex items-start gap-3">
              <Info size={18} className="text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-700">
                Manage the <strong>About Us</strong> page content, including the Hero Slider images, statistics counters, company vision, and mission.
              </p>
            </div>
          </Card>

          {/* Slider Background Images */}
          <Card className="p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold" style={{ color: "#121212" }}>Slider Background Images</h2>
              <Button onClick={() => saveAboutUsConfig({ slides: aboutUsConfig.slides })} className="bg-[#E53935] text-white hover:bg-[#b71c1c]">
                <Save size={16} className="mr-2" /> Save Slides
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {(aboutUsConfig.slides || []).map((slideUrl: string, idx: number) => (
                <div key={idx} className="relative group rounded-xl overflow-hidden border border-gray-200 shadow-sm aspect-video">
                  <img src={getImageUrl(slideUrl)} alt={`Slide ${idx + 1}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={async () => {
                        const newSlides = [...(aboutUsConfig.slides || [])];
                        newSlides.splice(idx, 1);
                        setAboutUsConfig((p: any) => ({ ...p, slides: newSlides }));
                      }}
                      className="p-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors transform hover:scale-110"
                      title="Remove this slide"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                  <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 text-white text-xs rounded-md backdrop-blur-sm">
                    Slide {idx + 1}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 border-t border-gray-100 pt-6">
              <Label className="text-gray-700 font-bold mb-2 block">Upload New Background Slide</Label>
              <div className="flex items-center gap-4">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    if (!e.target.files || e.target.files.length === 0) return;
                    const file = e.target.files[0];
                    const formData = new FormData();
                    formData.append("file", file);

                    try {
                      showToast("Uploading slide image...", "success");
                      const res = await api.post("/admin/upload", formData, {
                        headers: { "Content-Type": "multipart/form-data" }
                      });
                      if (res.data && res.data.url) {
                        const newSlides = [...(aboutUsConfig.slides || []), res.data.url];
                        setAboutUsConfig((p: any) => ({ ...p, slides: newSlides }));
                        showToast("Slide uploaded successfully!", "success");
                      }
                    } catch {
                      showToast("Slide upload failed.", "error");
                    }
                  }}
                  className="cursor-pointer max-w-md h-12 flex items-center"
                />
              </div>
            </div>
          </Card>

          {/* Stats Counters */}
          <Card className="p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold" style={{ color: "#121212" }}>Statistics Counters</h2>
              <Button onClick={() => saveAboutUsConfig({ stats: aboutUsConfig.stats })} className="bg-[#E53935] text-white hover:bg-[#b71c1c]">
                <Save size={16} className="mr-2" /> Save Stats
              </Button>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[0, 1, 2].map(idx => {
                const defaultStats = [
                  { value: "10k+", label: "Students Trained" },
                  { value: "₹50Cr+", label: "Capital Managed" },
                  { value: "90 Days", label: "To Get Funded" }
                ];
                const stats = aboutUsConfig.stats && aboutUsConfig.stats.length === 3 ? aboutUsConfig.stats : defaultStats;
                const stat = stats[idx];
                return (
                  <div key={idx} className="space-y-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <Label className="text-xs font-bold text-gray-500">Stat #{idx + 1}</Label>
                    <div>
                      <Label className="text-[10px]">Value (e.g. 10k+)</Label>
                      <Input
                        value={stat.value || stat.val || ""}
                        onChange={e => {
                          const newStats = [...stats];
                          newStats[idx] = { ...stat, value: e.target.value };
                          setAboutUsConfig((p: any) => ({ ...p, stats: newStats }));
                        }}
                        className="bg-white mt-1 h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-[10px]">Label (e.g. Students Trained)</Label>
                      <Input
                        value={stat.label || stat.lbl || ""}
                        onChange={e => {
                          const newStats = [...stats];
                          newStats[idx] = { ...stat, label: e.target.value };
                          setAboutUsConfig((p: any) => ({ ...p, stats: newStats }));
                        }}
                        className="bg-white mt-1 h-8"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Main Description */}
          <Card className="p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold" style={{ color: "#121212" }}>Main Description</h2>
              <Button onClick={() => saveAboutUsConfig({ text: aboutUsConfig.text })} className="bg-[#E53935] text-white hover:bg-[#b71c1c]">
                <Save size={16} className="mr-2" /> Save Description
              </Button>
            </div>
            <div className="space-y-4">
              {(() => {
                const defaultText = [
                  "FinTrade is a results-driven prop trading academy focused on developing skilled and disciplined traders. We combine practical learning, live market exposure, and structured mentorship to bridge the gap between knowledge and real trading performance.",
                  "Our programs are designed to build consistency, confidence, and profitability, guiding students from basics to professional-level trading."
                ];
                const texts = aboutUsConfig.text && aboutUsConfig.text.length > 0 ? aboutUsConfig.text : defaultText;
                return texts.map((txt: string, idx: number) => (
                  <div key={idx} className="relative group">
                    <textarea
                      value={txt}
                      onChange={e => {
                        const newTexts = [...texts];
                        newTexts[idx] = e.target.value;
                        setAboutUsConfig((p: any) => ({ ...p, text: newTexts }));
                      }}
                      className="w-full rounded-xl border border-gray-200 p-4 text-sm min-h-[100px] focus:outline-none focus:ring-2 focus:ring-[#E53935]/50"
                      placeholder="Enter description paragraph..."
                    />
                    <button
                      onClick={async () => {
                        const newTexts = [...texts];
                        newTexts.splice(idx, 1);
                        setAboutUsConfig((p: any) => ({ ...p, text: newTexts }));
                      }}
                      className="absolute top-2 right-2 p-1.5 bg-red-100 text-red-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ));
              })()}
              <Button
                type="button"
                variant="outline"
                onClick={async () => {
                  const texts = aboutUsConfig.text || [];
                  setAboutUsConfig((p: any) => ({ ...p, text: [...texts, ""] }));
                }}
                className="border border-[#E53935] text-[#E53935] hover:bg-[#E53935]/5"
              >
                <Plus size={16} className="mr-2" /> Add Paragraph
              </Button>
            </div>
          </Card>

          {/* Vision & Mission */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Vision */}
            <Card className="p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold" style={{ color: "#121212" }}>Our Vision</h2>
                <Button onClick={() => saveAboutUsConfig({ vision: aboutUsConfig.vision })} size="sm" className="bg-[#E53935] text-white hover:bg-[#b71c1c]">
                  <Save size={14} className="mr-2" /> Save Vision
                </Button>
              </div>
              <div className="space-y-4">
                {(() => {
                  const defaultVision = {
                    title: "Our Vision",
                    content: "To build India's most trusted, full-stack Prop Trading Education & Capital Allocation ecosystem — transforming retail traders into consistently profitable, funded professionals."
                  };
                  const vision = aboutUsConfig.vision || defaultVision;
                  return (
                    <>
                      <div>
                        <Label className="text-xs">Vision Title</Label>
                        <Input
                          value={vision.title || ""}
                          onChange={e => setAboutUsConfig((p: any) => ({ ...p, vision: { ...vision, title: e.target.value } }))}
                          className="bg-white mt-1 h-8"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Vision Description</Label>
                        <textarea
                          value={vision.content || ""}
                          onChange={e => setAboutUsConfig((p: any) => ({ ...p, vision: { ...vision, content: e.target.value } }))}
                          className="w-full rounded-xl border border-gray-200 p-3 text-sm min-h-[80px] mt-1"
                        />
                      </div>
                    </>
                  );
                })()}
              </div>
            </Card>

            {/* Mission */}
            <Card className="p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold" style={{ color: "#121212" }}>Our Mission</h2>
                <Button onClick={() => saveAboutUsConfig({ mission: aboutUsConfig.mission })} size="sm" className="bg-[#E53935] text-white hover:bg-[#b71c1c]">
                  <Save size={14} className="mr-2" /> Save Mission
                </Button>
              </div>
              <div className="space-y-4">
                {(() => {
                  const defaultMission = {
                    title: "Our Mission",
                    content: "To empower aspiring traders by providing them with the right knowledge, discipline, and capital required to succeed in global markets and achieve lasting financial freedom."
                  };
                  const mission = aboutUsConfig.mission || defaultMission;
                  return (
                    <>
                      <div>
                        <Label className="text-xs">Mission Title</Label>
                        <Input
                          value={mission.title || ""}
                          onChange={e => setAboutUsConfig((p: any) => ({ ...p, mission: { ...mission, title: e.target.value } }))}
                          className="bg-white mt-1 h-8"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Mission Description</Label>
                        <textarea
                          value={mission.content || ""}
                          onChange={e => setAboutUsConfig((p: any) => ({ ...p, mission: { ...mission, content: e.target.value } }))}
                          className="w-full rounded-xl border border-gray-200 p-3 text-sm min-h-[80px] mt-1"
                        />
                      </div>
                    </>
                  );
                })()}
              </div>
            </Card>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}
