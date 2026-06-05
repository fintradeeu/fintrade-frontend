import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { ChevronLeft, Mail, BookOpen, CheckCircle, Clock, FileText, ChevronDown, ChevronUp } from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import api from "../../services/api";

export default function TeacherStudentProfile() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expandedExam, setExpandedExam] = useState<number | null>(null);

  useEffect(() => {
    if (studentId) {
      api.get(`/faculty/students/${studentId}/profile`)
        .then((res) => {
          setProfile(res.data);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [studentId]);

  if (loading) {
    return (
      <DashboardLayout role="teacher">
        <div className="flex justify-center items-center h-64 text-[#0B2A5B]/60">
          Loading student profile...
        </div>
      </DashboardLayout>
    );
  }

  if (!profile) {
    return (
      <DashboardLayout role="teacher">
        <div className="flex flex-col justify-center items-center h-64 gap-4">
          <p className="text-lg text-[#0B2A5B]/80">Student profile not found or access denied.</p>
          <Button onClick={() => navigate("/teacher/students")} variant="outline" className="border-[#0B2A5B]/20">
            <ChevronLeft size={16} className="mr-2" /> Back to Students
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="teacher">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button onClick={() => navigate("/teacher/students")} variant="ghost" className="p-0 hover:bg-transparent text-[#0B2A5B]/60 hover:text-[#0B2A5B]">
            <ChevronLeft size={24} />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-[#0B2A5B]">{profile.name}</h1>
            <p className="text-[#0B2A5B]/70">{profile.email}</p>
          </div>
        </div>
        <Button className="bg-[#0B2A5B] text-white hover:bg-[#1a3d7a]" onClick={() => window.location.href = `mailto:${profile.email}`}>
          <Mail size={16} className="mr-2" /> Contact Student
        </Button>
      </div>

      <Tabs defaultValue="overview" className="w-full space-y-6">
        <TabsList className="bg-white border border-[#0B2A5B]/10 p-1 w-full justify-start h-auto rounded-lg">
          <TabsTrigger value="overview" className="data-[state=active]:bg-[#F4F1EA] data-[state=active]:text-[#0B2A5B] px-6 py-2 rounded-md transition-all">Overview</TabsTrigger>
          <TabsTrigger value="assignments" className="data-[state=active]:bg-[#F4F1EA] data-[state=active]:text-[#0B2A5B] px-6 py-2 rounded-md transition-all">Assignments</TabsTrigger>
          <TabsTrigger value="exams" className="data-[state=active]:bg-[#F4F1EA] data-[state=active]:text-[#0B2A5B] px-6 py-2 rounded-md transition-all">Exams History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profile.courses.map((course: any) => (
              <Card key={course.course_id} className="p-6 bg-white shadow-lg flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-[#F4F1EA] rounded-lg">
                      <BookOpen size={24} className="text-[#0B2A5B]" />
                    </div>
                    {course.completed_at ? (
                      <Badge className="bg-green-100 text-green-800 border-none">Completed</Badge>
                    ) : (
                      <Badge className="bg-blue-100 text-blue-800 border-none">In Progress</Badge>
                    )}
                  </div>
                  <h3 className="font-semibold text-lg text-[#0B2A5B] mb-2">{course.title}</h3>
                  <div className="flex items-center text-sm text-[#0B2A5B]/60 mb-6 gap-2">
                    <Clock size={14} />
                    <span>Enrolled: {new Date(course.enrolled_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[#0B2A5B]/70 font-medium">Progress</span>
                    <span className="text-[#0B2A5B] font-bold">{course.progress_percent.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-[#F4F1EA] rounded-full h-2">
                    <div className="bg-[#C2A86A] h-2 rounded-full" style={{ width: `${course.progress_percent}%` }} />
                  </div>
                </div>
              </Card>
            ))}
            {profile.courses.length === 0 && (
              <div className="col-span-full p-8 text-center bg-white rounded-xl border border-dashed border-[#0B2A5B]/20 text-[#0B2A5B]/60">
                This student is not enrolled in any of your courses.
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="assignments">
          <Card className="bg-white shadow-lg overflow-hidden">
            <Table>
              <TableHeader className="bg-[#F4F1EA]">
                <TableRow>
                  <TableHead className="text-[#0B2A5B]">Assignment</TableHead>
                  <TableHead className="text-[#0B2A5B]">Course</TableHead>
                  <TableHead className="text-[#0B2A5B]">Submitted At</TableHead>
                  <TableHead className="text-[#0B2A5B]">Status</TableHead>
                  <TableHead className="text-[#0B2A5B]">Score</TableHead>
                  <TableHead className="text-[#0B2A5B]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profile.assignments.map((sub: any) => (
                  <TableRow key={sub.assignment_id}>
                    <TableCell className="font-medium text-[#0B2A5B]">{sub.title}</TableCell>
                    <TableCell className="text-[#0B2A5B]/80">{sub.course_title}</TableCell>
                    <TableCell className="text-[#0B2A5B]/80">{new Date(sub.submitted_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {sub.status === "graded" ? (
                        <Badge className="bg-green-100 text-green-800 border-none"><CheckCircle size={12} className="mr-1" /> Graded</Badge>
                      ) : (
                        <Badge className="bg-orange-100 text-orange-800 border-none">Pending Review</Badge>
                      )}
                    </TableCell>
                    <TableCell className="font-semibold text-[#0B2A5B]">
                      {sub.status === "graded" ? `${sub.score} / ${sub.max_score}` : "—"}
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" className="border-[#0B2A5B]/20" onClick={() => window.open(api.defaults.baseURL?.replace(new RegExp('/api$'), '') + sub.file_url, '_blank')}>
                        <FileText size={14} className="mr-2" /> View Doc
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {profile.assignments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-[#0B2A5B]/60">
                      No assignments submitted yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="exams" className="space-y-4">
          {profile.exams.map((exam: any) => (
            <Card key={exam.exam_id} className="bg-white shadow-md overflow-hidden transition-all duration-200">
              <div 
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-[#F4F1EA]/50"
                onClick={() => setExpandedExam(expandedExam === exam.exam_id ? null : exam.exam_id)}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-full ${exam.passed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {exam.passed ? <CheckCircle size={20} /> : <FileText size={20} />}
                  </div>
                  <div>
                    <h3 className="font-bold text-[#0B2A5B] text-lg">{exam.title}</h3>
                    <p className="text-sm text-[#0B2A5B]/60">{exam.course_title} • {exam.exam_type} Exam • Taken: {exam.submitted_at ? new Date(exam.submitted_at).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm text-[#0B2A5B]/60">Score</p>
                    <p className={`font-bold text-lg ${exam.passed ? 'text-green-600' : 'text-red-600'}`}>
                      {exam.score} / {exam.total_marks}
                    </p>
                  </div>
                  {expandedExam === exam.exam_id ? <ChevronUp className="text-[#0B2A5B]/40" /> : <ChevronDown className="text-[#0B2A5B]/40" />}
                </div>
              </div>

              {expandedExam === exam.exam_id && (
                <div className="border-t border-[#0B2A5B]/10 bg-[#F8F9FA] p-6">
                  <h4 className="font-bold text-[#0B2A5B] mb-4">Detailed Answers</h4>
                  <div className="space-y-4">
                    {exam.answers.map((ans: any, idx: number) => (
                      <div key={idx} className="bg-white p-4 rounded-lg border border-[#0B2A5B]/10 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-semibold text-[#0B2A5B] flex-1 mr-4">
                            <span className="text-[#0B2A5B]/50 mr-2">{idx + 1}.</span> 
                            {ans.question_text}
                          </p>
                          <Badge variant="outline" className={ans.is_correct ? "border-green-500 text-green-600 bg-green-50" : "border-red-500 text-red-600 bg-red-50"}>
                            {ans.is_correct ? `+${ans.marks} Marks` : "0 Marks"}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-sm">
                          <div className="p-3 bg-green-50 rounded-md border border-green-100">
                            <p className="text-green-800 font-medium mb-1 text-xs uppercase tracking-wider">Correct Answer</p>
                            <p className="text-gray-800">{ans.correct_option || 'N/A'}</p>
                          </div>
                          <div className={`p-3 rounded-md border ${ans.is_correct ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                            <p className={`${ans.is_correct ? 'text-green-800' : 'text-red-800'} font-medium mb-1 text-xs uppercase tracking-wider`}>Student's Answer</p>
                            <p className="text-gray-800">{ans.selected_option || 'None selected'}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {(!exam.answers || exam.answers.length === 0) && (
                      <p className="text-center text-[#0B2A5B]/50 py-4">No detailed answers available for this attempt.</p>
                    )}
                  </div>
                </div>
              )}
            </Card>
          ))}
          {profile.exams.length === 0 && (
            <div className="text-center py-12 text-[#0B2A5B]/60 bg-white rounded-xl shadow-sm border border-dashed border-[#0B2A5B]/20">
              No exams taken yet.
            </div>
          )}
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
