/**
 * قسم التحكم بعرض المستفيدين - محسّن ومُقسّم
 * يسمح للناظر بإخفاء/إظهار أقسام معينة للمستفيدين والورثة
 * 
 * التحسينات:
 * - تقسيم المكونات الكبيرة لتحسين الأداء
 * - استخدام CSS Variables بدلاً من Tailwind المباشر
 * 
 * @version 2.8.91
 */
import { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useVisibilitySettings } from "@/hooks/governance/useVisibilitySettings";
import { 
  SettingsCategoryCard, 
  SettingsSearchFilter, 
  BulkActionsBar,
  SETTING_CATEGORIES,
  TOTAL_SETTINGS,
} from "./control";

interface VisibilityPanelProps {
  targetRole: 'beneficiary' | 'waqf_heir';
  roleLabel: string;
}

function VisibilityPanel({ targetRole, roleLabel }: VisibilityPanelProps) {
  const { settings, isLoading, updateSettings, isUpdating } = useVisibilitySettings(targetRole);
  const [pendingChanges, setPendingChanges] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [expandedCategories, setExpandedCategories] = useState<string[]>(
    SETTING_CATEGORIES.map(c => c.id)
  );

  const handleToggle = (key: string, value: boolean) => {
    setPendingChanges(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveAll = async () => {
    if (Object.keys(pendingChanges).length === 0) return;
    await updateSettings(pendingChanges);
    setPendingChanges({});
  };

  const handleDiscardChanges = () => {
    setPendingChanges({});
  };

  const getSettingValue = (key: string): boolean => {
    if (key in pendingChanges) return pendingChanges[key];
    return settings?.[key as keyof typeof settings] as boolean ?? true;
  };

  const isChanged = (key: string): boolean => key in pendingChanges;

  // تفعيل/إلغاء الكل لفئة معينة
  const handleBulkAction = (categoryId: string, enable: boolean) => {
    const category = SETTING_CATEGORIES.find(c => c.id === categoryId);
    if (!category) return;
    
    const changes: Record<string, boolean> = {};
    category.settings.forEach(s => {
      changes[s.key] = enable;
    });
    setPendingChanges(prev => ({ ...prev, ...changes }));
  };

  // تفعيل/إلغاء الكل
  const handleBulkActionAll = (enable: boolean) => {
    const changes: Record<string, boolean> = {};
    SETTING_CATEGORIES.forEach(cat => {
      cat.settings.forEach(s => {
        changes[s.key] = enable;
      });
    });
    setPendingChanges(prev => ({ ...prev, ...changes }));
  };

  // فلترة الفئات والإعدادات
  const filteredCategories = useMemo(() => {
    return SETTING_CATEGORIES
      .filter(cat => selectedCategory === "all" || cat.id === selectedCategory)
      .map(cat => ({
        ...cat,
        settings: cat.settings.filter(s => 
          s.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.description?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      }))
      .filter(cat => cat.settings.length > 0);
  }, [searchQuery, selectedCategory]);

  const totalEnabled = useMemo(() => {
    return SETTING_CATEGORIES.reduce((acc, cat) => 
      acc + cat.settings.filter(s => getSettingValue(s.key)).length, 0
    );
  }, [settings, pendingChanges]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* شريط البحث والفلترة */}
      <SettingsSearchFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        categories={SETTING_CATEGORIES.map(c => ({ 
          id: c.id, 
          title: c.title, 
          icon: c.icon, 
          iconColor: c.iconColor 
        }))}
        totalSettings={TOTAL_SETTINGS}
      />

      {/* شريط الإجراءات الجماعية */}
      <BulkActionsBar
        roleLabel={roleLabel}
        totalEnabled={totalEnabled}
        totalSettings={TOTAL_SETTINGS}
        pendingChangesCount={Object.keys(pendingChanges).length}
        isUpdating={isUpdating}
        onEnableAll={() => handleBulkActionAll(true)}
        onDisableAll={() => handleBulkActionAll(false)}
        onResetToDefault={() => handleBulkActionAll(true)}
        onSave={handleSaveAll}
        onDiscard={handleDiscardChanges}
      />

      {/* نتائج البحث */}
      {searchQuery && (
        <div className="text-sm text-muted-foreground">
          تم العثور على {filteredCategories.reduce((acc, cat) => acc + cat.settings.length, 0)} نتيجة
        </div>
      )}

      {/* الفئات */}
      <ScrollArea className="h-[500px] pe-2">
        <div className="space-y-3">
          {filteredCategories.map((category) => (
            <SettingsCategoryCard
              key={category.id}
              id={category.id}
              title={category.title}
              icon={category.icon}
              iconColor={category.iconColor}
              settings={category.settings}
              isExpanded={expandedCategories.includes(category.id)}
              onToggle={() => toggleCategory(category.id)}
              getSettingValue={getSettingValue}
              onSettingChange={handleToggle}
              onBulkAction={handleBulkAction}
              isChanged={isChanged}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

export function BeneficiaryControlSection() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="waqf_heir" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="waqf_heir" className="gap-2">
            <Eye className="h-4 w-4" />
            إعدادات الورثة
          </TabsTrigger>
          <TabsTrigger value="beneficiary" className="gap-2">
            <EyeOff className="h-4 w-4" />
            إعدادات المستفيدين
          </TabsTrigger>
        </TabsList>

        <TabsContent value="waqf_heir" className="mt-4">
          <VisibilityPanel targetRole="waqf_heir" roleLabel="ورثة الوقف" />
        </TabsContent>

        <TabsContent value="beneficiary" className="mt-4">
          <VisibilityPanel targetRole="beneficiary" roleLabel="المستفيدون" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
