import { useState, useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Plus, X, BookOpen, Layers, FileText, ChevronDown, ChevronUp } from "lucide-react";
import api from "../../services/api";

export default function TeacherCourses() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCourse, setExpandedCourse] = useState<number | null>(null);

  // Course modal
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [newCourse, setNewCourse] = useState({ title: "", description: "", short_description: "", price: 0, difficulty_level: "beginner", duration_hours: 0 });

  // Module modal
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [moduleForCourse, setModuleForCourse] = useState<number | null>(null);
  const [newModule, setNewModule] = useState({ title: "", description: "", order: 0, is_published: false });

  // Lesson modal
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [lessonForModule, setLessonForModule] = useState<number | null>(null);
  const [newLesson, setNewLesson] = useState({ title: "", content: "", content_type: "text", video_url: "", duration_minutes: 15, order: 0, is_published: false });

  const [saving, setSaving] = useState(false);

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

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      await api.post("/admin/courses", newCourse);
      setShowCourseModal(false);
      setNewCourse({ title: "", description: "", short_description: "", price: 0, difficulty_level: "beginner", duration_hours: 0 });
      fetchCourses();
    } catch (err: any) { alert("Error: " + (err.response?.data?.detail || err.message)); }
    finally { setSaving(false); }
  };

  const handleCreateModule = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      await api.post("/admin/modules", { ...newModule, course_id: moduleForCourse });
      setShowModuleModal(false);
      setNewModule({ title: "", description: "", order: 0, is_published: false });
      if (moduleForCourse) fetchCourseDetail(moduleForCourse);
    } catch (err: any) { alert("Error: " + (err.response?.data?.detail || err.message)); }
    finally { setSaving(false); }
  };

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      await api.post("/admin/lessons", { ...newLesson, module_id: lessonForModule, video_url: newLesson.video_url || undefined });
      setShowLessonModal(false);
      setNewLesson({ title: "", content: "", content_type: "text", video_url: "", duration_minutes: 15, order: 0, is_published: false });
      // refresh the parent course
      const mod = courses.flatMap((c) => (c.modules || []).map((m: any) => ({ ...m, courseId: c.id }))).find((m: any) => m.id === lessonForModule);
      if (mod) fetchCourseDetail(mod.courseId);
    } catch (err: any) { alert("Error: " + (err.response?.data?.detail || err.message)); }
    finally { setSaving(false); }
  };

  const toggleExpand = (courseId: number) => {
    if (expandedCourse === courseId) { setExpandedCourse(null); return; }
    setExpandedCourse(courseId);
    fetchCourseDetail(courseId);
  };

  return (
    <DashboardLayout role="teacher">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#0B2A5B] mb-2">Course Management</h1>
          <p className="text-[#0B2A5B]/70">Create and manage courses, modules, and lessons</p>
        </div>
        <Button onClick={() => setShowCourseModal(true)} className="bg-[#0B2A5B] text-[#F4F1EA] hover:bg-[#1a3d7a]">
          <Plus size={16} className="mr-2" />New Course
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
                    <span>₹{course.price?.toLocaleString() || "0"}</span>
                    {course.duration_hours && <span>{course.duration_hours} hours</span>}
                    {course.modules && <span>{course.modules.length} modules</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" className="border-[#C2A86A] text-[#C2A86A]" onClick={(e) => { e.stopPropagation(); setModuleForCourse(course.id); setShowModuleModal(true); }}>
                  <Layers size={14} className="mr-1" />Add Module
                </Button>
                {expandedCourse === course.id ? <ChevronUp size={20} className="text-[#0B2A5B]/40" /> : <ChevronDown size={20} className="text-[#0B2A5B]/40" />}
              </div>
            </div>

            {/* Expanded: Modules & Lessons */}
            {expandedCourse === course.id && (
              <div className="border-t border-[#0B2A5B]/10 bg-[#F4F1EA]/30 p-6">
                {(course.modules || []).length === 0 ? (
                  <p className="text-sm text-[#0B2A5B]/50 text-center py-4">No modules yet. Click "Add Module" to create one.</p>
                ) : (
                  <div className="space-y-4">
                    {(course.modules || []).sort((a: any, b: any) => a.order - b.order).map((mod: any) => (
                      <Card key={mod.id} className="p-4 bg-white">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-[#0B2A5B]/10 rounded flex items-center justify-center"><Layers size={16} className="text-[#0B2A5B]" /></div>
                            <div>
                              <h4 className="font-semibold text-[#0B2A5B]">{mod.title}</h4>
                              <p className="text-xs text-[#0B2A5B]/50">{mod.description || "No description"} • Order: {mod.order}</p>
                            </div>
                          </div>
                          <Button size="sm" variant="outline" className="border-[#0B2A5B]/20 text-[#0B2A5B]" onClick={() => { setLessonForModule(mod.id); setShowLessonModal(true); }}>
                            <FileText size={14} className="mr-1" />Add Lesson
                          </Button>
                        </div>
                        {(mod.lessons || []).length > 0 && (
                          <div className="ml-11 space-y-2">
                            {(mod.lessons || []).sort((a: any, b: any) => a.order - b.order).map((lesson: any) => (
                              <div key={lesson.id} className="flex items-center gap-3 p-2 bg-[#F4F1EA] rounded text-sm">
                                <FileText size={14} className="text-[#C2A86A]" />
                                <span className="flex-1 text-[#0B2A5B]">{lesson.title}</span>
                                <Badge className="bg-gray-100 text-gray-600 text-xs">{lesson.content_type}</Badge>
                                {lesson.duration_minutes && <span className="text-xs text-[#0B2A5B]/50">{lesson.duration_minutes} min</span>}
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
          <Card className="w-full max-w-lg p-6 bg-white shadow-xl relative">
            <button onClick={() => setShowCourseModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-black"><X size={20} /></button>
            <h2 className="text-2xl font-bold text-[#0B2A5B] mb-4">Create New Course</h2>
            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div><label className="text-sm font-medium text-[#0B2A5B]">Title *</label><Input required value={newCourse.title} onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })} className="bg-[#F4F1EA]" /></div>
              <div><label className="text-sm font-medium text-[#0B2A5B]">Short Description</label><Input value={newCourse.short_description} onChange={(e) => setNewCourse({ ...newCourse, short_description: e.target.value })} className="bg-[#F4F1EA]" /></div>
              <div><label className="text-sm font-medium text-[#0B2A5B]">Full Description</label><textarea className="w-full p-2 border rounded mt-1 bg-[#F4F1EA]" rows={3} value={newCourse.description} onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm font-medium text-[#0B2A5B]">Difficulty</label><select className="w-full p-2 border rounded mt-1 bg-[#F4F1EA]" value={newCourse.difficulty_level} onChange={(e) => setNewCourse({ ...newCourse, difficulty_level: e.target.value })}><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option></select></div>
                <div><label className="text-sm font-medium text-[#0B2A5B]">Price (₹)</label><Input type="number" min="0" value={newCourse.price} onChange={(e) => setNewCourse({ ...newCourse, price: parseFloat(e.target.value) || 0 })} className="bg-[#F4F1EA]" /></div>
              </div>
              <div><label className="text-sm font-medium text-[#0B2A5B]">Duration (hours)</label><Input type="number" min="0" value={newCourse.duration_hours} onChange={(e) => setNewCourse({ ...newCourse, duration_hours: parseInt(e.target.value) || 0 })} className="bg-[#F4F1EA]" /></div>
              <Button type="submit" disabled={saving} className="w-full bg-[#0B2A5B] text-white hover:bg-[#1a3d7a]">{saving ? "Creating..." : "Create Course"}</Button>
            </form>
          </Card>
        </div>
      )}

      {/* Create Module Modal */}
      {showModuleModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6 bg-white shadow-xl relative">
            <button onClick={() => setShowModuleModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-black"><X size={20} /></button>
            <h2 className="text-2xl font-bold text-[#0B2A5B] mb-4">Add Module</h2>
            <form onSubmit={handleCreateModule} className="space-y-4">
              <div><label className="text-sm font-medium text-[#0B2A5B]">Title *</label><Input required value={newModule.title} onChange={(e) => setNewModule({ ...newModule, title: e.target.value })} className="bg-[#F4F1EA]" /></div>
              <div><label className="text-sm font-medium text-[#0B2A5B]">Description</label><textarea className="w-full p-2 border rounded mt-1 bg-[#F4F1EA]" rows={2} value={newModule.description} onChange={(e) => setNewModule({ ...newModule, description: e.target.value })} /></div>
              <div><label className="text-sm font-medium text-[#0B2A5B]">Order</label><Input type="number" min="0" value={newModule.order} onChange={(e) => setNewModule({ ...newModule, order: parseInt(e.target.value) })} className="bg-[#F4F1EA]" /></div>
              <div className="flex items-center gap-2"><input type="checkbox" checked={newModule.is_published} onChange={(e) => setNewModule({ ...newModule, is_published: e.target.checked })} /><label className="text-sm text-[#0B2A5B]">Published</label></div>
              <Button type="submit" disabled={saving} className="w-full bg-[#0B2A5B] text-white hover:bg-[#1a3d7a]">{saving ? "Creating..." : "Add Module"}</Button>
            </form>
          </Card>
        </div>
      )}

      {/* Create Lesson Modal */}
      {showLessonModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6 bg-white shadow-xl relative">
            <button onClick={() => setShowLessonModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-black"><X size={20} /></button>
            <h2 className="text-2xl font-bold text-[#0B2A5B] mb-4">Add Lesson</h2>
            <form onSubmit={handleCreateLesson} className="space-y-4">
              <div><label className="text-sm font-medium text-[#0B2A5B]">Title *</label><Input required value={newLesson.title} onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })} className="bg-[#F4F1EA]" /></div>
              <div><label className="text-sm font-medium text-[#0B2A5B]">Content Type</label><select className="w-full p-2 border rounded mt-1 bg-[#F4F1EA]" value={newLesson.content_type} onChange={(e) => setNewLesson({ ...newLesson, content_type: e.target.value })}><option value="text">Text</option><option value="video">Video</option><option value="audio">Audio</option></select></div>
              <div><label className="text-sm font-medium text-[#0B2A5B]">Content</label><textarea className="w-full p-2 border rounded mt-1 bg-[#F4F1EA]" rows={3} value={newLesson.content} onChange={(e) => setNewLesson({ ...newLesson, content: e.target.value })} /></div>
              {(newLesson.content_type === "video" || newLesson.content_type === "audio") && (
                <div><label className="text-sm font-medium text-[#0B2A5B]">Media URL</label><Input type="url" placeholder="https://..." value={newLesson.video_url} onChange={(e) => setNewLesson({ ...newLesson, video_url: e.target.value })} className="bg-[#F4F1EA]" /></div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm font-medium text-[#0B2A5B]">Duration (min)</label><Input type="number" min="1" value={newLesson.duration_minutes} onChange={(e) => setNewLesson({ ...newLesson, duration_minutes: parseInt(e.target.value) })} className="bg-[#F4F1EA]" /></div>
                <div><label className="text-sm font-medium text-[#0B2A5B]">Order</label><Input type="number" min="0" value={newLesson.order} onChange={(e) => setNewLesson({ ...newLesson, order: parseInt(e.target.value) })} className="bg-[#F4F1EA]" /></div>
              </div>
              <div className="flex items-center gap-2"><input type="checkbox" checked={newLesson.is_published} onChange={(e) => setNewLesson({ ...newLesson, is_published: e.target.checked })} /><label className="text-sm text-[#0B2A5B]">Published</label></div>
              <Button type="submit" disabled={saving} className="w-full bg-[#0B2A5B] text-white hover:bg-[#1a3d7a]">{saving ? "Creating..." : "Add Lesson"}</Button>
            </form>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}
