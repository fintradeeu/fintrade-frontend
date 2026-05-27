import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import DashboardLayout from "../../components/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Progress } from "../../components/ui/progress";
import { FileText, CheckCircle, XCircle, Clock, Calendar, AlertCircle, IndianRupee, BookOpen, ExternalLink } from "lucide-react";
import api from "../../services/api";

export default function MonthlyExams() {
  const [monthlyExams, setMonthlyExams] = useState<any[]>([]);
  const [courseExams, setCourseExams] = useState<any[]>([]);
  const [entranceExams, setEntranceExams] = useState<any[]>([]);
  const [courses, setCourses] = useState<Record<number, string>>({});
  const [courseProgress, setCourseProgress] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [showRetakePayment, setShowRetakePayment] = useState(false);
  const [selectedExam, setSelectedExam] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "monthly" | "entrance">("all");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch enrolled courses first to build a name lookup
        const enrolledRes = await api.get("/courses/enrolled");
        const courseMap: Record<number, string> = {};
        const progressMap: Record<number, number> = {};
        for (const e of enrolledRes.data) {
          courseMap[e.course_id] = e.course?.title || `Course #${e.course_id}`;
          progressMap[e.course_id] = e.progress_percent || 0;
        }
        setCourses(courseMap);
        setCourseProgress(progressMap);

        // Fetch course exams and entrance exams
        const enrolledIds = Object.keys(courseMap).map(Number);
        const allCourseExams: any[] = [];
        const unattemptedEntrance: any[] = [];
        
        // Use the all-exams endpoint to get course exams
        try {
          const allRes = await api.get("/exams/all");
          const ce = (allRes.data.course_exams || []).filter(
            (e: any) => enrolledIds.includes(e.course_id) && e.is_active
          );
          allCourseExams.push(...ce);

          // Filter entrance exams: only show ones for courses the user is NOT enrolled in
          const ee = (allRes.data.entrance_exams || []).filter(
            (e: any) => !enrolledIds.includes(e.course_id) && e.is_active
          );
          unattemptedEntrance.push(...ee);
        } catch {
          // fallback: no course exams
        }
        setCourseExams(allCourseExams);
        setEntranceExams(unattemptedEntrance);

        // Fetch monthly exams
        const monthlyRes = await api.get("/exams/monthly");
        setMonthlyExams(monthlyRes.data);
      } catch (err) {
        console.error("Failed to fetch exams:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleStartExam = (examId: number, type: string = "course") => {
    if (type === "entrance") {
      navigate(`/student/entrance-exam?exam_id=${examId}`);
    } else {
      navigate(`/student/exam/${examId}?type=${type}`);
    }
  };

  const handleRetakeExam = (examId: number) => {
    setSelectedExam(examId);
    setShowRetakePayment(true);
  };

  const processRetakePayment = async () => {
    try {
      await api.post("/exams/pay", { exam_id: selectedExam, amount: 300 });
      alert("Payment successful! You can now retake the exam.");
    } catch (err: any) {
      alert("Payment failed: " + (err.response?.data?.detail || err.message));
    }
    setShowRetakePayment(false);
    setSelectedExam(null);
  };

  const totalExams = courseExams.length + monthlyExams.length + entranceExams.length;

  return (
    <DashboardLayout role="student">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0B2A5B] mb-2">Exams & Assessments</h1>
        <p className="text-[#0B2A5B]/70">All your course exams and monthly assessments in one place</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-[#0B2A5B]/60">Loading exams...</div>
      ) : !showRetakePayment ? (
        <>
          {/* Stats Bar */}
          <Card className="p-6 bg-gradient-to-r from-[#0B2A5B] to-[#1a3d7a] text-[#F4F1EA] mb-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold mb-1">Exam Dashboard</h3>
                <p className="text-[#F4F1EA]/80">{totalExams} exams available across your courses</p>
              </div>
              <div className="text-right hidden md:block">
                <p className="text-sm text-[#F4F1EA]/80">Course Exams</p>
                <p className="text-4xl font-bold text-[#C2A86A]">{courseExams.length}</p>
              </div>
            </div>
          </Card>

          {/* Tab Switcher */}
          <div className="flex rounded-xl bg-white border border-gray-200 p-1 shadow-sm mb-6 overflow-x-auto">
            <button
              className={`flex-1 py-2.5 px-4 whitespace-nowrap rounded-lg text-sm font-semibold transition-all ${
                activeTab === "all" ? "bg-[#0B2A5B] text-white shadow" : "text-[#0B2A5B]/70 hover:bg-gray-50"
              }`}
              onClick={() => setActiveTab("all")}
            >
              Course Exams ({courseExams.length})
            </button>
            <button
              className={`flex-1 py-2.5 px-4 whitespace-nowrap rounded-lg text-sm font-semibold transition-all ${
                activeTab === "monthly" ? "bg-[#0B2A5B] text-white shadow" : "text-[#0B2A5B]/70 hover:bg-gray-50"
              }`}
              onClick={() => setActiveTab("monthly")}
            >
              Monthly Assessments ({monthlyExams.length})
            </button>
          </div>

          {/* ─── COURSE EXAMS TAB ─── */}
          {activeTab === "all" && (
            courseExams.length === 0 ? (
              <Card className="p-8 bg-white shadow-lg text-center">
                <p className="text-[#0B2A5B]/60">No course exams available yet. Enroll in a course to see exams.</p>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courseExams.map((exam) => (
                  <Card key={`course-${exam.id}`} className="p-6 shadow-lg bg-white flex flex-col">
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className="bg-blue-600 text-white">
                          {exam.type === "course_final" ? "Final" : exam.type === "monthly" ? "Monthly" : exam.type}
                        </Badge>
                        {exam.is_active && <Badge className="bg-green-100 text-green-700">Active</Badge>}
                        {(courseProgress[exam.course_id] || 0) < 100 && (
                          <Badge className="bg-red-100 text-red-700 border-red-200">
                            Locked (Requires 100% Progress)
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-xl font-semibold text-[#0B2A5B] mb-1">{exam.title}</h3>
                      <div className="flex items-center gap-1.5 text-sm text-[#C2A86A] font-medium">
                        <BookOpen size={14} />
                        <span>{courses[exam.course_id] || `Course #${exam.course_id}`}</span>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4 pb-4 border-b border-[#0B2A5B]/10 flex-1">
                      <div className="flex items-center gap-2 text-sm text-[#0B2A5B]/70">
                        <Clock size={14} className="text-[#C2A86A]" />
                        <span>{exam.duration_minutes} minutes</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-[#0B2A5B]/70">
                        <FileText size={14} className="text-[#C2A86A]" />
                        <span>Passing: {exam.passing_score}%</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-[#0B2A5B]/70">
                        <AlertCircle size={14} className="text-[#C2A86A]" />
                        <span>{exam.questions_count} questions in pool</span>
                      </div>
                    </div>

                    {/* Attempts History */}
                    {exam.attempts && exam.attempts.length > 0 && (
                      <div className="mb-4 space-y-2">
                        <p className="text-xs font-bold text-[#0B2A5B]/40 uppercase tracking-wider">Your Attempts</p>
                        {exam.attempts.map((att: any) => (
                          <div key={att.id} className="flex items-center justify-between p-2 rounded bg-gray-50 border border-gray-100 group">
                            <div className="flex flex-col">
                              <span className={`text-xs font-bold ${att.passed ? 'text-green-600' : 'text-red-600'}`}>
                                {att.percentage}% — {att.passed ? 'Passed' : 'Failed'}
                                {att.is_violation_wasted && <span className="ml-1 text-[10px] text-red-500 font-normal">(Wasted)</span>}
                              </span>
                              <span className="text-[10px] text-[#0B2A5B]/40">
                                {new Date(att.submitted_at).toLocaleDateString()}
                              </span>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-7 px-2 text-[#C2A86A] opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => navigate(`/student/exam/review/${att.id}?type=${exam.type}`)}
                            >
                              Review <ExternalLink size={10} className="ml-1" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    {exam.is_active && (
                      <Button 
                        onClick={() => handleStartExam(exam.id, "course")} 
                        disabled={(courseProgress[exam.course_id] || 0) < 100}
                        className={`w-full ${
                          (courseProgress[exam.course_id] || 0) < 100 
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
                            : "bg-[#0B2A5B] text-[#F4F1EA] hover:bg-[#1a3d7a]"
                        }`}
                      >
                        {(courseProgress[exam.course_id] || 0) < 100 ? "Complete Course to Unlock" : (exam.attempts && exam.attempts.length > 0 ? "Retake Exam" : "Start Exam")}
                      </Button>
                    )}
                  </Card>
                ))}
              </div>
            )
          )}


          {/* ─── MONTHLY EXAMS TAB ─── */}
          {activeTab === "monthly" && (
            monthlyExams.length === 0 ? (
              <Card className="p-8 bg-white shadow-lg text-center">
                <p className="text-[#0B2A5B]/60">No monthly exams available yet.</p>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {monthlyExams.map((item: any) => {
                  const exam = item.exam || {};
                  const attempts = exam.attempts || [];
                  return (
                    <Card key={item.id} className="p-6 shadow-lg bg-white flex flex-col">
                      <div className="mb-4">
                        <Badge className="bg-purple-600 text-white mb-3">Month {item.month_number}</Badge>
                        <h3 className="text-xl font-semibold text-[#0B2A5B] mb-2">
                          {exam.title || `Month ${item.month_number} Exam`}
                        </h3>
                      </div>

                      <div className="space-y-2 mb-4 pb-4 border-b border-[#0B2A5B]/10 flex-1">
                        <div className="flex items-center gap-2 text-sm text-[#0B2A5B]/70">
                          <Clock size={14} className="text-[#C2A86A]" />
                          <span>{exam.duration_minutes} minutes</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-[#0B2A5B]/70">
                          <FileText size={14} className="text-[#C2A86A]" />
                          <span>Passing: {exam.passing_score}%</span>
                        </div>
                      </div>

                      {/* Attempts History */}
                      {attempts.length > 0 && (
                        <div className="mb-4 space-y-2">
                          <p className="text-xs font-bold text-[#0B2A5B]/40 uppercase tracking-wider">Your Attempts</p>
                          {attempts.map((att: any) => (
                            <div key={att.id} className="flex items-center justify-between p-2 rounded bg-gray-50 border border-gray-100 group">
                              <div className="flex flex-col">
                                <span className={`text-xs font-bold ${att.passed ? 'text-green-600' : 'text-red-600'}`}>
                                  {att.percentage}% — {att.passed ? 'Passed' : 'Failed'}
                                  {att.is_violation_wasted && <span className="ml-1 text-[10px] text-red-500 font-normal">(Wasted)</span>}
                                </span>
                                <span className="text-[10px] text-[#0B2A5B]/40">
                                  {new Date(att.submitted_at).toLocaleDateString()}
                                </span>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-7 px-2 text-[#C2A86A] opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => navigate(`/student/exam/review/${att.id}?type=${exam.type}`)}
                              >
                                Review <ExternalLink size={10} className="ml-1" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}

                      {exam.is_active && (
                        <Button onClick={() => handleStartExam(exam.id, "monthly")} className="w-full bg-[#0B2A5B] text-[#F4F1EA] hover:bg-[#1a3d7a]">
                          {attempts.length > 0 ? "Retake Exam" : "Start Exam"}
                        </Button>
                      )}
                    </Card>
                  );
                })}
              </div>
            )
          )}

          {/* Exam Guidelines */}
          <Card className="p-6 bg-yellow-50 border-yellow-200 mt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-yellow-600 flex-shrink-0" size={24} />
              <div>
                <h3 className="font-semibold text-yellow-900 mb-2">Exam Guidelines</h3>
                <ul className="space-y-1 text-sm text-yellow-800">
                  <li>• Each exam must be completed within the specified duration</li>
                  <li>• Questions are randomly selected from the question pool</li>
                  <li>• Tab switching during exam will result in auto-submission</li>
                  <li>• All exams must be passed to receive your certificate</li>
                </ul>
              </div>
            </div>
          </Card>
        </>
      ) : (
        <Card className="max-w-2xl mx-auto p-8 bg-white shadow-xl">
          <h2 className="text-2xl font-bold text-[#0B2A5B] mb-6">Retake Exam Payment</h2>
          <div className="bg-[#F4F1EA] rounded-lg p-6 mb-6">
            <p className="text-sm text-[#0B2A5B]/70 mb-4">Purchase an additional attempt to improve your score</p>
          </div>
          <div className="bg-[#F4F1EA] rounded-lg p-6 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-[#0B2A5B]">Retake Fee</span>
              <span className="text-3xl font-bold text-[#C2A86A] flex items-center gap-1"><IndianRupee size={24} />300</span>
            </div>
          </div>
          <div className="flex gap-4">
            <Button onClick={processRetakePayment} className="flex-1 bg-[#0B2A5B] text-[#F4F1EA] hover:bg-[#1a3d7a]" size="lg">Pay ₹300</Button>
            <Button onClick={() => setShowRetakePayment(false)} variant="outline" className="border-2 border-[#0B2A5B]/20 text-[#0B2A5B]" size="lg">Cancel</Button>
          </div>
        </Card>
      )}
    </DashboardLayout>
  );
}
