import { useState, useEffect, useRef } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Progress } from "../../components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { FileText, Play, FileAudio, FileVideo, Download, CheckCircle, Lock, Volume2, Settings, HelpCircle, CheckCircle2, Clock, BookOpen, ChevronLeft } from "lucide-react";
import { Input } from "../../components/ui/input";

// ── Inline quiz renderer for quiz-type lessons ──
function QuizRenderer({ content, onComplete }: { content: string, onComplete?: () => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [fillAnswer, setFillAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  let quiz: any = null;
  try { quiz = JSON.parse(content); } catch { return <p className="text-[#0B2A5B]/60">Invalid quiz data.</p>; }
  if (!quiz || !quiz.question) return <p className="text-[#0B2A5B]/60">No quiz data found.</p>;

  const handleSubmit = () => {
    let correct = false;
    if (quiz.type === "fill_blank") {
      correct = fillAnswer.trim().toLowerCase() === (quiz.answer || "").trim().toLowerCase();
    } else {
      correct = selected === quiz.correct_answer;
    }
    setIsCorrect(correct);
    setSubmitted(true);
    if (correct && onComplete) {
      onComplete();
    }
  };

  const handleReset = () => {
    setSelected(null); setFillAnswer(""); setSubmitted(false); setIsCorrect(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <HelpCircle className="text-purple-500" size={20} />
        <Badge className="bg-purple-100 text-purple-700">
          {quiz.type === "mcq" ? "Multiple Choice" : quiz.type === "true_false" ? "True / False" : "Fill in the Blank"}
        </Badge>
      </div>

      <h3 className="text-xl font-semibold text-[#0B2A5B] leading-relaxed">{quiz.question}</h3>

      {/* MCQ or True/False */}
      {(quiz.type === "mcq" || quiz.type === "true_false") && quiz.options && (
        <div className="space-y-3">
          {quiz.options.map((opt: any) => (
            <div
              key={opt.key}
              onClick={() => !submitted && setSelected(opt.key)}
              className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                submitted && opt.key === quiz.correct_answer
                  ? "border-green-500 bg-green-50"
                  : submitted && selected === opt.key && opt.key !== quiz.correct_answer
                  ? "border-red-400 bg-red-50"
                  : selected === opt.key
                  ? "border-[#C2A86A] bg-[#C2A86A]/5"
                  : "border-gray-200 hover:border-[#0B2A5B]/30 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold ${
                  submitted && opt.key === quiz.correct_answer ? "border-green-500 bg-green-500 text-white" :
                  selected === opt.key ? "border-[#C2A86A] bg-[#C2A86A] text-white" :
                  "border-gray-300 text-gray-500"
                }`}>{(opt.key || '').toUpperCase()}</div>
                <span className="text-lg text-[#0B2A5B]">{opt.text}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Fill in the blank */}
      {quiz.type === "fill_blank" && (
        <div>
          <Input
            placeholder="Type your answer here..."
            value={fillAnswer}
            onChange={(e) => !submitted && setFillAnswer(e.target.value)}
            className={`text-lg p-4 h-14 ${
              submitted ? (isCorrect ? "border-green-500 bg-green-50" : "border-red-400 bg-red-50") : ""
            }`}
            disabled={submitted}
          />
          {submitted && !isCorrect && (
            <p className="mt-2 text-sm text-green-700">Correct answer: <strong>{quiz.answer}</strong></p>
          )}
        </div>
      )}

      {/* Result feedback */}
      {submitted && (
        <div className={`p-4 rounded-lg font-semibold text-center ${isCorrect ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
          {isCorrect ? "✓ Correct! Well done." : "✗ Incorrect. Review and try again."}
        </div>
      )}

      <div className="flex gap-3">
        {!submitted ? (
          <Button
            onClick={handleSubmit}
            disabled={quiz.type === "fill_blank" ? !fillAnswer.trim() : !selected}
            className="bg-[#0B2A5B] text-white hover:bg-[#1a3d7a] px-8"
          >
            Check Answer
          </Button>
        ) : (
          <Button onClick={handleReset} variant="outline" className="border-[#0B2A5B]/20 text-[#0B2A5B]">
            Try Again
          </Button>
        )}
      </div>
    </div>
  );
}
import api from "../../services/api";

export default function Modules() {
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [activeLesson, setActiveLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [generatingAudio, setGeneratingAudio] = useState(false);
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<number>>(new Set());
  const [videoPolicies, setVideoPolicies] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch learning dashboard for completed lessons
        const dashRes = await api.get("/learning/dashboard");
        const completedIds = new Set<number>(dashRes.data.completed_lessons.map((l: any) => l.lesson_id));
        setCompletedLessonIds(completedIds);
        setVideoPolicies(dashRes.data.video_policies || []);

        // Fetch enrolled courses with progress
        const enrolledRes = await api.get("/courses/enrolled");
        const enrolled = enrolledRes.data;

        // Fetch detail for each enrolled course to get modules/lessons
        const detailed = await Promise.all(
          enrolled.map(async (enr: any) => {
            try {
              const detail = await api.get(`/courses/${enr.course_id}`);
              return { ...detail.data, progress_percent: enr.progress_percent, enrollment: enr };
            } catch {
              return { id: enr.course_id, title: enr.course?.title || "Course", modules: [], progress_percent: enr.progress_percent, enrollment: enr };
            }
          })
        );
        setCourses(detailed);
        if (detailed.length > 0) setSelectedCourse(detailed[0]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const markCompleted = async (lessonId: number) => {
    if (completedLessonIds.has(lessonId)) return;
    try {
      await api.post("/learning/lesson/complete", {
        course_id: selectedCourse.id,
        lesson_id: lessonId,
      });
      const newCompletedSet = new Set(completedLessonIds);
      newCompletedSet.add(lessonId);
      setCompletedLessonIds(newCompletedSet);
      
      // Update progress percent visually (mirrors backend real percentage logic)
      setCourses(courses.map(c => {
        if (c.id === selectedCourse.id) {
          const totalLessons = c.modules?.reduce((acc: number, m: any) => acc + (m.lessons?.length || 0), 0) || 1;
          const completedInCourse = c.modules?.reduce((acc: number, m: any) =>
            acc + (m.lessons?.filter((l: any) => newCompletedSet.has(l.id))?.length || 0), 0
          ) || 0;
          const newProgress = Math.min(100, Math.round((completedInCourse / totalLessons) * 100 * 100) / 100);
          return { ...c, progress_percent: newProgress };
        }
        return c;
      }));

      // Auto-navigate to next lesson
      const currentIndex = orderedLessons.findIndex(l => l.id === lessonId);
      if (currentIndex >= 0 && currentIndex < orderedLessons.length - 1) {
        const nextLesson = orderedLessons[currentIndex + 1];
        // Small delay so user sees the "Lesson Completed" state
        setTimeout(() => setActiveLesson(nextLesson), 800);
      } else {
        // Was the last lesson — go back to module list
        setTimeout(() => setActiveLesson(null), 800);
      }
    } catch (err) {
      console.error("Failed to mark lesson complete", err);
    }
  };

  // Automatic completion for text/pdf (after 5 seconds)
  useEffect(() => {
    if (!activeLesson || completedLessonIds.has(activeLesson.id)) return;
    if (activeLesson.content_type === "text" || activeLesson.content_type === "pdf") {
      const timer = setTimeout(() => markCompleted(activeLesson.id), 5000);
      return () => clearTimeout(timer);
    }
  }, [activeLesson, completedLessonIds]);

  const handleGenerateAudio = async () => {
    if (!activeLesson || activeLesson.content_type !== "text") return;
    
    setGeneratingAudio(true);
    try {
      const res = await api.post(`/courses/lessons/${activeLesson.id}/audio`);
      setActiveLesson({ ...activeLesson, video_url: res.data.audio_url });
      
      // Update the course list so the change persists when navigating back and forth
      setCourses(courses.map(c => 
        c.id === selectedCourse?.id 
        ? {
            ...c,
            modules: c.modules?.map((m: any) => ({
              ...m,
              lessons: m.lessons?.map((l: any) => l.id === activeLesson.id ? { ...l, video_url: res.data.audio_url } : l)
            }))
          }
        : c
      ));
      
    } catch (err: any) {
      alert("Failed to generate audio: " + (err.response?.data?.detail || err.message));
    } finally {
      setGeneratingAudio(false);
    }
  };

  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement | null>(null);

  // Apply playback speed to the active video/audio element
  useEffect(() => {
    if (mediaRef.current) {
      mediaRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed, activeLesson]);

  const getDifficultyPill = (level: string) => {
    const l = (level || "").toLowerCase();
    if (l === "advanced") {
      return <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-red-50 text-red-600 border border-red-100 uppercase tracking-wider">Advanced</span>;
    } else if (l === "intermediate") {
      return <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-amber-50 text-amber-600 border border-amber-100 uppercase tracking-wider">Intermediate</span>;
    } else {
      return <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase tracking-wider">{level || "Beginner"}</span>;
    }
  };

  const getLessonIcon = (type: string, isCompleted: boolean, isUnlocked: boolean) => {
    if (!isUnlocked) {
      return (
        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center border border-slate-200">
          <Lock size={14} />
        </div>
      );
    }
    if (isCompleted) {
      return (
        <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-sm">
          <CheckCircle2 size={16} />
        </div>
      );
    }
    switch (type) {
      case "video":
        return (
          <div className="w-8 h-8 rounded-full bg-red-50 text-[#D50032] flex items-center justify-center border border-red-100 shadow-sm">
            <FileVideo size={14} />
          </div>
        );
      case "audio":
        return (
          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-sm">
            <FileAudio size={14} />
          </div>
        );
      case "quiz":
        return (
          <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100 shadow-sm">
            <HelpCircle size={14} />
          </div>
        );
      case "pdf":
        return (
          <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-100 shadow-sm">
            <Download size={14} />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-slate-50 text-slate-600 flex items-center justify-center border border-slate-100 shadow-sm">
            <FileText size={14} />
          </div>
        );
    }
  };

  const totalModules = selectedCourse?.modules?.length || 0;

  // Compute linear progression map
  let orderedLessons: any[] = [];
  if (selectedCourse?.modules) {
    const sortedModules = [...selectedCourse.modules].sort((a: any, b: any) => a.order - b.order);
    for (const mod of sortedModules) {
      if (mod.lessons) {
        const sortedLessons = [...mod.lessons].sort((a: any, b: any) => a.order - b.order);
        orderedLessons = orderedLessons.concat(sortedLessons);
      }
    }
  }

  return (
    <DashboardLayout role="student">
      <div className="mb-8 border-b border-slate-200/60 pb-5">
        <h1 className="text-3xl font-extrabold text-[#0B2A5B] tracking-tight mb-2">Course Modules</h1>
        <p className="text-slate-500 text-sm">Complete all modules to unlock your certificate</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400 font-medium gap-3">
          <div className="w-6 h-6 border-2 border-slate-300 border-t-[#D50032] rounded-full animate-spin"></div>
          Loading your courses...
        </div>
      ) : courses.length === 0 ? (
        <Card className="p-10 bg-white border border-slate-200 shadow-xl rounded-2xl text-center max-w-lg mx-auto">
          <div className="w-16 h-16 bg-red-50 text-[#D50032] rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
            <BookOpen size={28} />
          </div>
          <p className="text-slate-600 mb-6 font-medium">You haven't enrolled in any courses yet.</p>
          <a href="/student/courses">
            <Button className="bg-[#D50032] text-white hover:bg-[#FF0000] shadow-md font-bold px-6 py-2.5 rounded-xl transition-all">
              Browse Courses
            </Button>
          </a>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {/* Course/Module List */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1 mb-2">Your Enrolled Courses</h3>
            {courses.map((course) => {
              const isSelected = selectedCourse?.id === course.id;
              return (
                <Card
                  key={course.id}
                  className={`p-5 cursor-pointer transition-all duration-300 rounded-2xl border-2 ${
                    isSelected 
                      ? "bg-white border-[#D50032] shadow-xl ring-4 ring-[#D50032]/5 scale-[1.01]" 
                      : "bg-white border-transparent hover:border-slate-200 hover:shadow-lg hover:scale-[1.005]"
                  }`}
                  onClick={() => { setSelectedCourse(course); setActiveLesson(null); }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        {getDifficultyPill(course.difficulty_level)}
                        {course.progress_percent >= 100 && (
                          <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-md border border-green-100">
                            <CheckCircle2 size={12} /> Passed
                          </span>
                        )}
                      </div>
                      <h3 className={`font-bold text-[#0B2A5B] text-base leading-snug mb-1 transition-colors ${isSelected ? "text-[#D50032]" : ""}`}>{course.title}</h3>
                      <p className="text-xs text-slate-500 font-medium">{course.modules?.length || 0} modules • {course.duration_hours || "—"} hours</p>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400 font-medium">Course Progress</span>
                      <span className="font-bold text-[#0B2A5B]">{Math.round(course.progress_percent || 0)}%</span>
                    </div>
                    <Progress value={course.progress_percent || 0} className="h-1.5" />
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Module Content */}
          <Card className="lg:col-span-2 p-6 md:p-8 bg-white border border-slate-200/80 shadow-xl rounded-2xl">
            {selectedCourse ? (
              <>
                <div className="mb-6 border-b border-slate-100 pb-6">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                    <Badge className={`px-3 py-1 rounded-full text-xs font-bold ${
                      selectedCourse.progress_percent >= 100 
                        ? "bg-green-50 text-green-700 border border-green-200 hover:bg-green-50" 
                        : selectedCourse.progress_percent > 0 
                        ? "bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-50" 
                        : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-50"
                    }`}>
                      {selectedCourse.progress_percent >= 100 ? "Completed" : selectedCourse.progress_percent > 0 ? "In Progress" : "Not Started"}
                    </Badge>
                  </div>
                  
                  <h2 className="text-2xl md:text-3xl font-extrabold text-[#0B2A5B] leading-tight mb-4">{selectedCourse.title}</h2>
                  
                  {/* Styled Course Description */}
                  {(selectedCourse.description || selectedCourse.short_description) && (
                    <div className="bg-slate-50/70 border border-slate-200/50 rounded-xl p-4 mb-6">
                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">About this Program</h4>
                      <p className="text-sm leading-relaxed text-slate-600 whitespace-pre-wrap font-medium">{selectedCourse.description || selectedCourse.short_description}</p>
                    </div>
                  )}

                  {/* Gorgeous Grid Row of Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex items-center gap-3 bg-slate-50/60 border border-slate-100 rounded-xl p-3">
                      <div className="w-10 h-10 rounded-lg bg-red-50 text-[#D50032] flex items-center justify-center border border-red-100">
                        <BookOpen size={18} />
                      </div>
                      <div>
                        <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Modules</p>
                        <p className="text-sm font-extrabold text-[#0B2A5B]">{totalModules}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 bg-slate-50/60 border border-slate-100 rounded-xl p-3">
                      <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                        <Clock size={18} />
                      </div>
                      <div>
                        <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Duration</p>
                        <p className="text-sm font-extrabold text-[#0B2A5B]">{selectedCourse.duration_hours || "—"} hrs</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 bg-slate-50/60 border border-slate-100 rounded-xl p-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${
                        selectedCourse.progress_percent >= 100 
                          ? "bg-green-50 text-green-600 border-green-100" 
                          : "bg-blue-50 text-blue-600 border-blue-100"
                      }`}>
                        <CheckCircle2 size={18} />
                      </div>
                      <div>
                        <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Complete</p>
                        <p className="text-sm font-extrabold text-[#0B2A5B]">{Math.round(selectedCourse.progress_percent || 0)}%</p>
                      </div>
                    </div>
                  </div>
                </div>

                {activeLesson ? (
                  <div className="space-y-6">
                    <Button 
                      variant="ghost" 
                      onClick={() => setActiveLesson(null)} 
                      className="text-slate-500 hover:text-[#D50032] hover:bg-slate-100/50 p-2 pl-0.5 rounded-lg h-auto flex items-center gap-1.5 transition-all text-xs font-semibold"
                    >
                      <ChevronLeft size={16} /> Back to Modules Overview
                    </Button>
                    
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
                      <h3 className="text-xl md:text-2xl font-extrabold text-[#0B2A5B]">{activeLesson.title}</h3>
                      <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg text-slate-700">
                        {getLessonIcon(activeLesson.content_type, false, true)}
                        <span className="text-xs font-bold text-[#0B2A5B] capitalize">{activeLesson.content_type}</span>
                      </div>
                    </div>
                    
                    <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-6 min-h-[300px] shadow-inner">
                      {activeLesson.content_type === "video" && activeLesson.video_url ? (
                        <div className="w-full aspect-video rounded-xl overflow-hidden bg-black relative shadow-lg">
                          {activeLesson.video_url.includes("youtube") || activeLesson.video_url.includes("vimeo") || activeLesson.video_url.includes("mediadelivery.net") || activeLesson.video_url.includes("bunny") ? (
                            <iframe src={activeLesson.video_url} className="w-full h-full" allowFullScreen></iframe>
                          ) : (
                            <video 
                              ref={mediaRef}
                              src={activeLesson.video_url.startsWith('http') ? activeLesson.video_url : `${api.defaults.baseURL || ''}${activeLesson.video_url}`} 
                              controls 
                              className="w-full h-full" 
                              onEnded={() => markCompleted(activeLesson.id)}
                            />
                          )}
                        </div>
                      ) : activeLesson.content_type === "audio" && activeLesson.video_url ? (
                        <div className="flex flex-col items-center justify-center h-full py-12 bg-white rounded-xl border border-slate-100 shadow-sm">
                          <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 mb-4">
                            <FileAudio size={32} />
                          </div>
                          <audio 
                            ref={mediaRef}
                            src={activeLesson.video_url.startsWith('http') ? activeLesson.video_url : `${api.defaults.baseURL || ''}${activeLesson.video_url}`} 
                            controls 
                            className="w-full max-w-md" 
                            onEnded={() => markCompleted(activeLesson.id)}
                          />
                        </div>
                      ) : activeLesson.content_type === "pdf" && activeLesson.video_url ? (
                        <div className="w-full rounded-xl overflow-hidden bg-white shadow-sm border border-slate-200" style={{ minHeight: 500 }}>
                          <iframe
                            src={activeLesson.video_url.startsWith('http') ? activeLesson.video_url : `${api.defaults.baseURL || 'https://api.thefintrade.com'}${activeLesson.video_url}`}
                            className="w-full border-0"
                            style={{ height: 600 }}
                            title={activeLesson.title}
                          />
                          <div className="flex justify-center mt-4 p-4 border-t border-slate-100 bg-slate-50">
                            <a
                              href={activeLesson.video_url.startsWith('http') ? activeLesson.video_url : `${api.defaults.baseURL || 'https://api.thefintrade.com'}${activeLesson.video_url}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button variant="outline" className="border-[#0B2A5B]/20 text-[#0B2A5B] bg-white hover:bg-slate-50 rounded-xl">
                                <Download size={16} className="mr-2" /> Open PDF in New Tab
                              </Button>
                            </a>
                          </div>
                        </div>
                      ) : activeLesson.content_type === "text" ? (
                        <div className="space-y-6">
                          {activeLesson.video_url ? (
                            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center">
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                <Volume2 size={14} className="text-[#D50032]" /> Listen to this lesson:
                              </p>
                              <audio 
                                ref={mediaRef}
                                src={activeLesson.video_url.startsWith('http') ? activeLesson.video_url : `${api.defaults.baseURL || 'https://api.thefintrade.com'}${activeLesson.video_url}`} 
                                controls 
                                className="w-full max-w-md" 
                                onEnded={() => markCompleted(activeLesson.id)}
                              />
                            </div>
                          ) : (
                            <div className="flex justify-end">
                              <Button size="sm" onClick={handleGenerateAudio} disabled={generatingAudio} className="bg-[#D50032] text-white hover:bg-[#FF0000] rounded-xl font-bold shadow-md transition-all hover:scale-105 active:scale-95">
                                <Volume2 size={16} className="mr-2" />
                                {generatingAudio ? "Generating..." : "Generate Audio Version"}
                              </Button>
                            </div>
                          )}
                          {activeLesson.content && (
                            <div className="prose max-w-none text-[#0B2A5B] bg-white p-6 md:p-8 rounded-xl border border-slate-200/60 shadow-sm leading-relaxed">
                              <div dangerouslySetInnerHTML={{ __html: activeLesson.content }} />
                            </div>
                          )}
                        </div>
                      ) : activeLesson.content_type === "quiz" ? (
                        <div className="bg-white p-6 md:p-8 rounded-xl border border-slate-200 shadow-sm">
                          <QuizRenderer key={activeLesson.id} content={activeLesson.content} onComplete={() => markCompleted(activeLesson.id)} />
                        </div>
                      ) : activeLesson.content ? (
                        <div className="prose max-w-none text-[#0B2A5B] bg-white p-6 md:p-8 rounded-xl border border-slate-200 shadow-sm leading-relaxed">
                          <div dangerouslySetInnerHTML={{ __html: activeLesson.content }} />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full min-h-[200px] text-slate-400 font-medium">
                          Content is being processed or not available.
                        </div>
                      )}
                      
                      {/* Playback speed controls inside the player container for video/audio */}
                      {(activeLesson.content_type === "video" || activeLesson.content_type === "audio" || (activeLesson.content_type === "text" && activeLesson.video_url)) && (
                        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm max-w-md mx-auto">
                          <div className="flex items-center gap-2 text-slate-700">
                            <Settings className="text-[#D50032]" size={16} />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Speed Control</span>
                          </div>
                          <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
                            {[0.75, 1.0, 1.25, 1.5, 2.0].map((speed) => (
                              <button
                                key={speed}
                                onClick={() => setPlaybackSpeed(speed)}
                                className={`px-2.5 py-1 rounded-md text-xs font-extrabold transition-all ${
                                  playbackSpeed === speed
                                    ? "bg-[#D50032] text-white shadow-sm"
                                    : "text-slate-500 hover:text-slate-800"
                                }`}
                              >
                                {speed}x
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Manual Complete Button (Fallback for embedded iframes or text) */}
                      {!completedLessonIds.has(activeLesson.id) ? (
                        (() => {
                          const activePolicy = videoPolicies.find(p => p.module_id === activeLesson.module_id);
                          const isVideoWatchMandatory = activePolicy ? activePolicy.mandatory : true;
                          if ((activeLesson.content_type === "video" || activeLesson.content_type === "audio") && isVideoWatchMandatory) {
                            return (
                              <div className="mt-8 p-4 bg-amber-50 border border-amber-200/60 rounded-xl text-amber-800 text-xs text-center font-semibold max-w-md mx-auto flex items-center justify-center gap-2 shadow-sm">
                                ⚠️ You must watch/listen to the entire lesson to unlock progress.
                              </div>
                            );
                          }
                          return (
                            <div className="mt-8 flex justify-center">
                              <Button onClick={() => markCompleted(activeLesson.id)} className="bg-emerald-600 text-white hover:bg-emerald-700 shadow-md font-bold px-6 py-2.5 rounded-xl transition-all hover:scale-105 active:scale-95">
                                <CheckCircle2 size={16} className="mr-2" /> Mark as Complete & Continue
                              </Button>
                            </div>
                          );
                        })()
                      ) : (
                        <div className="mt-8 space-y-4">
                          <div className="flex justify-center items-center gap-2 text-emerald-600 font-extrabold text-base">
                            <CheckCircle2 size={22} className="animate-pulse" /> Lesson Completed Successfully
                          </div>
                          {(() => {
                            const currentIndex = orderedLessons.findIndex(l => l.id === activeLesson.id);
                            if (currentIndex >= 0 && currentIndex < orderedLessons.length - 1) {
                              const nextLesson = orderedLessons[currentIndex + 1];
                              const isNextUnlocked = completedLessonIds.has(activeLesson.id);
                              return isNextUnlocked ? (
                                <div className="flex justify-center">
                                  <Button onClick={() => setActiveLesson(nextLesson)} className="bg-[#D50032] text-white hover:bg-[#FF0000] shadow-md font-bold px-6 py-2.5 rounded-xl transition-all hover:scale-105 active:scale-95">
                                    <Play size={16} className="mr-2" /> Next: {nextLesson.title}
                                  </Button>
                                </div>
                              ) : null;
                            } else {
                              return (
                                <div className="flex justify-center">
                                  <Button onClick={() => setActiveLesson(null)} variant="outline" className="border-[#D50032] text-[#D50032] hover:bg-[#D50032]/5 font-bold px-6 py-2.5 rounded-xl transition-all">
                                    🎉 All Lessons Completed — Back to Overview
                                  </Button>
                                </div>
                              );
                            }
                          })()}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    <Tabs defaultValue="lessons" className="w-full">
                      <TabsList className="grid w-full grid-cols-2 p-1 bg-slate-100 rounded-xl h-12 mb-6 border border-slate-200/40">
                        <TabsTrigger 
                          value="lessons"
                          className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#D50032] py-2 text-sm font-semibold rounded-lg text-[#0B2A5B] transition-all"
                        >
                          Modules & Lessons
                        </TabsTrigger>
                        <TabsTrigger 
                          value="resources"
                          className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#D50032] py-2 text-sm font-semibold rounded-lg text-[#0B2A5B] transition-all"
                        >
                          Study Materials
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="lessons" className="space-y-6">
                        {(selectedCourse.modules || []).length === 0 ? (
                          <div className="text-slate-400 text-center py-12 font-medium">
                            No modules available yet for this course.
                          </div>
                        ) : (
                          (selectedCourse.modules || []).sort((a: any, b: any) => a.order - b.order).map((mod: any, idx: number) => (
                            <Card key={mod.id} className="p-5 bg-white border border-slate-200 shadow-sm rounded-2xl">
                              <div className="border-b border-slate-100 pb-3 mb-4 flex items-center justify-between">
                                <div>
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#D50032]">Module {idx + 1}</span>
                                  <h4 className="font-extrabold text-base text-[#0B2A5B] mt-0.5">{mod.title}</h4>
                                </div>
                              </div>
                              {mod.description && (
                                <p className="text-xs text-slate-500 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                  {mod.description}
                                </p>
                              )}
                              <div className="space-y-3">
                                {(mod.lessons || []).sort((a: any, b: any) => a.order - b.order).map((lesson: any) => {
                                  const globalIndex = orderedLessons.findIndex(l => l.id === lesson.id);
                                  let isUnlocked = true;
                                  if (globalIndex > 0) {
                                    const prevLesson = orderedLessons[globalIndex - 1];
                                    isUnlocked = completedLessonIds.has(prevLesson.id);
                                  }
                                  const isCompleted = completedLessonIds.has(lesson.id);

                                  return (
                                    <div 
                                      key={lesson.id} 
                                      className={`flex items-center justify-between p-3.5 rounded-xl border transition-all duration-200 ${
                                        isUnlocked 
                                          ? 'bg-white border-slate-100 hover:border-slate-200 hover:shadow-md hover:translate-x-0.5' 
                                          : 'bg-slate-50/50 border-slate-100 opacity-60'
                                      }`}
                                    >
                                      <div className="flex items-center gap-3.5 flex-1 mr-4">
                                        {getLessonIcon(lesson.content_type, isCompleted, isUnlocked)}
                                        <div className="flex-1 min-w-0">
                                          <p className={`font-semibold text-sm truncate ${isUnlocked ? 'text-[#0B2A5B]' : 'text-slate-400'}`}>
                                            {globalIndex + 1}. {lesson.title}
                                          </p>
                                          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium mt-0.5">
                                            <span className="capitalize">{lesson.content_type}</span>
                                            {lesson.duration_minutes && (
                                              <>
                                                <span>•</span>
                                                <span className="flex items-center gap-0.5"><Clock size={10} />{lesson.duration_minutes} min</span>
                                              </>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                      
                                      {isUnlocked ? (
                                        <Button 
                                          onClick={() => setActiveLesson(lesson)} 
                                          size="sm" 
                                          className={`rounded-xl font-bold transition-all px-4 ${
                                            isCompleted 
                                              ? "border-slate-200 text-[#0B2A5B] hover:bg-slate-50 bg-white border" 
                                              : "bg-[#D50032] text-white hover:bg-[#FF0000] shadow-sm hover:scale-[1.03]"
                                          }`}
                                        >
                                          {isCompleted ? "Review" : <><Play size={12} className="mr-1 fill-white text-white" />Start</>}
                                        </Button>
                                      ) : (
                                        <div className="px-3 py-1.5 flex items-center gap-1.5 bg-slate-100 text-slate-400 text-xs font-bold rounded-lg border border-slate-200/50">
                                          <Lock size={12} /> Locked
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                                {(mod.lessons || []).length === 0 && (
                                  <p className="text-xs text-slate-400 text-center py-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">No lessons published yet</p>
                                )}
                              </div>
                            </Card>
                          ))
                        )}
                      </TabsContent>

                      <TabsContent value="resources" className="space-y-4">
                        <div className="space-y-3">
                          {(() => {
                            // Collect real downloadable resources from lessons (PDFs, files)
                            const resources: any[] = [];
                            (selectedCourse.modules || []).forEach((mod: any) => {
                              (mod.lessons || []).forEach((lesson: any) => {
                                if (lesson.content_type === "pdf" && lesson.video_url) {
                                  resources.push({ title: lesson.title, type: "PDF", url: lesson.video_url });
                                }
                                if (lesson.content_type === "video" && lesson.video_url) {
                                  resources.push({ title: lesson.title, type: "Video", url: lesson.video_url });
                                }
                                if (lesson.content_type === "audio" && lesson.video_url) {
                                  resources.push({ title: lesson.title, type: "Audio", url: lesson.video_url });
                                }
                              });
                            });

                            if (resources.length === 0) {
                              return (
                                <div className="text-slate-400 text-center py-12 font-medium">
                                  No study materials available for download yet.
                                </div>
                              );
                            }

                            return resources.map((res, i) => (
                              <Card key={i} className="p-4 bg-white border border-slate-200 shadow-sm rounded-xl hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-100 shadow-sm">
                                      <FileText size={18} />
                                    </div>
                                    <div>
                                      <p className="font-bold text-[#0B2A5B] text-sm">{res.title}</p>
                                      <p className="text-xs text-slate-400 font-semibold">{res.type} Study Resource</p>
                                    </div>
                                  </div>
                                  <a href={res.url.startsWith('http') ? res.url : `${api.defaults.baseURL}${res.url}`} target="_blank" rel="noreferrer">
                                    <Button size="sm" variant="outline" className="border-slate-200 text-[#0B2A5B] bg-white hover:bg-slate-50 rounded-xl font-bold shadow-sm">
                                      <Download size={14} className="mr-1.5" />Download
                                    </Button>
                                  </a>
                                </div>
                              </Card>
                            ));
                          })()}
                        </div>
                      </TabsContent>
                    </Tabs>

                    {/* General/Default Playback speed settings */}
                    <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-5">
                      <div className="flex items-center gap-2 text-slate-700">
                        <Settings className="text-[#D50032]" size={18} />
                        <span className="text-xs font-semibold uppercase tracking-wider">Default Playback Speed</span>
                      </div>
                      <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
                        {[0.75, 1.0, 1.25, 1.5, 2.0].map((speed) => (
                          <button 
                            key={speed} 
                            onClick={() => setPlaybackSpeed(speed)} 
                            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                              playbackSpeed === speed 
                                ? "bg-[#D50032] text-white shadow-sm" 
                                : "text-slate-500 hover:text-slate-800"
                            }`}
                          >
                            {speed}x
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </>
            ) : (
              <p className="text-center text-slate-400 font-medium py-12">Select a course to view modules</p>
            )}
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}
