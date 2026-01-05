/**
 * حوار إنشاء طلب جديد
 * Create New Request Dialog
 */
import { memo, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ResponsiveDialog } from '@/components/shared/ResponsiveDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Search } from 'lucide-react';
import { RequestService } from '@/services/request.service';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CreateRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface Beneficiary {
  id: string;
  full_name: string;
  national_id: string;
  phone: string;
}

interface RequestType {
  id: string;
  name_ar: string;
  description: string | null;
  sla_hours: number | null;
}

export const CreateRequestDialog = memo(({ 
  open, 
  onOpenChange,
  onSuccess,
}: CreateRequestDialogProps) => {
  const [beneficiaryId, setBeneficiaryId] = useState('');
  const [requestTypeId, setRequestTypeId] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [priority, setPriority] = useState<'منخفضة' | 'متوسطة' | 'عالية' | 'عاجلة'>('متوسطة');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [beneficiarySearch, setBeneficiarySearch] = useState('');

  // جلب أنواع الطلبات
  const { data: requestTypes = [], isLoading: typesLoading } = useQuery<RequestType[]>({
    queryKey: ['request-types'],
    queryFn: () => RequestService.getRequestTypes(),
    enabled: open,
  });

  // جلب المستفيدين مع البحث
  const { data: beneficiaries = [], isLoading: beneficiariesLoading } = useQuery<Beneficiary[]>({
    queryKey: ['beneficiaries-search', beneficiarySearch],
    queryFn: async () => {
      let query = supabase
        .from('beneficiaries')
        .select('id, full_name, national_id, phone')
        .eq('status', 'نشط')
        .order('full_name')
        .limit(50);

      if (beneficiarySearch.trim()) {
        query = query.or(`full_name.ilike.%${beneficiarySearch}%,national_id.ilike.%${beneficiarySearch}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: open,
  });

  // إعادة تعيين النموذج عند الإغلاق
  useEffect(() => {
    if (!open) {
      setBeneficiaryId('');
      setRequestTypeId('');
      setDescription('');
      setAmount('');
      setPriority('متوسطة');
      setBeneficiarySearch('');
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!beneficiaryId || !requestTypeId || !description.trim()) {
      toast.error('يرجى تعبئة جميع الحقول المطلوبة');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await RequestService.create({
        beneficiary_id: beneficiaryId,
        request_type_id: requestTypeId,
        description: description.trim(),
        amount: amount ? parseFloat(amount) : undefined,
        priority,
      });

      if (result.success) {
        toast.success(result.message);
        onOpenChange(false);
        onSuccess?.();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء إنشاء الطلب');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="إنشاء طلب جديد"
      description="إضافة طلب جديد نيابة عن مستفيد"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4" dir="rtl">
        {/* البحث عن المستفيد */}
        <div className="space-y-2">
          <Label htmlFor="beneficiary">المستفيد *</Label>
          <div className="relative mb-2">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="ابحث بالاسم أو رقم الهوية..."
              value={beneficiarySearch}
              onChange={(e) => setBeneficiarySearch(e.target.value)}
              className="pe-10"
            />
          </div>
          <Select value={beneficiaryId} onValueChange={setBeneficiaryId}>
            <SelectTrigger>
              <SelectValue placeholder={beneficiariesLoading ? "جاري التحميل..." : "اختر المستفيد"} />
            </SelectTrigger>
            <SelectContent>
              {beneficiaries.map((b) => (
                <SelectItem key={b.id} value={b.id}>
                  {b.full_name} - {b.national_id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* نوع الطلب */}
        <div className="space-y-2">
          <Label htmlFor="request-type">نوع الطلب *</Label>
          <Select value={requestTypeId} onValueChange={setRequestTypeId}>
            <SelectTrigger>
              <SelectValue placeholder={typesLoading ? "جاري التحميل..." : "اختر نوع الطلب"} />
            </SelectTrigger>
            <SelectContent>
              {requestTypes.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.name_ar}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* الوصف */}
        <div className="space-y-2">
          <Label htmlFor="description">وصف الطلب *</Label>
          <Textarea
            id="description"
            placeholder="اكتب تفاصيل الطلب..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>

        {/* المبلغ */}
        <div className="space-y-2">
          <Label htmlFor="amount">المبلغ (اختياري)</Label>
          <Input
            id="amount"
            type="number"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="0"
            step="0.01"
          />
        </div>

        {/* الأولوية */}
        <div className="space-y-2">
          <Label htmlFor="priority">الأولوية</Label>
          <Select value={priority} onValueChange={(v) => setPriority(v as typeof priority)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="منخفضة">منخفضة</SelectItem>
              <SelectItem value="متوسطة">متوسطة</SelectItem>
              <SelectItem value="عالية">عالية</SelectItem>
              <SelectItem value="عاجلة">عاجلة</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* أزرار الإجراء */}
        <div className="flex gap-2 pt-4">
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
            إنشاء الطلب
          </Button>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
        </div>
      </form>
    </ResponsiveDialog>
  );
});

CreateRequestDialog.displayName = 'CreateRequestDialog';
