import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface PhaseFilterProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  counts: {
    all: number;
    core: number;
    design: number;
    testing: number;
    future: number;
  };
}

export const PhaseFilter = ({
  activeCategory,
  onCategoryChange,
  counts,
}: PhaseFilterProps) => {
  return (
    <Tabs value={activeCategory} onValueChange={onCategoryChange} className="w-full">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="all" className="gap-2">
          الكل
          <Badge variant="secondary" className="h-5 w-5 p-0 text-xs">
            {counts.all}
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="core" className="gap-2">
          وظيفية
          <Badge variant="secondary" className="h-5 w-5 p-0 text-xs">
            {counts.core}
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="design" className="gap-2">
          تصميم
          <Badge variant="secondary" className="h-5 w-5 p-0 text-xs">
            {counts.design}
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="testing" className="gap-2">
          اختبار
          <Badge variant="secondary" className="h-5 w-5 p-0 text-xs">
            {counts.testing}
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="future" className="gap-2">
          مستقبلية
          <Badge variant="secondary" className="h-5 w-5 p-0 text-xs">
            {counts.future}
          </Badge>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};
