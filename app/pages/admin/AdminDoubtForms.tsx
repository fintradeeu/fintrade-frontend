import { useState, useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import {
  Plus, X, Edit, Trash2, Download, Eye, Search,
  ClipboardList, Users, CheckCircle, Clock, Filter,
} from "lucide-react";
import api from "../../services/api";
import { confirmPopup } from "../../utils/popup";
import { toast } from "sonner";

interface Batch { id: number; name: string; }
interface DoubtForm {
  id: number;
  title: string;
  description?: string;
  batch_id: number;
  batch?: Batch;
  end_date: string;
  is_active: boolean;
  created_by?: number;
  created_at: string;
  submission_count: number;
}
interface Submission {
  id: number;
  form_id: number;
  student_id: number;
  student?: { id: number; full_name?: string; email: string; phone?: string };
  topic?: string;
  doubt_text: string;
  submitted_at: string;
}

const STATUS_CONFIG = {
  active:  { label: "Active",  bg: "bg-emerald-50 border-emerald-200", color: "text-emerald-700", dot: "bg-emerald-500" },
  expired: { label: "Expired", bg: "bg-red-50 border-red-200",         color: "text-red-600",     dot: "bg-red-400"    },
};

function getStatus(form: DoubtForm) {
  return new Date(form.end_date) > new Date() && form.is_active ? "active" : "expired";
}

export default function AdminDoubtForms() {
  const [forms, setForms] = useState<DoubtForm[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "expired">("all");

  const [showFormModal, setShowFormModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: "", description: "", batch_id: "", end_date: "", is_active: true,
  });

  const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);
  const [activeForm, setActiveForm] = useState<DoubtForm | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [submissionSearch, setSubmissionSearch] = useState("");

  const [downloading, setDownloading] = useState<number | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [formsRes, batchRes] = await Promise.all([
        api.get("/doubts/forms"),
        api.get("/batches/admin/list?skip=0&limit=200"),
      ]);
      setForms(formsRes.data);
      setBatches(batchRes.data.batches || []);
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const openCreate = () => {
    setIsEditing(false); setEditId(null);
    setFormData({ title: "", description: "", batch_id: "", end_date: "", is_active: true });
    setShowFormModal(true);
  };

  const openEdit = (form: DoubtForm) => {
    setIsEditing(true); setEditId(form.id);
    setFormData({
      title: form.title, description: form.description || "",
      batch_id: String(form.batch_id),
      end_date: new Date(form.end_date).toISOString().slice(0, 16),
      is_active: form.is_active,
    });
    setShowFormModal(true);
  };

  const saveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: formData.title,
      description: formData.description || null,
      batch_id: Number(formData.batch_id),
      end_date: new Date(formData.end_date).toISOString(),
      is_active: formData.is_active,
    };
    try {
      if (isEditing && editId) {
        await api.put(`/doubts/forms/${editId}`, payload);
        toast.success("Form updated");
      } else {
        await api.post("/doubts/forms", payload);
        toast.success("Doubt form created");
      }
      setShowFormModal(false);
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to save form");
    }
  };

  const deleteForm = async (id: number) => {
    if (!(await confirmPopup("Delete this doubt form and all submissions?"))) return;
    try {
      await api.delete(`/doubts/forms/${id}`);
      toast.success("Deleted");
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed");
    }
  };

  const openSubmissions = async (form: DoubtForm) => {
    setActiveForm(form);
    setSubmissions([]);
    setSubmissionSearch("");
    setShowSubmissionsModal(true);
    setSubmissionsLoading(true);
    try {
      const res = await api.get(`/doubts/forms/${form.id}/submissions`);
      setSubmissions(res.data);
    } catch {
      toast.error("Failed to load submissions");
    } finally {
      setSubmissionsLoading(false);
    }
  };

  const downloadExcel = async (form: DoubtForm) => {
    setDownloading(form.id);
    try {
      const res = await api.get(`/doubts/forms/${form.id}/export`, { responseType: "blob" });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = `doubts_${form.title.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0,10)}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Excel downloaded!");
    } catch {
      toast.error("Export failed");
    } finally {
      setDownloading(null);
    }
  };

  const filtered = forms.filter(f => {
    const q = searchQuery.toLowerCase();
    const matchQ = !q || f.title.toLowerCase().includes(q) || (f.batch?.name || "").toLowerCase().includes(q);
    const s = getStatus(f);
    const matchS = filterStatus === "all" || filterStatus === s;
    return matchQ && matchS;
  });

  const filteredSubs = submissions.filter(s => {
    const q = submissionSearch.toLowerCase();
    return !q
      || (s.student?.full_name || "").toLowerCase().includes(q)
      || s.student?.email.toLowerCase().includes(q)
      || (s.topic || "").toLowerCase().includes(q)
      || s.doubt_text.toLowerCase().includes(q);
  });

  const totalSubmissions = forms.reduce((a, f) => a + f.submission_count, 0);
  const activeForms = forms.filter(f => getStatus(f) === "active").length;
  const expiredForms = forms.filter(f => getStatus(f) === "expired").length;

  const modalBg = { background: "rgba(11,42,91,0.6)", backdropFilter: "blur(6px)" } as React.CSSProperties;

  return (
    <DashboardLayout role="admin">
      <div className="mb-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <h1 className="text-2xl font-black text-[#0B2A5B] tracking-tight">Doubt Solving Panel</h1>
            <p className="text-sm text-[#0B2A5B]/55 mt-0.5">Create daily doubt forms for batches, collect student questions, and export to Excel.</p>
          </div>
          <button onClick={openCreate} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0B2A5B] text-white text-sm font-bold shadow-lg hover:bg-[#1a3d7a] transition-all hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap">
            <Plus size={16} />Create Doubt Form
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          {[
            { label: "Total Forms",        value: forms.length,     icon: <ClipboardList size={18} />, bg: "bg-[#0B2A5B]/8 text-[#0B2A5B]"   },
            { label: "Active Forms",        value: activeForms,      icon: <CheckCircle size={18} />,   bg: "bg-emerald-50 text-emerald-600"   },
            { label: "Expired Forms",       value: expiredForms,     icon: <Clock size={18} />,          bg: "bg-red-50 text-red-500"            },
            { label: "Total Submissions",   value: totalSubmissions, icon: <Users size={18} />,          bg: "bg-purple-50 text-purple-600"     },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3 shadow-sm">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.bg}`}>{s.icon}</div>
              <div>
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide leading-none mb-1">{s.label}</p>
                <p className="text-2xl font-black text-[#0B2A5B] leading-none">{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:border-[#0B2A5B]/40 transition-colors placeholder:text-gray-400" placeholder="Search by title or batch..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
          <div className="flex gap-1.5">
            {(["all", "active", "expired"] as const).map(s => (
              <button key={s} onClick={() => setFilterStatus(s)} className={`px-3 py-2 rounded-lg text-xs font-bold border capitalize transition-all ${filterStatus === s ? "bg-[#0B2A5B] text-white border-[#0B2A5B] shadow-md" : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"}`}>{s}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Forms list */}
      <div className="space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
                <div className="h-5 bg-gray-100 rounded w-1/3 mb-3" />
                <div className="h-3 bg-gray-50 rounded w-2/3 mb-4" />
                <div className="flex gap-2">{[1, 2, 3].map(j => <div key={j} className="h-9 bg-gray-50 rounded-xl w-24" />)}</div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center">
            <div className="w-14 h-14 bg-[#0B2A5B]/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ClipboardList size={26} className="text-[#0B2A5B]/30" />
            </div>
            <h3 className="text-[#0B2A5B] font-bold text-base mb-1">No Doubt Forms Found</h3>
            <p className="text-gray-400 text-sm">{searchQuery || filterStatus !== "all" ? "Try adjusting your filters." : 'Click "Create Doubt Form" to get started.'}</p>
          </div>
        ) : (
          filtered.map(form => {
            const status = getStatus(form);
            const cfg = STATUS_CONFIG[status];
            const endDate = new Date(form.end_date);
            const hoursLeft = Math.max(0, Math.round((endDate.getTime() - Date.now()) / 3600000));
            return (
              <div key={form.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
                <div className={`h-0.5 w-full ${cfg.dot}`} />
                <div className="p-5">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <h3 className="text-base font-black text-[#0B2A5B]">{form.title}</h3>
                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />{cfg.label}
                        </span>
                      </div>
                      {form.description && <p className="text-xs text-gray-400 mb-3 line-clamp-2">{form.description}</p>}
                      <div className="flex flex-wrap gap-3 text-xs">
                        <div className="flex items-center gap-1.5 bg-gray-50 rounded-lg px-3 py-1.5">
                          <span className="text-gray-400">📚 Batch:</span>
                          <span className="font-bold text-[#0B2A5B]">{form.batch?.name || `ID ${form.batch_id}`}</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-gray-50 rounded-lg px-3 py-1.5">
                          <span className="text-gray-400">⏰ Ends:</span>
                          <span className="font-bold text-[#0B2A5B]">{endDate.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })} {endDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                        </div>
                        {status === "active" && (
                          <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-100 rounded-lg px-3 py-1.5">
                            <span className="text-amber-500">⏱</span>
                            <span className="font-bold text-amber-700">{hoursLeft}h left</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 bg-purple-50 rounded-lg px-3 py-1.5">
                          <span className="text-purple-400">💬</span>
                          <span className="font-bold text-purple-700">{form.submission_count} submission{form.submission_count !== 1 ? "s" : ""}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap lg:flex-col gap-2 lg:w-40 shrink-0">
                      <button onClick={() => openSubmissions(form)} className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#0B2A5B] text-white text-xs font-bold hover:bg-[#1a3d7a] transition-all shadow-sm w-full">
                        <Eye size={13} />View Doubts ({form.submission_count})
                      </button>
                      <button onClick={() => downloadExcel(form)} disabled={downloading === form.id || form.submission_count === 0} className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm w-full">
                        <Download size={13} />{downloading === form.id ? "Exporting..." : "Export Excel"}
                      </button>
                      <div className="flex gap-1.5 w-full">
                        <button onClick={() => openEdit(form)} title="Edit" className="flex-1 flex items-center justify-center py-2 rounded-xl border border-gray-200 text-[#0B2A5B] hover:bg-[#0B2A5B]/5 hover:border-[#0B2A5B]/20 transition-all"><Edit size={13} /></button>
                        <button onClick={() => deleteForm(form.id)} title="Delete" className="flex-1 flex items-center justify-center py-2 rounded-xl border border-red-100 text-red-500 hover:bg-red-50 hover:border-red-200 transition-all"><Trash2 size={13} /></button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create / Edit Form Modal */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={modalBg}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#0B2A5B] flex items-center justify-center">
                  {isEditing ? <Edit size={16} className="text-white" /> : <Plus size={16} className="text-white" />}
                </div>
                <div>
                  <h2 className="text-base font-black text-[#0B2A5B]">{isEditing ? "Edit Doubt Form" : "Create Doubt Form"}</h2>
                  <p className="text-[11px] text-gray-400">{isEditing ? "Update form details" : "Set up a new daily doubt collection form"}</p>
                </div>
              </div>
              <button onClick={() => setShowFormModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition-all"><X size={18} /></button>
            </div>
            <form onSubmit={saveForm} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-[10px] font-black text-[#0B2A5B] uppercase tracking-widest mb-1.5">Form Title *</label>
                <Input required placeholder="e.g. Daily Doubt — July 2nd" value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} className="rounded-xl" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-[#0B2A5B] uppercase tracking-widest mb-1.5">Description</label>
                <Textarea placeholder="Instructions or context for students..." value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} className="rounded-xl resize-none" rows={2} />
              </div>
              <div>
                <label className="block text-[10px] font-black text-[#0B2A5B] uppercase tracking-widest mb-1.5">Target Batch *</label>
                <select required value={formData.batch_id} onChange={e => setFormData(p => ({ ...p, batch_id: e.target.value }))} className="w-full h-10 px-3 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:border-[#0B2A5B]/40">
                  <option value="">— Select a batch —</option>
                  {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-[#0B2A5B] uppercase tracking-widest mb-1.5">End Date & Time *</label>
                <Input required type="datetime-local" value={formData.end_date} onChange={e => setFormData(p => ({ ...p, end_date: e.target.value }))} className="rounded-xl" />
                <p className="text-[10px] text-gray-400 mt-1">Students cannot submit after this time.</p>
              </div>
              <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                <div>
                  <p className="text-sm font-bold text-[#0B2A5B]">Active (Accepting Submissions)</p>
                  <p className="text-[10px] text-gray-400">Toggle off to pause without deleting</p>
                </div>
                <div onClick={() => setFormData(p => ({ ...p, is_active: !p.is_active }))} className={`relative w-10 h-5 rounded-full transition-all cursor-pointer flex-shrink-0 ${formData.is_active ? "bg-[#0B2A5B]" : "bg-gray-200"}`}>
                  <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${formData.is_active ? "translate-x-5" : "translate-x-0"}`} />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowFormModal(false)} className="px-4 py-2 text-sm font-semibold rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all">Cancel</button>
                <button type="submit" className="px-5 py-2 text-sm font-black rounded-xl bg-[#0B2A5B] text-white hover:bg-[#1a3d7a] transition-all shadow-md">{isEditing ? "Save Changes" : "Create Form"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submissions Modal */}
      {showSubmissionsModal && activeForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={modalBg}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col overflow-hidden max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-5 bg-gradient-to-r from-[#0B2A5B] to-[#1a3d7a]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center"><ClipboardList size={18} className="text-white" /></div>
                <div>
                  <h2 className="text-base font-black text-white">Student Doubts</h2>
                  <p className="text-[11px] text-white/60 mt-0.5">
                    <span className="text-white/85 font-bold">{activeForm.title}</span>
                    <span className="mx-1.5 opacity-50">·</span>
                    <span className="text-white/85">{activeForm.batch?.name}</span>
                    <span className="mx-1.5 opacity-50">·</span>
                    <span className="text-white/85 font-bold">{submissions.length} submission{submissions.length !== 1 ? "s" : ""}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => downloadExcel(activeForm)} disabled={downloading === activeForm.id || submissions.length === 0} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all disabled:opacity-50">
                  <Download size={13} />{downloading === activeForm.id ? "..." : "Excel"}
                </button>
                <button onClick={() => setShowSubmissionsModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg text-white/50 hover:text-white hover:bg-white/15 transition-all"><X size={18} /></button>
              </div>
            </div>

            <div className="px-6 pt-4 pb-2 bg-white border-b border-gray-100">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#0B2A5B]/40 placeholder:text-gray-400" placeholder="Search by student, topic, or doubt..." value={submissionSearch} onChange={e => setSubmissionSearch(e.target.value)} />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-gray-50/50">
              {submissionsLoading ? (
                <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-24 bg-white rounded-xl animate-pulse border border-gray-100" />)}</div>
              ) : filteredSubs.length === 0 ? (
                <div className="text-center py-16">
                  <Users size={32} className="text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">{submissionSearch ? "No results found." : "No submissions yet."}</p>
                </div>
              ) : (
                filteredSubs.map((sub, idx) => (
                  <div key={sub.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#0B2A5B]/10 flex items-center justify-center text-[#0B2A5B] font-black text-sm shrink-0">
                        {(sub.student?.full_name || sub.student?.email || "?").charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-[#0B2A5B] text-sm">{sub.student?.full_name || "—"}</p>
                            <span className="text-[10px] text-gray-400">{sub.student?.email}</span>
                          </div>
                          <span className="text-[10px] text-gray-400 shrink-0">#{idx + 1} · {new Date(sub.submitted_at).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                        </div>
                        {sub.topic && (
                          <span className="inline-block bg-purple-50 border border-purple-100 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded-md mb-2">{sub.topic}</span>
                        )}
                        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{sub.doubt_text}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-white">
              <span className="text-xs text-gray-400">{filteredSubs.length} of {submissions.length} shown</span>
              <button onClick={() => setShowSubmissionsModal(false)} className="px-5 py-2 text-sm font-black rounded-xl bg-[#0B2A5B] text-white hover:bg-[#1a3d7a] transition-all">Close</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
