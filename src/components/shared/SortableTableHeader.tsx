import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableHead } from "@/components/ui/table";

export type SortDirection = "asc" | "desc" | null;

interface SortableTableHeaderProps {
  label: string;
  sortKey: string;
  currentSort?: { key: string; direction: SortDirection };
  onSort: (key: string, direction: SortDirection) => void;
  className?: string;
}

export function SortableTableHeader({
  label,
  sortKey,
  currentSort,
  onSort,
  className = "",
}: SortableTableHeaderProps) {
  const isActive = currentSort?.key === sortKey;
  const direction = isActive ? currentSort.direction : null;

  const handleClick = () => {
    let newDirection: SortDirection = "asc";
    
    if (direction === "asc") {
      newDirection = "desc";
    } else if (direction === "desc") {
      newDirection = null;
    }
    
    onSort(sortKey, newDirection);
  };

  return (
    <TableHead className={`text-right ${className}`}>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleClick}
        className="h-8 font-semibold hover:bg-muted"
      >
        {label}
        {!isActive && <ArrowUpDown className="mr-2 h-4 w-4" />}
        {direction === "asc" && <ArrowUp className="mr-2 h-4 w-4 text-primary" />}
        {direction === "desc" && <ArrowDown className="mr-2 h-4 w-4 text-primary" />}
      </Button>
    </TableHead>
  );
}
