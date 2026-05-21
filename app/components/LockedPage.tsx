import { Link } from "react-router";
import { Button } from "../components/ui/button";
import { Lock, ArrowLeft } from "lucide-react";

export default function LockedPage({ title }: { title: string }) {
  return (
    <div className="min-h-screen bg-[#F4F1EA] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6 bg-white p-10 rounded-2xl shadow-xl">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#0B2A5B]/5 text-[#0B2A5B] mb-4">
          <Lock size={40} />
        </div>
        <h1 className="text-3xl font-bold text-[#0B2A5B]">{title}</h1>
        <p className="text-gray-600 text-lg">
          This section is currently under development. Please check back later!
        </p>
        <div className="pt-6">
          <Link to="/">
            <Button className="bg-[#D50032] hover:bg-[#B30029] text-white w-full h-12 text-lg rounded-xl flex items-center justify-center gap-2">
              <ArrowLeft size={20} /> Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
