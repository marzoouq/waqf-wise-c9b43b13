import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { Check, ArrowRight, ArrowLeft } from 'lucide-react';
import { DistributionPatternSelector } from '@/components/funds/DistributionPatternSelector';
import { BeneficiarySelector } from './BeneficiarySelector';
import { DeductionsConfig } from './DeductionsConfig';
import { DistributionPreview } from './DistributionPreview';
import { ApprovalSettings } from './ApprovalSettings';
import type { 
  DistributionWizardFormData, 
  DeductionsValues, 
  ApprovalSettingsValues,
  DistributionPattern 
} from '@/types/distributions';

interface DistributionWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (data: DistributionWizardFormData) => void;
}

const steps = [
  { id: 1, title: 'اختيار نمط التوزيع', description: 'حدد طريقة توزيع الغلة' },
  { id: 2, title: 'اختيار المستفيدين', description: 'حدد المستفيدين من التوزيع' },
  { id: 3, title: 'الاستقطاعات', description: 'حدد نسب الاستقطاع' },
  { id: 4, title: 'المراجعة والمحاكاة', description: 'راجع التوزيع النهائي' },
  { id: 5, title: 'إعدادات الموافقة', description: 'حدد مسار الموافقات' },
];

export function DistributionWizard({ open, onOpenChange, onComplete }: DistributionWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<DistributionWizardFormData>({
    pattern: 'equal',
    beneficiaries: [],
    deductions: {
      nazer: 5,
      reserve: 10,
      development: 5,
      maintenance: 5,
      investment: 5,
    },
    approvalSettings: {
      workflow: 'standard',
      autoNotify: true,
    },
  });

  const progress = (currentStep / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    onComplete(formData);
    onOpenChange(false);
    setCurrentStep(1);
  };

  const updatePattern = (value: DistributionPattern) => {
    setFormData({ ...formData, pattern: value });
  };

  const updateBeneficiaries = (value: string[]) => {
    setFormData({ ...formData, beneficiaries: value });
  };

  const updateDeductions = (value: DeductionsValues) => {
    setFormData({ ...formData, deductions: value });
  };

  const updateApprovalSettings = (value: ApprovalSettingsValues) => {
    setFormData({ ...formData, approvalSettings: value });
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return !!formData.pattern;
      case 2:
        return formData.beneficiaries.length > 0;
      case 3:
        return true; // Deductions are optional
      case 4:
        return true;
      case 5:
        return true;
      default:
        return false;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>معالج إنشاء توزيع جديد</DialogTitle>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="space-y-2 mb-6">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              الخطوة {currentStep} من {steps.length}
            </span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} />
        </div>

        {/* Steps Indicator */}
        <div className="flex items-center justify-between mb-6 overflow-x-auto pb-2">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center flex-shrink-0">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    currentStep > step.id
                      ? 'bg-primary text-primary-foreground'
                      : currentStep === step.id
                      ? 'bg-primary/20 text-primary border-2 border-primary'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {currentStep > step.id ? <Check className="h-5 w-5" /> : step.id}
                </div>
                <div className="mt-2 text-center">
                  <div className="text-xs font-medium whitespace-nowrap">{step.title}</div>
                  <div className="text-xs text-muted-foreground hidden sm:block">
                    {step.description}
                  </div>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`h-0.5 w-12 mx-2 ${
                    currentStep > step.id ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <Card className="p-6 mb-6 min-h-[300px]">
          {currentStep === 1 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">اختر نمط التوزيع</h3>
              <DistributionPatternSelector
                value={formData.pattern}
                onChange={updatePattern}
              />
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">اختر المستفيدين</h3>
              <BeneficiarySelector
                selected={formData.beneficiaries}
                onChange={updateBeneficiaries}
              />
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">نسب الاستقطاع</h3>
              <DeductionsConfig
                values={formData.deductions}
                onChange={updateDeductions}
              />
            </div>
          )}

          {currentStep === 4 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">مراجعة التوزيع</h3>
              <DistributionPreview data={formData} />
            </div>
          )}

          {currentStep === 5 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">إعدادات الموافقة</h3>
              <ApprovalSettings
                values={formData.approvalSettings}
                onChange={updateApprovalSettings}
              />
            </div>
          )}
        </Card>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="h-4 w-4 ml-2" />
            السابق
          </Button>

          {currentStep < steps.length ? (
            <Button onClick={handleNext} disabled={!canProceed()}>
              التالي
              <ArrowRight className="h-4 w-4 mr-2" />
            </Button>
          ) : (
            <Button onClick={handleComplete} disabled={!canProceed()}>
              <Check className="h-4 w-4 ml-2" />
              إنشاء التوزيع
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
