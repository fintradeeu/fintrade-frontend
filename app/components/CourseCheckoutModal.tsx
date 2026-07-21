import { useState, useEffect } from "react";
import api from "../services/api";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { Tag, IndianRupee, CreditCard, Banknote, Landmark, Upload } from "lucide-react";

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
  batchId?: number | null;
  pendingAmount?: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CourseCheckoutModal({ course, batchId, pendingAmount, onClose, onSuccess }: CourseCheckoutModalProps) {
  const [isAdminCreated] = useState(() => {
    try {
      const u = localStorage.getItem("user");
      return u ? JSON.parse(u).is_admin_created : false;
    } catch {
      return false;
    }
  });
  const [ibCode, setIbCode] = useState(() => localStorage.getItem("distributor_code") || "");
  const [couponCode, setCouponCode] = useState("");
  const [ibDiscount, setIbDiscount] = useState(0);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [availableBatches, setAvailableBatches] = useState<any[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState<string>(batchId ? String(batchId) : "");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "cash" | "cheque" | "partial">("razorpay");
  const [offlineData, setOfflineData] = useState({
    payment_date: "",
    reference_number: "",
    remarks: "",
    bank_name: "",
    branch_name: "",
    account_holder_name: ""
  });
  const [chequeFile, setChequeFile] = useState<File | null>(null);
  
  const parsePrice = (p: any) => parseFloat(String(p).replace(/[^0-9.]/g, '')) || 0;
  const initialPrice = pendingAmount ? pendingAmount : parsePrice(course.price);
  
  const activeDiscount = pendingAmount ? 0 : (couponDiscount + ibDiscount);
  const finalPrice = Math.max(initialPrice - activeDiscount, 0);

  const [loading, setLoading] = useState(false);
  const [ibError, setIbError] = useState("");
  const [ibSuccessMsg, setIbSuccessMsg] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponSuccessMsg, setCouponSuccessMsg] = useState("");

  // Load available batches on mount
  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const res = await api.get(`/batches/public/list?course_id=${course.id}`);
        const list = res.data || [];
        setAvailableBatches(list);
        setAvailableBatches(list);
        if (batchId) {
          setSelectedBatchId(String(batchId));
        } else if (list.length > 0) {
          setSelectedBatchId(String(list[0].id));
        }
      } catch (err) {
        console.warn("Failed to fetch available batches for course checkout:", err);
      }
    };
    fetchBatches();
  }, [course.id]);

  // Auto-apply saved coupon code on mount
  useEffect(() => {
    if (pendingAmount) return; // Do not apply coupons for pending payments
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
      const finalAmountPaid = ((initialPrice - activeDiscount) * 1.18);
      if (Number(finalPrice) > 0) {
        
        if (paymentMethod === "cash" || paymentMethod === "cheque" || paymentMethod === "partial") {
          if ((paymentMethod === "cash" || paymentMethod === "partial") && (!offlineData.payment_date)) {
            alert("Please fill in the required fields (Payment Date).");
            setLoading(false); return;
          }
          if (paymentMethod === "cheque" && (!offlineData.reference_number || !offlineData.payment_date || !offlineData.bank_name || !offlineData.branch_name || !offlineData.account_holder_name || !chequeFile)) {
            alert("Please fill all required cheque details and upload a cheque image.");
            setLoading(false); return;
          }

          let chequeImageUrl = "";
          if (paymentMethod === "cheque" && chequeFile) {
            const formData = new FormData();
            formData.append("file", chequeFile);
            const uploadRes = await api.post("/payments/upload-cheque", formData, {
              headers: { "Content-Type": "multipart/form-data" }
            });
            chequeImageUrl = uploadRes.data.url;
          }

          await api.post("/payments/offline-payment", {
            course_id: course.id,
            payment_mode: paymentMethod,
            amount: Number(finalAmountPaid.toFixed(2)),
            coupon_code: pendingAmount ? null : (combinedCode || null),
            batch_id: selectedBatchId ? Number(selectedBatchId) : null,
            ...offlineData,
            cheque_image_url: chequeImageUrl || undefined
          });
          setIsPending(true);
          return;
        }

        console.log("Initiating payment for course ID:", course.id);
        const res = await api.post("/payments/create", {
          course_id: course.id,
          coupon_code: pendingAmount ? null : (combinedCode || null),
          discounted_price: pendingAmount ? pendingAmount : (activeDiscount > 0 ? finalPrice : null),
          batch_id: selectedBatchId ? Number(selectedBatchId) : null,
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
        const payload: any = {};
        if (combinedCode) payload.distributor_code = combinedCode;
        if (selectedBatchId) payload.batch_id = Number(selectedBatchId);
        await api.post(`/courses/${course.id}/enroll`, payload);
        
        try {
          const kycRes = await api.get("/kyc/status");
          if (kycRes.data && (kycRes.data.status === "verified" || kycRes.data.status === "approved")) {
             window.location.href = "/student/dashboard";
          } else {
             window.location.href = `/student/contract-kyc?course_id=${course.id}`;
          }
        } catch (e) {
          window.location.href = `/student/contract-kyc?course_id=${course.id}`;
        }
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

        {isSuccess ? (
          <div className="p-10 flex flex-col items-center justify-center text-center space-y-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-2">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-[#0B2A5B]">Enrollment Successful!</h2>
            <p className="text-slate-500 max-w-md">
              Congratulations! You have successfully enrolled in <strong>{course.title || course.name}</strong> using a 100% discount. 
            </p>
            <button
              onClick={() => window.location.href = "/student/dashboard"}
              className="mt-6 w-full py-4 bg-[#D50032] text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-[#D50032]/30 hover:-translate-y-0.5 transition-all"
            >
              Go to Dashboard
            </button>
          </div>
        ) : isPending ? (
          <div className="p-10 flex flex-col items-center justify-center text-center space-y-6">
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-2">
              <svg className="w-10 h-10 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-[#0B2A5B]">Payment Submitted!</h2>
            <p className="text-slate-500 max-w-md">
              Your {paymentMethod} payment for <strong>{course.title || course.name}</strong> has been submitted and is currently <strong>{(paymentMethod === "cash" || paymentMethod === "partial") ? "Pending Verification" : "Pending Clearance"}</strong>. 
              An admin will review it shortly. Once approved, the course will be unlocked.
            </p>
            <button
              onClick={() => { onClose(); onSuccess(); }}
              className="mt-6 w-full py-4 bg-[#D50032] text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-[#D50032]/30 hover:-translate-y-0.5 transition-all"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <div className="p-6 md:p-8 pb-4 border-b border-gray-100">
              <h2 className="text-xl md:text-2xl font-bold text-[#0B2A5B]">Complete Your Enrollment</h2>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 min-h-0 scrollbar-thin pr-4 md:pr-6">
          <div className="bg-[#F4F1EA] rounded-lg p-5 md:p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1 pr-4">
                <h3 className="text-lg md:text-xl font-bold text-[#0B2A5B] mb-1">{course.title || course.name}</h3>
                {availableBatches.length === 0 && (
                  <p className="text-[#0B2A5B]/60 text-xs md:text-sm">Professional Trading Program</p>
                )}
              </div>
              <div className="text-right shrink-0">
                <span className="text-xl md:text-2xl font-bold text-[#0B2A5B]">
                  ₹{initialPrice.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {!pendingAmount && availableBatches.length > 0 && (
              <div className="mb-4 w-full">
                <label className="text-[10px] text-[#0B2A5B] font-black uppercase tracking-wider block mb-2">
                  Choose Starting Batch (Cohort)
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
                  {availableBatches.map((batch: any) => (
                    <button
                      key={batch.id}
                      onClick={() => setSelectedBatchId(String(batch.id))}
                      className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                        selectedBatchId === String(batch.id)
                          ? "border-[#0B2A5B] bg-[#0B2A5B]/5 shadow-sm ring-1 ring-[#0B2A5B]"
                          : "border-gray-200 bg-white hover:border-[#0B2A5B]/40 hover:bg-gray-50/50"
                      }`}
                    >
                      <div className="flex-1">
                        <div className="font-bold text-[#0B2A5B] text-sm flex items-center gap-2">
                          {batch.name}
                          {batch.status === "Registration Open" && <span className="bg-emerald-100 text-emerald-800 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">Open</span>}
                          {batch.status === "Running" && <span className="bg-blue-100 text-blue-800 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">Running</span>}
                          {batch.status === "Upcoming" && <span className="bg-amber-100 text-amber-800 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">Upcoming</span>}
                        </div>
                        <div className="text-[11px] font-medium text-gray-500 mt-1 flex items-center gap-1.5">
                          <span className="text-sm leading-none">📅</span>
                          <span>Starts {new Date(batch.start_date).toLocaleDateString(undefined, { dateStyle: "medium" })}</span>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ml-4 ${
                        selectedBatchId === String(batch.id) ? "border-[#0B2A5B]" : "border-gray-300"
                      }`}>
                        {selectedBatchId === String(batch.id) && <div className="w-2.5 h-2.5 bg-[#0B2A5B] rounded-full" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!pendingAmount && (
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
            )}
          </div>

          {/* Payment Method Selection */}
          <div className="bg-gray-50 rounded-lg p-5 md:p-6 mt-4">
            <h3 className="font-semibold text-sm md:text-base text-[#0B2A5B] mb-4">Payment Method</h3>
            <div className={`grid grid-cols-1 ${isAdminCreated ? 'sm:grid-cols-3' : 'sm:grid-cols-1'} gap-3 mb-4`}>
              <button
                onClick={() => setPaymentMethod("razorpay")}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${paymentMethod === 'razorpay' ? 'border-[#0B2A5B] bg-[#0B2A5B]/5' : 'border-gray-200 bg-white hover:border-[#0B2A5B]/30'}`}
              >
                <CreditCard className={`mb-2 ${paymentMethod === 'razorpay' ? 'text-[#0B2A5B]' : 'text-gray-400'}`} />
                <span className={`text-sm font-semibold ${paymentMethod === 'razorpay' ? 'text-[#0B2A5B]' : 'text-gray-500'}`}>Razorpay</span>
              </button>
              {isAdminCreated && (
                <>
                  <button
                    onClick={() => setPaymentMethod("cash")}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${paymentMethod === 'cash' ? 'border-[#0B2A5B] bg-[#0B2A5B]/5' : 'border-gray-200 bg-white hover:border-[#0B2A5B]/30'}`}
                  >
                    <Banknote className={`mb-2 ${paymentMethod === 'cash' ? 'text-[#0B2A5B]' : 'text-gray-400'}`} />
                    <span className={`text-sm font-semibold ${paymentMethod === 'cash' ? 'text-[#0B2A5B]' : 'text-gray-500'}`}>Cash</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod("cheque")}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${paymentMethod === 'cheque' ? 'border-[#0B2A5B] bg-[#0B2A5B]/5' : 'border-gray-200 bg-white hover:border-[#0B2A5B]/30'}`}
                  >
                    <Landmark className={`mb-2 ${paymentMethod === 'cheque' ? 'text-[#0B2A5B]' : 'text-gray-400'}`} />
                    <span className={`text-sm font-semibold ${paymentMethod === 'cheque' ? 'text-[#0B2A5B]' : 'text-gray-500'}`}>Cheque</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod("partial")}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${paymentMethod === 'partial' ? 'border-[#0B2A5B] bg-[#0B2A5B]/5' : 'border-gray-200 bg-white hover:border-[#0B2A5B]/30'}`}
                  >
                    <CreditCard className={`mb-2 ${paymentMethod === 'partial' ? 'text-[#0B2A5B]' : 'text-gray-400'}`} />
                    <span className={`text-sm font-semibold ${paymentMethod === 'partial' ? 'text-[#0B2A5B]' : 'text-gray-500'}`}>Partial</span>
                  </button>
                </>
              )}
            </div>

            {/* Cash & Partial Fields */}
            {(paymentMethod === "cash" || paymentMethod === "partial") && (
              <div className="space-y-4 pt-2 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-[#0B2A5B] block mb-1">Receipt Number (Optional)</label>
                    <Input value={offlineData.reference_number} onChange={e => setOfflineData({...offlineData, reference_number: e.target.value})} placeholder="E.g. RCPT-123" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#0B2A5B] block mb-1">Payment Date *</label>
                    <Input type="date" value={offlineData.payment_date} onChange={e => setOfflineData({...offlineData, payment_date: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-[#0B2A5B] block mb-1">Remarks (Optional)</label>
                  <Input value={offlineData.remarks} onChange={e => setOfflineData({...offlineData, remarks: e.target.value})} placeholder="Any additional notes" />
                </div>
              </div>
            )}

            {/* Cheque Fields */}
            {paymentMethod === "cheque" && (
              <div className="space-y-4 pt-2 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-[#0B2A5B] block mb-1">Cheque Number *</label>
                    <Input value={offlineData.reference_number} onChange={e => setOfflineData({...offlineData, reference_number: e.target.value})} placeholder="E.g. 000123" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#0B2A5B] block mb-1">Cheque Date *</label>
                    <Input type="date" value={offlineData.payment_date} onChange={e => setOfflineData({...offlineData, payment_date: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#0B2A5B] block mb-1">Bank Name *</label>
                    <Input value={offlineData.bank_name} onChange={e => setOfflineData({...offlineData, bank_name: e.target.value})} placeholder="E.g. HDFC Bank" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#0B2A5B] block mb-1">Branch Name *</label>
                    <Input value={offlineData.branch_name} onChange={e => setOfflineData({...offlineData, branch_name: e.target.value})} placeholder="E.g. MG Road Branch" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-[#0B2A5B] block mb-1">Account Holder Name *</label>
                    <Input value={offlineData.account_holder_name} onChange={e => setOfflineData({...offlineData, account_holder_name: e.target.value})} placeholder="Name on cheque" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-[#0B2A5B] block mb-1">Cheque Image Upload *</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
                      <input type="file" accept="image/*" onChange={e => setChequeFile(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                      <Upload className="mx-auto text-gray-400 mb-2" size={24} />
                      <span className="text-sm font-medium text-gray-600">
                        {chequeFile ? chequeFile.name : "Click to browse or drag & drop"}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-[#0B2A5B] block mb-1">Remarks (Optional)</label>
                  <Input value={offlineData.remarks} onChange={e => setOfflineData({...offlineData, remarks: e.target.value})} placeholder="Any additional notes" />
                </div>
              </div>
            )}
          </div>


          <div className="bg-gray-50 rounded-lg p-5 md:p-6">
            <h3 className="font-semibold text-sm md:text-base text-[#0B2A5B] mb-4">
              {pendingAmount ? "Pending Payment Summary" : "Order Summary"}
            </h3>
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-[#0B2A5B]/70 text-sm">
                <span>{pendingAmount ? "Pending Base Amount" : "Course Fee"}</span>
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
            disabled={loading || ((paymentMethod === "cash" || paymentMethod === "partial") && (!offlineData.payment_date)) || (paymentMethod === "cheque" && (!offlineData.reference_number || !offlineData.payment_date || !offlineData.bank_name || !offlineData.branch_name || !offlineData.account_holder_name || !chequeFile))}
            className="flex-1 bg-[#0B2A5B] text-[#F4F1EA] hover:bg-[#1a3d7a] shadow-lg shadow-[#0B2A5B]/20 py-2.5 md:py-3.5 h-auto text-sm md:text-base font-semibold"
          >
            {loading ? "Processing..." : `Pay ₹${((initialPrice - activeDiscount) * 1.18).toFixed(2)} ${paymentMethod !== 'razorpay' ? `via ${paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1)}` : ''}`}
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
            className="border-2 border-[#0B2A5B]/20 text-[#0B2A5B] py-2.5 md:py-3.5 h-auto text-sm md:text-base font-semibold"
          >
            Cancel
          </Button>
        </div>
        </>
        )}
      </Card>
    </div>
  );
}
