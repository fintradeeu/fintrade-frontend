import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Loader2, Plus, Zap, Activity, CheckCircle2, AlertTriangle, BarChart3, TrendingUp, X } from "lucide-react";
import api from "../../services/api";

interface Strategy {
  id: number;
  name: str;
  description: str;
  entry_rules: str;
  exit_rules: str;
  timeframe: str;
  win_rate: number;
  profit_factor: number;
  backtest_results?: any;
  created_at: str;
}

export default function StrategyBuilderTab() {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [testingId, setTestingId] = useState<number | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [timeframe, setTimeframe] = useState("1day");
  const [entryRules, setEntryRules] = useState("RSI < 30 AND EMA(20) crossover above EMA(50)");
  const [exitRules, setExitRules] = useState("RSI > 70 OR Target 3% reached OR StopLoss 1.5% hit");

  const fetchStrategies = async () => {
    setLoading(true);
    try {
      const res = await api.get("/simulator/strategies");
      setStrategies(res.data || []);
    } catch (err) {
      console.error("Failed to fetch strategies", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStrategies();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/simulator/strategies", {
        name,
        description,
        timeframe,
        entry_rules: entryRules,
        exit_rules: exitRules,
      });
      setShowAdd(false);
      setName("");
      setDescription("");
      fetchStrategies();
    } catch (err) {
      console.error("Error creating strategy", err);
      alert("Failed to save strategy.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleBacktest = async (id: number) => {
    setTestingId(id);
    try {
      const res = await api.post(`/simulator/strategies/${id}/backtest`);
      setStrategies(strategies.map(s => s.id === id ? { ...s, win_rate: res.data.win_rate, profit_factor: res.data.profit_factor, backtest_results: res.data.backtest_results } : s));
    } catch (err) {
      console.error("Backtest error", err);
      alert("Failed to run backtest against historical data.");
    } finally {
      setTestingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 text-white p-5 rounded-xl shadow-lg">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Zap className="text-amber-400" size={22} />
            Strategy Laboratory & Backtesting Engine
          </h3>
          <p className="text-xs text-slate-300 mt-1">
            Design systematic trading rules, backtest against historical market candles, and evaluate statistical robustness.
          </p>
        </div>
        <Button
          onClick={() => setShowAdd(!showAdd)}
          className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer"
        >
          {showAdd ? <X size={16} /> : <Plus size={16} />}
          {showAdd ? "Close Lab" : "New Strategy Setup"}
        </Button>
      </div>

      {/* Add Form */}
      {showAdd && (
        <form onSubmit={handleCreate} className="bg-white border border-purple-200 p-5 rounded-xl shadow-md space-y-4 animate-in fade-in duration-200">
          <h4 className="font-bold text-gray-800 text-sm border-b pb-2">Design Custom Trading Strategy</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Strategy Name</label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Golden Cross RSI Momentum" required />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Timeframe</label>
              <select
                value={timeframe}
                onChange={e => setTimeframe(e.target.value)}
                className="w-full h-10 px-3 border border-gray-300 rounded-md bg-white text-sm font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
              >
                <option value="1min">1 Minute Scalping</option>
                <option value="5min">5 Minute Intraday</option>
                <option value="15min">15 Minute Intraday</option>
                <option value="1h">1 Hour Swing</option>
                <option value="1day">Daily Swing / Positional</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">Brief Description</label>
            <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="What market condition is this strategy designed for?" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-emerald-700 block mb-1 font-bold">🟢 Entry Rules (Buy Signals)</label>
              <textarea
                value={entryRules}
                onChange={e => setEntryRules(e.target.value)}
                rows={3}
                className="w-full p-3 border border-emerald-200 bg-emerald-50/30 rounded-md text-sm font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-rose-700 block mb-1 font-bold">🔴 Exit Rules (Sell Signals / Stop Loss)</label>
              <textarea
                value={exitRules}
                onChange={e => setExitRules(e.target.value)}
                rows={3}
                className="w-full p-3 border border-rose-200 bg-rose-50/30 rounded-md text-sm font-mono focus:ring-2 focus:ring-rose-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting} className="bg-purple-700 hover:bg-purple-800 text-white font-bold cursor-pointer">
              {submitting ? <Loader2 className="animate-spin mr-2" size={16} /> : <CheckCircle2 className="mr-1" size={16} />}
              Save & Prepare Backtest
            </Button>
          </div>
        </form>
      )}

      {/* Strategies List */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-purple-700" size={32} /></div>
      ) : strategies.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300 text-gray-500">
          <BarChart3 className="mx-auto mb-3 text-gray-400" size={40} />
          <p className="font-semibold">No strategies in your lab yet.</p>
          <p className="text-xs mt-1">Create your first systematic strategy to run historical backtests!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {strategies.map((st) => (
            <div key={st.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 mb-3 border-b border-gray-100 pb-3">
                  <div>
                    <h4 className="font-bold text-gray-900 text-base">{st.name}</h4>
                    <span className="text-[11px] font-semibold bg-purple-100 text-purple-800 px-2 py-0.5 rounded uppercase mt-1 inline-block">
                      Timeframe: {st.timeframe}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleBacktest(st.id)}
                    disabled={testingId === st.id}
                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold shadow cursor-pointer text-xs h-8 flex items-center gap-1.5"
                  >
                    {testingId === st.id ? <Loader2 className="animate-spin" size={14} /> : <Zap size={14} className="fill-current" />}
                    {testingId === st.id ? "Backtesting..." : "Run Backtest"}
                  </Button>
                </div>

                {st.description && <p className="text-xs text-gray-600 mb-4 italic">{st.description}</p>}

                <div className="space-y-2 mb-4 text-xs font-mono">
                  <div className="p-2 bg-emerald-50 rounded border border-emerald-100">
                    <span className="font-bold text-emerald-800 block text-[10px] uppercase font-sans">Entry Setup</span>
                    <span className="text-emerald-950">{st.entry_rules}</span>
                  </div>
                  <div className="p-2 bg-rose-50 rounded border border-rose-100">
                    <span className="font-bold text-rose-800 block text-[10px] uppercase font-sans">Exit Rules</span>
                    <span className="text-rose-950">{st.exit_rules}</span>
                  </div>
                </div>
              </div>

              {/* Backtest Results Card */}
              {st.backtest_results ? (
                <div className="bg-slate-900 text-white rounded-lg p-3 text-xs mt-auto space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                    <span className="font-bold text-amber-400 flex items-center gap-1">
                      <Activity size={14} /> Backtest Report ({st.backtest_results.trades_analyzed} Trades)
                    </span>
                    <span className={`font-bold ${st.backtest_results.simulated_pnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                      {st.backtest_results.simulated_pnl >= 0 ? "+" : ""}₹{st.backtest_results.simulated_pnl}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center pt-1">
                    <div className="bg-slate-800/80 p-1.5 rounded">
                      <span className="text-[10px] text-slate-400 block">Win Rate</span>
                      <span className="font-bold text-emerald-400 text-sm">{st.win_rate}%</span>
                    </div>
                    <div className="bg-slate-800/80 p-1.5 rounded">
                      <span className="text-[10px] text-slate-400 block">Profit Factor</span>
                      <span className="font-bold text-indigo-300 text-sm">{st.profit_factor}</span>
                    </div>
                    <div className="bg-slate-800/80 p-1.5 rounded">
                      <span className="text-[10px] text-slate-400 block">Max Drawdown</span>
                      <span className="font-bold text-rose-400 text-sm">{st.backtest_results.max_drawdown}%</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-3 bg-gray-50 rounded-lg text-xs text-gray-400 font-medium border border-dashed border-gray-200 mt-auto">
                  Click "Run Backtest" to test against 12 Months historical data
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
