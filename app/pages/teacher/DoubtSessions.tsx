import { useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { Card } from "../../components/ui/card";
import { MessageCircle, Clock, CheckCircle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Button } from "../../components/ui/button";

export default function DoubtSessions() {
  const [sessions, setSessions] = useState([
    { id: 1, student: "Amit Patel", course: "Options Trading", topic: "Delta Hedging", time: "10:00 AM", status: "pending" },
    { id: 2, student: "Sneha Rao", course: "Technical Analysis", topic: "MACD Divergence", time: "11:30 AM", status: "resolved" }
  ]);

  const resolveSession = (id: number) => {
    setSessions(sessions.map(s => s.id === id ? { ...s, status: "resolved" } : s));
  };

  return (
    <DashboardLayout role="teacher">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0B2A5B] mb-2">Doubt Sessions</h1>
        <p className="text-[#0B2A5B]/70">Resolve student queries and schedule sessions</p>
      </div>

      <Card className="p-6 bg-white shadow-lg overflow-hidden">
        <h2 className="text-xl font-bold mb-4">Scheduled Doubt Sessions</h2>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#F4F1EA]">
                <TableHead className="text-[#0B2A5B]">Student Name</TableHead>
                <TableHead className="text-[#0B2A5B]">Course</TableHead>
                <TableHead className="text-[#0B2A5B]">Topic</TableHead>
                <TableHead className="text-[#0B2A5B]">Time</TableHead>
                <TableHead className="text-[#0B2A5B]">Status</TableHead>
                <TableHead className="text-[#0B2A5B]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium text-[#0B2A5B]">{s.student}</TableCell>
                  <TableCell className="text-[#0B2A5B]/70">{s.course}</TableCell>
                  <TableCell className="text-[#0B2A5B]">{s.topic}</TableCell>
                  <TableCell className="text-[#0B2A5B]">{s.time}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${s.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell>
                    {s.status === 'pending' ? (
                      <Button size="sm" className="bg-[#D50032] hover:bg-[#a30026] text-white" onClick={() => resolveSession(s.id)}>
                        <CheckCircle size={14} className="mr-1" /> Resolve
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" disabled>Resolved</Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </DashboardLayout>
  );
}
