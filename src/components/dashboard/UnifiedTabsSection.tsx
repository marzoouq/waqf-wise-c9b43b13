import { Suspense } from "react";
import { type LucideIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SectionSkeleton } from "./SectionSkeleton";
import { cn } from "@/lib/utils";

interface TabItem {
  value: string;
  label: string;
  icon: LucideIcon;
  content: React.ReactNode;
  badge?: string | number; // Optional badge for notifications/counts
}

interface UnifiedTabsSectionProps {
  tabs: TabItem[];
  defaultTab?: string;
  className?: string;
  contentClassName?: string;
}

export function UnifiedTabsSection({ 
  tabs, 
  defaultTab,
  className,
  contentClassName 
}: UnifiedTabsSectionProps) {
  return (
    <Tabs 
      defaultValue={defaultTab || tabs[0]?.value} 
      className={cn("w-full", className)}
    >
      <TabsList 
        className="grid w-full h-auto p-1 bg-muted/50"
        style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}
      >
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <TabsTrigger 
              key={tab.value}
              value={tab.value}
              className="gap-1 sm:gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm relative"
            >
              <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline text-xs sm:text-sm">{tab.label}</span>
              {tab.badge && (
                <span className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 rounded-full bg-destructive text-destructive-foreground text-[10px] sm:text-xs font-bold flex items-center justify-center">
                  {tab.badge}
                </span>
              )}
            </TabsTrigger>
          );
        })}
      </TabsList>

      {tabs.map(tab => (
        <TabsContent 
          key={tab.value} 
          value={tab.value} 
          className={cn("mt-4 sm:mt-6", contentClassName)}
        >
          <Suspense fallback={<SectionSkeleton />}>
            {tab.content}
          </Suspense>
        </TabsContent>
      ))}
    </Tabs>
  );
}
