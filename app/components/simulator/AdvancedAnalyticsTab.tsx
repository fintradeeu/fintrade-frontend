import React, { useState, useEffect } from "react";
import { Loader2, TrendingUp, TrendingDown, PieChart, BarChart2, Award, ShieldAlert, DollarSign, Activity, Zap } from "lucide-react";
import api from "../../services/api";

export default function AdvancedAnalyticsTab() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const res = await api.get("/simulator/analytics/advanced");
        setData(res.data);
      } catch (err) {
        console.error("Failed to fetch advanced analytics", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-purple-700">
        <Loader2 className="animate-spin mb-3" size={36} />
        <span className="font-semibold text-sm">Aggregating trade statistics and emotion ratios...</span>
      </div>
    );
  }

  if (!data || data.total_trades === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300 text-gray-500">
        <Activity className="mx-auto mb-3 text-gray-400" size={44} />
        <p className="font-bold text-base text-gray-700">No trading data available for analytics yet.</p>
        <p className="text-xs mt-1 max-w-md mx-auto">
          Execute at least a few paper trades in the Orders tab to generate statistical ratios, equity curves, and emotion breakdowns!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-950 text-white p-6 rounded-xl shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-extrabold flex items-center gap-2">
            <Award className="text-amber-400" size={24} />
            Institutional Grade Performance Analytics
          </h3>
          <p className="text-xs text-indigo-200 mt-1">
            Comprehensive evaluation of risk-adjusted returns, psychological discipline, and win/loss asymmetry.
          </p>
        </div>
        <div className="flex items-center gap-4 bg-white/10 px-4 py-2.5 rounded-lg backdrop-blur-sm border border-white/10">
          <div className="text-right">
            <span className="text-[10px] text-indigo-200 block uppercase font-bold">Sharpe Ratio</span>
            <span className="text-lg font-black text-amber-300">{data.sharpe_ratio}</span>
          </div>
          <div className="h-8 w-[1px] bg-white/20" />
          <div className="text-right">
            <span className="text-[10px] text-indigo-200 block uppercase font-bold">Profit Factor</span>
            <span className="text-lg font-black text-emerald-300">{data.profit_factor}</span>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold">
            <span>Win Rate</span>
            <TrendingUp className="text-emerald-500" size={16} />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-gray-900">{data.win_rate_pct}%</span>
            <span className="text-[11px] text-gray-500 block mt-0.5">{data.winning_trades} Wins / {data.losing_trades} Losses</span>
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden mt-3">
            <div className="bg-emerald-500 h-full" style={{ width: `${data.win_rate_pct}%` }} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold">
            <span>Average Win / Loss</span>
            <BarChart2 className="text-indigo-500" size={16} />
          </div>
          <div className="mt-2 grid grid-cols-2 gap-1 text-sm font-bold">
            <div className="text-emerald-600">+₹{data.avg_win.toLocaleString("en-IN")}</div>
            <div className="text-rose-600">-₹{data.avg_loss.toLocaleString("en-IN")}</div>
          </div>
          <span className="text-[10px] text-gray-400 mt-2 block">Risk/Reward Asymmetry</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold">
            <span>Largest Win / Loss</span>
            <Zap className="text-amber-500" size={16} />
          </div>
          <div className="mt-2 grid grid-cols-2 gap-1 text-sm font-bold">
            <div className="text-emerald-600">+₹{data.largest_win.toLocaleString("en-IN")}</div>
            <div className="text-rose-600">-₹{data.largest_loss.toLocaleString("en-IN")}</div>
          </div>
          <span className="text-[10px] text-gray-400 mt-2 block">Peak single-trade outliers</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold">
            <span>Total Trades Analyzed</span>
            <Activity className="text-purple-500" size={16} />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-gray-900">{data.total_trades}</span>
            <span className="text-[11px] text-emerald-600 font-semibold block mt-0.5">Active Simulator Sample</span>
          </div>
          <span className="text-[10px] text-gray-400 mt-2 block">100% Realtime order matching</span>
        </div>
      </div>

      {/* Psychology & Emotion Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <h4 className="font-bold text-gray-800 text-sm flex items-center gap-2 border-b border-gray-100 pb-3 mb-4">
            <PieChart className="text-purple-600" size={18} />
            Psychological & Emotional State Breakdown
          </h4>
          {Object.keys(data.emotion_breakdown || {}).length === 0 ? (
            <p className="text-xs text-gray-400 italic py-6 text-center">No emotion tags logged yet in the Journal tab.</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(data.emotion_breakdown || {}).map(([emo, count]: [string, any]) => {
                const total = Object.values(data.emotion_breakdown).reduce((a: any, b: any) => a + b, 0) as number;
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={emo} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-gray-700">
                      <span className="capitalize">{emo}</span>
                      <span>{count} trades ({pct}%)</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          ["disciplined", "confident", "patient"].includes(emo)
                            ? "bg-emerald-500"
                            : ["fomo", "greedy"].includes(emo)
                            ? "bg-amber-500"
                            : "bg-rose-500"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Monthly P&L Cards */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <h4 className="font-bold text-gray-800 text-sm flex items-center gap-2 border-b border-gray-100 pb-3 mb-4">
            <DollarSign className="text-emerald-600" size={18} />
            Monthly P&L Distribution
          </h4>
          {Object.keys(data.monthly_pnl || {}).length === 0 ? (
            <p className="text-xs text-gray-400 italic py-6 text-center">No monthly profit history yet.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(data.monthly_pnl || {}).map(([month, val]: [string, any]) => (
                <div key={month} className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700">{month}</span>
                  <span className={`text-sm font-black ${val >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                    {val >= 0 ? "+" : ""}₹{val.toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
