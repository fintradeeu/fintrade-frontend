import { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "../../components/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Megaphone, Trash2, Plus, Save, RefreshCw, Globe, Phone, Video,
  Star, BookOpen, CheckCircle2, XCircle, LayoutTemplate, Link as LinkIcon,
  AlertTriangle, Info
} from "lucide-react";
import api from "../../services/api";

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

interface LandingConfig {
  hero?: { title: string; highlight: string; subtitle: string; badge: string };
  contact?: { phone: string; phone_href: string };
  social?: { instagram: string; facebook: string; youtube: string; linkedin: string };
  showcase_videos?: ShowcaseVideo[];
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
  const [activeTab, setActiveTab] = useState<"announcements" | "courses" | "settings" | "videos">("announcements");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Announcements state
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [newAnn, setNewAnn] = useState({ title: "", content: "", priority: 1 });

  // Courses state
  const [courses, setCourses] = useState<Course[]>([]);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  // Landing config state
  const [config, setConfig] = useState<LandingConfig>({});
  const [configLoading, setConfigLoading] = useState(true);

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

  useEffect(() => {
    fetchAnnouncements();
    fetchCourses();
    fetchConfig();
  }, [fetchAnnouncements, fetchCourses, fetchConfig]);

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
    if (!confirm("Delete this announcement?")) return;
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
        <TabBtn active={activeTab === "courses"} onClick={() => setActiveTab("courses")} icon={<BookOpen size={16} />} label="Featured Courses" />
        <TabBtn active={activeTab === "settings"} onClick={() => setActiveTab("settings")} icon={<Globe size={16} />} label="Site Settings" />
        <TabBtn active={activeTab === "videos"} onClick={() => setActiveTab("videos")} icon={<Video size={16} />} label="Showcase Videos" />
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

      {/* ── TAB: Site Settings ────────────────────────────────────── */}
      {activeTab === "settings" && !configLoading && (
        <div className="grid md:grid-cols-2 gap-6">
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

          {(config.showcase_videos || []).map((video, idx) => (
            <Card key={idx} className="p-6 border border-gray-100 shadow-sm">
              <h3 className="text-sm font-bold mb-4 text-gray-700">Video Slot {idx + 1}</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={video.title}
                    onChange={e => {
                      const vids = [...(config.showcase_videos || [])];
                      vids[idx] = { ...vids[idx], title: e.target.value };
                      setConfig(p => ({ ...p, showcase_videos: vids }));
                    }}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Subtitle</Label>
                  <Input
                    value={video.subtitle}
                    onChange={e => {
                      const vids = [...(config.showcase_videos || [])];
                      vids[idx] = { ...vids[idx], subtitle: e.target.value };
                      setConfig(p => ({ ...p, showcase_videos: vids }));
                    }}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Duration (e.g. 3:24)</Label>
                  <Input
                    value={video.duration}
                    onChange={e => {
                      const vids = [...(config.showcase_videos || [])];
                      vids[idx] = { ...vids[idx], duration: e.target.value };
                      setConfig(p => ({ ...p, showcase_videos: vids }));
                    }}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Video URL (YouTube embed / direct link)</Label>
                  <Input
                    value={video.url}
                    onChange={e => {
                      const vids = [...(config.showcase_videos || [])];
                      vids[idx] = { ...vids[idx], url: e.target.value };
                      setConfig(p => ({ ...p, showcase_videos: vids }));
                    }}
                    placeholder="https://youtube.com/embed/..."
                    className="mt-1"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Thumbnail Image URL</Label>
                  <Input
                    value={video.thumbnail}
                    onChange={e => {
                      const vids = [...(config.showcase_videos || [])];
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
              </div>
            </Card>
          ))}

          <Button
            onClick={() => saveConfig({ showcase_videos: config.showcase_videos })}
            className="bg-[#E53935] text-white hover:bg-[#b71c1c]"
          >
            <Save size={16} className="mr-2" /> Save All Videos
          </Button>
        </div>
      )}
    </DashboardLayout>
  );
}
