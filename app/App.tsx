import { RouterProvider } from "react-router";
import { Toaster } from "sonner";
import { router } from "./routes";
import { useEffect } from "react";
import { installPopupOverrides } from "./utils/popup";

export default function App() {
  useEffect(() => {
    installPopupOverrides();

    // Extract referral code if present in the URL query parameters
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get("ref");
    if (refCode) {
      localStorage.setItem("distributor_code", refCode);
      console.log("Captured distributor referral code:", refCode);
    }
  }, []);

  return (
    <>
      <Toaster position="top-right" richColors />
      <RouterProvider router={router} />
    </>
  );
}
