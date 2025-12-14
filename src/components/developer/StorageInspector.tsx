import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Database, HardDrive, Trash2, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { forceRefresh } from "@/lib/clearCache";

interface StorageItem {
  key: string;
  value: string;
  size: number;
}

export function StorageInspector() {
  const [localStorage, setLocalStorage] = useState<StorageItem[]>([]);
  const [sessionStorage, setSessionStorage] = useState<StorageItem[]>([]);

  const loadStorage = () => {
    // Load localStorage
    const localItems: StorageItem[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key) {
        const value = window.localStorage.getItem(key) || "";
        localItems.push({
          key,
          value,
          size: new Blob([value]).size,
        });
      }
    }
    setLocalStorage(localItems);

    // Load sessionStorage
    const sessionItems: StorageItem[] = [];
    for (let i = 0; i < window.sessionStorage.length; i++) {
      const key = window.sessionStorage.key(i);
      if (key) {
        const value = window.sessionStorage.getItem(key) || "";
        sessionItems.push({
          key,
          value,
          size: new Blob([value]).size,
        });
      }
    }
    setSessionStorage(sessionItems);
  };

  useEffect(() => {
    loadStorage();
  }, []);

  const clearStorage = (type: "local" | "session") => {
    if (type === "local") {
      window.localStorage.clear();
      toast.success("تم مسح localStorage");
    } else {
      window.sessionStorage.clear();
      toast.success("تم مسح sessionStorage");
    }
    loadStorage();
  };

  const cleanOldErrors = () => {
    try {
      const errorLogs = window.localStorage.getItem('error_logs');
      if (errorLogs) {
        interface ErrorEntry { timestamp: string; [key: string]: unknown }
        const errors: ErrorEntry[] = JSON.parse(errorLogs);
        const cutoffTime = Date.now() - (24 * 60 * 60 * 1000); // 24 ساعة
        const recentErrors = errors.filter((e) => {
          return new Date(e.timestamp).getTime() > cutoffTime;
        });
        
        window.localStorage.setItem('error_logs', JSON.stringify(recentErrors));
        loadStorage();
        toast.success(`تم حذف ${errors.length - recentErrors.length} خطأ قديم`);
      } else {
        toast.info("لا توجد أخطاء قديمة");
      }
    } catch (error) {
      toast.error("فشل تنظيف الأخطاء القديمة");
    }
  };

  const handleForceRefresh = async () => {
    toast.loading("جاري مسح الذاكرة المؤقتة...");
    try {
      await forceRefresh();
    } catch (error) {
      toast.error("حدث خطأ أثناء التحديث");
    }
  };

  const deleteItem = (key: string, type: "local" | "session") => {
    if (type === "local") {
      window.localStorage.removeItem(key);
    } else {
      window.sessionStorage.removeItem(key);
    }
    loadStorage();
    toast.success("تم حذف العنصر");
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const getTotalSize = (items: StorageItem[]) => {
    return items.reduce((sum, item) => sum + item.size, 0);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">لوحة تحكم المطور</h2>
          <p className="text-muted-foreground">
            أدوات متقدمة لمراقبة وتحليل أداء التطبيق
          </p>
        </div>
        <Button
          variant="outline"
          size="lg"
          onClick={handleForceRefresh}
          className="gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          تحديث إجباري
        </Button>
      </div>
      
      {/* Storage Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Database className="w-4 h-4" />
              localStorage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{localStorage.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatSize(getTotalSize(localStorage))}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <HardDrive className="w-4 h-4" />
              sessionStorage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessionStorage.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatSize(getTotalSize(sessionStorage))}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* localStorage Items */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>localStorage</CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={cleanOldErrors}
            >
              تنظيف الأخطاء القديمة
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => clearStorage("local")}
            >
              <Trash2 className="w-4 h-4 ms-2" />
              مسح الكل
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {localStorage.length === 0 ? (
              <p className="text-center py-4 text-muted-foreground">
                لا توجد عناصر في localStorage
              </p>
            ) : (
              localStorage.map((item) => (
                <div
                  key={item.key}
                  className="border rounded-lg p-3 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm">{item.key}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{formatSize(item.size)}</Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteItem(item.key, "local")}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <details className="text-xs">
                    <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                      عرض القيمة
                    </summary>
                    <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto">
                      {item.value.substring(0, 500)}
                      {item.value.length > 500 && "..."}
                    </pre>
                  </details>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* sessionStorage Items */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>sessionStorage</CardTitle>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => clearStorage("session")}
          >
            <Trash2 className="w-4 h-4 ms-2" />
            مسح الكل
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {sessionStorage.length === 0 ? (
              <p className="text-center py-4 text-muted-foreground">
                لا توجد عناصر في sessionStorage
              </p>
            ) : (
              sessionStorage.map((item) => (
                <div
                  key={item.key}
                  className="border rounded-lg p-3 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm">{item.key}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{formatSize(item.size)}</Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteItem(item.key, "session")}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <details className="text-xs">
                    <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                      عرض القيمة
                    </summary>
                    <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto">
                      {item.value.substring(0, 500)}
                      {item.value.length > 500 && "..."}
                    </pre>
                  </details>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
