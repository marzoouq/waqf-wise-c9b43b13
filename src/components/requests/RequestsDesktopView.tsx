/**
 * Desktop View Component for Requests Page
 * عرض الطلبات على سطح المكتب
 */
import { memo } from 'react';
import { GitBranch, MessageSquare, Trash2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Pagination } from '@/components/shared/Pagination';
import { EnhancedEmptyState } from '@/components/shared';
import { SortableTableHeader } from '@/components/shared/SortableTableHeader';
import { getRequestTypeName } from '@/types/request.types';
import { RequestStatusBadge } from './RequestStatusBadge';

type SortDirection = 'asc' | 'desc' | null;

interface RequestsDesktopViewProps {
  paginatedRequests: any[];
  filteredRequests: any[];
  searchQuery: string;
  statusFilter: string;
  isAllSelected: boolean;
  toggleAll: () => void;
  isSelected: (id: string) => boolean;
  toggleSelection: (id: string) => void;
  sortConfig: { key: string | null; direction: SortDirection } | null;
  handleSort: (key: string, direction: SortDirection) => void;
  setSelectedRequest: (request: any) => void;
  setApprovalDialogOpen: (open: boolean) => void;
  setCommentsDialogOpen: (open: boolean) => void;
  handleDeleteClick: (request: any) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  itemsPerPage: number;
  handleItemsPerPageChange: (size: number) => void;
}

export const RequestsDesktopView = memo(({
  paginatedRequests,
  filteredRequests,
  searchQuery,
  statusFilter,
  isAllSelected,
  toggleAll,
  isSelected,
  toggleSelection,
  sortConfig,
  handleSort,
  setSelectedRequest,
  setApprovalDialogOpen,
  setCommentsDialogOpen,
  handleDeleteClick,
  currentPage,
  setCurrentPage,
  totalPages,
  itemsPerPage,
  handleItemsPerPageChange,
}: RequestsDesktopViewProps) => (
  <Card>
    <CardHeader>
      <CardTitle>قائمة الطلبات</CardTitle>
      <CardDescription>
        عرض جميع الطلبات ({filteredRequests.length})
      </CardDescription>
    </CardHeader>
    <CardContent>
      {paginatedRequests.length === 0 ? (
        <EnhancedEmptyState
          icon={AlertCircle}
          title="لا توجد طلبات"
          description={
            searchQuery || statusFilter !== 'all'
              ? 'لا توجد نتائج مطابقة لبحثك. جرب تغيير معايير البحث أو الفلتر.'
              : 'لم يتم تقديم أي طلبات بعد. سيتم عرض الطلبات هنا عند تقديمها من المستفيدين.'
          }
        />
      ) : (
        <div className="space-y-4">
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={toggleAll}
                      aria-label="تحديد الكل"
                    />
                  </TableHead>
                  <SortableTableHeader
                    label="رقم الطلب"
                    sortKey="request_number"
                    currentSort={sortConfig}
                    onSort={handleSort}
                    className="text-xs sm:text-sm whitespace-nowrap"
                  />
                  <TableHead className="text-right text-xs sm:text-sm whitespace-nowrap">المستفيد</TableHead>
                  <TableHead className="text-right text-xs sm:text-sm whitespace-nowrap hidden md:table-cell">نوع الطلب</TableHead>
                  <TableHead className="text-right text-xs sm:text-sm whitespace-nowrap hidden lg:table-cell">الوصف</TableHead>
                  <SortableTableHeader
                    label="المبلغ"
                    sortKey="amount"
                    currentSort={sortConfig}
                    onSort={handleSort}
                    className="hidden md:table-cell text-xs sm:text-sm whitespace-nowrap"
                  />
                  <SortableTableHeader
                    label="الحالة"
                    sortKey="status"
                    currentSort={sortConfig}
                    onSort={handleSort}
                    className="text-xs sm:text-sm whitespace-nowrap"
                  />
                  <SortableTableHeader
                    label="الأولوية"
                    sortKey="priority"
                    currentSort={sortConfig}
                    onSort={handleSort}
                    className="hidden lg:table-cell text-xs sm:text-sm whitespace-nowrap"
                  />
                  <SortableTableHeader
                    label="تاريخ التقديم"
                    sortKey="submitted_at"
                    currentSort={sortConfig}
                    onSort={handleSort}
                    className="hidden lg:table-cell text-xs sm:text-sm whitespace-nowrap"
                  />
                  <TableHead className="text-right text-xs sm:text-sm whitespace-nowrap">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedRequests.map((request: any) => (
                  <TableRow
                    key={request.id}
                    className={`cursor-pointer hover:bg-muted/50 ${
                      request.is_overdue ? 'bg-destructive/5' : ''
                    }`}
                  >
                    <TableCell>
                      <Checkbox
                        checked={isSelected(request.id)}
                        onCheckedChange={() => toggleSelection(request.id)}
                        aria-label={`تحديد ${request.request_number}`}
                      />
                    </TableCell>
                    <TableCell className="font-mono font-medium text-xs sm:text-sm">
                      {request.request_number}
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      {request.beneficiary && 'full_name' in request.beneficiary 
                        ? request.beneficiary.full_name 
                        : '-'}
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm hidden md:table-cell">
                      <Badge variant="outline" className="text-xs whitespace-nowrap">
                        {getRequestTypeName(request)}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-xs sm:text-sm hidden lg:table-cell">
                      {request.description}
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm hidden md:table-cell whitespace-nowrap">
                      {request.amount > 0
                        ? `${request.amount.toLocaleString('ar-SA')} ريال`
                        : '-'}
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      <RequestStatusBadge status={request.status} />
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm hidden lg:table-cell">
                      <Badge
                        variant={
                          request.priority === 'عاجل'
                            ? 'destructive'
                            : request.priority === 'مهم'
                            ? 'default'
                            : 'secondary'
                        }
                        className="text-xs whitespace-nowrap"
                      >
                        {request.priority}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs sm:text-sm hidden lg:table-cell whitespace-nowrap">
                      {new Date(request.submitted_at).toLocaleDateString('ar-SA')}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 sm:gap-2 flex-wrap">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedRequest(request);
                            setApprovalDialogOpen(true);
                          }}
                          className="text-xs"
                        >
                          <GitBranch className="h-3 w-3 sm:h-4 sm:w-4 ml-1 sm:ml-2" />
                          <span className="hidden sm:inline">مسار الموافقات</span>
                          <span className="sm:hidden">موافقات</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedRequest(request);
                            setCommentsDialogOpen(true);
                          }}
                          className="text-xs"
                        >
                          <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 ml-1 sm:ml-2" />
                          <span className="hidden sm:inline">التعليقات</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteClick(request)}
                          className="text-xs text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredRequests.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          )}
        </div>
      )}
    </CardContent>
  </Card>
));

RequestsDesktopView.displayName = 'RequestsDesktopView';
