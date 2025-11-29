import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, TrendingUp } from "lucide-react";
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

export function NetworkMonitor() {
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
          ...prev.slice(0, 99),
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

  const getStatusBadge = (status: number) => {
    if (status >= 200 && status < 300) {
      return <Badge className="bg-green-500">{status}</Badge>;
    } else if (status >= 400 && status < 500) {
      return <Badge variant="destructive">{status}</Badge>;
    } else if (status >= 500) {
      return <Badge variant="destructive">{status}</Badge>;
    }
    return <Badge variant="outline">{status}</Badge>;
  };

  const getMethodBadge = (method: string) => {
    const colors: Record<string, string> = {
      GET: "bg-blue-500",
      POST: "bg-green-500",
      PUT: "bg-yellow-500",
      DELETE: "bg-red-500",
      PATCH: "bg-purple-500",
    };
    return <Badge className={colors[method] || "bg-gray-500"}>{method}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Network Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              إجمالي الطلبات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">في آخر ساعة</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              طلبات ناجحة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats.successful}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.total > 0 ? `${((stats.successful / stats.total) * 100).toFixed(1)}%` : "0%"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-500" />
              طلبات فاشلة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{stats.failed}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.total > 0 ? `${((stats.failed / stats.total) * 100).toFixed(1)}%` : "0%"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4" />
              متوسط الوقت
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgDuration}ms</div>
            <p className="text-xs text-muted-foreground mt-1">زمن الاستجابة</p>
          </CardContent>
        </Card>
      </div>

      {/* Request List */}
      <Card>
        <CardHeader>
          <CardTitle>طلبات الشبكة الأخيرة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {requests.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">
                لا توجد طلبات شبكة مسجلة
              </p>
            ) : (
              requests.slice(0, 20).map((request) => (
                <div
                  key={`request-${request.timestamp}-${request.url}`}
                  className="border rounded-lg p-3 space-y-2 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getMethodBadge(request.method)}
                      {getStatusBadge(request.status)}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {request.duration}ms
                    </span>
                  </div>
                  <div className="text-sm font-mono break-all">
                    {request.url}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(request.timestamp).toLocaleTimeString('ar-SA')}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
