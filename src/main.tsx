import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { checkAndUpdateVersion } from "./lib/versionCheck";
import { unregisterAllServiceWorkers } from "./lib/sw-cleanup";

const rootElement = document.getElementById("root")!;

// إزالة شاشة التحميل الأولية
const loadingElement = document.getElementById("app-loading");
if (loadingElement) {
  loadingElement.remove();
}

// ❌ إزالة جميع Service Workers فوراً (PWA معطّل)
unregisterAllServiceWorkers().then(wasUnregistered => {
  if (wasUnregistered) {
    console.log('✅ تم حذف Service Workers القديمة - يُنصح بتحديث الصفحة');
  }
}).catch(console.error);

// فحص الإصدار وتنظيف الكاش إذا لزم الأمر (غير معطل للتطبيق)
checkAndUpdateVersion().catch(console.error);

// عرض التطبيق فوراً لتحسين FCP
rootElement.innerHTML = '';
createRoot(rootElement).render(<App />);

// تهيئة أدوات التصحيح ومراقبة الأداء بعد العرض الأولي (non-blocking)
requestIdleCallback(() => {
  import('./lib/debugTools').then(({ initDebugTools }) => initDebugTools());
  import('./lib/monitoring/web-vitals').then(({ initWebVitals }) => initWebVitals());
  import('./lib/imageOptimization').then(({ optimizeLCP }) => optimizeLCP());
}, { timeout: 2000 });
