import { createRoot } from "react-dom/client";

// ✅ تحميل الخطوط بشكل متزامن مع font-display: swap (لا تحظر FCP + تمنع CLS)
import "@fontsource/cairo/400.css";
import "@fontsource/cairo/600.css";
import "@fontsource/cairo/700.css";

import App from "./App.tsx";
import "./index.css";
import { checkAndUpdateVersion, registerChunkErrorHandlers } from "./lib/versionCheck";

const rootElement = document.getElementById("root")!;

// إزالة شاشة التحميل الأولية
const loadingElement = document.getElementById("app-loading");
if (loadingElement) {
  loadingElement.remove();
}

// فحص الإصدار (بدون مسح الكاش - Vite يدير ذلك تلقائياً)
checkAndUpdateVersion().catch(console.error);

// تسجيل مستمعي أخطاء الـ Chunks
registerChunkErrorHandlers();

// عرض التطبيق فوراً لتحسين FCP
rootElement.innerHTML = '';
createRoot(rootElement).render(<App />);
