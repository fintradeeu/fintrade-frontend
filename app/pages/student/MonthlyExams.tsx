import { useState, useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Progress } from "../../components/ui/progress";
import { FileText, CheckCircle, XCircle, Clock, Calendar, AlertCircle, IndianRupee } from "lucide-react";
import api from "../../services/api";

export default function MonthlyExams() {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRetakePayment, setShowRetakePayment] = useState(false);
  const [selectedExam, setSelectedExam] = useState<number | null>(null);

  useEffect(() => {
    api.get("/exams/monthly").then((res) => {
      setExams(res.data);
    }).catch((err) => {
      console.error("Failed to fetch monthly exams:", err);
    }).finally(() => setLoading(false));
  }, []);

  const handleStartExam = (examId: number) => {
    alert(`Starting exam ${examId}. In production, this would navigate to the exam interface.`);
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

  // Derive stats from real data
  const completedExams = exams.filter((e) => e.exam);
  const avgScore = completedExams.length > 0 ? Math.round(completedExams.reduce((sum: number, e: any) => sum + (e.exam?.passing_score || 0), 0) / completedExams.length) : 0;

  return (
    <DashboardLayout role="student">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0B2A5B] mb-2">Monthly Exams</h1>
        <p className="text-[#0B2A5B]/70">Track your progress with monthly assessments</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-[#0B2A5B]/60">Loading exams...</div>
      ) : !showRetakePayment ? (
        <>
          {/* Overall Progress */}
          <Card className="p-6 bg-gradient-to-r from-[#0B2A5B] to-[#1a3d7a] text-[#F4F1EA] mb-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold mb-1">Exam Progress</h3>
                <p className="text-[#F4F1EA]/80">{exams.length} monthly exams available</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-[#F4F1EA]/80">Total Exams</p>
                <p className="text-4xl font-bold text-[#C2A86A]">{exams.length}</p>
              </div>
            </div>
            <Progress value={exams.length > 0 ? (completedExams.length / exams.length) * 100 : 0} className="h-3" />
          </Card>

          {exams.length === 0 ? (
            <Card className="p-8 bg-white shadow-lg text-center">
              <p className="text-[#0B2A5B]/60">No monthly exams available yet. Enroll in a course to see exams.</p>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {exams.map((item) => (
                <Card key={item.id} className="p-6 shadow-lg bg-white">
                  <div className="mb-4">
                    <Badge className={item.exam?.is_active ? "bg-blue-600 text-white mb-3" : "bg-gray-400 text-white mb-3"}>
                      {item.exam?.is_active ? "Available" : "Inactive"}
                    </Badge>
                    <h3 className="text-xl font-semibold text-[#0B2A5B] mb-2">
                      {item.exam?.title || `Month ${item.month_number} Exam`}
                    </h3>
                  </div>

                  <div className="space-y-2 mb-4 pb-4 border-b border-[#0B2A5B]/10">
                    <div className="flex items-center gap-2 text-sm text-[#0B2A5B]/70">
                      <Calendar size={14} className="text-[#C2A86A]" />
                      <span>Month {item.month_number}</span>
                    </div>
                    {item.exam && (
                      <>
                        <div className="flex items-center gap-2 text-sm text-[#0B2A5B]/70">
                          <Clock size={14} className="text-[#C2A86A]" />
                          <span>{item.exam.duration_minutes} minutes</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-[#0B2A5B]/70">
                          <FileText size={14} className="text-[#C2A86A]" />
                          <span>Passing: {item.exam.passing_score}%</span>
                        </div>
                        {item.exam.max_attempts && (
                          <div className="flex items-center gap-2 text-sm text-[#0B2A5B]/70">
                            <AlertCircle size={14} className="text-[#C2A86A]" />
                            <span>Max {item.exam.max_attempts} attempts</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {item.exam?.is_active && (
                    <Button onClick={() => handleStartExam(item.exam.id)} className="w-full bg-[#0B2A5B] text-[#F4F1EA] hover:bg-[#1a3d7a]">
                      Start Exam
                    </Button>
                  )}
                </Card>
              ))}
            </div>
          )}

          {/* Info Card */}
          <Card className="p-6 bg-yellow-50 border-yellow-200 mt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-yellow-600 flex-shrink-0" size={24} />
              <div>
                <h3 className="font-semibold text-yellow-900 mb-2">Exam Guidelines</h3>
                <ul className="space-y-1 text-sm text-yellow-800">
                  <li>• Each exam must be completed within the specified duration</li>
                  <li>• Passing score varies per exam</li>
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
