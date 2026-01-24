import { memo, useMemo } from 'react';
import { Home, Users, FileText, Bell, MoreHorizontal } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { NavigationItem } from '@/types/navigation';

const defaultNavigationItems: NavigationItem[] = [
  {
    id: 'home',
    label: 'الرئيسية',
    icon: Home,
    path: '/redirect',
    matchPaths: ['/dashboard', '/nazer-dashboard', '/admin-dashboard', '/accountant-dashboard', '/beneficiary-portal'],
  },
  {
    id: 'beneficiaries',
    label: 'المستفيدون',
    icon: Users,
    path: '/beneficiaries',
  },
  {
    id: 'requests',
    label: 'الطلبات',
    icon: FileText,
    path: '/requests',
  },
  {
    id: 'notifications',
    label: 'الإشعارات',
    icon: Bell,
    path: '/notifications',
  },
  {
    id: 'more',
    label: 'المزيد',
    icon: MoreHorizontal,
    path: '/settings',
  },
];

interface BottomNavigationProps {
  items?: readonly NavigationItem[];
  ariaLabel?: string;
}

/**
 * شريط التنقل السفلي للجوال - موحد ومحسّن للأداء
 * يدعم query parameters للتنقل بين التبويبات
 */
export const BottomNavigation = memo(function BottomNavigation({ 
  items,
  ariaLabel = "التنقل السفلي"
}: BottomNavigationProps) {
  const navigationItems = items || defaultNavigationItems;
  const location = useLocation();

  // تحديد العنصر النشط مع دعم query parameters
  const isItemActive = useMemo(() => {
    const fullPath = location.pathname + location.search;
    
    return (item: NavigationItem) => {
      // 1. مطابقة تامة مع المسار الكامل (بما فيه query params)
      if (fullPath === item.path) return true;
      
      // 2. مطابقة المسار بدون query params (للصفحة الرئيسية فقط)
      if (location.pathname === item.path && !location.search) return true;
      
      // 3. التحقق من matchPaths
      if (item.matchPaths?.some(matchPath => {
        if (matchPath.includes('?')) {
          // مسار مع query params - مطابقة تامة أو مع params إضافية
          return fullPath === matchPath || fullPath.startsWith(matchPath + '&');
        }
        // مسار بسيط بدون query
        if (item.id === 'home') {
          // للرئيسية: نشط فقط إذا لم يكن هناك query params
          return location.pathname === matchPath && !location.search;
        }
        // للمسارات العادية
        return location.pathname === matchPath || location.pathname.startsWith(matchPath + '/');
      })) return true;
      
      return false;
    };
  }, [location.pathname, location.search]);

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background border-t border-border shadow-lg"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
      role="navigation"
      aria-label={ariaLabel}
    >
      <div className="flex items-center justify-around h-16 max-w-screen-xl mx-auto">
        {navigationItems.map((item) => {
          const isActive = isItemActive(item);
          return (
            <NavLink
              key={item.id}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full relative",
                "transition-colors duration-150",
                "min-w-[60px] px-1 touch-manipulation",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground active:text-foreground"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              {/* Active indicator مع animation سلسة */}
              <AnimatePresence mode="wait">
                {isActive && (
                  <motion.div 
                    layoutId="bottomNavActiveIndicator"
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-full"
                    initial={{ opacity: 0, scaleX: 0 }}
                    animate={{ opacity: 1, scaleX: 1 }}
                    exit={{ opacity: 0, scaleX: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </AnimatePresence>
              
              <motion.div 
                className="relative"
                whileTap={{ scale: 0.9 }}
                animate={{ scale: isActive ? 1.1 : 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <item.icon className="h-5 w-5" />
                
                {/* Badge for notifications/requests */}
                {item.badge && item.badge > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-4 min-w-[16px] px-1 text-[10px] flex items-center justify-center rounded-full"
                  >
                    {item.badge > 9 ? '9+' : item.badge}
                  </Badge>
                )}
              </motion.div>
              
              <motion.span 
                className={cn(
                  "text-[10px] mt-1",
                  isActive ? "font-bold" : "font-medium"
                )}
                animate={{ 
                  fontWeight: isActive ? 700 : 500,
                  scale: isActive ? 1.05 : 1 
                }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                {item.label}
              </motion.span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
});
