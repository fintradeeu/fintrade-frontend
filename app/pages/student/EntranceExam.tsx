import { useRef, useState, useEffect } from "react";
import api from "../../services/api";
import { useNavigate, Link } from "react-router";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Progress } from "../../components/ui/progress";
import { ArrowLeft, Clock, Camera, AlertTriangle, ChevronLeft, ChevronRight, Flag } from "lucide-react";

const examQuestions = [
  {
    id: 1,
    question: "What is the primary purpose of a stop-loss order in trading?",
    options: [
      "To maximize profits",
      "To limit potential losses on a position",
      "To guarantee entry into a trade",
      "To increase trading volume",
    ],
    correctAnswer: 1,
  },
  {
    id: 2,
    question: "Which technical indicator is used to measure market volatility?",
    options: ["Moving Average", "RSI (Relative Strength Index)", "Bollinger Bands", "MACD"],
    correctAnswer: 2,
  },
  {
    id: 3,
    question: "What does P/E ratio stand for in stock market analysis?",
    options: [
      "Profit to Equity ratio",
      "Price to Earnings ratio",
      "Performance to Expectation ratio",
      "Portfolio to Exchange ratio",
    ],
    correctAnswer: 1,
  },
  {
    id: 4,
    question: "In options trading, what is a 'call' option?",
    options: [
      "The right to sell an asset at a specified price",
      "The right to buy an asset at a specified price",
      "An obligation to buy an asset",
      "A requirement to close a position",
    ],
    correctAnswer: 1,
  },
  {
    id: 5,
    question: "What is the NSE (National Stock Exchange) benchmark index?",
    options: ["SENSEX", "NIFTY 50", "BSE 500", "NIFTY BANK"],
    correctAnswer: 1,
  },
];

export default function EntranceExam() {
  const [examStarted, setExamStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(1800); // 30 minutes
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [examId, setExamId] = useState<number | null>(null);
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [pastAttempts, setPastAttempts] = useState<any[]>([]);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const timerRef = useRef<number | null>(null);
  const navigate = useNavigate();
  const isExamFinishedRef = useRef(false);

  useEffect(() => {
    if (videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [cameraStream, examStarted]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
      cameraStream?.getTracks().forEach((track) => track.stop());
    };
  }, [cameraStream]);

  const enableCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error("Camera access is not supported in this browser.");
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false,
    });

    // Monitor camera track closure/disconnection
    stream.getVideoTracks().forEach((track) => {
      track.onended = () => {
        handleAutoSubmit("Camera Turned Off");
      };
    });

    setCameraStream(stream);
    setCameraActive(true);
    return stream;
  };

  const stopCamera = () => {
    cameraStream?.getTracks().forEach((track) => track.stop());
    setCameraStream(null);
    setCameraActive(false);
  };

  useEffect(() => {
    // Check URL for specific exam ID
    const searchParams = new URLSearchParams(window.location.search);
    const urlExamId = searchParams.get("exam_id");
    const urlCourseId = searchParams.get("course_id");
    
    // Fetch available entrance exams on load
    api.get("/exams/entrance").then(res => {
      if (res.data && res.data.length > 0) {
        if (urlExamId) {
          // Verify it exists in the active list
          const found = res.data.find((e: any) => e.id.toString() === urlExamId);
          if (found) setExamId(found.id);
          else {
            const courseMatch = urlCourseId
              ? res.data.find((e: any) => Number(e.course_id) === Number(urlCourseId))
              : null;
            setExamId(courseMatch?.id || res.data[0].id);
          }
        } else if (urlCourseId) {
          const courseMatch = res.data.find((e: any) => Number(e.course_id) === Number(urlCourseId));
          setExamId(courseMatch?.id || res.data[0].id);
        } else {
          setExamId(res.data[0].id);
        }
      }
    }).catch(err => console.error("Failed to load exams", err));
  }, []);

  useEffect(() => {
    if (examId && !examStarted) {
      api.get("/exams/all")
        .then((res) => {
          const matchingExam = res.data.entrance_exams?.find((e: any) => e.id === examId);
          if (matchingExam) {
            setPastAttempts(matchingExam.attempts || []);
          }
        })
        .catch((err) => console.error("Failed to load past attempts", err));
    }
  }, [examId, examStarted]);

  const attemptIdRef = useRef<number | null>(null);
  const questionsRef = useRef<any[]>([]);
  const answersRef = useRef<number[]>([]);

  useEffect(() => {
    attemptIdRef.current = attemptId;
  }, [attemptId]);

  useEffect(() => {
    questionsRef.current = questions;
  }, [questions]);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  const handleAutoSubmit = async (reason: string = "Tab Switched / Screen lost focus") => {
    const currentAttemptId = attemptIdRef.current;
    if (!currentAttemptId) return;

    try {
      const mappedAnswers = questionsRef.current.map((q, idx) => ({
        question_id: q.id,
        selected_option_id: answersRef.current[idx] !== -1 ? q.options[answersRef.current[idx]].id : null
      })).filter(a => a.selected_option_id !== null);

      // Save violation reason to localStorage
      try {
        const savedViolations = localStorage.getItem("entrance_violations");
        const violations = savedViolations ? JSON.parse(savedViolations) : {};
        violations[currentAttemptId] = reason;
        localStorage.setItem("entrance_violations", JSON.stringify(violations));
      } catch (storageErr) {
        console.error("Failed to write to localStorage:", storageErr);
      }

      // Set the flag for the warning popup on the marketing layout page
      localStorage.setItem("entrance_violation_popup", "true");

      await api.post("/exams/submit", {
        attempt_id: currentAttemptId,
        answers: mappedAnswers
      });
      
      stopCamera();
      navigate("/");
    } catch (err: any) {
      console.error("Auto submit failed", err);
      localStorage.setItem("entrance_violation_popup", "true");
      stopCamera();
      navigate("/");
    }
  };

  // 1. Detect tab switching & window blur
  useEffect(() => {
    if (!examStarted) return;

    const handleViolation = () => {
      if (isExamFinishedRef.current) return;
      handleAutoSubmit("Tab Switched / Screen lost focus");
    };

    document.addEventListener("visibilitychange", handleViolation);
    window.addEventListener("blur", handleViolation);

    return () => {
      document.removeEventListener("visibilitychange", handleViolation);
      window.removeEventListener("blur", handleViolation);
    };
  }, [examStarted]);

  // 2. Prevent back navigation / popstate
  useEffect(() => {
    if (!examStarted) return;

    // Push a fake state to the history stack to intercept back button
    window.history.pushState(null, "", window.location.href);

    const handlePopState = () => {
      const confirmLeave = window.confirm("Warning: Pressing the Back/Exit button will cancel your exam and submit it immediately. Do you want to submit and exit?");
      if (confirmLeave) {
        handleAutoSubmit("Tab Switched / Screen lost focus");
      } else {
        // Push state again to keep them on the page
        window.history.pushState(null, "", window.location.href);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [examStarted]);

  // 3. Prevent page refresh & close (beforeunload)
  useEffect(() => {
    if (!examStarted) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "Leaving this page will cancel your exam and submit your current progress.";
      return e.returnValue;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [examStarted]);

  const handleStartExam = async () => {
    if (!examId) {
      setErrorMsg("No entrance exams available at the moment.");
      return;
    }
    if (pastAttempts.length >= 3) {
      setErrorMsg("Entrance Exam Locked: Maximum 3 attempts reached.");
      return;
    }
    setErrorMsg("");
    let stream: MediaStream | null = null;
    try {
      stream = await enableCamera();
      isExamFinishedRef.current = false;

      // 1. Start attempt
      const startRes = await api.post(`/exams/start?exam_id=${examId}`);
      setAttemptId(startRes.data.attempt_id);
      setTimeRemaining((startRes.data.duration_minutes || 30) * 60);

      // 2. Fetch questions
      const qRes = await api.get(`/exams/questions?exam_id=${examId}`);
      
      // If the backend doesn't have options seeded, use local mock fallback temporarily for UI flow to work
      const loadedQuestions = qRes.data.length > 0 ? qRes.data.map((q: any) => ({
        id: q.id,
        text: q.question_text,
        options: q.options.map((opt: any) => ({ id: opt.id, text: opt.option_text }))
      })) : examQuestions.map(q => ({
        id: q.id,
        text: q.question,
        options: q.options.map((opt, i) => ({ id: i, text: opt }))
      }));

      setQuestions(loadedQuestions);
      setAnswers(new Array(loadedQuestions.length).fill(-1));
      
      setExamStarted(true);
      // Start timer
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
      timerRef.current = window.setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            if (timerRef.current) {
              window.clearInterval(timerRef.current);
            }
            handleSubmitExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      stream?.getTracks().forEach((track) => track.stop());
      stopCamera();
      setErrorMsg(err.response?.data?.detail || err.message || "Failed to start exam. Please allow camera access and try again.");
    }
  };

  const handleAnswerSelect = (optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = optionIndex;
    setAnswers(newAnswers);
  };

  const handleSubmitExam = async () => {
    if (!attemptId) return;

    isExamFinishedRef.current = true;

    try {
      // Map local indices back to option IDs
      const mappedAnswers = questions.map((q, idx) => ({
        question_id: q.id,
        selected_option_id: answers[idx] !== -1 ? q.options[answers[idx]].id : null
      })).filter(a => a.selected_option_id !== null);

      const res = await api.post("/exams/submit", {
        attempt_id: attemptId,
        answers: mappedAnswers
      });
      
      const score = res.data.percentage || 0;
      const passed = res.data.passed;

      if (passed) {
        stopCamera();
        alert(`Congratulations! You passed with a score of ${score}%.`);
        navigate("/student/courses");
      } else {
        stopCamera();
        alert(`Score: ${score}%. You need 60% to pass. Please try again after 30 days.`);
        navigate("/");
      }
    } catch (err: any) {
      alert("Failed to submit exam: " + (err.response?.data?.detail || "Unknown error"));
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const answeredCount = answers.filter((a) => a !== -1).length;
  const progress = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

  if (!examStarted) {
    return (
      <div className="min-h-screen bg-[#F4F1EA] p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 text-[#0B2A5B] hover:text-[#C2A86A] mb-6">
            <ArrowLeft size={20} />
            Back to Home
          </Link>

          <Card className="p-8 bg-white shadow-xl">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-[#C2A86A] rounded-full flex items-center justify-center mx-auto mb-4">
                <Flag className="text-[#0B2A5B]" size={40} />
              </div>
              <h1 className="text-3xl font-bold text-[#0B2A5B] mb-2">FinTrade Entrance Exam</h1>
              <p className="text-[#0B2A5B]/70">
                Complete this exam to unlock access to our trading courses
              </p>
            </div>

            <div className="bg-[#F4F1EA] rounded-lg p-6 mb-8">
              <h2 className="text-lg font-semibold text-[#0B2A5B] mb-4 flex items-center gap-2">
                <AlertTriangle className="text-[#C2A86A]" size={20} />
                Exam Rules & Guidelines
              </h2>
              <ul className="space-y-3 text-[#0B2A5B]/80">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-[#C2A86A] rounded-full flex items-center justify-center flex-shrink-0 text-[#0B2A5B] text-sm font-semibold">
                    1
                  </div>
                  <span>
                    <strong>Duration:</strong> 30 minutes (1800 seconds)
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-[#C2A86A] rounded-full flex items-center justify-center flex-shrink-0 text-[#0B2A5B] text-sm font-semibold">
                    2
                  </div>
                  <span>
                    <strong>Total Questions:</strong> {examQuestions.length} multiple-choice questions
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-[#C2A86A] rounded-full flex items-center justify-center flex-shrink-0 text-[#0B2A5B] text-sm font-semibold">
                    3
                  </div>
                  <span>
                    <strong>Passing Score:</strong> 60% or higher
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-[#C2A86A] rounded-full flex items-center justify-center flex-shrink-0 text-[#0B2A5B] text-sm font-semibold">
                    4
                  </div>
                  <span>
                    <strong>Tab Switching:</strong> Restricted - switching tabs will auto-submit your exam
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-[#C2A86A] rounded-full flex items-center justify-center flex-shrink-0 text-[#0B2A5B] text-sm font-semibold">
                    5
                  </div>
                  <span>
                    <strong>Device:</strong> Single device only - logging in from another device will
                    invalidate this session
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-[#C2A86A] rounded-full flex items-center justify-center flex-shrink-0 text-[#0B2A5B] text-sm font-semibold">
                    6
                  </div>
                  <span>
                    <strong>Camera:</strong> Webcam must remain active throughout the exam for proctoring
                  </span>
                </li>
              </ul>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-8">
              <div className="flex items-start gap-3">
                <AlertTriangle className="text-yellow-600 flex-shrink-0" size={20} />
                <div>
                  <p className="font-semibold text-yellow-800 mb-1">Important Notice</p>
                  <p className="text-sm text-yellow-700">
                    By starting this exam, you agree to our terms and conditions. Any violation of exam
                    rules will result in automatic disqualification.
                  </p>
                </div>
              </div>
            </div>

            {/* Attempts Progress Indicator & History Section */}
            <div className="border border-[#0B2A5B]/10 rounded-lg p-6 mb-8 bg-[#F4F1EA]/30">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-[#0B2A5B] flex items-center gap-2">
                  <Clock size={20} className="text-[#C2A86A]" />
                  Your Attempt Status
                </h3>
                <span className="text-sm font-semibold text-[#0B2A5B]/70">
                  {pastAttempts.length} / 3 Attempts Used
                </span>
              </div>

              {/* Progress dots */}
              <div className="flex gap-3 mb-6">
                {[1, 2, 3].map((num) => {
                  const attempt = pastAttempts[num - 1];
                  const isTaken = !!attempt;
                  const isPassed = attempt?.passed;
                  let violationReason = "";
                  if (attempt) {
                    try {
                      const stored = localStorage.getItem("entrance_violations");
                      if (stored) {
                        const parsed = JSON.parse(stored);
                        violationReason = parsed[attempt.id] || "";
                      }
                    } catch (e) {
                      console.error(e);
                    }
                  }

                  return (
                    <div
                      key={num}
                      className={`flex-1 h-3 rounded-full transition-all duration-300 ${
                        isTaken
                          ? violationReason
                            ? "bg-amber-500"
                            : isPassed
                            ? "bg-green-600"
                            : "bg-red-500"
                          : "bg-gray-200"
                      }`}
                      title={
                        isTaken
                          ? violationReason
                            ? `Attempt #${num}: Terminated due to ${violationReason}`
                            : isPassed
                            ? `Attempt #${num}: Passed (${attempt.percentage}%)`
                            : `Attempt #${num}: Failed (${attempt.percentage}%)`
                          : `Attempt #${num}: Remaining`
                      }
                    />
                  );
                })}
              </div>

              {pastAttempts.length > 0 ? (
                <div className="space-y-3">
                  {pastAttempts.map((attempt, index) => {
                    const attemptNum = index + 1;
                    let violationReason = "";
                    try {
                      const stored = localStorage.getItem("entrance_violations");
                      if (stored) {
                        const parsed = JSON.parse(stored);
                        violationReason = parsed[attempt.id] || "";
                      }
                    } catch (e) {
                      console.error(e);
                    }

                    return (
                      <div
                        key={attempt.id}
                        className={`flex items-center justify-between p-4 rounded-lg border transition-all hover:shadow-sm ${
                          violationReason
                            ? "bg-amber-50/50 border-amber-200"
                            : attempt.passed
                            ? "bg-green-50/50 border-green-200"
                            : "bg-red-50/50 border-red-200"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                            violationReason
                              ? "bg-amber-100 text-amber-800"
                              : attempt.passed
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}>
                            #{attemptNum}
                          </div>
                          <div>
                            <p className="font-semibold text-[#0B2A5B]">
                              {violationReason ? (
                                <span className="text-amber-800 flex items-center gap-1.5">
                                  <AlertTriangle size={14} />
                                  Terminated: {violationReason}
                                </span>
                              ) : attempt.passed ? (
                                <span className="text-green-800">Passed</span>
                              ) : (
                                <span className="text-red-800">Failed</span>
                              )}
                            </p>
                            <p className="text-xs text-[#0B2A5B]/60 mt-0.5">
                              Submitted: {attempt.submitted_at ? new Date(attempt.submitted_at).toLocaleString(undefined, {
                                dateStyle: "medium",
                                timeStyle: "short"
                              }) : "N/A"}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`font-bold text-lg ${
                            violationReason
                              ? "text-amber-700"
                              : attempt.passed
                              ? "text-green-700"
                              : "text-red-700"
                          }`}>
                            {violationReason ? "—" : `${attempt.percentage}%`}
                          </span>
                          <p className="text-[10px] text-[#0B2A5B]/40 leading-none">Score</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-4 bg-white border border-dashed border-[#0B2A5B]/15 rounded-lg text-[#0B2A5B]/50 text-sm">
                  No previous attempts found. Start the exam below!
                </div>
              )}
            </div>

            {pastAttempts.length >= 3 && (
              <div className="bg-red-50 border-2 border-red-500 rounded-lg p-5 mb-8 shadow-md">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="text-red-600 flex-shrink-0" size={24} />
                  <div>
                    <h4 className="font-bold text-red-800 text-base">Entrance Exam Locked</h4>
                    <p className="text-sm text-red-700 mt-1">
                      You have used all 3 attempts. You are no longer permitted to take the entrance exam with this account. Please contact student support for further assistance.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="text-red-600 flex-shrink-0" size={20} />
                  <div>
                    <p className="font-semibold text-red-800 mb-1">Cannot Start Exam</p>
                    <p className="text-sm text-red-700">{errorMsg}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-4">
              {pastAttempts.length >= 3 ? (
                <Button
                  disabled
                  size="lg"
                  className="flex-1 bg-red-800/20 text-red-800 border border-red-800/10 cursor-not-allowed shadow-none"
                >
                  Entrance Exam Locked (3/3 Attempts Used)
                </Button>
              ) : (
                <Button
                  onClick={handleStartExam}
                  disabled={!examId}
                  size="lg"
                  className="flex-1 bg-[#0B2A5B] text-[#F4F1EA] hover:bg-[#1a3d7a] shadow-lg shadow-[#0B2A5B]/20"
                >
                  Start Exam
                </Button>
              )}
              <Link to="/" className="flex-1">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full border-2 border-[#0B2A5B]/20 text-[#0B2A5B] hover:bg-[#F4F1EA]"
                >
                  Cancel
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];
  return (
    <div className="min-h-screen bg-[#F4F1EA]">
      {/* Exam Header */}
      <div className="bg-[#0B2A5B] text-[#F4F1EA] p-4 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">FinTrade Entrance Exam</h1>
            <div className="flex items-center gap-2 px-3 py-1 bg-[#1a3d7a] rounded-lg">
              <Camera size={16} className={cameraActive ? "text-green-400" : "text-red-400"} />
              <span className="text-sm">{cameraActive ? "Camera Active" : "Camera Off"}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-[#C2A86A] text-[#0B2A5B] rounded-lg font-semibold">
              <Clock size={18} />
              {formatTime(timeRemaining)}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Main Question Area */}
          <Card className="lg:col-span-3 p-6 md:p-8 bg-white shadow-xl">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-[#0B2A5B]/60">
                  Question {currentQuestion + 1} of {questions.length}
                </span>
                <span className="text-sm font-semibold text-[#0B2A5B]">
                  {answeredCount}/{questions.length} Answered
                </span>
              </div>
              <Progress value={progress} className="h-2 mb-4" />
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold text-[#0B2A5B] mb-6">{question?.text || question?.question}</h2>

              <div className="space-y-3">
                {question?.options.map((option: any, index: number) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    className={`
                      w-full p-4 rounded-lg border-2 text-left transition-all
                      ${
                        answers[currentQuestion] === index
                          ? "border-[#C2A86A] bg-[#C2A86A]/10 shadow-md"
                          : "border-[#0B2A5B]/10 hover:border-[#0B2A5B]/30 bg-white"
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`
                        w-6 h-6 rounded-full border-2 flex items-center justify-center
                        ${
                          answers[currentQuestion] === index
                            ? "border-[#C2A86A] bg-[#C2A86A]"
                            : "border-[#0B2A5B]/30"
                        }
                      `}
                      >
                        {answers[currentQuestion] === index && (
                          <div className="w-3 h-3 bg-white rounded-full" />
                        )}
                      </div>
                      <span className="text-[#0B2A5B]">{option.text || option}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-[#0B2A5B]/10">
              <Button
                onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                disabled={currentQuestion === 0}
                variant="outline"
                className="border-[#0B2A5B]/20"
              >
                <ChevronLeft size={20} className="mr-2" />
                Previous
              </Button>

              {currentQuestion === questions.length - 1 ? (
                <Button
                  onClick={handleSubmitExam}
                  className="bg-green-600 text-white hover:bg-green-700"
                  disabled={answeredCount < questions.length}
                >
                  Submit Exam
                  <Flag size={20} className="ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={() =>
                    setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))
                  }
                  className="bg-[#0B2A5B] text-[#F4F1EA] hover:bg-[#1a3d7a]"
                >
                  Next
                  <ChevronRight size={20} className="ml-2" />
                </Button>
              )}
            </div>
          </Card>

          {/* Question Navigator */}
          <Card className="p-6 bg-white shadow-xl h-fit sticky top-24">
            <div className="mb-6 overflow-hidden rounded-lg border border-[#0B2A5B]/10 bg-black aspect-video">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="h-full w-full object-cover"
              />
            </div>
            <h3 className="text-lg font-semibold text-[#0B2A5B] mb-4">Question Navigator</h3>
            <div className="grid grid-cols-5 gap-2">
              {questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuestion(index)}
                  className={`
                    w-10 h-10 rounded-lg font-semibold transition-all
                    ${
                      currentQuestion === index
                        ? "bg-[#0B2A5B] text-[#F4F1EA] shadow-lg"
                        : answers[index] !== -1
                        ? "bg-[#C2A86A] text-[#0B2A5B]"
                        : "bg-[#F4F1EA] text-[#0B2A5B] hover:bg-[#e8e4d9]"
                    }
                  `}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            <div className="mt-6 space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-[#C2A86A] rounded" />
                <span className="text-[#0B2A5B]/70">Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-[#F4F1EA] border border-[#0B2A5B]/20 rounded" />
                <span className="text-[#0B2A5B]/70">Not Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-[#0B2A5B] rounded" />
                <span className="text-[#0B2A5B]/70">Current</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

    </div>
  );
}
