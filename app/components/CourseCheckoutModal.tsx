import { useState, useEffect } from "react";
import api from "../services/api";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { Tag, IndianRupee } from "lucide-react";

const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

interface CourseCheckoutModalProps {
  course: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CourseCheckoutModal({ course, onClose, onSuccess }: CourseCheckoutModalProps) {
  const [ibCode, setIbCode] = useState(() => localStorage.getItem("distributor_code") || "");
  const [couponCode, setCouponCode] = useState("");
  const [ibDiscount, setIbDiscount] = useState(0);
  const [couponDiscount, setCouponDiscount] = useState(0);
  
  const parsePrice = (p: any) => parseFloat(String(p).replace(/[^0-9.]/g, '')) || 0;
  const initialPrice = parsePrice(course.price);
  
  const activeDiscount = couponDiscount + ibDiscount;
  const finalPrice = Math.max(initialPrice - activeDiscount, 0);

  const [loading, setLoading] = useState(false);
  const [ibError, setIbError] = useState("");
  const [ibSuccessMsg, setIbSuccessMsg] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponSuccessMsg, setCouponSuccessMsg] = useState("");

  // Auto-apply saved coupon code on mount
  useEffect(() => {
    const savedCode = localStorage.getItem("distributor_code");
    if (savedCode) {
      (async () => {
        try {
          const res = await api.post("/offers/apply", { code: savedCode, course_id: course.id });
          setIbDiscount(res.data.discount_applied);
          setIbSuccessMsg(res.data.message || "Referral code applied successfully!");
          setIbError("");
        } catch (err: any) {
          console.warn("Auto-applying distributor code failed:", err);
        }
      })();
    }
  }, [course.id]);

  const applyIbCode = async () => {
    if (!ibCode.trim()) {
      setIbError("Please enter a referral code");
      return;
    }
    try {
      const res = await api.post("/offers/apply", { code: ibCode.trim(), course_id: course.id });
      setIbDiscount(res.data.discount_applied);
      setIbSuccessMsg(res.data.message || "Referral code verified!");
      setIbError("");
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      setIbError(typeof detail === "string" ? detail : "Invalid referral code");
      setIbSuccessMsg("");
      setIbDiscount(0);
    }
  };

  const applyCouponCode = async () => {
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }
    try {
      const res = await api.post("/offers/apply", { code: couponCode.trim(), course_id: course.id });
      setCouponDiscount(res.data.discount_applied);
      setCouponSuccessMsg(res.data.message || "Coupon applied successfully!");
      setCouponError("");
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      setCouponError(typeof detail === "string" ? detail : "Invalid coupon code");
      setCouponSuccessMsg("");
      setCouponDiscount(0);
    }
  };

  const completePayment = async () => {
    console.log("completePayment triggered. finalPrice:", finalPrice, "course:", course);
    setLoading(true);
    try {
      const combinedCode = [couponCode.trim(), ibCode.trim()].filter(Boolean).join(":");
      if (Number(finalPrice) > 0) {
        console.log("Initiating payment for course ID:", course.id);
        const res = await api.post("/payments/create", {
          course_id: course.id,
          coupon_code: combinedCode || null,
          discounted_price: activeDiscount > 0 ? finalPrice : null,
        });
        console.log("Payment initiation API response:", res.data);

        if (res.data?.gateway === "razorpay") {
          const scriptLoaded = await loadRazorpayScript();
          if (!scriptLoaded) {
            alert("Razorpay SDK failed to load. Please check your internet connection.");
            setLoading(false);
            return;
          }

          let prefill = { name: "", email: "", contact: "" };
          try {
            const storedUser = localStorage.getItem("user");
            if (storedUser) {
              const user = JSON.parse(storedUser);
              prefill = {
                name: user.full_name || "",
                email: user.email || "",
                contact: user.phone || "",
              };
            }
          } catch (e) {
            console.warn("Failed to parse user details for prefill:", e);
          }

          const options = {
            key: res.data.key_id,
            amount: res.data.amount,
            currency: res.data.currency || "INR",
            name: "FT EDUTECH",
            image: window.location.origin + "/F-LOGO--RED.png",
            description: course.title || course.name,
            order_id: res.data.order_id,
            handler: async function (response: any) {
              console.log("Razorpay payment success. Verifying...", response);
              try {
                setLoading(true);
                await api.post("/payments/verify-razorpay", {
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature,
                  txnid: res.data.txnid,
                });
                onSuccess();
              } catch (err: any) {
                console.error("Razorpay verification failed:", err);
                alert("Payment verification failed: " + (err.response?.data?.detail || err.message));
              } finally {
                setLoading(false);
              }
            },
            prefill,
            theme: {
              color: "#0B2A5B",
            },
            modal: {
              ondismiss: function () {
                console.log("Razorpay checkout modal dismissed by user");
                setLoading(false);
              }
            }
          };

          const rzp = new (window as any).Razorpay(options);
          rzp.open();
          setLoading(false);
          return;
        }

        if (res.data?.redirect_url) {
          console.log("Redirecting to:", res.data.redirect_url);
          window.location.href = res.data.redirect_url;
          return;
        } else {
          alert("Error: No redirect_url returned in API response.");
        }
      } else {
        console.log("Final price is 0, enrolling user directly...");
        const payload = combinedCode ? { distributor_code: combinedCode } : {};
        await api.post(`/courses/${course.id}/enroll`, payload);
        onSuccess();
      }
    } catch (err: any) {
      console.error("completePayment failed with error:", err);
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        alert("Payment Error: " + detail.map((d: any) => d.msg).join(", "));
      } else if (typeof detail === 'object' && detail !== null) {
        alert("Payment Error: " + JSON.stringify(detail));
      } else {
        alert("Payment Error: " + (detail || err.message || "Enrollment failed."));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-[#0B2A5B]/80 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full bg-white shadow-xl relative flex flex-col max-h-[90vh] rounded-2xl overflow-hidden">
        <button onClick={onClose} className="absolute top-4.5 right-4 z-10 text-gray-400 hover:text-gray-600">
          ✕
        </button>
        <div className="p-6 md:p-8 pb-4 border-b border-gray-100">
          <h2 className="text-xl md:text-2xl font-bold text-[#0B2A5B]">Complete Your Enrollment</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 min-h-0 scrollbar-thin pr-4 md:pr-6">
          <div className="bg-[#F4F1EA] rounded-lg p-5 md:p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg md:text-xl font-bold text-[#0B2A5B] mb-1">{course.title || course.name}</h3>
                <p className="text-[#0B2A5B]/60 text-xs md:text-sm">Professional Trading Program</p>
              </div>
              <div className="text-right">
                <span className="text-xl md:text-2xl font-bold text-[#0B2A5B]">
                  ₹{initialPrice.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <div className="border-t border-[#0B2A5B]/10 pt-4 space-y-4">
              {/* IB / Referral Code Input */}
              <div>
                <label className="text-xs font-bold text-[#0B2A5B] block mb-1.5 uppercase tracking-wide">
                  IB / Partner Referral Code
                </label>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                      type="text"
                      placeholder="Enter IB/Referral code (e.g. IB-XXXXXX)"
                      value={ibCode}
                      onChange={(e) => setIbCode(e.target.value)}
                      disabled={ibDiscount > 0}
                      className="pl-10 uppercase font-mono"
                    />
                  </div>
                  {ibDiscount > 0 ? (
                    <Button
                      onClick={() => {
                        setIbCode("");
                        setIbDiscount(0);
                        setIbSuccessMsg("");
                        setIbError("");
                      }}
                      variant="outline"
                      className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                    >
                      Remove
                    </Button>
                  ) : (
                    <Button onClick={applyIbCode} variant="outline" className="border-[#C2A86A] text-[#C2A86A] hover:bg-[#C2A86A] hover:text-white">
                      Apply
                    </Button>
                  )}
                </div>
                {ibError && <p className="text-xs text-red-600 mt-1">{ibError}</p>}
                {ibSuccessMsg && <p className="text-xs text-green-600 mt-1">✓ {ibSuccessMsg}</p>}
              </div>

              {/* Discount Coupon Code Input */}
              <div>
                <label className="text-xs font-bold text-[#0B2A5B] block mb-1.5 uppercase tracking-wide">
                  Discount Coupon Code
                </label>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                      type="text"
                      placeholder="Enter simple coupon code (e.g. OFFER50)"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      disabled={couponDiscount > 0}
                      className="pl-10 uppercase font-mono"
                    />
                  </div>
                  {couponDiscount > 0 ? (
                    <Button
                      onClick={() => {
                        setCouponCode("");
                        setCouponDiscount(0);
                        setCouponSuccessMsg("");
                        setCouponError("");
                      }}
                      variant="outline"
                      className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                    >
                      Remove
                    </Button>
                  ) : (
                    <Button onClick={applyCouponCode} variant="outline" className="border-[#C2A86A] text-[#C2A86A] hover:bg-[#C2A86A] hover:text-white">
                      Apply
                    </Button>
                  )}
                </div>
                {couponError && <p className="text-xs text-red-600 mt-1">{couponError}</p>}
                {couponSuccessMsg && <p className="text-xs text-green-600 mt-1">✓ {couponSuccessMsg}</p>}
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-5 md:p-6">
            <h3 className="font-semibold text-sm md:text-base text-[#0B2A5B] mb-4">Order Summary</h3>
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-[#0B2A5B]/70 text-sm">
                <span>Course Fee</span>
                <span>₹{initialPrice.toLocaleString("en-IN")}</span>
              </div>
              {activeDiscount > 0 && (
                <div className="flex justify-between text-green-600 text-sm">
                  <span>Discount Applied</span>
                  <span className="font-semibold">-₹{activeDiscount.toLocaleString("en-IN")}</span>
                </div>
              )}
              <div className="flex justify-between text-[#0B2A5B]/70 text-sm">
                <span>Taxable Subtotal</span>
                <span>₹{(initialPrice - activeDiscount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[#0B2A5B]/70 text-sm">
                <span>GST (18%)</span>
                <span>₹{((initialPrice - activeDiscount) * 0.18).toFixed(2)}</span>
              </div>
              <div className="border-t border-[#0B2A5B]/10 pt-3 flex justify-between text-[#0B2A5B] items-center">
                <span className="text-base md:text-lg font-semibold">Total Amount</span>
                <span className="text-xl md:text-2xl font-bold text-[#C2A86A]">
                  ₹{((initialPrice - activeDiscount) * 1.18).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8 pt-4 border-t border-gray-100 bg-gray-50/50 flex gap-4">
          <Button
            onClick={completePayment}
            disabled={loading}
            className="flex-1 bg-[#0B2A5B] text-[#F4F1EA] hover:bg-[#1a3d7a] shadow-lg shadow-[#0B2A5B]/20 py-2.5 md:py-3.5 h-auto text-sm md:text-base font-semibold"
          >
            {loading ? "Processing..." : `Pay ₹${((initialPrice - activeDiscount) * 1.18).toFixed(2)}`}
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
            className="border-2 border-[#0B2A5B]/20 text-[#0B2A5B] py-2.5 md:py-3.5 h-auto text-sm md:text-base font-semibold"
          >
            Cancel
          </Button>
        </div>
      </Card>
    </div>
  );
}
