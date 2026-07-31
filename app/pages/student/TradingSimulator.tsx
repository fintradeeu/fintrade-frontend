import { useState, useEffect, useRef } from "react";
import { createChart, ColorType, CandlestickSeries, LineSeries, AreaSeries, BarSeries, BaselineSeries, HistogramSeries } from "lightweight-charts";
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
  UserCircle,
  BarChart2,
  Activity,
  Check
} from "lucide-react";
import api from "../../services/api";
import TradingJournalTab from "../../components/simulator/TradingJournalTab";
import StrategyBuilderTab from "../../components/simulator/StrategyBuilderTab";
import AdvancedAnalyticsTab from "../../components/simulator/AdvancedAnalyticsTab";
import RiskCalculatorModal from "../../components/simulator/RiskCalculatorModal";

const DEFAULT_SCRIP = { symbol: "RELIANCE", name: "Reliance Industries", price: 2950.45, change: 12.30, change_pct: 0.42, tv_symbol: "BSE:RELIANCE", exchange: "BSE EQ" };

export default function TradingSimulator() {
  const [marketData, setMarketData] = useState<any[]>([]);
  const [selectedInstrument, setSelectedInstrument] = useState<any>(DEFAULT_SCRIP);
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
  
  const [activeTab, setActiveTab] = useState<"Overview" | "Orders" | "Portfolio" | "Journal" | "Strategy" | "Analytics">("Overview");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCalcModal, setShowCalcModal] = useState(false);
  const [scripSearchQuery, setScripSearchQuery] = useState("");
  const [customSymbols, setCustomSymbols] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("fintrade_custom_scrips");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [chartStyle, setChartStyle] = useState<string>("1");
  const [showStyleMenu, setShowStyleMenu] = useState<boolean>(false);
  const [timeframe, setTimeframe] = useState<string>("D");
  const [showTimeframeMenu, setShowTimeframeMenu] = useState<boolean>(false);

  const chartStyles = [
    { id: "0", label: "Bars", icon: <BarChart2 size={15} className="rotate-90 text-gray-700" /> },
    { id: "1", label: "Candles", icon: <CandlestickChart size={15} className="text-purple-700" /> },
    { id: "9", label: "Hollow candles", icon: <CandlestickChart size={15} className="text-gray-400" /> },
    { id: "2", label: "Line", icon: <LineChart size={15} className="text-blue-600" /> },
    { id: "3", label: "Area", icon: <TrendingUp size={15} className="text-emerald-600" /> },
    { id: "8", label: "Heikin Ashi", icon: <CandlestickChart size={15} className="text-indigo-600" /> },
    { id: "10", label: "Baseline", icon: <Activity size={15} className="text-amber-600" /> },
  ];

  const timeframeOptions = [
    { id: "1", label: "1m" },
    { id: "5", label: "5m" },
    { id: "15", label: "15m" },
    { id: "60", label: "1h" },
    { id: "D", label: "1D" },
    { id: "W", label: "1W" },
  ];

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const fetchingRef = useRef(false);
  const chartRef = useRef<any>(null);
  const seriesRef = useRef<any>(null);
  const volumeSeriesRef = useRef<any>(null);
  const lastPriceRef = useRef<number | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Hook 1: Create chart and initialize historical baseline candles
  useEffect(() => {
    if (!selectedInstrument || !chartContainerRef.current) return;

    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }
    chartContainerRef.current.innerHTML = "";

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth || 800,
      height: chartContainerRef.current.clientHeight || 450,
      layout: {
        background: { type: ColorType.Solid, color: "#ffffff" },
        textColor: "#334155",
        fontFamily: "'Inter', sans-serif",
      },
      grid: {
        vertLines: { color: "rgba(229, 231, 235, 0.5)" },
        horzLines: { color: "rgba(229, 231, 235, 0.5)" },
      },
      crosshair: {
        mode: 0,
      },
      rightPriceScale: {
        borderColor: "#cbd5e1",
        scaleMargins: {
          top: 0.1,
          bottom: 0.25,
        },
      },
      timeScale: {
        borderColor: "#cbd5e1",
        timeVisible: true,
        secondsVisible: false,
      },
    });

    chartRef.current = chart;

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };
    window.addEventListener("resize", handleResize);

    let series: any;
    if (chartStyle === "2") {
      series = chart.addSeries(LineSeries, { color: "#2563eb", lineWidth: 2 });
    } else if (chartStyle === "3") {
      series = chart.addSeries(AreaSeries, {
        lineColor: "#10b981",
        topColor: "rgba(16, 185, 129, 0.4)",
        bottomColor: "rgba(16, 185, 129, 0.0)",
        lineWidth: 2,
      });
    } else if (chartStyle === "0") {
      series = chart.addSeries(BarSeries, {
        upColor: "#10b981",
        downColor: "#ef4444",
      });
    } else if (chartStyle === "10") {
      series = chart.addSeries(BaselineSeries, {
        baseValue: { type: "price", price: selectedInstrument.price || 100 },
        topLineColor: "#10b981",
        topFillColor1: "rgba(16, 185, 129, 0.28)",
        topFillColor2: "rgba(16, 185, 129, 0.05)",
        bottomLineColor: "#ef4444",
        bottomFillColor1: "rgba(239, 68, 68, 0.05)",
        bottomFillColor2: "rgba(239, 68, 68, 0.28)",
      });
    } else {
      series = chart.addSeries(CandlestickSeries, {
        upColor: "#10b981",
        downColor: "#ef4444",
        borderVisible: false,
        wickUpColor: "#10b981",
        wickDownColor: "#ef4444",
      });
    }
    seriesRef.current = series;

    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: "#94a3b8",
      priceFormat: { type: "volume" },
      priceScaleId: "",
    });
    volumeSeries.priceScale().applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    });
    volumeSeriesRef.current = volumeSeries;

    const currentPrice = selectedInstrument.price || 100;
    lastPriceRef.current = currentPrice;

    const numCandles = 80;
    const now = Math.floor(Date.now() / 1000);
    const stepSeconds = timeframe === "1" ? 60 : timeframe === "5" ? 300 : timeframe === "15" ? 900 : timeframe === "60" ? 3600 : timeframe === "W" ? 604800 : 86400;
    
    const startTime = now - (numCandles * stepSeconds);
    const mainData: any[] = [];
    const volData: any[] = [];

    let simPrice = currentPrice;
    const prices: number[] = [currentPrice];
    for (let i = 0; i < numCandles - 1; i++) {
      const changePercent = (Math.random() - 0.49) * 0.015;
      simPrice = simPrice / (1 + changePercent);
      prices.unshift(simPrice);
    }

    for (let i = 0; i < numCandles; i++) {
      const time = startTime + (i * stepSeconds);
      const close = prices[i];
      const prevClose = i > 0 ? prices[i - 1] : close * 0.998;
      const open = prevClose;
      const high = Math.max(open, close) * (1 + Math.random() * 0.004);
      const low = Math.min(open, close) * (1 - Math.random() * 0.004);
      const vol = Math.floor(1000 + Math.random() * 50000);

      if (chartStyle === "2" || chartStyle === "3" || chartStyle === "10") {
        mainData.push({ time, value: close });
      } else {
        mainData.push({ time, open, high, low, close });
      }

      volData.push({
        time,
        value: vol,
        color: close >= open ? "rgba(16, 185, 129, 0.4)" : "rgba(239, 68, 68, 0.4)",
      });
    }

    series.setData(mainData);
    volumeSeries.setData(volData);
    chart.timeScale().fitContent();

    return () => {
      window.removeEventListener("resize", handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [selectedInstrument?.symbol, chartStyle, timeframe]);

  // Hook 2: Dynamic real-time live updates when simulator price changes
  useEffect(() => {
    if (!seriesRef.current || !selectedInstrument?.price) return;
    const newPrice = selectedInstrument.price;
    if (newPrice === lastPriceRef.current) return;

    const now = Math.floor(Date.now() / 1000);
    const stepSeconds = timeframe === "1" ? 60 : timeframe === "5" ? 300 : timeframe === "15" ? 900 : timeframe === "60" ? 3600 : timeframe === "W" ? 604800 : 86400;
    
    const lastBarTime = Math.floor(now / stepSeconds) * stepSeconds;

    try {
      if (chartStyle === "2" || chartStyle === "3" || chartStyle === "10") {
        seriesRef.current.update({
          time: lastBarTime,
          value: newPrice,
        });
      } else {
        const prevPrice = lastPriceRef.current || newPrice * 0.999;
        const tickOpen = selectedInstrument.open || prevPrice;
        const tickHigh = selectedInstrument.high || Math.max(prevPrice, newPrice);
        const tickLow = selectedInstrument.low || Math.min(prevPrice, newPrice);
        seriesRef.current.update({
          time: lastBarTime,
          open: tickOpen,
          high: tickHigh,
          low: tickLow,
          close: newPrice,
        });
      }
      lastPriceRef.current = newPrice;
    } catch (e) {
      console.warn("Chart update error", e);
    }
  }, [selectedInstrument?.price, selectedInstrument?.timestamp, chartStyle, timeframe]);

  const availableScrips = [
    { symbol: "RELIANCE", name: "Reliance Industries", price: 2950.45, change: 12.30, change_pct: 0.42, tv_symbol: "BSE:RELIANCE", exchange: "BSE EQ" },
    { symbol: "TCS", name: "Tata Consultancy", price: 3840.10, change: -15.20, change_pct: -0.39, tv_symbol: "BSE:TCS", exchange: "BSE EQ" },
    { symbol: "HDFCBANK", name: "HDFC Bank", price: 1645.80, change: 8.50, change_pct: 0.52, tv_symbol: "BSE:HDFCBANK", exchange: "BSE EQ" },
    { symbol: "INFY", name: "Infosys Ltd", price: 1520.65, change: 5.40, change_pct: 0.36, tv_symbol: "BSE:INFY", exchange: "BSE EQ" },
    { symbol: "SENSEX", name: "BSE Sensex", price: 76941.99, change: 438.39, change_pct: 0.57, tv_symbol: "BSE:SENSEX", exchange: "BSE" },
    { symbol: "NIFTY", name: "Nifty 50", price: 24024.75, change: 142.70, change_pct: 0.60, tv_symbol: "NSE:NIFTY50", exchange: "NSE" },
    { symbol: "BANKNIFTY", name: "Bank Nifty", price: 51500.00, change: 320.50, change_pct: 0.63, tv_symbol: "NSE:BANKNIFTY", exchange: "NSE" },
    { symbol: "SBIN", name: "State Bank of India", price: 830.50, change: 6.20, change_pct: 0.75, tv_symbol: "BSE:SBIN", exchange: "BSE EQ" },
    { symbol: "BHARTIARTL", name: "Bharti Airtel", price: 1420.00, change: 14.50, change_pct: 1.03, tv_symbol: "BSE:BHARTIARTL", exchange: "BSE EQ" },
    { symbol: "LT", name: "Larsen & Toubro", price: 3650.00, change: -22.00, change_pct: -0.60, tv_symbol: "BSE:LT", exchange: "BSE EQ" },
    { symbol: "HINDUNILVR", name: "Hindustan Unilever", price: 2480.00, change: 18.00, change_pct: 0.73, tv_symbol: "BSE:HINDUNILVR", exchange: "BSE EQ" },
    { symbol: "AXISBANK", name: "Axis Bank", price: 1250.00, change: 11.20, change_pct: 0.90, tv_symbol: "BSE:AXISBANK", exchange: "BSE EQ" },
    { symbol: "KOTAKBANK", name: "Kotak Mahindra Bank", price: 1780.00, change: -8.50, change_pct: -0.48, tv_symbol: "BSE:KOTAKBANK", exchange: "BSE EQ" },
    { symbol: "TATAMOTORS", name: "Tata Motors", price: 960.00, change: -5.20, change_pct: -0.54, tv_symbol: "BSE:TATAMOTORS", exchange: "BSE EQ" },
    { symbol: "ICICIBANK", name: "ICICI Bank", price: 1120.00, change: 8.40, change_pct: 0.75, tv_symbol: "BSE:ICICIBANK", exchange: "BSE EQ" },
    { symbol: "WIPRO", name: "Wipro Ltd", price: 485.00, change: -2.10, change_pct: -0.43, tv_symbol: "BSE:WIPRO", exchange: "BSE EQ" },
    { symbol: "ITC", name: "ITC Limited", price: 430.00, change: 1.80, change_pct: 0.42, tv_symbol: "BSE:ITC", exchange: "BSE EQ" },
    { symbol: "MARUTI", name: "Maruti Suzuki", price: 12800.00, change: 125.00, change_pct: 0.99, tv_symbol: "BSE:MARUTI", exchange: "BSE EQ" },
    { symbol: "SUNPHARMA", name: "Sun Pharma", price: 1540.00, change: 15.40, change_pct: 1.01, tv_symbol: "BSE:SUNPHARMA", exchange: "BSE EQ" },
    { symbol: "TITAN", name: "Titan Company", price: 3400.00, change: 25.00, change_pct: 0.74, tv_symbol: "BSE:TITAN", exchange: "BSE EQ" },
    { symbol: "BAJFINANCE", name: "Bajaj Finance", price: 7200.00, change: 65.00, change_pct: 0.91, tv_symbol: "BSE:BAJFINANCE", exchange: "BSE EQ" },
    { symbol: "ASIANPAINT", name: "Asian Paints", price: 2900.00, change: -14.00, change_pct: -0.48, tv_symbol: "BSE:ASIANPAINT", exchange: "BSE EQ" },
    { symbol: "HCLTECH", name: "HCL Technologies", price: 1600.00, change: 12.00, change_pct: 0.76, tv_symbol: "BSE:HCLTECH", exchange: "BSE EQ" },
    { symbol: "BTC/USD", name: "Bitcoin USD", price: 67500.00, change: -450.00, change_pct: -0.66, tv_symbol: "BINANCE:BTCUSDT", exchange: "CRYPTO" },
    { symbol: "ETH/USD", name: "Ethereum USD", price: 3500.00, change: -45.00, change_pct: -1.27, tv_symbol: "BINANCE:ETHUSDT", exchange: "CRYPTO" },
    { symbol: "SOL/USD", name: "Solana USD", price: 150.00, change: 4.50, change_pct: 3.09, tv_symbol: "BINANCE:SOLUSDT", exchange: "CRYPTO" },
    { symbol: "AAPL", name: "Apple Inc.", price: 175.50, change: 1.25, change_pct: 0.72, tv_symbol: "NASDAQ:AAPL", exchange: "NASDAQ" },
    { symbol: "GOOGL", name: "Alphabet Inc.", price: 175.00, change: 2.10, change_pct: 1.21, tv_symbol: "NASDAQ:GOOGL", exchange: "NASDAQ" },
    { symbol: "AMZN", name: "Amazon.com Inc.", price: 185.00, change: -1.50, change_pct: -0.80, tv_symbol: "NASDAQ:AMZN", exchange: "NASDAQ" },
    { symbol: "META", name: "Meta Platforms", price: 490.00, change: 8.50, change_pct: 1.76, tv_symbol: "NASDAQ:META", exchange: "NASDAQ" },
  ];

  const handleAddScrip = (scrip: any) => {
    if (!customSymbols.includes(scrip.symbol)) {
      const updated = [...customSymbols, scrip.symbol];
      setCustomSymbols(updated);
      localStorage.setItem("fintrade_custom_scrips", JSON.stringify(updated));
      setMarketData((prev: any[]) => {
        if (prev.some(i => i.symbol === scrip.symbol)) return prev;
        return [...prev, scrip];
      });
    }
    setSelectedInstrument(scrip);
    setShowAddModal(false);
  };

  const fetchMarketData = async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    try {
      const allSymbols = Array.from(new Set(["RELIANCE", "TCS", "HDFCBANK", "INFY", "SENSEX", "NIFTY", "TATAMOTORS", "ICICIBANK", "WIPRO", "ITC", "BTC/USD", "AAPL", ...customSymbols])).join(",");
      const res = await api.get(`/simulator/market-data?symbols=${allSymbols}`);
      if (!res.data || res.data.length === 0) {
        throw new Error("Market data is empty (likely 503 fallback from backend)");
      }
      const nameMap: any = {
        "RELIANCE": "Reliance Industries",
        "TCS": "Tata Consultancy",
        "HDFCBANK": "HDFC Bank",
        "INFY": "Infosys Ltd",
        "SENSEX": "BSE Sensex",
        "NIFTY": "Nifty 50",
        "TATAMOTORS": "Tata Motors",
        "ICICIBANK": "ICICI Bank",
        "WIPRO": "Wipro Ltd",
        "ITC": "ITC Limited",
        "BTC/USD": "Bitcoin USD",
        "AAPL": "Apple Inc."
      };
      const tvSymbolMap: any = {
        "SENSEX": "BSE:SENSEX",
        "NIFTY": "NSE:NIFTY50",
        "BANKNIFTY": "NSE:BANKNIFTY",
        "RELIANCE": "BSE:RELIANCE",
        "TCS": "BSE:TCS",
        "HDFCBANK": "BSE:HDFCBANK",
        "INFY": "BSE:INFY",
        "TATAMOTORS": "BSE:TATAMOTORS",
        "ICICIBANK": "BSE:ICICIBANK",
        "WIPRO": "BSE:WIPRO",
        "ITC": "BSE:ITC",
        "SBIN": "BSE:SBIN",
        "BHARTIARTL": "BSE:BHARTIARTL",
        "LT": "BSE:LT",
        "HINDUNILVR": "BSE:HINDUNILVR",
        "AXISBANK": "BSE:AXISBANK",
        "KOTAKBANK": "BSE:KOTAKBANK",
        "MARUTI": "BSE:MARUTI",
        "SUNPHARMA": "BSE:SUNPHARMA",
        "TITAN": "BSE:TITAN",
        "BAJFINANCE": "BSE:BAJFINANCE",
        "ASIANPAINT": "BSE:ASIANPAINT",
        "HCLTECH": "BSE:HCLTECH",
        "BTC/USD": "BINANCE:BTCUSDT",
        "ETH/USD": "BINANCE:ETHUSDT",
        "SOL/USD": "BINANCE:SOLUSDT",
        "AAPL": "NASDAQ:AAPL",
        "GOOGL": "NASDAQ:GOOGL",
        "AMZN": "NASDAQ:AMZN",
        "META": "NASDAQ:META",
      };
      const enrichedData = res.data.map((i: any) => ({
        ...i,
        name: i.name || nameMap[i.symbol] || i.symbol,
        tv_symbol: i.tv_symbol || tvSymbolMap[i.symbol] || (i.symbol.includes("/") ? `BINANCE:${i.symbol.replace("/", "")}` : `BSE:${i.symbol}`)
      }));
      setMarketData(enrichedData);
      setSelectedInstrument((prev: any) => {
        if (prev) {
          const updated = enrichedData.find((i: any) => i.symbol === prev.symbol);
          return updated || enrichedData[0];
        }
        return enrichedData[0];
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
        { symbol: "NIFTY", name: "Nifty 50", price: 24024.75, change: 142.70, change_pct: 0.60, tv_symbol: "NSE:NIFTY50" },
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
    let reconnectTimeoutId: any = null;

    const connectWs = () => {
      if (!active) return;
      try {
        const base = api.defaults.baseURL || window.location.origin;
        const wsBase = base.replace(/^http/, "ws");
        const wsUrl = `${wsBase.replace(/\/$/, "")}/simulator/ws/market`;
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          if (!active) return;
          const symbols = Array.from(new Set([
            "RELIANCE", "TCS", "HDFCBANK", "INFY", "SENSEX", "NIFTY", "TATAMOTORS", "ICICIBANK", "WIPRO", "ITC", "BTC/USD", "AAPL",
            ...customSymbols,
            ...(selectedInstrument ? [selectedInstrument.symbol] : [])
          ]));
          ws.send(JSON.stringify({ action: "subscribe", symbols }));
        };

        ws.onmessage = (event) => {
          if (!active) return;
          try {
            const msg = JSON.parse(event.data);
            if (msg.type === "tick" && Array.isArray(msg.data)) {
              const nameMap: any = {
                "RELIANCE": "Reliance Industries",
                "TCS": "Tata Consultancy",
                "HDFCBANK": "HDFC Bank",
                "INFY": "Infosys Ltd",
                "SENSEX": "BSE Sensex",
                "NIFTY": "Nifty 50",
                "TATAMOTORS": "Tata Motors",
                "ICICIBANK": "ICICI Bank",
                "WIPRO": "Wipro Ltd",
                "ITC": "ITC Limited",
                "BTC/USD": "Bitcoin USD",
                "AAPL": "Apple Inc."
              };
              const tvSymbolMap: any = {
                "SENSEX": "BSE:SENSEX",
                "NIFTY": "NSE:NIFTY50",
                "BANKNIFTY": "NSE:BANKNIFTY",
                "RELIANCE": "BSE:RELIANCE",
                "TCS": "BSE:TCS",
                "HDFCBANK": "BSE:HDFCBANK",
                "INFY": "BSE:INFY",
                "TATAMOTORS": "BSE:TATAMOTORS",
                "ICICIBANK": "BSE:ICICIBANK",
                "WIPRO": "BSE:WIPRO",
                "ITC": "BSE:ITC",
                "SBIN": "BSE:SBIN",
                "BHARTIARTL": "BSE:BHARTIARTL",
                "LT": "BSE:LT",
                "HINDUNILVR": "BSE:HINDUNILVR",
                "AXISBANK": "BSE:AXISBANK",
                "KOTAKBANK": "BSE:KOTAKBANK",
                "MARUTI": "BSE:MARUTI",
                "SUNPHARMA": "BSE:SUNPHARMA",
                "TITAN": "BSE:TITAN",
                "BAJFINANCE": "BSE:BAJFINANCE",
                "ASIANPAINT": "BSE:ASIANPAINT",
                "HCLTECH": "BSE:HCLTECH",
                "BTC/USD": "BINANCE:BTCUSDT",
                "ETH/USD": "BINANCE:ETHUSDT",
                "SOL/USD": "BINANCE:SOLUSDT",
                "AAPL": "NASDAQ:AAPL",
                "GOOGL": "NASDAQ:GOOGL",
                "AMZN": "NASDAQ:AMZN",
                "META": "NASDAQ:META",
              };
              const enrichedData = msg.data.map((i: any) => ({
                ...i,
                name: i.name || nameMap[i.symbol] || i.symbol,
                tv_symbol: i.tv_symbol || tvSymbolMap[i.symbol] || (i.symbol.includes("/") ? `BINANCE:${i.symbol.replace("/", "")}` : `BSE:${i.symbol}`)
              }));

              setMarketData((prev: any[]) => {
                const map = new Map(prev.map(item => [item.symbol, item]));
                enrichedData.forEach((item: any) => {
                  if (map.has(item.symbol)) {
                    map.set(item.symbol, { ...map.get(item.symbol), ...item });
                  } else {
                    map.set(item.symbol, item);
                  }
                });
                return Array.from(map.values());
              });

              setSelectedInstrument((prev: any) => {
                if (!prev) return DEFAULT_SCRIP;
                const updatedTick = enrichedData.find((i: any) => i.symbol === prev.symbol);
                if (updatedTick) {
                  return { ...prev, ...updatedTick };
                }
                return prev;
              });
            }
          } catch (e) {
            console.warn("WebSocket parse error", e);
          }
        };

        ws.onclose = () => {
          if (!active) return;
          wsRef.current = null;
          reconnectTimeoutId = setTimeout(connectWs, 2000);
        };

        ws.onerror = () => {
          ws.close();
        };
      } catch (err) {
        console.warn("WS connect failed", err);
      }
    };

    connectWs();

    return () => {
      active = false;
      if (reconnectTimeoutId) clearTimeout(reconnectTimeoutId);
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const symbols = Array.from(new Set([
        "RELIANCE", "TCS", "HDFCBANK", "INFY", "SENSEX", "NIFTY", "TATAMOTORS", "ICICIBANK", "WIPRO", "ITC", "BTC/USD", "AAPL",
        ...customSymbols,
        ...(selectedInstrument ? [selectedInstrument.symbol] : [])
      ]));
      wsRef.current.send(JSON.stringify({ action: "subscribe", symbols }));
    }
  }, [customSymbols, selectedInstrument?.symbol]);

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

  const getExchangeLabel = (symbol?: string) => {
    if (!symbol || typeof symbol !== "string") return "EQUITY";
    const sym = symbol.toUpperCase();
    if (sym === "SENSEX") return "BSE";
    if (["NIFTY", "RELIANCE", "TCS", "HDFCBANK", "INFY", "TATAMOTORS", "ICICIBANK", "WIPRO", "ITC", "SBIN", "BHARTIARTL", "LT", "HINDUNILVR", "AXISBANK"].includes(sym)) return "NSE EQ";
    if (["AAPL", "GOOGL", "AMZN", "META", "TSLA", "NVDA", "MSFT"].includes(sym)) return "NASDAQ";
    if (sym.includes("/") || ["BTC", "ETH", "SOL", "BITCOIN"].includes(sym)) return "CRYPTO";
    return "EQUITY";
  };

  // Portfolio calculations synchronized with live WebSocket ticks
  const livePositions = positions.map((pos) => {
    const liveScrip = marketData.find((m) => m.symbol === pos.symbol);
    const currentPrice = liveScrip ? liveScrip.price : pos.current_price || pos.entry_price;
    const diff = pos.side === "buy" ? (currentPrice - pos.entry_price) : (pos.entry_price - currentPrice);
    const livePnl = diff * pos.quantity;
    return {
      ...pos,
      current_price: currentPrice,
      unrealized_pnl: livePnl
    };
  });

  const staticOpenPnl = positions.reduce((acc, pos) => acc + (pos.unrealized_pnl || 0), 0);
  const liveOpenPnl = livePositions.reduce((acc, pos) => acc + (pos.unrealized_pnl || 0), 0);
  const baseTotalPnl = performance?.total_pnl || 0;
  const totalPnl = baseTotalPnl - staticOpenPnl + liveOpenPnl;

  const initialCapital = performance?.initial_balance || 500000;
  const portfolioValue = initialCapital + totalPnl;
  const pnlPercentage = initialCapital > 0 ? ((totalPnl / initialCapital) * 100).toFixed(2) : "0.00";

  const sensexObj = marketData.find((i) => i.symbol === "SENSEX") || { price: 76941.99, change: 438.39, change_pct: 0.57 };
  const niftyObj = marketData.find((i) => i.symbol === "NIFTY") || { price: 24024.75, change: 142.70, change_pct: 0.60 };

  if (loading || marketData.length === 0) {
    return (
      <DashboardLayout role="student">
        <div className="flex flex-col items-center justify-center min-h-[70vh] bg-white rounded-lg p-8 border border-gray-200 shadow-sm">
          <Loader2 className="w-12 h-12 text-[#6d28d9] animate-spin mb-4" />
          <p className="text-gray-600 font-medium">Loading FinTrade Pro Simulator...</p>
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
            <div className="flex items-center gap-2.5 pr-3 border-r border-gray-200">
              <div className="w-8 h-8 bg-gradient-to-br from-[#6d28d9] via-[#4f1699] to-[#3b0764] rounded-lg text-white font-black flex items-center justify-center text-sm shadow-md border border-purple-400/30">
                F
              </div>
              <span className="font-extrabold text-sm tracking-tight text-gray-900 flex items-center">
                Fin<span className="text-[#6d28d9]">Trade</span>
                <span className="ml-1.5 text-[10px] bg-purple-100 text-purple-800 font-bold px-1.5 py-0.5 rounded shadow-2xs">PRO</span>
              </span>
            </div>

            {/* Indices */}
            <div className="flex items-center gap-6">
              <div className="flex flex-col">
                <span className="text-gray-600 text-xs font-semibold uppercase">NIFTY</span>
                <div className="flex items-center gap-1.5 font-medium text-xs">
                  <span className="text-gray-800">{niftyObj.price.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  <span className={`${niftyObj.change >= 0 ? "text-green-600" : "text-red-500"}`}>
                    {niftyObj.change >= 0 ? "+" : ""}{Math.abs(niftyObj.change).toFixed(2)} ({niftyObj.change >= 0 ? "+" : ""}{niftyObj.change_pct}%)
                  </span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-600 text-xs font-semibold uppercase flex items-center gap-1">SENSEX <span className="bg-orange-100 text-orange-600 text-[9px] px-1 rounded font-bold">EXPIRY</span></span>
                <div className="flex items-center gap-1.5 font-medium text-xs">
                  <span className="text-gray-800">{sensexObj.price.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
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
              <span className={`cursor-pointer hover:text-gray-800 pb-[10px] ${activeTab === 'Journal' ? 'text-purple-700 border-b-2 border-purple-700' : ''}`} onClick={() => setActiveTab('Journal')}>Journal</span>
              <span className={`cursor-pointer hover:text-gray-800 pb-[10px] ${activeTab === 'Strategy' ? 'text-purple-700 border-b-2 border-purple-700' : ''}`} onClick={() => setActiveTab('Strategy')}>Strategy Lab</span>
              <span className={`cursor-pointer hover:text-gray-800 pb-[10px] ${activeTab === 'Analytics' ? 'text-purple-700 border-b-2 border-purple-700' : ''}`} onClick={() => setActiveTab('Analytics')}>Analytics</span>
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
                <button onClick={() => setShowAddModal(true)} className="text-gray-600 hover:text-gray-900 ml-1 cursor-pointer"><Plus size={16} /></button>
              </div>
              <div className="flex items-center gap-2">
                <span onClick={() => setShowAddModal(true)} className="bg-gray-800 text-white text-[11px] px-2 py-0.5 rounded font-medium cursor-pointer hover:bg-black">Manage scrips</span>
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
                <button onClick={() => setShowAddModal(true)} className="text-gray-500 hover:text-gray-800 cursor-pointer"><Search size={14} /></button>
                <button onClick={() => setShowAddModal(true)} className="w-6 h-6 bg-purple-700 hover:bg-purple-800 text-white rounded flex items-center justify-center cursor-pointer">
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
                        {(item?.symbol || "RELIANCE").split('/')[0]}
                      </span>
                      <span className="text-[10px] text-gray-500 font-medium">
                        {getExchangeLabel(item?.symbol)}
                      </span>
                    </div>

                    <div className="flex flex-col items-end">
                      <span className={`text-sm font-semibold ${isBullish ? "text-[#10b981]" : "text-[#ef4444]"}`}>
                        {item.price.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
            <div className={`border-b border-gray-200 px-3 py-2 flex items-center justify-between text-gray-600 text-sm bg-white shadow-sm z-10 relative ${["Journal", "Strategy", "Analytics"].includes(activeTab) ? "hidden" : ""}`}>
              <div className="flex items-center gap-4">
                <Search onClick={() => setShowAddModal(true)} size={16} className="cursor-pointer hover:text-gray-900" />
                <span className="font-bold text-gray-800">{(selectedInstrument?.symbol || "RELIANCE").split('/')[0]} {getExchangeLabel(selectedInstrument?.symbol)}</span>
                <button onClick={() => setShowAddModal(true)} className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 cursor-pointer">
                  <Plus size={12} />
                </button>
                {/* Timeframe Dropdown */}
                <div className="relative border-l border-gray-200 pl-3">
                  <div 
                    onClick={() => { setShowTimeframeMenu(!showTimeframeMenu); setShowStyleMenu(false); }}
                    className="flex items-center gap-1 cursor-pointer hover:text-gray-900 font-medium px-2 py-1 rounded hover:bg-gray-100 transition-colors"
                  >
                    <span>{timeframeOptions.find((t) => t.id === timeframe)?.label || "1D"}</span>
                    <ChevronDown size={14} />
                  </div>

                  {showTimeframeMenu && (
                    <div className="absolute top-full left-3 mt-1 w-24 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                      {timeframeOptions.map((t) => (
                        <div
                          key={t.id}
                          onClick={() => { setTimeframe(t.id); setShowTimeframeMenu(false); }}
                          className={`px-3 py-1.5 text-xs flex items-center justify-between cursor-pointer hover:bg-gray-50 ${timeframe === t.id ? "bg-purple-50 text-purple-700 font-bold" : "text-gray-700"}`}
                        >
                          <span>{t.label}</span>
                          {timeframe === t.id && <Check size={12} className="text-purple-700" />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Chart Style Dropdown (Bars, Candles, Heikin Ashi, etc.) */}
                <div className="relative border-l border-gray-200 pl-3">
                  <div 
                    onClick={() => { setShowStyleMenu(!showStyleMenu); setShowTimeframeMenu(false); }}
                    className="flex items-center gap-1.5 cursor-pointer hover:text-gray-900 font-medium px-2.5 py-1 rounded hover:bg-gray-100 transition-colors bg-gray-50 border border-gray-200/80 shadow-2xs"
                  >
                    {chartStyles.find((s) => s.id === chartStyle)?.icon || <CandlestickChart size={15} />}
                    <span className="text-xs font-bold text-gray-800">{chartStyles.find((s) => s.id === chartStyle)?.label || "Candles"}</span>
                    <ChevronDown size={14} className="text-gray-500" />
                  </div>

                  {showStyleMenu && (
                    <div className="absolute top-full left-3 mt-1.5 w-48 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                      <div className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 mb-1">
                        Chart Style
                      </div>
                      {chartStyles.map((s) => (
                        <div
                          key={s.id}
                          onClick={() => { setChartStyle(s.id); setShowStyleMenu(false); }}
                          className={`px-3 py-2 text-xs flex items-center justify-between cursor-pointer hover:bg-purple-50/50 transition-colors ${chartStyle === s.id ? "bg-purple-50 text-purple-700 font-bold" : "text-gray-700"}`}
                        >
                          <div className="flex items-center gap-2.5">
                            {s.icon}
                            <span>{s.label}</span>
                          </div>
                          {chartStyle === s.id && <Check size={14} className="text-purple-700" />}
                        </div>
                      ))}
                    </div>
                  )}
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
            <div className={`flex-1 relative bg-white ${["Journal", "Strategy", "Analytics"].includes(activeTab) ? "hidden" : ""}`}>
              <div ref={chartContainerRef} className="absolute inset-0" />
            </div>

            {/* Feature Tabs Content overlaying the center area */}
            {activeTab === "Journal" && (
              <div className="flex-1 overflow-y-auto p-6 bg-[#f8fafc]">
                <TradingJournalTab />
              </div>
            )}
            {activeTab === "Strategy" && (
              <div className="flex-1 overflow-y-auto p-6 bg-[#f8fafc]">
                <StrategyBuilderTab />
              </div>
            )}
            {activeTab === "Analytics" && (
              <div className="flex-1 overflow-y-auto p-6 bg-[#f8fafc]">
                <AdvancedAnalyticsTab />
              </div>
            )}

            {/* Bottom Toolbar & Status Bar */}
            <div className={`border-t border-gray-200 bg-white shadow-[0_-1px_2px_rgba(0,0,0,0.02)] z-10 ${["Journal", "Strategy", "Analytics"].includes(activeTab) ? "hidden" : ""}`}>
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
          <div className={`w-[350px] flex-shrink-0 bg-white flex flex-col z-10 shadow-[-1px_0_2px_rgba(0,0,0,0.02)] ${["Journal", "Strategy", "Analytics"].includes(activeTab) ? "hidden" : ""}`}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
              <span className="font-semibold text-sm text-gray-800">{activeTab === "Overview" ? "Scrip Info" : activeTab === "Orders" ? "Order Placement Panel" : activeTab === "Portfolio" ? "Quick Portfolio Panel" : `${activeTab} Panel`}</span>
              <div className="flex items-center gap-2 text-gray-500">
                <X size={16} className="cursor-pointer hover:text-gray-800" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* Selected Scrip Title Area - Only show for Overview and Orders */}
              {activeTab !== "Portfolio" && (
                <>
                  <div className="px-4 py-4 flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold text-gray-900 leading-none">{(selectedInstrument?.symbol || "RELIANCE").split('/')[0]}</h2>
                        <span className="w-5 h-5 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold text-[10px]">T</span>
                      </div>
                      <span className="text-xs text-gray-500 font-medium">{getExchangeLabel(selectedInstrument?.symbol)}</span>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold leading-none ${(selectedInstrument?.change || 0) >= 0 ? "text-[#10b981]" : "text-[#ef4444]"}`}>
                        {(selectedInstrument?.price || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <div className={`text-xs font-medium ${(selectedInstrument?.change || 0) >= 0 ? "text-[#10b981]" : "text-[#ef4444]"}`}>
                        {(selectedInstrument?.change || 0) >= 0 ? "+" : ""}{Math.abs(selectedInstrument?.change || 0).toFixed(2)} ({(selectedInstrument?.change || 0) >= 0 ? "+" : ""}{selectedInstrument?.change_pct || 0}%)
                      </div>
                    </div>
                  </div>

                  {/* Links */}
                  <div className="mx-4 mb-4 p-1 bg-gray-100 rounded-lg flex items-center justify-between text-xs font-semibold text-gray-700">
                    <button className="flex-1 py-1.5 rounded-md hover:bg-white hover:shadow-sm transition-all flex items-center justify-center gap-1.5 text-gray-700"><LineChart size={14} className="text-blue-600"/> Chart</button>
                    <button onClick={() => setShowCalcModal(true)} className="flex-1 py-1.5 rounded-md hover:bg-white hover:shadow-sm transition-all flex items-center justify-center gap-1.5 text-purple-700 font-bold bg-white/60"><TrendingUp size={14} className="text-purple-600"/> Risk Calc</button>
                    <button className="flex-1 py-1.5 rounded-md hover:bg-white hover:shadow-sm transition-all flex items-center justify-center gap-1.5 text-gray-700"><CandlestickChart size={14} className="text-orange-500"/> TradingView</button>
                  </div>

                  {/* BUY / SELL Buttons */}
                  <div className="px-4 pb-4 flex gap-3">
                    <Button 
                      onClick={() => { setActiveTab("Orders"); setOrderType("buy"); }}
                      className="flex-1 bg-[#10b981] hover:bg-[#059669] text-white font-bold h-11 rounded-xl shadow-md shadow-emerald-500/15 transition-all active:scale-[0.98] text-sm tracking-wide"
                    >
                      BUY
                    </Button>
                    <Button 
                      onClick={() => { setActiveTab("Orders"); setOrderType("sell"); }}
                      className="flex-1 bg-[#ef4444] hover:bg-[#dc2626] text-white font-bold h-11 rounded-xl shadow-md shadow-red-500/15 transition-all active:scale-[0.98] text-sm tracking-wide"
                    >
                      SELL
                    </Button>
                  </div>
                </>
              )}

              {/* TABS */}
              <div className="flex border-b border-gray-200 px-4 gap-5 overflow-x-auto scrollbar-none">
                {[
                  { id: "Overview", label: "My List Info" },
                  { id: "Orders", label: "Orders" },
                  { id: "Portfolio", label: "Holdings" }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`whitespace-nowrap py-2.5 text-xs font-bold transition-all border-b-2 -mb-[2px] flex-shrink-0 ${
                      activeTab === tab.id
                        ? "text-purple-700 border-purple-700"
                        : "text-gray-500 hover:text-gray-800 border-transparent"
                    }`}
                  >
                    {tab.label}
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

                    <hr className="border-gray-200 my-4" />
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-bold text-gray-800 text-xs">All Order Logs</h3>
                      <span className="bg-purple-100 text-purple-700 font-bold text-[10px] px-2 py-0.5 rounded-full">{trades.length} Total</span>
                    </div>
                    <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                      {trades.length === 0 ? (
                        <p className="text-xs text-gray-400 italic text-center py-4">No order history found yet.</p>
                      ) : (
                        trades.slice().reverse().map((trade) => {
                          const isProfit = (trade.pnl || 0) >= 0;
                          return (
                            <div key={trade.id} className="bg-white border border-gray-200 rounded-md p-2.5 shadow-sm text-xs">
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-bold text-gray-900">{trade.symbol}</span>
                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase ${trade.side === "buy" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}`}>
                                  {trade.side} • QTY: {trade.quantity}
                                </span>
                              </div>
                              <div className="flex justify-between items-center text-gray-500 text-[11px]">
                                <span>Price: ₹{trade.entry_price?.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                <span className={`font-bold ${trade.status === 'open' ? 'text-blue-600' : (isProfit ? 'text-[#10b981]' : 'text-[#ef4444]')}`}>
                                  {trade.status === 'open' ? 'OPEN' : `${isProfit ? '+' : ''}₹${Math.round(trade.pnl || 0)}`}
                                </span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}

                {activeTab === "Portfolio" && (
                  <div className="space-y-4">
                    {/* KPI Banner */}
                    <div className="grid grid-cols-2 gap-2 bg-purple-50/60 p-2.5 rounded-lg border border-purple-100 text-xs">
                      <div>
                        <span className="text-[10px] text-gray-500 block uppercase font-bold">Portfolio Value</span>
                        <span className="font-extrabold text-gray-900 text-sm">₹{portfolioValue.toLocaleString("en-IN", { minimumFractionDigits: 0 })}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-gray-500 block uppercase font-bold">Realized P&L</span>
                        <span className={`font-extrabold text-sm ${totalPnl >= 0 ? "text-[#10b981]" : "text-[#ef4444]"}`}>
                          {totalPnl >= 0 ? "+" : ""}₹{totalPnl.toLocaleString("en-IN", { minimumFractionDigits: 0 })}
                        </span>
                      </div>
                    </div>

                    {/* Positions List */}
                    <h3 className="font-bold text-gray-800 text-xs">Open Positions</h3>
                    <div className="space-y-2">
                      {livePositions.length === 0 ? (
                        <p className="text-xs text-gray-500 italic text-center py-4">No open positions.</p>
                      ) : (
                        livePositions.map((pos) => {
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

      {/* Dynamic Add Scrips Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-gray-200 overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-4 bg-[#6d28d9] text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Search size={18} />
                <h3 className="font-bold text-base">Add Scrips to Simulator Watchlist</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-white/80 hover:text-white cursor-pointer">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={16} />
                <Input 
                  placeholder="Search shares, indices, crypto (e.g. SBIN, TITAN, ETH/USD)..." 
                  value={scripSearchQuery} 
                  onChange={(e) => setScripSearchQuery(e.target.value)}
                  className="pl-9 bg-white border-gray-300 h-10 text-sm"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 divide-y divide-gray-100">
              {availableScrips
                .filter(s => s.symbol.toLowerCase().includes(scripSearchQuery.toLowerCase()) || s.name.toLowerCase().includes(scripSearchQuery.toLowerCase()))
                .map((scrip) => {
                  const isAlreadyAdded = marketData.some(m => m.symbol === scrip.symbol);
                  const isBullish = scrip.change >= 0;
                  return (
                    <div key={scrip.symbol} className="p-3 flex items-center justify-between hover:bg-purple-50/60 rounded transition-colors">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900 text-sm">{scrip.symbol}</span>
                          <span className="bg-gray-100 text-gray-600 text-[10px] px-1.5 py-0.5 rounded font-medium">{scrip.exchange}</span>
                        </div>
                        <span className="text-xs text-gray-500">{scrip.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className={`font-bold text-sm ${isBullish ? "text-[#10b981]" : "text-[#ef4444]"}`}>
                            ₹{scrip.price.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                          <div className={`text-[11px] font-medium ${isBullish ? "text-[#10b981]" : "text-[#ef4444]"}`}>
                            {isBullish ? "+" : ""}{scrip.change} ({isBullish ? "+" : ""}{scrip.change_pct}%)
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleAddScrip(scrip)}
                          className={isAlreadyAdded ? "bg-purple-100 text-purple-700 hover:bg-purple-200 font-bold" : "bg-[#6d28d9] hover:bg-[#5b21b6] text-white font-bold cursor-pointer"}
                        >
                          {isAlreadyAdded ? "Select" : "+ Add"}
                        </Button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* Risk Calculator Modal */}
      {showCalcModal && (
        <RiskCalculatorModal
          onClose={() => setShowCalcModal(false)}
          defaultPrice={selectedInstrument?.price || 1000}
          equity={account?.equity || 100000}
          onApplyQuantity={(qty) => {
            setQuantity(qty.toString());
            setActiveTab("Orders");
          }}
        />
      )}
    </DashboardLayout>
  );
}
