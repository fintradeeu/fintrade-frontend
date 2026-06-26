import { useState, useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import {
  Trophy,
  Medal,
  Award,
  Star,
  TrendingUp,
  AlertCircle,
  Zap,
  Crown,
  Target,
  Flame,
  BookOpen,
  BarChart2,
} from "lucide-react";
import api from "../../services/api";

const BADGE_CONFIG: Record<string, { color: string; bg: string; glow: string; icon: string }> = {
  Grandmaster: { color: "#FF6B35", bg: "rgba(255,107,53,0.15)", glow: "0 0 20px rgba(255,107,53,0.4)", icon: "👑" },
  Master:      { color: "#A855F7", bg: "rgba(168,85,247,0.15)", glow: "0 0 20px rgba(168,85,247,0.4)", icon: "💎" },
  Expert:      { color: "#06B6D4", bg: "rgba(6,182,212,0.15)",  glow: "0 0 20px rgba(6,182,212,0.4)",  icon: "⚡" },
  Pro:         { color: "#10B981", bg: "rgba(16,185,129,0.15)", glow: "0 0 20px rgba(16,185,129,0.4)", icon: "🔥" },
  Challenger:  { color: "#F59E0B", bg: "rgba(245,158,11,0.15)", glow: "0 0 20px rgba(245,158,11,0.4)", icon: "🎯" },
  Beginner:    { color: "#94A3B8", bg: "rgba(148,163,184,0.15)",glow: "0 0 10px rgba(148,163,184,0.3)","icon": "🌱" },
};

const RANK_PODIUM = [
  { medal: "🥇", color: "#FFD700", shadow: "0 0 40px rgba(255,215,0,0.5)",  height: "h-28", order: 2, label: "1st" },
  { medal: "🥈", color: "#C0C0C0", shadow: "0 0 30px rgba(192,192,192,0.4)", height: "h-20", order: 1, label: "2nd" },
  { medal: "🥉", color: "#CD7F32", shadow: "0 0 30px rgba(205,127,50,0.4)",  height: "h-16", order: 3, label: "3rd" },
];

const EARN_POINTS = [
  { icon: <BookOpen size={16} />, label: "Complete modules",          xp: "+50 XP",  color: "#10B981" },
  { icon: <Target    size={16} />, label: "Pass monthly exams",       xp: "+200 XP", color: "#3B82F6" },
  { icon: <Zap       size={16} />, label: "Submit assignments on time",xp: "+100 XP", color: "#A855F7" },
  { icon: <BarChart2 size={16} />, label: "Profitable simulator trades",xp:"+10 XP",  color: "#F59E0B" },
];

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [myStats, setMyStats] = useState<{ rank: number; score: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadLeaderboard(); }, []);

  const loadLeaderboard = async () => {
    try {
      const res = await api.get("/dashboard/leaderboard");
      setLeaderboard(res.data.leaderboard || res.data || []);
      if (res.data.my_rank) {
        setMyStats({ rank: res.data.my_rank, score: res.data.my_score || 0 });
      }
    } catch {
      try {
        const examRes = await api.get("/exams/results/analysis");
        if (examRes.data) {
          const userStored = localStorage.getItem("user");
          const userName = userStored ? JSON.parse(userStored).full_name : "You";
          const overallScore = examRes.data.overall_percentage || 0;
          setMyStats({ rank: 1, score: Math.round(overallScore * 100) });
          setLeaderboard([
            { id: 1, name: userName, score: Math.round(overallScore * 100), rank: 1, badge: getBadge(overallScore * 100) }
          ]);
        }
      } catch { /* no data */ }
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

  const getBadgeCfg = (badge: string) => BADGE_CONFIG[badge] || BADGE_CONFIG["Beginner"];
  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  return (
    <DashboardLayout role="student">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        .lb-root { font-family: 'Inter', sans-serif; }

        .lb-hero {
          background: linear-gradient(135deg, #0B2A5B 0%, #1E3A8A 40%, #0B2A5B 100%);
          border-radius: 24px;
          padding: 40px 36px 32px;
          margin-bottom: 32px;
          position: relative;
          overflow: hidden;
        }
        .lb-hero::before {
          content: '';
          position: absolute; inset: 0;
          background: radial-gradient(ellipse at 80% 20%, rgba(194,168,106,0.25) 0%, transparent 60%),
                      radial-gradient(ellipse at 20% 80%, rgba(59,130,246,0.15) 0%, transparent 60%);
        }
        .lb-hero-content { position: relative; z-index: 1; }

        .lb-grid { display: grid; grid-template-columns: 1fr 340px; gap: 24px; align-items: start; }
        @media (max-width: 1024px) { .lb-grid { grid-template-columns: 1fr; } }

        /* Podium */
        .podium-wrap {
          display: flex; align-items: flex-end; justify-content: center; gap: 16px;
          margin: 32px 0 8px; height: 220px;
        }
        .podium-col { display: flex; flex-direction: column; align-items: center; gap: 8px; }
        .podium-avatar {
          width: 64px; height: 64px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 22px; font-weight: 800; color: white;
          border: 3px solid rgba(255,255,255,0.3);
          background: rgba(255,255,255,0.12);
          backdrop-filter: blur(8px);
          flex-shrink: 0;
          position: relative;
        }
        .podium-medal { position: absolute; top: -10px; right: -10px; font-size: 20px; }
        .podium-name { font-size: 13px; font-weight: 600; color: #fff; text-align: center; max-width: 90px; line-height: 1.3; }
        .podium-score { font-size: 12px; color: rgba(255,255,255,0.7); }
        .podium-base {
          border-radius: 12px 12px 0 0;
          width: 100px;
          display: flex; align-items: flex-end; justify-content: center; padding-bottom: 12px;
          font-weight: 800; font-size: 22px; color: rgba(255,255,255,0.6);
        }

        /* Row cards */
        .lb-row {
          display: flex; align-items: center; gap: 16px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px; padding: 14px 20px;
          transition: all 0.2s ease;
          cursor: default;
        }
        .lb-row:hover {
          background: rgba(255,255,255,0.06);
          border-color: rgba(194,168,106,0.3);
          transform: translateX(4px);
        }
        .lb-row.is-me {
          background: rgba(194,168,106,0.08);
          border-color: rgba(194,168,106,0.4);
          box-shadow: 0 0 0 1px rgba(194,168,106,0.2);
        }
        .lb-rank-num { font-size: 18px; font-weight: 800; color: rgba(255,255,255,0.4); width: 32px; text-align: center; flex-shrink: 0; }
        .lb-avatar {
          width: 44px; height: 44px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 18px; color: white;
          flex-shrink: 0;
        }
        .lb-name { font-weight: 600; font-size: 15px; color: #fff; }
        .lb-badge-pill {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 2px 10px; border-radius: 999px;
          font-size: 11px; font-weight: 600; letter-spacing: 0.02em;
        }
        .lb-score { font-size: 20px; font-weight: 800; color: #C2A86A; display: flex; align-items: center; gap: 4px; }

        /* Sidebar */
        .sb-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 20px; padding: 24px;
        }
        .sb-stat-box {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px; padding: 16px;
          text-align: center;
        }

        .skeleton { background: rgba(255,255,255,0.06); border-radius: 12px; }
        @keyframes shimmer { 0%{opacity:.4} 50%{opacity:.8} 100%{opacity:.4} }
        .skeleton { animation: shimmer 1.4s ease infinite; }

        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .fade-up { animation: fadeUp 0.4s ease forwards; }
      `}</style>

      <div className="lb-root" style={{
        background: "linear-gradient(135deg, #060f1e 0%, #0a1628 50%, #060f1e 100%)",
        minHeight: "100vh", borderRadius: 20, padding: 24, margin: -24
      }}>
        {/* ── Hero Banner ── */}
        <div className="lb-hero">
          <div className="lb-hero-content">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 14,
                    background: "linear-gradient(135deg, #C2A86A, #E8C97A)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: "0 0 24px rgba(194,168,106,0.5)"
                  }}>
                    <Trophy size={24} color="#0B2A5B" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h1 style={{ color: "#fff", fontWeight: 900, fontSize: 28, margin: 0, letterSpacing: "-0.5px" }}>
                      Global Leaderboard
                    </h1>
                    <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, margin: 0 }}>
                      Real-time rankings among all traders
                    </p>
                  </div>
                </div>
              </div>

              {myStats && (
                <div style={{ display: "flex", gap: 12 }}>
                  <div style={{
                    background: "rgba(255,255,255,0.08)", backdropFilter: "blur(12px)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: 16, padding: "14px 22px", textAlign: "center", minWidth: 100
                  }}>
                    <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 4px" }}>Your Rank</p>
                    <p style={{ color: "#C2A86A", fontWeight: 900, fontSize: 28, margin: 0, lineHeight: 1 }}>#{myStats.rank}</p>
                  </div>
                  <div style={{
                    background: "rgba(255,255,255,0.08)", backdropFilter: "blur(12px)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: 16, padding: "14px 22px", textAlign: "center", minWidth: 100
                  }}>
                    <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 4px" }}>Your XP</p>
                    <p style={{ color: "#fff", fontWeight: 900, fontSize: 28, margin: 0, lineHeight: 1 }}>{myStats.score.toLocaleString()}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Podium for Top 3 */}
            {!loading && top3.length >= 2 && (
              <div className="podium-wrap">
                {/* Reorder: 2nd, 1st, 3rd */}
                {[top3[1], top3[0], top3[2]].filter(Boolean).map((user, i) => {
                  const podiumIdx = i === 0 ? 1 : i === 1 ? 0 : 2;
                  const cfg = RANK_PODIUM[podiumIdx];
                  const badgeCfg = getBadgeCfg(user.badge || getBadge(user.score));
                  const heights = ["140px", "180px", "110px"];
                  const avatarSizes = ["56px", "72px", "52px"];
                  return (
                    <div key={user.id} className="podium-col" style={{ order: cfg.order }}>
                      <div style={{
                        width: avatarSizes[i], height: avatarSizes[i], borderRadius: "50%",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontWeight: 800, fontSize: i === 1 ? 26 : 20, color: "white",
                        background: `linear-gradient(135deg, ${badgeCfg.color}99, ${badgeCfg.color}55)`,
                        border: `3px solid ${cfg.color}`,
                        boxShadow: cfg.shadow,
                        position: "relative", flexShrink: 0
                      }}>
                        {(user.name || "?").charAt(0).toUpperCase()}
                        <span style={{ position: "absolute", top: -10, right: -10, fontSize: 20 }}>{cfg.medal}</span>
                      </div>
                      <p className="podium-name">{user.name || user.full_name || "Student"}</p>
                      <p className="podium-score">{(user.score || 0).toLocaleString()} XP</p>
                      <div style={{
                        background: `linear-gradient(180deg, ${cfg.color}33 0%, ${cfg.color}11 100%)`,
                        border: `1px solid ${cfg.color}44`,
                        borderRadius: "12px 12px 0 0",
                        width: 96, height: heights[i],
                        display: "flex", alignItems: "flex-end", justifyContent: "center",
                        paddingBottom: 12, fontWeight: 800, fontSize: 20, color: `${cfg.color}90`
                      }}>
                        {cfg.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Main Grid ── */}
        <div className="lb-grid">
          {/* Left: Rankings List */}
          <div>
            {/* Section label */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{ height: 2, flex: 1, background: "linear-gradient(90deg, #C2A86A44, transparent)" }} />
              <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                Full Rankings
              </span>
              <div style={{ height: 2, flex: 1, background: "linear-gradient(90deg, transparent, #C2A86A44)" }} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="skeleton" style={{ height: 72, marginBottom: 0 }} />
                ))
              ) : leaderboard.length > 0 ? (
                leaderboard.map((user, idx) => {
                  const badge = user.badge || getBadge(user.score);
                  const cfg = getBadgeCfg(badge);
                  const colors = ["#C2A86A", "#94A3B8", "#CD7F32"];
                  const avatarColor = idx < 3 ? colors[idx] : "#3B82F6";
                  const storedUser = localStorage.getItem("user");
                  const myId = storedUser ? JSON.parse(storedUser).id : null;
                  const isMe = user.id === myId;

                  return (
                    <div
                      key={user.id || idx}
                      className={`lb-row fade-up ${isMe ? "is-me" : ""}`}
                      style={{ animationDelay: `${idx * 40}ms` }}
                    >
                      {/* Rank */}
                      <div className="lb-rank-num">
                        {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${user.rank || idx + 1}`}
                      </div>

                      {/* Avatar */}
                      <div className="lb-avatar" style={{
                        background: `linear-gradient(135deg, ${avatarColor}cc, ${avatarColor}66)`,
                        border: `2px solid ${avatarColor}55`,
                        boxShadow: idx < 3 ? `0 0 16px ${avatarColor}44` : "none"
                      }}>
                        {(user.name || "?").charAt(0).toUpperCase()}
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          <span className="lb-name">{user.name || user.full_name || "Student"}</span>
                          {isMe && (
                            <span style={{
                              background: "rgba(194,168,106,0.2)", border: "1px solid rgba(194,168,106,0.4)",
                              color: "#C2A86A", fontSize: 10, fontWeight: 700, padding: "2px 8px",
                              borderRadius: 999, letterSpacing: "0.08em"
                            }}>YOU</span>
                          )}
                        </div>
                        <span className="lb-badge-pill" style={{
                          background: cfg.bg, color: cfg.color,
                          border: `1px solid ${cfg.color}44`, marginTop: 4
                        }}>
                          {cfg.icon} {badge}
                        </span>
                      </div>

                      {/* Score */}
                      <div className="lb-score">
                        {(user.score || 0).toLocaleString()}
                        <Star size={14} fill="#C2A86A" color="#C2A86A" />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{
                  textAlign: "center", padding: "64px 32px",
                  background: "rgba(255,255,255,0.03)", border: "1px dashed rgba(255,255,255,0.1)",
                  borderRadius: 20
                }}>
                  <AlertCircle size={48} color="rgba(194,168,106,0.5)" style={{ marginBottom: 16 }} />
                  <h3 style={{ color: "rgba(255,255,255,0.7)", fontWeight: 700, fontSize: 20, margin: "0 0 8px" }}>No Rankings Yet</h3>
                  <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 14, margin: 0 }}>
                    Complete exams and courses to appear on the leaderboard.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right: Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* My Progress Card */}
            <div className="sb-card">
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: "linear-gradient(135deg, #10B98133, #10B98166)",
                  border: "1px solid #10B98144",
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  <TrendingUp size={18} color="#10B981" />
                </div>
                <h3 style={{ color: "#fff", fontWeight: 700, fontSize: 17, margin: 0 }}>Your Progress</h3>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                <div className="sb-stat-box">
                  <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, margin: "0 0 6px", letterSpacing: "0.08em", textTransform: "uppercase" }}>Rank</p>
                  <p style={{ color: "#C2A86A", fontWeight: 900, fontSize: 28, margin: 0, lineHeight: 1 }}>
                    {myStats ? `#${myStats.rank}` : "—"}
                  </p>
                </div>
                <div className="sb-stat-box">
                  <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, margin: "0 0 6px", letterSpacing: "0.08em", textTransform: "uppercase" }}>XP</p>
                  <p style={{ color: "#fff", fontWeight: 900, fontSize: 28, margin: 0, lineHeight: 1 }}>
                    {myStats ? myStats.score.toLocaleString() : "—"}
                  </p>
                </div>
              </div>

              {/* Tier badge */}
              {myStats && (() => {
                const badge = getBadge(myStats.score);
                const cfg = getBadgeCfg(badge);
                return (
                  <div style={{
                    background: cfg.bg, border: `1px solid ${cfg.color}44`,
                    borderRadius: 12, padding: "12px 16px",
                    display: "flex", alignItems: "center", gap: 10
                  }}>
                    <span style={{ fontSize: 28 }}>{cfg.icon}</span>
                    <div>
                      <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, margin: "0 0 2px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Current Tier</p>
                      <p style={{ color: cfg.color, fontWeight: 700, fontSize: 17, margin: 0 }}>{badge}</p>
                    </div>
                  </div>
                );
              })()}

              {!myStats && (
                <div style={{
                  background: "rgba(255,255,255,0.04)", border: "1px dashed rgba(255,255,255,0.1)",
                  borderRadius: 12, padding: "16px", textAlign: "center"
                }}>
                  <Crown size={28} color="rgba(194,168,106,0.4)" style={{ marginBottom: 8 }} />
                  <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, margin: 0 }}>Complete activities to get ranked!</p>
                </div>
              )}
            </div>

            {/* How to earn XP */}
            <div className="sb-card">
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: "linear-gradient(135deg, #F59E0B33, #F59E0B66)",
                  border: "1px solid #F59E0B44",
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  <Flame size={18} color="#F59E0B" />
                </div>
                <h3 style={{ color: "#fff", fontWeight: 700, fontSize: 17, margin: 0 }}>How to Earn XP?</h3>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {EARN_POINTS.map((item, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 12, padding: "10px 14px"
                  }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                      background: `${item.color}22`, border: `1px solid ${item.color}44`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: item.color
                    }}>
                      {item.icon}
                    </div>
                    <span style={{ flex: 1, color: "rgba(255,255,255,0.65)", fontSize: 13, lineHeight: 1.4 }}>
                      {item.label}
                    </span>
                    <span style={{
                      color: item.color, fontWeight: 700, fontSize: 13,
                      background: `${item.color}18`, borderRadius: 8, padding: "2px 8px", flexShrink: 0
                    }}>
                      {item.xp}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tier guide */}
            <div className="sb-card">
              <h3 style={{ color: "#fff", fontWeight: 700, fontSize: 17, margin: "0 0 16px", display: "flex", alignItems: "center", gap: 8 }}>
                <Crown size={18} color="#C2A86A" /> Tier Guide
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {Object.entries(BADGE_CONFIG).map(([name, cfg]) => (
                  <div key={name} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "8px 12px", borderRadius: 10,
                    background: cfg.bg, border: `1px solid ${cfg.color}33`
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 16 }}>{cfg.icon}</span>
                      <span style={{ color: cfg.color, fontWeight: 600, fontSize: 13 }}>{name}</span>
                    </div>
                    <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 11 }}>
                      {name === "Grandmaster" ? "≥ 9000" :
                       name === "Master"      ? "≥ 7500" :
                       name === "Expert"      ? "≥ 5000" :
                       name === "Pro"         ? "≥ 3000" :
                       name === "Challenger"  ? "≥ 1000" : "< 1000"} XP
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
