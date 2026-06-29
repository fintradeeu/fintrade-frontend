import { useState, useEffect } from "react";
import api from "../../services/api";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { RefreshCcw, Mail, Phone, MapPin, Loader2, Users, Download, Filter, Trash2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import DashboardLayout from "../../components/DashboardLayout";
import { confirmPopup } from "../../utils/popup";
import { toast } from "sonner";

export default function AdminLiveClassRegistrations() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState("ALL_CITIES");
  const [selectedClass, setSelectedClass] = useState("ALL_CLASSES");

  const handleDelete = async (regId: number) => {
    const confirmed = await confirmPopup(
      "Are you sure you want to delete this live class registration? This action cannot be undone."
    );
    if (!confirmed) return;

    try {
      await api.delete(`/admin/lectures/registrations/${regId}`);
      toast.success("Live class registration deleted successfully!");
      setRegistrations((prev) => prev.filter((r) => r.id !== regId));
    } catch (error) {
      toast.error("Failed to delete registration");
      console.error(error);
    }
  };

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/lectures/registrations");
      setRegistrations(res.data);
    } catch (error) {
      console.error("Failed to fetch registrations", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  // Filter logic
  const filteredRegistrations = registrations.filter((reg) => {
    const matchCity = selectedCity === "ALL_CITIES" || reg.city === selectedCity;
    const currentClassTitle = reg.lecture_title || `Lecture ID: ${reg.lecture_id}`;
    const matchClass = selectedClass === "ALL_CLASSES" || currentClassTitle === selectedClass;
    return matchCity && matchClass;
  });

  // Extract unique filter options from all registrations
  const cities = Array.from(new Set(registrations.map(r => r.city).filter(Boolean))) as string[];
  const classes = Array.from(
    new Set(registrations.map(r => r.lecture_title || `Lecture ID: ${r.lecture_id}`).filter(Boolean))
  ) as string[];

  // Export filtered data to Excel-compatible CSV format
  const handleExportToExcel = () => {
    const headers = ["Student Name", "User Type", "Email", "Mobile", "City", "Class Title", "Registration Date"];
    const rows = filteredRegistrations.map(reg => [
      reg.full_name || "",
      reg.user_id ? "Registered User" : "Guest",
      reg.email || "",
      reg.mobile_no || "",
      reg.city || "",
      reg.lecture_title || `Lecture ID: ${reg.lecture_id}` || "",
      reg.registered_at ? format(new Date(reg.registered_at), "yyyy-MM-dd HH:mm:ss") : ""
    ]);

    // Construct CSV string
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    // Create a download link and trigger it
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `live_class_registrations_${format(new Date(), "yyyyMMdd_HHmmss")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Live Class Registrations</h1>
            <p className="text-gray-500 mt-1">View and manage all student registrations for upcoming live classes.</p>
          </div>
          <Button 
            onClick={fetchRegistrations} 
            variant="outline" 
            className="gap-2 shrink-0 border-gray-300 hover:border-[#D50032] hover:text-[#D50032] transition-colors"
          >
            <RefreshCcw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Filters and Actions Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border-2 border-gray-100 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-semibold text-gray-550 flex items-center gap-1.5 mr-1">
              <Filter className="w-4 h-4 text-gray-400" /> Filters:
            </span>
            
            {/* City Filter */}
            <div className="w-[180px]">
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger className="w-full bg-gray-50/50 border-gray-200">
                  <SelectValue placeholder="Filter by City" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL_CITIES">All Cities</SelectItem>
                  {cities.map(city => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Class Filter */}
            <div className="w-[240px]">
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-full bg-gray-50/50 border-gray-200">
                  <SelectValue placeholder="Filter by Class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL_CLASSES">All Classes</SelectItem>
                  {classes.map(cls => (
                    <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Clear Filters */}
            {(selectedCity !== "ALL_CITIES" || selectedClass !== "ALL_CLASSES") && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setSelectedCity("ALL_CITIES");
                  setSelectedClass("ALL_CLASSES");
                }}
                className="text-gray-500 hover:text-[#D50032] hover:bg-[#D50032]/5 text-xs font-semibold rounded-lg"
              >
                Clear Filters
              </Button>
            )}
          </div>

          {/* Export to Excel Button */}
          <Button 
            onClick={handleExportToExcel}
            disabled={filteredRegistrations.length === 0}
            className="gap-2 shadow-md shrink-0 font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
            style={{ backgroundColor: '#10B981' }}
          >
            <Download className="w-4 h-4" />
            Export to Excel
          </Button>
        </div>

        {/* Table Card */}
        <Card className="border-2 border-gray-100 shadow-sm overflow-hidden">
          <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
            <CardTitle className="text-lg font-bold text-gray-800 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#D50032]" />
                {selectedCity !== "ALL_CITIES" || selectedClass !== "ALL_CLASSES" ? "Filtered Registrations" : "Recent Registrations"}
              </span>
              <Badge 
                style={{ 
                  background: 'rgba(213, 0, 50, 0.08)', 
                  color: '#D50032',
                  border: '1px solid rgba(213, 0, 50, 0.15)'
                }}
                className="px-3 py-1 text-sm font-semibold rounded-full"
              >
                Showing: {filteredRegistrations.length} of {registrations.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/75 hover:bg-transparent">
                    <TableHead className="font-bold text-gray-750 py-3.5">Student</TableHead>
                    <TableHead className="font-bold text-gray-750 py-3.5">Contact</TableHead>
                    <TableHead className="font-bold text-gray-750 py-3.5">Location</TableHead>
                    <TableHead className="font-bold text-gray-750 py-3.5">Class Info</TableHead>
                    <TableHead className="font-bold text-gray-750 py-3.5 text-right">Registration Date</TableHead>
                    <TableHead className="font-bold text-gray-750 py-3.5 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-48 text-center">
                        <div className="flex flex-col items-center justify-center text-gray-505">
                          <Loader2 className="w-8 h-8 animate-spin mb-4 text-[#D50032]" />
                          <p className="font-medium text-gray-600">Loading registrations...</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredRegistrations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-48 text-center">
                        <div className="flex flex-col items-center justify-center text-gray-500">
                          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
                            <Users className="w-8 h-8 text-gray-300" />
                          </div>
                          <p className="text-lg font-semibold text-gray-900 mb-1">No matching registrations found</p>
                          <p className="text-sm text-gray-550">Try adjusting your filters or clear them to view all.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRegistrations.map((reg) => (
                      <TableRow key={reg.id} className="group hover:bg-gray-50/40 transition-colors">
                        <TableCell className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-[#D50032]/10 flex items-center justify-center text-[#D50032] font-bold text-sm shrink-0 border border-[#D50032]/10">
                              {reg.full_name ? reg.full_name.charAt(0).toUpperCase() : "?"}
                            </div>
                            <div>
                              <div className="font-bold text-gray-900">{reg.full_name}</div>
                              {reg.user_id ? (
                                <Badge 
                                  style={{ 
                                    background: 'rgba(59, 130, 246, 0.08)', 
                                    color: '#1e40af', 
                                    border: '1px solid rgba(59, 130, 246, 0.15)' 
                                  }} 
                                  className="text-[10px] px-2 py-0.5 mt-1 font-semibold"
                                >
                                  Registered User
                                </Badge>
                              ) : (
                                <Badge 
                                  style={{ 
                                    background: 'rgba(107, 114, 128, 0.08)', 
                                    color: '#374151', 
                                    border: '1px solid rgba(107, 114, 128, 0.15)' 
                                  }} 
                                  className="text-[10px] px-2 py-0.5 mt-1 font-semibold"
                                >
                                  Guest
                                </Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                              <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                              <span className="font-medium">{reg.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                              <span>{reg.mobile_no}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <MapPin className="w-3.5 h-3.5 text-[#D50032] shrink-0" />
                            <span className="font-medium">{reg.city || <span className="text-gray-400 italic">Not provided</span>}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div>
                            <div className="font-bold text-gray-900 max-w-[250px] truncate" title={reg.lecture_title || `Lecture ID: ${reg.lecture_id}`}>
                              {reg.lecture_title || `Lecture ID: ${reg.lecture_id}`}
                            </div>
                            <Badge 
                              style={{ 
                                background: 'rgba(213, 0, 50, 0.06)', 
                                color: '#D50032', 
                                border: '1px solid rgba(213, 0, 50, 0.12)' 
                              }} 
                              className="text-[10px] px-2 py-0.5 mt-1 font-semibold"
                            >
                              {reg.lecture_id ? "Database Class" : "Custom/Static Class"}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 text-right">
                          <div className="text-sm font-semibold text-gray-900">
                            {format(new Date(reg.registered_at), "MMM d, yyyy")}
                          </div>
                          <div className="text-xs text-gray-500 font-medium mt-0.5">
                            {format(new Date(reg.registered_at), "h:mm a")}
                          </div>
                        </TableCell>
                        <TableCell className="py-4 text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(reg.id)}
                            className="h-8 w-8 text-slate-400 hover:text-red-650 hover:bg-red-550 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Registration"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
