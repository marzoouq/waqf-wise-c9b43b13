import { memo } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface ContractsFilterTabsProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  counts: {
    all: number;
    active: number;
    draft: number;
    renewal: number;
    autoRenew: number;
    expired: number;
  };
}

export const ContractsFilterTabs = memo(function ContractsFilterTabs({
  activeFilter,
  onFilterChange,
  counts,
}: ContractsFilterTabsProps) {
  const tabs = [
    { key: "all", label: "جميع العقود", count: counts.all },
    { key: "active", label: "العقود النشطة", count: counts.active },
    { key: "draft", label: "العقود المسودة", count: counts.draft },
    { key: "renewal", label: "جاهز للتجديد", count: counts.renewal, highlight: counts.renewal > 0 },
    { key: "autoRenew", label: "المتجددة تلقائياً", count: counts.autoRenew },
    { key: "expired", label: "المنتهية", count: counts.expired },
  ];

  return (
    <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
      <Tabs value={activeFilter} onValueChange={onFilterChange}>
        <TabsList className="inline-flex w-max h-auto p-1 gap-1">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.key}
              value={tab.key}
              className="gap-2 px-3 py-2 text-xs sm:text-sm whitespace-nowrap data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              {tab.label}
              <Badge
                variant={tab.highlight ? "destructive" : "secondary"}
                className="h-5 min-w-5 px-1.5 text-[10px] sm:text-xs"
              >
                {tab.count}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
});
