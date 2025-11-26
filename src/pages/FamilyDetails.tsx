import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFamilies } from '@/hooks/useFamilies';
import { LoadingState } from '@/components/shared/LoadingState';
import { FamilyTreeView } from '@/components/families/FamilyTreeView';
import { PageErrorBoundary } from '@/components/shared/PageErrorBoundary';

/**
 * صفحة تفاصيل العائلة وشجرة الأفراد
 */
export default function FamilyDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { families, isLoading } = useFamilies();

  if (isLoading) {
    return <LoadingState size="lg" />;
  }

  const family = families.find((f) => f.id === id);

  if (!family) {
    return (
      <div className="container mx-auto p-6 md:p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">العائلة غير موجودة</h2>
          <Button onClick={() => navigate('/families')}>
            <ArrowRight className="ml-2 h-4 w-4" />
            العودة للعائلات
          </Button>
        </div>
      </div>
    );
  }

  return (
    <PageErrorBoundary pageName="تفاصيل العائلة">
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6 md:p-8 lg:p-10 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate('/families')}
              className="gap-2"
            >
              <ArrowRight className="h-4 w-4" />
              العودة
            </Button>
          </div>

          {/* Family Tree */}
          <FamilyTreeView familyId={family.id} familyName={family.family_name} />
        </div>
      </div>
    </PageErrorBoundary>
  );
}
