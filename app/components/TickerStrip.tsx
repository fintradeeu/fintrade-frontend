export default function TickerStrip() {
  const tickers = [
    { label: "NIFTY 50", value: "21,845.50", change: "+520.30", pct: "+2.4%", up: true },
    { label: "SENSEX", value: "72,340.10", change: "+1,280.60", pct: "+1.8%", up: true },
    { label: "BANK NIFTY", value: "48,120.75", change: "+530.25", pct: "+1.1%", up: true },
    { label: "GOLD", value: "₹71,450/10g", change: "+430", pct: "+0.6%", up: true },
    { label: "SILVER", value: "₹84,200/kg", change: "+610", pct: "+0.7%", up: true },
    { label: "CRUDE OIL", value: "$82.40/bbl", change: "-0.25", pct: "-0.3%", up: false },
    { label: "USD/INR", value: "83.45", change: "-0.09", pct: "-0.1%", up: false },
    { label: "EUR/INR", value: "89.72", change: "+0.14", pct: "+0.2%", up: true },
    { label: "NIFTY IT", value: "38,920.40", change: "+640.80", pct: "+1.7%", up: true },
    { label: "NIFTY PHARMA", value: "18,740.60", change: "-85.30", pct: "-0.5%", up: false },
    { label: "FII NET", value: "+₹2,840 Cr", change: "", pct: "", up: true },
    { label: "DII NET", value: "+₹1,120 Cr", change: "", pct: "", up: true },
  ];

  const items = [...tickers, ...tickers]; // duplicate for seamless loop

  return (
    <div
      style={{
        background: "#121212",
        borderBottom: "1px solid rgba(213,0,50,0.2)",
        overflow: "hidden",
        width: "100%",
        position: "relative",
        zIndex: 49,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          animation: "ticker-scroll 20s linear infinite",
          whiteSpace: "nowrap",
          padding: "8px 0",
          willChange: "transform",
          backfaceVisibility: "hidden",
          transform: "translateZ(0)",
          perspective: 1000,
        }}
      >
        {items.map((t, i) => (
          <span
            key={i}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              paddingRight: "40px",
              fontSize: "13px",
              fontFamily: "'Inter', sans-serif",
              fontWeight: 500,
            }}
          >
            <span style={{ color: "#9CA3AF", fontSize: "11px", fontWeight: 600, letterSpacing: "0.04em" }}>
              {t.label}
            </span>
            <span style={{ color: "white", fontWeight: 700 }}>{t.value}</span>
            {t.pct && (
              <span
                style={{
                  color: t.up ? "#4CAF50" : "#D50032",
                  fontWeight: 600,
                  fontSize: "12px",
                }}
              >
                {t.up ? "▲" : "▼"} {t.pct}
              </span>
            )}
            <span style={{ color: "#333", marginLeft: "16px" }}>|</span>
          </span>
        ))}
      </div>
      <style>{`
        @keyframes ticker-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
