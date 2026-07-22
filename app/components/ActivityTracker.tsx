import { useEffect } from "react";
import { useLocation } from "react-router";
import api from "../services/api";

export default function ActivityTracker() {
  const location = useLocation();

  useEffect(() => {
    // Only track if cookie consent is accepted (GDPR compliance)
    if (localStorage.getItem("cookie_consent") !== "accepted") {
      return;
    }

    const logPageView = async () => {
      try {
        const locationData = {
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        };

        await api.post("/logs/activity", {
          module: "NAVIGATION",
          action: "PAGE_VIEW",
          description: `User visited ${location.pathname}${location.search}`,
          status_code: 200,
          status_text: "SUCCESS",
          location_data: locationData,
          device_data: {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
          },
          metadata_json: {
            path: location.pathname,
            search: location.search,
            hash: location.hash,
            url: window.location.href,
          }
        });
      } catch (err) {
        // Silently fail activity logging to not disrupt user experience
        console.warn("Failed to log page view", err);
      }
    };

    logPageView();
  }, [location.pathname, location.search]);

  return null;
}
