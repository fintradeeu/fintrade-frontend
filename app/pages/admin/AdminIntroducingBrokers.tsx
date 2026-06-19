import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import api from "../../services/api";
import { Copy, Eye, Pencil, Plus, Search, X } from "lucide-react";
import { toast } from "sonner";

const emptyForm = {
  full_name: "",
  email: "",
  phone: "",
  city: "",
  password: "",
  region: "",
  referral_code: "",
  discount_percentage: 10,
};

export default function AdminIntroducingBrokers() {
  const [brokers, setBrokers] = useState<any[]>([]);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [selectedBroker, setSelectedBroker] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [referralsLoading, setReferralsLoading] = useState(false);
  const [showReferrals, setShowReferrals] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const fetchBrokers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/distributors");
      setBrokers(res.data || []);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to load IB accounts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrokers();
  }, []);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return brokers;
    return brokers.filter((broker) =>
      [broker.user_name, broker.user_email, broker.region, broker.referral_code]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q))
    );
  }, [brokers, searchTerm]);

  const totals = useMemo(() => {
    return brokers.reduce(
      (acc, broker) => ({
        students: acc.students + (broker.total_students_referred || 0),
        revenue: acc.revenue + (broker.total_revenue_generated || 0),
      }),
      { students: 0, revenue: 0 }
    );
  }, [brokers]);

  const copyReferralLink = (code: string) => {
    const link = `${window.location.origin}/register?ref=${code}`;
    navigator.clipboard.writeText(link);
    toast.success("Referral link copied.");
  };

  const openReferrals = async (broker: any) => {
    setSelectedBroker(broker);
    setShowReferrals(true);
    setReferrals([]);
    setReferralsLoading(true);
    try {
      const res = await api.get(`/admin/distributors/${broker.id}/referrals`);
      setReferrals(res.data || []);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to load referrals.");
    } finally {
      setReferralsLoading(false);
    }
  };

  const openCreate = () => {
    setForm(emptyForm);
    setShowCreate(true);
  };

  const openEdit = (broker: any) => {
    setSelectedBroker(broker);
    setForm({
      full_name: broker.user_name || "",
      email: broker.user_email || "",
      phone: broker.phone || "",
      city: broker.city || "",
      password: "",
      region: broker.region || "",
      referral_code: broker.referral_code || "",
      discount_percentage: broker.discount_percentage ?? 10,
    });
    setShowEdit(true);
  };

  const createBroker = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/admin/users/create-distributor", {
        email: form.email,
        full_name: form.full_name,
        password: form.password,
        phone: form.phone || undefined,
        city: form.city || undefined,
        region: form.region,
        referral_code: form.referral_code.trim() || undefined,
        discount_percentage: Number(form.discount_percentage),
      });
      toast.success("IB account created.");
      setShowCreate(false);
      fetchBrokers();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to create IB account.");
    } finally {
      setSaving(false);
    }
  };

  const updateBroker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBroker) return;
    setSaving(true);
    try {
      await api.put(`/admin/users/${selectedBroker.user_id}`, {
        email: form.email,
        full_name: form.full_name,
        phone: form.phone || null,
        city: form.city || null,
        region: form.region,
        referral_code: form.referral_code,
        discount_percentage: Number(form.discount_percentage),
      });
      toast.success("IB account updated.");
      setShowEdit(false);
      fetchBrokers();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to update IB account.");
    } finally {
      setSaving(false);
    }
  };

  const formMarkup = (mode: "create" | "edit") => (
    <form onSubmit={mode === "create" ? createBroker : updateBroker} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="text-sm font-medium text-[#0B2A5B]">Full Name *</label><Input required value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} className="mt-1 bg-[#F4F1EA]" /></div>
        <div><label className="text-sm font-medium text-[#0B2A5B]">Email *</label><Input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="mt-1 bg-[#F4F1EA]" /></div>
        <div><label className="text-sm font-medium text-[#0B2A5B]">Phone</label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="mt-1 bg-[#F4F1EA]" /></div>
        <div><label className="text-sm font-medium text-[#0B2A5B]">City</label><Input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className="mt-1 bg-[#F4F1EA]" /></div>
        {mode === "create" && <div><label className="text-sm font-medium text-[#0B2A5B]">Password *</label><Input required type="password" minLength={8} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="mt-1 bg-[#F4F1EA]" /></div>}
        <div><label className="text-sm font-medium text-[#0B2A5B]">Region *</label><Input required value={form.region} onChange={e => setForm({ ...form, region: e.target.value })} className="mt-1 bg-[#F4F1EA]" /></div>
        <div><label className="text-sm font-medium text-[#0B2A5B]">Referral Code {mode === "create" ? "" : "*"}</label><Input required={mode === "edit"} value={form.referral_code} onChange={e => setForm({ ...form, referral_code: e.target.value })} placeholder="Auto-generated if blank" className="mt-1 bg-[#F4F1EA]" /></div>
        <div><label className="text-sm font-medium text-[#0B2A5B]">Discount % *</label><Input required type="number" min="0" max="100" value={form.discount_percentage} onChange={e => setForm({ ...form, discount_percentage: Number(e.target.value) })} className="mt-1 bg-[#F4F1EA]" /></div>
      </div>
      <Button type="submit" disabled={saving} className="w-full bg-[#0B2A5B] text-white hover:bg-[#1a3d7a]">
        {saving ? "Saving..." : mode === "create" ? "Create IB Account" : "Save Changes"}
      </Button>
    </form>
  );

  return (
    <DashboardLayout role="super_admin">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#0B2A5B] mb-2">IB Management</h1>
          <p className="text-[#0B2A5B]/70">Manage Introducing Brokers and review their referrals.</p>
        </div>
        <Button onClick={openCreate} className="bg-[#0B2A5B] text-white hover:bg-[#1a3d7a]">
          <Plus size={16} className="mr-2" /> Add IB
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4 bg-[#0B2A5B] text-[#F4F1EA] shadow-lg"><p className="text-xs uppercase text-[#F4F1EA]/70">Total IBs</p><p className="text-2xl font-bold text-[#C2A86A]">{brokers.length}</p></Card>
        <Card className="p-4 bg-white shadow-lg"><p className="text-xs uppercase text-[#0B2A5B]/60">Referred Students</p><p className="text-2xl font-bold text-[#0B2A5B]">{totals.students}</p></Card>
        <Card className="p-4 bg-white shadow-lg"><p className="text-xs uppercase text-[#0B2A5B]/60">Revenue Generated</p><p className="text-2xl font-bold text-green-700">₹{totals.revenue.toLocaleString("en-IN")}</p></Card>
        <Card className="p-4 bg-white shadow-lg"><p className="text-xs uppercase text-[#0B2A5B]/60">Avg Discount</p><p className="text-2xl font-bold text-[#0B2A5B]">{brokers.length ? Math.round(brokers.reduce((s, b) => s + (b.discount_percentage || 0), 0) / brokers.length) : 0}%</p></Card>
      </div>

      <Card className="p-6 bg-white shadow-lg mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0B2A5B]/40" size={20} />
          <Input placeholder="Search by IB name, email, region, or referral code..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 bg-[#F4F1EA]" />
        </div>
      </Card>

      <Card className="p-6 bg-white shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#F4F1EA]">
                <TableHead className="text-[#0B2A5B]">IB</TableHead>
                <TableHead className="text-[#0B2A5B]">Region</TableHead>
                <TableHead className="text-[#0B2A5B]">Referral Code</TableHead>
                <TableHead className="text-[#0B2A5B]">Discount</TableHead>
                <TableHead className="text-[#0B2A5B]">Students</TableHead>
                <TableHead className="text-[#0B2A5B]">Revenue</TableHead>
                <TableHead className="text-[#0B2A5B]">Joined</TableHead>
                <TableHead className="text-[#0B2A5B]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((broker) => (
                <TableRow key={broker.id} className="hover:bg-[#F4F1EA]/50">
                  <TableCell><p className="font-semibold text-[#0B2A5B]">{broker.user_name}</p><p className="text-xs text-[#0B2A5B]/60">{broker.user_email}</p></TableCell>
                  <TableCell className="text-[#0B2A5B]">{broker.region}</TableCell>
                  <TableCell><Badge className="bg-orange-100 text-orange-700 font-mono">{broker.referral_code}</Badge></TableCell>
                  <TableCell className="text-[#0B2A5B] font-semibold">{broker.discount_percentage}%</TableCell>
                  <TableCell className="text-[#0B2A5B] font-bold">{broker.total_students_referred || 0}</TableCell>
                  <TableCell className="text-green-700 font-bold">₹{(broker.total_revenue_generated || 0).toLocaleString("en-IN")}</TableCell>
                  <TableCell className="text-[#0B2A5B] text-sm">{new Date(broker.created_at).toLocaleDateString("en-IN")}</TableCell>
                  <TableCell>
                    <div className="flex gap-1.5">
                      <Button size="sm" variant="outline" onClick={() => openReferrals(broker)} title="View referrals"><Eye size={14} /></Button>
                      <Button size="sm" variant="outline" onClick={() => openEdit(broker)} title="Edit IB"><Pencil size={14} /></Button>
                      <Button size="sm" variant="outline" onClick={() => copyReferralLink(broker.referral_code)} title="Copy referral link"><Copy size={14} /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && !loading && <TableRow><TableCell colSpan={8} className="py-8 text-center text-[#0B2A5B]/60">No IB accounts found</TableCell></TableRow>}
            </TableBody>
          </Table>
        </div>
      </Card>

      {showCreate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl p-6 bg-white shadow-xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowCreate(false)} className="absolute top-4 right-4 text-gray-500 hover:text-black"><X size={20} /></button>
            <h2 className="text-2xl font-bold text-[#0B2A5B] mb-6">Create IB Account</h2>
            {formMarkup("create")}
          </Card>
        </div>
      )}

      {showEdit && selectedBroker && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl p-6 bg-white shadow-xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowEdit(false)} className="absolute top-4 right-4 text-gray-500 hover:text-black"><X size={20} /></button>
            <h2 className="text-2xl font-bold text-[#0B2A5B] mb-6">Edit IB Account</h2>
            {formMarkup("edit")}
          </Card>
        </div>
      )}

      {showReferrals && selectedBroker && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-3xl p-6 bg-white shadow-xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowReferrals(false)} className="absolute top-4 right-4 text-gray-500 hover:text-black"><X size={20} /></button>
            <h2 className="text-2xl font-bold text-[#0B2A5B] mb-1">{selectedBroker.user_name}</h2>
            <p className="text-sm text-[#0B2A5B]/60 mb-6">Referral code: {selectedBroker.referral_code}</p>
            {referralsLoading ? (
              <div className="py-12 text-center text-[#0B2A5B]/60">Loading referrals...</div>
            ) : referrals.length === 0 ? (
              <div className="py-12 text-center text-[#0B2A5B]/60 border border-dashed rounded-lg bg-gray-50">No referred students yet.</div>
            ) : (
              <Table>
                <TableHeader><TableRow className="bg-[#F4F1EA]"><TableHead>Student</TableHead><TableHead>Email</TableHead><TableHead>Course</TableHead><TableHead>Referral Date</TableHead></TableRow></TableHeader>
                <TableBody>
                  {referrals.map((referral) => (
                    <TableRow key={referral.id}>
                      <TableCell className="font-semibold text-[#0B2A5B]">{referral.student_name || "—"}</TableCell>
                      <TableCell>{referral.student_email || "—"}</TableCell>
                      <TableCell>{referral.course_title || "Pending Enrollment"}</TableCell>
                      <TableCell>{new Date(referral.created_at).toLocaleDateString("en-IN")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}
