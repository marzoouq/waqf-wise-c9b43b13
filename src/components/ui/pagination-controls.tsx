/**
 * PaginationControls Component - عناصر التحكم بالتصفح
 * @version 2.9.9
 */
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ChevronRight, 
  ChevronLeft, 
  ChevronsRight, 
  ChevronsLeft 
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  pageSizeOptions: number[];
  startIndex: number;
  endIndex: number;
  canGoNext: boolean;
  canGoPrev: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onNext: () => void;
  onPrev: () => void;
  onFirst?: () => void;
  onLast?: () => void;
  className?: string;
  showPageSizeSelector?: boolean;
  showFirstLast?: boolean;
  compact?: boolean;
}

export function PaginationControls({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  pageSizeOptions,
  startIndex,
  endIndex,
  canGoNext,
  canGoPrev,
  onPageChange,
  onPageSizeChange,
  onNext,
  onPrev,
  onFirst,
  onLast,
  className,
  showPageSizeSelector = true,
  showFirstLast = true,
  compact = false,
}: PaginationControlsProps) {
  if (totalItems === 0) return null;

  // حساب أرقام الصفحات للعرض
  const getVisiblePages = () => {
    const pages: (number | "...")[] = [];
    const maxVisible = compact ? 3 : 5;
    
    if (totalPages <= maxVisible + 2) {
      // عرض كل الصفحات
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // عرض مع "..."
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push("...");
      }
      
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (currentPage < totalPages - 2) {
        pages.push("...");
      }
      
      pages.push(totalPages);
    }
    
    return pages;
  };

  return (
    <div 
      className={cn(
        "flex flex-col sm:flex-row items-center justify-between gap-3 p-3 sm:p-4 border-t bg-muted/30",
        className
      )}
    >
      {/* معلومات العرض */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground order-2 sm:order-1">
        <span>
          عرض {startIndex} - {endIndex} من {totalItems}
        </span>
      </div>

      {/* أزرار التنقل */}
      <div className="flex items-center gap-1 order-1 sm:order-2">
        {/* زر الأخير (RTL) */}
        {showFirstLast && onLast && (
          <Button
            variant="outline"
            size="icon"
            onClick={onLast}
            disabled={!canGoNext}
            className="h-8 w-8 hidden sm:flex"
            title="الصفحة الأخيرة"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
        )}

        {/* زر التالي (RTL) */}
        <Button
          variant="outline"
          size="icon"
          onClick={onNext}
          disabled={!canGoNext}
          className="h-8 w-8"
          title="الصفحة التالية"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* أرقام الصفحات */}
        <div className="flex items-center gap-1 mx-1">
          {getVisiblePages().map((page, index) => (
            page === "..." ? (
              <span key={`dots-${index}`} className="px-2 text-muted-foreground">
                ...
              </span>
            ) : (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="icon"
                onClick={() => onPageChange(page)}
                className={cn(
                  "h-8 w-8 text-xs",
                  currentPage === page && "pointer-events-none"
                )}
              >
                {page}
              </Button>
            )
          ))}
        </div>

        {/* زر السابق (RTL) */}
        <Button
          variant="outline"
          size="icon"
          onClick={onPrev}
          disabled={!canGoPrev}
          className="h-8 w-8"
          title="الصفحة السابقة"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* زر الأول (RTL) */}
        {showFirstLast && onFirst && (
          <Button
            variant="outline"
            size="icon"
            onClick={onFirst}
            disabled={!canGoPrev}
            className="h-8 w-8 hidden sm:flex"
            title="الصفحة الأولى"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* محدد عدد العناصر */}
      {showPageSizeSelector && (
        <div className="flex items-center gap-2 order-3">
          <span className="text-sm text-muted-foreground hidden sm:inline">
            عناصر لكل صفحة:
          </span>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => onPageSizeChange(Number(value))}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
