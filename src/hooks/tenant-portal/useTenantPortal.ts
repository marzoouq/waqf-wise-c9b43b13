/**
 * Tenant Portal Hooks
 * خطافات بوابة المستأجرين
 * @version 1.0.0
 */

import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  TenantPortalService, 
  type TenantData, 
  type CreateMaintenanceRequestData 
} from "@/services/tenant-portal.service";
import { useToast } from "@/hooks/ui/use-toast";

// ===================== مفاتيح الاستعلام =====================
export const TENANT_QUERY_KEYS = {
  profile: ["tenant", "profile"],
  requests: ["tenant", "requests"],
  notifications: ["tenant", "notifications"],
};

// ===================== مصادقة المستأجر =====================
export function useTenantAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => TenantPortalService.isLoggedIn());
  const [tenant, setTenant] = useState<TenantData | null>(() => TenantPortalService.getCachedTenant());
  const { toast } = useToast();

  // إرسال OTP
  const sendOtpMutation = useMutation({
    mutationFn: (phone: string) => TenantPortalService.sendOtp(phone),
    onSuccess: (data) => {
      if (data.success) {
        toast({ title: "تم الإرسال", description: "تم إرسال رمز التحقق إلى هاتفك" });
      } else {
        toast({ title: "خطأ", description: data.error || "فشل في إرسال الرمز", variant: "destructive" });
      }
    },
    onError: () => {
      toast({ title: "خطأ", description: "فشل في إرسال رمز التحقق", variant: "destructive" });
    },
  });

  // التحقق من OTP
  const verifyOtpMutation = useMutation({
    mutationFn: ({ phone, otp }: { phone: string; otp: string }) => TenantPortalService.verifyOtp(phone, otp),
    onSuccess: (data) => {
      if (data.success && data.tenant) {
        setIsLoggedIn(true);
        setTenant(data.tenant);
        toast({ title: "مرحباً", description: `أهلاً بك ${data.tenant.fullName}` });
      } else {
        toast({ title: "خطأ", description: data.error || "رمز التحقق غير صحيح", variant: "destructive" });
      }
    },
    onError: () => {
      toast({ title: "خطأ", description: "فشل في التحقق من الرمز", variant: "destructive" });
    },
  });

  // تسجيل الخروج
  const logout = useCallback(async () => {
    await TenantPortalService.logout();
    setIsLoggedIn(false);
    setTenant(null);
    toast({ title: "تسجيل الخروج", description: "تم تسجيل الخروج بنجاح" });
  }, [toast]);

  return {
    isLoggedIn,
    tenant,
    sendOtp: sendOtpMutation.mutate,
    isSendingOtp: sendOtpMutation.isPending,
    verifyOtp: verifyOtpMutation.mutate,
    isVerifyingOtp: verifyOtpMutation.isPending,
    devOtp: sendOtpMutation.data?.devOtp,
    tenantName: sendOtpMutation.data?.tenantName,
    logout,
  };
}

// ===================== بيانات المستأجر =====================
export function useTenantProfile() {
  return useQuery({
    queryKey: TENANT_QUERY_KEYS.profile,
    queryFn: () => TenantPortalService.getProfile(),
    enabled: TenantPortalService.isLoggedIn(),
    staleTime: 5 * 60 * 1000,
  });
}

// ===================== طلبات الصيانة =====================
export function useTenantMaintenanceRequests() {
  return useQuery({
    queryKey: TENANT_QUERY_KEYS.requests,
    queryFn: () => TenantPortalService.getMaintenanceRequests(),
    enabled: TenantPortalService.isLoggedIn(),
    refetchInterval: 30 * 1000, // تحديث كل 30 ثانية
  });
}

export function useCreateTenantRequest() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreateMaintenanceRequestData) => TenantPortalService.createMaintenanceRequest(data),
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: TENANT_QUERY_KEYS.requests });
        queryClient.invalidateQueries({ queryKey: TENANT_QUERY_KEYS.notifications });
        toast({ title: "تم الإرسال", description: `تم إنشاء طلب الصيانة رقم ${data.request.request_number}` });
      }
    },
    onError: (error: Error) => {
      toast({ title: "خطأ", description: error.message || "فشل في إنشاء الطلب", variant: "destructive" });
    },
  });
}

export function useRateRequest() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ requestId, rating, feedback }: { requestId: string; rating: number; feedback?: string }) =>
      TenantPortalService.rateRequest(requestId, rating, feedback),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TENANT_QUERY_KEYS.requests });
      toast({ title: "شكراً", description: "تم حفظ تقييمك بنجاح" });
    },
    onError: () => {
      toast({ title: "خطأ", description: "فشل في حفظ التقييم", variant: "destructive" });
    },
  });
}

// ===================== الإشعارات =====================
export function useTenantNotifications() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: TENANT_QUERY_KEYS.notifications,
    queryFn: () => TenantPortalService.getNotifications(),
    enabled: TenantPortalService.isLoggedIn(),
    refetchInterval: 60 * 1000,
  });

  const markAsRead = useMutation({
    mutationFn: (notificationId: string) => TenantPortalService.markNotificationRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TENANT_QUERY_KEYS.notifications });
    },
  });

  const unreadCount = query.data?.notifications?.filter((n) => !n.is_read).length || 0;

  return {
    ...query,
    markAsRead: markAsRead.mutate,
    unreadCount,
  };
}
