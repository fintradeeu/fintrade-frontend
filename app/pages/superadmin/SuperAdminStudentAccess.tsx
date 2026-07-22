import { useState, useEffect, useMemo } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../components/ui/dialog";
import { Shield, ShieldOff, Search, Clock, IndianRupee, Lock, Unlock, ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";
import api from "../../services/api";
import { toast } from "sonner";

// All student-facing modules/routes that superadmin can control
const STUDENT_MODULES = [
  { key: "batch_dashboard", label: "Dashboard", path: "/student/batch-dashboard" },
  { key: "profile", label: "Profile", path: "/student/profile" },
  { key: "courses", label: "Courses", path: "/student/courses" },
  { key: "modules", label: "Modules", path: "/student/modules" },
  { key: "lectures", label: "Live Classes", path: "/student/lectures" },
  { key: "assignments", label: "Assignments", path: "/student/assignments" },
  { key: "ai_tutor", label: "AI Tutor", path: "/student/ai-tutor" },
  { key: "doubt_forms", label: "Doubt Solving", path: "/student/doubt-forms" },
  { key: "exams", label: "Exams", path: "/student/exams" },
  { key: "performance", label: "Performance", path: "/student/performance" },
  { key: "leaderboard", label: "Leaderboard", path: "/student/leaderboard" },
  { key: "simulator", label: "Trading Simulator", path: "/student/simulator" },
  { key: "placement", label: "Placement", path: "/student/placement" },
  { key: "certificate", label: "Certificate", path: "/student/certificate" },
  { key: "invoice", label: "Invoice", path: "/student/invoice" },
];

import PerformKycModal from "../../components/PerformKycModal";

export default function SuperAdminStudentAccess() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "partial" | "blocked">("all");
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  // Perform eKYC modal state
  const [kycStudent, setKycStudent] = useState<any | null>(null);
  const [showKycModal, setShowKycModal] = useState(false);

  // Edit state for the selected student's enrollment
  const [editPaymentDue, setEditPaymentDue] = useState("");
  const [editAccessBlocked, setEditAccessBlocked] = useState(false);
  const [editPaymentStatus, setEditPaymentStatus] = useState("full");

  const fetchStudents = async () => {
    setLoading(true);
    try {
      // Fetch purchased/enrolled students (API limit max is 200 per page)
      const res = await api.get("/admin/purchased-students?limit=200");
      const raw = res.data?.users || res.data || [];
      // Flatten enrollments into rows
      const rows: any[] = [];
      for (const u of raw) {
        const enrollments = u.enrollments || u.enrolled_courses || [];
        if (enrollments.length > 0) {
          for (const enr of enrollments) {
            rows.push({
              user_id: u.id,
              user_name: u.full_name || u.name || u.email,
              user_email: u.email,
              user_phone: u.phone || "",
              enrollment_id: enr.id,
              course_id: enr.course_id,
              course_title: enr.course_title || enr.course?.title || "Unknown Course",
              price_paid: enr.price_paid || 0,
              payment_status: enr.payment_status || "full",
              payment_due_date: enr.payment_due_date || null,
              access_blocked: enr.access_blocked || false,
              allowed_modules: enr.allowed_modules || null,
              course_price: enr.course?.price || 0,
              discount_applied: enr.discount_applied || 0,
              kyc_status: u.kyc_status || "not_started",
            });
          }
        } else if (u.course_id) {
          rows.push({
            user_id: u.id,
            user_name: u.full_name || u.name || u.email,
            user_email: u.email,
            user_phone: u.phone || "",
            enrollment_id: u.enrollment_id || u.course_id || 1,
            course_id: u.course_id || 1,
            course_title: u.course_title || "Unknown Course",
            price_paid: u.price_paid || 0,
            payment_status: u.payment_status || "full",
            payment_due_date: u.payment_due_date || null,
            access_blocked: u.access_blocked || false,
            allowed_modules: u.allowed_modules || null,
            course_price: u.course_price || 0,
            discount_applied: u.discount_applied || 0,
            kyc_status: u.kyc_status || "not_started",
          });
        }
      }
      setStudents(rows);
    } catch (err) {
      console.error("Failed to load students", err);
      toast.error("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStudents(); }, []);

  const filtered = useMemo(() => {
    return students.filter((s) => {
      const matchSearch = !search ||
        s.user_name?.toLowerCase().includes(search.toLowerCase()) ||
        s.user_email?.toLowerCase().includes(search.toLowerCase()) ||
        s.course_title?.toLowerCase().includes(search.toLowerCase());
      const matchStatus =
        filterStatus === "all" ? true :
        filterStatus === "partial" ? s.payment_status === "partial" :
        filterStatus === "blocked" ? s.access_blocked === true : true;
      return matchSearch && matchStatus;
    });
  }, [students, search, filterStatus]);

  const openStudent = (s: any) => {
    setSelectedStudent(s);
    setEditPaymentDue(s.payment_due_date ? new Date(s.payment_due_date).toISOString().slice(0, 16) : "");
    setEditAccessBlocked(s.access_blocked || false);
    setEditPaymentStatus(s.payment_status || "full");
  };

  const saveChanges = async () => {
    if (!selectedStudent) return;
    setSaving(true);
    const targetUserId = selectedStudent.user_id;
    const targetEnrId = selectedStudent.enrollment_id;

    // Optimistic UI state update
    setStudents(prev => prev.map(item =>
      (item.user_id === targetUserId && item.enrollment_id === targetEnrId)
        ? {
            ...item,
            access_blocked: editAccessBlocked,
            payment_status: editPaymentStatus,
            payment_due_date: editPaymentDue ? new Date(editPaymentDue).toISOString() : null
          }
        : item
    ));

    try {
      await api.put(
        `/admin/users/${selectedStudent.user_id}/enrollments/${selectedStudent.enrollment_id}/partial-payment`,
        {
          payment_status: editPaymentStatus,
          payment_due_date: editPaymentDue ? new Date(editPaymentDue).toISOString() : null,
          access_blocked: editAccessBlocked,
          allowed_modules: null, // keep existing, manage separately if needed
        }
      );
      toast.success(
        editAccessBlocked
          ? `✅ Access blocked for ${selectedStudent.user_name}`
          : `✅ Settings saved for ${selectedStudent.user_name}`
      );
      setSelectedStudent(null);
      fetchStudents();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to save changes");
      fetchStudents();
    } finally {
      setSaving(false);
    }
  };

  const quickToggleBlock = async (s: any) => {
    const newBlocked = !s.access_blocked;
    // Optimistic UI state update
    setStudents(prev => prev.map(item =>
      (item.user_id === s.user_id && item.enrollment_id === s.enrollment_id)
        ? { ...item, access_blocked: newBlocked }
        : item
    ));

    try {
      await api.put(
        `/admin/users/${s.user_id}/enrollments/${s.enrollment_id}/partial-payment`,
        {
          payment_status: s.payment_status,
          payment_due_date: s.payment_due_date ? new Date(s.payment_due_date).toISOString() : null,
          access_blocked: newBlocked,
          allowed_modules: s.allowed_modules,
        }
      );
      toast.success(newBlocked ? `🔒 Access blocked for ${s.user_name}` : `🔓 Access restored for ${s.user_name}`);
      fetchStudents();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to update access");
      fetchStudents();
    }
  };

  const pendingBalance = (s: any) => {
    const effective = (s.course_price || 0) - (s.discount_applied || 0);
    return Math.max(0, Math.round((effective - (s.price_paid || 0)) * 100) / 100);
  };

  const isDueOverdue = (due: string | null) => {
    if (!due) return false;
    return new Date(due) < new Date();
  };

  return (
    <DashboardLayout role="super_admin">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Shield className="text-purple-600 w-7 h-7" />
          Student Access Control
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          Manage student module access and payment deadlines. Block or restore access for students with overdue payments.
        </p>
      </div>

      {/* Summary Chips */}
      <div className="flex flex-wrap gap-3 mb-6">
        {[
          { label: "All Students", value: "all", count: students.length, color: "bg-purple-50 text-purple-700 border-purple-200" },
          { label: "Partial Payment", value: "partial", count: students.filter(s => s.payment_status === "partial").length, color: "bg-orange-50 text-orange-700 border-orange-200" },
          { label: "Access Blocked", value: "blocked", count: students.filter(s => s.access_blocked).length, color: "bg-red-50 text-red-700 border-red-200" },
        ].map(chip => (
          <button
            key={chip.value}
            onClick={() => setFilterStatus(chip.value as any)}
            className={`px-4 py-2 rounded-lg border font-semibold text-sm transition-all ${chip.color} ${filterStatus === chip.value ? "ring-2 ring-offset-1 ring-purple-400" : "opacity-80 hover:opacity-100"}`}
          >
            {chip.label}: <span className="font-bold">{chip.count}</span>
          </button>
        ))}
      </div>

      <Card className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl">
        {/* Search */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by name, email or course..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 bg-gray-50"
            />
          </div>
          <span className="text-sm text-gray-400 font-medium">{filtered.length} records</span>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold text-gray-700">Student</TableHead>
                <TableHead className="font-semibold text-gray-700">Course</TableHead>
                <TableHead className="font-semibold text-gray-700">Payment</TableHead>
                <TableHead className="font-semibold text-gray-700">Due Date</TableHead>
                <TableHead className="font-semibold text-gray-700">Access Status</TableHead>
                <TableHead className="text-right font-semibold text-gray-700">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-10 text-gray-400">Loading...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-10 text-gray-400">No students found.</TableCell></TableRow>
              ) : filtered.map((s, idx) => {
                const pending = pendingBalance(s);
                const overdue = isDueOverdue(s.payment_due_date);
                return (
                  <TableRow key={`${s.user_id}-${s.enrollment_id}-${idx}`} className={`hover:bg-gray-50 ${s.access_blocked ? "bg-red-50/40" : ""}`}>
                    <TableCell>
                      <div className="font-semibold text-gray-800">{s.user_name}</div>
                      <div className="text-xs text-gray-500">{s.user_email}</div>
                      {s.user_phone && <div className="text-xs text-gray-400">{s.user_phone}</div>}
                    </TableCell>
                    <TableCell className="text-gray-700 max-w-[200px]">
                      <div className="font-medium truncate">{s.course_title}</div>
                      <div className="text-xs text-gray-400">Paid: ₹{(s.price_paid || 0).toLocaleString("en-IN")}</div>
                    </TableCell>
                    <TableCell>
                      <Badge className={
                        s.payment_status === "full"
                          ? "bg-green-100 text-green-700 border-none"
                          : "bg-orange-100 text-orange-700 border-none"
                      }>
                        {s.payment_status === "full" ? "Full Paid" : "Partial"}
                      </Badge>
                      {pending > 0 && (
                        <div className="flex items-center gap-1 text-xs text-orange-600 font-semibold mt-1">
                          <IndianRupee className="w-3 h-3" />
                          {pending.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} pending
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {s.payment_due_date ? (
                        <div className={`flex items-center gap-1 text-xs font-semibold ${overdue ? "text-red-600" : "text-gray-600"}`}>
                          {overdue && <AlertTriangle className="w-3 h-3" />}
                          <Clock className="w-3 h-3" />
                          {new Date(s.payment_due_date).toLocaleString("en-IN", {
                            day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
                          })}
                          {overdue && <span className="ml-1 bg-red-100 text-red-700 px-1.5 py-0.5 rounded text-[10px] font-bold">OVERDUE</span>}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {s.access_blocked ? (
                        <Badge className="bg-red-100 text-red-700 border-none flex items-center gap-1 w-fit">
                          <Lock className="w-3 h-3" /> Blocked
                        </Badge>
                      ) : (
                        <Badge className="bg-green-100 text-green-700 border-none flex items-center gap-1 w-fit">
                          <Unlock className="w-3 h-3" /> Active
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {s.kyc_status === "verified" || s.kyc_status === "approved" ? (
                          <Badge className="bg-green-100 text-green-700 font-semibold border border-green-200 flex items-center gap-1 text-xs py-1 px-2.5">
                            <CheckCircle className="w-3.5 h-3.5 text-green-600" /> KYC Done
                          </Badge>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setKycStudent({
                                id: s.user_id,
                                full_name: s.user_name,
                                email: s.user_email,
                                phone: s.user_phone,
                                course_id: s.course_id,
                              });
                              setShowKycModal(true);
                            }}
                            className="text-green-700 border-green-300 hover:bg-green-50 text-xs"
                            title="Perform eKYC"
                          >
                            <Shield className="w-3 h-3 mr-1 text-green-600" /> Perform eKYC
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => quickToggleBlock(s)}
                          className={s.access_blocked
                            ? "text-green-700 border-green-300 hover:bg-green-50 text-xs"
                            : "text-red-600 border-red-300 hover:bg-red-50 text-xs"}
                          title={s.access_blocked ? "Restore Access" : "Block Access"}
                        >
                          {s.access_blocked ? <><Unlock className="w-3 h-3 mr-1" /> Restore</> : <><Lock className="w-3 h-3 mr-1" /> Block</>}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openStudent(s)}
                          className="text-purple-600 border-purple-300 hover:bg-purple-50 text-xs"
                        >
                          Manage
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Detail/Edit Modal */}
      <Dialog open={!!selectedStudent} onOpenChange={(open) => { if (!open) setSelectedStudent(null); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <Shield className="text-purple-600 w-6 h-6" />
              Manage Student Access
            </DialogTitle>
            <DialogDescription>
              Control payment deadline and feature access for <strong>{selectedStudent?.user_name}</strong>
            </DialogDescription>
          </DialogHeader>

          {selectedStudent && (
            <div className="space-y-5 mt-2">
              {/* Student Info */}
              <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-gray-500">Name:</span> <span className="font-semibold">{selectedStudent.user_name}</span></div>
                <div><span className="text-gray-500">Email:</span> <span className="font-semibold">{selectedStudent.user_email}</span></div>
                <div><span className="text-gray-500">Course:</span> <span className="font-semibold">{selectedStudent.course_title}</span></div>
                <div><span className="text-gray-500">Amount Paid:</span> <span className="font-semibold text-green-700">₹{(selectedStudent.price_paid || 0).toLocaleString("en-IN")}</span></div>
                {pendingBalance(selectedStudent) > 0 && (
                  <div className="col-span-2 bg-orange-50 border border-orange-200 rounded-lg p-2 flex items-center justify-between">
                    <span className="text-orange-700 font-semibold text-sm flex items-center gap-1"><IndianRupee className="w-4 h-4" />Pending Balance:</span>
                    <span className="text-orange-800 font-bold text-lg">₹{pendingBalance(selectedStudent).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
                  </div>
                )}
              </div>

              {/* Payment Status */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Payment Status</label>
                <div className="flex gap-3">
                  {["full", "partial"].map(s => (
                    <button
                      key={s}
                      onClick={() => setEditPaymentStatus(s)}
                      className={`px-4 py-2 rounded-lg border font-semibold text-sm transition-all capitalize ${
                        editPaymentStatus === s
                          ? s === "full" ? "bg-green-500 text-white border-green-500" : "bg-orange-500 text-white border-orange-500"
                          : "border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {s === "full" ? "✅ Full Paid" : "⏳ Partial"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Due Date */}
              <div className="space-y-2">
                <label htmlFor="due-date" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-500" />
                  Payment Due Date / Deadline
                </label>
                <p className="text-xs text-gray-500">Students see this deadline in their dashboard. After this date, you can block their access.</p>
                <input
                  id="due-date"
                  type="datetime-local"
                  value={editPaymentDue}
                  onChange={e => setEditPaymentDue(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
                {editPaymentDue && isDueOverdue(editPaymentDue) && (
                  <p className="text-xs text-red-600 font-semibold flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> This deadline has already passed.
                  </p>
                )}
              </div>

              {/* Access Blocked Toggle */}
              <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-800 flex items-center gap-2">
                      {editAccessBlocked ? <Lock className="w-4 h-4 text-red-500" /> : <Unlock className="w-4 h-4 text-green-500" />}
                      Platform Access
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {editAccessBlocked
                        ? "Student's access is currently BLOCKED. They see a suspension notice on all pages."
                        : "Student has full access to all modules they are permitted to use."}
                    </p>
                  </div>
                  <button
                    onClick={() => setEditAccessBlocked(!editAccessBlocked)}
                    className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none ${editAccessBlocked ? "bg-red-500" : "bg-green-500"}`}
                    title={editAccessBlocked ? "Click to restore access" : "Click to block access"}
                  >
                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${editAccessBlocked ? "translate-x-8" : "translate-x-1"}`} />
                  </button>
                </div>
                {editAccessBlocked && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-red-700 text-xs font-semibold flex items-center gap-1">
                      <ShieldOff className="w-3 h-3" />
                      When blocked, the student will see a "Access Suspended" red banner on their dashboard and all functionality will be inaccessible until you restore access.
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 border-t pt-4">
                <Button variant="outline" onClick={() => setSelectedStudent(null)} disabled={saving}>
                  Cancel
                </Button>
                <Button
                  onClick={saveChanges}
                  disabled={saving}
                  className="bg-purple-600 hover:bg-purple-700 text-white gap-2"
                >
                  <Shield className="w-4 h-4" />
                  {saving ? "Saving..." : "Save Access Settings"}
                </Button>
              </div>
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
    </DashboardLayout>
  );
}
