import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./app/App.tsx";
import { GOOGLE_CLIENT_ID, isGoogleAuthConfigured } from "./app/config/googleAuth";
import "./styles/index.css";

const app = isGoogleAuthConfigured ? (
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <App />
  </GoogleOAuthProvider>
) : (
  <App />
);

createRoot(document.getElementById("root")!).render(app);
