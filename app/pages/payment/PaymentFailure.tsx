import React from "react";
import { Link, useLocation } from "react-router";
import { XCircle } from "lucide-react";

export default function PaymentFailure() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const txnid = searchParams.get("txnid");

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col items-center justify-center p-6">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border-t-4 border-red-500">
        <XCircle className="mx-auto text-red-500 mb-6" size={64} />
        <h1 className="text-3xl font-bold text-[#0B2A5B] mb-2">Payment Failed</h1>
        <p className="text-gray-600 mb-6">
          Unfortunately, your payment could not be processed at this time.
        </p>
        
        {txnid && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-100">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Transaction ID</p>
            <p className="text-sm font-mono text-[#0B2A5B] font-medium break-all">{txnid}</p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <button
            onClick={() => window.history.back()}
            className="w-full bg-[#0B2A5B] hover:bg-[#071d42] text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-lg shadow-blue-900/20"
          >
            Try Again
          </button>
          
          <Link
            to="/student/courses"
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            View Courses
          </Link>
        </div>
      </div>
    </div>
  );
}
