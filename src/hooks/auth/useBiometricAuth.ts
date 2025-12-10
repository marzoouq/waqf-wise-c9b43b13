/**
 * Biometric Authentication Hook using WebAuthn
 * يدعم البصمة و Face ID
 */

import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { BiometricService, type BiometricCredential } from '@/services/biometric.service';

export type { BiometricCredential };

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
    const user = await BiometricService.getCurrentUser();
    if (!user) return;

    try {
      const data = await BiometricService.fetchUserCredentials(user.id);
      setCredentials(data);
    } catch {
      // Silent fail for credentials fetch
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

    const user = await BiometricService.getCurrentUser();
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
      await BiometricService.registerCredential({
        userId: user.id,
        credentialId: arrayBufferToBase64(credential.rawId),
        publicKey: arrayBufferToBase64(response.getPublicKey() || new ArrayBuffer(0)),
        deviceName: deviceName || getDeviceName(),
        deviceType: getDeviceType(),
      });

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
      toast({
        title: 'غير مدعوم',
        description: 'جهازك لا يدعم المصادقة بالبصمة',
        variant: 'destructive',
      });
      return { success: false };
    }

    setIsAuthenticating(true);

    try {
      // جلب credentials المسجلة للمستخدم
      const userCredentials = await BiometricService.fetchAllCredentialsForAuth();

      if (!userCredentials?.length) {
        throw new Error('لا توجد بصمة مسجلة. يرجى تسجيل البصمة أولاً من الإعدادات');
      }

      // إنشاء challenge
      const challenge = crypto.getRandomValues(new Uint8Array(32));

      // الحصول على hostname الحالي
      const currentHostname = window.location.hostname;
      
      // إعدادات المصادقة - استخدام نفس rpId المستخدم في التسجيل
      const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
        challenge,
        timeout: 60000,
        rpId: currentHostname,
        userVerification: 'required',
        allowCredentials: userCredentials.map(cred => ({
          id: base64ToArrayBuffer(cred.credential_id),
          type: 'public-key' as const,
          transports: ['internal', 'hybrid'] as AuthenticatorTransport[],
        })),
      };

      // طلب المصادقة
      let assertion: PublicKeyCredential | null = null;
      
      try {
        assertion = await navigator.credentials.get({
          publicKey: publicKeyCredentialRequestOptions,
        }) as PublicKeyCredential;
      } catch (webauthnError) {
        console.error('WebAuthn get error:', webauthnError);
        
        // إذا فشل بسبب rpId، نحاول بدون rpId (للسماح بالمرونة)
        if (webauthnError instanceof Error && webauthnError.name === 'SecurityError') {
          const fallbackOptions: PublicKeyCredentialRequestOptions = {
            challenge,
            timeout: 60000,
            userVerification: 'required',
            allowCredentials: userCredentials.map(cred => ({
              id: base64ToArrayBuffer(cred.credential_id),
              type: 'public-key' as const,
              transports: ['internal', 'hybrid'] as AuthenticatorTransport[],
            })),
          };
          
          assertion = await navigator.credentials.get({
            publicKey: fallbackOptions,
          }) as PublicKeyCredential;
        } else {
          throw webauthnError;
        }
      }

      if (!assertion) {
        throw new Error('فشل في المصادقة - لم يتم التعرف على البصمة');
      }

      // البحث عن credential المستخدم
      const usedCredentialId = arrayBufferToBase64(assertion.rawId);
      const matchedCredential = userCredentials.find(
        c => c.credential_id === usedCredentialId
      );

      if (!matchedCredential) {
        throw new Error('البصمة غير مسجلة في هذا الجهاز');
      }

      // استدعاء Edge Function لإنشاء جلسة
      const authData = await BiometricService.authenticateViaEdgeFunction({
        credentialId: usedCredentialId,
        userId: matchedCredential.user_id,
        challenge: arrayBufferToBase64(challenge.buffer),
      });

      if (!authData?.success) {
        throw new Error(authData?.error || 'فشل في إنشاء الجلسة');
      }

      // تسجيل الدخول باستخدام OTP token
      if (authData.token_hash && authData.email) {
        await BiometricService.verifyOtp(authData.email, authData.token_hash);
      } else {
        throw new Error('بيانات المصادقة غير مكتملة');
      }

      toast({
        title: 'تم تسجيل الدخول بنجاح',
        description: 'مرحباً بك مجدداً',
      });

      return { success: true, userId: matchedCredential.user_id };
    } catch (error: unknown) {
      console.error('Biometric auth error:', error);
      
      let errorMessage = 'فشل في المصادقة بالبصمة';
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage = 'تم إلغاء المصادقة أو رفض الإذن';
        } else if (error.name === 'SecurityError') {
          errorMessage = 'خطأ أمني - تأكد من أنك تستخدم نفس الجهاز المسجل';
        } else if (error.name === 'InvalidStateError') {
          errorMessage = 'البصمة غير مسجلة في هذا الجهاز';
        } else if (error.name === 'AbortError') {
          errorMessage = 'تم إلغاء عملية المصادقة';
        } else {
          errorMessage = error.message;
        }
      }
      
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
      await BiometricService.deleteCredential(credentialId);

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
