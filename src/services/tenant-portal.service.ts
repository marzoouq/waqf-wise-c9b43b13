/**
 * Tenant Portal Service
 * خدمة بوابة المستأجرين
 * @version 1.0.0
 */

import { supabase } from "@/integrations/supabase/client";

const TENANT_SESSION_KEY = "tenant_session";
const TENANT_DATA_KEY = "tenant_data";

export interface TenantData {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  tenantNumber?: string;
}

export interface TenantContract {
  id: string;
  contract_id: string;
  contract_number: string;
  start_date: string;
  end_date: string;
  status: string;
  property_id: string;
  property_name: string;
  property_address?: string;
  unit_id?: string;
  unit_name?: string;
  unit_number?: string;
}

export interface TenantMaintenanceRequest {
  id: string;
  request_number: string;
  title: string;
  description: string | null;
  category: string;
  priority: string;
  status: string;
  location_in_unit: string | null;
  images: string[];
  preferred_date: string | null;
  preferred_time_slot: string | null;
  is_urgent: boolean;
  tenant_notes: string | null;
  admin_response: string | null;
  rating: number | null;
  rating_feedback: string | null;
  scheduled_date: string | null;
  completed_date: string | null;
  created_at: string;
  updated_at: string;
  property_id?: string;
  unit_id?: string | null;
  property_name?: string;
  unit_name?: string | null;
  properties: { id: string; name: string; address?: string } | null;
  property_units?: { id: string; unit_number: string; unit_name?: string } | null;
}

export interface TenantNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  related_request_id: string | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export interface CreateMaintenanceRequestData {
  propertyId: string;
  unitId?: string;
  title: string;
  description?: string;
  category: string;
  priority?: string;
  locationInUnit?: string;
  images?: string[];
  preferredDate?: string;
  preferredTimeSlot?: string;
  contactPreference?: "phone" | "email" | "whatsapp";
  contactPhone?: string;
  contactEmail?: string;
  isUrgent?: boolean;
  tenantNotes?: string;
}

export class TenantPortalService {
  /**
   * إرسال رمز OTP
   */
  static async sendOtp(phone: string): Promise<{ success: boolean; tenantName?: string; devOtp?: string; error?: string }> {
    const { data, error } = await supabase.functions.invoke("tenant-send-otp", {
      body: { phone },
    });

    if (error) {
      console.error("Error sending OTP:", error);
      return { success: false, error: "فشل في إرسال رمز التحقق" };
    }

    return data;
  }

  /**
   * التحقق من رمز OTP
   */
  static async verifyOtp(phone: string, otp: string): Promise<{ success: boolean; tenant?: TenantData; error?: string }> {
    const { data, error } = await supabase.functions.invoke("tenant-verify-otp", {
      body: { phone, otp },
    });

    if (error) {
      console.error("Error verifying OTP:", error);
      return { success: false, error: "فشل في التحقق من الرمز" };
    }

    if (data.success && data.sessionToken) {
      // حفظ الجلسة
      localStorage.setItem(TENANT_SESSION_KEY, data.sessionToken);
      localStorage.setItem(TENANT_DATA_KEY, JSON.stringify(data.tenant));
    }

    return { success: data.success, tenant: data.tenant, error: data.error };
  }

  /**
   * جلب توكن الجلسة
   */
  static getSessionToken(): string | null {
    return localStorage.getItem(TENANT_SESSION_KEY);
  }

  /**
   * جلب بيانات المستأجر المحفوظة
   */
  static getCachedTenant(): TenantData | null {
    const data = localStorage.getItem(TENANT_DATA_KEY);
    return data ? JSON.parse(data) : null;
  }

  /**
   * استدعاء API البوابة
   */
  private static async callPortalApi<T>(action: string, method: "GET" | "POST" = "GET", body?: unknown): Promise<T> {
    const sessionToken = this.getSessionToken();
    
    if (!sessionToken) {
      throw new Error("غير مسجل الدخول");
    }

    // استخدام fetch مع query param للـ action
    const url = new URL(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tenant-portal`);
    url.searchParams.set("action", action);

    const response = await fetch(url.toString(), {
      method,
      headers: {
        "Content-Type": "application/json",
        "x-tenant-session": sessionToken,
        "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      },
      body: method === "POST" ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorData = await response.json();
      if (response.status === 401) {
        // الجلسة منتهية
        this.logout();
        throw new Error("انتهت صلاحية الجلسة");
      }
      throw new Error(errorData.error || "حدث خطأ");
    }

    return response.json();
  }

  /**
   * جلب الملف الشخصي والعقود
   */
  static async getProfile(): Promise<{ tenant: TenantData; contracts: TenantContract[] }> {
    return this.callPortalApi("profile", "GET");
  }

  /**
   * جلب طلبات الصيانة
   */
  static async getMaintenanceRequests(): Promise<{ requests: TenantMaintenanceRequest[] }> {
    return this.callPortalApi("requests", "GET");
  }

  /**
   * إنشاء طلب صيانة جديد
   */
  static async createMaintenanceRequest(data: CreateMaintenanceRequestData): Promise<{ success: boolean; request: TenantMaintenanceRequest }> {
    return this.callPortalApi("create-request", "POST", data);
  }

  /**
   * تقييم طلب صيانة
   */
  static async rateRequest(requestId: string, rating: number, feedback?: string): Promise<{ success: boolean }> {
    return this.callPortalApi("rate-request", "POST", { requestId, rating, feedback });
  }

  /**
   * جلب الإشعارات
   */
  static async getNotifications(): Promise<{ notifications: TenantNotification[] }> {
    return this.callPortalApi("notifications", "GET");
  }

  /**
   * تحديد إشعار كمقروء
   */
  static async markNotificationRead(notificationId: string): Promise<{ success: boolean }> {
    return this.callPortalApi("mark-read", "POST", { notificationId });
  }

  /**
   * تسجيل الخروج
   */
  static async logout(): Promise<void> {
    try {
      const sessionToken = this.getSessionToken();
      if (sessionToken) {
        await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tenant-portal?action=logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-tenant-session": sessionToken,
            "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
        });
      }
    } finally {
      localStorage.removeItem(TENANT_SESSION_KEY);
      localStorage.removeItem(TENANT_DATA_KEY);
    }
  }

  /**
   * التحقق من صلاحية الجلسة
   */
  static isLoggedIn(): boolean {
    return !!this.getSessionToken();
  }
}
