import { memo, useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { beneficiaryNavigationItems, type NavigationItem } from '@/components/beneficiary/config/bottomNavConfig';

/**
 * شريط التنقل السفلي للمستفيدين - مخصص للجوال
 */
export const BeneficiaryBottomNavigation = memo(function BeneficiaryBottomNavigation() {
  const location = useLocation();

  const isItemActive = useMemo(() => {
    return (item: NavigationItem) => {
      if (location.pathname === item.path) return true;
      if (item.matchPaths?.some(p => location.pathname.startsWith(p))) return true;
      return false;
    };
  }, [location.pathname]);

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background border-t border-border shadow-lg"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
      role="navigation"
      aria-label="التنقل السفلي للمستفيد"
    >
      <div className="flex items-center justify-around h-16 max-w-screen-xl mx-auto">
        {beneficiaryNavigationItems.map((item) => {
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
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-full" />
              )}
              
              <div className="relative">
                <item.icon className={cn(
                  "h-5 w-5",
                  isActive && "scale-110"
                )} />
                
                {item.badge && item.badge > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-4 min-w-[16px] px-1 text-[10px] flex items-center justify-center rounded-full"
                  >
                    {item.badge > 9 ? '9+' : item.badge}
                  </Badge>
                )}
              </div>
              
              <span className={cn(
                "text-[10px] mt-1",
                isActive ? "font-bold" : "font-medium"
              )}>
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
});
