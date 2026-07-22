import { useState, useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  TrendingUp, Users, DollarSign, ArrowDownRight, Wallet,
  Building2, Download, RefreshCw, ChevronDown, ChevronUp, BarChart3
} from "lucide-react";
import api from "../../services/api";
import { toast } from "sonner";

function formatINR(val: number) {
  return (val || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function pct(part: number, total: number) {
  if (!total) return "0%";
  return ((part / total) * 100).toFixed(1) + "%";
}

function StatCard({
  label, value, sub, color, icon: Icon, onClick, active,
}: {
  label: string; value: string; sub?: string; color: string;
  icon: any; onClick?: () => void; active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`p-5 rounded-2xl border-2 text-left transition-all shadow-sm w-full ${active ? `border-current bg-opacity-10` : "border-gray-100 bg-white hover:shadow-md"}`}
      style={active ? { borderColor: color, background: color + "12" } : {}}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 rounded-xl" style={{ background: color + "20" }}>
          <Icon size={18} style={{ color }} />
        </div>
        {onClick && <span className="text-[10px] text-gray-400 font-medium mt-1">Click to filter</span>}
      </div>
      <div className="text-2xl font-black" style={{ color }}>{value}</div>
      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-1">{label}</div>
      {sub && <div className="text-[11px] text-gray-400 mt-0.5">{sub}</div>}
    </button>
  );
}

export default function AdminFranchiseIBRevenue() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<"gross" | "commission" | "net" | "students">("gross");
  const [sortDir, setSortDir] = useState<"desc" | "asc">("desc");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/commissions/revenue/ib-wise");
      setData(res.data);
    } catch (err: any) {
      toast.error("Failed to load revenue data: " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSort = (col: typeof sortBy) => {
    if (sortBy === col) setSortDir(d => d === "desc" ? "asc" : "desc");
    else { setSortBy(col); setSortDir("desc"); }
  };

  const sortedRows = [...(data?.ib_rows || [])].sort((a, b) => {
    const key = { gross: "gross_revenue", commission: "commission_earned", net: "superadmin_net_revenue", students: "student_count" }[sortBy];
    return sortDir === "desc" ? b[key] - a[key] : a[key] - b[key];
  });

  const exportCSV = () => {
    if (!data?.ib_rows?.length) { toast.error("No data to export"); return; }
    const headers = ["IB Name", "Email", "Referral Code", "Students", "Gross Revenue", "IB Commission", "Commission Paid Out", "Pending Withdrawal", "Wallet Balance", "Superadmin Net Revenue"];
    const rows = data.ib_rows.map((r: any) => [
      `"${r.ib_name}"`, `"${r.ib_email || ""}"`, `"${r.referral_code || ""}"`,
      r.student_count, r.gross_revenue, r.commission_earned,
      r.commission_paid_out, r.pending_withdrawal, r.wallet_balance, r.superadmin_net_revenue,
    ]);
    const csv = "\uFEFF" + [headers.join(","), ...rows.map((r: any[]) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `ib_revenue_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Revenue report exported!");
  };

  const s = data?.summary || {};

  return (
    <DashboardLayout role="admin">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="text-[#0B2A5B]" size={28} />
            <h1 className="text-3xl font-black text-[#0B2A5B] tracking-tight">Franchise IB Revenue</h1>
          </div>
          <p className="text-[#0B2A5B]/60 text-sm">Per-IB gross sales, commissions paid, and superadmin net earnings breakdown</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={fetchData} disabled={loading} className="border-[#0B2A5B]/20 text-[#0B2A5B] rounded-xl gap-2">
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Refresh
          </Button>
          <Button onClick={exportCSV} className="bg-[#C2A86A] text-[#0B2A5B] hover:bg-[#d4bd8a] rounded-xl gap-2 font-semibold">
            <Download size={15} /> Export CSV
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-32 text-[#0B2A5B]/50">
          <RefreshCw size={30} className="animate-spin mr-3" /> Loading revenue data...
        </div>
      ) : (
        <>
          {/* Summary Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <StatCard
              label="Total Gross Revenue" value={`₹${formatINR(s.total_gross_revenue)}`}
              sub="All sales combined" color="#0B2A5B" icon={TrendingUp}
            />
            <StatCard
              label="Superadmin Net" value={`₹${formatINR(s.total_superadmin_net)}`}
              sub="After IB commissions" color="#16a34a" icon={DollarSign}
            />
            <StatCard
              label="IB Commissions" value={`₹${formatINR(s.total_ib_commission)}`}
              sub={pct(s.total_ib_commission, s.total_gross_revenue) + " of total"} color="#dc2626" icon={ArrowDownRight}
            />
            <StatCard
              label="Direct Revenue" value={`₹${formatINR(s.direct_revenue)}`}
              sub={`${s.direct_student_count} direct students`} color="#2563eb" icon={Building2}
            />
            <StatCard
              label="Active Franchise IBs" value={String(s.total_ib_count || 0)}
              sub="Registered IBs" color="#9333ea" icon={Users}
            />
            <StatCard
              label="IB Commission %" value={pct(s.total_ib_commission, s.total_gross_revenue)}
              sub="Commission ratio" color="#d97706" icon={Wallet}
            />
          </div>

          {/* Revenue split visual bar */}
          {s.total_gross_revenue > 0 && (
            <Card className="p-5 mb-8 bg-white shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-bold text-gray-700">Revenue Split Overview</div>
                <div className="text-xs text-gray-400">Total: ₹{formatINR(s.total_gross_revenue)}</div>
              </div>
              <div className="flex rounded-full overflow-hidden h-5 bg-gray-100">
                {s.total_superadmin_net > 0 && (
                  <div
                    className="bg-[#0B2A5B] flex items-center justify-center text-white text-[10px] font-bold transition-all"
                    style={{ width: pct(s.total_superadmin_net, s.total_gross_revenue) }}
                    title={`Superadmin Net: ₹${formatINR(s.total_superadmin_net)}`}
                  >
                    {parseFloat(pct(s.total_superadmin_net, s.total_gross_revenue)) > 8 && pct(s.total_superadmin_net, s.total_gross_revenue)}
                  </div>
                )}
                {s.total_ib_commission > 0 && (
                  <div
                    className="bg-[#dc2626] flex items-center justify-center text-white text-[10px] font-bold transition-all"
                    style={{ width: pct(s.total_ib_commission, s.total_gross_revenue) }}
                    title={`IB Commission: ₹${formatINR(s.total_ib_commission)}`}
                  >
                    {parseFloat(pct(s.total_ib_commission, s.total_gross_revenue)) > 8 && pct(s.total_ib_commission, s.total_gross_revenue)}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-6 mt-3 text-xs">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#0B2A5B] inline-block" /> Superadmin Net (₹{formatINR(s.total_superadmin_net)})</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#dc2626] inline-block" /> IB Commissions (₹{formatINR(s.total_ib_commission)})</span>
              </div>
            </Card>
          )}

          {/* Per-IB Table */}
          <Card className="bg-white shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="font-bold text-[#0B2A5B] flex items-center gap-2">
                <Users size={16} /> Franchise IB Revenue Breakdown
              </div>
              <span className="text-xs text-gray-400">{sortedRows.length} IB(s)</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#F4F1EA]">
                  <tr>
                    <th className="px-5 py-3 text-left font-bold text-[#0B2A5B] text-xs uppercase">Franchise IB</th>
                    <th
                      className="px-4 py-3 text-right font-bold text-[#0B2A5B] text-xs uppercase cursor-pointer select-none hover:text-[#C2A86A] whitespace-nowrap"
                      onClick={() => handleSort("students")}
                    >
                      Students {sortBy === "students" ? (sortDir === "desc" ? "↓" : "↑") : ""}
                    </th>
                    <th
                      className="px-4 py-3 text-right font-bold text-[#0B2A5B] text-xs uppercase cursor-pointer select-none hover:text-[#C2A86A] whitespace-nowrap"
                      onClick={() => handleSort("gross")}
                    >
                      Gross Revenue {sortBy === "gross" ? (sortDir === "desc" ? "↓" : "↑") : ""}
                    </th>
                    <th
                      className="px-4 py-3 text-right font-bold text-[#0B2A5B] text-xs uppercase cursor-pointer select-none hover:text-[#C2A86A] whitespace-nowrap"
                      onClick={() => handleSort("commission")}
                    >
                      IB Commission {sortBy === "commission" ? (sortDir === "desc" ? "↓" : "↑") : ""}
                    </th>
                    <th className="px-4 py-3 text-right font-bold text-[#0B2A5B] text-xs uppercase whitespace-nowrap">Paid Out</th>
                    <th className="px-4 py-3 text-right font-bold text-[#0B2A5B] text-xs uppercase whitespace-nowrap">Wallet Balance</th>
                    <th
                      className="px-4 py-3 text-right font-bold text-[#0B2A5B] text-xs uppercase cursor-pointer select-none hover:text-[#C2A86A] whitespace-nowrap"
                      onClick={() => handleSort("net")}
                    >
                      Superadmin Net {sortBy === "net" ? (sortDir === "desc" ? "↓" : "↑") : ""}
                    </th>
                    <th className="px-4 py-3 text-center font-bold text-[#0B2A5B] text-xs uppercase">Detail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {sortedRows.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-gray-400 font-medium">
                        No Franchise IBs found.
                      </td>
                    </tr>
                  ) : sortedRows.map((row: any) => {
                    const expanded = expandedRow === row.ib_id;
                    const netPct = row.gross_revenue > 0 ? ((row.superadmin_net_revenue / row.gross_revenue) * 100).toFixed(0) : "100";
                    return (
                      <>
                        <tr key={row.ib_id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-5 py-4">
                            <div className="font-semibold text-[#0B2A5B]">{row.ib_name}</div>
                            <div className="text-xs text-gray-400">{row.ib_email}</div>
                            <Badge className="bg-[#0B2A5B]/10 text-[#0B2A5B] border-none text-[10px] mt-1">
                              {row.referral_code}
                            </Badge>
                          </td>
                          <td className="px-4 py-4 text-right font-bold text-gray-700">{row.student_count}</td>
                          <td className="px-4 py-4 text-right">
                            <div className="font-bold text-gray-800">₹{formatINR(row.gross_revenue)}</div>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <div className="font-semibold text-red-600">₹{formatINR(row.commission_earned)}</div>
                            <div className="text-[11px] text-gray-400">
                              {row.gross_revenue > 0 ? pct(row.commission_earned, row.gross_revenue) : "—"}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-right text-gray-500 text-xs font-medium">
                            ₹{formatINR(row.commission_paid_out)}
                            {row.pending_withdrawal > 0 && (
                              <div className="text-orange-500">+₹{formatINR(row.pending_withdrawal)} pending</div>
                            )}
                          </td>
                          <td className="px-4 py-4 text-right">
                            <span className={`font-semibold text-sm ${row.wallet_balance > 0 ? "text-orange-600" : "text-gray-400"}`}>
                              ₹{formatINR(row.wallet_balance)}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <div className="font-black text-green-600 text-base">₹{formatINR(row.superadmin_net_revenue)}</div>
                            <div className="text-[11px] text-gray-400">{netPct}% of gross</div>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <button
                              onClick={() => setExpandedRow(expanded ? null : row.ib_id)}
                              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-[#0B2A5B]"
                            >
                              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>
                          </td>
                        </tr>
                        {expanded && (
                          <tr key={`${row.ib_id}-detail`} className="bg-blue-50/40">
                            <td colSpan={8} className="px-6 py-4">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-white rounded-xl p-4 border border-blue-100 shadow-sm">
                                  <div className="text-xs text-gray-400 uppercase font-semibold mb-1">Gross Revenue</div>
                                  <div className="text-xl font-black text-[#0B2A5B]">₹{formatINR(row.gross_revenue)}</div>
                                  <div className="text-xs text-gray-400">{row.student_count} students enrolled</div>
                                </div>
                                <div className="bg-white rounded-xl p-4 border border-red-100 shadow-sm">
                                  <div className="text-xs text-gray-400 uppercase font-semibold mb-1">IB Commission Earned</div>
                                  <div className="text-xl font-black text-red-600">₹{formatINR(row.commission_earned)}</div>
                                  <div className="text-xs text-gray-400">Credited to IB wallet</div>
                                </div>
                                <div className="bg-white rounded-xl p-4 border border-orange-100 shadow-sm">
                                  <div className="text-xs text-gray-400 uppercase font-semibold mb-1">Paid Out + Pending</div>
                                  <div className="text-xl font-black text-orange-600">₹{formatINR(row.commission_paid_out)}</div>
                                  <div className="text-xs text-gray-400">
                                    {row.pending_withdrawal > 0 ? `₹${formatINR(row.pending_withdrawal)} pending withdrawal` : "No pending"}
                                  </div>
                                </div>
                                <div className="bg-white rounded-xl p-4 border border-green-100 shadow-sm">
                                  <div className="text-xs text-gray-400 uppercase font-semibold mb-1">Superadmin Net</div>
                                  <div className="text-xl font-black text-green-600">₹{formatINR(row.superadmin_net_revenue)}</div>
                                  <div className="text-xs text-gray-400">{netPct}% of gross revenue</div>
                                </div>
                              </div>

                              {/* Visual bar */}
                              {row.gross_revenue > 0 && (
                                <div className="mt-4">
                                  <div className="flex rounded-full overflow-hidden h-4 bg-gray-100">
                                    <div
                                      className="bg-green-500 transition-all"
                                      style={{ width: pct(row.superadmin_net_revenue, row.gross_revenue) }}
                                      title={`Net: ₹${formatINR(row.superadmin_net_revenue)}`}
                                    />
                                    <div
                                      className="bg-red-500 transition-all"
                                      style={{ width: pct(row.commission_earned, row.gross_revenue) }}
                                      title={`Commission: ₹${formatINR(row.commission_earned)}`}
                                    />
                                  </div>
                                  <div className="flex items-center gap-5 mt-2 text-xs">
                                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" /> Superadmin Net</span>
                                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" /> IB Commission</span>
                                  </div>
                                </div>
                              )}
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
                {/* Footer totals */}
                {sortedRows.length > 0 && (
                  <tfoot className="bg-[#0B2A5B]/5 border-t-2 border-[#0B2A5B]/10">
                    <tr>
                      <td className="px-5 py-3 font-black text-[#0B2A5B] text-sm">
                        TOTAL (IB Students)
                      </td>
                      <td className="px-4 py-3 text-right font-black text-gray-700">
                        {sortedRows.reduce((s: number, r: any) => s + r.student_count, 0)}
                      </td>
                      <td className="px-4 py-3 text-right font-black text-gray-800">
                        ₹{formatINR(sortedRows.reduce((s: number, r: any) => s + r.gross_revenue, 0))}
                      </td>
                      <td className="px-4 py-3 text-right font-black text-red-600">
                        ₹{formatINR(sortedRows.reduce((s: number, r: any) => s + r.commission_earned, 0))}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-gray-500 text-xs">
                        ₹{formatINR(sortedRows.reduce((s: number, r: any) => s + r.commission_paid_out, 0))}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-orange-600">
                        ₹{formatINR(sortedRows.reduce((s: number, r: any) => s + r.wallet_balance, 0))}
                      </td>
                      <td className="px-4 py-3 text-right font-black text-green-600 text-base">
                        ₹{formatINR(sortedRows.reduce((s: number, r: any) => s + r.superadmin_net_revenue, 0))}
                      </td>
                      <td />
                    </tr>
                    {/* Direct registration row */}
                    {s.direct_revenue > 0 && (
                      <tr className="border-t border-[#0B2A5B]/10">
                        <td className="px-5 py-2 text-xs font-bold text-blue-700">+ Direct Registration</td>
                        <td className="px-4 py-2 text-right text-xs font-bold text-gray-600">{s.direct_student_count}</td>
                        <td className="px-4 py-2 text-right text-xs font-bold text-gray-700">₹{formatINR(s.direct_revenue)}</td>
                        <td className="px-4 py-2 text-right text-xs text-gray-400">—</td>
                        <td className="px-4 py-2 text-right text-xs text-gray-400">—</td>
                        <td className="px-4 py-2 text-right text-xs text-gray-400">—</td>
                        <td className="px-4 py-2 text-right text-xs font-bold text-green-600">₹{formatINR(s.direct_revenue)}</td>
                        <td />
                      </tr>
                    )}
                    <tr className="border-t-2 border-[#0B2A5B]/20">
                      <td className="px-5 py-3 font-black text-[#0B2A5B]">GRAND TOTAL</td>
                      <td className="px-4 py-3 text-right font-black text-gray-700">
                        {sortedRows.reduce((s: number, r: any) => s + r.student_count, 0) + (s.direct_student_count || 0)}
                      </td>
                      <td className="px-4 py-3 text-right font-black text-[#0B2A5B] text-base">
                        ₹{formatINR(s.total_gross_revenue)}
                      </td>
                      <td className="px-4 py-3 text-right font-black text-red-700">
                        ₹{formatINR(s.total_ib_commission)}
                      </td>
                      <td colSpan={2} />
                      <td className="px-4 py-3 text-right font-black text-green-700 text-base">
                        ₹{formatINR(s.total_superadmin_net)}
                      </td>
                      <td />
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </Card>
        </>
      )}
    </DashboardLayout>
  );
}
