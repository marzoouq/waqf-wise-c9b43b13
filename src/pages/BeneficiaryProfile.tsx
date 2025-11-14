import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, Edit, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useBeneficiaries } from '@/hooks/useBeneficiaries';
import { LoadingState } from '@/components/shared/LoadingState';
import { EmptyState } from '@/components/shared/EmptyState';
import { ProfileHeader } from '@/components/beneficiary/ProfileHeader';
import { ProfileStats } from '@/components/beneficiary/ProfileStats';
import { ProfileTimeline } from '@/components/beneficiary/ProfileTimeline';
import { ProfilePaymentsHistory } from '@/components/beneficiary/ProfilePaymentsHistory';
import { ProfileRequestsHistory } from '@/components/beneficiary/ProfileRequestsHistory';
import { ProfileFamilyTree } from '@/components/beneficiary/ProfileFamilyTree';
import { ProfileDocumentsGallery } from '@/components/beneficiary/ProfileDocumentsGallery';
import BeneficiaryDialog from '@/components/beneficiaries/BeneficiaryDialog';

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border print:hidden">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/beneficiaries')}
              className="gap-2"
            >
              <ArrowRight className="h-4 w-4" />
              العودة للقائمة
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="gap-2"
              >
                <Printer className="h-4 w-4" />
                طباعة
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditDialogOpen(true)}
                className="gap-2"
              >
                <Edit className="h-4 w-4" />
                تعديل
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Profile Header & Stats */}
        <div className="space-y-6 mb-6">
          <ProfileHeader beneficiary={beneficiary} />
          <ProfileStats beneficiaryId={beneficiary.id} />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 print:hidden">
            <TabsTrigger value="timeline">الخط الزمني</TabsTrigger>
            <TabsTrigger value="payments">المدفوعات</TabsTrigger>
            <TabsTrigger value="requests">الطلبات</TabsTrigger>
            <TabsTrigger value="family">العائلة</TabsTrigger>
            <TabsTrigger value="documents">المستندات</TabsTrigger>
          </TabsList>

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
      </div>

      {/* Edit Dialog */}
      <BeneficiaryDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        beneficiary={beneficiary}
        onSave={() => {
          setEditDialogOpen(false);
        }}
      />
    </div>
  );
}
