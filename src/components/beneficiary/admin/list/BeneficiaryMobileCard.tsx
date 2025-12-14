import { memo } from "react";
import { MoreVertical, Eye, Edit, FileText, Activity, Key, Trash2, Phone, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Beneficiary } from "@/types/beneficiary";

interface BeneficiaryMobileCardProps {
  beneficiary: Beneficiary;
  onViewProfile: (beneficiary: Beneficiary) => void;
  onEdit: (beneficiary: Beneficiary) => void;
  onViewAttachments: (beneficiary: Beneficiary) => void;
  onViewActivity: (beneficiary: Beneficiary) => void;
  onEnableLogin: (beneficiary: Beneficiary) => void;
  onDelete: (id: string) => void;
}

/**
 * بطاقة مستفيد محسّنة للجوال
 */
export const BeneficiaryMobileCard = memo(function BeneficiaryMobileCard({
  beneficiary,
  onViewProfile,
  onEdit,
  onViewAttachments,
  onViewActivity,
  onEnableLogin,
  onDelete,
}: BeneficiaryMobileCardProps) {
  return (
    <Card className="shadow-soft touch-manipulation">
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-2">
          {/* Avatar and Basic Info */}
          <div 
            className="flex items-start gap-3 flex-1 min-w-0"
            onClick={() => onViewProfile(beneficiary)}
            role="button"
            tabIndex={0}
          >
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-primary font-bold text-sm">
                {beneficiary.full_name.charAt(0)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm truncate">
                {beneficiary.full_name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  {beneficiary.beneficiary_number || 'قيد الإنشاء'}
                </Badge>
                <Badge
                  className={
                    beneficiary.status === "نشط"
                      ? "bg-success/10 text-success border border-success/30 text-[10px] px-1.5 py-0"
                      : "bg-warning/10 text-warning border border-warning/30 text-[10px] px-1.5 py-0"
                  }
                >
                  {beneficiary.status}
                </Badge>
                {beneficiary.can_login && (
                  <Key className="h-3 w-3 text-primary" />
                )}
              </div>
            </div>
          </div>

          {/* Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onViewProfile(beneficiary)}>
                <Eye className="ms-2 h-4 w-4" />
                عرض الملف الشخصي
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(beneficiary)}>
                <Edit className="ms-2 h-4 w-4" />
                تعديل البيانات
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onViewAttachments(beneficiary)}>
                <FileText className="ms-2 h-4 w-4" />
                المرفقات
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onViewActivity(beneficiary)}>
                <Activity className="ms-2 h-4 w-4" />
                سجل النشاط
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onEnableLogin(beneficiary)}>
                <Key className="ms-2 h-4 w-4" />
                {beneficiary.can_login ? "إدارة الحساب" : "تفعيل حساب الدخول"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive"
                onClick={() => onDelete(beneficiary.id)}
              >
                <Trash2 className="ms-2 h-4 w-4" />
                حذف المستفيد
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Secondary Info */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 pt-2 border-t text-[11px] text-muted-foreground">
          {beneficiary.phone && (
            <div className="flex items-center gap-1">
              <Phone className="h-3 w-3" />
              <span className="font-mono" dir="ltr">{beneficiary.phone}</span>
            </div>
          )}
          {beneficiary.national_id && (
            <div className="flex items-center gap-1">
              <CreditCard className="h-3 w-3" />
              <span className="font-mono" dir="ltr">{beneficiary.national_id}</span>
            </div>
          )}
          {beneficiary.category && (
            <Badge variant="outline" className="border-primary/30 text-[10px] px-1.5 py-0">
              {beneficiary.category}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
});
