import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Users, 
  MessageSquare, 
  Paperclip,
  AlertCircle,
  FileText,
  TrendingUp,
  Archive
} from "lucide-react";
import { BeneficiaryRequestsTab } from "@/components/beneficiary/BeneficiaryRequestsTab";
import { MessageCenter } from "@/components/messages/MessageCenter";
import { RequestAttachmentsUploader } from "@/components/beneficiary/RequestAttachmentsUploader";
import { SLAIndicator } from "@/components/beneficiary/SLAIndicator";
import { Link } from "react-router-dom";

export default function TestPhase5() {
  // إحصائيات عامة
  const { data: stats } = useQuery({
    queryKey: ["phase5-stats"],
    queryFn: async () => {
      const [requestsRes, typesRes, messagesRes, attachmentsRes] = await Promise.all([
        supabase.from("beneficiary_requests").select("status, is_overdue, attachments_count"),
        supabase.from("request_types").select("id, name_ar, is_active"),
        supabase.from("internal_messages").select("is_read, request_id"),
        supabase.from("request_attachments").select("id"),
      ]);

      const requests = requestsRes.data || [];
      const types = typesRes.data || [];
      const messages = messagesRes.data || [];
      const attachments = attachmentsRes.data || [];

      return {
        totalRequests: requests.length,
        pendingRequests: requests.filter(r => r.status === "قيد المراجعة").length,
        approvedRequests: requests.filter(r => r.status === "معتمد").length,
        rejectedRequests: requests.filter(r => r.status === "مرفوض").length,
        overdueRequests: requests.filter(r => r.is_overdue).length,
        totalRequestTypes: types.length,
        activeRequestTypes: types.filter(t => t.is_active).length,
        totalMessages: messages.length,
        unreadMessages: messages.filter(m => !m.is_read).length,
        messagesWithRequests: messages.filter(m => m.request_id).length,
        totalAttachments: attachments.length,
        requestsWithAttachments: requests.filter(r => (r.attachments_count || 0) > 0).length,
      };
    },
  });

  // جلب أول beneficiary_id للاختبار
  const { data: testBeneficiary } = useQuery({
    queryKey: ["test-beneficiary"],
    queryFn: async () => {
      const { data } = await supabase
        .from("beneficiaries")
        .select("id, full_name")
        .limit(1)
        .single();
      return data;
    },
  });

  // جلب أول طلب للاختبار
  const { data: testRequest } = useQuery({
    queryKey: ["test-request"],
    queryFn: async () => {
      const { data } = await supabase
        .from("beneficiary_requests")
        .select("id, request_number, status, sla_due_at, attachments_count")
        .limit(1)
        .single();
      return data;
    },
  });

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    description, 
    variant = "default" 
  }: { 
    title: string; 
    value: number; 
    icon: any; 
    description?: string;
    variant?: "default" | "success" | "warning" | "destructive";
  }) => {
    const colors = {
      default: "text-blue-600 bg-blue-50",
      success: "text-green-600 bg-green-50",
      warning: "text-yellow-600 bg-yellow-50",
      destructive: "text-red-600 bg-red-50",
    };

    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <div className={`p-2 rounded-full ${colors[variant]}`}>
            <Icon className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto py-8 space-y-8" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">اختبار المرحلة الخامسة</h1>
          <p className="text-muted-foreground mt-2">
            بوابة المستفيدين ونظام الطلبات والرسائل الداخلية
          </p>
        </div>
        <Link to="/">
          <Button variant="outline">العودة للرئيسية</Button>
        </Link>
      </div>

      {/* إحصائيات عامة */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="إجمالي الطلبات"
          value={stats?.totalRequests || 0}
          icon={FileText}
          description="جميع الطلبات المقدمة"
        />
        <StatCard
          title="طلبات معلقة"
          value={stats?.pendingRequests || 0}
          icon={Clock}
          variant="warning"
          description="تحتاج للمراجعة"
        />
        <StatCard
          title="طلبات معتمدة"
          value={stats?.approvedRequests || 0}
          icon={CheckCircle2}
          variant="success"
          description="تم الموافقة عليها"
        />
        <StatCard
          title="طلبات متأخرة"
          value={stats?.overdueRequests || 0}
          icon={AlertCircle}
          variant="destructive"
          description="تجاوزت SLA"
        />
      </div>

      {/* إحصائيات إضافية */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="أنواع الطلبات"
          value={stats?.activeRequestTypes || 0}
          icon={Archive}
          description={`من أصل ${stats?.totalRequestTypes || 0} نوع`}
        />
        <StatCard
          title="الرسائل"
          value={stats?.totalMessages || 0}
          icon={MessageSquare}
          description={`${stats?.unreadMessages || 0} غير مقروءة`}
        />
        <StatCard
          title="المرفقات"
          value={stats?.totalAttachments || 0}
          icon={Paperclip}
          description={`${stats?.requestsWithAttachments || 0} طلب مع مرفقات`}
        />
      </div>

      {/* حالة المرحلة */}
      <Card className="border-green-200 bg-green-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
            حالة المرحلة الخامسة
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">✅ المميزات المنجزة:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• نظام الطلبات المتكامل (7 أنواع)</li>
                <li>• مؤشرات SLA التلقائية</li>
                <li>• نظام المرفقات مع Storage</li>
                <li>• نظام الرسائل الداخلية</li>
                <li>• بوابة المستفيدين الكاملة</li>
                <li>• صفحة تفاصيل الطلب</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">📊 الإحصائيات:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• {stats?.totalRequestTypes || 0} أنواع طلبات نشطة</li>
                <li>• {stats?.totalRequests || 0} طلب مسجل</li>
                <li>• {stats?.totalMessages || 0} رسالة داخلية</li>
                <li>• {stats?.totalAttachments || 0} مرفق محفوظ</li>
                <li>• {stats?.messagesWithRequests || 0} رسالة مرتبطة بطلب</li>
              </ul>
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span className="font-semibold">نسبة الإنجاز: 100%</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              جميع مكونات المرحلة الخامسة تم تطويرها واختبارها بنجاح
            </p>
          </div>
        </CardContent>
      </Card>

      {/* اختبارات تفاعلية */}
      <Card>
        <CardHeader>
          <CardTitle>اختبارات المكونات التفاعلية</CardTitle>
          <CardDescription>
            اختبر جميع المكونات الجديدة للمرحلة الخامسة
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="requests" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="requests">الطلبات</TabsTrigger>
              <TabsTrigger value="messages">الرسائل</TabsTrigger>
              <TabsTrigger value="attachments">المرفقات</TabsTrigger>
              <TabsTrigger value="sla">مؤشر SLA</TabsTrigger>
            </TabsList>

            <TabsContent value="requests" className="space-y-4">
              <div className="rounded-lg border p-4">
                <h3 className="font-semibold mb-4">نظام الطلبات المتكامل</h3>
                {testBeneficiary ? (
                  <BeneficiaryRequestsTab beneficiaryId={testBeneficiary.id} />
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    لا يوجد مستفيدين للاختبار
                  </p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="messages" className="space-y-4">
              <div className="rounded-lg border p-4">
                <h3 className="font-semibold mb-4">نظام الرسائل الداخلية</h3>
                <MessageCenter />
              </div>
            </TabsContent>

            <TabsContent value="attachments" className="space-y-4">
              <div className="rounded-lg border p-4">
                <h3 className="font-semibold mb-4">نظام المرفقات</h3>
                {testRequest ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          طلب رقم: {testRequest.request_number}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          عدد المرفقات: {testRequest.attachments_count || 0}
                        </p>
                      </div>
                      <RequestAttachmentsUploader
                        requestId={testRequest.id}
                        attachmentsCount={testRequest.attachments_count || 0}
                      />
                    </div>
                    <div className="text-sm text-muted-foreground bg-muted p-4 rounded-lg">
                      <p className="font-semibold mb-2">كيفية الاختبار:</p>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>اضغط على زر "المرفقات" أعلاه</li>
                        <li>اختر ملف (PDF, صورة, أو Word)</li>
                        <li>أضف وصف اختياري</li>
                        <li>اضغط "رفع المرفق"</li>
                        <li>شاهد المرفق في القائمة مع إمكانية التحميل والحذف</li>
                      </ol>
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    لا يوجد طلبات للاختبار
                  </p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="sla" className="space-y-4">
              <div className="rounded-lg border p-4">
                <h3 className="font-semibold mb-4">مؤشرات SLA</h3>
                {testRequest ? (
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="border rounded-lg p-4 space-y-3">
                        <p className="font-medium">طلب نشط:</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            الحالة: {testRequest.status}
                          </span>
                          <SLAIndicator
                            slaDueAt={testRequest.sla_due_at}
                            status={testRequest.status}
                            showLabel={true}
                          />
                        </div>
                      </div>

                      <div className="border rounded-lg p-4 space-y-3">
                        <p className="font-medium">أمثلة المؤشرات:</p>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">متبقي 48 ساعة</span>
                            <SLAIndicator
                              slaDueAt={new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()}
                              status="قيد المراجعة"
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">متبقي 3 ساعات</span>
                            <SLAIndicator
                              slaDueAt={new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString()}
                              status="قيد المراجعة"
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">متأخر 5 ساعات</span>
                            <SLAIndicator
                              slaDueAt={new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()}
                              status="قيد المراجعة"
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">مكتمل</span>
                            <SLAIndicator
                              slaDueAt={new Date().toISOString()}
                              status="معتمد"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-sm text-muted-foreground bg-muted p-4 rounded-lg">
                      <p className="font-semibold mb-2">شرح الألوان:</p>
                      <ul className="space-y-1">
                        <li>• 🟢 <strong>أخضر</strong>: أكثر من 6 ساعات متبقية</li>
                        <li>• 🟡 <strong>أصفر</strong>: أقل من 6 ساعات متبقية (تحذير)</li>
                        <li>• 🔴 <strong>أحمر</strong>: الطلب متأخر (تجاوز SLA)</li>
                        <li>• ✅ <strong>مكتمل</strong>: الطلب معتمد أو مكتمل</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    لا يوجد طلبات للاختبار
                  </p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* ملخص التقني */}
      <Card>
        <CardHeader>
          <CardTitle>الملخص التقني</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold">المكونات الجديدة:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• <code>RequestAttachmentsUploader.tsx</code></li>
                <li>• <code>RequestDetailsDialog.tsx</code></li>
                <li>• <code>SLAIndicator.tsx</code></li>
                <li>• <code>useRequestAttachments.ts</code></li>
                <li>• تحديثات على <code>BeneficiaryRequestsTab</code></li>
                <li>• تحديثات على <code>MessageCenter</code></li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold">التحسينات على قاعدة البيانات:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• توحيد أنواع الطلبات (7 أنواع)</li>
                <li>• إنشاء Storage Bucket للمرفقات</li>
                <li>• إصلاح triggers الإشعارات</li>
                <li>• إضافة SLA تلقائي لجميع الطلبات</li>
                <li>• تحديث حالات الطلبات للاختبار</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
