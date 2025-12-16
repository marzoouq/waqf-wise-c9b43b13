import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFamilies } from '@/hooks/beneficiary/useFamilies';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { FamilyTreeView } from '@/components/families/FamilyTreeView';
import { PageErrorBoundary } from '@/components/shared/PageErrorBoundary';
import { MobileOptimizedLayout, MobileOptimizedHeader } from '@/components/layout/MobileOptimizedLayout';

/**
 * صفحة تفاصيل العائلة وشجرة الأفراد
 */
export default function FamilyDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { families, isLoading, error, refetch } = useFamilies();

  if (isLoading) {
    return <LoadingState size="lg" />;
  }

  if (error) {
    return (
      <ErrorState 
        title="فشل تحميل العائلة" 
        message="حدث خطأ أثناء تحميل بيانات العائلة"
        onRetry={() => refetch()}
        fullScreen
      />
    );
  }

  const family = families.find((f) => f.id === id);

  if (!family) {
    return (
      <MobileOptimizedLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">العائلة غير موجودة</h2>
          <Button onClick={() => navigate('/families')} size="lg" className="min-h-[44px]">
            <ArrowRight className="ms-2 h-4 w-4" />
            العودة للعائلات
          </Button>
        </div>
      </MobileOptimizedLayout>
    );
  }

  return (
    <PageErrorBoundary pageName="تفاصيل العائلة">
      <MobileOptimizedLayout>
        <MobileOptimizedHeader
          title={`عائلة ${family.family_name}`}
          description="شجرة العائلة والأفراد"
          icon={<Users className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-primary" />}
          actions={
            <Button
              variant="outline"
              onClick={() => navigate('/families')}
              className="gap-2 min-h-[44px]"
            >
              <ArrowRight className="h-4 w-4" />
              <span className="hidden sm:inline">العودة</span>
            </Button>
          }
        />

        <FamilyTreeView familyId={family.id} familyName={family.family_name} />
      </MobileOptimizedLayout>
    </PageErrorBoundary>
  );
}
