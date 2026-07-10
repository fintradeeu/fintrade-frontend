import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import DashboardLayout from "../../components/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Plus, Edit, Trash2, Tag, IndianRupee, TrendingUp, Users, Lock, ShieldAlert, Download } from "lucide-react";
import { Badge } from "../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import api from "../../services/api";
import { confirmPopup } from "../../utils/popup";

interface Offer {
  id: number;
  title: string;
  code: string;
  discount_type: string;
  discount_value: number;
  description: string;
  valid_until: string;
  is_active: boolean;
  usage_count: number;
  created_at: string;
}

  const CouponForm = ({ onSubmit, submitLabel, formData, setFormData }: { onSubmit: () => void; submitLabel: string; formData: any; setFormData: any }) => (
    <div className="space-y-4">
      <div>
        <Label>Coupon Title *</Label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="New Year Sale 2026"
          className="mt-2"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Coupon Code *</Label>
          <Input
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
            placeholder="SAVE30"
            className="mt-2 uppercase"
          />
        </div>

        <div>
          <Label>Discount Percentage (%) *</Label>
          <Input
            type="number"
            value={formData.discount_value || ""}
            onChange={(e) => setFormData({ ...formData, discount_value: Number(e.target.value) })}
            placeholder="30"
            className="mt-2"
            min="0"
            max="100"
          />
        </div>
      </div>

      <div>
        <Label>Description</Label>
        <Input
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="New Year Sale"
          className="mt-2"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Expiry Date *</Label>
          <Input
            type="date"
            value={formData.valid_until}
            onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
            className="mt-2"
          />
        </div>

        <div>
          <Label>Status *</Label>
          <Select 
            value={formData.is_active ? "Active" : "Disabled"} 
            onValueChange={(value) => setFormData({ ...formData, is_active: value === "Active" })}
          >
            <SelectTrigger className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Disabled">Disabled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <Button 
          onClick={onSubmit} 
          className="flex-1"
          style={{ background: '#D50032', color: 'white' }}
        >
          {submitLabel}
        </Button>
      </div>
    </div>
  );

export default function AdminPayments() {
  const navigate = useNavigate();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [checkingRole, setCheckingRole] = useState(true);
  const [coupons, setCoupons] = useState<Offer[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("coupons");
  const [selectedAmountMetric, setSelectedAmountMetric] = useState<"total_amount" | "total_fees" | "total_gst" | "total_paid">("total_paid");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Offer | null>(null);
  const [stats, setStats] = useState({ 
    active_coupons: 0, 
    total_usage: 0,
    total_amount: "â‚¹0.00",
    total_fees: "â‚¹0.00",
    total_gst: "â‚¹0.00",
    total_paid: "â‚¹0.00",
    total_revenue: "â‚¹0.00",
    monthly_revenue: "â‚¹0.00"
  });

  const canViewRevenue = isSuperAdmin;

  const [formData, setFormData] = useState({
    title: "",
    code: "",
    discount_type: "percentage",
    discount_value: 0,
    description: "",
    valid_until: "",
    is_active: true
  });

  const [isOfflineActionDialogOpen, setIsOfflineActionDialogOpen] = useState(false);
  const [selectedOfflineTransaction, setSelectedOfflineTransaction] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const fetchTransactions = async () => {
    try {
      const res = await api.get("/admin/revenue/details");
      setTransactions(res.data);
    } catch (err) {
      console.error("Failed to load transactions", err);
    }
  };

  const fetchCoupons = async (isSuper: boolean) => {
    try {
      const res = await api.get("/admin/offers");
      setCoupons(res.data);
      const statRes = await api.get("/admin/offers/stats");
      
      let revStats = { total_revenue: "â‚¹0.00", monthly_revenue: "â‚¹0.00" };
      if (isSuper) {
        try {
          const revRes = await api.get("/admin/revenue/stats");
          revStats = revRes.data;
          fetchTransactions();
        } catch (err) {
          console.error("Failed to fetch revenue stats", err);
        }
      }
      
      setStats({
        active_coupons: statRes.data.active_coupons || 0,
        total_usage: statRes.data.total_usage || 0,
        total_amount: (revStats as any).total_amount || "â‚¹0.00",
        total_fees: (revStats as any).total_fees || "â‚¹0.00",
        total_gst: (revStats as any).total_gst || "â‚¹0.00",
        total_paid: (revStats as any).total_paid || "â‚¹0.00",
        total_revenue: revStats.total_revenue,
        monthly_revenue: revStats.monthly_revenue,
      });
    } catch (err) {
      console.error(err);
    }
  };



  useEffect(() => {
    let isSuper = false;
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        const parsed = JSON.parse(stored);
        isSuper = parsed?.roles?.some((r: any) => r.name === "super_admin");
        setIsSuperAdmin(isSuper);
        if (!isSuper) {
          navigate("/admin/dashboard");
          return;
        }
      } else {
        navigate("/admin/dashboard");
        return;
      }
    } catch (err) {
      console.error(err);
      navigate("/admin/dashboard");
      return;
    } finally {
      setCheckingRole(false);
    }
    fetchCoupons(isSuper);
  }, []);

  const chartData = useMemo(() => {
    const grouped = transactions.reduce((acc, tx) => {
      if (!tx.created_at || tx.status?.toLowerCase() !== "success") return acc;
      const date = new Date(tx.created_at).toISOString().slice(0, 10);
      if (!acc[date]) {
        acc[date] = { date, revenue: 0 };
      }
      acc[date].revenue += (tx.total_paid ?? tx.amount ?? 0);
      return acc;
    }, {} as Record<string, { date: string, revenue: number }>);
    
    return Object.values(grouped).sort((a: any, b: any) => a.date.localeCompare(b.date));
  }, [transactions]);

  if (checkingRole || !isSuperAdmin) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D50032]"></div>
      </div>
    );
  }

  const handleAddCoupon = async () => {
    try {
      const expiryDate = new Date(formData.valid_until);
      expiryDate.setHours(23, 59, 59, 999);
      await api.post("/admin/offers", {
        ...formData,
        valid_until: expiryDate.toISOString()
      });
      setIsAddDialogOpen(false);
      resetForm();
      fetchCoupons(isSuperAdmin);
    } catch (err: any) {
      alert("Error creating offer: " + (err.response?.data?.detail || err.message));
    }
  };

  const handleEditCoupon = async () => {
    if (selectedCoupon) {
      try {
        const expiryDate = new Date(formData.valid_until);
        expiryDate.setHours(23, 59, 59, 999);
        await api.put(`/admin/offers/${selectedCoupon.id}`, {
          ...formData,
          valid_until: expiryDate.toISOString()
        });
        setIsEditDialogOpen(false);
        setSelectedCoupon(null);
        resetForm();
        fetchCoupons(isSuperAdmin);
      } catch (err: any) {
        alert("Error updating offer: " + (err.response?.data?.detail || err.message));
      }
    }
  };

  const handleDeleteCoupon = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this coupon?")) {
      try {
        await api.delete(`/admin/offers/${id}`);
        fetchCoupons(isSuperAdmin);
      } catch (err: any) {
        alert("Error deleting offer: " + (err.response?.data?.detail || err.message));
      }
    }
  };

  const handleApproveOfflinePayment = async () => {
    if (!selectedOfflineTransaction) return;
    if (window.confirm("Are you sure you want to approve this payment and enroll the student?")) {
      try {
        await api.put(`/payments/admin/${selectedOfflineTransaction.id}/approve`);
        setIsOfflineActionDialogOpen(false);
        setSelectedOfflineTransaction(null);
        fetchTransactions();
      } catch (err: any) {
        alert("Error approving payment: " + (err.response?.data?.detail || err.message));
      }
    }
  };

  const handleRejectOfflinePayment = async () => {
    if (!selectedOfflineTransaction) return;
    if (!rejectionReason.trim()) {
      alert("Please provide a rejection reason.");
      return;
    }
    if (window.confirm("Are you sure you want to reject this payment?")) {
      try {
        await api.put(`/payments/admin/${selectedOfflineTransaction.id}/reject`, {
          action: "reject",
          reason: rejectionReason
        });
        setIsOfflineActionDialogOpen(false);
        setSelectedOfflineTransaction(null);
        setRejectionReason("");
        fetchTransactions();
      } catch (err: any) {
        alert("Error rejecting payment: " + (err.response?.data?.detail || err.message));
      }
    }
  };

  const openEditDialog = (coupon: Offer) => {
    setSelectedCoupon(coupon);
    setFormData({
      title: coupon.title || coupon.code,
      code: coupon.code,
      discount_type: coupon.discount_type || "percentage",
      discount_value: coupon.discount_value,
      description: coupon.description,
      valid_until: coupon.valid_until.split("T")[0],
      is_active: coupon.is_active
    });
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      code: "",
      discount_type: "percentage",
      discount_value: 0,
      description: "",
      valid_until: "",
      is_active: true
    });
  };

  const openTransactionBreakdown = (metric: typeof selectedAmountMetric) => {
    setSelectedAmountMetric(metric);
    setActiveTab("transactions");
  };

  const amountCellClass = (metric: typeof selectedAmountMetric) =>
    `font-bold ${selectedAmountMetric === metric ? "bg-[#FFF4D8] text-[#0B2A5B]" : ""}`;

  const exportTransactionsToExcel = () => {
    const headers = [
      "Transaction ID",
      "Student Name",
      "Student Email",
      "Course Title",
      "Total Amount",
      "Total Fees",
      "GST Amount",
      "Paid Amount",
      "Payment Mode",
      "Payment Date",
      "Status",
    ];

    const escapeCsv = (value: any) => `"${String(value ?? "").replace(/"/g, '""')}"`;
    const rows = transactions.map((tx) => [
      tx.txnid,
      tx.student_name,
      tx.student_email,
      tx.course_title,
      (tx.total_amount ?? tx.amount ?? 0).toFixed(2),
      (tx.total_fees ?? 0).toFixed(2),
      (tx.total_gst ?? 0).toFixed(2),
      (tx.total_paid ?? tx.amount ?? 0).toFixed(2),
      tx.payment_mode,
      tx.created_at ? new Date(tx.created_at).toLocaleString() : "N/A",
      tx.status,
    ]);

    const csv = [headers, ...rows].map((row) => row.map(escapeCsv).join(",")).join("\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `student-payments-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: '#121212' }}>Payments & Coupons</h1>
            <p className="text-gray-600 mt-1">Manage payment settings and promotional coupons</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="shadow-lg"
                style={{ background: '#D50032', color: 'white' }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Coupon
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Coupon</DialogTitle>
              </DialogHeader>
              <CouponForm onSubmit={handleAddCoupon} submitLabel="Create Coupon" formData={formData} setFormData={setFormData} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Revenue Stats */}
        {!canViewRevenue ? (
          <Card className="p-8 border-2 border-orange-200 bg-orange-50 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(213,0,50,0.1)" }}>
              <ShieldAlert className="h-7 w-7" style={{ color: "#D50032" }} />
            </div>
            <div>
              <div className="font-bold text-lg" style={{ color: "#121212" }}>Revenue Access Restricted</div>
              <div className="text-gray-600 text-sm mt-1">Only the Super Admin has permission to view revenue data.</div>
            </div>
          </Card>
        ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6 gap-4">
          <Card onClick={() => openTransactionBreakdown("total_amount")} className={`p-4 border-2 transition-all cursor-pointer ${selectedAmountMetric === "total_amount" ? "border-[#D50032] shadow-md" : "border-gray-100 hover:border-[#D50032]"}`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(76, 175, 80, 0.1)' }}>
                <IndianRupee className="h-5 w-5" style={{ color: '#4CAF50' }} />
              </div>
              <div>
                <div className="text-lg font-bold" style={{ color: '#121212' }}>{stats.total_amount}</div>
                <div className="text-xs text-gray-600">Total Amount</div>
              </div>
            </div>
          </Card>

          <Card onClick={() => openTransactionBreakdown("total_fees")} className={`p-4 border-2 transition-all cursor-pointer ${selectedAmountMetric === "total_fees" ? "border-[#D50032] shadow-md" : "border-gray-100 hover:border-[#D50032]"}`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(213,0,50, 0.1)' }}>
                <TrendingUp className="h-5 w-5" style={{ color: '#D50032' }} />
              </div>
              <div>
                <div className="text-lg font-bold" style={{ color: '#121212' }}>{stats.total_fees}</div>
                <div className="text-xs text-gray-600">Total Fees</div>
              </div>
            </div>
          </Card>

          <Card onClick={() => openTransactionBreakdown("total_gst")} className={`p-4 border-2 transition-all cursor-pointer ${selectedAmountMetric === "total_gst" ? "border-[#D50032] shadow-md" : "border-gray-100 hover:border-[#D50032]"}`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(213,0,50, 0.1)' }}>
                <IndianRupee className="h-5 w-5" style={{ color: '#D50032' }} />
              </div>
              <div>
                <div className="text-lg font-bold" style={{ color: '#121212' }}>{stats.total_gst}</div>
                <div className="text-xs text-gray-600">Total GST Amount</div>
              </div>
            </div>
          </Card>

          <Card onClick={() => openTransactionBreakdown("total_paid")} className={`p-4 border-2 transition-all cursor-pointer ${selectedAmountMetric === "total_paid" ? "border-[#D50032] shadow-md" : "border-gray-100 hover:border-[#D50032]"}`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(76, 175, 80, 0.1)' }}>
                <IndianRupee className="h-5 w-5" style={{ color: '#4CAF50' }} />
              </div>
              <div>
                <div className="text-lg font-bold" style={{ color: '#121212' }}>{stats.total_paid}</div>
                <div className="text-xs text-gray-600">Total Paid Amount</div>
              </div>
            </div>
          </Card>

          <Card onClick={() => setActiveTab("coupons")} className="p-4 border-2 border-gray-100 hover:border-[#D50032] transition-all cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(213,0,50, 0.1)' }}>
                <Tag className="h-5 w-5" style={{ color: '#D50032' }} />
              </div>
              <div>
                <div className="text-lg font-bold" style={{ color: '#121212' }}>{stats.active_coupons}</div>
                <div className="text-xs text-gray-600">Active Coupons</div>
              </div>
            </div>
          </Card>

          <Card onClick={() => setActiveTab("coupons")} className="p-4 border-2 border-gray-100 hover:border-[#D50032] transition-all cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(213,0,50, 0.1)' }}>
                <Users className="h-5 w-5" style={{ color: '#D50032' }} />
              </div>
              <div>
                <div className="text-lg font-bold" style={{ color: '#121212' }}>{stats.total_usage}</div>
                <div className="text-xs text-gray-600">Total Usage</div>
              </div>
            </div>
          </Card>
        </div>
        )}

        {/* Tabs for Coupons and Transactions */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="coupons">Promo Coupons</TabsTrigger>
            {isSuperAdmin && <TabsTrigger value="transactions">Student Transactions</TabsTrigger>}
          </TabsList>

          <TabsContent value="coupons">
            <Card className="border-2 border-gray-100 p-4">
              <h2 className="text-xl font-bold mb-4">All Coupons</h2>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 hover:bg-gray-50">
                      <TableHead className="font-bold">Code</TableHead>
                      <TableHead className="font-bold">Discount</TableHead>
                      <TableHead className="font-bold">Description</TableHead>
                      <TableHead className="font-bold">Usage</TableHead>
                      <TableHead className="font-bold">Expiry Date</TableHead>
                      <TableHead className="font-bold">Status</TableHead>
                      <TableHead className="font-bold text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {coupons.map((coupon) => (
                      <TableRow key={coupon.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded flex items-center justify-center" style={{ background: 'rgba(213,0,50, 0.1)' }}>
                              <Tag className="h-4 w-4" style={{ color: '#D50032' }} />
                            </div>
                            <span className="font-bold" style={{ color: '#121212' }}>{coupon.code}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium" style={{ color: '#D50032' }}>
                            {coupon.discount_value}%
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-gray-600">{coupon.description}</span>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{coupon.current_redemptions || 0}</span>
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {new Date(coupon.valid_until).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            style={{ 
                              background: coupon.is_active ? '#4CAF50' : '#FF9800', 
                              color: 'white' 
                            }}
                          >
                            {coupon.is_active ? "Active" : "Disabled"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(coupon)}
                              className="border-gray-300 hover:border-[#D50032] hover:text-[#D50032]"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteCoupon(coupon.id)}
                              className="border-gray-300 hover:border-red-500 hover:text-red-500"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>

          {isSuperAdmin && (
            <TabsContent value="transactions" className="space-y-6">
              {/* Revenue Chart */}
              <Card className="border-2 border-gray-100 p-6 max-w-full overflow-hidden">
                <h2 className="text-xl font-bold mb-4">Revenue Trend</h2>
                {chartData.length > 0 ? (
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#4CAF50" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <RechartsTooltip formatter={(value: number) => [`₹${value.toFixed(2)}`, "Revenue"]} />
                        <Area type="monotone" dataKey="revenue" stroke="#4CAF50" fillOpacity={1} fill="url(#colorRevenue)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-72 flex items-center justify-center text-gray-400">
                    No revenue data available to display.
                  </div>
                )}
              </Card>

              {/* Transactions Table */}
              <Card className="border-2 border-gray-100 p-4 max-w-full overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                  <div>
                    <h2 className="text-xl font-bold">All Student Payments</h2>
                    <p className="text-sm text-gray-500">Scroll horizontally if needed; amount columns highlight when you click a summary card.</p>
                  </div>
                  <Button
                    onClick={exportTransactionsToExcel}
                    disabled={transactions.length === 0}
                    className="bg-[#0B2A5B] text-white hover:bg-[#143A73] w-full sm:w-auto"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Excel
                  </Button>
                </div>
                <div className="overflow-x-auto max-w-full">
                  <Table className="text-xs min-w-[1120px]">
                    <TableHeader>
                      <TableRow className="bg-gray-50 hover:bg-gray-50">
                        <TableHead className="font-bold px-2 py-3">Transaction ID</TableHead>
                        <TableHead className="font-bold px-2 py-3">Student Name</TableHead>
                        <TableHead className="font-bold px-2 py-3">Student Email</TableHead>
                        <TableHead className="font-bold px-2 py-3">Course Title</TableHead>
                        <TableHead className="font-bold px-2 py-3 text-right">Total Amount</TableHead>
                        <TableHead className="font-bold px-2 py-3 text-right">Total Fees</TableHead>
                        <TableHead className="font-bold px-2 py-3 text-right">GST Amount</TableHead>
                        <TableHead className="font-bold px-2 py-3 text-right">Paid Amount</TableHead>
                        <TableHead className="font-bold px-2 py-3">Payment Mode</TableHead>
                        <TableHead className="font-bold px-2 py-3">Payment Date</TableHead>
                        <TableHead className="font-bold px-2 py-3">Status</TableHead>
                        <TableHead className="font-bold px-2 py-3 text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={12} className="text-center text-gray-500 py-6">
                            No successful or pending transactions found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        transactions.map((tx) => (
                          <TableRow key={tx.id} className="hover:bg-gray-50">
                            <TableCell className="font-mono text-[11px] font-bold px-2 py-3 max-w-[130px] truncate" style={{ color: '#121212' }} title={tx.txnid}>
                              {tx.txnid}
                            </TableCell>
                            <TableCell className="font-medium px-2 py-3 max-w-[120px] truncate" style={{ color: '#121212' }} title={tx.student_name}>
                              {tx.student_name}
                            </TableCell>
                            <TableCell className="text-gray-600 px-2 py-3 max-w-[170px] truncate" title={tx.student_email}>{tx.student_email}</TableCell>
                            <TableCell className="font-medium px-2 py-3 max-w-[120px] truncate" title={tx.course_title}>{tx.course_title}</TableCell>
                            <TableCell className={`${amountCellClass("total_amount")} px-2 py-3 text-right`}>{"\u20B9"}{(tx.total_amount ?? tx.amount ?? 0).toFixed(2)}</TableCell>
                            <TableCell className={`${amountCellClass("total_fees")} px-2 py-3 text-right`}>{"\u20B9"}{(tx.total_fees ?? 0).toFixed(2)}</TableCell>
                            <TableCell className={`${amountCellClass("total_gst")} px-2 py-3 text-right`}>{"\u20B9"}{(tx.total_gst ?? 0).toFixed(2)}</TableCell>
                            <TableCell className={`${amountCellClass("total_paid")} px-2 py-3 text-right`}>
                              <span style={{ color: selectedAmountMetric === "total_paid" ? "#0B2A5B" : '#4CAF50' }}>
                                {"\u20B9"}{(tx.total_paid ?? tx.amount ?? 0).toFixed(2)}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize">
                                {tx.payment_mode}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-gray-600 text-xs">
                              {tx.created_at ? new Date(tx.created_at).toLocaleString() : "N/A"}
                            </TableCell>
                            <TableCell>
                              <Badge 
                                style={{ 
                                  background: tx.status === 'success' ? '#4CAF50' : 
                                             (tx.status === 'pending_verification' || tx.status === 'pending_clearance' ? '#FF9800' : '#D50032'), 
                                  color: 'white' 
                                }}
                              >
                                {tx.status.replace("_", " ")}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              {(tx.status === 'pending_verification' || tx.status === 'pending_clearance') && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedOfflineTransaction(tx);
                                    setIsOfflineActionDialogOpen(true);
                                  }}
                                >
                                  Review
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            </TabsContent>
          )}
        </Tabs>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Coupon</DialogTitle>
            </DialogHeader>
            <CouponForm onSubmit={handleEditCoupon} submitLabel="Update Coupon" formData={formData} setFormData={setFormData} />
          </DialogContent>
        </Dialog>

        {/* Offline Payment Action Dialog */}
        <Dialog open={isOfflineActionDialogOpen} onOpenChange={setIsOfflineActionDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Review Offline Payment</DialogTitle>
            </DialogHeader>
            {selectedOfflineTransaction && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <Label className="text-gray-500">Student</Label>
                    <div className="font-semibold">{selectedOfflineTransaction.student_name}</div>
                    <div className="text-sm text-gray-600">{selectedOfflineTransaction.student_email}</div>
                  </div>
                  <div>
                    <Label className="text-gray-500">Course</Label>
                    <div className="font-semibold">{selectedOfflineTransaction.course_title}</div>
                    <div className="text-sm font-bold text-[#D50032]">Amount: ₹{(selectedOfflineTransaction.total_paid ?? selectedOfflineTransaction.amount ?? 0).toFixed(2)}</div>
                  </div>
                  <div>
                    <Label className="text-gray-500">Payment Mode</Label>
                    <div className="font-semibold capitalize">{selectedOfflineTransaction.payment_mode}</div>
                  </div>
                  <div>
                    <Label className="text-gray-500">Payment Date</Label>
                    <div className="font-semibold">{selectedOfflineTransaction.payment_date ? new Date(selectedOfflineTransaction.payment_date).toLocaleDateString() : 'N/A'}</div>
                  </div>
                  <div>
                    <Label className="text-gray-500">{selectedOfflineTransaction.payment_mode === 'cash' ? 'Receipt Number' : 'Cheque Number'}</Label>
                    <div className="font-semibold">{selectedOfflineTransaction.reference_number || 'N/A'}</div>
                  </div>
                  {selectedOfflineTransaction.payment_mode === 'cheque' && (
                    <>
                      <div>
                        <Label className="text-gray-500">Bank & Branch</Label>
                        <div className="font-semibold">{selectedOfflineTransaction.bank_name || 'N/A'} - {selectedOfflineTransaction.branch_name || 'N/A'}</div>
                      </div>
                      <div>
                        <Label className="text-gray-500">Account Holder</Label>
                        <div className="font-semibold">{selectedOfflineTransaction.account_holder_name || 'N/A'}</div>
                      </div>
                    </>
                  )}
                  <div className="col-span-2">
                    <Label className="text-gray-500">Remarks</Label>
                    <div className="font-semibold">{selectedOfflineTransaction.remarks || 'None'}</div>
                  </div>
                </div>

                {selectedOfflineTransaction.payment_mode === 'cheque' && selectedOfflineTransaction.cheque_image_url && (
                  <div>
                    <Label className="text-gray-500 block mb-2">Cheque Image</Label>
                    <div className="border rounded-lg p-2 max-h-64 overflow-auto flex justify-center">
                      <img src={selectedOfflineTransaction.cheque_image_url.startsWith('http') ? selectedOfflineTransaction.cheque_image_url : `${api.defaults.baseURL}${selectedOfflineTransaction.cheque_image_url}`} alt="Cheque" className="max-w-full object-contain" />
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t space-y-4">
                  <div>
                    <Label>Rejection Reason (only if rejecting)</Label>
                    <Input value={rejectionReason} onChange={e => setRejectionReason(e.target.value)} placeholder="E.g. Cheque bounced, invalid receipt..." />
                  </div>
                  <div className="flex gap-4">
                    <Button onClick={handleApproveOfflinePayment} className="flex-1 bg-green-600 hover:bg-green-700 text-white">Approve & Enroll</Button>
                    <Button onClick={handleRejectOfflinePayment} variant="destructive" className="flex-1">Reject Payment</Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
