import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, Edit, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useBeneficiaries } from '@/hooks/useBeneficiaries';
import { LoadingState } from '@/components/shared/LoadingState';
import { EmptyState } from '@/components/shared/EmptyState';
import { PageErrorBoundary } from '@/components/shared/PageErrorBoundary';
import { MobileOptimizedLayout } from '@/components/layout/MobileOptimizedLayout';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  ProfileHeader,
  ProfileStats,
  ProfileTimeline,
  ProfilePaymentsHistory,
  ProfileRequestsHistory,
  ProfileFamilyTree,
  ProfileDocumentsGallery
} from '@/components/beneficiary';
import { BeneficiaryIntegrationPanel } from '@/components/beneficiary/admin/BeneficiaryIntegrationPanel';
import BeneficiaryDialog from '@/components/beneficiary/admin/BeneficiaryDialog';

export default function BeneficiaryProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { beneficiaries, isLoading } = useBeneficiaries();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('timeline');

  const beneficiary = beneficiaries.find(b => b.id === id);

  useEffect(() => {
    if (!isLoading && !beneficiary) {
      navigate('/beneficiaries');
    }
  }, [beneficiary, isLoading, navigate]);

  if (isLoading) {
    return <LoadingState message="جاري تحميل ملف المستفيد..." />;
  }

  if (!beneficiary) {
    return (
      <div className="container mx-auto px-4 py-12">
        <EmptyState
          icon={ArrowRight}
          title="المستفيد غير موجود"
          description="لم يتم العثور على المستفيد المطلوب"
          onAction={() => navigate('/beneficiaries')}
          actionLabel="العودة للقائمة"
        />
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <PageErrorBoundary pageName="ملف المستفيد">
      <MobileOptimizedLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 print:hidden">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/beneficiaries')}
          className="gap-2"
        >
          <ArrowRight className="h-4 w-4" />
          <span className="hidden sm:inline">العودة للقائمة</span>
          <span className="sm:hidden">رجوع</span>
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="gap-2"
          >
            <Printer className="h-4 w-4" />
            <span className="hidden sm:inline">طباعة</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditDialogOpen(true)}
            className="gap-2"
          >
            <Edit className="h-4 w-4" />
            <span className="hidden sm:inline">تعديل</span>
          </Button>
        </div>
      </div>

      {/* Profile Header & Stats */}
      <div className="space-y-4 sm:space-y-6 mb-6">
        <ProfileHeader beneficiary={beneficiary} />
        <ProfileStats beneficiaryId={beneficiary.id} />
        <BeneficiaryIntegrationPanel beneficiaryId={beneficiary.id} />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
        <ScrollArea className="w-full whitespace-nowrap print:hidden">
          <TabsList className="inline-flex w-full min-w-max">
            <TabsTrigger value="timeline" className="text-xs sm:text-sm">الخط الزمني</TabsTrigger>
            <TabsTrigger value="payments" className="text-xs sm:text-sm">المدفوعات</TabsTrigger>
            <TabsTrigger value="requests" className="text-xs sm:text-sm">الطلبات</TabsTrigger>
            <TabsTrigger value="family" className="text-xs sm:text-sm">العائلة</TabsTrigger>
            <TabsTrigger value="documents" className="text-xs sm:text-sm">المستندات</TabsTrigger>
          </TabsList>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

          <TabsContent value="timeline">
            <ProfileTimeline beneficiaryId={beneficiary.id} />
          </TabsContent>

          <TabsContent value="payments">
            <ProfilePaymentsHistory beneficiaryId={beneficiary.id} />
          </TabsContent>

          <TabsContent value="requests">
            <ProfileRequestsHistory beneficiaryId={beneficiary.id} />
          </TabsContent>

          <TabsContent value="family">
            <ProfileFamilyTree beneficiaryId={beneficiary.id} />
          </TabsContent>

          <TabsContent value="documents">
            <ProfileDocumentsGallery beneficiaryId={beneficiary.id} />
          </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <BeneficiaryDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        beneficiary={beneficiary}
        onSave={() => {
          setEditDialogOpen(false);
        }}
      />
      </MobileOptimizedLayout>
    </PageErrorBoundary>
  );
}
