import { useState, useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import {
  FileText,
  Download,
  IndianRupee,
  Calendar,
  CheckCircle2,
  Eye,
  Search,
  ArrowUpDown,
  Printer,
  X,
  CreditCard
} from "lucide-react";
import api from "../../services/api";

interface Invoice {
  id: string;
  invoiceNumber: string;
  courseTitle: string;
  purchaseDate: string;
  amount: number;
  paymentMethod: string;
  paymentId: string;
  status: "Paid" | "Refunded" | "Pending";
  couponCode?: string;
  discountAmount?: number;
}

export default function InvoicePage() {
  const [userName, setUserName] = useState("Rahul Sharma");
  const [userEmail, setUserEmail] = useState("rahul.sharma@example.com");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    // Get user info
    const stored = localStorage.getItem("user");
    if (stored) {
      const parsed = JSON.parse(stored);
      setUserName(parsed.full_name || "Student");
      setUserEmail(parsed.email || "student@fintrade.com");
    }

    // Fetch enrollments to make realistic invoices
    api.get("/courses/enrolled")
      .then((r) => {
        const enrolledCourses = r.data || [];
        const generatedInvoices: Invoice[] = enrolledCourses.map((e: any, index: number) => {
          const date = e.created_at ? new Date(e.created_at) : new Date();
          const basePrice = e.course?.price || 14999;
          const couponApplied = index === 0; // Simulate coupon on first course
          const discount = couponApplied ? Math.round(basePrice * 0.1) : 0; // 10% coupon

          return {
            id: `inv_${e.id || index + 100}`,
            invoiceNumber: `FT-2026-${1000 + (e.id || index + 1)}`,
            courseTitle: e.course?.title || "Stock Market Fundamentals",
            purchaseDate: date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
            amount: basePrice - discount,
            paymentMethod: "UPI / Razorpay",
            paymentId: `pay_Razorpay_${89324 + (e.id || index)}`,
            status: "Paid",
            couponCode: couponApplied ? "WELCOME10" : undefined,
            discountAmount: couponApplied ? discount : undefined,
          };
        });

        // Fallback mockup if no enrolled courses exist
        if (generatedInvoices.length === 0) {
          generatedInvoices.push(
            {
              id: "inv_mock1",
              invoiceNumber: "FT-2026-1024",
              courseTitle: "Technical Analysis Masterclass",
              purchaseDate: "Apr 12, 2026",
              amount: 8499,
              paymentMethod: "NetBanking / Easebuzz",
              paymentId: "pay_EB_9823412",
              status: "Paid",
              couponCode: "EASTER20",
              discountAmount: 2124
            },
            {
              id: "inv_mock2",
              invoiceNumber: "FT-2026-0985",
              courseTitle: "Advanced Options Trading Strategies",
              purchaseDate: "Jan 18, 2026",
              amount: 14999,
              paymentMethod: "Credit Card / Razorpay",
              paymentId: "pay_RZP_1289410",
              status: "Paid"
            }
          );
        }
        setInvoices(generatedInvoices);
      })
      .catch(() => {
        // Fallback in case of API failure
        setInvoices([
          {
            id: "inv_mock1",
            invoiceNumber: "FT-2026-1024",
            courseTitle: "Technical Analysis Masterclass",
            purchaseDate: "Apr 12, 2026",
            amount: 8499,
            paymentMethod: "NetBanking / Easebuzz",
            paymentId: "pay_EB_9823412",
            status: "Paid",
            couponCode: "EASTER20",
            discountAmount: 2124
          },
          {
            id: "inv_mock2",
            invoiceNumber: "FT-2026-0985",
            courseTitle: "Advanced Options Trading Strategies",
            purchaseDate: "Jan 18, 2026",
            amount: 14999,
            paymentMethod: "Credit Card / Razorpay",
            paymentId: "pay_RZP_1289410",
            status: "Paid"
          }
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const calculateBreakdown = (invoice: Invoice) => {
    const totalAmount = invoice.amount;
    const subtotal = Math.round(totalAmount / 1.18); // Back-calculate 18% GST
    const gstAmount = totalAmount - subtotal;
    return { subtotal, gstAmount, total: totalAmount };
  };

  // Filter and search
  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch = inv.courseTitle.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <DashboardLayout role="student">
        <div className="text-center py-12 text-[#0B2A5B]/60">Loading invoices...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="student">
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#0B2A5B] mb-2">My Invoices</h1>
          <p className="text-[#0B2A5B]/70">Track your course payments, download billing receipts, and check tax breakdowns</p>
        </div>
        <div className="flex gap-2">
          <div className="bg-[#ECE8DD] text-[#0B2A5B] px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 border border-[#0B2A5B]/10">
            <CheckCircle2 size={16} className="text-green-600" />
            <span>Account Verified</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Statistics & Quick Summary */}
        <div className="grid sm:grid-cols-3 gap-4">
          <Card className="p-5 bg-white border border-[#0B2A5B]/10 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Total Spent</p>
              <h3 className="text-2xl font-bold text-[#0B2A5B] flex items-center">
                <IndianRupee size={20} className="stroke-[2.5]" />
                {invoices.reduce((acc, inv) => acc + inv.amount, 0).toLocaleString("en-IN")}
              </h3>
            </div>
            <div className="p-3 bg-[#0B2A5B]/5 rounded-xl text-[#0B2A5B]">
              <IndianRupee size={24} />
            </div>
          </Card>

          <Card className="p-5 bg-white border border-[#0B2A5B]/10 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Invoices Issued</p>
              <h3 className="text-2xl font-bold text-[#0B2A5B]">{invoices.length}</h3>
            </div>
            <div className="p-3 bg-[#0B2A5B]/5 rounded-xl text-[#0B2A5B]">
              <FileText size={24} />
            </div>
          </Card>

          <Card className="p-5 bg-white border border-[#0B2A5B]/10 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Status</p>
              <h3 className="text-2xl font-bold text-green-600">All Cleared</h3>
            </div>
            <div className="p-3 bg-green-50 rounded-xl text-green-600">
              <CheckCircle2 size={24} />
            </div>
          </Card>
        </div>

        {/* Filter Toolbar */}
        <Card className="p-4 bg-white border border-[#0B2A5B]/10 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search course or invoice #..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2 text-sm outline-none focus:border-[#D50032] focus:ring-1 focus:ring-[#D50032] transition-all"
            />
          </div>

          <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {["All", "Paid", "Pending"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`
                  px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border
                  ${statusFilter === status 
                    ? "bg-[#0B2A5B] text-white border-[#0B2A5B] shadow-md" 
                    : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"}
                `}
              >
                {status}
              </button>
            ))}
          </div>
        </Card>

        {/* Invoice List Table */}
        <Card className="overflow-hidden border border-[#0B2A5B]/10 shadow-sm bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-600 uppercase">
                  <th className="px-6 py-4">Invoice #</th>
                  <th className="px-6 py-4">Course Description</th>
                  <th className="px-6 py-4">Purchase Date</th>
                  <th className="px-6 py-4">Amount Paid</th>
                  <th className="px-6 py-4">Payment Method</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                {filteredInvoices.length > 0 ? (
                  filteredInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-[#0B2A5B]">{inv.invoiceNumber}</td>
                      <td className="px-6 py-4 font-semibold text-gray-900">{inv.courseTitle}</td>
                      <td className="px-6 py-4 text-gray-500 flex items-center gap-1.5 py-4">
                        <Calendar size={14} />
                        <span>{inv.purchaseDate}</span>
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900">
                        <span className="flex items-center gap-0.5">
                          <IndianRupee size={14} />
                          {inv.amount.toLocaleString("en-IN")}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-gray-600">
                        <span className="flex items-center gap-1.5">
                          <CreditCard size={14} className="text-gray-400" />
                          {inv.paymentMethod}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`
                          inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                          ${inv.status === "Paid" ? "bg-green-50 text-green-700 border-green-200" : ""}
                          ${inv.status === "Pending" ? "bg-amber-50 text-amber-700 border-amber-200" : ""}
                        `}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => setSelectedInvoice(inv)}
                            className="border-gray-200 hover:text-[#0B2A5B] transition-colors"
                          >
                            <Eye size={14} className="mr-1" /> View
                          </Button>
                          <Button 
                            size="sm" 
                            onClick={() => {
                              setSelectedInvoice(inv);
                              setTimeout(() => window.print(), 100);
                            }}
                            className="bg-[#0B2A5B] text-white hover:bg-[#1a3d7a]"
                          >
                            <Download size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                      No invoices found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Invoice Detail Modal (Print-friendly layout) */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm print:relative print:p-0 print:bg-white print:z-0">
          <Card className="w-full max-w-2xl bg-white shadow-2xl rounded-2xl overflow-hidden flex flex-col max-h-[90vh] print:shadow-none print:rounded-none print:max-h-full">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50 print:hidden">
              <span className="font-bold text-[#0B2A5B]">Tax Invoice Summary</span>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={handlePrint} className="border-gray-300">
                  <Printer size={14} className="mr-1.5" /> Print
                </Button>
                <button 
                  onClick={() => setSelectedInvoice(null)}
                  className="p-1 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Printable Content */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6 print:overflow-visible print:p-0 print:space-y-8">
              {/* Receipt Header Banner */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-gray-100">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-[#0B2A5B] rounded-lg flex items-center justify-center text-white font-extrabold text-sm">
                      FT
                    </div>
                    <span className="text-xl font-extrabold text-[#0B2A5B] tracking-tight">FinTrade</span>
                  </div>
                  <p className="text-xs text-gray-500">104-106, Capital Trade Center, BKC</p>
                  <p className="text-xs text-gray-500">Mumbai, MH - 400051, India</p>
                  <p className="text-xs text-gray-500">GSTIN: 27AABCF4923K1ZM</p>
                </div>
                <div className="text-right sm:text-right">
                  <span className="inline-block bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
                    {selectedInvoice.status}
                  </span>
                  <h3 className="text-xl font-mono font-bold text-gray-900">{selectedInvoice.invoiceNumber}</h3>
                  <p className="text-xs text-gray-500 mt-1">Date: {selectedInvoice.purchaseDate}</p>
                  <p className="text-xs text-gray-500">Transaction ID: {selectedInvoice.paymentId}</p>
                </div>
              </div>

              {/* Billed To / Account Info */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-gray-400 font-bold uppercase tracking-wider mb-1">Billed To</p>
                  <p className="font-bold text-gray-900 text-sm">{userName}</p>
                  <p className="text-gray-500 mt-0.5">{userEmail}</p>
                  <p className="text-gray-500">Student ID: FT-ST-29402</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 font-bold uppercase tracking-wider mb-1">Billing Method</p>
                  <p className="font-semibold text-gray-900 text-sm">{selectedInvoice.paymentMethod}</p>
                  <p className="text-gray-500 mt-0.5">Status: Gateway Authorized</p>
                </div>
              </div>

              {/* Course & Tax Items Breakdown Table */}
              <div className="border border-gray-100 rounded-xl overflow-hidden mt-6">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-xs font-semibold text-gray-600 uppercase border-b border-gray-100">
                      <th className="px-4 py-2.5">Description</th>
                      <th className="px-4 py-2.5 text-right">Tax (18% GST)</th>
                      <th className="px-4 py-2.5 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-xs text-gray-700">
                    <tr>
                      <td className="px-4 py-3 font-semibold text-gray-900">
                        {selectedInvoice.courseTitle} <br />
                        <span className="text-[10px] text-gray-400 font-normal">Lifetime Access & Mentor Support Included</span>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-500">Included</td>
                      <td className="px-4 py-3 text-right font-bold text-gray-900">
                        <span className="flex items-center justify-end">
                          <IndianRupee size={12} />
                          {selectedInvoice.amount.toLocaleString("en-IN")}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Total Calculation breakdown */}
              <div className="flex justify-end pt-4">
                <div className="w-64 space-y-2 text-xs">
                  {selectedInvoice.couponCode && (
                    <div className="flex justify-between text-gray-600">
                      <span>Discount (Coupon: {selectedInvoice.couponCode})</span>
                      <span className="font-semibold text-green-600">
                        - <IndianRupee size={10} className="inline" />
                        {selectedInvoice.discountAmount?.toLocaleString("en-IN")}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-gray-500">
                    <span>Taxable Subtotal</span>
                    <span>
                      <IndianRupee size={10} className="inline" />
                      {calculateBreakdown(selectedInvoice).subtotal.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="flex justify-between text-gray-500">
                    <span>Integrated GST (18%)</span>
                    <span>
                      <IndianRupee size={10} className="inline" />
                      {calculateBreakdown(selectedInvoice).gstAmount.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="h-px bg-gray-100 my-2"></div>

                  <div className="flex justify-between text-sm font-bold text-[#0B2A5B]">
                    <span>Total Paid Amount</span>
                    <span className="flex items-center text-[#0B2A5B]">
                      <IndianRupee size={14} className="stroke-[2.5]" />
                      {calculateBreakdown(selectedInvoice).total.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Invoice Footer Disclaimer */}
              <div className="pt-8 border-t border-gray-100 text-[10px] text-gray-400 text-center space-y-1">
                <p>This is a computer-generated tax invoice and requires no signature.</p>
                <p>For billing queries or support, please email us at <span className="text-[#0B2A5B] font-semibold">billing@thefintrade.com</span></p>
                <p>&copy; 2026 FinTrade Academy. All rights reserved.</p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-2 print:hidden">
              <Button size="sm" variant="ghost" onClick={() => setSelectedInvoice(null)} className="text-gray-500 hover:bg-gray-100">
                Cancel
              </Button>
              <Button size="sm" onClick={handlePrint} className="bg-[#0B2A5B] hover:bg-[#1a3d7a] text-white">
                Print / Save PDF
              </Button>
            </div>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}
