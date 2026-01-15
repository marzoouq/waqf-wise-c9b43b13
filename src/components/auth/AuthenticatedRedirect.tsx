/**
 * مكون التوجيه للمستخدمين المسجلين
 * Redirect component for authenticated users
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthenticatedRedirect() {
  const { user, roles, isLoading, rolesLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // انتظار انتهاء التحميل
    if (isLoading || rolesLoading) return;

    // إذا لا يوجد مستخدم، رجوع للـ login
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }

    // توجيه بناءً على الأدوار
    navigate('/redirect', { replace: true });
  }, [user, roles, isLoading, rolesLoading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
