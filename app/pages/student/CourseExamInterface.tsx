import { useState, useEffect } from "react";
import api from "../../services/api";
import { useNavigate, useParams, useLocation } from "react-router";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Textarea } from "../../components/ui/textarea";
import { Clock, Camera, AlertTriangle, ChevronLeft, ChevronRight, Flag, Calculator, X } from "lucide-react";

// ── Inline Calculator Component ──
function ExamCalculator({ onClose }: { onClose: () => void }) {
  const [display, setDisplay] = useState("0");
  const [expression, setExpression] = useState("");

  const handleInput = (val: string) => {
    if (display === "0" && val !== ".") setDisplay(val);
    else setDisplay(display + val);
  };

  const handleOperator = (op: string) => {
    setExpression(display + " " + op + " ");
    setDisplay("0");
  };

  const handleEquals = () => {
    try {
      const fullExpr = expression + display;
      // safe eval for basic math
      const result = Function('"use strict"; return (' + fullExpr + ')')();
      setDisplay(String(Math.round(result * 1e8) / 1e8));
      setExpression("");
    } catch {
      setDisplay("Error");
      setExpression("");
    }
  };

  const handleClear = () => { setDisplay("0"); setExpression(""); };
  const handleBackspace = () => {
    if (display.length > 1) setDisplay(display.slice(0, -1));
    else setDisplay("0");
  };

  const handleSpecial = (fn: string) => {
    const num = parseFloat(display);
    let result = 0;
    switch (fn) {
      case "sqrt": result = Math.sqrt(num); break;
      case "%": result = num / 100; break;
      case "±": result = -num; break;
      default: return;
    }
    setDisplay(String(Math.round(result * 1e8) / 1e8));
  };

  const btnClass = "h-10 rounded-lg font-semibold text-sm transition-colors";

  return (
    <Card className="absolute bottom-4 right-4 w-72 shadow-2xl border-2 border-[#C2A86A] z-50 bg-white">
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-[#0B2A5B] uppercase tracking-wider">Calculator</span>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
        </div>
        <div className="bg-[#0B2A5B] rounded-lg p-3 mb-2">
          <div className="text-right text-xs text-white/50 h-4 font-mono">{expression}</div>
          <div className="text-right text-2xl font-mono text-white font-bold truncate">{display}</div>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          <button onClick={handleClear} className={`${btnClass} bg-red-100 text-red-700 hover:bg-red-200 col-span-2`}>AC</button>
          <button onClick={handleBackspace} className={`${btnClass} bg-orange-100 text-orange-700 hover:bg-orange-200`}>⌫</button>
          <button onClick={() => handleOperator("/")} className={`${btnClass} bg-[#C2A86A]/20 text-[#0B2A5B] hover:bg-[#C2A86A]/30`}>÷</button>

          {["7","8","9"].map(n => <button key={n} onClick={() => handleInput(n)} className={`${btnClass} bg-gray-100 text-[#0B2A5B] hover:bg-gray-200`}>{n}</button>)}
          <button onClick={() => handleOperator("*")} className={`${btnClass} bg-[#C2A86A]/20 text-[#0B2A5B] hover:bg-[#C2A86A]/30`}>×</button>

          {["4","5","6"].map(n => <button key={n} onClick={() => handleInput(n)} className={`${btnClass} bg-gray-100 text-[#0B2A5B] hover:bg-gray-200`}>{n}</button>)}
          <button onClick={() => handleOperator("-")} className={`${btnClass} bg-[#C2A86A]/20 text-[#0B2A5B] hover:bg-[#C2A86A]/30`}>−</button>

          {["1","2","3"].map(n => <button key={n} onClick={() => handleInput(n)} className={`${btnClass} bg-gray-100 text-[#0B2A5B] hover:bg-gray-200`}>{n}</button>)}
          <button onClick={() => handleOperator("+")} className={`${btnClass} bg-[#C2A86A]/20 text-[#0B2A5B] hover:bg-[#C2A86A]/30`}>+</button>

          <button onClick={() => handleSpecial("±")} className={`${btnClass} bg-gray-100 text-[#0B2A5B] hover:bg-gray-200`}>±</button>
          <button onClick={() => handleInput("0")} className={`${btnClass} bg-gray-100 text-[#0B2A5B] hover:bg-gray-200`}>0</button>
          <button onClick={() => handleInput(".")} className={`${btnClass} bg-gray-100 text-[#0B2A5B] hover:bg-gray-200`}>.</button>
          <button onClick={handleEquals} className={`${btnClass} bg-[#0B2A5B] text-white hover:bg-[#1a3d7a]`}>=</button>

          <button onClick={() => handleSpecial("sqrt")} className={`${btnClass} bg-gray-50 text-[#0B2A5B] hover:bg-gray-100 col-span-2 text-xs`}>√ Square Root</button>
          <button onClick={() => handleSpecial("%")} className={`${btnClass} bg-gray-50 text-[#0B2A5B] hover:bg-gray-100 col-span-2 text-xs`}>% Percentage</button>
        </div>
      </div>
    </Card>
  );
}

export default function CourseExamInterface() {
  const { examId } = useParams();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const examType = searchParams.get("type") || "course";
  
  const [examStarted, setExamStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, { optionId?: number; text?: string }>>({});
  const [timeRemaining, setTimeRemaining] = useState(3600);
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());
  const [showCalculator, setShowCalculator] = useState(false);
  const [showViolationModal, setShowViolationModal] = useState(false);
  const navigate = useNavigate();

  const toggleFlag = (qId: number) => {
    setFlaggedQuestions(prev => {
      const next = new Set(prev);
      if (next.has(qId)) next.delete(qId);
      else next.add(qId);
      return next;
    });
  };

  const handleStartExam = async () => {
    if (!examId) return;
    setErrorMsg("");
    try {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        (window as any).examCameraStream = stream;
      } catch (err) {
        setErrorMsg("Camera access is required to start the proctored exam.");
        return;
      }

      const startEndpoint = examType === "entrance" 
        ? `/exams/start?exam_id=${examId}` 
        : `/exams/course/start?exam_id=${examId}`;
      
      const payload = { device_id: navigator.userAgent };
      const startRes = await api.post(startEndpoint, payload);
      const newAttemptId = startRes.data.attempt_id;
      setAttemptId(newAttemptId);
      setTimeRemaining((startRes.data.duration_minutes || 60) * 60);

      const questionsEndpoint = examType === "entrance" 
        ? `/exams/questions?exam_id=${examId}`
        : `/exams/course/questions?exam_id=${examId}`;
      const qRes = await api.get(questionsEndpoint);
      setQuestions(qRes.data);
      setAnswers({});
      setFlaggedQuestions(new Set());
      setExamStarted(true);
      
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

      const handleVisibilityChange = async () => {
        if (document.hidden && newAttemptId) {
          // Immediately display the violation warning modal in the UI
          setShowViolationModal(true);
          
          try {
            await api.post("/exams/violation", {
              attempt_id: newAttemptId,
              violation_type: "tab_switch"
            });
          } catch (e) {
            console.error("Failed to log violation:", e);
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
  const answeredCount = Object.keys(answers).filter(k => {
    const a = answers[parseInt(k)];
    return a?.optionId !== undefined || (a?.text && a.text.trim().length > 0);
  }).length;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative">
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
          
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-white/80 hover:text-white hover:bg-white/10"
              onClick={() => setShowCalculator(!showCalculator)}
            >
              <Calculator size={18} className="mr-1.5" />
              <span className="hidden sm:inline">Calculator</span>
            </Button>
            <div className="flex items-center gap-2 font-mono text-xl bg-[#0B2A5B] border border-white/20 px-4 py-2 rounded">
              <Clock size={20} className="text-[#C2A86A]" />
              <span className={timeRemaining < 300 ? "text-red-300 animate-pulse" : ""}>
                {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
              </span>
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
              <div className="flex items-center gap-3">
                <div className="bg-[#0B2A5B]/5 text-[#0B2A5B] px-4 py-1.5 rounded font-semibold text-sm">
                  Question {currentQuestion + 1} of {questions.length}
                </div>
                {/* Marks indicator */}
                {q && (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="bg-green-50 text-green-700 px-2 py-1 rounded font-semibold">
                      +{q.marks || 1} mark{(q.marks || 1) !== 1 ? 's' : ''}
                    </span>
                    {(q.negative_marks || 0) > 0 && (
                      <span className="bg-red-50 text-red-600 px-2 py-1 rounded font-semibold">
                        −{q.negative_marks} penalty
                      </span>
                    )}
                  </div>
                )}
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className={`transition-colors ${flaggedQuestions.has(q?.id) ? 'text-orange-600 bg-orange-50 hover:bg-orange-100' : 'text-[#0B2A5B]/60 hover:text-orange-600 hover:bg-orange-50'}`}
                onClick={() => q && toggleFlag(q.id)}
              >
                <Flag size={16} className={`mr-2 ${flaggedQuestions.has(q?.id) ? 'fill-orange-600' : ''}`} />
                {flaggedQuestions.has(q?.id) ? 'Flagged' : 'Flag for review'}
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
                    {q.options?.map((opt: any) => (
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
          {/* Progress Summary */}
          <Card className="p-4 shadow-md bg-[#0B2A5B] text-white">
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <p className="text-white/60">Answered</p>
                <p className="text-xl font-bold text-[#C2A86A]">{answeredCount}</p>
              </div>
              <div>
                <p className="text-white/60">Remaining</p>
                <p className="text-xl font-bold">{questions.length - answeredCount}</p>
              </div>
              <div>
                <p className="text-white/60">Flagged</p>
                <p className="text-xl font-bold text-orange-400">{flaggedQuestions.size}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 shadow-md">
            <h3 className="font-semibold text-[#0B2A5B] mb-4">Exam Navigation</h3>
            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, idx) => {
                const ans = answers[q.id] || {};
                const isAnswered = ans.optionId !== undefined || (ans.text && ans.text.trim().length > 0);
                const isFlagged = flaggedQuestions.has(q.id);
                
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestion(idx)}
                    className={`
                      w-10 h-10 rounded text-sm font-medium transition-colors relative
                      ${currentQuestion === idx ? 'ring-2 ring-offset-2 ring-[#0B2A5B]' : ''}
                      ${isAnswered 
                        ? 'bg-[#C2A86A] text-[#0B2A5B]' 
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}
                    `}
                  >
                    {idx + 1}
                    {isFlagged && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full border border-white" />
                    )}
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
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-gray-100 border relative">
                  <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-orange-500 rounded-full" />
                </div>
                Flagged for Review
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Calculator */}
      {showCalculator && <ExamCalculator onClose={() => setShowCalculator(false)} />}

      {/* Proctoring Violation Warning Modal */}
      {showViolationModal && (
        <div className="fixed inset-0 z-[99999] bg-[#121212]/95 backdrop-blur-md flex items-center justify-center p-4">
          <Card className="max-w-xl w-full p-8 bg-white border-t-4 border-red-500 shadow-2xl relative">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center animate-bounce">
                <AlertTriangle size={36} className="text-red-500" />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-center text-[#0B2A5B] mb-2">Proctored Exam Warning</h2>
            <p className="text-center text-red-600 font-semibold mb-6">
              System detected tab switching or application switching!
            </p>

            <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 mb-8 space-y-3">
              <h3 className="font-bold text-[#0B2A5B] text-sm uppercase tracking-wider mb-2">Rules & Regulations:</h3>
              <p className="text-xs text-gray-600 leading-relaxed flex items-start gap-2">
                <span className="text-red-500 font-bold">•</span>
                <span>Opening another tab, browser window, or minimizing this screen is strictly prohibited.</span>
              </p>
              <p className="text-xs text-gray-600 leading-relaxed flex items-start gap-2">
                <span className="text-red-500 font-bold">•</span>
                <span>Every single violation is logged automatically with a timestamp in your proctor report.</span>
              </p>
              <p className="text-xs text-gray-600 leading-relaxed flex items-start gap-2">
                <span className="text-red-500 font-bold">•</span>
                <span>Failing to resume immediately or repeated violations will result in automatic disqualification and exam termination.</span>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => setShowViolationModal(false)}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold h-12 text-md shadow-lg shadow-green-600/20"
              >
                Start Same Exam
              </Button>
              <Button
                onClick={() => {
                  setShowViolationModal(false);
                  handleSubmitExam();
                }}
                variant="outline"
                className="flex-1 border-2 border-red-200 text-red-600 hover:bg-red-50 font-bold h-12 text-md"
              >
                Back (Submit Progress)
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
