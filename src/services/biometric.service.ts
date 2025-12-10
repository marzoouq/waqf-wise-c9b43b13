/**
 * Biometric Authentication Service
 * خدمة المصادقة بالبصمة
 */

import { supabase } from '@/integrations/supabase/client';

export interface BiometricCredential {
  id: string;
  credential_id: string;
  device_name: string | null;
  device_type: string | null;
  created_at: string;
  last_used_at: string | null;
}

export interface WebAuthnCredentialRecord {
  credential_id: string;
  user_id: string;
}

export const BiometricService = {
  /**
   * جلب بيانات الاعتماد للمستخدم الحالي
   */
  async fetchUserCredentials(userId: string): Promise<BiometricCredential[]> {
    const { data, error } = await supabase
      .from('webauthn_credentials')
      .select('id, credential_id, device_name, device_type, created_at, last_used_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * جلب جميع credentials للمصادقة
   */
  async fetchAllCredentialsForAuth(): Promise<WebAuthnCredentialRecord[]> {
    const { data, error } = await supabase
      .from('webauthn_credentials')
      .select('credential_id, user_id')
      .limit(50);

    if (error) throw error;
    return data || [];
  },

  /**
   * تسجيل credential جديد
   */
  async registerCredential(params: {
    userId: string;
    credentialId: string;
    publicKey: string;
    deviceName: string;
    deviceType: string;
  }): Promise<void> {
    const { error } = await supabase
      .from('webauthn_credentials')
      .insert({
        user_id: params.userId,
        credential_id: params.credentialId,
        public_key: params.publicKey,
        device_name: params.deviceName,
        device_type: params.deviceType,
      });

    if (error) throw error;
  },

  /**
   * حذف credential
   */
  async deleteCredential(credentialId: string): Promise<void> {
    const { error } = await supabase
      .from('webauthn_credentials')
      .delete()
      .eq('id', credentialId);

    if (error) throw error;
  },

  /**
   * استدعاء Edge Function للمصادقة
   */
  async authenticateViaEdgeFunction(params: {
    credentialId: string;
    userId: string;
    challenge: string;
  }): Promise<{ success: boolean; token_hash?: string; email?: string; error?: string }> {
    const { data, error } = await supabase.functions.invoke('biometric-auth', {
      body: {
        credentialId: params.credentialId,
        userId: params.userId,
        challenge: params.challenge,
      },
    });

    if (error) throw error;
    return data;
  },

  /**
   * التحقق من OTP
   */
  async verifyOtp(email: string, tokenHash: string): Promise<void> {
    const { error } = await supabase.auth.verifyOtp({
      email,
      token_hash: tokenHash,
      type: 'magiclink',
    });

    if (error) throw error;
  },

  /**
   * الحصول على المستخدم الحالي
   */
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },
};
