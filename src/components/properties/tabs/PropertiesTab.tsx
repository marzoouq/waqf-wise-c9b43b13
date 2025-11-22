import { useState, useMemo } from "react";
import { Search, MapPin, DollarSign, Home, Building, Edit, Trash2 } from "lucide-react";
import { useProperties } from "@/hooks/useProperties";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/DashboardStats";
import { type Property } from "@/hooks/useProperties";

interface Props {
  onEdit: (property: Property) => void;
}

export const PropertiesTab = ({ onEdit }: Props) => {
  const [searchQuery, setSearchQuery] = useState("");
  const { properties, isLoading, deleteProperty } = useProperties();

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

  const handleDelete = (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذا العقار؟")) {
      deleteProperty(id);
    }
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
          className="pr-10"
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

      {/* Properties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            جاري التحميل...
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            لا توجد عقارات
          </div>
        ) : (
          filteredProperties.map((property) => {
            const propertyIcons: Record<string, string> = {
              "سكني": "🏢",
              "تجاري": "🏪",
              "زراعي": "🌾",
              "إداري": "🏛️"
            };
            
            return (
              <Card key={property.id} className="shadow-soft hover:shadow-medium transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="text-5xl mb-4">{propertyIcons[property.type] || "🏢"}</div>
                    <Badge
                      className={
                        property.status === "مؤجر"
                          ? "bg-success/10 text-success"
                          : property.status === "شاغر"
                          ? "bg-warning/10 text-warning"
                          : "bg-primary/10 text-primary"
                      }
                    >
                      {property.status}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">{property.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Building className="h-4 w-4" />
                      <span>{property.type}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{property.location}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">الوحدات:</span>
                      <span className="font-medium">
                        {property.occupied}/{property.units}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">الإيراد السنوي:</span>
                      <span className="font-bold text-primary">
                        {Number(property.monthly_revenue || 0).toLocaleString()} ر.س
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => onEdit(property)}
                    >
                      <Edit className="ml-1 h-3 w-3" />
                      تعديل
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => handleDelete(property.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};