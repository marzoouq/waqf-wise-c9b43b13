import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Archive, FolderOpen, FileText, Upload, Search, Clock } from "lucide-react";
import { LoadingState } from "@/components/shared/LoadingState";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import type { RecentDocument } from "@/types/dashboard";

interface ArchiveStatsLocal {
  totalFolders: number;
  totalDocuments: number;
  todayUploads: number;
  totalSize: number;
}

export default function ArchivistDashboard() {
  const navigate = useNavigate();
  const [archiveStats, setArchiveStats] = useState<ArchiveStatsLocal>({
    totalFolders: 0,
    totalDocuments: 0,
    todayUploads: 0,
    totalSize: 0
  });
  const [recentDocuments, setRecentDocuments] = useState<RecentDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    fetchArchiveData();
  }, []);

  const fetchArchiveData = async () => {
    setIsLoading(true);

    // جلب عدد المجلدات
    const { count: foldersCount } = await supabase
      .from('folders')
      .select('*', { count: 'exact', head: true });

    // جلب عدد المستندات
    const { data: documents, count: documentsCount } = await supabase
      .from('documents')
      .select('*', { count: 'exact' });

    // حساب المستندات المرفوعة اليوم
    const today = new Date().toISOString().split('T')[0];
    const todayDocs = documents?.filter(doc => 
      doc.uploaded_at.startsWith(today)
    ).length || 0;

    // حساب الحجم الكلي من file_size_bytes
    const totalBytes = documents?.reduce((sum, doc: any) => 
      sum + (doc.file_size_bytes || 0), 0) || 0;
    const totalSize = totalBytes / (1024 * 1024); // تحويل إلى MB

    setArchiveStats({
      totalFolders: foldersCount || 0,
      totalDocuments: documentsCount || 0,
      todayUploads: todayDocs,
      totalSize: Math.round(totalSize)
    });

    // جلب آخر المستندات
    let query = supabase
      .from('documents')
      .select('*, folders(name)')
      .order('uploaded_at', { ascending: false });

    // تطبيق الفلاتر
    if (selectedCategory !== 'all') {
      query = query.eq('category', selectedCategory);
    }

    const { data: recent } = await query.limit(10);

    setRecentDocuments(recent || []);
    setIsLoading(false);
  };

  if (isLoading) {
    return <LoadingState message="جاري تحميل لوحة تحكم أمين الأرشيف..." />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 md:p-8 lg:p-10 space-y-8">
        {/* Header */}
        <header className="space-y-2">
          <div className="flex items-center gap-3">
            <Archive className="h-10 w-10 text-teal-600" />
            <div>
              <h1 className="text-3xl font-bold text-gradient-primary">
                لوحة تحكم أمين الأرشيف
              </h1>
              <p className="text-muted-foreground">
                إدارة وتنظيم المستندات والملفات
              </p>
            </div>
          </div>
        </header>

        {/* Statistics Cards */}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">المجلدات</CardTitle>
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{archiveStats.totalFolders}</div>
              <p className="text-xs text-muted-foreground mt-1">
                إجمالي المجلدات
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">المستندات</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{archiveStats.totalDocuments}</div>
              <p className="text-xs text-muted-foreground mt-1">
                إجمالي المستندات
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">رفع اليوم</CardTitle>
              <Upload className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {archiveStats.todayUploads}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                مستند مرفوع اليوم
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">الحجم الكلي</CardTitle>
              <Archive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{archiveStats.totalSize} MB</div>
              <p className="text-xs text-muted-foreground mt-1">
                حجم المستندات
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Documents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>آخر المستندات المرفوعة</span>
              <Button variant="outline" onClick={() => navigate('/archive')}>
                عرض الأرشيف الكامل
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentDocuments.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="p-2 rounded-full bg-teal-100">
                      <FileText className="h-4 w-4 text-teal-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{doc.name}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <FolderOpen className="h-3 w-3" />
                          {doc.folders?.name || 'غير مصنف'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(doc.uploaded_at), 'dd/MM/yyyy', { locale: ar })}
                        </span>
                        <span>
                          {(doc as any).file_size_bytes 
                            ? `${((doc as any).file_size_bytes / (1024 * 1024)).toFixed(2)} MB`
                            : doc.file_size}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs bg-primary/10 text-primary">
                    {doc.category}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>البحث والفلترة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              <div className="relative">
                <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="البحث في المستندات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pr-10 pl-4 py-2 border rounded-md"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  fetchArchiveData();
                }}
                className="w-full px-4 py-2 border rounded-md"
              >
                <option value="all">جميع الفئات</option>
                <option value="عقود">عقود</option>
                <option value="فواتير">فواتير</option>
                <option value="مستندات">مستندات</option>
                <option value="صور">صور</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>الإجراءات السريعة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
              <Button 
                className="h-24 flex flex-col gap-2"
                onClick={() => navigate('/archive')}
              >
                <Upload className="h-6 w-6" />
                <span>رفع مستند جديد</span>
              </Button>
              <Button 
                variant="outline"
                className="h-24 flex flex-col gap-2"
                onClick={() => navigate('/archive')}
              >
                <FolderOpen className="h-6 w-6" />
                <span>إنشاء مجلد جديد</span>
              </Button>
              <Button 
                variant="outline"
                className="h-24 flex flex-col gap-2"
                onClick={() => navigate('/archive')}
              >
                <Search className="h-6 w-6" />
                <span>البحث في الأرشيف</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
