import { useState, useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Progress } from "../../components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { FileText, Play, FileAudio, FileVideo, Download, CheckCircle, Lock, Volume2, Settings, HelpCircle, CheckCircle2 } from "lucide-react";
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video": return <FileVideo className="text-[#C2A86A]" size={18} />;
      case "audio": return <FileAudio className="text-[#0B2A5B]" size={18} />;
      case "quiz": return <HelpCircle className="text-purple-500" size={18} />;
      case "pdf": return <Download className="text-orange-500" size={18} />;
      default: return <FileText className="text-[#1a3d7a]" size={18} />;
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0B2A5B] mb-2">Course Modules</h1>
        <p className="text-[#0B2A5B]/70">Complete all modules to unlock your certificate</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-[#0B2A5B]/60">Loading your courses...</div>
      ) : courses.length === 0 ? (
        <Card className="p-8 bg-white shadow-lg text-center">
          <p className="text-[#0B2A5B]/60 mb-4">You haven't enrolled in any courses yet.</p>
          <a href="/student/courses"><Button className="bg-[#0B2A5B] text-white hover:bg-[#1a3d7a]">Browse Courses</Button></a>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Course/Module List */}
          <div className="lg:col-span-1 space-y-4">
            {courses.map((course) => (
              <Card
                key={course.id}
                className={`p-4 cursor-pointer transition-all ${selectedCourse?.id === course.id ? "bg-[#C2A86A]/10 border-2 border-[#C2A86A] shadow-lg" : "bg-white hover:shadow-md"}`}
                onClick={() => { setSelectedCourse(course); setActiveLesson(null); }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-semibold text-[#0B2A5B]/60">{course.difficulty_level}</span>
                      {course.progress_percent >= 100 && <CheckCircle className="text-green-600" size={16} />}
                    </div>
                    <h3 className="font-semibold text-[#0B2A5B] mb-1">{course.title}</h3>
                    <p className="text-xs text-[#0B2A5B]/60">{course.modules?.length || 0} modules • {course.duration_hours || "—"} hours</p>
                  </div>
                </div>
                <Progress value={course.progress_percent || 0} className="h-2 mb-2" />
                <p className="text-xs text-[#0B2A5B]/70">{Math.round(course.progress_percent || 0)}% Complete</p>
              </Card>
            ))}
          </div>

          {/* Module Content */}
          <Card className="lg:col-span-2 p-6 bg-white shadow-lg">
            {selectedCourse ? (
              <>
                <div className="mb-6">
                  <Badge className={`mb-3 ${selectedCourse.progress_percent >= 100 ? "bg-green-100 text-green-700" : selectedCourse.progress_percent > 0 ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"}`}>
                    {selectedCourse.progress_percent >= 100 ? "Completed" : selectedCourse.progress_percent > 0 ? "In Progress" : "Not Started"}
                  </Badge>
                  <h2 className="text-2xl font-bold text-[#0B2A5B] mb-2">{selectedCourse.title}</h2>
                  <p className="text-[#0B2A5B]/70 mb-4">{selectedCourse.description || selectedCourse.short_description || "No description"}</p>
                  <div className="flex items-center gap-6 text-sm text-[#0B2A5B]/60">
                    <span>{totalModules} Modules</span>
                    <span>{selectedCourse.duration_hours || "—"} hours</span>
                    <span>{Math.round(selectedCourse.progress_percent || 0)}% Complete</span>
                  </div>
                </div>

                {activeLesson ? (
                  <div className="space-y-6">
                    <Button variant="ghost" onClick={() => setActiveLesson(null)} className="text-[#0B2A5B]/60 hover:text-[#0B2A5B] p-0 h-auto mb-4">
                      &larr; Back to Modules
                    </Button>
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-bold text-[#0B2A5B]">{activeLesson.title}</h3>
                      <div className="flex items-center gap-2">
                        {getTypeIcon(activeLesson.content_type)}
                        <span className="text-sm font-medium text-[#0B2A5B] capitalize">{activeLesson.content_type}</span>
                      </div>
                    </div>
                    
                    <div className="bg-[#F4F1EA] rounded-xl p-6 min-h-[300px]">
                      {activeLesson.content_type === "video" && activeLesson.video_url ? (
                        <div className="w-full aspect-video rounded-lg overflow-hidden bg-black relative">
                          {activeLesson.video_url.includes("youtube") || activeLesson.video_url.includes("vimeo") ? (
                            <iframe src={activeLesson.video_url} className="w-full h-full" allowFullScreen></iframe>
                          ) : (
                            <video src={activeLesson.video_url.startsWith('http') ? activeLesson.video_url : `${api.defaults.baseURL || ''}${activeLesson.video_url}`} controls className="w-full h-full" onEnded={() => markCompleted(activeLesson.id)}></video>
                          )}
                        </div>
                      ) : activeLesson.content_type === "audio" && activeLesson.video_url ? (
                        <div className="flex flex-col items-center justify-center h-full py-12">
                          <FileAudio size={64} className="text-[#0B2A5B] mb-6" />
                          <audio src={activeLesson.video_url.startsWith('http') ? activeLesson.video_url : `${api.defaults.baseURL || ''}${activeLesson.video_url}`} controls className="w-full max-w-md" onEnded={() => markCompleted(activeLesson.id)}></audio>
                        </div>
                      ) : activeLesson.content_type === "pdf" && activeLesson.video_url ? (
                        <div className="w-full rounded-lg overflow-hidden bg-white" style={{ minHeight: 500 }}>
                          <iframe
                            src={activeLesson.video_url.startsWith('http') ? activeLesson.video_url : `${api.defaults.baseURL || 'http://localhost:8000'}${activeLesson.video_url}`}
                            className="w-full border-0"
                            style={{ height: 600 }}
                            title={activeLesson.title}
                          />
                          <div className="flex justify-center mt-4">
                            <a
                              href={activeLesson.video_url.startsWith('http') ? activeLesson.video_url : `${api.defaults.baseURL || 'http://localhost:8000'}${activeLesson.video_url}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button variant="outline" className="border-[#0B2A5B]/20 text-[#0B2A5B]">
                                <Download size={16} className="mr-2" /> Open in New Tab
                              </Button>
                            </a>
                          </div>
                        </div>
                      ) : activeLesson.content_type === "text" ? (
                        <div className="space-y-6">
                          {activeLesson.video_url ? (
                            <div className="bg-white p-4 rounded-lg shadow-sm border border-[#0B2A5B]/10 flex flex-col items-center">
                              <p className="text-sm font-semibold text-[#0B2A5B] mb-2">Listen to this lesson:</p>
                              <audio src={activeLesson.video_url.startsWith('http') ? activeLesson.video_url : `${api.defaults.baseURL || 'http://localhost:8000'}${activeLesson.video_url}`} controls className="w-full max-w-md" onEnded={() => markCompleted(activeLesson.id)}></audio>
                            </div>
                          ) : (
                            <div className="flex justify-end">
                              <Button size="sm" onClick={handleGenerateAudio} disabled={generatingAudio} className="bg-[#C2A86A] text-[#0B2A5B] hover:bg-[#d4bd8a]">
                                <Volume2 size={16} className="mr-2" />
                                {generatingAudio ? "Generating..." : "Generate Audio"}
                              </Button>
                            </div>
                          )}
                          {activeLesson.content && (
                            <div className="prose max-w-none text-[#0B2A5B]">
                              <div dangerouslySetInnerHTML={{ __html: activeLesson.content }} />
                            </div>
                          )}
                        </div>
                      ) : activeLesson.content_type === "quiz" ? (
                        <QuizRenderer key={activeLesson.id} content={activeLesson.content} onComplete={() => markCompleted(activeLesson.id)} />
                      ) : activeLesson.content ? (
                        <div className="prose max-w-none text-[#0B2A5B]">
                          <div dangerouslySetInnerHTML={{ __html: activeLesson.content }} />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full min-h-[200px] text-[#0B2A5B]/60">
                          Content is being processed or not available.
                        </div>
                      )}
                      
                      {/* Manual Complete Button (Fallback for embedded iframes or text) */}
                      {!completedLessonIds.has(activeLesson.id) ? (
                        (() => {
                          const activePolicy = videoPolicies.find(p => p.module_id === activeLesson.module_id);
                          const isVideoWatchMandatory = activePolicy ? activePolicy.mandatory : true;
                          if ((activeLesson.content_type === "video" || activeLesson.content_type === "audio") && isVideoWatchMandatory) {
                            return (
                              <div className="mt-8 p-4 bg-orange-50 border border-orange-200 rounded-xl text-orange-700 text-sm text-center font-semibold max-w-md mx-auto">
                                ⚠️ You must watch/listen to this entire lesson to mark it as completed.
                              </div>
                            );
                          }
                          return (
                            <div className="mt-8 flex justify-center">
                              <Button onClick={() => markCompleted(activeLesson.id)} className="bg-green-600 text-white hover:bg-green-700">
                                <CheckCircle2 size={16} className="mr-2" /> Mark as Complete & Continue
                              </Button>
                            </div>
                          );
                        })()
                      ) : (
                        <div className="mt-8 space-y-3">
                          <div className="flex justify-center items-center gap-2 text-green-600 font-bold">
                            <CheckCircle2 size={20} /> Lesson Completed
                          </div>
                          {(() => {
                            const currentIndex = orderedLessons.findIndex(l => l.id === activeLesson.id);
                            if (currentIndex >= 0 && currentIndex < orderedLessons.length - 1) {
                              const nextLesson = orderedLessons[currentIndex + 1];
                              const isNextUnlocked = completedLessonIds.has(activeLesson.id);
                              return isNextUnlocked ? (
                                <div className="flex justify-center">
                                  <Button onClick={() => setActiveLesson(nextLesson)} className="bg-[#0B2A5B] text-white hover:bg-[#1a3d7a]">
                                    <Play size={16} className="mr-2" /> Next: {nextLesson.title}
                                  </Button>
                                </div>
                              ) : null;
                            } else {
                              return (
                                <div className="flex justify-center">
                                  <Button onClick={() => setActiveLesson(null)} variant="outline" className="border-[#C2A86A] text-[#C2A86A]">
                                    🎉 All Lessons Complete — Back to Overview
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
                      <TabsList className="grid w-full grid-cols-2 mb-6">
                        <TabsTrigger value="lessons">Modules & Lessons</TabsTrigger>
                        <TabsTrigger value="resources">Study Materials</TabsTrigger>
                      </TabsList>

                      <TabsContent value="lessons" className="space-y-4">
                        {(selectedCourse.modules || []).length === 0 ? (
                          <p className="text-[#0B2A5B]/60 text-center py-8">No modules available yet for this course.</p>
                        ) : (
                          (selectedCourse.modules || []).sort((a: any, b: any) => a.order - b.order).map((mod: any, idx: number) => (
                            <Card key={mod.id} className="p-4 bg-[#F4F1EA]">
                              <h4 className="font-semibold text-[#0B2A5B] mb-3">Module {idx + 1}: {mod.title}</h4>
                              {mod.description && <p className="text-xs text-[#0B2A5B]/60 mb-3">{mod.description}</p>}
                                <div className="space-y-2">
                                  {(mod.lessons || []).sort((a: any, b: any) => a.order - b.order).map((lesson: any) => {
                                    const globalIndex = orderedLessons.findIndex(l => l.id === lesson.id);
                                    let isUnlocked = true;
                                    if (globalIndex > 0) {
                                      const prevLesson = orderedLessons[globalIndex - 1];
                                      isUnlocked = completedLessonIds.has(prevLesson.id);
                                    }
                                    const isCompleted = completedLessonIds.has(lesson.id);

                                    return (
                                      <div key={lesson.id} className={`flex items-center justify-between p-3 rounded-lg border transition-all ${isUnlocked ? 'bg-white hover:shadow-sm border-gray-100' : 'bg-gray-50 border-gray-200 opacity-75'}`}>
                                        <div className="flex items-center gap-3 flex-1">
                                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isCompleted ? 'bg-green-100 text-green-600' : 'bg-[#F4F1EA]'}`}>
                                            {isCompleted ? <CheckCircle2 size={16} /> : getTypeIcon(lesson.content_type)}
                                          </div>
                                          <div className="flex-1">
                                            <p className={`font-medium text-sm ${isUnlocked ? 'text-[#0B2A5B]' : 'text-gray-500'}`}>
                                              {globalIndex + 1}. {lesson.title}
                                            </p>
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                              <span className="capitalize">{lesson.content_type}</span>
                                              {lesson.duration_minutes && <><span>•</span><span>{lesson.duration_minutes} min</span></>}
                                            </div>
                                          </div>
                                        </div>
                                        {isUnlocked ? (
                                          <Button onClick={() => setActiveLesson(lesson)} size="sm" className="bg-[#0B2A5B] text-[#F4F1EA] hover:bg-[#1a3d7a]">
                                            {isCompleted ? "Review" : <><Play size={14} className="mr-1" />Start</>}
                                          </Button>
                                        ) : (
                                          <div className="px-3 py-1.5 flex items-center gap-1.5 bg-gray-100 text-gray-500 text-xs font-semibold rounded-lg">
                                            <Lock size={12} /> Locked
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                  {(mod.lessons || []).length === 0 && <p className="text-xs text-[#0B2A5B]/50 text-center py-2">No lessons yet</p>}
                                </div>
                            </Card>
                          ))
                        )}
                      </TabsContent>

                      <TabsContent value="resources">
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
                          return <p className="text-[#0B2A5B]/60 text-center py-8">No downloadable study materials available for this course yet.</p>;
                        }

                        return resources.map((res, i) => (
                          <Card key={i} className="p-4 bg-[#F4F1EA]">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <FileText className="text-[#C2A86A]" size={20} />
                                <div>
                                  <p className="font-semibold text-[#0B2A5B]">{res.title}</p>
                                  <p className="text-xs text-[#0B2A5B]/60">{res.type} study material</p>
                                </div>
                              </div>
                              <a href={res.url.startsWith('http') ? res.url : `${api.defaults.baseURL}${res.url}`} target="_blank" rel="noreferrer">
                                <Button size="sm" variant="outline" className="border-[#0B2A5B]/20"><Download size={16} className="mr-2" />Download</Button>
                              </a>
                            </div>
                          </Card>
                        ));
                      })()}
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="mt-4 flex items-center gap-4">
                  <Settings className="text-[#0B2A5B]" size={20} />
                  <span className="text-sm text-[#0B2A5B]">Playback Speed:</span>
                  <div className="flex gap-2">
                    {[0.75, 1.0, 1.25, 1.5, 2.0].map((speed) => (
                      <button key={speed} onClick={() => setPlaybackSpeed(speed)} className={`px-3 py-1 rounded-lg text-sm font-semibold transition-colors ${playbackSpeed === speed ? "bg-[#C2A86A] text-[#0B2A5B]" : "bg-white text-[#0B2A5B] hover:bg-[#F4F1EA]"}`}>{speed}x</button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </>
        ) : (
          <p className="text-center text-[#0B2A5B]/60 py-8">Select a course to view modules</p>
        )}
      </Card>
        </div>
      )}
    </DashboardLayout>
  );
}
