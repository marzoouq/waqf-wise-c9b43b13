/**
 * AdaptiveLayout - نظام تخطيط متكيف
 * يوفر مكونات ذكية تتكيف مع حجم الشاشة ونوع الجهاز
 * 
 * @version 1.0.0
 */

import { ReactNode, createContext, useContext, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/ui';

// ==================== Types ====================
export type DeviceType = 'mobile' | 'tablet' | 'desktop';
export type Orientation = 'portrait' | 'landscape';

interface DeviceContextValue {
  deviceType: DeviceType;
  orientation: Orientation;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isPortrait: boolean;
  isLandscape: boolean;
  screenWidth: number;
  screenHeight: number;
}

// ==================== Context ====================
const DeviceContext = createContext<DeviceContextValue | null>(null);

// ==================== Hooks ====================

/**
 * Hook لتحديد نوع الجهاز
 */
export function useDeviceType(): DeviceType {
  const isMobile = useIsMobile();
  
  return useMemo(() => {
    if (typeof window === 'undefined') return 'desktop';
    
    const width = window.innerWidth;
    
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }, [isMobile]);
}

/**
 * Hook لتحديد اتجاه الشاشة
 */
export function useOrientation(): Orientation {
  return useMemo(() => {
    if (typeof window === 'undefined') return 'portrait';
    return window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
  }, []);
}

/**
 * Hook شامل لمعلومات الجهاز
 */
export function useDevice(): DeviceContextValue {
  const deviceType = useDeviceType();
  const orientation = useOrientation();
  
  return useMemo(() => ({
    deviceType,
    orientation,
    isMobile: deviceType === 'mobile',
    isTablet: deviceType === 'tablet',
    isDesktop: deviceType === 'desktop',
    isPortrait: orientation === 'portrait',
    isLandscape: orientation === 'landscape',
    screenWidth: typeof window !== 'undefined' ? window.innerWidth : 1024,
    screenHeight: typeof window !== 'undefined' ? window.innerHeight : 768,
  }), [deviceType, orientation]);
}

/**
 * Hook لاستخدام سياق الجهاز
 */
export function useDeviceContext(): DeviceContextValue {
  const context = useContext(DeviceContext);
  if (!context) {
    // إرجاع قيم افتراضية إذا لم يكن هناك Provider
    return {
      deviceType: 'desktop',
      orientation: 'landscape',
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      isPortrait: false,
      isLandscape: true,
      screenWidth: 1024,
      screenHeight: 768,
    };
  }
  return context;
}

// ==================== Provider ====================

interface DeviceProviderProps {
  children: ReactNode;
}

/**
 * مزود سياق الجهاز
 */
export function DeviceProvider({ children }: DeviceProviderProps) {
  const device = useDevice();
  
  return (
    <DeviceContext.Provider value={device}>
      {children}
    </DeviceContext.Provider>
  );
}

// ==================== Components ====================

interface AdaptiveContainerProps {
  /** المحتوى للجوال */
  mobileLayout: ReactNode;
  /** المحتوى للتابلت (اختياري - يستخدم desktopLayout إذا لم يُحدد) */
  tabletLayout?: ReactNode;
  /** المحتوى للديسكتوب */
  desktopLayout: ReactNode;
  /** الفئات الإضافية */
  className?: string;
}

/**
 * Container يعرض محتوى مختلف حسب نوع الجهاز
 */
export function AdaptiveContainer({
  mobileLayout,
  tabletLayout,
  desktopLayout,
  className,
}: AdaptiveContainerProps) {
  const deviceType = useDeviceType();
  
  const content = useMemo(() => {
    switch (deviceType) {
      case 'mobile':
        return mobileLayout;
      case 'tablet':
        return tabletLayout ?? desktopLayout;
      case 'desktop':
        return desktopLayout;
      default:
        return desktopLayout;
    }
  }, [deviceType, mobileLayout, tabletLayout, desktopLayout]);
  
  return (
    <div className={cn('w-full', className)}>
      {content}
    </div>
  );
}

interface ResponsiveGridProps {
  /** عدد الأعمدة على الجوال */
  mobile?: 1 | 2;
  /** عدد الأعمدة على التابلت */
  tablet?: 1 | 2 | 3 | 4;
  /** عدد الأعمدة على الديسكتوب */
  desktop?: 1 | 2 | 3 | 4 | 5 | 6;
  /** المسافة بين العناصر */
  gap?: 'sm' | 'md' | 'lg' | 'xl';
  /** المحتوى */
  children: ReactNode;
  /** الفئات الإضافية */
  className?: string;
}

const gapClasses = {
  sm: 'gap-2 sm:gap-3',
  md: 'gap-3 sm:gap-4 md:gap-5',
  lg: 'gap-4 sm:gap-5 md:gap-6',
  xl: 'gap-5 sm:gap-6 md:gap-8',
};

const mobileColsClasses = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
};

const tabletColsClasses = {
  1: 'sm:grid-cols-1',
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-3',
  4: 'sm:grid-cols-4',
};

const desktopColsClasses = {
  1: 'lg:grid-cols-1',
  2: 'lg:grid-cols-2',
  3: 'lg:grid-cols-3',
  4: 'lg:grid-cols-4',
  5: 'lg:grid-cols-5',
  6: 'lg:grid-cols-6',
};

/**
 * شبكة متجاوبة مع تحكم دقيق بالأعمدة
 */
export function ResponsiveGrid({
  mobile = 1,
  tablet = 2,
  desktop = 3,
  gap = 'md',
  children,
  className,
}: ResponsiveGridProps) {
  return (
    <div
      className={cn(
        'grid w-full',
        mobileColsClasses[mobile],
        tabletColsClasses[tablet],
        desktopColsClasses[desktop],
        gapClasses[gap],
        className
      )}
    >
      {children}
    </div>
  );
}

interface AdaptiveStackProps {
  /** اتجاه Stack على الجوال */
  mobileDirection?: 'vertical' | 'horizontal';
  /** اتجاه Stack على الديسكتوب */
  desktopDirection?: 'vertical' | 'horizontal';
  /** المسافة */
  gap?: 'sm' | 'md' | 'lg';
  /** المحتوى */
  children: ReactNode;
  /** الفئات الإضافية */
  className?: string;
}

/**
 * Stack يغير اتجاهه حسب حجم الشاشة
 */
export function AdaptiveStack({
  mobileDirection = 'vertical',
  desktopDirection = 'horizontal',
  gap = 'md',
  children,
  className,
}: AdaptiveStackProps) {
  const gapSize = {
    sm: 'gap-2 sm:gap-3',
    md: 'gap-3 sm:gap-4',
    lg: 'gap-4 sm:gap-6',
  };
  
  const directionClasses = useMemo(() => {
    const mobileClass = mobileDirection === 'vertical' ? 'flex-col' : 'flex-row';
    const desktopClass = desktopDirection === 'vertical' ? 'md:flex-col' : 'md:flex-row';
    return `${mobileClass} ${desktopClass}`;
  }, [mobileDirection, desktopDirection]);
  
  return (
    <div
      className={cn(
        'flex w-full',
        directionClasses,
        gapSize[gap],
        className
      )}
    >
      {children}
    </div>
  );
}

interface ShowOnProps {
  /** الأجهزة التي يظهر عليها المحتوى */
  devices: DeviceType[];
  /** المحتوى */
  children: ReactNode;
  /** fallback عند الإخفاء */
  fallback?: ReactNode;
}

/**
 * مكون لإظهار/إخفاء المحتوى حسب نوع الجهاز
 */
export function ShowOn({ devices, children, fallback = null }: ShowOnProps) {
  const deviceType = useDeviceType();
  
  if (devices.includes(deviceType)) {
    return <>{children}</>;
  }
  
  return <>{fallback}</>;
}

interface HideOnProps {
  /** الأجهزة التي يُخفى عنها المحتوى */
  devices: DeviceType[];
  /** المحتوى */
  children: ReactNode;
}

/**
 * مكون لإخفاء المحتوى على أجهزة معينة
 */
export function HideOn({ devices, children }: HideOnProps) {
  const deviceType = useDeviceType();
  
  if (devices.includes(deviceType)) {
    return null;
  }
  
  return <>{children}</>;
}

interface AdaptiveTextProps {
  /** النص على الجوال */
  mobile: string;
  /** النص على التابلت (اختياري) */
  tablet?: string;
  /** النص على الديسكتوب */
  desktop: string;
  /** الفئات الإضافية */
  className?: string;
  /** العنصر المستخدم */
  as?: 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

/**
 * نص يتغير حسب حجم الشاشة
 */
export function AdaptiveText({
  mobile,
  tablet,
  desktop,
  className,
  as: Component = 'span',
}: AdaptiveTextProps) {
  const deviceType = useDeviceType();
  
  const text = useMemo(() => {
    switch (deviceType) {
      case 'mobile':
        return mobile;
      case 'tablet':
        return tablet ?? desktop;
      case 'desktop':
        return desktop;
      default:
        return desktop;
    }
  }, [deviceType, mobile, tablet, desktop]);
  
  return <Component className={className}>{text}</Component>;
}

// ==================== Utility Classes ====================

/**
 * دالة مساعدة لإنشاء classes متجاوبة
 */
export function adaptiveClasses(options: {
  mobile?: string;
  tablet?: string;
  desktop?: string;
  base?: string;
}): string {
  const { mobile = '', tablet = '', desktop = '', base = '' } = options;
  
  // إضافة prefixes للـ breakpoints
  const tabletClass = tablet ? tablet.split(' ').map(c => `sm:${c}`).join(' ') : '';
  const desktopClass = desktop ? desktop.split(' ').map(c => `lg:${c}`).join(' ') : '';
  
  return cn(base, mobile, tabletClass, desktopClass);
}
