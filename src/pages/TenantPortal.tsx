/**
 * Tenant Portal Page
 * بوابة المستأجرين لطلبات الصيانة
 * @version 1.3.0
 */

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Building2, Phone, Wrench, Bell, LogOut, Plus, Star, Clock, CheckCircle2, FileText, AlertCircle } from "lucide-react";
import { useTenantAuth, useTenantProfile, useTenantMaintenanceRequests, useTenantNotifications } from "@/hooks/tenant-portal/useTenantPortal";
import { CreateMaintenanceRequestDialog } from "@/components/tenant-portal/CreateMaintenanceRequestDialog";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

// مكون تسجيل الدخول
function TenantLogin({ authHook }: { authHook: ReturnType<typeof useTenantAuth> }) {
  const [phone, setPhone] = useState("");
  const [contractNumber, setContractNumber] = useState("");
  const [step, setStep] = useState<"phone" | "contract">("phone");
  const { sendOtp, isSendingOtp, verifyOtp, isVerifyingOtp, tenantName } = authHook;

  const handleSendOtp = () => {
    sendOtp(phone, {
      onSuccess: (data) => {
        if (data?.success) {
          setStep("contract");
        }
      }
    });
  };

  const handleVerifyContract = () => {
    verifyOtp({ phone, otp: contractNumber });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">بوابة المستأجرين</CardTitle>
          <CardDescription>تسجيل الدخول لإدارة طلبات الصيانة</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === "phone" ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="phone">رقم الهاتف</Label>
                <div className="relative">
                  <Phone className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="05xxxxxxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pe-10"
                    dir="ltr"
                  />
                </div>
              </div>
              <Button onClick={handleSendOtp} disabled={!phone || phone.length < 9 || isSendingOtp} className="w-full">
                {isSendingOtp ? "جاري التحقق..." : "متابعة"}
              </Button>
            </>
          ) : (
            <>
              {tenantName && (
                <p className="text-center text-muted-foreground">مرحباً {tenantName}</p>
              )}
              <div className="space-y-2">
                <Label htmlFor="contractNumber">رقم العقد</Label>
                <div className="relative">
                  <FileText className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="contractNumber"
                    type="text"
                    placeholder="أدخل رقم العقد"
                    value={contractNumber}
                    onChange={(e) => setContractNumber(e.target.value)}
                    className="pe-10"
                    dir="ltr"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  رقم العقد موجود في عقد الإيجار الخاص بك
                </p>
              </div>
              <Button onClick={handleVerifyContract} disabled={!contractNumber || isVerifyingOtp} className="w-full">
                {isVerifyingOtp ? "جاري التحقق..." : "تسجيل الدخول"}
              </Button>
              <Button variant="ghost" onClick={() => setStep("phone")} className="w-full">
                تغيير رقم الهاتف
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// مكون لوحة التحكم - يستقبل جميع البيانات كـ Props لتجنب تغيير عدد الـ Hooks
interface TenantDashboardProps {
  authHook: ReturnType<typeof useTenantAuth>;
  profileQuery: ReturnType<typeof useTenantProfile>;
  requestsQuery: ReturnType<typeof useTenantMaintenanceRequests>;
  notificationsHook: ReturnType<typeof useTenantNotifications>;
}

function TenantDashboard({ authHook, profileQuery, requestsQuery, notificationsHook }: TenantDashboardProps) {
  const { tenant, logout } = authHook;
  const { data: profileData } = profileQuery;
  const { data: requestsData, isLoading: loadingRequests } = requestsQuery;
  const { data: notificationsData, unreadCount, markAsRead } = notificationsHook;
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const requests = requestsData?.requests || [];
  const notifications = notificationsData?.notifications || [];
  const contracts = profileData?.contracts || [];

  // الحالات المعلقة: جديد، معلق، قيد المراجعة
  const pendingCount = requests.filter((r) => ["جديد", "معلق", "قيد المراجعة"].includes(r.status)).length;
  // الحالات قيد التنفيذ: معتمد، قيد التنفيذ
  const inProgressCount = requests.filter((r) => ["معتمد", "قيد التنفيذ"].includes(r.status)).length;
  const completedCount = requests.filter((r) => r.status === "مكتمل").length;

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      "جديد": "bg-yellow-100 text-yellow-800",
      "معلق": "bg-yellow-100 text-yellow-800",
      "قيد المراجعة": "bg-orange-100 text-orange-800",
      "معتمد": "bg-blue-100 text-blue-800",
      "قيد التنفيذ": "bg-blue-100 text-blue-800",
      "مكتمل": "bg-green-100 text-green-800",
      "ملغي": "bg-red-100 text-red-800",
    };
    return <Badge className={styles[status] || "bg-gray-100 text-gray-800"}>{status}</Badge>;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Building2 className="h-6 w-6 text-primary" />
            <span className="font-semibold">بوابة المستأجرين</span>
          </div>
          <div className="flex items-center gap-2">
            {/* Notifications Popover */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <div className="p-3 border-b">
                  <h4 className="font-semibold">الإشعارات</h4>
                </div>
                <ScrollArea className="h-[300px]">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      لا توجد إشعارات
                    </div>
                  ) : (
                    <div className="divide-y">
                      {notifications.slice(0, 10).map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-3 cursor-pointer hover:bg-muted/50 transition-colors ${!notification.is_read ? "bg-primary/5" : ""}`}
                          onClick={() => {
                            if (!notification.is_read) {
                              markAsRead(notification.id);
                            }
                          }}
                        >
                          <div className="flex items-start gap-2">
                            <AlertCircle className={`h-4 w-4 mt-0.5 ${!notification.is_read ? "text-primary" : "text-muted-foreground"}`} />
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium ${!notification.is_read ? "text-foreground" : "text-muted-foreground"}`}>
                                {notification.title}
                              </p>
                              <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                                {notification.message}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {format(new Date(notification.created_at), "dd MMM yyyy HH:mm", { locale: ar })}
                              </p>
                            </div>
                            {!notification.is_read && (
                              <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </PopoverContent>
            </Popover>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4 ms-2" />
              خروج
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Welcome */}
        <Card>
          <CardContent className="py-4">
            <p className="text-lg">مرحباً، <strong>{tenant?.fullName}</strong></p>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="py-4 text-center">
              <Clock className="h-6 w-6 mx-auto text-yellow-600 mb-2" />
              <p className="text-2xl font-bold">{pendingCount}</p>
              <p className="text-sm text-muted-foreground">معلق</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4 text-center">
              <Wrench className="h-6 w-6 mx-auto text-blue-600 mb-2" />
              <p className="text-2xl font-bold">{inProgressCount}</p>
              <p className="text-sm text-muted-foreground">قيد التنفيذ</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4 text-center">
              <CheckCircle2 className="h-6 w-6 mx-auto text-green-600 mb-2" />
              <p className="text-2xl font-bold">{completedCount}</p>
              <p className="text-sm text-muted-foreground">مكتمل</p>
            </CardContent>
          </Card>
        </div>

        {/* New Request Button */}
        <Button className="w-full" size="lg" onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-5 w-5 ms-2" />
          طلب صيانة جديد
        </Button>

        {/* Create Request Dialog */}
        <CreateMaintenanceRequestDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          contracts={contracts}
        />

        {/* Requests List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              طلبات الصيانة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loadingRequests ? (
              <p className="text-center text-muted-foreground py-8">جاري التحميل...</p>
            ) : requests.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">لا توجد طلبات</p>
            ) : (
              requests.slice(0, 5).map((request) => (
                <div key={request.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{request.title}</span>
                    {getStatusBadge(request.status)}
                  </div>
                  <p className="text-sm text-muted-foreground">{request.request_number}</p>
                  {/* عرض العقار والوحدة */}
                  {(request.property_name || request.unit_name) && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Building2 className="h-3 w-3" />
                      <span>
                        {request.property_name}
                        {request.unit_name && ` - ${request.unit_name}`}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{request.category}</span>
                    <span>{format(new Date(request.created_at), "dd MMM yyyy", { locale: ar })}</span>
                  </div>
                  {request.status === "مكتمل" && !request.rating && (
                    <Button variant="outline" size="sm" className="w-full mt-2">
                      <Star className="h-4 w-4 ms-2" />
                      قيّم الخدمة
                    </Button>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

// الصفحة الرئيسية - استدعاء جميع الـ Hooks في المستوى الأعلى (غير مشروط)
export default function TenantPortal() {
  // استدعاء جميع الـ Hooks دائماً لضمان ثبات عددها في كل render
  const authHook = useTenantAuth();
  const profileQuery = useTenantProfile();
  const requestsQuery = useTenantMaintenanceRequests();
  const notificationsHook = useTenantNotifications();

  // الآن نقرر أي مكون نعرض (بدون تغيير عدد الـ Hooks)
  if (!authHook.isLoggedIn) {
    return <TenantLogin authHook={authHook} />;
  }

  return (
    <TenantDashboard 
      authHook={authHook}
      profileQuery={profileQuery}
      requestsQuery={requestsQuery}
      notificationsHook={notificationsHook}
    />
  );
}
