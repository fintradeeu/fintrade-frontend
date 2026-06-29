import { useState, useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Search, Download, ShieldCheck, Info, Clock, Monitor } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import api from "../../services/api";
import { toast } from "sonner";

interface CookieConsentLog {
  id: number;
  user_id: number | null;
  user_name: string | null;
  user_email: string | null;
  ip_address: string | null;
  user_agent: string | null;
  consent_type: string;
  created_at: string;
}

export default function AdminCookieConsents() {
  const [consents, setConsents] = useState<CookieConsentLog[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchConsents = async () => {
    setLoading(true);
    try {
      const res = await api.get("/auth/cookie-consents");
      setConsents(res.data || []);
    } catch (err: any) {
      toast.error("Failed to load cookie consents list");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsents();
  }, []);

  const filteredConsents = consents.filter((c) => {
    const query = searchQuery.toLowerCase();
    return (
      (c.user_name || "guest visitor").toLowerCase().includes(query) ||
      (c.user_email || "").toLowerCase().includes(query) ||
      (c.ip_address || "").toLowerCase().includes(query) ||
      (c.consent_type || "").toLowerCase().includes(query) ||
      (c.user_agent || "").toLowerCase().includes(query)
    );
  });

  const handleExport = () => {
    if (filteredConsents.length === 0) {
      toast.error("No consent data to export");
      return;
    }

    // Standard CSV compilation
    const headers = ["ID", "User ID", "User Name", "User Email", "IP Address", "Consent Type", "Date Time", "User Agent"];
    const rows = filteredConsents.map((c) => [
      c.id,
      c.user_id || "Guest",
      c.user_name || "Guest Visitor",
      c.user_email || "—",
      c.ip_address || "—",
      c.consent_type.toUpperCase(),
      new Date(c.created_at).toLocaleString("en-IN"),
      `"${(c.user_agent || "").replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `cookie_consents_audit_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV export downloaded successfully!");
  };

  // Helper to parse complex User Agent strings to friendly names
  const getBrowserDetails = (ua: string | null) => {
    if (!ua) return "Unknown Browser";
    const lowercase = ua.toLowerCase();
    if (lowercase.includes("chrome") || lowercase.includes("crios")) return "Chrome";
    if (lowercase.includes("firefox") || lowercase.includes("fxios")) return "Firefox";
    if (lowercase.includes("safari") && !lowercase.includes("chrome")) return "Safari";
    if (lowercase.includes("edge")) return "Edge";
    if (lowercase.includes("opera") || lowercase.includes("opr")) return "Opera";
    return "Browser";
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-black text-[#0B2A5B] mb-2 flex items-center gap-2">
              <ShieldCheck className="text-[#D50032]" size={32} />
              Cookie Policy Audit Logs
            </h1>
            <p className="text-slate-500 font-medium">
              View and audit visitor cookie policy consent and page view metrics stored for GDPR/compliance records.
            </p>
          </div>
          <Button
            onClick={handleExport}
            className="bg-[#0B2A5B] text-white hover:bg-[#1a3d7a] font-bold h-11 px-5 rounded-xl cursor-pointer"
          >
            <Download size={16} className="mr-2" /> Export Logs (CSV)
          </Button>
        </div>

        <Card className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <Input
                placeholder="Search by name, email, IP, browser, status..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 bg-gray-50 border-gray-200 focus:border-[#D50032] rounded-xl h-11 text-sm font-medium"
              />
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold bg-slate-50 border border-slate-100 rounded-xl px-4.5 py-2.5">
              <Info size={14} className="text-slate-400 shrink-0" />
              <span>Audit count: <strong>{filteredConsents.length} logs</strong> matched</span>
            </div>
          </div>

          <div className="border border-gray-100 rounded-2xl overflow-hidden bg-gray-50/50">
            <Table>
              <TableHeader className="bg-gray-100">
                <TableRow className="border-b border-gray-100 hover:bg-transparent">
                  <TableHead className="font-bold text-[#0B2A5B]">ID</TableHead>
                  <TableHead className="font-bold text-[#0B2A5B]">Audited User</TableHead>
                  <TableHead className="font-bold text-[#0B2A5B]">IP Address</TableHead>
                  <TableHead className="font-bold text-[#0B2A5B]">Browser</TableHead>
                  <TableHead className="font-bold text-[#0B2A5B]">Consent Type</TableHead>
                  <TableHead className="font-bold text-[#0B2A5B]">Logged At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-16 text-slate-500 font-bold">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-[#D50032] border-t-transparent rounded-full animate-spin"></div>
                        <span>Loading compliance records...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredConsents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-16 text-slate-400 font-bold">
                      No matching cookie policy logs found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredConsents.map((log) => {
                    const isGuest = !log.user_id;
                    let badgeVariant: "success" | "warning" | "destructive" = "success";
                    if (log.consent_type === "viewed") badgeVariant = "warning";
                    else if (log.consent_type === "declined") badgeVariant = "destructive";

                    return (
                      <TableRow key={log.id} className="border-b border-gray-100 hover:bg-white transition-colors">
                        <TableCell className="font-mono text-xs text-slate-400 font-bold">#{log.id}</TableCell>
                        <TableCell>
                          {isGuest ? (
                            <div>
                              <p className="font-extrabold text-sm text-[#0B2A5B]">Guest Visitor</p>
                              <p className="text-xs text-slate-400">Anonymous session</p>
                            </div>
                          ) : (
                            <div>
                              <p className="font-extrabold text-sm text-[#0B2A5B]">{log.user_name}</p>
                              <p className="text-xs text-[#D50032] font-semibold">{log.user_email}</p>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-slate-600 font-bold">
                          {log.ip_address || "Unknown"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-slate-600">
                            <Monitor size={14} className="text-slate-400 shrink-0" />
                            <span className="text-xs font-semibold" title={log.user_agent || ""}>
                              {getBrowserDetails(log.user_agent)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`rounded-md font-bold px-2 py-0.5 text-[10px] uppercase tracking-wider ${
                              badgeVariant === "success"
                                ? "bg-green-50 text-green-700 border border-green-200"
                                : badgeVariant === "warning"
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-red-50 text-red-700 border border-red-200"
                            }`}
                          >
                            {log.consent_type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-slate-600">
                            <Clock size={14} className="text-slate-400 shrink-0" />
                            <span className="text-xs font-semibold">
                              {new Date(log.created_at).toLocaleString("en-IN")}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
