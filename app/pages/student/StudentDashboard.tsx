import DashboardLayout from "../../components/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Progress } from "../../components/ui/progress";
import { Link } from "react-router";
import {
  Home,
  BookOpen,
  Video,
  MessageSquare,
  FileText,
  BarChart3,
  Award,
  TrendingUp,
  GraduationCap,
  Play,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";



import { useState, useEffect } from "react";
import api from "../../services/api";

export default function StudentDashboard() {
  const [userName, setUserName] = useState("Student");
  const [upcomingLectures, setUpcoming] = useState<any[]>([]);
  const [courseProgress, setCourseProgress] = useState(0);
  const [enrolledCount, setEnrolledCount] = useState(0);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUserName(JSON.parse(storedUser).full_name || "Student");
    }

    api.get("/lectures").then(res => {
      const now = new Date();
      const upcoming = res.data.filter((l: any) => new Date(l.scheduled_at || l.start_time) > now || l.status === 'scheduled');
      setUpcoming(upcoming.slice(0, 3));
    }).catch(err => console.error(err));

    api.get("/courses/enrolled").then(res => {
      const enrolled = res.data;
      setEnrolledCount(enrolled.length);
      if (enrolled.length > 0) {
        const avg = Math.round(enrolled.reduce((s: number, e: any) => s + (e.progress_percent || 0), 0) / enrolled.length);
        setCourseProgress(avg);
      }
    }).catch(err => console.error(err));
  }, []);

  return (
    <DashboardLayout role="student">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0B2A5B] mb-2">Welcome back, {userName}!</h1>
        <p className="text-[#0B2A5B]/70">Track your progress and continue your learning journey</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="p-6 bg-white border-l-4 border-l-[#C2A86A] shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#0B2A5B]/60 mb-1">Course Progress</p>
              <p className="text-3xl font-bold text-[#0B2A5B]">{courseProgress}%</p>
            </div>
            <div className="w-12 h-12 bg-[#C2A86A]/10 rounded-full flex items-center justify-center">
              <BookOpen className="text-[#C2A86A]" size={24} />
            </div>
          </div>
          <Progress value={courseProgress} className="mt-4 h-2" />
        </Card>


        {/* Upcoming Lectures */}
        <Card className="p-6 bg-white shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-[#0B2A5B]">Upcoming Lectures</h3>
            <Link to="/student/lectures">
              <Button variant="ghost" size="sm" className="text-[#C2A86A] hover:text-[#a38c52]">
                View All
              </Button>
            </Link>
          </div>
          <div className="space-y-4">
            {upcomingLectures.map((lecture, index) => (
              <div
                key={index}
                className="p-4 bg-[#F4F1EA] rounded-lg border border-[#0B2A5B]/10 hover:border-[#C2A86A] transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-[#0B2A5B]">{lecture.title}</h4>
                  <div className="w-10 h-10 bg-[#C2A86A]/10 rounded-full flex items-center justify-center">
                    <Play className="text-[#C2A86A]" size={16} />
                  </div>
                </div>
                <p className="text-sm text-[#0B2A5B]/60 mb-2">by {lecture.instructor_name || "Instructor"}</p>
                <div className="flex items-center gap-4 text-xs text-[#0B2A5B]/70">
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {new Date(lecture.start_time).toLocaleDateString()} at {new Date(lecture.start_time).toLocaleTimeString()}
                  </span>
                  <span>{lecture.status}</span>
                </div>
              </div>
            ))}
            {upcomingLectures.length === 0 && (
              <p className="text-sm text-[#0B2A5B]/60">No upcoming lectures found.</p>
            )}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6 bg-gradient-to-r from-[#0B2A5B] to-[#1a3d7a] text-[#F4F1EA] shadow-xl">
        <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/student/courses">
            <Button className="w-full bg-[#C2A86A] text-[#0B2A5B] hover:bg-[#d4bd8a] shadow-lg shadow-[#C2A86A]/20">
              Enroll Courses
            </Button>
          </Link>
          <Link to="/student/lectures">
            <Button className="w-full bg-[#C2A86A] text-[#0B2A5B] hover:bg-[#d4bd8a] shadow-lg shadow-[#C2A86A]/20">
              View Lectures
            </Button>
          </Link>
          <Link to="/student/ai-tutor">
            <Button className="w-full bg-[#C2A86A] text-[#0B2A5B] hover:bg-[#d4bd8a] shadow-lg shadow-[#C2A86A]/20">
              Ask AI Tutor
            </Button>
          </Link>
          <Link to="/student/entrance-exam">
            <Button className="w-full bg-[#C2A86A] text-[#0B2A5B] hover:bg-[#d4bd8a] shadow-lg shadow-[#C2A86A]/20">
              Entrance Exam
            </Button>
          </Link>
        </div>
      </Card>
    </DashboardLayout>
  );
}
