import { useState, useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  TrendingUp,
  TrendingDown,
  IndianRupee,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Area,
} from "recharts";
import api from "../../services/api";

// Static instrument list — prices sent by user at order time (mock market)
const defaultInstruments = [
  { symbol: "NIFTY 50", price: 58720, change: 2.4, volume: "245M" },
  { symbol: "BANK NIFTY", price: 42580, change: 1.8, volume: "187M" },
  { symbol: "RELIANCE", price: 2456, change: -0.5, volume: "45M" },
  { symbol: "TCS", price: 3842, change: 1.2, volume: "32M" },
  { symbol: "INFY", price: 1567, change: 0.8, volume: "28M" },
  { symbol: "HDFC BANK", price: 1645, change: -0.3, volume: "52M" },
];

export default function TradingSimulator() {
  const [selectedInstrument, setSelectedInstrument] = useState(defaultInstruments[0]);
  const [orderType, setOrderType] = useState<"buy" | "sell">("buy");
  const [quantity, setQuantity] = useState("50");

  // API state
  const [account, setAccount] = useState<any>(null);
  const [positions, setPositions] = useState<any[]>([]);
  const [trades, setTrades] = useState<any[]>([]);
  const [performance, setPerformance] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [startingAccount, setStartingAccount] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Try to get existing positions and trades
      const [posRes, tradeRes, perfRes] = await Promise.allSettled([
        api.get("/simulator/positions"),
        api.get("/simulator/trades"),
        api.get("/simulator/performance"),
      ]);

      if (posRes.status === "fulfilled") setPositions(posRes.value.data);
      if (tradeRes.status === "fulfilled") setTrades(tradeRes.value.data);
      if (perfRes.status === "fulfilled") {
        setPerformance(perfRes.value.data);
        // If we get performance data, the account exists
        setAccount({ exists: true });
      }
    } catch {
      // No account yet — will show start button
    }
    setLoading(false);
  };

  const handleStartAccount = async () => {
    setStartingAccount(true);
    try {
      const res = await api.post("/simulator/start", {});
      setAccount(res.data);
      await loadData();
    } catch (err: any) {
      const detail = err.response?.data?.detail || err.message;
      if (detail.includes("already") || err.response?.status === 409) {
        setAccount({ exists: true });
        await loadData();
      } else {
        alert("Failed to start simulator: " + detail);
      }
    }
    setStartingAccount(false);
  };

  const handlePlaceOrder = async () => {
    setPlacing(true);
    try {
      await api.post("/simulator/trade", {
        symbol: selectedInstrument.symbol,
        side: orderType,
        quantity: parseFloat(quantity),
        price: selectedInstrument.price,
      });
      await loadData(); // Refresh positions and trades
    } catch (err: any) {
      alert("Order failed: " + (err.response?.data?.detail || err.message));
    }
    setPlacing(false);
  };

  const handleClosePosition = async (positionId: number) => {
    try {
      // Use the instrument price for exit
      const pos = positions.find((p) => p.id === positionId);
      const instrument = defaultInstruments.find((i) => i.symbol === pos?.symbol);
      await api.post("/simulator/close", {
        position_id: positionId,
        exit_price: instrument?.price || pos?.entry_price || 0,
      });
      await loadData();
    } catch (err: any) {
      alert("Close failed: " + (err.response?.data?.detail || err.message));
    }
  };

  // Compute portfolio from performance data
  const initialCapital = account?.initial_balance || 500000;
  const totalPnl = performance?.total_pnl || 0;
  const portfolioValue = initialCapital + totalPnl;
  const pnlPercentage = initialCapital > 0 ? ((totalPnl / initialCapital) * 100).toFixed(2) : "0.00";

  // Build chart from trades
  const chartData = trades.slice(-10).map((t: any, i: number) => ({
    trade: `#${i + 1}`,
    price: t.entry_price,
    pnl: t.pnl || 0,
  }));

  if (loading) {
    return (
      <DashboardLayout role="student">
        <div className="text-center py-12 text-[#0B2A5B]/60">Loading simulator...</div>
      </DashboardLayout>
    );
  }

  // No account yet — show start screen
  if (!account) {
    return (
      <DashboardLayout role="student">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#0B2A5B] mb-2">Trading Simulator</h1>
          <p className="text-[#0B2A5B]/70">Practice trading with virtual capital</p>
        </div>
        <Card className="p-12 bg-white shadow-lg text-center max-w-2xl mx-auto">
          <IndianRupee className="mx-auto text-[#C2A86A] mb-4" size={64} />
          <h2 className="text-2xl font-bold text-[#0B2A5B] mb-4">Start Your Trading Journey</h2>
          <p className="text-[#0B2A5B]/70 mb-8">
            Create a virtual trading account with ₹5,00,000 capital. Practice trading stocks and indices risk-free.
          </p>
          <Button
            onClick={handleStartAccount}
            disabled={startingAccount}
            className="bg-[#0B2A5B] text-[#F4F1EA] hover:bg-[#1a3d7a] px-8 py-6 text-lg"
          >
            {startingAccount ? <><Loader2 className="mr-2 animate-spin" size={20} /> Creating Account...</> : "Create Virtual Account"}
          </Button>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="student">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0B2A5B] mb-2">Trading Simulator</h1>
        <p className="text-[#0B2A5B]/70">Practice trading with ₹5,00,000 virtual capital</p>
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="p-6 bg-white shadow-lg">
          <p className="text-sm text-[#0B2A5B]/60 mb-1">Portfolio Value</p>
          <p className="text-3xl font-bold text-[#0B2A5B] flex items-center gap-1">
            <IndianRupee size={24} />
            {Math.round(portfolioValue).toLocaleString("en-IN")}
          </p>
        </Card>
        <Card className="p-6 bg-white shadow-lg">
          <p className="text-sm text-[#0B2A5B]/60 mb-1">Total P&L</p>
          <p className={`text-3xl font-bold flex items-center gap-1 ${totalPnl >= 0 ? "text-green-600" : "text-red-600"}`}>
            {totalPnl >= 0 ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
            ₹{Math.abs(Math.round(totalPnl)).toLocaleString("en-IN")}
          </p>
          <p className={`text-sm ${totalPnl >= 0 ? "text-green-600" : "text-red-600"}`}>
            {totalPnl >= 0 ? "+" : ""}{pnlPercentage}%
          </p>
        </Card>
        <Card className="p-6 bg-white shadow-lg">
          <p className="text-sm text-[#0B2A5B]/60 mb-1">Win Rate</p>
          <p className="text-3xl font-bold text-[#C2A86A]">
            {performance ? `${Math.round(performance.win_rate)}%` : "—"}
          </p>
        </Card>
        <Card className="p-6 bg-white shadow-lg">
          <p className="text-sm text-[#0B2A5B]/60 mb-1">Open Positions</p>
          <p className="text-3xl font-bold text-[#0B2A5B]">{positions.length}</p>
        </Card>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Instruments List */}
        <Card className="lg:col-span-1 p-4 bg-white shadow-lg h-fit">
          <h3 className="font-semibold text-[#0B2A5B] mb-4">Instruments</h3>
          <div className="space-y-2">
            {defaultInstruments.map((instrument) => (
              <button
                key={instrument.symbol}
                onClick={() => setSelectedInstrument(instrument)}
                className={`w-full p-3 rounded-lg text-left transition-all ${
                  selectedInstrument.symbol === instrument.symbol
                    ? "bg-[#C2A86A]/10 border-2 border-[#C2A86A]"
                    : "bg-[#F4F1EA] hover:bg-[#e8e4d9]"
                }`}
              >
                <p className="font-semibold text-[#0B2A5B] text-sm">{instrument.symbol}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm">₹{instrument.price.toLocaleString("en-IN")}</span>
                  <span className={`text-xs flex items-center gap-1 ${instrument.change >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {instrument.change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {Math.abs(instrument.change)}%
                  </span>
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Trade PnL Chart */}
          {chartData.length > 0 && (
            <Card className="p-6 bg-white shadow-lg">
              <h3 className="text-xl font-semibold text-[#0B2A5B] mb-4">Trade History Chart</h3>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={chartData}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C2A86A" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#C2A86A" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#0B2A5B10" />
                  <XAxis dataKey="trade" stroke="#0B2A5B" style={{ fontSize: "12px" }} />
                  <YAxis stroke="#0B2A5B" style={{ fontSize: "12px" }} />
                  <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #C2A86A", borderRadius: "8px" }} />
                  <Bar dataKey="pnl" fill="#0B2A5B" opacity={0.5} />
                  <Line type="monotone" dataKey="price" stroke="#C2A86A" strokeWidth={2} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </Card>
          )}

          {/* Order Panel */}
          <Card className="p-6 bg-white shadow-lg">
            <h3 className="text-xl font-semibold text-[#0B2A5B] mb-6">Place Order — {selectedInstrument.symbol}</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label>Order Type</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <Button onClick={() => setOrderType("buy")} className={orderType === "buy" ? "bg-green-600 text-white" : "bg-white text-green-600 border-2 border-green-600"}>BUY</Button>
                    <Button onClick={() => setOrderType("sell")} className={orderType === "sell" ? "bg-red-600 text-white" : "bg-white text-red-600 border-2 border-red-600"}>SELL</Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input id="quantity" type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="mt-2 bg-[#F4F1EA] border-[#0B2A5B]/20" />
                </div>
                <div>
                  <Label>Price</Label>
                  <Input value={`₹${selectedInstrument.price.toLocaleString("en-IN")}`} disabled className="mt-2 bg-[#F4F1EA] border-[#0B2A5B]/20" />
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-[#F4F1EA] p-4 rounded-lg">
                  <h4 className="font-semibold text-[#0B2A5B] mb-3">Order Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-[#0B2A5B]/70">Instrument:</span><span className="font-semibold text-[#0B2A5B]">{selectedInstrument.symbol}</span></div>
                    <div className="flex justify-between"><span className="text-[#0B2A5B]/70">Side:</span><span className="font-semibold text-[#0B2A5B] uppercase">{orderType}</span></div>
                    <div className="flex justify-between"><span className="text-[#0B2A5B]/70">Quantity:</span><span className="font-semibold text-[#0B2A5B]">{quantity} units</span></div>
                    <div className="border-t border-[#0B2A5B]/10 pt-2 flex justify-between">
                      <span className="text-[#0B2A5B]">Total Value:</span>
                      <span className="font-bold text-[#C2A86A]">₹{(selectedInstrument.price * parseFloat(quantity || "0")).toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={handlePlaceOrder}
                  disabled={placing}
                  className={`w-full ${orderType === "buy" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"} text-white shadow-lg`}
                  size="lg"
                >
                  {placing ? <><Loader2 className="mr-2 animate-spin" size={16} /> Placing...</> : `${orderType.toUpperCase()} ${selectedInstrument.symbol}`}
                </Button>
              </div>
            </div>
          </Card>

          {/* Open Positions */}
          {positions.length > 0 && (
            <Card className="p-6 bg-white shadow-lg">
              <h3 className="font-semibold text-[#0B2A5B] mb-4">Open Positions</h3>
              <div className="space-y-2">
                {positions.map((pos) => (
                  <div key={pos.id} className="flex items-center justify-between p-3 bg-[#F4F1EA] rounded-lg">
                    <div>
                      <p className="font-semibold text-[#0B2A5B] text-sm">{pos.symbol}</p>
                      <p className="text-xs text-[#0B2A5B]/60">{(pos.side || '').toUpperCase()} {pos.quantity} @ ₹{pos.entry_price.toLocaleString("en-IN")}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-semibold ${pos.unrealized_pnl >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {pos.unrealized_pnl >= 0 ? "+" : ""}₹{Math.round(pos.unrealized_pnl).toLocaleString("en-IN")}
                      </span>
                      <Button size="sm" variant="outline" onClick={() => handleClosePosition(pos.id)} className="border-red-300 text-red-600 hover:bg-red-50">Close</Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Risk Rules & Trade History */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6 bg-yellow-50 border-yellow-200 shadow-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="text-yellow-600 flex-shrink-0" size={24} />
                <div>
                  <h3 className="font-semibold text-yellow-900 mb-3">Risk Management Rules</h3>
                  <ul className="space-y-2 text-sm text-yellow-800">
                    <li>• Daily loss limit: ₹10,000</li>
                    <li>• Stop loss mandatory on all positions</li>
                    <li>• Max position size: 10% of capital</li>
                    <li>• Risk-reward ratio: Minimum 1:2</li>
                  </ul>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-white shadow-lg">
              <h3 className="font-semibold text-[#0B2A5B] mb-4">Recent Trades</h3>
              <div className="space-y-2">
                {trades.length > 0 ? (
                  trades.slice(-5).reverse().map((trade) => (
                    <div key={trade.id} className="flex items-center justify-between p-3 bg-[#F4F1EA] rounded-lg">
                      <div>
                        <p className="font-semibold text-[#0B2A5B] text-sm">{trade.symbol}</p>
                        <p className="text-xs text-[#0B2A5B]/60">{(trade.side || '').toUpperCase()} {trade.quantity} @ ₹{trade.entry_price}</p>
                      </div>
                      <div className="text-right">
                        {trade.status === "closed" ? (
                          <span className={`text-sm font-semibold ${(trade.pnl || 0) >= 0 ? "text-green-600" : "text-red-600"}`}>
                            {(trade.pnl || 0) >= 0 ? "+" : ""}₹{Math.round(trade.pnl || 0).toLocaleString("en-IN")}
                          </span>
                        ) : (
                          <Badge className="bg-blue-100 text-blue-700">Open</Badge>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-[#0B2A5B]/60 text-center py-4">No trades yet. Place your first order!</p>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
