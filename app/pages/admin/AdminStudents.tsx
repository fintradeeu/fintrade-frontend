import { useState, useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Search, Download, Eye, X, UserPlus, Pencil, Trash2, UserCheck, UserX } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import api from "../../services/api";
import { Switch } from "../../components/ui/switch";

const ROLE_FILTERS = ["all", "admin", "faculty", "student", "distributor"] as const;
type RoleFilter = (typeof ROLE_FILTERS)[number];

const DEFAULT_FACULTY_PERMISSIONS = {
  manageCourses: true,
  manageStudents: true,
  manageLectures: true,
  manageDoubts: true,
  manageAssignments: true,
  manageExams: true,
  viewReports: true
};

export default function AdminStudents() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newUser, setNewUser] = useState({
    role: "faculty",
    email: "",
    full_name: "",
    phone: "",
    password: "",
    region: "",
    referral_code: "",
    discount_percentage: 10,
    permissions: { ...DEFAULT_FACULTY_PERMISSIONS }
  });

  // View & Edit user state
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [editForm, setEditForm] = useState({
    email: "",
    full_name: "",
    phone: "",
    region: "",
    referral_code: "",
    discount_percentage: 10,
    permissions: { ...DEFAULT_FACULTY_PERMISSIONS }
  });

  const fetchUsers = async () => {
    try { const res = await api.get("/admin/users?limit=200"); setUsers(res.data.users); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchUsers(); }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const base = { email: newUser.email, full_name: newUser.full_name, password: newUser.password, phone: newUser.phone || undefined };
      if (newUser.role === "admin") await api.post("/admin/users/create-admin", base);
      else if (newUser.role === "faculty") await api.post("/admin/users/create-faculty", { ...base, permissions: newUser.permissions });
      else await api.post("/admin/users/create-distributor", { ...base, region: newUser.region, referral_code: newUser.referral_code, discount_percentage: newUser.discount_percentage });
      setShowAddModal(false);
      setNewUser({
        role: "faculty",
        email: "",
        full_name: "",
        phone: "",
        password: "",
        region: "",
        referral_code: "",
        discount_percentage: 10,
        permissions: { ...DEFAULT_FACULTY_PERMISSIONS }
      });
      fetchUsers();
    } catch (err: any) { alert("Error: " + (err.response?.data?.detail || err.message)); }
    finally { setCreating(false); }
  };

  const handleOpenView = (user: any) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  const handleOpenEdit = (user: any) => {
    setSelectedUser(user);
    setEditForm({
      email: user.email || "",
      full_name: user.full_name || "",
      phone: user.phone || "",
      region: user.distributor_profile?.region || "",
      referral_code: user.distributor_profile?.referral_code || "",
      discount_percentage: user.distributor_profile?.discount_percentage || 10,
      permissions: user.permissions ? { ...DEFAULT_FACULTY_PERMISSIONS, ...user.permissions } : { ...DEFAULT_FACULTY_PERMISSIONS }
    });
    setShowEditModal(true);
  };

  const handleToggleStatus = async (user: any) => {
    try {
      await api.put(`/admin/users/${user.id}`, { is_active: !user.is_active });
      fetchUsers();
    } catch (err: any) {
      alert("Error: " + (err.response?.data?.detail || err.message));
    }
  };

  const handleDeleteUser = async (user: any) => {
    if (!confirm(`Are you sure you want to delete user "${user.full_name}"? This action cannot be undone.`)) return;
    try {
      await api.delete(`/admin/users/${user.id}`);
      fetchUsers();
    } catch (err: any) {
      alert("Error deleting user: " + (err.response?.data?.detail || err.message));
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const payload: any = {
        email: editForm.email,
        full_name: editForm.full_name,
        phone: editForm.phone || null,
      };

      const isDist = selectedUser.roles?.some((r: any) => r.name === "distributor");
      const isFaculty = selectedUser.roles?.some((r: any) => r.name === "faculty");
      if (isDist) {
        payload.region = editForm.region;
        payload.referral_code = editForm.referral_code;
        payload.discount_percentage = editForm.discount_percentage;
      }
      if (isFaculty) {
        payload.permissions = editForm.permissions;
      }

      await api.put(`/admin/users/${selectedUser.id}`, payload);
      setShowEditModal(false);
      fetchUsers();
    } catch (err: any) {
      alert("Error updating user: " + (err.response?.data?.detail || err.message));
    } finally {
      setUpdating(false);
    }
  };

  const filtered = users.filter((u) => {
    const s = u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const r = roleFilter === "all" || u.roles?.some((ro: any) => ro.name === roleFilter);
    return s && r;
  });
  const countRole = (r: string) => r === "all" ? users.length : users.filter((u) => u.roles?.some((ro: any) => ro.name === r)).length;

  return (
    <DashboardLayout role="admin">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0B2A5B] mb-2">User Management</h1>
        <p className="text-[#0B2A5B]/70">View and manage all users across the platform</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {ROLE_FILTERS.map((role) => (
          <Card key={role} className={`p-4 cursor-pointer transition-all shadow-lg hover:shadow-xl ${roleFilter === role ? "bg-[#0B2A5B] text-[#F4F1EA] ring-2 ring-[#C2A86A]" : "bg-white"}`} onClick={() => setRoleFilter(role)}>
            <p className={`text-xs uppercase tracking-wider mb-1 ${roleFilter === role ? "text-[#F4F1EA]/70" : "text-[#0B2A5B]/60"}`}>{role === "all" ? "All Users" : (role || '').charAt(0).toUpperCase() + (role || '').slice(1) + "s"}</p>
            <p className={`text-2xl font-bold ${roleFilter === role ? "text-[#C2A86A]" : "text-[#0B2A5B]"}`}>{countRole(role)}</p>
          </Card>
        ))}
      </div>

      <Card className="p-6 bg-white shadow-lg mb-6">
        <div className="flex gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0B2A5B]/40" size={20} />
            <Input placeholder="Search by name or email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 bg-[#F4F1EA] border-[#0B2A5B]/20" />
          </div>
          <Button onClick={() => setShowAddModal(true)} className="bg-[#0B2A5B] text-[#F4F1EA] hover:bg-[#1a3d7a]"><UserPlus size={16} className="mr-2" />Add User</Button>
        </div>
      </Card>

      <Card className="p-6 bg-white shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader><TableRow className="bg-[#F4F1EA]">
              <TableHead className="text-[#0B2A5B]">User</TableHead>
              <TableHead className="text-[#0B2A5B]">Phone</TableHead>
              <TableHead className="text-[#0B2A5B]">Roles</TableHead>
              <TableHead className="text-[#0B2A5B]">Joined</TableHead>
              <TableHead className="text-[#0B2A5B]">Status</TableHead>
              <TableHead className="text-[#0B2A5B]">Actions</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {filtered.map((u) => (
                <TableRow key={u.id} className="hover:bg-[#F4F1EA]/50">
                  <TableCell><div><p className="font-semibold text-[#0B2A5B]">{u.full_name}</p><p className="text-xs text-[#0B2A5B]/60">{u.email}</p></div></TableCell>
                  <TableCell className="text-[#0B2A5B] text-sm">{u.phone || "—"}</TableCell>
                  <TableCell>{u.roles?.map((r: any) => (
                    <Badge key={r.id} className={`mr-1 ${r.name === "admin" ? "bg-red-100 text-red-700" : r.name === "faculty" ? "bg-purple-100 text-purple-700" : r.name === "distributor" ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"}`}>{r.name}</Badge>
                  ))}</TableCell>
                  <TableCell className="text-[#0B2A5B] text-sm">{new Date(u.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge className={u.is_active ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-red-100 text-red-700 hover:bg-red-100"}>
                      {u.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="border-[#0B2A5B]/20 hover:bg-[#F4F1EA]" onClick={() => handleOpenView(u)} title="View User">
                        <Eye size={14} />
                      </Button>
                      <Button size="sm" variant="outline" className="border-[#0B2A5B]/20 hover:bg-[#F4F1EA]" onClick={() => handleOpenEdit(u)} title="Edit User">
                        <Pencil size={14} />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className={`border-[#0B2A5B]/20 ${u.is_active ? "text-orange-500 hover:bg-orange-50" : "text-green-600 hover:bg-green-50"}`} 
                        onClick={() => handleToggleStatus(u)} 
                        title={u.is_active ? "Deactivate User" : "Activate User"}
                      >
                        {u.is_active ? <UserX size={14} /> : <UserCheck size={14} />}
                      </Button>
                      <Button size="sm" variant="outline" className="border-red-400 text-red-500 hover:bg-red-50" onClick={() => handleDeleteUser(u)} title="Delete User">
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && !loading && <TableRow><TableCell colSpan={6} className="text-center text-[#0B2A5B]/60 py-8">No users found</TableCell></TableRow>}
            </TableBody>
          </Table>
        </div>
      </Card>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg p-6 bg-white shadow-xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-black"><X size={20} /></button>
            <h2 className="text-2xl font-bold text-[#0B2A5B] mb-6">Create New User</h2>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-[#0B2A5B]">Role *</label>
                <select className="w-full p-2 border rounded mt-1 bg-[#F4F1EA] border-[#0B2A5B]/20" value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}>
                  <option value="admin">Admin</option>
                  <option value="faculty">Faculty / Teacher</option>
                  <option value="distributor">Distributor</option>
                </select>
              </div>
              <div><label className="text-sm font-medium text-[#0B2A5B]">Full Name *</label><Input required minLength={2} value={newUser.full_name} onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })} className="bg-[#F4F1EA] border-[#0B2A5B]/20" /></div>
              <div><label className="text-sm font-medium text-[#0B2A5B]">Email *</label><Input required type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} className="bg-[#F4F1EA] border-[#0B2A5B]/20" /></div>
              <div><label className="text-sm font-medium text-[#0B2A5B]">Phone</label><Input type="tel" placeholder="+91 98765 43210" value={newUser.phone} onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })} className="bg-[#F4F1EA] border-[#0B2A5B]/20" /></div>
              <div><label className="text-sm font-medium text-[#0B2A5B]">Password *</label><Input required type="password" minLength={8} placeholder="Min 8 characters" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} className="bg-[#F4F1EA] border-[#0B2A5B]/20" /></div>
              {newUser.role === "distributor" && (<>
                <div><label className="text-sm font-medium text-[#0B2A5B]">Region *</label><Input required value={newUser.region} onChange={(e) => setNewUser({ ...newUser, region: e.target.value })} className="bg-[#F4F1EA] border-[#0B2A5B]/20" /></div>
                <div><label className="text-sm font-medium text-[#0B2A5B]">Referral Code *</label><Input required minLength={3} value={newUser.referral_code} onChange={(e) => setNewUser({ ...newUser, referral_code: e.target.value })} className="bg-[#F4F1EA] border-[#0B2A5B]/20" /></div>
                <div><label className="text-sm font-medium text-[#0B2A5B]">Discount %</label><Input required type="number" min="0" max="100" value={newUser.discount_percentage} onChange={(e) => setNewUser({ ...newUser, discount_percentage: parseInt(e.target.value) })} className="bg-[#F4F1EA] border-[#0B2A5B]/20" /></div>
              </>)}
              {newUser.role === "faculty" && (
                <div className="space-y-4 border-t pt-4 mt-4">
                  <h3 className="font-semibold text-sm text-[#0B2A5B]">Faculty Permissions</h3>
                  <div className="grid grid-cols-2 gap-4 bg-[#F4F1EA] p-3 rounded-lg">
                    {[
                      { key: "manageCourses", label: "Courses" },
                      { key: "manageStudents", label: "Students" },
                      { key: "manageLectures", label: "Lectures" },
                      { key: "manageDoubts", label: "Doubt Sessions" },
                      { key: "manageAssignments", label: "Assignments" },
                      { key: "manageExams", label: "Exams" },
                      { key: "viewReports", label: "Reports" },
                    ].map((perm) => (
                      <div key={perm.key} className="flex items-center justify-between">
                        <span className="text-xs font-medium text-[#0B2A5B]">{perm.label}</span>
                        <Switch
                          checked={!!(newUser.permissions as any)[perm.key]}
                          onCheckedChange={(checked) =>
                            setNewUser({
                              ...newUser,
                              permissions: { ...newUser.permissions, [perm.key]: checked },
                            })
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="bg-[#F4F1EA] p-3 rounded-lg">
                <p className="text-xs text-[#0B2A5B]/70">
                  {newUser.role === "admin" && "⚠️ Admin accounts have full platform access including user management and financial data."}
                  {newUser.role === "faculty" && "Faculty accounts can create courses, modules, lessons, and schedule lectures."}
                  {newUser.role === "distributor" && "Distributor accounts can generate referral links and track student enrollments."}
                </p>
              </div>
              <Button type="submit" disabled={creating} className="w-full bg-[#0B2A5B] text-white hover:bg-[#1a3d7a] shadow-lg">
                {creating ? "Creating..." : `Create ${(newUser.role || 'student').charAt(0).toUpperCase() + (newUser.role || 'student').slice(1)}`}
              </Button>
            </form>
          </Card>
        </div>
      )}

      {/* View User Modal */}
      {showViewModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6 bg-white shadow-xl relative">
            <button onClick={() => setShowViewModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={20} /></button>
            <h2 className="text-2xl font-bold text-[#0B2A5B] mb-6">User Details</h2>
            <div className="space-y-4 text-sm text-[#0B2A5B]">
              <div className="grid grid-cols-3 gap-2 border-b pb-2">
                <span className="font-semibold text-gray-500">Name:</span>
                <span className="col-span-2 font-medium">{selectedUser.full_name}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 border-b pb-2">
                <span className="font-semibold text-gray-500">Email:</span>
                <span className="col-span-2 font-medium">{selectedUser.email}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 border-b pb-2">
                <span className="font-semibold text-gray-500">Phone:</span>
                <span className="col-span-2 font-medium">{selectedUser.phone || "—"}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 border-b pb-2">
                <span className="font-semibold text-gray-500">Roles:</span>
                <span className="col-span-2">
                  {selectedUser.roles?.map((r: any) => (
                    <Badge key={r.id} className="mr-1">{r.name}</Badge>
                  ))}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 border-b pb-2">
                <span className="font-semibold text-gray-500">Status:</span>
                <span className="col-span-2">
                  <Badge className={selectedUser.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                    {selectedUser.is_active ? "Active" : "Inactive"}
                  </Badge>
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 border-b pb-2">
                <span className="font-semibold text-gray-500">Joined:</span>
                <span className="col-span-2 font-medium">{new Date(selectedUser.created_at).toLocaleDateString()}</span>
              </div>

              {selectedUser.roles?.some((r: any) => r.name === "distributor") && selectedUser.distributor_profile && (
                <div className="mt-6 bg-[#F4F1EA] p-4 rounded-lg space-y-3">
                  <p className="font-bold text-xs uppercase tracking-wider text-[#0B2A5B]/70">Distributor Profile</p>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <span className="font-semibold text-gray-500">Region:</span>
                    <span className="col-span-2 font-medium">{selectedUser.distributor_profile.region}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <span className="font-semibold text-gray-500">Code:</span>
                    <span className="col-span-2 font-medium bg-[#0B2A5B]/10 px-2 py-0.5 rounded text-[#0B2A5B] w-fit font-mono">{selectedUser.distributor_profile.referral_code}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <span className="font-semibold text-gray-500">Discount:</span>
                    <span className="col-span-2 font-medium">{selectedUser.distributor_profile.discount_percentage}%</span>
                  </div>
                </div>
              )}
            </div>
            <Button onClick={() => setShowViewModal(false)} className="w-full bg-[#0B2A5B] text-white mt-6 hover:bg-[#1a3d7a]">Close</Button>
          </Card>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg p-6 bg-white shadow-xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowEditModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-black"><X size={20} /></button>
            <h2 className="text-2xl font-bold text-[#0B2A5B] mb-6">Edit User</h2>
            <form onSubmit={handleEditUser} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-[#0B2A5B]">Full Name *</label>
                <Input required minLength={2} value={editForm.full_name} onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })} className="bg-[#F4F1EA] border-[#0B2A5B]/20" />
              </div>
              <div>
                <label className="text-sm font-medium text-[#0B2A5B]">Email *</label>
                <Input required type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className="bg-[#F4F1EA] border-[#0B2A5B]/20" />
              </div>
              <div>
                <label className="text-sm font-medium text-[#0B2A5B]">Phone</label>
                <Input type="tel" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} className="bg-[#F4F1EA] border-[#0B2A5B]/20" />
              </div>

              {selectedUser.roles?.some((r: any) => r.name === "distributor") && (
                <div className="space-y-4 border-t pt-4 mt-4">
                  <h3 className="font-semibold text-sm text-[#0B2A5B]">Distributor Settings</h3>
                  <div>
                    <label className="text-sm font-medium text-[#0B2A5B]">Region *</label>
                    <Input required value={editForm.region} onChange={(e) => setEditForm({ ...editForm, region: e.target.value })} className="bg-[#F4F1EA] border-[#0B2A5B]/20" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#0B2A5B]">Referral Code *</label>
                    <Input required minLength={3} value={editForm.referral_code} onChange={(e) => setEditForm({ ...editForm, referral_code: e.target.value })} className="bg-[#F4F1EA] border-[#0B2A5B]/20" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#0B2A5B]">Discount % *</label>
                    <Input required type="number" min="0" max="100" value={editForm.discount_percentage} onChange={(e) => setEditForm({ ...editForm, discount_percentage: parseFloat(e.target.value) || 0 })} className="bg-[#F4F1EA] border-[#0B2A5B]/20" />
                  </div>
                </div>
              )}

              {selectedUser.roles?.some((r: any) => r.name === "faculty") && (
                <div className="space-y-4 border-t pt-4 mt-4">
                  <h3 className="font-semibold text-sm text-[#0B2A5B]">Faculty Permissions</h3>
                  <div className="grid grid-cols-2 gap-4 bg-[#F4F1EA] p-3 rounded-lg">
                    {[
                      { key: "manageCourses", label: "Courses" },
                      { key: "manageStudents", label: "Students" },
                      { key: "manageLectures", label: "Lectures" },
                      { key: "manageDoubts", label: "Doubt Sessions" },
                      { key: "manageAssignments", label: "Assignments" },
                      { key: "manageExams", label: "Exams" },
                      { key: "viewReports", label: "Reports" },
                    ].map((perm) => (
                      <div key={perm.key} className="flex items-center justify-between">
                        <span className="text-xs font-medium text-[#0B2A5B]">{perm.label}</span>
                        <Switch
                          checked={!!(editForm.permissions as any)[perm.key]}
                          onCheckedChange={(checked) =>
                            setEditForm({
                              ...editForm,
                              permissions: { ...editForm.permissions, [perm.key]: checked },
                            })
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <Button type="submit" disabled={updating} className="w-full bg-[#0B2A5B] text-white hover:bg-[#1a3d7a] shadow-lg mt-6">
                {updating ? "Saving Changes..." : "Save Changes"}
              </Button>
            </form>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}
