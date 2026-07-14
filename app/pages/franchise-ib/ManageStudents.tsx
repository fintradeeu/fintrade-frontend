import { useState, useEffect, useMemo } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../components/ui/dialog";
import { Eye, FileText, Download, CheckCircle, Clock } from "lucide-react";
import api from "../../services/api";
import RegisterStudentModal from "../../components/RegisterStudentModal";

export default function ManageStudents() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "enrolled">("all");
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [detailsTab, setDetailsTab] = useState<"profile" | "courses" | "invoices">("profile");

  const fetchStudents = async () => {
    try {
      const res = await api.get("/franchise-ibs/students");
      setStudents(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch students:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const filteredStudents = useMemo(() => {
    const start = fromDate ? new Date(`${fromDate}T00:00:00`) : null;
    const end = toDate ? new Date(`${toDate}T23:59:59`) : null;

    return students.filter((student) => {
      const referralDate = new Date(student.created_at);
      const isEnrolled = Boolean(student.enrolled || student.course_id || student.course_title);

      if (start && referralDate < start) return false;
      if (end && referralDate > end) return false;
      if (statusFilter === "pending" && isEnrolled) return false;
      if (statusFilter === "enrolled" && !isEnrolled) return false;

      return true;
    });
  }, [students, fromDate, toDate, statusFilter]);

  const clearFilters = () => {
    setFromDate("");
    setToDate("");
    setStatusFilter("all");
  };

  return (
    <DashboardLayout role="franchise_ib">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#0B2A5B] mb-2">Manage Students</h1>
          <p className="text-[#0B2A5B]/70">Track progress of all students across your entire network.</p>
        </div>
        <Button onClick={() => setIsRegisterModalOpen(true)} className="bg-[#C2A86A] text-white hover:bg-[#a68c53]">
          Register Student
        </Button>
      </div>

      <Card className="p-6 bg-white shadow-lg rounded-xl overflow-hidden">
        <div className="flex flex-col gap-4 mb-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-[#0B2A5B]">Student Progress Tracker</h2>
            <span className="text-sm font-semibold text-[#0B2A5B]/60">
              {filteredStudents.length} of {students.length}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3">
            <div>
              <label className="text-xs font-semibold text-[#0B2A5B]/70">From Date</label>
              <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="mt-1 bg-[#F4F1EA]" />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#0B2A5B]/70">To Date</label>
              <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="mt-1 bg-[#F4F1EA]" />
            </div>
            <div className="flex items-end gap-2">
              <Button type="button" variant={statusFilter === "pending" ? "default" : "outline"} onClick={() => setStatusFilter(statusFilter === "pending" ? "all" : "pending")} className={statusFilter === "pending" ? "bg-orange-600 text-white hover:bg-orange-700" : "bg-white text-[#0B2A5B]"}>
                Pending
              </Button>
              <Button type="button" variant={statusFilter === "enrolled" ? "default" : "outline"} onClick={() => setStatusFilter(statusFilter === "enrolled" ? "all" : "enrolled")} className={statusFilter === "enrolled" ? "bg-green-700 text-white hover:bg-green-800" : "bg-white text-[#0B2A5B]"}>
                Enrolled
              </Button>
              <Button type="button" variant="outline" onClick={clearFilters} className="bg-white text-[#0B2A5B]">
                Clear
              </Button>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#F4F1EA] hover:bg-[#F4F1EA]">
                <TableHead className="text-[#0B2A5B] font-semibold">Student Name</TableHead>
                <TableHead className="text-[#0B2A5B] font-semibold">Contact Info</TableHead>
                <TableHead className="text-[#0B2A5B] font-semibold">Course</TableHead>
                <TableHead className="text-[#0B2A5B] font-semibold">Status</TableHead>
                <TableHead className="text-[#0B2A5B] font-semibold">Timeline Progress</TableHead>
                <TableHead className="text-[#0B2A5B] font-semibold">Joined At</TableHead>
                <TableHead className="text-[#0B2A5B] font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">Loading...</TableCell>
                </TableRow>
              ) : students.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No students found.
                  </TableCell>
                </TableRow>
              ) : filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No students match the selected filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map((r) => {
                  const isEnrolled = Boolean(r.enrolled || r.course_id || r.course_title);
                  return (
                    <TableRow key={r.id} className="hover:bg-gray-50">
                      <TableCell className="font-semibold text-[#0B2A5B]">{r.student_name}</TableCell>
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
                      <TableCell className="text-[#0B2A5B]">
                        {new Date(r.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedStudent(r);
                            setDetailsTab("profile");
                          }}
                          className="text-[#0B2A5B] border-[#0B2A5B] hover:bg-[#0B2A5B] hover:text-white"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
      
      {isRegisterModalOpen && (
        <RegisterStudentModal
          onClose={() => setIsRegisterModalOpen(false)}
          onSuccess={() => {
            setIsRegisterModalOpen(false);
            fetchStudents();
          }}
          apiPrefix="/franchise-ibs"
        />
      )}
      
      {/* View Details Modal */}
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
                            className="text-[#0B2A5B]"
                            onClick={() => {
                              // Instead of an API call for PDF, we generate a print view
                              const printWindow = window.open('', '_blank');
                              if (printWindow) {
                                printWindow.document.write(`
                                  <html>
                                    <head>
                                      <title>Invoice - ${tx.txnid}</title>
                                      <style>
                                        body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; color: #333; }
                                        .header { border-bottom: 2px solid #0B2A5B; padding-bottom: 20px; margin-bottom: 30px; }
                                        .logo { font-size: 24px; font-weight: bold; color: #0B2A5B; }
                                        .row { display: flex; justify-content: space-between; margin-bottom: 10px; }
                                        .label { color: #666; font-size: 14px; }
                                        .value { font-weight: 500; }
                                        .total { font-size: 20px; font-weight: bold; margin-top: 30px; border-top: 1px solid #ccc; padding-top: 20px; }
                                      </style>
                                    </head>
                                    <body>
                                      <div class="header">
                                        <div class="logo">FinTrade LMS - Invoice</div>
                                      </div>
                                      <div class="row"><span class="label">Invoice No:</span> <span class="value">${tx.txnid}</span></div>
                                      <div class="row"><span class="label">Date:</span> <span class="value">${new Date(tx.date).toLocaleString()}</span></div>
                                      <div class="row"><span class="label">Student Name:</span> <span class="value">${selectedStudent.student_name}</span></div>
                                      <div class="row"><span class="label">Course:</span> <span class="value">${tx.course_title || "Course Enrollment"}</span></div>
                                      <div class="row"><span class="label">Payment Mode:</span> <span class="value">${(tx.payment_mode || "Online").toUpperCase()}</span></div>
                                      <div class="row"><span class="label">Status:</span> <span class="value">${tx.status.toUpperCase()}</span></div>
                                      ${tx.reference_number ? `<div class="row"><span class="label">Reference:</span> <span class="value">${tx.reference_number}</span></div>` : ''}
                                      <div class="row total"><span>Total Paid:</span> <span>₹${tx.amount.toLocaleString()}</span></div>
                                      
                                      <div style="margin-top: 50px; font-size: 12px; color: #888;">
                                        This is a computer-generated invoice and requires no physical signature.
                                      </div>
                                    </body>
                                  </html>
                                `);
                                printWindow.document.close();
                                setTimeout(() => printWindow.print(), 500);
                              }
                            }}
                          >
                            <Download className="w-4 h-4 mr-1.5" />
                            Print Invoice
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
    </DashboardLayout>
  );
}
