/**
 * مكون التوجيه للمستخدمين المسجلين
 * Redirect component for authenticated users
 * 
 * ✅ مستقل عن AuthContext - يستخدم Supabase مباشرة
 * ✅ يجلب الأدوار مباشرة ويوجه للوحة التحكم المناسبة
 * ✅ آمن للاستخدام في الصفحات الخفيفة
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { type AppRole, getDashboardForRoles } from '@/types/roles';

export default function AuthenticatedRedirect() {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let mounted = true;

    const checkAndRedirect = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (!session) {
          navigate('/login', { replace: true });
          return;
        }

        // ✅ جلب الأدوار مباشرة من قاعدة البيانات
        const { data: rolesData, error: rolesError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id);
        
        if (!mounted) return;

        if (rolesError) {
          console.error('Error fetching roles:', rolesError);
          navigate('/dashboard', { replace: true });
          return;
        }

        const roles = rolesData?.map(r => r.role as AppRole) || [];
        const targetDashboard = getDashboardForRoles(roles);
        
        // تخزين الأدوار مؤقتاً
        try {
          localStorage.setItem('waqf_user_roles', JSON.stringify({
            roles,
            userId: session.user.id,
            timestamp: Date.now()
          }));
        } catch { /* تجاهل أخطاء localStorage */ }
        
        navigate(targetDashboard, { replace: true });
      } catch (error) {
        if (mounted) {
          console.error('Error checking session:', error);
          navigate('/login', { replace: true });
        }
      } finally {
        if (mounted) {
          setIsChecking(false);
        }
      }
    };

    checkAndRedirect();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  if (!isChecking) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
