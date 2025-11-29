import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Archive, FolderOpen, FileText, Upload, Search, Clock, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { UnifiedDashboardLayout } from "@/components/dashboard/UnifiedDashboardLayout";
import { UnifiedKPICard } from "@/components/unified/UnifiedKPICard";
import { UnifiedStatsGrid } from "@/components/unified/UnifiedStatsGrid";
import { SectionSkeleton } from "@/components/dashboard";
import { AdminSendMessageDialog } from "@/components/messages/AdminSendMessageDialog";

export default function ArchivistDashboard() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);

  // Fetch archive statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["archivist-stats"],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];

      const [foldersRes, documentsRes, allDocsRes] = await Promise.all([
        supabase.from('folders').select('*', { count: 'exact', head: true }),
        supabase.from('documents').select('*', { count: 'exact', head: true }),
        supabase.from('documents').select('uploaded_at, file_size')
      ]);

      const todayUploads = allDocsRes.data?.filter((doc) => 
        doc.uploaded_at?.startsWith(today)
      ).length || 0;

      // حساب المساحة من file_size (نص مثل "1.5 MB")
      let totalMB = 0;
      allDocsRes.data?.forEach((doc) => {
        if (doc.file_size) {
          const match = doc.file_size.match(/(\d+\.?\d*)/);
          if (match) {
            totalMB += parseFloat(match[1]);
          }
        }
      });

      return {
        totalFolders: foldersRes.count || 0,
        totalDocuments: documentsRes.count || 0,
        todayUploads,
        totalSize: `${totalMB.toFixed(1)} MB`
      };
    },
    staleTime: 60 * 1000,
    refetchInterval: false, // تعطيل التحديث التلقائي لتحسين LCP
    refetchOnWindowFocus: false,
  });

  // Fetch recent documents with filters
  const { data: recentDocuments = [], isLoading: docsLoading } = useQuery({
    queryKey: ["recent-documents", selectedCategory, searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('documents')
        .select('*, folders(name)')
        .order('uploaded_at', { ascending: false })
        .limit(10);

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    staleTime: 60 * 1000,
    refetchInterval: false, // تعطيل التحديث التلقائي لتحسين LCP
    refetchOnWindowFocus: false,
  });

  return (
    <UnifiedDashboardLayout
      role="archivist"
      actions={
        <Button onClick={() => setMessageDialogOpen(true)} className="gap-2">
          <Mail className="h-4 w-4" />
          <span className="hidden sm:inline">إرسال رسالة</span>
        </Button>
      }
    >
      {/* Statistics Cards */}
      {statsLoading ? (
        <SectionSkeleton />
      ) : (
        <UnifiedStatsGrid columns={4}>
          <UnifiedKPICard
            title="المجلدات"
            value={stats?.totalFolders || 0}
            icon={FolderOpen}
            variant="default"
            subtitle="إجمالي المجلدات"
          />
          <UnifiedKPICard
            title="المستندات"
            value={stats?.totalDocuments || 0}
            icon={FileText}
            variant="default"
            subtitle="إجمالي المستندات"
          />
          <UnifiedKPICard
            title="رفع اليوم"
            value={stats?.todayUploads || 0}
            icon={Upload}
            variant="success"
            subtitle="مستندات اليوم"
          />
          <UnifiedKPICard
            title="المساحة"
            value={stats?.totalSize || '0 MB'}
            icon={Archive}
            variant="default"
            subtitle="حجم الأرشيف"
          />
        </UnifiedStatsGrid>
      )}

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              البحث والفلترة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="البحث في المستندات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="جميع التصنيفات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع التصنيفات</SelectItem>
                  <SelectItem value="عقود">عقود</SelectItem>
                  <SelectItem value="فواتير">فواتير</SelectItem>
                  <SelectItem value="تقارير">تقارير</SelectItem>
                  <SelectItem value="مستندات قانونية">مستندات قانونية</SelectItem>
                  <SelectItem value="أخرى">أخرى</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Recent Documents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              المستندات الأخيرة
            </CardTitle>
          </CardHeader>
          <CardContent>
            {docsLoading ? (
              <SectionSkeleton />
            ) : recentDocuments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>لا توجد مستندات</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/archive`)}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {doc.folders?.name || 'بدون مجلد'} • {doc.category}
                        </p>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground text-left flex-shrink-0">
                      {format(new Date(doc.uploaded_at), 'dd MMM yyyy', { locale: ar })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>إجراءات سريعة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-3">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate('/archive')}
              >
                <Upload className="h-4 w-4 ml-2" />
                رفع مستند
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate('/archive')}
              >
                <FolderOpen className="h-4 w-4 ml-2" />
                إنشاء مجلد
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate('/archive')}
              >
                <Search className="h-4 w-4 ml-2" />
                البحث المتقدم
              </Button>
            </div>
          </CardContent>
        </Card>

      <AdminSendMessageDialog
        open={messageDialogOpen}
        onOpenChange={setMessageDialogOpen}
      />
    </UnifiedDashboardLayout>
  );
}
