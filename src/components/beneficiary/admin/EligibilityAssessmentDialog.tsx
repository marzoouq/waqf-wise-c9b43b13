import { useState, useEffect } from 'react';
import { useEligibilityAssessment } from '@/hooks/beneficiary/useEligibilityAssessment';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, TrendingUp, Users, Home, Briefcase, Heart, Loader2 } from 'lucide-react';
import { Beneficiary } from '@/types/beneficiary';

interface EligibilityAssessmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  beneficiary: Beneficiary | null;
}

interface AssessmentResult {
  score: number;
  status: string;
  max_score: number;
}

/**
 * محاور تقييم الأهلية - المرحلة 2
 * تقييم أهلية المستفيد بناءً على معايير متعددة
 */
export function EligibilityAssessmentDialog({
  open,
  onOpenChange,
  beneficiary,
}: EligibilityAssessmentDialogProps) {
  const [assessment, setAssessment] = useState<AssessmentResult | null>(null);
  
  // استخدام الـ hook بدلاً من useMutation مباشرة
  const { runAssessment, isAssessing, latestAssessment } = useEligibilityAssessment(beneficiary?.id || '');

  // تحديث البيانات عند فتح المحاور
  useEffect(() => {
    if (open && beneficiary && latestAssessment) {
      setAssessment({
        score: latestAssessment.total_score,
        status: latestAssessment.eligibility_status,
        max_score: 100,
      });
    }
  }, [open, beneficiary?.id, latestAssessment]);

  // تشغيل التقييم عند الفتح
  useEffect(() => {
    if (open && beneficiary) {
      runAssessment().then((result) => {
        if (result && typeof result === 'object') {
          const resultData = result as Record<string, unknown>;
          setAssessment({
            score: (resultData.total_score as number) || 0,
            status: (resultData.eligibility_status as string) || 'غير محدد',
            max_score: 100,
          });
        }
      }).catch(() => {
        // معالجة الخطأ تتم في الـ hook
      });
    }
  }, [open, beneficiary?.id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'مؤهل بقوة':
        return 'bg-success';
      case 'مؤهل':
        return 'bg-info';
      case 'مؤهل جزئياً':
        return 'bg-warning';
      case 'غير مؤهل':
        return 'bg-destructive';
      default:
        return 'bg-muted';
    }
  };

  const getCriteriaScore = (beneficiary: Beneficiary) => {
    const criteria = [
      {
        icon: TrendingUp,
        label: 'الدخل الشهري',
        value: beneficiary.monthly_income ? `${beneficiary.monthly_income.toLocaleString()} ريال` : 'غير محدد',
        score: beneficiary.monthly_income 
          ? (beneficiary.monthly_income < 3000 ? 30 : beneficiary.monthly_income < 5000 ? 20 : 10)
          : 0,
        maxScore: 30,
      },
      {
        icon: Users,
        label: 'حجم الأسرة',
        value: beneficiary.family_size ? `${beneficiary.family_size} أفراد` : 'غير محدد',
        score: beneficiary.family_size
          ? (beneficiary.family_size > 7 ? 20 : beneficiary.family_size > 5 ? 15 : 10)
          : 0,
        maxScore: 20,
      },
      {
        icon: Briefcase,
        label: 'حالة التوظيف',
        value: beneficiary.employment_status || 'غير محدد',
        score: ['عاطل', 'غير موظف'].includes(beneficiary.employment_status || '')
          ? 20
          : ['موظف بدوام جزئي', 'أعمال حرة'].includes(beneficiary.employment_status || '')
          ? 10
          : 0,
        maxScore: 20,
      },
      {
        icon: Home,
        label: 'نوع السكن',
        value: beneficiary.housing_type || 'غير محدد',
        score: ['إيجار', 'مع العائلة'].includes(beneficiary.housing_type || '')
          ? 15
          : beneficiary.housing_type === 'ملك جزئي'
          ? 8
          : 0,
        maxScore: 15,
      },
      {
        icon: Heart,
        label: 'الحالة الاجتماعية',
        value: beneficiary.marital_status || 'غير محدد',
        score: ['أرمل', 'مطلق', 'أعزب مع إعالة'].includes(beneficiary.marital_status || '')
          ? 15
          : (beneficiary.marital_status === 'متزوج' && (beneficiary.family_size || 0) > 4)
          ? 10
          : 0,
        maxScore: 15,
      },
    ];

    return criteria;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            تقييم الأهلية
          </DialogTitle>
          <DialogDescription>
            تقييم أهلية المستفيد: {beneficiary?.full_name}
          </DialogDescription>
        </DialogHeader>

        {isAssessing ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">جاري تقييم الأهلية...</p>
          </div>
        ) : assessment && beneficiary ? (
          <div className="space-y-6">
            {/* النتيجة الإجمالية */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">النتيجة الإجمالية</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-3xl font-bold">{assessment.score.toFixed(1)}%</p>
                    <p className="text-sm text-muted-foreground">
                      من أصل {assessment.max_score} نقطة
                    </p>
                  </div>
                  <Badge className={getStatusColor(assessment.status)} variant="default">
                    {assessment.status}
                  </Badge>
                </div>
                <Progress value={assessment.score} className="h-3" />
              </CardContent>
            </Card>

            {/* تفصيل المعايير */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">تفصيل المعايير</CardTitle>
                <CardDescription>
                  تقييم كل معيار على حدة
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {getCriteriaScore(beneficiary).map((criterion) => {
                  const Icon = criterion.icon;
                  const percentage = (criterion.score / criterion.maxScore) * 100;

                  return (
                    <div key={criterion.label} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{criterion.label}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {criterion.score} / {criterion.maxScore}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Progress value={percentage} className="flex-1" />
                        <span className="text-xs text-muted-foreground min-w-[100px]">
                          {criterion.value}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* التوصيات */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">التوصيات</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {assessment.score >= 70 && (
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>المستفيد مؤهل بشكل كبير للحصول على الدعم الكامل</span>
                    </li>
                  )}
                  {assessment.score >= 50 && assessment.score < 70 && (
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">✓</span>
                      <span>المستفيد مؤهل للحصول على الدعم بناءً على المعايير المحددة</span>
                    </li>
                  )}
                  {assessment.score >= 30 && assessment.score < 50 && (
                    <>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-500 mt-0.5">!</span>
                        <span>يُنصح بمراجعة الحالة مع لجنة التقييم</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-500 mt-0.5">!</span>
                        <span>قد يحتاج المستفيد إلى دعم جزئي أو مؤقت</span>
                      </li>
                    </>
                  )}
                  {assessment.score < 30 && (
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-0.5">✗</span>
                      <span>المستفيد غير مؤهل حالياً بناءً على المعايير الحالية</span>
                    </li>
                  )}
                  <li className="flex items-start gap-2">
                    <span className="text-muted-foreground mt-0.5">•</span>
                    <span>يُنصح بإعادة التقييم بعد 6 أشهر</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        ) : null}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إغلاق
          </Button>
          {assessment && (
            <Button onClick={() => runAssessment()}>
              إعادة التقييم
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
