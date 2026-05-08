import { useState, useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Progress } from "../../components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { FileText, Play, FileAudio, FileVideo, Download, CheckCircle, Lock, Volume2, Settings } from "lucide-react";
import api from "../../services/api";

export default function Modules() {
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch enrolled courses with progress
        const enrolledRes = await api.get("/courses/enrolled");
        const enrolled = enrolledRes.data;

        // Fetch detail for each enrolled course to get modules/lessons
        const detailed = await Promise.all(
          enrolled.map(async (enr: any) => {
            try {
              const detail = await api.get(`/courses/${enr.course_id}`);
              return { ...detail.data, progress_percent: enr.progress_percent, enrollment: enr };
            } catch {
              return { id: enr.course_id, title: enr.course?.title || "Course", modules: [], progress_percent: enr.progress_percent, enrollment: enr };
            }
          })
        );
        setCourses(detailed);
        if (detailed.length > 0) setSelectedCourse(detailed[0]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video": return <FileVideo className="text-[#C2A86A]" size={18} />;
      case "audio": return <FileAudio className="text-[#0B2A5B]" size={18} />;
      default: return <FileText className="text-[#1a3d7a]" size={18} />;
    }
  };

  const totalModules = selectedCourse?.modules?.length || 0;

  return (
    <DashboardLayout role="student">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0B2A5B] mb-2">Course Modules</h1>
        <p className="text-[#0B2A5B]/70">Complete all modules to unlock your certificate</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-[#0B2A5B]/60">Loading your courses...</div>
      ) : courses.length === 0 ? (
        <Card className="p-8 bg-white shadow-lg text-center">
          <p className="text-[#0B2A5B]/60 mb-4">You haven't enrolled in any courses yet.</p>
          <a href="/student/courses"><Button className="bg-[#0B2A5B] text-white hover:bg-[#1a3d7a]">Browse Courses</Button></a>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Course/Module List */}
          <div className="lg:col-span-1 space-y-4">
            {courses.map((course) => (
              <Card
                key={course.id}
                className={`p-4 cursor-pointer transition-all ${selectedCourse?.id === course.id ? "bg-[#C2A86A]/10 border-2 border-[#C2A86A] shadow-lg" : "bg-white hover:shadow-md"}`}
                onClick={() => setSelectedCourse(course)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-semibold text-[#0B2A5B]/60">{course.difficulty_level}</span>
                      {course.progress_percent >= 100 && <CheckCircle className="text-green-600" size={16} />}
                    </div>
                    <h3 className="font-semibold text-[#0B2A5B] mb-1">{course.title}</h3>
                    <p className="text-xs text-[#0B2A5B]/60">{course.modules?.length || 0} modules • {course.duration_hours || "—"} hours</p>
                  </div>
                </div>
                <Progress value={course.progress_percent || 0} className="h-2 mb-2" />
                <p className="text-xs text-[#0B2A5B]/70">{Math.round(course.progress_percent || 0)}% Complete</p>
              </Card>
            ))}
          </div>

          {/* Module Content */}
          <Card className="lg:col-span-2 p-6 bg-white shadow-lg">
            {selectedCourse ? (
              <>
                <div className="mb-6">
                  <Badge className={`mb-3 ${selectedCourse.progress_percent >= 100 ? "bg-green-100 text-green-700" : selectedCourse.progress_percent > 0 ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"}`}>
                    {selectedCourse.progress_percent >= 100 ? "Completed" : selectedCourse.progress_percent > 0 ? "In Progress" : "Not Started"}
                  </Badge>
                  <h2 className="text-2xl font-bold text-[#0B2A5B] mb-2">{selectedCourse.title}</h2>
                  <p className="text-[#0B2A5B]/70 mb-4">{selectedCourse.description || selectedCourse.short_description || "No description"}</p>
                  <div className="flex items-center gap-6 text-sm text-[#0B2A5B]/60">
                    <span>{totalModules} Modules</span>
                    <span>{selectedCourse.duration_hours || "—"} hours</span>
                    <span>{Math.round(selectedCourse.progress_percent || 0)}% Complete</span>
                  </div>
                </div>

                <Tabs defaultValue="lessons" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="lessons">Modules & Lessons</TabsTrigger>
                    <TabsTrigger value="resources">Resources</TabsTrigger>
                  </TabsList>

                  <TabsContent value="lessons" className="space-y-4">
                    {(selectedCourse.modules || []).length === 0 ? (
                      <p className="text-[#0B2A5B]/60 text-center py-8">No modules available yet for this course.</p>
                    ) : (
                      (selectedCourse.modules || []).sort((a: any, b: any) => a.order - b.order).map((mod: any, idx: number) => (
                        <Card key={mod.id} className="p-4 bg-[#F4F1EA]">
                          <h4 className="font-semibold text-[#0B2A5B] mb-3">Module {idx + 1}: {mod.title}</h4>
                          {mod.description && <p className="text-xs text-[#0B2A5B]/60 mb-3">{mod.description}</p>}
                          <div className="space-y-2">
                            {(mod.lessons || []).sort((a: any, b: any) => a.order - b.order).map((lesson: any, li: number) => (
                              <div key={lesson.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                                <div className="flex items-center gap-3 flex-1">
                                  <div className="w-8 h-8 bg-[#F4F1EA] rounded-full flex items-center justify-center">{getTypeIcon(lesson.content_type)}</div>
                                  <div className="flex-1">
                                    <p className="font-medium text-[#0B2A5B] text-sm">{li + 1}. {lesson.title}</p>
                                    <div className="flex items-center gap-2 text-xs text-[#0B2A5B]/60">
                                      <span className="capitalize">{lesson.content_type}</span>
                                      {lesson.duration_minutes && <><span>•</span><span>{lesson.duration_minutes} min</span></>}
                                    </div>
                                  </div>
                                </div>
                                <Button size="sm" className="bg-[#0B2A5B] text-[#F4F1EA] hover:bg-[#1a3d7a]"><Play size={14} className="mr-1" />Start</Button>
                              </div>
                            ))}
                            {(mod.lessons || []).length === 0 && <p className="text-xs text-[#0B2A5B]/50 text-center py-2">No lessons yet</p>}
                          </div>
                        </Card>
                      ))
                    )}
                  </TabsContent>

                  <TabsContent value="resources">
                    <div className="space-y-3">
                      <Card className="p-4 bg-[#F4F1EA]">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <FileText className="text-[#C2A86A]" size={20} />
                            <div><p className="font-semibold text-[#0B2A5B]">Course Summary</p><p className="text-xs text-[#0B2A5B]/60">PDF resource</p></div>
                          </div>
                          <Button size="sm" variant="outline" className="border-[#0B2A5B]/20"><Download size={16} className="mr-2" />Download</Button>
                        </div>
                      </Card>
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Playback Controls */}
                <Card className="p-4 bg-[#F4F1EA] mt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Volume2 className="text-[#0B2A5B]" size={20} />
                      <div><p className="text-sm font-semibold text-[#0B2A5B]">Convert to Audio</p><p className="text-xs text-[#0B2A5B]/60">Listen on the go</p></div>
                    </div>
                    <Button size="sm" className="bg-[#C2A86A] text-[#0B2A5B] hover:bg-[#d4bd8a]"><FileAudio size={16} className="mr-2" />Generate Audio</Button>
                  </div>
                </Card>
                <div className="mt-4 flex items-center gap-4">
                  <Settings className="text-[#0B2A5B]" size={20} />
                  <span className="text-sm text-[#0B2A5B]">Playback Speed:</span>
                  <div className="flex gap-2">
                    {[0.75, 1.0, 1.25, 1.5, 2.0].map((speed) => (
                      <button key={speed} onClick={() => setPlaybackSpeed(speed)} className={`px-3 py-1 rounded-lg text-sm font-semibold transition-colors ${playbackSpeed === speed ? "bg-[#C2A86A] text-[#0B2A5B]" : "bg-white text-[#0B2A5B] hover:bg-[#F4F1EA]"}`}>{speed}x</button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <p className="text-center text-[#0B2A5B]/60 py-8">Select a course to view modules</p>
            )}
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}
