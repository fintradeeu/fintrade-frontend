import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import api from "../../services/api";
import { CreditCard, IndianRupee, Landmark, Upload } from "lucide-react";
import { toast } from "sonner";

const inr = (value: number | string | null | undefined) =>
  `INR ${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

const dateText = (value?: string) => value ? new Date(value).toLocaleDateString("en-IN") : "-";

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

export default function DistributorWallet() {
  const [summary, setSummary] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const loadWallet = async () => {
    try {
      const [summaryRes, txRes, withdrawalRes] = await Promise.all([
        api.get("/distributor/wallet"),
        api.get("/distributor/wallet/transactions"),
        api.get("/distributor/withdrawals"),
      ]);
      setSummary(summaryRes.data);
      setTransactions(txRes.data || []);
      setWithdrawals(withdrawalRes.data || []);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to load wallet.");
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
      const res = await api.post("/distributor/withdrawals/qr-upload", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setForm({ ...form, qr_code_image: res.data.url });
      toast.success("QR code uploaded.");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to upload QR code.");
    }
  };

  const submitWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/distributor/withdrawals", {
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
      toast.success("Withdrawal request submitted.");
      setForm(emptyForm);
      loadWallet();
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      toast.error(Array.isArray(detail) ? detail[0]?.msg : detail || "Failed to submit withdrawal.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout role="distributor">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#0B2A5B] mb-2">Wallet</h1>
        <p className="text-[#0B2A5B]/70">Review commissions, wallet balance, and withdrawal requests.</p>
      </div>

      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <Card className="p-5 bg-[#0B2A5B] text-white shadow-lg"><p className="text-sm text-white/70">Available Balance</p><p className="text-2xl font-bold text-[#C2A86A]">{inr(summary?.available_balance)}</p></Card>
        <Card className="p-5 bg-white shadow-lg"><p className="text-sm text-[#0B2A5B]/60">Total Earned</p><p className="text-2xl font-bold text-green-700">{inr(summary?.total_earned)}</p></Card>
        <Card className="p-5 bg-white shadow-lg"><p className="text-sm text-[#0B2A5B]/60">Withdrawn</p><p className="text-2xl font-bold text-[#0B2A5B]">{inr(summary?.total_withdrawn)}</p></Card>
        <Card className="p-5 bg-white shadow-lg"><p className="text-sm text-[#0B2A5B]/60">Pending</p><p className="text-2xl font-bold text-orange-700">{inr(summary?.pending_withdrawals)}</p></Card>
      </div>

      <div className="grid lg:grid-cols-[420px_1fr] gap-6 mb-6">
        <Card className="p-6 bg-white shadow-lg">
          <div className="flex items-center gap-2 mb-5">
            <Landmark className="text-[#0B2A5B]" size={20} />
            <h2 className="text-xl font-bold text-[#0B2A5B]">Request Withdrawal</h2>
          </div>
          <form onSubmit={submitWithdrawal} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-[#0B2A5B]">Amount</label>
              <Input required min="500" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="mt-1 bg-[#F4F1EA]" />
            </div>
            <div>
              <label className="text-sm font-medium text-[#0B2A5B]">Method</label>
              <select value={form.withdrawal_method} onChange={(e) => setForm({ ...form, withdrawal_method: e.target.value })} className="mt-1 h-10 w-full rounded-md border border-gray-200 bg-[#F4F1EA] px-3 text-sm text-[#0B2A5B]">
                <option value="bank">Bank Transfer</option>
                <option value="upi">UPI</option>
              </select>
            </div>
            {form.withdrawal_method === "bank" ? (
              <>
                <div><label className="text-sm font-medium text-[#0B2A5B]">Account Holder</label><Input required value={form.account_holder_name} onChange={(e) => setForm({ ...form, account_holder_name: e.target.value })} className="mt-1 bg-[#F4F1EA]" /></div>
                <div><label className="text-sm font-medium text-[#0B2A5B]">Bank Name</label><Input required value={form.bank_name} onChange={(e) => setForm({ ...form, bank_name: e.target.value })} className="mt-1 bg-[#F4F1EA]" /></div>
                <div><label className="text-sm font-medium text-[#0B2A5B]">Account Number</label><Input required value={form.account_number} onChange={(e) => setForm({ ...form, account_number: e.target.value })} className="mt-1 bg-[#F4F1EA]" /></div>
                <div><label className="text-sm font-medium text-[#0B2A5B]">Confirm Account Number</label><Input required value={form.confirm_account_number} onChange={(e) => setForm({ ...form, confirm_account_number: e.target.value })} className="mt-1 bg-[#F4F1EA]" /></div>
                <div><label className="text-sm font-medium text-[#0B2A5B]">IFSC Code</label><Input required value={form.ifsc_code} onChange={(e) => setForm({ ...form, ifsc_code: e.target.value.toUpperCase() })} className="mt-1 bg-[#F4F1EA]" /></div>
              </>
            ) : (
              <>
                <div><label className="text-sm font-medium text-[#0B2A5B]">UPI ID</label><Input value={form.upi_id} onChange={(e) => setForm({ ...form, upi_id: e.target.value })} className="mt-1 bg-[#F4F1EA]" /></div>
                <div>
                  <label className="text-sm font-medium text-[#0B2A5B]">QR Code</label>
                  <Input type="file" accept=".jpg,.jpeg,.png" onChange={(e) => uploadQr(e.target.files?.[0])} className="mt-1 bg-[#F4F1EA]" />
                  {form.qr_code_image && <p className="mt-2 text-xs text-green-700 flex items-center gap-1"><Upload size={12} /> QR code ready</p>}
                </div>
              </>
            )}
            <Button type="submit" disabled={submitting} className="w-full bg-[#0B2A5B] text-white hover:bg-[#163b75]">
              {submitting ? "Submitting..." : "Submit Request"}
            </Button>
          </form>
        </Card>

        <Card className="p-6 bg-white shadow-lg overflow-hidden">
          <div className="flex items-center gap-2 mb-5">
            <CreditCard className="text-[#0B2A5B]" size={20} />
            <h2 className="text-xl font-bold text-[#0B2A5B]">Wallet Transactions</h2>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader><TableRow className="bg-[#F4F1EA]"><TableHead>Date</TableHead><TableHead>Course</TableHead><TableHead>Type</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead><TableHead>Balance</TableHead></TableRow></TableHeader>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>{dateText(tx.created_at)}</TableCell>
                    <TableCell>{tx.course_title || tx.description || "-"}</TableCell>
                    <TableCell><Badge className={tx.transaction_type === "credit" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}>{tx.transaction_type}</Badge></TableCell>
                    <TableCell className="font-semibold">{inr(tx.commission_amount)}</TableCell>
                    <TableCell>{tx.status}</TableCell>
                    <TableCell>{inr(tx.balance_after)}</TableCell>
                  </TableRow>
                ))}
                {transactions.length === 0 && <TableRow><TableCell colSpan={6} className="py-8 text-center text-[#0B2A5B]/60">No wallet transactions yet.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      <Card className="p-6 bg-white shadow-lg overflow-hidden">
        <h2 className="text-xl font-bold text-[#0B2A5B] mb-5">Withdrawal History</h2>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader><TableRow className="bg-[#F4F1EA]"><TableHead>Date</TableHead><TableHead>Amount</TableHead><TableHead>Method</TableHead><TableHead>Status</TableHead><TableHead>Remarks</TableHead></TableRow></TableHeader>
            <TableBody>
              {withdrawals.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>{dateText(request.requested_at)}</TableCell>
                  <TableCell className="font-bold">{inr(request.amount)}</TableCell>
                  <TableCell>{request.withdrawal_method}</TableCell>
                  <TableCell><Badge className="bg-gray-100 text-gray-700">{request.status}</Badge></TableCell>
                  <TableCell>{request.admin_remarks || "-"}</TableCell>
                </TableRow>
              ))}
              {withdrawals.length === 0 && <TableRow><TableCell colSpan={5} className="py-8 text-center text-[#0B2A5B]/60">No withdrawal requests yet.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </div>
      </Card>
    </DashboardLayout>
  );
}
