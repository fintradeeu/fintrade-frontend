import { useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { TrendingUp, Users, Activity, Play, Settings, AlertTriangle, CheckCircle, Clock, ArrowUpRight, Pause } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import api from "../../services/api";
import { toast } from "sonner";

const serverLoadData = [
  { time: "10:00", load: 35 },
  { time: "11:00", load: 42 },
  { time: "12:00", load: 78 },
  { time: "13:00", load: 65 },
  { time: "14:00", load: 88 },
  { time: "15:00", load: 92 },
  { time: "16:00", load: 55 },
];

const activeSessions = [
  { student: "Aditi Mehta", capital: "₹10,00,000", pnl: "+₹12,450", status: "Active" },
  { student: "Rahul Sharma", capital: "₹10,00,000", pnl: "-₹4,200", status: "Active" },
  { student: "Vikas K.", capital: "₹10,00,000", pnl: "+₹2,100", status: "Active" },
  { student: "Neha J.", capital: "₹10,00,000", pnl: "+₹8,900", status: "Active" },
];

export default function AdminSimulator() {
  const [simulatorActive, setSimulatorActive] = useState(false);

  const toggleSimulator = async (status: boolean) => {
    try {
      await api.post(`/admin/simulator/toggle?status=${status}`);
      setSimulatorActive(status);
      toast.success(status ? "Simulator Started" : "Simulator Shutdown");
    } catch (err) {
      toast.error("Failed to toggle simulator status");
    }
  };

  return (
    <DashboardLayout role="admin">
      <div className="mb-8">
        <h1 className="text-3xl font-bold" style={{ color: "#121212" }}>Trading Simulator Control</h1>
        <p className="text-gray-600">Monitor live simulation server, managing student sessions and market data feeds</p>
      </div>

      <div className="grid md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Active Sessions", value: "342", icon: Users, color: "#D50032" },
          { label: "Server Load", value: "68%", icon: Activity, color: "#4CAF50" },
          { label: "Data Feed", value: simulatorActive ? "Stable" : "Offline", icon: CheckCircle, color: "#2196F3" },
          { label: "Total Orders (Today)", value: "12,854", icon: TrendingUp, color: "#9C27B0" },
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
        <div className="lg:col-span-2 space-y-6">
          {/* Server Status Chart */}
          <Card className="p-6 bg-white shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold" style={{ color: "#121212" }}>Server Performance (Concurrency)</h3>
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${simulatorActive ? "bg-green-500 animate-pulse" : "bg-gray-400"}`} />
                <span className="text-xs font-bold text-gray-400">Live Status: {simulatorActive ? "Healthy" : "Offline"}</span>
              </div>
            </div>
            <div className="h-[250px] opacity-70">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={serverLoadData}>
                  <defs>
                    <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={simulatorActive ? "#4CAF50" : "#9ca3af"} stopOpacity={0.2}/>
                      <stop offset="95%" stopColor={simulatorActive ? "#4CAF50" : "#9ca3af"} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="time" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Area type="monotone" dataKey="load" stroke={simulatorActive ? "#4CAF50" : "#9ca3af"} strokeWidth={3} fillOpacity={1} fill="url(#colorLoad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Active Sessions List */}
          <Card className="p-6 bg-white shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold" style={{ color: "#121212" }}>Top Live Sessions</h3>
              <Button size="sm" variant="outline" className="border-gray-200" onClick={() => toast.info("Viewing all 342 active sessions")}>View All 342</Button>
            </div>
            <div className="space-y-4">
              {activeSessions.map((session, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center font-bold text-xs" style={{ color: "#D50032", border: "1px solid #eee" }}>
                      {session.student.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                      <p className="font-bold text-sm" style={{ color: "#121212" }}>{session.student}</p>
                      <p className="text-xs text-gray-500">Virtual Equity: {session.capital}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-sm ${session.pnl.startsWith("+") ? "text-green-600" : "text-red-600"}`}>
                      {session.pnl}
                    </p>
                    <Badge variant="outline" className="text-[10px] uppercase font-bold py-0 h-5">Live</Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Controls */}
          <Card className="p-6 bg-white shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold mb-6" style={{ color: "#121212" }}>Simulator Operations</h3>
            <div className="space-y-3">
              {!simulatorActive ? (
                <Button onClick={() => toggleSimulator(true)} className="w-full h-12 flex items-center justify-between px-4 group" style={{ background: "#121212", color: "white" }}>
                  <span className="flex items-center gap-2"><Play className="h-4 w-4" /> Start Market Feed</span>
                  <ArrowUpRight className="h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </Button>
              ) : (
                <Button onClick={() => toggleSimulator(false)} className="w-full h-12 flex items-center justify-between px-4 group bg-yellow-500 text-white hover:bg-yellow-600">
                  <span className="flex items-center gap-2"><Pause className="h-4 w-4" /> Pause Feed</span>
                </Button>
              )}
              
              <Button variant="outline" className="w-full h-12 flex items-center justify-between px-4 border-gray-200 hover:border-[#D50032] hover:text-[#D50032]" onClick={() => toast.info("Opening advance configuration module...")}>
                <span className="flex items-center gap-2"><Settings className="h-4 w-4" /> Advance Config</span>
              </Button>
              <Button onClick={() => { toggleSimulator(false); toast.success("Nodes shutdown successfully"); }} variant="outline" className="w-full h-12 flex items-center justify-between px-4 border-gray-200 text-red-500 hover:bg-red-50">
                <span className="flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Shutdown Nodes</span>
              </Button>
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-100">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Market Data Source</h4>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <div className={`w-2 h-2 rounded-full ${simulatorActive ? "bg-green-500" : "bg-gray-400"}`} />
                <p className="text-xs font-medium text-gray-600">TradingView Webhook: <span className={simulatorActive ? "text-green-600" : "text-gray-500"}>{simulatorActive ? "Connected" : "Offline"}</span></p>
              </div>
            </div>
          </Card>

          {/* Quick Logs */}
          <Card className="p-6 bg-white shadow-sm border border-gray-100">
             <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: "#121212" }}>
              <Clock className="h-5 w-5" style={{ color: "#D50032" }} />
              System Event Log
            </h3>
            <div className="space-y-3">
              {[
                { time: "16:04", event: "NIFTY data stream resumed" },
                { time: "15:30", event: "Server load exceeded 90%" },
                { time: "14:15", event: "Node 4 restarted successfully" },
              ].map((log, i) => (
                <div key={i} className="flex gap-3 text-xs border-b border-gray-50 pb-2 last:border-0 lowercase">
                  <span className="text-gray-400 font-mono">{log.time}</span>
                  <span className="text-gray-600 font-medium">{log.event}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
