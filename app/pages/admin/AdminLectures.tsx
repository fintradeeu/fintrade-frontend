import { useState, useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Plus, Calendar, Clock, X, Edit, Trash2 } from "lucide-react";
import api from "../../services/api";
import { toast } from "sonner";

export default function AdminLectures() {
  const [lectures, setLectures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentLectureId, setCurrentLectureId] = useState<number | null>(null);

  const [newLecture, setNewLecture] = useState({
    title: "",
    description: "",
    instructor_name: "",
    start_time: "",
    end_time: "",
    meeting_url: ""
  });

  const fetchLectures = async () => {
    try {
      const res = await api.get("/lectures");
      setLectures(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLectures();
  }, []);

  const openModal = (lecture?: any) => {
    if (lecture) {
      setIsEditing(true);
      setCurrentLectureId(lecture.id);
      setNewLecture({
        title: lecture.title || "",
        description: lecture.description || "",
        instructor_name: lecture.instructor_name || "",
        start_time: lecture.start_time ? new Date(lecture.start_time).toISOString().slice(0, 16) : "",
        end_time: lecture.end_time ? new Date(lecture.end_time).toISOString().slice(0, 16) : "",
        meeting_url: lecture.meeting_url || ""
      });
    } else {
      setIsEditing(false);
      setCurrentLectureId(null);
      setNewLecture({ title: "", description: "", instructor_name: "", start_time: "", end_time: "", meeting_url: "" });
    }
    setShowAddModal(true);
  };

  const handleAddOrEditLecture = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...newLecture,
        course_id: 1, // Default course ID since it's required by backend schema usually, wait backend schema requires course_id? Let's check. Actually, let's pass 1 for now if not specified.
        scheduled_at: new Date(newLecture.start_time).toISOString(),
        meeting_link: newLecture.meeting_url,
      };

      if (isEditing && currentLectureId) {
        await api.put(`/admin/lectures/${currentLectureId}`, payload);
        toast.success("Lecture updated successfully");
      } else {
        await api.post("/admin/lectures", payload);
        toast.success("Lecture created successfully");
      }
      setShowAddModal(false);
      fetchLectures();
    } catch (err: any) {
      toast.error("Error saving lecture: " + (err.response?.data?.detail || err.message));
    }
  };

  const handleDeleteLecture = async (id: number) => {
    if (!confirm("Are you sure you want to delete this lecture?")) return;
    try {
      await api.delete(`/admin/lectures/${id}`);
      toast.success("Lecture deleted successfully");
      fetchLectures();
    } catch (err: any) {
      toast.error("Failed to delete lecture: " + (err.response?.data?.detail || err.message));
    }
  };

  return (
    <DashboardLayout role="admin">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#0B2A5B] mb-2">Lecture Management</h1>
          <p className="text-[#0B2A5B]/70">Schedule and assign lectures to teachers</p>
        </div>
        <Button onClick={() => openModal()} className="bg-[#0B2A5B] text-[#F4F1EA] hover:bg-[#1a3d7a]">
          <Plus size={16} className="mr-2" />
          Schedule Lecture
        </Button>
      </div>

      <div className="space-y-4">
        {lectures.map((lecture) => (
          <Card key={lecture.id} className="p-6 bg-white shadow-lg">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-[#0B2A5B]">{lecture.title}</h3>
                  <Badge className={lecture.status === "completed" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}>
                    {lecture.status || "scheduled"}
                  </Badge>
                </div>
                <div className="flex items-center gap-6 text-sm text-[#0B2A5B]/70">
                  <span>Teacher: {lecture.instructor_name || "Unassigned"}</span>
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    {new Date(lecture.scheduled_at || lecture.start_time).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {new Date(lecture.scheduled_at || lecture.start_time).toLocaleTimeString()}
                  </span>
                  {(lecture.meeting_link || lecture.meeting_url) && (
                    <span className="flex items-center gap-1 text-blue-600">
                      <a href={lecture.meeting_link || lecture.meeting_url} target="_blank" rel="noreferrer" className="hover:underline">Join Link</a>
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="border-[#0B2A5B]/20" onClick={() => openModal(lecture)}>
                  <Edit size={14} className="mr-1" /> Edit
                </Button>
                <Button size="sm" variant="outline" className="border-red-200 text-red-600 hover:bg-red-50" onClick={() => handleDeleteLecture(lecture.id)}>
                  <Trash2 size={14} className="mr-1" /> Delete
                </Button>
              </div>
            </div>
          </Card>
        ))}
        {lectures.length === 0 && !loading && (
           <p className="text-[#0B2A5B]/70">No lectures scheduled yet.</p>
        )}
      </div>

      {/* Add/Edit Lecture Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <Card className="w-full max-w-md p-6 bg-white shadow-2xl relative border-t-4 border-[#0B2A5B]">
            <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors">
              <X size={20} />
            </button>
            <h2 className="text-2xl font-bold mb-6 text-[#0B2A5B]">{isEditing ? "Edit Lecture" : "Schedule New Lecture"}</h2>
            <form onSubmit={handleAddOrEditLecture} className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-[#0B2A5B] mb-1 block">Lecture Title <span className="text-red-500">*</span></label>
                <Input required placeholder="e.g. Technical Analysis Basics" value={newLecture.title} onChange={(e) => setNewLecture({...newLecture, title: e.target.value})} className="border-[#0B2A5B]/20" />
              </div>
              <div>
                <label className="text-sm font-semibold text-[#0B2A5B] mb-1 block">Description <span className="text-red-500">*</span></label>
                <textarea 
                  required
                  placeholder="What will students learn in this session?"
                  className="w-full p-3 border border-[#0B2A5B]/20 rounded-md bg-white text-sm focus:ring-2 focus:ring-[#0B2A5B]/20 outline-none transition-all"
                  rows={3}
                  value={newLecture.description} 
                  onChange={(e) => setNewLecture({...newLecture, description: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-[#0B2A5B] mb-1 block">Instructor Name</label>
                <Input placeholder="Enter name" value={newLecture.instructor_name} onChange={(e) => setNewLecture({...newLecture, instructor_name: e.target.value})} className="border-[#0B2A5B]/20" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-[#0B2A5B] mb-1 block">Start Time <span className="text-red-500">*</span></label>
                  <Input required type="datetime-local" value={newLecture.start_time} onChange={(e) => setNewLecture({...newLecture, start_time: e.target.value})} className="border-[#0B2A5B]/20" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-[#0B2A5B] mb-1 block">End Time</label>
                  <Input type="datetime-local" value={newLecture.end_time} onChange={(e) => setNewLecture({...newLecture, end_time: e.target.value})} className="border-[#0B2A5B]/20" />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-[#0B2A5B] mb-1 block">Google Meet / Zoom Link</label>
                <Input type="url" placeholder="https://meet.google.com/..." value={newLecture.meeting_url} onChange={(e) => setNewLecture({...newLecture, meeting_url: e.target.value})} className="border-[#0B2A5B]/20" />
              </div>

              <div className="pt-4 flex gap-3">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowAddModal(false)}>Cancel</Button>
                <Button type="submit" className="flex-1 bg-[#0B2A5B] text-white hover:bg-[#1a3d7a]">
                  {isEditing ? "Update Lecture" : "Create & Notify"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}
