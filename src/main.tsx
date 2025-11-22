import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initDebugTools } from "./lib/debugTools";

// تهيئة أدوات التصحيح
initDebugTools();

createRoot(document.getElementById("root")!).render(<App />);
