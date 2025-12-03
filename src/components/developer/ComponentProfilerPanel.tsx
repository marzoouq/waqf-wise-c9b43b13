/**
 * لوحة تحليل أداء المكونات
 * تعرض أداء كل مكون في التطبيق
 */
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  RefreshCw,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  TrendingUp,
  AlertCircle,
  Zap,
  MemoryStick,
} from "lucide-react";
import { useComponentProfiler, type ComponentProfile } from "@/hooks/developer/useComponentProfiler";

export function ComponentProfilerPanel() {
  const { profiles, report, refreshProfiles, clearProfiles } = useComponentProfiler(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<'renders' | 'time' | 'status'>('renders');

  // تصفية وترتيب المكونات
  const filteredProfiles = profiles
    .filter(p => !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      switch (sortBy) {
        case 'renders': return b.renderCount - a.renderCount;
        case 'time': return b.avgRenderTime - a.avgRenderTime;
        case 'status': return a.status === 'critical' ? -1 : b.status === 'critical' ? 1 : 0;
        default: return 0;
      }
    });

  // الحصول على أيقونة الحالة
  const getStatusIcon = (status: ComponentProfile['status']) => {
    switch (status) {
      case 'healthy': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'critical': return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  // الحصول على شارة الحالة
  const getStatusBadge = (status: ComponentProfile['status']) => {
    switch (status) {
      case 'healthy': return <Badge className="bg-green-500">صحي</Badge>;
      case 'warning': return <Badge className="bg-yellow-500 text-black">تحذير</Badge>;
      case 'critical': return <Badge variant="destructive">حرج</Badge>;
    }
  };

  // حساب لون شريط التقدم
  const getProgressColor = (value: number, max: number) => {
    const percent = (value / max) * 100;
    if (percent < 33) return 'bg-green-500';
    if (percent < 66) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      {/* ملخص التقرير */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              <div>
                <div className="text-2xl font-bold">{report?.totalComponents ?? 0}</div>
                <p className="text-sm text-muted-foreground">إجمالي المكونات</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{report?.healthyComponents ?? 0}</div>
                <p className="text-sm text-muted-foreground">صحية</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <div>
                <div className="text-2xl font-bold">{report?.warningComponents ?? 0}</div>
                <p className="text-sm text-muted-foreground">تحذيرات</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <div>
                <div className="text-2xl font-bold">{report?.criticalComponents ?? 0}</div>
                <p className="text-sm text-muted-foreground">حرجة</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <MemoryStick className="h-5 w-5 text-orange-500" />
              <div>
                <div className="text-2xl font-bold">{report?.suspectedMemoryLeaks?.length ?? 0}</div>
                <p className="text-sm text-muted-foreground">تسرب محتمل</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* التوصيات */}
      {report?.recommendations && report.recommendations.length > 0 && (
        <Card className="border-yellow-500/50 bg-yellow-500/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-600">
              <AlertCircle className="h-5 w-5" />
              توصيات التحسين
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {report.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Zap className="h-4 w-4 mt-0.5 text-yellow-600" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* أزرار التحكم */}
      <div className="flex flex-wrap gap-2">
        <Button onClick={refreshProfiles} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          تحديث
        </Button>
        <Button variant="outline" onClick={clearProfiles} className="gap-2">
          <Trash2 className="h-4 w-4" />
          مسح البيانات
        </Button>
      </div>

      {/* البحث والترتيب */}
      <div className="flex flex-wrap gap-4">
        <Input
          placeholder="بحث عن مكون..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
        <div className="flex gap-2">
          <Button
            variant={sortBy === 'renders' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('renders')}
          >
            حسب الرسم
          </Button>
          <Button
            variant={sortBy === 'time' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('time')}
          >
            حسب الوقت
          </Button>
          <Button
            variant={sortBy === 'status' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('status')}
          >
            حسب الحالة
          </Button>
        </div>
      </div>

      {/* قائمة المكونات */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            تحليل المكونات ({filteredProfiles.length})
          </CardTitle>
          <CardDescription>
            أداء كل مكون في الوقت الحقيقي
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            {filteredProfiles.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Layers className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>لا توجد بيانات مكونات</p>
                <p className="text-sm">سيتم تحديث البيانات تلقائياً</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredProfiles.map((profile) => (
                  <div
                    key={profile.name}
                    className="p-4 rounded-lg border bg-card"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(profile.status)}
                        <span className="font-mono font-medium">{profile.name}</span>
                        {getStatusBadge(profile.status)}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        آخر رسم: {profile.lastRenderedAt.toLocaleTimeString('ar-SA')}
                      </span>
                    </div>

                    <div className="grid gap-4 md:grid-cols-4">
                      <div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                          <TrendingUp className="h-3 w-3" />
                          عدد الرسم
                        </div>
                        <div className="text-lg font-bold">{profile.renderCount}</div>
                      </div>

                      <div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                          <Clock className="h-3 w-3" />
                          متوسط الوقت
                        </div>
                        <div className="text-lg font-bold">{profile.avgRenderTime.toFixed(2)}ms</div>
                      </div>

                      <div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                          <Zap className="h-3 w-3" />
                          أقصى وقت
                        </div>
                        <div className="text-lg font-bold">{profile.maxRenderTime.toFixed(2)}ms</div>
                      </div>

                      <div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                          <Layers className="h-3 w-3" />
                          تحميل/إزالة
                        </div>
                        <div className="text-lg font-bold">{profile.mountCount}/{profile.unmountCount}</div>
                      </div>
                    </div>

                    {/* شريط الأداء */}
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>وقت الرسم</span>
                        <span>{profile.avgRenderTime.toFixed(2)}ms / 16ms</span>
                      </div>
                      <Progress 
                        value={Math.min((profile.avgRenderTime / 16) * 100, 100)} 
                        className="h-2"
                      />
                    </div>

                    {/* التحذيرات */}
                    {profile.warnings.length > 0 && (
                      <div className="mt-3 p-2 rounded bg-yellow-500/10 border border-yellow-500/30">
                        <ul className="text-sm text-yellow-600 space-y-1">
                          {profile.warnings.map((warning, i) => (
                            <li key={i} className="flex items-start gap-1">
                              <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                              {warning}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* أبطأ المكونات */}
      {report?.slowestComponents && report.slowestComponents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              أبطأ المكونات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {report.slowestComponents.slice(0, 5).map((profile, index) => (
                <div key={profile.name} className="flex items-center justify-between p-2 rounded border">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">#{index + 1}</span>
                    <code className="text-sm">{profile.name}</code>
                  </div>
                  <Badge variant={profile.avgRenderTime > 16 ? 'destructive' : 'secondary'}>
                    {profile.avgRenderTime.toFixed(2)}ms
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
