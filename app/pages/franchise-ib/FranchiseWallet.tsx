import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import api from "../../services/api";
import { IndianRupee, Landmark, Upload, Wallet, Clock, CheckCircle2, XCircle, ArrowUpRight, Building2 } from "lucide-react";
import { toast } from "sonner";

const inr = (value: number | string | null | undefined) =>
  `₹${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

const dateText = (value?: string) => (value ? new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "-");

const emptyForm = {
  amount: "",
  withdrawal_method: "bank",
  account_holder_name: "",
  bank_name: "",
  account_number: "",
  confirm_account_number: "",
  ifsc_code: "",
  upi_id: "",
  qr_code_image: "",
};

export default function FranchiseWallet() {
  const [summary, setSummary] = useState<any>(null);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadWallet = async () => {
    try {
      setLoading(true);
      const [summaryRes, withdrawalRes] = await Promise.all([
        api.get("/franchise-ibs/wallet"),
        api.get("/franchise-ibs/withdrawals"),
      ]);
      setSummary(summaryRes.data);
      setWithdrawals(withdrawalRes.data || []);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to load wallet data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWallet();
  }, []);

  const uploadQr = async (file?: File) => {
    if (!file) return;
    const data = new FormData();
    data.append("file", file);
    try {
      toast("Uploading QR code...", { id: "qr-toast" });
      const res = await api.post("/franchise-ibs/withdrawals/qr-upload", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setForm({ ...form, qr_code_image: res.data.url });
      toast.success("QR code uploaded successfully.", { id: "qr-toast" });
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to upload QR code.", { id: "qr-toast" });
    }
  };

  const submitWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/franchise-ibs/withdrawals", {
        ...form,
        amount: Number(form.amount),
        bank_name: form.withdrawal_method === "bank" ? form.bank_name : undefined,
        account_holder_name: form.withdrawal_method === "bank" ? form.account_holder_name : undefined,
        account_number: form.withdrawal_method === "bank" ? form.account_number : undefined,
        confirm_account_number: form.withdrawal_method === "bank" ? form.confirm_account_number : undefined,
        ifsc_code: form.withdrawal_method === "bank" ? form.ifsc_code : undefined,
        upi_id: form.withdrawal_method === "upi" ? form.upi_id : undefined,
        qr_code_image: form.withdrawal_method === "upi" ? form.qr_code_image : undefined,
      });
      toast.success("Withdrawal request submitted successfully!");
      setForm(emptyForm);
      loadWallet();
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      toast.error(Array.isArray(detail) ? detail[0]?.msg : detail || "Failed to submit withdrawal request.");
    } finally {
      setSubmitting(false);
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-blue-100 text-blue-800 border-none font-semibold">Approved</Badge>;
      case "paid":
        return <Badge className="bg-emerald-100 text-emerald-800 border-none font-semibold"><CheckCircle2 size={12} className="mr-1 inline" /> Paid</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 border-none font-semibold"><XCircle size={12} className="mr-1 inline" /> Rejected</Badge>;
      default:
        return <Badge className="bg-amber-100 text-amber-800 border-none font-semibold"><Clock size={12} className="mr-1 inline" /> Pending Review</Badge>;
    }
  };

  return (
    <DashboardLayout role="franchise_ib">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-[#0B2A5B] tracking-tight flex items-center gap-3">
          <Wallet className="w-8 h-8 text-[#C2A86A]" />
          Wallet & Withdrawals
        </h1>
        <p className="text-[#0B2A5B]/70 mt-1">
          Withdraw your generated revenue, manage bank details, and track payout status.
        </p>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
        <Card className="p-6 bg-[#0B2A5B] text-white shadow-lg rounded-2xl relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/5 rounded-full blur-xl" />
          <p className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-1">Available for Withdrawal</p>
          <p className="text-3xl font-black text-[#C2A86A]">{inr(summary?.available_balance)}</p>
          <p className="text-[11px] text-white/50 mt-2">Ready to payout</p>
        </Card>

        <Card className="p-6 bg-white shadow-md rounded-2xl border border-gray-100">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Revenue Earned</p>
          <p className="text-3xl font-black text-emerald-600">{inr(summary?.total_earned)}</p>
          <p className="text-[11px] text-gray-400 mt-2">All-time gross revenue</p>
        </Card>

        <Card className="p-6 bg-white shadow-md rounded-2xl border border-gray-100">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Paid Out</p>
          <p className="text-3xl font-black text-blue-700">{inr(summary?.total_withdrawn)}</p>
          <p className="text-[11px] text-gray-400 mt-2">Processed payouts</p>
        </Card>

        <Card className="p-6 bg-white shadow-md rounded-2xl border border-gray-100">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Pending Requests</p>
          <p className="text-3xl font-black text-amber-600">{inr(summary?.pending_withdrawals)}</p>
          <p className="text-[11px] text-gray-400 mt-2">Under review by Superadmin</p>
        </Card>
      </div>

      {/* Main Grid: Request Form + Info */}
      <div className="grid lg:grid-cols-[450px_1fr] gap-8 mb-8">
        {/* Request Withdrawal Form */}
        <Card className="p-6 bg-white shadow-xl rounded-2xl border border-gray-100">
          <div className="flex items-center gap-2 mb-6">
            <Landmark className="text-[#0B2A5B]" size={22} />
            <h2 className="text-xl font-bold text-[#0B2A5B]">Request Withdrawal</h2>
          </div>

          <form onSubmit={submitWithdrawal} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-[#0B2A5B] uppercase tracking-wider">Amount (₹)</label>
              <Input
                required
                min="500"
                type="number"
                placeholder="Enter amount to withdraw"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="mt-1.5 bg-[#F4F1EA] border-none font-semibold text-lg"
              />
              <span className="text-[11px] text-gray-400">Min withdrawal: ₹500</span>
            </div>

            <div>
              <label className="text-xs font-bold text-[#0B2A5B] uppercase tracking-wider">Payout Method</label>
              <select
                value={form.withdrawal_method}
                onChange={(e) => setForm({ ...form, withdrawal_method: e.target.value })}
                className="mt-1.5 h-11 w-full rounded-xl border-none bg-[#F4F1EA] px-3 text-sm font-semibold text-[#0B2A5B] focus:ring-2 focus:ring-[#0B2A5B]"
              >
                <option value="bank">🏦 Bank Transfer (NEFT/RTGS/IMPS)</option>
                <option value="upi">📱 UPI / QR Code</option>
              </select>
            </div>

            {form.withdrawal_method === "bank" ? (
              <div className="space-y-3 pt-2">
                <div>
                  <label className="text-xs font-semibold text-[#0B2A5B]">Account Holder Name</label>
                  <Input required placeholder="Name on bank account" value={form.account_holder_name} onChange={(e) => setForm({ ...form, account_holder_name: e.target.value })} className="mt-1 bg-[#F4F1EA] border-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#0B2A5B]">Bank Name</label>
                  <Input required placeholder="HDFC, SBI, ICICI, etc." value={form.bank_name} onChange={(e) => setForm({ ...form, bank_name: e.target.value })} className="mt-1 bg-[#F4F1EA] border-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#0B2A5B]">Account Number</label>
                  <Input required placeholder="Enter bank account number" value={form.account_number} onChange={(e) => setForm({ ...form, account_number: e.target.value })} className="mt-1 bg-[#F4F1EA] border-none font-mono" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#0B2A5B]">Confirm Account Number</label>
                  <Input required placeholder="Re-enter account number" value={form.confirm_account_number} onChange={(e) => setForm({ ...form, confirm_account_number: e.target.value })} className="mt-1 bg-[#F4F1EA] border-none font-mono" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#0B2A5B]">IFSC Code</label>
                  <Input required placeholder="HDFC0001234" value={form.ifsc_code} onChange={(e) => setForm({ ...form, ifsc_code: e.target.value.toUpperCase() })} className="mt-1 bg-[#F4F1EA] border-none font-mono uppercase" />
                </div>
              </div>
            ) : (
              <div className="space-y-3 pt-2">
                <div>
                  <label className="text-xs font-semibold text-[#0B2A5B]">UPI ID</label>
                  <Input placeholder="username@upi / mobile@ybl" value={form.upi_id} onChange={(e) => setForm({ ...form, upi_id: e.target.value })} className="mt-1 bg-[#F4F1EA] border-none font-mono" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#0B2A5B]">Upload QR Code Image</label>
                  <Input type="file" accept=".jpg,.jpeg,.png" onChange={(e) => uploadQr(e.target.files?.[0])} className="mt-1 bg-[#F4F1EA] border-none text-xs" />
                  {form.qr_code_image && (
                    <p className="mt-2 text-xs text-emerald-700 flex items-center gap-1 font-semibold">
                      <Upload size={13} /> QR Code Uploaded
                    </p>
                  )}
                </div>
              </div>
            )}

            <Button
              type="submit"
              disabled={submitting || (summary?.available_balance || 0) < 500}
              className="w-full bg-[#0B2A5B] text-white hover:bg-[#163b75] rounded-xl h-12 font-bold text-sm mt-4 shadow-lg shadow-[#0B2A5B]/20"
            >
              {submitting ? "Submitting Request..." : "Submit Withdrawal Request"}
            </Button>
          </form>
        </Card>

        {/* Info & Policy Card */}
        <div className="space-y-6">
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50/50 border border-blue-100 rounded-2xl">
            <h3 className="font-bold text-[#0B2A5B] text-base mb-3 flex items-center gap-2">
              <Building2 size={18} className="text-blue-600" /> Payout Policy & Guidelines
            </h3>
            <ul className="space-y-2.5 text-xs text-[#0B2A5B]/80 font-medium">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                Requests are processed within 24-48 business hours by Superadmin.
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                Minimum payout amount is ₹500 per transaction.
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                Ensure your bank account / UPI details match your verified KYC profile.
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                Once paid, the UTR / reference transaction receipt will be uploaded here.
              </li>
            </ul>
          </Card>
        </div>
      </div>

      {/* Withdrawal History Table */}
      <Card className="p-6 bg-white shadow-lg rounded-2xl border border-gray-100 overflow-hidden">
        <h2 className="text-xl font-bold text-[#0B2A5B] mb-5 flex items-center gap-2">
          <ArrowUpRight className="text-[#0B2A5B]" size={20} /> Withdrawal History
        </h2>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#F4F1EA]">
                <TableHead className="font-bold text-[#0B2A5B]">Requested Date</TableHead>
                <TableHead className="font-bold text-[#0B2A5B]">Amount</TableHead>
                <TableHead className="font-bold text-[#0B2A5B]">Method</TableHead>
                <TableHead className="font-bold text-[#0B2A5B]">Status</TableHead>
                <TableHead className="font-bold text-[#0B2A5B]">Remarks / Proof</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {withdrawals.map((request) => (
                <TableRow key={request.id} className="hover:bg-slate-50/50">
                  <TableCell className="font-semibold text-gray-700">{dateText(request.requested_at)}</TableCell>
                  <TableCell className="font-black text-gray-900 text-base">{inr(request.amount)}</TableCell>
                  <TableCell>
                    <span className="font-semibold text-xs capitalize text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">
                      {request.withdrawal_method === "bank" ? "🏦 Bank" : "📱 UPI"}
                    </span>
                  </TableCell>
                  <TableCell>{statusBadge(request.status)}</TableCell>
                  <TableCell className="text-xs text-gray-500">
                    {request.admin_remarks && <div>{request.admin_remarks}</div>}
                    {request.utr_number && <div className="font-mono text-gray-700 mt-0.5">UTR: {request.utr_number}</div>}
                    {request.payment_proof && (
                      <a
                        href={request.payment_proof.startsWith("http") ? request.payment_proof : `${api.defaults.baseURL?.replace(/\/api$/, "") || ""}${request.payment_proof}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block mt-1 text-blue-600 underline text-[11px] font-semibold"
                      >
                        View Proof Receipt ↗
                      </a>
                    )}
                    {!request.admin_remarks && !request.utr_number && !request.payment_proof && "—"}
                  </TableCell>
                </TableRow>
              ))}
              {withdrawals.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-gray-400 font-medium">
                    No withdrawal requests submitted yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </DashboardLayout>
  );
}
