import { useState, useEffect } from "react";

interface SystemHealth {
  overall: "healthy" | "warning" | "critical";
  score: number;
  database: boolean;
  storage: boolean;
  network: boolean;
  activeErrors: number;
  networkRequests: number;
}

export function usePerformanceMetrics() {
  const [vitals] = useState({
    lcp: null as number | null,
    fcp: null as number | null,
    cls: null as number | null,
  });
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    overall: "healthy",
    score: 100,
    database: true,
    storage: true,
    network: navigator.onLine,
    activeErrors: 0,
    networkRequests: 0,
  });

  useEffect(() => {
    const checkHealth = () => {
      let score = 100;
      let status: "healthy" | "warning" | "critical" = "healthy";

      // Check storage
      let storageHealth = true;
      try {
        localStorage.setItem("health_test", "ok");
        localStorage.removeItem("health_test");
      } catch {
        storageHealth = false;
        score -= 30;
      }

      // Check network
      const networkHealth = navigator.onLine;
      if (!networkHealth) {
        score -= 40;
      }

      // Check Web Vitals
      if (vitals.lcp && vitals.lcp > 2500) score -= 10;
      if (vitals.fcp && vitals.fcp > 1800) score -= 10;
      if (vitals.cls && vitals.cls > 0.1) score -= 10;

      // Determine overall status
      if (score >= 80) status = "healthy";
      else if (score >= 50) status = "warning";
      else status = "critical";

      setSystemHealth({
        overall: status,
        score: Math.max(0, score),
        database: true,
        storage: storageHealth,
        network: networkHealth,
        activeErrors: 0,
        networkRequests: 0,
      });
    };

    checkHealth();
    const interval = setInterval(checkHealth, 5000);

    return () => clearInterval(interval);
  }, [vitals]);

  return { systemHealth, vitals };
}
