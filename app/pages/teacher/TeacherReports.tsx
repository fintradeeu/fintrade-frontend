import { useState, useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { Card } from "../../components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import api from "../../services/api";

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
        </>
      ) : (
        <Card className="p-8 text-center bg-white shadow-lg">
          <p className="text-[#0B2A5B]/60">Failed to load reports data.</p>
        </Card>
      )}
    </DashboardLayout>
  );
}
