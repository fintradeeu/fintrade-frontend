import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { ShieldAlert, X, TrendingUp, Calculator, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";
import api from "../../services/api";

interface RiskCalcProps {
  onClose: () => void;
  defaultPrice?: number;
  equity?: number;
  onApplyQuantity?: (qty: number) => void;
}

export default function RiskCalculatorModal({ onClose, defaultPrice = 1000, equity = 100000, onApplyQuantity }: RiskCalcProps) {
  const [entryPrice, setEntryPrice] = useState(defaultPrice.toString());
  const [stopLoss, setStopLoss] = useState((defaultPrice * 0.98).toFixed(2));
  const [accountBalance, setAccountBalance] = useState(equity.toString());
  const [riskPct, setRiskPct] = useState("1.5");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const calculateRisk = async () => {
    setLoading(true);
    try {
      const res = await api.post("/simulator/calculator/position-size", {
        account_balance: parseFloat(accountBalance) || 100000,
        risk_percentage: parseFloat(riskPct) || 1,
        entry_price: parseFloat(entryPrice) || 1,
        stop_loss_price: parseFloat(stopLoss) || 0.5,
      });
      setResult(res.data);
    } catch (err) {
      console.error("Calculation error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculateRisk();
  }, [entryPrice, stopLoss, accountBalance, riskPct]);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-purple-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-lg">
              <Calculator className="text-purple-300" size={20} />
            </div>
            <div>
              <h3 className="font-bold text-base">Position Size & Risk Calculator</h3>
              <p className="text-[11px] text-purple-200">Never risk more than 1-2% of your equity per trade</p>
            </div>
          </div>
          <button onClick={onClose} className="text-purple-200 hover:text-white p-1 rounded-full transition-colors cursor-pointer">
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Account Equity (₹)</label>
              <Input type="number" value={accountBalance} onChange={(e) => setAccountBalance(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-purple-700 block mb-1 font-bold">Risk per Trade (%)</label>
              <Input type="number" step="0.1" value={riskPct} onChange={(e) => setRiskPct(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-emerald-700 block mb-1 font-bold">Entry Price (₹)</label>
              <Input type="number" step="any" value={entryPrice} onChange={(e) => setEntryPrice(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-rose-700 block mb-1 font-bold">Stop Loss Price (₹)</label>
              <Input type="number" step="any" value={stopLoss} onChange={(e) => setStopLoss(e.target.value)} />
            </div>
          </div>

          {/* Results Box */}
          {result && (
            <div className="mt-4 bg-gradient-to-br from-purple-50 via-indigo-50 to-purple-50 p-4 rounded-xl border border-purple-200 space-y-3">
              <div className="flex items-center justify-between border-b border-purple-200/60 pb-2">
                <span className="text-xs font-bold text-purple-950 uppercase">Recommended Position</span>
                <span className="text-xs font-semibold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                  Risk Amount: ₹{result.risk_amount.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center py-1">
                <div>
                  <span className="text-[11px] text-gray-500 block">Shares / Quantity</span>
                  <span className="text-2xl font-black text-purple-950">{result.recommended_quantity}</span>
                </div>
                <div>
                  <span className="text-[11px] text-gray-500 block">Total Exposure</span>
                  <span className="text-xl font-bold text-gray-800">₹{result.total_exposure.toLocaleString("en-IN")}</span>
                </div>
              </div>

              {result.total_exposure > parseFloat(accountBalance) && (
                <div className="flex items-center gap-2 text-[11px] text-amber-800 bg-amber-50 p-2 rounded border border-amber-200 font-medium">
                  <AlertTriangle size={14} className="text-amber-600 flex-shrink-0" />
                  Warning: Exposure exceeds cash balance. Margin / Leverage required.
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            {onApplyQuantity && result && (
              <Button
                onClick={() => {
                  onApplyQuantity(result.recommended_quantity);
                  onClose();
                }}
                className="bg-purple-700 hover:bg-purple-800 text-white font-bold cursor-pointer flex items-center gap-1.5"
              >
                Apply Qty ({result.recommended_quantity}) <ArrowRight size={16} />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
