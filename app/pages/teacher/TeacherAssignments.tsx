import { useState, useEffect } from "react";
import { toast } from "sonner";
import DashboardLayout from "../../components/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { FileText, Plus, Users, Calendar, CheckCircle } from "lucide-react";
import api from "../../services/api";

export default function TeacherAssignments() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  
  // Submissions Modal State
  const [selectedAssignment, setSelectedAssignment] = useState<any | null>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [gradingSubmission, setGradingSubmission] = useState<any | null>(null);
  const [gradeScore, setGradeScore] = useState("");
  const [gradeFeedback, setGradeFeedback] = useState("");

  // New assignment form state
  const [courseId, setCourseId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [maxScore, setMaxScore] = useState("100");
  const [resourceFiles, setResourceFiles] = useState<File[]>([]);
  const [isUploadingResources, setIsUploadingResources] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const coursesRes = await api.get("/admin/courses");
      setCourses(coursesRes.data);
      
      // In a real app we'd fetch all assignments for the teacher's courses
      // For MVP we just show a placeholder list or fetch sequentially
      const allAssignments: any[] = [];
      for (const c of coursesRes.data) {
        const aRes = await api.get(`/courses/${c.id}/assignments`);
        allAssignments.push(...aRes.data);
      }
      setAssignments(allAssignments);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssignment = async () => {
    setIsUploadingResources(true);
    try {
      const uploadedResources = [];
      for (const file of resourceFiles) {
        const formData = new FormData();
        formData.append("file", file);
        const uploadRes = await api.post("/courses/assignments/upload", formData, {
          headers: { "Content-Type": undefined }
        });
        uploadedResources.push({
          name: uploadRes.data.original_name,
          url: uploadRes.data.url,
          type: uploadRes.data.content_type
        });
      }

      await api.post("/admin/assignments", {
        course_id: parseInt(courseId),
        title,
        description,
        due_date: new Date(dueDate).toISOString(),
        max_score: parseFloat(maxScore),
        resources: uploadedResources
      });
      toast.success("Assignment created successfully");
      setIsCreating(false);
      setResourceFiles([]);
      fetchInitialData();
    } catch (err: any) {
      toast.error("Failed to create assignment: " + (err.response?.data?.detail || err.message));
    } finally {
      setIsUploadingResources(false);
    }
  };

  const handleViewSubmissions = async (assignment: any) => {
    setSelectedAssignment(assignment);
    setLoadingSubmissions(true);
    try {
      const res = await api.get(`/admin/assignments/${assignment.id}/submissions`);
      setSubmissions(res.data);
    } catch (err: any) {
      toast.error("Failed to load submissions");
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const handleSubmitGrade = async () => {
    if (!gradingSubmission) return;
    try {
      await api.post("/admin/assignments/grade", null, {
        params: {
          submission_id: gradingSubmission.id,
          score: parseFloat(gradeScore),
          feedback: gradeFeedback
        }
      });
      toast.success("Grade submitted successfully");
      setGradingSubmission(null);
      // Refresh submissions
      handleViewSubmissions(selectedAssignment);
    } catch (err: any) {
      toast.error("Failed to submit grade: " + (err.response?.data?.detail || err.message));
    }
  };

  return (
    <DashboardLayout role="teacher">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#0B2A5B] mb-2">Assignments Management</h1>
          <p className="text-[#0B2A5B]/70">Create and grade student assignments</p>
        </div>
        <Button 
          className="bg-[#C2A86A] hover:bg-[#C2A86A]/90 text-[#0B2A5B] font-medium"
          onClick={() => setIsCreating(!isCreating)}
        >
          {isCreating ? "Cancel" : <><Plus size={18} className="mr-2" /> New Assignment</>}
        </Button>
      </div>

      {isCreating && (
        <Card className="p-6 bg-white shadow-lg mb-8 border-t-4 border-[#C2A86A]">
          <h2 className="text-xl font-semibold text-[#0B2A5B] mb-6">Create New Assignment</h2>
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Select Course</label>
              <Select value={courseId} onValueChange={setCourseId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map(c => (
                    <SelectItem key={c.id} value={c.id.toString()}>{c.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Assignment Title</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Technical Analysis Report" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Due Date</label>
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Max Score</label>
              <Input type="number" value={maxScore} onChange={(e) => setMaxScore(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2 mb-6">
            <label className="text-sm font-medium text-gray-700">Description & Instructions</label>
            <Textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Provide clear instructions for the assignment..." 
              className="h-32"
            />
          </div>
          <div className="space-y-2 mb-6">
            <label className="text-sm font-medium text-gray-700">Resources (Optional)</label>
            <Input 
              type="file" 
              multiple 
              onChange={(e) => setResourceFiles(Array.from(e.target.files || []))} 
            />
            <p className="text-xs text-gray-500">Upload multiple files if needed.</p>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsCreating(false)} disabled={isUploadingResources}>Cancel</Button>
            <Button className="bg-[#0B2A5B] text-white hover:bg-[#1a3d7a]" onClick={handleCreateAssignment} disabled={isUploadingResources}>
              {isUploadingResources ? "Uploading..." : "Create Assignment"}
            </Button>
          </div>
        </Card>
      )}

      {loading ? (
        <div className="text-center py-12 text-[#0B2A5B]/60">Loading assignments...</div>
      ) : assignments.length === 0 ? (
        <Card className="p-12 text-center bg-white border-dashed border-2">
          <FileText size={48} className="mx-auto text-[#0B2A5B]/20 mb-4" />
          <h3 className="text-xl font-medium text-[#0B2A5B] mb-2">No Assignments Yet</h3>
          <p className="text-[#0B2A5B]/60 mb-6">Create your first assignment to start evaluating students.</p>
          <Button className="bg-[#0B2A5B] text-white" onClick={() => setIsCreating(true)}>Create Assignment</Button>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assignments.map((assignment) => (
            <Card key={assignment.id} className="p-6 bg-white shadow flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-[#0B2A5B] line-clamp-2">{assignment.title}</h3>
              </div>
              <p className="text-sm text-gray-500 mb-4 line-clamp-2">{assignment.description}</p>
              
              <div className="space-y-2 text-sm text-[#0B2A5B]/70 mb-6 flex-1">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-[#C2A86A]" />
                  <p>Due: {new Date(assignment.due_date).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-[#C2A86A]" />
                  <p>Max Score: {assignment.max_score}</p>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                className="w-full border-[#0B2A5B]/20 text-[#0B2A5B]"
                onClick={() => handleViewSubmissions(assignment)}
              >
                View Submissions
              </Button>
            </Card>
          ))}
        </div>
      )}

      {/* Submissions Modal */}
      {selectedAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col bg-white overflow-hidden shadow-2xl">
            <div className="p-6 border-b flex justify-between items-center bg-[#0B2A5B] text-white">
              <h2 className="text-xl font-bold">Submissions for: {selectedAssignment.title}</h2>
              <Button variant="ghost" className="text-white hover:bg-white/20" onClick={() => setSelectedAssignment(null)}>Close</Button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              {loadingSubmissions ? (
                <div className="text-center py-12 text-gray-500">Loading submissions...</div>
              ) : submissions.length === 0 ? (
                <div className="text-center py-12 text-gray-500">No submissions yet for this assignment.</div>
              ) : (
                <div className="space-y-4">
                  {submissions.map((sub: any) => (
                    <div key={sub.id} className="border p-4 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <p className="font-semibold text-[#0B2A5B]">Student ID: {sub.user_id}</p>
                        <p className="text-sm text-gray-500">
                          Submitted: {new Date(sub.submitted_at).toLocaleString()}
                          <span className={`ml-2 text-xs font-semibold px-2 py-0.5 rounded-full ${new Date(sub.submitted_at) > new Date(selectedAssignment.due_date) ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                            {new Date(sub.submitted_at) > new Date(selectedAssignment.due_date) ? 'Late' : 'On Time'}
                          </span>
                        </p>
                        <div className="mt-2">
                          <a href={sub.file_url} target="_blank" rel="noopener noreferrer" className="text-[#C2A86A] text-sm hover:underline font-medium flex items-center gap-1">
                            <FileText size={14} /> View Document
                          </a>
                        </div>
                      </div>
                      <div className="text-right">
                        {sub.score !== null ? (
                          <div>
                            <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold mb-1">
                              Score: {sub.score}
                            </span>
                            {sub.feedback && <p className="text-xs text-gray-500 max-w-[200px] truncate" title={sub.feedback}>"{sub.feedback}"</p>}
                            <Button variant="link" size="sm" onClick={() => { setGradingSubmission(sub); setGradeScore(sub.score.toString()); setGradeFeedback(sub.feedback || ""); }} className="text-[#0B2A5B] p-0 h-auto">Update Grade</Button>
                          </div>
                        ) : (
                          <Button 
                            className="bg-[#C2A86A] text-[#0B2A5B] hover:bg-[#C2A86A]/90"
                            onClick={() => { setGradingSubmission(sub); setGradeScore(""); setGradeFeedback(""); }}
                          >
                            Grade Now
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Grading Form Modal */}
      {gradingSubmission && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <Card className="w-full max-w-md bg-white p-6 shadow-2xl border-t-4 border-[#C2A86A]">
            <h3 className="text-xl font-bold text-[#0B2A5B] mb-4">Grade Submission</h3>
            <p className="text-sm text-gray-600 mb-6">Student ID: {gradingSubmission.user_id}</p>
            
            <div className="space-y-4 mb-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Score</label>
                <Input type="number" value={gradeScore} onChange={(e) => setGradeScore(e.target.value)} placeholder="e.g. 95" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Feedback (Optional)</label>
                <Textarea value={gradeFeedback} onChange={(e) => setGradeFeedback(e.target.value)} placeholder="Great job..." rows={4} />
              </div>
            </div>
            
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setGradingSubmission(null)}>Cancel</Button>
              <Button className="bg-[#0B2A5B] text-white hover:bg-[#1a3d7a]" onClick={handleSubmitGrade}>Submit Grade</Button>
            </div>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}
