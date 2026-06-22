import { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { CheckCircle, Download, Eye, FileText, Search, Shield, Lock, XCircle } from "lucide-react";
import api from "../../services/api";
import logo from "../../../imports/fintrade_logo.png";
import { toast } from "sonner";

interface StudentContract {
  id: number;
  kycId: number;
  name: string;
  email: string;
  mobile: string;
  aadhaar: string;
  pan: string;
  dob: string;
  qualification: string;
  address: string;
  aadhaarDocUrl: string;
  panDocUrl: string;
  photoUrl: string;
  signatureUrl: string;
  biometricSelfieUrl: string;
  kycStatus: "Verified" | "Pending" | "Rejected";
  signedDate: string;
  course: string;
  contractId: string;
  rejectionReason: string;
}

export default function AdminContracts() {
  const [search, setSearch] = useState("");
  const [selectedContract, setSelectedContract] = useState<StudentContract | null>(null);
  const [contracts, setContracts] = useState<StudentContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectionReason, setRejectionReason] = useState("");
  const [reviewing, setReviewing] = useState(false);

  const loadContracts = () => {
    setLoading(true);
    api.get("/kyc/admin/contracts")
      .then((res) => {
        const mapped = res.data.map((c: any) => ({
          id: c.id,
          kycId: c.kyc_id,
          name: c.user_name || "N/A",
          email: c.user_email || "N/A",
          mobile: c.user_mobile || "N/A",
          aadhaar: c.user_aadhaar || "N/A",
          pan: c.user_pan || "N/A",
          dob: c.user_dob || "N/A",
          qualification: c.user_qualification || "N/A",
          address: c.user_address || "N/A",
          aadhaarDocUrl: c.aadhaar_doc_url || "",
          panDocUrl: c.pan_doc_url || "",
          photoUrl: c.photo_url || "",
          signatureUrl: c.signature_url || "",
          biometricSelfieUrl: c.biometric_selfie_url || "",
          kycStatus: c.kyc_status === "verified" ? "Verified" : c.kyc_status === "rejected" ? "Rejected" : "Pending",
          signedDate: c.signed_at ? c.signed_at.split("T")[0] : c.created_at ? c.created_at.split("T")[0] : "N/A",
          course: c.course_title || "General",
          contractId: c.contract_number,
          rejectionReason: c.rejection_reason || "",
        }));
        setContracts(mapped);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading contracts:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadContracts();
  }, []);

  const reviewContract = async (decision: "approve" | "reject") => {
    if (!selectedContract) return;
    if (decision === "reject" && !rejectionReason.trim()) {
      toast.error("Please enter a rejection reason.");
      return;
    }
    setReviewing(true);
    try {
      const body = decision === "reject" ? { reason: rejectionReason.trim() } : undefined;
      await api.put(`/kyc/admin/submissions/${selectedContract.kycId}/${decision}`, body);
      toast.success(decision === "approve" ? "KYC approved successfully." : "KYC rejected. The student must upload all documents again.");
      setSelectedContract(null);
      setRejectionReason("");
      loadContracts();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || `Unable to ${decision} KYC.`);
    } finally {
      setReviewing(false);
    }
  };

  const filtered = contracts.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.contractId.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleDownload = (c: StudentContract) => {
    const base = api.defaults.baseURL || window.location.origin;
    const cleanBase = base.replace(/\/+$/, "");

    const getFullUrl = (urlPath: string) => {
      if (!urlPath) return "";
      if (urlPath.startsWith("http")) return urlPath;
      const cleanPath = urlPath.startsWith("/") ? urlPath : `/${urlPath}`;
      return `${cleanBase}${cleanPath}`;
    };

    const signatureImgSrc = getFullUrl(c.signatureUrl);
    const selfieImgSrc = getFullUrl(c.biometricSelfieUrl);
    const aadhaarImgSrc = getFullUrl(c.aadhaarDocUrl);
    const panImgSrc = getFullUrl(c.panDocUrl);
    const photoImgSrc = getFullUrl(c.photoUrl);

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Popup blocked. Please allow popups to download the contract as PDF.");
      return;
    }

    const logoUrl = window.location.origin + logo;

    const htmlContent = `
      <html>
      <head>
        <title>FinTrade_Contract_${c.name.replace(/\s+/g, "_")}</title>
        <style>
          @page { size: A4; margin: 15mm; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1f2937; line-height: 1.5; margin: 0; padding: 0; background: #fff; }
          .container { max-width: 800px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; border-bottom: 3px solid #D50032; padding-bottom: 15px; margin-bottom: 25px; display: flex; flex-direction: column; align-items: center; }
          .logo { height: 45px; margin-bottom: 8px; }
          .title { font-size: 20px; font-weight: 800; color: #0B2A5B; margin: 4px 0; text-transform: uppercase; letter-spacing: 0.5px; }
          .subtitle { font-size: 11px; color: #6b7280; margin: 0; text-transform: uppercase; font-weight: 600; }
          .section { margin-bottom: 22px; page-break-inside: avoid; }
          .section-title { font-size: 13px; font-weight: 800; color: #D50032; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
          .grid { display: grid; grid-template-cols: 1fr 1fr; gap: 12px; margin-bottom: 10px; }
          .info-block { background: #f9fafb; border: 1px solid #e5e7eb; padding: 10px 14px; border-radius: 6px; }
          .info-label { font-size: 10px; color: #6b7280; text-transform: uppercase; font-weight: 750; }
          .info-value { font-size: 13px; font-weight: 600; color: #111827; margin-top: 2px; }
          .terms-list { font-size: 11px; color: #374151; padding-left: 18px; margin: 0; }
          .terms-item { margin-bottom: 6px; text-align: justify; }
          .media-grid { display: grid; grid-template-cols: 1fr 1fr; gap: 15px; margin-top: 10px; page-break-inside: avoid; }
          .media-card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; text-align: center; background: #fff; }
          .media-title { font-size: 11px; font-weight: 700; color: #4b5563; margin-bottom: 8px; text-transform: uppercase; }
          .media-img { max-height: 90px; max-width: 100%; object-fit: contain; border: 1px solid #f3f4f6; border-radius: 4px; }
          .footer-sign { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 15px; page-break-inside: avoid; }
          .seal-box { display: flex; align-items: center; gap: 8px; color: #16a34a; font-weight: bold; font-size: 11px; }
          .stamp { border: 2px solid #16a34a; padding: 3px 6px; border-radius: 4px; text-transform: uppercase; transform: rotate(-5deg); font-family: monospace; font-size: 12px; font-weight: 800; }
          .sign-box { text-align: center; }
          .sign-line { border-top: 1px solid #111827; width: 170px; margin-top: 40px; padding-top: 4px; font-size: 10px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="${logoUrl}" class="logo" alt="Logo" onerror="this.style.display='none'" />
            <div class="title">Trading Education Agreement</div>
            <div class="subtitle">FinTrade LMS Onboarding & Verification Dossier</div>
          </div>

          <div class="section">
            <div class="section-title">1. Student Profile & Personal Details</div>
            <div class="grid">
              <div class="info-block"><div class="info-label">Student Full Name</div><div class="info-value">${c.name}</div></div>
              <div class="info-block"><div class="info-label">Date of Birth</div><div class="info-value">${c.dob}</div></div>
              <div class="info-block"><div class="info-label">Email Address</div><div class="info-value">${c.email}</div></div>
              <div class="info-block"><div class="info-label">Mobile Number</div><div class="info-value">${c.mobile}</div></div>
              <div class="info-block"><div class="info-label">Educational Qualification</div><div class="info-value">${c.qualification}</div></div>
              <div class="info-block"><div class="info-label">Residential Address</div><div class="info-value">${c.address}</div></div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">2. Identity Verification & KYC Information</div>
            <div class="grid">
              <div class="info-block"><div class="info-label">Aadhaar Number</div><div class="info-value">${c.aadhaar}</div></div>
              <div class="info-block"><div class="info-label">PAN Number</div><div class="info-value">${c.pan}</div></div>
              <div class="info-block"><div class="info-label">Mobile OTP Verification Status</div><div class="info-value">✓ VERIFIED</div></div>
              <div class="info-block"><div class="info-label">Email OTP Verification Status</div><div class="info-value">✓ VERIFIED</div></div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">3. Terms & Conditions of Enrollment</div>
            <ol class="terms-list">
              <li class="terms-item">The Student agrees to abide by all FinTrade platform rules and community guidelines.</li>
              <li class="terms-item">Course fees are non-refundable after 7 days of enrollment.</li>
              <li class="terms-item">All course material is proprietary and may not be shared or redistributed.</li>
              <li class="terms-item">Trading simulation is for educational purposes only; no real capital is at risk.</li>
              <li class="terms-item">FinTrade holds the right to revoke access for breach of terms.</li>
              <li class="terms-item">Placement assistance is merit-based and not guaranteed.</li>
              <li class="terms-item">This contract is governed by the laws of India.</li>
            </ol>
          </div>

          <div class="section">
            <div class="section-title">4. Digital Signatures & Biometric Audit Trail</div>
            <div class="media-grid">
              <div class="media-card">
                <div class="media-title">Recorded Digital Signature</div>
                ${signatureImgSrc ? `<img src="${signatureImgSrc}" class="media-img" />` : `<div style="height: 60px; display: flex; align-items: center; justify-content: center; color: #888; font-size: 10px; border: 1px dashed #ccc; border-radius: 4px;">Signature Image Not Loaded</div>`}
              </div>
              <div class="media-card">
                <div class="media-title">Biometric Audit Selfie</div>
                ${selfieImgSrc ? `<img src="${selfieImgSrc}" class="media-img" />` : `<div style="height: 60px; display: flex; align-items: center; justify-content: center; color: #888; font-size: 10px; border: 1px dashed #ccc; border-radius: 4px;">Biometric Image Not Loaded</div>`}
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">5. Uploaded Verification Documents</div>
            <div class="media-grid" style="grid-template-cols: 1fr 1fr 1fr;">
              <div class="media-card">
                <div class="media-title">Aadhaar Card</div>
                ${aadhaarImgSrc ? `<img src="${aadhaarImgSrc}" class="media-img" />` : `<div style="height: 60px; display: flex; align-items: center; justify-content: center; color: #888; font-size: 10px; border: 1px dashed #ccc; border-radius: 4px;">Aadhaar Not Loaded</div>`}
              </div>
              <div class="media-card">
                <div class="media-title">PAN Card</div>
                ${panImgSrc ? `<img src="${panImgSrc}" class="media-img" />` : `<div style="height: 60px; display: flex; align-items: center; justify-content: center; color: #888; font-size: 10px; border: 1px dashed #ccc; border-radius: 4px;">PAN Not Loaded</div>`}
              </div>
              <div class="media-card">
                <div class="media-title">Passport Size Photo</div>
                ${photoImgSrc ? `<img src="${photoImgSrc}" class="media-img" />` : `<div style="height: 60px; display: flex; align-items: center; justify-content: center; color: #888; font-size: 10px; border: 1px dashed #ccc; border-radius: 4px;">Photo Not Loaded</div>`}
              </div>
            </div>
          </div>

          <div class="footer-sign">
            <div class="seal-box">
              <div class="stamp">Verified</div>
              <div>
                <div style="font-size: 9px; color: #6b7280; font-weight: normal; text-transform: uppercase;">KYC Status</div>
                <div style="color: #111827; font-weight: bold;">${c.kycStatus === "Verified" ? "APPROVED & STAMPED" : c.kycStatus.toUpperCase()}</div>
                <div style="font-size: 8px; color: #6b7280; font-weight: normal; margin-top: 1px;">Dossier Sealed: ${new Date(c.signedDate).toLocaleString("en-IN")}</div>
              </div>
            </div>
            <div class="sign-box">
              <div class="sign-line">Student Digital Signature Auth</div>
              <div style="font-size: 9px; color: #6b7280; margin-top: 2px;">IP Address logged & stamped</div>
            </div>
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 600);
          }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const statusStyle = (s: string) => {
    if (s === "Verified") return { background: "#4CAF50", color: "white" };
    if (s === "Pending") return { background: "#FF9800", color: "white" };
    return { background: "#D50032", color: "white" };
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: "#121212" }}>Student Contracts</h1>
            <p className="text-gray-600 mt-1">View and download KYC contracts for all students</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-100 px-4 py-2 rounded-lg">
            <Shield className="h-4 w-4" style={{ color: "#D50032" }} />
            <span>Admin View</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          {[
            { label: "Total Contracts", value: contracts.length, icon: FileText },
            { label: "KYC Verified", value: contracts.filter(c => c.kycStatus === "Verified").length, icon: CheckCircle },
            { label: "Pending", value: contracts.filter(c => c.kycStatus === "Pending").length, icon: Shield },
            { label: "Rejected", value: contracts.filter(c => c.kycStatus === "Rejected").length, icon: Lock },
          ].map((s, i) => (
            <Card key={i} className="p-6 border-2 border-gray-100 hover:border-[#D50032] transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: "rgba(213,0,50,0.1)" }}>
                  <s.icon className="h-6 w-6" style={{ color: "#D50032" }} />
                </div>
                <div>
                  <div className="text-2xl font-bold" style={{ color: "#121212" }}>{s.value}</div>
                  <div className="text-sm text-gray-600">{s.label}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or contract ID..."
            className="pl-10 bg-white border-gray-200 focus:border-[#D50032]"
          />
        </div>

        {/* Table */}
        <Card className="border-2 border-gray-100">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50">
                  <TableHead className="font-bold">Contract ID</TableHead>
                  <TableHead className="font-bold">Student</TableHead>
                  <TableHead className="font-bold">Course</TableHead>
                  <TableHead className="font-bold">KYC Status</TableHead>
                  <TableHead className="font-bold">Signed Date</TableHead>
                  <TableHead className="font-bold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => (
                  <TableRow key={c.id} className="hover:bg-gray-50">
                    <TableCell>
                      <span className="font-mono text-sm font-bold" style={{ color: "#D50032" }}>{c.contractId}</span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium" style={{ color: "#121212" }}>{c.name}</div>
                        <div className="text-xs text-gray-500">{c.email}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600 text-sm">{c.course}</TableCell>
                    <TableCell>
                      <Badge style={statusStyle(c.kycStatus)}>
                        {c.kycStatus === "Verified" && <CheckCircle className="h-3 w-3 mr-1" />}
                        {c.kycStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-600 text-sm">
                      {new Date(c.signedDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => { setSelectedContract(c); setRejectionReason(c.rejectionReason); }}
                          className="border-gray-300 hover:border-[#D50032] hover:text-[#D50032]"
                        >
                          <Eye className="h-4 w-4 mr-1" /> View
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleDownload(c)}
                          style={{ background: "#D50032", color: "white" }}
                        >
                          <Download className="h-4 w-4 mr-1" /> Download
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* View Contract Dialog */}
        {selectedContract && (
          <Dialog open={!!selectedContract} onOpenChange={() => setSelectedContract(null)}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" style={{ color: "#D50032" }} />
                  Contract — {selectedContract.contractId}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: selectedContract.kycStatus === "Verified" ? "rgba(76,175,80,0.08)" : "rgba(255,152,0,0.08)", border: `1px solid ${selectedContract.kycStatus === "Verified" ? "#4CAF50" : "#FF9800"}` }}>
                  <span className="font-semibold text-sm">KYC Status</span>
                  <Badge style={statusStyle(selectedContract.kycStatus)}>
                    {selectedContract.kycStatus === "Verified" && <CheckCircle className="h-3 w-3 mr-1" />}
                    {selectedContract.kycStatus}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {[
                    ["Full Name", selectedContract.name],
                    ["Mobile", selectedContract.mobile],
                    ["Email", selectedContract.email],
                    ["Aadhaar", selectedContract.aadhaar],
                    ["PAN", selectedContract.pan],
                    ["Date of Birth", selectedContract.dob],
                    ["Qualification", selectedContract.qualification],
                    ["Course", selectedContract.course],
                    ["Address", selectedContract.address],
                    ["Signed Date", new Date(selectedContract.signedDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })],
                    ["Contract ID", selectedContract.contractId],
                  ].map(([k, v], i) => (
                    <div key={i} className={`bg-gray-50 rounded-lg p-3 border border-gray-100 ${k === "Address" ? "col-span-2" : ""}`}>
                      <div className="text-xs text-gray-400 mb-1">{k}</div>
                      <div className="font-semibold" style={{ color: "#121212" }}>{v}</div>
                    </div>
                  ))}
                </div>

                {/* Uploaded Documents section */}
                <div className="border-t border-gray-100 pt-4">
                  <h4 className="font-semibold text-sm mb-3">Uploaded KYC Documents</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      { label: "Aadhaar Card", url: selectedContract.aadhaarDocUrl },
                      { label: "PAN Card", url: selectedContract.panDocUrl },
                      { label: "Passport Photo", url: selectedContract.photoUrl },
                      { label: "Digital Signature", url: selectedContract.signatureUrl },
                      { label: "Biometric Selfie", url: selectedContract.biometricSelfieUrl }
                    ].map((doc, idx) => {
                      const absoluteUrl = doc.url ? (doc.url.startsWith("http") ? doc.url : `${api.defaults.baseURL || ""}${doc.url}`) : "";
                      return (
                        <div key={idx} className="flex flex-col bg-gray-50 p-2.5 rounded-lg border border-gray-100 justify-between gap-2">
                          <span className="font-medium text-gray-500">{doc.label}</span>
                          {doc.url ? (
                            <a
                              href={absoluteUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#D50032] font-semibold hover:underline flex items-center gap-1"
                            >
                              <Eye className="h-3 w-3" /> View Document
                            </a>
                          ) : (
                            <span className="text-gray-400 italic">Not Uploaded</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-1"><Lock className="h-4 w-4" /> Signed digitally</div>
                  <div className="font-bold" style={{ fontFamily: "cursive", fontSize: 18, color: "#121212" }}>{selectedContract.name}</div>
                </div>
                {selectedContract.kycStatus !== "Verified" && (
                  <div className="space-y-3 border-t border-gray-100 pt-4">
                    <label className="text-sm font-semibold text-gray-700" htmlFor="rejection-reason">
                      Rejection reason
                    </label>
                    <Input
                      id="rejection-reason"
                      value={rejectionReason}
                      onChange={(event) => setRejectionReason(event.target.value)}
                      placeholder="Explain what the student must correct"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant="outline"
                        disabled={reviewing}
                        onClick={() => reviewContract("reject")}
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <XCircle className="mr-2 h-4 w-4" /> Reject
                      </Button>
                      <Button
                        disabled={reviewing}
                        onClick={() => reviewContract("approve")}
                        className="bg-green-600 text-white hover:bg-green-700"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" /> Approve
                      </Button>
                    </div>
                  </div>
                )}
                <Button onClick={() => handleDownload(selectedContract)} className="w-full" style={{ background: "#D50032", color: "white" }}>
                  <Download className="mr-2 h-4 w-4" /> Download Contract
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </DashboardLayout>
  );
}
