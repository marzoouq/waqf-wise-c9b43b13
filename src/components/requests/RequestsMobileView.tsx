/**
 * Mobile View Component for Requests Page
 * عرض الطلبات على الموبايل
 */
import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pagination } from '@/components/shared/Pagination';
import { RequestMobileCard } from './RequestMobileCard';

interface RequestsMobileViewProps {
  paginatedRequests: any[];
  filteredRequests: any[];
  searchQuery: string;
  statusFilter: string;
  setSelectedRequest: (request: any) => void;
  setApprovalDialogOpen: (open: boolean) => void;
  setCommentsDialogOpen: (open: boolean) => void;
  handleDeleteClick: (request: any) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  itemsPerPage: number;
}

export const RequestsMobileView = memo(({ 
  paginatedRequests, 
  filteredRequests, 
  searchQuery, 
  statusFilter,
  setSelectedRequest,
  setApprovalDialogOpen,
  setCommentsDialogOpen,
  handleDeleteClick,
  currentPage,
  setCurrentPage,
  totalPages,
  itemsPerPage,
}: RequestsMobileViewProps) => (
  <div className="space-y-3">
    <Card className="shadow-soft">
      <CardHeader className="py-3 px-4">
        <CardTitle className="text-base">قائمة الطلبات ({filteredRequests.length})</CardTitle>
      </CardHeader>
    </Card>
    
    {paginatedRequests.length === 0 ? (
      <Card className="shadow-soft">
        <CardContent className="p-6 text-center text-muted-foreground">
          {searchQuery || statusFilter !== 'all'
            ? 'لا توجد نتائج مطابقة لبحثك'
            : 'لا توجد طلبات حالياً'}
        </CardContent>
      </Card>
    ) : (
      <>
        <div className="space-y-2">
          {paginatedRequests.map((request: any) => (
            <RequestMobileCard
              key={request.id}
              request={request}
              onViewDetails={(r: any) => {
                setSelectedRequest(r);
                setApprovalDialogOpen(true);
              }}
              onViewComments={(r: any) => {
                setSelectedRequest(r);
                setCommentsDialogOpen(true);
              }}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
        
        {totalPages > 1 && (
          <Card className="shadow-soft mt-3">
            <CardContent className="p-3">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredRequests.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
              />
            </CardContent>
          </Card>
        )}
      </>
    )}
  </div>
));

RequestsMobileView.displayName = 'RequestsMobileView';
