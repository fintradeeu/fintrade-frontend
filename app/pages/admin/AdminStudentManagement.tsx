import { useState, useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import {
  Search, Download, Eye, X, BookOpen, Clock, AlertCircle, CheckCircle,
  FileText, Calendar, CreditCard, Printer, Shield, ChevronDown, ExternalLink,
  Laptop, Smartphone, Globe, Tag, Trash2
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import api from "../../services/api";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

// HSL/Tailored badge helper
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

function DocTile({ label, url }: { label: string; url?: string }) {
  if (!url) {
    return (
      <div className="flex flex-col items-center gap-1 p-3 rounded-xl border border-dashed border-gray-200 bg-gray-50 text-center">
        <span className="text-xs text-gray-400 font-bold">{label}</span>
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
        <div className="h-20 flex items-center justify-center bg-white rounded-lg border border-green-100 text-green-600 font-bold">
          PDF / Doc
        </div>
      )}
      <span className="text-xs font-bold text-gray-600">{label}</span>
      <a href={fullUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 justify-center text-[10px] text-blue-500 hover:underline">
        <ExternalLink className="h-2.5 w-2.5" /> Open
      </a>
    </div>
  );
}

export default function AdminStudentManagement() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [franchiseIBs, setFranchiseIBs] = useState<any[]>([]);
  const [selectedFranchiseId, setSelectedFranchiseId] = useState<string>("all");
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewTab, setViewTab] = useState<"profile" | "kyc" | "courses" | "sessions">("profile");

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createFormData, setCreateFormData] = useState({ full_name: "", email: "", phone: "", city: "", password: "" });

  const [studentKyc, setStudentKyc] = useState<any | null>(null);
  const [kycLoading, setKycLoading] = useState(false);
  
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const resPurchased = await api.get("/admin/purchased-students?limit=200");
      const combined = [...(resPurchased.data.users || [])];
      combined.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setStudents(combined);
    } catch (err) {
      console.error("Failed to fetch purchased students:", err);
      toast.error("Failed to load students list.");
    } finally {
      setLoading(false);
    }
  };

  const fetchFranchiseIBs = async () => {
    try {
      const res = await api.get("/admin/franchise-ibs");
      setFranchiseIBs(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch Franchise IBs:", err);
    }
  };

  const handleCreateStudent = async () => {
    if (!createFormData.full_name || !createFormData.email || !createFormData.phone || !createFormData.password) {
      toast.error("Please fill in Name, Email, Phone, and Password.");
      return;
    }
    if (createFormData.password.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }
    setIsCreating(true);
    try {
      await api.post("/admin/users/create-student", createFormData);
      toast.success("Student created successfully! Login credentials have been emailed.");
      setIsCreateModalOpen(false);
      setCreateFormData({ full_name: "", email: "", phone: "", city: "", password: "" });
      fetchStudents();
    } catch (err: any) {
      toast.error("Error creating student: " + (err.response?.data?.detail || err.message));
    } finally {
      setIsCreating(false);
    }
  };

  const handleDownloadPdf = async () => {
    const element = document.getElementById("invoice-printable-area");
    if (!element) return;
    
    try {
      toast("Generating PDF...", { id: "pdf-toast" });
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Invoice_${selectedInvoice?.invoiceNumber || 'download'}.pdf`);
      toast.success("Invoice downloaded successfully!", { id: "pdf-toast" });
    } catch (err) {
      console.error("Failed to generate PDF:", err);
      toast.error("Failed to download PDF.", { id: "pdf-toast" });
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchFranchiseIBs();
  }, []);

  const exportToCSV = () => {
    if (filtered.length === 0) {
      toast.error("No student data available to export.");
      return;
    }
    const headers = ["Student Name", "Email", "Phone", "City", "Purchased Courses", "Coupon Used", "Joined Date"];
    
    const rows = filtered.map(s => {
      const coursesStr = (s.enrolled_courses || []).map((ec: any) => ec.course_title).join(" | ");
      const couponsStr = studentCouponCodes(s).join(" | ");
      const joinedDate = s.created_at ? new Date(s.created_at).toLocaleDateString("en-IN") : "";
      
      const escape = (val: string) => `"${(val || "").replace(/"/g, '""')}"`;
      
      return [
        escape(s.full_name),
        escape(s.email),
        escape(s.phone),
        escape(s.city),
        escape(coursesStr),
        escape(couponsStr),
        escape(joinedDate)
      ];
    });

    const csvString = "\uFEFF" // UTF-8 BOM
      + headers.map(h => `"${h.replace(/"/g, '""')}"`).join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");
      
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `students_list_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Student list exported successfully.");
  };

  const loadKycForUser = async (userId: number) => {
    setKycLoading(true);
    try {
      const res = await api.get(`/kyc/admin/user/${userId}`);
      setStudentKyc(res.data);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setStudentKyc({ status: "not_started" });
      } else {
        toast.error("Failed to load student KYC details.");
      }
    } finally {
      setKycLoading(false);
    }
  };

  const handleOpenView = (student: any) => {
    setSelectedStudent(student);
    setStudentKyc(null);
    setViewTab("profile");
    setShowViewModal(true);
  };

  const handleDeleteStudent = async (id: number) => {
    if (!confirm("Are you sure you want to delete this student and all their related data? This action cannot be undone.")) return;
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success("Student deleted successfully");
      fetchStudents();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to delete student");
    }
  };

  const formatCurrency = (val?: number) => {
    if (val === undefined || val === null) return "0.00";
    return val.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatUserAgent = (ua?: string) => {
    if (!ua) return "Unknown Browser";
    if (ua.includes("Firefox")) return "Mozilla Firefox";
    if (ua.includes("Chrome")) return "Google Chrome";
    if (ua.includes("Safari") && !ua.includes("Chrome")) return "Apple Safari";
    if (ua.includes("Edge")) return "Microsoft Edge";
    return ua.slice(0, 30) + "...";
  };

  const splitCodes = (code?: string) => (code || "")
    .split(":")
    .map((part) => part.trim())
    .filter(Boolean);

  const courseCouponCode = (course: any) =>
    course.coupon_code || ((course.discount_applied || 0) > 0 ? "COUPON" : "");

  const courseCouponLabel = (course: any) => {
    const code = courseCouponCode(course);
    if (!code) return "";
    const title = course.coupon_title?.trim();
    if (title && title !== code && title.toLowerCase() !== "coupon") {
      return `${code} - ${title}`;
    }
    return code;
  };

  const studentCouponCodes = (student: any) => {
    const codes = (student.enrolled_courses || [])
      .flatMap((course: any) => course.coupon_title ? [courseCouponLabel(course)] : splitCodes(courseCouponCode(course)));
    return Array.from(new Set<string>(codes));
  };

  // Bifurcation stats
  const directCount = students.filter((s) => !s.franchise_ib_id).length;
  const franchiseCount = students.filter((s) => !!s.franchise_ib_id).length;
  const ibGroups: Record<string, { name: string; code: string; count: number }> = {};
  franchiseIBs.forEach((ib) => {
    ibGroups[ib.id] = { name: ib.full_name, code: ib.referral_code, count: 0 };
  });
  students.forEach((s) => {
    if (s.franchise_ib_id && ibGroups[s.franchise_ib_id]) {
      ibGroups[s.franchise_ib_id].count++;
    }
  });

  const filtered = students.filter((s) => {
    const matchesSearch =
      s.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.phone?.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesFranchise = true;
    if (selectedFranchiseId === "all") {
      matchesFranchise = true;
    } else if (selectedFranchiseId === "direct") {
      // Direct Registration = no franchise IB assigned
      matchesFranchise = !s.franchise_ib_id;
    } else {
      matchesFranchise = String(s.franchise_ib_id) === selectedFranchiseId;
    }

    return matchesSearch && matchesFranchise;
  });

  return (
    <DashboardLayout role="admin">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-black text-[#0B2A5B] tracking-tight mb-2">Student Management</h1>
          <p className="text-[#0B2A5B]/70">Track all students, view their invoices, KYC status, and session activity logs.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => setIsCreateModalOpen(true)} className="bg-[#0B2A5B] text-white hover:bg-[#1a3d7a] rounded-xl flex items-center gap-2">
            Create Student
          </Button>
          <Button onClick={exportToCSV} className="bg-[#C2A86A] text-[#0B2A5B] hover:bg-[#d4bd8a] rounded-xl flex items-center gap-2">
            <Download size={16} /> Export CSV
          </Button>
        </div>
      </div>

      {/* Bifurcation Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Total */}
        <button
          onClick={() => setSelectedFranchiseId("all")}
          className={`p-4 rounded-2xl border-2 text-left transition-all shadow-sm cursor-pointer hover:shadow-md ${selectedFranchiseId === "all" ? "border-[#0B2A5B] bg-[#0B2A5B]/5" : "border-gray-100 bg-white"}`}
        >
          <div className="text-2xl font-black text-[#0B2A5B]">{students.length}</div>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-1">Total Students</div>
          <div className="text-[11px] text-gray-400 mt-0.5">All registered</div>
        </button>

        {/* Direct */}
        <button
          onClick={() => setSelectedFranchiseId("direct")}
          className={`p-4 rounded-2xl border-2 text-left transition-all shadow-sm cursor-pointer hover:shadow-md ${selectedFranchiseId === "direct" ? "border-blue-500 bg-blue-50" : "border-gray-100 bg-white"}`}
        >
          <div className="text-2xl font-black text-blue-600">{directCount}</div>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-1">Direct / Superadmin</div>
          <div className="text-[11px] text-gray-400 mt-0.5">No Franchise IB</div>
        </button>

        {/* Via Franchise IB */}
        <button
          className="p-4 rounded-2xl border-2 border-gray-100 bg-white text-left shadow-sm cursor-default"
        >
          <div className="text-2xl font-black text-emerald-600">{franchiseCount}</div>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-1">Via Franchise IB</div>
          <div className="text-[11px] text-gray-400 mt-0.5">Through referral codes</div>
        </button>

        {/* Active Franchise IBs */}
        <button
          className="p-4 rounded-2xl border-2 border-gray-100 bg-white text-left shadow-sm cursor-default"
        >
          <div className="text-2xl font-black text-purple-600">{franchiseIBs.length}</div>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-1">Active Franchise IBs</div>
          <div className="text-[11px] text-gray-400 mt-0.5">Select below to filter</div>
        </button>
      </div>

      {/* Per-IB breakdown row if any IBs exist */}
      {franchiseIBs.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          {franchiseIBs.map((ib) => (
            <button
              key={ib.id}
              onClick={() => setSelectedFranchiseId(String(ib.id))}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                selectedFranchiseId === String(ib.id)
                  ? "bg-[#0B2A5B] text-white border-[#0B2A5B]"
                  : "bg-white text-[#0B2A5B] border-[#0B2A5B]/30 hover:bg-[#0B2A5B]/10"
              }`}
            >
              🤝 {ib.full_name} <span className="opacity-70">({ib.referral_code})</span>
              <span className="ml-1.5 bg-white/20 px-1.5 py-0.5 rounded-full">
                {ibGroups[ib.id]?.count ?? 0}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Search and Filters */}
      <Card className="p-6 bg-white shadow-lg mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0B2A5B]/40" size={20} />
            <Input
              placeholder="Search students by name, email or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-[#F4F1EA] border-[#0B2A5B]/20 rounded-xl w-full"
            />
          </div>
          <div className="w-full md:w-64 shrink-0">
            <select
              value={selectedFranchiseId}
              onChange={(e) => setSelectedFranchiseId(e.target.value)}
              className="w-full bg-[#F4F1EA] border border-[#0B2A5B]/20 rounded-xl px-4 py-2 text-[#0B2A5B] focus:outline-none focus:ring-2 focus:ring-[#0B2A5B]/30"
            >
              <option value="all">All Students ({students.length})</option>
              <option value="direct">🏢 Direct / Superadmin ({directCount})</option>
              {franchiseIBs.map((ib) => (
                <option key={ib.id} value={String(ib.id)}>
                  🤝 {ib.full_name} — {ib.referral_code} ({ibGroups[ib.id]?.count ?? 0})
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card className="p-6 bg-white shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-10 text-center text-[#0B2A5B]/70 font-semibold">Loading student records...</div>
          ) : filtered.length === 0 ? (
            <div className="py-10 text-center text-[#0B2A5B]/70 font-semibold">No students found.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-[#F4F1EA]">
                  <TableHead className="text-[#0B2A5B] font-bold">Student</TableHead>
                  <TableHead className="text-[#0B2A5B] font-bold">Phone</TableHead>
                  <TableHead className="text-[#0B2A5B] font-bold">City</TableHead>
                  <TableHead className="text-[#0B2A5B] font-bold">Purchased Courses</TableHead>
                  <TableHead className="text-[#0B2A5B] font-bold">Coupon Used</TableHead>
                  <TableHead className="text-[#0B2A5B] font-bold">Joined</TableHead>
                  <TableHead className="text-[#0B2A5B] font-bold text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((s) => (
                  <TableRow key={s.id} className="hover:bg-slate-50/50">
                    <TableCell>
                      <div className="font-semibold text-slate-800">{s.full_name}</div>
                      <div className="text-xs text-slate-500">{s.email}</div>
                    </TableCell>
                    <TableCell className="text-slate-600">{s.phone || "—"}</TableCell>
                    <TableCell className="text-slate-600">{s.city || "—"}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {s.enrolled_courses && s.enrolled_courses.length > 0 ? (
                          s.enrolled_courses.map((ec: any) => (
                            <Badge key={ec.id} className="bg-blue-50 text-blue-700 border border-blue-100 text-xs font-semibold">
                              {ec.course_title}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-red-500 font-bold">No active enrollments</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {studentCouponCodes(s).length > 0 ? (
                          studentCouponCodes(s).map((code) => (
                            <Badge key={code} className="bg-green-50 text-green-700 border border-green-100 text-xs font-semibold font-mono">
                              <Tag size={11} className="mr-1" /> {code}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400 font-semibold">No coupon</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {s.created_at ? new Date(s.created_at).toLocaleDateString("en-IN") : "—"}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-2">
                        <Button
                          onClick={() => handleOpenView(s)}
                          size="sm"
                          variant="outline"
                          className="border-[#0B2A5B] text-[#0B2A5B] hover:bg-[#0B2A5B]/10 rounded-xl"
                        >
                          <Eye size={14} className="mr-1" /> View Details
                        </Button>
                        <Button
                          onClick={() => handleDeleteStudent(s.id)}
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-200 hover:bg-red-50 rounded-xl"
                          title="Delete Student"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </Card>

      {/* Details View Modal */}
      {showViewModal && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <Card className="w-full max-w-4xl bg-white shadow-2xl rounded-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-lg font-bold text-[#0B2A5B]">{selectedStudent.full_name}</h3>
                <p className="text-xs text-slate-500">Student Profile Dossier</p>
              </div>
              <button
                onClick={() => setShowViewModal(false)}
                className="p-1.5 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-gray-100 px-6 bg-slate-50/50">
              {(["profile", "kyc", "courses", "sessions"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setViewTab(tab);
                    if (tab === "kyc" && !studentKyc) loadKycForUser(selectedStudent.id);
                  }}
                  className={`py-3 px-4 text-sm font-semibold border-b-2 transition-all capitalize ${
                    viewTab === tab
                      ? "border-[#D50032] text-[#D50032]"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {tab === "kyc" ? "eKYC Status" : tab === "courses" ? "Courses & Invoices" : tab === "sessions" ? "Login Logs" : tab}
                </button>
              ))}
            </div>

            {/* Modal Content Area */}
            <div className="flex-1 overflow-y-auto p-6">
              {viewTab === "profile" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <span className="text-xs text-slate-400 block font-bold">Email Address</span>
                      <span className="text-sm font-medium text-slate-800">{selectedStudent.email}</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 block font-bold">Mobile Phone</span>
                      <span className="text-sm font-medium text-slate-800">{selectedStudent.phone || "—"}</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <span className="text-xs text-slate-400 block font-bold">City</span>
                      <span className="text-sm font-medium text-slate-800">{selectedStudent.city || "—"}</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 block font-bold">Registration Date</span>
                      <span className="text-sm font-medium text-slate-800">
                        {selectedStudent.created_at ? new Date(selectedStudent.created_at).toLocaleString("en-IN") : "—"}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {viewTab === "kyc" && (
                <div>
                  {kycLoading ? (
                    <div className="py-10 text-center text-slate-500 font-semibold">Fetching KYC documents...</div>
                  ) : !studentKyc ? (
                    <div className="py-10 text-center text-slate-500 font-semibold">No KYC details retrieved.</div>
                  ) : (
                    <div className="space-y-6">
                      <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <div>
                          <span className="text-xs text-slate-400 block font-bold">Verification Status</span>
                          <KycBadge status={studentKyc.status} />
                        </div>
                        <div className="border-l border-slate-200 pl-4">
                          <span className="text-xs text-slate-400 block font-bold">Mobile OTP Verification</span>
                          <Badge className={studentKyc.mobile_verified ? "bg-green-100 text-green-700 border-green-200" : "bg-red-100 text-red-700 border-red-200"}>
                            {studentKyc.mobile_verified ? "Verified" : "Pending"}
                          </Badge>
                        </div>
                        <div className="border-l border-slate-200 pl-4">
                          <span className="text-xs text-slate-400 block font-bold">Email OTP Verification</span>
                          <Badge className={studentKyc.email_verified ? "bg-green-100 text-green-700 border-green-200" : "bg-red-100 text-red-700 border-red-200"}>
                            {studentKyc.email_verified ? "Verified" : "Pending"}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <span className="text-xs text-slate-400 block font-bold">Date of Birth</span>
                          <span className="text-sm font-semibold text-slate-800">{studentKyc.dob || "—"}</span>
                        </div>
                        <div>
                          <span className="text-xs text-slate-400 block font-bold">Qualification</span>
                          <span className="text-sm font-semibold text-slate-800">{studentKyc.qualification || "—"}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-xs text-slate-400 block font-bold">Address Details</span>
                          <span className="text-sm font-semibold text-slate-800">{studentKyc.address || "—"}</span>
                        </div>
                        <div>
                          <span className="text-xs text-slate-400 block font-bold">Aadhaar ID Card Number</span>
                          <span className="text-sm font-semibold text-slate-800">{studentKyc.aadhaar_number || "—"}</span>
                        </div>
                        <div>
                          <span className="text-xs text-slate-400 block font-bold">PAN Number</span>
                          <span className="text-sm font-semibold text-slate-800">{studentKyc.pan_number || "—"}</span>
                        </div>
                      </div>

                      <div className="border-t border-gray-100 pt-4">
                        <h4 className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-3">KYC Documents & Files</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                          <DocTile label="Aadhaar Card" url={studentKyc.aadhaar_doc_url} />
                          <DocTile label="PAN Card" url={studentKyc.pan_doc_url} />
                          <DocTile label="Passport Photo" url={studentKyc.photo_url} />
                          <DocTile label="Digital Signature" url={studentKyc.signature_url} />
                          <DocTile label="Biometric Selfie" url={studentKyc.biometric_selfie_url} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {viewTab === "courses" && (
                <div className="space-y-4">
                  {selectedStudent.enrolled_courses && selectedStudent.enrolled_courses.length > 0 ? (
                    selectedStudent.enrolled_courses.map((ec: any, index: number) => {
                      const discount = ec.discount_applied || 0;
                      const paidPrice = ec.price_paid !== undefined && ec.price_paid !== null ? ec.price_paid : 14999;
                      const originalPrice = paidPrice + discount;
                      
                      return (
                        <div key={ec.id} className="p-4 border border-slate-100 rounded-2xl bg-slate-50 flex items-center justify-between">
                          <div>
                            <span className="font-bold text-slate-800 block text-sm">{ec.course_title}</span>
                            <div className="flex gap-4 text-xs text-slate-500 mt-1">
                              <span>Date: {ec.enrolled_at ? new Date(ec.enrolled_at).toLocaleDateString("en-IN") : "—"}</span>
                              <span>Price Paid: ₹{formatCurrency(paidPrice)}</span>
                              {discount > 0 && <span className="text-green-600 font-medium">Discount applied: ₹{formatCurrency(discount)}</span>}
                              {courseCouponLabel(ec) && <span className="text-green-700 font-semibold">Coupon: {courseCouponLabel(ec)}</span>}
                            </div>
                          </div>
                          <Button
                            onClick={() => {
                              setSelectedInvoice({
                                invoiceNumber: `FT-2026-${1000 + ec.id}`,
                                courseTitle: ec.course_title,
                                purchaseDate: ec.enrolled_at ? new Date(ec.enrolled_at).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" }) : new Date().toLocaleDateString("en-IN"),
                                amount: paidPrice,
                                originalPrice: originalPrice,
                                discountAmount: discount,
                                couponCode: courseCouponLabel(ec),
                                paymentMethod: "UPI / Credit Card / Razorpay",
                                paymentId: ec.payment_txnid || `pay_Razorpay_${89324 + ec.id}`,
                                status: ec.is_active ? "Paid" : "Pending"
                              });
                            }}
                            size="sm"
                            className="bg-[#C2A86A] text-[#0B2A5B] hover:bg-[#d4bd8a] rounded-xl font-bold flex items-center gap-1"
                          >
                            <FileText size={14} /> View Invoice
                          </Button>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-8 text-center text-slate-400">No active courses registered for this user.</div>
                  )}
                </div>
              )}

              {viewTab === "sessions" && (
                <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50">
                        <TableHead className="font-bold text-xs text-slate-600">IP Address</TableHead>
                        <TableHead className="font-bold text-xs text-slate-600">Login Timestamp</TableHead>
                        <TableHead className="font-bold text-xs text-slate-600">Browser / User Agent</TableHead>
                        <TableHead className="font-bold text-xs text-slate-600">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedStudent.login_history && selectedStudent.login_history.length > 0 ? (
                        selectedStudent.login_history.map((lh: any) => (
                          <TableRow key={lh.id}>
                            <TableCell className="text-slate-700 font-mono text-xs">{lh.ip_address || "—"}</TableCell>
                            <TableCell className="text-slate-600 text-xs">
                              {lh.login_time ? new Date(lh.login_time).toLocaleString("en-IN") : "—"}
                            </TableCell>
                            <TableCell className="text-slate-500 text-xs flex items-center gap-1.5">
                              {lh.user_agent?.includes("Mobile") || lh.user_agent?.includes("Android") || lh.user_agent?.includes("iPhone") ? (
                                <Smartphone size={13} className="text-[#0B2A5B]/70" />
                              ) : (
                                <Laptop size={13} className="text-[#0B2A5B]/70" />
                              )}
                              {formatUserAgent(lh.user_agent)}
                            </TableCell>
                            <TableCell>
                              <Badge className={lh.status === "Active" ? "bg-green-100 text-green-700 border-green-200 text-[10px]" : "bg-slate-100 text-slate-500 border-slate-200 text-[10px]"}>
                                {lh.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="py-8 text-center text-slate-400 font-semibold">
                            No session login logs retrieved for this student.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Invoice Viewer overlay */}
      {selectedInvoice && selectedStudent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm print:absolute print:inset-0 print:p-0 print:bg-white print:z-[9999]">
          <Card className="w-full max-w-2xl bg-white shadow-2xl rounded-2xl overflow-hidden flex flex-col max-h-[90vh] print:shadow-none print:rounded-none print:max-h-full print:border-none">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-slate-50 print:hidden">
              <span className="font-bold text-[#0B2A5B]">Tax Invoice Summary</span>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => window.print()} className="border-slate-300 rounded-xl">
                  <Printer size={14} className="mr-1.5" /> Print
                </Button>
                <Button size="sm" onClick={handleDownloadPdf} className="bg-[#0B2A5B] hover:bg-[#1a3d7a] text-white rounded-xl">
                  <Download size={14} className="mr-1.5" /> Download PDF
                </Button>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="p-1 ml-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-2 bg-white print:p-0 print:overflow-visible">
              <div id="invoice-printable-area" className="bg-white text-gray-900 font-sans text-sm px-8 pt-4 pb-8 max-w-4xl mx-auto">
                {/* Header: Logo and Title */}
                <div className="flex justify-between items-start mb-10">
                  <div className="flex flex-col gap-1">
                    <img
                      src="/F-LOGO--RED.png"
                      alt="FinTrade Logo"
                      style={{ height: "48px", objectFit: "contain", display: "block" }}
                      className="mb-2"
                    />
                    <div className="font-bold text-[#0B2A5B] tracking-wide text-lg">FT EDUTECH</div>
                    <div className="text-gray-500 text-xs">Professional Trading Education</div>
                  </div>
                  <div className="text-right">
                    <h1 className="text-4xl font-light text-gray-300 tracking-wider mb-2">INVOICE</h1>
                    <div className="text-gray-600">
                      <span className="font-semibold text-gray-800">Invoice No:</span> {selectedInvoice.invoiceNumber}
                    </div>
                    <div className="text-gray-600">
                      <span className="font-semibold text-gray-800">Date:</span> {selectedInvoice.purchaseDate}
                    </div>
                  </div>
                </div>

                {/* Billing Info & Payment Details */}
                <div className="flex justify-between items-start border-t border-b border-gray-100 py-6 mb-8">
                  <div className="w-1/2 pr-4">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Billed To</h3>
                    <div className="font-semibold text-lg text-[#0B2A5B]">{selectedStudent.full_name}</div>
                    <div className="text-gray-600 mt-1">{selectedStudent.email}</div>
                    <div className="text-gray-500 text-xs mt-1">Student ID: FT-ST-{selectedStudent.id}</div>
                  </div>
                  <div className="w-1/2 pl-4 border-l border-gray-100">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Payment Details</h3>
                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                      <div className="text-gray-500">Status</div>
                      <div className="font-semibold text-emerald-600 text-right">PAID</div>
                      
                      <div className="text-gray-500">Method</div>
                      <div className="font-medium text-gray-800 text-right">{selectedInvoice.paymentMethod}</div>
                      
                      <div className="text-gray-500">Transaction ID</div>
                      <div className="font-mono text-xs text-gray-600 text-right truncate" title={selectedInvoice.paymentId}>
                        {selectedInvoice.paymentId}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Items Table */}
                <div className="mb-8">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b-2 border-gray-100">
                        <th className="py-3 font-semibold text-gray-500 text-xs uppercase w-[70%]">Description</th>
                        <th className="py-3 font-semibold text-gray-500 text-xs uppercase text-right w-[30%]">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      <tr>
                        <td className="py-4">
                          <div className="font-semibold text-[#0B2A5B] text-base">{selectedInvoice.courseTitle}</div>
                          <div className="text-xs text-gray-500 mt-1">Professional Trading Program - Lifetime Access & Mentor Support</div>
                        </td>
                        <td className="py-4 text-right font-medium text-gray-800">₹{formatCurrency(selectedInvoice.originalPrice)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Totals section */}
                <div className="flex justify-between items-start">
                  {/* Left: Declaration */}
                  <div className="w-1/2 pr-12 text-xs text-gray-500 space-y-4">
                    <div>
                      <span className="font-bold text-gray-700 block mb-1">Declaration:</span>
                      We declare that this invoice shows the actual price of the goods or services described and that all particulars are true and correct.
                    </div>
                    <div className="italic text-gray-400">
                      This is a computer-generated tax invoice and requires no signature.
                    </div>
                  </div>

                  {/* Right: Calculations */}
                  <div className="w-1/2 bg-gray-50 rounded-xl p-5">
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between text-gray-600">
                        <span>Base Course Fee</span>
                        <span>₹{formatCurrency(selectedInvoice.originalPrice)}</span>
                      </div>
                      {selectedInvoice.discountAmount > 0 && (
                        <div className="flex justify-between text-emerald-600">
                          <span>Discount Applied{selectedInvoice.couponCode ? ` (${selectedInvoice.couponCode})` : ""}</span>
                          <span>-₹{formatCurrency(selectedInvoice.discountAmount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-end pt-3 border-t border-gray-200 mt-2">
                        <span className="font-bold text-gray-800 text-base">Total Amount Paid</span>
                        <span className="font-bold text-[#D50032] text-xl">₹{formatCurrency(selectedInvoice.amount)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Address */}
                <div className="mt-16 pt-6 border-t border-gray-100 text-center text-xs text-gray-400 flex flex-col gap-1">
                  <div className="font-semibold text-gray-500">FT EDUTECH</div>
                  <div>10th Floor, Shivalik Complex, Nr. Panchvati Circle, Opp. Bank of Baroda, Ambawadi, Ahmedabad, Gujarat - 380006</div>
                  <div>GSTIN: 24AALFF2921N1Z9 &nbsp;|&nbsp; accounts@thefintrade.com</div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Create Student Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden flex flex-col shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
              <div>
                <h3 className="text-xl font-bold text-[#0B2A5B]">Create New Student</h3>
                <p className="text-xs text-[#0B2A5B]/60 mt-1">Credentials will be emailed to the student.</p>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-400 hover:bg-white hover:text-gray-900 rounded-full p-2 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-semibold text-[#0B2A5B] block mb-1">Full Name *</label>
                <Input value={createFormData.full_name} onChange={e => setCreateFormData({...createFormData, full_name: e.target.value})} placeholder="E.g. Rahul Kumar" />
              </div>
              <div>
                <label className="text-sm font-semibold text-[#0B2A5B] block mb-1">Email * (Username)</label>
                <Input type="email" value={createFormData.email} onChange={e => setCreateFormData({...createFormData, email: e.target.value})} placeholder="E.g. rahul@example.com" />
              </div>
              <div>
                <label className="text-sm font-semibold text-[#0B2A5B] block mb-1">Password *</label>
                <Input type="password" value={createFormData.password} onChange={e => setCreateFormData({...createFormData, password: e.target.value})} placeholder="At least 8 characters" />
              </div>
              <div>
                <label className="text-sm font-semibold text-[#0B2A5B] block mb-1">Phone *</label>
                <Input value={createFormData.phone} onChange={e => setCreateFormData({...createFormData, phone: e.target.value})} placeholder="10-digit mobile number" />
              </div>
              <div>
                <label className="text-sm font-semibold text-[#0B2A5B] block mb-1">City (Optional)</label>
                <Input value={createFormData.city} onChange={e => setCreateFormData({...createFormData, city: e.target.value})} placeholder="E.g. Mumbai" />
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex gap-4">
              <Button onClick={() => setIsCreateModalOpen(false)} variant="outline" className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleCreateStudent} disabled={isCreating} className="flex-1 bg-[#0B2A5B] text-white hover:bg-[#1a3d7a]">
                {isCreating ? "Creating..." : "Create Student"}
              </Button>
            </div>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}
