/**
 * حوار إنهاء العقد المبكر
 * @description يحسب المبالغ المستحقة تلقائياً مع إمكانية التعديل اليدوي
 */

import { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/lib/utils';
import { 
  Calculator, 
  Loader2, 
  AlertTriangle,
  Calendar,
  Banknote,
  Edit2,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { differenceInDays, differenceInMonths, parseISO, format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface Contract {
  id: string;
  contract_number: string;
  tenant_name: string;
  monthly_rent: number;
  start_date: string;
  end_date: string;
  security_deposit?: number;
  status: string;
  notes?: string;
}

interface EarlyTerminationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contract: Contract | null;
}

interface SettlementCalculation {
  totalContractValue: number;
  usedPeriodMonths: number;
  usedPeriodDays: number;
  amountForUsedPeriod: number;
  remainingAmount: number;
  securityDeposit: number;
  penalty: number;
  finalSettlement: number;
  isRefund: boolean;
}

export function EarlyTerminationDialog({
  open,
  onOpenChange,
  contract,
}: EarlyTerminationDialogProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [terminationDate, setTerminationDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [manualMode, setManualMode] = useState(false);
  const [manualAmount, setManualAmount] = useState('');
  const [penalty, setPenalty] = useState('0');
  const [notes, setNotes] = useState('');
  const [returnDeposit, setReturnDeposit] = useState(true);

  // حساب التسوية تلقائياً
  const calculation = useMemo<SettlementCalculation | null>(() => {
    if (!contract) return null;

    const startDate = parseISO(contract.start_date);
    const endDate = parseISO(contract.end_date);
    const termDate = parseISO(terminationDate);

    // حساب المدة الكلية بالأشهر
    const totalMonths = differenceInMonths(endDate, startDate);
    const totalContractValue = contract.monthly_rent * totalMonths;

    // حساب المدة المستخدمة
    const usedMonths = differenceInMonths(termDate, startDate);
    const usedDays = differenceInDays(termDate, startDate) % 30;
    
    // حساب المبلغ للفترة المستخدمة
    const dailyRate = contract.monthly_rent / 30;
    const amountForUsedPeriod = (usedMonths * contract.monthly_rent) + (usedDays * dailyRate);
    
    // المبلغ المتبقي
    const remainingAmount = totalContractValue - amountForUsedPeriod;
    
    // الغرامة
    const penaltyAmount = parseFloat(penalty) || 0;
    
    // التأمين
    const securityDeposit = returnDeposit ? (contract.security_deposit || 0) : 0;
    
    // التسوية النهائية
    // إذا كان المتبقي أكبر من الصفر = المستأجر له مبلغ (استرداد)
    // إذا كان المتبقي سالب = المستأجر عليه مبلغ
    const finalSettlement = remainingAmount + securityDeposit - penaltyAmount;

    return {
      totalContractValue,
      usedPeriodMonths: usedMonths,
      usedPeriodDays: usedDays,
      amountForUsedPeriod: Math.round(amountForUsedPeriod * 100) / 100,
      remainingAmount: Math.round(remainingAmount * 100) / 100,
      securityDeposit,
      penalty: penaltyAmount,
      finalSettlement: Math.round(finalSettlement * 100) / 100,
      isRefund: finalSettlement > 0,
    };
  }, [contract, terminationDate, penalty, returnDeposit]);

  // إعادة تعيين النموذج عند الفتح
  useEffect(() => {
    if (open) {
      setTerminationDate(new Date().toISOString().split('T')[0]);
      setManualMode(false);
      setManualAmount('');
      setPenalty('0');
      setNotes('');
      setReturnDeposit(true);
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!contract || !calculation) return;

    setIsSubmitting(true);
    try {
      const finalAmount = manualMode 
        ? parseFloat(manualAmount) 
        : calculation.finalSettlement;

      // 1. تحديث حالة العقد
      const { error: contractError } = await supabase
        .from('contracts')
        .update({ 
          status: 'منتهي',
          notes: `${contract.notes || ''}\n\n--- إنهاء مبكر ---\nتاريخ الإنهاء: ${terminationDate}\nالتسوية: ${formatCurrency(Math.abs(finalAmount))} ${finalAmount > 0 ? '(استرداد للمستأجر)' : '(مستحق على المستأجر)'}\n${notes ? 'ملاحظات: ' + notes : ''}`
        })
        .eq('id', contract.id);

      if (contractError) throw contractError;

      // 2. تسجيل قيد في tenant_ledger
      // أولاً نجد tenant_id من العقد
      const { data: contractData } = await supabase
        .from('contracts')
        .select('tenant_id')
        .eq('id', contract.id)
        .maybeSingle();

      if (contractData?.tenant_id && finalAmount !== 0) {
        await supabase.from('tenant_ledger').insert({
          tenant_id: contractData.tenant_id,
          contract_id: contract.id,
          transaction_type: finalAmount > 0 ? 'refund' : 'charge',
          transaction_date: terminationDate,
          credit_amount: finalAmount > 0 ? Math.abs(finalAmount) : 0,
          debit_amount: finalAmount < 0 ? Math.abs(finalAmount) : 0,
          description: `تسوية إنهاء مبكر للعقد ${contract.contract_number}`,
          reference_type: 'early_termination',
          reference_id: contract.id,
        });
      }

      // 3. تحرير الوحدات
      await supabase
        .from('property_units')
        .update({
          current_contract_id: null,
          current_tenant_id: null,
          occupancy_status: 'شاغر',
          updated_at: new Date().toISOString()
        })
        .eq('current_contract_id', contract.id);

      toast.success('تم إنهاء العقد بنجاح وتسجيل التسوية');
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      queryClient.invalidateQueries({ queryKey: ['tenant-ledger'] });
      onOpenChange(false);
    } catch (error) {
      console.error('Error terminating contract:', error);
      toast.error('حدث خطأ أثناء إنهاء العقد');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!contract) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            إنهاء العقد مبكراً
          </DialogTitle>
          <DialogDescription>
            سيتم حساب التسوية المالية تلقائياً بناءً على الفترة المستخدمة
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* معلومات العقد */}
          <Card className="bg-muted/50">
            <CardContent className="py-3 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">رقم العقد</span>
                <span className="font-mono font-medium">{contract.contract_number}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">المستأجر</span>
                <span className="font-medium">{contract.tenant_name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">الإيجار الشهري</span>
                <span className="font-medium">{formatCurrency(contract.monthly_rent)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">فترة العقد</span>
                <span>
                  {format(parseISO(contract.start_date), 'dd/MM/yyyy', { locale: ar })}
                  {' → '}
                  {format(parseISO(contract.end_date), 'dd/MM/yyyy', { locale: ar })}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* تاريخ الإنهاء */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              تاريخ الإنهاء
            </Label>
            <Input
              type="date"
              value={terminationDate}
              onChange={(e) => setTerminationDate(e.target.value)}
              min={contract.start_date}
              max={contract.end_date}
            />
          </div>

          <Separator />

          {/* الحسابات */}
          {calculation && (
            <Card>
              <CardContent className="py-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium flex items-center gap-2">
                    <Calculator className="h-4 w-4" />
                    حساب التسوية
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setManualMode(!manualMode)}
                  >
                    <Edit2 className="h-4 w-4 ms-1" />
                    {manualMode ? 'حساب تلقائي' : 'تعديل يدوي'}
                  </Button>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">الفترة المستخدمة</span>
                    <span>
                      {calculation.usedPeriodMonths} شهر 
                      {calculation.usedPeriodDays > 0 && ` و ${calculation.usedPeriodDays} يوم`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">المبلغ للفترة المستخدمة</span>
                    <span>{formatCurrency(calculation.amountForUsedPeriod)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">المبلغ المتبقي</span>
                    <span className="text-success">{formatCurrency(calculation.remainingAmount)}</span>
                  </div>
                  
                  {contract.security_deposit && contract.security_deposit > 0 && (
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">التأمين</span>
                        <Switch
                          checked={returnDeposit}
                          onCheckedChange={setReturnDeposit}
                        />
                      </div>
                      <span className={returnDeposit ? 'text-success' : 'text-muted-foreground line-through'}>
                        {formatCurrency(contract.security_deposit)}
                      </span>
                    </div>
                  )}

                  {/* الغرامة */}
                  <div className="flex justify-between items-center">
                    <Label htmlFor="penalty" className="text-muted-foreground">غرامة (اختياري)</Label>
                    <Input
                      id="penalty"
                      type="number"
                      value={penalty}
                      onChange={(e) => setPenalty(e.target.value)}
                      className="w-32 text-left"
                      placeholder="0"
                    />
                  </div>

                  <Separator className="my-2" />

                  {/* التسوية النهائية */}
                  {manualMode ? (
                    <div className="space-y-2">
                      <Label>المبلغ النهائي (يدوي)</Label>
                      <Input
                        type="number"
                        value={manualAmount}
                        onChange={(e) => setManualAmount(e.target.value)}
                        placeholder="أدخل المبلغ"
                      />
                      <p className="text-xs text-muted-foreground">
                        قيمة موجبة = استرداد للمستأجر | قيمة سالبة = مستحق على المستأجر
                      </p>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center text-base font-bold">
                      <span>التسوية النهائية</span>
                      <div className="flex items-center gap-2">
                        <Badge variant={calculation.isRefund ? 'default' : 'destructive'}>
                          {calculation.isRefund ? 'استرداد للمستأجر' : 'مستحق على المستأجر'}
                        </Badge>
                        <span className={calculation.isRefund ? 'text-success' : 'text-destructive'}>
                          {formatCurrency(Math.abs(calculation.finalSettlement))}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* ملاحظات */}
          <div className="space-y-2">
            <Label htmlFor="notes">ملاحظات (اختياري)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="سبب الإنهاء المبكر أو أي ملاحظات..."
              rows={2}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleSubmit} 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin ms-2" />
                جاري الإنهاء...
              </>
            ) : (
              <>
                <AlertTriangle className="h-4 w-4 ms-2" />
                إنهاء العقد وتسجيل التسوية
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
