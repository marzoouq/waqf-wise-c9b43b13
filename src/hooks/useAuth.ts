import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { logger } from '@/lib/logger';
import { useLeakedPassword } from './useLeakedPassword';
import { productionLogger } from '@/lib/logger/production-logger';
import { TOTP } from 'otpauth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { checkPasswordQuick } = useLeakedPassword();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        productionLogger.info('Auth event', { event, email: session?.user?.email || 'none' });
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Update last activity
        if (session?.user) {
          setTimeout(() => {
            updateLastActivity(session.user.id);
          }, 0);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const updateLastActivity = async (userId: string) => {
    try {
      await supabase
        .from("profiles")
        .update({ last_login_at: new Date().toISOString() })
        .eq("user_id", userId);
    } catch (error) {
      logger.error(error, { context: 'updateLastActivity', userId });
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      // التحقق من كلمة المرور المسربة
      const isLeaked = await checkPasswordQuick(password);
      if (isLeaked) {
        toast({
          title: "كلمة مرور غير آمنة",
          description: "هذه الكلمة تم تسريبها في اختراقات سابقة. يرجى اختيار كلمة مرور أخرى.",
          variant: "destructive",
        });
        return { data: null, error: new Error('Leaked password') };
      }

      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
          }
        }
      });

      if (error) throw error;

      // Create profile and assign default role
      if (data.user) {
        const { error: profileError } = await supabase.rpc(
          'create_user_profile_and_role',
          {
            p_user_id: data.user.id,
            p_full_name: fullName,
            p_email: email,
            p_role: 'user'
          }
        );

        if (profileError) {
          logger.error(profileError, { context: 'signUp - createProfile', userId: data.user.id });
        }
      }

      toast({
        title: "تم إنشاء الحساب بنجاح",
        description: "يمكنك الآن تسجيل الدخول",
      });

      return { data, error: null };
    } catch (error) {
      logger.error(error, { context: 'signUp', severity: 'high' });
      const message = error instanceof Error ? error.message : 'حدث خطأ غير معروف';
      toast({
        title: "خطأ في إنشاء الحساب",
        description: message,
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const signIn = async (email: string, password: string, twoFactorCode?: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // التحقق من 2FA إن كان مفعلاً
      if (data.user) {
        const { data: twoFactorData } = await supabase
          .from("two_factor_secrets")
          .select("enabled, secret, backup_codes")
          .eq("user_id", data.user.id)
          .maybeSingle();

        if (twoFactorData?.enabled) {
          if (!twoFactorCode) {
            return { 
              data: null, 
              error: null, 
              requires2FA: true 
            };
          }

          const isValidCode = await verify2FACode(twoFactorData.secret, twoFactorCode);
          const isBackupCode = twoFactorData.backup_codes?.includes(twoFactorCode);

          if (!isValidCode && !isBackupCode) {
            throw new Error('رمز المصادقة الثنائية غير صحيح');
          }

          if (isBackupCode) {
            await supabase
              .from("two_factor_secrets")
              .update({
                backup_codes: twoFactorData.backup_codes.filter((c: string) => c !== twoFactorCode)
              })
              .eq("user_id", data.user.id);
          }
        }
      }

      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: "مرحباً بك",
      });

      navigate('/');
      return { data, error: null, requires2FA: false };
    } catch (error) {
      logger.error(error, { context: 'signIn', severity: 'medium' });
      let errorMessage = "حدث خطأ أثناء تسجيل الدخول";
      
      if (error instanceof Error) {
        if (error.message.includes("Invalid login credentials")) {
          errorMessage = "البريد الإلكتروني أو كلمة المرور غير صحيحة";
        } else if (error.message.includes("Email not confirmed")) {
          errorMessage = "يرجى تأكيد بريدك الإلكتروني أولاً";
        }
      }

      toast({
        title: "خطأ في تسجيل الدخول",
        description: errorMessage,
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      toast({
        title: "تم تسجيل الخروج بنجاح",
        description: "نراك قريباً",
      });

      navigate('/auth');
    } catch (error) {
      logger.error(error, { context: 'signOut' });
      const message = error instanceof Error ? error.message : 'حدث خطأ أثناء تسجيل الخروج';
      toast({
        title: "خطأ في تسجيل الخروج",
        description: message,
        variant: "destructive",
      });
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const redirectUrl = `${window.location.origin}/auth?mode=reset-password`;
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) throw error;

      toast({
        title: "تم إرسال رابط إعادة التعيين",
        description: "يرجى التحقق من بريدك الإلكتروني",
      });
      return { error: null };
    } catch (error) {
      logger.error(error, { context: 'resetPassword' });
      const message = error instanceof Error ? error.message : 'حدث خطأ';
      toast({
        title: "خطأ",
        description: message,
        variant: "destructive",
      });
      return { error };
    }
  };

  // التحقق من رمز 2FA باستخدام TOTP حقيقي
  const verify2FACode = async (secret: string, code: string): Promise<boolean> => {
    try {
      // إنشاء TOTP instance بالإعدادات القياسية
      const totp = new TOTP({
        issuer: 'Waqf Management',
        label: user?.email || 'User',
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
        secret: secret,
      });

      // التحقق من الرمز مع window tolerance (30 ثانية قبل وبعد)
      const delta = totp.validate({ token: code, window: 1 });
      
      if (delta !== null) {
        productionLogger.success('2FA code verified successfully', { userId: user?.id });
        return true;
      }

      // إذا فشل TOTP، تحقق من backup codes
      const { data, error } = await supabase.rpc('verify_2fa_code', {
        p_user_id: user?.id || '',
        p_code: code,
      });

      if (error) {
        productionLogger.warn('2FA verification failed', { error: error.message });
        return false;
      }

      return data || false;
    } catch (error) {
      productionLogger.error('Error verifying 2FA code', error);
      return false;
    }
  };

  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
  };
}
