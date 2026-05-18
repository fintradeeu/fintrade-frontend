import { useState } from "react";
import { DashboardLayout } from "../../components/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { CheckCircle, Download, Eye, FileText, Search, Shield, Lock } from "lucide-react";

interface StudentContract {
  id: number;
  name: string;
  email: string;
  mobile: string;
  aadhaar: string;
  pan: string;
  kycStatus: "Verified" | "Pending" | "Rejected";
  signedDate: string;
  course: string;
  contractId: string;
}

const contracts: StudentContract[] = [
  { id: 1, name: "Rahul Sharma", email: "rahul.sharma@fintrade.in", mobile: "+91 98765 43210", aadhaar: "1234 5678 9012", pan: "ABCDE1234F", kycStatus: "Verified", signedDate: "2026-04-10", course: "Advanced Trading", contractId: "FT-2026-001" },
  { id: 2, name: "Priya Verma", email: "priya.verma@fintrade.in", mobile: "+91 87654 32109", aadhaar: "9876 5432 1098", pan: "FGHIJ5678K", kycStatus: "Verified", signedDate: "2026-04-12", course: "Basic Trading", contractId: "FT-2026-002" },
  { id: 3, name: "Amit Patel", email: "amit.patel@fintrade.in", mobile: "+91 76543 21098", aadhaar: "5678 9012 3456", pan: "KLMNO9012P", kycStatus: "Pending", signedDate: "2026-04-15", course: "Intermediate Trading", contractId: "FT-2026-003" },
  { id: 4, name: "Neha Joshi", email: "neha.joshi@fintrade.in", mobile: "+91 65432 10987", aadhaar: "2345 6789 0123", pan: "QRSTU3456V", kycStatus: "Verified", signedDate: "2026-04-16", course: "Master Trading", contractId: "FT-2026-004" },
  { id: 5, name: "Kiran Shah", email: "kiran.shah@fintrade.in", mobile: "+91 54321 09876", aadhaar: "8901 2345 6789", pan: "WXYZA7890B", kycStatus: "Rejected", signedDate: "2026-04-17", course: "Basic Trading", contractId: "FT-2026-005" },
];

export default function AdminContracts() {
  const [search, setSearch] = useState("");
  const [selectedContract, setSelectedContract] = useState<StudentContract | null>(null);

  const filtered = contracts.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.contractId.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleDownload = (c: StudentContract) => {
    const content = `
FINTRADE TRADING EDUCATION AGREEMENT
=====================================
Contract ID   : ${c.contractId}
Student Name  : ${c.name}
Mobile        : ${c.mobile}
Email         : ${c.email}
Aadhaar       : ${c.aadhaar}
PAN           : ${c.pan}
Course        : ${c.course}
KYC Status    : ${c.kycStatus === "Verified" ? "✓ VERIFIED" : c.kycStatus}
Signed Date   : ${new Date(c.signedDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}

[Contract terms as per FinTrade Education Agreement]
© 2026 FinTrade Education Pvt. Ltd.
    `.trim();
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `FinTrade_Contract_${c.contractId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
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
                          onClick={() => setSelectedContract(c)}
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
                    ["Course", selectedContract.course],
                    ["Signed", new Date(selectedContract.signedDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })],
                    ["Contract ID", selectedContract.contractId],
                  ].map(([k, v], i) => (
                    <div key={i} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                      <div className="text-xs text-gray-400 mb-1">{k}</div>
                      <div className="font-semibold" style={{ color: "#121212" }}>{v}</div>
                    </div>
                  ))}
                </div>
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-1"><Lock className="h-4 w-4" /> Signed digitally</div>
                  <div className="font-bold" style={{ fontFamily: "cursive", fontSize: 18, color: "#121212" }}>{selectedContract.name}</div>
                </div>
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
