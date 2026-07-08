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
import logo from "../../../imports/fintrade_logo.png";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { toast } from "sonner";

interface Invoice {
  id: string;
  invoiceNumber: string;
  courseTitle: string;
  purchaseDate: string;
  amount: number;
  totalAmount: number;
  feesAmount: number;
  gstAmount: number;
  totalPaidAmount: number;
  paymentMethod: string;
  paymentId: string;
  status: "Paid" | "Refunded" | "Pending";
  couponCode?: string;
  discountAmount?: number;
  originalPrice: number;
}

export default function InvoicePage() {
  const [userName, setUserName] = useState("Rahul Sharma");
  const [userEmail, setUserEmail] = useState("rahul.sharma@example.com");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedAmountMetric, setSelectedAmountMetric] = useState<"totalAmount" | "feesAmount" | "gstAmount" | "totalPaidAmount">("totalPaidAmount");

  const roundMoney = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

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
          const date = e.enrolled_at ? new Date(e.enrolled_at) : new Date();
          const basePrice = e.course?.price !== undefined && e.course?.price !== null ? e.course.price : 14999;
          const discount = e.discount_applied !== undefined && e.discount_applied !== null ? e.discount_applied : 0;
          const feesAmount = roundMoney(e.price_paid !== undefined && e.price_paid !== null ? e.price_paid : (basePrice - discount));
          const gstAmount = roundMoney(e.payment_amount !== undefined && e.payment_amount !== null ? e.payment_amount - feesAmount : feesAmount * 0.18);
          const totalPaidAmount = roundMoney(e.payment_amount !== undefined && e.payment_amount !== null ? e.payment_amount : (feesAmount + gstAmount));
          const couponLabel = e.coupon_title && e.coupon_code && e.coupon_title !== e.coupon_code
            ? `${e.coupon_title} (${e.coupon_code})`
            : e.coupon_code || e.coupon_title;

          return {
            id: `inv_${e.id || index + 100}`,
            invoiceNumber: `FT-2026-${1000 + (e.id || index + 1)}`,
            courseTitle: e.course?.title || "Stock Market Fundamentals",
            purchaseDate: date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
            amount: totalPaidAmount,
            totalAmount: basePrice,
            feesAmount,
            gstAmount,
            totalPaidAmount,
            paymentMethod: "UPI / Razorpay",
            paymentId: e.payment_txnid || `pay_Razorpay_${89324 + (e.id || index)}`,
            status: e.is_active ? "Paid" : "Pending",
            couponCode: couponLabel || (discount > 0 ? "COUPON" : undefined),
            discountAmount: discount,
            originalPrice: basePrice,
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
              amount: 10028.82,
              totalAmount: 10623,
              feesAmount: 8499,
              gstAmount: 1529.82,
              totalPaidAmount: 10028.82,
              paymentMethod: "NetBanking / Easebuzz",
              paymentId: "pay_EB_9823412",
              status: "Paid",
              couponCode: "EASTER20",
              discountAmount: 2124,
              originalPrice: 10623,
            },
            {
              id: "inv_mock2",
              invoiceNumber: "FT-2026-0985",
              courseTitle: "Advanced Options Trading Strategies",
              purchaseDate: "Jan 18, 2026",
              amount: 17698.82,
              totalAmount: 14999,
              feesAmount: 14999,
              gstAmount: 2699.82,
              totalPaidAmount: 17698.82,
              paymentMethod: "Credit Card / Razorpay",
              paymentId: "pay_RZP_1289410",
              status: "Paid",
              originalPrice: 14999,
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
            amount: 10028.82,
            totalAmount: 10623,
            feesAmount: 8499,
            gstAmount: 1529.82,
            totalPaidAmount: 10028.82,
            paymentMethod: "NetBanking / Easebuzz",
            paymentId: "pay_EB_9823412",
            status: "Paid",
            couponCode: "EASTER20",
            discountAmount: 2124,
            originalPrice: 10623,
          },
          {
            id: "inv_mock2",
            invoiceNumber: "FT-2026-0985",
            courseTitle: "Advanced Options Trading Strategies",
            purchaseDate: "Jan 18, 2026",
            amount: 17698.82,
            totalAmount: 14999,
            feesAmount: 14999,
            gstAmount: 2699.82,
            totalPaidAmount: 17698.82,
            paymentMethod: "Credit Card / Razorpay",
            paymentId: "pay_RZP_1289410",
            status: "Paid",
            originalPrice: 14999,
          }
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    const element = document.getElementById("invoice-printable-area");
    if (!element) return;
    
    try {
      toast("Generating PDF...", { id: "pdf-toast" });
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Invoice_${selectedInvoice?.invoiceNumber || 'download'}.pdf`);
      toast.success("Invoice downloaded successfully!", { id: "pdf-toast" });
    } catch (err) {
      console.error("Failed to generate PDF:", err);
      toast.error("Failed to download PDF.", { id: "pdf-toast" });
    }
  };

  const formatCurrency = (val: number) => {
    return val.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const calculateBreakdown = (invoice: Invoice) => {
    const subtotal = invoice.feesAmount;
    const gstAmount = invoice.gstAmount;
    const total = invoice.totalPaidAmount;
    return { subtotal, gstAmount, total };
  };

  const invoiceTotals = invoices.reduce(
    (acc, inv) => ({
      totalAmount: acc.totalAmount + inv.totalAmount,
      feesAmount: acc.feesAmount + inv.feesAmount,
      gstAmount: acc.gstAmount + inv.gstAmount,
      totalPaidAmount: acc.totalPaidAmount + inv.totalPaidAmount,
    }),
    { totalAmount: 0, feesAmount: 0, gstAmount: 0, totalPaidAmount: 0 }
  );

  const invoiceAmountCellClass = (metric: typeof selectedAmountMetric) =>
    `px-6 py-4 font-bold ${selectedAmountMetric === metric ? "bg-[#FFF4D8] text-[#0B2A5B]" : "text-gray-900"}`;

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
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <Card onClick={() => setSelectedAmountMetric("totalAmount")} className={`p-5 bg-white border shadow-sm flex items-center justify-between cursor-pointer transition-all ${selectedAmountMetric === "totalAmount" ? "border-[#D50032] shadow-md" : "border-[#0B2A5B]/10 hover:border-[#D50032]"}`}>
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Total Amount</p>
              <h3 className="text-2xl font-bold text-[#0B2A5B] flex items-center">
                <IndianRupee size={20} className="stroke-[2.5]" />
                {formatCurrency(invoiceTotals.totalAmount)}
              </h3>
            </div>
            <div className="p-3 bg-[#0B2A5B]/5 rounded-xl text-[#0B2A5B]">
              <IndianRupee size={24} />
            </div>
          </Card>

          <Card onClick={() => setSelectedAmountMetric("feesAmount")} className={`p-5 bg-white border shadow-sm flex items-center justify-between cursor-pointer transition-all ${selectedAmountMetric === "feesAmount" ? "border-[#D50032] shadow-md" : "border-[#0B2A5B]/10 hover:border-[#D50032]"}`}>
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Total Fees</p>
              <h3 className="text-2xl font-bold text-[#0B2A5B] flex items-center">
                <IndianRupee size={20} className="stroke-[2.5]" />
                {formatCurrency(invoiceTotals.feesAmount)}
              </h3>
            </div>
            <div className="p-3 bg-[#0B2A5B]/5 rounded-xl text-[#0B2A5B]">
              <FileText size={24} />
            </div>
          </Card>

          <Card onClick={() => setSelectedAmountMetric("gstAmount")} className={`p-5 bg-white border shadow-sm flex items-center justify-between cursor-pointer transition-all ${selectedAmountMetric === "gstAmount" ? "border-[#D50032] shadow-md" : "border-[#0B2A5B]/10 hover:border-[#D50032]"}`}>
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Total GST Amount</p>
              <h3 className="text-2xl font-bold text-[#0B2A5B] flex items-center">
                <IndianRupee size={20} className="stroke-[2.5]" />
                {formatCurrency(invoiceTotals.gstAmount)}
              </h3>
            </div>
            <div className="p-3 bg-[#0B2A5B]/5 rounded-xl text-[#0B2A5B]">
              <CreditCard size={24} />
            </div>
          </Card>

          <Card onClick={() => setSelectedAmountMetric("totalPaidAmount")} className={`p-5 bg-white border shadow-sm flex items-center justify-between cursor-pointer transition-all ${selectedAmountMetric === "totalPaidAmount" ? "border-[#D50032] shadow-md" : "border-[#0B2A5B]/10 hover:border-[#D50032]"}`}>
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Total Paid Amount</p>
              <h3 className="text-2xl font-bold text-green-600 flex items-center">
                <IndianRupee size={20} className="stroke-[2.5]" />
                {formatCurrency(invoiceTotals.totalPaidAmount)}
              </h3>
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
                  <th className="px-6 py-4">Total Amount</th>
                  <th className="px-6 py-4">Total Fees</th>
                  <th className="px-6 py-4">GST Amount</th>
                  <th className="px-6 py-4">Paid Amount</th>
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
                      <td className={invoiceAmountCellClass("totalAmount")}>
                        <span className="flex items-center gap-0.5">
                          <IndianRupee size={14} />
                          {formatCurrency(inv.totalAmount)}
                        </span>
                      </td>
                      <td className={invoiceAmountCellClass("feesAmount")}>
                        <span className="flex items-center gap-0.5">
                          <IndianRupee size={14} />
                          {formatCurrency(inv.feesAmount)}
                        </span>
                      </td>
                      <td className={invoiceAmountCellClass("gstAmount")}>
                        <span className="flex items-center gap-0.5">
                          <IndianRupee size={14} />
                          {formatCurrency(inv.gstAmount)}
                        </span>
                      </td>
                      <td className={invoiceAmountCellClass("totalPaidAmount")}>
                        <span className="flex items-center gap-0.5">
                          <IndianRupee size={14} />
                          {formatCurrency(inv.totalPaidAmount)}
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
                              setTimeout(() => handleDownloadPdf(), 300);
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
                    <td colSpan={10} className="px-6 py-12 text-center text-gray-400">
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
            <div className="flex-1 overflow-y-auto p-4 bg-white print:p-0">
              {/* Outer Tally Border Wrapper */}
              <div id="invoice-printable-area" className="border-[1.5px] border-black text-black font-mono text-[11px] leading-tight bg-white">

                {/* === TOP: Logo + Company Name side by side === */}
                <div className="flex items-center gap-2 px-3 py-2 border-b border-black bg-white">
                  <img
                    src="/F-LOGO--RED.png"
                    alt="FinTrade Logo"
                    style={{ width: "160px", height: "56px", objectFit: "contain", display: "block", flexShrink: 0 }}
                  />
                  <div className="border-l border-gray-300 pl-2">
                    <div className="font-bold text-sm uppercase tracking-wide leading-tight">FT EDUTECH</div>
                    <div className="text-[9px] text-gray-500 uppercase tracking-widest">Professional Trading Education</div>
                  </div>
                </div>

                {/* === TAX INVOICE Title === */}
                <div className="text-center font-bold text-sm border-b border-black py-1.5 uppercase tracking-wide bg-gray-50">
                  Tax Invoice
                </div>

                {/* Header Row: Invoice details (no company address here) */}
                <div className="grid grid-cols-2 border-b border-black">
                  {/* Left Column: Buyer info */}
                  <div className="p-3 border-r border-black space-y-1">
                    <span className="text-[9px] text-gray-500 block uppercase">Buyer (Billed to)</span>
                    <div className="font-bold text-xs">{userName}</div>
                    <p className="text-gray-700">{userEmail}</p>
                    <p className="text-gray-700">Student ID: FT-ST-29402</p>
                  </div>

                  {/* Right Column: Invoice info */}
                  <div className="grid grid-cols-2 divide-x divide-y divide-black font-medium">
                    <div className="p-2 col-span-2">
                      <span className="text-[9px] text-gray-500 block uppercase">Invoice No.</span>
                      <span className="font-bold">{selectedInvoice.invoiceNumber}</span>
                    </div>
                    <div className="p-2">
                      <span className="text-[9px] text-gray-500 block uppercase">Dated</span>
                      <span className="font-bold">{selectedInvoice.purchaseDate}</span>
                    </div>
                    <div className="p-2">
                      <span className="text-[9px] text-gray-500 block uppercase">Mode/Terms of Payment</span>
                      <span className="font-bold">{selectedInvoice.paymentMethod}</span>
                    </div>
                    <div className="p-2 col-span-2 border-b-0">
                      <span className="text-[9px] text-gray-500 block uppercase">Transaction ID</span>
                      <span className="font-mono font-bold text-[10px] break-all">{selectedInvoice.paymentId}</span>
                    </div>
                  </div>
                </div>

                {/* Status Row */}
                <div className="grid grid-cols-2 border-b border-black">
                  <div className="p-2 border-r border-black">
                    <span className="text-[9px] text-gray-500 block uppercase">Status</span>
                    <span className="font-bold text-green-700">{selectedInvoice.status.toUpperCase()}</span>
                  </div>
                  <div className="p-2">
                    <span className="text-[9px] text-gray-500 block uppercase">Place of Supply</span>
                    <span className="font-bold">Ahmedabad</span>
                  </div>
                </div>

                {/* Item Table */}
                <table className="w-full text-left border-collapse border-b border-black">
                  <thead>
                    <tr className="border-b border-black bg-gray-50 font-bold text-[10px] uppercase text-gray-700">
                      <th className="border-r border-black p-2 text-center w-[8%]">Sl No.</th>
                      <th className="border-r border-black p-2 w-[52%]">Description of Goods</th>
                      <th className="border-r border-black p-2 text-center w-[12%]">HSN/SAC</th>
                      <th className="border-r border-black p-2 text-right w-[14%]">Rate</th>
                      <th className="p-2 text-right w-[14%]">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="align-top">
                      <td className="border-r border-black p-2 text-center font-bold">1</td>
                      <td className="border-r border-black p-2">
                        <span className="font-bold">{selectedInvoice.courseTitle}</span>
                        <div className="text-[9px] text-gray-500 leading-normal mt-0.5">
                          Professional Trading Program - Lifetime Access &amp; Mentor Support
                        </div>
                      </td>
                      <td className="border-r border-black p-2 text-center">9992</td>
                      <td className="border-r border-black p-2 text-right">
                        ₹{formatCurrency(selectedInvoice.originalPrice)}
                      </td>
                      <td className="p-2 text-right font-bold">
                        ₹{formatCurrency(selectedInvoice.originalPrice)}
                      </td>
                    </tr>
                    <tr className="h-8">
                      <td className="border-r border-black"></td>
                      <td className="border-r border-black"></td>
                      <td className="border-r border-black"></td>
                      <td className="border-r border-black"></td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>

                {/* Tax Totals + Declaration */}
                <div className="grid grid-cols-2 divide-x divide-black">
                  <div className="p-3 flex flex-col justify-between space-y-3">
                    <div>
                      <span className="text-[9px] text-gray-500 block uppercase mb-1">Declaration</span>
                      <p className="text-[9px] text-gray-600 leading-relaxed font-sans font-normal">
                        We declare that this invoice shows the actual price of the goods or services described and that all particulars are true and correct.
                      </p>
                    </div>
                    <div className="text-[9px] text-gray-400 font-sans italic border-t border-gray-200 pt-2 text-center">
                      This is a computer-generated tax invoice.
                    </div>
                  </div>
                  <div className="p-3 space-y-1.5 font-bold">
                    <div className="flex justify-between">
                      <span className="font-normal text-gray-600">Base Course Fee</span>
                      <span>₹{formatCurrency(selectedInvoice.originalPrice)}</span>
                    </div>
                    {selectedInvoice.couponCode && selectedInvoice.discountAmount && selectedInvoice.discountAmount > 0 ? (
                      <div className="flex justify-between text-green-700">
                        <span className="font-normal">Discount ({selectedInvoice.couponCode})</span>
                        <span>-₹{formatCurrency(selectedInvoice.discountAmount)}</span>
                      </div>
                    ) : null}
                    <div className="flex justify-between border-t border-gray-200 pt-1">
                      <span className="font-normal text-gray-600">Taxable Subtotal</span>
                      <span>₹{formatCurrency(calculateBreakdown(selectedInvoice).subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-normal text-gray-600">Integrated GST (18%)</span>
                      <span>₹{formatCurrency(calculateBreakdown(selectedInvoice).gstAmount)}</span>
                    </div>
                    <div className="flex justify-between border-t-2 border-black pt-1.5 text-[#0B2A5B]">
                      <span>Total Paid Amount</span>
                      <span className="text-sm">₹{formatCurrency(calculateBreakdown(selectedInvoice).total)}</span>
                    </div>
                  </div>
                </div>

                {/* Signatory Row */}
                <div className="grid grid-cols-2 border-t border-black divide-x divide-black text-center text-[10px] font-bold">
                  <div className="p-3 h-12 flex items-end justify-center">
                    <span className="text-gray-400 font-sans font-normal text-[9px]">Buyer's Signature</span>
                  </div>
                  <div className="p-3 h-12 flex flex-col justify-between">
                    <span>for FT EDUTECH</span>
                    <span className="text-[8px] text-gray-500 uppercase tracking-wider font-normal">Authorized Signatory</span>
                  </div>
                </div>

                {/* === BOTTOM: Company Address Footer === */}
                <div className="border-t border-black text-center py-2 px-4 bg-gray-50 text-[9px] text-gray-600 space-y-0.5">
                  <div className="font-bold text-[10px] text-black">FT EDUTECH</div>
                  <div>10th Floor, Shivalik Complex, Nr. Panchvati Circle, Opp. Bank of Baroda, Ambawadi, Ahmedabad, Gujarat - 380006</div>
                  <div className="font-bold">GSTIN: 24AALFF2921N1Z9 &nbsp;|&nbsp; accounts@thefintrade.com</div>
                </div>

              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-2 print:hidden">
              <Button size="sm" variant="ghost" onClick={() => setSelectedInvoice(null)} className="text-gray-500 hover:bg-gray-100">
                Cancel
              </Button>
              <Button size="sm" onClick={handleDownloadPdf} className="bg-[#0B2A5B] hover:bg-[#1a3d7a] text-white">
                Save PDF
              </Button>
            </div>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}
