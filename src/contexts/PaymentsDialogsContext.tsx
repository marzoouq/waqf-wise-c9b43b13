/**
 * PaymentsDialogsContext
 * إدارة حالة الحوارات في صفحة المدفوعات
 * @version 2.9.15
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Database } from '@/integrations/supabase/types';

type Payment = Database['public']['Tables']['payments']['Row'];

interface DialogState<T> {
  isOpen: boolean;
  data: T | null;
}

interface PaymentsDialogsContextValue {
  // Dialog States
  paymentDialog: DialogState<Payment>;
  deleteDialog: DialogState<Payment>;
  printPayment: Payment | null;
  
  // Dialog Actions
  openPaymentDialog: (payment?: Payment) => void;
  closePaymentDialog: () => void;
  openDeleteDialog: (payment: Payment) => void;
  closeDeleteDialog: () => void;
  setPrintPayment: (payment: Payment | null) => void;
  
  // Selected Payment
  selectedPayment: Payment | null;
}

const PaymentsDialogsContext = createContext<PaymentsDialogsContextValue | null>(null);

interface PaymentsDialogsProviderProps {
  children: ReactNode;
}

export function PaymentsDialogsProvider({ children }: PaymentsDialogsProviderProps) {
  // Payment Dialog State
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  
  // Delete Dialog State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<Payment | null>(null);
  
  // Print State
  const [printPayment, setPrintPayment] = useState<Payment | null>(null);

  // Payment Dialog Actions
  const openPaymentDialog = useCallback((payment?: Payment) => {
    setSelectedPayment(payment || null);
    setPaymentDialogOpen(true);
  }, []);

  const closePaymentDialog = useCallback(() => {
    setPaymentDialogOpen(false);
    // تأخير مسح البيانات للسماح بإغلاق الحوار بسلاسة
    setTimeout(() => setSelectedPayment(null), 200);
  }, []);

  // Delete Dialog Actions
  const openDeleteDialog = useCallback((payment: Payment) => {
    setPaymentToDelete(payment);
    setDeleteDialogOpen(true);
  }, []);

  const closeDeleteDialog = useCallback(() => {
    setDeleteDialogOpen(false);
    setTimeout(() => setPaymentToDelete(null), 200);
  }, []);

  const value: PaymentsDialogsContextValue = {
    paymentDialog: {
      isOpen: paymentDialogOpen,
      data: selectedPayment,
    },
    deleteDialog: {
      isOpen: deleteDialogOpen,
      data: paymentToDelete,
    },
    printPayment,
    openPaymentDialog,
    closePaymentDialog,
    openDeleteDialog,
    closeDeleteDialog,
    setPrintPayment,
    selectedPayment,
  };

  return (
    <PaymentsDialogsContext.Provider value={value}>
      {children}
    </PaymentsDialogsContext.Provider>
  );
}

export function usePaymentsDialogsContext(): PaymentsDialogsContextValue {
  const context = useContext(PaymentsDialogsContext);
  if (!context) {
    throw new Error('usePaymentsDialogsContext must be used within PaymentsDialogsProvider');
  }
  return context;
}
