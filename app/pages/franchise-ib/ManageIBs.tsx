import { useState, useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import api from "../../services/api";

export default function ManageIBs() {
  const [ibs, setIbs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIBs = async () => {
      try {
        const res = await api.get("/franchise-ibs/ibs");
        setIbs(res.data.data || []);
      } catch (err) {
        console.error("Failed to fetch IBs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchIBs();
  }, []);

  return (
    <DashboardLayout role="franchise_ib">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0B2A5B] mb-2">Manage Sub-IBs</h1>
        <p className="text-[#0B2A5B]/70">View the Introducing Brokers recruited under your Franchise network.</p>
      </div>

      <Card className="p-6 bg-white shadow-lg rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#F4F1EA] hover:bg-[#F4F1EA]">
                <TableHead className="text-[#0B2A5B] font-semibold">Name</TableHead>
                <TableHead className="text-[#0B2A5B] font-semibold">Email</TableHead>
                <TableHead className="text-[#0B2A5B] font-semibold">Phone</TableHead>
                <TableHead className="text-[#0B2A5B] font-semibold">Region</TableHead>
                <TableHead className="text-[#0B2A5B] font-semibold">Referral Code</TableHead>
                <TableHead className="text-[#0B2A5B] font-semibold">Joined At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">Loading...</TableCell>
                </TableRow>
              ) : ibs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No Introducing Brokers have joined your network yet.
                  </TableCell>
                </TableRow>
              ) : (
                ibs.map((ib) => (
                  <TableRow key={ib.id} className="hover:bg-gray-50">
                    <TableCell className="font-semibold text-[#0B2A5B]">{ib.full_name}</TableCell>
                    <TableCell className="text-[#0B2A5B]/70">{ib.email}</TableCell>
                    <TableCell className="text-[#0B2A5B]/70">{ib.phone}</TableCell>
                    <TableCell className="text-[#0B2A5B]">{ib.region || "---"}</TableCell>
                    <TableCell className="font-mono text-sm">{ib.referral_code}</TableCell>
                    <TableCell className="text-[#0B2A5B]">
                      {new Date(ib.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </DashboardLayout>
  );
}
