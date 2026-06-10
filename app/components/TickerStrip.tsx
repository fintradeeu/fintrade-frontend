import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import api from '../services/api';

// Baseline data
const fallbackTickers = [
  { label: "SENSEX", value: "74,243.34", change: "-116.67", pct: "-0.16%", up: false, symbol: "BSE:SENSEX" },
  { label: "SBI", value: "1,002.70", change: "+12.30", pct: "+1.5%", up: true, symbol: "NSE:SBIN" },
  { label: "RELIANCE", value: "2,934.10", change: "+45.20", pct: "+1.6%", up: true, symbol: "NSE:RELIANCE" },
  { label: "HDFC BANK", value: "1,520.40", change: "-5.60", pct: "-0.4%", up: false, symbol: "NSE:HDFCBANK" },
  { label: "TCS", value: "3,890.00", change: "+25.40", pct: "+0.7%", up: true, symbol: "NSE:TCS" },
  { label: "INFOSYS", value: "1,450.20", change: "+15.10", pct: "+1.1%", up: true, symbol: "NSE:INFY" },
  { label: "GOLD", value: "$2,350.00", change: "+15.20", pct: "+0.65%", up: true, symbol: "TVC:GOLD" },
  { label: "SILVER", value: "$63.50", change: "-1.80", pct: "-2.75%", up: false, symbol: "TVC:SILVER" },
  { label: "CRUDE OIL", value: "$78.50", change: "-0.25", pct: "-0.32%", up: false, symbol: "NYMEX:CL1!" },
  { label: "USD/INR", value: "83.45", change: "-0.09", pct: "-0.1%", up: false, symbol: "FX_IDC:USDINR" },
  { label: "BITCOIN", value: "$61,250.00", change: "+1,200.00", pct: "+1.90%", up: true, symbol: "CRYPTO:BTCUSD" }
];

export default function TickerStrip() {
  const chartContainer = useRef<HTMLDivElement>(null);
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [tickers, setTickers] = useState(fallbackTickers);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const res = await api.get('/simulator/market-data');
        if (res.data && Array.isArray(res.data)) {
          const mapped = res.data.map((item: any) => {
            const changePct = item.change_pct ?? 0;
            const price = item.price ?? 0;
            const changeVal = item.change ?? 0;
            const up = changePct >= 0;
            const sign = changePct >= 0 ? '+' : '';
            
            const isUSD = ['BITCOIN', 'GOLD', 'SILVER', 'CRUDE OIL'].includes(item.symbol);
            
            return {
              label: item.symbol,
              value: isUSD 
                ? `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
                : price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
              change: `${sign}${isUSD 
                ? changeVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) 
                : changeVal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
              pct: `${sign}${changePct.toFixed(2)}%`,
              up: up,
              symbol: item.tv_symbol
            };
          });
          setTickers(mapped);
        }
      } catch (err) {
        console.error("Failed to fetch live tickers from API, using fallback data:", err);
      }
    };

    fetchMarketData();
    const interval = setInterval(fetchMarketData, 10000); // refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);
  
  // Effect to load the advanced chart when a symbol is selected
  useEffect(() => {
    if (selectedSymbol && chartContainer.current) {
      chartContainer.current.innerHTML = '';
      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/tv.js";
      script.type = "text/javascript";
      script.async = true;
      script.onload = () => {
        if (typeof (window as any).TradingView !== 'undefined') {
          new (window as any).TradingView.widget({
            "width": "100%",
            "height": "100%",
            "symbol": selectedSymbol,
            "interval": "D",
            "timezone": "Asia/Kolkata",
            "theme": "dark",
            "style": "1",
            "locale": "in",
            "enable_publishing": false,
            "backgroundColor": "rgba(18, 18, 18, 1)",
            "hide_top_toolbar": false,
            "save_image": false,
            "container_id": "tv_chart_container"
          });
        }
      };
      document.body.appendChild(script);
      
      return () => {
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
      }
    }
  }, [selectedSymbol]);

  // Triplicated for seamless infinite scroll
  const items = [...tickers, ...tickers, ...tickers];

  const modalContent = selectedSymbol ? (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.85)',
      zIndex: 999999, // Super high z-index to cover header
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px'
    }}>
      <div style={{
        width: '90%',
        height: '80%',
        backgroundColor: '#121212',
        borderRadius: '12px',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid #333',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        <button 
          onClick={() => setSelectedSymbol(null)}
          style={{
            position: 'absolute',
            top: '10px',
            right: '15px',
            background: 'rgba(0,0,0,0.5)',
            border: '1px solid #444',
            color: 'white',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer',
            zIndex: 10,
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(213,0,50,0.8)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,0.5)')}
        >
          <X size={20} />
        </button>
        <div id="tv_chart_container" ref={chartContainer} style={{ width: '100%', height: '100%' }}></div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <div
        style={{
          background: "#121212",
          borderBottom: "1px solid rgba(213,0,50,0.2)",
          overflow: "hidden",
          width: "100%",
          position: "relative",
          zIndex: 49,
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            animation: "ticker-scroll 40s linear infinite",
            animationPlayState: isHovered ? 'paused' : 'running',
            whiteSpace: "nowrap",
            padding: "8px 0",
            willChange: "transform",
            width: "max-content"
          }}
        >
          {items.map((t, i) => (
            <div
              key={i}
              onClick={() => setSelectedSymbol(t.symbol)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                paddingRight: "40px",
                fontSize: "13px",
                fontFamily: "'Inter', sans-serif",
                fontWeight: 500,
                cursor: "pointer",
                transition: "opacity 0.2s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = "0.7"}
              onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
            >
              <span style={{ color: "#9CA3AF", fontSize: "11px", fontWeight: 600, letterSpacing: "0.04em" }}>
                {t.label}
              </span>
              <span style={{ color: "white", fontWeight: 700 }}>{t.value}</span>
              <span
                style={{
                  color: t.up ? "#4CAF50" : "#D50032",
                  fontWeight: 600,
                  fontSize: "12px",
                }}
              >
                {t.up ? "▲" : "▼"} {t.pct}
              </span>
              <span style={{ color: "#333", marginLeft: "16px" }}>|</span>
            </div>
          ))}
        </div>
        <style>{`
          @keyframes ticker-scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(calc(-100% / 3)); }
          }
        `}</style>
      </div>
      {typeof document !== 'undefined' && modalContent ? createPortal(modalContent, document.body) : null}
    </>
  );
}
