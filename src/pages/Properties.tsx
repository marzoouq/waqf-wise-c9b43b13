import { useState } from "react";
import { Plus, Search, MapPin, DollarSign, Home, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Properties = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const properties = [
    {
      id: 1,
      name: "مبنى سكني - حي الملك فهد",
      type: "سكني",
      location: "الرياض، حي الملك فهد",
      units: 12,
      occupied: 10,
      monthlyRevenue: "120,000 ر.س",
      status: "مؤجر",
      image: "🏢",
    },
    {
      id: 2,
      name: "محل تجاري - طريق الملك عبدالله",
      type: "تجاري",
      location: "جدة، طريق الملك عبدالله",
      units: 1,
      occupied: 1,
      monthlyRevenue: "50,000 ر.س",
      status: "مؤجر",
      image: "🏪",
    },
    {
      id: 3,
      name: "مزرعة - منطقة الخرج",
      type: "زراعي",
      location: "الخرج",
      units: 1,
      occupied: 0,
      monthlyRevenue: "0 ر.س",
      status: "شاغر",
      image: "🌾",
    },
    {
      id: 4,
      name: "مبنى إداري - حي النخيل",
      type: "إداري",
      location: "الدمام، حي النخيل",
      units: 8,
      occupied: 6,
      monthlyRevenue: "80,000 ر.س",
      status: "مؤجر جزئياً",
      image: "🏛️",
    },
  ];

  const stats = [
    {
      label: "إجمالي العقارات",
      value: "89",
      icon: Building,
      color: "text-primary",
    },
    {
      label: "الوحدات المؤجرة",
      value: "156",
      icon: Home,
      color: "text-success",
    },
    {
      label: "الوحدات الشاغرة",
      value: "23",
      icon: MapPin,
      color: "text-warning",
    },
    {
      label: "الإيرادات الشهرية",
      value: "850,000 ر.س",
      icon: DollarSign,
      color: "text-accent",
    },
  ];

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
          <Button className="bg-primary hover:bg-primary-hover text-primary-foreground shadow-soft w-full md:w-auto">
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
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="shadow-soft">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {stat.label}
                    </CardTitle>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold ${stat.color}`}>
                    {stat.value}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <Card
              key={property.id}
              className="shadow-soft hover:shadow-medium transition-all duration-300 cursor-pointer group"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="text-5xl mb-4">{property.image}</div>
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
                      {property.monthlyRevenue}
                    </span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                >
                  عرض التفاصيل
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Properties;
