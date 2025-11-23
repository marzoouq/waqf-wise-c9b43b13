import { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { PageErrorBoundary } from '@/components/shared/PageErrorBoundary';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PushNotificationsSetup } from '@/components/settings/PushNotificationsSetup';
import { ScheduledReportsManager } from '@/components/reports/ScheduledReportsManager';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Bell,
  Calendar,
  Database,
  Shield,
  Settings,
  Download,
  Upload,
} from 'lucide-react';

export default function AdvancedSettings() {
  const [activeBackups, setActiveBackups] = useState(2);
  const [lastBackup, setLastBackup] = useState('2024-11-16 03:00 AM');

  return (
    <PageErrorBoundary pageName="الإعدادات المتقدمة">
      <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">الإعدادات المتقدمة</h1>
          <p className="text-muted-foreground">
            إعدادات النظام المتقدمة والمميزات الإضافية
          </p>
        </div>

        <Tabs defaultValue="notifications" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              الإشعارات
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              التقارير المجدولة
            </TabsTrigger>
            <TabsTrigger value="backup" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              النسخ الاحتياطي
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              الأمان
            </TabsTrigger>
          </TabsList>

          <TabsContent value="notifications" className="space-y-6">
            <PushNotificationsSetup />

            <Card>
              <CardHeader>
                <CardTitle>قنوات الإشعارات</CardTitle>
                <CardDescription>
                  إدارة طرق استقبال الإشعارات
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">إشعارات داخل التطبيق</h4>
                          <p className="text-sm text-muted-foreground">
                            إشعارات مباشرة في واجهة المستخدم
                          </p>
                        </div>
                        <Badge variant="default">مفعّل</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">البريد الإلكتروني</h4>
                          <p className="text-sm text-muted-foreground">
                            إرسال إشعارات عبر البريد الإلكتروني
                          </p>
                        </div>
                        <Badge variant="secondary">قريباً</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">الرسائل النصية (SMS)</h4>
                          <p className="text-sm text-muted-foreground">
                            إرسال تنبيهات عبر الرسائل النصية
                          </p>
                        </div>
                        <Badge variant="secondary">قريباً</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">إشعارات فورية (Push)</h4>
                          <p className="text-sm text-muted-foreground">
                            تنبيهات فورية على الأجهزة
                          </p>
                        </div>
                        <Badge variant="default">مفعّل</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <ScheduledReportsManager />
          </TabsContent>

          <TabsContent value="backup" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>نظام النسخ الاحتياطي التلقائي</CardTitle>
                <CardDescription>
                  جدولة وإدارة النسخ الاحتياطية للبيانات
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">النسخ النشطة</span>
                          <Badge>{activeBackups}</Badge>
                        </div>
                        <p className="text-2xl font-bold">{activeBackups} جدولة</p>
                        <p className="text-xs text-muted-foreground">
                          يومي وأسبوعي
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">آخر نسخة</span>
                          <Badge variant="default">نجح</Badge>
                        </div>
                        <p className="text-sm font-bold">{lastBackup}</p>
                        <p className="text-xs text-muted-foreground">
                          نسخة كاملة - 250 MB
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">النسخة القادمة</span>
                          <Badge variant="secondary">مجدولة</Badge>
                        </div>
                        <p className="text-sm font-bold">اليوم 11:00 PM</p>
                        <p className="text-xs text-muted-foreground">
                          نسخة تدريجية
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">الجداول المجدولة</h4>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h5 className="font-medium">نسخ احتياطي يومي كامل</h5>
                          <p className="text-sm text-muted-foreground">
                            نسخة كاملة لجميع البيانات - يومياً الساعة 3:00 صباحاً
                          </p>
                          <div className="flex gap-2 mt-2">
                            <Badge variant="outline">يومي</Badge>
                            <Badge variant="outline">30 يوم احتفاظ</Badge>
                          </div>
                        </div>
                        <Badge variant="default">نشط</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h5 className="font-medium">نسخ احتياطي أسبوعي شامل</h5>
                          <p className="text-sm text-muted-foreground">
                            نسخة شاملة مع المرفقات - كل يوم جمعة
                          </p>
                          <div className="flex gap-2 mt-2">
                            <Badge variant="outline">أسبوعي</Badge>
                            <Badge variant="outline">90 يوم احتفاظ</Badge>
                          </div>
                        </div>
                        <Badge variant="default">نشط</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex gap-2">
                  <Button>
                    <Download className="h-4 w-4 ml-2" />
                    تنزيل آخر نسخة
                  </Button>
                  <Button variant="outline">
                    <Upload className="h-4 w-4 ml-2" />
                    استعادة من نسخة
                  </Button>
                  <Button variant="outline">
                    <Settings className="h-4 w-4 ml-2" />
                    إعدادات النسخ
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>الأمان والحماية</CardTitle>
                <CardDescription>
                  إعدادات الأمان المتقدمة
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">المصادقة الثنائية (2FA)</h4>
                      <p className="text-sm text-muted-foreground">
                        طبقة أمان إضافية لتسجيل الدخول
                      </p>
                    </div>
                    <Badge variant="default">مفعّل</Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">حماية كلمات المرور المسربة</h4>
                      <p className="text-sm text-muted-foreground">
                        منع استخدام كلمات مرور مسربة سابقاً
                      </p>
                    </div>
                    <Badge variant="secondary">يُنصح بالتفعيل</Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">تسجيل العمليات (Audit Logs)</h4>
                      <p className="text-sm text-muted-foreground">
                        تسجيل جميع العمليات الحساسة
                      </p>
                    </div>
                    <Badge variant="default">مفعّل</Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">أمان على مستوى الصفوف (RLS)</h4>
                      <p className="text-sm text-muted-foreground">
                        سياسات أمان لجميع الجداول
                      </p>
                    </div>
                    <Badge variant="default">مفعّل</Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">تشفير البيانات</h4>
                      <p className="text-sm text-muted-foreground">
                        تشفير البيانات الحساسة أثناء التخزين والنقل
                      </p>
                    </div>
                    <Badge variant="default">مفعّل</Badge>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-4">إحصائيات الأمان (آخر 30 يوم)</h4>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">محاولات تسجيل فاشلة</p>
                      <p className="text-2xl font-bold">12</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">عمليات حساسة مسجلة</p>
                      <p className="text-2xl font-bold">1,247</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">مستخدمون بـ 2FA</p>
                      <p className="text-2xl font-bold">8/12</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
    </PageErrorBoundary>
  );
}