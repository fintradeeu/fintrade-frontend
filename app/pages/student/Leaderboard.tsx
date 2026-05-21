import { useState, useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { Badge } from "../../components/ui/badge";
import { Trophy, Medal, Award, Star, TrendingUp, AlertCircle } from "lucide-react";
import api from "../../services/api";

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [myStats, setMyStats] = useState<{ rank: number; score: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      // Try dedicated leaderboard endpoint first
      const res = await api.get("/dashboard/leaderboard");
      setLeaderboard(res.data.leaderboard || res.data || []);
      if (res.data.my_rank) {
        setMyStats({ rank: res.data.my_rank, score: res.data.my_score || 0 });
      }
    } catch {
      // Fallback: build leaderboard from exam results if endpoint doesn't exist
      try {
        const examRes = await api.get("/exams/results/analysis");
        if (examRes.data) {
          // Use own analysis to show at least the student's own data
          const userStored = localStorage.getItem("user");
          const userName = userStored ? JSON.parse(userStored).full_name : "You";
          const overallScore = examRes.data.overall_percentage || 0;
          setMyStats({ rank: 1, score: Math.round(overallScore * 100) });
          setLeaderboard([
            { id: 1, name: userName, score: Math.round(overallScore * 100), rank: 1, badge: getBadge(overallScore * 100) }
          ]);
        }
      } catch {
        // No data available at all
      }
    }
    setLoading(false);
  };

  const getBadge = (score: number): string => {
    if (score >= 9000) return "Grandmaster";
    if (score >= 7500) return "Master";
    if (score >= 5000) return "Expert";
    if (score >= 3000) return "Pro";
    if (score >= 1000) return "Challenger";
    return "Beginner";
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="text-yellow-400 w-8 h-8" />;
    if (rank === 2) return <Medal className="text-gray-400 w-8 h-8" />;
    if (rank === 3) return <Award className="text-amber-600 w-8 h-8" />;
    return <span className="text-xl font-bold text-[#0B2A5B]/60 w-8 text-center">{rank}</span>;
  };

  return (
    <DashboardLayout role="student">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-[#0B2A5B] mb-2 flex items-center gap-3">
            <Trophy className="text-[#C2A86A]" /> Global Leaderboard
          </h1>
          <p className="text-[#0B2A5B]/70">See where you stand among top traders</p>
        </div>
        {myStats && (
          <Card className="px-6 py-3 bg-[#0B2A5B] text-white flex items-center gap-4 hidden md:flex">
            <div className="text-right">
              <p className="text-xs text-white/70 uppercase tracking-wider">Your Rank</p>
              <p className="text-2xl font-bold text-[#C2A86A]">#{myStats.rank}</p>
            </div>
            <div className="w-px h-10 bg-white/20 mx-2"></div>
            <div className="text-left">
              <p className="text-xs text-white/70 uppercase tracking-wider">Your Score</p>
              <p className="text-2xl font-bold">{myStats.score.toLocaleString("en-IN")}</p>
            </div>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Leaderboard */}
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <div className="text-center py-12 text-[#0B2A5B]/60">Loading rankings...</div>
          ) : leaderboard.length > 0 ? (
            leaderboard.map((user, idx) => (
              <Card 
                key={user.id || idx} 
                className={`p-4 flex items-center gap-4 transition-all hover:scale-[1.01] ${
                  idx < 3 ? 'bg-gradient-to-r from-white to-[#C2A86A]/5 border-[#C2A86A]/20 shadow-md' : 'bg-white'
                }`}
              >
                <div className="flex items-center justify-center w-12">
                  {getRankIcon(user.rank || idx + 1)}
                </div>
                
                <Avatar className="w-12 h-12 border-2 border-white shadow-sm">
                  <AvatarFallback className="bg-[#C2A86A]/20 text-[#0B2A5B] font-bold">
                    {(user.name || "U").charAt(0)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <h3 className="font-bold text-[#0B2A5B] text-lg">{user.name || user.full_name || "Student"}</h3>
                  <Badge variant="outline" className="text-xs text-[#0B2A5B]/70 border-[#0B2A5B]/20">
                    {user.badge || getBadge(user.score)}
                  </Badge>
                </div>

                <div className="text-right pr-4">
                  <p className="text-2xl font-bold text-[#0B2A5B] flex items-center gap-1">
                    {(user.score || 0).toLocaleString("en-IN")} <Star className="w-4 h-4 text-[#C2A86A]" fill="currentColor" />
                  </p>
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-12 bg-white shadow-lg text-center">
              <AlertCircle className="mx-auto text-[#C2A86A] mb-4" size={48} />
              <h3 className="text-xl font-semibold text-[#0B2A5B] mb-2">No Rankings Yet</h3>
              <p className="text-[#0B2A5B]/60">
                Complete exams and courses to appear on the leaderboard.
              </p>
            </Card>
          )}
        </div>

        {/* Sidebar Analytics */}
        <div className="space-y-6">
          <Card className="p-6 bg-gradient-to-br from-[#0B2A5B] to-[#1a3d7a] text-white shadow-xl">
            <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
              <TrendingUp className="text-[#C2A86A]" /> Your Progress
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-white/70 mb-1">Current Tier</p>
                <p className="text-xl font-semibold text-[#C2A86A]">
                  {myStats ? getBadge(myStats.score) : "Not Ranked"}
                </p>
              </div>
              <div>
                <p className="text-sm text-white/70 mb-1">Total Score</p>
                <p className="text-xl font-semibold">
                  {myStats ? myStats.score.toLocaleString("en-IN") : "—"} XP
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white shadow-lg">
            <h3 className="font-bold text-[#0B2A5B] mb-4">How to earn points?</h3>
            <ul className="space-y-3 text-sm text-[#0B2A5B]/70">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                Complete modules (+50 XP)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                Pass monthly exams (+200 XP)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                Submit assignments on time (+100 XP)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                Profitable simulator trades (+10 XP/trade)
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
