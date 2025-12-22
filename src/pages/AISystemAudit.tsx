import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAISystemAudit, AUDIT_CATEGORIES } from '@/hooks/ai/useAISystemAudit';
import { 
  Play, RefreshCw, CheckCircle, XCircle, AlertTriangle, 
  Info, Shield, Database, Gauge, LayoutDashboard, Undo2,
  Clock, FileText, Trash2
} from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

const severityConfig = {
  critical: { color: 'bg-destructive text-destructive-foreground', icon: XCircle, label: 'حرج' },
  warning: { color: 'bg-yellow-500 text-white', icon: AlertTriangle, label: 'تحذير' },
  info: { color: 'bg-blue-500 text-white', icon: Info, label: 'معلومة' },
  success: { color: 'bg-green-500 text-white', icon: CheckCircle, label: 'سليم' }
};

export default function AISystemAudit() {
  const {
    audits, pendingFixes, auditStats, categories,
    isAuditing, auditProgress, isLoadingAudits, isLoadingFixes,
    runAudit, approveFix, rejectFix, rollbackFix, deleteAudit,
    isApproving, isRejecting, isRollingBack
  } = useAISystemAudit();

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const handleRunAudit = () => {
    runAudit(selectedCategories.length > 0 ? 'category' : 'full', 
      selectedCategories.length > 0 ? selectedCategories : undefined);
  };

  const toggleCategory = (catId: string) => {
    setSelectedCategories(prev => 
      prev.includes(catId) ? prev.filter(c => c !== catId) : [...prev, catId]
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">الفحص الذكي للنظام</h1>
          <p className="text-muted-foreground mt-1">فحص شامل بالذكاء الاصطناعي مع إصلاح تلقائي</p>
        </div>
        <Button onClick={handleRunAudit} disabled={isAuditing} size="lg">
          {isAuditing ? <RefreshCw className="ms-2 h-5 w-5 animate-spin" /> : <Play className="ms-2 h-5 w-5" />}
          {isAuditing ? 'جاري الفحص...' : 'بدء فحص جديد'}
        </Button>
      </div>

      {/* شريط التقدم */}
      {isAuditing && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>جاري فحص النظام...</span>
                <span>{auditProgress}%</span>
              </div>
              <Progress value={auditProgress} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{auditStats.totalAudits}</p>
                <p className="text-sm text-muted-foreground">إجمالي الفحوصات</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{auditStats.pendingFixesCount}</p>
                <p className="text-sm text-muted-foreground">إصلاحات معلقة</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <XCircle className="h-8 w-8 text-destructive" />
              <div>
                <p className="text-2xl font-bold">{auditStats.criticalIssues}</p>
                <p className="text-sm text-muted-foreground">مشاكل حرجة</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">
                  {auditStats.lastAudit 
                    ? format(new Date(auditStats.lastAudit.created_at), 'PPp', { locale: ar })
                    : 'لا يوجد'}
                </p>
                <p className="text-sm text-muted-foreground">آخر فحص</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* فئات الفحص */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            فئات الفحص (اختر فئات محددة أو اتركها فارغة لفحص شامل)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <Button
                key={cat.id}
                variant={selectedCategories.includes(cat.id) ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleCategory(cat.id)}
              >
                {cat.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">
            الإصلاحات المعلقة ({pendingFixes.length})
          </TabsTrigger>
          <TabsTrigger value="history">تاريخ الفحوصات</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>الإصلاحات المعلقة</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingFixes ? (
                <p className="text-center py-8 text-muted-foreground">جاري التحميل...</p>
              ) : pendingFixes.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">لا توجد إصلاحات معلقة</p>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {pendingFixes.map(fix => {
                      const config = severityConfig[fix.severity];
                      const Icon = config.icon;
                      return (
                        <div key={fix.id} className="border rounded-lg p-4 space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <Badge className={config.color}>
                                <Icon className="h-3 w-3 ms-1" />
                                {config.label}
                              </Badge>
                              <span className="font-medium">{fix.category}</span>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => approveFix(fix.id)} disabled={isApproving}>
                                <CheckCircle className="h-4 w-4 ms-1" />
                                تطبيق
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => rejectFix(fix.id)} disabled={isRejecting}>
                                <XCircle className="h-4 w-4 ms-1" />
                                رفض
                              </Button>
                              {fix.rollback_sql && (
                                <Button size="sm" variant="ghost" onClick={() => rollbackFix(fix.id)} disabled={isRollingBack}>
                                  <Undo2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">{fix.description}</p>
                          {fix.fix_sql && (
                            <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
                              {fix.fix_sql}
                            </pre>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>تاريخ الفحوصات</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingAudits ? (
                <p className="text-center py-8 text-muted-foreground">جاري التحميل...</p>
              ) : audits.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">لا توجد فحوصات سابقة</p>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {audits.map(audit => (
                      <div key={audit.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{audit.audit_type === 'full' ? 'فحص شامل' : 'فحص جزئي'}</Badge>
                            <span className="text-sm text-muted-foreground">
                              {format(new Date(audit.created_at), 'PPp', { locale: ar })}
                            </span>
                          </div>
                          <Button size="sm" variant="ghost" onClick={() => deleteAudit(audit.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                        <div className="flex gap-4">
                          <div className="flex items-center gap-1">
                            <XCircle className="h-4 w-4 text-destructive" />
                            <span className="text-sm">{audit.severity_summary?.critical || 0} حرج</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm">{audit.severity_summary?.warning || 0} تحذير</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm">{audit.severity_summary?.success || 0} سليم</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
