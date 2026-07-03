import { useState, useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Progress } from "../../components/ui/progress";
import { Badge } from "../../components/ui/badge";
import { Calendar, Clock, Lock, BookOpen, Play, CheckCircle, AlertCircle, Award } from "lucide-react";
import api from "../../services/api";
import { Link } from "react-router";

export default function StudentBatchDashboard() {
  const [batchData, setBatchData] = useState<any>(null);
  const [userName, setUserName] = useState("Student");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUserName(JSON.parse(storedUser).full_name || "Student");
    }

    const fetchBatchDashboard = async () => {
      try {
        const res = await api.get("/batches/student/dashboard");
        setBatchData(res.data);
        setSecondsLeft(res.data.countdown_seconds);
      } catch (err: any) {
        console.error(err);
        setError(err.response?.data?.detail || "You are not enrolled in an active batch.");
      } finally {
        setLoading(false);
      }
    };
    fetchBatchDashboard();
  }, []);

  // Countdown timer effect
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          // Auto unlock dashboard
          if (batchData) {
            setBatchData((prevData: any) => ({ ...prevData, is_locked: false }));
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [secondsLeft, batchData]);

  const formatCountdown = (totalSeconds: number) => {
    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return { days, hours, minutes, seconds };
  };

  if (loading) {
    return (
      <DashboardLayout role="student">
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="text-[#0B2A5B] font-semibold">Loading batch details...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !batchData) {
    return (
      <DashboardLayout role="student">
        <Card className="p-8 text-center bg-white shadow-sm border border-red-100 max-w-xl mx-auto mt-12">
          <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
          <h2 className="text-xl font-bold text-[#0B2A5B] mb-2">No Cohort Batch Found</h2>
          <p className="text-gray-600 mb-6">{error || "Please purchase a course to be enrolled in a cohort batch."}</p>
          <a href="/courses">
            <Button className="bg-[#0B2A5B] text-white hover:bg-[#1a3d7a]">Browse Courses</Button>
          </a>
        </Card>
      </DashboardLayout>
    );
  }

  const { days, hours, minutes, seconds } = formatCountdown(secondsLeft);
  const isCompleted = batchData.status === "Completed" || batchData.status === "Archived";

  return (
    <DashboardLayout role="student">
      {/* Locked / Countdown View */}
      {batchData.is_locked ? (
        <div className="max-w-3xl mx-auto text-center mt-8">
          <Card className="p-8 bg-white border border-gray-100 shadow-xl rounded-2xl relative overflow-hidden">
            {/* Top gold bar */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-[#C2A86A]" />
            
            <Lock className="text-[#C2A86A] mx-auto mb-4 animate-bounce" size={48} />
            <h1 className="text-3xl font-extrabold text-[#0B2A5B] mb-2">Congratulations, {userName}!</h1>
            <p className="text-[#0B2A5B]/80 text-lg mb-6">
              You are successfully enrolled in **{batchData.name}**.
            </p>

            <div className="bg-[#F4F1EA] p-4 rounded-xl inline-block mb-8 border border-[#0B2A5B]/10">
              <p className="text-[#0B2A5B] text-sm font-semibold uppercase tracking-wider mb-2">Cohort Starts In</p>
              <div className="flex items-center justify-center gap-4 text-2xl font-bold text-[#0B2A5B]">
                <div className="flex flex-col items-center">
                  <span className="text-3xl font-black">{days}</span>
                  <span className="text-[10px] text-gray-500 font-bold uppercase">Days</span>
                </div>
                <span>:</span>
                <div className="flex flex-col items-center">
                  <span className="text-3xl font-black">{hours}</span>
                  <span className="text-[10px] text-gray-500 font-bold uppercase">Hours</span>
                </div>
                <span>:</span>
                <div className="flex flex-col items-center">
                  <span className="text-3xl font-black">{minutes}</span>
                  <span className="text-[10px] text-gray-500 font-bold uppercase">Mins</span>
                </div>
                <span>:</span>
                <div className="flex flex-col items-center">
                  <span className="text-3xl font-black">{seconds}</span>
                  <span className="text-[10px] text-gray-500 font-bold uppercase">Secs</span>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-500 mb-8">
              All course content, live classes, and assignments will automatically unlock on{" "}
              <strong>{new Date(batchData.start_date).toLocaleDateString(undefined, { dateStyle: "long" })}</strong>.
            </p>

            <h3 className="text-sm font-bold text-[#0B2A5B] uppercase tracking-wider mb-4">Your Courses</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {batchData.assigned_courses.map((course: any) => (
                <Card key={course.course_id} className="p-4 bg-gray-50/50 border border-gray-100 flex items-center gap-4 text-left">
                  {course.thumbnail_url ? (
                    <img src={course.thumbnail_url} alt={course.title} className="w-16 h-12 object-cover rounded-lg border" />
                  ) : (
                    <div className="w-16 h-12 bg-[#0B2A5B]/10 rounded-lg flex items-center justify-center text-[#0B2A5B]">
                      <BookOpen size={20} />
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-[#0B2A5B] text-sm line-clamp-1">{course.title}</h4>
                    <span className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                      <Lock size={10} /> Locked
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </div>
      ) : (
        /* Unlocked Dashboard View */
        <div className="space-y-6">
          {/* Completion/End Banner */}
          {isCompleted && (
            <Card className="p-4 bg-amber-50 border-l-4 border-l-amber-500 text-amber-900 flex items-center gap-3">
              <AlertCircle size={20} />
              <p className="text-sm">
                This cohort batch (<strong>{batchData.name}</strong>) ended on{" "}
                <strong>{new Date(batchData.end_date).toLocaleDateString()}</strong>. Live lectures are disabled, but all recordings and certificates remain fully accessible.
              </p>
            </Card>
          )}

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[#0B2A5B] mb-2">My Batch Dashboard</h1>
              <p className="text-gray-500 text-sm">
                Current Batch: <strong>{batchData.name}</strong> ({batchData.batch_code})
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-[#0B2A5B] text-white">Cohort active</Badge>
              <Badge className="bg-gray-100 text-gray-800">
                End date: {new Date(batchData.end_date).toLocaleDateString()}
              </Badge>
            </div>
          </div>

          {/* Overall progress */}
          <Card className="p-6 bg-white border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-[#0B2A5B]">Batch Completion Progress</h3>
              <span className="text-lg font-bold text-[#C2A86A]">{batchData.progress_percent}%</span>
            </div>
            <Progress value={batchData.progress_percent} className="h-3" />
          </Card>

          {/* Courses List */}
          <div>
            <h2 className="text-xl font-bold text-[#0B2A5B] mb-4">Assigned Courses</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {batchData.assigned_courses.map((course: any) => (
                <Card key={course.course_id} className="bg-white border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                  <div className="p-6 flex gap-4">
                    {course.thumbnail_url ? (
                      <img src={course.thumbnail_url} alt={course.title} className="w-24 h-16 object-cover rounded-lg border" />
                    ) : (
                      <div className="w-24 h-16 bg-[#0B2A5B]/10 rounded-lg flex items-center justify-center text-[#0B2A5B]">
                        <BookOpen size={24} />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-bold text-[#0B2A5B] mb-1 line-clamp-1">{course.title}</h3>
                      <div className="flex items-center gap-2 mt-2">
                        <Progress value={course.progress_percent} className="h-2 flex-1" />
                        <span className="text-xs font-semibold text-gray-500">{course.progress_percent}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="px-6 py-4 bg-gray-50/50 border-t flex justify-end">
                    <Link to="/student/modules">
                      <Button className="bg-[#0B2A5B] text-white text-xs h-9 hover:bg-[#1a3d7a]">
                        <Play size={12} className="mr-1" /> Start Learning
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Secondary Widgets */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6 bg-white border border-gray-100 shadow-sm flex flex-col justify-between">
              <div>
                <Clock className="text-[#C2A86A] mb-3" size={28} />
                <h4 className="font-bold text-[#0B2A5B] mb-1">Live Classes</h4>
                <p className="text-xs text-gray-500">Access schedule, calendar invites, and join live online sessions.</p>
              </div>
              <Link to="/student/lectures" className="mt-4">
                <Button variant="outline" disabled={isCompleted} className="w-full text-xs border-[#0B2A5B] text-[#0B2A5B] hover:bg-[#0B2A5B] hover:text-white">
                  View Sessions
                </Button>
              </Link>
            </Card>

            <Card className="p-6 bg-white border border-gray-100 shadow-sm flex flex-col justify-between">
              <div>
                <BookOpen className="text-[#C2A86A] mb-3" size={28} />
                <h4 className="font-bold text-[#0B2A5B] mb-1">Assignments</h4>
                <p className="text-xs text-gray-500">View tasks, upload files, and check graded results.</p>
              </div>
              <Link to="/student/assignments" className="mt-4">
                <Button variant="outline" className="w-full text-xs border-[#0B2A5B] text-[#0B2A5B] hover:bg-[#0B2A5B] hover:text-white">
                  Assignments
                </Button>
              </Link>
            </Card>

            <Card className="p-6 bg-white border border-gray-100 shadow-sm flex flex-col justify-between">
              <div>
                <Award className="text-[#C2A86A] mb-3" size={28} />
                <h4 className="font-bold text-[#0B2A5B] mb-1">Certificates</h4>
                <p className="text-xs text-gray-500">Claim your completion certificate once overall progress is 100%.</p>
              </div>
              <Link to="/student/performance" className="mt-4">
                <Button variant="outline" className="w-full text-xs border-[#0B2A5B] text-[#0B2A5B] hover:bg-[#0B2A5B] hover:text-white">
                  Performance
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
