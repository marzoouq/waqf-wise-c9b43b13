import { Button } from "@/components/ui/button";
import { Building, FileText, DollarSign, Wrench, LucideIcon, Brain, Users } from "lucide-react";
import { ExportButton } from "@/components/shared/ExportButton";
import { type Property } from "@/hooks/useProperties";

interface PropertiesHeaderProps {
  activeTab: string;
  properties?: Property[];
  onAddClick: (type: 'property' | 'contract' | 'payment' | 'maintenance') => void;
  onAIClick?: () => void;
  onProvidersClick?: () => void;
}

export const PropertiesHeader = ({ activeTab, properties, onAddClick, onAIClick, onProvidersClick }: PropertiesHeaderProps) => {
  const getAddButton = () => {
    const buttons: Record<string, { label: string; icon: LucideIcon; type: 'property' | 'contract' | 'payment' | 'maintenance' }> = {
      properties: { label: "إضافة عقار", icon: Building, type: 'property' },
      contracts: { label: "إضافة عقد", icon: FileText, type: 'contract' },
      payments: { label: "إضافة دفعة", icon: DollarSign, type: 'payment' },
      maintenance: { label: "إضافة طلب صيانة", icon: Wrench, type: 'maintenance' },
    };

    const button = buttons[activeTab];
    if (!button) return null;
    
    const Icon = button.icon;

    return (
      <Button
        className="bg-primary hover:bg-primary-hover text-primary-foreground shadow-soft w-full md:w-auto"
        onClick={() => onAddClick(button.type)}
      >
        <Icon className="ml-2 h-4 w-4 md:h-5 md:w-5" />
        <span className="text-sm md:text-base">{button.label}</span>
      </Button>
    );
  };

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gradient-primary">
          إدارة العقارات والعقود
        </h1>
        <p className="text-muted-foreground mt-1 text-xs sm:text-sm md:text-base">
          إدارة شاملة للعقارات، العقود، الإيجارات والصيانة
        </p>
      </div>
      <div className="flex gap-2 flex-wrap">
        {onAIClick && (
          <Button variant="outline" size="sm" onClick={onAIClick}>
            <Brain className="h-4 w-4 ml-2" />
            مساعد AI
          </Button>
        )}
        {onProvidersClick && (
          <Button variant="outline" size="sm" onClick={onProvidersClick}>
            <Users className="h-4 w-4 ml-2" />
            مقدمي الخدمة
          </Button>
        )}
        {activeTab === "properties" && properties && properties.length > 0 && (
          <ExportButton
            data={properties.map(p => ({
              'الاسم': p.name,
              'النوع': p.type,
              'الموقع': p.location,
              'عدد الوحدات': p.units || "-",
              'المؤجرة': p.occupied || "-",
              'الإيراد الشهري': p.monthly_revenue || 0,
              'الحالة': p.status,
            }))}
            filename="properties"
            title="تقرير العقارات"
            headers={['الاسم', 'النوع', 'الموقع', 'عدد الوحدات', 'المؤجرة', 'الإيراد الشهري', 'الحالة']}
          />
        )}
        {getAddButton()}
      </div>
    </div>
  );
};
