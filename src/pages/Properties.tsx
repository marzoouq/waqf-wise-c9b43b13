import { useState, useMemo, useCallback } from "react";
import { Plus, Search, MapPin, DollarSign, Home, Building, Edit, Trash2 } from "lucide-react";
import { PropertyDialog } from "@/components/properties/PropertyDialog";
import { useProperties } from "@/hooks/useProperties";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/dashboard/DashboardStats";
import { Pagination } from "@/components/ui/pagination";

const ITEMS_PER_PAGE = 12;

const Properties = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const { properties, isLoading, addProperty, updateProperty, deleteProperty } = useProperties();

  // Memoize filtered properties for better performance
  const filteredProperties = useMemo(() => {
    if (!searchQuery) return properties;
    
    const query = searchQuery.toLowerCase();
    return properties.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.type.toLowerCase().includes(query) ||
        p.location.toLowerCase().includes(query) ||
        p.status.toLowerCase().includes(query)
    );
  }, [properties, searchQuery]);

  // Paginate filtered results
  const paginatedProperties = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredProperties.slice(startIndex, endIndex);
  }, [filteredProperties, currentPage]);

  const totalPages = Math.ceil(filteredProperties.length / ITEMS_PER_PAGE);

  // Memoize stats calculations
  const stats = useMemo(() => {
    const totalUnits = properties.reduce((sum, p) => sum + p.units, 0);
    const occupiedUnits = properties.reduce((sum, p) => sum + p.occupied, 0);
    const totalRevenue = properties.reduce((sum, p) => sum + Number(p.monthly_revenue), 0);

    return [
      {
        label: "إجمالي العقارات",
        value: properties.length.toString(),
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
        label: "الإيرادات الشهرية",
        value: `${totalRevenue.toLocaleString()} ر.س`,
        icon: DollarSign,
        color: "text-accent",
      },
    ];
  }, [properties]);

  const handleAddProperty = useCallback(() => {
    setSelectedProperty(null);
    setDialogOpen(true);
  }, []);

  const handleEditProperty = useCallback((property: any) => {
    setSelectedProperty(property);
    setDialogOpen(true);
  }, []);

  const handleSaveProperty = async (data: any) => {
    try {
      if (selectedProperty) {
        await updateProperty({ id: selectedProperty.id, ...data });
      } else {
        await addProperty(data);
      }
      setDialogOpen(false);
    } catch (error) {
      console.error("Error saving property:", error);
    }
  };

  const handleDeleteProperty = useCallback(async (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذا العقار؟")) {
      await deleteProperty(id);
    }
  }, [deleteProperty]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gradient-primary">
              إدارة العقارات
            </h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">
              إدارة الأصول العقارية والوحدات والإيجارات
            </p>
          </div>
          <Button 
            className="bg-primary hover:bg-primary-hover text-primary-foreground shadow-soft w-full md:w-auto"
            onClick={handleAddProperty}
          >
            <Plus className="ml-2 h-4 w-4 md:h-5 md:w-5" />
            <span className="text-sm md:text-base">إضافة عقار جديد</span>
          </Button>
        </div>

        {/* Search */}
        <Card className="shadow-soft">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="البحث عن عقار (الاسم، الموقع، النوع...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
            </div>
          </CardContent>
        </Card>

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
              {searchQuery 
                ? "لا توجد نتائج تطابق البحث" 
                : "لا يوجد عقارات حالياً. قم بإضافة عقار جديد."}
            </div>
          ) : (
            paginatedProperties.map((property) => {
              const propertyIcons: Record<string, string> = {
                "سكني": "🏢",
                "تجاري": "🏪",
                "زراعي": "🌾",
                "إداري": "🏛️"
              };
              
              return (
              <Card
                key={property.id}
                className="shadow-soft hover:shadow-medium transition-all duration-300 cursor-pointer group"
              >
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
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    {property.name}
                  </CardTitle>
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

                  <div className="pt-4 border-t border-border space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">الوحدات:</span>
                      <span className="font-medium">
                        {property.occupied}/{property.units}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">الإيراد الشهري:</span>
                      <span className="font-bold text-primary">
                        {Number(property.monthly_revenue).toLocaleString()} ر.س
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleEditProperty(property)}
                    >
                      <Edit className="ml-1 h-3 w-3" />
                      تعديل
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => handleDeleteProperty(property.id)}
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

        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={ITEMS_PER_PAGE}
            totalItems={filteredProperties.length}
          />
        )}

        <PropertyDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          property={selectedProperty}
          onSave={handleSaveProperty}
        />
      </div>
    </div>
  );
};

export default Properties;
