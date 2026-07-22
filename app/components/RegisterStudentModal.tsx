import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import api from "../services/api";
import { AlertCircle, CheckCircle2, Upload, FileText, Download, ShieldCheck, Tag } from "lucide-react";
import { toast } from "sonner";
import InvoiceModal from "./InvoiceModal";

interface Props {
  open?: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onPerformKyc?: (student: any) => void;
  apiPrefix?: string;
}

export default function RegisterStudentModal({ open = true, onClose, onSuccess, onPerformKyc, apiPrefix = "/franchise-ibs" }: Props) {
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [allCourses, setAllCourses] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [batches, setBatches] = useState<any[]>([]);
  const [chequeFile, setChequeFile] = useState<File | null>(null);

  // Coupon state
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [couponSuccess, setCouponSuccess] = useState("");
  const [couponError, setCouponError] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [createdStudentData, setCreatedStudentData] = useState<any | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    phone: "",
    city: "",
    course_id: "",
    batch_id: "",
    payment_mode: "razorpay", // razorpay, cash, cheque
    amount: "",
    reference_number: "",
    remarks: "",
    bank_name: "",
    branch_name: "",
    account_holder_name: "",
    payment_date: "",
    payment_due_date: "", // deadline for remaining balance
    coupon_code: "",
  });

  useEffect(() => {
    // Fetch all public batches on mount
    const fetchBatches = async () => {
      try {
        const res = await api.get("/batches/public/list");
        console.log("Batches API Response:", res.data);
        const data = res.data?.data || res.data;
        setBatches(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch batches", err);
        setBatches([]);
      }
    };
    const fetchCourses = async () => {
      try {
        const res = await api.get("/courses");
        const data = res.data?.data || res.data;
        setAllCourses(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch courses", err);
      }
    };
    fetchBatches();
    fetchCourses();
  }, []);

  useEffect(() => {
    // Update courses when a batch is selected
    if (formData.batch_id && formData.batch_id !== "none") {
      const selectedBatch = batches.find(b => b.id.toString() === formData.batch_id);
      if (selectedBatch && selectedBatch.assigned_courses) {
        setCourses(selectedBatch.assigned_courses.filter((c: any) => !c.is_batch_only));
      } else {
        setCourses([]);
      }
    } else {
      setCourses(allCourses.filter((c) => !c.is_batch_only));
    }
    // Reset selected course when batch changes
    setFormData(prev => ({ ...prev, course_id: "" }));
  }, [formData.batch_id, batches, allCourses]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      
      // Auto-generate receipt number for Cash
      if (name === "payment_mode" && value === "cash") {
        const randomReceipt = `CASH-${Math.floor(100000 + Math.random() * 900000)}`;
        updated.reference_number = randomReceipt;
      } else if (name === "payment_mode" && value !== "cash" && value !== "cheque") {
        updated.reference_number = "";
      }
      
      return updated;
    });
  };

  const handleApplyCoupon = async () => {
    if (!formData.coupon_code.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }
    setValidatingCoupon(true);
    setCouponError("");
    setCouponSuccess("");
    try {
      const courseId = formData.course_id ? parseInt(formData.course_id) : null;
      const res = await api.post("/offers/validate", {
        code: formData.coupon_code.trim().toUpperCase(),
        course_id: courseId || 1,
      });
      if (res.data) {
        const disc = res.data.discount_amount || res.data.discount || 0;
        const discountedPrice = res.data.discounted_price !== undefined ? res.data.discounted_price : Math.max(0, coursePrice - disc);
        setAppliedDiscount(disc);
        setFormData(prev => ({ ...prev, amount: discountedPrice.toString() }));
        setCouponSuccess(`✅ Coupon "${formData.coupon_code.trim().toUpperCase()}" applied! Discount: ₹${disc.toLocaleString("en-IN")} | Net Fee: ₹${discountedPrice.toLocaleString("en-IN")}`);
        toast.success(`Coupon applied! Discount ₹${disc}`);
      }
    } catch (err: any) {
      setCouponError(err.response?.data?.detail || "Invalid or expired coupon code.");
      setAppliedDiscount(0);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const downloadTaxInvoice = (stData?: any) => {
    const selectedCourseObj = allCourses.find((c) => c.id.toString() === formData.course_id);
    const selectedBatchObj = batches.find((b) => b.id.toString() === formData.batch_id);
    const invoiceNo = `FT-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    const dateStr = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    const amountPaid = parseFloat(formData.amount) || 0;
    const coursePrice = selectedCourseObj?.price || amountPaid;
    const discount = appliedDiscount || 0;
    const taxableAmount = (amountPaid / 1.18).toFixed(2);
    const gstAmount = (amountPaid - parseFloat(taxableAmount)).toFixed(2);

    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>FinTrade Tax Invoice - ${invoiceNo}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 40px; color: #1e293b; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0B2A5B; padding-bottom: 16px; margin-bottom: 24px; }
          .logo { font-size: 26px; font-weight: 800; color: #0B2A5B; }
          .subtitle { font-size: 12px; color: #64748b; }
          .inv-title { font-size: 20px; font-weight: bold; color: #0B2A5B; text-align: right; }
          .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; }
          .box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 8px; }
          .box h4 { margin: 0 0 8px 0; font-size: 13px; color: #0B2A5B; text-transform: uppercase; letter-spacing: 0.5px; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; margin-bottom: 24px; }
          th { background: #0B2A5B; color: white; padding: 10px 12px; text-align: left; font-size: 13px; }
          td { padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
          .totals { width: 300px; margin-left: auto; margin-top: 16px; }
          .totals-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; }
          .totals-row.grand { font-size: 16px; font-weight: bold; border-top: 2px solid #0B2A5B; color: #0B2A5B; padding-top: 10px; }
          .footer { margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 16px; font-size: 11px; color: #94a3b8; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">FinTrade Learning Solutions</div>
            <div class="subtitle">Official Student Enrollment Tax Invoice</div>
          </div>
          <div>
            <div class="inv-title">TAX INVOICE</div>
            <div style="font-size:12px; color:#64748b;">Invoice No: <strong>${invoiceNo}</strong></div>
            <div style="font-size:12px; color:#64748b;">Date: ${dateStr}</div>
          </div>
        </div>

        <div class="details-grid">
          <div class="box">
            <h4>Billed To (Student)</h4>
            <div><strong>${formData.full_name}</strong></div>
            <div>Email: ${formData.email}</div>
            <div>Phone: ${formData.phone}</div>
            <div>City: ${formData.city || 'N/A'}</div>
          </div>
          <div class="box">
            <h4>Payment Information</h4>
            <div>Payment Method: <strong style="text-transform:uppercase;">${formData.payment_mode}</strong></div>
            ${formData.reference_number ? `<div>Ref / Receipt No: ${formData.reference_number}</div>` : ''}
            ${formData.bank_name ? `<div>Bank: ${formData.bank_name} (${formData.branch_name || ''})</div>` : ''}
            <div>Payment Status: <strong style="color:#16a34a;">${formData.payment_due_date ? 'Partial Paid' : 'Full Paid'}</strong></div>
            ${formData.payment_due_date ? `<div>Remaining Balance Due Date: ${new Date(formData.payment_due_date).toLocaleDateString("en-IN")}</div>` : ''}
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th>Batch</th>
              <th style="text-align:right;">Original Fee</th>
              <th style="text-align:right;">Discount</th>
              <th style="text-align:right;">Amount Paid (Inc. 18% GST)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>${selectedCourseObj?.title || 'FinTrade Trading Course'}</strong></td>
              <td>${selectedBatchObj?.name || 'Standard Batch'}</td>
              <td style="text-align:right;">₹${coursePrice.toLocaleString('en-IN')}</td>
              <td style="text-align:right; color:#dc2626;">${discount > 0 ? `-₹${discount.toLocaleString('en-IN')}` : '₹0'}</td>
              <td style="text-align:right; font-weight:bold;">₹${amountPaid.toLocaleString('en-IN')}</td>
            </tr>
          </tbody>
        </table>

        <div class="totals">
          <div class="totals-row">
            <span>Taxable Amount:</span>
            <span>₹${taxableAmount}</span>
          </div>
          <div class="totals-row">
            <span>CGST (9%) + SGST (9%):</span>
            <span>₹${gstAmount}</span>
          </div>
          <div class="totals-row grand">
            <span>Total Paid:</span>
            <span>₹${amountPaid.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div class="footer">
          <p>FinTrade Learning Solutions | Computer Generated Tax Invoice — Requires No Signature</p>
        </div>
        <script>window.onload = function() { window.print(); }</script>
      </body>
      </html>
    `);
    win.document.close();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const amountVal = formData.amount ? parseFloat(formData.amount) : 0;
    const selectedCourseObj = courses.find((c) => c.id.toString() === formData.course_id);
    const coursePrice = selectedCourseObj?.price || 0;

    if ((formData.payment_mode === "cash" || formData.payment_mode === "cheque") && amountVal > coursePrice) {
      setError(`Amount collected (₹${amountVal}) cannot be greater than the course price (₹${coursePrice}).`);
      setLoading(false);
      return;
    }

    try {
      let chequeImageUrl = "";
      if (formData.payment_mode === "cheque") {
        if (!formData.reference_number || !formData.payment_date || !formData.bank_name || !formData.branch_name || !formData.account_holder_name || !chequeFile) {
          setError("Please fill all required cheque details and upload a cheque image.");
          setLoading(false);
          return;
        }
        const fileData = new FormData();
        fileData.append("file", chequeFile);
        const uploadRes = await api.post("/payments/upload-cheque", fileData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        chequeImageUrl = uploadRes.data.url;
      }

      const payload = {
        ...formData,
        course_id: formData.course_id && formData.course_id !== "none" ? parseInt(formData.course_id) : null,
        batch_id: formData.batch_id && formData.batch_id !== "none" ? parseInt(formData.batch_id) : null,
        amount: formData.amount ? parseFloat(formData.amount) : 0,
        cheque_image_url: chequeImageUrl || undefined,
        payment_date: formData.payment_date ? new Date(formData.payment_date).toISOString() : undefined,
        payment_due_date: formData.payment_due_date ? new Date(formData.payment_due_date).toISOString() : undefined,
      };

      await api.post(`${apiPrefix}/manual-register`, payload);
      
      setSuccess("Student successfully registered! Credentials have been sent to their email.");
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to register student. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isOffline = formData.payment_mode === "cash" || formData.payment_mode === "cheque";

  const selectedCourseObj = courses.find((c) => c.id.toString() === formData.course_id);
  const coursePrice = selectedCourseObj?.price || 0;
  const netCoursePrice = Math.max(0, coursePrice - appliedDiscount);
  const amountEntered = parseFloat(formData.amount) || 0;
  const pendingAmount = Math.max(0, netCoursePrice - amountEntered);

  return (
    <>
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Register New Student</DialogTitle>
          <DialogDescription>
            Manually create an account for a student and capture payment details.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg flex items-center gap-2 text-sm mb-4">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl space-y-3 mb-4">
            <div className="flex items-center gap-2 text-base font-semibold text-green-900">
              <CheckCircle2 size={20} className="text-green-600" />
              Student Successfully Registered!
            </div>
            <p className="text-xs text-green-700">
              Account created for <strong>{formData.full_name}</strong> ({formData.email}). Login credentials sent to email.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-green-200">
              <Button
                type="button"
                onClick={() => setShowInvoiceModal(true)}
                className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs gap-1.5 shadow-sm"
              >
                <FileText size={14} /> View Tax Invoice
              </Button>
              {onPerformKyc && (
                <Button type="button" onClick={() => onPerformKyc(createdStudentData || { email: formData.email, full_name: formData.full_name })} className="bg-[#0B2A5B] hover:bg-[#123E7E] text-white text-xs gap-1.5 shadow-sm">
                  <ShieldCheck size={14} /> Perform eKYC Now
                </Button>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name *</Label>
              <Input id="full_name" name="full_name" value={formData.full_name} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input id="password" name="password" type="password" value={formData.password} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" name="city" value={formData.city} onChange={handleChange} />
            </div>
          </div>

          <div className="space-y-2 border-t pt-4">
            <Label htmlFor="batch_id">Select Batch</Label>
            <Select value={formData.batch_id} onValueChange={(v) => handleSelectChange("batch_id", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a batch (Optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">-- None --</SelectItem>
                {batches.map((b) => (
                  <SelectItem key={b.id} value={b.id.toString()}>{b.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {courses.length > 0 && (
            <div className="space-y-2 pt-2">
              <Label htmlFor="course_id">Select Course</Label>
              <Select value={formData.course_id} onValueChange={(v) => handleSelectChange("course_id", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">-- Select a course --</SelectItem>
                  {courses.map((c) => (
                    <SelectItem key={c.id} value={c.id.toString()}>{c.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Coupon Code Section */}
          <div className="space-y-2 border-t pt-3">
            <Label htmlFor="coupon_code" className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
              <Tag size={14} className="text-[#0B2A5B]" /> Coupon Code (Optional)
            </Label>
            <div className="flex gap-2">
              <Input
                id="coupon_code"
                name="coupon_code"
                placeholder="Enter coupon code (e.g. SAVE20)"
                value={formData.coupon_code}
                onChange={(e) => setFormData(prev => ({ ...prev, coupon_code: e.target.value.toUpperCase() }))}
                className="uppercase text-sm"
              />
              <Button type="button" variant="outline" onClick={handleApplyCoupon} disabled={validatingCoupon || !formData.coupon_code} className="text-xs font-semibold border-[#0B2A5B]/30 text-[#0B2A5B]">
                {validatingCoupon ? "Checking..." : "Apply Coupon"}
              </Button>
            </div>
            {couponSuccess && <p className="text-xs text-[#16A34A] font-medium mt-1">{couponSuccess}</p>}
            {couponError && <p className="text-xs text-red-500 font-medium mt-1">{couponError}</p>}
          </div>

          <div className="space-y-2 border-t pt-4">
            <Label>Payment Mode *</Label>
            <Select value={formData.payment_mode} onValueChange={(v) => handleSelectChange("payment_mode", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="cheque">Cheque</SelectItem>
                <SelectItem value="razorpay">Online Payment (Coming Soon)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isOffline && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-4">
              {selectedCourseObj && (
                <div className="bg-blue-50/80 text-[#0B2A5B] p-3.5 rounded-lg mb-2 text-sm border border-blue-100 space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-xs text-gray-500 block">Original Price:</span>
                      <span className="text-base font-bold text-gray-800">₹{coursePrice.toLocaleString()}</span>
                    </div>
                    {appliedDiscount > 0 && (
                      <div className="text-center">
                        <span className="text-xs text-green-600 font-semibold block">Coupon Discount:</span>
                        <span className="text-base font-bold text-green-700">-₹{appliedDiscount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="text-right">
                      <span className="text-xs text-gray-500 block">Net Fee Payable:</span>
                      <span className="text-base font-extrabold text-[#0B2A5B]">₹{netCoursePrice.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center pt-2 border-t border-blue-200/60 text-xs">
                    <span className="font-semibold text-gray-600">Pending Remaining Balance:</span>
                    <span className={`font-bold text-sm ${pendingAmount > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                      ₹{pendingAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2 md:col-span-1">
                  <Label htmlFor="amount">Amount Collected *</Label>
                  <Input id="amount" name="amount" type="number" min="0" step="0.01" value={formData.amount} onChange={handleChange} required={isOffline} />
                  {formData.amount && !isNaN(parseFloat(formData.amount)) && (
                    <div className="mt-2 bg-white p-3 rounded border border-gray-200">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Base Amount:</span>
                        <span>₹{parseFloat(formData.amount).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-600 mb-2">
                        <span>GST (18%):</span>
                        <span>₹{(parseFloat(formData.amount) * 0.18).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm font-bold text-[#0B2A5B] pt-2 border-t border-gray-100">
                        <span>Total Paid by Student:</span>
                        <span>₹{(parseFloat(formData.amount) * 1.18).toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                </div>
                
                {formData.payment_mode === "cheque" && (
                <>
                  <div className="space-y-2">
                    <Label>Bank Name *</Label>
                    <Input name="bank_name" value={formData.bank_name} onChange={handleChange} placeholder="e.g. HDFC Bank" />
                  </div>
                  <div className="space-y-2">
                    <Label>Branch Name *</Label>
                    <Input name="branch_name" value={formData.branch_name} onChange={handleChange} placeholder="e.g. Andheri West" />
                  </div>
                  <div className="space-y-2">
                    <Label>Cheque Date *</Label>
                    <Input type="date" name="payment_date" value={formData.payment_date} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <Label>Account Holder Name *</Label>
                    <Input name="account_holder_name" value={formData.account_holder_name} onChange={handleChange} placeholder="Name on cheque" />
                  </div>
                </>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="reference_number">{formData.payment_mode === "cheque" ? "Cheque Number *" : "Reference/Receipt No"}</Label>
                <Input id="reference_number" name="reference_number" value={formData.reference_number} onChange={handleChange} placeholder={formData.payment_mode === "cheque" ? "e.g. 000123" : ""} />
              </div>
              
              {formData.payment_mode === "cheque" && (
                <div className="space-y-2 col-span-2 pt-2 border-t border-gray-200 mt-2">
                  <Label>Upload Cheque Image (Required)</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors bg-white">
                    <input type="file" id="cheque-upload" className="hidden" accept="image/*,.pdf" onChange={e => setChequeFile(e.target.files?.[0] || null)} />
                    <label htmlFor="cheque-upload" className="cursor-pointer flex flex-col items-center">
                      <Upload className="w-6 h-6 text-gray-400 mb-2" />
                      <span className="text-sm text-[#0B2A5B] font-semibold">
                        {chequeFile ? chequeFile.name : "Click to browse or drag & drop"}
                      </span>
                      <span className="text-xs text-gray-500 mt-1">JPEG, PNG or PDF (Max 5MB)</span>
                    </label>
                  </div>
                </div>
              )}
              
              <div className="space-y-2 col-span-2">
                <Label htmlFor="remarks">Remarks</Label>
                <Input id="remarks" name="remarks" value={formData.remarks} onChange={handleChange} placeholder="Any specific notes..." />
              </div>

              {/* Payment Due Date — only when partial payment */}
              {pendingAmount > 0 && (
                <div className="space-y-2 col-span-2 border-t pt-4">
                  <Label htmlFor="payment_due_date" className="flex items-center gap-2 text-orange-700 font-semibold">
                    <span>⏰</span> Payment Due Date (Deadline for Remaining ₹{pendingAmount.toLocaleString()})
                  </Label>
                  <p className="text-xs text-gray-500 mb-1">Set the date and time by which the student must pay the outstanding balance. The student will be shown this deadline in their dashboard.</p>
                  <Input
                    id="payment_due_date"
                    name="payment_due_date"
                    type="datetime-local"
                    value={formData.payment_due_date}
                    onChange={handleChange}
                    className="border-orange-300 focus:ring-orange-400"
                    required
                  />
                  {!formData.payment_due_date && (
                    <p className="text-xs text-orange-600 font-medium">⚠️ Required for partial payments — superadmin can block access after this date if unpaid.</p>
                  )}
                </div>
              )}
            </div>
            </div>
          )}

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-[#0B2A5B] text-white hover:bg-[#123E7E]">
              {loading ? "Registering..." : "Register Student"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    {/* Tax Invoice Summary Modal — same UI as Admin Students */}
    {showInvoiceModal && createdStudentData && (() => {
      const selectedCourseObj = allCourses.find((c) => c.id.toString() === formData.course_id);
      const amtPaid = parseFloat(formData.amount) || 0;
      const originalPrice = selectedCourseObj?.price || amtPaid;
      const disc = appliedDiscount > 0 ? originalPrice - amtPaid : 0;
      return (
        <InvoiceModal
          open={showInvoiceModal}
          onClose={() => setShowInvoiceModal(false)}
          student={{
            id: createdStudentData.id || createdStudentData.user_id || 0,
            full_name: formData.full_name,
            email: formData.email,
            phone: formData.phone,
          }}
          invoice={{
            invoiceNumber: `FT-2026-${Math.floor(10000 + Math.random() * 90000)}`,
            purchaseDate: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
            courseTitle: selectedCourseObj?.title || "Professional Trading Course",
            originalPrice,
            discountAmount: disc,
            amountPaid: amtPaid,
            paymentMethod: (formData.payment_mode || "Cash / Cheque").toUpperCase(),
            paymentId: createdStudentData.payment_id || `TXN${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
            status: "PAID",
          }}
        />
      );
    })()}
    </>
  );
}
