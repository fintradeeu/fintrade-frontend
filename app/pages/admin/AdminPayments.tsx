import { useState, useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Plus, Edit, Trash2, Tag, IndianRupee, TrendingUp, Users, Lock, ShieldAlert } from "lucide-react";
import { Badge } from "../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import api from "../../services/api";

const CURRENT_ADMIN_ROLE = "Finance Admin";
const canViewRevenue = CURRENT_ADMIN_ROLE === "Super Admin" || CURRENT_ADMIN_ROLE === "Finance Admin";

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

export default function AdminPayments() {
  const [coupons, setCoupons] = useState<Offer[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Offer | null>(null);
  const [stats, setStats] = useState({ active_coupons: 0, total_usage: 0 });

  const [formData, setFormData] = useState({
    title: "",
    code: "",
    discount_type: "percentage",
    discount_value: 0,
    description: "",
    valid_until: "",
    is_active: true
  });

  const fetchCoupons = async () => {
    try {
      const res = await api.get("/admin/offers");
      setCoupons(res.data);
      const statRes = await api.get("/admin/offers/stats");
      setStats(statRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleAddCoupon = async () => {
    try {
      await api.post("/admin/offers", {
        ...formData,
        valid_until: new Date(formData.valid_until).toISOString()
      });
      setIsAddDialogOpen(false);
      resetForm();
      fetchCoupons();
    } catch (err: any) {
      alert("Error creating offer: " + (err.response?.data?.detail || err.message));
    }
  };

  const handleEditCoupon = async () => {
    if (selectedCoupon) {
      try {
        await api.put(`/admin/offers/${selectedCoupon.id}`, {
          ...formData,
          valid_until: new Date(formData.valid_until).toISOString()
        });
        setIsEditDialogOpen(false);
        setSelectedCoupon(null);
        resetForm();
        fetchCoupons();
      } catch (err: any) {
        alert("Error updating offer: " + (err.response?.data?.detail || err.message));
      }
    }
  };

  const handleDeleteCoupon = async (id: number) => {
    if (confirm("Are you sure you want to delete this coupon?")) {
      try {
        await api.delete(`/admin/offers/${id}`);
        fetchCoupons();
      } catch (err: any) {
        alert("Error deleting offer: " + (err.response?.data?.detail || err.message));
      }
    }
  };

  const openEditDialog = (coupon: Offer) => {
    setSelectedCoupon(coupon);
    setFormData({
      title: coupon.title || coupon.code, // fallback to code if title missing
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

  const CouponForm = ({ onSubmit, submitLabel }: { onSubmit: () => void; submitLabel: string }) => (
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

  const totalRevenue = "₹2.45Cr";
  const monthlyRevenue = "₹24.5L";

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
              <CouponForm onSubmit={handleAddCoupon} submitLabel="Create Coupon" />
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
              <div className="text-gray-600 text-sm mt-1">You do not have permission to view revenue data.</div>
            </div>
          </Card>
        ) : (
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="p-6 border-2 border-gray-100 hover:border-[#D50032] transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: 'rgba(76, 175, 80, 0.1)' }}>
                <IndianRupee className="h-6 w-6" style={{ color: '#4CAF50' }} />
              </div>
              <div>
                <div className="text-2xl font-bold" style={{ color: '#121212' }}>{totalRevenue}</div>
                <div className="text-sm text-gray-600">Total Revenue</div>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-2 border-gray-100 hover:border-[#D50032] transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: 'rgba(213,0,50, 0.1)' }}>
                <TrendingUp className="h-6 w-6" style={{ color: '#D50032' }} />
              </div>
              <div>
                <div className="text-2xl font-bold" style={{ color: '#121212' }}>{monthlyRevenue}</div>
                <div className="text-sm text-gray-600">This Month</div>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-2 border-gray-100 hover:border-[#D50032] transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: 'rgba(213,0,50, 0.1)' }}>
                <Tag className="h-6 w-6" style={{ color: '#D50032' }} />
              </div>
              <div>
                <div className="text-2xl font-bold" style={{ color: '#121212' }}>{stats.active_coupons}</div>
                <div className="text-sm text-gray-600">Active Coupons</div>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-2 border-gray-100 hover:border-[#D50032] transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: 'rgba(213,0,50, 0.1)' }}>
                <Users className="h-6 w-6" style={{ color: '#D50032' }} />
              </div>
              <div>
                <div className="text-2xl font-bold" style={{ color: '#121212' }}>{stats.total_usage}</div>
                <div className="text-sm text-gray-600">Total Usage</div>
              </div>
            </div>
          </Card>
        </div>
        )}

        {/* Coupons Management */}
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
                      <span className="font-medium">{coupon.usage_count}</span>
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

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Coupon</DialogTitle>
            </DialogHeader>
            <CouponForm onSubmit={handleEditCoupon} submitLabel="Update Coupon" />
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
