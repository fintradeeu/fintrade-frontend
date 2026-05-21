import { useState, useEffect } from "react";
import api from "../../services/api";
import DashboardLayout from "../../components/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
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
  Calendar,
  Download,
  Users,
  CircleDot,
} from "lucide-react";



// We will fetch lectures from the backend
type LectureType = {
  id: number;
  title: string;
  description: string;
  course_id: number;
  instructor_id?: number;
  instructor_name?: string;
  meeting_link?: string;
  scheduled_at: string;
  duration_minutes: number;
  is_live: boolean;
  is_completed: boolean;
  max_participants: number;
  recordings: { id: number; recording_url: string; }[];
};

export default function Lectures() {
  const [upcomingLectures, setUpcoming] = useState<LectureType[]>([]);
  const [pastLectures, setPast] = useState<LectureType[]>([]);
  const [liveLecture, setLive] = useState<LectureType | null>(null);

  useEffect(() => {
    const fetchLectures = async () => {
      try {
        const res = await api.get("/lectures");
        const lectures: LectureType[] = res.data;
        
        const now = new Date();
        const upcoming: LectureType[] = [];
        const past: LectureType[] = [];
        let live: LectureType | null = null;

        lectures.forEach(l => {
          if (l.is_live && !l.is_completed) {
            live = l;
          } else if (!l.is_live && !l.is_completed) {
            upcoming.push(l);
          } else if (l.is_completed) {
            past.push(l);
          }
        });

        setUpcoming(upcoming);
        setPast(past);
        setLive(live);
      } catch (err) {
        console.error("Failed to load lectures", err);
      }
    };
    fetchLectures();
  }, []);
  return (
    <DashboardLayout role="student">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0B2A5B] mb-2">Live Lectures & Recordings</h1>
        <p className="text-[#0B2A5B]/70">Attend live sessions and access recorded lectures</p>
      </div>

      {/* Live Lecture Banner */}
      {liveLecture && (
        <Card className="p-6 mb-6 bg-gradient-to-r from-red-500 to-red-600 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <CircleDot className="animate-pulse" size={40} />
                <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-20" />
              </div>
              <div>
                <Badge className="mb-2 bg-white text-red-600">LIVE NOW</Badge>
                <h3 className="text-2xl font-bold mb-1">{liveLecture.title}</h3>
                <p className="text-white/90">
                  with {liveLecture.instructor_name || "Instructor"} • Started at {new Date(liveLecture.scheduled_at).toLocaleTimeString()}
                </p>
                <p className="text-sm text-white/80 flex items-center gap-2 mt-2">
                  <Users size={16} />
                  Max: {liveLecture.max_participants || "Unlimited"}
                </p>
              </div>
            </div>
            <a href={liveLecture.meeting_link || "#"} target="_blank" rel="noreferrer">
              <Button size="lg" className="bg-white text-red-600 hover:bg-gray-100 shadow-lg">
                <Play size={20} className="mr-2" />
                Join Now
              </Button>
            </a>
          </div>
        </Card>
      )}

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="upcoming">Upcoming Lectures</TabsTrigger>
          <TabsTrigger value="recordings">Past Recordings</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingLectures.map((lecture) => (
              <Card key={lecture.id} className="p-6 bg-white shadow-lg hover:shadow-xl transition-shadow">
                <div className="mb-4">
                  <Badge className="mb-3 bg-blue-100 text-blue-700">Scheduled</Badge>
                  <h3 className="text-xl font-semibold text-[#0B2A5B] mb-2">{lecture.title}</h3>
                  <p className="text-sm text-[#0B2A5B]/70 mb-4">{lecture.description}</p>
                </div>

                <div className="space-y-2 mb-4 pb-4 border-b border-[#0B2A5B]/10">
                  <div className="flex items-center gap-2 text-sm text-[#0B2A5B]/70">
                    <GraduationCap size={16} className="text-[#C2A86A]" />
                    <span>{lecture.instructor_name || "Instructor"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#0B2A5B]/70">
                    <Calendar size={16} className="text-[#C2A86A]" />
                    <span>{new Date(lecture.scheduled_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#0B2A5B]/70">
                    <Clock size={16} className="text-[#C2A86A]" />
                    <span>{new Date(lecture.scheduled_at).toLocaleTimeString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#0B2A5B]/70">
                    <Users size={16} className="text-[#C2A86A]" />
                    <span>Max {lecture.max_participants || "Unlimited"}</span>
                  </div>
                </div>

                <Button
                  className="w-full bg-[#0B2A5B] text-[#F4F1EA] hover:bg-[#1a3d7a]"
                  onClick={() => {
                    const start = new Date(lecture.scheduled_at);
                    const end = new Date(start.getTime() + (lecture.duration_minutes || 60) * 60000);
                    const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
                    const ics = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nDTSTART:${fmt(start)}\nDTEND:${fmt(end)}\nSUMMARY:${lecture.title}\nDESCRIPTION:${lecture.description || ""}\nEND:VEVENT\nEND:VCALENDAR`;
                    const blob = new Blob([ics], { type: "text/calendar" });
                    const a = document.createElement("a");
                    a.href = URL.createObjectURL(blob);
                    a.download = `${lecture.title.replace(/\s+/g, "_")}.ics`;
                    a.click();
                  }}
                >
                  Add to Calendar
                </Button>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recordings">
          <div className="space-y-4">
            {pastLectures.map((lecture) => (
              <Card key={lecture.id} className="p-6 bg-white shadow-lg">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-16 h-16 bg-[#C2A86A]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Video className="text-[#C2A86A]" size={28} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-[#0B2A5B]">{lecture.title}</h3>
                        <Badge className="bg-green-100 text-green-700">Completed</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-[#0B2A5B]/70 mb-3">
                        <span className="flex items-center gap-1">
                          <GraduationCap size={14} />
                          {lecture.instructor_name || "Instructor"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {new Date(lecture.scheduled_at).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          {lecture.duration_minutes} mins
                        </span>
                      </div>
                      <div className="flex gap-2">
                        {lecture.recordings && lecture.recordings.length > 0 && (
                          <a href={api.defaults.baseURL?.replace('/api', '') + lecture.recordings[0].recording_url} target="_blank" rel="noreferrer">
                            <Button
                              size="sm"
                              className="bg-[#0B2A5B] text-[#F4F1EA] hover:bg-[#1a3d7a]"
                            >
                              <Play size={16} className="mr-2" />
                              Watch Recording
                            </Button>
                          </a>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-[#0B2A5B]/20 text-[#0B2A5B]"
                        >
                          <Download size={16} className="mr-2" />
                          Download Notes
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
