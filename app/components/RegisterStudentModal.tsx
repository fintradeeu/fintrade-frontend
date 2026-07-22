import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import api from "../services/api";
import { AlertCircle, CheckCircle2, Upload } from "lucide-react";

interface Props {
  onClose: () => void;
  onSuccess: () => void;
  apiPrefix: "/franchise-ibs" | "/distributor";
}

export default function RegisterStudentModal({ onClose, onSuccess, apiPrefix }: Props) {
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [allCourses, setAllCourses] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [batches, setBatches] = useState<any[]>([]);
  const [chequeFile, setChequeFile] = useState<File | null>(null);

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
        payment_due_date: formData.payment_due_date || undefined,
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
  const amountEntered = parseFloat(formData.amount) || 0;
  const pendingAmount = Math.max(0, coursePrice - amountEntered);

  return (
    <Dialog open={true} onOpenChange={onClose}>
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
          <div className="bg-green-50 text-green-700 p-3 rounded-lg flex items-center gap-2 text-sm mb-4">
            <CheckCircle2 size={16} />
            {success}
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
                <div className="flex justify-between items-center bg-blue-50 text-[#0B2A5B] p-3 rounded-md mb-2 text-sm border border-blue-100">
                  <div>
                    <span className="font-semibold block">Total Course Price:</span>
                    <span className="text-lg font-bold">₹{coursePrice.toLocaleString()}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold block">Pending Balance:</span>
                    <span className={`text-lg font-bold ${pendingAmount > 0 ? 'text-orange-600' : 'text-green-600'}`}>
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
  );
}
