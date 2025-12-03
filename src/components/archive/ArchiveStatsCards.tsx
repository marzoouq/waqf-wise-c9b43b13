import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, FolderOpen, Download, Upload } from 'lucide-react';

interface ArchiveStats {
  totalDocuments: number;
  totalFolders: number;
  totalSize: string;
  thisMonthAdditions: number;
}

interface ArchiveStatsCardsProps {
  stats: ArchiveStats | null;
}

export function ArchiveStatsCards({ stats }: ArchiveStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">إجمالي المستندات</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.totalDocuments || 0}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">المجلدات</CardTitle>
          <FolderOpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.totalFolders || 0}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">الحجم الإجمالي</CardTitle>
          <Download className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.totalSize || '0 B'}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">هذا الشهر</CardTitle>
          <Upload className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.thisMonthAdditions || 0}</div>
        </CardContent>
      </Card>
    </div>
  );
}
