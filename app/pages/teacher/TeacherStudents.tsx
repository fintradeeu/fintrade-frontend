import { useState, useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Search, Download, Eye, Mail } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import api from "../../services/api";

export default function TeacherStudents() {
  const [searchTerm, setSearchTerm] = useState("");
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/faculty/students")
      .then((res) => setStudents(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filteredStudents = students.filter(
    (student) =>
      student.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.student_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.course_title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout role="teacher">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0B2A5B] mb-2">My Students</h1>
        <p className="text-[#0B2A5B]/70">Track student progress and performance</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-[#0B2A5B]/60">Loading students...</div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-4 bg-white shadow-lg">
              <p className="text-sm text-[#0B2A5B]/60 mb-1">Total Students</p>
              <p className="text-2xl font-bold text-[#0B2A5B]">{students.length}</p>
            </Card>
            <Card className="p-4 bg-white shadow-lg">
              <p className="text-sm text-[#0B2A5B]/60 mb-1">Active Courses</p>
              <p className="text-2xl font-bold text-green-600">
                {new Set(students.map(s => s.course_id)).size}
              </p>
            </Card>
            <Card className="p-4 bg-white shadow-lg">
              <p className="text-sm text-[#0B2A5B]/60 mb-1">At Risk</p>
              <p className="text-2xl font-bold text-orange-600">{students.filter(s => (s.progress_percent || 0) < 20 && (s.progress_percent || 0) > 0).length}</p>
            </Card>
            <Card className="p-4 bg-white shadow-lg">
              <p className="text-sm text-[#0B2A5B]/60 mb-1">Avg Attendance</p>
              <p className="text-2xl font-bold text-[#C2A86A]">—</p>
            </Card>
          </div>

          {/* Search and Actions */}
          <Card className="p-6 bg-white shadow-lg mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0B2A5B]/40" size={20} />
                <Input
                  placeholder="Search students by name, email, or course..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-[#F4F1EA] border-[#0B2A5B]/20"
                />
              </div>
              <Button
                className="bg-[#0B2A5B] text-[#F4F1EA] hover:bg-[#1a3d7a]"
                onClick={() => {
                  const header = "Name,Email,Course,Enrolled Date\n";
                  const rows = students.map(s =>
                    `"${s.student_name}","${s.student_email}","${s.course_title}","${new Date(s.enrolled_at).toLocaleDateString()}"`
                  ).join("\n");
                  const blob = new Blob([header + rows], { type: "text/csv" });
                  const a = document.createElement("a");
                  a.href = URL.createObjectURL(blob);
                  a.download = "students_export.csv";
                  a.click();
                }}
              >
                <Download size={16} className="mr-2" />
                Export Data
              </Button>
            </div>
          </Card>

          {/* Students Table */}
          <Card className="p-6 bg-white shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#F4F1EA]">
                    <TableHead className="text-[#0B2A5B]">Student</TableHead>
                    <TableHead className="text-[#0B2A5B]">Course</TableHead>
                    <TableHead className="text-[#0B2A5B]">Enrolled Date</TableHead>
                    <TableHead className="text-[#0B2A5B]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => (
                      <TableRow key={`${student.student_id}-${student.course_id}`} className="hover:bg-[#F4F1EA]/50">
                        <TableCell>
                          <div>
                            <p className="font-semibold text-[#0B2A5B]">{student.student_name}</p>
                            <p className="text-xs text-[#0B2A5B]/60">{student.student_email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-[#0B2A5B]">
                          <Badge variant="outline" className="border-[#C2A86A] text-[#0B2A5B]">
                            {student.course_title}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-[#0B2A5B]">
                          {new Date(student.enrolled_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                              <Button size="sm" variant="outline" className="border-[#0B2A5B]/20 hover:bg-[#0B2A5B] hover:text-white" onClick={() => alert(`Student Details:\nName: ${student.student_name}\nEmail: ${student.student_email}\nCourse: ${student.course_title}`)}>
                                <Eye size={14} />
                              </Button>
                              <Button size="sm" variant="outline" className="border-[#0B2A5B]/20 hover:bg-[#D50032] hover:text-white" onClick={() => window.location.href = `mailto:${student.student_email}`}>
                                <Mail size={14} />
                              </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-6 text-[#0B2A5B]/60">
                        No students found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </>
      )}
    </DashboardLayout>
  );
}
