import React from "react";
import { Link, useLocation } from "react-router";
import { CheckCircle, Download } from "lucide-react";

export default function PaymentSuccess() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const txnid = searchParams.get("txnid");

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col items-center justify-center p-6">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border-t-4 border-green-500">
        <CheckCircle className="mx-auto text-green-500 mb-6" size={64} />
        <h1 className="text-3xl font-bold text-[#0B2A5B] mb-2">Payment Successful!</h1>
        <p className="text-gray-600 mb-6">
          Thank you for your purchase. Your payment has been processed successfully.
        </p>
        
        {txnid && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-100">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Transaction ID</p>
            <p className="text-sm font-mono text-[#0B2A5B] font-medium break-all">{txnid}</p>
          </div>
        )}

        <div className="text-sm text-gray-500 mb-8 bg-blue-50/50 p-4 rounded-lg">
          Please note: Your course access will be unlocked shortly as we verify the payment. Check your email for the invoice.
        </div>

        <div className="flex flex-col gap-3">
          <Link
            to="/student/dashboard"
            className="block w-full bg-[#D50032] hover:bg-[#b00029] text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-lg shadow-red-500/20 text-center"
          >
            Go to Dashboard
          </Link>
          <Link
            to="/student/invoice"
            className="block w-full border-2 border-[#0B2A5B] text-[#0B2A5B] hover:bg-[#0B2A5B]/5 font-bold py-3 px-6 rounded-lg transition-colors text-center flex items-center justify-center gap-2"
          >
            <Download size={18} />
            Download Invoice (PDF)
          </Link>
        </div>
      </div>
    </div>
  );
}
