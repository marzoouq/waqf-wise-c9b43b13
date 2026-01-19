/**
 * بطاقات إحصائيات الأرشيف
 * تستخدم UnifiedStatsGrid + UnifiedKPICard
 */

import { FileText, FolderOpen, Download, Upload } from 'lucide-react';
import { UnifiedStatsGrid } from '@/components/unified/UnifiedStatsGrid';
import { UnifiedKPICard } from '@/components/unified/UnifiedKPICard';

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
    <UnifiedStatsGrid columns={4}>
      <UnifiedKPICard
        title="إجمالي المستندات"
        value={stats?.totalDocuments || 0}
        icon={FileText}
        variant="default"
      />
      <UnifiedKPICard
        title="المجلدات"
        value={stats?.totalFolders || 0}
        icon={FolderOpen}
        variant="info"
      />
      <UnifiedKPICard
        title="الحجم الإجمالي"
        value={stats?.totalSize || '0 B'}
        icon={Download}
        variant="default"
      />
      <UnifiedKPICard
        title="هذا الشهر"
        value={stats?.thisMonthAdditions || 0}
        icon={Upload}
        variant="success"
      />
    </UnifiedStatsGrid>
  );
}
