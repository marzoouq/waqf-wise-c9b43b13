/**
 * لوحة تحليل صحة الكود
 * تعرض جميع المشاكل المكتشفة في الوقت الحقيقي
 */
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  AlertCircle,
  Info,
  XCircle,
  RefreshCw,
  Trash2,
  Download,
  Shield,
  Zap,
  Globe,
  Database,
  Eye,
  Search,
  CheckCircle2,
} from "lucide-react";
import { useCodeHealthAnalyzer, type CodeIssue } from "@/hooks/developer/useCodeHealthAnalyzer";

export function CodeHealthPanel() {
  const { issues, report, isAnalyzing, runFullAnalysis, clearIssues } = useCodeHealthAnalyzer(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // تصفية المشاكل
  const filteredIssues = issues.filter(issue => {
    if (selectedCategory && issue.category !== selectedCategory) return false;
    if (searchQuery && !issue.message.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // الحصول على أيقونة النوع
  const getTypeIcon = (type: CodeIssue['type']) => {
    switch (type) {
      case 'critical': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info': return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  // الحصول على لون النوع
  const getTypeBadge = (type: CodeIssue['type']) => {
    switch (type) {
      case 'critical': return <Badge variant="destructive">حرج</Badge>;
      case 'error': return <Badge className="bg-orange-500">خطأ</Badge>;
      case 'warning': return <Badge className="bg-yellow-500 text-black">تحذير</Badge>;
      case 'info': return <Badge variant="secondary">معلومة</Badge>;
    }
  };

  // الحصول على أيقونة الفئة
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Security': return <Shield className="h-4 w-4" />;
      case 'Performance': return <Zap className="h-4 w-4" />;
      case 'Network': return <Globe className="h-4 w-4" />;
      case 'DOM': return <Eye className="h-4 w-4" />;
      case 'Memory': return <Database className="h-4 w-4" />;
      case 'SEO': return <Search className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  // تصدير التقرير
  const exportReport = () => {
    const data = {
      report,
      issues,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code-health-report-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* ملخص الصحة */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-4xl font-bold" style={{ 
                color: report?.score && report.score >= 80 ? 'hsl(var(--success))' : 
                       report?.score && report.score >= 60 ? 'hsl(var(--warning))' : 
                       'hsl(var(--destructive))'
              }}>
                {report?.score ?? '--'}
              </div>
              <p className="text-sm text-muted-foreground mt-1">نقاط الصحة</p>
              <Progress 
                value={report?.score ?? 0} 
                className="mt-2"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <div>
                <div className="text-2xl font-bold">{report?.criticalCount ?? 0}</div>
                <p className="text-sm text-muted-foreground">حرج</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              <div>
                <div className="text-2xl font-bold">{report?.errorCount ?? 0}</div>
                <p className="text-sm text-muted-foreground">أخطاء</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <div>
                <div className="text-2xl font-bold">{report?.warningCount ?? 0}</div>
                <p className="text-sm text-muted-foreground">تحذيرات</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{report?.infoCount ?? 0}</div>
                <p className="text-sm text-muted-foreground">معلومات</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* أزرار التحكم */}
      <div className="flex flex-wrap gap-2">
        <Button 
          onClick={runFullAnalysis} 
          disabled={isAnalyzing}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
          {isAnalyzing ? 'جاري التحليل...' : 'تحليل شامل'}
        </Button>
        <Button variant="outline" onClick={clearIssues} className="gap-2">
          <Trash2 className="h-4 w-4" />
          مسح المشاكل
        </Button>
        <Button variant="outline" onClick={exportReport} className="gap-2">
          <Download className="h-4 w-4" />
          تصدير التقرير
        </Button>
      </div>

      {/* تصفية حسب الفئة */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === null ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedCategory(null)}
        >
          الكل ({issues.length})
        </Button>
        {report?.categories && Object.entries(report.categories).map(([category, count]) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category)}
            className="gap-1"
          >
            {getCategoryIcon(category)}
            {category} ({count})
          </Button>
        ))}
      </div>

      {/* قائمة المشاكل */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            المشاكل المكتشفة ({filteredIssues.length})
          </CardTitle>
          <CardDescription>
            آخر تحليل: {report?.lastAnalysis?.toLocaleString('ar-SA') ?? 'لم يتم'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredIssues.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-green-500" />
              <p>لا توجد مشاكل مكتشفة</p>
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {filteredIssues.map((issue) => (
                  <div
                    key={issue.id}
                    className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    {getTypeIcon(issue.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {getTypeBadge(issue.type)}
                        <Badge variant="outline">{issue.category}</Badge>
                        {issue.autoFixable && (
                          <Badge variant="secondary" className="text-xs">قابل للإصلاح</Badge>
                        )}
                      </div>
                      <p className="mt-1 text-sm font-medium">{issue.message}</p>
                      {issue.details && (
                        <p className="text-xs text-muted-foreground mt-1">{issue.details}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {issue.timestamp.toLocaleTimeString('ar-SA')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* إحصائيات الفئات */}
      {report?.categories && Object.keys(report.categories).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>توزيع المشاكل حسب الفئة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {Object.entries(report.categories).map(([category, count]) => (
                <div key={category} className="flex items-center gap-2 p-3 rounded-lg border">
                  {getCategoryIcon(category)}
                  <div>
                    <p className="font-medium">{category}</p>
                    <p className="text-2xl font-bold">{count}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
