import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { ChevronLeft, Mail, BookOpen, CheckCircle, Clock, FileText, ChevronDown, ChevronUp, Award, TrendingUp } from "lucide-react";
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
        <div className="flex flex-col justify-center items-center h-96 gap-4 text-[#0B2A5B]/60">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0B2A5B]"></div>
          <p className="font-semibold text-sm">Loading student profile...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!profile) {
    return (
      <DashboardLayout role="teacher">
        <div className="flex flex-col justify-center items-center h-96 gap-5 bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <div className="p-4 bg-red-50 text-red-500 rounded-full">
            <UsersNotFoundIcon />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Profile Not Found</h3>
            <p className="text-sm text-gray-500 max-w-sm">This student record could not be retrieved or you do not have permission to view it.</p>
          </div>
          <Button onClick={() => navigate("/teacher/students")} variant="outline" className="border-[#0B2A5B]/20 text-[#0B2A5B] hover:bg-[#0B2A5B]/5">
            <ChevronLeft size={16} className="mr-2" /> Back to Students
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  // Calculations
  const totalCourses = profile.courses?.length || 0;
  const totalAssignments = profile.assignments?.length || 0;
  const totalExams = profile.exams?.length || 0;
  const passedExams = profile.exams?.filter((e: any) => e.passed).length || 0;
  const averageProgress = totalCourses > 0 
    ? Math.round(profile.courses.reduce((acc: number, c: any) => acc + (c.progress_percent || 0), 0) / totalCourses)
    : 0;

  // Student Initials
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <DashboardLayout role="teacher">
      {/* Navigation Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <Button 
            onClick={() => navigate("/teacher/students")} 
            variant="ghost" 
            className="h-10 w-10 p-0 rounded-full hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-all flex items-center justify-center"
          >
            <ChevronLeft size={20} />
          </Button>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-[#0B2A5B] to-[#C2A86A] text-white text-lg font-bold shadow-md uppercase tracking-wider">
              {getInitials(profile.name)}
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-gray-900 leading-tight">{profile.name}</h1>
              <p className="text-gray-500 text-sm flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3.5 h-3.5" />
                {profile.email}
              </p>
            </div>
          </div>
        </div>
        <Button 
          className="bg-gradient-to-r from-[#0B2A5B] to-[#1a3d7a] hover:from-[#1a3d7a] hover:to-[#0B2A5B] text-white font-semibold transition-all duration-300 shadow-sm rounded-xl px-5 h-11" 
          onClick={() => window.location.href = `mailto:${profile.email}`}
        >
          <Mail size={16} className="mr-2" /> Contact Student
        </Button>
      </div>

      {/* Summary Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <Card className="p-5 bg-white border border-gray-100 shadow-sm rounded-2xl flex items-center gap-4">
          <div className="p-3.5 bg-blue-50 text-[#0B2A5B] rounded-xl flex-shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Enrolled Courses</p>
            <h4 className="text-2xl font-black text-gray-900 mt-1">{totalCourses}</h4>
          </div>
        </Card>

        <Card className="p-5 bg-white border border-gray-100 shadow-sm rounded-2xl flex items-center gap-4">
          <div className="p-3.5 bg-orange-50 text-[#C2A86A] rounded-xl flex-shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Avg. Progress</p>
            <h4 className="text-2xl font-black text-gray-900 mt-1">{averageProgress}%</h4>
          </div>
        </Card>

        <Card className="p-5 bg-white border border-gray-100 shadow-sm rounded-2xl flex items-center gap-4">
          <div className="p-3.5 bg-green-50 text-green-600 rounded-xl flex-shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Assignments</p>
            <h4 className="text-2xl font-black text-gray-900 mt-1">{totalAssignments}</h4>
          </div>
        </Card>

        <Card className="p-5 bg-white border border-gray-100 shadow-sm rounded-2xl flex items-center gap-4">
          <div className="p-3.5 bg-purple-50 text-purple-600 rounded-xl flex-shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Exams Cleared</p>
            <h4 className="text-2xl font-black text-gray-900 mt-1">{passedExams} <span className="text-xs text-gray-400 font-normal">/ {totalExams}</span></h4>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full space-y-6">
        <TabsList className="bg-white border border-gray-100 shadow-sm p-1.5 w-full justify-start h-auto rounded-2xl">
          <TabsTrigger value="overview" className="data-[state=active]:bg-[#0B2A5B] data-[state=active]:text-white font-bold px-6 py-2.5 rounded-xl transition-all">Overview</TabsTrigger>
          <TabsTrigger value="assignments" className="data-[state=active]:bg-[#0B2A5B] data-[state=active]:text-white font-bold px-6 py-2.5 rounded-xl transition-all">Assignments ({totalAssignments})</TabsTrigger>
          <TabsTrigger value="exams" className="data-[state=active]:bg-[#0B2A5B] data-[state=active]:text-white font-bold px-6 py-2.5 rounded-xl transition-all">Exams History ({totalExams})</TabsTrigger>
        </TabsList>

        {/* Overview Tab Content */}
        <TabsContent value="overview" className="outline-none">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profile.courses.map((course: any) => (
              <Card key={course.course_id} className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl flex flex-col justify-between hover:shadow-md transition-all duration-300">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-blue-50 text-[#0B2A5B] rounded-xl">
                      <BookOpen size={22} />
                    </div>
                    {course.completed_at ? (
                      <Badge className="bg-green-50 text-green-700 border border-green-100 shadow-sm rounded-full font-bold">Completed</Badge>
                    ) : (
                      <Badge className="bg-blue-50 text-blue-700 border border-blue-100 shadow-sm rounded-full font-bold">In Progress</Badge>
                    )}
                  </div>
                  <h3 className="font-extrabold text-gray-900 text-lg leading-snug mb-2">{course.title}</h3>
                  <div className="flex items-center text-xs text-gray-400 font-semibold mb-6 gap-1.5">
                    <Clock size={13} />
                    <span>Enrolled: {new Date(course.enrolled_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1.5 text-gray-700">
                    <span>Course Progress</span>
                    <span className="text-[#0B2A5B]">{course.progress_percent.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-[#0B2A5B] to-[#C2A86A] h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${course.progress_percent}%` }} 
                    />
                  </div>
                </div>
              </Card>
            ))}
            {profile.courses.length === 0 && (
              <div className="col-span-full p-12 text-center bg-white rounded-2xl border border-dashed border-gray-200 text-gray-400">
                <BookOpen size={40} className="mx-auto mb-3 opacity-30 text-[#0B2A5B]" />
                <p className="font-semibold text-sm">This student is not enrolled in any courses.</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Assignments Tab Content */}
        <TabsContent value="assignments" className="outline-none">
          <Card className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50 border-b border-gray-100">
                  <TableRow>
                    <TableHead className="text-gray-700 font-bold h-12">Assignment Title</TableHead>
                    <TableHead className="text-gray-700 font-bold h-12">Course</TableHead>
                    <TableHead className="text-gray-700 font-bold h-12">Submitted Date</TableHead>
                    <TableHead className="text-gray-700 font-bold h-12">Status</TableHead>
                    <TableHead className="text-gray-700 font-bold h-12">Grade</TableHead>
                    <TableHead className="text-gray-700 font-bold h-12 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {profile.assignments.map((sub: any) => (
                    <TableRow key={sub.assignment_id} className="hover:bg-gray-50/50 border-b border-gray-100 transition-colors">
                      <TableCell className="font-bold text-gray-900 py-4">{sub.title}</TableCell>
                      <TableCell className="text-gray-600 text-sm font-medium py-4">{sub.course_title}</TableCell>
                      <TableCell className="text-gray-500 text-sm py-4">
                        {new Date(sub.submitted_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </TableCell>
                      <TableCell className="py-4">
                        {sub.status === "graded" ? (
                          <Badge className="bg-green-50 text-green-700 border border-green-100 font-bold rounded-full">
                            <CheckCircle size={12} className="mr-1" /> Graded
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-50 text-amber-700 border border-amber-100 font-bold rounded-full">
                            Pending Review
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="font-extrabold text-[#0B2A5B] py-4">
                        {sub.status === "graded" ? `${sub.score} / ${sub.max_score}` : "—"}
                      </TableCell>
                      <TableCell className="py-4 text-right">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="border-gray-200 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-xl"
                          onClick={() => window.open(api.defaults.baseURL?.replace(new RegExp('/api$'), '') + sub.file_url, '_blank')}
                        >
                          <FileText size={14} className="mr-1.5" /> View Submission
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {profile.assignments.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-16 text-gray-400">
                        <FileText size={40} className="mx-auto mb-3 opacity-30 text-[#0B2A5B]" />
                        <p className="font-semibold text-sm">No assignments submitted yet.</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        {/* Exams Tab Content */}
        <TabsContent value="exams" className="space-y-4 outline-none">
          {profile.exams.map((exam: any) => (
            <Card 
              key={exam.exam_id} 
              className={`bg-white border shadow-sm rounded-2xl overflow-hidden transition-all duration-300 ${
                expandedExam === exam.exam_id ? 'border-[#0B2A5B]/30 ring-1 ring-[#0B2A5B]/10 shadow-md' : 'border-gray-100 hover:border-gray-200'
              }`}
            >
              {/* Exam Summary Row */}
              <div 
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-gray-50/40"
                onClick={() => setExpandedExam(expandedExam === exam.exam_id ? null : exam.exam_id)}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl flex-shrink-0 ${
                    exam.passed ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-500 border border-red-100'
                  }`}>
                    {exam.passed ? <CheckCircle size={22} /> : <FileText size={22} />}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-lg leading-snug">{exam.title}</h3>
                    <p className="text-xs text-gray-400 font-semibold mt-1">
                      {exam.course_title} • {exam.exam_type} Exam {exam.submitted_at && `• Taken on ${new Date(exam.submitted_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-3 sm:pt-0">
                  <div className="text-left sm:text-right">
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Obtained Marks</p>
                    <p className={`font-black text-lg mt-0.5 ${exam.passed ? 'text-green-600' : 'text-red-500'}`}>
                      {exam.score} <span className="text-xs text-gray-400 font-bold">/ {exam.total_marks}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {exam.passed ? (
                      <Badge className="bg-green-50 text-green-700 border border-green-100 font-bold rounded-full">PASSED</Badge>
                    ) : (
                      <Badge className="bg-red-50 text-red-700 border border-red-100 font-bold rounded-full">FAILED</Badge>
                    )}
                    {expandedExam === exam.exam_id ? <ChevronUp className="text-gray-400 h-5 w-5" /> : <ChevronDown className="text-gray-400 h-5 w-5" />}
                  </div>
                </div>
              </div>

              {/* Detailed Expanded Answers */}
              {expandedExam === exam.exam_id && (
                <div className="border-t border-gray-100 bg-gray-50/50 p-6 space-y-5">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-200/60">
                    <h4 className="font-extrabold text-gray-900 text-sm">Detailed Question Breakdown</h4>
                    <span className="text-xs text-gray-400 font-semibold">{exam.answers.length} Questions</span>
                  </div>
                  <div className="space-y-4">
                    {exam.answers.map((ans: any, idx: number) => (
                      <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex justify-between items-start gap-4 mb-3">
                          <p className="font-bold text-gray-900 text-sm leading-relaxed">
                            <span className="text-gray-400 mr-1.5">{idx + 1}.</span> 
                            {ans.question_text}
                          </p>
                          <Badge variant="outline" className={`rounded-full px-2.5 py-0.5 text-xs font-bold flex-shrink-0 ${
                            ans.is_correct 
                              ? "border-green-200 text-green-700 bg-green-50" 
                              : "border-red-200 text-red-600 bg-red-50"
                          }`}>
                            {ans.is_correct ? `+${ans.marks} Marks` : "0 Marks"}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
                          <div className="p-3 bg-green-50/60 border border-green-100/60 rounded-xl text-green-800">
                            <span className="text-[10px] uppercase tracking-wider font-extrabold block text-green-600 mb-1">Correct Answer</span>
                            <span className="text-gray-700 font-bold text-sm leading-relaxed">{ans.correct_option || 'N/A'}</span>
                          </div>
                          <div className={`p-3 border rounded-xl ${
                            ans.is_correct 
                              ? 'bg-green-50/60 border-green-100/60 text-green-800' 
                              : 'bg-red-50/60 border-red-100/60 text-red-800'
                          }`}>
                            <span className={`text-[10px] uppercase tracking-wider font-extrabold block mb-1 ${
                              ans.is_correct ? 'text-green-600' : 'text-red-500'
                            }`}>
                              Student's Answer
                            </span>
                            <span className="text-gray-700 font-bold text-sm leading-relaxed">{ans.selected_option || 'None selected'}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {(!exam.answers || exam.answers.length === 0) && (
                      <p className="text-center text-gray-400 text-sm py-4">No detailed answers available for this attempt.</p>
                    )}
                  </div>
                </div>
              )}
            </Card>
          ))}
          {profile.exams.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200 text-gray-400">
              <Award size={40} className="mx-auto mb-3 opacity-30 text-[#0B2A5B]" />
              <p className="font-semibold text-sm">No exams taken yet.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}

// Simple placeholder icons
function UsersNotFoundIcon() {
  return (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );
}
