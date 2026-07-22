import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { ShieldCheck, User, Calendar, GraduationCap, MapPin, Phone, Fingerprint, FileText, Upload, CheckCircle2, AlertCircle } from "lucide-react";
import api from "../services/api";
import { toast } from "sonner";

interface PerformKycModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  student: {
    id: number;
    name?: string;
    full_name?: string;
    email?: string;
    phone?: string;
    city?: string;
    course_id?: number;
  } | null;
}

export default function PerformKycModal({ open, onClose, onSuccess, student }: PerformKycModalProps) {
  const [loading, setLoading] = useState(false);
  const [fetchingExisting, setFetchingExisting] = useState(false);

  const [form, setForm] = useState({
    full_name: "",
    dob: "",
    qualification: "",
    address: "",
    mobile: "",
    aadhaar_number: "",
    pan_number: "",
    generate_contract: true,
  });

  const [files, setFiles] = useState<{
    aadhaar?: File;
    pan?: File;
    photo?: File;
    signature?: File;
    biometric?: File;
  }>({});

  const [existingKyc, setExistingKyc] = useState<any>(null);

  useEffect(() => {
    if (student && open) {
      setForm({
        full_name: student.full_name || student.name || "",
        dob: "",
        qualification: "",
        address: "",
        mobile: student.phone || "",
        aadhaar_number: "",
        pan_number: "",
        generate_contract: true,
      });
      setFiles({});
      setExistingKyc(null);
      loadExistingKyc(student.id);
    }
  }, [student, open]);

  const loadExistingKyc = async (userId: number) => {
    setFetchingExisting(true);
    try {
      const res = await api.get(`/kyc/admin/user/${userId}`);
      if (res.data) {
        setExistingKyc(res.data);
        setForm(prev => ({
          ...prev,
          full_name: res.data.full_name || prev.full_name,
          dob: res.data.dob || "",
          qualification: res.data.qualification || "",
          address: res.data.address || "",
          mobile: res.data.mobile || prev.mobile,
          aadhaar_number: res.data.aadhaar_number || "",
          pan_number: res.data.pan_number || "",
        }));
      }
    } catch {
      // 404 means no submission exists yet
    } finally {
      setFetchingExisting(false);
    }
  };

  const handleFileChange = (key: keyof typeof files, file?: File) => {
    if (file) {
      setFiles(prev => ({ ...prev, [key]: file }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;

    setLoading(true);
    try {
      // 1. Upload files first if any selected
      const docUrls: Record<string, string> = {};
      for (const [docType, file] of Object.entries(files)) {
        if (file) {
          const fd = new FormData();
          fd.append("file", file);
          const uploadRes = await api.post(
            `/kyc/admin/upload-document-for-user?user_id=${student.id}&doc_type=${docType}`,
            fd,
            { headers: { "Content-Type": "multipart/form-data" } }
          );
          if (uploadRes.data) {
            if (docType === "aadhaar") docUrls.aadhaar_doc_url = uploadRes.data.aadhaar_doc_url;
            if (docType === "pan") docUrls.pan_doc_url = uploadRes.data.pan_doc_url;
            if (docType === "photo") docUrls.photo_url = uploadRes.data.photo_url;
            if (docType === "signature") docUrls.signature_url = uploadRes.data.signature_url;
            if (docType === "biometric") docUrls.biometric_selfie_url = uploadRes.data.biometric_selfie_url;
          }
        }
      }

      // 2. Call direct-complete endpoint
      const payload = {
        user_id: student.id,
        full_name: form.full_name,
        dob: form.dob || undefined,
        qualification: form.qualification || undefined,
        address: form.address || undefined,
        mobile: form.mobile || undefined,
        aadhaar_number: form.aadhaar_number || undefined,
        pan_number: form.pan_number || undefined,
        course_id: student.course_id || undefined,
        mark_verified: true,
        generate_contract: form.generate_contract,
        ...docUrls,
      };

      await api.post("/kyc/admin/direct-complete", payload);

      toast.success(`✅ eKYC successfully completed & verified for ${form.full_name}!`);
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to complete eKYC.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={o => { if (!o) onClose(); }}>
      <DialogContent className="max-w-2xl bg-white rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b border-gray-100">
          <DialogTitle className="text-xl font-bold text-[#0B2A5B] flex items-center gap-2">
            <ShieldCheck className="text-green-600 w-6 h-6" />
            Perform / Complete eKYC for Student
          </DialogTitle>
          <DialogDescription className="text-xs text-gray-500">
            SuperAdmin direct eKYC completion for <strong>{student?.name || student?.full_name || student?.email}</strong>
          </DialogDescription>
        </DialogHeader>

        {fetchingExisting ? (
          <div className="py-12 text-center text-gray-400 text-sm flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            Checking existing KYC details...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 mt-4">
            {existingKyc?.status === "verified" && (
              <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                This student already has a verified KYC record. Submitting this form will update their dossier details.
              </div>
            )}

            {/* 1. Student Personal Information */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-purple-600" /> 1. Personal Information
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-semibold text-gray-700">Full Name *</Label>
                  <Input
                    required
                    value={form.full_name}
                    onChange={e => setForm({ ...form, full_name: e.target.value })}
                    className="mt-1 bg-gray-50 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-gray-700">Mobile Number *</Label>
                  <Input
                    required
                    value={form.mobile}
                    onChange={e => setForm({ ...form, mobile: e.target.value })}
                    className="mt-1 bg-gray-50 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-gray-700">Date of Birth</Label>
                  <Input
                    type="date"
                    value={form.dob}
                    onChange={e => setForm({ ...form, dob: e.target.value })}
                    className="mt-1 bg-gray-50 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-gray-700">Highest Qualification</Label>
                  <Input
                    placeholder="e.g. Graduate / B.Com"
                    value={form.qualification}
                    onChange={e => setForm({ ...form, qualification: e.target.value })}
                    className="mt-1 bg-gray-50 text-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label className="text-xs font-semibold text-gray-700">Residential Address</Label>
                  <Input
                    placeholder="Full residential address"
                    value={form.address}
                    onChange={e => setForm({ ...form, address: e.target.value })}
                    className="mt-1 bg-gray-50 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* 2. Verification Numbers */}
            <div className="space-y-3 pt-3 border-t border-gray-100">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                <Fingerprint className="w-3.5 h-3.5 text-purple-600" /> 2. National ID Verification Numbers
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-semibold text-gray-700">Aadhaar Number</Label>
                  <Input
                    placeholder="12-digit Aadhaar"
                    maxLength={14}
                    value={form.aadhaar_number}
                    onChange={e => setForm({ ...form, aadhaar_number: e.target.value })}
                    className="mt-1 bg-gray-50 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-gray-700">PAN Number</Label>
                  <Input
                    placeholder="10-character PAN"
                    maxLength={10}
                    value={form.pan_number}
                    onChange={e => setForm({ ...form, pan_number: e.target.value.toUpperCase() })}
                    className="mt-1 bg-gray-50 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* 3. Document Files (Optional upload for Superadmin) */}
            <div className="space-y-3 pt-3 border-t border-gray-100">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5 text-purple-600" /> 3. Document Upload (Optional)
              </h4>
              <p className="text-xs text-gray-400">If no document file is chosen, system auto-assigns an Admin Verified status badge for contract dossier generation.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <Label className="text-xs font-medium text-gray-600">Aadhaar Card File</Label>
                  <Input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={e => handleFileChange("aadhaar", e.target.files?.[0])} className="mt-1 text-xs bg-gray-50" />
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-600">PAN Card File</Label>
                  <Input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={e => handleFileChange("pan", e.target.files?.[0])} className="mt-1 text-xs bg-gray-50" />
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-600">Passport Photo File</Label>
                  <Input type="file" accept=".jpg,.jpeg,.png" onChange={e => handleFileChange("photo", e.target.files?.[0])} className="mt-1 text-xs bg-gray-50" />
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-600">Digital Signature File</Label>
                  <Input type="file" accept=".jpg,.jpeg,.png" onChange={e => handleFileChange("signature", e.target.files?.[0])} className="mt-1 text-xs bg-gray-50" />
                </div>
              </div>
            </div>

            {/* 4. Options */}
            <div className="bg-purple-50/60 border border-purple-100 rounded-xl p-3.5 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-purple-900">
                <input
                  type="checkbox"
                  checked={form.generate_contract}
                  onChange={e => setForm({ ...form, generate_contract: e.target.checked })}
                  className="rounded border-purple-300 text-purple-600 focus:ring-purple-500"
                />
                Automatically generate signed FinTrade Student Agreement Contract
              </label>
              <p className="text-[11px] text-purple-700 pl-5">
                This marks the student's status as fully eKYC Verified & Contract Signed, granting complete access to student features.
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white font-bold gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                {loading ? "Completing eKYC..." : "Complete & Verify eKYC"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
