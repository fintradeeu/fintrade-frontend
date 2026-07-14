import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import api from "../services/api";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface Props {
  onClose: () => void;
  onSuccess: () => void;
  apiPrefix: "/franchise-ibs" | "/distributor";
}

export default function RegisterStudentModal({ onClose, onSuccess, apiPrefix }: Props) {
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [batches, setBatches] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    city: "",
    course_id: "",
    batch_id: "",
    payment_mode: "razorpay", // razorpay, cash, cheque
    amount: "",
    reference_number: "",
    remarks: "",
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
    fetchBatches();
  }, []);

  useEffect(() => {
    // Update courses when a batch is selected
    if (formData.batch_id && formData.batch_id !== "none") {
      const selectedBatch = batches.find(b => b.id.toString() === formData.batch_id);
      if (selectedBatch && selectedBatch.assigned_courses) {
        setCourses(selectedBatch.assigned_courses);
      } else {
        setCourses([]);
      }
    } else {
      setCourses([]);
    }
    // Reset selected course when batch changes
    setFormData(prev => ({ ...prev, course_id: "" }));
  }, [formData.batch_id, batches]);

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

    try {
      const payload = {
        ...formData,
        course_id: formData.course_id && formData.course_id !== "none" ? parseInt(formData.course_id) : null,
        batch_id: formData.batch_id && formData.batch_id !== "none" ? parseInt(formData.batch_id) : null,
        amount: formData.amount ? parseFloat(formData.amount) : 0,
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

          {formData.batch_id && formData.batch_id !== "none" && courses.length > 0 && (
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
                <SelectItem value="razorpay">Online (Razorpay / Payment Link)</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="cheque">Cheque</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isOffline && (
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount Collected *</Label>
                <Input id="amount" name="amount" type="number" min="0" step="0.01" value={formData.amount} onChange={handleChange} required={isOffline} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reference_number">Reference/Receipt No</Label>
                <Input id="reference_number" name="reference_number" value={formData.reference_number} onChange={handleChange} />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="remarks">Remarks</Label>
                <Input id="remarks" name="remarks" value={formData.remarks} onChange={handleChange} placeholder="Any specific notes..." />
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
