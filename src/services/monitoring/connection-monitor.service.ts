/**
 * Connection Monitor Service
 * خدمة مراقبة الاتصال الشاملة
 */

export interface ConnectionEvent {
  id: string;
  type: 'network' | 'api' | 'database' | 'edge_function' | 'websocket' | 'timeout';
  status: 'disconnected' | 'reconnected' | 'slow' | 'error';
  message: string;
  details?: string;
  timestamp: Date;
  duration?: number;
  url?: string;
  errorCode?: string;
}

export interface ConnectionStats {
  totalDisconnections: number;
  lastDisconnection: Date | null;
  averageDowntime: number;
  currentStatus: 'online' | 'offline' | 'degraded';
  eventsByType: Record<string, number>;
}

class ConnectionMonitorService {
  private events: ConnectionEvent[] = [];
  private listeners: Set<(event: ConnectionEvent) => void> = new Set();
  private statsListeners: Set<(stats: ConnectionStats) => void> = new Set();
  private isOnline: boolean = navigator.onLine;
  private lastOnlineTime: Date = new Date();
  private totalDowntime: number = 0;
  private disconnectionCount: number = 0;
  
  // وضع الاختبار - يُخفف المراقبة
  private testingMode: boolean = false;
  private performanceObserver: PerformanceObserver | null = null;

  constructor() {
    this.initializeNetworkListeners();
    this.initializePerformanceObserver();
  }

  /**
   * تفعيل/تعطيل وضع الاختبار
   */
  setTestingMode(enabled: boolean): void {
    this.testingMode = enabled;
    if (enabled) {
      // تعطيل PerformanceObserver أثناء الاختبار
      this.performanceObserver?.disconnect();
      console.log('[ConnectionMonitor] Testing mode enabled - reduced monitoring');
    } else {
      // إعادة تفعيل المراقبة
      this.initializePerformanceObserver();
      console.log('[ConnectionMonitor] Testing mode disabled - full monitoring');
    }
  }

  isInTestingMode(): boolean {
    return this.testingMode;
  }

  private initializeNetworkListeners(): void {
    window.addEventListener('online', () => {
      const downtime = this.isOnline ? 0 : Date.now() - this.lastOnlineTime.getTime();
      this.totalDowntime += downtime;
      this.isOnline = true;
      
      this.logEvent({
        type: 'network',
        status: 'reconnected',
        message: 'تم استعادة الاتصال بالإنترنت',
        details: downtime > 0 ? `مدة الانقطاع: ${Math.round(downtime / 1000)} ثانية` : undefined,
        duration: downtime,
      });
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.lastOnlineTime = new Date();
      this.disconnectionCount++;
      
      this.logEvent({
        type: 'network',
        status: 'disconnected',
        message: 'انقطع الاتصال بالإنترنت',
        details: 'تحقق من اتصال الشبكة المحلية أو مزود الخدمة',
      });
    });

    // مراقبة جودة الاتصال
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      connection?.addEventListener('change', () => {
        const effectiveType = connection.effectiveType;
        if (effectiveType === '2g' || effectiveType === 'slow-2g') {
          this.logEvent({
            type: 'network',
            status: 'slow',
            message: 'اتصال بطيء جداً',
            details: `نوع الاتصال: ${effectiveType} - سرعة تقديرية: ${connection.downlink} Mbps`,
          });
        }
      });
    }
  }

  private initializePerformanceObserver(): void {
    if ('PerformanceObserver' in window) {
      try {
        this.performanceObserver = new PerformanceObserver((list) => {
          // تجاهل المراقبة في وضع الاختبار
          if (this.testingMode) return;
          
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'resource') {
              const resourceEntry = entry as PerformanceResourceTiming;
              
              // تحقق من الطلبات الفاشلة أو البطيئة (رفع الحد إلى 15 ثانية)
              if (resourceEntry.duration > 15000) {
                this.logEvent({
                  type: 'api',
                  status: 'slow',
                  message: 'طلب بطيء جداً',
                  details: `المسار: ${resourceEntry.name}`,
                  duration: resourceEntry.duration,
                  url: resourceEntry.name,
                });
              }
            }
          }
        });
        
        this.performanceObserver.observe({ entryTypes: ['resource'] });
      } catch {
        // PerformanceObserver غير مدعوم
      }
    }
  }

  logEvent(eventData: Omit<ConnectionEvent, 'id' | 'timestamp'>): void {
    // في وضع الاختبار، تجاهل أحداث slow وبعض الأخطاء
    if (this.testingMode) {
      if (eventData.status === 'slow') return;
      // تقليل تسجيل الأخطاء في وضع الاختبار
      if (eventData.status === 'error' && this.events.length > 20) return;
    }
    
    const event: ConnectionEvent = {
      ...eventData,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    };

    this.events.unshift(event);
    
    // الاحتفاظ بآخر 100 حدث فقط (50 في وضع الاختبار)
    const maxEvents = this.testingMode ? 50 : 100;
    if (this.events.length > maxEvents) {
      this.events = this.events.slice(0, maxEvents);
    }

    // إشعار المستمعين (تقليل في وضع الاختبار)
    if (!this.testingMode || this.events.length % 5 === 0) {
      this.listeners.forEach(listener => listener(event));
      this.notifyStatsListeners();
    }
  }

  logApiError(url: string, status: number, message: string): void {
    const errorMessages: Record<number, string> = {
      0: 'فشل الاتصال بالخادم - تحقق من الاتصال بالإنترنت',
      401: 'انتهت صلاحية الجلسة - يرجى تسجيل الدخول مجدداً',
      403: 'غير مصرح بالوصول',
      404: 'المورد غير موجود',
      408: 'انتهت مهلة الطلب',
      429: 'طلبات كثيرة - يرجى الانتظار',
      500: 'خطأ في الخادم',
      502: 'بوابة غير صالحة - مشكلة في الخادم الوسيط',
      503: 'الخدمة غير متاحة مؤقتاً',
      504: 'انتهت مهلة البوابة',
    };

    this.logEvent({
      type: 'api',
      status: status === 0 ? 'disconnected' : 'error',
      message: errorMessages[status] || message,
      details: `الرابط: ${url}`,
      url,
      errorCode: status.toString(),
    });
  }

  logDatabaseError(operation: string, error: string): void {
    this.logEvent({
      type: 'database',
      status: 'error',
      message: `خطأ في قاعدة البيانات: ${operation}`,
      details: error,
    });
  }

  logEdgeFunctionError(functionName: string, error: string): void {
    this.logEvent({
      type: 'edge_function',
      status: 'error',
      message: `خطأ في الوظيفة: ${functionName}`,
      details: error,
    });
  }

  logTimeout(url: string, duration: number): void {
    this.logEvent({
      type: 'timeout',
      status: 'error',
      message: 'انتهت مهلة الطلب',
      details: `الرابط: ${url} - المدة: ${Math.round(duration / 1000)} ثانية`,
      url,
      duration,
    });
  }

  getEvents(): ConnectionEvent[] {
    return [...this.events];
  }

  getStats(): ConnectionStats {
    const eventsByType: Record<string, number> = {};
    this.events.forEach(event => {
      eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;
    });

    const disconnections = this.events.filter(e => e.status === 'disconnected' || e.status === 'error');

    return {
      totalDisconnections: disconnections.length,
      lastDisconnection: disconnections[0]?.timestamp || null,
      averageDowntime: this.disconnectionCount > 0 ? this.totalDowntime / this.disconnectionCount : 0,
      currentStatus: !this.isOnline ? 'offline' : 
                     this.events.some(e => e.status === 'slow' && Date.now() - e.timestamp.getTime() < 60000) ? 'degraded' : 'online',
      eventsByType,
    };
  }

  subscribe(listener: (event: ConnectionEvent) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  subscribeToStats(listener: (stats: ConnectionStats) => void): () => void {
    this.statsListeners.add(listener);
    return () => this.statsListeners.delete(listener);
  }

  private notifyStatsListeners(): void {
    const stats = this.getStats();
    this.statsListeners.forEach(listener => listener(stats));
  }

  clearEvents(): void {
    this.events = [];
    this.notifyStatsListeners();
  }
}

export const connectionMonitor = new ConnectionMonitorService();
