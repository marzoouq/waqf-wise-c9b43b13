import { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCustomReports } from '@/hooks/useCustomReports';
import { FileText, Plus, Star, Play, Trash2, Sparkles, TrendingUp, Calendar } from 'lucide-react';
import { toast } from 'sonner';

export default function CustomReports() {
  const { reports, isLoading, createReport, runReport, toggleFavorite, deleteReport, isCreating, isRunning } = useCustomReports();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [reportResult, setReportResult] = useState<any>(null);
  
  const [newReport, setNewReport] = useState({
    name: '',
    description: '',
    report_type: 'ai' as 'sql' | 'chart' | 'ai',
    configuration: {},
  });

  const handleCreateReport = async () => {
    if (!newReport.name) {
      toast.error('الرجاء إدخال اسم التقرير');
      return;
    }

    try {
      await createReport(newReport);
      setShowCreateDialog(false);
      setNewReport({
        name: '',
        description: '',
        report_type: 'ai',
        configuration: {},
      });
    } catch (error) {
      console.error('Create Report Error:', error);
    }
  };

  const handleRunReport = async (reportId: string) => {
    try {
      const result = await runReport(reportId);
      setReportResult(result);
      toast.success('تم تشغيل التقرير بنجاح');
    } catch (error) {
      console.error('Run Report Error:', error);
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا التقرير؟')) {
      await deleteReport(reportId);
    }
  };

  const favoriteReports = reports?.filter(r => r.is_favorite) || [];
  const myReports = reports?.filter(r => !r.is_shared) || [];
  const sharedReports = reports?.filter(r => r.is_shared) || [];

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">التقارير المخصصة</h1>
            <p className="text-muted-foreground mt-2">
              أنشئ وشغّل تقاريرك المخصصة بالذكاء الاصطناعي
            </p>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="ml-2 h-4 w-4" />
                تقرير جديد
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>إنشاء تقرير مخصص</DialogTitle>
                <DialogDescription>
                  املأ التفاصيل لإنشاء تقرير جديد
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>اسم التقرير</Label>
                  <Input
                    placeholder="تقرير المستفيدين الشهري"
                    value={newReport.name}
                    onChange={(e) => setNewReport({ ...newReport, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>الوصف</Label>
                  <Textarea
                    placeholder="وصف التقرير..."
                    value={newReport.description}
                    onChange={(e) => setNewReport({ ...newReport, description: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>نوع التقرير</Label>
                  <Select
                    value={newReport.report_type}
                    onValueChange={(value: any) => setNewReport({ ...newReport, report_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ai">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4" />
                          تقرير ذكي (AI)
                        </div>
                      </SelectItem>
                      <SelectItem value="chart">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" />
                          مخطط بياني
                        </div>
                      </SelectItem>
                      <SelectItem value="sql">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          استعلام SQL
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full" onClick={handleCreateReport} disabled={isCreating}>
                  إنشاء التقرير
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">جميع التقارير</TabsTrigger>
            <TabsTrigger value="favorites">المفضلة ({favoriteReports.length})</TabsTrigger>
            <TabsTrigger value="my">تقاريري ({myReports.length})</TabsTrigger>
            <TabsTrigger value="shared">مشتركة ({sharedReports.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {isLoading ? (
              <Card>
                <CardContent className="py-10 text-center">
                  <p className="text-muted-foreground">جاري التحميل...</p>
                </CardContent>
              </Card>
            ) : reports && reports.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {reports.map((report) => (
                  <Card key={report.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-lg">{report.name}</CardTitle>
                            {report.report_type === 'ai' && (
                              <Sparkles className="h-4 w-4 text-primary" />
                            )}
                          </div>
                          {report.description && (
                            <CardDescription className="text-sm">
                              {report.description}
                            </CardDescription>
                          )}
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleFavorite(report.id)}
                        >
                          <Star 
                            className={`h-4 w-4 ${report.is_favorite ? 'fill-yellow-400 text-yellow-400' : ''}`}
                          />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">{report.report_type}</Badge>
                        {report.is_shared && <Badge>مشترك</Badge>}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>تم التشغيل {report.run_count} مرة</span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => handleRunReport(report.id)}
                          disabled={isRunning}
                        >
                          <Play className="ml-2 h-3 w-3" />
                          تشغيل
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteReport(report.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-10 text-center space-y-2">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground">لا توجد تقارير مخصصة</p>
                  <Button variant="outline" onClick={() => setShowCreateDialog(true)}>
                    <Plus className="ml-2 h-4 w-4" />
                    إنشاء أول تقرير
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="favorites">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {favoriteReports.map((report) => (
                <Card key={report.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{report.name}</CardTitle>
                    {report.description && (
                      <CardDescription>{report.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => handleRunReport(report.id)}
                    >
                      <Play className="ml-2 h-3 w-3" />
                      تشغيل
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="my">
            {/* Same structure as "all" but filtered */}
          </TabsContent>

          <TabsContent value="shared">
            {/* Same structure as "all" but filtered */}
          </TabsContent>
        </Tabs>

        {/* نتيجة التقرير */}
        {reportResult && (
          <Card>
            <CardHeader>
              <CardTitle>نتيجة التقرير</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="p-4 bg-muted rounded-lg overflow-auto max-h-96 text-sm">
                {JSON.stringify(reportResult, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}