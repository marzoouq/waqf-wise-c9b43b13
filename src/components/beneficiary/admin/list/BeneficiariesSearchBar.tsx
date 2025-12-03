import { memo, useCallback } from "react";
import { Search, Filter, Save, Shield, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SavedSearch {
  id: string;
  name: string;
  is_favorite: boolean;
  search_criteria: unknown;
}

interface BeneficiariesSearchBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onAdvancedSearchClick: () => void;
  onTribeManagementClick: () => void;
  savedSearches: SavedSearch[];
  onLoadSearch: (search: SavedSearch) => void;
}

export const BeneficiariesSearchBar = memo(function BeneficiariesSearchBar({
  searchQuery,
  onSearchChange,
  onAdvancedSearchClick,
  onTribeManagementClick,
  savedSearches,
  onLoadSearch,
}: BeneficiariesSearchBarProps) {
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  }, [onSearchChange]);

  return (
    <Card className="shadow-soft">
      <CardContent className="pt-3 sm:pt-6 p-3 sm:p-6">
        <div className="flex flex-col gap-3 sm:gap-4">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
            <Input
              placeholder="البحث (الاسم، رقم الهوية، العائلة...)"
              value={searchQuery}
              onChange={handleSearchChange}
              className="pr-9 sm:pr-10 text-sm sm:text-base"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              onClick={onAdvancedSearchClick} 
              className="flex-1 sm:flex-none gap-2 text-xs sm:text-sm" 
              size="sm"
            >
              <Filter className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">بحث متقدم</span>
              <span className="sm:hidden">بحث</span>
            </Button>
            {savedSearches.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                    <Save className="h-3 w-3 sm:h-4 sm:w-4 ml-2" />
                    عمليات بحث
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {savedSearches.map((search) => (
                    <DropdownMenuItem key={search.id} onClick={() => onLoadSearch(search)}>
                      {search.is_favorite && <Star className="ml-2 h-3 w-3 fill-current" />}
                      {search.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <Button 
              variant="outline" 
              onClick={onTribeManagementClick}
              className="flex-1 sm:flex-none gap-2 text-xs sm:text-sm"
              size="sm"
            >
              <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">القبائل</span>
              <span className="sm:hidden">قبائل</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
