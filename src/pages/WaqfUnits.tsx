import { useState } from "react";
import { Plus, Search, Building2, DollarSign, TrendingUp, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useWaqfUnits, type WaqfUnit } from "@/hooks/useWaqfUnits";
import { LoadingState } from "@/components/shared/LoadingState";
import { EmptyState } from "@/components/shared/EmptyState";
import { WaqfUnitDialog } from "@/components/waqf/WaqfUnitDialog";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export default function WaqfUnits() {
  const { waqfUnits, isLoading } = useWaqfUnits();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedUnit, setSelectedUnit] = useState<WaqfUnit | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Filter waqf units
  const filteredUnits = waqfUnits.filter((unit) => {
    const matchesSearch =
      unit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      unit.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      unit.location?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = typeFilter === "all" || unit.waqf_type === typeFilter;

    return matchesSearch && matchesType;
  });

  // Calculate statistics
  const stats = {
    total: waqfUnits.length,
    active: waqfUnits.filter((u) => u.is_active).length,
    totalValue: waqfUnits.reduce((sum, u) => sum + (u.current_value || 0), 0),
    totalReturn: waqfUnits.reduce((sum, u) => sum + (u.annual_return || 0), 0),
  };

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      "عقار": { label: "عقار", variant: "default" as const, icon: Building2 },
      "نقدي": { label: "نقدي", variant: "outline" as const, icon: DollarSign },
      "أسهم": { label: "أسهم", variant: "secondary" as const, icon: TrendingUp },
      "مشروع": { label: "مشروع", variant: "default" as const, icon: AlertCircle },
    };

    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig["عقار"];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">أقلام الوقف</h1>
          <p className="text-muted-foreground mt-2">
            إدارة ومتابعة أقلام الوقف وأصوله
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          إضافة قلم وقف
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">إجمالي الأقلام</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <AlertCircle className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">أقلام نشطة</p>
              <p className="text-2xl font-bold">{stats.active}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <DollarSign className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">القيمة الإجمالية</p>
              <p className="text-xl font-bold">
                {stats.totalValue.toLocaleString('ar-SA')} ريال
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <TrendingUp className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">العائد السنوي</p>
              <p className="text-xl font-bold">
                {stats.totalReturn.toLocaleString('ar-SA')} ريال
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="بحث بالاسم، الكود، أو الموقع..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="نوع الوقف" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الأنواع</SelectItem>
              <SelectItem value="عقار">عقار</SelectItem>
              <SelectItem value="نقدي">نقدي</SelectItem>
              <SelectItem value="أسهم">أسهم</SelectItem>
              <SelectItem value="مشروع">مشروع</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Waqf Units Table */}
      {filteredUnits.length === 0 ? (
        <EmptyState
          title="لا توجد أقلام وقف"
          description="ابدأ بإضافة قلم وقف جديد"
          icon={Building2}
        />
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">الكود</TableHead>
                <TableHead className="text-right">الاسم</TableHead>
                <TableHead className="text-right">النوع</TableHead>
                <TableHead className="text-right">الموقع</TableHead>
                <TableHead className="text-right">قيمة الاستحواذ</TableHead>
                <TableHead className="text-right">القيمة الحالية</TableHead>
                <TableHead className="text-right">العائد السنوي</TableHead>
                <TableHead className="text-right">تاريخ الاستحواذ</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUnits.map((unit) => (
                <TableRow key={unit.id}>
                  <TableCell className="font-medium">{unit.code}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{unit.name}</p>
                      {unit.description && (
                        <p className="text-sm text-muted-foreground">
                          {unit.description}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getTypeBadge(unit.waqf_type)}</TableCell>
                  <TableCell>{unit.location || "-"}</TableCell>
                  <TableCell className="font-semibold">
                    {unit.acquisition_value?.toLocaleString('ar-SA') || 0} ريال
                  </TableCell>
                  <TableCell className="font-semibold text-blue-600">
                    {unit.current_value?.toLocaleString('ar-SA') || 0} ريال
                  </TableCell>
                  <TableCell className="font-semibold text-green-600">
                    {unit.annual_return?.toLocaleString('ar-SA') || 0} ريال
                  </TableCell>
                  <TableCell>
                    {unit.acquisition_date
                      ? format(new Date(unit.acquisition_date), "dd/MM/yyyy", {
                          locale: ar,
                        })
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={unit.is_active ? "outline" : "secondary"}>
                      {unit.is_active ? "نشط" : "غير نشط"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedUnit(unit);
                        setIsDialogOpen(true);
                      }}
                    >
                      تعديل
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Dialog */}
      <WaqfUnitDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setSelectedUnit(null);
        }}
        waqfUnit={selectedUnit}
      />
    </div>
  );
}
