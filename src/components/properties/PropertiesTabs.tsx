import { useState, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Building, FileText, DollarSign, Wrench } from "lucide-react";
import { PropertiesTab } from "@/components/properties/tabs/PropertiesTab";
import { ContractsTab } from "@/components/properties/tabs/ContractsTab";
import { PaymentsTab } from "@/components/properties/tabs/PaymentsTab";
import { MaintenanceTab } from "@/components/properties/tabs/MaintenanceTab";
import { PropertyUnitsManagement } from "@/components/properties/PropertyUnitsManagement";
import { PropertySelector } from "@/components/properties/PropertySelector";
import { type Property } from "@/hooks/useProperties";
import { type Contract } from "@/hooks/useContracts";
import { type RentalPayment } from "@/hooks/useRentalPayments";
import { type MaintenanceRequest } from "@/hooks/useMaintenanceRequests";
import { memo } from "react";

interface PropertiesTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  onEditProperty: (property: Property) => void;
  onEditContract: (contract: Contract) => void;
  onEditPayment: (payment: RentalPayment) => void;
  onEditMaintenance: (maintenance: MaintenanceRequest) => void;
}

export const PropertiesTabs = memo(({
  activeTab,
  onTabChange,
  onEditProperty,
  onEditContract,
  onEditPayment,
  onEditMaintenance,
}: PropertiesTabsProps) => {
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("");

  const handlePropertySelect = useCallback((property: Property) => {
    setSelectedPropertyId(property.id);
    onTabChange("units");
  }, [onTabChange]);

  const handleTabChange = useCallback((value: string) => {
    // إذا انتقل من الوحدات لتبويب آخر، مسح الاختيار
    if (value !== "units") {
      setSelectedPropertyId("");
    }
    onTabChange(value);
  }, [onTabChange]);

  return (
    <Card className="shadow-soft">
      <CardContent className="pt-6">
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 pb-2">
            <TabsList className="inline-flex w-max sm:w-full sm:grid sm:grid-cols-5 mb-6 h-auto">
              <TabsTrigger value="properties" className="gap-2 text-xs sm:text-sm px-3 py-2">
                <Building className="h-4 w-4" />
                <span className="hidden sm:inline">العقارات</span>
              </TabsTrigger>
              <TabsTrigger value="units" className="gap-2 text-xs sm:text-sm px-3 py-2">
                <Building className="h-4 w-4" />
                <span className="hidden sm:inline">الوحدات</span>
              </TabsTrigger>
              <TabsTrigger value="contracts" className="gap-2 text-xs sm:text-sm px-3 py-2">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">العقود</span>
              </TabsTrigger>
              <TabsTrigger value="payments" className="gap-2 text-xs sm:text-sm px-3 py-2">
                <DollarSign className="h-4 w-4" />
                <span className="hidden sm:inline">الدفعات</span>
              </TabsTrigger>
              <TabsTrigger value="maintenance" className="gap-2 text-xs sm:text-sm px-3 py-2">
                <Wrench className="h-4 w-4" />
                <span className="hidden sm:inline">الصيانة</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="properties">
            <PropertiesTab 
              onEdit={onEditProperty} 
              onSelectProperty={handlePropertySelect}
            />
          </TabsContent>

          <TabsContent value="units">
            <div className="space-y-4">
              <PropertySelector
                selectedPropertyId={selectedPropertyId}
                onSelect={setSelectedPropertyId}
              />
              <PropertyUnitsManagement propertyId={selectedPropertyId} />
            </div>
          </TabsContent>

          <TabsContent value="contracts">
            <ContractsTab onEdit={onEditContract} />
          </TabsContent>

          <TabsContent value="payments">
            <PaymentsTab onEdit={onEditPayment} />
          </TabsContent>

          <TabsContent value="maintenance">
            <MaintenanceTab onEdit={onEditMaintenance} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
});

PropertiesTabs.displayName = 'PropertiesTabs';
