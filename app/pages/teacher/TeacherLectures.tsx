import { useState, useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Users, Video, Play, Upload, Calendar, Clock, Plus, X } from "lucide-react";
import api from "../../services/api";

export default function TeacherLectures() {
  const [lectures, setLectures] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newLecture, setNewLecture] = useState({
    title: "", description: "", course_id: 0,
    scheduled_at: "", duration_minutes: 60,
    meeting_link: "", max_participants: 100,
  });

  useEffect(() => {
    Promise.all([
      api.get("/lectures").then((r) => setLectures(r.data)),
      api.get("/admin/courses").then((r) => setCourses(r.data)),
    ]).catch(console.error).finally(() => setLoading(false));
  }, []);

  const now = new Date();
  const upcoming = lectures.filter((l) => new Date(l.scheduled_at) > now || l.is_live);
  const past = lectures.filter((l) => new Date(l.scheduled_at) <= now && !l.is_live);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      await api.post("/admin/lectures", {
        ...newLecture,
        scheduled_at: new Date(newLecture.scheduled_at).toISOString(),
        meeting_link: newLecture.meeting_link || undefined,
      });
      setShowAddModal(false);
      setNewLecture({ title: "", description: "", course_id: 0, scheduled_at: "", duration_minutes: 60, meeting_link: "", max_participants: 100 });
      const res = await api.get("/lectures"); setLectures(res.data);
    } catch (err: any) { alert("Error: " + (err.response?.data?.detail || err.message)); }
    finally { setSaving(false); }
  };

  return (
    <DashboardLayout role="teacher">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#0B2A5B] mb-2">My Lectures</h1>
          <p className="text-[#0B2A5B]/70">Schedule and manage your live lectures</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="bg-[#0B2A5B] text-[#F4F1EA] hover:bg-[#1a3d7a]">
          <Plus size={16} className="mr-2" />Schedule Lecture
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <Card className="p-6 bg-gradient-to-r from-[#0B2A5B] to-[#1a3d7a] text-[#F4F1EA] shadow-xl">
          <h3 className="text-xl font-semibold mb-4">Start Live Lecture</h3>
          <p className="text-[#F4F1EA]/80 mb-6">Begin a live lecture session for your students</p>
          <Button className="bg-[#C2A86A] text-[#0B2A5B] hover:bg-[#d4bd8a] shadow-lg" size="lg"><Play size={20} className="mr-2" />Start Live Session</Button>
        </Card>
        <Card className="p-6 bg-white shadow-lg">
          <h3 className="text-xl font-semibold text-[#0B2A5B] mb-4">Upload Notes</h3>
          <p className="text-[#0B2A5B]/70 mb-6">Share study materials with your students</p>
          <Button variant="outline" className="border-2 border-[#0B2A5B] text-[#0B2A5B]" size="lg"><Upload size={20} className="mr-2" />Upload Resources</Button>
        </Card>
      </div>

      {/* Upcoming */}
      <Card className="p-6 bg-white shadow-lg mb-6">
        <h3 className="text-xl font-semibold text-[#0B2A5B] mb-6">Upcoming Lectures ({upcoming.length})</h3>
        {upcoming.length === 0 ? (
          <p className="text-[#0B2A5B]/60 text-center py-4">No upcoming lectures scheduled.</p>
        ) : (
          <div className="space-y-4">
            {upcoming.map((l) => (
              <div key={l.id} className="p-4 bg-[#F4F1EA] rounded-lg flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-[#0B2A5B] mb-2">{l.title}</h4>
                  <div className="flex items-center gap-4 text-sm text-[#0B2A5B]/70">
                    <span className="flex items-center gap-1"><Calendar size={14} />{new Date(l.scheduled_at).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><Clock size={14} />{new Date(l.scheduled_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                    <span className="flex items-center gap-1"><Users size={14} />{l.max_participants} max</span>
                    <span>{l.duration_minutes} min</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {l.meeting_link && <a href={l.meeting_link} target="_blank" rel="noreferrer"><Button size="sm" className="bg-green-600 text-white hover:bg-green-700"><Play size={14} className="mr-1" />Join</Button></a>}
                  {l.is_live && <Badge className="bg-red-100 text-red-700 animate-pulse">LIVE</Badge>}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Past */}
      <Card className="p-6 bg-white shadow-lg">
        <h3 className="text-xl font-semibold text-[#0B2A5B] mb-6">Past Lectures ({past.length})</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {past.slice(0, 6).map((l) => (
            <div key={l.id} className="p-4 bg-[#F4F1EA] rounded-lg">
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-semibold text-[#0B2A5B]">{l.title}</h4>
                <Badge className="bg-green-100 text-green-700">Completed</Badge>
              </div>
              <div className="space-y-1 text-sm text-[#0B2A5B]/70">
                <div className="flex items-center gap-2"><Calendar size={14} /><span>{new Date(l.scheduled_at).toLocaleDateString()}</span></div>
                <span>{l.duration_minutes} min</span>
              </div>
              {l.recordings?.length > 0 && (
                <Button size="sm" variant="outline" className="w-full mt-3 border-[#0B2A5B]/20 text-[#0B2A5B]"><Video size={14} className="mr-2" />View Recording</Button>
              )}
            </div>
          ))}
        </div>
        {past.length === 0 && <p className="text-[#0B2A5B]/60 text-center py-4">No past lectures.</p>}
      </Card>

      {/* Schedule Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg p-6 bg-white shadow-xl relative">
            <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-black"><X size={20} /></button>
            <h2 className="text-2xl font-bold text-[#0B2A5B] mb-4">Schedule New Lecture</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div><label className="text-sm font-medium text-[#0B2A5B]">Title *</label><Input required value={newLecture.title} onChange={(e) => setNewLecture({ ...newLecture, title: e.target.value })} className="bg-[#F4F1EA]" /></div>
              <div><label className="text-sm font-medium text-[#0B2A5B]">Description</label><textarea className="w-full p-2 border rounded mt-1 bg-[#F4F1EA]" rows={2} value={newLecture.description} onChange={(e) => setNewLecture({ ...newLecture, description: e.target.value })} /></div>
              <div>
                <label className="text-sm font-medium text-[#0B2A5B]">Course *</label>
                <select required className="w-full p-2 border rounded mt-1 bg-[#F4F1EA]" value={newLecture.course_id} onChange={(e) => setNewLecture({ ...newLecture, course_id: parseInt(e.target.value) })}>
                  <option value={0} disabled>Select a course</option>
                  {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm font-medium text-[#0B2A5B]">Date & Time *</label><Input required type="datetime-local" value={newLecture.scheduled_at} onChange={(e) => setNewLecture({ ...newLecture, scheduled_at: e.target.value })} className="bg-[#F4F1EA]" /></div>
                <div><label className="text-sm font-medium text-[#0B2A5B]">Duration (min)</label><Input type="number" min="15" value={newLecture.duration_minutes} onChange={(e) => setNewLecture({ ...newLecture, duration_minutes: parseInt(e.target.value) })} className="bg-[#F4F1EA]" /></div>
              </div>
              <div><label className="text-sm font-medium text-[#0B2A5B]">Meeting Link</label><Input type="url" placeholder="https://zoom.us/..." value={newLecture.meeting_link} onChange={(e) => setNewLecture({ ...newLecture, meeting_link: e.target.value })} className="bg-[#F4F1EA]" /></div>
              <div><label className="text-sm font-medium text-[#0B2A5B]">Max Participants</label><Input type="number" min="1" value={newLecture.max_participants} onChange={(e) => setNewLecture({ ...newLecture, max_participants: parseInt(e.target.value) })} className="bg-[#F4F1EA]" /></div>
              <Button type="submit" disabled={saving || !newLecture.course_id} className="w-full bg-[#0B2A5B] text-white hover:bg-[#1a3d7a]">{saving ? "Scheduling..." : "Schedule Lecture"}</Button>
            </form>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}
