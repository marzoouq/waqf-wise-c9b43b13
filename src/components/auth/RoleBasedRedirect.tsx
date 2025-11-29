import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export type AppRole = "nazer" | "admin" | "accountant" | "cashier" | "archivist" | "beneficiary" | "user";

/**
 * خريطة التوجيه حسب الدور
 */
const ROLE_DASHBOARD_MAP: Record<AppRole, string> = {
  beneficiary: '/beneficiary-dashboard',
  nazer: '/nazer-dashboard',
  admin: '/admin-dashboard',
  accountant: '/accountant-dashboard',
  cashier: '/cashier-dashboard',
  archivist: '/archivist-dashboard',
  user: '/dashboard',
};

/**
 * أولوية الأدوار - الدور الأعلى يأخذ الأولوية
 */
const ROLE_PRIORITY: AppRole[] = [
  'nazer',
  'admin', 
  'accountant',
  'cashier',
  'archivist',
  'beneficiary',
  'user',
];

/**
 * الحصول على لوحة التحكم المناسبة حسب الأدوار
 */
export function getDashboardForRoles(roles: AppRole[]): string {
  if (!roles || roles.length === 0) {
    return '/dashboard';
  }

  // البحث عن الدور ذو الأولوية الأعلى
  for (const priorityRole of ROLE_PRIORITY) {
    if (roles.includes(priorityRole)) {
      return ROLE_DASHBOARD_MAP[priorityRole];
    }
  }

  return '/dashboard';
}

/**
 * مكون التوجيه التلقائي حسب الدور
 * يستخدم بعد تسجيل الدخول للتوجيه المباشر إلى لوحة التحكم المناسبة
 */
export function RoleBasedRedirect() {
  const { user, isLoading: authLoading, roles, rolesLoading } = useAuth();

  // إظهار مؤشر التحميل فقط عند التحميل الفعلي
  const isLoading = authLoading || (!!user && rolesLoading);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground text-sm">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  // إذا لم يكن هناك مستخدم، توجيه لصفحة الدخول
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // الحصول على المسار المناسب
  const targetDashboard = getDashboardForRoles(roles as AppRole[]);
  
  return <Navigate to={targetDashboard} replace />;
}

export default RoleBasedRedirect;
