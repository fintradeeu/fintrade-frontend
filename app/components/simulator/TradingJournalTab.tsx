import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Loader2, Plus, Star, Sparkles, BookOpen, Trash2, Edit3, Check, X, AlertCircle } from "lucide-react";
import api from "../../services/api";

interface JournalEntry {
  id: number;
  trade_id?: number;
  symbol: str;
  side: str;
  pnl: number;
  notes: str;
  emotion: str;
  rating: number;
  ai_review?: str;
  tags?: string[];
  created_at: str;
}

export default function TradingJournalTab() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reviewingId, setReviewingId] = useState<number | null>(null);

  // Form State
  const [symbol, setSymbol] = useState("RELIANCE");
  const [side, setSide] = useState("BUY");
  const [pnl, setPnl] = useState("0");
  const [notes, setNotes] = useState("");
  const [emotion, setEmotion] = useState("disciplined");
  const [rating, setRating] = useState(4);

  const fetchJournal = async () => {
    setLoading(true);
    try {
      const res = await api.get("/simulator/journal");
      setEntries(res.data || []);
    } catch (err) {
      console.error("Failed to fetch journal entries", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJournal();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/simulator/journal", {
        symbol: symbol.toUpperCase(),
        side: side.toUpperCase(),
        pnl: parseFloat(pnl) || 0,
        notes,
        emotion,
        rating,
        tags: ["educational", emotion],
      });
      setShowAddForm(false);
      setNotes("");
      fetchJournal();
    } catch (err) {
      console.error("Error saving journal note", err);
      alert("Failed to create journal entry. Please check values.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this journal entry?")) return;
    try {
      await api.delete(`/simulator/journal/${id}`);
      setEntries(entries.filter((x) => x.id !== id));
    } catch (err) {
      console.error("Error deleting entry", err);
    }
  };

  const handleAiReview = async (id: number) => {
    setReviewingId(id);
    try {
      const res = await api.post(`/simulator/journal/${id}/ai-review`);
      setEntries(entries.map((x) => (x.id === id ? { ...x, ai_review: res.data.ai_review } : x)));
    } catch (err) {
      console.error("Error generating AI review", err);
      alert("Failed to generate AI Review.");
    } finally {
      setReviewingId(null);
    }
  };

  const getEmotionBadgeColor = (emo: str) => {
    switch (emo.toLowerCase()) {
      case "disciplined":
      case "confident":
      case "patient":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "fomo":
      case "greedy":
      case "impatient":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "fearful":
      case "revenge":
      case "anxious":
        return "bg-rose-100 text-rose-800 border-rose-200";
      default:
        return "bg-purple-100 text-purple-800 border-purple-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex items-center justify-between bg-gradient-to-r from-purple-900 to-indigo-900 text-white p-5 rounded-xl shadow-lg">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <BookOpen className="text-purple-300" size={22} />
            Trader's Reflexive Journal & AI Coach
          </h3>
          <p className="text-xs text-purple-200 mt-1">
            Log your emotional states, document trade thesis, and receive personalized AI educational feedback.
          </p>
        </div>
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-white text-purple-900 hover:bg-purple-50 font-bold shadow-md transition-all duration-200 flex items-center gap-2 cursor-pointer"
        >
          {showAddForm ? <X size={16} /> : <Plus size={16} />}
          {showAddForm ? "Cancel" : "New Journal Entry"}
        </Button>
      </div>

      {/* Add Entry Form */}
      {showAddForm && (
        <form onSubmit={handleCreate} className="bg-white border border-purple-200 p-5 rounded-xl shadow-md space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <h4 className="font-bold text-gray-800 text-sm border-b pb-2">Create New Trade Log Note</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Symbol</label>
              <Input value={symbol} onChange={(e) => setSymbol(e.target.value)} placeholder="e.g. RELIANCE" required />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Side</label>
              <select
                value={side}
                onChange={(e) => setSide(e.target.value)}
                className="w-full h-10 px-3 border border-gray-300 rounded-md bg-white text-sm font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
              >
                <option value="BUY">BUY (Long)</option>
                <option value="SELL">SELL (Short)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Estimated P&L (₹)</label>
              <Input type="number" step="any" value={pnl} onChange={(e) => setPnl(e.target.value)} placeholder="e.g. 1500 or -500" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Emotion State</label>
              <select
                value={emotion}
                onChange={(e) => setEmotion(e.target.value)}
                className="w-full h-10 px-3 border border-gray-300 rounded-md bg-white text-sm font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
              >
                <option value="disciplined">Disciplined & Calm</option>
                <option value="confident">Confident / High Conviction</option>
                <option value="patient">Patient Entry</option>
                <option value="fomo">FOMO (Fear of Missing Out)</option>
                <option value="greedy">Greedy / Overleveraged</option>
                <option value="fearful">Fearful / Early Exit</option>
                <option value="revenge">Revenge Trading</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">Trade Thesis & Reflexive Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Why did you enter this trade? What technical setup or pattern did you observe? What would you improve?"
              className="w-full p-3 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
              required
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-600">Self-Rating:</span>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className={`cursor-pointer transition-transform hover:scale-110 ${star <= rating ? "text-amber-400" : "text-gray-300"}`}
                >
                  <Star fill={star <= rating ? "currentColor" : "none"} size={20} />
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="bg-purple-700 hover:bg-purple-800 text-white font-bold cursor-pointer">
                {submitting ? <Loader2 className="animate-spin mr-2" size={16} /> : <Check className="mr-1" size={16} />}
                Save Entry
              </Button>
            </div>
          </div>
        </form>
      )}

      {/* Entries List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-purple-700" size={32} />
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300 text-gray-500">
          <BookOpen className="mx-auto mb-3 text-gray-400" size={40} />
          <p className="font-semibold">No journal entries recorded yet.</p>
          <p className="text-xs mt-1">Start documenting your trades to unlock AI coaching and emotional analytics!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => (
            <div key={entry.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-wrap items-start justify-between gap-2 border-b border-gray-100 pb-3 mb-3">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-lg text-gray-900">{entry.symbol}</span>
                  <Badge className={entry.side === "BUY" ? "bg-emerald-600 text-white font-bold" : "bg-rose-600 text-white font-bold"}>
                    {entry.side}
                  </Badge>
                  <span className={`font-bold text-sm ${entry.pnl >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                    P&L: {entry.pnl >= 0 ? "+" : ""}₹{entry.pnl.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${getEmotionBadgeColor(entry.emotion)}`}>
                    {entry.emotion.toUpperCase()}
                  </span>
                  <div className="flex items-center text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={14} fill={i < entry.rating ? "currentColor" : "none"} className={i < entry.rating ? "text-amber-400" : "text-gray-300"} />
                    ))}
                  </div>
                  <button onClick={() => handleDelete(entry.id)} className="text-gray-400 hover:text-rose-600 transition-colors ml-2 cursor-pointer" title="Delete entry">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap font-medium">
                "{entry.notes}"
              </div>

              {/* AI Review Section */}
              <div className="mt-4 pt-3 border-t border-purple-100">
                {entry.ai_review ? (
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-4 text-xs text-purple-950">
                    <div className="flex items-center gap-2 font-bold text-purple-800 mb-1">
                      <Sparkles size={16} className="text-purple-600 animate-pulse" />
                      AI Mentor Review & Advice:
                    </div>
                    <p className="leading-relaxed whitespace-pre-wrap">{entry.ai_review}</p>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAiReview(entry.id)}
                    disabled={reviewingId === entry.id}
                    className="border-purple-300 text-purple-700 hover:bg-purple-50 font-semibold cursor-pointer text-xs h-8"
                  >
                    {reviewingId === entry.id ? (
                      <>
                        <Loader2 className="animate-spin mr-1.5" size={14} />
                        Analyzing with AI Coach...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-1.5 text-purple-600" size={14} />
                        Generate AI Coach Review
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
