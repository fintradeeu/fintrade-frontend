import { DashboardLayout } from "../../components/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Bot, Plus, MessageCircle, MessageSquare, Database, BarChart, CheckCircle, Clock, Search, Filter } from "lucide-react";
import { Input } from "../../components/ui/input";

const faqs = [
  { question: "What is a stop-loss order?", category: "Risk Management", views: 1245, status: "Published" },
  { question: "How to read candlestick patterns?", category: "Technical Analysis", views: 982, status: "Published" },
  { question: "What is RSI indicator?", category: "Indicators", views: 856, status: "Published" },
  { question: "Explanation of Bullish Engulfing", category: "Patterns", views: 420, status: "Draft" },
];

const unresolvedDoubts = [
  { student: "Rahul Sharma", question: "Advanced options pricing models (Black-Scholes derivation)", time: "1 hour ago", priority: "High" },
  { student: "Aditi Mehta", question: "Correlation between USD/INR and NIFTY IT", time: "3 hours ago", priority: "Medium" },
  { student: "Vikas K.", question: "Margin calculation for intraday equity", time: "5 hours ago", priority: "Low" },
];

export default function AdminAIChatbot() {
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
          { label: "Active FAQs", value: "156", icon: Database, color: "#2196F3" },
          { label: "Unresolved", value: "12", icon: Clock, color: "#FF9800" },
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
                <Button style={{ background: "#D50032", color: "white" }}>
                  <Plus className="h-4 w-4 mr-2" /> Add FAQ
                </Button>
              </div>
            </div>
            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 group hover:border-[#D50032]/30 transition-all">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold" style={{ color: "#121212" }}>{faq.question}</p>
                      <Badge variant="outline" className="text-[10px] uppercase font-bold text-gray-400 px-2 py-0">{faq.category}</Badge>
                    </div>
                    <p className="text-sm text-gray-500 flex items-center gap-2">
                      <BarChart className="h-3 w-3" /> {faq.views} students viewed this month
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge style={{ background: faq.status === "Published" ? "#4CAF50" : "#9ca3af", color: "white" }}>{faq.status}</Badge>
                    <Button variant="outline" size="sm" className="bg-white border-gray-200 group-hover:border-[#D50032]">Edit</Button>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-4 text-gray-400 font-medium">View All FAQs</Button>
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
                  <p className="text-xs text-green-600">Last trained: April 14, 2026 • 98.4% Accuracy</p>
                </div>
              </div>
              <Button size="sm" variant="outline" className="bg-white border-green-200 text-green-700">Retrain Model</Button>
            </div>
          </Card>
        </div>

        {/* Unresolved Doubts Sidebar */}
        <div className="space-y-6">
          <Card className="p-6 bg-white shadow-sm border border-gray-100 h-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold" style={{ color: "#121212" }}>Manual Intervention</h3>
              <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200">12 Pending</Badge>
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
    </DashboardLayout>
  );
}
