import { useState, useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import {
  Search, RefreshCw, X, Download, ShieldCheck,
  CheckCircle, Clock, XCircle, AlertCircle, Pencil, Trash2, UserX, UserCheck, Eye, Plus, Fingerprint, FileText, Camera, Shield, ExternalLink
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import api from "../../services/api";
import { confirmPopup } from "../../utils/popup";
import PerformKycModal from "../../components/PerformKycModal";
import { Switch } from "../../components/ui/switch";
import { toast } from "sonner";

const ROLE_FILTERS = ["all", "student"] as const;
type RoleFilter = (typeof ROLE_FILTERS)[number];

const DEFAULT_FACULTY_PERMISSIONS = {
  manageCourses: true, manageStudents: true, manageLectures: true,
  manageDoubts: true, manageAssignments: true, manageExams: true, viewReports: true
};

const isDistributorUser = (user: any) => user.roles?.some((role: any) => role.name === "distributor");

const getStoredIsSuperAdmin = () => {
  try {
    const stored = localStorage.getItem("user");
    if (!stored) return false;
    const parsed = JSON.parse(stored);
    return parsed.roles?.some((role: any) => role.name === "super_admin") || false;
  } catch {
    return false;
  }
};

// ── Excel export helper ───────────────────────────────────────────────────────
function exportToExcel(users: any[], kycMap: Record<number, any>, apiBaseUrl: string) {
  const getAbsoluteUrl = (path?: string) => {
    if (!path) return "";
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    const base = apiBaseUrl || window.location.origin;
    const cleanBase = base.replace(/\/+$/, "");
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${cleanBase}${cleanPath}`;
  };

  const headers = [
    "ID", "Full Name", "Email", "Phone", "City", "Roles", "Status", "Joined",
    "KYC Status", "DOB", "Qualification", "Address",
    "Aadhaar Number", "PAN Number",
    "Aadhaar Doc URL", "PAN Doc URL", "Passport Photo URL",
    "Signature URL", "Biometric Selfie URL",
    "Mobile Verified", "Email Verified"
  ];

  let html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta http-equiv="content-type" content="text/html; charset=utf-8" />
<!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Users KYC</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
<style>
  table { border-collapse: collapse; font-family: Calibri, Arial, sans-serif; }
  th { background-color: #0B2A5B; color: #FFFFFF; font-weight: bold; border: 1px solid #D1D5DB; padding: 8px; text-align: left; }
  td { border: 1px solid #E5E7EB; padding: 8px; vertical-align: middle; }
  .link { color: #2563EB; text-decoration: underline; }
  .active { color: #15803D; font-weight: bold; }
  .inactive { color: #B91C1C; }
  .verified { color: #16A34A; }
  .pending { color: #D97706; }
  .rejected { color: #DC2626; }
</style>
</head>
<body>
<table>
  <thead>
    <tr>
      ${headers.map(h => `<th>${h}</th>`).join("")}
    </tr>
  </thead>
  <tbody>`;

  for (const u of users) {
    const kyc = kycMap[u.id] || {};
    const rolesStr = u.roles?.map((r: any) => r.name).join(", ") || "";
    const statusText = u.is_active ? "Active" : "Inactive";
    const statusClass = u.is_active ? "active" : "inactive";
    const joinedDate = u.created_at ? new Date(u.created_at).toLocaleDateString("en-IN") : "";
    const kycStatus = kyc.status || "Not Started";
    
    let kycClass = "pending";
    if (kycStatus === "verified" || kycStatus === "approved") kycClass = "verified";
    else if (kycStatus === "rejected") kycClass = "rejected";
    else if (kycStatus === "not_started") kycClass = "inactive";

    const aadhaarUrl = getAbsoluteUrl(kyc.aadhaar_doc_url);
    const panUrl = getAbsoluteUrl(kyc.pan_doc_url);
    const photoUrl = getAbsoluteUrl(kyc.photo_url);
    const signatureUrl = getAbsoluteUrl(kyc.signature_url);
    const biometricUrl = getAbsoluteUrl(kyc.biometric_selfie_url);

    html += `
    <tr>
      <td>${u.id}</td>
      <td>${u.full_name || ""}</td>
      <td>${u.email || ""}</td>
      <td>${u.phone || ""}</td>
      <td>${u.city || ""}</td>
      <td>${rolesStr}</td>
      <td class="${statusClass}">${statusText}</td>
      <td>${joinedDate}</td>
      <td class="${kycClass}">${kycStatus}</td>
      <td>${kyc.dob || ""}</td>
      <td>${kyc.qualification || ""}</td>
      <td>${kyc.address || ""}</td>
      <td>${kyc.aadhaar_number || ""}</td>
      <td>${kyc.pan_number || ""}</td>
      <td>${aadhaarUrl ? `<a href="${aadhaarUrl}" class="link" target="_blank">${aadhaarUrl}</a>` : "—"}</td>
      <td>${panUrl ? `<a href="${panUrl}" class="link" target="_blank">${panUrl}</a>` : "—"}</td>
      <td>${photoUrl ? `<a href="${photoUrl}" class="link" target="_blank">${photoUrl}</a>` : "—"}</td>
      <td>${signatureUrl ? `<a href="${signatureUrl}" class="link" target="_blank">${signatureUrl}</a>` : "—"}</td>
      <td>${biometricUrl ? `<a href="${biometricUrl}" class="link" target="_blank">${biometricUrl}</a>` : "—"}</td>
      <td>${kyc.mobile_verified ? "Yes" : "No"}</td>
      <td>${kyc.email_verified ? "Yes" : "No"}</td>
    </tr>`;
  }

  html += `
  </tbody>
</table>
</body>
</html>`;

  const blob = new Blob(["\uFEFF" + html], { type: "application/vnd.ms-excel;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `FinTrade_Users_KYC_${new Date().toISOString().split("T")[0]}.xls`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── KYC Status badge helper ───────────────────────────────────────────────────
function KycBadge({ status }: { status?: string }) {
  if (!status || status === "not_started")
    return <Badge className="bg-gray-100 text-gray-500 text-xs">Not Started</Badge>;
  if (status === "pending")
    return <Badge className="bg-yellow-100 text-yellow-700 text-xs"><Clock className="h-3 w-3 mr-1 inline" />Pending</Badge>;
  if (status === "verified" || status === "approved")
    return <Badge className="bg-green-100 text-green-700 text-xs"><CheckCircle className="h-3 w-3 mr-1 inline" />Verified</Badge>;
  if (status === "rejected")
    return <Badge className="bg-red-100 text-red-700 text-xs"><AlertCircle className="h-3 w-3 mr-1 inline" />Rejected</Badge>;
  return <Badge className="bg-blue-100 text-blue-700 text-xs">{status}</Badge>;
}

// ── Doc preview tile ──────────────────────────────────────────────────────────
function DocTile({ label, url, icon }: { label: string; url?: string; icon: React.ReactNode }) {
  if (!url) {
    return (
      <div className="flex flex-col items-center gap-1 p-3 rounded-xl border border-dashed border-gray-200 bg-gray-50 text-center">
        <div className="text-gray-300">{icon}</div>
        <span className="text-xs text-gray-400">{label}</span>
        <span className="text-[10px] text-gray-300">Not uploaded</span>
      </div>
    );
  }
  const fullUrl = url.startsWith("http") ? url : `${api.defaults.baseURL?.replace(/\/api$/, "") || ""}${url}`;
  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(url) || url.includes("/photo") || url.includes("/biometric") || url.includes("/aadhaar") || url.includes("/pan") || url.includes("/signature");
  return (
    <div className="flex flex-col gap-1 p-2 rounded-xl border border-green-100 bg-green-50/50 text-center">
      {isImage ? (
        <a href={fullUrl} target="_blank" rel="noreferrer">
          <img src={fullUrl} alt={label} className="w-full h-20 object-cover rounded-lg border border-green-100 hover:opacity-90 transition-opacity" />
        </a>
      ) : (
        <div className="h-20 flex items-center justify-center bg-white rounded-lg border border-green-100 text-green-600">
          {icon}
        </div>
      )}
      <span className="text-xs font-medium text-gray-600">{label}</span>
      <a href={fullUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 justify-center text-[10px] text-blue-500 hover:underline">
        <ExternalLink className="h-2.5 w-2.5" /> Open
      </a>
    </div>
  );
}

export default function AdminStudents() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newUser, setNewUser] = useState({
    role: "faculty", email: "", full_name: "", phone: "", city: "", password: "",
    region: "", referral_code: "", discount_percentage: 10,
    permissions: { ...DEFAULT_FACULTY_PERMISSIONS }
  });
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewTab, setViewTab] = useState<"profile" | "kyc" | "referrals">("profile");
  const [distReferrals, setDistReferrals] = useState<any[]>([]);
  const [referralsLoading, setReferralsLoading] = useState(false);
  const [selectedUserKyc, setSelectedUserKyc] = useState<any | null>(null);
  const [kycLoading, setKycLoading] = useState(false);
  const [kycModalUser, setKycModalUser] = useState<any | null>(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [editForm, setEditForm] = useState({
    email: "", full_name: "", phone: "", city: "", region: "", referral_code: "",
    discount_percentage: 10, permissions: { ...DEFAULT_FACULTY_PERMISSIONS }
  });

  const [kycMap, setKycMap] = useState<Record<number, any>>({});
  const [exporting, setExporting] = useState(false);
  const [distributors, setDistributors] = useState<any[]>([]);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  const fetchUsers = async () => {
    try {
      const usersRes = await api.get("/admin/users?limit=200");
      setUsers(usersRes.data.users);
      setDistributors([]);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const getDistributorStats = (userId: number) => {
    return distributors.find(d => d.user_id === userId);
  };

  useEffect(() => {
    setIsSuperAdmin(getStoredIsSuperAdmin());
    fetchUsers();
  }, []);

  const handleOpenView = async (user: any) => {
    setSelectedUser(user);
    setSelectedUserKyc(null);
    setViewTab("profile");
    setShowViewModal(true);
  };

  const loadKycForUser = async (userId: number) => {
    if (kycLoading) return;
    setKycLoading(true);
    try {
      const res = await api.get(`/kyc/admin/user/${userId}`);
      setSelectedUserKyc(res.data);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setSelectedUserKyc({ status: "not_started" });
      } else {
        toast.error("Failed to load KYC details.");
      }
    } finally {
      setKycLoading(false);
    }
  };

  const handleSwitchToKyc = () => {
    setViewTab("kyc");
    if (!selectedUserKyc && selectedUser) loadKycForUser(selectedUser.id);
  };

  const handleSwitchToReferrals = async () => {
    if (!isSuperAdmin) return;
    setViewTab("referrals");
    if (!selectedUser) return;
    const distInfo = getDistributorStats(selectedUser.id);
    if (!distInfo) return;

    setReferralsLoading(true);
    try {
      const res = await api.get(`/admin/distributors/${distInfo.id}/referrals`);
      setDistReferrals(res.data || []);
    } catch (err) {
      console.error("Failed to load IB referrals:", err);
      toast.error("Failed to load referred students.");
    } finally {
      setReferralsLoading(false);
    }
  };

  const handleExportExcel = async () => {
    setExporting(true);
    toast.info("Fetching KYC data for filtered users...");
    try {
      const freshKycMap: Record<number, any> = {};
      await Promise.allSettled(
        filtered.map(async (u) => {
          try {
            const res = await api.get(`/kyc/admin/user/${u.id}`);
            freshKycMap[u.id] = res.data;
          } catch {
            freshKycMap[u.id] = { status: "not_started" };
          }
        })
      );
      setKycMap(freshKycMap);
      exportToExcel(filtered, freshKycMap, api.defaults.baseURL || "");
      toast.success("Excel file downloaded!");
    } catch (err) {
      console.error(err);
      toast.error("Export failed. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const handleOpenEdit = (user: any) => {
    setSelectedUser(user);
    setEditForm({
      email: user.email || "", full_name: user.full_name || "", phone: user.phone || "", city: user.city || "",
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
    if (!(await confirmPopup(`Delete user "${user.full_name}"? This cannot be undone.`))) return;
    try { await api.delete(`/admin/users/${user.id}`); fetchUsers(); }
    catch (err: any) { alert("Error: " + (err.response?.data?.detail || err.message)); }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault(); setCreating(true);
    try {
      const base = { email: newUser.email, full_name: newUser.full_name, password: newUser.password, phone: newUser.phone || undefined, city: newUser.city || undefined };
      if (newUser.role === "admin") await api.post("/admin/users/create-admin", base);
      else if (newUser.role === "faculty") await api.post("/admin/users/create-faculty", { ...base, permissions: newUser.permissions });
      else throw new Error("Unsupported user role");
      setShowAddModal(false);
      setNewUser({ role: "faculty", email: "", full_name: "", phone: "", city: "", password: "", region: "", referral_code: "", discount_percentage: 10, permissions: { ...DEFAULT_FACULTY_PERMISSIONS } });
      fetchUsers();
    } catch (err: any) { alert("Error: " + (err.response?.data?.detail || err.message)); }
    finally { setCreating(false); }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault(); setUpdating(true);
    try {
      await api.put(`/admin/users/${selectedUser.id}`, {
        full_name: editForm.full_name, email: editForm.email, phone: editForm.phone || undefined, city: editForm.city || undefined,
        permissions: selectedUser.roles?.some((r: any) => r.name === "faculty") ? editForm.permissions : undefined,
      });
      setShowEditModal(false);
      fetchUsers();
    } catch (err: any) { alert("Error: " + (err.response?.data?.detail || err.message)); }
    finally { setUpdating(false); }
  };

  const filtered = users.filter((u) => {
    const matchesSearch = !searchTerm || u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || u.email?.toLowerCase().includes(searchTerm.toLowerCase()) || u.phone?.includes(searchTerm);
    if (!matchesSearch) return false;
    if (roleFilter === "all") return true;
    return u.roles?.some((r: any) => r.name === roleFilter);
  });

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#0B2A5B]">User Management</h1>
            <p className="text-sm text-gray-500 mt-1">Manage all students, faculty, and system users.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={handleExportExcel} disabled={exporting} variant="outline" className="border-green-600 text-green-700 hover:bg-green-50 gap-2">
              <Download size={16} />
              {exporting ? "Exporting..." : "Export to Excel"}
            </Button>
            <Button onClick={() => setShowAddModal(true)} className="bg-[#0B2A5B] hover:bg-[#1a3d7a] text-white gap-2">
              <Plus size={16} /> Add New User
            </Button>
          </div>
        </div>

        <Card className="p-4 bg-white border border-[#E5E0D8] rounded-xl shadow-sm">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
            <div className="relative flex-1 max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input placeholder="Search name, email, phone..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-9 bg-[#F4F1EA] border-[#0B2A5B]/20" />
            </div>
            <div className="text-xs text-gray-500 font-medium">{filtered.length} users found</div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-100">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#F4F1EA] hover:bg-[#F4F1EA]">
                  <TableHead className="text-[#0B2A5B] font-bold">User Name</TableHead>
                  <TableHead className="text-[#0B2A5B] font-bold">Email / Phone</TableHead>
                  <TableHead className="text-[#0B2A5B] font-bold">City</TableHead>
                  <TableHead className="text-[#0B2A5B] font-bold">Roles</TableHead>
                  <TableHead className="text-[#0B2A5B] font-bold">Joined Date</TableHead>
                  <TableHead className="text-[#0B2A5B] font-bold">Status</TableHead>
                  <TableHead className="text-[#0B2A5B] font-bold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-10 text-gray-400">Loading Users...</TableCell></TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-10 text-gray-400">No users found.</TableCell></TableRow>
                ) : (
                  filtered.map((u) => (
                    <TableRow key={u.id} className="hover:bg-gray-50">
                      <TableCell className="font-semibold text-[#0B2A5B]">
                        <div>{u.full_name}</div>
                        <div className="text-xs text-gray-400 font-normal">ID: #{u.id}</div>
                      </TableCell>
                      <TableCell className="text-[#0B2A5B]/80 text-sm">
                        <div>{u.email}</div>
                        <div className="text-xs text-gray-400">{u.phone || "—"}</div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">{u.city || "—"}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {u.roles?.map((r: any) => (
                            <Badge key={r.id} className={r.name === "super_admin" ? "bg-purple-100 text-purple-700 border-none" : r.name === "admin" ? "bg-red-100 text-red-700 border-none" : r.name === "faculty" ? "bg-blue-100 text-blue-700 border-none" : "bg-gray-100 text-gray-700 border-none"}>
                              {r.name}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">{new Date(u.created_at).toLocaleDateString("en-IN")}</TableCell>
                      <TableCell>
                        <Badge className={u.is_active ? "bg-green-100 text-green-700 border-none" : "bg-red-100 text-red-700 border-none"}>
                          {u.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setKycModalUser(u)}
                            className="text-green-700 border-green-300 hover:bg-green-50 text-xs px-2 py-1 h-8"
                            title="Perform eKYC"
                          >
                            <ShieldCheck className="w-3.5 h-3.5 mr-1 text-green-600" />
                            eKYC
                          </Button>
                          <Button size="sm" variant="outline" className="border-gray-200 hover:bg-gray-50 h-8 w-8 p-0" onClick={() => handleOpenView(u)} title="View User"><Eye size={14} /></Button>
                          <Button size="sm" variant="outline" className="border-gray-200 hover:bg-gray-50 h-8 w-8 p-0" onClick={() => handleOpenEdit(u)} title="Edit User"><Pencil size={14} /></Button>
                          <Button size="sm" variant="outline" className={`border-gray-200 h-8 w-8 p-0 ${u.is_active ? "text-orange-500 hover:bg-orange-50" : "text-green-600 hover:bg-green-50"}`} onClick={() => handleToggleStatus(u)} title={u.is_active ? "Deactivate" : "Activate"}>
                            {u.is_active ? <UserX size={14} /> : <UserCheck size={14} />}
                          </Button>
                          <Button size="sm" variant="outline" className="border-red-200 text-red-500 hover:bg-red-50 h-8 w-8 p-0" onClick={() => handleDeleteUser(u)} title="Delete"><Trash2 size={14} /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      {/* ── View User Modal with KYC tab ──────────────────────────────── */}
      {showViewModal && selectedUser && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-bold text-[#0B2A5B]">{selectedUser.full_name}</h2>
                <p className="text-sm text-gray-400">{selectedUser.email}</p>
              </div>
              <button onClick={() => setShowViewModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={22} /></button>
            </div>

            <div className="flex border-b border-gray-100">
              {(isSuperAdmin && isDistributorUser(selectedUser)
                ? ["profile", "kyc", "referrals"]
                : ["profile", "kyc"]
              ).map(tab => (
                <button
                  key={tab}
                  onClick={async () => {
                    if (tab === "kyc") handleSwitchToKyc();
                    else if (tab === "referrals") handleSwitchToReferrals();
                    else setViewTab("profile");
                  }}
                  className={`flex-1 py-3 text-sm font-semibold transition-all ${viewTab === tab ? "border-b-2 border-[#0B2A5B] text-[#0B2A5B]" : "text-gray-400 hover:text-gray-600"}`}
                >
                  {tab === "profile" ? "👤 Profile" : tab === "kyc" ? "🪪 KYC Details" : "📈 IB Referrals"}
                </button>
              ))}
            </div>

            <div className="overflow-y-auto flex-1 p-6">
              {viewTab === "profile" && (
                <div className="space-y-3">
                  {[
                    ["Name", selectedUser.full_name],
                    ["Email", selectedUser.email],
                    ["Phone", selectedUser.phone || "—"],
                    ["City", selectedUser.city || "—"],
                    ["Joined", new Date(selectedUser.created_at).toLocaleDateString("en-IN")],
                    ["Status", selectedUser.is_active ? "Active" : "Inactive"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                      <span className="w-28 text-xs font-semibold text-gray-400 uppercase tracking-wide">{k}</span>
                      <span className="text-sm font-medium text-[#0B2A5B]">{v}</span>
                    </div>
                  ))}
                  <div className="flex items-start gap-3 py-2">
                    <span className="w-28 text-xs font-semibold text-gray-400 uppercase tracking-wide mt-0.5">Roles</span>
                    <div className="flex flex-wrap gap-1">
                      {selectedUser.roles?.map((r: any) => (
                        <Badge key={r.id} className="bg-blue-100 text-blue-700">{r.name}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {viewTab === "kyc" && (
                <div>
                  <div className="flex items-center justify-between p-3.5 mb-4 rounded-xl bg-purple-50 border border-purple-100">
                    <div>
                      <h4 className="text-xs font-bold text-purple-900 uppercase tracking-wider">SuperAdmin eKYC Control</h4>
                      <p className="text-xs text-purple-700">Directly enter details, verify documents, and generate signed agreement contract.</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => setKycModalUser(selectedUser)}
                      className="bg-green-600 hover:bg-green-700 text-white font-bold text-xs gap-1.5 shadow-sm"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      Perform / Complete eKYC
                    </Button>
                  </div>

                  {kycLoading ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                      <div className="w-10 h-10 border-4 border-[#0B2A5B]/20 border-t-[#0B2A5B] rounded-full animate-spin" />
                      <p className="text-sm text-gray-400">Loading KYC details...</p>
                    </div>
                  ) : !selectedUserKyc || selectedUserKyc.status === "not_started" ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center gap-3 bg-gray-50 border border-dashed rounded-xl p-6">
                      <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
                        <ShieldCheck className="h-7 w-7" />
                      </div>
                      <p className="text-base font-semibold text-gray-700">KYC Not Completed Yet</p>
                      <p className="text-xs text-gray-500 max-w-sm">This student hasn't completed their self-service eKYC yet. You can complete it for them right now.</p>
                      <Button
                        size="sm"
                        onClick={() => setKycModalUser(selectedUser)}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold text-xs gap-1.5 mt-2"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        Perform eKYC Now
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                        <span className="text-sm font-semibold text-gray-600">KYC Status</span>
                        <KycBadge status={selectedUserKyc.status} />
                      </div>

                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Personal Information</p>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                          {[
                            ["Full Name", selectedUserKyc.full_name],
                            ["Date of Birth", selectedUserKyc.dob],
                            ["Mobile", selectedUserKyc.mobile],
                            ["Qualification", selectedUserKyc.qualification],
                            ["Aadhaar Number", selectedUserKyc.aadhaar_number],
                            ["PAN Number", selectedUserKyc.pan_number],
                          ].map(([k, v]) => (
                            <div key={k} className="py-1.5 border-b border-gray-50">
                              <div className="text-[10px] text-gray-400 uppercase tracking-wide">{k}</div>
                              <div className="text-sm font-medium text-[#0B2A5B] mt-0.5">{v || <span className="text-gray-300 italic text-xs">Not provided</span>}</div>
                            </div>
                          ))}
                        </div>
                        {selectedUserKyc.address && (
                          <div className="mt-2 py-1.5">
                            <div className="text-[10px] text-gray-400 uppercase tracking-wide">Address</div>
                            <div className="text-sm font-medium text-[#0B2A5B] mt-0.5">{selectedUserKyc.address}</div>
                          </div>
                        )}
                      </div>

                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Verification</p>
                        <div className="flex gap-4">
                          {[
                            { label: "Mobile OTP", ok: selectedUserKyc.mobile_verified },
                            { label: "Email OTP", ok: selectedUserKyc.email_verified },
                          ].map(item => (
                            <div key={item.label} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold ${item.ok ? "bg-green-50 text-green-700 border border-green-100" : "bg-gray-50 text-gray-400 border border-gray-100"}`}>
                              {item.ok ? <CheckCircle className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                              {item.label}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Uploaded Documents</p>
                        <div className="grid grid-cols-3 gap-3">
                          <DocTile label="Aadhaar Card" url={selectedUserKyc.aadhaar_doc_url} icon={<Fingerprint className="h-8 w-8" />} />
                          <DocTile label="PAN Card" url={selectedUserKyc.pan_doc_url} icon={<FileText className="h-8 w-8" />} />
                          <DocTile label="Passport Photo" url={selectedUserKyc.photo_url} icon={<Camera className="h-8 w-8" />} />
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Signature & Biometric</p>
                        <div className="grid grid-cols-2 gap-3">
                           <DocTile label="Digital Signature" url={selectedUserKyc.signature_url} icon={<FileText className="h-8 w-8" />} />
                           <DocTile label="Biometric Selfie" url={selectedUserKyc.biometric_selfie_url} icon={<Camera className="h-8 w-8" />} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
              <Button onClick={() => setShowViewModal(false)} className="w-full bg-[#0B2A5B] text-white hover:bg-[#1a3d7a]">Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add User Modal ───────────────────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg p-6 bg-white shadow-xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-black"><X size={20} /></button>
            <h2 className="text-2xl font-bold text-[#0B2A5B] mb-6">Create New User</h2>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-[#0B2A5B]">Role *</label>
                <select className="w-full p-2 border rounded mt-1 bg-[#F4F1EA] border-[#0B2A5B]/20" value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })}>
                  {isSuperAdmin && <option value="admin">Admin</option>}
                  <option value="faculty">Faculty / Teacher</option>
                </select>
              </div>
              <div><label className="text-sm font-medium text-[#0B2A5B]">Full Name *</label><Input required minLength={2} value={newUser.full_name} onChange={e => setNewUser({ ...newUser, full_name: e.target.value })} className="bg-[#F4F1EA] border-[#0B2A5B]/20 mt-1" /></div>
              <div><label className="text-sm font-medium text-[#0B2A5B]">Email *</label><Input required type="email" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} className="bg-[#F4F1EA] border-[#0B2A5B]/20 mt-1" /></div>
              <div><label className="text-sm font-medium text-[#0B2A5B]">Phone</label><Input type="tel" placeholder="+91 98765 43210" value={newUser.phone} onChange={e => setNewUser({ ...newUser, phone: e.target.value })} className="bg-[#F4F1EA] border-[#0B2A5B]/20 mt-1" /></div>
              <div><label className="text-sm font-medium text-[#0B2A5B]">City</label><Input type="text" placeholder="Mumbai" value={newUser.city} onChange={e => setNewUser({ ...newUser, city: e.target.value })} className="bg-[#F4F1EA] border-[#0B2A5B]/20 mt-1" /></div>
              <div><label className="text-sm font-medium text-[#0B2A5B]">Password *</label><Input required type="password" minLength={8} placeholder="Min 8 characters" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} className="bg-[#F4F1EA] border-[#0B2A5B]/20 mt-1" /></div>
              <Button type="submit" disabled={creating} className="w-full bg-[#0B2A5B] text-white hover:bg-[#1a3d7a] shadow-lg">
                {creating ? "Creating..." : `Create User`}
              </Button>
            </form>
          </Card>
        </div>
      )}

      {/* ── Edit User Modal ──────────────────────────────────────────── */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg p-6 bg-white shadow-xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowEditModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-black"><X size={20} /></button>
            <h2 className="text-2xl font-bold text-[#0B2A5B] mb-6">Edit User</h2>
            <form onSubmit={handleEditUser} className="space-y-4">
              <div><label className="text-sm font-medium text-[#0B2A5B]">Full Name *</label><Input required minLength={2} value={editForm.full_name} onChange={e => setEditForm({ ...editForm, full_name: e.target.value })} className="bg-[#F4F1EA] border-[#0B2A5B]/20 mt-1" /></div>
              <div><label className="text-sm font-medium text-[#0B2A5B]">Email *</label><Input required type="email" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} className="bg-[#F4F1EA] border-[#0B2A5B]/20 mt-1" /></div>
              <div><label className="text-sm font-medium text-[#0B2A5B]">Phone</label><Input type="tel" value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} className="bg-[#F4F1EA] border-[#0B2A5B]/20 mt-1" /></div>
              <div><label className="text-sm font-medium text-[#0B2A5B]">City</label><Input type="text" value={editForm.city} onChange={e => setEditForm({ ...editForm, city: e.target.value })} className="bg-[#F4F1EA] border-[#0B2A5B]/20 mt-1" /></div>
              <Button type="submit" disabled={updating} className="w-full bg-[#0B2A5B] text-white hover:bg-[#1a3d7a] shadow-lg mt-6">
                {updating ? "Saving Changes..." : "Save Changes"}
              </Button>
            </form>
          </Card>
        </div>
      )}

      {/* Perform eKYC Modal */}
      {kycModalUser && (
        <PerformKycModal
          open={!!kycModalUser}
          onClose={() => setKycModalUser(null)}
          onSuccess={() => {
            fetchUsers();
            if (selectedUser) loadKycForUser(selectedUser.id);
          }}
          student={kycModalUser}
        />
      )}
    </DashboardLayout>
  );
}
