import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { AppearanceProvider } from "./lib/appearance";

// Suppress console logs in production unless explicitly enabled
if (
  import.meta.env &&
  import.meta.env.PROD &&
  !import.meta.env.VITE_ENABLE_DEBUG_LOGS
) {
  const noop = () => {};
  // Keep errors and warnings; silence info/debug/log
  console.log = noop;
  console.info = noop;
  console.debug = noop;
}

createRoot(document.getElementById("root")!).render(
  <AppearanceProvider>
    <App />
  </AppearanceProvider>
);
