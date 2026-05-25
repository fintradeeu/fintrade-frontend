import re

with open('c:/work/fintrade/fintrade-frontend/app/pages/student/TradingSimulator.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove defaultInstruments
content = re.sub(r'const defaultInstruments = \[.*?\];', '', content, flags=re.DOTALL)

state_injection = '''
  const [marketData, setMarketData] = useState<any[]>([]);
  const [selectedInstrument, setSelectedInstrument] = useState<any>(null);
  const [orderType, setOrderType] = useState<"buy" | "sell">("buy");
'''
content = re.sub(r'const \[selectedInstrument, setSelectedInstrument\].*?;\s*const \[orderType, setOrderType\] = useState<"buy" \| "sell">\("buy"\);', state_injection, content, flags=re.DOTALL)

fetch_logic = '''
  useEffect(() => {
    fetchPositions();
    fetchMarketData();
    const interval = setInterval(fetchMarketData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchMarketData = async () => {
    try {
      const res = await api.get("/simulator/market-data");
      setMarketData(res.data);
      setSelectedInstrument(prev => prev || res.data[0]);
    } catch (err) { console.error(err); }
  };
'''

content = content.replace('useEffect(() => {\n    fetchPositions();\n  }, []);', fetch_logic)

# Replace mapping over defaultInstruments
content = content.replace('defaultInstruments.map', 'marketData.map')
# Replace finding instrument
content = content.replace('const instrument = defaultInstruments.find((i) => i.symbol === pos?.symbol);', 'const instrument = marketData.find((i) => i.symbol === pos?.symbol);')

with open('c:/work/fintrade/fintrade-frontend/app/pages/student/TradingSimulator.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("TradingSimulator.tsx updated")
