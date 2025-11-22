import { useState } from "react";
import { Plus, Building, FileText, DollarSign, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { PropertyDialog } from "@/components/properties/PropertyDialog";
import { ContractDialog } from "@/components/properties/ContractDialog";
import { RentalPaymentDialog } from "@/components/properties/RentalPaymentDialog";
import { MaintenanceRequestDialog } from "@/components/properties/MaintenanceRequestDialog";
import { PropertyUnitsManagement } from "@/components/properties/PropertyUnitsManagement";
import { PropertiesTab } from "@/components/properties/tabs/PropertiesTab";
import { ContractsTab } from "@/components/properties/tabs/ContractsTab";
import { PaymentsTab } from "@/components/properties/tabs/PaymentsTab";
import { MaintenanceTab } from "@/components/properties/tabs/MaintenanceTab";
import { useProperties, type Property } from "@/hooks/useProperties";
import { type Contract } from "@/hooks/useContracts";
import { type RentalPayment } from "@/hooks/useRentalPayments";
import { type MaintenanceRequest } from "@/hooks/useMaintenanceRequests";
import { ScrollableTableWrapper } from "@/components/shared/ScrollableTableWrapper";
import { MobileScrollHint } from "@/components/shared/MobileScrollHint";
import { logger } from "@/lib/logger";

const Properties = () => {
  const { addProperty, updateProperty } = useProperties();
  
  const [activeTab, setActiveTab] = useState("properties");
  const [propertyDialogOpen, setPropertyDialogOpen] = useState(false);
  const [contractDialogOpen, setContractDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [maintenanceDialogOpen, setMaintenanceDialogOpen] = useState(false);
  
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<RentalPayment | null>(null);
  const [selectedMaintenance, setSelectedMaintenance] = useState<MaintenanceRequest | null>(null);

  const handlePropertySave = async (data: Omit<Property, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      if (selectedProperty) {
        await updateProperty({ id: selectedProperty.id, ...data });
      } else {
        await addProperty(data);
      }
      setPropertyDialogOpen(false);
      setSelectedProperty(null);
    } catch (error) {
      logger.error(error, { context: 'save_property', severity: 'medium' });
    }
  };

  const getAddButton = () => {
    const buttons = {
      properties: {
        label: "إضافة عقار",
        icon: Building,
        onClick: () => {
          setSelectedProperty(null);
          setPropertyDialogOpen(true);
        },
      },
      contracts: {
        label: "إضافة عقد",
        icon: FileText,
        onClick: () => {
          setSelectedContract(null);
          setContractDialogOpen(true);
        },
      },
      payments: {
        label: "إضافة دفعة",
        icon: DollarSign,
        onClick: () => {
          setSelectedPayment(null);
          setPaymentDialogOpen(true);
        },
      },
      maintenance: {
        label: "إضافة طلب صيانة",
        icon: Wrench,
        onClick: () => {
          setSelectedMaintenance(null);
          setMaintenanceDialogOpen(true);
        },
      },
    };

    const button = buttons[activeTab as keyof typeof buttons];
    
    // إذا لم يكن هناك زر لهذا التبويب (مثل تبويب الوحدات)، لا نعرض شيء
    if (!button) {
      return null;
    }
    
    const Icon = button.icon;

    return (
      <Button
        className="bg-primary hover:bg-primary-hover text-primary-foreground shadow-soft w-full md:w-auto"
        onClick={button.onClick}
      >
        <Plus className="ml-2 h-4 w-4 md:h-5 md:w-5" />
        <Icon className="ml-2 h-4 w-4 md:h-5 md:w-5" />
        <span className="text-sm md:text-base">{button.label}</span>
      </Button>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 md:p-8 lg:p-10 space-y-6 md:space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gradient-primary">
              إدارة العقارات والعقود
            </h1>
            <p className="text-muted-foreground mt-1 text-xs sm:text-sm md:text-base">
              إدارة شاملة للعقارات، العقود، الإيجارات والصيانة
            </p>
          </div>
          {getAddButton()}
        </div>

        {/* Tabs */}
        <Card className="shadow-soft">
          <CardContent className="pt-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
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
                <PropertiesTab
                  onEdit={(property) => {
                    setSelectedProperty(property);
                    setPropertyDialogOpen(true);
                  }}
                />
              </TabsContent>

              <TabsContent value="units">
                <PropertyUnitsManagement />
              </TabsContent>

              <TabsContent value="contracts">
                <ContractsTab
                  onEdit={(contract) => {
                    setSelectedContract(contract);
                    setContractDialogOpen(true);
                  }}
                />
              </TabsContent>

              <TabsContent value="payments">
                <PaymentsTab
                  onEdit={(payment) => {
                    setSelectedPayment(payment);
                    setPaymentDialogOpen(true);
                  }}
                />
              </TabsContent>

              <TabsContent value="maintenance">
                <MaintenanceTab
                  onEdit={(maintenance) => {
                    setSelectedMaintenance(maintenance);
                    setMaintenanceDialogOpen(true);
                  }}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Dialogs */}
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
  );
};

export default Properties;