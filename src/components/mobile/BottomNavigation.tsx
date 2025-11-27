import { Home, Users, FileText, Bell, MoreHorizontal } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  badge?: number;
}

const navigationItems: NavigationItem[] = [
  {
    id: 'home',
    label: 'الرئيسية',
    icon: Home,
    path: '/',
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

/**
 * شريط التنقل السفلي للجوال
 * يظهر فقط على الشاشات الصغيرة (< 768px)
 */
export function BottomNavigation() {
  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background border-t border-border shadow-lg"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className="flex items-center justify-around h-16 max-w-screen-xl mx-auto">
        {navigationItems.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center flex-1 h-full relative",
                "transition-all duration-200 active:scale-95",
                "min-w-[60px] px-1",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )
            }
          >
            {({ isActive }) => (
              <>
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-full" />
                )}
                
                <div className="relative">
                  <item.icon className={cn(
                    "h-5 w-5 transition-transform duration-200",
                    isActive && "scale-110"
                  )} />
                  
                  {/* Badge for notifications/requests */}
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
                  "text-[10px] mt-1 font-medium transition-all duration-200",
                  isActive && "font-bold"
                )}>
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
