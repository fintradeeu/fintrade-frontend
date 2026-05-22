import { useState, useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Bot, Plus, MessageCircle, MessageSquare, Database, BarChart, CheckCircle, Clock, Search, Filter, X, Edit, Trash2 } from "lucide-react";
import { Input } from "../../components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { toast } from "sonner";
import api from "../../services/api";

const unresolvedDoubts = [
  { student: "Rahul Sharma", question: "Advanced options pricing models (Black-Scholes derivation)", time: "1 hour ago", priority: "High" },
  { student: "Aditi Mehta", question: "Correlation between USD/INR and NIFTY IT", time: "3 hours ago", priority: "Medium" },
  { student: "Vikas K.", question: "Margin calculation for intraday equity", time: "5 hours ago", priority: "Low" },
];

export default function AdminAIChatbot() {
  const [faqs, setFaqs] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentFaqId, setCurrentFaqId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    is_active: true
  });

  const fetchFaqs = async () => {
    try {
      const res = await api.get("/admin/ai/faqs");
      setFaqs(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const handleOpenModal = (faq?: any) => {
    if (faq) {
      setIsEditing(true);
      setCurrentFaqId(faq.id);
      setFormData({
        question: faq.question,
        answer: faq.answer,
        is_active: faq.is_active
      });
    } else {
      setIsEditing(false);
      setCurrentFaqId(null);
      setFormData({ question: "", answer: "", is_active: true });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && currentFaqId) {
        await api.put(`/admin/ai/faqs/${currentFaqId}`, formData);
        toast.success("FAQ updated successfully");
      } else {
        await api.post("/admin/ai/faqs", formData);
        toast.success("FAQ created successfully");
      }
      setIsModalOpen(false);
      fetchFaqs();
    } catch (err) {
      toast.error("Failed to save FAQ");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this FAQ?")) return;
    try {
      await api.delete(`/admin/ai/faqs/${id}`);
      toast.success("Deleted successfully");
      fetchFaqs();
    } catch (err) {
      toast.error("Failed to delete FAQ");
    }
  };

  return (
    <DashboardLayout role="admin">
      <div className="mb-8">
        <h1 className="text-3xl font-bold" style={{ color: "#121212" }}>AI Chatbot Control</h1>
        <p className="text-gray-600">Manage FAQ database and oversee student-AI interactions</p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Queries", value: "8,756", icon: MessageSquare, color: "#D50032" },
          { label: "Resolution Rate", value: "92%", icon: CheckCircle, color: "#4CAF50" },
          { label: "Active FAQs", value: faqs.length.toString(), icon: Database, color: "#2196F3" },
          { label: "Unresolved", value: "3", icon: Clock, color: "#FF9800" },
        ].map((s, i) => (
          <Card key={i} className="p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: `${s.color}10` }}>
                <s.icon className="h-6 w-6" style={{ color: s.color }} />
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">{s.label}</p>
                <p className="text-2xl font-bold" style={{ color: "#121212" }}>{s.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* FAQ Management */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 bg-white shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold" style={{ color: "#121212" }}>FAQ Knowledge Base</h3>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input placeholder="Search FAQs..." className="pl-9 h-10 w-64" />
                </div>
                <Button onClick={() => handleOpenModal()} style={{ background: "#D50032", color: "white" }}>
                  <Plus className="h-4 w-4 mr-2" /> Add FAQ
                </Button>
              </div>
            </div>
            <div className="space-y-3">
              {faqs.map((faq) => (
                <div key={faq.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 group hover:border-[#D50032]/30 transition-all">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold" style={{ color: "#121212" }}>{faq.question}</p>
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-1">{faq.answer}</p>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <Badge style={{ background: faq.is_active ? "#4CAF50" : "#9ca3af", color: "white" }}>
                      {faq.is_active ? "Published" : "Draft"}
                    </Badge>
                    <Button variant="ghost" size="icon" onClick={() => handleOpenModal(faq)}>
                      <Edit className="w-4 h-4 text-blue-600" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(faq.id)}>
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              ))}
              {faqs.length === 0 && <p className="text-gray-500 text-center py-4">No FAQs configured yet.</p>}
            </div>
          </Card>

          {/* Training Status */}
          <Card className="p-6 bg-white shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold mb-4" style={{ color: "#121212" }}>Model Training Status</h3>
            <div className="flex items-center justify-between p-4 rounded-xl bg-green-50 border border-green-100 mb-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Bot className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-bold text-green-800">Current Model: FinGPT-3.5</p>
                  <p className="text-xs text-green-600">Knowledge synced with current FAQs</p>
                </div>
              </div>
              <Button size="sm" variant="outline" className="bg-white border-green-200 text-green-700">Sync Now</Button>
            </div>
          </Card>
        </div>

        {/* Unresolved Doubts Sidebar */}
        <div className="space-y-6">
          <Card className="p-6 bg-white shadow-sm border border-gray-100 h-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold" style={{ color: "#121212" }}>Manual Intervention</h3>
              <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200">3 Pending</Badge>
            </div>
            <div className="space-y-4">
              {unresolvedDoubts.map((doubt, index) => (
                <div key={index} className="p-4 bg-white border border-gray-100 rounded-xl relative group overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full" style={{ background: doubt.priority === "High" ? "#D50032" : doubt.priority === "Medium" ? "#FF9800" : "#4CAF50" }} />
                  <div className="flex items-start gap-3 mb-2">
                    <MessageCircle className="h-4 w-4 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm font-bold truncate pr-8" style={{ color: "#121212" }}>{doubt.question}</p>
                      <p className="text-xs text-gray-500">Student: {doubt.student}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-[10px] text-gray-400 font-medium">{doubt.time}</span>
                    <Button size="sm" className="h-7 text-[11px] px-3 border-[#D50032] text-[#D50032] bg-white border" variant="outline">Answer Now</Button>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-6 border-gray-200 text-gray-500">History Log</Button>
          </Card>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit FAQ" : "Add FAQ"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div>
              <label className="text-sm font-semibold mb-1 block">Question</label>
              <Input 
                required 
                value={formData.question} 
                onChange={e => setFormData({...formData, question: e.target.value})} 
              />
            </div>
            <div>
              <label className="text-sm font-semibold mb-1 block">Answer</label>
              <textarea 
                required 
                rows={4}
                className="w-full border border-gray-200 rounded-md p-2"
                value={formData.answer} 
                onChange={e => setFormData({...formData, answer: e.target.value})} 
              />
            </div>
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="activeStatus"
                checked={formData.is_active}
                onChange={e => setFormData({...formData, is_active: e.target.checked})}
              />
              <label htmlFor="activeStatus" className="text-sm">Published</label>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="submit" style={{ background: "#0B2A5B", color: "white" }}>
                {isEditing ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
