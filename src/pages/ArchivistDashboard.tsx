import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Archive, FolderOpen, FileText, Upload, Search, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { QUERY_CONFIG } from "@/lib/queryOptimization";
import { MobileOptimizedLayout, MobileOptimizedHeader } from "@/components/layout/MobileOptimizedLayout";
import { PageErrorBoundary } from "@/components/shared/PageErrorBoundary";

// Skeleton loaders
const StatsSkeleton = () => (
  <div className="grid gap-4 sm:gap-5 md:gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
    {[1, 2, 3, 4].map((i) => (
      <Card key={i}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-4 rounded-full" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-20 mb-2" />
          <Skeleton className="h-3 w-32" />
        </CardContent>
      </Card>
    ))}
  </div>
);

const TableSkeleton = () => (
  <div className="space-y-3">
    {[1, 2, 3, 4, 5].map((i) => (
      <Skeleton key={i} className="h-16 w-full" />
    ))}
  </div>
);

export default function ArchivistDashboard() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

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
    refetchInterval: 60 * 1000,
    refetchOnWindowFocus: true,
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
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000,
    refetchOnWindowFocus: true,
  });

  return (
    <PageErrorBoundary pageName="لوحة تحكم أمين الأرشيف">
      <MobileOptimizedLayout>
        {/* Header */}
        <header className="space-y-1 sm:space-y-2">
          <div className="flex items-center gap-2 sm:gap-3">
            <Archive className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 text-teal-600" />
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gradient-primary">
                لوحة تحكم أمين الأرشيف
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-muted-foreground">
                إدارة وتنظيم المستندات والملفات
              </p>
            </div>
          </div>
        </header>

      {/* Statistics Cards */}
      {statsLoading ? (
        <StatsSkeleton />
      ) : (
        <div className="grid gap-3 sm:gap-4 md:gap-5 lg:gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
            <Card className="group hover:shadow-lg hover:scale-[1.02] transition-all duration-300 border-l-4 border-l-teal-500">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">المجلدات</CardTitle>
                <FolderOpen className="h-3 w-3 sm:h-4 sm:w-4 text-teal-500 group-hover:scale-110 transition-transform" />
              </CardHeader>
              <CardContent>
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-teal-600">
                  {stats?.totalFolders || 0}
                </div>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">إجمالي المجلدات</p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg hover:scale-[1.02] transition-all duration-300 border-l-4 border-l-blue-500">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">المستندات</CardTitle>
                <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500 group-hover:scale-110 transition-transform" />
              </CardHeader>
              <CardContent>
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-blue-600">
                  {stats?.totalDocuments || 0}
                </div>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">إجمالي المستندات</p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg hover:scale-[1.02] transition-all duration-300 border-l-4 border-l-green-500">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">رفع اليوم</CardTitle>
                <Upload className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 group-hover:scale-110 transition-transform" />
              </CardHeader>
              <CardContent>
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-green-600">
                  {stats?.todayUploads || 0}
                </div>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">مستندات اليوم</p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg hover:scale-[1.02] transition-all duration-300 border-l-4 border-l-purple-500">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">المساحة</CardTitle>
                <Archive className="h-3 w-3 sm:h-4 sm:w-4 text-purple-500 group-hover:scale-110 transition-transform" />
              </CardHeader>
              <CardContent>
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-purple-600">
                  {stats?.totalSize || '0 MB'}
                </div>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">حجم الأرشيف</p>
              </CardContent>
            </Card>
          </div>
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
              <TableSkeleton />
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
    </MobileOptimizedLayout>
    </PageErrorBoundary>
  );
}
