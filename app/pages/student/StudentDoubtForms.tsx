import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { Textarea } from "../../components/ui/textarea";
import { Input } from "../../components/ui/input";
import { ClipboardList, Send, CheckCircle, Clock, ChevronDown, ChevronUp } from "lucide-react";
import api from "../../services/api";
import { toast } from "sonner";

interface Batch { id: number; name: string; }
interface DoubtForm {
  id: number;
  title: string;
  description?: string;
  batch?: Batch;
  end_date: string;
  is_active: boolean;
  submission_count: number;
}

function useCountdown(endDate: string) {
  const calc = useCallback(() => {
    const diff = new Date(endDate).getTime() - Date.now();
    if (diff <= 0) return null;
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return { h, m, s };
  }, [endDate]);

  const [time, setTime] = useState(calc);
  useEffect(() => {
    const t = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(t);
  }, [calc]);
  return time;
}

function DoubtFormCard({ form }: { form: DoubtForm }) {
  const countdown = useCountdown(form.end_date);
  const [expanded, setExpanded] = useState(false);
  const [topic, setTopic] = useState("");
  const [doubt, setDoubt] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doubt.trim()) { toast.error("Please enter your doubt"); return; }
    setSubmitting(true);
    try {
      await api.post(`/doubts/student/forms/${form.id}/submit`, { topic: topic || null, doubt_text: doubt });
      setSubmitted(true);
      toast.success("Your doubt has been submitted!");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all duration-300 ${submitted ? "border-emerald-200" : "border-gray-100 hover:shadow-md"}`}>
      {/* Top accent bar */}
      <div className={`h-1 w-full ${submitted ? "bg-emerald-400" : countdown ? "bg-[#0B2A5B]" : "bg-gray-300"}`} />

      <div className="p-5">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${submitted ? "bg-emerald-50" : countdown ? "bg-[#0B2A5B]/8" : "bg-gray-50"}`}>
            {submitted ? <CheckCircle size={20} className="text-emerald-500" /> : countdown ? <ClipboardList size={20} className="text-[#0B2A5B]" /> : <Clock size={20} className="text-gray-400" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
              <h3 className="text-base font-black text-[#0B2A5B]">{form.title}</h3>
              {submitted ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700"><CheckCircle size={9} />Submitted</span>
              ) : countdown ? (
                <div className="flex items-center gap-1.5 bg-[#0B2A5B]/5 border border-[#0B2A5B]/10 rounded-xl px-3 py-1.5">
                  <Clock size={11} className="text-[#0B2A5B]/50" />
                  <span className="font-mono text-xs font-black text-[#0B2A5B]">{String(countdown.h).padStart(2,"0")}:{String(countdown.m).padStart(2,"0")}:{String(countdown.s).padStart(2,"0")}</span>
                  <span className="text-[9px] text-[#0B2A5B]/40 font-semibold">left</span>
                </div>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-red-50 border border-red-200 text-red-600"><Clock size={9} />Expired</span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-400">
              {form.batch && <span className="bg-gray-50 border border-gray-100 rounded-md px-2 py-0.5 font-semibold text-[#0B2A5B]/60">📚 {form.batch.name}</span>}
              <span>Closes: {new Date(form.end_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })} {new Date(form.end_date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
            </div>
            {form.description && <p className="text-xs text-gray-500 mt-2 leading-relaxed">{form.description}</p>}
          </div>
        </div>

        {/* Submit form or submitted state */}
        {submitted ? (
          <div className="mt-4 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 flex items-center gap-3">
            <CheckCircle size={18} className="text-emerald-500 shrink-0" />
            <div>
              <p className="text-sm font-bold text-emerald-700">Doubt submitted successfully!</p>
              <p className="text-[11px] text-emerald-600/70">Your doubt has been recorded. Faculty will review it shortly.</p>
            </div>
          </div>
        ) : countdown ? (
          <div className="mt-4">
            <button onClick={() => setExpanded(p => !p)} className="w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl bg-[#0B2A5B]/4 hover:bg-[#0B2A5B]/8 border border-[#0B2A5B]/8 hover:border-[#0B2A5B]/15 text-[#0B2A5B] text-xs font-bold transition-all">
              <span className="flex items-center gap-2"><Send size={13} />Submit Your Doubt</span>
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {expanded && (
              <form onSubmit={handleSubmit} className="mt-3 space-y-3 bg-gray-50/80 rounded-xl p-4 border border-gray-100">
                <div>
                  <label className="block text-[10px] font-black text-[#0B2A5B] uppercase tracking-widest mb-1.5">Topic / Subject <span className="text-gray-400 font-normal normal-case">(optional)</span></label>
                  <Input placeholder="e.g. Options trading, Chart patterns..." value={topic} onChange={e => setTopic(e.target.value)} className="rounded-xl text-sm" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-[#0B2A5B] uppercase tracking-widest mb-1.5">Your Doubt *</label>
                  <Textarea required placeholder="Write your doubt or question here in detail..." value={doubt} onChange={e => setDoubt(e.target.value)} className="rounded-xl resize-none text-sm" rows={4} />
                  <p className="text-[10px] text-gray-400 mt-1">{doubt.length} characters</p>
                </div>
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setExpanded(false)} className="px-4 py-2 text-xs font-semibold rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 transition-all">Cancel</button>
                  <button type="submit" disabled={submitting || !doubt.trim()} className="px-5 py-2 text-xs font-black rounded-xl bg-[#0B2A5B] text-white hover:bg-[#1a3d7a] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md flex items-center gap-2">
                    <Send size={13} />{submitting ? "Submitting..." : "Submit Doubt"}
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          <div className="mt-4 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 flex items-center gap-3">
            <Clock size={16} className="text-gray-400 shrink-0" />
            <p className="text-sm text-gray-500">This doubt form has expired. No further submissions accepted.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function StudentDoubtForms() {
  const [forms, setForms] = useState<DoubtForm[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/doubts/student/forms");
        setForms(res.data);
      } catch {
        toast.error("Failed to load doubt forms");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <DashboardLayout role="student">
      <div className="mb-6">
        <div className="mb-5">
          <h1 className="text-2xl font-black text-[#0B2A5B] tracking-tight">Doubt Solving Panel</h1>
          <p className="text-sm text-[#0B2A5B]/55 mt-0.5">Submit your doubts to your faculty. Forms close at their stated end time.</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-0">
          <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-[#0B2A5B]/8 flex items-center justify-center"><ClipboardList size={18} className="text-[#0B2A5B]" /></div>
            <div>
              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide leading-none mb-1">Active Forms</p>
              <p className="text-2xl font-black text-[#0B2A5B] leading-none">{forms.length}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center"><Clock size={18} className="text-amber-500" /></div>
            <div>
              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide leading-none mb-1">Expiring Soon</p>
              <p className="text-2xl font-black text-[#0B2A5B] leading-none">{forms.filter(f => (new Date(f.end_date).getTime() - Date.now()) < 3 * 3600000).length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
                <div className="h-5 bg-gray-100 rounded w-1/2 mb-3" />
                <div className="h-3 bg-gray-50 rounded w-3/4 mb-4" />
                <div className="h-10 bg-gray-50 rounded-xl" />
              </div>
            ))}
          </div>
        ) : forms.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center">
            <div className="w-14 h-14 bg-[#0B2A5B]/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ClipboardList size={26} className="text-[#0B2A5B]/30" />
            </div>
            <h3 className="text-[#0B2A5B] font-bold text-base mb-1">No Active Doubt Forms</h3>
            <p className="text-gray-400 text-sm">Your faculty hasn't posted any doubt forms for your batch yet. Check back later.</p>
          </div>
        ) : (
          forms.map(form => <DoubtFormCard key={form.id} form={form} />)
        )}
      </div>
    </DashboardLayout>
  );
}
