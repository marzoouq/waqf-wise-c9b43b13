/**
 * UnifiedTabsList - قائمة تبويبات موحدة للوحات التحكم
 * @version 1.0.0
 */

import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface TabItem {
  value: string;
  label: string;
  icon?: LucideIcon;
}

interface UnifiedTabsListProps {
  tabs: TabItem[];
  columns?: 3 | 4 | 5 | 6;
  className?: string;
}

export function UnifiedTabsList({ tabs, columns = 4, className }: UnifiedTabsListProps) {
  const gridColsMap = {
    3: "grid-cols-3",
    4: "grid-cols-4",
    5: "grid-cols-5",
    6: "grid-cols-6",
  };

  return (
    <ScrollArea className="w-full" dir="rtl">
      <TabsList
        className={cn(
          "h-auto p-1 bg-muted/50 w-full",
          // Mobile: flex scrollable
          "flex flex-nowrap gap-1 overflow-x-auto",
          // Desktop: grid layout
          `lg:grid lg:${gridColsMap[columns]}`,
          "lg:w-auto",
          className
        )}
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className={cn(
              "flex items-center justify-center gap-2",
              "px-3 py-2 text-sm whitespace-nowrap flex-shrink-0",
              "data-[state=active]:bg-background data-[state=active]:shadow-sm"
            )}
          >
            {tab.icon && <tab.icon className="h-4 w-4" />}
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden text-xs">{tab.label.slice(0, 6)}</span>
          </TabsTrigger>
        ))}
      </TabsList>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
