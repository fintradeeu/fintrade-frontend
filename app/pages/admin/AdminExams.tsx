import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import DashboardLayout from "../../components/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Plus, Edit, Eye, Clock, FileText, BookOpen, Hash, Loader2, CheckCircle, XCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import api from "../../services/api";

export default function AdminExams() {
  const navigate = useNavigate();
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<any[]>([]);
  const [courseMap, setCourseMap] = useState<Record<number, string>>({});
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    type: "entrance",
    course_id: "",
    duration_minutes: 60,
    passing_score: 60,
    questions_per_attempt: "",
    marks_per_question: 1,
    negative_marks: 0,
  });

  // Preview state
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewExam, setPreviewExam] = useState<any>(null);
  const [previewQuestions, setPreviewQuestions] = useState<any[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);

  const handlePreview = async (exam: any) => {
    setPreviewExam(exam);
    setPreviewOpen(true);
    setPreviewLoading(true);
    try {
      const isCourse = exam.type !== "entrance";
      const res = await api.get(`/admin/exams/questions-list?exam_id=${exam.id}&is_course=${isCourse}`);
      setPreviewQuestions(res.data);
    } catch (err) {
      setPreviewQuestions([]);
    } finally {
      setPreviewLoading(false);
    }
  };

  const fetchExams = () => {
    api.get("/admin/exams/all")
      .then((res) => {
        const allExams = [
          ...(res.data.entrance_exams || []),
          ...(res.data.course_exams || [])
        ];
        setExams(allExams);
      })
      .catch((err) => console.error("Error fetching exams:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchExams();
    api.get("/admin/courses")
      .then(res => {
        setCourses(res.data);
        const map: Record<number, string> = {};
        res.data.forEach((c: any) => { map[c.id] = c.title; });
        setCourseMap(map);
      })
      .catch(err => console.error("Error fetching courses:", err));
  }, []);

  const handleCreate = async () => {
    try {
      if (!formData.title || !formData.course_id) {
        toast.warning("Please fill in title and course");
        return;
      }
      
      const payload: any = {
        title: formData.title,
        course_id: parseInt(formData.course_id),
        duration_minutes: formData.duration_minutes,
        passing_score: formData.passing_score,
        marks_per_question: formData.marks_per_question,
        negative_marks: formData.negative_marks,
      };

      if (formData.questions_per_attempt) {
        payload.questions_per_attempt = parseInt(formData.questions_per_attempt);
      }

      if (formData.type === "entrance") {
        await api.post("/admin/exams/create", payload);
      } else {
        await api.post("/admin/exams/course-create", {
          ...payload,
          exam_type: formData.type
        });
      }
      
      toast.success("Exam created successfully!");
      setIsModalOpen(false);
      setFormData({ title: "", type: "entrance", course_id: "", duration_minutes: 60, passing_score: 60, questions_per_attempt: "", marks_per_question: 1, negative_marks: 0 });
      setLoading(true);
      fetchExams();
    } catch (err: any) {
      toast.error("Failed to create exam: " + (err.response?.data?.detail || err.message));
    }
  };

  const getTypeBadge = (type: string) => {
    const styles: Record<string, string> = {
      entrance: "bg-indigo-100 text-indigo-700",
      course_final: "bg-blue-100 text-blue-700",
      monthly: "bg-purple-100 text-purple-700",
      module_final: "bg-teal-100 text-teal-700",
    };
    const labels: Record<string, string> = {
      entrance: "Entrance",
      course_final: "Course Final",
      monthly: "Monthly",
      module_final: "Module Final",
    };
    return (
      <Badge className={styles[type] || "bg-gray-100 text-gray-700"}>
        {labels[type] || type}
      </Badge>
    );
  };

  return (
    <DashboardLayout role="admin">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#0B2A5B] mb-2">Exam Management</h1>
            <p className="text-[#0B2A5B]/70">Create and manage student assessments</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="bg-[#0B2A5B] text-[#F4F1EA] hover:bg-[#1a3d7a]">
            <Plus size={16} className="mr-2" />
            Create New Exam
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-[#0B2A5B]/60">Loading exams...</div>
      ) : exams.length === 0 ? (
        <Card className="p-8 bg-white shadow-lg text-center">
          <p className="text-[#0B2A5B]/60 mb-4">No exams found. Create one to get started.</p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((exam) => (
            <Card key={`${exam.type}-${exam.id}`} className="p-6 bg-white shadow-lg flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-[#0B2A5B] line-clamp-2 flex-1 mr-2">{exam.title}</h3>
                <Badge className={exam.is_active ? "bg-green-100 text-green-700 flex-shrink-0" : "bg-gray-100 text-gray-700 flex-shrink-0"}>
                  {exam.is_active ? "Active" : "Draft"}
                </Badge>
              </div>

              {/* Course name */}
              {exam.course_id && (
                <div className="flex items-center gap-1.5 text-sm text-[#C2A86A] font-medium mb-3">
                  <BookOpen size={14} />
                  <span className="truncate">{courseMap[exam.course_id] || `Course #${exam.course_id}`}</span>
                </div>
              )}

              <div className="space-y-2 text-sm text-[#0B2A5B]/70 mb-6 flex-1">
                <div className="flex items-center gap-2">
                  <FileText size={14} className="text-[#C2A86A]" />
                  <p>Questions in pool: {exam.questions_count}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-[#C2A86A]" />
                  <p>Duration: {exam.duration_minutes} min</p>
                </div>
                <div className="flex items-center gap-2">
                  {getTypeBadge(exam.type)}
                </div>
                {exam.is_active && (
                  <p className="mt-2 text-green-600 font-semibold">Passing: {exam.passing_score}%</p>
                )}
              </div>
              <div className="flex gap-2 mt-auto">
                <Button 
                  size="sm" 
                  className="flex-1 bg-[#C2A86A] hover:bg-[#C2A86A]/90 text-[#0B2A5B]"
                  onClick={() => navigate(`/admin/exams/${exam.id}/questions?type=${exam.type}`)}
                >
                  <Edit size={14} className="mr-2" />
                  Manage Questions
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1 border-[#0B2A5B]/20"
                  onClick={() => handlePreview(exam)}
                >
                  <Eye size={14} className="mr-2" />
                  Preview
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Exam Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Create New Exam</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Title</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Month 1 Final"
              />
            </div>
            <div className="grid gap-2">
              <Label>Exam Type</Label>
              <select
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="entrance">Entrance Exam</option>
                <option value="course_final">Course Final</option>
                <option value="monthly">Monthly Assessment</option>
                <option value="module_final">Module Final</option>
              </select>
            </div>
            <div className="grid gap-2">
              <Label>Course</Label>
              <select
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.course_id}
                onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
              >
                <option value="">Select a Course</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Duration (min)</Label>
                <Input
                  type="number"
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Passing %</Label>
                <Input
                  type="number"
                  value={formData.passing_score}
                  onChange={(e) => setFormData({ ...formData, passing_score: parseInt(e.target.value) })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label className="flex items-center gap-2">
                <Hash size={14} />
                Questions Per Attempt
                <span className="text-xs text-gray-400 font-normal">(leave blank for all)</span>
              </Label>
              <Input
                type="number"
                min="1"
                placeholder="e.g. 20 — random subset from pool"
                value={formData.questions_per_attempt}
                onChange={(e) => setFormData({ ...formData, questions_per_attempt: e.target.value })}
              />
              <p className="text-xs text-gray-500">
                If set, each student gets a random selection of N questions from the full pool.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Marks per Question</Label>
                <Input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={formData.marks_per_question}
                  onChange={(e) => setFormData({ ...formData, marks_per_question: parseFloat(e.target.value) || 1 })}
                />
              </div>
              <div className="grid gap-2">
                <Label className="flex items-center gap-1">
                  Negative Marking
                  <span className="text-xs text-gray-400 font-normal">(per wrong)</span>
                </Label>
                <Input
                  type="number"
                  min="0"
                  step="0.25"
                  value={formData.negative_marks}
                  onChange={(e) => setFormData({ ...formData, negative_marks: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
            {/* Marking Scheme Preview */}
            <div className="bg-[#0B2A5B]/5 p-3 rounded-lg text-sm space-y-1">
              <p className="font-semibold text-[#0B2A5B] text-xs uppercase tracking-wider mb-2">Marking Scheme Preview</p>
              <div className="flex items-center gap-2">
                <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded font-semibold text-xs">✓ Correct</span>
                <span className="text-[#0B2A5B]">+{formData.marks_per_question} mark{formData.marks_per_question !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded font-semibold text-xs">✗ Wrong</span>
                <span className="text-[#0B2A5B]">{formData.negative_marks > 0 ? `−${formData.negative_marks} mark${formData.negative_marks !== 1 ? 's' : ''} deducted` : 'No penalty'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-semibold text-xs">○ Skipped</span>
                <span className="text-[#0B2A5B]">0 marks</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} className="bg-[#0B2A5B] text-[#F4F1EA] hover:bg-[#1a3d7a]">
              Create Exam
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Modal */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Preview: {previewExam?.title}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-4 py-2 pr-2">
            {previewLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-[#0B2A5B]" size={32} />
              </div>
            ) : previewQuestions.length === 0 ? (
              <p className="text-center text-[#0B2A5B]/60 py-8">No questions found. Add questions via Manage Questions.</p>
            ) : (
              previewQuestions.map((q: any, i: number) => (
                <div key={q.id} className="p-4 border rounded-lg bg-gray-50">
                  <div className="flex items-start gap-3 mb-3">
                    <span className="bg-[#0B2A5B] text-white w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
                    <div className="flex-1">
                      <p className="font-medium text-[#0B2A5B]">{q.question_text}</p>
                      <div className="flex gap-2 mt-1">
                        <Badge className="bg-gray-200 text-gray-600 text-xs">{q.question_type}</Badge>
                        <span className="text-xs text-[#0B2A5B]/50">{q.marks} mark{q.marks !== 1 ? 's' : ''}</span>
                        {q.negative_marks > 0 && <span className="text-xs text-red-500">-{q.negative_marks}</span>}
                      </div>
                    </div>
                  </div>
                  {q.options && q.options.length > 0 && (
                    <div className="ml-10 space-y-1.5">
                      {q.options.map((opt: any, j: number) => (
                        <div key={j} className={`flex items-center gap-2 text-sm p-2 rounded ${opt.is_correct ? 'bg-green-50 border border-green-200' : 'bg-white border border-gray-100'}`}>
                          {opt.is_correct ? <CheckCircle size={14} className="text-green-600 flex-shrink-0" /> : <XCircle size={14} className="text-gray-300 flex-shrink-0" />}
                          <span className={opt.is_correct ? 'text-green-800 font-medium' : 'text-gray-700'}>{opt.option_text}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {q.explanation && (
                    <p className="ml-10 mt-2 text-xs text-blue-700 bg-blue-50 p-2 rounded">💡 {q.explanation}</p>
                  )}
                </div>
              ))
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}


