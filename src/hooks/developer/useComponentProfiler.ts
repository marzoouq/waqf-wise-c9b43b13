/**
 * أداة تحليل أداء المكونات في الوقت الحقيقي
 * تكشف المكونات البطيئة وتسربات الذاكرة
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { productionLogger } from '@/lib/logger/production-logger';

export interface ComponentProfile {
  name: string;
  renderCount: number;
  totalRenderTime: number;
  avgRenderTime: number;
  maxRenderTime: number;
  minRenderTime: number;
  lastRenderTime: number;
  lastRenderedAt: Date;
  mountCount: number;
  unmountCount: number;
  warnings: string[];
  status: 'healthy' | 'warning' | 'critical';
}

export interface ProfilerReport {
  totalComponents: number;
  healthyComponents: number;
  warningComponents: number;
  criticalComponents: number;
  slowestComponents: ComponentProfile[];
  mostRenderedComponents: ComponentProfile[];
  suspectedMemoryLeaks: string[];
  recommendations: string[];
}

// سجل المكونات
const componentRegistry = new Map<string, ComponentProfile>();
const RENDER_TIME_THRESHOLD = 16; // ms (1 frame)
const EXCESSIVE_RENDERS_THRESHOLD = 50;

// تسجيل بداية رسم مكون
export function startComponentRender(componentName: string): () => void {
  const startTime = performance.now();
  
  return () => {
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    const existing = componentRegistry.get(componentName);
    
    if (existing) {
      existing.renderCount++;
      existing.totalRenderTime += renderTime;
      existing.avgRenderTime = existing.totalRenderTime / existing.renderCount;
      existing.maxRenderTime = Math.max(existing.maxRenderTime, renderTime);
      existing.minRenderTime = Math.min(existing.minRenderTime, renderTime);
      existing.lastRenderTime = renderTime;
      existing.lastRenderedAt = new Date();
      
      // تحديث الحالة
      updateComponentStatus(existing);
    } else {
      const profile: ComponentProfile = {
        name: componentName,
        renderCount: 1,
        totalRenderTime: renderTime,
        avgRenderTime: renderTime,
        maxRenderTime: renderTime,
        minRenderTime: renderTime,
        lastRenderTime: renderTime,
        lastRenderedAt: new Date(),
        mountCount: 1,
        unmountCount: 0,
        warnings: [],
        status: 'healthy',
      };
      
      updateComponentStatus(profile);
      componentRegistry.set(componentName, profile);
    }
  };
}

// تسجيل تحميل مكون
export function registerComponentMount(componentName: string) {
  const existing = componentRegistry.get(componentName);
  if (existing) {
    existing.mountCount++;
  }
}

// تسجيل إزالة مكون
export function registerComponentUnmount(componentName: string) {
  const existing = componentRegistry.get(componentName);
  if (existing) {
    existing.unmountCount++;
  }
}

// تحديث حالة المكون
function updateComponentStatus(profile: ComponentProfile) {
  profile.warnings = [];
  
  // فحص وقت الرسم
  if (profile.avgRenderTime > RENDER_TIME_THRESHOLD * 2) {
    profile.warnings.push(`وقت رسم بطيء: ${profile.avgRenderTime.toFixed(1)}ms`);
  }
  
  // فحص عدد مرات الرسم
  if (profile.renderCount > EXCESSIVE_RENDERS_THRESHOLD) {
    profile.warnings.push(`عدد رسم مفرط: ${profile.renderCount}`);
  }
  
  // فحص تسرب الذاكرة المحتمل
  if (profile.mountCount > profile.unmountCount + 5) {
    profile.warnings.push('تسرب ذاكرة محتمل: مكونات لم تُزال');
  }
  
  // تحديد الحالة
  if (profile.warnings.length === 0) {
    profile.status = 'healthy';
  } else if (profile.avgRenderTime > RENDER_TIME_THRESHOLD * 5 || profile.renderCount > 100) {
    profile.status = 'critical';
  } else {
    profile.status = 'warning';
  }
}

export function useComponentProfiler(enabled: boolean = true) {
  const [profiles, setProfiles] = useState<ComponentProfile[]>([]);
  const [report, setReport] = useState<ProfilerReport | null>(null);
  const updateInterval = useRef<NodeJS.Timeout | null>(null);

  // تحديث البيانات
  const refreshProfiles = useCallback(() => {
    if (!enabled) return;
    setProfiles(Array.from(componentRegistry.values()));
  }, [enabled]);

  // إنشاء التقرير
  const generateReport = useCallback((): ProfilerReport => {
    const allProfiles = Array.from(componentRegistry.values());
    
    const healthyComponents = allProfiles.filter(p => p.status === 'healthy').length;
    const warningComponents = allProfiles.filter(p => p.status === 'warning').length;
    const criticalComponents = allProfiles.filter(p => p.status === 'critical').length;
    
    // أبطأ المكونات
    const slowestComponents = [...allProfiles]
      .sort((a, b) => b.avgRenderTime - a.avgRenderTime)
      .slice(0, 10);
    
    // المكونات الأكثر رسماً
    const mostRenderedComponents = [...allProfiles]
      .sort((a, b) => b.renderCount - a.renderCount)
      .slice(0, 10);
    
    // المكونات المشتبه بتسرب الذاكرة
    const suspectedMemoryLeaks = allProfiles
      .filter(p => p.mountCount > p.unmountCount + 5)
      .map(p => p.name);
    
    // التوصيات
    const recommendations: string[] = [];
    
    if (slowestComponents.length > 0 && slowestComponents[0].avgRenderTime > 50) {
      recommendations.push(`تحسين ${slowestComponents[0].name}: وقت رسم ${slowestComponents[0].avgRenderTime.toFixed(1)}ms`);
    }
    
    if (mostRenderedComponents.length > 0 && mostRenderedComponents[0].renderCount > 100) {
      recommendations.push(`فحص ${mostRenderedComponents[0].name}: ${mostRenderedComponents[0].renderCount} مرة رسم`);
    }
    
    if (suspectedMemoryLeaks.length > 0) {
      recommendations.push(`فحص تسرب الذاكرة في: ${suspectedMemoryLeaks.slice(0, 3).join(', ')}`);
    }
    
    if (criticalComponents > 0) {
      recommendations.push(`${criticalComponents} مكون بحاجة لتحسين فوري`);
    }
    
    return {
      totalComponents: allProfiles.length,
      healthyComponents,
      warningComponents,
      criticalComponents,
      slowestComponents,
      mostRenderedComponents,
      suspectedMemoryLeaks,
      recommendations,
    };
  }, []);

  // تحديث دوري
  useEffect(() => {
    if (!enabled) return;
    
    refreshProfiles();
    setReport(generateReport());
    
    updateInterval.current = setInterval(() => {
      refreshProfiles();
      setReport(generateReport());
    }, 5000);
    
    return () => {
      if (updateInterval.current) {
        clearInterval(updateInterval.current);
      }
    };
  }, [enabled, refreshProfiles, generateReport]);

  // مسح البيانات
  const clearProfiles = useCallback(() => {
    componentRegistry.clear();
    setProfiles([]);
    setReport(null);
  }, []);

  // الحصول على ملف تعريف مكون محدد
  const getProfile = useCallback((name: string): ComponentProfile | undefined => {
    return componentRegistry.get(name);
  }, []);

  return {
    profiles,
    report,
    refreshProfiles,
    generateReport,
    clearProfiles,
    getProfile,
  };
}

// Hook لاستخدامه في المكونات
export function useProfiledComponent(componentName: string) {
  const renderEndRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // تسجيل التحميل
    registerComponentMount(componentName);
    
    return () => {
      // تسجيل الإزالة
      registerComponentUnmount(componentName);
    };
  }, [componentName]);

  // بدء قياس الرسم
  useEffect(() => {
    if (renderEndRef.current) {
      renderEndRef.current();
    }
    renderEndRef.current = startComponentRender(componentName);
  });

  return null;
}

// تصدير للاستخدام الخارجي
export function getAllComponentProfiles(): ComponentProfile[] {
  return Array.from(componentRegistry.values());
}

export function resetComponentProfiles() {
  componentRegistry.clear();
}
