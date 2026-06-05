import { useState, useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { Card } from "../../components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import api from "../../services/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Badge } from "../../components/ui/badge";

export default function TeacherReports() {
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/faculty/reports")
      .then((res) => setReportData(res.data))
      .catch((err) => console.error("Error fetching reports:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout role="teacher">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0B2A5B] mb-2">Reports & Analytics</h1>
        <p className="text-[#0B2A5B]/70">Detailed insights into class performance</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-[#0B2A5B]/60">Loading reports...</div>
      ) : reportData ? (
        <>
          <div className="grid md:grid-cols-5 gap-4 mb-6">
            <Card className="p-4 bg-white shadow-lg">
              <p className="text-sm text-[#0B2A5B]/60 mb-1">Total Students</p>
              <p className="text-2xl font-bold text-[#0B2A5B]">
                {reportData.student_distribution?.reduce((acc: number, cur: any) => acc + cur.value, 0) || 0}
              </p>
            </Card>
            <Card className="p-4 bg-white shadow-lg">
              <p className="text-sm text-[#0B2A5B]/60 mb-1">Completion Rate</p>
              <p className="text-2xl font-bold text-green-600">{reportData.completion_rate}%</p>
            </Card>
            <Card className="p-4 bg-white shadow-lg">
              <p className="text-sm text-[#0B2A5B]/60 mb-1">Avg Score</p>
              <p className="text-2xl font-bold text-[#C2A86A]">{reportData.avg_class_score}%</p>
            </Card>
            <Card className="p-4 bg-white shadow-lg">
              <p className="text-sm text-[#0B2A5B]/60 mb-1">Pass Rate</p>
              <p className="text-2xl font-bold text-green-600">{reportData.pass_rate}%</p>
            </Card>
            <Card className="p-4 bg-white shadow-lg">
              <p className="text-sm text-[#0B2A5B]/60 mb-1">Assignment Completion</p>
              <p className="text-2xl font-bold text-[#0B2A5B]">{reportData.assignment_completion != null ? `${reportData.assignment_completion}%` : "—"}</p>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="p-6 bg-white shadow-lg">
              <h3 className="text-xl font-semibold text-[#0B2A5B] mb-6">Performance Trend</h3>
              {reportData.performance_trend?.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={reportData.performance_trend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#0B2A5B20" />
                    <XAxis dataKey="month" stroke="#0B2A5B" />
                    <YAxis stroke="#0B2A5B" domain={[0, 100]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="avgScore" name="Avg Score" stroke="#C2A86A" strokeWidth={3} />
                    <Line type="monotone" dataKey="passRate" name="Pass Rate" stroke="#0B2A5B" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-[#0B2A5B]/60 py-10">Not enough data to show trends.</p>
              )}
            </Card>

            <Card className="p-6 bg-white shadow-lg">
              <h3 className="text-xl font-semibold text-[#0B2A5B] mb-6">Module Completion</h3>
              {reportData.module_completion?.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={reportData.module_completion}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#0B2A5B20" />
                    <XAxis dataKey="module" stroke="#0B2A5B" />
                    <YAxis stroke="#0B2A5B" domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="completion" fill="#0B2A5B" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-[#0B2A5B]/60 py-10">Not enough data to show module completion.</p>
              )}
            </Card>
          </div>
          {/* Detailed Reports Section */}
          {/* Detailed Reports Section */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-[#0B2A5B] mb-4">Detailed Reports</h2>
            <Tabs defaultValue="progress" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="progress">Student Progress</TabsTrigger>
                <TabsTrigger value="exams">Exam Scores</TabsTrigger>
                <TabsTrigger value="assignments">Assignment Submissions</TabsTrigger>
              </TabsList>

              <TabsContent value="progress">
                <Card className="p-0 overflow-hidden bg-white shadow-lg">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-[#0B2A5B]/80">
                      <thead className="bg-[#0B2A5B]/5 text-[#0B2A5B] font-semibold">
                        <tr>
                          <th className="p-4">Student Name</th>
                          <th className="p-4">Email</th>
                          <th className="p-4">Course</th>
                          <th className="p-4">Enrolled At</th>
                          <th className="p-4">Progress</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#0B2A5B]/10">
                        {reportData.student_progress?.map((p: any, i: number) => (
                          <tr key={i} className="hover:bg-[#0B2A5B]/5">
                            <td className="p-4 font-medium">{p.student_name}</td>
                            <td className="p-4">{p.student_email}</td>
                            <td className="p-4">{p.course_title}</td>
                            <td className="p-4">{new Date(p.enrolled_at).toLocaleDateString()}</td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                  <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${p.progress_percent}%` }}></div>
                                </div>
                                <span>{p.progress_percent.toFixed(1)}%</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {(!reportData.student_progress || reportData.student_progress.length === 0) && (
                          <tr><td colSpan={5} className="p-4 text-center">No student progress data available.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="exams">
                <Card className="p-0 overflow-hidden bg-white shadow-lg">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-[#0B2A5B]/80">
                      <thead className="bg-[#0B2A5B]/5 text-[#0B2A5B] font-semibold">
                        <tr>
                          <th className="p-4">Student Name</th>
                          <th className="p-4">Exam</th>
                          <th className="p-4">Course</th>
                          <th className="p-4">Score</th>
                          <th className="p-4">Status</th>
                          <th className="p-4">Evaluated At</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#0B2A5B]/10">
                        {reportData.exam_scores?.map((e: any, i: number) => (
                          <tr key={i} className="hover:bg-[#0B2A5B]/5">
                            <td className="p-4 font-medium">{e.student_name}</td>
                            <td className="p-4">{e.exam_title}</td>
                            <td className="p-4">{e.course_title}</td>
                            <td className="p-4">{e.percentage.toFixed(1)}% ({e.obtained_marks}/{e.total_marks})</td>
                            <td className="p-4">
                              {e.passed ? (
                                <Badge className="bg-green-100 text-green-700">Passed</Badge>
                              ) : (
                                <Badge className="bg-red-100 text-red-700">Failed</Badge>
                              )}
                            </td>
                            <td className="p-4">{new Date(e.evaluated_at).toLocaleDateString()}</td>
                          </tr>
                        ))}
                        {(!reportData.exam_scores || reportData.exam_scores.length === 0) && (
                          <tr><td colSpan={6} className="p-4 text-center">No exam score data available.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="assignments">
                <Card className="p-0 overflow-hidden bg-white shadow-lg">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-[#0B2A5B]/80">
                      <thead className="bg-[#0B2A5B]/5 text-[#0B2A5B] font-semibold">
                        <tr>
                          <th className="p-4">Student Name</th>
                          <th className="p-4">Assignment</th>
                          <th className="p-4">Course</th>
                          <th className="p-4">Status</th>
                          <th className="p-4">Score</th>
                          <th className="p-4">Submitted At</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#0B2A5B]/10">
                        {reportData.assignment_submissions?.map((a: any, i: number) => (
                          <tr key={i} className="hover:bg-[#0B2A5B]/5">
                            <td className="p-4 font-medium">{a.student_name}</td>
                            <td className="p-4">{a.assignment_title}</td>
                            <td className="p-4">{a.course_title}</td>
                            <td className="p-4">
                              <Badge className={a.status === 'graded' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                                {a.status}
                              </Badge>
                            </td>
                            <td className="p-4">{a.score != null ? `${a.score}%` : "—"}</td>
                            <td className="p-4">{new Date(a.submitted_at).toLocaleDateString()}</td>
                          </tr>
                        ))}
                        {(!reportData.assignment_submissions || reportData.assignment_submissions.length === 0) && (
                          <tr><td colSpan={6} className="p-4 text-center">No assignment submission data available.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </>
      ) : (
        <Card className="p-8 text-center bg-white shadow-lg">
          <p className="text-[#0B2A5B]/60">Failed to load reports data.</p>
        </Card>
      )}
    </DashboardLayout>
  );
}
