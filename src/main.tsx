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

// التحقق من الإصدار أولاً قبل أي عرض
checkAndForceUpdate().then((needsUpdate) => {
  if (!needsUpdate) {
    // الآن فقط - بعد التأكد من عدم وجود تحديث - نزيل الـ spinner ونعرض التطبيق
    rootElement.innerHTML = '';
    
    const loadingElement = document.getElementById("app-loading");
    if (loadingElement) {
      loadingElement.remove();
    }
    
    createRoot(rootElement).render(<App />);
  }
  // إذا needsUpdate = true، الصفحة ستُعاد تحميلها تلقائياً والـ spinner يبقى ظاهراً
});
