/**
 * مكون التوجيه للمستخدمين المسجلين
 * Redirect component for authenticated users
 * 
 * ✅ مستقل عن AuthContext - يستخدم Supabase مباشرة
 * ✅ آمن للاستخدام في الصفحات الخفيفة
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

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
          // لا يوجد جلسة، رجوع للـ login
          navigate('/login', { replace: true });
          return;
        }

        // توجيه للمسار الرئيسي الذي سيتولى التوجيه الصحيح
        navigate('/redirect', { replace: true });
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
