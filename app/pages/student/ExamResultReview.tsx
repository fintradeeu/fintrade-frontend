import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router";
import api from "../../services/api";
import DashboardLayout from "../../components/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Progress } from "../../components/ui/progress";
import { CheckCircle, XCircle, AlertTriangle, Clock, ArrowLeft, Info, FileText, ExternalLink } from "lucide-react";

export default function ExamResultReview() {
  const { attemptId } = useParams();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const examType = searchParams.get("type") || "course";
  
  const [loading, setLoading] = useState(true);
  const [review, setReview] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReview = async () => {
      try {
        const endpoint = examType === "entrance" 
          ? `/exams/entrance/attempt/${attemptId}/review`
          : `/exams/course/attempt/${attemptId}/review`;
        const res = await api.get(endpoint);
        setReview(res.data);
      } catch (err) {
        console.error("Failed to fetch exam review:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReview();
  }, [attemptId, examType]);

  if (loading) {
    return (
      <DashboardLayout role="student">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0B2A5B] mx-auto mb-4"></div>
            <p className="text-[#0B2A5B]/60">Evaluating your performance...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!review) {
    return (
      <DashboardLayout role="student">
        <Card className="p-8 text-center max-w-2xl mx-auto mt-12">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#0B2A5B] mb-2">Review Not Found</h2>
          <p className="text-[#0B2A5B]/60 mb-6">We couldn't retrieve the details for this exam attempt.</p>
          <Button onClick={() => navigate("/student/exams")} className="bg-[#0B2A5B] text-white">
            Back to Dashboard
          </Button>
        </Card>
      </DashboardLayout>
    );
  }

  const isWasted = review.violations?.includes("tab_switch");

  return (
    <DashboardLayout role="student">
      <div className="max-w-4xl mx-auto space-y-6 pb-12">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/student/exams")} className="text-[#0B2A5B]/60 hover:text-[#0B2A5B]">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Exams
          </Button>
          <Badge className={review.passed ? "bg-green-100 text-green-700 border-green-200" : "bg-red-100 text-red-700 border-red-200"}>
            {review.passed ? "PASSED" : "FAILED"}
          </Badge>
        </div>

        {/* Score Summary Card */}
        <Card className={`p-8 border-t-4 ${review.passed ? 'border-t-green-500' : 'border-t-red-500'} shadow-lg overflow-hidden relative`}>
          {isWasted && (
            <div className="absolute top-0 right-0 bg-red-600 text-white px-4 py-1 text-xs font-bold uppercase tracking-widest rotate-0 sm:rotate-45 sm:translate-x-8 sm:translate-y-4">
              Wasted Attempt
            </div>
          )}
          
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-bold text-[#0B2A5B] mb-2">{review.exam_title}</h1>
              <p className="text-[#0B2A5B]/60 mb-6">
                Completed on {new Date(review.submitted_at).toLocaleDateString()} at {new Date(review.submitted_at).toLocaleTimeString()}
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-xs text-[#0B2A5B]/40 uppercase font-bold mb-1">Score Obtained</p>
                  <p className="text-2xl font-bold text-[#0B2A5B]">{review.obtained_marks} / {review.total_marks}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-xs text-[#0B2A5B]/40 uppercase font-bold mb-1">Percentage</p>
                  <p className="text-2xl font-bold text-[#0B2A5B]">{review.percentage}%</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <div className="relative h-40 w-40 mb-4">
                <svg className="h-full w-full" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="16" fill="none" stroke="#eee" strokeWidth="3" />
                  <circle 
                    cx="18" cy="18" r="16" fill="none" 
                    stroke={review.passed ? "#22c55e" : "#ef4444"} 
                    strokeWidth="3" 
                    strokeDasharray={`${review.percentage}, 100`} 
                    transform="rotate(-90 18 18)" 
                  />
                  <text x="18" y="20.5" className="text-[8px] font-bold fill-[#0B2A5B]" textAnchor="middle">{review.percentage}%</text>
                </svg>
              </div>
              <Badge className={review.passed ? "bg-green-500" : "bg-red-500"}>
                {review.passed ? "Assessment Qualified" : "Retake Recommended"}
              </Badge>
            </div>
          </div>

          {isWasted && (
            <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <AlertTriangle className="text-red-600 flex-shrink-0" size={20} />
              <div>
                <h4 className="font-bold text-red-900 text-sm">Integrity Violation Detected</h4>
                <p className="text-red-700 text-xs mt-1">
                  This attempt was automatically submitted because you switched browser tabs or minimized the window. 
                  Our proctoring system is strictly designed to ensure exam integrity.
                </p>
              </div>
            </div>
          )}
        </Card>

        {/* Detailed Review Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <FileText className="text-[#0B2A5B]" size={20} />
            <h2 className="text-xl font-bold text-[#0B2A5B]">Question Review</h2>
          </div>

          {review.questions.map((q: any, idx: number) => (
            <Card key={q.id} className="p-6 overflow-hidden">
              <div className="flex items-start gap-4">
                <div className={`h-8 w-8 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-sm ${
                  q.is_correct === true ? "bg-green-100 text-green-700" : 
                  q.is_correct === false ? "bg-red-100 text-red-700" : 
                  "bg-gray-100 text-gray-500"
                }`}>
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <p className="text-lg font-medium text-[#0B2A5B] leading-relaxed">
                      {q.question_text}
                    </p>
                    <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
                      {q.marks} Marks
                    </Badge>
                  </div>

                  <div className="grid gap-2">
                    {q.options.map((opt: any) => {
                      const isSelected = q.selected_option_id === opt.id;
                      const isCorrect = opt.is_correct;
                      
                      let variantClasses = "border-gray-100 bg-white";
                      if (isSelected && isCorrect) variantClasses = "border-green-500 bg-green-50 ring-1 ring-green-500";
                      else if (isSelected && !isCorrect) variantClasses = "border-red-500 bg-red-50 ring-1 ring-red-500";
                      else if (!isSelected && isCorrect) variantClasses = "border-green-200 bg-green-50/30";

                      return (
                        <div key={opt.id} className={`p-4 rounded-xl border flex items-center justify-between transition-all ${variantClasses}`}>
                          <div className="flex items-center gap-3">
                            <div className={`h-5 w-5 rounded-full border flex items-center justify-center ${isSelected ? (isCorrect ? 'bg-green-500 border-green-500' : 'bg-red-500 border-red-500') : 'border-gray-300'}`}>
                              {isSelected && (isCorrect ? <CheckCircle size={14} className="text-white" /> : <XCircle size={14} className="text-white" />)}
                            </div>
                            <span className={`text-sm ${isSelected ? 'font-semibold text-[#0B2A5B]' : 'text-[#0B2A5B]/70'}`}>
                              {opt.option_text}
                            </span>
                          </div>
                          {isCorrect && !isSelected && (
                            <Badge className="bg-green-100 text-green-700 text-[10px] border-none">Correct Answer</Badge>
                          )}
                          {isSelected && !isCorrect && (
                            <Badge className="bg-red-100 text-red-700 text-[10px] border-none">Your Choice</Badge>
                          )}
                          {isSelected && isCorrect && (
                            <Badge className="bg-green-500 text-white text-[10px]">Great Job!</Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {q.explanation && (
                    <div className="mt-6 p-4 bg-blue-50/50 border border-blue-100 rounded-xl">
                      <div className="flex items-center gap-2 mb-1 text-blue-800 font-bold text-xs uppercase tracking-wider">
                        <Info size={14} /> Explanation
                      </div>
                      <p className="text-sm text-blue-900 leading-relaxed">
                        {q.explanation}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="flex justify-center pt-6">
          <Button onClick={() => navigate("/student/exams")} size="lg" className="bg-[#0B2A5B] text-white px-12">
            Finish Review
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
