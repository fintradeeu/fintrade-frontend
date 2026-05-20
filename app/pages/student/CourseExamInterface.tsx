import { useState, useEffect } from "react";
import api from "../../services/api";
import { useNavigate, useParams, useLocation } from "react-router";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Progress } from "../../components/ui/progress";
import { Textarea } from "../../components/ui/textarea";
import { ArrowLeft, Clock, Camera, AlertTriangle, ChevronLeft, ChevronRight, Flag } from "lucide-react";

export default function CourseExamInterface() {
  const { examId } = useParams();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const examType = searchParams.get("type") || "course";
  
  const [examStarted, setExamStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, { optionId?: number; text?: string }>>({});
  const [timeRemaining, setTimeRemaining] = useState(3600); // default 60 minutes
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const handleStartExam = async () => {
    if (!examId) return;
    setErrorMsg("");
    try {
      // Camera Check
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        // Keep camera active, but stop it when exam is done
        (window as any).examCameraStream = stream;
      } catch (err) {
        setErrorMsg("Camera access is required to start the proctored exam.");
        return;
      }

      // 1. Start attempt
      const startEndpoint = examType === "entrance" 
        ? `/exams/start?exam_id=${examId}` 
        : `/exams/course/start?exam_id=${examId}`;
      
      const payload = { device_id: navigator.userAgent };
      const startRes = await api.post(startEndpoint, payload);
      const newAttemptId = startRes.data.attempt_id;
      setAttemptId(newAttemptId);
      setTimeRemaining((startRes.data.duration_minutes || 60) * 60);

      // 2. Fetch questions — use the correct endpoint for exam type
      const questionsEndpoint = examType === "entrance" 
        ? `/exams/questions?exam_id=${examId}`
        : `/exams/course/questions?exam_id=${examId}`;
      const qRes = await api.get(questionsEndpoint);
      const loadedQuestions = qRes.data;

      setQuestions(loadedQuestions);
      setAnswers({});
      setExamStarted(true);
      
      // Start timer
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmitExam(newAttemptId);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      (window as any).examTimer = timer;

      // Tab Switch Listener
      const handleVisibilityChange = async () => {
        if (document.hidden && newAttemptId) {
          try {
            await api.post("/exams/violation", {
              attempt_id: newAttemptId,
              violation_type: "tab_switch"
            });
            alert("Warning: You switched tabs during a proctored exam. Your exam has been automatically submitted.");
            clearInterval((window as any).examTimer);
            handleSubmitExam(newAttemptId);
          } catch (e) {
            console.error("Failed to log violation");
          }
        }
      };
      document.addEventListener("visibilitychange", handleVisibilityChange);
      (window as any).examVisibilityListener = handleVisibilityChange;

    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || "Failed to start exam. Check if you are allowed to attempt.");
    }
  };

  const handleOptionSelect = (questionId: number, optionId: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: { ...prev[questionId], optionId } }));
  };

  const handleTextAnswer = (questionId: number, text: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: { ...prev[questionId], text } }));
  };

  const handleSubmitExam = async (arg?: any) => {
    const activeAttemptId = typeof arg === 'number' ? arg : attemptId;
    if (!activeAttemptId) return;

    try {
      const mappedAnswers = questions.map((q) => {
        const ans = answers[q.id] || {};
        return {
          question_id: q.id,
          selected_option_id: ans.optionId || null,
          descriptive_text: ans.text || null
        };
      }).filter(a => a.selected_option_id !== null || a.descriptive_text !== null);

      const submitEndpoint = examType === "entrance" ? "/exams/submit" : "/exams/course/submit";
      const res = await api.post(submitEndpoint, {
        attempt_id: activeAttemptId,
        answers: mappedAnswers
      });
      
      // Cleanup
      if ((window as any).examTimer) clearInterval((window as any).examTimer);
      if ((window as any).examVisibilityListener) {
        document.removeEventListener("visibilitychange", (window as any).examVisibilityListener);
      }
      if ((window as any).examCameraStream) {
        (window as any).examCameraStream.getTracks().forEach((track: any) => track.stop());
      }

      const score = res.data.percentage || 0;
      const passed = res.data.passed;

      if (passed) {
        alert(`Congratulations! You passed with a score of ${score}%.`);
      } else {
        alert(`You scored ${score}%. The passing score is ${questions.length > 0 ? (res.data.passing_score || 60) : 60}%.`);
      }
      
      // Navigate to review page
      navigate(`/student/exam/review/${activeAttemptId}?type=${examType}`);
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to submit exam.");
    }
  };

  if (!examStarted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <Card className="max-w-xl w-full p-8 shadow-xl bg-white">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-[#0B2A5B]/10 rounded-full flex items-center justify-center">
              <Camera size={32} className="text-[#0B2A5B]" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center text-[#0B2A5B] mb-2">Exam Readiness Check</h2>
          <p className="text-center text-[#0B2A5B]/70 mb-8">
            Please ensure your webcam is enabled and you are in a quiet environment.
          </p>
          
          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg text-sm text-yellow-800">
              <AlertTriangle className="flex-shrink-0 mt-0.5" size={18} />
              <p>Warning: Tab switching or navigating away from this page will result in automatic submission of your exam.</p>
            </div>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded text-center text-sm font-medium">
              {errorMsg}
            </div>
          )}

          <div className="flex flex-col gap-4">
            <Button 
              size="lg" 
              className="w-full bg-[#C2A86A] hover:bg-[#C2A86A]/90 text-[#0B2A5B] text-lg font-semibold h-14"
              onClick={handleStartExam}
            >
              Start Exam
            </Button>
            <Button 
              variant="outline" 
              className="w-full text-[#0B2A5B] h-12"
              onClick={() => navigate(examType === "entrance" ? "/" : "/student/exams")}
            >
              Cancel
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const q = questions[currentQuestion];
  const qAnswer = answers[q?.id] || {};

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Bar */}
      <div className="bg-[#0B2A5B] text-white p-4 sticky top-0 z-10 shadow-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="font-bold text-xl hidden md:block">FinTrade Examination</h1>
            <div className="bg-red-500/20 text-red-100 px-3 py-1 rounded-full flex items-center gap-2 text-sm font-medium">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              Proctored Session
            </div>
            <div className="bg-green-500/20 text-green-100 px-3 py-1 rounded-full flex items-center gap-2 text-sm font-medium">
              <Camera size={14} className="text-green-400" />
              Camera Active
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 font-mono text-xl bg-[#0B2A5B] border border-white/20 px-4 py-2 rounded">
              <Clock size={20} className="text-[#C2A86A]" />
              {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
            </div>
            <Button variant="outline" size="sm" className="border-white/20 text-black hover:bg-white hover:text-[#0B2A5B]" onClick={handleSubmitExam}>
              Submit Exam
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-6xl w-full mx-auto grid grid-cols-1 md:grid-cols-[1fr_300px] gap-6 p-6">
        {/* Main Content */}
        <div className="flex flex-col gap-6">
          <Card className="p-8 shadow-md border-t-4 border-t-[#C2A86A] flex-1">
            <div className="flex justify-between items-start mb-6">
              <div className="bg-[#0B2A5B]/5 text-[#0B2A5B] px-4 py-1.5 rounded font-semibold text-sm">
                Question {currentQuestion + 1} of {questions.length}
              </div>
              <Button variant="ghost" size="sm" className="text-[#0B2A5B]/60 hover:text-[#0B2A5B]">
                <Flag size={16} className="mr-2" />
                Flag for review
              </Button>
            </div>

            {q && (
              <>
                <h2 className="text-xl md:text-2xl font-medium text-[#0B2A5B] mb-8 leading-relaxed">
                  {q.question_text}
                </h2>
                
                {q.question_type === "descriptive" ? (
                  <Textarea 
                    className="min-h-[200px]"
                    placeholder="Type your answer here..."
                    value={qAnswer.text || ""}
                    onChange={(e) => handleTextAnswer(q.id, e.target.value)}
                  />
                ) : (
                  <div className="space-y-4">
                    {q.options?.map((opt: any, index: number) => (
                      <div 
                        key={opt.id}
                        onClick={() => handleOptionSelect(q.id, opt.id)}
                        className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                          qAnswer.optionId === opt.id 
                            ? 'border-[#C2A86A] bg-[#C2A86A]/5' 
                            : 'border-gray-100 hover:border-[#0B2A5B]/30 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            qAnswer.optionId === opt.id 
                              ? 'border-[#C2A86A]' 
                              : 'border-gray-300'
                          }`}>
                            {qAnswer.optionId === opt.id && <div className="w-3 h-3 rounded-full bg-[#C2A86A]" />}
                          </div>
                          <span className="text-lg text-gray-700">{opt.option_text}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </Card>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              size="lg"
              disabled={currentQuestion === 0}
              onClick={() => setCurrentQuestion(prev => prev - 1)}
              className="border-[#0B2A5B]/20 text-[#0B2A5B]"
            >
              <ChevronLeft className="mr-2" /> Previous
            </Button>

            {currentQuestion === questions.length - 1 ? (
              <Button 
                size="lg"
                onClick={handleSubmitExam}
                className="bg-[#C2A86A] hover:bg-[#C2A86A]/90 text-[#0B2A5B] font-semibold px-8"
              >
                Submit Exam
              </Button>
            ) : (
              <Button 
                size="lg"
                onClick={() => setCurrentQuestion(prev => prev + 1)}
                className="bg-[#0B2A5B] text-white hover:bg-[#1a3d7a]"
              >
                Next <ChevronRight className="ml-2" />
              </Button>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="p-6 shadow-md">
            <h3 className="font-semibold text-[#0B2A5B] mb-4">Exam Navigation</h3>
            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, idx) => {
                const ans = answers[q.id] || {};
                const isAnswered = ans.optionId !== undefined || (ans.text && ans.text.trim().length > 0);
                
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestion(idx)}
                    className={`
                      w-10 h-10 rounded text-sm font-medium transition-colors
                      ${currentQuestion === idx ? 'ring-2 ring-offset-2 ring-[#0B2A5B]' : ''}
                      ${isAnswered 
                        ? 'bg-[#C2A86A] text-[#0B2A5B]' 
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}
                    `}
                  >
                    {idx + 1}
                  </button>
                )
              })}
            </div>
            
            <div className="mt-6 space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-[#C2A86A]" /> Answered
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-gray-100 border" /> Not Answered
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
