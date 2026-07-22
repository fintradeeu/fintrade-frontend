import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Printer, Download, X } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "sonner";

export interface InvoiceModalProps {
  open: boolean;
  onClose: () => void;
  student: {
    id: number;
    full_name: string;
    email: string;
    phone?: string;
  };
  invoice: {
    invoiceNumber: string;
    purchaseDate: string;
    courseTitle: string;
    originalPrice: number;
    discountAmount?: number;
    amountPaid: number;
    paymentMethod: string;
    paymentId?: string;
    status?: string;
  };
}

export default function InvoiceModal({ open, onClose, student, invoice }: InvoiceModalProps) {
  if (!open || !student || !invoice) return null;

  const handleDownloadPdf = async () => {
    const element = document.getElementById("invoice-printable-area");
    if (!element) return;

    try {
      toast("Generating PDF...", { id: "pdf-toast" });
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Invoice_${invoice.invoiceNumber || "download"}.pdf`);
      toast.success("Invoice downloaded successfully!", { id: "pdf-toast" });
    } catch (err) {
      console.error("Failed to generate PDF:", err);
      toast.error("Failed to download PDF.", { id: "pdf-toast" });
    }
  };

  const formatCurrency = (val: number) => {
    return (val || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm print:absolute print:inset-0 print:p-0 print:bg-white print:z-[9999]">
      <Card className="w-full max-w-2xl bg-white shadow-2xl rounded-2xl overflow-hidden flex flex-col max-h-[90vh] print:shadow-none print:rounded-none print:max-h-full print:border-none">
        {/* Modal Top Bar */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-slate-50 print:hidden">
          <span className="font-bold text-[#0B2A5B]">Tax Invoice Summary</span>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => window.print()} className="border-slate-300 rounded-xl gap-1.5">
              <Printer size={14} /> Print
            </Button>
            <Button size="sm" onClick={handleDownloadPdf} className="bg-[#0B2A5B] hover:bg-[#1a3d7a] text-white rounded-xl gap-1.5">
              <Download size={14} /> Download PDF
            </Button>
            <button
              onClick={onClose}
              className="p-1 ml-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Invoice Printable Area */}
        <div className="flex-1 overflow-y-auto px-6 py-2 bg-white print:p-0 print:overflow-visible">
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
                  <span className="font-semibold text-gray-800">Invoice No:</span> {invoice.invoiceNumber}
                </div>
                <div className="text-gray-600">
                  <span className="font-semibold text-gray-800">Date:</span> {invoice.purchaseDate}
                </div>
              </div>
            </div>

            {/* Billing Info & Payment Details */}
            <div className="flex justify-between items-start border-t border-b border-gray-100 py-6 mb-8">
              <div className="w-1/2 pr-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">BILLED TO</h3>
                <div className="font-semibold text-lg text-[#0B2A5B]">{student.full_name}</div>
                <div className="text-gray-600 mt-1">{student.email}</div>
                <div className="text-gray-500 text-xs mt-1">Student ID: FT-ST-{student.id}</div>
              </div>
              <div className="w-1/2 pl-4 border-l border-gray-100">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">PAYMENT DETAILS</h3>
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <div className="text-gray-500">Status</div>
                  <div className="font-semibold text-emerald-600 text-right uppercase">
                    {invoice.status || "PAID"}
                  </div>

                  <div className="text-gray-500">Method</div>
                  <div className="font-medium text-gray-800 text-right">{invoice.paymentMethod || "Cash / Cheque / Online"}</div>

                  <div className="text-gray-500">Transaction ID</div>
                  <div className="font-mono text-xs text-gray-600 text-right truncate" title={invoice.paymentId}>
                    {invoice.paymentId || `TXN${Math.random().toString(36).substring(2, 10).toUpperCase()}`}
                  </div>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-8">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-100">
                    <th className="py-3 font-semibold text-gray-500 text-xs uppercase w-[70%]">DESCRIPTION</th>
                    <th className="py-3 font-semibold text-gray-500 text-xs uppercase text-right w-[30%]">AMOUNT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  <tr>
                    <td className="py-4">
                      <div className="font-semibold text-[#0B2A5B] text-base">{invoice.courseTitle}</div>
                      <div className="text-xs text-gray-500 mt-1">Professional Trading Program - Lifetime Access & Mentor Support</div>
                    </td>
                    <td className="py-4 text-right font-medium text-gray-800">₹{formatCurrency(invoice.originalPrice)}</td>
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
                  This is a computer-generated tax invoice and requires no signature.
                </div>
              </div>

              {/* Right: Calculations */}
              <div className="w-1/2 bg-gray-50 rounded-xl p-5">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Base Course Fee</span>
                    <span>₹{formatCurrency(invoice.originalPrice)}</span>
                  </div>
                  {invoice.discountAmount && invoice.discountAmount > 0 ? (
                    <div className="flex justify-between text-emerald-600">
                      <span>Discount</span>
                      <span>-₹{formatCurrency(invoice.discountAmount)}</span>
                    </div>
                  ) : null}
                  <div className="flex justify-between font-bold text-[#D50032] text-base pt-3 border-t border-gray-200">
                    <span>Total Amount Paid</span>
                    <span>₹{formatCurrency(invoice.amountPaid)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
