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

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    city: "",
    course_id: "",
    payment_mode: "razorpay", // razorpay, cash, cheque
    amount: "",
    reference_number: "",
    remarks: "",
  });

  useEffect(() => {
    // Fetch courses for the dropdown
    const fetchCourses = async () => {
      try {
        const res = await api.get("/courses");
        setCourses(res.data.data || res.data || []);
      } catch (err) {
        console.error("Failed to fetch courses", err);
      }
    };
    fetchCourses();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        ...formData,
        course_id: formData.course_id ? parseInt(formData.course_id) : null,
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
            <Label htmlFor="course_id">Select Course</Label>
            <Select value={formData.course_id} onValueChange={(v) => handleSelectChange("course_id", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a course (Optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">-- None --</SelectItem>
                {courses.map((c) => (
                  <SelectItem key={c.id} value={c.id.toString()}>{c.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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
