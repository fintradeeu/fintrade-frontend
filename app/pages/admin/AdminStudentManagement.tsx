import { useState, useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import {
  Search, Download, Eye, X, BookOpen, Clock, AlertCircle, CheckCircle,
  FileText, Calendar, CreditCard, Printer, Shield, ChevronDown, ExternalLink,
  Laptop, Smartphone, Globe, Tag
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
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewTab, setViewTab] = useState<"profile" | "kyc" | "courses" | "sessions">("profile");

  const [studentKyc, setStudentKyc] = useState<any | null>(null);
  const [kycLoading, setKycLoading] = useState(false);
  
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);

  const fetchStudents = async () => {
    try {
      const res = await api.get("/admin/purchased-students?limit=200");
      setStudents(res.data.users || []);
    } catch (err) {
      console.error("Failed to fetch purchased students:", err);
      toast.error("Failed to load students list.");
    } finally {
      setLoading(false);
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

  const filtered = students.filter(
    (s) =>
      s.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout role="admin">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#0B2A5B] mb-2">Student Management</h1>
          <p className="text-[#0B2A5B]/70">Track students who have purchased courses, view their invoices, KYC status, and session activity logs.</p>
        </div>
        <Button onClick={exportToCSV} className="bg-[#C2A86A] text-[#0B2A5B] hover:bg-[#d4bd8a] rounded-xl flex items-center gap-2">
          <Download size={16} /> Export CSV
        </Button>
      </div>

      {/* Search Bar */}
      <Card className="p-6 bg-white shadow-lg mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0B2A5B]/40" size={20} />
          <Input
            placeholder="Search students by name, email or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-[#F4F1EA] border-[#0B2A5B]/20 rounded-xl"
          />
        </div>
      </Card>

      {/* Table */}
      <Card className="p-6 bg-white shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-10 text-center text-[#0B2A5B]/70 font-semibold">Loading student records...</div>
          ) : filtered.length === 0 ? (
            <div className="py-10 text-center text-[#0B2A5B]/70 font-semibold">No students found with active purchases.</div>
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
                      <Button
                        onClick={() => handleOpenView(s)}
                        size="sm"
                        variant="outline"
                        className="border-[#0B2A5B] text-[#0B2A5B] hover:bg-[#0B2A5B]/10 rounded-xl"
                      >
                        <Eye size={14} className="mr-1" /> View Details
                      </Button>
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

            <div className="flex-1 overflow-y-auto p-6 bg-white print:p-0 print:overflow-visible">
              <div id="invoice-printable-area" className="border-[1.5px] border-black text-black font-mono text-[11px] leading-tight p-4 bg-white">
                {/* Header Logo section */}
                <div className="flex items-center gap-2 pb-3 border-b border-black">
                  <div className="font-bold text-base uppercase tracking-wide">FINTRADE EDUTECH</div>
                  <div className="border-l border-gray-400 pl-2">
                    <div className="text-[8px] text-gray-500 uppercase tracking-widest">Professional Trading Education</div>
                  </div>
                </div>

                <div className="text-center font-bold text-sm border-b border-black py-1.5 uppercase bg-slate-50">
                  Tax Invoice
                </div>

                <div className="grid grid-cols-2 border-b border-black py-2">
                  <div className="space-y-1 pr-2">
                    <span className="text-[9px] text-gray-500 block uppercase">Buyer (Billed to)</span>
                    <div className="font-bold text-xs">{selectedStudent.full_name}</div>
                    <p className="text-gray-700">{selectedStudent.email}</p>
                    <p className="text-gray-700">Student ID: FT-ST-{selectedStudent.id}</p>
                  </div>
                  <div className="space-y-1 pl-2 border-l border-black">
                    <div className="grid grid-cols-2 gap-y-1">
                      <span className="text-[9px] text-gray-500 uppercase">Invoice No:</span>
                      <span className="font-bold text-right">{selectedInvoice.invoiceNumber}</span>
                      <span className="text-[9px] text-gray-500 uppercase">Dated:</span>
                      <span className="font-bold text-right">{selectedInvoice.purchaseDate}</span>
                      <span className="text-[9px] text-gray-500 uppercase">Payment:</span>
                      <span className="font-bold text-right">{selectedInvoice.paymentMethod}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 border-b border-black py-2">
                  <div>
                    <span className="text-[9px] text-gray-500 block uppercase">Transaction ID</span>
                    <span className="font-bold font-mono text-[10px] break-all">{selectedInvoice.paymentId}</span>
                  </div>
                  <div className="pl-2 border-l border-black">
                    <span className="text-[9px] text-gray-500 block uppercase">Status</span>
                    <span className="font-bold text-green-700">PAID</span>
                  </div>
                </div>

                <table className="w-full text-left border-collapse border-b border-black mt-2">
                  <thead>
                    <tr className="border-b border-black bg-slate-50 font-bold text-[9px] uppercase">
                      <th className="p-1.5 w-[10%]">Sl.</th>
                      <th className="p-1.5 w-[60%]">Description of Services</th>
                      <th className="p-1.5 text-right w-[30%]">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-1.5">1</td>
                      <td className="p-1.5">
                        <span className="font-bold">{selectedInvoice.courseTitle}</span>
                        <div className="text-[9px] text-gray-400">FinTrade LMS Lifetime Access & Mentor Support</div>
                      </td>
                      <td className="p-1.5 text-right font-bold">₹{formatCurrency(selectedInvoice.originalPrice)}</td>
                    </tr>
                    {selectedInvoice.discountAmount > 0 && (
                      <tr className="border-t border-dashed border-gray-300">
                        <td className="p-1.5"></td>
                        <td className="p-1.5 text-green-600 font-semibold">
                          Discount Applied{selectedInvoice.couponCode ? ` (${selectedInvoice.couponCode})` : ""}
                        </td>
                        <td className="p-1.5 text-right text-green-600 font-bold">-₹{formatCurrency(selectedInvoice.discountAmount)}</td>
                      </tr>
                    )}
                    <tr className="border-t border-black bg-slate-50 font-bold">
                      <td></td>
                      <td className="p-1.5 text-right">Total Net Amount Paid:</td>
                      <td className="p-1.5 text-right text-[#D50032] text-xs">₹{formatCurrency(selectedInvoice.amount)}</td>
                    </tr>
                  </tbody>
                </table>

                <div className="mt-4 text-[8px] text-gray-400 text-center uppercase tracking-wider">
                  Thank you for your enrollment. This is a computer-generated tax invoice and requires no signature.
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}
