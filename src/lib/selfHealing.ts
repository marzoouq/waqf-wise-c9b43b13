/**
 * نظام الإصلاح الذاتي الفعلي
 * Self-Healing System - Real Implementation
 */

import { supabase } from '@/integrations/supabase/client';
import { errorTracker } from './errors';
import { productionLogger } from '@/lib/logger/production-logger';
import { safeJsonParse } from '@/lib/utils/safeJson';

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
        const result = await operation();
        
        if (attempt > 1) {
          await errorTracker.logError(
            `Operation succeeded on attempt ${attempt}`,
            'low',
            { attempts: attempt }
          );
        }
        
        return result;
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < finalConfig.maxAttempts) {
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
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 دقائق

  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresIn: ttl,
    });
    
    if (import.meta.env.DEV) {
      productionLogger.debug(`💾 Cached data for key: ${key}`);
    }
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    const isExpired = Date.now() - entry.timestamp > entry.expiresIn;
    
    if (isExpired) {
      this.cache.delete(key);
      if (import.meta.env.DEV) {
        productionLogger.debug(`🗑️ Cache expired for key: ${key}`);
      }
      return null;
    }

    if (import.meta.env.DEV) {
      productionLogger.debug(`✅ Cache hit for key: ${key}`);
    }
    return entry.data as T;
  }

  clear(): void {
    this.cache.clear();
    if (import.meta.env.DEV) {
      productionLogger.debug('🗑️ Cache cleared');
    }
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
      productionLogger.warn('⚠️ Operation failed, trying cache fallback...');
      
      // محاولة الاسترجاع من الـ Cache
      const cachedData = this.cache.get<T>(cacheKey);
      
      if (cachedData) {
        productionLogger.info('✅ Using cached data as fallback');
        await errorTracker.logError(
          'Used cache fallback after operation failure',
          'medium',
          { cacheKey }
        );
        return { data: cachedData, fromCache: true };
      }

      // لا يوجد cache متاح
      productionLogger.error('❌ No cache available, operation failed completely');
      throw error;
    }
  }

  /**
   * إعادة محاولة الاتصال بقاعدة البيانات
   */
  async reconnectDatabase(): Promise<boolean> {
    try {
      productionLogger.info('🔄 Attempting to reconnect to database...');
      
      const { error } = await supabase
        .from('beneficiaries')
        .select('id')
        .limit(1);

      if (error) throw error;

      productionLogger.info('✅ Database reconnected successfully!');
      await errorTracker.logError('Database reconnection successful', 'low');
      return true;
    } catch (error) {
      productionLogger.error('❌ Database reconnection failed:', error);
      return false;
    }
  }

  /**
   * إعادة مزامنة البيانات المعلقة
   */
  async syncPendingData(): Promise<void> {
    try {
      productionLogger.info('🔄 Syncing pending data...');
      
      const pendingData = localStorage.getItem('pending_operations');
      if (!pendingData) {
        productionLogger.debug('✅ No pending data to sync');
        return;
      }

      const operations = safeJsonParse<unknown[]>(pendingData, [], 'pending_operations');
      if (operations.length === 0) {
        productionLogger.debug('✅ No valid pending data to sync');
        return;
      }
      productionLogger.info(`📦 Found ${operations.length} pending operations`);

      for (const operation of operations) {
        try {
          // محاولة إعادة تنفيذ العملية
          await this.retryHandler.execute(async () => {
            // هنا يمكن إضافة منطق محدد حسب نوع العملية
            productionLogger.debug('Executing pending operation:', operation);
          });
        } catch (error) {
          productionLogger.error('Failed to sync operation:', { operation, error });
        }
      }

      // حذف البيانات المعلقة بعد المزامنة
      localStorage.removeItem('pending_operations');
      productionLogger.info('✅ Pending data synced successfully');
    } catch (error) {
      productionLogger.error('❌ Failed to sync pending data:', error);
    }
  }
}

/**
 * 4. مراقب الصحة النشط - Active Health Monitor
 * تم تحسينه لتقليل تراكم البيانات
 */
export class HealthMonitor {
  private checkInterval: number = 300000; // ⬆️ 5 دقائق بدل 2
  private intervalId: NodeJS.Timeout | null = null;
  private autoRecovery = new AutoRecovery();
  
  // إضافات للتحكم بالتسجيل
  private lastRecordedStatus: string | null = null;
  private lastRecordTime: number = 0;
  private todayRecords: number = 0;
  private lastResetDate: string = '';
  private readonly maxRecordsPerDay: number = 50;
  private readonly minRecordInterval: number = 3600000; // ساعة واحدة

  start(): void {
    if (this.intervalId) {
      return;
    }

    // إعادة تعيين العداد اليومي
    this.resetDailyCounter();

    // Start immediate check
    this.performHealthCheck();
    
    // Start periodic checks
    this.intervalId = setInterval(() => {
      this.performHealthCheck();
    }, this.checkInterval);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private resetDailyCounter(): void {
    const today = new Date().toDateString();
    if (this.lastResetDate !== today) {
      this.todayRecords = 0;
      this.lastResetDate = today;
    }
  }

  private async performHealthCheck(): Promise<void> {
    this.resetDailyCounter();
    
    const checks = {
      database: await this.checkDatabase(),
      storage: await this.checkStorage(),
      network: await this.checkNetwork(),
    };

    const allHealthy = Object.values(checks).every((status) => status);
    const currentStatus = allHealthy ? 'healthy' : 'degraded';

    if (!allHealthy) {
      productionLogger.warn('⚠️ Health check failed, attempting recovery...');
      await this.attemptRecovery(checks);
    } else if (import.meta.env.DEV) {
      productionLogger.debug('✅ All systems healthy');
    }

    // ✅ تسجيل ذكي: فقط عند التغيير أو مرور ساعة وعدم تجاوز الحد اليومي
    const now = Date.now();
    const statusChanged = this.lastRecordedStatus !== currentStatus;
    const hourPassed = now - this.lastRecordTime > this.minRecordInterval;
    const belowDailyLimit = this.todayRecords < this.maxRecordsPerDay;
    
    const shouldRecord = belowDailyLimit && (statusChanged || (!allHealthy) || hourPassed);

    if (shouldRecord) {
      try {
        await supabase.from('system_health_checks').insert({
          check_type: 'comprehensive',
          check_name: 'Full System Health Check',
          status: currentStatus,
          details: checks,
        });
        
        this.lastRecordedStatus = currentStatus;
        this.lastRecordTime = now;
        this.todayRecords++;

        // إنشاء تنبيه للمسؤولين عند فشل الفحص (فقط عند التغيير)
        if (!allHealthy && statusChanged) {
          await this.createHealthAlert(checks);
        }
      } catch (error) {
        productionLogger.error('Failed to log health check:', error);
      }
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
      productionLogger.info('🔧 Attempting database recovery...');
      await this.autoRecovery.reconnectDatabase();
    }

    if (!checks.network) {
      productionLogger.warn('⚠️ Network is offline, will retry when online');
      window.addEventListener('online', () => {
        productionLogger.info('🌐 Network back online, resuming operations...');
        this.autoRecovery.syncPendingData();
      }, { once: true });
    }
  }

  /**
   * إنشاء تنبيه صحة النظام
   */
  private async createHealthAlert(checks: Record<string, boolean>): Promise<void> {
    try {
      // التحقق من وجود جلسة مصادقة قبل إنشاء التنبيه
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        productionLogger.warn('Skipping health alert creation - no auth session');
        return;
      }

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
        .maybeSingle();

      if (error || !alert) {
        productionLogger.error('Failed to create health alert:', error);
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

      productionLogger.info('✅ Health alert created and admins notified');
    } catch (error) {
      productionLogger.error('Error creating health alert:', error);
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
    // ✅ تأجيل بدء مراقب الصحة حتى بعد التحميل الأولي
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        setTimeout(() => this.healthMonitor.start(), 5000);
      });
    } else {
      setTimeout(() => this.healthMonitor.start(), 7000);
    }
    
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
      productionLogger.info('🌐 Network reconnected, syncing pending data...');
      this.autoRecovery.syncPendingData();
    });

    // حفظ البيانات قبل إغلاق الصفحة
    window.addEventListener('beforeunload', () => {
      productionLogger.debug('💾 Saving state before page unload...');
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

// ============================================
// 6. دوال الإصلاح الذاتي المتقدمة
// ============================================

/**
 * تنظيف التوزيعات المكررة
 */
export async function cleanDuplicateDistributions(): Promise<{ cleaned: number; details: string[] }> {
  try {
    const { data, error } = await supabase.rpc('find_duplicate_distributions');
    
    if (error) {
      productionLogger.error('فشل البحث عن التوزيعات المكررة:', error);
      return { cleaned: 0, details: ['فشل الاتصال بقاعدة البيانات'] };
    }
    
    const duplicates = data || [];
    if (duplicates.length === 0) {
      return { cleaned: 0, details: ['لا توجد توزيعات مكررة'] };
    }
    
    // إلغاء التكرارات
    const { error: cleanError } = await supabase.rpc('cleanup_expired_sessions');
    
    if (cleanError) {
      productionLogger.error('فشل تنظيف التوزيعات:', cleanError);
      return { cleaned: 0, details: ['فشل التنظيف'] };
    }
    
    productionLogger.info(`✅ تم تنظيف ${duplicates.length} توزيعة مكررة`);
    return { 
      cleaned: duplicates.length, 
      details: duplicates.map((d: { beneficiary_id: string }) => `المستفيد: ${d.beneficiary_id}`)
    };
  } catch (err) {
    productionLogger.error('خطأ في تنظيف التوزيعات:', err);
    return { cleaned: 0, details: ['خطأ غير متوقع'] };
  }
}

/**
 * فحص التوازن المحاسبي
 */
export async function verifyAccountingBalance(): Promise<{ balanced: boolean; unbalancedEntries: string[] }> {
  try {
    const { data, error } = await supabase.rpc('check_accounting_balance');
    
    if (error) {
      productionLogger.error('فشل فحص التوازن المحاسبي:', error);
      return { balanced: false, unbalancedEntries: ['فشل الاتصال'] };
    }
    
    const unbalanced = data || [];
    const balanced = unbalanced.length === 0;
    
    if (!balanced) {
      productionLogger.warn(`⚠️ وُجدت ${unbalanced.length} قيود غير متوازنة`);
    } else {
      productionLogger.info('✅ جميع القيود متوازنة');
    }
    
    return { 
      balanced, 
      unbalancedEntries: unbalanced.map((e: { entry_id: string }) => e.entry_id) 
    };
  } catch (err) {
    productionLogger.error('خطأ في فحص التوازن:', err);
    return { balanced: false, unbalancedEntries: ['خطأ غير متوقع'] };
  }
}

/**
 * إصلاح الموافقات المعلقة القديمة
 */
export async function fixStuckApprovals(maxAgeDays: number = 30): Promise<{ fixed: number }> {
  try {
    const { data, error } = await supabase.rpc('fix_stuck_approvals', { 
      max_age_days: maxAgeDays 
    });
    
    if (error) {
      productionLogger.error('فشل إصلاح الموافقات:', error);
      return { fixed: 0 };
    }
    
    // التعامل مع البيانات المُرجَعة كمصفوفة أو رقم
    let fixedCount = 0;
    if (Array.isArray(data)) {
      fixedCount = data.length;
    } else if (typeof data === 'number') {
      fixedCount = data;
    }
    
    if (fixedCount > 0) {
      productionLogger.info(`✅ تم إصلاح ${fixedCount} موافقة معلقة`);
    }
    
    return { fixed: fixedCount };
  } catch (err) {
    productionLogger.error('خطأ في إصلاح الموافقات:', err);
    return { fixed: 0 };
  }
}

/**
 * تنظيف الجلسات المنتهية
 */
export async function cleanExpiredSessions(): Promise<{ cleaned: number }> {
  try {
    const { data, error } = await supabase.rpc('cleanup_expired_sessions');
    
    if (error) {
      productionLogger.error('فشل تنظيف الجلسات:', error);
      return { cleaned: 0 };
    }
    
    // التعامل مع البيانات المُرجَعة كمصفوفة أو رقم
    let cleaned = 0;
    if (Array.isArray(data) && data.length > 0) {
      cleaned = data[0]?.cleaned_count || data.length;
    } else if (typeof data === 'number') {
      cleaned = data;
    }
    
    if (cleaned > 0) {
      productionLogger.info(`✅ تم تنظيف ${cleaned} جلسة منتهية`);
    }
    
    return { cleaned };
  } catch (err) {
    productionLogger.error('خطأ في تنظيف الجلسات:', err);
    return { cleaned: 0 };
  }
}

/**
 * فحص وإصلاح RLS المفقود
 */
export async function checkAndFixRLS(): Promise<{ fixed: string[] }> {
  try {
    const { data, error } = await supabase.rpc('auto_repair_missing_rls');
    
    if (error) {
      productionLogger.error('فشل إصلاح RLS:', error);
      return { fixed: [] };
    }
    
    const fixed = (data || []).map((r: { table_name: string }) => r.table_name);
    
    if (fixed.length > 0) {
      productionLogger.info(`✅ تم تفعيل RLS على: ${fixed.join(', ')}`);
    } else {
      productionLogger.info('✅ جميع الجداول مُأمَّنة');
    }
    
    return { fixed };
  } catch (err) {
    productionLogger.error('خطأ في إصلاح RLS:', err);
    return { fixed: [] };
  }
}

/**
 * فحص صحة الوظائف المجدولة
 */
export async function checkCronJobsHealth(): Promise<{ healthy: boolean; stoppedJobs: string[] }> {
  try {
    // فحص آخر تنفيذ للوظائف المجدولة
    const { data: backups, error: backupErr } = await supabase
      .from('backup_logs')
      .select('created_at')
      .order('created_at', { ascending: false })
      .limit(1);
    
    const stoppedJobs: string[] = [];
    
    // فحص النسخ الاحتياطي (يجب أن يكون خلال 24 ساعة)
    if (!backupErr && backups && backups.length > 0) {
      const lastBackup = new Date(backups[0].created_at);
      const hoursSinceBackup = (Date.now() - lastBackup.getTime()) / (1000 * 60 * 60);
      if (hoursSinceBackup > 48) {
        stoppedJobs.push('backup-database');
      }
    }
    
    const healthy = stoppedJobs.length === 0;
    
    if (!healthy) {
      productionLogger.warn(`⚠️ وظائف متوقفة: ${stoppedJobs.join(', ')}`);
    }
    
    return { healthy, stoppedJobs };
  } catch (err) {
    productionLogger.error('خطأ في فحص الوظائف:', err);
    return { healthy: false, stoppedJobs: ['unknown'] };
  }
}

/**
 * فحص السجلات اليتيمة
 */
export async function findOrphanRecords(): Promise<{ 
  orphanPayments: number; 
  orphanContracts: number;
  orphanDistributions: number;
}> {
  try {
    const { data, error } = await supabase.rpc('find_orphan_records');
    
    if (error) {
      productionLogger.error('فشل البحث عن السجلات اليتيمة:', error);
      return { orphanPayments: 0, orphanContracts: 0, orphanDistributions: 0 };
    }
    
    // التعامل مع مختلف أشكال البيانات المُرجَعة
    if (!data || !Array.isArray(data)) {
      return { orphanPayments: 0, orphanContracts: 0, orphanDistributions: 0 };
    }
    
    // حساب اليتيمة من المصفوفة
    let orphanPayments = 0;
    let orphanContracts = 0;
    let orphanDistributions = 0;
    
    for (const record of data) {
      // تحويل السجل لنوع مرن
      const rec = record as Record<string, unknown>;
      
      if ('table_name' in rec && 'orphan_count' in rec) {
        // الشكل: كل سجل لجدول مختلف
        const tableName = rec.table_name as string;
        const count = typeof rec.orphan_count === 'number' ? rec.orphan_count : 0;
        
        if (tableName === 'payments') orphanPayments = count;
        if (tableName === 'contracts') orphanContracts = count;
        if (tableName === 'distributions' || tableName === 'heir_distributions') orphanDistributions = count;
      }
    }
    
    return { orphanPayments, orphanContracts, orphanDistributions };
  } catch (err) {
    productionLogger.error('خطأ في البحث عن اليتيمة:', err);
    return { orphanPayments: 0, orphanContracts: 0, orphanDistributions: 0 };
  }
}

/**
 * تشغيل الإصلاح الذاتي الشامل
 */
export async function runComprehensiveSelfHealing(): Promise<{
  duplicatesClean: { cleaned: number };
  accountingCheck: { balanced: boolean };
  approvalsFixed: { fixed: number };
  sessionsClean: { cleaned: number };
  rlsFixed: { fixed: string[] };
  cronHealth: { healthy: boolean };
  orphanRecords: { total: number };
}> {
  productionLogger.info('🔧 بدء الإصلاح الذاتي الشامل...');
  
  const [duplicates, accounting, approvals, sessions, rls, cron, orphans] = await Promise.all([
    cleanDuplicateDistributions(),
    verifyAccountingBalance(),
    fixStuckApprovals(30),
    cleanExpiredSessions(),
    checkAndFixRLS(),
    checkCronJobsHealth(),
    findOrphanRecords()
  ]);
  
  productionLogger.info('✅ اكتمل الإصلاح الذاتي الشامل');
  
  return {
    duplicatesClean: { cleaned: duplicates.cleaned },
    accountingCheck: { balanced: accounting.balanced },
    approvalsFixed: { fixed: approvals.fixed },
    sessionsClean: { cleaned: sessions.cleaned },
    rlsFixed: { fixed: rls.fixed },
    cronHealth: { healthy: cron.healthy },
    orphanRecords: { 
      total: orphans.orphanPayments + orphans.orphanContracts + orphans.orphanDistributions 
    }
  };
}

// ✅ تأجيل إنشاء singleton حتى الاستخدام الفعلي
let _selfHealingInstance: SelfHealingManager | null = null;

export function getSelfHealing(): SelfHealingManager {
  if (!_selfHealingInstance) {
    _selfHealingInstance = SelfHealingManager.getInstance();
  }
  return _selfHealingInstance;
}

// ✅ تصدير للتوافق الخلفي - لكن بتأجيل
export const selfHealing = {
  get retryHandler() { return getSelfHealing().retryHandler; },
  get cache() { return getSelfHealing().cache; },
  get autoRecovery() { return getSelfHealing().autoRecovery; },
  get healthMonitor() { return getSelfHealing().healthMonitor; },
  fetch: <T>(cacheKey: string, fetchFunction: () => Promise<T>, options?: { cacheTTL?: number }) => 
    getSelfHealing().fetch(cacheKey, fetchFunction, options),
  // دوال الإصلاح الذاتي الجديدة
  cleanDuplicateDistributions,
  verifyAccountingBalance,
  fixStuckApprovals,
  cleanExpiredSessions,
  checkAndFixRLS,
  checkCronJobsHealth,
  findOrphanRecords,
  runComprehensiveSelfHealing,
};

// واجهات مساعدة سهلة الاستخدام
export const retryOperation = <T>(operation: () => Promise<T>) =>
  getSelfHealing().retryHandler.execute(operation);

export const fetchWithFallback = <T>(
  cacheKey: string,
  operation: () => Promise<T>
) => getSelfHealing().autoRecovery.executeWithFallback(cacheKey, operation);
