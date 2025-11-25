import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initDebugTools } from "./lib/debugTools";
import { initWebVitals } from "./lib/monitoring/web-vitals";

// تهيئة أدوات التصحيح ومراقبة الأداء
initDebugTools();
initWebVitals();

createRoot(document.getElementById("root")!).render(<App />);
