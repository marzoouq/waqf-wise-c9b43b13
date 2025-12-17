import { useState, useMemo } from "react";
import { Search, MapPin, DollarSign, Home, Building, Edit, Trash2, Eye } from "lucide-react";
import { useProperties, type Property } from "@/hooks/property/useProperties";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/DashboardStats";
import { UnifiedDataTable } from "@/components/unified/UnifiedDataTable";
import { useDeleteConfirmation } from "@/hooks/shared";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";


interface Props {
  onEdit: (property: Property) => void;
  onSelectProperty?: (property: Property) => void;
}

export const PropertiesTab = ({ onEdit, onSelectProperty }: Props) => {
  const [searchQuery, setSearchQuery] = useState("");
  const { properties, isLoading, deleteProperty } = useProperties();

  const {
    confirmDelete,
    isOpen: isDeleteOpen,
    isDeleting,
    executeDelete,
    onOpenChange: onDeleteOpenChange,
    itemName,
    dialogTitle,
    dialogDescription,
  } = useDeleteConfirmation<string>({
    onDelete: async (id) => {
      deleteProperty(id);
    },
    successMessage: 'تم حذف العقار بنجاح',
    errorMessage: 'فشل حذف العقار',
    title: 'حذف العقار',
    description: 'هل أنت متأكد من حذف هذا العقار؟',
  });

  const filteredProperties = useMemo(() => {
    if (!searchQuery) return properties;
    
    const query = searchQuery.toLowerCase();
    return properties?.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.type.toLowerCase().includes(query) ||
        p.location.toLowerCase().includes(query)
    ) || [];
  }, [properties, searchQuery]);

  const stats = useMemo(() => {
    const totalUnits = properties?.reduce((sum, p) => sum + p.units, 0) || 0;
    const occupiedUnits = properties?.reduce((sum, p) => sum + p.occupied, 0) || 0;
    const totalRevenue = properties?.reduce((sum, p) => sum + Number(p.monthly_revenue || 0), 0) || 0;

    return [
      {
        label: "إجمالي العقارات",
        value: properties?.length.toString() || "0",
        icon: Building,
        color: "text-primary",
      },
      {
        label: "الوحدات المؤجرة",
        value: occupiedUnits.toString(),
        icon: Home,
        color: "text-success",
      },
      {
        label: "الوحدات الشاغرة",
        value: (totalUnits - occupiedUnits).toString(),
        icon: MapPin,
        color: "text-warning",
      },
      {
        label: "الإيرادات السنوية",
        value: `${totalRevenue.toLocaleString()} ر.س`,
        icon: DollarSign,
        color: "text-accent",
      },
    ];
  }, [properties]);

  const handleDelete = (id: string, name?: string) => {
    confirmDelete(id, name);
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="البحث عن عقار..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pe-10"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
          />
        ))}
      </div>

      {/* Properties Table */}
      <UnifiedDataTable
        title="العقارات"
        columns={[
          {
            key: "name",
            label: "اسم العقار",
            render: (value: string) => (
              <span className="font-medium">{value}</span>
            )
          },
          {
            key: "type",
            label: "النوع",
            render: (value: string) => (
              <Badge variant="outline" className="border-primary/30">
                {value}
              </Badge>
            )
          },
          {
            key: "location",
            label: "الموقع",
            hideOnMobile: true,
            render: (value: string) => (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{value}</span>
              </div>
            )
          },
          {
            key: "units",
            label: "الوحدات",
            hideOnTablet: true,
            render: (_: unknown, row: Property) => (
              <span className="font-medium whitespace-nowrap">
                {row.occupied}/{row.units}
              </span>
            )
          },
          {
            key: "monthly_revenue",
            label: "الإيراد الشهري",
            render: (value: number) => (
              <span className="font-bold text-primary whitespace-nowrap">
                {Number(value || 0).toLocaleString()} ر.س
              </span>
            )
          },
          {
            key: "status",
            label: "الحالة",
            render: (value: string) => (
              <Badge
                className={
                  value === "مؤجر"
                    ? "bg-success/10 text-success border-success/30"
                    : value === "شاغر"
                    ? "bg-warning/10 text-warning border-warning/30"
                    : "bg-primary/10 text-primary border-primary/30"
                }
              >
                {value}
              </Badge>
            )
          }
        ]}
        data={filteredProperties}
        loading={isLoading}
        emptyMessage="لا توجد عقارات"
        actions={(property: Property) => (
          <div className="flex gap-1">
            {onSelectProperty && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSelectProperty(property)}
                title="عرض الوحدات"
                className="hover:bg-info/10"
              >
                <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(property)}
              title="تعديل"
              className="hover:bg-primary/10"
            >
              <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => handleDelete(property.id, property.name)}
              title="حذف"
            >
              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        )}
        showMobileScrollHint={true}
      />

      <DeleteConfirmDialog
        open={isDeleteOpen}
        onOpenChange={onDeleteOpenChange}
        onConfirm={executeDelete}
        title={dialogTitle}
        description={dialogDescription}
        itemName={itemName}
        isLoading={isDeleting}
        isDestructive={true}
      />
    </div>
  );
};
