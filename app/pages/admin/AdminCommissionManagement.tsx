import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import api from "../../services/api";
import { CheckCircle, CreditCard, FileText, IndianRupee, Save, Search, Settings, X } from "lucide-react";
import { toast } from "sonner";
import { confirmPopup } from "../../utils/popup";

const tabs = [
  { id: "courses", label: "Courses", icon: FileText },
  { id: "setup", label: "IB Commission Setup", icon: Settings },
  { id: "transactions", label: "Wallet Transactions", icon: CreditCard },
  { id: "withdrawals", label: "Withdrawal Requests", icon: IndianRupee },
  { id: "reports", label: "Reports", icon: CheckCircle },
];

const inr = (value: number | string | null | undefined) =>
  `INR ${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

const dateText = (value?: string) => value ? new Date(value).toLocaleDateString("en-IN") : "-";

export default function AdminCommissionManagement() {
  const [activeTab, setActiveTab] = useState("courses");
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);
  const [ibRows, setIbRows] = useState<any[]>([]);
  const [rowEdits, setRowEdits] = useState<Record<number, any>>({});
  const [transactions, setTransactions] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [commissionReport, setCommissionReport] = useState<any>(null);
  const [withdrawalReport, setWithdrawalReport] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [payingRequest, setPayingRequest] = useState<any | null>(null);
  const [paidForm, setPaidForm] = useState({ utr_number: "", transaction_reference: "", proof_file: null as File | null });

  const loadCourses = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/commissions/courses");
      setCourses(res.data || []);
      if (!selectedCourse && res.data?.length) setSelectedCourse(res.data[0]);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to load commission courses.");
    } finally {
      setLoading(false);
    }
  };

  const loadIbSetup = async (course = selectedCourse) => {
    if (!course) return;
    setLoading(true);
    try {
      const res = await api.get(`/admin/commissions/courses/${course.course_id}/ibs`);
      setIbRows(res.data || []);
      const edits: Record<number, any> = {};
      (res.data || []).forEach((row: any) => {
        edits[row.ib_id] = {
          commission_type: row.commission_type || "percentage",
          commission_value: row.commission_value ?? 0,
          is_active: Boolean(row.is_active),
        };
      });
      setRowEdits(edits);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to load IB setup.");
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/commissions/wallet-transactions");
      setTransactions(res.data || []);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to load wallet transactions.");
    } finally {
      setLoading(false);
    }
  };

  const loadWithdrawals = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/commissions/withdrawals");
      setWithdrawals(res.data || []);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to load withdrawals.");
    } finally {
      setLoading(false);
    }
  };

  const loadReports = async () => {
    setLoading(true);
    try {
      const [commissionRes, withdrawalRes] = await Promise.all([
        api.get("/admin/commissions/reports/commission"),
        api.get("/admin/commissions/reports/withdrawals"),
      ]);
      setCommissionReport(commissionRes.data);
      setWithdrawalReport(withdrawalRes.data);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to load reports.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    if (activeTab === "setup") loadIbSetup();
    if (activeTab === "transactions") loadTransactions();
    if (activeTab === "withdrawals") loadWithdrawals();
    if (activeTab === "reports") loadReports();
  }, [activeTab, selectedCourse?.course_id]);

  const filteredIbRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return ibRows;
    return ibRows.filter((row) =>
      [row.ib_name, row.email, row.mobile].filter(Boolean).some((value) => String(value).toLowerCase().includes(q))
    );
  }, [ibRows, search]);

  const saveCommission = async (row: any) => {
    if (!selectedCourse) return;
    try {
      await api.put(`/admin/commissions/courses/${selectedCourse.course_id}/ibs/${row.ib_id}`, rowEdits[row.ib_id]);
      toast.success("Commission setup saved.");
      loadIbSetup();
      loadCourses();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to save commission setup.");
    }
  };

  const updateWithdrawal = async (request: any, action: "approve" | "reject") => {
    const ok = await confirmPopup(`${action === "approve" ? "Approve" : "Reject"} withdrawal request for ${inr(request.amount)}?`);
    if (!ok) return;
    try {
      await api.post(`/admin/commissions/withdrawals/${request.id}/${action}`, { admin_remarks: "" });
      toast.success(`Withdrawal ${action === "approve" ? "approved" : "rejected"}.`);
      loadWithdrawals();
      loadReports();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || `Failed to ${action} withdrawal.`);
    }
  };

  const markPaid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingRequest) return;
    const formData = new FormData();
    if (paidForm.utr_number) formData.append("utr_number", paidForm.utr_number);
    if (paidForm.transaction_reference) formData.append("transaction_reference", paidForm.transaction_reference);
    if (paidForm.proof_file) formData.append("proof_file", paidForm.proof_file);
    try {
      await api.post(`/admin/commissions/withdrawals/${payingRequest.id}/mark-paid`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Withdrawal marked as paid.");
      setPayingRequest(null);
      setPaidForm({ utr_number: "", transaction_reference: "", proof_file: null });
      loadWithdrawals();
      loadReports();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to mark withdrawal as paid.");
    }
  };

  return (
    <DashboardLayout role="super_admin">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#0B2A5B] mb-2">Commission Management</h1>
        <p className="text-[#0B2A5B]/70">Manage IB course commission, wallet credits, withdrawals, and reports.</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "outline"}
              onClick={() => setActiveTab(tab.id)}
              className={activeTab === tab.id ? "bg-[#0B2A5B] text-white hover:bg-[#163b75]" : "bg-white text-[#0B2A5B]"}
            >
              <Icon size={16} className="mr-2" />
              {tab.label}
            </Button>
          );
        })}
      </div>

      {activeTab === "courses" && (
        <Card className="p-6 bg-white shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader><TableRow className="bg-[#F4F1EA]"><TableHead>Course</TableHead><TableHead>Price</TableHead><TableHead>Total IBs</TableHead><TableHead>Configured</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
              <TableBody>
                {courses.map((course) => (
                  <TableRow key={course.course_id}>
                    <TableCell className="font-semibold text-[#0B2A5B]">{course.course_title}</TableCell>
                    <TableCell>{inr(course.course_price)}</TableCell>
                    <TableCell>{course.total_ibs}</TableCell>
                    <TableCell><Badge className="bg-blue-100 text-blue-700">{course.configured_ibs} configured</Badge></TableCell>
                    <TableCell><Button size="sm" onClick={() => { setSelectedCourse(course); setActiveTab("setup"); }} className="bg-[#0B2A5B] text-white">Manage</Button></TableCell>
                  </TableRow>
                ))}
                {courses.length === 0 && !loading && <TableRow><TableCell colSpan={5} className="py-10 text-center text-[#0B2A5B]/60">No courses found.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {activeTab === "setup" && (
        <>
          <Card className="p-4 bg-white shadow-lg mb-5">
            <div className="grid md:grid-cols-[260px_1fr] gap-3">
              <select
                value={selectedCourse?.course_id || ""}
                onChange={(e) => setSelectedCourse(courses.find((course) => String(course.course_id) === e.target.value) || null)}
                className="h-10 rounded-md border border-gray-200 bg-[#F4F1EA] px-3 text-sm text-[#0B2A5B]"
              >
                {courses.map((course) => <option key={course.course_id} value={course.course_id}>{course.course_title}</option>)}
              </select>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0B2A5B]/40" size={18} />
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search IB by name, email, or mobile..." className="pl-10 bg-[#F4F1EA]" />
              </div>
            </div>
          </Card>
          <Card className="p-6 bg-white shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader><TableRow className="bg-[#F4F1EA]"><TableHead>IB</TableHead><TableHead>Type</TableHead><TableHead>Value</TableHead><TableHead>Active</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
                <TableBody>
                  {filteredIbRows.map((row) => (
                    <TableRow key={row.ib_id}>
                      <TableCell><p className="font-semibold text-[#0B2A5B]">{row.ib_name || "-"}</p><p className="text-xs text-[#0B2A5B]/60">{row.email || row.mobile || "-"}</p></TableCell>
                      <TableCell>
                        <select
                          value={rowEdits[row.ib_id]?.commission_type || "percentage"}
                          onChange={(e) => setRowEdits({ ...rowEdits, [row.ib_id]: { ...rowEdits[row.ib_id], commission_type: e.target.value } })}
                          className="h-9 rounded-md border border-gray-200 bg-white px-2 text-sm"
                        >
                          <option value="percentage">Percentage</option>
                          <option value="flat">Flat</option>
                        </select>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          value={rowEdits[row.ib_id]?.commission_value ?? 0}
                          onChange={(e) => setRowEdits({ ...rowEdits, [row.ib_id]: { ...rowEdits[row.ib_id], commission_value: Number(e.target.value) } })}
                          className="w-28"
                        />
                      </TableCell>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={Boolean(rowEdits[row.ib_id]?.is_active)}
                          onChange={(e) => setRowEdits({ ...rowEdits, [row.ib_id]: { ...rowEdits[row.ib_id], is_active: e.target.checked } })}
                          className="h-4 w-4"
                        />
                      </TableCell>
                      <TableCell><Button size="sm" onClick={() => saveCommission(row)} className="bg-[#0B2A5B] text-white"><Save size={14} className="mr-2" />Save</Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </>
      )}

      {activeTab === "transactions" && (
        <Card className="p-6 bg-white shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader><TableRow className="bg-[#F4F1EA]"><TableHead>Date</TableHead><TableHead>Student</TableHead><TableHead>Course</TableHead><TableHead>Type</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead><TableHead>Balance</TableHead></TableRow></TableHeader>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>{dateText(tx.created_at)}</TableCell>
                    <TableCell>{tx.student_name || "-"}</TableCell>
                    <TableCell>{tx.course_title || tx.description || "-"}</TableCell>
                    <TableCell><Badge className={tx.transaction_type === "credit" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}>{tx.transaction_type}</Badge></TableCell>
                    <TableCell className="font-semibold">{inr(tx.commission_amount)}</TableCell>
                    <TableCell>{tx.status}</TableCell>
                    <TableCell>{inr(tx.balance_after)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {activeTab === "withdrawals" && (
        <Card className="p-6 bg-white shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader><TableRow className="bg-[#F4F1EA]"><TableHead>IB</TableHead><TableHead>Amount</TableHead><TableHead>Method</TableHead><TableHead>Requested</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {withdrawals.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell><p className="font-semibold text-[#0B2A5B]">{request.ib_name || "-"}</p><p className="text-xs text-[#0B2A5B]/60">{request.upi_id || request.bank_name || "-"}</p></TableCell>
                    <TableCell className="font-bold">{inr(request.amount)}</TableCell>
                    <TableCell>{request.withdrawal_method}</TableCell>
                    <TableCell>{dateText(request.requested_at)}</TableCell>
                    <TableCell><Badge className="bg-gray-100 text-gray-700">{request.status}</Badge></TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        {request.status === "pending" && <Button size="sm" variant="outline" onClick={() => updateWithdrawal(request, "approve")}>Approve</Button>}
                        {["pending", "approved"].includes(request.status) && <Button size="sm" variant="outline" onClick={() => updateWithdrawal(request, "reject")}>Reject</Button>}
                        {["pending", "approved"].includes(request.status) && <Button size="sm" onClick={() => setPayingRequest(request)} className="bg-[#0B2A5B] text-white">Mark Paid</Button>}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {activeTab === "reports" && (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5 bg-white shadow-lg"><p className="text-sm text-[#0B2A5B]/60">IB Sales</p><p className="text-2xl font-bold text-[#0B2A5B]">{inr(commissionReport?.total_sales)}</p></Card>
          <Card className="p-5 bg-white shadow-lg"><p className="text-sm text-[#0B2A5B]/60">Commission Earned</p><p className="text-2xl font-bold text-green-700">{inr(commissionReport?.total_commission)}</p></Card>
          <Card className="p-5 bg-white shadow-lg"><p className="text-sm text-[#0B2A5B]/60">Withdrawals Paid</p><p className="text-2xl font-bold text-[#0B2A5B]">{inr(withdrawalReport?.paid_amount)}</p></Card>
          <Card className="p-5 bg-white shadow-lg"><p className="text-sm text-[#0B2A5B]/60">Pending Withdrawal</p><p className="text-2xl font-bold text-orange-700">{inr(withdrawalReport?.pending_amount)}</p></Card>
        </div>
      )}

      {payingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-lg p-6 bg-white shadow-xl relative">
            <button onClick={() => setPayingRequest(null)} className="absolute top-4 right-4 text-gray-500 hover:text-black"><X size={20} /></button>
            <h2 className="text-2xl font-bold text-[#0B2A5B] mb-1">Mark Withdrawal Paid</h2>
            <p className="text-sm text-[#0B2A5B]/60 mb-5">{payingRequest.ib_name} - {inr(payingRequest.amount)}</p>
            <form onSubmit={markPaid} className="space-y-4">
              <div><label className="text-sm font-medium text-[#0B2A5B]">UTR Number</label><Input value={paidForm.utr_number} onChange={(e) => setPaidForm({ ...paidForm, utr_number: e.target.value })} className="mt-1 bg-[#F4F1EA]" /></div>
              <div><label className="text-sm font-medium text-[#0B2A5B]">Transaction Reference</label><Input value={paidForm.transaction_reference} onChange={(e) => setPaidForm({ ...paidForm, transaction_reference: e.target.value })} className="mt-1 bg-[#F4F1EA]" /></div>
              <div><label className="text-sm font-medium text-[#0B2A5B]">Payment Proof</label><Input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setPaidForm({ ...paidForm, proof_file: e.target.files?.[0] || null })} className="mt-1 bg-[#F4F1EA]" /></div>
              <Button type="submit" className="w-full bg-[#0B2A5B] text-white hover:bg-[#163b75]">Confirm Payment</Button>
            </form>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}
