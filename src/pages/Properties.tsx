import { useState, useCallback } from "react";
import { PropertyDialog } from "@/components/properties/PropertyDialog";
import { ContractDialog } from "@/components/properties/ContractDialog";
import { RentalPaymentDialog } from "@/components/properties/RentalPaymentDialog";
import { MaintenanceRequestDialog } from "@/components/properties/MaintenanceRequestDialog";
import { PropertiesHeader } from "@/components/properties/PropertiesHeader";
import { PropertiesTabs } from "@/components/properties/PropertiesTabs";
import { useProperties, type Property } from "@/hooks/useProperties";
import { usePropertiesDialogs } from "@/hooks/usePropertiesDialogs";
import { usePropertiesStats } from "@/hooks/usePropertiesStats";
import { logger } from "@/lib/logger";
import { PageErrorBoundary } from "@/components/shared/PageErrorBoundary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, TrendingUp, Wrench, AlertCircle } from "lucide-react";

const Properties = () => {
  const { addProperty, updateProperty, properties } = useProperties();
  const { data: stats, isLoading: statsLoading } = usePropertiesStats();
  const [activeTab, setActiveTab] = useState("properties");
  
  const {
    propertyDialogOpen,
    setPropertyDialogOpen,
    contractDialogOpen,
    setContractDialogOpen,
    paymentDialogOpen,
    setPaymentDialogOpen,
    maintenanceDialogOpen,
    setMaintenanceDialogOpen,
    selectedProperty,
    setSelectedProperty,
    selectedContract,
    selectedPayment,
    selectedMaintenance,
    openPropertyDialog,
    openContractDialog,
    openPaymentDialog,
    openMaintenanceDialog,
    editProperty,
    editContract,
    editPayment,
    editMaintenance,
  } = usePropertiesDialogs();

  const handlePropertySave = useCallback(async (data: Partial<Property>) => {
    try {
      if (selectedProperty) {
        await updateProperty({ id: selectedProperty.id, ...data });
      } else {
        await addProperty(data as Property);
      }
      setPropertyDialogOpen(false);
      setSelectedProperty(null);
    } catch (error) {
      logger.error(error, { context: 'save_property', severity: 'medium' });
    }
  }, [selectedProperty, updateProperty, addProperty, setPropertyDialogOpen, setSelectedProperty]);

  const handleAddClick = useCallback((type: 'property' | 'contract' | 'payment' | 'maintenance') => {
    const handlers = {
      property: openPropertyDialog,
      contract: openContractDialog,
      payment: openPaymentDialog,
      maintenance: openMaintenanceDialog,
    };
    handlers[type]();
  }, [openPropertyDialog, openContractDialog, openPaymentDialog, openMaintenanceDialog]);

  return (
    <PageErrorBoundary pageName="العقارات">
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6 md:p-8 lg:p-10 space-y-6 md:space-y-8">
        <PropertiesHeader
          activeTab={activeTab}
          properties={properties}
          onAddClick={handleAddClick}
        />

        {/* Statistics Cards */}
        {!statsLoading && stats && (
          <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-6">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  إجمالي العقارات
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 pt-0">
                <div className="text-xl sm:text-2xl font-bold">{stats.totalProperties}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.occupiedProperties} مؤجر، {stats.vacantProperties} شاغر
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-6">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  الإيرادات الشهرية
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 pt-0">
                <div className="text-xl sm:text-2xl font-bold text-success">
                  {stats.totalMonthlyRevenue.toLocaleString('ar-SA')} ريال
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.totalAnnualRevenue.toLocaleString('ar-SA')} ريال سنوياً
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-6">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Wrench className="h-4 w-4" />
                  طلبات الصيانة
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 pt-0">
                <div className="text-xl sm:text-2xl font-bold text-warning">
                  {stats.maintenanceRequests}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  قيد التنفيذ أو المعلقة
                </p>
              </CardContent>
            </Card>

            <Card className={stats.expiringContracts > 0 ? "border-destructive" : ""}>
              <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-6">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  عقود منتهية قريباً
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 pt-0">
                <div className={`text-xl sm:text-2xl font-bold ${stats.expiringContracts > 0 ? 'text-destructive' : ''}`}>
                  {stats.expiringContracts}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  خلال 30 يوم القادمة
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        <PropertiesTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onEditProperty={editProperty}
          onEditContract={editContract}
          onEditPayment={editPayment}
          onEditMaintenance={editMaintenance}
        />

        <PropertyDialog
          open={propertyDialogOpen}
          onOpenChange={setPropertyDialogOpen}
          property={selectedProperty}
          onSave={handlePropertySave}
        />

        <ContractDialog
          open={contractDialogOpen}
          onOpenChange={setContractDialogOpen}
          contract={selectedContract}
        />

        <RentalPaymentDialog
          open={paymentDialogOpen}
          onOpenChange={setPaymentDialogOpen}
          payment={selectedPayment}
        />

        <MaintenanceRequestDialog
          open={maintenanceDialogOpen}
          onOpenChange={setMaintenanceDialogOpen}
          request={selectedMaintenance}
        />
        </div>
      </div>
    </PageErrorBoundary>
  );
};

export default Properties;