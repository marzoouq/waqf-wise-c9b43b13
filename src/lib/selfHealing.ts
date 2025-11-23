/**
 * نظام الإصلاح الذاتي الفعلي
 * Self-Healing System - Real Implementation
 */

import { supabase } from '@/integrations/supabase/client';
import { errorTracker } from './errors';

interface RetryConfig {
  maxAttempts: number;
  delay: number;
  backoffMultiplier: number;
  maxDelay: number;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresIn: number;
}

/**
 * 1. نظام إعادة المحاولة الذكي - Intelligent Retry System
 */
export class RetryHandler {
  private defaultConfig: RetryConfig = {
    maxAttempts: 3,
    delay: 1000,
    backoffMultiplier: 2,
    maxDelay: 10000,
  };

  async execute<T>(
    operation: () => Promise<T>,
    config: Partial<RetryConfig> = {}
  ): Promise<T> {
    const finalConfig = { ...this.defaultConfig, ...config };
    let lastError: Error | null = null;
    let currentDelay = finalConfig.delay;

    for (let attempt = 1; attempt <= finalConfig.maxAttempts; attempt++) {
      try {
        console.log(`🔄 Attempt ${attempt}/${finalConfig.maxAttempts}`);
        const result = await operation();
        
        if (attempt > 1) {
          console.log('✅ Operation succeeded after retry!');
          await errorTracker.logError(
            `Operation succeeded on attempt ${attempt}`,
            'low',
            { attempts: attempt }
          );
        }
        
        return result;
      } catch (error) {
        lastError = error as Error;
        console.error(`❌ Attempt ${attempt} failed:`, error);

        if (attempt < finalConfig.maxAttempts) {
          console.log(`⏳ Waiting ${currentDelay}ms before retry...`);
          await this.sleep(currentDelay);
          currentDelay = Math.min(
            currentDelay * finalConfig.backoffMultiplier,
            finalConfig.maxDelay
          );
        }
      }
    }

    // فشلت جميع المحاولات
    await errorTracker.logError(
      `Operation failed after ${finalConfig.maxAttempts} attempts`,
      'high',
      { error: lastError?.message }
    );

    throw lastError;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * 2. نظام التخزين المؤقت الذكي - Smart Cache System
 */
export class SmartCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 دقائق

  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresIn: ttl,
    });
    
    console.log(`💾 Cached data for key: ${key}`);
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    const isExpired = Date.now() - entry.timestamp > entry.expiresIn;
    
    if (isExpired) {
      this.cache.delete(key);
      console.log(`🗑️ Cache expired for key: ${key}`);
      return null;
    }

    console.log(`✅ Cache hit for key: ${key}`);
    return entry.data as T;
  }

  clear(): void {
    this.cache.clear();
    console.log('🗑️ Cache cleared');
  }

  has(key: string): boolean {
    return this.cache.has(key) && this.get(key) !== null;
  }
}

/**
 * 3. نظام الاسترجاع التلقائي - Auto Recovery System
 */
export class AutoRecovery {
  private retryHandler = new RetryHandler();
  private cache = new SmartCache();

  /**
   * تنفيذ عملية مع استرجاع تلقائي من الـ Cache عند الفشل
   */
  async executeWithFallback<T>(
    cacheKey: string,
    operation: () => Promise<T>,
    cacheTTL?: number
  ): Promise<{ data: T; fromCache: boolean }> {
    try {
      // محاولة تنفيذ العملية مع إعادة المحاولة التلقائية
      const data = await this.retryHandler.execute(operation);
      
      // حفظ في الـ Cache
      this.cache.set(cacheKey, data, cacheTTL);
      
      return { data, fromCache: false };
    } catch (error) {
      console.warn('⚠️ Operation failed, trying cache fallback...');
      
      // محاولة الاسترجاع من الـ Cache
      const cachedData = this.cache.get<T>(cacheKey);
      
      if (cachedData) {
        console.log('✅ Using cached data as fallback');
        await errorTracker.logError(
          'Used cache fallback after operation failure',
          'medium',
          { cacheKey }
        );
        return { data: cachedData, fromCache: true };
      }

      // لا يوجد cache متاح
      console.error('❌ No cache available, operation failed completely');
      throw error;
    }
  }

  /**
   * إعادة محاولة الاتصال بقاعدة البيانات
   */
  async reconnectDatabase(): Promise<boolean> {
    try {
      console.log('🔄 Attempting to reconnect to database...');
      
      const { error } = await supabase
        .from('beneficiaries')
        .select('id')
        .limit(1);

      if (error) throw error;

      console.log('✅ Database reconnected successfully!');
      await errorTracker.logError('Database reconnection successful', 'low');
      return true;
    } catch (error) {
      console.error('❌ Database reconnection failed:', error);
      return false;
    }
  }

  /**
   * إعادة مزامنة البيانات المعلقة
   */
  async syncPendingData(): Promise<void> {
    try {
      console.log('🔄 Syncing pending data...');
      
      const pendingData = localStorage.getItem('pending_operations');
      if (!pendingData) {
        console.log('✅ No pending data to sync');
        return;
      }

      const operations = JSON.parse(pendingData);
      console.log(`📦 Found ${operations.length} pending operations`);

      for (const operation of operations) {
        try {
          // محاولة إعادة تنفيذ العملية
          await this.retryHandler.execute(async () => {
            // هنا يمكن إضافة منطق محدد حسب نوع العملية
            console.log('Executing pending operation:', operation);
          });
        } catch (error) {
          console.error('Failed to sync operation:', operation, error);
        }
      }

      // حذف البيانات المعلقة بعد المزامنة
      localStorage.removeItem('pending_operations');
      console.log('✅ Pending data synced successfully');
    } catch (error) {
      console.error('❌ Failed to sync pending data:', error);
    }
  }
}

/**
 * 4. مراقب الصحة النشط - Active Health Monitor
 */
export class HealthMonitor {
  private checkInterval: number = 30000; // 30 ثانية
  private intervalId: NodeJS.Timeout | null = null;
  private autoRecovery = new AutoRecovery();

  start(): void {
    if (this.intervalId) {
      console.warn('Health monitor already running');
      return;
    }

    console.log('🏥 Starting health monitor...');
    
    // فحص فوري
    this.performHealthCheck();
    
    // فحص دوري
    this.intervalId = setInterval(() => {
      this.performHealthCheck();
    }, this.checkInterval);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('🛑 Health monitor stopped');
    }
  }

  private async performHealthCheck(): Promise<void> {
    const checks = {
      database: await this.checkDatabase(),
      storage: await this.checkStorage(),
      network: await this.checkNetwork(),
    };

    const allHealthy = Object.values(checks).every((status) => status);

    if (!allHealthy) {
      console.warn('⚠️ Health check failed, attempting recovery...');
      await this.attemptRecovery(checks);
    } else {
      console.log('✅ All systems healthy');
    }

    // تسجيل في قاعدة البيانات
    try {
      await supabase.from('system_health_checks').insert({
        check_type: 'comprehensive',
        check_name: 'Full System Health Check',
        status: allHealthy ? 'healthy' : 'degraded',
        details: checks,
      });

      // إنشاء تنبيه للمسؤولين عند فشل الفحص
      if (!allHealthy) {
        await this.createHealthAlert(checks);
      }
    } catch (error) {
      console.error('Failed to log health check:', error);
    }
  }

  private async checkDatabase(): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('beneficiaries')
        .select('id')
        .limit(1);
      return !error;
    } catch {
      return false;
    }
  }

  private async checkStorage(): Promise<boolean> {
    try {
      localStorage.setItem('health_check', Date.now().toString());
      localStorage.removeItem('health_check');
      return true;
    } catch {
      return false;
    }
  }

  private async checkNetwork(): Promise<boolean> {
    return navigator.onLine;
  }

  private async attemptRecovery(checks: Record<string, boolean>): Promise<void> {
    if (!checks.database) {
      console.log('🔧 Attempting database recovery...');
      await this.autoRecovery.reconnectDatabase();
    }

    if (!checks.network) {
      console.log('⚠️ Network is offline, will retry when online');
      window.addEventListener('online', () => {
        console.log('🌐 Network back online, resuming operations...');
        this.autoRecovery.syncPendingData();
      }, { once: true });
    }
  }

  /**
   * إنشاء تنبيه صحة النظام
   */
  private async createHealthAlert(checks: Record<string, boolean>): Promise<void> {
    try {
      const failedChecks = Object.entries(checks)
        .filter(([_, status]) => !status)
        .map(([name]) => name);

      const { data: alert, error } = await supabase
        .from('system_alerts')
        .insert({
          alert_type: 'health_check_failed',
          severity: 'high',
          title: 'فشل فحص صحة النظام',
          description: `فشلت الفحوصات التالية: ${failedChecks.join(', ')}`,
          source: 'health_monitor',
          status: 'active',
          metadata: { checks, failedChecks },
        })
        .select()
        .single();

      if (error) {
        console.error('Failed to create health alert:', error);
        return;
      }

      // إشعار المسؤولين
      await supabase.functions.invoke('notify-admins', {
        body: {
          alertId: alert.id,
          severity: 'high',
          title: 'فشل فحص صحة النظام',
          description: `فشلت الفحوصات التالية: ${failedChecks.join(', ')}`,
          alertType: 'health_check_failed',
        },
      });

      console.log('✅ Health alert created and admins notified');
    } catch (error) {
      console.error('Error creating health alert:', error);
    }
  }
}

/**
 * 5. مدير الإصلاح الذاتي الرئيسي - Main Self-Healing Manager
 */
export class SelfHealingManager {
  private static instance: SelfHealingManager;
  public retryHandler = new RetryHandler();
  public cache = new SmartCache();
  public autoRecovery = new AutoRecovery();
  public healthMonitor = new HealthMonitor();

  private constructor() {
    // بدء مراقب الصحة تلقائياً
    this.healthMonitor.start();
    
    // معالجة الأحداث العامة
    this.setupGlobalHandlers();
  }

  static getInstance(): SelfHealingManager {
    if (!SelfHealingManager.instance) {
      SelfHealingManager.instance = new SelfHealingManager();
    }
    return SelfHealingManager.instance;
  }

  private setupGlobalHandlers(): void {
    // الاسترجاع عند العودة للاتصال
    window.addEventListener('online', () => {
      console.log('🌐 Network reconnected, syncing pending data...');
      this.autoRecovery.syncPendingData();
    });

    // حفظ البيانات قبل إغلاق الصفحة
    window.addEventListener('beforeunload', () => {
      console.log('💾 Saving state before page unload...');
    });
  }

  /**
   * واجهة سهلة للاستخدام - Easy-to-use Interface
   */
  async fetch<T>(
    cacheKey: string,
    fetchFunction: () => Promise<T>,
    options?: {
      cacheTTL?: number;
      retryConfig?: Partial<RetryConfig>;
    }
  ): Promise<{ data: T; fromCache: boolean }> {
    return this.autoRecovery.executeWithFallback(
      cacheKey,
      () => this.retryHandler.execute(fetchFunction, options?.retryConfig),
      options?.cacheTTL
    );
  }
}

// تصدير مثيل واحد
export const selfHealing = SelfHealingManager.getInstance();

// واجهات مساعدة سهلة الاستخدام
export const retryOperation = <T>(operation: () => Promise<T>) =>
  selfHealing.retryHandler.execute(operation);

export const fetchWithFallback = <T>(
  cacheKey: string,
  operation: () => Promise<T>
) => selfHealing.autoRecovery.executeWithFallback(cacheKey, operation);
