/**
 * Biometric Authentication Hook using WebAuthn
 * يدعم البصمة و Face ID
 */

import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// تحويل ArrayBuffer إلى Base64
const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

// تحويل Base64 إلى ArrayBuffer
const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
};

// تحويل String إلى ArrayBuffer
const stringToArrayBuffer = (str: string): ArrayBuffer => {
  const encoder = new TextEncoder();
  return encoder.encode(str).buffer;
};

export interface BiometricCredential {
  id: string;
  credential_id: string;
  device_name: string | null;
  device_type: string | null;
  created_at: string;
  last_used_at: string | null;
}

export function useBiometricAuth() {
  const { toast } = useToast();
  const [isSupported, setIsSupported] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [credentials, setCredentials] = useState<BiometricCredential[]>([]);

  // التحقق من دعم WebAuthn
  useEffect(() => {
    const checkSupport = async () => {
      if (window.PublicKeyCredential) {
        try {
          const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
          setIsSupported(available);
        } catch {
          setIsSupported(false);
        }
      } else {
        setIsSupported(false);
      }
    };
    checkSupport();
  }, []);

  // جلب بيانات الاعتماد المسجلة
  const fetchCredentials = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('webauthn_credentials')
      .select('id, credential_id, device_name, device_type, created_at, last_used_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setCredentials(data);
    }
  }, []);

  // تسجيل بصمة جديدة
  const registerBiometric = useCallback(async (deviceName?: string): Promise<boolean> => {
    if (!isSupported) {
      toast({
        title: 'غير مدعوم',
        description: 'جهازك لا يدعم المصادقة بالبصمة',
        variant: 'destructive',
      });
      return false;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: 'خطأ',
        description: 'يجب تسجيل الدخول أولاً',
        variant: 'destructive',
      });
      return false;
    }

    setIsRegistering(true);

    try {
      // إنشاء challenge عشوائي
      const challenge = crypto.getRandomValues(new Uint8Array(32));

      // إعدادات التسجيل
      const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
        challenge,
        rp: {
          name: 'منصة إدارة الوقف',
          id: window.location.hostname,
        },
        user: {
          id: stringToArrayBuffer(user.id),
          name: user.email || user.id,
          displayName: user.user_metadata?.full_name || user.email || 'مستخدم',
        },
        pubKeyCredParams: [
          { alg: -7, type: 'public-key' },   // ES256
          { alg: -257, type: 'public-key' }, // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'required',
          residentKey: 'preferred',
        },
        timeout: 60000,
        attestation: 'none',
      };

      // إنشاء credential
      const credential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions,
      }) as PublicKeyCredential;

      if (!credential) {
        throw new Error('فشل في إنشاء بيانات الاعتماد');
      }

      const response = credential.response as AuthenticatorAttestationResponse;

      // تخزين credential في قاعدة البيانات
      const { error } = await supabase
        .from('webauthn_credentials')
        .insert({
          user_id: user.id,
          credential_id: arrayBufferToBase64(credential.rawId),
          public_key: arrayBufferToBase64(response.getPublicKey() || new ArrayBuffer(0)),
          device_name: deviceName || getDeviceName(),
          device_type: getDeviceType(),
        });

      if (error) throw error;

      toast({
        title: 'تم التسجيل بنجاح',
        description: 'تم تفعيل المصادقة بالبصمة لحسابك',
      });

      await fetchCredentials();
      return true;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'فشل في تسجيل البصمة';
      toast({
        title: 'خطأ',
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsRegistering(false);
    }
  }, [isSupported, toast, fetchCredentials]);

  // التحقق بالبصمة وتسجيل الدخول تلقائياً
  const authenticateWithBiometric = useCallback(async (): Promise<{ success: boolean; userId?: string }> => {
    if (!isSupported) {
      return { success: false };
    }

    setIsAuthenticating(true);

    try {
      // جلب credentials المسجلة للمستخدم
      const { data: userCredentials, error: fetchError } = await supabase
        .from('webauthn_credentials')
        .select('credential_id, user_id')
        .limit(50);

      if (fetchError || !userCredentials?.length) {
        throw new Error('لا توجد بصمة مسجلة');
      }

      // إنشاء challenge
      const challenge = crypto.getRandomValues(new Uint8Array(32));

      // إعدادات المصادقة
      const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
        challenge,
        timeout: 60000,
        rpId: window.location.hostname,
        userVerification: 'required',
        allowCredentials: userCredentials.map(cred => ({
          id: base64ToArrayBuffer(cred.credential_id),
          type: 'public-key' as const,
          transports: ['internal'] as AuthenticatorTransport[],
        })),
      };

      // طلب المصادقة
      const assertion = await navigator.credentials.get({
        publicKey: publicKeyCredentialRequestOptions,
      }) as PublicKeyCredential;

      if (!assertion) {
        throw new Error('فشل في المصادقة');
      }

      // البحث عن credential المستخدم
      const usedCredentialId = arrayBufferToBase64(assertion.rawId);
      const matchedCredential = userCredentials.find(
        c => c.credential_id === usedCredentialId
      );

      if (!matchedCredential) {
        throw new Error('البصمة غير مسجلة');
      }

      // استدعاء Edge Function لإنشاء جلسة
      const { data: authData, error: authError } = await supabase.functions.invoke('biometric-auth', {
        body: {
          credentialId: usedCredentialId,
          userId: matchedCredential.user_id,
        },
      });

      if (authError) {
        console.error('Edge function error:', authError);
        throw new Error('فشل في الاتصال بالخادم');
      }

      if (!authData?.success) {
        throw new Error(authData?.error || 'فشل في إنشاء الجلسة');
      }

      // تسجيل الدخول باستخدام OTP token
      if (authData.token_hash && authData.email) {
        const { error: verifyError } = await supabase.auth.verifyOtp({
          email: authData.email,
          token_hash: authData.token_hash,
          type: 'magiclink',
        });

        if (verifyError) {
          console.error('Verify OTP error:', verifyError);
          throw new Error('فشل في تأكيد الجلسة');
        }
      } else {
        throw new Error('بيانات المصادقة غير مكتملة');
      }

      toast({
        title: 'تم تسجيل الدخول بنجاح',
        description: 'مرحباً بك مجدداً',
      });

      return { success: true, userId: matchedCredential.user_id };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'فشل في المصادقة بالبصمة';
      toast({
        title: 'فشل التحقق',
        description: errorMessage,
        variant: 'destructive',
      });
      return { success: false };
    } finally {
      setIsAuthenticating(false);
    }
  }, [isSupported, toast]);

  // حذف بصمة
  const removeCredential = useCallback(async (credentialId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('webauthn_credentials')
        .delete()
        .eq('id', credentialId);

      if (error) throw error;

      toast({
        title: 'تم الحذف',
        description: 'تم حذف البصمة بنجاح',
      });

      await fetchCredentials();
      return true;
    } catch {
      toast({
        title: 'خطأ',
        description: 'فشل في حذف البصمة',
        variant: 'destructive',
      });
      return false;
    }
  }, [toast, fetchCredentials]);

  // التحقق من وجود بصمات مسجلة للمستخدم الحالي
  const hasBiometricEnabled = credentials.length > 0;

  return {
    isSupported,
    isRegistering,
    isAuthenticating,
    credentials,
    hasBiometricEnabled,
    registerBiometric,
    authenticateWithBiometric,
    removeCredential,
    fetchCredentials,
  };
}

// مساعدات للحصول على معلومات الجهاز
function getDeviceName(): string {
  const ua = navigator.userAgent;
  if (/iPhone/i.test(ua)) return 'iPhone';
  if (/iPad/i.test(ua)) return 'iPad';
  if (/Android/i.test(ua)) return 'Android';
  if (/Mac/i.test(ua)) return 'Mac';
  if (/Windows/i.test(ua)) return 'Windows';
  return 'جهاز غير معروف';
}

function getDeviceType(): string {
  const ua = navigator.userAgent;
  if (/Mobile|Android|iPhone/i.test(ua)) return 'mobile';
  if (/iPad|Tablet/i.test(ua)) return 'tablet';
  return 'desktop';
}
