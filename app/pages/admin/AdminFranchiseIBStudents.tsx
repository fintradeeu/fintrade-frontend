import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import DashboardLayout from "../../components/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../components/ui/dialog";
import { Eye, FileText, Download, CheckCircle, Clock, ArrowLeft, FileSpreadsheet, ShieldCheck } from "lucide-react";
import api from "../../services/api";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import PerformKycModal from "../../components/PerformKycModal";
import InvoiceModal from "../../components/InvoiceModal";

export default function AdminFranchiseIBStudents() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [students, setStudents] = useState<any[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [ibDetails, setIbDetails] = useState<any>(null);

  // Student details modal states
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [detailsTab, setDetailsTab] = useState<"profile" | "courses" | "invoices">("profile");

  // Perform eKYC modal states
  const [kycStudent, setKycStudent] = useState<any | null>(null);
  const [showKycModal, setShowKycModal] = useState(false);

  // Invoice modal states
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [selectedInvoiceStudent, setSelectedInvoiceStudent] = useState<any | null>(null);

  useEffect(() => {
    if (id) {
      fetchStudents();
    }
  }, [id]);

  const fetchStudents = async () => {
    setStudentsLoading(true);
    try {
      const res = await api.get(`/admin/franchise-ibs/${id}/students`);
      setStudents(res.data.data || []);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to load students");
    } finally {
      setStudentsLoading(false);
    }
  };

  const exportToExcel = () => {
    if (students.length === 0) {
      toast.error("No student data available to export.");
      return;
    }

    const rows = students.map((r: any) => ({
      "Student Name": r.student_name || "",
      "Email": r.student_email || "",
      "Phone": r.mobile_no || "",
      "City": r.city || "",
      "Enrolled Courses": r.enrolled_courses?.join(", ") || r.course_title || "",
      "Enrollment Status": r.enrolled || r.course_id || r.course_title ? "Enrolled" : "Pending",
      "Payment Status": r.payment_status || "Unpaid",
      "Balance Due (₹)": r.balance_due ?? 0,
      "Total Paid (₹)": r.total_paid ?? r.price_paid ?? 0,
      "Total Course Price (₹)": r.total_course_price ?? 0,
      "KYC Done": r.kyc_done ? "Yes" : "No",
      "Fees Paid": r.fees_paid ? "Yes" : "No",
      "Registration Done": r.registered ? "Yes" : "No",
      "Entrance Exam Given": r.entrance_exam_given ? "Yes" : "No",
      "Entrance Exam Passed": r.entrance_exam_passed ? "Yes" : "No",
      "Course Completed": r.course_completed ? "Yes" : "No",
      "Joined Date": r.created_at ? new Date(r.created_at).toLocaleDateString("en-IN") : "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "IB Students");

    // Auto-size columns
    const colWidths = Object.keys(rows[0] || {}).map((key) => ({
      wch: Math.max(key.length, ...rows.map((r: any) => String(r[key] || "").length)) + 2,
    }));
    worksheet["!cols"] = colWidths;

    const fileName = `franchise_ib_${id}_students_${new Date().toISOString().split("T")[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    toast.success("Student data exported to Excel successfully!");
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full bg-[#F4F1EA] p-4 md:p-6 pb-20 md:pb-6 relative overflow-y-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="sm" onClick={() => navigate("/admin/franchise-ibs")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to IBs
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-[#0B2A5B]">Franchise IB Students</h1>
            <p className="text-sm text-gray-500 mt-1">Viewing all students referred by this IB. ({students.length} total)</p>
          </div>
          <Button
            onClick={exportToExcel}
            disabled={studentsLoading || students.length === 0}
            className="bg-green-600 hover:bg-green-700 text-white gap-2 shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Export to Excel
          </Button>
        </div>

        <Card className="flex-1 bg-white border border-[#E5E0D8] rounded-xl shadow-sm overflow-hidden flex flex-col p-4">
          <div className="flex-1 overflow-auto rounded-lg border border-gray-200">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#F4F1EA] hover:bg-[#F4F1EA]">
                  <TableHead className="text-[#0B2A5B] font-semibold sticky top-0 bg-[#F4F1EA] z-10">Student Name</TableHead>
                  <TableHead className="text-[#0B2A5B] font-semibold sticky top-0 bg-[#F4F1EA] z-10">Contact Info</TableHead>
                  <TableHead className="text-[#0B2A5B] font-semibold sticky top-0 bg-[#F4F1EA] z-10">Course</TableHead>
                  <TableHead className="text-[#0B2A5B] font-semibold sticky top-0 bg-[#F4F1EA] z-10">Status</TableHead>
                  <TableHead className="text-[#0B2A5B] font-semibold sticky top-0 bg-[#F4F1EA] z-10">Payment Status</TableHead>
                  <TableHead className="text-[#0B2A5B] font-semibold sticky top-0 bg-[#F4F1EA] z-10">Timeline Progress</TableHead>
                  <TableHead className="text-[#0B2A5B] font-semibold text-right sticky top-0 bg-[#F4F1EA] z-10">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentsLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">Loading Students...</TableCell>
                  </TableRow>
                ) : students.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No students referred yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  students.map((r) => {
                    const isEnrolled = Boolean(r.enrolled || r.course_id || r.course_title);
                    const isDefaulter = r.pending_amount > 0 && r.is_overdue;
                    return (
                      <TableRow key={r.id} className={isDefaulter ? "bg-red-50/50 hover:bg-red-50" : "hover:bg-gray-50"}>
                        <TableCell className="font-semibold text-[#0B2A5B]">
                          <div>{r.student_name}</div>
                          <div className="text-xs text-gray-500 mt-1">Joined: {new Date(r.created_at).toLocaleDateString()}</div>
                          {isDefaulter && (
                            <Badge className="bg-red-100 text-red-700 mt-2 border-none">Payment Overdue</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-[#0B2A5B]/70">
                          <div>{r.student_email}</div>
                          <div className="text-xs">{r.mobile_no}</div>
                        </TableCell>
                        <TableCell className="text-[#0B2A5B]">
                          {r.enrolled_courses?.length ? r.enrolled_courses.join(", ") : r.course_title || "Pending Enrollment"}
                        </TableCell>
                        <TableCell>
                          <Badge className={isEnrolled ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}>
                            {isEnrolled ? "Enrolled" : "Pending"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={
                            r.payment_status === "Full Paid" ? "bg-green-100 text-green-700" : 
                            r.payment_status === "Partial Paid" ? "bg-orange-100 text-orange-700" : "bg-red-100 text-red-700"
                          }>
                            {r.payment_status || "Unpaid"}
                          </Badge>
                          {r.balance_due > 0 && <div className="text-xs text-red-500 mt-1">Due: ₹{r.balance_due}</div>}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1.5 min-w-[260px]">
                            <Badge className={r.registered ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}>Registration</Badge>
                            <Badge
                              title={r.entrance_exam_course_title ? `${r.entrance_exam_course_title} - ${r.entrance_exam_score ?? 0}%` : undefined}
                              className={r.entrance_exam_given ? (r.entrance_exam_passed ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700") : "bg-gray-100 text-gray-600"}
                            >
                              Entrance Exam
                            </Badge>
                            <Badge className={r.kyc_done ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}>KYC</Badge>
                            <Badge className={r.fees_paid ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}>Fees Paid</Badge>
                            <Badge className={r.course_completed ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}>Completed</Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {r.kyc_done ? (
                              <Badge className="bg-green-100 text-green-700 font-semibold border border-green-200 flex items-center gap-1 text-xs py-1.5 px-3">
                                <CheckCircle className="w-4 h-4 text-green-600" /> KYC Done
                              </Badge>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setKycStudent({
                                    id: r.student_id || r.user_id || r.id,
                                    full_name: r.student_name,
                                    email: r.student_email,
                                    phone: r.mobile_no,
                                    course_id: r.course_id,
                                  });
                                  setShowKycModal(true);
                                }}
                                className="text-green-700 border-green-300 hover:bg-green-50"
                              >
                                <ShieldCheck className="w-4 h-4 mr-1.5" />
                                Perform eKYC
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedStudent(r);
                                setDetailsTab("profile");
                              }}
                              className="text-[#0B2A5B] border-[#0B2A5B] hover:bg-[#0B2A5B] hover:text-white"
                            >
                              <Eye className="w-4 h-4 mr-1.5" />
                              Details
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      {/* View Details Modal for specific Student (Nested) */}
      <Dialog open={!!selectedStudent} onOpenChange={(open) => !open && setSelectedStudent(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl text-[#0B2A5B]">Student Details</DialogTitle>
            <DialogDescription>
              Detailed view of {selectedStudent?.student_name}'s progress and invoices.
            </DialogDescription>
          </DialogHeader>

          {selectedStudent && (
            <div className="mt-4">
              <div className="flex border-b border-gray-200 mb-6">
                <button
                  className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
                    detailsTab === "profile" ? "border-[#0B2A5B] text-[#0B2A5B]" : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setDetailsTab("profile")}
                >
                  Profile
                </button>
                <button
                  className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
                    detailsTab === "courses" ? "border-[#0B2A5B] text-[#0B2A5B]" : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setDetailsTab("courses")}
                >
                  Course Progress
                </button>
                <button
                  className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
                    detailsTab === "invoices" ? "border-[#0B2A5B] text-[#0B2A5B]" : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setDetailsTab("invoices")}
                >
                  Invoices
                </button>
              </div>

              {detailsTab === "profile" && (
                <div className="grid grid-cols-2 gap-6 bg-gray-50 p-6 rounded-xl border border-gray-100">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Full Name</p>
                    <p className="font-semibold text-lg text-[#0B2A5B]">{selectedStudent.student_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Email</p>
                    <p className="font-semibold text-lg text-[#0B2A5B]">{selectedStudent.student_email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Phone Number</p>
                    <p className="font-semibold text-[#0B2A5B]">{selectedStudent.mobile_no || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">City</p>
                    <p className="font-semibold text-[#0B2A5B]">{selectedStudent.city || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Status</p>
                    <Badge className={selectedStudent.enrolled ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}>
                      {selectedStudent.enrolled ? "Enrolled" : "Pending Enrollment"}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Joined Date</p>
                    <p className="font-semibold text-[#0B2A5B]">{new Date(selectedStudent.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              )}

              {detailsTab === "courses" && (
                <div className="space-y-4">
                  {!selectedStudent.course_progress || selectedStudent.course_progress.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                      No course progress data available.
                    </div>
                  ) : (
                    selectedStudent.course_progress.map((cp: any, idx: number) => (
                      <div key={idx} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-bold text-[#0B2A5B]">{cp.title}</h4>
                          {cp.progress >= 100 ? (
                            <Badge className="bg-green-100 text-green-700 border-none">
                              <CheckCircle className="w-3 h-3 mr-1" /> Completed
                            </Badge>
                          ) : (
                            <Badge className="bg-blue-100 text-blue-700 border-none">
                              <Clock className="w-3 h-3 mr-1" /> In Progress
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${cp.progress >= 100 ? 'bg-green-500' : 'bg-blue-500'}`} 
                              style={{ width: `${Math.min(100, Math.max(0, cp.progress))}%` }} 
                            />
                          </div>
                          <span className="text-sm font-semibold text-gray-700 w-12 text-right">
                            {cp.progress}%
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {detailsTab === "invoices" && (
                <div className="space-y-4">
                  {(selectedStudent.pending_amount !== undefined || selectedStudent.total_course_price !== undefined) && selectedStudent.transactions?.length > 0 && (
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex justify-between items-center shadow-sm">
                      <div>
                        <p className="text-sm text-gray-500 font-medium mb-1">Total Course Price</p>
                        <p className="text-xl font-bold text-[#0B2A5B]">₹{(selectedStudent.total_course_price || 0).toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500 font-medium mb-1">Pending Balance</p>
                        <p className={`text-xl font-bold ${selectedStudent.pending_amount > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                          ₹{(selectedStudent.pending_amount || 0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}
                  {!selectedStudent.transactions || selectedStudent.transactions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                      No transactions found for this student.
                    </div>
                  ) : (
                    selectedStudent.transactions.map((tx: any, idx: number) => (
                      <div key={idx} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-[#0B2A5B]">{tx.course_title || "Course Enrollment"}</h4>
                            <Badge className={
                              tx.status === "success" || tx.status === "completed" ? "bg-green-100 text-green-700 border-none" : 
                              tx.status === "pending_verification" ? "bg-orange-100 text-orange-700 border-none" :
                              "bg-red-100 text-red-700 border-none"
                            }>
                              {tx.status === "pending_verification" ? "Pending Verification" : tx.status.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            TXN ID: {tx.txnid}
                            {tx.reference_number && ` • Ref: ${tx.reference_number}`}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Date: {new Date(tx.date).toLocaleDateString()} • Mode: {(tx.payment_mode || "N/A").toUpperCase()}
                          </p>
                        </div>
                        <div className="flex items-center gap-4 md:flex-col md:items-end">
                          <span className="text-xl font-bold text-gray-900">₹{tx.amount.toLocaleString()}</span>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-[#0B2A5B] border-[#0B2A5B]/30 hover:bg-blue-50 font-medium"
                            onClick={() => {
                              setSelectedInvoiceStudent({
                                id: selectedStudent.student_id || selectedStudent.id,
                                full_name: selectedStudent.student_name,
                                email: selectedStudent.email,
                                phone: selectedStudent.phone,
                              });
                              setSelectedInvoice({
                                invoiceNumber: `FT-2026-${1000 + (selectedStudent.student_id || selectedStudent.id || 1)}`,
                                purchaseDate: new Date(tx.date || Date.now()).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
                                courseTitle: tx.course_title || "Professional Trading Course",
                                originalPrice: selectedStudent.total_course_price || tx.amount || 0,
                                discountAmount: (selectedStudent.total_course_price || 0) > tx.amount ? (selectedStudent.total_course_price - tx.amount) : 0,
                                amountPaid: tx.amount || 0,
                                paymentMethod: (tx.payment_mode || "Cash / Cheque / Online").toUpperCase(),
                                paymentId: tx.txnid || tx.reference_number || `TXN${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
                                status: tx.status === "success" || tx.status === "completed" ? "PAID" : tx.status,
                              });
                            }}
                          >
                            <FileText className="w-4 h-4 mr-1.5" />
                            Tax Invoice
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Perform eKYC Modal */}
      {showKycModal && kycStudent && (
        <PerformKycModal
          open={showKycModal}
          onClose={() => {
            setShowKycModal(false);
            setKycStudent(null);
          }}
          onSuccess={() => {
            fetchStudents();
          }}
          student={kycStudent}
        />
      )}

      {/* Tax Invoice Summary Modal */}
      {selectedInvoice && selectedInvoiceStudent && (
        <InvoiceModal
          open={!!selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          student={selectedInvoiceStudent}
          invoice={selectedInvoice}
        />
      )}
    </DashboardLayout>
  );
}
