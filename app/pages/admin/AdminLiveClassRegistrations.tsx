import { useState, useEffect } from "react";
import api from "../../services/api";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { RefreshCcw, Mail, Phone, MapPin, Loader2 } from "lucide-react";
import { Button } from "../../components/ui/button";

export default function AdminLiveClassRegistrations() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Live Class Registrations</h1>
          <p className="text-gray-500 mt-1">View and manage all student registrations for upcoming live classes.</p>
        </div>
        <Button onClick={fetchRegistrations} variant="outline" className="gap-2 shrink-0">
          <RefreshCcw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <Card className="border-gray-200 shadow-sm overflow-hidden">
        <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
          <CardTitle className="text-lg font-semibold text-gray-800 flex items-center justify-between">
            <span>Recent Registrations</span>
            <span className="text-sm font-normal text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200">
              Total: {registrations.length}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold text-gray-600">Student</TableHead>
                  <TableHead className="font-semibold text-gray-600">Contact</TableHead>
                  <TableHead className="font-semibold text-gray-600">Location</TableHead>
                  <TableHead className="font-semibold text-gray-600">Class Info</TableHead>
                  <TableHead className="font-semibold text-gray-600 text-right">Registration Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-48 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <Loader2 className="w-8 h-8 animate-spin mb-4 text-[#D50032]" />
                        <p>Loading registrations...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : registrations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-48 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
                          <RefreshCcw className="w-8 h-8 text-gray-300" />
                        </div>
                        <p className="text-lg font-medium text-gray-900 mb-1">No registrations yet</p>
                        <p className="text-sm">When students register, they will appear here.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  registrations.map((reg) => (
                    <TableRow key={reg.id} className="group hover:bg-gray-50/50 transition-colors">
                      <TableCell>
                        <div className="font-medium text-gray-900">{reg.full_name}</div>
                        {reg.user_id ? (
                          <div className="text-xs text-blue-600 font-medium mt-1 bg-blue-50 w-fit px-2 py-0.5 rounded-full border border-blue-100">Registered User</div>
                        ) : (
                          <div className="text-xs text-gray-500 font-medium mt-1 bg-gray-100 w-fit px-2 py-0.5 rounded-full border border-gray-200">Guest</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            {reg.email}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            {reg.mobile_no}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          {reg.city || <span className="text-gray-400 italic">Not provided</span>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-gray-900 max-w-[200px] truncate" title={reg.lecture_title || `Lecture ID: ${reg.lecture_id}`}>
                          {reg.lecture_title || `Lecture ID: ${reg.lecture_id}`}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {reg.lecture_id ? "Database Class" : "Custom/Static Class"}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {format(new Date(reg.registered_at), "MMM d, yyyy")}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {format(new Date(reg.registered_at), "h:mm a")}
                        </div>
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
  );
}
