import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Building, FileText, DollarSign, Wrench } from "lucide-react";
import { PropertiesTab } from "@/components/properties/tabs/PropertiesTab";
import { ContractsTab } from "@/components/properties/tabs/ContractsTab";
import { PaymentsTab } from "@/components/properties/tabs/PaymentsTab";
import { MaintenanceTab } from "@/components/properties/tabs/MaintenanceTab";
import { PropertyUnitsManagement } from "@/components/properties/PropertyUnitsManagement";
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
  return (
    <Card className="shadow-soft">
      <CardContent className="pt-6">
        <Tabs value={activeTab} onValueChange={onTabChange}>
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="properties" className="gap-2">
              <Building className="h-4 w-4" />
              <span className="hidden md:inline">العقارات</span>
            </TabsTrigger>
            <TabsTrigger value="units" className="gap-2">
              <Building className="h-4 w-4" />
              <span className="hidden md:inline">الوحدات</span>
            </TabsTrigger>
            <TabsTrigger value="contracts" className="gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden md:inline">العقود</span>
            </TabsTrigger>
            <TabsTrigger value="payments" className="gap-2">
              <DollarSign className="h-4 w-4" />
              <span className="hidden md:inline">الدفعات</span>
            </TabsTrigger>
            <TabsTrigger value="maintenance" className="gap-2">
              <Wrench className="h-4 w-4" />
              <span className="hidden md:inline">الصيانة</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="properties">
            <PropertiesTab onEdit={onEditProperty} />
          </TabsContent>

          <TabsContent value="units">
            <PropertyUnitsManagement />
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
