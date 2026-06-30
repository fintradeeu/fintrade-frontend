import { useState, useEffect, useRef } from "react";
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
  Bell,
  Plus,
  RefreshCcw,
  Trash2,
  Layers,
  ArrowRight,
  TrendingUp as GainIcon,
  ChevronRight,
  DollarSign
} from "lucide-react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import api from "../../services/api";

export default function TradingSimulator() {
  const [marketData, setMarketData] = useState<any[]>([]);
  const [selectedInstrument, setSelectedInstrument] = useState<any>(null);
  const [orderType, setOrderType] = useState<"buy" | "sell">("buy");
  const [orderStyle, setOrderStyle] = useState<"market" | "limit">("market");
  
  const [quantity, setQuantity] = useState("50");
  const [limitPrice, setLimitPrice] = useState("");
  const [stopLoss, setStopLoss] = useState("");
  const [takeProfit, setTakeProfit] = useState("");

  // API state
  const [account, setAccount] = useState<any>(null);
  const [positions, setPositions] = useState<any[]>([]);
  const [trades, setTrades] = useState<any[]>([]);
  const [performance, setPerformance] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [startingAccount, setStartingAccount] = useState(false);
  
  const [activeTab, setActiveTab] = useState<"all" | "positions" | "orders">("all");

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const fetchingRef = useRef(false);

  useEffect(() => {
    if (selectedInstrument && selectedInstrument.tv_symbol && chartContainerRef.current) {
      chartContainerRef.current.innerHTML = '';
      const containerId = `tv_chart_${selectedInstrument.symbol.replace(/[^a-zA-Z0-9]/g, '_')}`;
      
      const chartDiv = document.createElement("div");
      chartDiv.id = containerId;
      chartDiv.style.width = "100%";
      chartDiv.style.height = "100%";
      chartContainerRef.current.appendChild(chartDiv);

      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/tv.js";
      script.type = "text/javascript";
      script.async = true;
      script.onload = () => {
        if (typeof (window as any).TradingView !== 'undefined') {
          try {
            new (window as any).TradingView.widget({
              "width": "100%",
              "height": "100%",
              "symbol": selectedInstrument.tv_symbol,
              "interval": "5",
              "timezone": "Asia/Kolkata",
              "theme": "dark", // Dark theme matching Upstox
              "style": "1",
              "locale": "en",
              "enable_publishing": false,
              "hide_top_toolbar": false,
              "save_image": false,
              "container_id": containerId,
              "backgroundColor": "#12202e",
              "gridColor": "rgba(29, 46, 63, 0.5)"
            });
          } catch (e) {
            console.error("TradingView widget init error", e);
          }
        }
      };
      document.body.appendChild(script);
      
      return () => {
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
      };
    }
  }, [selectedInstrument]);

  const fetchMarketData = async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    try {
      const res = await api.get("/simulator/market-data");
      setMarketData(res.data);
      if (res.data && res.data.length > 0) {
        setSelectedInstrument((prev: any) => {
          if (prev) {
            const updated = res.data.find((i: any) => i.symbol === prev.symbol);
            return updated || res.data[0];
          }
          return res.data[0];
        });
      }
    } catch (err) {
      console.error("Failed to fetch market data", err);
    } finally {
      fetchingRef.current = false;
    }
  };

  useEffect(() => {
    loadData();
    fetchMarketData();

    let active = true;
    const poll = async () => {
      if (!active) return;
      await fetchMarketData();
      if (active) {
        setTimeout(poll, 5000);
      }
    };

    const timeoutId = setTimeout(poll, 5000);
    return () => {
      active = false;
      clearTimeout(timeoutId);
    };
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [posRes, tradeRes, perfRes] = await Promise.allSettled([
        api.get("/simulator/positions"),
        api.get("/simulator/trades"),
        api.get("/simulator/performance"),
      ]);

      if (posRes.status === "fulfilled") setPositions(posRes.value.data);
      if (tradeRes.status === "fulfilled") setTrades(tradeRes.value.data);
      if (perfRes.status === "fulfilled") {
        setPerformance(perfRes.value.data);
        setAccount({ exists: true });
      }
    } catch {
      // Account does not exist yet
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
      const executionPrice = orderStyle === "limit" ? parseFloat(limitPrice) : selectedInstrument.price;
      await api.post("/simulator/trade", {
        symbol: selectedInstrument.symbol,
        side: orderType,
        quantity: parseFloat(quantity),
        price: executionPrice,
        stop_loss: stopLoss ? parseFloat(stopLoss) : undefined,
        take_profit: takeProfit ? parseFloat(takeProfit) : undefined,
      });
      setStopLoss("");
      setTakeProfit("");
      setLimitPrice("");
      await loadData();
    } catch (err: any) {
      alert("Order failed: " + (err.response?.data?.detail || err.message));
    }
    setPlacing(false);
  };

  const handleClosePosition = async (positionId: number) => {
    try {
      const pos = positions.find((p) => p.id === positionId);
      const instrument = marketData.find((i) => i.symbol === pos?.symbol);
      await api.post("/simulator/close", {
        position_id: positionId,
        exit_price: instrument?.price || pos?.entry_price || 0,
      });
      await loadData();
    } catch (err: any) {
      alert("Close failed: " + (err.response?.data?.detail || err.message));
    }
  };

  const getExchangeLabel = (symbol: string) => {
    const sym = symbol.toUpperCase();
    if (sym === "SENSEX") return "BSE";
    if (sym === "NIFTY" || sym === "RELIANCE" || sym === "TATAMOTORS" || sym === "ICICIBANK" || sym === "WIPRO" || sym === "ITC") return "NSE";
    if (sym === "BTC/USD") return "BINANCE";
    return "NSE";
  };

  // Portfolio calculations
  const initialCapital = performance?.initial_balance || 500000;
  const totalPnl = performance?.total_pnl || 0;
  const portfolioValue = initialCapital + totalPnl;
  const pnlPercentage = initialCapital > 0 ? ((totalPnl / initialCapital) * 100).toFixed(2) : "0.00";

  // Chart aggregation
  const chartData = trades.slice(-10).map((t: any, i: number) => ({
    trade: `#${i + 1}`,
    price: t.entry_price,
    pnl: t.pnl || 0,
  }));

  const sensexObj = marketData.find((i) => i.symbol === "SENSEX") || { price: 77300, change: 150, change_pct: 0.19 };
  const niftyObj = marketData.find((i) => i.symbol === "NIFTY") || { price: 23500, change: 45, change_pct: 0.19 };

  if (loading || marketData.length === 0) {
    return (
      <DashboardLayout role="student">
        <div className="flex flex-col items-center justify-center min-h-[70vh] bg-[#0b141d] rounded-3xl p-8 border border-[#1d2e3f]">
          <Loader2 className="w-12 h-12 text-[#10b981] animate-spin mb-4" />
          <p className="text-[#7c91a6] font-semibold">Loading Upstox Trading Environment...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!account) {
    return (
      <DashboardLayout role="student">
        <div className="py-12 bg-[#0b141d] rounded-3xl p-8 border border-[#1d2e3f] text-center max-w-4xl mx-auto shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#10b981]" />
          <div className="absolute -top-32 -left-32 w-[350px] h-[350px] bg-[#10b981]/5 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute -bottom-32 -right-32 w-[350px] h-[350px] bg-[#f43f5e]/5 rounded-full blur-[80px] pointer-events-none" />

          <IndianRupee className="mx-auto text-[#10b981] mb-6 drop-shadow-[0_0_15px_rgba(16,185,129,0.35)] animate-pulse" size={64} />
          <h1 className="text-4xl font-black text-white mb-4 tracking-tight">Start Trading on Upstox Simulator</h1>
          <p className="text-[#7c91a6] max-w-2xl mx-auto mb-8 text-md leading-relaxed font-medium">
            Open your paper-trading portfolio with <strong className="text-white font-extrabold">₹5,00,000 virtual capital</strong>. Practice real-time Indian stocks and global indices risk-free in an immersive environment.
          </p>

          <Button
            onClick={handleStartAccount}
            disabled={startingAccount}
            className="bg-[#10b981] hover:bg-[#0e9d6d] text-[#0b141d] font-black px-10 py-6 text-md rounded-2xl shadow-xl shadow-[#10b981]/25 transition-transform active:scale-95 border-0 cursor-pointer"
          >
            {startingAccount ? <><Loader2 className="mr-2 animate-spin" size={20} /> Deploying Simulator...</> : "Initialize Trading Account"}
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="student">
      {/* Interactive Immersive Dark Trading Panel */}
      <div className="bg-[#0b141d] text-white rounded-3xl overflow-hidden border border-[#1d2e3f] shadow-2xl font-sans">
        
        {/* TOP BAR / INDEX TICKERS */}
        <div className="bg-[#0e1b29] border-b border-[#1d2e3f] px-5 py-3.5 flex flex-wrap items-center justify-between gap-4 select-none">
          <div className="flex items-center gap-3">
            <span className="bg-[#10b981] text-[#0b141d] font-black text-[10px] px-2 py-0.5 rounded uppercase tracking-widest">
              Upstox Pro
            </span>
            <span className="text-white font-black text-sm tracking-wider">
              FINTRADE SIMULATOR
            </span>
          </div>

          {/* Indices Panel */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 border-r border-[#1d2e3f] pr-6">
              <span className="text-[#7c91a6] text-xs font-bold uppercase tracking-wider">SENSEX</span>
              <span className="text-white font-extrabold text-sm">
                {sensexObj.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
              <span className={`text-xs font-bold flex items-center gap-0.5 ${sensexObj.change >= 0 ? "text-[#10b981]" : "text-[#f43f5e]"}`}>
                {sensexObj.change >= 0 ? "+" : ""}
                {sensexObj.change_pct}%
              </span>
            </div>

            <div className="flex items-center gap-2 border-r border-[#1d2e3f] pr-6">
              <span className="text-[#7c91a6] text-xs font-bold uppercase tracking-wider">NIFTY</span>
              <span className="text-white font-extrabold text-sm">
                {niftyObj.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
              <span className={`text-xs font-bold flex items-center gap-0.5 ${niftyObj.change >= 0 ? "text-[#10b981]" : "text-[#f43f5e]"}`}>
                {niftyObj.change >= 0 ? "+" : ""}
                {niftyObj.change_pct}%
              </span>
            </div>
          </div>

          {/* Account Portfolio Stats */}
          <div className="flex items-center gap-6 text-right">
            <div>
              <p className="text-[10px] text-[#7c91a6] font-bold uppercase tracking-wider">Net Wallet Balance</p>
              <p className="text-sm font-extrabold text-[#10b981] flex items-center justify-end gap-0.5">
                ₹{Math.round(portfolioValue).toLocaleString("en-IN")}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-[#7c91a6] font-bold uppercase tracking-wider">Today's P&L</p>
              <p className={`text-sm font-extrabold flex items-center justify-end gap-0.5 ${totalPnl >= 0 ? "text-[#10b981]" : "text-[#f43f5e]"}`}>
                {totalPnl >= 0 ? "+" : "-"}₹{Math.abs(Math.round(totalPnl)).toLocaleString("en-IN")}
              </p>
            </div>
            <div className="flex items-center gap-1.5 pl-2">
              <button 
                onClick={loadData}
                className="w-8 h-8 rounded-full bg-[#12202e] hover:bg-[#1d2e3f] border border-[#1d2e3f] flex items-center justify-center text-[#7c91a6] hover:text-white transition-colors cursor-pointer"
                title="Refresh Simulator"
              >
                <RefreshCcw size={14} className={loading ? "animate-spin" : ""} />
              </button>
              <button className="w-8 h-8 rounded-full bg-[#12202e] hover:bg-[#1d2e3f] border border-[#1d2e3f] flex items-center justify-center text-[#7c91a6] hover:text-white transition-colors cursor-pointer">
                <Bell size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* WORKSPACE CONTENT LAYOUT */}
        <div className="grid lg:grid-cols-4 min-h-[580px]">
          
          {/* LEFT SIDEBAR: WATCHLIST / HOT STOCKS */}
          <div className="lg:col-span-1 bg-[#0c1622] border-r border-[#1d2e3f] flex flex-col">
            <div className="p-4 border-b border-[#1d2e3f] flex items-center justify-between">
              <span className="font-extrabold text-xs text-[#7c91a6] uppercase tracking-wider flex items-center gap-1.5">
                <Layers size={14} className="text-[#10b981]" /> Hot Stocks Ticker
              </span>
              <span className="text-[10px] bg-[#1d2e3f] px-2 py-0.5 rounded text-white/70 font-mono">
                {marketData.length} symbols
              </span>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[550px] divide-y divide-[#1d2e3f]/40">
              {marketData.map((item) => {
                const isSelected = selectedInstrument?.symbol === item.symbol;
                const isBullish = item.change >= 0;
                
                return (
                  <button
                    key={item.symbol}
                    onClick={() => setSelectedInstrument(item)}
                    className={`w-full p-4 text-left transition-all flex items-center justify-between border-l-3 ${
                      isSelected
                        ? "bg-[#12202e] border-l-[#10b981]"
                        : "hover:bg-[#12202e]/40 border-l-transparent"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-black bg-[#1d2e3f] text-[#7c91a6] px-1 rounded">
                          {getExchangeLabel(item.symbol)}
                        </span>
                        <span className="font-extrabold text-sm tracking-tight text-white">
                          {item.symbol}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#7c91a6] font-medium mt-0.5 block uppercase">
                        {item.symbol === "BTC/USD" ? "Bitcoin / USDT" : `${item.symbol} Equity`}
                      </span>
                    </div>

                    <div className="text-right">
                      <p className={`text-sm font-extrabold ${isBullish ? "text-[#10b981]" : "text-[#f43f5e]"}`}>
                        {item.symbol === "BTC/USD" ? "$" : "₹"}
                        {item.price.toLocaleString(item.symbol === "BTC/USD" ? "en-US" : "en-IN")}
                      </p>
                      <p className={`text-[10px] font-bold flex items-center justify-end gap-0.5 mt-0.5 ${isBullish ? "text-[#10b981]" : "text-[#f43f5e]"}`}>
                        {isBullish ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                        {isBullish ? "+" : ""}
                        {Math.abs(item.change).toFixed(2)}%
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* MAIN GRAPH & TRADING ROOM PANEL */}
          <div className="lg:col-span-3 flex flex-col bg-[#0b141d]">
            
            {/* Split panel: Top for Chart, Right for Order, Bottom for Books */}
            <div className="grid md:grid-cols-3 border-b border-[#1d2e3f]">
              
              {/* INTERACTIVE CHART: 2/3 Width */}
              <div className="md:col-span-2 border-r border-[#1d2e3f] p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between pb-3">
                  <div>
                    <h3 className="font-extrabold text-white text-md flex items-center gap-1.5">
                      {selectedInstrument?.symbol} Chart
                    </h3>
                    <p className="text-xs text-[#7c91a6] mt-0.5">
                      Real-time interactive candlestick data streaming directly.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-[#10b981]/15 text-[#10b981] text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider animate-pulse">
                      Live
                    </span>
                  </div>
                </div>

                <div 
                  ref={chartContainerRef}
                  style={{ height: "340px", width: "100%" }}
                  className="rounded-xl overflow-hidden border border-[#1d2e3f] bg-[#12202e]"
                />
              </div>

              {/* ORDER BOOK ENTRY: 1/3 Width */}
              <div className="md:col-span-1 p-5 bg-[#0e1b29]/40 flex flex-col justify-between">
                <div>
                  <h3 className="font-black text-white text-sm uppercase tracking-wider mb-4 border-b border-[#1d2e3f] pb-2">
                    Place Transaction
                  </h3>

                  {/* BUY / SELL Switch */}
                  <div className="grid grid-cols-2 gap-2 mb-4 bg-[#12202e] p-1 rounded-xl border border-[#1d2e3f]">
                    <button
                      onClick={() => setOrderType("buy")}
                      className={`py-2 text-xs font-black rounded-lg transition-all border-0 cursor-pointer ${
                        orderType === "buy"
                          ? "bg-[#10b981] text-[#0b141d]"
                          : "bg-transparent text-[#7c91a6] hover:text-white"
                      }`}
                    >
                      BUY
                    </button>
                    <button
                      onClick={() => setOrderType("sell")}
                      className={`py-2 text-xs font-black rounded-lg transition-all border-0 cursor-pointer ${
                        orderType === "sell"
                          ? "bg-[#f43f5e] text-white"
                          : "bg-transparent text-[#7c91a6] hover:text-white"
                      }`}
                    >
                      SELL
                    </button>
                  </div>

                  {/* Order Type styling Limit/Market */}
                  <div className="grid grid-cols-2 gap-2 mb-4 bg-[#12202e] p-1 rounded-xl border border-[#1d2e3f]">
                    <button
                      onClick={() => setOrderStyle("market")}
                      className={`py-1.5 text-[10px] font-extrabold rounded-lg transition-all border-0 cursor-pointer ${
                        orderStyle === "market"
                          ? "bg-[#1d2e3f] text-white"
                          : "bg-transparent text-[#7c91a6] hover:text-white"
                      }`}
                    >
                      MARKET
                    </button>
                    <button
                      onClick={() => setOrderStyle("limit")}
                      className={`py-1.5 text-[10px] font-extrabold rounded-lg transition-all border-0 cursor-pointer ${
                        orderStyle === "limit"
                          ? "bg-[#1d2e3f] text-white"
                          : "bg-transparent text-[#7c91a6] hover:text-white"
                      }`}
                    >
                      LIMIT
                    </button>
                  </div>

                  {/* Quantity / Limit inputs */}
                  <div className="space-y-3.5">
                    <div>
                      <Label htmlFor="simQuantity" className="text-[#7c91a6] text-xs font-bold">Quantity (Shares)</Label>
                      <Input
                        id="simQuantity"
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        className="bg-[#12202e] border-[#1d2e3f] focus:border-[#10b981] text-white rounded-lg h-9 text-xs mt-1.5"
                      />
                    </div>

                    {orderStyle === "limit" && (
                      <div>
                        <Label htmlFor="simLimit" className="text-[#7c91a6] text-xs font-bold">Limit Price</Label>
                        <Input
                          id="simLimit"
                          type="number"
                          value={limitPrice}
                          onChange={(e) => setLimitPrice(e.target.value)}
                          placeholder={`Ticker: ${selectedInstrument?.price}`}
                          className="bg-[#12202e] border-[#1d2e3f] focus:border-[#10b981] text-white rounded-lg h-9 text-xs mt-1.5"
                        />
                      </div>
                    )}

                    <div>
                      <Label htmlFor="simSL" className="text-[#7c91a6] text-xs font-bold">Stop Loss (Price)</Label>
                      <Input
                        id="simSL"
                        type="number"
                        value={stopLoss}
                        onChange={(e) => setStopLoss(e.target.value)}
                        placeholder="Mandatory rule trigger"
                        className="bg-[#12202e] border-[#1d2e3f] focus:border-[#10b981] text-white rounded-lg h-9 text-xs mt-1.5"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {/* Estimated cost box */}
                  <div className="bg-[#12202e]/60 border border-[#1d2e3f]/60 rounded-xl p-3 text-xs">
                    <div className="flex justify-between text-[#7c91a6]">
                      <span>Est. Value:</span>
                      <span className="font-extrabold text-white">
                        {selectedInstrument?.symbol === "BTC/USD" ? "$" : "₹"}
                        {(selectedInstrument?.price * parseFloat(quantity || "0")).toLocaleString(selectedInstrument?.symbol === "BTC/USD" ? "en-US" : "en-IN")}
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={handlePlaceOrder}
                    disabled={placing}
                    className={`w-full font-black text-xs py-3 h-auto rounded-xl border-0 cursor-pointer shadow-lg transition-transform active:scale-95 ${
                      orderType === "buy"
                        ? "bg-[#10b981] hover:bg-[#0e9d6d] text-[#0b141d] shadow-[#10b981]/15"
                        : "bg-[#f43f5e] hover:bg-[#e12d4c] text-white shadow-[#f43f5e]/15"
                    }`}
                  >
                    {placing ? (
                      <><Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> Executing...</>
                    ) : (
                      `${orderType === "buy" ? "BUY" : "SELL"} ${selectedInstrument?.symbol}`
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* TAB SELECTOR FOR ACCOUNT BOOKS */}
            <div className="bg-[#0e1b29]/60 px-5 py-2.5 border-b border-[#1d2e3f] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveTab("all")}
                  className={`text-xs font-black px-3 py-1.5 rounded-lg border-0 cursor-pointer transition-colors ${
                    activeTab === "all" ? "bg-[#1d2e3f] text-white" : "text-[#7c91a6] hover:text-white"
                  }`}
                >
                  All Activity
                </button>
                <button
                  onClick={() => setActiveTab("positions")}
                  className={`text-xs font-black px-3 py-1.5 rounded-lg border-0 cursor-pointer transition-colors ${
                    activeTab === "positions" ? "bg-[#1d2e3f] text-white" : "text-[#7c91a6] hover:text-white"
                  }`}
                >
                  Position Book ({positions.length})
                </button>
                <button
                  onClick={() => setActiveTab("orders")}
                  className={`text-xs font-black px-3 py-1.5 rounded-lg border-0 cursor-pointer transition-colors ${
                    activeTab === "orders" ? "bg-[#1d2e3f] text-white" : "text-[#7c91a6] hover:text-white"
                  }`}
                >
                  Order Book ({trades.length})
                </button>
              </div>

              <div className="text-[11px] text-[#7c91a6] font-bold">
                Win Rate: <strong className="text-[#10b981] font-extrabold">{performance ? Math.round(performance.win_rate) : 0}%</strong>
              </div>
            </div>

            {/* LOWER VIEW LISTS */}
            <div className="p-4 flex-grow overflow-y-auto max-h-[220px] bg-[#0c1622]/40">
              
              {activeTab === "positions" && (
                <div className="space-y-2">
                  {positions.length === 0 ? (
                    <div className="text-center py-8 text-xs text-[#7c91a6] font-bold">No open positions. Use the order box to buy/sell shares.</div>
                  ) : (
                    positions.map((pos) => {
                      const isProfit = pos.unrealized_pnl >= 0;
                      return (
                        <div key={pos.id} className="flex items-center justify-between p-3.5 bg-[#12202e] border border-[#1d2e3f] rounded-xl">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[9px] bg-[#1d2e3f] text-[#7c91a6] px-1 rounded font-black">NSE</span>
                              <span className="font-extrabold text-sm">{pos.symbol}</span>
                            </div>
                            <span className="text-[10px] text-[#7c91a6] mt-0.5 block">
                              NET QTY: <strong className="text-white">{pos.quantity}</strong> • Entry @ ₹{pos.entry_price.toLocaleString("en-IN")}
                            </span>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className={`text-sm font-extrabold ${isProfit ? "text-[#10b981]" : "text-[#f43f5e]"}`}>
                                {isProfit ? "+" : ""}₹{Math.round(pos.unrealized_pnl).toLocaleString("en-IN")}
                              </p>
                              <span className="text-[9px] text-[#7c91a6] font-bold uppercase tracking-wider">Unrealized MTM</span>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handleClosePosition(pos.id)}
                              className="bg-transparent hover:bg-[#f43f5e]/10 border border-[#f43f5e]/30 hover:border-[#f43f5e] text-[#f43f5e] font-bold text-[10px] h-8 rounded-lg cursor-pointer transition-colors"
                            >
                              Square Off
                            </Button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {activeTab === "orders" && (
                <div className="space-y-2">
                  {trades.length === 0 ? (
                    <div className="text-center py-8 text-xs text-[#7c91a6] font-bold">No trade executions logged yet.</div>
                  ) : (
                    [...trades].reverse().map((trade) => {
                      const isProfit = (trade.pnl || 0) >= 0;
                      const isBuy = trade.side === "buy";
                      return (
                        <div key={trade.id} className="flex items-center justify-between p-3.5 bg-[#12202e] border border-[#1d2e3f] rounded-xl">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[9px] bg-[#1d2e3f] text-[#7c91a6] px-1 rounded font-black">NSE</span>
                              <span className="font-extrabold text-sm">{trade.symbol}</span>
                              <Badge className={`text-[9px] font-black rounded ${isBuy ? "bg-[#10b981]/15 text-[#10b981]" : "bg-[#f43f5e]/15 text-[#f43f5e]"}`}>
                                {trade.side?.toUpperCase()}
                              </Badge>
                            </div>
                            <span className="text-[10px] text-[#7c91a6] mt-0.5 block">
                              QTY: <strong>{trade.quantity}</strong> • Price: ₹{trade.entry_price.toLocaleString("en-IN")}
                            </span>
                          </div>

                          <div className="text-right">
                            {trade.status === "closed" ? (
                              <>
                                <p className={`text-sm font-extrabold ${isProfit ? "text-[#10b981]" : "text-[#f43f5e]"}`}>
                                  {isProfit ? "+" : ""}₹{Math.round(trade.pnl || 0).toLocaleString("en-IN")}
                                </p>
                                <span className="text-[9px] text-[#7c91a6] font-bold uppercase tracking-wider">COMPLETED P&L</span>
                              </>
                            ) : (
                              <Badge className="bg-[#1d2e3f] text-[#7c91a6] font-extrabold text-[10px] rounded">OPEN</Badge>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {activeTab === "all" && (
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Position Quick overview */}
                  <div className="bg-[#12202e] rounded-2xl border border-[#1d2e3f] p-4 flex flex-col justify-between">
                    <div>
                      <h4 className="font-extrabold text-xs text-[#7c91a6] uppercase tracking-wider mb-3">Positions Book</h4>
                      <div className="space-y-2">
                        {positions.slice(0, 3).map(p => (
                          <div key={p.id} className="flex justify-between items-center text-xs py-1 border-b border-[#1d2e3f]/40">
                            <span className="font-bold text-white">{p.symbol} ({p.quantity})</span>
                            <span className={`font-extrabold ${p.unrealized_pnl >= 0 ? "text-[#10b981]" : "text-[#f43f5e]"}`}>
                              ₹{Math.round(p.unrealized_pnl).toLocaleString("en-IN")}
                            </span>
                          </div>
                        ))}
                        {positions.length === 0 && <p className="text-[11px] text-[#7c91a6] italic py-2">No active positions</p>}
                      </div>
                    </div>
                    {positions.length > 3 && (
                      <button onClick={() => setActiveTab("positions")} className="text-[10px] text-[#10b981] font-bold text-left mt-2 hover:underline border-0 bg-transparent cursor-pointer">
                        + View all positions
                      </button>
                    )}
                  </div>

                  {/* Orders Quick overview */}
                  <div className="bg-[#12202e] rounded-2xl border border-[#1d2e3f] p-4 flex flex-col justify-between">
                    <div>
                      <h4 className="font-extrabold text-xs text-[#7c91a6] uppercase tracking-wider mb-3">Order Book Execution</h4>
                      <div className="space-y-2">
                        {trades.slice(-3).reverse().map(t => (
                          <div key={t.id} className="flex justify-between items-center text-xs py-1 border-b border-[#1d2e3f]/40">
                            <span className="font-bold text-white">{t.symbol} ({t.quantity})</span>
                            <span className={`font-black uppercase text-[10px] ${t.side === 'buy' ? 'text-[#10b981]' : 'text-[#f43f5e]'}`}>{t.side}</span>
                          </div>
                        ))}
                        {trades.length === 0 && <p className="text-[11px] text-[#7c91a6] italic py-2">No order history yet</p>}
                      </div>
                    </div>
                    {trades.length > 3 && (
                      <button onClick={() => setActiveTab("orders")} className="text-[10px] text-[#10b981] font-bold text-left mt-2 hover:underline border-0 bg-transparent cursor-pointer">
                        + View all order history
                      </button>
                    )}
                  </div>
                </div>
              )}

            </div>

            {/* TAB SELECTOR BOTTOM COSMETIC BAR */}
            <div className="bg-[#0c1622] border-t border-[#1d2e3f] px-5 py-3 flex items-center justify-between text-xs text-[#7c91a6] select-none">
              <div className="flex items-center gap-6 font-bold">
                <span className="text-white border-b-2 border-[#10b981] pb-1 cursor-pointer">DEFAULT</span>
                <span className="hover:text-white cursor-pointer">NSE / BSE</span>
                <span className="hover:text-white cursor-pointer">ORDER BOOK</span>
                <span className="hover:text-white cursor-pointer">CHARTS</span>
                <span className="hover:text-white cursor-pointer">POSITIONS</span>
                <Plus size={16} className="hover:text-white cursor-pointer" />
              </div>
              <div className="font-mono text-[10px] text-white/50">
                Connected • Feed: Live
              </div>
            </div>

          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}
