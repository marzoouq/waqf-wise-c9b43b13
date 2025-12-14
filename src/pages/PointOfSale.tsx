import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Briefcase, DollarSign, ArrowUpCircle, Receipt } from 'lucide-react';
import { ErrorState } from '@/components/shared/ErrorState';
import {
  useCashierShift,
  usePOSTransactions,
  usePendingRentals,
  useQuickCollection,
  useQuickPayment,
  usePOSRealtime,
} from '@/hooks/pos';
import { PendingRental } from '@/hooks/pos/usePendingRentals';
import {
  ShiftStatusBar,
  OpenShiftDialog,
  CloseShiftDialog,
  QuickCollectionDialog,
  QuickPaymentDialog,
  PendingRentalsTable,
  TransactionsTable,
  POSStatsCards,
} from '@/components/pos';

export default function PointOfSale() {
  // Realtime subscriptions
  usePOSRealtime();

  // State
  const [showOpenShift, setShowOpenShift] = useState(false);
  const [showCloseShift, setShowCloseShift] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedRental, setSelectedRental] = useState<PendingRental | null>(null);

  // Hooks
  const {
    currentShift,
    isLoadingShift,
    hasOpenShift,
    openShift,
    closeShift,
    isOpeningShift,
    isClosingShift,
  } = useCashierShift();

  const { transactions, stats } = usePOSTransactions(currentShift?.id);
  const { pendingRentals, isLoading: isLoadingRentals, stats: pendingStats } = usePendingRentals();
  const { collect, isCollecting } = useQuickCollection();
  const { pay, isPaying } = useQuickPayment();

  // Handlers
  const handleOpenShift = (data: { notes?: string }) => {
    openShift(data);
    setShowOpenShift(false);
  };

  const handleCloseShift = (data: { shiftId: string; notes?: string }) => {
    closeShift(data);
    setShowCloseShift(false);
  };

  const handleCollect = async (data: { amount: number; paymentMethod: 'نقدي' | 'شبكة' | 'تحويل' | 'شيك'; referenceNumber?: string }) => {
    if (!selectedRental || !currentShift) return;

    await collect({
      shiftId: currentShift.id,
      rentalPaymentId: selectedRental.id,
      contractId: selectedRental.contract_id,
      amount: data.amount,
      paymentMethod: data.paymentMethod,
      payerName: selectedRental.tenant_name,
      referenceNumber: data.referenceNumber,
      description: `تحصيل إيجار - ${selectedRental.property_name}`,
    });
    setSelectedRental(null);
  };

  const handlePayment = async (data: {
    amount: number;
    paymentMethod: 'نقدي' | 'شبكة' | 'تحويل' | 'شيك';
    expenseCategory: string;
    payeeName: string;
    description: string;
    referenceNumber?: string;
  }) => {
    if (!currentShift) return;

    await pay({
      shiftId: currentShift.id,
      ...data,
    });
    setShowPayment(false);
  };

  if (isLoadingShift) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">جاري التحميل...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Briefcase className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">مركز التحصيل والصرف</h1>
            <p className="text-sm text-muted-foreground">إدارة عمليات التحصيل والصرف العقاري</p>
          </div>
        </div>

        {hasOpenShift && (
          <Button variant="destructive" onClick={() => setShowPayment(true)}>
            <ArrowUpCircle className="h-4 w-4 ml-2" />
            صرف مبلغ
          </Button>
        )}
      </div>

      {/* Shift Status Bar */}
      <ShiftStatusBar
        shift={currentShift}
        onOpenShift={() => setShowOpenShift(true)}
        onCloseShift={() => setShowCloseShift(true)}
        isOpeningShift={isOpeningShift}
      />

      {/* Main Content */}
      {hasOpenShift && (
        <>
          {/* Stats Cards */}
          <POSStatsCards stats={stats} pendingStats={pendingStats} />

          {/* Tabs */}
          <Tabs defaultValue="pending" className="space-y-4">
            <TabsList>
              <TabsTrigger value="pending" className="gap-2">
                <DollarSign className="h-4 w-4" />
                الإيجارات المستحقة
              </TabsTrigger>
              <TabsTrigger value="transactions" className="gap-2">
                <Receipt className="h-4 w-4" />
                عمليات الجلسة
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending">
              <PendingRentalsTable
                rentals={pendingRentals}
                isLoading={isLoadingRentals}
                onCollect={(rental) => setSelectedRental(rental)}
                disabled={!hasOpenShift}
              />
            </TabsContent>

            <TabsContent value="transactions">
              <TransactionsTable transactions={transactions} />
            </TabsContent>
          </Tabs>
        </>
      )}

      {/* Dialogs */}
      <OpenShiftDialog
        open={showOpenShift}
        onOpenChange={setShowOpenShift}
        onConfirm={handleOpenShift}
        isLoading={isOpeningShift}
      />

      <CloseShiftDialog
        open={showCloseShift}
        onOpenChange={setShowCloseShift}
        shift={currentShift}
        onConfirm={handleCloseShift}
        isLoading={isClosingShift}
      />

      <QuickCollectionDialog
        open={!!selectedRental}
        onOpenChange={(open) => !open && setSelectedRental(null)}
        rental={selectedRental}
        onConfirm={handleCollect}
        isLoading={isCollecting}
      />

      <QuickPaymentDialog
        open={showPayment}
        onOpenChange={setShowPayment}
        onConfirm={handlePayment}
        isLoading={isPaying}
      />
    </div>
  );
}
