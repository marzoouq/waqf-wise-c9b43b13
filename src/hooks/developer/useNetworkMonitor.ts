import { useState, useEffect } from "react";

interface NetworkRequest {
  method: string;
  url: string;
  status: number;
  duration: number;
  timestamp: number;
}

interface NetworkStats {
  total: number;
  successful: number;
  failed: number;
  avgDuration: number;
}

export function useNetworkMonitor() {
  const [requests, setRequests] = useState<NetworkRequest[]>([]);

  useEffect(() => {
    const originalFetch = window.fetch;

    window.fetch = async (...args) => {
      const startTime = performance.now();
      const url = typeof args[0] === "string" ? args[0] : (args[0] as Request).url;
      const method = args[1]?.method || "GET";

      try {
        const response = await originalFetch(...args);
        const duration = performance.now() - startTime;

        setRequests((prev) => [
          {
            method,
            url,
            status: response.status,
            duration: Math.round(duration),
            timestamp: Date.now(),
          },
          ...prev.slice(0, 99), // Keep last 100 requests
        ]);

        return response;
      } catch (error) {
        const duration = performance.now() - startTime;

        setRequests((prev) => [
          {
            method,
            url,
            status: 0,
            duration: Math.round(duration),
            timestamp: Date.now(),
          },
          ...prev.slice(0, 99),
        ]);

        throw error;
      }
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  const stats: NetworkStats = {
    total: requests.length,
    successful: requests.filter((r) => r.status >= 200 && r.status < 300).length,
    failed: requests.filter((r) => r.status >= 400 || r.status === 0).length,
    avgDuration:
      requests.length > 0
        ? Math.round(
            requests.reduce((sum, r) => sum + r.duration, 0) / requests.length
          )
        : 0,
  };

  return { requests, stats };
}
