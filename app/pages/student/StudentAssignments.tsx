import { useState, useEffect } from "react";
import { toast } from "sonner";
import DashboardLayout from "../../components/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { FileText, Upload, Calendar, CheckCircle, Clock } from "lucide-react";
import api from "../../services/api";

export default function StudentAssignments() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingId, setUploadingId] = useState<number | null>(null);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      // In a real app, we fetch enrolled courses and their assignments.
      // For MVP, we'll fetch from a dedicated endpoint or simulate it.
      const enrolledRes = await api.get("/courses/enrolled");
      const enrolledCourses = enrolledRes.data;
      
      const allAssignments: any[] = [];
      for (const enrollment of enrolledCourses) {
        try {
          const aRes = await api.get(`/courses/${enrollment.course_id}/assignments`);
          allAssignments.push(...aRes.data);
        } catch (e) {
          console.error(e);
        }
      }
      setAssignments(allAssignments);

      const subRes = await api.get("/courses/assignments/my-submissions");
      setSubmissions(subRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async (assignmentId: number) => {
    if (!selectedFile) {
      toast.warning("Please select a file to upload");
      return;
    }

    setUploadingId(assignmentId);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      
      // Upload file to get URL
      const uploadRes = await api.post("/courses/assignments/upload", formData, {
        headers: { "Content-Type": undefined }
      });
      
      const fileUrl = uploadRes.data.url;

      // Submit assignment
      await api.post("/courses/assignments/submit", {
        assignment_id: assignmentId,
        file_url: fileUrl
      });
      
      toast.success("Assignment submitted successfully!");
      setSelectedFile(null);
      fetchAssignments();
    } catch (err: any) {
      toast.error("Failed to submit assignment: " + (err.response?.data?.detail || err.message));
    } finally {
      setUploadingId(null);
    }
  };

  return (
    <DashboardLayout role="student">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0B2A5B] mb-2">My Assignments</h1>
        <p className="text-[#0B2A5B]/70">Complete and submit your course assignments</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-[#0B2A5B]/60">Loading assignments...</div>
      ) : assignments.length === 0 ? (
        <Card className="p-12 text-center bg-white shadow-lg">
          <FileText size={48} className="mx-auto text-[#0B2A5B]/20 mb-4" />
          <h3 className="text-xl font-medium text-[#0B2A5B] mb-2">No Assignments Pending</h3>
          <p className="text-[#0B2A5B]/60">You don't have any active assignments at the moment.</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {assignments.map((assignment) => (
            <Card key={assignment.id} className="p-6 bg-white shadow-md flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-semibold text-[#0B2A5B]">{assignment.title}</h3>
                  <span className="px-2 py-1 text-xs font-medium bg-[#0B2A5B]/10 text-[#0B2A5B] rounded-full">
                    {assignment.max_score} Points
                  </span>
                </div>
                <p className="text-gray-600 mb-4 whitespace-pre-wrap">{assignment.description}</p>
                <div className="flex items-center gap-4 text-sm font-medium text-[#C2A86A] mb-4">
                  <span className="flex items-center gap-1">
                    <Calendar size={16} /> Due: {new Date(assignment.due_date).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={16} /> {new Date(assignment.due_date) < new Date() ? "Overdue" : "Active"}
                  </span>
                </div>

                {assignment.resources && assignment.resources.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-[#0B2A5B] mb-2 uppercase tracking-wide">Resources</h4>
                    <div className="flex flex-col gap-2">
                      {assignment.resources.map((res: any, idx: number) => (
                        <a key={idx} href={res.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-[#C2A86A] hover:underline bg-[#C2A86A]/10 w-fit px-3 py-2 rounded-md">
                          <FileText size={14} />
                          {res.name || `Resource ${idx + 1}`} ({res.type || 'File'})
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {submissions.filter(s => s.assignment_id === assignment.id).length > 0 && (
                  <div className="mt-6 border-t pt-4">
                    <h4 className="text-sm font-semibold text-[#0B2A5B] mb-3 uppercase tracking-wide">Your Submissions</h4>
                    <div className="space-y-3">
                      {submissions.filter(s => s.assignment_id === assignment.id).map(sub => (
                        <div key={sub.id} className="bg-gray-50 p-3 rounded-lg border flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                          <div>
                            <p className="text-sm font-medium text-gray-800">
                              Submitted: {new Date(sub.submitted_at).toLocaleString()}
                              <span className={`ml-2 text-xs font-semibold px-2 py-0.5 rounded-full ${new Date(sub.submitted_at) > new Date(assignment.due_date) ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                {new Date(sub.submitted_at) > new Date(assignment.due_date) ? 'Late' : 'On Time'}
                              </span>
                            </p>
                            <a href={sub.file_url} target="_blank" rel="noopener noreferrer" className="text-[#C2A86A] text-xs hover:underline flex items-center gap-1 mt-1">
                              <FileText size={12} /> View Submission
                            </a>
                          </div>
                          <div className="text-right">
                            {sub.score !== null ? (
                              <div>
                                <span className="inline-block px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold mb-1">
                                  Grade: {sub.score} / {assignment.max_score}
                                </span>
                                {sub.teacher_feedback && <p className="text-xs text-gray-500 max-w-[200px] truncate" title={sub.teacher_feedback}>"{sub.teacher_feedback}"</p>}
                              </div>
                            ) : (
                              <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">Pending Grade</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="w-full md:w-80 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <h4 className="font-semibold text-[#0B2A5B] mb-3 text-sm uppercase tracking-wide">Submit Work</h4>
                <div className="space-y-3">
                  <Input type="file" onChange={handleFileChange} className="bg-white" />
                  <Button 
                    className="w-full bg-[#0B2A5B] text-white hover:bg-[#1a3d7a]"
                    onClick={() => handleUpload(assignment.id)}
                    disabled={uploadingId === assignment.id || !selectedFile}
                  >
                    {uploadingId === assignment.id ? "Uploading..." : (
                      <><Upload size={16} className="mr-2" /> Submit Assignment</>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
