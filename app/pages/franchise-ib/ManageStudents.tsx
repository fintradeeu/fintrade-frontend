import { useState, useEffect, useMemo } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import api from "../../services/api";
import RegisterStudentModal from "../../components/RegisterStudentModal";

export default function ManageStudents() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "enrolled">("all");
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

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
    </DashboardLayout>
  );
}
