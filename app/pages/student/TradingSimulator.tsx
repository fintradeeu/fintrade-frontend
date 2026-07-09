import { useState, useEffect, useRef } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  TrendingUp,
  TrendingDown,
  IndianRupee,
  Loader2,
  Bell,
  Plus,
  RefreshCcw,
  Search,
  Settings,
  X,
  LineChart,
  CandlestickChart,
  MoreHorizontal,
  ChevronDown,
  Wallet,
  UserCircle
} from "lucide-react";
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
  
  const [activeTab, setActiveTab] = useState<"Overview" | "Orders" | "Portfolio">("Overview");

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
              "interval": "D",
              "timezone": "Asia/Kolkata",
              "theme": "light", // Light theme matching Upstox
              "style": "1",
              "locale": "en",
              "enable_publishing": false,
              "hide_top_toolbar": true, // We have our own mock toolbar
              "hide_legend": false,
              "save_image": false,
              "container_id": containerId,
              "backgroundColor": "#ffffff",
              "gridColor": "rgba(229, 231, 235, 0.5)",
              "toolbar_bg": "#ffffff"
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
      if (!res.data || res.data.length === 0) {
        throw new Error("Market data is empty (likely 503 fallback from backend)");
      }
      setMarketData(res.data);
      setSelectedInstrument((prev: any) => {
        if (prev) {
          const updated = res.data.find((i: any) => i.symbol === prev.symbol);
          return updated || res.data[0];
        }
        return res.data[0];
      });
    } catch (err) {
      console.error("Failed to fetch market data, using fallback mock data", err);
      // Fallback mock data if API key is not configured or backend returns empty
      const mockData = [
        { symbol: "RELIANCE", name: "Reliance Industries", price: 2950.45, change: 12.30, change_pct: 0.42, tv_symbol: "BSE:RELIANCE" },
        { symbol: "TCS", name: "Tata Consultancy", price: 3840.10, change: -15.20, change_pct: -0.39, tv_symbol: "BSE:TCS" },
        { symbol: "HDFCBANK", name: "HDFC Bank", price: 1645.80, change: 8.50, change_pct: 0.52, tv_symbol: "BSE:HDFCBANK" },
        { symbol: "INFY", name: "Infosys Ltd", price: 1520.65, change: 5.40, change_pct: 0.36, tv_symbol: "BSE:INFY" },
        { symbol: "SENSEX", name: "BSE Sensex", price: 76941.99, change: 438.39, change_pct: 0.57, tv_symbol: "BSE:SENSEX" },
        { symbol: "NIFTY", name: "Nifty 50", price: 24024.75, change: 142.70, change_pct: 0.60, tv_symbol: "NSE:NIFTY" },
      ];
      setMarketData(mockData);
      setSelectedInstrument((prev: any) => prev || mockData[3]);
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
      setActiveTab("Portfolio");
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
    if (sym === "NIFTY" || sym === "RELIANCE" || sym === "TATAMOTORS" || sym === "ICICIBANK" || sym === "WIPRO" || sym === "ITC") return "NSE EQ";
    if (sym === "BTC/USD") return "CRYPTO";
    return "NSE EQ";
  };

  // Portfolio calculations
  const initialCapital = performance?.initial_balance || 500000;
  const totalPnl = performance?.total_pnl || 0;
  const portfolioValue = initialCapital + totalPnl;
  const pnlPercentage = initialCapital > 0 ? ((totalPnl / initialCapital) * 100).toFixed(2) : "0.00";

  const sensexObj = marketData.find((i) => i.symbol === "SENSEX") || { price: 76941.99, change: 438.39, change_pct: 0.57 };
  const niftyObj = marketData.find((i) => i.symbol === "NIFTY") || { price: 24024.75, change: 142.70, change_pct: 0.60 };

  if (loading || marketData.length === 0) {
    return (
      <DashboardLayout role="student">
        <div className="flex flex-col items-center justify-center min-h-[70vh] bg-white rounded-lg p-8 border border-gray-200 shadow-sm">
          <Loader2 className="w-12 h-12 text-[#6d28d9] animate-spin mb-4" />
          <p className="text-gray-600 font-medium">Loading Upstox Pro Environment...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!account) {
    return (
      <DashboardLayout role="student">
        <div className="py-16 bg-white rounded-lg p-8 border border-gray-200 text-center max-w-4xl mx-auto shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#6d28d9]" />
          
          <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <LineChart className="text-[#6d28d9]" size={36} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">Start Trading on Pro Simulator</h1>
          <p className="text-gray-600 max-w-2xl mx-auto mb-8 text-md leading-relaxed">
            Open your paper-trading portfolio with <strong className="text-gray-900 font-semibold">₹5,00,000 virtual capital</strong>. Practice real-time Indian stocks and global indices risk-free in an immersive environment mirroring real market dynamics.
          </p>

          <Button
            onClick={handleStartAccount}
            disabled={startingAccount}
            className="bg-[#6d28d9] hover:bg-[#5b21b6] text-white font-semibold px-8 py-6 text-md rounded shadow-md transition-colors cursor-pointer"
          >
            {startingAccount ? <><Loader2 className="mr-2 animate-spin" size={20} /> Deploying Simulator...</> : "Activate Now"}
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="student">
      {/* Container matching Upstox full height/width style inside Dashboard */}
      <div className="bg-white text-gray-800 rounded-lg overflow-hidden border border-gray-200 shadow-sm flex flex-col font-sans h-[calc(100vh-6rem)] relative">
        
        {/* TOP NAVBAR */}
        <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between text-sm shadow-[0_1px_2px_rgba(0,0,0,0.02)] z-10">
          <div className="flex items-center gap-8">
            {/* Logo / Brand */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-[#4f1699] rounded text-white font-bold flex items-center justify-center text-[10px]">
                Up
              </div>
            </div>

            {/* Indices */}
            <div className="flex items-center gap-6">
              <div className="flex flex-col">
                <span className="text-gray-600 text-xs font-semibold uppercase">NIFTY</span>
                <div className="flex items-center gap-1.5 font-medium text-xs">
                  <span className="text-gray-800">{niftyObj.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                  <span className={`${niftyObj.change >= 0 ? "text-green-600" : "text-red-500"}`}>
                    {niftyObj.change >= 0 ? "+" : ""}{Math.abs(niftyObj.change).toFixed(2)} ({niftyObj.change >= 0 ? "+" : ""}{niftyObj.change_pct}%)
                  </span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-600 text-xs font-semibold uppercase flex items-center gap-1">SENSEX <span className="bg-orange-100 text-orange-600 text-[9px] px-1 rounded font-bold">EXPIRY</span></span>
                <div className="flex items-center gap-1.5 font-medium text-xs">
                  <span className="text-gray-800">{sensexObj.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                  <span className={`${sensexObj.change >= 0 ? "text-green-600" : "text-red-500"}`}>
                    {sensexObj.change >= 0 ? "+" : ""}{Math.abs(sensexObj.change).toFixed(2)} ({sensexObj.change >= 0 ? "+" : ""}{sensexObj.change_pct}%)
                  </span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-600 text-xs font-semibold">India VIX</span>
                <div className="flex items-center gap-1.5 font-medium text-xs">
                  <span className="text-gray-800">13.28</span>
                  <span className="text-red-500">-1.40 (-9.54%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Navigation */}
          <div className="flex items-center gap-6 text-gray-700 font-semibold text-[13px]">
            {/* Main Nav Links */}
            <div className="flex items-center gap-6 font-semibold text-gray-500">
              <span className={`cursor-pointer hover:text-gray-800 pb-[10px] ${activeTab === 'Overview' ? 'text-purple-700 border-b-2 border-purple-700' : ''}`} onClick={() => setActiveTab('Overview')}>My List</span>
              <span className={`cursor-pointer hover:text-gray-800 pb-[10px] ${activeTab === 'Orders' ? 'text-purple-700 border-b-2 border-purple-700' : ''}`} onClick={() => setActiveTab('Orders')}>Orders</span>
              <span className={`cursor-pointer hover:text-gray-800 pb-[10px] ${activeTab === 'Portfolio' ? 'text-purple-700 border-b-2 border-purple-700' : ''}`} onClick={() => setActiveTab('Portfolio')}>Positions & Holdings</span>
              <span className="cursor-pointer hover:text-gray-800 pb-[10px] flex items-center gap-1">More <ChevronDown size={14}/></span>
            </div>
            
            <div className="flex items-center gap-3 ml-2 border-l border-gray-200 pl-4">
              <button className="bg-[#1e1b4b] text-white px-3 py-1 rounded font-bold text-xs flex items-center gap-1 cursor-pointer">
                <Plus size={12} /> Plus
              </button>
              <button className="text-gray-600 hover:text-gray-900 cursor-pointer"><Wallet size={18} /></button>
              <button className="w-7 h-7 bg-purple-700 text-white rounded-full flex items-center justify-center font-bold text-xs cursor-pointer">SP</button>
            </div>
          </div>
        </div>

        {/* MAIN THREE-COLUMN WORKSPACE */}
        <div className="flex flex-1 overflow-x-auto overflow-y-hidden bg-[#f9fafb]">
          
          {/* LEFT SIDEBAR: WATCHLIST */}
          <div className="w-[260px] lg:w-[300px] flex-shrink-0 bg-white border-r border-gray-200 flex flex-col z-10 shadow-[1px_0_2px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <button className="text-gray-400 hover:text-gray-700">&lt;</button>
                <span className="font-bold text-sm">1</span>
                <button className="text-gray-400 hover:text-gray-700">&gt;</button>
                <button className="text-gray-600 hover:text-gray-900 ml-1"><Plus size={16} /></button>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-gray-800 text-white text-[11px] px-2 py-0.5 rounded font-medium cursor-pointer">Manage scrips</span>
                <MoreHorizontal size={16} className="text-gray-600 cursor-pointer" />
              </div>
            </div>
            
            <div className="px-3 py-2 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-gray-800 flex items-center gap-1 cursor-pointer">top 20 by market c... <ChevronDown size={12} /></span>
                <span className="text-[10px] text-gray-500">by You</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 font-medium">{marketData.length} / 100</span>
                <button className="text-gray-500 hover:text-gray-800"><MoreHorizontal size={14} /></button>
                <button className="text-gray-500 hover:text-gray-800"><Search size={14} /></button>
                <button className="w-6 h-6 bg-purple-700 text-white rounded flex items-center justify-center cursor-pointer">
                  <Plus size={14} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
              {marketData.map((item) => {
                const isSelected = selectedInstrument?.symbol === item.symbol;
                const isBullish = item.change >= 0;
                
                return (
                  <div
                    key={item.symbol}
                    onClick={() => setSelectedInstrument(item)}
                    className={`px-4 py-2.5 flex items-center justify-between cursor-pointer group ${
                      isSelected
                        ? "bg-[#faf5ff] border-l-4 border-purple-700"
                        : "hover:bg-gray-50 border-l-4 border-transparent"
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm text-gray-800">
                        {item.symbol.split('/')[0]}
                      </span>
                      <span className="text-[10px] text-gray-500 font-medium">
                        {getExchangeLabel(item.symbol)}
                      </span>
                    </div>

                    <div className="flex flex-col items-end">
                      <span className={`text-sm font-semibold ${isBullish ? "text-[#10b981]" : "text-[#ef4444]"}`}>
                        {item.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </span>
                      <span className={`text-[11px] font-medium ${isBullish ? "text-[#10b981]" : "text-[#ef4444]"}`}>
                        {isBullish ? "+" : ""}{Math.abs(item.change).toFixed(2)} ({isBullish ? "+" : ""}{item.change_pct}%)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Footer Ad */}
            <div className="bg-black text-white px-4 py-2 text-[11px] font-medium flex justify-between items-center cursor-pointer">
              <span>Track 200 symbols with <span className="italic font-serif">Plus</span> &gt;</span>
              <X size={12} className="text-gray-400 hover:text-white" />
            </div>
          </div>

          {/* MAIN GRAPH AREA */}
          <div className="flex-1 min-w-[400px] flex flex-col bg-white border-r border-gray-200">
            {/* Dark Banner */}
            <div className="bg-gradient-to-r from-[#2e1065] via-[#3b0764] to-[#1e1b4b] text-white px-4 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LineChart size={16} className="text-purple-300" />
                <span className="text-sm font-semibold">Access high frequency market data with <span className="italic font-serif">Plus</span></span>
              </div>
              <button className="bg-purple-300/20 hover:bg-purple-300/30 text-white text-xs font-semibold px-4 py-1 rounded-full transition-colors cursor-pointer">
                Activate Now
              </button>
              <button className="text-gray-400 hover:text-white ml-2 cursor-pointer"><X size={16} /></button>
            </div>

            {/* Chart Toolbar */}
            <div className="border-b border-gray-200 px-3 py-2 flex items-center justify-between text-gray-600 text-sm bg-white shadow-sm z-10 relative">
              <div className="flex items-center gap-4">
                <Search size={16} className="cursor-pointer" />
                <span className="font-bold text-gray-800">{selectedInstrument?.symbol.split('/')[0]} {getExchangeLabel(selectedInstrument?.symbol)}</span>
                <button className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 cursor-pointer">
                  <Plus size={12} />
                </button>
                <div className="flex items-center gap-1 border-l border-gray-200 pl-3">
                  <span className="cursor-pointer hover:text-gray-900 font-medium">1m</span>
                  <ChevronDown size={14} className="cursor-pointer" />
                </div>
                <div className="flex items-center gap-2 border-l border-gray-200 pl-3">
                  <CandlestickChart size={16} className="cursor-pointer" />
                  <LineChart size={16} className="cursor-pointer" />
                </div>
                <div className="flex items-center gap-1 border-l border-gray-200 pl-3 cursor-pointer hover:text-gray-900">
                  <span className="font-medium">Instant Order</span>
                  <LineChart size={14} />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 font-semibold text-gray-700 cursor-pointer">
                  Tradingview Platform <ChevronDown size={14} />
                </span>
                <Search size={16} className="cursor-pointer" />
              </div>
            </div>

            {/* Chart Container */}
            <div className="flex-1 relative bg-white">
              <div ref={chartContainerRef} className="absolute inset-0" />
            </div>

            {/* Bottom Toolbar & Status Bar */}
            <div className="border-t border-gray-200 bg-white shadow-[0_-1px_2px_rgba(0,0,0,0.02)] z-10">
              <div className="px-4 py-1 flex items-center justify-between text-xs text-gray-600 font-semibold border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <span className="hover:text-gray-900 cursor-pointer">5Y</span>
                  <span className="hover:text-gray-900 cursor-pointer">1Y</span>
                  <span className="hover:text-gray-900 cursor-pointer">6M</span>
                  <span className="hover:text-gray-900 cursor-pointer">3M</span>
                  <span className="hover:text-gray-900 cursor-pointer">1M</span>
                  <span className="hover:text-gray-900 cursor-pointer">5D</span>
                  <span className="text-purple-700 cursor-pointer">1D</span>
                  <LineChart size={14} className="ml-2 cursor-pointer" />
                </div>
                <div className="flex items-center gap-3 font-medium">
                  <span>Powered by <span className="font-bold italic">TBT</span> 12:45:53 (UTC+5:30)</span>
                  <span className="cursor-pointer">%</span>
                  <span className="cursor-pointer">log</span>
                  <span className="cursor-pointer">auto</span>
                </div>
              </div>
              <div className="px-4 py-1.5 flex items-center gap-8 text-[11px] text-gray-500 font-medium">
                <span className="cursor-pointer font-semibold text-gray-700">Orders</span>
                <div className="flex flex-col">
                  <span>Positions Day P&L</span>
                  <span className={totalPnl >= 0 ? "text-[#10b981]" : "text-[#ef4444]"}>{totalPnl.toFixed(2)}</span>
                </div>
                <div className="flex flex-col">
                  <span>Holdings Day P&L</span>
                  <span className="text-[#10b981]">0.00</span>
                </div>
                <div className="flex-1" />
                <div className="flex items-center gap-3 text-gray-700">
                  <RefreshCcw size={14} className={`cursor-pointer hover:text-gray-900 ${loading ? "animate-spin" : ""}`} onClick={loadData} />
                  <Settings size={14} className="cursor-pointer hover:text-gray-900" />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR: SCRIP INFO / ORDER PANEL */}
          <div className="w-[350px] flex-shrink-0 bg-white flex flex-col z-10 shadow-[-1px_0_2px_rgba(0,0,0,0.02)]">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
              <span className="font-semibold text-sm text-gray-800">Scrip Info</span>
              <div className="flex items-center gap-2 text-gray-500">
                <X size={16} className="cursor-pointer hover:text-gray-800" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* Selected Scrip Title Area */}
              <div className="px-4 py-4 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-gray-900 leading-none">{selectedInstrument?.symbol.split('/')[0]}</h2>
                    <span className="w-5 h-5 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold text-[10px]">T</span>
                  </div>
                  <span className="text-xs text-gray-500 font-medium">{getExchangeLabel(selectedInstrument?.symbol)}</span>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold leading-none ${selectedInstrument?.change >= 0 ? "text-[#10b981]" : "text-[#ef4444]"}`}>
                    {selectedInstrument?.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </div>
                  <div className={`text-xs font-medium ${selectedInstrument?.change >= 0 ? "text-[#10b981]" : "text-[#ef4444]"}`}>
                    {selectedInstrument?.change >= 0 ? "+" : ""}{Math.abs(selectedInstrument?.change).toFixed(2)} ({selectedInstrument?.change >= 0 ? "+" : ""}{selectedInstrument?.change_pct}%)
                  </div>
                </div>
              </div>

              {/* Links */}
              <div className="px-4 pb-4 flex items-center gap-4 text-xs font-semibold text-gray-600">
                <span className="cursor-pointer hover:text-purple-700 flex items-center gap-1"><LineChart size={14}/> Chart</span>
                <span className="cursor-pointer hover:text-purple-700 flex items-center gap-1"><Bell size={14}/> Price Alert</span>
                <span className="cursor-pointer hover:text-purple-700 flex items-center gap-1 border-l border-gray-300 pl-4"><CandlestickChart size={14}/> TradingView</span>
              </div>

              {/* BUY / SELL Buttons */}
              <div className="px-4 pb-4 flex gap-2">
                <Button 
                  onClick={() => { setActiveTab("Orders"); setOrderType("buy"); }}
                  className="flex-1 bg-[#10b981] hover:bg-[#059669] text-white font-bold h-10 shadow-sm"
                >
                  Buy
                </Button>
                <Button 
                  onClick={() => { setActiveTab("Orders"); setOrderType("sell"); }}
                  className="flex-1 bg-[#ef4444] hover:bg-[#dc2626] text-white font-bold h-10 shadow-sm"
                >
                  Sell
                </Button>
              </div>

              {/* TABS */}
              <div className="flex border-b border-gray-200 px-2">
                {["Overview", "Orders", "Portfolio"].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`flex-1 py-2 text-sm font-semibold transition-colors ${
                      activeTab === tab
                        ? "text-gray-800 border-b-2 border-purple-700"
                        : "text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* TAB CONTENT */}
              <div className="p-4 bg-gray-50/50 min-h-[300px]">
                {activeTab === "Overview" && (
                  <div className="space-y-4 text-sm">
                    {/* Market Stats */}
                    <div>
                      <h3 className="font-bold text-gray-800 mb-3 text-xs">Market Stats</h3>
                      <div className="grid grid-cols-2 gap-y-3 gap-x-8 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Open</span>
                          <span className="font-medium text-gray-800">{(selectedInstrument?.price * 0.995).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Prev. Close</span>
                          <span className="font-medium text-gray-800">{(selectedInstrument?.price - selectedInstrument?.change).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Low</span>
                          <span className="font-medium text-gray-800">{(selectedInstrument?.price * 0.98).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">High</span>
                          <span className="font-medium text-gray-800">{(selectedInstrument?.price * 1.01).toFixed(2)}</span>
                        </div>
                      </div>
                      
                      <div className="mt-4 text-xs">
                        <div className="flex justify-between text-gray-500 mb-1">
                          <span>Circuit (Lower-Upper)</span>
                        </div>
                        <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden relative">
                           <div className="absolute top-0 left-[20%] right-[20%] h-full bg-orange-400"></div>
                           <div className="absolute top-0 left-[40%] w-[2px] h-full bg-gray-800"></div>
                        </div>
                        <div className="flex justify-between text-gray-800 font-medium mt-1">
                          <span>{(selectedInstrument?.price * 0.9).toFixed(2)}</span>
                          <span>{(selectedInstrument?.price * 1.1).toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="mt-3 text-xs">
                        <div className="flex justify-between text-gray-500 mb-1">
                          <span>52-week (Low-High)</span>
                        </div>
                        <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden relative">
                           <div className="absolute top-0 left-[10%] right-[30%] h-full bg-orange-400"></div>
                           <div className="absolute top-0 left-[80%] w-[2px] h-full bg-gray-800"></div>
                        </div>
                        <div className="flex justify-between text-gray-800 font-medium mt-1">
                          <span>{(selectedInstrument?.price * 0.6).toFixed(2)}</span>
                          <span>{(selectedInstrument?.price * 1.2).toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-y-3 gap-x-8 text-xs mt-4">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Volume</span>
                          <span className="font-medium text-gray-800">20,64,375</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Avg. traded price</span>
                          <span className="font-medium text-gray-800">{(selectedInstrument?.price * 0.99).toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="text-center mt-3">
                        <button className="text-purple-700 font-semibold text-xs hover:underline">Show more</button>
                      </div>
                    </div>

                    <hr className="border-gray-200" />

                    {/* Market Depth */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-gray-800 text-xs">Market Depth</h3>
                        <MoreHorizontal size={16} className="text-gray-400 cursor-pointer" />
                      </div>
                      <div className="flex text-[10px] font-bold text-gray-500 mb-2">
                        <div className="flex-1">Quantity</div>
                        <div className="w-16 text-right text-[#10b981]">Bid Price</div>
                        <div className="w-16 text-left pl-2 text-[#ef4444]">Ask Price</div>
                        <div className="flex-1 text-right">Quantity</div>
                      </div>
                      
                      {/* Depth Rows - Mock data */}
                      {[
                        { bq: 93, bp: 0.05, ap: 0.05, aq: 42, b_width: '40%', a_width: '20%' },
                        { bq: 66, bp: 0.15, ap: 0.15, aq: 158, b_width: '30%', a_width: '60%' },
                        { bq: 87, bp: 0.25, ap: 0.25, aq: 133, b_width: '35%', a_width: '50%' },
                        { bq: 113, bp: 0.35, ap: 0.35, aq: 178, b_width: '50%', a_width: '70%' },
                        { bq: 183, bp: 0.45, ap: 0.45, aq: 190, b_width: '80%', a_width: '85%' },
                      ].map((row, i) => {
                        const base = selectedInstrument?.price || 1000;
                        return (
                          <div key={i} className="flex text-xs font-medium relative py-1 hover:bg-gray-100">
                             {/* Background bars */}
                             <div className="absolute inset-0 flex">
                                <div className="flex-1 flex justify-end">
                                  <div className="bg-[#10b981]/15 h-full" style={{width: row.b_width}}></div>
                                </div>
                                <div className="flex-1 flex justify-start">
                                  <div className="bg-[#ef4444]/15 h-full" style={{width: row.a_width}}></div>
                                </div>
                             </div>
                             {/* Text */}
                             <div className="flex-1 z-10 text-gray-600">{row.bq}</div>
                             <div className="w-16 text-right z-10 text-gray-800">{(base - row.bp).toFixed(2)}</div>
                             <div className="w-16 text-left pl-2 z-10 text-gray-800">{(base + row.ap).toFixed(2)}</div>
                             <div className="flex-1 text-right z-10 text-gray-600">{row.aq}</div>
                          </div>
                        )
                      })}
                      <div className="text-center mt-3">
                        <button className="text-purple-700 font-semibold text-xs hover:underline">Show 20 Depth</button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "Orders" && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4 bg-gray-100 p-1 rounded-md">
                      <button
                        onClick={() => setOrderStyle("market")}
                        className={`flex-1 py-1.5 text-xs font-semibold rounded shadow-sm transition-colors ${
                          orderStyle === "market"
                            ? "bg-white text-gray-800"
                            : "text-gray-500 hover:text-gray-800"
                        }`}
                      >
                        Market
                      </button>
                      <button
                        onClick={() => setOrderStyle("limit")}
                        className={`flex-1 py-1.5 text-xs font-semibold rounded shadow-sm transition-colors ${
                          orderStyle === "limit"
                            ? "bg-white text-gray-800"
                            : "text-gray-500 hover:text-gray-800"
                        }`}
                      >
                        Limit
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs font-semibold text-gray-600">Quantity</Label>
                        <Input
                          type="number"
                          value={quantity}
                          onChange={(e) => setQuantity(e.target.value)}
                          className="h-9 mt-1 text-sm bg-white border-gray-300 focus-visible:ring-purple-700"
                        />
                      </div>

                      {orderStyle === "limit" && (
                        <div>
                          <Label className="text-xs font-semibold text-gray-600">Limit Price</Label>
                          <Input
                            type="number"
                            value={limitPrice}
                            onChange={(e) => setLimitPrice(e.target.value)}
                            placeholder={selectedInstrument?.price?.toString()}
                            className="h-9 mt-1 text-sm bg-white border-gray-300 focus-visible:ring-purple-700"
                          />
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-3 pb-2">
                        <div>
                          <Label className="text-xs font-semibold text-gray-600">Stop Loss <span className="text-red-500">*</span></Label>
                          <Input
                            type="number"
                            value={stopLoss}
                            onChange={(e) => setStopLoss(e.target.value)}
                            className="h-9 mt-1 text-sm bg-white border-gray-300 focus-visible:ring-purple-700"
                            placeholder="Required"
                          />
                        </div>
                        <div>
                          <Label className="text-xs font-semibold text-gray-600">Target</Label>
                          <Input
                            type="number"
                            value={takeProfit}
                            onChange={(e) => setTakeProfit(e.target.value)}
                            className="h-9 mt-1 text-sm bg-white border-gray-300 focus-visible:ring-purple-700"
                            placeholder="Optional"
                          />
                        </div>
                      </div>

                      <div className="flex justify-between items-center bg-gray-50 border border-gray-200 p-3 rounded-md text-sm font-medium text-gray-800">
                        <span>Est. Total</span>
                        <span className={orderType === "buy" ? "text-[#10b981]" : "text-[#ef4444]"}>
                          ₹{(selectedInstrument?.price * parseFloat(quantity || "0")).toLocaleString("en-IN")}
                        </span>
                      </div>

                      <Button
                        onClick={handlePlaceOrder}
                        disabled={placing}
                        className={`w-full font-bold h-11 text-sm shadow-md mt-4 ${
                          orderType === "buy"
                            ? "bg-[#10b981] hover:bg-[#059669] text-white"
                            : "bg-[#ef4444] hover:bg-[#dc2626] text-white"
                        }`}
                      >
                        {placing ? <Loader2 className="w-4 h-4 animate-spin" /> : `Place ${orderType.toUpperCase()} Order`}
                      </Button>
                    </div>
                  </div>
                )}

                {activeTab === "Portfolio" && (
                  <div className="space-y-4">
                    {/* Positions List */}
                    <h3 className="font-bold text-gray-800 text-xs">Open Positions</h3>
                    <div className="space-y-2">
                      {positions.length === 0 ? (
                        <p className="text-xs text-gray-500 italic text-center py-4">No open positions.</p>
                      ) : (
                        positions.map((pos) => {
                          const isProfit = pos.unrealized_pnl >= 0;
                          return (
                            <div key={pos.id} className="bg-white border border-gray-200 rounded-md p-3 shadow-sm">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <span className="font-bold text-sm text-gray-900">{pos.symbol}</span>
                                  <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded ml-2 font-medium">Qty: {pos.quantity}</span>
                                </div>
                                <div className="text-right">
                                  <span className={`text-sm font-bold block ${isProfit ? "text-[#10b981]" : "text-[#ef4444]"}`}>
                                    {isProfit ? "+" : ""}₹{Math.round(pos.unrealized_pnl).toLocaleString("en-IN")}
                                  </span>
                                  <span className="text-[10px] text-gray-500">P&L</span>
                                </div>
                              </div>
                              <div className="flex justify-between text-xs text-gray-600 mb-3">
                                <span>Avg: ₹{pos.entry_price.toLocaleString("en-IN")}</span>
                              </div>
                              <Button
                                onClick={() => handleClosePosition(pos.id)}
                                variant="outline"
                                className="w-full h-8 text-xs font-bold border-gray-300 hover:bg-gray-50 text-gray-700"
                              >
                                Square Off
                              </Button>
                            </div>
                          );
                        })
                      )}
                    </div>

                    <hr className="border-gray-200 my-4" />

                    <h3 className="font-bold text-gray-800 text-xs">Recent Trades</h3>
                    <div className="space-y-2">
                      {trades.slice(-5).reverse().map((trade) => {
                        const isProfit = (trade.pnl || 0) >= 0;
                        const isBuy = trade.side === "buy";
                        return (
                          <div key={trade.id} className="bg-white border border-gray-200 rounded-md p-2 flex justify-between items-center shadow-sm">
                            <div>
                              <span className="font-bold text-xs text-gray-900 block">{trade.symbol}</span>
                              <span className={`text-[10px] font-bold ${isBuy ? "text-[#10b981]" : "text-[#ef4444]"}`}>
                                {trade.side.toUpperCase()} • Qty: {trade.quantity}
                              </span>
                            </div>
                            <div className="text-right">
                              {trade.status === "closed" ? (
                                <span className={`text-xs font-bold ${isProfit ? "text-[#10b981]" : "text-[#ef4444]"}`}>
                                  {isProfit ? "+" : ""}₹{Math.round(trade.pnl || 0).toLocaleString("en-IN")}
                                </span>
                              ) : (
                                <span className="text-[10px] bg-gray-100 px-1 rounded text-gray-600 font-bold">OPEN</span>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
