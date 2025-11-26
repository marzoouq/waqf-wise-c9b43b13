import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initDebugTools } from "./lib/debugTools";
import { initWebVitals } from "./lib/monitoring/web-vitals";

// تهيئة أدوات التصحيح ومراقبة الأداء
initDebugTools();
initWebVitals();

const rootElement = document.getElementById("root")!;

// تنظيف كامل لـ root قبل render
rootElement.innerHTML = '';

// Remove loading spinner immediately when React mounts
const loadingElement = document.getElementById("app-loading");
if (loadingElement) {
  loadingElement.remove();
}

createRoot(rootElement).render(<App />);
