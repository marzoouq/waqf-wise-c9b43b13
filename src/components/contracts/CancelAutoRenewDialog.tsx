/**
 * حوار إلغاء التجديد التلقائي للعقد
 */

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Loader2, 
  XCircle,
  AlertTriangle,
  Calendar,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { type Contract } from '@/hooks/property/useContracts';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface CancelAutoRenewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contract: Contract | null;
}

export function CancelAutoRenewDialog({
  open,
  onOpenChange,
  contract,
}: CancelAutoRenewDialogProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reason, setReason] = useState('');

  const handleSubmit = async () => {
    if (!contract) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('contracts')
        .update({
          auto_renew: false,
          auto_renew_enabled: false,
          auto_renew_cancelled_at: new Date().toISOString(),
          auto_renew_cancel_reason: reason || 'تم إلغاء التجديد التلقائي',
        })
        .eq('id', contract.id);

      if (error) throw error;

      toast.success('تم إلغاء التجديد التلقائي بنجاح');
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      onOpenChange(false);
      setReason('');
    } catch (error) {
      console.error('Error cancelling auto-renew:', error);
      toast.error('حدث خطأ أثناء إلغاء التجديد التلقائي');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!contract) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-warning">
            <XCircle className="h-5 w-5" />
            إلغاء التجديد التلقائي
          </DialogTitle>
          <DialogDescription>
            هل أنت متأكد من إلغاء التجديد التلقائي لهذا العقد؟
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* معلومات العقد */}
          <Card className="bg-muted/50">
            <CardContent className="py-3 space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">رقم العقد</span>
                <span className="font-mono font-medium">{contract.contract_number}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">المستأجر</span>
                <span className="font-medium">{contract.tenant_name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">تاريخ الانتهاء</span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(contract.end_date), 'yyyy/MM/dd', { locale: ar })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">حالة التجديد</span>
                <span className="flex items-center gap-1 text-success">
                  <RefreshCw className="h-3 w-3" />
                  تجديد تلقائي مفعّل
                </span>
              </div>
            </CardContent>
          </Card>

          <Alert variant="destructive" className="bg-warning/10 border-warning text-warning">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              بعد إلغاء التجديد التلقائي، سينتهي العقد في تاريخ الانتهاء المحدد ولن يتم تجديده تلقائياً.
            </AlertDescription>
          </Alert>

          {/* سبب الإلغاء */}
          <div className="space-y-2">
            <Label htmlFor="reason">سبب الإلغاء (اختياري)</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="أدخل سبب إلغاء التجديد التلقائي..."
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
                جاري الإلغاء...
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 ms-2" />
                تأكيد إلغاء التجديد
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
