import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { MobileOptimizedLayout, MobileOptimizedHeader } from "@/components/layout/MobileOptimizedLayout";
import { PageErrorBoundary } from "@/components/shared/PageErrorBoundary";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SecurityEvent } from "@/types/security";
import { Shield, AlertTriangle, CheckCircle, XCircle, Download, Users, Activity } from "lucide-react";
import { UnifiedDataTable, type Column } from "@/components/unified/UnifiedDataTable";
import { format, arLocale as ar } from "@/lib/date";
import { UnifiedKPICard } from "@/components/unified/UnifiedKPICard";
import { UnifiedStatsGrid } from "@/components/unified/UnifiedStatsGrid";
import { useSecurityDashboardData } from "@/hooks/security/useSecurityDashboardData";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/ui/use-toast";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

type TabValue = "events" | "sessions" | "attempts";

interface ActiveSession {
  id: string;
  user_id: string;
  user_email?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  last_activity?: string;
}

export default function SecurityDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = (searchParams.get("tab") as TabValue) || "events";
  const { toast } = useToast();
  
  const { securityEvents, loginAttempts, stats, isLoading } = useSecurityDashboardData();

  // جلب الجلسات النشطة من profiles
  const { data: activeSessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ["active-sessions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, last_login_at, created_at")
        .not("last_login_at", "is", null)
        .order("last_login_at", { ascending: false })
        .limit(50);
      
      if (error) throw error;
      
      return (data || []).map(p => ({
        id: p.id,
        user_id: p.id,
        user_email: p.email,
        created_at: p.created_at || new Date().toISOString(),
        last_activity: p.last_login_at,
      })) as ActiveSession[];
    },
  });

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("Security Report - تقرير الأمان", 14, 15);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleDateString("ar-SA")}`, 14, 22);
      doc.text(`Total Events: ${stats.total} | Warnings: ${stats.warning} | Errors: ${stats.error}`, 14, 28);

      let startY = 35;

      // Security Events Table
      if (securityEvents.length > 0) {
        doc.setFontSize(12);
        doc.text("Security Events", 14, startY);
        startY += 5;

        autoTable(doc, {
          head: [["Event Type", "Severity", "Status", "Date"]],
          body: securityEvents.map(e => [
            e.event_type,
            e.severity,
            e.resolved ? "Resolved" : "Pending",
            format(new Date(e.created_at), 'dd/MM/yyyy HH:mm'),
          ]),
          startY,
          styles: { fontSize: 8 },
          headStyles: { fillColor: [66, 139, 202] },
        });

        startY = (doc as any).lastAutoTable.finalY + 10;
      }

      // Login Attempts Table
      if (loginAttempts.length > 0 && startY < 180) {
        doc.setFontSize(12);
        doc.text("Login Attempts", 14, startY);
        startY += 5;

        autoTable(doc, {
          head: [["Email", "Success", "IP Address", "Date"]],
          body: loginAttempts.map(a => [
            a.user_email || "-",
            a.success ? "Yes" : "No",
            a.ip_address || "-",
            format(new Date(a.created_at), 'dd/MM/yyyy HH:mm'),
          ]),
          startY,
          styles: { fontSize: 8 },
          headStyles: { fillColor: [40, 167, 69] },
        });
      }

      doc.save("security-report.pdf");
      toast({ title: "تم التنزيل", description: "تم تنزيل تقرير الأمان بنجاح" });
    } catch (error) {
      toast({ 
        title: "خطأ", 
        description: "حدث خطأ أثناء إنشاء التقرير",
        variant: "destructive" 
      });
    }
  };

  const eventsColumns: Column<SecurityEvent>[] = [
    {
      key: "event_type",
      label: "نوع الحدث",
      render: (value: string) => {
        const types: Record<string, string> = {
          failed_login_attempt: "محاولة دخول فاشلة",
          suspicious_activity: "نشاط مشبوه",
          password_change: "تغيير كلمة المرور",
          account_locked: "قفل حساب",
          successful_login: "دخول ناجح",
          role_assigned: "تعيين دور",
          role_removed: "إزالة دور",
        };
        return types[value] || value;
      }
    },
    {
      key: "severity",
      label: "الخطورة",
      render: (value: string) => {
        const variants: Record<string, "secondary" | "default" | "destructive" | "outline"> = {
          info: "secondary",
          warning: "default",
          error: "destructive",
          critical: "destructive",
        };
        const labels: Record<string, string> = {
          info: "معلومة",
          warning: "تحذير",
          error: "خطأ",
          critical: "حرج",
        };
        return <Badge variant={variants[value]}>{labels[value] || value}</Badge>;
      }
    },
    {
      key: "description",
      label: "الوصف",
      hideOnMobile: true,
    },
    {
      key: "resolved",
      label: "الحالة",
      render: (value: boolean) => (
        value ? 
          <Badge variant="secondary">تم الحل</Badge> : 
          <Badge variant="outline">معلق</Badge>
      )
    },
    {
      key: "created_at",
      label: "التاريخ",
      hideOnTablet: true,
      render: (value: string) => format(new Date(value), 'dd/MM/yyyy HH:mm', { locale: ar })
    },
  ];

  const sessionsColumns: Column<ActiveSession>[] = [
    {
      key: "user_email",
      label: "البريد الإلكتروني",
      render: (value: string) => value || "-"
    },
    {
      key: "last_activity",
      label: "آخر نشاط",
      render: (value: string) => value ? format(new Date(value), 'dd/MM/yyyy HH:mm', { locale: ar }) : "-"
    },
    {
      key: "created_at",
      label: "تاريخ الإنشاء",
      hideOnMobile: true,
      render: (value: string) => format(new Date(value), 'dd/MM/yyyy HH:mm', { locale: ar })
    },
  ];

  const attemptsColumns: Column<any>[] = [
    {
      key: "user_email",
      label: "البريد الإلكتروني",
      render: (value: string) => value || "-"
    },
    {
      key: "success",
      label: "الحالة",
      render: (value: boolean) => (
        value ? 
          <Badge variant="secondary">ناجح</Badge> : 
          <Badge variant="destructive">فاشل</Badge>
      )
    },
    {
      key: "ip_address",
      label: "عنوان IP",
      hideOnMobile: true,
      render: (value: string) => value || "-"
    },
    {
      key: "created_at",
      label: "التاريخ",
      hideOnTablet: true,
      render: (value: string) => format(new Date(value), 'dd/MM/yyyy HH:mm', { locale: ar })
    },
  ];

  return (
    <PageErrorBoundary pageName="لوحة الأمان">
      <MobileOptimizedLayout>
        <MobileOptimizedHeader
          title="لوحة الأمان"
          description="مراقبة الأحداث الأمنية ومحاولات الدخول"
          icon={<Shield className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-primary" />}
          actions={
            <Button size="sm" variant="outline" onClick={handleExportPDF}>
              <Download className="h-4 w-4 me-2" />
              <span className="hidden sm:inline">تصدير PDF</span>
              <span className="sm:hidden">PDF</span>
            </Button>
          }
        />

        {/* الإحصائيات */}
        <UnifiedStatsGrid columns={4}>
          <UnifiedKPICard
            title="إجمالي الأحداث"
            value={stats.total}
            icon={Shield}
            variant="default"
            loading={isLoading}
          />
          <UnifiedKPICard
            title="تحذيرات"
            value={stats.warning}
            icon={AlertTriangle}
            variant="warning"
            loading={isLoading}
          />
          <UnifiedKPICard
            title="أخطاء"
            value={stats.error}
            icon={XCircle}
            variant="danger"
            loading={isLoading}
          />
          <UnifiedKPICard
            title="تم الحل"
            value={stats.resolved}
            icon={CheckCircle}
            variant="success"
            loading={isLoading}
          />
        </UnifiedStatsGrid>

        {/* Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>سجلات الأمان</CardTitle>
            <CardDescription>عرض الأحداث والجلسات ومحاولات الدخول</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={currentTab} onValueChange={handleTabChange}>
              <TabsList className="mb-4">
                <TabsTrigger value="events" className="gap-2">
                  <Activity className="h-4 w-4" />
                  <span className="hidden sm:inline">أحداث الأمان</span>
                  <span className="sm:hidden">أحداث</span>
                </TabsTrigger>
                <TabsTrigger value="sessions" className="gap-2">
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">الجلسات النشطة</span>
                  <span className="sm:hidden">جلسات</span>
                </TabsTrigger>
                <TabsTrigger value="attempts" className="gap-2">
                  <Shield className="h-4 w-4" />
                  <span className="hidden sm:inline">محاولات الدخول</span>
                  <span className="sm:hidden">محاولات</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="events">
                <UnifiedDataTable
                  columns={eventsColumns}
                  data={securityEvents}
                  loading={isLoading}
                  emptyMessage="لا توجد أحداث أمنية"
                  showMobileScrollHint={true}
                />
              </TabsContent>

              <TabsContent value="sessions">
                <UnifiedDataTable
                  columns={sessionsColumns}
                  data={activeSessions}
                  loading={sessionsLoading}
                  emptyMessage="لا توجد جلسات نشطة"
                  showMobileScrollHint={true}
                />
              </TabsContent>

              <TabsContent value="attempts">
                <UnifiedDataTable
                  columns={attemptsColumns}
                  data={loginAttempts}
                  loading={isLoading}
                  emptyMessage="لا توجد محاولات دخول"
                  showMobileScrollHint={true}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </MobileOptimizedLayout>
    </PageErrorBoundary>
  );
}
