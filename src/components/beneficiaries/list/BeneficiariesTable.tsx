import { MoreVertical, Eye, Edit, FileText, Activity, Key, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Pagination } from "@/components/ui/pagination";
import { ScrollableTableWrapper } from "@/components/shared/ScrollableTableWrapper";
import { MobileScrollHint } from "@/components/shared/MobileScrollHint";
import { Beneficiary } from "@/types/beneficiary";

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

export function BeneficiariesTable({
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
  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">قائمة المستفيدين</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <MobileScrollHint />
        <ScrollableTableWrapper>
          <div className="min-w-max">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="text-right font-semibold whitespace-nowrap text-xs sm:text-sm">رقم المستفيد</TableHead>
                  <TableHead className="text-right font-semibold whitespace-nowrap text-xs sm:text-sm">الاسم</TableHead>
                  <TableHead className="text-right font-semibold whitespace-nowrap text-xs sm:text-sm hidden md:table-cell">رقم الهوية</TableHead>
                  <TableHead className="text-right font-semibold whitespace-nowrap text-xs sm:text-sm hidden lg:table-cell">العائلة</TableHead>
                  <TableHead className="text-right font-semibold whitespace-nowrap text-xs sm:text-sm hidden lg:table-cell">الفئة</TableHead>
                  <TableHead className="text-right font-semibold whitespace-nowrap text-xs sm:text-sm">الحالة</TableHead>
                  <TableHead className="text-right font-semibold whitespace-nowrap text-xs sm:text-sm hidden md:table-cell">رقم الهاتف</TableHead>
                  <TableHead className="text-right font-semibold whitespace-nowrap text-xs sm:text-sm hidden lg:table-cell">إجمالي المدفوعات</TableHead>
                  <TableHead className="text-right font-semibold whitespace-nowrap text-xs sm:text-sm">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      جاري التحميل...
                    </TableCell>
                  </TableRow>
                ) : beneficiaries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      {searchQuery ? "لا توجد نتائج تطابق البحث" : "لا يوجد مستفيدين حالياً. قم بإضافة مستفيد جديد."}
                    </TableCell>
                  </TableRow>
                ) : (
                  beneficiaries.map((beneficiary) => (
                    <TableRow key={beneficiary.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="font-mono text-xs sm:text-sm">
                        <Badge variant="secondary" className="whitespace-nowrap text-xs">
                          {beneficiary.beneficiary_number || 'قيد الإنشاء'}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium text-xs sm:text-sm">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-primary font-semibold text-xs sm:text-sm">
                              {beneficiary.full_name.charAt(0)}
                            </span>
                          </div>
                          <span className="truncate max-w-[100px] sm:max-w-[150px] md:max-w-none">{beneficiary.full_name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs sm:text-sm hidden md:table-cell">
                        {beneficiary.national_id}
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm hidden lg:table-cell">{beneficiary.family_name || "-"}</TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <Badge variant="outline" className="border-primary/30 text-xs">{beneficiary.category}</Badge>
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm">
                        <Badge
                          className={
                            beneficiary.status === "نشط"
                              ? "bg-success/10 text-success hover:bg-success/20 border border-success/30 text-xs"
                              : "bg-warning/10 text-warning hover:bg-warning/20 border border-warning/30 text-xs"
                          }
                        >
                          {beneficiary.status}
                        </Badge>
                        {beneficiary.can_login && (
                          <Badge variant="outline" className="mr-1 bg-primary/10 text-primary border-primary/30 text-xs">
                            <Key className="h-2 w-2 sm:h-3 sm:w-3 ml-1" />
                            مفعل
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-xs sm:text-sm hidden md:table-cell">
                        {beneficiary.phone}
                      </TableCell>
                      <TableCell className="font-semibold text-primary text-xs sm:text-sm hidden lg:table-cell">
                        -
                      </TableCell>
                      <TableCell>
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
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </ScrollableTableWrapper>
        {totalPages > 1 && (
          <div className="p-4 border-t">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={onPageChange}
              itemsPerPage={itemsPerPage}
              totalItems={totalItems}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
