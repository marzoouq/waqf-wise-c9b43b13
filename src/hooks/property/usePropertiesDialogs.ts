import { useState, useCallback } from "react";
import { type Property } from "@/hooks/property/useProperties";
import { type Contract } from "@/hooks/property/useContracts";
import { type RentalPayment } from "@/hooks/useRentalPayments";
import { type MaintenanceRequest } from "@/hooks/property/useMaintenanceRequests";

export const usePropertiesDialogs = () => {
  const [propertyDialogOpen, setPropertyDialogOpen] = useState(false);
  const [contractDialogOpen, setContractDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [maintenanceDialogOpen, setMaintenanceDialogOpen] = useState(false);
  
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<RentalPayment | null>(null);
  const [selectedMaintenance, setSelectedMaintenance] = useState<MaintenanceRequest | null>(null);

  const openPropertyDialog = useCallback(() => {
    setSelectedProperty(null);
    setPropertyDialogOpen(true);
  }, []);

  const openContractDialog = useCallback(() => {
    setSelectedContract(null);
    setContractDialogOpen(true);
  }, []);

  const openPaymentDialog = useCallback(() => {
    setSelectedPayment(null);
    setPaymentDialogOpen(true);
  }, []);

  const openMaintenanceDialog = useCallback(() => {
    setSelectedMaintenance(null);
    setMaintenanceDialogOpen(true);
  }, []);

  const editProperty = useCallback((property: Property) => {
    setSelectedProperty(property);
    setPropertyDialogOpen(true);
  }, []);

  const editContract = useCallback((contract: Contract) => {
    setSelectedContract(contract);
    setContractDialogOpen(true);
  }, []);

  const editPayment = useCallback((payment: RentalPayment) => {
    setSelectedPayment(payment);
    setPaymentDialogOpen(true);
  }, []);

  const editMaintenance = useCallback((maintenance: MaintenanceRequest) => {
    setSelectedMaintenance(maintenance);
    setMaintenanceDialogOpen(true);
  }, []);

  return {
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
  };
};
