import { useState, useEffect } from "react";
import api from "../../services/api";
import { toast } from "sonner";
import { DashboardLayout } from "../../components/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Switch } from "../../components/ui/switch";
import { Plus, Edit, Trash2, Shield, Users, Lock, Eye, EyeOff } from "lucide-react";
import { Badge } from "../../components/ui/badge";

interface AdminUser {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
  status: "Active" | "Inactive";
  permissions: {
    manageCourses: boolean;
    manageStudents: boolean;
    managePayments: boolean;
    manageContent: boolean;
    manageExams: boolean;
    manageAdmins: boolean;
    canViewRevenue: boolean;
    viewDashboard: boolean;
    viewModuleStudents: boolean;
    viewLectures: boolean;
    viewLoginDetails: boolean;
    viewSiteContent: boolean;
    viewAIChatbot: boolean;
    viewSimulator: boolean;
    viewContracts: boolean;
    viewSettings: boolean;
  };
  lastActive: string;
}

  const AdminForm = ({ 
    onSubmit, 
    submitLabel, 
    formData, 
    setFormData, 
    isEdit = false 
  }: { 
    onSubmit: () => void; 
    submitLabel: string; 
    formData: any; 
    setFormData: any; 
    isEdit?: boolean;
  }) => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Full Name *</Label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter admin name"
            className="mt-2"
          />
        </div>

        <div>
          <Label>Email Address *</Label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="admin@fintrade.in"
            className="mt-2"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Mobile Number *</Label>
          <Input
            type="tel"
            value={formData.phone || ""}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="e.g. 9876543210"
            className="mt-2"
          />
        </div>

        <div>
          <Label>{isEdit ? "Password (leave blank to keep unchanged)" : "Password *"}</Label>
          <Input
            type="password"
            value={formData.password || ""}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder={isEdit ? "••••••••" : "Min 8 characters"}
            className="mt-2"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Role *</Label>
          <Input
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            placeholder="e.g. Support Admin, Manager"
            className="mt-2"
          />
        </div>

        <div>
          <Label>Status *</Label>
          <Select 
            value={formData.status} 
            onValueChange={(value: "Active" | "Inactive") => setFormData({ ...formData, status: value })}
          >
            <SelectTrigger className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label className="mb-4 block text-[#0B2A5B] font-bold">Permissions</Label>
        <div className="space-y-6">
          
          {/* Group 1: Core Education */}
          <Card className="p-4 border border-gray-100 bg-gray-50/50">
            <h4 className="text-xs font-bold text-[#0B2A5B]/70 uppercase tracking-wider mb-4">Core Education</h4>
            <div className="space-y-4">

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-semibold">Dashboard</Label>
                  <div className="text-xs text-gray-500">Access administrative overview dashboard</div>
                </div>
                <Switch
                  checked={formData.permissions.viewDashboard}
                  onCheckedChange={(checked) => 
                    setFormData({ 
                      ...formData, 
                      permissions: { ...formData.permissions, viewDashboard: checked } 
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-semibold">Courses</Label>
                  <div className="text-xs text-gray-500">Create, edit, and delete courses</div>
                </div>
                <Switch
                  checked={formData.permissions.manageCourses}
                  onCheckedChange={(checked) => 
                    setFormData({ 
                      ...formData, 
                      permissions: { ...formData.permissions, manageCourses: checked } 
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-semibold">Module Students</Label>
                  <div className="text-xs text-gray-500">Track and manage student module enrollments</div>
                </div>
                <Switch
                  checked={formData.permissions.viewModuleStudents}
                  onCheckedChange={(checked) => 
                    setFormData({ 
                      ...formData, 
                      permissions: { ...formData.permissions, viewModuleStudents: checked } 
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-semibold">Lectures</Label>
                  <div className="text-xs text-gray-500">Schedule and manage live lectures</div>
                </div>
                <Switch
                  checked={formData.permissions.viewLectures}
                  onCheckedChange={(checked) => 
                    setFormData({ 
                      ...formData, 
                      permissions: { ...formData.permissions, viewLectures: checked } 
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-semibold">Exams</Label>
                  <div className="text-xs text-gray-500">Create and manage exams</div>
                </div>
                <Switch
                  checked={formData.permissions.manageExams}
                  onCheckedChange={(checked) => 
                    setFormData({ 
                      ...formData, 
                      permissions: { ...formData.permissions, manageExams: checked } 
                    })
                  }
                />
              </div>

            </div>
          </Card>

          {/* Group 2: Student & Interactive */}
          <Card className="p-4 border border-gray-100 bg-gray-50/50">
            <h4 className="text-xs font-bold text-[#0B2A5B]/70 uppercase tracking-wider mb-4">Student & Interactive</h4>
            <div className="space-y-4">

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-semibold">User Management</Label>
                  <div className="text-xs text-gray-500">View and manage student accounts</div>
                </div>
                <Switch
                  checked={formData.permissions.manageStudents}
                  onCheckedChange={(checked) => 
                    setFormData({ 
                      ...formData, 
                      permissions: { ...formData.permissions, manageStudents: checked } 
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-semibold">Contracts</Label>
                  <div className="text-xs text-gray-500">View and manage student contracts</div>
                </div>
                <Switch
                  checked={formData.permissions.viewContracts}
                  onCheckedChange={(checked) => 
                    setFormData({ 
                      ...formData, 
                      permissions: { ...formData.permissions, viewContracts: checked } 
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-semibold">AI Chatbot</Label>
                  <div className="text-xs text-gray-500">Access and configure AI Chatbot settings</div>
                </div>
                <Switch
                  checked={formData.permissions.viewAIChatbot}
                  onCheckedChange={(checked) => 
                    setFormData({ 
                      ...formData, 
                      permissions: { ...formData.permissions, viewAIChatbot: checked } 
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-semibold">Simulator</Label>
                  <div className="text-xs text-gray-500">Manage trading simulator settings</div>
                </div>
                <Switch
                  checked={formData.permissions.viewSimulator}
                  onCheckedChange={(checked) => 
                    setFormData({ 
                      ...formData, 
                      permissions: { ...formData.permissions, viewSimulator: checked } 
                    })
                  }
                />
              </div>

            </div>
          </Card>

          {/* Group 3: Financials & Content */}
          <Card className="p-4 border border-gray-100 bg-gray-50/50">
            <h4 className="text-xs font-bold text-[#0B2A5B]/70 uppercase tracking-wider mb-4">Financials & Content</h4>
            <div className="space-y-4">

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-semibold">Payments & Coupons</Label>
                  <div className="text-xs text-gray-500">Handle payments and coupons</div>
                </div>
                <Switch
                  checked={formData.permissions.managePayments}
                  onCheckedChange={(checked) => 
                    setFormData({ 
                      ...formData, 
                      permissions: { ...formData.permissions, managePayments: checked } 
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-semibold">Blog & CMS</Label>
                  <div className="text-xs text-gray-500">Manage news and educational content</div>
                </div>
                <Switch
                  checked={formData.permissions.manageContent}
                  onCheckedChange={(checked) => 
                    setFormData({ 
                      ...formData, 
                      permissions: { ...formData.permissions, manageContent: checked } 
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-semibold">Site Content</Label>
                  <div className="text-xs text-gray-500">Manage landing page and CMS configuration</div>
                </div>
                <Switch
                  checked={formData.permissions.viewSiteContent}
                  onCheckedChange={(checked) => 
                    setFormData({ 
                      ...formData, 
                      permissions: { ...formData.permissions, viewSiteContent: checked } 
                    })
                  }
                />
              </div>

              {/* Reports - Super Admin only */}
              <div
                className="flex items-center justify-between p-3 rounded-lg border-2"
                style={{
                  borderColor: formData.role === "Super Admin" ? "rgba(213,0,50,0.3)" : "#e5e7eb",
                  background: formData.role === "Super Admin" ? "rgba(213,0,50,0.04)" : "#f9fafb",
                }}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm font-semibold">Reports</Label>
                    {formData.role !== "Super Admin" && formData.permissions.canViewRevenue === false && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "rgba(213,0,50,0.1)", color: "#D50032" }}>Super Admin Only</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">Access total revenue and monthly earnings</div>
                  {formData.role !== "Super Admin" && !formData.permissions.canViewRevenue && (
                    <div className="flex items-center gap-1 text-[10px] text-orange-500 mt-1 font-semibold">
                      <Lock className="h-3 w-3" /> Must be granted by Super Admin
                    </div>
                  )}
                </div>
                <Switch
                  checked={formData.permissions.canViewRevenue}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      permissions: { ...formData.permissions, canViewRevenue: checked },
                    })
                  }
                  disabled={formData.role !== "Super Admin" && formData.role !== "Finance Admin"}
                />
              </div>

            </div>
          </Card>

          {/* Group 4: Platform Administration */}
          <Card className="p-4 border border-gray-100 bg-gray-50/50">
            <h4 className="text-xs font-bold text-[#0B2A5B]/70 uppercase tracking-wider mb-4">Platform Administration</h4>
            <div className="space-y-4">

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-semibold">Admin Roles</Label>
                  <div className="text-xs text-gray-500">Add and remove admin users</div>
                </div>
                <Switch
                  checked={formData.permissions.manageAdmins}
                  onCheckedChange={(checked) => 
                    setFormData({ 
                      ...formData, 
                      permissions: { ...formData.permissions, manageAdmins: checked } 
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-semibold">Login Details</Label>
                  <div className="text-xs text-gray-500">View admin activity and login logs</div>
                </div>
                <Switch
                  checked={formData.permissions.viewLoginDetails}
                  onCheckedChange={(checked) => 
                    setFormData({ 
                      ...formData, 
                      permissions: { ...formData.permissions, viewLoginDetails: checked } 
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-semibold">Settings</Label>
                  <div className="text-xs text-gray-500">Access platform settings and configurations</div>
                </div>
                <Switch
                  checked={formData.permissions.viewSettings}
                  onCheckedChange={(checked) => 
                    setFormData({ 
                      ...formData, 
                      permissions: { ...formData.permissions, viewSettings: checked } 
                    })
                  }
                />
              </div>

            </div>
          </Card>

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

export default function AdminRoles() {
  
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const res = await api.get("/admin/roles");
      setAdminUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "",
    status: "Active" as "Active" | "Inactive",
    permissions: {
      manageCourses: false,
      manageStudents: false,
      managePayments: false,
      manageContent: false,
      manageExams: false,
      manageAdmins: false,
      canViewRevenue: false,
      viewDashboard: true,
      viewModuleStudents: false,
      viewLectures: false,
      viewLoginDetails: false,
      viewSiteContent: false,
      viewAIChatbot: false,
      viewSimulator: false,
      viewContracts: false,
      viewSettings: false,
    }
  });

  const handleAddAdmin = async () => {
    try {
        const newAdmin = { ...formData, lastActive: new Date().toISOString() };
        await api.post("/admin/roles", newAdmin);
        toast.success("Admin created");
        fetchAdmins();
        setIsAddDialogOpen(false);
        resetForm();
    } catch (err) {
        toast.error("Failed to add admin");
    }
  };

  const handleEditAdmin = async () => {
    if (selectedAdmin) {
      try {
        await api.put(`/admin/roles/${selectedAdmin.id}`, formData);
        toast.success("Admin updated");
        fetchAdmins();
        setIsEditDialogOpen(false);
        setSelectedAdmin(null);
        resetForm();
      } catch (err) {
        toast.error("Failed to update admin");
      }
    }
  };

  const handleDeleteAdmin = async (id: number) => {
    if (confirm("Are you sure you want to remove this admin?")) {
      try {
        await api.delete(`/admin/roles/${id}`);
        toast.success("Admin removed");
        fetchAdmins();
      } catch (err) {
        toast.error("Failed to remove admin");
      }
    }
  };

  const openEditDialog = (admin: AdminUser) => {
    setSelectedAdmin(admin);
    setFormData({
      name: admin.name,
      email: admin.email,
      phone: admin.phone || "",
      password: "",
      role: admin.role,
      status: admin.status,
      permissions: { ...admin.permissions }
    });
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      password: "",
      role: "",
      status: "Active",
      permissions: {
        manageCourses: false,
        manageStudents: false,
        managePayments: false,
        manageContent: false,
        manageExams: false,
        manageAdmins: false,
        canViewRevenue: false,
        viewDashboard: true,
        viewModuleStudents: false,
        viewLectures: false,
        viewLoginDetails: false,
        viewSiteContent: false,
        viewAIChatbot: false,
        viewSimulator: false,
        viewContracts: false,
        viewSettings: false,
      }
    });
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "Super Admin":
        return { background: '#D50032', color: 'white' };
      case "Content Admin":
        return { background: '#2196F3', color: 'white' };
      case "Finance Admin":
        return { background: '#4CAF50', color: 'white' };
      case "Support Admin":
        return { background: '#FF9800', color: 'white' };
      default:
        return { background: '#4d4d4d', color: 'white' };
    }
  };


  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: '#121212' }}>Admin Role Management</h1>
            <p className="text-gray-600 mt-1">Manage admin users and their permissions</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="shadow-lg"
                style={{ background: '#D50032', color: 'white' }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Admin
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Admin</DialogTitle>
              </DialogHeader>
              <AdminForm onSubmit={handleAddAdmin} submitLabel="Add Admin" formData={formData} setFormData={setFormData} isEdit={false} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="p-6 border-2 border-gray-100 hover:border-[#D50032] transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: 'rgba(213,0,50, 0.1)' }}>
                <Users className="h-6 w-6" style={{ color: '#D50032' }} />
              </div>
              <div>
                <div className="text-2xl font-bold" style={{ color: '#121212' }}>{adminUsers.length}</div>
                <div className="text-sm text-gray-600">Total Admins</div>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-2 border-gray-100 hover:border-[#D50032] transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: 'rgba(213,0,50, 0.1)' }}>
                <Shield className="h-6 w-6" style={{ color: '#D50032' }} />
              </div>
              <div>
                <div className="text-2xl font-bold" style={{ color: '#121212' }}>
                  {adminUsers.filter(a => a.role === "Super Admin").length}
                </div>
                <div className="text-sm text-gray-600">Super Admins</div>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-2 border-gray-100 hover:border-[#D50032] transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: 'rgba(213,0,50, 0.1)' }}>
                <Lock className="h-6 w-6" style={{ color: '#D50032' }} />
              </div>
              <div>
                <div className="text-2xl font-bold" style={{ color: '#121212' }}>
                  {adminUsers.filter(a => a.status === "Active").length}
                </div>
                <div className="text-sm text-gray-600">Active</div>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-2 border-gray-100 hover:border-[#D50032] transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: 'rgba(213,0,50, 0.1)' }}>
                <Users className="h-6 w-6" style={{ color: '#D50032' }} />
              </div>
              <div>
                <div className="text-2xl font-bold" style={{ color: '#121212' }}>
                  {adminUsers.filter(a => a.role !== "Super Admin").length}
                </div>
                <div className="text-sm text-gray-600">Role-Based</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Admins Table */}
        <Card className="border-2 border-gray-100">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50">
                  <TableHead className="font-bold">Admin Name</TableHead>
                  <TableHead className="font-bold">Email</TableHead>
                  <TableHead className="font-bold">Role</TableHead>
                  <TableHead className="font-bold">Permissions</TableHead>
                  <TableHead className="font-bold">Status</TableHead>
                  <TableHead className="font-bold">Last Active</TableHead>
                  <TableHead className="font-bold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {adminUsers.map((admin) => (
                  <TableRow key={admin.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium" style={{ color: '#121212' }}>
                      {admin.name}
                    </TableCell>
                    <TableCell className="text-gray-600">{admin.email}</TableCell>
                    <TableCell>
                      <Badge 
                        style={getRoleBadgeColor(admin.role)}
                      >
                        {admin.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(admin.permissions)
                          .filter(([_, value]) => value)
                          .slice(0, 2)
                          .map(([key]) => (
                            <Badge 
                              key={key} 
                              variant="outline" 
                              className="text-xs border-gray-300"
                            >
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </Badge>
                          ))}
                        {Object.values(admin.permissions).filter(v => v).length > 2 && (
                          <Badge variant="outline" className="text-xs border-gray-300">
                            +{Object.values(admin.permissions).filter(v => v).length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={admin.status === "Active" ? "default" : "secondary"}
                        style={{ 
                          background: admin.status === "Active" ? '#4CAF50' : '#gray', 
                          color: 'white' 
                        }}
                      >
                        {admin.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {new Date(admin.lastActive).toLocaleDateString('en-IN', { 
                        day: 'numeric', 
                        month: 'short' 
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(admin)}
                          className="border-gray-300 hover:border-[#D50032] hover:text-[#D50032]"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteAdmin(admin.id)}
                          className="border-gray-300 hover:border-red-500 hover:text-red-500"
                          disabled={admin.role === "Super Admin"}
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
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Admin User</DialogTitle>
            </DialogHeader>
            <AdminForm onSubmit={handleEditAdmin} submitLabel="Update Admin" formData={formData} setFormData={setFormData} isEdit={true} />
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
