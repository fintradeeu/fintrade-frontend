import { useState, useEffect, useMemo } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../components/ui/dialog";
import { Eye, FileText, Download, CheckCircle, Clock, Search, Handshake, Users, EyeOff, Plus } from "lucide-react";
import { Label } from "../../components/ui/label";
import { DialogFooter } from "../../components/ui/dialog";
import api from "../../services/api";
import { toast } from "sonner";

export default function AdminFranchiseIBs() {
  const [ibs, setIbs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Student modal states
  const [selectedIB, setSelectedIB] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  
  // Student details modal states
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [detailsTab, setDetailsTab] = useState<"profile" | "courses" | "invoices">("profile");


  // Add IB modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [addForm, setAddForm] = useState({
    full_name: "",
    email: "",
    mobile_no: "",
    password: "",
    confirm_password: "",
    pan_number: "",
    aadhaar_number: "",
    bank_account_holder_name: "",
    bank_name: "",
    bank_account_number: "",
    bank_ifsc_code: "",
  });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState("");

  const updateAddForm = (field: string, value: string) => {
    setAddForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError("");

    if (addForm.password !== addForm.confirm_password) {
      setAddError("Password and confirm password do not match.");
      return;
    }

    setAddLoading(true);
    try {
      const payload = {
        full_name: addForm.full_name,
        email: addForm.email,
        mobile_no: addForm.mobile_no,
        password: addForm.password,
        pan_number: addForm.pan_number || undefined,
        aadhaar_number: addForm.aadhaar_number || undefined,
        bank_account_holder_name: addForm.bank_account_holder_name || undefined,
        bank_name: addForm.bank_name || undefined,
        bank_account_number: addForm.bank_account_number || undefined,
        bank_ifsc_code: addForm.bank_ifsc_code || undefined,
      };

      const res = await api.post("/franchise-ibs/", payload);
      toast.success(`Franchise IB created successfully! Code: ${res.data.referral_code}`);
      setIsAddModalOpen(false);
      setAddForm({
        full_name: "",
        email: "",
        mobile_no: "",
        password: "",
        confirm_password: "",
        pan_number: "",
        aadhaar_number: "",
        bank_account_holder_name: "",
        bank_name: "",
        bank_account_number: "",
        bank_ifsc_code: "",
      });
      fetchIBs();
    } catch (err: any) {
      let message = "Failed to create Franchise IB.";
      if (err.response?.data?.detail) {
        message = Array.isArray(err.response.data.detail)
          ? err.response.data.detail.map((item: any) => item.msg).join(", ")
          : err.response.data.detail;
      }
      setAddError(message);
    } finally {
      setAddLoading(false);
    }
  };

  const fetchIBs = async () => {
    try {
      const res = await api.get("/admin/franchise-ibs");
      setIbs(res.data.data || []);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to load Franchise IBs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIBs();
  }, []);

  const filteredIBs = useMemo(() => {
    const q = searchTerm.toLowerCase();
    if (!q) return ibs;
    return ibs.filter(ib => 
      ib.user_name?.toLowerCase().includes(q) ||
      ib.user_email?.toLowerCase().includes(q) ||
      ib.referral_code?.toLowerCase().includes(q)
    );
  }, [ibs, searchTerm]);

  const handleViewStudents = async (ib: any) => {
    setSelectedIB(ib);
    setStudentsLoading(true);
    setStudents([]);
    try {
      const res = await api.get(`/admin/franchise-ibs/${ib.id}/students`);
      setStudents(res.data.data || []);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to load students");
    } finally {
      setStudentsLoading(false);
    }
  };

  return (
    <DashboardLayout role="admin">
      <div className="mb-8 flex flex-col md:flex-row md:items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#0B2A5B] flex items-center gap-3">
            <Handshake className="w-8 h-8 text-[#C2A86A]" />
            Manage Franchise IBs
          </h1>
          <p className="text-[#0B2A5B]/70 mt-2">
            View all Franchise IB partners, their registered students, and detailed revenue tracking.
          </p>
        </div>

        <Button onClick={() => setIsAddModalOpen(true)} className="bg-[#D50032] hover:bg-[#D50032]/90 text-white mt-4 md:mt-0">
          <Plus className="w-4 h-4 mr-2" /> Add Franchise IB
        </Button>
      </div>

      <Card className="p-6 bg-white shadow-lg rounded-xl overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <h2 className="text-xl font-bold text-[#0B2A5B]">Franchise Partners</h2>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input 
              placeholder="Search by name, email or code..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-[#F4F1EA] border-none"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#F4F1EA] hover:bg-[#F4F1EA]">
                <TableHead className="text-[#0B2A5B] font-semibold">Franchise Details</TableHead>
                <TableHead className="text-[#0B2A5B] font-semibold">Referral Code</TableHead>
                <TableHead className="text-[#0B2A5B] font-semibold">Total Students</TableHead>
                <TableHead className="text-[#0B2A5B] font-semibold">Total Revenue</TableHead>
                <TableHead className="text-[#0B2A5B] font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">Loading Franchise IBs...</TableCell>
                </TableRow>
              ) : filteredIBs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    No Franchise IBs found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredIBs.map((ib) => (
                  <TableRow key={ib.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="font-semibold text-[#0B2A5B]">{ib.user_name}</div>
                      <div className="text-sm text-[#0B2A5B]/70">{ib.user_email}</div>
                      <div className="text-xs text-gray-400">{ib.phone || "No phone"} • {ib.city || "No city"}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono bg-blue-50 text-blue-700 border-blue-200">
                        {ib.referral_code}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-bold text-gray-700">{ib.total_students_referred}</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-bold text-green-700">₹{(ib.total_revenue_generated || 0).toLocaleString()}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewStudents(ib)}
                        className="text-[#0B2A5B] border-[#0B2A5B] hover:bg-[#0B2A5B] hover:text-white"
                      >
                        <Users className="w-4 h-4 mr-2" />
                        View Students
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* IB's Students Modal */}
      <Dialog open={!!selectedIB} onOpenChange={(open) => !open && setSelectedIB(null)}>
        <DialogContent className="max-w-[90vw] h-[90vh] flex flex-col p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl text-[#0B2A5B]">
              Students for Franchise: {selectedIB?.user_name}
            </DialogTitle>
            <DialogDescription>
              Viewing all students referred by code <strong>{selectedIB?.referral_code}</strong>.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-auto mt-4 rounded-lg border border-gray-200 shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#F4F1EA] hover:bg-[#F4F1EA]">
                  <TableHead className="text-[#0B2A5B] font-semibold sticky top-0 bg-[#F4F1EA] z-10">Student Name</TableHead>
                  <TableHead className="text-[#0B2A5B] font-semibold sticky top-0 bg-[#F4F1EA] z-10">Contact Info</TableHead>
                  <TableHead className="text-[#0B2A5B] font-semibold sticky top-0 bg-[#F4F1EA] z-10">Course</TableHead>
                  <TableHead className="text-[#0B2A5B] font-semibold sticky top-0 bg-[#F4F1EA] z-10">Status</TableHead>
                  <TableHead className="text-[#0B2A5B] font-semibold sticky top-0 bg-[#F4F1EA] z-10">Timeline Progress</TableHead>
                  <TableHead className="text-[#0B2A5B] font-semibold text-right sticky top-0 bg-[#F4F1EA] z-10">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentsLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">Loading Students...</TableCell>
                  </TableRow>
                ) : students.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No students referred yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  students.map((r) => {
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
        </DialogContent>
      </Dialog>

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
                            className="text-[#0B2A5B]"
                            onClick={() => {
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
                                      <div class="row"><span class="label">Total Course Price:</span> <span class="value">₹${(selectedStudent.total_course_price || tx.amount).toLocaleString()}</span></div>
                                      <div class="row total"><span>Total Paid:</span> <span>₹${tx.amount.toLocaleString()}</span></div>
                                      ${selectedStudent.pending_amount > 0 ? `<div class="row" style="color: #ea580c; font-weight: bold; margin-top: 10px;"><span>Pending Balance:</span> <span>₹${selectedStudent.pending_amount.toLocaleString()}</span></div>` : ''}
                                      
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

      {/* Add Franchise IB Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Franchise IB</DialogTitle>
            <DialogDescription>Create a new Franchise IB account. They will be able to log in with these details.</DialogDescription>
          </DialogHeader>

          {addError && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-200">
              {addError}
            </div>
          )}

          <form onSubmit={handleAddSubmit} className="space-y-6 mt-4">
            <div>
              <h3 className="text-lg font-bold text-[#0B2A5B] mb-4">Personal Details</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input required value={addForm.full_name} onChange={(e) => updateAddForm("full_name", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input type="email" required value={addForm.email} onChange={(e) => updateAddForm("email", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Mobile Number</Label>
                  <Input required value={addForm.mobile_no} onChange={(e) => updateAddForm("mobile_no", e.target.value)} />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-[#0B2A5B] mb-4">Login Details</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Password</Label>
                  <div className="relative">
                    <Input type={showPassword ? "text" : "password"} required value={addForm.password} onChange={(e) => updateAddForm("password", e.target.value)} />
                    <button type="button" className="absolute right-3 top-3 text-gray-400 hover:text-gray-600" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Confirm Password</Label>
                  <Input type={showPassword ? "text" : "password"} required value={addForm.confirm_password} onChange={(e) => updateAddForm("confirm_password", e.target.value)} />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-[#0B2A5B] mb-4">KYC Details</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Aadhaar Number (Optional)</Label>
                  <Input value={addForm.aadhaar_number} onChange={(e) => updateAddForm("aadhaar_number", e.target.value)} placeholder="12-digit Aadhaar" />
                </div>
                <div className="space-y-2">
                  <Label>PAN Number (Optional)</Label>
                  <Input value={addForm.pan_number} onChange={(e) => updateAddForm("pan_number", e.target.value)} placeholder="10-character PAN" />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-[#0B2A5B] mb-4">Bank Details</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Account Holder Name (Optional)</Label>
                  <Input value={addForm.bank_account_holder_name} onChange={(e) => updateAddForm("bank_account_holder_name", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Bank Name (Optional)</Label>
                  <Input value={addForm.bank_name} onChange={(e) => updateAddForm("bank_name", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Account Number (Optional)</Label>
                  <Input value={addForm.bank_account_number} onChange={(e) => updateAddForm("bank_account_number", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>IFSC Code (Optional)</Label>
                  <Input value={addForm.bank_ifsc_code} onChange={(e) => updateAddForm("bank_ifsc_code", e.target.value)} />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-[#D50032] hover:bg-[#D50032]/90 text-white" disabled={addLoading}>
                {addLoading ? "Creating..." : "Create Franchise IB"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </DashboardLayout>
  );
}
