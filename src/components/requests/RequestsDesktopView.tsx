/**
 * Desktop View Component for Requests Page
 * عرض الطلبات على سطح المكتب - نمط البطاقات
 */
import { memo } from 'react';
import { AlertCircle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Pagination } from '@/components/shared/Pagination';
import { EnhancedEmptyState } from '@/components/shared';
import { RequestGridCard } from './RequestGridCard';
import { type FullRequest } from '@/types/request.types';

type SortDirection = 'asc' | 'desc' | null;

interface RequestsDesktopViewProps {
  paginatedRequests: FullRequest[];
  filteredRequests: FullRequest[];
  searchQuery: string;
  statusFilter: string;
  isAllSelected: boolean;
  toggleAll: () => void;
  isSelected: (id: string) => boolean;
  toggleSelection: (id: string) => void;
  sortConfig: { key: string | null; direction: SortDirection } | null;
  handleSort: (key: string, direction: SortDirection) => void;
  setSelectedRequest: (request: FullRequest) => void;
  setApprovalDialogOpen: (open: boolean) => void;
  setCommentsDialogOpen: (open: boolean) => void;
  handleDeleteClick: (request: FullRequest) => void;
  handleViewDetails: (request: FullRequest) => void;
  onAddRequest?: () => void;
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
  setSelectedRequest,
  setApprovalDialogOpen,
  setCommentsDialogOpen,
  handleDeleteClick,
  handleViewDetails,
  onAddRequest,
  currentPage,
  setCurrentPage,
  totalPages,
  itemsPerPage,
  handleItemsPerPageChange,
}: RequestsDesktopViewProps) => {

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle className="text-lg">قائمة الطلبات</CardTitle>
          <CardDescription>
            عرض جميع الطلبات ({filteredRequests.length})
          </CardDescription>
        </div>
        {onAddRequest && (
          <Button onClick={onAddRequest} size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            طلب جديد
          </Button>
        )}
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
            action={onAddRequest ? {
              label: 'إضافة طلب',
              onClick: onAddRequest,
            } : undefined}
          />
        ) : (
          <div className="space-y-4">
            {/* Grid عرض البطاقات */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {paginatedRequests.map((request) => (
                <RequestGridCard
                  key={request.id}
                  request={request}
                  onViewDetails={handleViewDetails}
                  onApproval={(r) => {
                    setSelectedRequest(r);
                    setApprovalDialogOpen(true);
                  }}
                  onComments={(r) => {
                    setSelectedRequest(r);
                    setCommentsDialogOpen(true);
                  }}
                  onDelete={handleDeleteClick}
                />
              ))}
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
  );
});

RequestsDesktopView.displayName = 'RequestsDesktopView';
