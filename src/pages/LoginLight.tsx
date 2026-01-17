/**
 * صفحة تسجيل الدخول الخفيفة - محسّنة للأداء (LCP)
 * Light Login Page - Performance Optimized
 * 
 * ✅ لا تعتمد على AuthContext عند التحميل الأولي
 * ✅ توجيه مباشر للوحة التحكم المناسبة حسب الدور
 * ✅ Critical CSS inline
 */

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { type AppRole, getDashboardForRoles } from '@/types/roles';

// ✅ CSS Critical inline - لا يحتاج استيراد خارجي
const criticalStyles = {
  container: "min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4",
  card: "w-full max-w-md bg-card rounded-xl shadow-lg border border-border p-6",
  title: "text-3xl font-bold text-center text-foreground mb-2",
  description: "text-center text-muted-foreground mb-6",
  tabsList: "grid grid-cols-2 gap-2 p-1 bg-muted rounded-lg mb-6",
  tabTrigger: "py-2 px-4 rounded-md text-sm font-medium transition-colors",
  tabActive: "bg-background text-foreground shadow",
  tabInactive: "text-muted-foreground hover:text-foreground",
  label: "block text-sm font-medium text-foreground mb-1.5",
  input: "w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
  button: "w-full py-2.5 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2",
  buttonOutline: "w-full py-2.5 px-4 border border-input bg-background text-foreground rounded-lg font-medium hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50 flex items-center justify-center gap-2",
  divider: "relative my-4",
  dividerLine: "absolute inset-0 flex items-center",
  dividerText: "relative flex justify-center text-xs uppercase",
  dividerTextBg: "bg-card px-2 text-muted-foreground",
  error: "p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm",
  link: "text-primary hover:underline inline-flex items-center justify-center gap-1",
  spinner: "w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin",
};

// ✅ أيقونات SVG inline - لا حاجة لـ Lucide
const Icons = {
  LogIn: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
    </svg>
  ),
  Building: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  Smartphone: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  ),
  Google: () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24">
      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  ),
};

export default function LoginLight() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [loginType, setLoginType] = useState<'staff' | 'beneficiary'>('staff');
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const navigate = useNavigate();

  // ✅ فحص سريع للجلسة - بدون AuthContext
  useEffect(() => {
    let mounted = true;
    
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted) {
          setIsAuthenticated(!!session);
        }
      } catch {
        if (mounted) {
          setIsAuthenticated(false);
        }
      }
    };
    
    checkSession();
    
    return () => { mounted = false; };
  }, []);

  // ✅ إذا مسجل دخول، جلب الأدوار والتوجيه مباشرة
  useEffect(() => {
    if (isAuthenticated === true) {
      const redirectToDashboard = async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const { data: rolesData } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', session.user.id);
            
            const roles = rolesData?.map(r => r.role as AppRole) || [];
            const targetDashboard = getDashboardForRoles(roles);
            navigate(targetDashboard, { replace: true });
          }
        } catch (error) {
          console.error('Error fetching roles:', error);
          navigate('/dashboard', { replace: true });
        }
      };
      redirectToDashboard();
    }
  }, [isAuthenticated, navigate]);

  // شاشة تحميل أثناء التوجيه
  if (isAuthenticated === true) {
    return (
      <div className={criticalStyles.container}>
        <div className={criticalStyles.spinner} style={{ width: 32, height: 32, borderWidth: 3 }} />
      </div>
    );
  }

  // ✅ تسجيل الدخول المباشر عبر Supabase
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      let email = identifier;
      
      // إذا كان مستفيد، نحتاج جلب البريد الإلكتروني من رقم الهوية
      if (loginType === 'beneficiary') {
        const { data, error: lookupError } = await supabase
          .from('beneficiaries')
          .select('email')
          .eq('national_id', identifier)
          .eq('can_login', true)
          .single();
        
        if (lookupError || !data?.email) {
          throw new Error('رقم الهوية غير مسجل في النظام أو ليس لديه حساب دخول');
        }
        
        email = data.email;
      }

      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        const msg = signInError.message.toLowerCase();
        if (msg.includes('invalid_credentials') || msg.includes('invalid login credentials')) {
          throw new Error(loginType === 'beneficiary' 
            ? 'رقم الهوية أو كلمة المرور غير صحيحة'
            : 'البريد الإلكتروني أو كلمة المرور غير صحيحة');
        }
        if (msg.includes('email not confirmed')) {
          throw new Error('البريد الإلكتروني غير مؤكد. يرجى تأكيد بريدك الإلكتروني أولاً');
        }
        throw signInError;
      }

      // ✅ التحقق من أن المستخدم نشط
      if (authData?.user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('is_active')
          .eq('user_id', authData.user.id)
          .maybeSingle();
        
        if (profileData && profileData.is_active === false) {
          await supabase.auth.signOut();
          throw new Error('حسابك غير نشط. يرجى التواصل مع الإدارة');
        }

        // ✅ جلب الأدوار والتوجيه مباشرة للوحة التحكم المناسبة
        const { data: rolesData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', authData.user.id);
        
        const roles = rolesData?.map(r => r.role as AppRole) || [];
        const targetDashboard = getDashboardForRoles(roles);
        
        // تخزين الأدوار مؤقتاً للاستخدام السريع
        try {
          localStorage.setItem('waqf_user_roles', JSON.stringify({
            roles,
            userId: authData.user.id,
            timestamp: Date.now()
          }));
        } catch { /* تجاهل أخطاء localStorage */ }
        
        navigate(targetDashboard, { replace: true });
        return;
      }

      // نجاح - توجيه للتطبيق (fallback)
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء تسجيل الدخول');
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ تسجيل الدخول بـ Google
  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setError(null);
    
    try {
      // توجيه OAuth إلى صفحة authenticated-redirect للتعامل مع جلب الأدوار
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/authenticated-redirect`,
        },
      });
      
      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل تسجيل الدخول بـ Google');
      setIsGoogleLoading(false);
    }
  };

  // ✅ عرض شاشة التحميل الأولية
  if (isAuthenticated === null) {
    return (
      <div className={criticalStyles.container}>
        <div className={criticalStyles.spinner} style={{ width: 32, height: 32, borderWidth: 3 }} />
      </div>
    );
  }

  return (
    <div className={criticalStyles.container}>
      <main>
        <div className={criticalStyles.card}>
          <h1 className={criticalStyles.title}>تسجيل الدخول</h1>
          <p className={criticalStyles.description}>
            اختر نوع الحساب وأدخل بياناتك للدخول إلى النظام
          </p>

          {/* Tabs */}
          <div className={criticalStyles.tabsList}>
            <button
              type="button"
              className={`${criticalStyles.tabTrigger} ${loginType === 'staff' ? criticalStyles.tabActive : criticalStyles.tabInactive}`}
              onClick={() => { setLoginType('staff'); setError(null); }}
            >
              الموظفون
            </button>
            <button
              type="button"
              className={`${criticalStyles.tabTrigger} ${loginType === 'beneficiary' ? criticalStyles.tabActive : criticalStyles.tabInactive}`}
              onClick={() => { setLoginType('beneficiary'); setError(null); }}
            >
              المستفيدون
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className={criticalStyles.error}>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div>
              <label htmlFor="identifier" className={criticalStyles.label}>
                {loginType === 'staff' ? 'البريد الإلكتروني' : 'رقم الهوية الوطنية'}
              </label>
              <input
                id="identifier"
                type={loginType === 'staff' ? 'email' : 'text'}
                placeholder={loginType === 'staff' ? 'example@waqf.sa' : 'أدخل رقم الهوية'}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                disabled={isLoading}
                className={criticalStyles.input}
                maxLength={loginType === 'beneficiary' ? 10 : undefined}
                pattern={loginType === 'beneficiary' ? '[0-9]{10}' : undefined}
              />
            </div>
            
            <div>
              <label htmlFor="password" className={criticalStyles.label}>
                كلمة المرور
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className={criticalStyles.input}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={criticalStyles.button}
            >
              {isLoading ? (
                <>
                  <span className={criticalStyles.spinner} />
                  جاري تسجيل الدخول...
                </>
              ) : (
                <>
                  <Icons.LogIn />
                  تسجيل الدخول
                </>
              )}
            </button>
          </form>

          {/* Google Login - للموظفين فقط */}
          {loginType === 'staff' && (
            <>
              <div className={criticalStyles.divider}>
                <div className={criticalStyles.dividerLine}>
                  <span className="w-full border-t border-border" />
                </div>
                <div className={criticalStyles.dividerText}>
                  <span className={criticalStyles.dividerTextBg}>أو</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isGoogleLoading || isLoading}
                className={criticalStyles.buttonOutline}
              >
                {isGoogleLoading ? (
                  <>
                    <span className={criticalStyles.spinner} />
                    جاري تسجيل الدخول...
                  </>
                ) : (
                  <>
                    <Icons.Google />
                    تسجيل الدخول بـ Google
                  </>
                )}
              </button>
            </>
          )}

          {/* Footer Links */}
          <div className="text-center text-sm text-muted-foreground mt-6 space-y-2">
            <p className="text-xs">
              {loginType === 'staff' 
                ? 'حساب الموظفين يتم إنشاؤه من قبل الناظر أو المشرف'
                : 'إذا كنت مستفيداً جديداً، يرجى التواصل مع الإدارة'}
            </p>
            <div className="flex flex-col gap-2">
              <Link to="/tenant-portal" className={criticalStyles.link}>
                <Icons.Building />
                بوابة المستأجرين
              </Link>
              <Link to="/install" className={`${criticalStyles.link} text-muted-foreground hover:text-primary`}>
                <Icons.Smartphone />
                تثبيت التطبيق على جهازك
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
