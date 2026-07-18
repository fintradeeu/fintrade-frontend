import { useState, useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { TrendingUp, TrendingDown, Users, Activity, Play, Settings, AlertTriangle, CheckCircle, Clock, ArrowUpRight, Pause, Search, Eye } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import api from "../../services/api";
import { toast } from "sonner";

export default function AdminSimulator() {
  const [simulatorActive, setSimulatorActive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [studentDashboard, setStudentDashboard] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    fetchMonitorData();
  }, []);

  const fetchMonitorData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/simulator/admin/monitor");
      setStats(res.data);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to load simulator statistics");
    } finally {
      setLoading(false);
    }
  };

  const toggleSimulator = async (status: boolean) => {
    try {
      await api.post(`/admin/simulator/toggle?status=${status}`);
      setSimulatorActive(status);
      toast.success(status ? "Simulator Started" : "Simulator Shutdown");
    } catch (err) {
      toast.error("Failed to toggle simulator status");
    }
  };

  const openStudentDetails = async (userId: number) => {
    setSelectedStudent(userId);
    setModalOpen(true);
    setModalLoading(true);
    try {
      const res = await api.get(`/simulator/admin/students/${userId}/dashboard`);
      setStudentDashboard(res.data);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to load student dashboard");
      setModalOpen(false);
    } finally {
      setModalLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <div className="flex h-[80vh] items-center justify-center">
          <p className="text-gray-500">Loading Simulator Data...</p>
        </div>
      </DashboardLayout>
    );
  }

  const allStudents = stats?.student_rankings || [];
  const profitableStudents = allStudents.filter((s: any) => s.pnl > 0);
  const losingStudents = allStudents.filter((s: any) => s.pnl < 0);
  
  const totalProfit = profitableStudents.reduce((acc: number, s: any) => acc + s.pnl, 0);
  const totalLoss = losingStudents.reduce((acc: number, s: any) => acc + Math.abs(s.pnl), 0);

  const topProfit = [...profitableStudents].sort((a, b) => b.pnl - a.pnl).slice(0, 5);
  const topLoss = [...losingStudents].sort((a, b) => a.pnl - b.pnl).slice(0, 5);

  const filteredStudents = allStudents.filter((s: any) => 
    s.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.student_email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout role="admin">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: "#121212" }}>Trading Simulator Dashboard</h1>
          <p className="text-gray-600 mt-2">Monitor all student simulator performances, analytics, and market data status</p>
        </div>
        <div className="flex gap-2">
          {!simulatorActive ? (
            <Button onClick={() => toggleSimulator(true)} className="bg-[#121212] text-white">
              <Play className="h-4 w-4 mr-2" /> Start Feed
            </Button>
          ) : (
            <Button onClick={() => toggleSimulator(false)} className="bg-yellow-500 hover:bg-yellow-600 text-white">
              <Pause className="h-4 w-4 mr-2" /> Pause Feed
            </Button>
          )}
        </div>
      </div>

      {/* Aggregate Stats */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <Card className="p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-blue-50">
              <Users className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Active Students</p>
              <p className="text-2xl font-bold text-[#121212]">{allStudents.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-green-50">
              <TrendingUp className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Platform Profit</p>
              <p className="text-2xl font-bold text-green-600">₹{totalProfit.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-red-50">
              <TrendingDown className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Platform Loss</p>
              <p className="text-2xl font-bold text-red-600">-₹{totalLoss.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-purple-50">
              <Activity className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Live Trades</p>
              <p className="text-2xl font-bold text-[#121212]">{stats?.live_trades?.length || 0}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Top Performers & Bottom Performers */}
      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        <Card className="p-6 bg-white shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-[#121212]">Top Profitable Students</h3>
            <Badge className="bg-green-100 text-green-700 hover:bg-green-200">Top 5</Badge>
          </div>
          <div className="space-y-4">
            {topProfit.length > 0 ? topProfit.map((student: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center font-bold text-xs text-green-600 border border-green-200">
                    {student.student_name ? student.student_name.substring(0, 2).toUpperCase() : "ST"}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-[#121212]">{student.student_name || "Unknown Student"}</p>
                    <p className="text-xs text-gray-500">Equity: ₹{student.equity.toLocaleString('en-IN')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm text-green-600">+₹{student.pnl.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
                  <Button variant="link" className="text-[10px] h-5 p-0" onClick={() => openStudentDetails(student.user_id)}>View Details</Button>
                </div>
              </div>
            )) : (
              <p className="text-sm text-gray-500 text-center py-4">No profitable students yet.</p>
            )}
          </div>
        </Card>

        <Card className="p-6 bg-white shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-[#121212]">Top Losing Students</h3>
            <Badge className="bg-red-100 text-red-700 hover:bg-red-200">Bottom 5</Badge>
          </div>
          <div className="space-y-4">
            {topLoss.length > 0 ? topLoss.map((student: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center font-bold text-xs text-red-600 border border-red-200">
                    {student.student_name ? student.student_name.substring(0, 2).toUpperCase() : "ST"}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-[#121212]">{student.student_name || "Unknown Student"}</p>
                    <p className="text-xs text-gray-500">Equity: ₹{student.equity.toLocaleString('en-IN')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm text-red-600">₹{student.pnl.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
                  <Button variant="link" className="text-[10px] h-5 p-0" onClick={() => openStudentDetails(student.user_id)}>View Details</Button>
                </div>
              </div>
            )) : (
              <p className="text-sm text-gray-500 text-center py-4">No losing students found.</p>
            )}
          </div>
        </Card>
      </div>

      {/* All Students Data Table */}
      <Card className="p-6 bg-white shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <h3 className="text-xl font-bold text-[#121212]">All Student Trading Analysis</h3>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input 
              placeholder="Search students..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-[#F4F1EA] border-none"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#F4F1EA] hover:bg-[#F4F1EA]">
                <TableHead className="text-[#0B2A5B] font-semibold">Student</TableHead>
                <TableHead className="text-[#0B2A5B] font-semibold text-right">Current Equity</TableHead>
                <TableHead className="text-[#0B2A5B] font-semibold text-right">Total PnL</TableHead>
                <TableHead className="text-[#0B2A5B] font-semibold text-center">Status</TableHead>
                <TableHead className="text-[#0B2A5B] font-semibold text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length > 0 ? filteredStudents.map((student: any, idx: number) => (
                <TableRow key={idx}>
                  <TableCell>
                    <div className="font-medium text-[#121212]">{student.student_name || "Unknown"}</div>
                    <div className="text-xs text-gray-500">{student.student_email || "-"}</div>
                  </TableCell>
                  <TableCell className="text-right font-medium">₹{student.equity?.toLocaleString('en-IN')}</TableCell>
                  <TableCell className={`text-right font-bold ${student.pnl >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {student.pnl >= 0 ? "+" : ""}₹{student.pnl?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="text-center">
                    {stats?.challenge_status?.find((c: any) => c.account_id === student.account_id)?.status === "failed" ? (
                      <Badge className="bg-red-100 text-red-700">Failed</Badge>
                    ) : (
                      <Badge className="bg-green-100 text-green-700">Active</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <Button size="sm" variant="outline" onClick={() => openStudentDetails(student.user_id)}>
                      <Eye className="w-4 h-4 mr-2" /> Analyze
                    </Button>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    No students found matching your criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Student Details Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Individual Student Analysis</DialogTitle>
          </DialogHeader>
          
          {modalLoading ? (
            <div className="py-12 text-center text-gray-500">Loading student trading data...</div>
          ) : studentDashboard ? (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <Card className="p-4 bg-gray-50 border-gray-100">
                  <p className="text-xs text-gray-500">Current Balance</p>
                  <p className="text-xl font-bold text-[#121212]">₹{studentDashboard.account.balance.toLocaleString('en-IN', {maximumFractionDigits: 2})}</p>
                </Card>
                <Card className="p-4 bg-gray-50 border-gray-100">
                  <p className="text-xs text-gray-500">Current Equity</p>
                  <p className="text-xl font-bold text-[#121212]">₹{studentDashboard.account.equity.toLocaleString('en-IN', {maximumFractionDigits: 2})}</p>
                </Card>
                <Card className="p-4 bg-gray-50 border-gray-100">
                  <p className="text-xs text-gray-500">Total Realized PnL</p>
                  <p className={`text-xl font-bold ${studentDashboard.wallet.realized_pnl >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {studentDashboard.wallet.realized_pnl >= 0 ? "+" : ""}₹{studentDashboard.wallet.realized_pnl.toLocaleString('en-IN', {maximumFractionDigits: 2})}
                  </p>
                </Card>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Active Positions</h4>
                <div className="border border-gray-100 rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead>Symbol</TableHead>
                        <TableHead>Side</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead>Entry</TableHead>
                        <TableHead>Unrealized PnL</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {studentDashboard.open_positions?.length > 0 ? studentDashboard.open_positions.map((pos: any, i: number) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium">{pos.symbol}</TableCell>
                          <TableCell><Badge className={pos.side === "buy" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>{pos.side.toUpperCase()}</Badge></TableCell>
                          <TableCell>{pos.quantity}</TableCell>
                          <TableCell>₹{pos.entry_price}</TableCell>
                          <TableCell className={`font-bold ${pos.unrealized_pnl >= 0 ? "text-green-600" : "text-red-600"}`}>
                            {pos.unrealized_pnl >= 0 ? "+" : ""}₹{pos.unrealized_pnl.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      )) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-4 text-gray-500">No active positions</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Recent Closed Trades</h4>
                <div className="border border-gray-100 rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead>Symbol</TableHead>
                        <TableHead>Side</TableHead>
                        <TableHead>Entry / Exit</TableHead>
                        <TableHead>Realized PnL</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {studentDashboard.closed_trades?.slice(0, 5).map((trade: any, i: number) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium">{trade.symbol}</TableCell>
                          <TableCell><Badge className={trade.side === "buy" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>{trade.side.toUpperCase()}</Badge></TableCell>
                          <TableCell>₹{trade.entry_price} / ₹{trade.exit_price}</TableCell>
                          <TableCell className={`font-bold ${trade.pnl >= 0 ? "text-green-600" : "text-red-600"}`}>
                            {trade.pnl >= 0 ? "+" : ""}₹{trade.pnl?.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                      {!studentDashboard.closed_trades?.length && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-4 text-gray-500">No closed trades yet</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-red-500">Failed to load data.</div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
