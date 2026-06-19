import { useState, useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Plus, Edit, Trash2, ArrowUp, ArrowDown, Users, Image as ImageIcon, Sparkles, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import api from "../../services/api";
import { confirmPopup } from "../../utils/popup";
import { useNavigate } from "react-router";
import { leaders as staticLeaders } from "../../data/leaders";

const getImageUrl = (path?: string) => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) return path;
  if (path === "/shankar_goenka.png") return path;
  const base = api.defaults.baseURL || "";
  const cleanBase = base.endsWith("/") ? base.slice(0, -1) : base;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
};

const getLeaderId = (name: string) => {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");
};

interface Advisor {
  id: string;
  name: string;
  role: string;
  bio: string;
  fullBio: string;
  image: string;
  tags: string[];
}

export default function AdminAdvisors() {
  const navigate = useNavigate();
  const [advisors, setAdvisors] = useState<Advisor[]>([]);
  const [originalAdvisors, setOriginalAdvisors] = useState<Advisor[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    bio: "",
    fullBio: "",
    image: "",
    tagsString: "",
  });

  useEffect(() => {
    fetchAdvisors();
  }, []);

  const fetchAdvisors = async () => {
    try {
      if (!localStorage.getItem("token")) {
        navigate("/login");
        return;
      }
      setLoading(true);
      const res = await api.get("/settings/about-us");
      const leadership = res.data?.leadership || [];

      // If DB leadership list is empty, initialize with static leaders
      const rawList = leadership.length > 0 ? leadership : staticLeaders;
      const formattedList: Advisor[] = rawList.map((item: any) => ({
        id: item.id || getLeaderId(item.name || ""),
        name: item.name || "",
        role: item.role || item.title || "",
        bio: item.bio || "",
        fullBio: item.fullBio || item.bio || "",
        image: item.profile_image || item.image || "",
        tags: Array.isArray(item.tags)
          ? item.tags
          : typeof item.tags === "string"
            ? item.tags.split(",").map((t: string) => t.trim()).filter(Boolean)
            : [],
      }));

      setAdvisors(formattedList);
      setOriginalAdvisors(JSON.parse(JSON.stringify(formattedList)));
    } catch (err: any) {
      if (err.response?.status === 401) {
        toast.error("Please login as admin again");
        navigate("/login");
        return;
      }
      toast.error("Failed to load advisors list");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (index: number | null = null) => {
    if (index !== null) {
      setIsEditing(true);
      setEditingIndex(index);
      const adv = advisors[index];
      setFormData({
        name: adv.name,
        role: adv.role,
        bio: adv.bio,
        fullBio: adv.fullBio,
        image: adv.image,
        tagsString: adv.tags.join(", "),
      });
    } else {
      setIsEditing(false);
      setEditingIndex(null);
      setFormData({
        name: "",
        role: "",
        bio: "",
        fullBio: "",
        image: "",
        tagsString: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleFormSubmit = () => {
    if (!formData.name.trim()) return toast.error("Name is required");
    if (!formData.role.trim()) return toast.error("Role/Title is required");

    const parsedTags = formData.tagsString
      ? formData.tagsString.split(",").map((t) => t.trim()).filter(Boolean)
      : [];

    const updatedAdvisor: Advisor = {
      id: isEditing && editingIndex !== null ? advisors[editingIndex].id : getLeaderId(formData.name),
      name: formData.name.trim(),
      role: formData.role.trim(),
      bio: formData.bio.trim(),
      fullBio: formData.fullBio.trim(),
      image: formData.image,
      tags: parsedTags,
    };

    const newAdvisors = [...advisors];
    if (isEditing && editingIndex !== null) {
      newAdvisors[editingIndex] = updatedAdvisor;
      toast.success("Advisor updated locally");
    } else {
      newAdvisors.push(updatedAdvisor);
      toast.success("Advisor added locally");
    }

    setAdvisors(newAdvisors);
    setIsModalOpen(false);
  };

  const handleDelete = async (index: number) => {
    if (!(await confirmPopup(`Are you sure you want to delete ${advisors[index].name}?`))) return;
    const newAdvisors = advisors.filter((_, i) => i !== index);
    setAdvisors(newAdvisors);
    toast.success("Advisor removed locally");
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newAdvisors = [...advisors];
    const temp = newAdvisors[index];
    newAdvisors[index] = newAdvisors[index - 1];
    newAdvisors[index - 1] = temp;
    setAdvisors(newAdvisors);
  };

  const handleMoveDown = (index: number) => {
    if (index === advisors.length - 1) return;
    const newAdvisors = [...advisors];
    const temp = newAdvisors[index];
    newAdvisors[index] = newAdvisors[index + 1];
    newAdvisors[index + 1] = temp;
    setAdvisors(newAdvisors);
  };

  const handleSaveChanges = async () => {
    try {
      setSaving(true);
      toast.loading("Saving advisors configuration...", { id: "save-advisors" });

      // Transform backend expects: we map fields nicely
      const payload = advisors.map((adv) => ({
        id: adv.id,
        name: adv.name,
        role: adv.role,
        bio: adv.bio,
        fullBio: adv.fullBio,
        profile_image: adv.image,
        tags: adv.tags,
      }));

      await api.put("/admin/settings/about-us", { leadership: payload });
      toast.success("Advisors list successfully updated and published!", { id: "save-advisors" });
      setOriginalAdvisors(JSON.parse(JSON.stringify(advisors)));
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to save advisors configuration", { id: "save-advisors" });
    } finally {
      setSaving(false);
    }
  };

  const hasUnsavedChanges = JSON.stringify(advisors) !== JSON.stringify(originalAdvisors);

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
          <Loader2 className="w-10 h-10 text-[#D50032] animate-spin mb-4" />
          <p className="text-gray-500 font-medium">Loading Our Advisors section...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-[#0B2A5B] tracking-tight">Our Advisors Management</h1>
          <p className="text-gray-500 font-medium mt-1">
            Manage the list of advisors and leadership team displayed on the public website.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {hasUnsavedChanges && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-50 border border-amber-200 text-amber-700 animate-pulse">
              Unsaved Changes
            </span>
          )}
          <Button
            onClick={handleSaveChanges}
            disabled={!hasUnsavedChanges || saving}
            className={`font-bold transition-all px-5 py-2.5 rounded-xl flex items-center gap-2 ${
              hasUnsavedChanges
                ? "bg-[#D50032] text-white hover:bg-[#b00028] shadow-md shadow-[#D50032]/25"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </Button>
          <Button
            onClick={() => handleOpenModal(null)}
            className="bg-[#0B2A5B] text-white hover:bg-[#153e7d] font-bold px-5 py-2.5 rounded-xl flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Advisor
          </Button>
        </div>
      </div>

      <Card className="p-6 bg-white border border-gray-100 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.02)]">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[80px]">Photo</TableHead>
              <TableHead className="w-[220px]">Advisor Info</TableHead>
              <TableHead>Short Tagline / Bio</TableHead>
              <TableHead className="w-[250px]">Expertise Tags</TableHead>
              <TableHead className="w-[120px] text-center">Order</TableHead>
              <TableHead className="w-[120px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {advisors.map((advisor, index) => {
              const previewUrl = advisor.image ? getImageUrl(advisor.image) : "";
              const initials = advisor.name
                ? advisor.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
                : "FT";

              return (
                <TableRow key={advisor.id} className="group hover:bg-slate-50/50 transition-colors">
                  <TableCell>
                    {previewUrl ? (
                      <div className="w-12 h-12 rounded-xl overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center">
                        <img src={previewUrl} alt={advisor.name} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-[#FFF0F2] flex items-center justify-center font-bold text-sm text-[#D50032]">
                        {initials}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="font-bold text-gray-900 text-sm">{advisor.name}</div>
                    <div className="text-xs font-bold text-[#D50032] uppercase tracking-wide mt-0.5">
                      {advisor.role}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[300px]">
                    <div className="text-gray-500 text-xs font-medium line-clamp-2 leading-relaxed">
                      {advisor.bio || "No tagline provided."}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {advisor.tags.slice(0, 3).map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-50 border border-slate-100 text-slate-600"
                        >
                          {tag}
                        </span>
                      ))}
                      {advisor.tags.length > 3 && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-500">
                          +{advisor.tags.length - 3} more
                        </span>
                      )}
                      {advisor.tags.length === 0 && (
                        <span className="text-xs text-gray-400 italic">No tags</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={index === 0}
                        onClick={() => handleMoveUp(index)}
                        className="w-8 h-8 rounded-lg hover:bg-slate-100 hover:text-slate-900 disabled:opacity-30"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={index === advisors.length - 1}
                        onClick={() => handleMoveDown(index)}
                        className="w-8 h-8 rounded-lg hover:bg-slate-100 hover:text-slate-900 disabled:opacity-30"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenModal(index)}
                        className="w-8 h-8 rounded-lg text-blue-600 hover:bg-blue-50"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(index)}
                        className="w-8 h-8 rounded-lg text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {advisors.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-gray-400 italic">
                  No advisors in the list. Click "Add Advisor" to add.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Add/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[650px] bg-white rounded-2xl p-6 border-0 shadow-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl font-black text-[#0B2A5B] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#D50032]" />
              {isEditing ? "Edit Advisor Profile" : "Create Advisor Profile"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-gray-700">Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Het Vyas"
                  className="rounded-xl border-gray-200"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-gray-700">Role / Title</Label>
                <Input
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="e.g. Founder & COO"
                  className="rounded-xl border-gray-200"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold text-gray-700">Advisor Profile Picture</Label>
              <div className="flex gap-4 items-center">
                <div className="flex-1">
                  <Input
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="URL path (or upload file)"
                    className="rounded-xl border-gray-200"
                  />
                </div>
                <div className="w-[140px] relative">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      if (!e.target.files || e.target.files.length === 0) return;
                      const file = e.target.files[0];
                      const uploadData = new FormData();
                      uploadData.append("file", file);
                      try {
                        toast.loading("Uploading image...", { id: "upload-avatar" });
                        const res = await api.post("/admin/upload", uploadData, {
                          headers: { "Content-Type": "multipart/form-data" },
                        });
                        if (res.data && res.data.url) {
                          setFormData((p) => ({ ...p, image: res.data.url }));
                          toast.success("Image uploaded successfully!", { id: "upload-avatar" });
                        } else {
                          toast.error("Upload failed.", { id: "upload-avatar" });
                        }
                      } catch {
                        toast.error("Upload failed.", { id: "upload-avatar" });
                      }
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full rounded-xl border-dashed border-gray-300 font-bold hover:bg-slate-50 flex items-center justify-center gap-1.5"
                  >
                    <ImageIcon className="w-4 h-4 text-gray-500" />
                    Upload File
                  </Button>
                </div>
              </div>
              {formData.image && (
                <div className="mt-2 flex items-center gap-3">
                  <div className="w-16 h-16 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
                    <img src={getImageUrl(formData.image)} alt="Advisor Preview" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-xs text-gray-400 font-medium break-all">{formData.image}</span>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold text-gray-700">Short Bio / Tagline</Label>
              <Input
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="A short tagline or summary displayed in secondary grids (e.g. EdTech entrepreneur...)"
                className="rounded-xl border-gray-200"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold text-gray-700">Full Profile Biography</Label>
              <Textarea
                rows={5}
                value={formData.fullBio}
                onChange={(e) => setFormData({ ...formData, fullBio: e.target.value })}
                placeholder="Detailed background, achievements, and story of the advisor..."
                className="rounded-xl border-gray-200 resize-none leading-relaxed"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold text-gray-700">Expertise Tags (Comma-separated)</Label>
              <Input
                value={formData.tagsString}
                onChange={(e) => setFormData({ ...formData, tagsString: e.target.value })}
                placeholder="e.g. 20+ Yrs Capital Markets, Business Strategy, EdTech"
                className="rounded-xl border-gray-200"
              />
              <p className="text-[10px] text-gray-400 font-medium">
                Add key highlights separated by commas to display them as badges on the advisor profile details.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              className="rounded-xl font-bold"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleFormSubmit}
              className="bg-[#0B2A5B] text-white hover:bg-[#153e7d] rounded-xl font-bold px-6"
            >
              {isEditing ? "Update Profile" : "Add Profile"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
