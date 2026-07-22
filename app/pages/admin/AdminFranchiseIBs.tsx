import { useState, useEffect, useMemo } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../components/ui/dialog";
import { Eye, FileText, Download, CheckCircle, Clock, Search, Handshake, Users, EyeOff, Plus, FileSpreadsheet, DollarSign, TrendingUp } from "lucide-react";
import { Label } from "../../components/ui/label";
import { DialogFooter } from "../../components/ui/dialog";
import api from "../../services/api";
import { toast } from "sonner";
import * as XLSX from "xlsx";

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
    commission_percentage: "100",
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
        commission_percentage: Number(addForm.commission_percentage),
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
        commission_percentage: "100",
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

  const stats = useMemo(() => {
    let totalRevenue = 0;
    let totalStudents = 0;
    let totalCommission = 0;
    
    ibs.forEach((ib) => {
      totalRevenue += ib.total_revenue_generated || 0;
      totalStudents += ib.total_students_referred || 0;
      totalCommission += ib.commission_revenue || 0;
    });
    
    return { totalRevenue, totalStudents, totalCommission };
  }, [ibs]);

  const handleViewStudents = (ib: any) => {
    window.location.href = `/admin/franchise-ibs/${ib.id}/students`;
  };

  const [exportingAll, setExportingAll] = useState(false);
  const exportAllToExcel = async () => {
    if (ibs.length === 0) {
      toast.error("No Franchise IBs found to export.");
      return;
    }
    setExportingAll(true);
    toast("Fetching all IB student data, please wait...", { id: "export-toast" });

    try {
      const workbook = XLSX.utils.book_new();
      let totalRows: any[] = [];

      for (const ib of ibs) {
        try {
          const res = await api.get(`/admin/franchise-ibs/${ib.id}/students`);
          const students: any[] = res.data.data || [];
          const rows = students.map((r: any) => ({
            "IB Name": ib.user_name || "",
            "IB Email": ib.user_email || "",
            "IB Referral Code": ib.referral_code || "",
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

          // Individual IB sheet (trim name to 31 chars for Excel limit)
          if (rows.length > 0) {
            const sheetName = (ib.user_name || `IB_${ib.id}`).slice(0, 28);
            const ws = XLSX.utils.json_to_sheet(rows);
            ws["!cols"] = Object.keys(rows[0]).map((k) => ({
              wch: Math.max(k.length, ...rows.map((r: any) => String(r[k] || "").length)) + 2,
            }));
            XLSX.utils.book_append_sheet(workbook, ws, sheetName);
            totalRows = [...totalRows, ...rows];
          }
        } catch {
          // Skip this IB if it errors
        }
      }

      // All-students summary sheet
      if (totalRows.length > 0) {
        const summaryWs = XLSX.utils.json_to_sheet(totalRows);
        summaryWs["!cols"] = Object.keys(totalRows[0]).map((k) => ({
          wch: Math.max(k.length, ...totalRows.map((r: any) => String(r[k] || "").length)) + 2,
        }));
        XLSX.utils.book_append_sheet(workbook, summaryWs, "All IB Students");
      }

      const fileName = `all_franchise_ib_students_${new Date().toISOString().split("T")[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      toast.success(`Exported ${totalRows.length} students from ${ibs.length} Franchise IBs!`, { id: "export-toast" });
    } catch (err) {
      toast.error("Failed to export data.", { id: "export-toast" });
    } finally {
      setExportingAll(false);
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
        <Button
          onClick={exportAllToExcel}
          disabled={exportingAll || loading || ibs.length === 0}
          className="bg-green-600 hover:bg-green-700 text-white mt-4 md:mt-0 gap-2"
        >
          <FileSpreadsheet className="w-4 h-4" />
          {exportingAll ? "Exporting..." : "Export All Students"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 bg-white shadow-md rounded-xl border border-gray-100 flex items-center gap-4">
          <div className="p-4 bg-green-50 text-green-600 rounded-lg">
            <TrendingUp className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#0B2A5B]/70">Total Revenue Generated</p>
            <h3 className="text-2xl font-bold text-green-700 mt-1">₹{stats.totalRevenue.toLocaleString("en-IN")}</h3>
          </div>
        </Card>

        <Card className="p-6 bg-white shadow-md rounded-xl border border-gray-100 flex items-center gap-4">
          <div className="p-4 bg-[#D50032]/5 text-[#D50032] rounded-lg">
            <DollarSign className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#0B2A5B]/70">Total IB Commission</p>
            <h3 className="text-2xl font-bold text-[#D50032] mt-1">₹{stats.totalCommission.toLocaleString("en-IN")}</h3>
          </div>
        </Card>

        <Card className="p-6 bg-white shadow-md rounded-xl border border-gray-100 flex items-center gap-4">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-lg">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#0B2A5B]/70">Total Referred Students</p>
            <h3 className="text-2xl font-bold text-blue-700 mt-1">{stats.totalStudents.toLocaleString("en-IN")}</h3>
          </div>
        </Card>
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
                <TableHead className="text-[#0B2A5B] font-semibold">IB Revenue (Commission)</TableHead>
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
                    <TableCell>
                      <span className="font-bold text-[#D50032]">₹{(ib.commission_revenue || 0).toLocaleString()}</span>
                      <div className="text-xs text-gray-500">at {ib.commission_percentage ?? 100}%</div>
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

            <div>
              <h3 className="text-lg font-bold text-[#0B2A5B] mb-4">Commission</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Commission Percentage (%)</Label>
                  <Input type="number" min="0" max="100" step="0.1" required value={addForm.commission_percentage} onChange={(e) => updateAddForm("commission_percentage", e.target.value)} />
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
