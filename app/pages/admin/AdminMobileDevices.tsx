import { useState, useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Search, Download, Smartphone, MapPin } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import api from "../../services/api";
import { toast } from "sonner";
import { format } from "date-fns";
import * as XLSX from "xlsx";

interface MobileDevice {
  id: number;
  user_id: number | null;
  user_name: string | null;
  user_email: string | null;
  user_phone: string | null;
  device_name: string | null;
  manufacturer: string | null;
  model: string | null;
  platform: string | null;
  os_version: string | null;
  app_version: string | null;
  notification_permission: string;
  location_permission: string;
  context_consent: string;
  country: string | null;
  state: string | null;
  city: string | null;
  google_map_url: string | null;
  last_login: string | null;
  last_active: string | null;
  created_at: string;
}

export default function AdminMobileDevices() {
  const [devices, setDevices] = useState<MobileDevice[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [platformFilter, setPlatformFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/v1/device/admin/list?limit=500&search=${searchQuery}&platform=${platformFilter === "ALL" ? "" : platformFilter}`);
      setDevices(res.data.items || []);
      setTotal(res.data.total || 0);
    } catch (err: any) {
      toast.error("Failed to load mobile devices");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, [searchQuery, platformFilter]);

  const handleExportExcel = () => {
    toast.info("Preparing Excel export...");
    const worksheet = XLSX.utils.json_to_sheet(
      devices.map(d => ({
        "User ID": d.user_id,
        "Name": d.user_name,
        "Email": d.user_email,
        "Phone": d.user_phone,
        "Device": d.device_name || `${d.manufacturer} ${d.model}`,
        "Platform": d.platform,
        "OS Version": d.os_version,
        "App Version": d.app_version,
        "Notification": d.notification_permission,
        "Location": d.location_permission,
        "Context": d.context_consent,
        "Country": d.country,
        "State": d.state,
        "City": d.city,
        "Last Login": d.last_login ? format(new Date(d.last_login), "yyyy-MM-dd HH:mm") : "",
        "Last Active": d.last_active ? format(new Date(d.last_active), "yyyy-MM-dd HH:mm") : "",
        "Registered At": format(new Date(d.created_at), "yyyy-MM-dd HH:mm")
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Mobile Devices");
    XLSX.writeFile(workbook, "MobileDevices_Export.xlsx");
    toast.success("Export downloaded");
  };

  const handleExportCSV = () => {
    toast.info("Preparing CSV export...");
    const worksheet = XLSX.utils.json_to_sheet(
      devices.map(d => ({
        "User ID": d.user_id,
        "Name": d.user_name,
        "Email": d.user_email,
        "Device": d.device_name,
        "Platform": d.platform,
        "Notification": d.notification_permission,
        "Location": d.location_permission,
        "Context": d.context_consent,
        "Country": d.country,
        "City": d.city
      }))
    );
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "MobileDevices_Export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Export downloaded");
  };

  const getPermissionColor = (status: string) => {
    if (status === "GRANTED") return "bg-green-500/10 text-green-600 border-green-200";
    if (status === "DENIED") return "bg-red-500/10 text-red-600 border-red-200";
    return "bg-slate-100 text-slate-700 border-slate-200";
  };

  return (
    <DashboardLayout role="super_admin">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-black text-[#0B2A5B]">Mobile Device Management</h2>
          <p className="text-slate-500 text-sm mt-1">Manage registered mobile devices, app versions, and user permissions.</p>
        </div>

        <Card className="rounded-2xl border-0 shadow-sm bg-white overflow-hidden">
          <div className="p-4 md:p-6 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search user, email, device..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10 rounded-xl bg-slate-50 border-slate-200 focus:border-[#D50032]"
                />
              </div>
              <Select value={platformFilter} onValueChange={setPlatformFilter}>
                <SelectTrigger className="w-full sm:w-[150px] h-10 rounded-xl bg-slate-50 border-slate-200">
                  <SelectValue placeholder="Platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Platforms</SelectItem>
                  <SelectItem value="Android">Android</SelectItem>
                  <SelectItem value="iOS">iOS</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2 w-full md:w-auto">
              <Button
                variant="outline"
                className="h-10 rounded-xl border-slate-200 text-[#0B2A5B] font-bold flex-1 md:flex-none"
                onClick={handleExportCSV}
              >
                <Download className="w-4 h-4 mr-2" />
                CSV
              </Button>
              <Button
                className="h-10 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold flex-1 md:flex-none"
                onClick={handleExportExcel}
              >
                <Download className="w-4 h-4 mr-2" />
                Excel
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="text-xs font-black text-[#0B2A5B] uppercase tracking-wider">User Details</TableHead>
                  <TableHead className="text-xs font-black text-[#0B2A5B] uppercase tracking-wider">Device</TableHead>
                  <TableHead className="text-xs font-black text-[#0B2A5B] uppercase tracking-wider">Permissions</TableHead>
                  <TableHead className="text-xs font-black text-[#0B2A5B] uppercase tracking-wider">Location</TableHead>
                  <TableHead className="text-xs font-black text-[#0B2A5B] uppercase tracking-wider">Activity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                      Loading devices...
                    </TableCell>
                  </TableRow>
                ) : devices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                      No mobile devices found.
                    </TableCell>
                  </TableRow>
                ) : (
                  devices.map((device) => (
                    <TableRow key={device.id} className="hover:bg-slate-50/80">
                      <TableCell>
                        <div className="font-bold text-[#0B2A5B] text-sm">{device.user_name || "Guest"}</div>
                        <div className="text-xs text-slate-500">{device.user_email || "-"}</div>
                        {device.user_phone && <div className="text-xs text-slate-400">{device.user_phone}</div>}
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Smartphone className="w-4 h-4 text-slate-400" />
                          <span className="font-semibold text-slate-700 text-sm">
                            {device.platform} {device.os_version}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          {device.manufacturer} {device.model}
                        </div>
                        <div className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">
                          App: v{device.app_version || "Unknown"}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-xs font-semibold text-slate-500">Notification</span>
                            <Badge className={`text-[10px] border ${getPermissionColor(device.notification_permission)}`}>
                              {device.notification_permission}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-xs font-semibold text-slate-500">Location</span>
                            <Badge className={`text-[10px] border ${getPermissionColor(device.location_permission)}`}>
                              {device.location_permission}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-xs font-semibold text-slate-500">Context</span>
                            <Badge className={`text-[10px] border ${getPermissionColor(device.context_consent)}`}>
                              {device.context_consent}
                            </Badge>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        {device.city || device.country ? (
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                            <div>
                              <div className="text-sm font-semibold text-slate-700">
                                {device.city}{device.city && device.state ? ", " : ""}{device.state}
                              </div>
                              <div className="text-xs text-slate-500">{device.country}</div>
                              {device.google_map_url && (
                                <a href={device.google_map_url} target="_blank" rel="noreferrer" className="text-[10px] text-blue-600 hover:underline mt-1 block">
                                  View on Map
                                </a>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">No Location</span>
                        )}
                      </TableCell>

                      <TableCell className="whitespace-nowrap">
                        <div className="text-xs">
                          <span className="text-slate-500 font-medium">Last Login:</span>{" "}
                          <span className="text-slate-700 font-semibold">{device.last_login ? format(new Date(device.last_login), "MMM d, HH:mm") : "-"}</span>
                        </div>
                        <div className="text-xs mt-1">
                          <span className="text-slate-500 font-medium">Last Active:</span>{" "}
                          <span className="text-slate-700 font-semibold">{device.last_active ? format(new Date(device.last_active), "MMM d, HH:mm") : "-"}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-2">
                          Registered: {format(new Date(device.created_at), "MMM d, yyyy")}
                        </div>
                      </TableCell>

                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          <div className="p-4 border-t border-gray-50 flex items-center justify-between">
            <div className="text-xs text-slate-500">
              Showing <span className="font-bold">{devices.length}</span> of <span className="font-bold">{total}</span> devices
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
