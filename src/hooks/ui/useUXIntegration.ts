/**
 * UX Integration Hook - خطاف التكامل الموحد
 * يوفر وصولاً موحداً لجميع أنظمة UX
 * 
 * @version 1.0.0
 */

import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  checkUXSystemsHealth,
  configureUX,
  getUXConfig,
  collectUXMetrics,
  detectDeviceCapabilities,
  applyAdaptiveUX,
  type UXSystemStatus,
  type UXConfig,
  type UXPerformanceMetrics,
  type DeviceCapabilities,
} from '@/lib/ux-integration';

// ==================== Main Integration Hook ====================

export interface UseUXIntegrationReturn {
  // System status
  systemStatus: UXSystemStatus;
  isFullyOperational: boolean;
  
  // Configuration
  config: UXConfig;
  updateConfig: (updates: Partial<UXConfig>) => void;
  
  // Device capabilities
  capabilities: DeviceCapabilities;
  
  // Performance
  metrics: UXPerformanceMetrics;
  refreshMetrics: () => void;
  
  // Utilities
  isTouch: boolean;
  isMobile: boolean;
  prefersReducedMotion: boolean;
  isOnline: boolean;
}

/**
 * خطاف التكامل الموحد لأنظمة UX
 */
export function useUXIntegration(): UseUXIntegrationReturn {
  const [systemStatus, setSystemStatus] = useState<UXSystemStatus>(() => checkUXSystemsHealth());
  const [config, setConfig] = useState<UXConfig>(() => getUXConfig());
  const [capabilities, setCapabilities] = useState<DeviceCapabilities>(() => detectDeviceCapabilities());
  const [metrics, setMetrics] = useState<UXPerformanceMetrics>(() => collectUXMetrics());
  const [isOnline, setIsOnline] = useState(true);
  
  // Initialize adaptive UX on mount
  useEffect(() => {
    applyAdaptiveUX();
    
    // Update capabilities on resize
    const handleResize = () => {
      setCapabilities(detectDeviceCapabilities());
    };
    
    // Network status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    // Motion preference changes
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleMotionChange = (e: MediaQueryListEvent) => {
      setCapabilities(prev => ({ ...prev, prefersReducedMotion: e.matches }));
    };
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    motionQuery.addEventListener('change', handleMotionChange);
    
    setIsOnline(navigator.onLine);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      motionQuery.removeEventListener('change', handleMotionChange);
    };
  }, []);
  
  // Update config
  const updateConfig = useCallback((updates: Partial<UXConfig>) => {
    const newConfig = configureUX(updates);
    setConfig(newConfig);
  }, []);
  
  // Refresh metrics
  const refreshMetrics = useCallback(() => {
    setMetrics(collectUXMetrics());
  }, []);
  
  // Derived values
  const isFullyOperational = useMemo(() => {
    return Object.values(systemStatus).every(Boolean);
  }, [systemStatus]);
  
  const isTouch = capabilities.hasTouchScreen;
  const isMobile = isTouch && window.innerWidth < 768;
  
  return {
    systemStatus,
    isFullyOperational,
    config,
    updateConfig,
    capabilities,
    metrics,
    refreshMetrics,
    isTouch,
    isMobile,
    prefersReducedMotion: capabilities.prefersReducedMotion,
    isOnline,
  };
}

// ==================== Specialized Hooks ====================

/**
 * خطاف لمراقبة حالة الشبكة
 */
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [connectionType, setConnectionType] = useState<string>('unknown');
  const [saveData, setSaveData] = useState(false);
  
  useEffect(() => {
    const updateNetworkInfo = () => {
      setIsOnline(navigator.onLine);
      
      const connection = (navigator as Navigator & { 
        connection?: { 
          effectiveType?: string; 
          saveData?: boolean;
        } 
      }).connection;
      
      if (connection) {
        setConnectionType(connection.effectiveType || 'unknown');
        setSaveData(connection.saveData || false);
      }
    };
    
    updateNetworkInfo();
    
    window.addEventListener('online', updateNetworkInfo);
    window.addEventListener('offline', updateNetworkInfo);
    
    return () => {
      window.removeEventListener('online', updateNetworkInfo);
      window.removeEventListener('offline', updateNetworkInfo);
    };
  }, []);
  
  return { isOnline, connectionType, saveData };
}

/**
 * خطاف لتتبع تفاعلات المستخدم
 */
export function useInteractionTracking() {
  const [lastInteraction, setLastInteraction] = useState<number>(Date.now());
  const [isIdle, setIsIdle] = useState(false);
  const [interactionCount, setInteractionCount] = useState(0);
  
  useEffect(() => {
    let idleTimer: ReturnType<typeof setTimeout>;
    
    const resetIdleTimer = () => {
      setLastInteraction(Date.now());
      setIsIdle(false);
      setInteractionCount(prev => prev + 1);
      
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        setIsIdle(true);
      }, 30000); // 30 seconds idle threshold
    };
    
    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, resetIdleTimer, { passive: true });
    });
    
    resetIdleTimer();
    
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, resetIdleTimer);
      });
      clearTimeout(idleTimer);
    };
  }, []);
  
  return { lastInteraction, isIdle, interactionCount };
}

/**
 * خطاف لتتبع أداء الصفحة
 */
export function usePagePerformance() {
  const [loadTime, setLoadTime] = useState<number | null>(null);
  const [memoryUsage, setMemoryUsage] = useState<number | null>(null);
  const [fps, setFps] = useState<number | null>(null);
  
  useEffect(() => {
    // Load time
    if (performance.timing) {
      const timing = performance.timing;
      setLoadTime(timing.loadEventEnd - timing.navigationStart);
    }
    
    // Memory usage (Chrome only)
    const memory = (performance as Performance & { memory?: { usedJSHeapSize: number } }).memory;
    if (memory) {
      setMemoryUsage(memory.usedJSHeapSize);
    }
    
    // FPS tracking
    let frameCount = 0;
    let lastTime = performance.now();
    let animationId: number;
    
    const measureFps = (currentTime: number) => {
      frameCount++;
      
      if (currentTime - lastTime >= 1000) {
        setFps(frameCount);
        frameCount = 0;
        lastTime = currentTime;
      }
      
      animationId = requestAnimationFrame(measureFps);
    };
    
    animationId = requestAnimationFrame(measureFps);
    
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);
  
  return { loadTime, memoryUsage, fps };
}

/**
 * خطاف لإدارة تفضيلات المستخدم
 */
export function useUserPreferences() {
  const [preferences, setPreferences] = useState({
    reducedMotion: false,
    highContrast: false,
    darkMode: false,
    fontSize: 'normal' as 'small' | 'normal' | 'large',
  });
  
  useEffect(() => {
    const updatePreferences = () => {
      setPreferences({
        reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        highContrast: window.matchMedia('(prefers-contrast: more)').matches,
        darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
        fontSize: 'normal',
      });
    };
    
    updatePreferences();
    
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const highContrastQuery = window.matchMedia('(prefers-contrast: more)');
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    reducedMotionQuery.addEventListener('change', updatePreferences);
    highContrastQuery.addEventListener('change', updatePreferences);
    darkModeQuery.addEventListener('change', updatePreferences);
    
    return () => {
      reducedMotionQuery.removeEventListener('change', updatePreferences);
      highContrastQuery.removeEventListener('change', updatePreferences);
      darkModeQuery.removeEventListener('change', updatePreferences);
    };
  }, []);
  
  const updateFontSize = useCallback((size: 'small' | 'normal' | 'large') => {
    setPreferences(prev => ({ ...prev, fontSize: size }));
    
    const root = document.documentElement;
    const fontSizes = { small: '14px', normal: '16px', large: '18px' };
    root.style.fontSize = fontSizes[size];
  }, []);
  
  return { preferences, updateFontSize };
}

export default useUXIntegration;
