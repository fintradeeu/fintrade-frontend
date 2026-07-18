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

        setInvoices(generatedInvoices);
      })
      .catch((err) => {
        console.error("Failed to fetch invoices", err);
        setInvoices([]);
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
            <div className="flex-1 overflow-y-auto px-4 py-2 bg-white print:p-0">
              <div id="invoice-printable-area" className="bg-white text-gray-900 font-sans text-sm px-8 pt-4 pb-8 max-w-4xl mx-auto">
                {/* Header: Logo and Title */}
                <div className="flex justify-between items-start mb-10">
                  <div className="flex flex-col gap-1">
                    <img
                      src="/F-LOGO--RED.png"
                      alt="FinTrade Logo"
                      style={{ height: "48px", objectFit: "contain", display: "block" }}
                      className="mb-2"
                    />
                    <div className="font-bold text-[#0B2A5B] tracking-wide text-lg">FT EDUTECH</div>
                    <div className="text-gray-500 text-xs">Professional Trading Education</div>
                  </div>
                  <div className="text-right">
                    <h1 className="text-4xl font-light text-gray-300 tracking-wider mb-2">INVOICE</h1>
                    <div className="text-gray-600">
                      <span className="font-semibold text-gray-800">Invoice No:</span> {selectedInvoice.invoiceNumber}
                    </div>
                    <div className="text-gray-600">
                      <span className="font-semibold text-gray-800">Date:</span> {selectedInvoice.purchaseDate}
                    </div>
                  </div>
                </div>

                {/* Billing Info & Payment Details */}
                <div className="flex justify-between items-start border-t border-b border-gray-100 py-6 mb-8">
                  <div className="w-1/2 pr-4">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Billed To</h3>
                    <div className="font-semibold text-lg text-[#0B2A5B]">{userName}</div>
                    <div className="text-gray-600 mt-1">{userEmail}</div>
                    <div className="text-gray-500 text-xs mt-1">Student ID: FT-ST-29402</div>
                  </div>
                  <div className="w-1/2 pl-4 border-l border-gray-100">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Payment Details</h3>
                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                      <div className="text-gray-500">Status</div>
                      <div className="font-semibold text-emerald-600 text-right">{selectedInvoice.status.toUpperCase()}</div>
                      
                      <div className="text-gray-500">Method</div>
                      <div className="font-medium text-gray-800 text-right">{selectedInvoice.paymentMethod}</div>
                      
                      <div className="text-gray-500">Transaction ID</div>
                      <div className="font-mono text-xs text-gray-600 text-right truncate" title={selectedInvoice.paymentId}>
                        {selectedInvoice.paymentId}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Items Table */}
                <div className="mb-8">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b-2 border-gray-100">
                        <th className="py-3 font-semibold text-gray-500 text-xs uppercase w-[50%]">Description</th>
                        <th className="py-3 font-semibold text-gray-500 text-xs uppercase text-center w-[15%]">HSN/SAC</th>
                        <th className="py-3 font-semibold text-gray-500 text-xs uppercase text-right w-[15%]">Rate</th>
                        <th className="py-3 font-semibold text-gray-500 text-xs uppercase text-right w-[20%]">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      <tr>
                        <td className="py-4">
                          <div className="font-semibold text-[#0B2A5B] text-base">{selectedInvoice.courseTitle}</div>
                          <div className="text-xs text-gray-500 mt-1">Professional Trading Program - Lifetime Access & Mentor Support</div>
                        </td>
                        <td className="py-4 text-center text-gray-600">9992</td>
                        <td className="py-4 text-right text-gray-600">₹{formatCurrency(selectedInvoice.originalPrice)}</td>
                        <td className="py-4 text-right font-medium text-gray-800">₹{formatCurrency(selectedInvoice.originalPrice)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Totals section */}
                <div className="flex justify-between items-start">
                  {/* Left: Declaration */}
                  <div className="w-1/2 pr-12 text-xs text-gray-500 space-y-4">
                    <div>
                      <span className="font-bold text-gray-700 block mb-1">Declaration:</span>
                      We declare that this invoice shows the actual price of the goods or services described and that all particulars are true and correct.
                    </div>
                    <div className="italic text-gray-400">
                      This is a computer-generated tax invoice.
                    </div>
                  </div>

                  {/* Right: Calculations */}
                  <div className="w-1/2 bg-gray-50 rounded-xl p-5">
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between text-gray-600">
                        <span>Base Course Fee</span>
                        <span>₹{formatCurrency(selectedInvoice.originalPrice)}</span>
                      </div>
                      {selectedInvoice.couponCode && selectedInvoice.discountAmount && selectedInvoice.discountAmount > 0 ? (
                        <div className="flex justify-between text-emerald-600">
                          <span>Discount ({selectedInvoice.couponCode})</span>
                          <span>-₹{formatCurrency(selectedInvoice.discountAmount)}</span>
                        </div>
                      ) : null}
                      <div className="flex justify-between text-gray-600 pt-2 border-t border-gray-200">
                        <span>Taxable Subtotal</span>
                        <span>₹{formatCurrency(calculateBreakdown(selectedInvoice).subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Integrated GST (18%)</span>
                        <span>₹{formatCurrency(calculateBreakdown(selectedInvoice).gstAmount)}</span>
                      </div>
                      <div className="flex justify-between items-end pt-3 border-t border-gray-200 mt-2">
                        <span className="font-bold text-gray-800 text-base">Total Amount Paid</span>
                        <span className="font-bold text-[#D50032] text-xl">₹{formatCurrency(calculateBreakdown(selectedInvoice).total)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Address */}
                <div className="mt-16 pt-6 border-t border-gray-100 text-center text-xs text-gray-400 flex flex-col gap-1">
                  <div className="font-semibold text-gray-500">FT EDUTECH</div>
                  <div>10th Floor, Shivalik Complex, Nr. Panchvati Circle, Opp. Bank of Baroda, Ambawadi, Ahmedabad, Gujarat - 380006</div>
                  <div>GSTIN: 24AALFF2921N1Z9 &nbsp;|&nbsp; accounts@thefintrade.com</div>
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
