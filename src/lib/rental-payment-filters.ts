/**
 * Rental Payment Filters - فلاتر دفعات الإيجار
 * @version 2.8.30
 */

import type { RentalPayment } from "@/services/rental-payment.service";

/**
 * تصفية الدفعات ذات الصلة: المدفوعة، تحت التحصيل، والمتأخرة
 */
export const filterRelevantPayments = (payments: RentalPayment[]): RentalPayment[] => {
  const today = new Date();

  return payments.filter((payment) => {
    const dueDate = new Date(payment.due_date);
    
    // Always show paid payments
    if (payment.status === 'مدفوع' || payment.payment_date) {
      return true;
    }

    // Always show under collection payments
    if (payment.status === 'تحت التحصيل') {
      return true;
    }

    // Show overdue payments
    if (dueDate < today && payment.status !== 'مدفوع' && !payment.payment_date) {
      return true;
    }

    // Hide all other pending payments
    return false;
  });
};

/**
 * تصفية الدفعة القادمة لكل عقد
 */
export const filterNextPaymentPerContract = (payments: RentalPayment[]): RentalPayment[] => {
  const now = new Date();
  
  // Group payments by contract
  const paymentsByContract = payments.reduce((acc, payment) => {
    const contractId = payment.contract_id;
    if (!acc[contractId]) {
      acc[contractId] = [];
    }
    acc[contractId].push(payment);
    return acc;
  }, {} as Record<string, RentalPayment[]>);

  // For each contract, keep paid, overdue, and only the next upcoming payment
  const result: RentalPayment[] = [];
  
  Object.values(paymentsByContract).forEach((contractPayments) => {
    // Sort by due date
    const sorted = [...contractPayments].sort(
      (a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
    );

    // Add paid payments
    const paid = sorted.filter(p => p.payment_date);
    result.push(...paid);

    // Add overdue payments
    const overdue = sorted.filter(p => !p.payment_date && new Date(p.due_date) < now);
    result.push(...overdue);

    // Find and add only the next upcoming payment
    const upcoming = sorted.filter(p => !p.payment_date && new Date(p.due_date) >= now);
    if (upcoming.length > 0) {
      result.push(upcoming[0]); // Only the closest upcoming payment
    }
  });

  return result;
};
