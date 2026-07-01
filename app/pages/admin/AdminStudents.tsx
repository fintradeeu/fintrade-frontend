import { useState, useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import {
  Search, Download, Eye, X, UserPlus, Pencil, Trash2,
  UserCheck, UserX, FileText, CheckCircle, Clock, AlertCircle,
  Fingerprint, Camera, Shield, ChevronDown, ExternalLink
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import api from "../../services/api";
import { confirmPopup } from "../../utils/popup";
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

// ── Excel export helper (HTML spreadsheet format for styled output and clickable links) ──────────────────────────
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

  const [showEditModal, setShowEditModal] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [editForm, setEditForm] = useState({
    email: "", full_name: "", phone: "", city: "", region: "", referral_code: "",
    discount_percentage: 10, permissions: { ...DEFAULT_FACULTY_PERMISSIONS }
  });

  // KYC map for all users (for Excel export)
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
      const payload: any = { email: editForm.email, full_name: editForm.full_name, phone: editForm.phone || null, city: editForm.city || null };
      if (isSuperAdmin && isDistributorUser(selectedUser)) {
        payload.region = editForm.region; payload.referral_code = editForm.referral_code; payload.discount_percentage = editForm.discount_percentage;
      }
      if (selectedUser.roles?.some((r: any) => r.name === "faculty")) payload.permissions = editForm.permissions;
      await api.put(`/admin/users/${selectedUser.id}`, payload);
      setShowEditModal(false); fetchUsers();
    } catch (err: any) { alert("Error: " + (err.response?.data?.detail || err.message)); }
    finally { setUpdating(false); }
  };

  const filtered = users.filter(u => {
    if (isDistributorUser(u)) return false;
    const hasPrivilegedRole = u.roles?.some((ro: any) => 
      ro.name === "admin" || ro.name === "super_admin" || ro.name === "faculty"
    );
    if (hasPrivilegedRole) return false;
    const s = u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const r = roleFilter === "all" || u.roles?.some((ro: any) => ro.name === roleFilter);
    return s && r;
  });
  const visibleRoleFilters = ROLE_FILTERS;
  const countRole = (r: string) => {
    const visibleUsers = users.filter(u => {
      if (isDistributorUser(u)) return false;
      const hasPrivilegedRole = u.roles?.some((ro: any) => 
        ro.name === "admin" || ro.name === "super_admin" || ro.name === "faculty"
      );
      return !hasPrivilegedRole;
    });
    return r === "all" ? visibleUsers.length : visibleUsers.filter(u => u.roles?.some((ro: any) => ro.name === r)).length;
  };

  return (
    <DashboardLayout role="admin">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#0B2A5B] mb-2">User Management</h1>
          <p className="text-[#0B2A5B]/70">View registered users who have not purchased a course yet</p>
        </div>
        <Button
          onClick={handleExportExcel}
          disabled={exporting || loading}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white shadow-lg"
        >
          <Download size={16} />
          {exporting ? "Exporting..." : "Export to Excel"}
        </Button>
      </div>

      {/* Role filter cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {visibleRoleFilters.map(role => (
          <Card key={role} className={`p-4 cursor-pointer transition-all shadow-lg hover:shadow-xl ${roleFilter === role ? "bg-[#0B2A5B] text-[#F4F1EA] ring-2 ring-[#C2A86A]" : "bg-white"}`} onClick={() => setRoleFilter(role)}>
            <p className={`text-xs uppercase tracking-wider mb-1 ${roleFilter === role ? "text-[#F4F1EA]/70" : "text-[#0B2A5B]/60"}`}>{role === "all" ? "All Users" : role === "distributor" ? "Introducing Brokers (IB)" : role.charAt(0).toUpperCase() + role.slice(1) + "s"}</p>
            <p className={`text-2xl font-bold ${roleFilter === role ? "text-[#C2A86A]" : "text-[#0B2A5B]"}`}>{countRole(role)}</p>
          </Card>
        ))}
      </div>

      {/* Search + Add */}
      <Card className="p-6 bg-white shadow-lg mb-6">
        <div className="flex gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0B2A5B]/40" size={20} />
            <Input placeholder="Search by name or email..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 bg-[#F4F1EA] border-[#0B2A5B]/20" />
          </div>
          <Button onClick={() => setShowAddModal(true)} className="bg-[#0B2A5B] text-[#F4F1EA] hover:bg-[#1a3d7a]"><UserPlus size={16} className="mr-2" />Add User</Button>
        </div>
      </Card>

      {/* Users table */}
      <Card className="p-6 bg-white shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader><TableRow className="bg-[#F4F1EA]">
              <TableHead className="text-[#0B2A5B]">User</TableHead>
              {isSuperAdmin && roleFilter === "distributor" ? (
                <>
                  <TableHead className="text-[#0B2A5B]">Region</TableHead>
                  <TableHead className="text-[#0B2A5B]">Referral Code</TableHead>
                  <TableHead className="text-[#0B2A5B]">Discount %</TableHead>
                  <TableHead className="text-[#0B2A5B]">Students Referred</TableHead>
                  <TableHead className="text-[#0B2A5B]">Total Revenue</TableHead>
                  <TableHead className="text-[#0B2A5B]">Referral Link</TableHead>
                </>
              ) : (
                <>
                  <TableHead className="text-[#0B2A5B]">Phone</TableHead>
                  <TableHead className="text-[#0B2A5B]">City</TableHead>
                  <TableHead className="text-[#0B2A5B]">Roles</TableHead>
                  <TableHead className="text-[#0B2A5B]">KYC</TableHead>
                </>
              )}
              <TableHead className="text-[#0B2A5B]">Joined</TableHead>
              <TableHead className="text-[#0B2A5B]">Status</TableHead>
              <TableHead className="text-[#0B2A5B]">Actions</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {filtered.map(u => {
                const distInfo = isSuperAdmin && roleFilter === "distributor" ? getDistributorStats(u.id) : null;
                return (
                  <TableRow key={u.id} className="hover:bg-[#F4F1EA]/50">
                    <TableCell><div><p className="font-semibold text-[#0B2A5B]">{u.full_name}</p><p className="text-xs text-[#0B2A5B]/60">{u.email}</p></div></TableCell>
                    {isSuperAdmin && roleFilter === "distributor" ? (
                      <>
                        <TableCell className="text-[#0B2A5B] text-sm">{distInfo?.region || u.distributor_profile?.region || "—"}</TableCell>
                        <TableCell className="text-[#0B2A5B] text-sm font-mono font-bold text-orange-600">{distInfo?.referral_code || u.distributor_profile?.referral_code || "—"}</TableCell>
                        <TableCell className="text-[#0B2A5B] text-sm font-semibold">{distInfo?.discount_percentage ?? u.distributor_profile?.discount_percentage ?? 10}%</TableCell>
                        <TableCell className="text-[#0B2A5B] text-sm font-bold">{distInfo?.total_students_referred ?? 0}</TableCell>
                        <TableCell className="text-[#0B2A5B] text-sm font-bold text-green-700">₹{distInfo?.total_revenue_generated?.toLocaleString("en-IN") ?? 0}</TableCell>
                        <TableCell>
                          {(distInfo?.referral_code || u.distributor_profile?.referral_code) ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={async () => {
                                const code = distInfo?.referral_code || u.distributor_profile?.referral_code;
                                const link = `${window.location.origin}/register?ref=${code}`;
                                navigator.clipboard.writeText(link);
                                toast.success("Referral link copied!");
                              }}
                              className="text-xs border-orange-200 text-orange-700 hover:bg-orange-50 px-2 py-1 h-auto"
                            >
                              Copy Link
                            </Button>
                          ) : "—"}
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell className="text-[#0B2A5B] text-sm">{u.phone || "—"}</TableCell>
                        <TableCell className="text-[#0B2A5B] text-sm">{u.city || "—"}</TableCell>
                        <TableCell>{u.roles?.filter((r: any) => isSuperAdmin || r.name !== "distributor").map((r: any) => (
                          <Badge key={r.id} className={`mr-1 ${r.name === "admin" ? "bg-red-100 text-red-700" : r.name === "faculty" ? "bg-purple-100 text-purple-700" : r.name === "distributor" ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"}`}>{r.name === "distributor" ? "Introducing Broker (IB)" : r.name}</Badge>
                        ))}</TableCell>
                        <TableCell><KycBadge status={u.kyc_status} /></TableCell>
                      </>
                    )}
                    <TableCell className="text-[#0B2A5B] text-sm">{new Date(u.created_at).toLocaleDateString()}</TableCell>
                    <TableCell><Badge className={u.is_active ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-red-100 text-red-700 hover:bg-red-100"}>{u.is_active ? "Active" : "Inactive"}</Badge></TableCell>
                    <TableCell>
                      <div className="flex gap-1.5">
                        <Button size="sm" variant="outline" className="border-[#0B2A5B]/20 hover:bg-[#F4F1EA]" onClick={() => handleOpenView(u)} title="View User"><Eye size={14} /></Button>
                        <Button size="sm" variant="outline" className="border-[#0B2A5B]/20 hover:bg-[#F4F1EA]" onClick={() => handleOpenEdit(u)} title="Edit User"><Pencil size={14} /></Button>
                        <Button size="sm" variant="outline" className={`border-[#0B2A5B]/20 ${u.is_active ? "text-orange-500 hover:bg-orange-50" : "text-green-600 hover:bg-green-50"}`} onClick={() => handleToggleStatus(u)} title={u.is_active ? "Deactivate" : "Activate"}>
                          {u.is_active ? <UserX size={14} /> : <UserCheck size={14} />}
                        </Button>
                        <Button size="sm" variant="outline" className="border-red-300 text-red-500 hover:bg-red-50" onClick={() => handleDeleteUser(u)} title="Delete"><Trash2 size={14} /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && !loading && <TableRow><TableCell colSpan={isSuperAdmin && roleFilter === "distributor" ? 9 : 8} className="text-center text-[#0B2A5B]/60 py-8">No users found</TableCell></TableRow>}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* ── View User Modal with KYC tab ──────────────────────────────── */}
      {showViewModal && selectedUser && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-bold text-[#0B2A5B]">{selectedUser.full_name}</h2>
                <p className="text-sm text-gray-400">{selectedUser.email}</p>
              </div>
              <button onClick={() => setShowViewModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={22} /></button>
            </div>

            {/* Tabs */}
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

            {/* Tab Content */}
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
                      {selectedUser.roles?.filter((r: any) => isSuperAdmin || r.name !== "distributor").map((r: any) => (
                        <Badge key={r.id} className={r.name === "admin" ? "bg-red-100 text-red-700" : r.name === "faculty" ? "bg-purple-100 text-purple-700" : r.name === "distributor" ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"}>{r.name === "distributor" ? "Introducing Broker (IB)" : r.name}</Badge>
                      ))}
                    </div>
                  </div>
                  {isSuperAdmin && isDistributorUser(selectedUser) && selectedUser.distributor_profile && (
                    <div className="mt-4 bg-orange-50 rounded-xl p-4 space-y-2 border border-orange-100">
                      <p className="text-xs font-bold text-orange-700 uppercase tracking-wider">Introducing Broker (IB) Profile</p>
                      {[
                        ["Region", selectedUser.distributor_profile.region],
                        ["Code", selectedUser.distributor_profile.referral_code],
                        ["Discount", `${selectedUser.distributor_profile.discount_percentage}%`],
                        ["Students Referred", getDistributorStats(selectedUser.id)?.total_students_referred ?? 0]
                      ].map(([k, v]) => (
                        <div key={k} className="flex gap-3 text-sm"><span className="text-gray-500 w-36">{k}:</span><span className="font-medium text-[#0B2A5B]">{v}</span></div>
                      ))}
                      
                      <div className="pt-2">
                        <Button
                          size="sm"
                          onClick={async () => {
                            const code = selectedUser.distributor_profile.referral_code;
                            const link = `${window.location.origin}/register?ref=${code}`;
                            navigator.clipboard.writeText(link);
                            toast.success("Referral link copied!");
                          }}
                          className="w-full bg-orange-600 hover:bg-orange-700 text-white text-xs h-9"
                        >
                          Copy Referral Link
                        </Button>
                      </div>
                    </div>
                  )}
                  <div className="pt-4">
                    <Button onClick={handleSwitchToKyc} variant="outline" className="w-full border-[#0B2A5B]/20 text-[#0B2A5B] hover:bg-[#F4F1EA]">
                      <FileText size={15} className="mr-2" /> View KYC Details →
                    </Button>
                  </div>
                </div>
              )}

              {viewTab === "kyc" && (
                <div>
                  {kycLoading ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                      <div className="w-10 h-10 border-4 border-[#0B2A5B]/20 border-t-[#0B2A5B] rounded-full animate-spin" />
                      <p className="text-sm text-gray-400">Loading KYC details...</p>
                    </div>
                  ) : !selectedUserKyc || selectedUserKyc.status === "not_started" ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                        <Shield className="h-8 w-8 text-gray-300" />
                      </div>
                      <p className="text-lg font-semibold text-gray-400">KYC Not Started</p>
                      <p className="text-sm text-gray-300">This user hasn't submitted any KYC details yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Status header */}
                      <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                        <span className="text-sm font-semibold text-gray-600">KYC Status</span>
                        <KycBadge status={selectedUserKyc.status} />
                      </div>

                      {/* Personal details */}
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

                      {/* Verification Status */}
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

                      {/* Document previews */}
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Uploaded Documents</p>
                        <div className="grid grid-cols-3 gap-3">
                          <DocTile label="Aadhaar Card" url={selectedUserKyc.aadhaar_doc_url} icon={<Fingerprint className="h-8 w-8" />} />
                          <DocTile label="PAN Card" url={selectedUserKyc.pan_doc_url} icon={<FileText className="h-8 w-8" />} />
                          <DocTile label="Passport Photo" url={selectedUserKyc.photo_url} icon={<Camera className="h-8 w-8" />} />
                        </div>
                      </div>

                      {/* Signature & Biometric */}
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

              {isSuperAdmin && viewTab === "referrals" && (
                <div className="space-y-6">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-center">
                      <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Total Referred Students</p>
                      <p className="text-3xl font-bold text-[#0B2A5B] mt-1">{getDistributorStats(selectedUser.id)?.total_students_referred ?? 0}</p>
                    </div>
                    <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-center">
                      <p className="text-xs font-semibold text-green-600 uppercase tracking-wider">Total Revenue Generated</p>
                      <p className="text-3xl font-bold text-green-700 mt-1">₹{(getDistributorStats(selectedUser.id)?.total_revenue_generated ?? 0).toLocaleString("en-IN")}</p>
                    </div>
                  </div>

                  {/* Referrals list */}
                  <div>
                    <h3 className="text-sm font-bold text-[#0B2A5B] mb-3 uppercase tracking-wider">Referred Student List</h3>
                    {referralsLoading ? (
                      <div className="flex flex-col items-center justify-center py-12 gap-3">
                        <div className="w-8 h-8 border-4 border-[#0B2A5B]/20 border-t-[#0B2A5B] rounded-full animate-spin" />
                        <p className="text-xs text-gray-400">Loading referred students...</p>
                      </div>
                    ) : distReferrals.length === 0 ? (
                      <div className="py-8 text-center text-gray-400 text-sm font-medium border border-dashed rounded-xl bg-gray-50/50">
                        No students have registered under this Introducing Broker yet.
                      </div>
                    ) : (
                      <div className="border border-gray-100 rounded-xl overflow-hidden max-h-[40vh] overflow-y-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-[#F4F1EA] hover:bg-[#F4F1EA]">
                              <TableHead className="text-[#0B2A5B] text-xs font-bold py-2">Student Name</TableHead>
                              <TableHead className="text-[#0B2A5B] text-xs font-bold py-2">Email</TableHead>
                              <TableHead className="text-[#0B2A5B] text-xs font-bold py-2">Enrolled Course</TableHead>
                              <TableHead className="text-[#0B2A5B] text-xs font-bold py-2">Referral Date</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {distReferrals.map((r) => (
                              <TableRow key={r.id} className="hover:bg-gray-50">
                                <TableCell className="font-semibold text-[#0B2A5B] text-xs py-2">{r.student_name || "—"}</TableCell>
                                <TableCell className="text-[#0B2A5B]/70 text-xs py-2">{r.student_email || "—"}</TableCell>
                                <TableCell className="text-[#0B2A5B] text-xs py-2">{r.course_title || <span className="text-gray-400 italic">Pending Enrollment</span>}</TableCell>
                                <TableCell className="text-[#0B2A5B]/80 text-xs py-2">{new Date(r.created_at).toLocaleDateString("en-IN")}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </div>
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
              {newUser.role === "faculty" && (
                <div className="space-y-3 border-t pt-4 mt-4">
                  <h3 className="font-semibold text-sm text-[#0B2A5B]">Faculty Permissions</h3>
                  <div className="grid grid-cols-2 gap-3 bg-[#F4F1EA] p-3 rounded-lg">
                    {[{ key: "manageCourses", label: "Courses" }, { key: "manageStudents", label: "Students" }, { key: "manageLectures", label: "Lectures" }, { key: "manageDoubts", label: "Doubts" }, { key: "manageAssignments", label: "Assignments" }, { key: "manageExams", label: "Exams" }, { key: "viewReports", label: "Reports" }].map(perm => (
                      <div key={perm.key} className="flex items-center justify-between">
                        <span className="text-xs font-medium text-[#0B2A5B]">{perm.label}</span>
                        <Switch checked={!!(newUser.permissions as any)[perm.key]} onCheckedChange={checked => setNewUser({ ...newUser, permissions: { ...newUser.permissions, [perm.key]: checked } })} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <Button type="submit" disabled={creating} className="w-full bg-[#0B2A5B] text-white hover:bg-[#1a3d7a] shadow-lg">
                {creating ? "Creating..." : `Create ${newUser.role === "distributor" ? "Introducing Broker (IB)" : newUser.role.charAt(0).toUpperCase() + newUser.role.slice(1)}`}
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
              {isSuperAdmin && isDistributorUser(selectedUser) && (
                <div className="space-y-3 border-t pt-4 mt-4">
                  <h3 className="font-semibold text-sm text-[#0B2A5B]">Introducing Broker (IB) Settings</h3>
                  <div><label className="text-sm font-medium text-[#0B2A5B]">Region *</label><Input required value={editForm.region} onChange={e => setEditForm({ ...editForm, region: e.target.value })} className="bg-[#F4F1EA] border-[#0B2A5B]/20 mt-1" /></div>
                  <div><label className="text-sm font-medium text-[#0B2A5B]">Referral Code *</label><Input required minLength={3} value={editForm.referral_code} onChange={e => setEditForm({ ...editForm, referral_code: e.target.value })} className="bg-[#F4F1EA] border-[#0B2A5B]/20 mt-1" /></div>
                  <div><label className="text-sm font-medium text-[#0B2A5B]">Discount % *</label><Input required type="number" min="0" max="100" value={editForm.discount_percentage} onChange={e => setEditForm({ ...editForm, discount_percentage: parseFloat(e.target.value) || 0 })} className="bg-[#F4F1EA] border-[#0B2A5B]/20 mt-1" /></div>
                </div>
              )}
              {selectedUser.roles?.some((r: any) => r.name === "faculty") && (
                <div className="space-y-3 border-t pt-4 mt-4">
                  <h3 className="font-semibold text-sm text-[#0B2A5B]">Faculty Permissions</h3>
                  <div className="grid grid-cols-2 gap-3 bg-[#F4F1EA] p-3 rounded-lg">
                    {[{ key: "manageCourses", label: "Courses" }, { key: "manageStudents", label: "Students" }, { key: "manageLectures", label: "Lectures" }, { key: "manageDoubts", label: "Doubts" }, { key: "manageAssignments", label: "Assignments" }, { key: "manageExams", label: "Exams" }, { key: "viewReports", label: "Reports" }].map(perm => (
                      <div key={perm.key} className="flex items-center justify-between">
                        <span className="text-xs font-medium text-[#0B2A5B]">{perm.label}</span>
                        <Switch checked={!!(editForm.permissions as any)[perm.key]} onCheckedChange={checked => setEditForm({ ...editForm, permissions: { ...editForm.permissions, [perm.key]: checked } })} />
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
