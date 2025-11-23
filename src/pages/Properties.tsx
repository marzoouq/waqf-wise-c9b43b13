import { useState, useCallback } from "react";
import { PropertyDialog } from "@/components/properties/PropertyDialog";
import { ContractDialog } from "@/components/properties/ContractDialog";
import { RentalPaymentDialog } from "@/components/properties/RentalPaymentDialog";
import { MaintenanceRequestDialog } from "@/components/properties/MaintenanceRequestDialog";
import { PropertiesHeader } from "@/components/properties/PropertiesHeader";
import { PropertiesTabs } from "@/components/properties/PropertiesTabs";
import { useProperties, type Property } from "@/hooks/useProperties";
import { usePropertiesDialogs } from "@/hooks/usePropertiesDialogs";
import { logger } from "@/lib/logger";
import { PageErrorBoundary } from "@/components/shared/PageErrorBoundary";

const Properties = () => {
  const { addProperty, updateProperty, properties } = useProperties();
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