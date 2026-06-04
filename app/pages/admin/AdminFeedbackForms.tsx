import { useState, useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { toast } from "sonner";
import {
  FileText, Plus, Copy, Trash2, Edit, RefreshCw, Star, Info,
  Link as LinkIcon, CheckCircle2, AlertCircle, ToggleLeft, ToggleRight
} from "lucide-react";
import api from "../../services/api";

interface FeedbackFormItem {
  id: number;
  token?: string;
  title: string;
  description?: string;
  course_id: number;
  course_title?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface CourseItem {
  id: number;
  title: string;
}

export default function AdminFeedbackForms() {
  const [forms, setForms] = useState<FeedbackFormItem[]>([]);
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Modals state
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedForm, setSelectedForm] = useState<FeedbackFormItem | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    course_id: 0,
    is_active: true
  });

  const fetchForms = async () => {
    setLoading(true);
    try {
      const res = await api.get("/feedback/forms");
      setForms(res.data);
    } catch (err) {
      toast.error("Failed to load feedback forms.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await api.get("/courses");
      setCourses(res.data);
      if (res.data.length > 0) {
        setFormData(p => ({ ...p, course_id: res.data[0].id }));
      }
    } catch (err) {
      console.error("Failed to fetch courses", err);
    }
  };

  useEffect(() => {
    fetchForms();
    fetchCourses();
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("Form title is required.");
      return;
    }
    if (!formData.course_id) {
      toast.error("Please select a course.");
      return;
    }

    try {
      await api.post("/feedback/forms", formData);
      toast.success("Feedback form created successfully!");
      setCreateOpen(false);
      setFormData({ title: "", description: "", course_id: courses[0]?.id || 0, is_active: true });
      fetchForms();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to create feedback form.");
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedForm) return;

    try {
      await api.put(`/feedback/forms/${selectedForm.id}`, selectedForm);
      toast.success("Feedback form updated successfully!");
      setEditOpen(false);
      fetchForms();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to update feedback form.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this feedback form? Any submission metrics will remain, but the form will no longer be shareable.")) return;
    try {
      await api.delete(`/feedback/forms/${id}`);
      toast.success("Feedback form deleted.");
      fetchForms();
    } catch (err) {
      toast.error("Failed to delete feedback form.");
    }
  };

  const copyShareLink = (id: number, token?: string) => {
    const key = token || id;
    const link = `${window.location.origin}/feedback/submit/${key}`;
    navigator.clipboard.writeText(link);
    toast.success("Share link copied to clipboard!", {
      description: link,
      duration: 3000
    });
  };

  return (
    <DashboardLayout role="admin">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-[#0B2A5B]/10">
              <FileText className="h-6 w-6 text-[#0B2A5B]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#0B2A5B]">Feedback Forms</h1>
              <p className="text-gray-500 text-sm">Create and distribute feedback links to gather student testimonials</p>
            </div>
          </div>
          <Button
            onClick={() => setCreateOpen(true)}
            className="bg-[#0B2A5B] text-[#F4F1EA] hover:bg-[#1a3d7a] shadow-lg shadow-[#0B2A5B]/20"
          >
            <Plus className="mr-2 h-4 w-4" /> Create Form
          </Button>
        </div>
      </div>

      {/* Info Warning Banner */}
      <Card className="p-4 mb-6 border border-[#C2A86A]/20 bg-[#C2A86A]/5 flex items-start gap-3">
        <Info className="h-5 w-5 text-[#C2A86A] mt-0.5 flex-shrink-0" />
        <div className="text-sm text-[#0B2A5B]/80">
          <span className="font-semibold text-[#0B2A5B]">How it works:</span> Create a feedback form for any course, copy the generated share link, and distribute it to your students. Once submitted, their ratings and reviews will appear in the <span className="font-bold">Site Content</span> moderation panel where you can choose which reviews display on the landing page!
        </div>
      </Card>

      {/* Forms Grid */}
      {loading && forms.length === 0 ? (
        <div className="flex justify-center items-center py-20">
          <RefreshCw className="h-8 w-8 text-[#0B2A5B] animate-spin" />
        </div>
      ) : forms.length === 0 ? (
        <Card className="p-12 text-center border-2 border-dashed border-gray-200">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-[#0B2A5B] mb-1">No Feedback Forms Yet</h3>
          <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6">
            Generate feedback links for your published courses and start collecting public reviews.
          </p>
          <Button onClick={() => setCreateOpen(true)} className="bg-[#0B2A5B] text-[#F4F1EA] hover:bg-[#1a3d7a]">
            Create First Form
          </Button>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {forms.map(form => (
            <Card key={form.id} className="p-6 border border-gray-100 hover:border-[#0B2A5B]/20 shadow-md hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${form.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {form.is_active ? "Active" : "Inactive"}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setSelectedForm({ ...form });
                        setEditOpen(true);
                      }}
                      className="p-1.5 text-gray-400 hover:text-[#0B2A5B] hover:bg-[#0B2A5B]/5 rounded-lg transition-all"
                      title="Edit Form"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(form.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      title="Delete Form"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-[#0B2A5B] mb-1.5 line-clamp-1">{form.title}</h3>
                <p className="text-gray-500 text-xs mb-3 font-semibold uppercase tracking-wider">
                  Course: {form.course_title || "Unknown Course"}
                </p>
                {form.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">{form.description}</p>
                )}
              </div>

              <div className="border-t border-gray-100 pt-4 mt-2 flex gap-3">
                <Button
                  onClick={() => copyShareLink(form.id, form.token)}
                  variant="outline"
                  className="flex-1 border-[#0B2A5B]/20 text-[#0B2A5B] hover:bg-[#0B2A5B]/5 font-semibold text-xs h-9"
                >
                  <LinkIcon size={14} className="mr-1.5" /> Link
                </Button>
                <Button
                  onClick={() => window.open(`/feedback/submit/${form.token || form.id}`, "_blank")}
                  variant="outline"
                  className="flex-1 border-[#C2A86A]/30 text-[#C2A86A] hover:bg-[#C2A86A]/5 font-semibold text-xs h-9"
                >
                  Preview
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* CREATE MODAL */}
      {createOpen && (
        <div className="fixed inset-0 z-[250] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 bg-white shadow-2xl relative">
            <button onClick={() => setCreateOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">✕</button>
            <h2 className="text-xl font-bold text-[#0B2A5B] mb-4">Create Feedback Form</h2>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <Label htmlFor="form-title">Form Title <span className="text-red-500">*</span></Label>
                <Input
                  id="form-title"
                  value={formData.title}
                  onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Student Feedback - Course 3"
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="form-desc">Description</Label>
                <textarea
                  id="form-desc"
                  value={formData.description}
                  onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                  placeholder="Write a short message to students (optional)..."
                  rows={3}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2A5B]/20"
                />
              </div>

              <div>
                <Label htmlFor="form-course">Linked Course <span className="text-red-500">*</span></Label>
                <select
                  id="form-course"
                  value={formData.course_id}
                  onChange={e => setFormData(p => ({ ...p, course_id: Number(e.target.value) }))}
                  className="mt-1 flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2A5B]/20"
                  required
                >
                  <option value="">-- Select Course --</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  id="form-active"
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={e => setFormData(p => ({ ...p, is_active: e.target.checked }))}
                  className="w-4 h-4 rounded text-[#0B2A5B] focus:ring-[#0B2A5B]"
                />
                <Label htmlFor="form-active" className="cursor-pointer">Active & Shareable</Label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setCreateOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-[#0B2A5B] text-white hover:bg-[#1a3d7a]">
                  Create Form
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* EDIT MODAL */}
      {editOpen && selectedForm && (
        <div className="fixed inset-0 z-[250] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 bg-white shadow-2xl relative">
            <button onClick={() => setEditOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">✕</button>
            <h2 className="text-xl font-bold text-[#0B2A5B] mb-4">Edit Feedback Form</h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <Label htmlFor="edit-title">Form Title <span className="text-red-500">*</span></Label>
                <Input
                  id="edit-title"
                  value={selectedForm.title}
                  onChange={e => setSelectedForm(p => p ? ({ ...p, title: e.target.value }) : null)}
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="edit-desc">Description</Label>
                <textarea
                  id="edit-desc"
                  value={selectedForm.description || ""}
                  onChange={e => setSelectedForm(p => p ? ({ ...p, description: e.target.value }) : null)}
                  rows={3}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2A5B]/20"
                />
              </div>

              <div>
                <Label htmlFor="edit-course">Linked Course <span className="text-red-500">*</span></Label>
                <select
                  id="edit-course"
                  value={selectedForm.course_id}
                  onChange={e => setSelectedForm(p => p ? ({ ...p, course_id: Number(e.target.value) }) : null)}
                  className="mt-1 flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2A5B]/20"
                  required
                >
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  id="edit-active"
                  type="checkbox"
                  checked={selectedForm.is_active}
                  onChange={e => setSelectedForm(p => p ? ({ ...p, is_active: e.target.checked }) : null)}
                  className="w-4 h-4 rounded text-[#0B2A5B] focus:ring-[#0B2A5B]"
                />
                <Label htmlFor="edit-active" className="cursor-pointer">Active & Shareable</Label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setEditOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-[#0B2A5B] text-white hover:bg-[#1a3d7a]">
                  Save Changes
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}
