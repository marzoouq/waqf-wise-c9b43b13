import { memo, useMemo } from "react";
import { MoreVertical, Eye, Edit, FileText, Activity, Key, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { UnifiedDataTable } from "@/components/unified/UnifiedDataTable";
import { Pagination } from "@/components/ui/pagination";
import { Beneficiary } from "@/types/beneficiary";
import { BeneficiaryMobileCard } from "./BeneficiaryMobileCard";
import { useIsMobile } from "@/hooks/ui/use-mobile";

interface BeneficiariesTableProps {
  beneficiaries: Beneficiary[];
  isLoading: boolean;
  searchQuery: string;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onViewProfile: (beneficiary: Beneficiary) => void;
  onEdit: (beneficiary: Beneficiary) => void;
  onViewAttachments: (beneficiary: Beneficiary) => void;
  onViewActivity: (beneficiary: Beneficiary) => void;
  onEnableLogin: (beneficiary: Beneficiary) => void;
  onDelete: (id: string) => void;
}

export const BeneficiariesTable = memo(function BeneficiariesTable({
  beneficiaries,
  isLoading,
  searchQuery,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onViewProfile,
  onEdit,
  onViewAttachments,
  onViewActivity,
  onEnableLogin,
  onDelete,
}: BeneficiariesTableProps) {
  const isMobile = useIsMobile();
  
  // Define columns with responsive visibility
  const columns = useMemo(() => [
    {
      key: "beneficiary_number",
      label: "رقم المستفيد",
      render: (_: unknown, row: Beneficiary) => (
        <Badge variant="secondary" className="whitespace-nowrap text-xs">
          {row.beneficiary_number || 'قيد الإنشاء'}
        </Badge>
      )
    },
    {
      key: "full_name",
      label: "الاسم",
      render: (_: unknown, row: Beneficiary) => (
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="text-primary font-semibold text-xs sm:text-sm">
              {row.full_name.charAt(0)}
            </span>
          </div>
          <span className="truncate max-w-[100px] sm:max-w-[150px] md:max-w-none font-medium">
            {row.full_name}
          </span>
        </div>
      )
    },
    {
      key: "national_id",
      label: "رقم الهوية",
      hideOnMobile: true,
      render: (value: string) => <span className="font-mono">{value}</span>
    },
    {
      key: "family_name",
      label: "العائلة",
      hideOnTablet: true,
      render: (value: string) => value || "-"
    },
    {
      key: "category",
      label: "الفئة",
      hideOnTablet: true,
      render: (value: string) => (
        <Badge variant="outline" className="border-primary/30 text-xs">
          {value}
        </Badge>
      )
    },
    {
      key: "status",
      label: "الحالة",
      render: (_: unknown, row: Beneficiary) => (
        <div className="flex items-center gap-1">
          <Badge
            className={
              row.status === "نشط"
                ? "bg-success/10 text-success hover:bg-success/20 border border-success/30 text-xs"
                : "bg-warning/10 text-warning hover:bg-warning/20 border border-warning/30 text-xs"
            }
          >
            {row.status}
          </Badge>
          {row.can_login && (
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-xs">
              <Key className="h-2 w-2 sm:h-3 sm:w-3 ml-1" />
              مفعل
            </Badge>
          )}
        </div>
      )
    },
    {
      key: "phone",
      label: "رقم الهاتف",
      hideOnMobile: true,
      render: (value: string) => <span className="font-mono">{value}</span>
    },
    {
      key: "total_received",
      label: "إجمالي المدفوعات",
      hideOnTablet: true,
      render: () => <span className="font-semibold text-primary">-</span>
    }
  ], []);

  // Actions dropdown for each row (desktop)
  const renderActions = (beneficiary: Beneficiary) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => onViewProfile(beneficiary)}>
          <Eye className="ml-2 h-4 w-4" />
          عرض الملف الشخصي
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onEdit(beneficiary)}>
          <Edit className="ml-2 h-4 w-4" />
          تعديل البيانات
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onViewAttachments(beneficiary)}>
          <FileText className="ml-2 h-4 w-4" />
          المرفقات
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onViewActivity(beneficiary)}>
          <Activity className="ml-2 h-4 w-4" />
          سجل النشاط
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onEnableLogin(beneficiary)}>
          <Key className="ml-2 h-4 w-4" />
          {beneficiary.can_login ? "إدارة الحساب" : "تفعيل حساب الدخول"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="text-destructive"
          onClick={() => onDelete(beneficiary.id)}
        >
          <Trash2 className="ml-2 h-4 w-4" />
          حذف المستفيد
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  // Loading skeleton for mobile
  if (isLoading && isMobile) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="shadow-soft">
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded animate-pulse w-32" />
                  <div className="h-3 bg-muted rounded animate-pulse w-24" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Mobile card view
  if (isMobile) {
    return (
      <div className="space-y-3">
        <Card className="shadow-soft">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-base">قائمة المستفيدين</CardTitle>
          </CardHeader>
        </Card>
        
        {beneficiaries.length === 0 ? (
          <Card className="shadow-soft">
            <CardContent className="p-6 text-center text-muted-foreground">
              {searchQuery ? "لا توجد نتائج تطابق البحث" : "لا يوجد مستفيدين حالياً. قم بإضافة مستفيد جديد."}
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="space-y-2">
              {beneficiaries.map((beneficiary) => (
                <BeneficiaryMobileCard
                  key={beneficiary.id}
                  beneficiary={beneficiary}
                  onViewProfile={onViewProfile}
                  onEdit={onEdit}
                  onViewAttachments={onViewAttachments}
                  onViewActivity={onViewActivity}
                  onEnableLogin={onEnableLogin}
                  onDelete={onDelete}
                />
              ))}
            </div>
            
            {totalPages > 1 && (
              <Card className="shadow-soft mt-3">
                <CardContent className="p-3">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={onPageChange}
                    itemsPerPage={itemsPerPage}
                    totalItems={totalItems}
                  />
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    );
  }

  // Desktop table view
  return (
    <UnifiedDataTable
      title="قائمة المستفيدين"
      columns={columns}
      data={beneficiaries}
      loading={isLoading}
      emptyMessage={searchQuery ? "لا توجد نتائج تطابق البحث" : "لا يوجد مستفيدين حالياً. قم بإضافة مستفيد جديد."}
      pagination={{
        currentPage,
        totalPages,
        totalItems,
        itemsPerPage,
        onPageChange
      }}
      actions={renderActions}
      showMobileScrollHint={false}
    />
  );
});
