import { useState, useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Search, GraduationCap, Video, CheckCircle, XCircle, Save, Loader2, AlertCircle } from "lucide-react";
import api from "../../services/api";

export default function AdminModuleStudents() {
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [modules, setModules] = useState<any[]>([]);
  const [selectedModuleId, setSelectedModuleId] = useState<string>("");
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // Fetch all courses
  useEffect(() => {
    api.get("/admin/courses")
      .then((res) => {
        setCourses(res.data);
        if (res.data.length > 0) {
          setSelectedCourseId(res.data[0].id.toString());
        }
      })
      .catch((err) => console.error("Error loading courses:", err));
  }, []);

  // Fetch modules when selected course changes
  useEffect(() => {
    if (!selectedCourseId) return;
    api.get(`/courses/${selectedCourseId}`)
      .then((res) => {
        const sortedModules = (res.data.modules || []).sort((a: any, b: any) => a.order - b.order);
        setModules(sortedModules);
        if (sortedModules.length > 0) {
          setSelectedModuleId(sortedModules[0].id.toString());
        } else {
          setSelectedModuleId("");
          setStudents([]);
        }
      })
      .catch((err) => console.error("Error loading course details:", err));
  }, [selectedCourseId]);

  // Fetch students & policies when selected module changes
  useEffect(() => {
    if (!selectedModuleId) {
      setStudents([]);
      return;
    }
    setLoading(true);
    api.get(`/admin/modules/${selectedModuleId}/students`)
      .then((res) => {
        setStudents(res.data);
      })
      .catch((err) => console.error("Error loading module students:", err))
      .finally(() => setLoading(false));
  }, [selectedModuleId]);

  // Update policy and save instantly to backend
  const handleTogglePolicy = async (studentId: number, currentMandatory: boolean) => {
    const updatedMandatory = !currentMandatory;
    
    // Update local state first for instant visual feedback
    setStudents(prev =>
      prev.map(s =>
        s.student_id === studentId ? { ...s, mandatory: updatedMandatory } : s
      )
    );

    // Make instant API call
    try {
      const updatedStudents = students.map(s => 
        s.student_id === studentId ? { ...s, mandatory: updatedMandatory } : s
      );
      const payload = updatedStudents.map(s => ({
        student_id: s.student_id,
        mandatory: s.mandatory
      }));
      await api.post(`/admin/modules/${selectedModuleId}/students-policies`, payload);
      setSaveSuccess("Watch policy updated and saved successfully!");
      setTimeout(() => setSaveSuccess(null), 2500);
    } catch (err: any) {
      console.error("Error auto-saving policy:", err);
      // Revert local state if API call fails
      setStudents(prev =>
        prev.map(s =>
          s.student_id === studentId ? { ...s, mandatory: currentMandatory } : s
        )
      );
      alert("Failed to save policy change: " + (err.response?.data?.detail || err.message));
    }
  };

  const filteredStudents = students.filter(
    (s) =>
      s.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.student_email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout role="admin">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#0B2A5B] flex items-center gap-2">
            <GraduationCap className="text-[#C2A86A]" size={36} />
            Module Video Watch Policies
          </h1>
          <p className="text-[#0B2A5B]/70 mt-1">
            Configure whether students must watch the entire video lesson or can manually mark it complete.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Dropdowns card */}
        <Card className="lg:col-span-1 p-6 bg-white shadow-lg space-y-4">
          <h3 className="text-lg font-bold text-[#0B2A5B] border-b pb-2 mb-2">Select Course & Module</h3>
          
          <div>
            <label className="text-sm font-semibold text-[#0B2A5B] block mb-1">Course</label>
            <select
              className="w-full p-3 border-2 border-[#0B2A5B]/10 rounded-xl bg-[#F4F1EA] text-[#0B2A5B] font-semibold focus:outline-none focus:border-[#C2A86A] transition-all"
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
            >
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold text-[#0B2A5B] block mb-1">Module</label>
            {modules.length > 0 ? (
              <select
                className="w-full p-3 border-2 border-[#0B2A5B]/10 rounded-xl bg-[#F4F1EA] text-[#0B2A5B] font-semibold focus:outline-none focus:border-[#C2A86A] transition-all"
                value={selectedModuleId}
                onChange={(e) => setSelectedModuleId(e.target.value)}
              >
                {modules.map((mod) => (
                  <option key={mod.id} value={mod.id}>
                    {mod.title}
                  </option>
                ))}
              </select>
            ) : (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl text-orange-700 text-sm flex items-center gap-2">
                <AlertCircle size={16} />
                No modules found in this course.
              </div>
            )}
          </div>
        </Card>

        {/* Students list card */}
        <Card className="lg:col-span-2 p-6 bg-white shadow-lg flex flex-col min-h-[400px]">
          <div className="flex gap-4 items-center justify-between mb-6">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0B2A5B]/40" size={20} />
              <Input
                placeholder="Search students by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-[#F4F1EA] border-[#0B2A5B]/20 h-11 rounded-xl text-base"
              />
            </div>
          </div>

          {saveSuccess && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 font-semibold flex items-center gap-2 animate-pulse">
              <CheckCircle size={20} />
              {saveSuccess}
            </div>
          )}

          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center text-[#0B2A5B]/60">
              <Loader2 className="animate-spin mb-2" size={32} />
              Loading students...
            </div>
          ) : students.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-[#0B2A5B]/60 py-12">
              <AlertCircle size={40} className="mb-2 text-[#0B2A5B]/40" />
              <p className="font-semibold text-lg">No enrolled students found</p>
              <p className="text-sm">Students must be enrolled in this course to configure policies.</p>
            </div>
          ) : (
            <div className="overflow-x-auto border rounded-xl">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#F4F1EA]">
                    <TableHead className="text-[#0B2A5B] font-bold text-base">Student</TableHead>
                    <TableHead className="text-[#0B2A5B] font-bold text-base text-center">Video Watch Policy</TableHead>
                    <TableHead className="text-[#0B2A5B] font-bold text-base text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((s) => (
                    <TableRow key={s.student_id} className="hover:bg-[#F4F1EA]/30 transition-colors">
                      <TableCell>
                        <div>
                          <p className="font-semibold text-[#0B2A5B] text-base">{s.student_name}</p>
                          <p className="text-xs text-[#0B2A5B]/60">{s.student_email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center">
                          <button
                            onClick={() => handleTogglePolicy(s.student_id, s.mandatory)}
                            className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              s.mandatory ? "bg-[#0B2A5B]" : "bg-gray-200"
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                s.mandatory ? "translate-x-7" : "translate-x-0"
                              }`}
                            />
                          </button>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {s.mandatory ? (
                            <Badge className="bg-red-50 text-red-700 border border-red-200 hover:bg-red-50 font-semibold px-2.5 py-1">
                              <Video size={14} className="mr-1 inline" />
                              Mandatory Watch
                            </Badge>
                          ) : (
                            <Badge className="bg-green-50 text-green-700 border border-green-200 hover:bg-green-50 font-semibold px-2.5 py-1">
                              <CheckCircle size={14} className="mr-1 inline" />
                              Allowed to Skip
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredStudents.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8 text-[#0B2A5B]/60">
                        No students matching the search criteria.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
