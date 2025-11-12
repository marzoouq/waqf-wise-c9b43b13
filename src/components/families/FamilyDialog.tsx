import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBeneficiaries } from '@/hooks/useBeneficiaries';
import { Family } from '@/types';

interface FamilyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  family?: Family | null;
  onSave: (data: Partial<Family>) => void;
}

const FamilyDialog = ({ open, onOpenChange, family, onSave }: FamilyDialogProps) => {
  const { beneficiaries } = useBeneficiaries();
  
  const [formData, setFormData] = useState({
    family_name: '',
    head_of_family_id: '',
    tribe: '',
    status: 'نشط',
    notes: '',
  });

  useEffect(() => {
    if (family) {
      setFormData({
        family_name: family.family_name || '',
        head_of_family_id: family.head_of_family_id || '',
        tribe: family.tribe || '',
        status: family.status || 'نشط',
        notes: family.notes || '',
      });
    } else {
      setFormData({
        family_name: '',
        head_of_family_id: '',
        tribe: '',
        status: 'نشط',
        notes: '',
      });
    }
  }, [family, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {family ? 'تعديل بيانات العائلة' : 'إضافة عائلة جديدة'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* اسم العائلة */}
          <div className="space-y-2">
            <Label htmlFor="family_name">
              اسم العائلة <span className="text-destructive">*</span>
            </Label>
            <Input
              id="family_name"
              value={formData.family_name}
              onChange={(e) => setFormData({ ...formData, family_name: e.target.value })}
              placeholder="عائلة الأحمد"
              required
            />
          </div>

          {/* رب الأسرة */}
          <div className="space-y-2">
            <Label htmlFor="head_of_family_id">رب الأسرة</Label>
            <Select
              value={formData.head_of_family_id}
              onValueChange={(value) => setFormData({ ...formData, head_of_family_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر رب الأسرة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">بدون</SelectItem>
                {beneficiaries.map((beneficiary) => (
                  <SelectItem key={beneficiary.id} value={beneficiary.id}>
                    {beneficiary.full_name} - {beneficiary.national_id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* القبيلة */}
          <div className="space-y-2">
            <Label htmlFor="tribe">القبيلة</Label>
            <Input
              id="tribe"
              value={formData.tribe}
              onChange={(e) => setFormData({ ...formData, tribe: e.target.value })}
              placeholder="قبيلة النعيم"
            />
          </div>

          {/* الحالة */}
          <div className="space-y-2">
            <Label htmlFor="status">
              الحالة <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value })}
              required
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="نشط">نشط</SelectItem>
                <SelectItem value="معلق">معلق</SelectItem>
                <SelectItem value="موقوف">موقوف</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* ملاحظات */}
          <div className="space-y-2">
            <Label htmlFor="notes">ملاحظات</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="أي ملاحظات إضافية..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              إلغاء
            </Button>
            <Button type="submit">
              {family ? 'حفظ التعديلات' : 'إضافة العائلة'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FamilyDialog;
