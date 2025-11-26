import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initDebugTools } from "./lib/debugTools";
import { initWebVitals } from "./lib/monitoring/web-vitals";
import { checkAndForceUpdate } from "./lib/versionManager";

// تهيئة أدوات التصحيح ومراقبة الأداء
initDebugTools();
initWebVitals();

// تحسين LCP وتحسين الصور
if (typeof window !== 'undefined') {
  import('./lib/imageOptimization').then(({ optimizeLCP }) => {
    optimizeLCP();
  });
}

const rootElement = document.getElementById("root")!;

// تنظيف كامل لـ root قبل render
rootElement.innerHTML = '';

// Remove loading spinner immediately when React mounts
const loadingElement = document.getElementById("app-loading");
if (loadingElement) {
  loadingElement.remove();
}

// التحقق من الإصدار أولاً قبل render
checkAndForceUpdate().then((needsUpdate) => {
  if (!needsUpdate) {
    createRoot(rootElement).render(<App />);
  }
});
