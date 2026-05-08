import { useState, useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Progress } from "../../components/ui/progress";
import { TrendingUp, TrendingDown } from "lucide-react";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from "recharts";
import api from "../../services/api";

export default function Performance() {
  const [analysis, setAnalysis] = useState<any>(null);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/exams/results/analysis").then((r) => setAnalysis(r.data)).catch(() => null),
      api.get("/courses/enrolled").then((r) => setEnrollments(r.data)).catch(() => null),
    ]).finally(() => setLoading(false));
  }, []);

  const avgProgress = enrollments.length > 0 ? Math.round(enrollments.reduce((s, e) => s + (e.progress_percent || 0), 0) / enrollments.length) : 0;

  // Build radar data from skill analysis
  const radarData = [
    ...(analysis?.strong_areas || []).map((a: any) => ({ skill: a.category, score: Math.round(a.percentage), fullMark: 100 })),
    ...(analysis?.weak_areas || []).map((a: any) => ({ skill: a.category, score: Math.round(a.percentage), fullMark: 100 })),
  ];

  return (
    <DashboardLayout role="student">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0B2A5B] mb-2">Performance Analytics</h1>
        <p className="text-[#0B2A5B]/70">Comprehensive analysis of your learning progress</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-[#0B2A5B]/60">Loading your analytics...</div>
      ) : (
        <>
          {/* Overall Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <Card className="p-6 bg-white shadow-lg">
              <p className="text-sm text-[#0B2A5B]/60 mb-1">Course Completion</p>
              <p className="text-3xl font-bold text-[#0B2A5B]">{avgProgress}%</p>
              <Progress value={avgProgress} className="mt-3 h-2" />
            </Card>
            <Card className="p-6 bg-white shadow-lg">
              <p className="text-sm text-[#0B2A5B]/60 mb-1">Enrolled Courses</p>
              <p className="text-3xl font-bold text-[#C2A86A]">{enrollments.length}</p>
            </Card>
            <Card className="p-6 bg-white shadow-lg">
              <p className="text-sm text-[#0B2A5B]/60 mb-1">Skill Areas Analyzed</p>
              <p className="text-3xl font-bold text-[#0B2A5B]">{radarData.length}</p>
            </Card>
          </div>

          {/* Skill Radar + Strengths/Weaknesses */}
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            <Card className="p-6 bg-white shadow-lg">
              <h3 className="text-xl font-semibold text-[#0B2A5B] mb-6">Skill Analysis</h3>
              {radarData.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#0B2A5B20" />
                    <PolarAngleAxis dataKey="skill" style={{ fontSize: "11px", fill: "#0B2A5B" }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} style={{ fontSize: "10px" }} />
                    <Radar name="Your Score" dataKey="score" stroke="#C2A86A" fill="#C2A86A" fillOpacity={0.3} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-[#0B2A5B]/60 text-center py-12">Complete exams to see your skill analysis.</p>
              )}
            </Card>

            <div className="space-y-6">
              {/* Strengths */}
              <Card className="p-6 bg-white shadow-lg">
                <h3 className="text-xl font-semibold text-[#0B2A5B] mb-4 flex items-center gap-2">
                  <TrendingUp className="text-green-600" size={24} />Your Strengths
                </h3>
                {(analysis?.strong_areas || []).length > 0 ? (
                  <div className="space-y-3">
                    {(analysis?.strong_areas || []).map((s: any, i: number) => (
                      <div key={i}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-[#0B2A5B]">{s.category}</span>
                          <span className="text-sm font-semibold text-green-600">{Math.round(s.percentage)}%</span>
                        </div>
                        <Progress value={s.percentage} className="h-2" />
                      </div>
                    ))}
                  </div>
                ) : <p className="text-sm text-[#0B2A5B]/60">No data yet. Take exams to discover your strengths.</p>}
              </Card>

              {/* Weaknesses */}
              <Card className="p-6 bg-white shadow-lg">
                <h3 className="text-xl font-semibold text-[#0B2A5B] mb-4 flex items-center gap-2">
                  <TrendingDown className="text-orange-600" size={24} />Areas for Improvement
                </h3>
                {(analysis?.weak_areas || []).length > 0 ? (
                  <div className="space-y-3">
                    {(analysis?.weak_areas || []).map((w: any, i: number) => (
                      <div key={i}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-[#0B2A5B]">{w.category}</span>
                          <span className="text-sm font-semibold text-orange-600">{Math.round(w.percentage)}%</span>
                        </div>
                        <Progress value={w.percentage} className="h-2" />
                      </div>
                    ))}
                  </div>
                ) : <p className="text-sm text-[#0B2A5B]/60">No weak areas identified yet.</p>}
              </Card>
            </div>
          </div>

          {/* Suggestions */}
          {analysis?.suggestions?.length > 0 && (
            <Card className="p-6 bg-gradient-to-r from-[#0B2A5B] to-[#1a3d7a] text-[#F4F1EA] shadow-xl">
              <h3 className="text-xl font-semibold mb-4">AI Suggestions</h3>
              <ul className="space-y-2">
                {analysis.suggestions.map((s: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[#F4F1EA]/90">
                    <span className="text-[#C2A86A]">•</span>{s}
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </>
      )}
    </DashboardLayout>
  );
}
