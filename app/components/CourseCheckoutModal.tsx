import { useState } from "react";
import api from "../services/api";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { Tag, IndianRupee } from "lucide-react";

interface CourseCheckoutModalProps {
  course: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CourseCheckoutModal({ course, onClose, onSuccess }: CourseCheckoutModalProps) {
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const parsePrice = (p: any) => parseFloat(String(p).replace(/[^0-9.]/g, '')) || 0;
  const initialPrice = parsePrice(course.price);
  const [finalPrice, setFinalPrice] = useState(initialPrice);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [couponMsg, setCouponMsg] = useState("");

  const applyCoupon = async () => {
    try {
      const res = await api.post("/offers/apply", { code: couponCode, course_id: course.id });
      setDiscount(res.data.discount_applied);
      setFinalPrice(res.data.discounted_price);
      setCouponMsg(res.data.message || "Coupon applied successfully!");
      setErrorMsg("");
      } catch (err: any) {
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        setErrorMsg(detail.map((d: any) => d.msg).join(", "));
      } else {
        setErrorMsg(detail || "Invalid coupon code");
      }
      setCouponMsg("");
    }
  };

  const completePayment = async () => {
    setLoading(true);
    try {
      if (Number(finalPrice) > 0) {
        const res = await api.post("/payments/create", { course_id: course.id });
        if (res.data?.redirect_url) {
          window.location.href = res.data.redirect_url;
          return;
        }
      } else {
        const payload = couponCode.trim() ? { distributor_code: couponCode.trim() } : {};
        await api.post(`/courses/${course.id}/enroll`, payload);
        onSuccess();
      }
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        alert(detail.map((d: any) => d.msg).join(", "));
      } else if (typeof detail === 'object' && detail !== null) {
        alert(JSON.stringify(detail));
      } else {
        alert(detail || "Enrollment failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-[#0B2A5B]/80 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full p-8 bg-white shadow-xl relative overflow-y-auto max-h-[90vh]">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          ✕
        </button>
        <h2 className="text-2xl font-bold text-[#0B2A5B] mb-6">Complete Your Enrollment</h2>

        <div className="bg-[#F4F1EA] rounded-lg p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-bold text-[#0B2A5B] mb-1">{course.title || course.name}</h3>
              <p className="text-[#0B2A5B]/60 text-sm">Professional Trading Program</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-[#0B2A5B]">
                ₹{initialPrice.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          <div className="border-t border-[#0B2A5B]/10 pt-4">
            <label className="text-sm font-semibold text-[#0B2A5B] mb-2 block">
              Have a distributor code?
            </label>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  type="text"
                  placeholder="Enter code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="pl-10 uppercase"
                />
              </div>
              <Button onClick={applyCoupon} variant="outline" className="border-[#C2A86A] text-[#C2A86A] hover:bg-[#C2A86A] hover:text-white">
                Apply
              </Button>
            </div>
            {errorMsg && <p className="text-red-500 text-sm mt-2">{errorMsg}</p>}
            {couponMsg && <p className="text-green-600 text-sm mt-2">{couponMsg}</p>}
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-[#0B2A5B] mb-4">Order Summary</h3>
          <div className="space-y-3 mb-4">
            <div className="flex justify-between text-[#0B2A5B]/70">
              <span>Course Fee</span>
              <span>₹{initialPrice.toLocaleString("en-IN")}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount Applied</span>
                <span className="font-semibold">-₹{discount.toLocaleString("en-IN")}</span>
              </div>
            )}
            <div className="border-t border-[#0B2A5B]/10 pt-3 flex justify-between text-[#0B2A5B]">
              <span className="text-lg font-semibold">Total Amount</span>
              <span className="text-2xl font-bold text-[#C2A86A]">
                ₹{Number(finalPrice).toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-[#0B2A5B]">Payment Method</h3>
          <div className="grid grid-cols-3 gap-3">
            <button className="p-4 border-2 border-[#C2A86A] bg-[#C2A86A]/10 rounded-lg font-semibold text-[#0B2A5B] hover:bg-[#C2A86A]/20 transition-colors">
              UPI
            </button>
            <button className="p-4 border-2 border-[#0B2A5B]/20 rounded-lg font-semibold text-[#0B2A5B] hover:bg-[#F4F1EA] transition-colors">
              Card
            </button>
            <button className="p-4 border-2 border-[#0B2A5B]/20 rounded-lg font-semibold text-[#0B2A5B] hover:bg-[#F4F1EA] transition-colors">
              NetBanking
            </button>
          </div>
        </div>

        <div className="flex gap-4 mt-8">
          <Button
            onClick={completePayment}
            disabled={loading}
            className="flex-1 bg-[#0B2A5B] text-[#F4F1EA] hover:bg-[#1a3d7a] shadow-lg shadow-[#0B2A5B]/20"
            size="lg"
          >
            {loading ? "Processing..." : `Pay ₹${Number(finalPrice).toLocaleString("en-IN")}`}
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
            className="border-2 border-[#0B2A5B]/20 text-[#0B2A5B]"
            size="lg"
          >
            Cancel
          </Button>
        </div>
      </Card>
    </div>
  );
}
