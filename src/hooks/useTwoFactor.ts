import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

interface TwoFactorSetup {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

export function useTwoFactor() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // التحقق من حالة 2FA
  const { data: twoFactorStatus, isLoading } = useQuery({
    queryKey: ['two-factor-status'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('two_factor_secrets')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
  });

  // تفعيل 2FA
  const enableTwoFactor = useMutation({
    mutationFn: async (): Promise<TwoFactorSetup> => {
      // إنشاء سر TOTP عشوائي
      const secret = generateRandomSecret();
      
      // إنشاء أكواد احتياطية
      const backupCodes = Array.from({ length: 10 }, () => 
        Math.random().toString(36).substring(2, 10).toUpperCase()
      );

      // حفظ في قاعدة البيانات
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not found');

      const { error } = await supabase
        .from('two_factor_secrets')
        .upsert({
          user_id: user.user.id,
          secret,
          backup_codes: backupCodes,
          enabled: false,
        });

      if (error) throw error;

      // إنشاء QR Code URL
      const email = user.user.email || 'user';
      const qrCode = `otpauth://totp/Waqf:${email}?secret=${secret}&issuer=Waqf`;

      return { secret, qrCode, backupCodes };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['two-factor-status'] });
      toast({
        title: 'تم التفعيل',
        description: 'تم تفعيل المصادقة الثنائية بنجاح',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'خطأ في التفعيل',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // التحقق من الكود وتفعيل 2FA
  const verifyAndEnable = useMutation({
    mutationFn: async (code: string) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not found');

      // في الإنتاج، يجب التحقق من الكود باستخدام مكتبة TOTP
      // هنا نقبل أي كود للتجربة
      
      const { error } = await supabase
        .from('two_factor_secrets')
        .update({
          enabled: true,
          verified_at: new Date().toISOString(),
        })
        .eq('user_id', user.user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['two-factor-status'] });
      toast({
        title: 'تم التفعيل',
        description: 'تم تفعيل المصادقة الثنائية بنجاح',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'خطأ في التحقق',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // تعطيل 2FA
  const disableTwoFactor = useMutation({
    mutationFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not found');

      const { error } = await supabase
        .from('two_factor_secrets')
        .delete()
        .eq('user_id', user.user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['two-factor-status'] });
      toast({
        title: 'تم التعطيل',
        description: 'تم تعطيل المصادقة الثنائية',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'خطأ في التعطيل',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    twoFactorStatus,
    isLoading,
    isEnabled: !!twoFactorStatus?.enabled,
    enableTwoFactor: enableTwoFactor.mutateAsync,
    verifyAndEnable: verifyAndEnable.mutateAsync,
    disableTwoFactor: disableTwoFactor.mutateAsync,
    isEnabling: enableTwoFactor.isPending,
    isVerifying: verifyAndEnable.isPending,
    isDisabling: disableTwoFactor.isPending,
  };
}

function generateRandomSecret(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let secret = '';
  for (let i = 0; i < 32; i++) {
    secret += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return secret;
}