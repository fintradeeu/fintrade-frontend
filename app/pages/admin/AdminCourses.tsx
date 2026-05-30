import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import DashboardLayout from "../../components/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Plus, X, BookOpen, Layers, FileText, ChevronDown, ChevronUp, FileQuestion, Upload, GripVertical, Pencil, Trash2 } from "lucide-react";
import api from "../../services/api";

export default function AdminCourses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCourse, setExpandedCourse] = useState<number | null>(null);

  // Course modal
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [newCourse, setNewCourse] = useState({ title: "", description: "", short_description: "", original_price: 0, price: 0, difficulty_level: "beginner", duration_days: 0, is_published: false });

  // Module modal
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [moduleForCourse, setModuleForCourse] = useState<number | null>(null);
  const [newModule, setNewModule] = useState({ title: "", description: "", order: 0, is_published: false });

  // Lesson modal
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [lessonForModule, setLessonForModule] = useState<number | null>(null);
  const [newLesson, setNewLesson] = useState({ title: "", content: "", content_type: "text", video_url: "", duration_minutes: 15, order: 0, is_published: false });

  // Quiz question fields (when content_type === "quiz")
  const [quizQuestion, setQuizQuestion] = useState("");
  const [quizType, setQuizType] = useState("mcq");
  const [quizOptions, setQuizOptions] = useState(["", "", "", ""]);
  const [quizCorrect, setQuizCorrect] = useState("a");

  const [saving, setSaving] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);

  // Edit mode tracking (null = create, number = editing that ID)
  const [editCourseId, setEditCourseId] = useState<number | null>(null);
  const [editModuleId, setEditModuleId] = useState<number | null>(null);
  const [editLessonId, setEditLessonId] = useState<number | null>(null);

  // Drag and Drop state
  const [draggedModule, setDraggedModule] = useState<number | null>(null);
  const [draggedLesson, setDraggedLesson] = useState<number | null>(null);

  const fetchCourses = async () => {
    try { const res = await api.get("/courses"); setCourses(res.data); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchCourseDetail = async (id: number) => {
    try {
      const res = await api.get(`/courses/${id}`);
      setCourses((prev) => prev.map((c) => (c.id === id ? res.data : c)));
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchCourses(); }, []);

  const handleMediaUpload = async (file: File) => {
    setUploadingMedia(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.post("/admin/upload", formData, {
        headers: { "Content-Type": undefined }
      });
      setNewLesson(prev => ({ ...prev, video_url: res.data.url }));
    } catch (err: any) {
      alert("Upload failed: " + (err.response?.data?.detail || err.message));
    } finally {
      setUploadingMedia(false);
    }
  };

  const openEditCourse = (course: any) => {
    setEditCourseId(course.id);
    setNewCourse({
      title: course.title || "",
      description: course.description || "",
      short_description: course.short_description || "",
      original_price: course.original_price || 0,
      price: course.price || 0,
      difficulty_level: course.difficulty_level || "beginner",
      duration_days: course.duration_hours || 0,
      is_published: course.is_published || false
    });
    setShowCourseModal(true);
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const payload = {
        ...newCourse,
        duration_hours: newCourse.duration_days
      };
      delete (payload as any).duration_days;
      
      if (editCourseId) {
        await api.put(`/courses/${editCourseId}`, payload);
      } else {
        await api.post("/courses", payload);
      }
      
      setShowCourseModal(false);
      setEditCourseId(null);
      setNewCourse({ title: "", description: "", short_description: "", original_price: 0, price: 0, difficulty_level: "beginner", duration_days: 0, is_published: false });
      fetchCourses();
    } catch (err: any) { alert("Error: " + (err.response?.data?.detail || err.message)); }
    finally { setSaving(false); }
  };

  const handleCreateModule = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editModuleId) {
        await api.put(`/admin/modules/${editModuleId}`, newModule);
      } else {
        await api.post("/admin/modules", { ...newModule, course_id: moduleForCourse });
      }
      resetModuleModal();
      if (moduleForCourse) fetchCourseDetail(moduleForCourse);
      if (expandedCourse && expandedCourse !== moduleForCourse) fetchCourseDetail(expandedCourse);
    } catch (err: any) { alert("Error: " + (err.response?.data?.detail || err.message)); }
    finally { setSaving(false); }
  };

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      let lessonContent = newLesson.content;

      // If quiz type, serialize question data as JSON content
      if (newLesson.content_type === "quiz") {
        const quizData: any = {
          question: quizQuestion,
          type: quizType,
          correct_answer: quizCorrect,
        };
        if (quizType === "fill_blank") {
          quizData.answer = quizOptions[0];
        } else {
          quizData.options = quizType === "true_false"
            ? [{ text: "True", key: "a" }, { text: "False", key: "b" }]
            : quizOptions.filter(o => o.trim()).map((o, i) => ({ text: o, key: String.fromCharCode(97 + i) }));
        }
        lessonContent = JSON.stringify(quizData);
      }

      const payload = {
        ...newLesson,
        content: lessonContent,
        video_url: newLesson.video_url || undefined,
      };

      if (editLessonId) {
        await api.put(`/admin/lessons/${editLessonId}`, payload);
      } else {
        await api.post("/admin/lessons", { ...payload, module_id: lessonForModule });
      }
      resetLessonModal();
      if (expandedCourse) fetchCourseDetail(expandedCourse);
    } catch (err: any) { alert("Error: " + (err.response?.data?.detail || err.message)); }
    finally { setSaving(false); }
  };

  const togglePublish = async (courseId: number, currentState: boolean) => {
    try {
      await api.put(`/courses/${courseId}`, { is_published: !currentState });
      fetchCourses();
    } catch (err: any) { alert("Error: " + (err.response?.data?.detail || err.message)); }
  };

  // ── Delete Course ──
  const handleDeleteCourse = async (courseId: number, courseTitle: string) => {
    if (!confirm(`Delete course "${courseTitle}" and all its modules and lessons? This cannot be undone.`)) return;
    try {
      await api.delete(`/courses/${courseId}`);
      fetchCourses();
    } catch (err: any) { alert("Error deleting course: " + (err.response?.data?.detail || err.message)); }
  };

  // ── Edit Module (reuses create modal) ──
  const openEditModule = (mod: any, courseId: number) => {
    setEditModuleId(mod.id);
    setModuleForCourse(courseId);
    setNewModule({ title: mod.title || "", description: mod.description || "", order: mod.order || 0, is_published: mod.is_published || false });
    setShowModuleModal(true);
  };

  // ── Delete Module ──
  const handleDeleteModule = async (courseId: number, moduleId: number, moduleTitle: string) => {
    if (!confirm(`Delete module "${moduleTitle}" and all its lessons? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/modules/${moduleId}`);
      fetchCourseDetail(courseId);
    } catch (err: any) { alert("Error deleting module: " + (err.response?.data?.detail || err.message)); }
  };

  // ── Edit Lesson (reuses create modal with quiz parsing) ──
  const openEditLesson = (lesson: any) => {
    setEditLessonId(lesson.id);
    setNewLesson({
      title: lesson.title || "",
      content: lesson.content || "",
      content_type: lesson.content_type || "text",
      video_url: lesson.video_url || "",
      duration_minutes: lesson.duration_minutes || 15,
      order: lesson.order || 0,
      is_published: lesson.is_published || false,
    });

    // If quiz, parse JSON content back into quiz fields
    if (lesson.content_type === "quiz" && lesson.content) {
      try {
        const quiz = JSON.parse(lesson.content);
        setQuizQuestion(quiz.question || "");
        setQuizType(quiz.type || "mcq");
        setQuizCorrect(quiz.correct_answer || "a");
        if (quiz.type === "fill_blank") {
          setQuizOptions([quiz.answer || "", "", "", ""]);
        } else if (quiz.options && Array.isArray(quiz.options)) {
          const opts = ["", "", "", ""];
          quiz.options.forEach((o: any, i: number) => { if (i < 4) opts[i] = o.text || ""; });
          setQuizOptions(opts);
        }
      } catch { /* ignore parse error, user can re-enter */ }
    } else {
      setQuizQuestion(""); setQuizOptions(["", "", "", ""]); setQuizCorrect("a"); setQuizType("mcq");
    }

    setShowLessonModal(true);
  };

  // ── Delete Lesson ──
  const handleDeleteLesson = async (courseId: number, lessonId: number, lessonTitle: string) => {
    if (!confirm(`Delete lesson "${lessonTitle}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/lessons/${lessonId}`);
      fetchCourseDetail(courseId);
    } catch (err: any) { alert("Error deleting lesson: " + (err.response?.data?.detail || err.message)); }
  };

  // --- Drag and Drop Handlers ---
  const handleModuleDrop = async (e: React.DragEvent, targetCourseId: number, targetModuleId: number) => {
    e.preventDefault();
    if (!draggedModule || draggedModule === targetModuleId) return;

    const course = courses.find((c) => c.id === targetCourseId);
    if (!course) return;

    const newModules = [...(course.modules || [])].sort((a: any, b: any) => a.order - b.order);
    const draggedIdx = newModules.findIndex((m) => m.id === draggedModule);
    const targetIdx = newModules.findIndex((m) => m.id === targetModuleId);

    if (draggedIdx === -1 || targetIdx === -1) return;

    const [removed] = newModules.splice(draggedIdx, 1);
    newModules.splice(targetIdx, 0, removed);

    newModules.forEach((m, idx) => { m.order = idx; });
    setCourses(courses.map(c => c.id === targetCourseId ? { ...c, modules: newModules } : c));

    const moduleIds = newModules.map((m: any) => m.id);
    api.put(`/courses/${targetCourseId}/modules/reorder`, { module_ids: moduleIds })
      .then(() => fetchCourseDetail(targetCourseId))
      .catch(console.error);
    setDraggedModule(null);
  };

  const handleLessonDrop = async (e: React.DragEvent, targetCourseId: number, targetModuleId: number, targetLessonId: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggedLesson || draggedLesson === targetLessonId) return;

    const course = courses.find((c) => c.id === targetCourseId);
    if (!course) return;
    const mod = course.modules.find((m: any) => m.id === targetModuleId);
    if (!mod) return;

    const newLessons = [...(mod.lessons || [])].sort((a: any, b: any) => a.order - b.order);
    const draggedIdx = newLessons.findIndex((l) => l.id === draggedLesson);
    const targetIdx = newLessons.findIndex((l) => l.id === targetLessonId);

    if (draggedIdx === -1 || targetIdx === -1) return;

    const [removed] = newLessons.splice(draggedIdx, 1);
    newLessons.splice(targetIdx, 0, removed);

    newLessons.forEach((l, idx) => { l.order = idx; });
    setCourses(courses.map(c => c.id === targetCourseId ? { 
      ...c, 
      modules: c.modules.map((m: any) => m.id === targetModuleId ? { ...m, lessons: newLessons } : m) 
    } : c));

    for (const l of newLessons) {
      api.put(`/admin/lessons/${l.id}`, { order: l.order }).catch(console.error);
    }
    setDraggedLesson(null);
  };

  const toggleExpand = (courseId: number) => {
    if (expandedCourse === courseId) { setExpandedCourse(null); return; }
    setExpandedCourse(courseId);
    fetchCourseDetail(courseId);
  };

  const resetModuleModal = () => {
    setShowModuleModal(false);
    setEditModuleId(null);
    setNewModule({ title: "", description: "", order: 0, is_published: false });
  };

  const resetLessonModal = () => {
    setShowLessonModal(false);
    setEditLessonId(null);
    setNewLesson({ title: "", content: "", content_type: "text", video_url: "", duration_minutes: 15, order: 0, is_published: false });
    setQuizQuestion(""); setQuizOptions(["", "", "", ""]); setQuizCorrect("a"); setQuizType("mcq");
  };

  return (
    <DashboardLayout role="admin">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#0B2A5B]">Manage Courses</h1>
          <p className="text-[#0B2A5B]/60 mt-1">Create and structure your trading programs</p>
        </div>
        <Button onClick={() => { setEditCourseId(null); setNewCourse({ title: "", description: "", short_description: "", original_price: 0, price: 0, difficulty_level: "beginner", duration_days: 0, is_published: false }); setShowCourseModal(true); }} className="bg-[#D50032] hover:bg-[#a30026] text-white">
          <Plus size={16} className="mr-2" />
          Create Course
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4 bg-white shadow-lg"><p className="text-sm text-[#0B2A5B]/60 mb-1">Total Courses</p><p className="text-2xl font-bold text-[#0B2A5B]">{courses.length}</p></Card>
        <Card className="p-4 bg-white shadow-lg"><p className="text-sm text-[#0B2A5B]/60 mb-1">Published</p><p className="text-2xl font-bold text-green-600">{courses.filter((c) => c.is_published).length}</p></Card>
        <Card className="p-4 bg-white shadow-lg"><p className="text-sm text-[#0B2A5B]/60 mb-1">Drafts</p><p className="text-2xl font-bold text-orange-600">{courses.filter((c) => !c.is_published).length}</p></Card>
      </div>

      {/* Course List */}
      <div className="space-y-4">
        {courses.map((course) => (
          <Card key={course.id} className="bg-white shadow-lg overflow-hidden">
            <div className="p-6 flex items-start justify-between cursor-pointer" onClick={() => toggleExpand(course.id)}>
              <div className="flex items-start gap-4 flex-1">
                <div className="w-12 h-12 bg-[#C2A86A]/10 rounded-lg flex items-center justify-center flex-shrink-0"><BookOpen className="text-[#C2A86A]" size={24} /></div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-[#0B2A5B]">{course.title}</h3>
                    <Badge className={course.is_published ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}>{course.is_published ? "Published" : "Draft"}</Badge>
                    <Badge className="bg-blue-100 text-blue-700">{course.difficulty_level}</Badge>
                  </div>
                  <p className="text-sm text-[#0B2A5B]/60 line-clamp-1">{course.short_description || course.description || "No description"}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-[#0B2A5B]/50">
                    {course.duration_hours && <span>{course.duration_hours} Days</span>}
                    {course.modules && <span>{course.modules.length} modules</span>}
                    <div className="flex items-center gap-1 font-semibold">
                      {course.original_price > 0 && <span className="line-through text-gray-400">₹{course.original_price.toLocaleString()}</span>}
                      <span className={course.price > 0 ? "text-green-600" : "text-[#C2A86A]"}>
                        {course.price > 0 ? `₹${course.price.toLocaleString()}` : "Free"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 shrink-0 ml-4">
                <Button size="sm" variant="outline" className={course.is_published ? "border-orange-400 text-orange-500" : "border-green-500 text-green-600"} onClick={(e) => { e.stopPropagation(); togglePublish(course.id, course.is_published); }}>
                    {course.is_published ? "Unpublish" : "Publish"}
                  </Button>
                  <Button size="sm" variant="outline" className="border-[#0B2A5B]/20 text-[#0B2A5B]" onClick={(e) => { e.stopPropagation(); setModuleForCourse(course.id); setShowModuleModal(true); setEditModuleId(null); setNewModule({ title: "", description: "", order: 0, is_published: false }); }}>
                  <Layers size={14} className="mr-1" />Add Module
                </Button>
                <Button size="sm" variant="outline" className="border-[#0B2A5B]/20 text-[#0B2A5B]" onClick={(e) => { e.stopPropagation(); openEditCourse(course); }}>
                  <Pencil size={14} className="mr-1" />Edit
                </Button>
                <Button size="sm" variant="outline" className="border-red-400 text-red-500 hover:bg-red-50" onClick={(e) => { e.stopPropagation(); handleDeleteCourse(course.id, course.title); }}>
                  <Trash2 size={14} className="mr-1" />Delete
                </Button>
                {expandedCourse === course.id ? <ChevronUp size={20} className="text-[#0B2A5B]/40" /> : <ChevronDown size={20} className="text-[#0B2A5B]/40" />}
              </div>
            </div>

            {expandedCourse === course.id && (
              <div className="border-t border-[#0B2A5B]/10 bg-[#F4F1EA]/30 p-6">
                {(course.modules || []).length === 0 ? (
                  <p className="text-sm text-[#0B2A5B]/50 text-center py-4">No modules yet. Click "Add Module" to create one.</p>
                ) : (
                  <div className="space-y-4">
                    {(course.modules || []).sort((a: any, b: any) => a.order - b.order).map((mod: any) => (
                      <Card 
                        key={mod.id} 
                        className="p-4 bg-white border border-[#0B2A5B]/10 hover:border-[#0B2A5B]/30 transition-colors"
                        draggable
                        onDragStart={() => setDraggedModule(mod.id)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => handleModuleDrop(e, course.id, mod.id)}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="cursor-move text-[#0B2A5B]/40 hover:text-[#0B2A5B]"><GripVertical size={20} /></div>
                            <div className="w-8 h-8 bg-[#0B2A5B]/10 rounded flex items-center justify-center"><Layers size={16} className="text-[#0B2A5B]" /></div>
                            <div>
                              <h4 className="font-semibold text-[#0B2A5B]">{mod.title}</h4>
                              <p className="text-xs text-[#0B2A5B]/50">{mod.description || "No description"} • Order: {mod.order}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button size="sm" variant="ghost" className="text-[#0B2A5B]/50 hover:text-[#0B2A5B] h-8 w-8 p-0" onClick={(e) => { e.stopPropagation(); openEditModule(mod, course.id); }} title="Edit Module">
                              <Pencil size={14} />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-600 h-8 w-8 p-0" onClick={(e) => { e.stopPropagation(); handleDeleteModule(course.id, mod.id, mod.title); }} title="Delete Module">
                              <Trash2 size={14} />
                            </Button>
                            <Button size="sm" variant="outline" className="border-[#0B2A5B]/20 text-[#0B2A5B]" onClick={() => { setEditModuleId(null); setLessonForModule(mod.id); setNewModule({ title: "", description: "", order: 0, is_published: false }); setModuleForCourse(course.id); setShowLessonModal(true); setEditLessonId(null); setNewLesson({ title: "", content: "", content_type: "text", video_url: "", duration_minutes: 15, order: 0, is_published: false }); setQuizQuestion(""); setQuizOptions(["", "", "", ""]); setQuizCorrect("a"); setQuizType("mcq"); }}>
                              <FileText size={14} className="mr-1" />Add Lesson
                            </Button>
                          </div>
                        </div>
                        {(mod.lessons || []).length > 0 && (
                          <div className="ml-11 space-y-2">
                            {(mod.lessons || []).sort((a: any, b: any) => a.order - b.order).map((lesson: any) => (
                              <div 
                                key={lesson.id} 
                                className="flex items-center gap-3 p-2 bg-[#F4F1EA] rounded border border-transparent hover:border-[#C2A86A]/50 transition-colors group"
                                draggable
                                onDragStart={(e) => { e.stopPropagation(); setDraggedLesson(lesson.id); }}
                                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                onDrop={(e) => handleLessonDrop(e, course.id, mod.id, lesson.id)}
                              >
                                <div className="cursor-move text-[#0B2A5B]/40 hover:text-[#0B2A5B]"><GripVertical size={16} /></div>
                                <FileText size={14} className="text-[#C2A86A]" />
                                <span className="flex-1 text-sm text-[#0B2A5B]">{lesson.title}</span>
                                <Badge className={
                                  lesson.content_type === "quiz" ? "bg-purple-100 text-purple-700 text-xs" :
                                  lesson.content_type === "video" ? "bg-blue-100 text-blue-700 text-xs" :
                                  lesson.content_type === "audio" ? "bg-teal-100 text-teal-700 text-xs" :
                                  lesson.content_type === "pdf" ? "bg-orange-100 text-orange-700 text-xs" :
                                  "bg-gray-100 text-gray-600 text-xs"
                                }>{lesson.content_type}</Badge>
                                {lesson.duration_minutes && <span className="text-xs text-[#0B2A5B]/50">{lesson.duration_minutes} min</span>}
                                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button onClick={(e) => { e.stopPropagation(); openEditLesson(lesson); }} className="p-1 rounded hover:bg-[#0B2A5B]/10 text-[#0B2A5B]/50 hover:text-[#0B2A5B]" title="Edit Lesson">
                                    <Pencil size={13} />
                                  </button>
                                  <button onClick={(e) => { e.stopPropagation(); handleDeleteLesson(course.id, lesson.id, lesson.title); }} className="p-1 rounded hover:bg-red-100 text-red-400 hover:text-red-600" title="Delete Lesson">
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </Card>
        ))}
        {courses.length === 0 && !loading && <p className="text-[#0B2A5B]/60 text-center py-8">No courses yet. Create your first course!</p>}
      </div>

      {/* Create Course Modal */}
      {showCourseModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl bg-white p-6 shadow-xl relative">
            <button onClick={() => setShowCourseModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={20} /></button>
            <h2 className="text-2xl font-bold text-[#0B2A5B] mb-4">{editCourseId ? "Edit Course" : "Create New Course"}</h2>
            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div><label className="text-sm font-medium text-[#0B2A5B]">Title *</label><Input required value={newCourse.title} onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })} className="bg-[#F4F1EA]" /></div>
              <div><label className="text-sm font-medium text-[#0B2A5B]">Short Description</label><Input value={newCourse.short_description} onChange={(e) => setNewCourse({ ...newCourse, short_description: e.target.value })} className="bg-[#F4F1EA]" /></div>
              <div><label className="text-sm font-medium text-[#0B2A5B]">Full Description</label><textarea className="w-full p-2 border rounded mt-1 bg-[#F4F1EA]" rows={3} value={newCourse.description} onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm font-medium text-[#0B2A5B]">Difficulty *</label><select className="w-full p-2 border rounded mt-1 bg-[#F4F1EA]" value={newCourse.difficulty_level} onChange={(e) => setNewCourse({ ...newCourse, difficulty_level: e.target.value })}><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option></select></div>
                <div><label className="text-sm font-medium text-[#0B2A5B]">Duration (days) *</label><Input type="number" min="0" value={newCourse.duration_days} onChange={(e) => setNewCourse({ ...newCourse, duration_days: parseInt(e.target.value) || 0 })} className="bg-[#F4F1EA]" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm font-medium text-[#0B2A5B]">Actual Price (₹) <span className="text-gray-400 font-normal">(Strikethrough)</span></label><Input type="number" min="0" value={newCourse.original_price} onChange={(e) => setNewCourse({ ...newCourse, original_price: parseFloat(e.target.value) || 0 })} className="bg-[#F4F1EA]" /></div>
                <div><label className="text-sm font-medium text-[#0B2A5B]">Discounted Price (₹) *</label><Input type="number" min="0" value={newCourse.price} onChange={(e) => setNewCourse({ ...newCourse, price: parseFloat(e.target.value) || 0 })} className="bg-[#F4F1EA]" /></div>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-[#0B2A5B]">Status</label>
                <Button
                  type="button"
                  variant={newCourse.is_published ? "default" : "outline"}
                  onClick={() => setNewCourse({ ...newCourse, is_published: !newCourse.is_published })}
                  className={newCourse.is_published ? "bg-green-600 hover:bg-green-700 text-white" : "text-gray-500"}
                >
                  {newCourse.is_published ? "Published" : "Draft"}
                </Button>
              </div>
              <Button type="submit" disabled={saving} className="w-full bg-[#0B2A5B] text-white hover:bg-[#1a3d7a]">{saving ? "Saving..." : editCourseId ? "Save Changes" : "Create Course"}</Button>
            </form>
          </Card>
        </div>
      )}

      {/* Module Modal (Create + Edit) */}
      {showModuleModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6 bg-white shadow-xl relative">
            <button onClick={resetModuleModal} className="absolute top-4 right-4 text-gray-500 hover:text-black"><X size={20} /></button>
            <h2 className="text-2xl font-bold text-[#0B2A5B] mb-4">{editModuleId ? "Edit Module" : "Add Module"}</h2>
            <form onSubmit={handleCreateModule} className="space-y-4">
              <div><label className="text-sm font-medium text-[#0B2A5B]">Title *</label><Input required value={newModule.title} onChange={(e) => setNewModule({ ...newModule, title: e.target.value })} className="bg-[#F4F1EA]" /></div>
              <div><label className="text-sm font-medium text-[#0B2A5B]">Description</label><textarea className="w-full p-2 border rounded mt-1 bg-[#F4F1EA]" rows={2} value={newModule.description} onChange={(e) => setNewModule({ ...newModule, description: e.target.value })} /></div>
              <div className="flex items-center justify-between mt-4">
                <label className="text-sm font-medium text-[#0B2A5B]">Status</label>
                <Button
                  type="button"
                  variant={newModule.is_published ? "default" : "outline"}
                  onClick={() => setNewModule({ ...newModule, is_published: !newModule.is_published })}
                  className={newModule.is_published ? "bg-green-600 hover:bg-green-700 text-white" : "text-gray-500"}
                >
                  {newModule.is_published ? "Published" : "Draft"}
                </Button>
              </div>
              <Button type="submit" disabled={saving} className="w-full bg-[#0B2A5B] text-white hover:bg-[#1a3d7a]">{saving ? "Saving..." : editModuleId ? "Save Changes" : "Add Module"}</Button>
            </form>
          </Card>
        </div>
      )}

      {/* Lesson Modal (Create + Edit) */}
      {showLessonModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <Card className="w-full max-w-lg p-6 bg-white shadow-xl relative my-8">
            <button onClick={resetLessonModal} className="absolute top-4 right-4 text-gray-500 hover:text-black"><X size={20} /></button>
            <h2 className="text-2xl font-bold text-[#0B2A5B] mb-4">{editLessonId ? "Edit Lesson" : "Add Lesson"}</h2>
            <form onSubmit={handleCreateLesson} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-[#0B2A5B]">Title *</label>
                <Input required value={newLesson.title} onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })} className="bg-[#F4F1EA]" />
              </div>
              <div>
                <label className="text-sm font-medium text-[#0B2A5B]">Content Type *</label>
                <select className="w-full p-2 border rounded mt-1 bg-[#F4F1EA]" value={newLesson.content_type} onChange={(e) => setNewLesson({ ...newLesson, content_type: e.target.value })}>
                  <option value="text">Text</option>
                  <option value="video">Video</option>
                  <option value="audio">Audio</option>
                  <option value="quiz">Quiz</option>
                  <option value="pdf">PDF</option>
                </select>
              </div>

              {/* ── QUIZ FIELDS ── */}
              {newLesson.content_type === "quiz" && (
                <div className="space-y-3 border border-purple-200 rounded-lg p-4 bg-purple-50/30">
                  <div>
                    <label className="text-sm font-medium text-[#0B2A5B]">Question Type</label>
                    <select className="w-full p-2 border rounded mt-1 bg-white" value={quizType} onChange={(e) => { setQuizType(e.target.value); setQuizCorrect("a"); }}>
                      <option value="mcq">Multiple Choice (A/B/C/D)</option>
                      <option value="true_false">True / False</option>
                      <option value="fill_blank">Fill in the Blank</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#0B2A5B]">Question *</label>
                    <textarea className="w-full p-2 border rounded mt-1 bg-white" rows={2} placeholder="Enter question text..." value={quizQuestion} onChange={(e) => setQuizQuestion(e.target.value)} required />
                  </div>

                  {quizType === "mcq" && (
                    <>
                      <div className="grid grid-cols-1 gap-2">
                        {["A", "B", "C", "D"].map((letter, i) => (
                          <div key={letter} className="flex items-center gap-2">
                            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${quizCorrect === letter.toLowerCase() ? "bg-green-500 text-white" : "bg-gray-200 text-gray-600"}`}>{letter}</span>
                            <Input
                              placeholder={`Option ${letter}`}
                              value={quizOptions[i]}
                              onChange={(e) => { const upd = [...quizOptions]; upd[i] = e.target.value; setQuizOptions(upd); }}
                              className="bg-white flex-1"
                            />
                          </div>
                        ))}
                      </div>
                      <div>
                        <label className="text-sm font-medium text-[#0B2A5B]">Correct Answer</label>
                        <select className="w-full p-2 border rounded mt-1 bg-white" value={quizCorrect} onChange={(e) => setQuizCorrect(e.target.value)}>
                          <option value="a">A</option>
                          <option value="b">B</option>
                          <option value="c">C</option>
                          <option value="d">D</option>
                        </select>
                      </div>
                    </>
                  )}

                  {quizType === "true_false" && (
                    <div>
                      <label className="text-sm font-medium text-[#0B2A5B]">Correct Answer</label>
                      <select className="w-full p-2 border rounded mt-1 bg-white" value={quizCorrect} onChange={(e) => setQuizCorrect(e.target.value)}>
                        <option value="a">True</option>
                        <option value="b">False</option>
                      </select>
                    </div>
                  )}

                  {quizType === "fill_blank" && (
                    <div>
                      <label className="text-sm font-medium text-[#0B2A5B]">Expected Answer</label>
                      <Input placeholder="Type the correct answer..." value={quizOptions[0]} onChange={(e) => { const upd = [...quizOptions]; upd[0] = e.target.value; setQuizOptions(upd); }} className="bg-white" />
                    </div>
                  )}
                </div>
              )}

              {/* ── NON-QUIZ FIELDS ── */}
              {newLesson.content_type !== "quiz" && (
                <div>
                  <label className="text-sm font-medium text-[#0B2A5B]">Content</label>
                  <textarea className="w-full p-2 border rounded mt-1 bg-[#F4F1EA]" rows={3} value={newLesson.content} onChange={(e) => setNewLesson({ ...newLesson, content: e.target.value })} />
                </div>
              )}

              {(newLesson.content_type === "video" || newLesson.content_type === "audio" || newLesson.content_type === "pdf") && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#0B2A5B]">Upload Media OR enter URL</label>
                  <div className="flex gap-2">
                    <Input 
                      type="text" 
                      placeholder="https://... or /uploads/..." 
                      value={newLesson.video_url} 
                      onChange={(e) => setNewLesson({ ...newLesson, video_url: e.target.value })} 
                      className="bg-[#F4F1EA] flex-1" 
                    />
                    <div className="relative overflow-hidden inline-block shrink-0">
                      <Button type="button" variant="outline" className="border-[#0B2A5B]/20 bg-gray-50 text-[#0B2A5B] pointer-events-none" disabled={uploadingMedia}>
                        <Upload size={16} className="mr-2" /> {uploadingMedia ? "Uploading..." : "Upload"}
                      </Button>
                      <input 
                        type="file" 
                        accept={newLesson.content_type === "video" ? "video/*" : newLesson.content_type === "audio" ? "audio/*" : "application/pdf"}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        disabled={uploadingMedia}
                        onChange={(e) => e.target.files && e.target.files[0] && handleMediaUpload(e.target.files[0])}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4">
                <div><label className="text-sm font-medium text-[#0B2A5B]">Duration (min)</label><Input type="number" min="1" value={newLesson.duration_minutes} onChange={(e) => setNewLesson({ ...newLesson, duration_minutes: parseInt(e.target.value) })} className="bg-[#F4F1EA]" /></div>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-[#0B2A5B]">Status</label>
                <Button
                  type="button"
                  variant={newLesson.is_published ? "default" : "outline"}
                  onClick={() => setNewLesson({ ...newLesson, is_published: !newLesson.is_published })}
                  className={newLesson.is_published ? "bg-green-600 hover:bg-green-700 text-white" : "text-gray-500"}
                >
                  {newLesson.is_published ? "Published" : "Draft"}
                </Button>
              </div>
              <Button type="submit" disabled={saving || uploadingMedia} className="w-full bg-[#0B2A5B] text-white hover:bg-[#1a3d7a]">{saving ? "Saving..." : editLessonId ? "Save Changes" : "Add Lesson"}</Button>
            </form>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}


