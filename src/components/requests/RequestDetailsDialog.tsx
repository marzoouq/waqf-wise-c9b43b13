/**
 * حوار تفاصيل الطلب
 * Request Details Dialog
 */
import { memo } from 'react';
import { ResponsiveDialog } from '@/components/shared/ResponsiveDialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Calendar, 
  User, 
  FileText, 
  DollarSign, 
  Clock,
  AlertTriangle,
  Tag,
  Phone,
  CreditCard
} from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import type { FullRequest } from '@/types/request.types';
import { getRequestTypeName, getBeneficiaryName } from '@/types/request.types';
import { REQUEST_STATUS, STATUS_BADGE_STYLES, PRIORITY_BADGE_STYLES } from '@/lib/request-constants';

interface RequestDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: FullRequest | null;
}

interface DetailRowProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}

const DetailRow = memo(({ icon, label, value }: DetailRowProps) => (
  <div className="flex items-start gap-3 py-2">
    <div className="text-muted-foreground mt-0.5">{icon}</div>
    <div className="flex-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value || '-'}</p>
    </div>
  </div>
));
DetailRow.displayName = 'DetailRow';

export const RequestDetailsDialog = memo(({ 
  open, 
  onOpenChange, 
  request 
}: RequestDetailsDialogProps) => {
  if (!request) return null;

  const statusStyle = STATUS_BADGE_STYLES[request.status || ''] || { variant: 'secondary' as const };
  const priorityStyle = PRIORITY_BADGE_STYLES[request.priority || ''] || { variant: 'secondary' as const };

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`تفاصيل الطلب ${request.request_number || ''}`}
      description="عرض تفاصيل الطلب الكاملة"
      size="lg"
    >
      <div className="space-y-4" dir="rtl">
        {/* الحالة والأولوية */}
        <div className="flex flex-wrap gap-2">
          <Badge variant={statusStyle.variant} className={statusStyle.className}>
            {request.status}
          </Badge>
          <Badge variant={priorityStyle.variant}>
            {request.priority}
          </Badge>
          {request.is_overdue && (
            <Badge variant="destructive" className="gap-1">
              <AlertTriangle className="h-3 w-3" />
              متأخر
            </Badge>
          )}
        </div>

        <Separator />

        {/* معلومات المستفيد */}
        <Card>
          <CardContent className="pt-4 space-y-1">
            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <User className="h-4 w-4" />
              معلومات المستفيد
            </h4>
            <DetailRow 
              icon={<User className="h-4 w-4" />}
              label="الاسم"
              value={getBeneficiaryName(request)}
            />
            {request.beneficiary && 'national_id' in request.beneficiary && (
              <DetailRow 
                icon={<CreditCard className="h-4 w-4" />}
                label="رقم الهوية"
                value={request.beneficiary.national_id}
              />
            )}
            {request.beneficiary && 'phone' in request.beneficiary && (
              <DetailRow 
                icon={<Phone className="h-4 w-4" />}
                label="رقم الهاتف"
                value={request.beneficiary.phone}
              />
            )}
          </CardContent>
        </Card>

        {/* تفاصيل الطلب */}
        <Card>
          <CardContent className="pt-4 space-y-1">
            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              تفاصيل الطلب
            </h4>
            <DetailRow 
              icon={<Tag className="h-4 w-4" />}
              label="نوع الطلب"
              value={getRequestTypeName(request)}
            />
            <DetailRow 
              icon={<FileText className="h-4 w-4" />}
              label="الوصف"
              value={request.description}
            />
            {request.amount > 0 && (
              <DetailRow 
                icon={<DollarSign className="h-4 w-4" />}
                label="المبلغ المطلوب"
                value={`${request.amount?.toLocaleString('ar-SA')} ريال`}
              />
            )}
          </CardContent>
        </Card>

        {/* التواريخ */}
        <Card>
          <CardContent className="pt-4 space-y-1">
            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              التواريخ
            </h4>
            <DetailRow 
              icon={<Calendar className="h-4 w-4" />}
              label="تاريخ التقديم"
              value={request.submitted_at ? format(new Date(request.submitted_at), 'dd MMMM yyyy - HH:mm', { locale: ar }) : '-'}
            />
            {request.sla_due_at && (
              <DetailRow 
                icon={<Clock className="h-4 w-4" />}
                label="موعد الاستحقاق (SLA)"
                value={format(new Date(request.sla_due_at), 'dd MMMM yyyy', { locale: ar })}
              />
            )}
            {request.approved_at && (
              <DetailRow 
                icon={<Calendar className="h-4 w-4" />}
                label="تاريخ الموافقة"
                value={format(new Date(request.approved_at), 'dd MMMM yyyy - HH:mm', { locale: ar })}
              />
            )}
            {request.reviewed_at && (
              <DetailRow 
                icon={<Calendar className="h-4 w-4" />}
                label="تاريخ المراجعة"
                value={format(new Date(request.reviewed_at), 'dd MMMM yyyy - HH:mm', { locale: ar })}
              />
            )}
          </CardContent>
        </Card>

        {/* ملاحظات */}
        {(request.decision_notes || request.rejection_reason) && (
          <Card>
            <CardContent className="pt-4">
              <h4 className="font-semibold text-sm mb-3">ملاحظات</h4>
              {request.decision_notes && (
                <p className="text-sm p-3 bg-muted rounded-md mb-2">{request.decision_notes}</p>
              )}
              {request.rejection_reason && (
                <p className="text-sm p-3 bg-destructive/10 text-destructive rounded-md">
                  سبب الرفض: {request.rejection_reason}
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </ResponsiveDialog>
  );
});

RequestDetailsDialog.displayName = 'RequestDetailsDialog';
