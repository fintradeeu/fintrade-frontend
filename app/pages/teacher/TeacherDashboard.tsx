import { useState, useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Link } from "react-router";
import { Users, Video, MessageCircle, FileQuestion, Clock, AlertCircle, TrendingUp, BookOpen } from "lucide-react";
import api from "../../services/api";

export default function TeacherDashboard() {
  const [userName, setUserName] = useState("Teacher");
  const [lectures, setLectures] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUserName(JSON.parse(stored).full_name || "Teacher");

    api.get("/lectures").then((r) => setLectures(r.data)).catch(console.error);
    api.get("/admin/courses").then((r) => setCourses(r.data)).catch(console.error);
  }, []);

  const now = new Date();
  const upcoming = lectures.filter((l) => new Date(l.scheduled_at) > now || l.is_live).slice(0, 3);
  const totalLectures = lectures.length;

  return (
    <DashboardLayout role="teacher">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0B2A5B] mb-2">Welcome back, {userName}!</h1>
        <p className="text-[#0B2A5B]/70">Manage your classes and student progress</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="p-6 bg-white border-l-4 border-l-[#C2A86A] shadow-lg">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-[#0B2A5B]/60 mb-1">Total Courses</p><p className="text-3xl font-bold text-[#0B2A5B]">{courses.length}</p></div>
            <div className="w-12 h-12 bg-[#C2A86A]/10 rounded-full flex items-center justify-center"><BookOpen className="text-[#C2A86A]" size={24} /></div>
          </div>
        </Card>
        <Card className="p-6 bg-white border-l-4 border-l-[#0B2A5B] shadow-lg">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-[#0B2A5B]/60 mb-1">Total Lectures</p><p className="text-3xl font-bold text-[#0B2A5B]">{totalLectures}</p></div>
            <div className="w-12 h-12 bg-[#0B2A5B]/10 rounded-full flex items-center justify-center"><Video className="text-[#0B2A5B]" size={24} /></div>
          </div>
        </Card>
        <Card className="p-6 bg-white border-l-4 border-l-[#1a3d7a] shadow-lg">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-[#0B2A5B]/60 mb-1">Upcoming</p><p className="text-3xl font-bold text-[#0B2A5B]">{upcoming.length}</p></div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center"><Clock className="text-orange-600" size={24} /></div>
          </div>
        </Card>
        <Card className="p-6 bg-white border-l-4 border-l-[#d4bd8a] shadow-lg">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-[#0B2A5B]/60 mb-1">Live Now</p><p className="text-3xl font-bold text-green-600">{lectures.filter((l) => l.is_live).length}</p></div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center"><TrendingUp className="text-green-600" size={24} /></div>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Upcoming Lectures */}
        <Card className="lg:col-span-2 p-6 bg-white shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-[#0B2A5B]">Upcoming Lectures</h3>
            <Link to="/teacher/lectures"><Button variant="ghost" size="sm" className="text-[#C2A86A]">View All</Button></Link>
          </div>
          {upcoming.length === 0 ? (
            <p className="text-[#0B2A5B]/60 text-center py-8">No upcoming lectures. Schedule one from the Lectures page.</p>
          ) : (
            <div className="space-y-4">
              {upcoming.map((l) => (
                <div key={l.id} className="p-4 bg-[#F4F1EA] rounded-lg">
                  <h4 className="font-semibold text-[#0B2A5B] mb-2">{l.title}</h4>
                  <div className="flex items-center gap-4 text-sm text-[#0B2A5B]/70">
                    <span className="flex items-center gap-1"><Clock size={14} />{new Date(l.scheduled_at).toLocaleDateString()} at {new Date(l.scheduled_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                    <span>{l.duration_minutes} min</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Quick Actions */}
        <Card className="p-6 bg-gradient-to-br from-[#0B2A5B] to-[#1a3d7a] text-[#F4F1EA] shadow-xl">
          <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
          <div className="flex flex-col gap-4">
            <Link to="/teacher/courses" className="block">
              <Button className="w-full h-auto py-5 bg-[#C2A86A] text-[#0B2A5B] hover:bg-[#d4bd8a] shadow-lg transition-all hover:scale-[1.02] flex items-center justify-center">
                <BookOpen size={20} className="mr-3" /><span className="font-semibold">Manage Courses</span>
              </Button>
            </Link>
            <Link to="/teacher/lectures" className="block">
              <Button className="w-full h-auto py-5 bg-[#C2A86A] text-[#0B2A5B] hover:bg-[#d4bd8a] shadow-lg transition-all hover:scale-[1.02] flex items-center justify-center">
                <Video size={20} className="mr-3" /><span className="font-semibold">Schedule Lecture</span>
              </Button>
            </Link>
            <Link to="/teacher/doubt-sessions" className="block">
              <Button className="w-full h-auto py-5 bg-[#C2A86A] text-[#0B2A5B] hover:bg-[#d4bd8a] shadow-lg transition-all hover:scale-[1.02] flex items-center justify-center">
                <MessageCircle size={20} className="mr-3" /><span className="font-semibold">Resolve Doubts</span>
              </Button>
            </Link>
            <Link to="/teacher/exams" className="block">
              <Button className="w-full h-auto py-5 bg-[#C2A86A] text-[#0B2A5B] hover:bg-[#d4bd8a] shadow-lg transition-all hover:scale-[1.02] flex items-center justify-center">
                <FileQuestion size={20} className="mr-3" /><span className="font-semibold">Create Exam</span>
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
