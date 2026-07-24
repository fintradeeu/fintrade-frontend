import { useState, useEffect, Fragment } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Search, Download, ChevronDown, ChevronRight, Activity, MapPin, Map, Lock, Smartphone, ShieldCheck, Box, User, Hash, Monitor, Code } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import api from "../../services/api";
import { toast } from "sonner";
import { format } from "date-fns";

interface ActivityLog {
  id: number;
  user_id: number | null;
  user: any;
  module: string;
  action: string;
  description: string;
  status_code: number;
  status_text: string;
  ip_address: string;
  user_agent: string;
  location_data: any;
  device_data: any;
  metadata_json: any;
  tenant_id: string;
  suspicious: boolean;
  created_at: string;
  log_metadata?: any;
}

export default function AdminCookieConsents() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get("/logs/activity?limit=500");
      setLogs(res.data || []);
    } catch (err: any) {
      toast.error("Failed to load activity logs");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleExportUsers = async () => {
    try {
      toast.info("Preparing export...");
      const res = await api.get("/api/v1/users/export?type=excel", { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "users_export.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Export successful!");
    } catch (err: any) {
      toast.error("Failed to export users");
      console.error(err);
    }
  };

  const toggleRow = (id: number) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredLogs = logs.filter((log) => {
    const query = searchQuery.toLowerCase();
    return (
      log.module.toLowerCase().includes(query) ||
      log.action.toLowerCase().includes(query) ||
      (log.description || "").toLowerCase().includes(query) ||
      (log.user?.email || "").toLowerCase().includes(query) ||
      (log.user?.full_name || "").toLowerCase().includes(query) ||
      (log.ip_address || "").toLowerCase().includes(query)
    );
  });

  const getStatusColor = (code: number, text: string) => {
    if (code >= 200 && code < 300) return "bg-green-500/10 text-green-600 border-green-200";
    if (code >= 400 || text.toLowerCase() === "failed") return "bg-red-500/10 text-red-600 border-red-200";
    return "bg-slate-100 text-slate-700 border-slate-200";
  };

  return (
    <DashboardLayout role="super_admin">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-black text-[#0B2A5B]">Activity Logs</h2>
          <p className="text-slate-500 text-sm mt-1">Track all system events, user actions, and business operations in real-time.</p>
        </div>

        <Card className="rounded-2xl border-0 shadow-sm bg-white overflow-hidden">
          <div className="p-4 md:p-6 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by module, action, user, or IP..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 rounded-xl bg-slate-50 border-slate-200 focus:border-[#D50032]"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="h-10 rounded-xl border-slate-200 text-[#0B2A5B] font-bold"
                onClick={() => fetchLogs()}
              >
                Refresh
              </Button>
              <Button
                className="h-10 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold flex items-center gap-2"
                onClick={handleExportUsers}
              >
                <Download className="w-4 h-4" />
                Export Users
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="w-10"></TableHead>
                  <TableHead className="text-xs font-black text-[#0B2A5B] uppercase tracking-wider">Date & Time</TableHead>
                  <TableHead className="text-xs font-black text-[#0B2A5B] uppercase tracking-wider">User</TableHead>
                  <TableHead className="text-xs font-black text-[#0B2A5B] uppercase tracking-wider">Module</TableHead>
                  <TableHead className="text-xs font-black text-[#0B2A5B] uppercase tracking-wider">Action</TableHead>
                  <TableHead className="text-xs font-black text-[#0B2A5B] uppercase tracking-wider">Description</TableHead>
                  <TableHead className="text-xs font-black text-[#0B2A5B] uppercase tracking-wider">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-slate-500">
                      Loading activity logs...
                    </TableCell>
                  </TableRow>
                ) : filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-slate-500">
                      No logs found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => (
                    <Fragment key={log.id}>
                      <TableRow className={`cursor-pointer transition-colors hover:bg-slate-50/80 ${expandedRows[log.id] ? "bg-slate-50/50" : ""}`} onClick={() => toggleRow(log.id)}>
                        <TableCell>
                          {expandedRows[log.id] ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <div className="font-semibold text-slate-700 text-sm">{format(new Date(log.created_at), "MMM d, yyyy")}</div>
                          <div className="text-xs text-slate-400">{format(new Date(log.created_at), "h:mm a")}</div>
                        </TableCell>
                        <TableCell>
                          {log.user ? (
                            <div>
                              <div className="font-bold text-[#0B2A5B] text-sm">{log.user.full_name || "Unknown"}</div>
                              <div className="text-xs text-slate-400">{log.user.email}</div>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 italic">Guest / System</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] font-bold uppercase tracking-wider">
                            {log.module}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm font-semibold text-slate-700">{log.action}</TableCell>
                        <TableCell className="text-sm text-slate-600 truncate max-w-[200px]">{log.description}</TableCell>
                        <TableCell>
                          <Badge className={`text-xs font-bold border ${getStatusColor(log.status_code, log.status_text)}`}>
                            {log.status_text} {log.status_code ? `(${log.status_code})` : ""}
                          </Badge>
                        </TableCell>
                      </TableRow>
                      
                      {expandedRows[log.id] && (
                        <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                          <TableCell colSpan={7} className="p-0 border-b-2 border-slate-100">
                            <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-top-2 duration-200">
                              
                              {/* Details Panel */}
                              <div className="space-y-4">
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                  <Box className="w-3.5 h-3.5" /> Details
                                </h4>
                                <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                                  <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500 flex items-center gap-2"><Activity className="w-4 h-4 text-slate-400"/> Full Time</span>
                                    <span className="font-semibold text-slate-700">{format(new Date(log.created_at), "PPpp")}</span>
                                  </div>
                                  <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500 flex items-center gap-2"><User className="w-4 h-4 text-slate-400"/> User Email</span>
                                    <span className="font-semibold text-slate-700">{log.user?.email || "N/A"}</span>
                                  </div>
                                  <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500 flex items-center gap-2"><Hash className="w-4 h-4 text-slate-400"/> User ID</span>
                                    <span className="font-semibold text-slate-700">{log.user_id || "N/A"}</span>
                                  </div>
                                  <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500 flex items-center gap-2"><Activity className="w-4 h-4 text-slate-400"/> HTTP</span>
                                    <span className="font-semibold text-slate-700">{log.status_code || "N/A"}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Device & Network Panel */}
                              <div className="space-y-4">
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                  <Monitor className="w-3.5 h-3.5" /> Device & Network
                                </h4>
                                <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                                  <div className="flex justify-between items-start text-sm">
                                    <span className="text-slate-500 flex items-center gap-2 whitespace-nowrap"><MapPin className="w-4 h-4 text-slate-400"/> Location</span>
                                    <span className="font-semibold text-slate-700 text-right">
                                      {log.log_metadata ? `${log.log_metadata.city || ""}, ${log.log_metadata.state || ""}, ${log.log_metadata.country || ""} ${log.log_metadata.postal_code || ""}` : (log.location_data ? `${log.location_data.city || ""}, ${log.location_data.region || ""}, ${log.location_data.country_name || ""}` : "Unknown")}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500 flex items-center gap-2"><Map className="w-4 h-4 text-slate-400"/> Google Map</span>
                                    {(log.log_metadata?.latitude && log.log_metadata?.longitude) || (log.location_data?.latitude && log.location_data?.longitude) ? (
                                      <a href={`https://maps.google.com/?q=${log.log_metadata?.latitude || log.location_data?.latitude},${log.log_metadata?.longitude || log.location_data?.longitude}`} target="_blank" rel="noreferrer" className="font-bold text-[#D50032] hover:underline">View Map</a>
                                    ) : (
                                      <span className="text-slate-400 italic">N/A</span>
                                    )}
                                  </div>
                                  <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500 flex items-center gap-2"><Lock className="w-4 h-4 text-slate-400"/> Permission</span>
                                    <span className="font-semibold text-slate-700">{log.log_metadata?.permission_status || (log.location_data ? "GRANTED" : "NOT_ASKED")}</span>
                                  </div>
                                  <div className="flex justify-between items-start text-sm">
                                    <span className="text-slate-500 flex items-center gap-2 whitespace-nowrap"><Smartphone className="w-4 h-4 text-slate-400"/> Device</span>
                                    <span className="font-semibold text-slate-700 text-right text-xs truncate max-w-[150px]" title={log.log_metadata?.os || log.device_data?.platform || log.user_agent}>
                                      {log.log_metadata ? `${log.log_metadata.os || ""} ${log.log_metadata.os_version || ""} - ${log.log_metadata.browser || ""} ${log.log_metadata.browser_version || ""}` : (log.device_data?.platform || (log.user_agent ? log.user_agent.split(" ")[0] : "Unknown"))}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500 flex items-center gap-2"><Monitor className="w-4 h-4 text-slate-400"/> Resolution</span>
                                    <span className="font-semibold text-slate-700">{log.log_metadata?.screen_width ? `${log.log_metadata.screen_width}x${log.log_metadata.screen_height}` : "Unknown"}</span>
                                  </div>
                                  <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500 flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-slate-400"/> Suspicious</span>
                                    <span className={`font-bold ${log.suspicious ? "text-red-600" : "text-green-600"}`}>{log.suspicious ? "YES" : "NO"}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Metadata Panel */}
                              <div className="space-y-4">
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                  <Code className="w-3.5 h-3.5" /> Metadata
                                </h4>
                                <div className="bg-slate-900 p-4 rounded-xl shadow-sm overflow-hidden h-full max-h-56">
                                  <pre className="text-[10px] text-green-400 font-mono overflow-auto h-full w-full whitespace-pre-wrap break-all">
                                    {JSON.stringify(log.log_metadata || log.metadata_json || {
                                      ip_address: log.ip_address,
                                      user_agent: log.user_agent,
                                      tenant: log.tenant_id
                                    }, null, 2)}
                                  </pre>
                                </div>
                              </div>

                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
