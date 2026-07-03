import { useState, useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import {
  Plus, Calendar, Users, X, Edit, Trash2, BookOpen, Copy, Upload,
  ChevronRight, GraduationCap, Layers, Search, EyeOff,
} from "lucide-react";
import api from "../../services/api";
import { confirmPopup } from "../../utils/popup";
import { toast } from "sonner";
import { uploadFile } from "../../utils/upload";

const STATUS_CONFIG: Record<string, { color: string; bg: string; dot: string }> = {
  "Registration Open": { color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200", dot: "bg-emerald-500" },
  "Running": { color: "text-blue-700", bg: "bg-blue-50 border-blue-200", dot: "bg-blue-500" },
  "Upcoming": { color: "text-amber-700", bg: "bg-amber-50 border-amber-200", dot: "bg-amber-500" },
  "Completed": { color: "text-gray-600", bg: "bg-gray-50 border-gray-200", dot: "bg-gray-400" },
};

const CONTENT_ICONS: Record<string, string> = { text: "📝", video: "🎬", quiz: "❓", pdf: "📄" };

export default function AdminBatches() {
  const [batches, setBatches] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ skip: 0, limit: 10, total: 0 });
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentBatchId, setCurrentBatchId] = useState<number | null>(null);
  const [batchForm, setBatchForm] = useState({
    name: "", description: "", start_date: "", end_date: "",
    registration_start_date: "", registration_end_date: "",
    max_students: 100, is_published: false, copy_from_batch_id: "" as number | string,
  });
  const [selectedCourseIds, setSelectedCourseIds] = useState<number[]>([]);
  const [showBatchCourseForm, setShowBatchCourseForm] = useState(false);
  const [batchCourseForm, setBatchCourseForm] = useState({ title: "", description: "", difficulty_level: "beginner", duration_hours: 0 });
  const [batchStudents, setBatchStudents] = useState<any[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentSearch, setStudentSearch] = useState("");
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [customizerBatch, setCustomizerBatch] = useState<any>(null);
  const [customizerCourse, setCustomizerCourse] = useState<any>(null);
  const [customizerModules, setCustomizerModules] = useState<any[]>([]);
  const [customizerLoading, setCustomizerLoading] = useState(false);
  const [editingModuleId, setEditingModuleId] = useState<number | null>(null);
  const [editingLessonId, setEditingLessonId] = useState<number | null>(null);
  const [isAddingModule, setIsAddingModule] = useState(false);
  const [isAddingLessonModuleId, setIsAddingLessonModuleId] = useState<number | null>(null);
  const [moduleForm, setModuleForm] = useState({ title: "", description: "", order: 0, is_published: true });
  const [lessonForm, setLessonForm] = useState({ title: "", content: "", content_type: "text", video_url: "", duration_minutes: 0, order: 0, is_published: true });
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [expandedBatch, setExpandedBatch] = useState<number | null>(null);

  // Customizer Tabs, Lectures & Exams State
  const [customizerTab, setCustomizerTab] = useState<'curriculum' | 'lectures' | 'exams'>('curriculum');
  const [customizerLectures, setCustomizerLectures] = useState<any[]>([]);
  const [customizerLecturesLoading, setCustomizerLecturesLoading] = useState(false);
  const [showLectureForm, setShowLectureForm] = useState(false);
  const [lectureFormData, setLectureFormData] = useState({ title: '', description: '', meeting_link: '', start_time: '', end_time: '', instructor_name: '' });
  const [editingLectureId, setEditingLectureId] = useState<number | null>(null);

  const [customizerExams, setCustomizerExams] = useState<any[]>([]);
  const [customizerExamsLoading, setCustomizerExamsLoading] = useState(false);
  const [showExamForm, setShowExamForm] = useState(false);
  const [examFormData, setExamFormData] = useState({ title: '', description: '', duration_minutes: 60, passing_score: 60, max_attempts: 3, reattempt_fee: 500, questions_per_attempt: '', marks_per_question: 1, negative_marks: 0 });
  const [editingExamId, setEditingExamId] = useState<number | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [br, cr] = await Promise.all([
        api.get(`/batches/admin/list?skip=${pagination.skip}&limit=${pagination.limit}`),
        api.get("/admin/courses"),
      ]);
      setBatches(br.data.batches);
      setPagination(p => ({ ...p, total: br.data.total }));
      setCourses(cr.data);
    } catch { toast.error("Failed to load batch data"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [pagination.skip]);

  const openBatchModal = (batch?: any) => {
    if (batch) {
      setIsEditing(true); setCurrentBatchId(batch.id);
      setBatchForm({
        name: batch.name, description: batch.description || "",
        start_date: batch.start_date ? new Date(batch.start_date).toISOString().slice(0,16) : "",
        end_date: batch.end_date ? new Date(batch.end_date).toISOString().slice(0,16) : "",
        registration_start_date: batch.registration_start_date ? new Date(batch.registration_start_date).toISOString().slice(0,16) : "",
        registration_end_date: batch.registration_end_date ? new Date(batch.registration_end_date).toISOString().slice(0,16) : "",
        max_students: batch.max_students, is_published: batch.is_published, copy_from_batch_id: "",
      });
    } else {
      setIsEditing(false); setCurrentBatchId(null);
      setBatchForm({ name:"",description:"",start_date:"",end_date:"",registration_start_date:"",registration_end_date:"",max_students:100,is_published:true,copy_from_batch_id:"" });
    }
    setShowBatchModal(true);
  };

  const saveBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const p: any = {
        name: batchForm.name, description: batchForm.description||null,
        start_date: new Date(batchForm.start_date).toISOString(),
        end_date: new Date(batchForm.end_date).toISOString(),
        registration_start_date: new Date(batchForm.registration_start_date).toISOString(),
        registration_end_date: new Date(batchForm.registration_end_date).toISOString(),
        max_students: Number(batchForm.max_students), is_published: batchForm.is_published,
        copy_from_batch_id: batchForm.copy_from_batch_id ? Number(batchForm.copy_from_batch_id) : null,
      };
      if (isEditing && currentBatchId) { delete p.copy_from_batch_id; await api.put(`/batches/admin/${currentBatchId}`,p); toast.success("Batch updated"); }
      else { await api.post("/batches/admin/create",p); toast.success("Batch created"); }
      setShowBatchModal(false); fetchData();
    } catch(err:any) { toast.error(err.response?.data?.detail||"Failed to save batch"); }
  };

  const deleteBatch = async (id: number) => {
    if(!(await confirmPopup("Delete this batch?"))) return;
    try { await api.delete(`/batches/admin/${id}`); toast.success("Deleted"); fetchData(); }
    catch(err:any) { toast.error(err.response?.data?.detail||"Failed"); }
  };

  const duplicateBatch = async (batch: any) => {
    if(!(await confirmPopup(`Duplicate "${batch.name}"?`))) return;
    try {
      await api.post("/batches/admin/create",{name:`${batch.name} (Copy)`,description:batch.description,start_date:batch.start_date,end_date:batch.end_date,registration_start_date:batch.registration_start_date,registration_end_date:batch.registration_end_date,max_students:batch.max_students,is_published:batch.is_published,copy_from_batch_id:batch.id});
      toast.success("Duplicated"); fetchData();
    } catch(err:any) { toast.error(err.response?.data?.detail||"Failed"); }
  };

  const openAssignModal = (batch: any) => {
    setCurrentBatchId(batch.id);
    setSelectedCourseIds(batch.assigned_courses?.map((c:any)=>c.id)||[]);
    setShowBatchCourseForm(false); setShowAssignModal(true);
  };

  const saveCourses = async () => {
    if(!currentBatchId) return;
    try { await api.post(`/batches/admin/${currentBatchId}/assign-courses`,{course_ids:selectedCourseIds}); toast.success("Saved"); setShowAssignModal(false); fetchData(); }
    catch(err:any) { toast.error(err.response?.data?.detail||"Failed"); }
  };

  const openStudentsModal = async (batch: any) => {
    setCurrentBatchId(batch.id); setBatchStudents([]); setStudentSearch(""); setShowStudentsModal(true); setStudentsLoading(true);
    try { const r = await api.get(`/batches/admin/${batch.id}/students`); setBatchStudents(r.data); }
    catch { toast.error("Failed to load students"); }
    finally { setStudentsLoading(false); }
  };

  const toggleCourse = (id:number) => setSelectedCourseIds(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id]);

  const fetchStructure = async (bId:number,cId:number) => {
    setCustomizerLoading(true);
    try { const r = await api.get(`/batches/admin/${bId}/courses/${cId}/structure`); setCustomizerModules(r.data||[]); }
    catch { toast.error("Failed to load structure"); }
    finally { setCustomizerLoading(false); }
  };

  const openCustomizer = (batch:any,course:any) => { 
    setCustomizerBatch(batch); 
    setCustomizerCourse(course); 
    setCustomizerTab('curriculum');
    setShowCustomizer(true); 
    fetchStructure(batch.id,course.id); 
    if (course.is_batch_only) {
      fetchCustomizerLectures(batch.id, course.id);
      fetchCustomizerExams(course.id);
    }
  };

  const fetchCustomizerLectures = async (bId: number, cId: number) => {
    setCustomizerLecturesLoading(true);
    try {
      const res = await api.get(`/batches/admin/lectures?batch_id=${bId}&course_id=${cId}`);
      setCustomizerLectures(res.data || []);
    } catch {
      toast.error("Failed to load lectures");
    } finally {
      setCustomizerLecturesLoading(false);
    }
  };

  const handleLectureSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customizerBatch || !customizerCourse) return;
    try {
      const startTime = new Date(lectureFormData.start_time);
      const endTime = lectureFormData.end_time ? new Date(lectureFormData.end_time) : null;
      const durationMinutes = endTime && endTime > startTime
        ? Math.round((endTime.getTime() - startTime.getTime()) / 60000)
        : 60;
      const payload = {
        batch_id: customizerBatch.id,
        course_id: customizerCourse.id,
        title: lectureFormData.title,
        description: lectureFormData.description,
        meeting_link: lectureFormData.meeting_link.trim() || undefined,
        scheduled_at: startTime.toISOString(),
        duration_minutes: durationMinutes,
        instructor_name: lectureFormData.instructor_name,
        end_time: endTime ? endTime.toISOString() : null,
        is_live: true
      };
      if (editingLectureId) {
        await api.put(`/batches/admin/lectures/${editingLectureId}`, payload);
        toast.success("Lecture updated");
      } else {
        await api.post("/batches/admin/lectures", payload);
        toast.success("Lecture scheduled");
      }
      setShowLectureForm(false);
      setLectureFormData({ title: '', description: '', meeting_link: '', start_time: '', end_time: '', instructor_name: '' });
      setEditingLectureId(null);
      fetchCustomizerLectures(customizerBatch.id, customizerCourse.id);
    } catch (err: any) {
      toast.error("Failed to save lecture: " + (err.response?.data?.detail || err.message));
    }
  };

  const handleDeleteLecture = async (lectureId: number) => {
    if (!(await confirmPopup("Are you sure you want to delete this lecture?"))) return;
    try {
      await api.delete(`/batches/admin/lectures/${lectureId}`);
      toast.success("Lecture deleted");
      fetchCustomizerLectures(customizerBatch.id, customizerCourse.id);
    } catch (err: any) {
      toast.error("Failed to delete lecture: " + (err.response?.data?.detail || err.message));
    }
  };

  const fetchCustomizerExams = async (cId: number) => {
    setCustomizerExamsLoading(true);
    try {
      const res = await api.get("/admin/exams/all");
      const courseExams = (res.data.course_exams || []).filter((e: any) => e.course_id === cId);
      setCustomizerExams(courseExams);
    } catch {
      toast.error("Failed to load exams");
    } finally {
      setCustomizerExamsLoading(false);
    }
  };

  const handleExamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customizerCourse) return;
    try {
      const payload: any = {
        course_id: customizerCourse.id,
        exam_type: "course_final",
        title: examFormData.title,
        description: examFormData.description,
        duration_minutes: examFormData.duration_minutes,
        passing_score: examFormData.passing_score,
        max_attempts: examFormData.max_attempts,
        reattempt_fee: examFormData.reattempt_fee,
        marks_per_question: examFormData.marks_per_question,
        negative_marks: examFormData.negative_marks
      };
      if (examFormData.questions_per_attempt) {
        payload.questions_per_attempt = parseInt(examFormData.questions_per_attempt);
      }
      if (editingExamId) {
        await api.put(`/admin/course-exams/${editingExamId}`, payload);
        toast.success("Exam updated");
      } else {
        await api.post("/admin/exams/course-create", payload);
        toast.success("Exam created");
      }
      setShowExamForm(false);
      setExamFormData({ title: '', description: '', duration_minutes: 60, passing_score: 60, max_attempts: 3, reattempt_fee: 500, questions_per_attempt: '', marks_per_question: 1, negative_marks: 0 });
      setEditingExamId(null);
      fetchCustomizerExams(customizerCourse.id);
    } catch (err: any) {
      toast.error("Failed to save exam: " + (err.response?.data?.detail || err.message));
    }
  };

  const handleDeleteExam = async (examId: number) => {
    if (!(await confirmPopup("Are you sure you want to delete this exam?"))) return;
    try {
      await api.delete(`/admin/course-exams/${examId}`);
      toast.success("Exam deleted");
      fetchCustomizerExams(customizerCourse.id);
    } catch (err: any) {
      toast.error("Failed to delete exam: " + (err.response?.data?.detail || err.message));
    }
  };

  const createModule = async (e:React.FormEvent) => {
    e.preventDefault();
    try { await api.post("/batches/admin/modules",{batch_id:customizerBatch.id,course_id:customizerCourse.id,...moduleForm}); toast.success("Module created"); setIsAddingModule(false); setModuleForm({title:"",description:"",order:0,is_published:true}); fetchStructure(customizerBatch.id,customizerCourse.id); }
    catch { toast.error("Failed"); }
  };

  const updateModule = async (id:number) => {
    try { await api.put(`/batches/admin/modules/${id}`,moduleForm); toast.success("Updated"); setEditingModuleId(null); fetchStructure(customizerBatch.id,customizerCourse.id); }
    catch { toast.error("Failed"); }
  };

  const deleteModule = async (id:number) => {
    if(!(await confirmPopup("Delete module and all its lessons?","Delete Module"))) return;
    try { await api.delete(`/batches/admin/modules/${id}`); toast.success("Deleted"); fetchStructure(customizerBatch.id,customizerCourse.id); }
    catch { toast.error("Failed"); }
  };

  const createBatchCourse = async (e:React.FormEvent) => {
    e.preventDefault(); if(!currentBatchId) return;
    try {
      const r = await api.post(`/batches/admin/${currentBatchId}/courses`,{...batchCourseForm,duration_hours:Number(batchCourseForm.duration_hours)||null});
      setSelectedCourseIds(p=>[...new Set([...p,r.data.id])]);
      setBatchCourseForm({title:"",description:"",difficulty_level:"beginner",duration_hours:0}); setShowBatchCourseForm(false);
      toast.success("Course created"); fetchData();
    } catch(err:any) { toast.error(err.response?.data?.detail||"Failed"); }
  };

  const handleUpload = async (e:React.ChangeEvent<HTMLInputElement>) => {
    const f=e.target.files?.[0]; if(!f) return;
    setUploading(true); setUploadProgress(0);
    try { const u=await uploadFile(f,(pct)=>setUploadProgress(pct)); setLessonForm(p=>({...p,video_url:u})); toast.success("Uploaded"); }
    catch { toast.error("Upload failed"); }
    finally { setUploading(false); setUploadProgress(null); }
  };

  const createLesson = async (e:React.FormEvent) => {
    e.preventDefault(); if(!isAddingLessonModuleId) return;
    try { await api.post("/batches/admin/lessons",{batch_module_id:isAddingLessonModuleId,...lessonForm}); toast.success("Lesson created"); setIsAddingLessonModuleId(null); setLessonForm({title:"",content:"",content_type:"text",video_url:"",duration_minutes:0,order:0,is_published:true}); fetchStructure(customizerBatch.id,customizerCourse.id); }
    catch { toast.error("Failed"); }
  };

  const updateLesson = async (id:number) => {
    try { await api.put(`/batches/admin/lessons/${id}`,lessonForm); toast.success("Updated"); setEditingLessonId(null); fetchStructure(customizerBatch.id,customizerCourse.id); }
    catch { toast.error("Failed"); }
  };

  const deleteLesson = async (id:number) => {
    if(!(await confirmPopup("Delete this lesson?","Delete Lesson"))) return;
    try { await api.delete(`/batches/admin/lessons/${id}`); toast.success("Deleted"); fetchStructure(customizerBatch.id,customizerCourse.id); }
    catch { toast.error("Failed"); }
  };

  const filtered = batches.filter(b=>{
    const q=searchQuery.toLowerCase();
    return (!q||b.name.toLowerCase().includes(q)||(b.batch_code||"").toLowerCase().includes(q))&&(statusFilter==="All"||b.status===statusFilter);
  });
  const filtStudents = batchStudents.filter(s=>{
    const q=studentSearch.toLowerCase();
    return !q||(s.full_name||"").toLowerCase().includes(q)||s.email.toLowerCase().includes(q);
  });

  const totalStudents = batches.reduce((a,b)=>a+(b.current_students||0),0);
  const totalCourses = batches.reduce((a,b)=>a+(b.assigned_courses?.length||0),0);
  const runningCount = batches.filter(b=>b.status==="Running").length;
  const statusOpts = ["All","Registration Open","Running","Upcoming","Completed"];
  const modalBg = {background:"rgba(11,42,91,0.6)",backdropFilter:"blur(6px)"} as React.CSSProperties;

  return (
    <DashboardLayout role="admin">
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <h1 className="text-2xl font-black text-[#0B2A5B] tracking-tight">Batch Management</h1>
            <p className="text-sm text-[#0B2A5B]/55 mt-0.5">Organize cohort batches, assign courses, and manage student schedules.</p>
          </div>
          <button onClick={()=>openBatchModal()} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0B2A5B] text-white text-sm font-bold shadow-lg hover:bg-[#1a3d7a] transition-all hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap">
            <Plus size={16}/>Create Batch
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          {[
            {label:"Total Batches",value:batches.length,icon:"🗂️",c:"bg-[#0B2A5B]/8 text-[#0B2A5B]"},
            {label:"Total Students",value:totalStudents,icon:"🎓",c:"bg-emerald-50 text-emerald-600"},
            {label:"Active Courses",value:totalCourses,icon:"📚",c:"bg-purple-50 text-purple-600"},
            {label:"Running Now",value:runningCount,icon:"▶️",c:"bg-blue-50 text-blue-600"},
          ].map(s=>(
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3 shadow-sm">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${s.c}`}>{s.icon}</div>
              <div>
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide leading-none mb-1">{s.label}</p>
                <p className="text-2xl font-black text-[#0B2A5B] leading-none">{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
            <input className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:border-[#0B2A5B]/40 transition-colors placeholder:text-gray-400" placeholder="Search by name or batch code..." value={searchQuery} onChange={e=>setSearchQuery(e.target.value)}/>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {statusOpts.map(s=>(
              <button key={s} onClick={()=>setStatusFilter(s)} className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all ${statusFilter===s?"bg-[#0B2A5B] text-white border-[#0B2A5B] shadow-md":"bg-white text-gray-500 border-gray-200 hover:border-gray-300"}`}>{s}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i=>(
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
                <div className="h-5 bg-gray-100 rounded w-1/3 mb-3"/>
                <div className="h-3 bg-gray-50 rounded w-2/3 mb-4"/>
                <div className="grid grid-cols-4 gap-3">{[1,2,3,4].map(j=><div key={j} className="h-10 bg-gray-50 rounded-xl"/>)}</div>
              </div>
            ))}
          </div>
        ) : filtered.length===0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center">
            <div className="w-14 h-14 bg-[#0B2A5B]/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Layers size={26} className="text-[#0B2A5B]/30"/>
            </div>
            <h3 className="text-[#0B2A5B] font-bold text-base mb-1">No Batches Found</h3>
            <p className="text-gray-400 text-sm">{searchQuery||statusFilter!=="All"?"Try adjusting your filters.":'Click "Create Batch" to get started.'}</p>
          </div>
        ) : (
          filtered.map(batch=>{
            const cfg=STATUS_CONFIG[batch.status]||STATUS_CONFIG["Completed"];
            const pct=batch.max_students>0?Math.min(100,Math.round((batch.current_students/batch.max_students)*100)):0;
            const isExp=expandedBatch===batch.id;
            return (
              <div key={batch.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
                <div className={`h-0.5 w-full ${cfg.dot}`}/>
                <div className="p-5">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-5">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <h3 className="text-base font-black text-[#0B2A5B]">{batch.name}</h3>
                        <span className="text-[10px] font-bold bg-[#0B2A5B]/6 text-[#0B2A5B]/60 px-2 py-0.5 rounded-md border border-[#0B2A5B]/10 tracking-widest uppercase">{batch.batch_code}</span>
                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} animate-pulse`}/>{batch.status}
                        </span>
                        {!batch.is_published&&<span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-50 border border-orange-200 text-orange-600"><EyeOff size={9}/>Draft</span>}
                      </div>
                      <p className="text-xs text-gray-400 mb-3 line-clamp-1">{batch.description||"No description provided."}</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                          {icon:<Calendar size={12} className="text-[#0B2A5B]/40"/>,label:"Start",val:new Date(batch.start_date).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})},
                          {icon:<Calendar size={12} className="text-[#0B2A5B]/40"/>,label:"End",val:new Date(batch.end_date).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})},
                          {icon:<GraduationCap size={12} className="text-emerald-500"/>,label:"Students",val:`${batch.current_students}/${batch.max_students}`},
                          {icon:<BookOpen size={12} className="text-purple-500"/>,label:"Courses",val:`${batch.assigned_courses?.length||0} assigned`},
                        ].map(item=>(
                          <div key={item.label} className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
                            <div className="shrink-0">{item.icon}</div>
                            <div>
                              <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-wide">{item.label}</p>
                              <p className="text-xs font-bold text-[#0B2A5B] leading-tight">{item.val}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3">
                        <div className="flex justify-between text-[10px] text-gray-400 mb-1 font-medium"><span>Capacity</span><span className="font-bold text-[#0B2A5B]">{pct}%</span></div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-700 ${pct>=80?"bg-red-400":pct>=50?"bg-amber-400":"bg-emerald-400"}`} style={{width:`${pct}%`}}/>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap lg:flex-col gap-2 lg:w-36 shrink-0">
                      <button onClick={()=>openStudentsModal(batch)} className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#0B2A5B] text-white text-xs font-bold hover:bg-[#1a3d7a] transition-all shadow-sm w-full">
                        <GraduationCap size={13}/>Students
                      </button>
                      <button onClick={()=>openAssignModal(batch)} className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition-all shadow-sm w-full">
                        <BookOpen size={13}/>Assign Courses
                      </button>
                      <div className="flex gap-1.5 w-full">
                        <button onClick={()=>duplicateBatch(batch)} title="Duplicate" className="flex-1 flex items-center justify-center py-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300 transition-all"><Copy size={13}/></button>
                        <button onClick={()=>openBatchModal(batch)} title="Edit" className="flex-1 flex items-center justify-center py-2 rounded-xl border border-gray-200 text-[#0B2A5B] hover:bg-[#0B2A5B]/5 hover:border-[#0B2A5B]/20 transition-all"><Edit size={13}/></button>
                        <button onClick={()=>deleteBatch(batch.id)} title="Delete" className="flex-1 flex items-center justify-center py-2 rounded-xl border border-red-100 text-red-500 hover:bg-red-50 hover:border-red-200 transition-all"><Trash2 size={13}/></button>
                      </div>
                    </div>
                  </div>
                  {batch.assigned_courses&&batch.assigned_courses.length>0&&(
                    <div className="mt-4 pt-4 border-t border-gray-50">
                      <button onClick={()=>setExpandedBatch(isExp?null:batch.id)} className="flex items-center gap-1.5 text-[10px] font-bold text-[#0B2A5B]/50 uppercase tracking-wider hover:text-[#0B2A5B] transition-colors mb-2">
                        <ChevronRight size={12} className={`transition-transform ${isExp?"rotate-90":""}`}/>
                        {batch.assigned_courses.length} Course{batch.assigned_courses.length!==1?"s":""} — Click to Customize
                      </button>
                      {isExp&&(
                        <div className="flex flex-wrap gap-2">
                          {batch.assigned_courses.map((c:any)=>(
                            <button key={c.id} onClick={()=>openCustomizer(batch,c)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0B2A5B]/5 hover:bg-[#0B2A5B]/10 border border-[#0B2A5B]/10 hover:border-[#0B2A5B]/25 text-[#0B2A5B] text-xs font-semibold transition-all">
                              <BookOpen size={11}/>{c.title}<ChevronRight size={10} className="opacity-40"/>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {pagination.total>pagination.limit&&(
        <div className="flex items-center justify-between mt-6 bg-white rounded-xl border border-gray-100 px-4 py-3 shadow-sm">
          <p className="text-xs text-gray-400">Showing {pagination.skip+1}–{Math.min(pagination.skip+pagination.limit,pagination.total)} of <span className="font-bold text-[#0B2A5B]">{pagination.total}</span></p>
          <div className="flex gap-2">
            <button disabled={pagination.skip===0} onClick={()=>setPagination(p=>({...p,skip:Math.max(0,p.skip-p.limit)}))} className="px-4 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-600 hover:border-[#0B2A5B]/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all">Previous</button>
            <button disabled={pagination.skip+pagination.limit>=pagination.total} onClick={()=>setPagination(p=>({...p,skip:p.skip+p.limit}))} className="px-4 py-1.5 text-xs font-black rounded-lg bg-[#0B2A5B] text-white hover:bg-[#1a3d7a] disabled:opacity-40 disabled:cursor-not-allowed transition-all">Next</button>
          </div>
        </div>
      )}

      {showBatchModal&&(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={modalBg}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#0B2A5B] flex items-center justify-center">{isEditing?<Edit size={16} className="text-white"/>:<Plus size={16} className="text-white"/>}</div>
                <div>
                  <h2 className="text-base font-black text-[#0B2A5B]">{isEditing?"Edit Batch":"Create New Batch"}</h2>
                  <p className="text-[11px] text-gray-400">{isEditing?"Update batch details":"Set up a new cohort batch"}</p>
                </div>
              </div>
              <button onClick={()=>setShowBatchModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition-all"><X size={18}/></button>
            </div>
            <form onSubmit={saveBatch} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-[10px] font-black text-[#0B2A5B] uppercase tracking-widest mb-1.5">Batch Name *</label>
                <Input required placeholder="e.g. September 2026 Batch" value={batchForm.name} onChange={e=>setBatchForm(p=>({...p,name:e.target.value}))} className="rounded-xl"/>
              </div>
              <div>
                <label className="block text-[10px] font-black text-[#0B2A5B] uppercase tracking-widest mb-1.5">Description</label>
                <Textarea placeholder="Cohort objectives..." value={batchForm.description} onChange={e=>setBatchForm(p=>({...p,description:e.target.value}))} className="rounded-xl resize-none" rows={2}/>
              </div>
              <div className="bg-blue-50/60 rounded-xl p-4 space-y-3">
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-wider">Registration Window</p>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-[10px] text-gray-500 font-semibold mb-1">Opens *</label><Input required type="datetime-local" value={batchForm.registration_start_date} onChange={e=>setBatchForm(p=>({...p,registration_start_date:e.target.value}))} className="rounded-xl text-xs"/></div>
                  <div><label className="block text-[10px] text-gray-500 font-semibold mb-1">Closes *</label><Input required type="datetime-local" value={batchForm.registration_end_date} onChange={e=>setBatchForm(p=>({...p,registration_end_date:e.target.value}))} className="rounded-xl text-xs"/></div>
                </div>
              </div>
              <div className="bg-purple-50/60 rounded-xl p-4 space-y-3">
                <p className="text-[10px] font-black text-purple-600 uppercase tracking-wider">Batch Schedule</p>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-[10px] text-gray-500 font-semibold mb-1">Starts *</label><Input required type="datetime-local" value={batchForm.start_date} onChange={e=>setBatchForm(p=>({...p,start_date:e.target.value}))} className="rounded-xl text-xs"/></div>
                  <div><label className="block text-[10px] text-gray-500 font-semibold mb-1">Ends *</label><Input required type="datetime-local" value={batchForm.end_date} onChange={e=>setBatchForm(p=>({...p,end_date:e.target.value}))} className="rounded-xl text-xs"/></div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black text-[#0B2A5B] uppercase tracking-widest mb-1.5">Max Students</label>
                  <Input type="number" value={batchForm.max_students} onChange={e=>setBatchForm(p=>({...p,max_students:Number(e.target.value)}))} className="rounded-xl"/>
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <div onClick={()=>setBatchForm(p=>({...p,is_published:!p.is_published}))} className={`relative w-10 h-5 rounded-full transition-all cursor-pointer flex-shrink-0 ${batchForm.is_published?"bg-[#0B2A5B]":"bg-gray-200"}`}>
                      <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${batchForm.is_published?"translate-x-5":"translate-x-0"}`}/>
                    </div>
                    <span className="text-sm font-semibold text-[#0B2A5B]">Publish Now</span>
                  </label>
                </div>
              </div>
              {!isEditing&&batches.length>0&&(
                <div>
                  <label className="block text-[10px] font-black text-[#0B2A5B] uppercase tracking-widest mb-1.5">Copy From Existing Batch</label>
                  <select value={batchForm.copy_from_batch_id} onChange={e=>setBatchForm(p=>({...p,copy_from_batch_id:e.target.value}))} className="w-full h-10 px-3 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:border-[#0B2A5B]/40">
                    <option value="">— Start Fresh —</option>
                    {batches.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
              )}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={()=>setShowBatchModal(false)} className="px-4 py-2 text-sm font-semibold rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all">Cancel</button>
                <button type="submit" className="px-5 py-2 text-sm font-black rounded-xl bg-[#0B2A5B] text-white hover:bg-[#1a3d7a] transition-all shadow-md">{isEditing?"Save Changes":"Create Batch"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAssignModal&&(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={modalBg}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden max-h-[85vh]">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center"><BookOpen size={16} className="text-white"/></div>
                <div>
                  <h2 className="text-base font-black text-[#0B2A5B]">Assign Courses</h2>
                  <p className="text-[11px] text-gray-400">{selectedCourseIds.length} selected</p>
                </div>
              </div>
              <button onClick={()=>setShowAssignModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition-all"><X size={18}/></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <p className="text-xs text-gray-500 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5">Select courses to copy their template, or create a batch-only course hidden from the global catalog.</p>
              {!showBatchCourseForm?(
                <button onClick={()=>setShowBatchCourseForm(true)} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-purple-200 text-purple-600 text-xs font-bold hover:border-purple-300 hover:bg-purple-50 transition-all">
                  <Plus size={14}/>Create Batch-Only Course
                </button>
              ):(
                <form onSubmit={createBatchCourse} className="rounded-xl border border-purple-100 bg-purple-50/40 p-4 space-y-3">
                  <h3 className="text-xs font-black text-purple-700 uppercase tracking-wider">New Batch-Only Course</h3>
                  <Input required placeholder="Course title" value={batchCourseForm.title} onChange={e=>setBatchCourseForm(p=>({...p,title:e.target.value}))} className="rounded-xl text-sm"/>
                  <Textarea placeholder="Short description" value={batchCourseForm.description} onChange={e=>setBatchCourseForm(p=>({...p,description:e.target.value}))} className="rounded-xl text-sm resize-none" rows={2}/>
                  <div>
                    <Input type="number" min="0" placeholder="Hours" value={batchCourseForm.duration_hours} onChange={e=>setBatchCourseForm(p=>({...p,duration_hours:Number(e.target.value)}))} className="rounded-xl text-sm w-full"/>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={()=>setShowBatchCourseForm(false)} className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">Cancel</button>
                    <button type="submit" className="px-3 py-1.5 text-xs font-black rounded-lg bg-purple-600 text-white hover:bg-purple-700">Create &amp; Assign</button>
                  </div>
                </form>
              )}
              <div className="space-y-2">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Available Courses</p>
                {courses.map(course=>{
                  const sel=selectedCourseIds.includes(course.id);
                  return(
                    <div key={course.id} onClick={()=>toggleCourse(course.id)} className={`p-3.5 rounded-xl border-2 cursor-pointer flex items-center justify-between transition-all ${sel?"border-[#0B2A5B] bg-[#0B2A5B]/5":"border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50"}`}>
                      <div>
                        <h4 className="font-bold text-[#0B2A5B] text-sm">{course.title}</h4>
                        <p className="text-[11px] text-gray-400 capitalize mt-0.5">{course.is_batch_only ? "" : `${course.difficulty_level} · `}{course.duration_hours||0} hrs</p>
                      </div>
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${sel?"bg-[#0B2A5B] border-[#0B2A5B]":"border-gray-300"}`}>
                        {sel&&<span className="text-white text-[10px] font-black">&#10003;</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
              <span className="text-xs text-gray-400">{selectedCourseIds.length} selected</span>
              <div className="flex gap-2">
                <button onClick={()=>setShowAssignModal(false)} className="px-4 py-2 text-sm font-semibold rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 transition-all">Cancel</button>
                <button onClick={saveCourses} className="px-5 py-2 text-sm font-black rounded-xl bg-purple-600 text-white hover:bg-purple-700 transition-all shadow-md">Save Assignments</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showStudentsModal&&(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={modalBg}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden max-h-[85vh]">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center"><GraduationCap size={16} className="text-white"/></div>
                <div>
                  <h2 className="text-base font-black text-[#0B2A5B]">Enrolled Students</h2>
                  <p className="text-[11px] text-gray-400">{batchStudents.length} enrolled</p>
                </div>
              </div>
              <button onClick={()=>setShowStudentsModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition-all"><X size={18}/></button>
            </div>
            <div className="px-6 pt-4 pb-2">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
                <input className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-400 transition-colors placeholder:text-gray-400" placeholder="Search students..." value={studentSearch} onChange={e=>setStudentSearch(e.target.value)}/>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-6 pb-4">
              {studentsLoading?(
                <div className="space-y-2 py-4">{[1,2,3].map(i=><div key={i} className="h-14 bg-gray-50 rounded-xl animate-pulse"/>)}</div>
              ):filtStudents.length===0?(
                <div className="text-center py-12">
                  <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3"><Users size={22} className="text-gray-300"/></div>
                  <p className="text-gray-400 text-sm">{studentSearch?"No match found.":"No students enrolled yet."}</p>
                </div>
              ):(
                <div className="space-y-2 pt-2">
                  {filtStudents.map(s=>(
                    <div key={s.id} className="flex items-center gap-3 p-3.5 rounded-xl bg-gray-50 hover:bg-gray-100/80 transition-colors">
                      <div className="w-9 h-9 rounded-xl bg-[#0B2A5B]/10 flex items-center justify-center text-[#0B2A5B] font-black text-sm shrink-0">
                        {(s.full_name||s.email||"?").charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-[#0B2A5B] text-sm truncate">{s.full_name||"—"}</p>
                        <p className="text-xs text-gray-400 truncate">{s.email}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[10px] text-gray-400">{s.phone||"—"}</p>
                        <p className="text-[10px] text-gray-400">{new Date(s.enrolled_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end bg-gray-50/50">
              <button onClick={()=>setShowStudentsModal(false)} className="px-5 py-2 text-sm font-black rounded-xl bg-[#0B2A5B] text-white hover:bg-[#1a3d7a] transition-all">Close</button>
            </div>
          </div>
        </div>
      )}

      {showCustomizer&&customizerBatch&&customizerCourse&&(
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4" style={{background:"rgba(11,42,91,0.65)",backdropFilter:"blur(8px)"}}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col overflow-hidden" style={{height:"90vh"}}>
            <div className="flex items-center justify-between px-6 py-5 bg-gradient-to-r from-[#0B2A5B] to-[#1a3d7a]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center"><Layers size={18} className="text-white"/></div>
                <div>
                  <h2 className="text-base font-black text-white">Course Structure Editor</h2>
                  <p className="text-[11px] text-white/55 mt-0.5">
                    <span className="text-white/80 font-bold">{customizerBatch.name}</span>
                    <span className="mx-1.5 opacity-50">·</span>
                    <span className="text-white/80 font-bold">{customizerCourse.title}</span>
                  </p>
                </div>
              </div>
              <button onClick={()=>setShowCustomizer(false)} className="w-8 h-8 flex items-center justify-center rounded-lg text-white/50 hover:text-white hover:bg-white/15 transition-all"><X size={18}/></button>
            </div>

            {customizerCourse.is_batch_only && (
              <div className="flex border-b border-gray-100 bg-gray-50 px-6 shrink-0">
                <button
                  onClick={() => setCustomizerTab('curriculum')}
                  className={`px-4 py-3.5 text-xs font-bold transition-all border-b-2 -mb-px ${
                    customizerTab === 'curriculum'
                      ? 'border-[#0B2A5B] text-[#0B2A5B]'
                      : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}
                >
                  Curriculum
                </button>
                <button
                  onClick={() => setCustomizerTab('lectures')}
                  className={`px-4 py-3.5 text-xs font-bold transition-all border-b-2 -mb-px ${
                    customizerTab === 'lectures'
                      ? 'border-[#0B2A5B] text-[#0B2A5B]'
                      : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}
                >
                  Live Lectures
                </button>
                <button
                  onClick={() => setCustomizerTab('exams')}
                  className={`px-4 py-3.5 text-xs font-bold transition-all border-b-2 -mb-px ${
                    customizerTab === 'exams'
                      ? 'border-[#0B2A5B] text-[#0B2A5B]'
                      : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}
                >
                  Exams
                </button>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-gray-50/60">
              {(!customizerCourse.is_batch_only || customizerTab === 'curriculum') && (
                <>
                  {customizerLoading?(
                    <div className="space-y-3">{[1,2].map(i=><div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse"><div className="h-4 bg-gray-100 rounded w-1/4 mb-3"/><div className="h-3 bg-gray-50 rounded w-1/2"/></div>)}</div>
                  ):(
                    <>
                      {!isAddingModule?(
                        <button onClick={()=>{setIsAddingModule(true);setModuleForm({title:"",description:"",order:customizerModules.length+1,is_published:true});}} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0B2A5B] text-white text-xs font-black hover:bg-[#1a3d7a] transition-all shadow-md">
                          <Plus size={14}/>Add New Module
                        </button>
                      ):(
                        <form onSubmit={createModule} className="bg-white rounded-2xl border border-[#0B2A5B]/15 p-5 shadow-sm space-y-3">
                          <h4 className="text-xs font-black text-[#0B2A5B] uppercase tracking-wider">New Module</h4>
                          <div className="grid grid-cols-3 gap-3">
                            <div className="col-span-2"><Input required placeholder="Module title" value={moduleForm.title} onChange={e=>setModuleForm(p=>({...p,title:e.target.value}))} className="rounded-xl"/></div>
                            <Input type="number" placeholder="Order" value={moduleForm.order} onChange={e=>setModuleForm(p=>({...p,order:Number(e.target.value)}))} className="rounded-xl"/>
                          </div>
                          <Textarea placeholder="Description (optional)" value={moduleForm.description} onChange={e=>setModuleForm(p=>({...p,description:e.target.value}))} className="rounded-xl resize-none" rows={2}/>
                          <div className="flex justify-end gap-2">
                            <button type="button" onClick={()=>setIsAddingModule(false)} className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">Cancel</button>
                            <button type="submit" className="px-4 py-1.5 text-xs font-black rounded-lg bg-[#0B2A5B] text-white hover:bg-[#1a3d7a]">Save Module</button>
                          </div>
                        </form>
                      )}
                      {customizerModules.length===0?(
                        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
                          <Layers size={28} className="text-gray-200 mx-auto mb-3"/>
                          <p className="text-gray-400 text-sm">No modules yet. Add one above.</p>
                        </div>
                      ):(
                        <div className="space-y-4">
                          {customizerModules.map(mod=>(
                            <div key={mod.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                              <div className="flex items-start gap-3 p-4 border-b border-gray-50">
                                <div className="w-8 h-8 rounded-xl bg-[#0B2A5B] flex items-center justify-center text-white text-xs font-black shrink-0">{mod.order}</div>
                                {editingModuleId===mod.id?(
                                  <div className="flex-1 space-y-2">
                                    <div className="grid grid-cols-3 gap-2">
                                      <div className="col-span-2"><Input value={moduleForm.title} onChange={e=>setModuleForm(p=>({...p,title:e.target.value}))} className="rounded-xl text-sm font-bold"/></div>
                                      <Input type="number" value={moduleForm.order} onChange={e=>setModuleForm(p=>({...p,order:Number(e.target.value)}))} className="rounded-xl text-sm"/>
                                    </div>
                                    <Textarea value={moduleForm.description} onChange={e=>setModuleForm(p=>({...p,description:e.target.value}))} placeholder="Description..." className="rounded-xl resize-none text-sm" rows={2}/>
                                    <div className="flex gap-2">
                                      <button className="px-3 py-1.5 text-xs font-black rounded-lg bg-emerald-500 text-white hover:bg-emerald-600" onClick={()=>updateModule(mod.id)}>Save</button>
                                      <button className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50" onClick={()=>setEditingModuleId(null)}>Cancel</button>
                                    </div>
                                  </div>
                                ):(
                                  <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-[#0B2A5B] text-sm">{mod.title}</h3>
                                    {mod.description&&<p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{mod.description}</p>}
                                    <p className="text-[10px] text-gray-300 mt-1">{mod.lessons?.length||0} lesson{(mod.lessons?.length||0)!==1?"s":""}</p>
                                  </div>
                                )}
                                {editingModuleId!==mod.id&&(
                                  <div className="flex gap-1 shrink-0">
                                    <button onClick={()=>{setEditingModuleId(mod.id);setModuleForm({title:mod.title,description:mod.description||"",order:mod.order,is_published:mod.is_published});}} className="w-7 h-7 flex items-center justify-center rounded-lg text-[#0B2A5B]/40 hover:text-[#0B2A5B] hover:bg-[#0B2A5B]/5 transition-all"><Edit size={13}/></button>
                                    <button onClick={()=>deleteModule(mod.id)} className="w-7 h-7 flex items-center justify-center rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-all"><Trash2 size={13}/></button>
                                  </div>
                                )}
                              </div>
                              <div className="p-4 space-y-2">
                                <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-2">Lessons</p>
                                {mod.lessons&&mod.lessons.length>0?(
                                  <div className="space-y-1.5">
                                    {mod.lessons.map((lesson:any)=>(
                                      <div key={lesson.id} className="rounded-xl border border-gray-100 bg-gray-50/50 overflow-hidden">
                                        {editingLessonId===lesson.id?(
                                          <div className="p-4 space-y-3">
                                            <div className="grid grid-cols-2 gap-2">
                                              <div>
                                                <label className="text-[10px] font-bold text-[#0B2A5B] block mb-1">Lesson Title *</label>
                                                <Input value={lessonForm.title} onChange={e=>setLessonForm(p=>({...p,title:e.target.value}))} placeholder="Title" className="rounded-xl text-sm"/>
                                              </div>
                                              <div>
                                                <label className="text-[10px] font-bold text-[#0B2A5B] block mb-1">Content Type *</label>
                                                <select value={lessonForm.content_type} onChange={e=>setLessonForm(p=>({...p,content_type:e.target.value}))} className="w-full h-10 px-3 border border-gray-200 rounded-xl text-sm bg-white">
                                                  <option value="text">Text</option><option value="video">Video</option><option value="quiz">Quiz</option><option value="pdf">PDF</option>
                                                </select>
                                              </div>
                                            </div>
                                            {(lessonForm.content_type==="video"||lessonForm.content_type==="pdf")&&(
                                              <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-[#0B2A5B] block mb-1">
                                                  {lessonForm.content_type==="video"?"Video URL / Link *":"PDF File URL *"}
                                                </label>
                                                <div className="flex gap-2">
                                                  <Input value={lessonForm.video_url} onChange={e=>setLessonForm(p=>({...p,video_url:e.target.value}))} placeholder={lessonForm.content_type==="video"?"Video URL":"PDF URL"} className="rounded-xl text-sm flex-1"/>
                                                  <label className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-xl text-xs font-bold cursor-pointer text-[#0B2A5B] transition-all whitespace-nowrap">
                                                    <Upload size={13}/>{uploading?"Uploading...":"Upload File"}
                                                    <input type="file" accept={lessonForm.content_type==="video"?"video/*":"application/pdf"} onChange={handleUpload} disabled={uploading} className="hidden"/>
                                                  </label>
                                                </div>
                                                {uploading&&uploadProgress!==null&&<div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden"><div className="bg-purple-500 h-full rounded-full transition-all" style={{width:`${uploadProgress}%`}}/></div>}
                                              </div>
                                            )}
                                            <div>
                                              <label className="text-[10px] font-bold text-[#0B2A5B] block mb-1">Lesson Content / Description</label>
                                              <Textarea placeholder="Lesson content..." value={lessonForm.content} onChange={e=>setLessonForm(p=>({...p,content:e.target.value}))} className="rounded-xl text-sm resize-none" rows={2}/>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                              <div>
                                                <label className="text-[10px] font-bold text-[#0B2A5B] block mb-1">Display Order *</label>
                                                <Input type="number" placeholder="Order" value={lessonForm.order} onChange={e=>setLessonForm(p=>({...p,order:Number(e.target.value)}))} className="rounded-xl text-sm"/>
                                              </div>
                                              <div>
                                                <label className="text-[10px] font-bold text-[#0B2A5B] block mb-1">Duration (minutes)</label>
                                                <Input type="number" placeholder="Duration (mins)" value={lessonForm.duration_minutes} onChange={e=>setLessonForm(p=>({...p,duration_minutes:Number(e.target.value)}))} className="rounded-xl text-sm"/>
                                              </div>
                                            </div>
                                            <div className="flex justify-end gap-2">
                                              <button type="button" onClick={()=>setEditingLessonId(null)} className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">Cancel</button>
                                              <button type="button" className="px-3 py-1.5 text-xs font-black rounded-lg bg-emerald-500 text-white hover:bg-emerald-600" onClick={()=>updateLesson(lesson.id)}>Save</button>
                                            </div>
                                          </div>
                                        ):(
                                          <div className="flex items-center gap-3 px-3.5 py-2.5">
                                            <span className="text-base shrink-0">{CONTENT_ICONS[lesson.content_type]||"📝"}</span>
                                            <div className="flex-1 min-w-0">
                                              <p className="font-bold text-gray-700 text-xs truncate">{lesson.title}</p>
                                              <p className="text-[10px] text-gray-400 capitalize mt-0.5">{lesson.content_type} {lesson.duration_minutes?`• ${lesson.duration_minutes}m`:""}</p>
                                            </div>
                                            <div className="flex gap-1">
                                              <button onClick={()=>{setEditingLessonId(lesson.id);setLessonForm({title:lesson.title,content:lesson.content||"",content_type:lesson.content_type,video_url:lesson.video_url||"",duration_minutes:lesson.duration_minutes||0,order:lesson.order,is_published:lesson.is_published});}} className="w-7 h-7 flex items-center justify-center rounded-lg text-[#0B2A5B]/40 hover:text-[#0B2A5B] hover:bg-[#0B2A5B]/5 transition-all"><Edit size={12}/></button>
                                              <button onClick={()=>deleteLesson(lesson.id)} className="w-7 h-7 flex items-center justify-center rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-all"><Trash2 size={12}/></button>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                ):(<p className="text-[10px] text-gray-300 italic">No lessons. Add one below.</p>)}
                                {isAddingLessonModuleId===mod.id?(
                                  <form onSubmit={createLesson} className="mt-3 p-4 bg-[#0B2A5B]/5 rounded-xl border border-[#0B2A5B]/10 space-y-3">
                                    <h5 className="text-[10px] font-black text-[#0B2A5B] uppercase tracking-wider">New Lesson</h5>
                                    <div className="grid grid-cols-2 gap-2">
                                      <div>
                                        <label className="text-[10px] font-bold text-[#0B2A5B] block mb-1">Lesson Title *</label>
                                        <Input required placeholder="Title" value={lessonForm.title} onChange={e=>setLessonForm(p=>({...p,title:e.target.value}))} className="rounded-xl text-sm"/>
                                      </div>
                                      <div>
                                        <label className="text-[10px] font-bold text-[#0B2A5B] block mb-1">Content Type *</label>
                                        <select value={lessonForm.content_type} onChange={e=>setLessonForm(p=>({...p,content_type:e.target.value}))} className="w-full h-10 px-3 border border-gray-200 rounded-xl text-sm bg-white">
                                          <option value="text">Text</option><option value="video">Video</option><option value="quiz">Quiz</option><option value="pdf">PDF</option>
                                        </select>
                                      </div>
                                    </div>
                                    {(lessonForm.content_type==="video"||lessonForm.content_type==="pdf")&&(
                                      <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-[#0B2A5B] block mb-1">
                                          {lessonForm.content_type==="video"?"Video URL / Link *":"PDF File URL *"}
                                        </label>
                                        <div className="flex gap-2">
                                          <Input required placeholder={lessonForm.content_type==="video"?"Video URL":"PDF URL"} value={lessonForm.video_url} onChange={e=>setLessonForm(p=>({...p,video_url:e.target.value}))} className="rounded-xl text-sm flex-1"/>
                                          <label className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-xl text-xs font-bold cursor-pointer text-[#0B2A5B] transition-all whitespace-nowrap">
                                            <Upload size={13}/>{uploading?"Uploading...":"Upload File"}
                                            <input type="file" accept={lessonForm.content_type==="video"?"video/*":"application/pdf"} onChange={handleUpload} disabled={uploading} className="hidden"/>
                                          </label>
                                        </div>
                                        {uploading&&uploadProgress!==null&&<div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden"><div className="bg-purple-500 h-full rounded-full transition-all" style={{width:`${uploadProgress}%`}}/></div>}
                                      </div>
                                    )}
                                    <div>
                                      <label className="text-[10px] font-bold text-[#0B2A5B] block mb-1">Lesson Content / Description</label>
                                      <Textarea placeholder="Lesson content..." value={lessonForm.content} onChange={e=>setLessonForm(p=>({...p,content:e.target.value}))} className="rounded-xl text-sm resize-none" rows={2}/>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                      <div>
                                        <label className="text-[10px] font-bold text-[#0B2A5B] block mb-1">Display Order *</label>
                                        <Input type="number" placeholder="Order" value={lessonForm.order} onChange={e=>setLessonForm(p=>({...p,order:Number(e.target.value)}))} className="rounded-xl text-sm"/>
                                      </div>
                                      <div>
                                        <label className="text-[10px] font-bold text-[#0B2A5B] block mb-1">Duration (minutes)</label>
                                        <Input type="number" placeholder="Duration (mins)" value={lessonForm.duration_minutes} onChange={e=>setLessonForm(p=>({...p,duration_minutes:Number(e.target.value)}))} className="rounded-xl text-sm"/>
                                      </div>
                                    </div>
                                    <div className="flex justify-end gap-2">
                                      <button type="button" onClick={()=>setIsAddingLessonModuleId(null)} className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">Cancel</button>
                                      <button type="submit" className="px-3 py-1.5 text-xs font-black rounded-lg bg-purple-600 text-white hover:bg-purple-700">Save Lesson</button>
                                    </div>
                                  </form>
                                ):(
                                  <button onClick={()=>{setIsAddingLessonModuleId(mod.id);setLessonForm({title:"",content:"",content_type:"text",video_url:"",duration_minutes:15,order:mod.lessons?.length+1,is_published:true});}} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-50 text-gray-500 hover:text-[#0B2A5B] hover:bg-[#0B2A5B]/5 text-[10px] font-black tracking-wide border border-dashed border-gray-200 hover:border-[#0B2A5B]/20 transition-all w-full mt-2 justify-center">
                                    <Plus size={11}/>Add New Lesson
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </>
              )}

              {customizerCourse.is_batch_only && customizerTab === 'lectures' && (
                <>
                  {customizerLecturesLoading ? (
                    <div className="space-y-3">
                      {[1, 2].map(i => (
                        <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
                          <div className="h-4 bg-gray-100 rounded w-1/4 mb-3" />
                          <div className="h-3 bg-gray-50 rounded w-1/2" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-5">
                      <div className="flex justify-between items-center">
                        <h3 className="text-sm font-black text-[#0B2A5B] uppercase tracking-wider">Scheduled Live Lectures</h3>
                        {!showLectureForm && (
                          <button
                            onClick={() => {
                              setEditingLectureId(null);
                              setLectureFormData({ title: '', description: '', meeting_link: '', start_time: '', end_time: '', instructor_name: '' });
                              setShowLectureForm(true);
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0B2A5B] text-white text-xs font-black hover:bg-[#1a3d7a] transition-all shadow-md animate-fade-in"
                          >
                            <Plus size={12} /> Schedule Live Lecture
                          </button>
                        )}
                      </div>

                      {showLectureForm && (
                        <form onSubmit={handleLectureSubmit} className="bg-white rounded-2xl border border-[#0B2A5B]/15 p-5 shadow-sm space-y-3 animate-fade-in">
                          <h4 className="text-xs font-black text-[#0B2A5B] uppercase tracking-wider">
                            {editingLectureId ? "Edit Live Lecture" : "Schedule Live Lecture"}
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs font-semibold text-[#0B2A5B] mb-1 block">Lecture Title *</label>
                              <Input required placeholder="e.g. Technical Analysis Basics" value={lectureFormData.title} onChange={e => setLectureFormData(p => ({ ...p, title: e.target.value }))} className="rounded-xl" />
                            </div>
                            <div>
                              <label className="text-xs font-semibold text-[#0B2A5B] mb-1 block">Instructor Name</label>
                              <Input placeholder="Enter instructor name" value={lectureFormData.instructor_name} onChange={e => setLectureFormData(p => ({ ...p, instructor_name: e.target.value }))} className="rounded-xl" />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs font-semibold text-[#0B2A5B] mb-1 block">Start Time *</label>
                              <Input required type="datetime-local" value={lectureFormData.start_time} onChange={e => setLectureFormData(p => ({ ...p, start_time: e.target.value }))} className="rounded-xl text-xs" />
                            </div>
                            <div>
                              <label className="text-xs font-semibold text-[#0B2A5B] mb-1 block">End Time</label>
                              <Input type="datetime-local" value={lectureFormData.end_time} onChange={e => setLectureFormData(p => ({ ...p, end_time: e.target.value }))} className="rounded-xl text-xs" />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="md:col-span-2">
                              <label className="text-xs font-semibold text-[#0B2A5B] mb-1 block">Google Meet / Zoom Link</label>
                              <Input type="url" placeholder="https://zoom.us/j/... or leave blank to auto-generate" value={lectureFormData.meeting_link} onChange={e => setLectureFormData(p => ({ ...p, meeting_link: e.target.value }))} className="rounded-xl" />
                            </div>
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-[#0B2A5B] mb-1 block">Description *</label>
                            <Textarea required placeholder="What will students learn in this session?" value={lectureFormData.description} onChange={e => setLectureFormData(p => ({ ...p, description: e.target.value }))} className="rounded-xl resize-none" rows={2} />
                          </div>
                          <div className="flex justify-end gap-2">
                            <button type="button" onClick={() => setShowLectureForm(false)} className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">Cancel</button>
                            <button type="submit" className="px-4 py-1.5 text-xs font-black rounded-lg bg-[#0B2A5B] text-white hover:bg-[#1a3d7a]">Save Lecture</button>
                          </div>
                        </form>
                      )}

                      {customizerLectures.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
                          <Calendar size={28} className="text-gray-200 mx-auto mb-3" />
                          <p className="text-gray-400 text-sm">No live lectures scheduled yet.</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {customizerLectures.map(lecture => (
                            <div key={lecture.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-[#0B2A5B]/20 transition-all">
                              <div className="space-y-1">
                                <h4 className="font-bold text-[#0B2A5B] text-sm">{lecture.title}</h4>
                                {lecture.description && <p className="text-xs text-gray-400 line-clamp-1">{lecture.description}</p>}
                                <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-gray-400 mt-1">
                                  <span>📅 {new Date(lecture.scheduled_at || lecture.start_time).toLocaleDateString()}</span>
                                  <span>⏰ {new Date(lecture.scheduled_at || lecture.start_time).toLocaleTimeString()}</span>
                                  <span>⏳ {lecture.duration_minutes} mins</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                                <a
                                  href={lecture.meeting_link || lecture.meeting_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="px-3.5 py-1.5 rounded-lg bg-[#0B2A5B]/5 hover:bg-[#0B2A5B]/10 border border-[#0B2A5B]/10 text-[#0B2A5B] text-xs font-bold transition-all"
                                >
                                  Join Link
                                </a>
                                <button
                                  onClick={() => {
                                    setEditingLectureId(lecture.id);
                                    setLectureFormData({
                                      title: lecture.title,
                                      description: lecture.description || "",
                                      meeting_link: lecture.meeting_link || lecture.meeting_url || "",
                                      scheduled_at: (lecture.scheduled_at || lecture.start_time) ? new Date(lecture.scheduled_at || lecture.start_time).toISOString().slice(0, 16) : "",
                                      duration_minutes: lecture.duration_minutes || 60
                                    });
                                    setShowLectureForm(true);
                                  }}
                                  className="w-8 h-8 flex items-center justify-center rounded-lg text-[#0B2A5B]/40 hover:text-[#0B2A5B] hover:bg-[#0B2A5B]/5 transition-all"
                                >
                                  <Edit size={13} />
                                </button>
                                <button
                                  onClick={() => handleDeleteLecture(lecture.id)}
                                  className="w-8 h-8 flex items-center justify-center rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-all"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              {customizerCourse.is_batch_only && customizerTab === 'exams' && (
                <>
                  {customizerExamsLoading ? (
                    <div className="space-y-3">
                      {[1, 2].map(i => (
                        <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
                          <div className="h-4 bg-gray-100 rounded w-1/4 mb-3" />
                          <div className="h-3 bg-gray-50 rounded w-1/2" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-5">
                      <div className="flex justify-between items-center">
                        <h3 className="text-sm font-black text-[#0B2A5B] uppercase tracking-wider">Course Exams</h3>
                        {!showExamForm && (
                          <button
                            onClick={() => {
                              setEditingExamId(null);
                              setExamFormData({ title: '', description: '', duration_minutes: 60, passing_score: 60, max_attempts: 3, reattempt_fee: 500, questions_per_attempt: '', marks_per_question: 1, negative_marks: 0 });
                              setShowExamForm(true);
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0B2A5B] text-white text-xs font-black hover:bg-[#1a3d7a] transition-all shadow-sm animate-fade-in"
                          >
                            <Plus size={12} /> Create Exam
                          </button>
                        )}
                      </div>

                      {showExamForm && (
                        <form onSubmit={handleExamSubmit} className="bg-white rounded-2xl border border-[#0B2A5B]/15 p-5 shadow-sm space-y-3 animate-fade-in">
                          <h4 className="text-xs font-black text-[#0B2A5B] uppercase tracking-wider">
                            {editingExamId ? "Edit Exam" : "Create Exam"}
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs font-semibold text-[#0B2A5B] mb-1 block">Exam Title *</label>
                              <Input required placeholder="e.g. Final Examination" value={examFormData.title} onChange={e => setExamFormData(p => ({ ...p, title: e.target.value }))} className="rounded-xl" />
                            </div>
                            <div>
                              <label className="text-xs font-semibold text-[#0B2A5B] mb-1 block">Duration (minutes) *</label>
                              <Input type="number" required min="10" value={examFormData.duration_minutes} onChange={e => setExamFormData(p => ({ ...p, duration_minutes: Number(e.target.value) }))} className="rounded-xl" />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs font-semibold text-[#0B2A5B] mb-1 block">Passing Score (%) *</label>
                              <Input type="number" required min="1" max="100" value={examFormData.passing_score} onChange={e => setExamFormData(p => ({ ...p, passing_score: Number(e.target.value) }))} className="rounded-xl" />
                            </div>
                            <div>
                              <label className="text-xs font-semibold text-[#0B2A5B] mb-1 block flex items-center gap-1">
                                Questions Per Attempt
                                <span className="text-[10px] text-gray-400 font-normal">(leave blank for all)</span>
                              </label>
                              <Input type="number" min="1" placeholder="e.g. 20" value={examFormData.questions_per_attempt} onChange={e => setExamFormData(p => ({ ...p, questions_per_attempt: e.target.value }))} className="rounded-xl" />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs font-semibold text-[#0B2A5B] mb-1 block">Marks per Question *</label>
                              <Input type="number" required min="0.5" step="0.5" value={examFormData.marks_per_question} onChange={e => setExamFormData(p => ({ ...p, marks_per_question: parseFloat(e.target.value) || 1 }))} className="rounded-xl" />
                            </div>
                            <div>
                              <label className="text-xs font-semibold text-[#0B2A5B] mb-1 block">Negative Marking (per wrong)</label>
                              <Input type="number" min="0" step="0.25" value={examFormData.negative_marks} onChange={e => setExamFormData(p => ({ ...p, negative_marks: parseFloat(e.target.value) || 0 }))} className="rounded-xl" />
                            </div>
                          </div>

                          {/* Marking Scheme Preview */}
                          <div className="bg-[#0B2A5B]/5 p-3 rounded-xl text-xs space-y-1">
                            <p className="font-bold text-[#0B2A5B] text-[10px] uppercase tracking-wider mb-2">Marking Scheme Preview</p>
                            <div className="flex items-center gap-2">
                              <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold text-[10px] uppercase">✓ Correct</span>
                              <span className="text-[#0B2A5B] font-medium">+{examFormData.marks_per_question} mark{examFormData.marks_per_question !== 1 ? 's' : ''}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded font-bold text-[10px] uppercase">✗ Wrong</span>
                              <span className="text-[#0B2A5B] font-medium">{examFormData.negative_marks > 0 ? `−${examFormData.negative_marks} mark${examFormData.negative_marks !== 1 ? 's' : ''} deducted` : 'No penalty'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-bold text-[10px] uppercase">○ Skipped</span>
                              <span className="text-[#0B2A5B] font-medium">0 marks</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs font-semibold text-[#0B2A5B] mb-1 block">Max Attempts</label>
                              <Input type="number" min="1" value={examFormData.max_attempts} onChange={e => setExamFormData(p => ({ ...p, max_attempts: Number(e.target.value) }))} className="rounded-xl" />
                            </div>
                            <div>
                              <label className="text-xs font-semibold text-[#0B2A5B] mb-1 block">Reattempt Fee (INR)</label>
                              <Input type="number" min="0" value={examFormData.reattempt_fee} onChange={e => setExamFormData(p => ({ ...p, reattempt_fee: Number(e.target.value) }))} className="rounded-xl" />
                            </div>
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-[#0B2A5B] mb-1 block">Description / Instructions (optional)</label>
                            <Textarea placeholder="Instructions..." value={examFormData.description} onChange={e => setExamFormData(p => ({ ...p, description: e.target.value }))} className="rounded-xl resize-none" rows={2} />
                          </div>
                          <div className="flex justify-end gap-2">
                            <button type="button" onClick={() => setShowExamForm(false)} className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">Cancel</button>
                            <button type="submit" className="px-4 py-1.5 text-xs font-black rounded-lg bg-[#0B2A5B] text-white hover:bg-[#1a3d7a]">Save Exam</button>
                          </div>
                        </form>
                      )}

                      {customizerExams.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
                          <GraduationCap size={28} className="text-gray-200 mx-auto mb-3" />
                          <p className="text-gray-400 text-sm">No course exams created yet.</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {customizerExams.map(exam => (
                            <div key={exam.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-[#0B2A5B]/20 transition-all">
                              <div className="space-y-1">
                                <h4 className="font-bold text-[#0B2A5B] text-sm">{exam.title}</h4>
                                {exam.description && <p className="text-xs text-gray-400 line-clamp-1">{exam.description}</p>}
                                <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-gray-400 mt-1">
                                  <span>⏱️ {exam.duration_minutes} mins</span>
                                  <span>🎯 Pass score: {exam.passing_score}%</span>
                                  <span>🔄 Max attempts: {exam.max_attempts}</span>
                                  <span>💳 Reattempt fee: ₹{exam.reattempt_fee}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                                <button
                                  onClick={() => {
                                    setEditingExamId(exam.id);
                                    setExamFormData({
                                      title: exam.title,
                                      description: exam.description || "",
                                      duration_minutes: exam.duration_minutes || 60,
                                      passing_score: exam.passing_score || 60,
                                      max_attempts: exam.max_attempts || 3,
                                      reattempt_fee: exam.reattempt_fee || 500,
                                      questions_per_attempt: exam.questions_per_attempt ? exam.questions_per_attempt.toString() : "",
                                      marks_per_question: exam.marks_per_question || 1,
                                      negative_marks: exam.negative_marks || 0
                                    });
                                    setShowExamForm(true);
                                  }}
                                  className="w-8 h-8 flex items-center justify-center rounded-lg text-[#0B2A5B]/40 hover:text-[#0B2A5B] hover:bg-[#0B2A5B]/5 transition-all"
                                >
                                  <Edit size={13} />
                                </button>
                                <button
                                  onClick={() => handleDeleteExam(exam.id)}
                                  className="w-8 h-8 flex items-center justify-center rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-all"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end bg-white">
              <button onClick={()=>setShowCustomizer(false)} className="px-6 py-2.5 text-sm font-black rounded-xl bg-[#0B2A5B] text-white hover:bg-[#1a3d7a] transition-all shadow-md">Done &amp; Close</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
