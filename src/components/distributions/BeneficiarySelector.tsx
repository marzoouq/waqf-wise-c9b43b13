import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Users } from 'lucide-react';
import { useBeneficiarySelector } from '@/hooks/distributions/useBeneficiarySelector';

interface BeneficiarySelectorProps {
  selected: string[];
  onChange: (selected: string[]) => void;
}

export function BeneficiarySelector({ selected, onChange }: BeneficiarySelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const { beneficiaries, loading, filterBeneficiaries } = useBeneficiarySelector();

  const filteredBeneficiaries = filterBeneficiaries(searchTerm);

  const handleToggle = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter(s => s !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  const handleSelectAll = () => {
    if (selected.length === filteredBeneficiaries.length) {
      onChange([]);
    } else {
      onChange(filteredBeneficiaries.map(b => b.id));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ابحث بالاسم أو رقم الهوية..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-9"
          />
        </div>
        <Button variant="outline" onClick={handleSelectAll}>
          {selected.length === filteredBeneficiaries.length ? 'إلغاء الكل' : 'تحديد الكل'}
        </Button>
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Users className="h-4 w-4" />
        <span>تم تحديد {selected.length} من {filteredBeneficiaries.length} مستفيد</span>
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">جاري التحميل...</div>
      ) : (
        <div className="border rounded-lg max-h-96 overflow-y-auto">
          {filteredBeneficiaries.map((beneficiary) => (
            <div
              key={beneficiary.id}
              className="flex items-center gap-3 p-3 hover:bg-muted/50 border-b last:border-b-0"
            >
              <Checkbox
                checked={selected.includes(beneficiary.id)}
                onCheckedChange={() => handleToggle(beneficiary.id)}
              />
              <div className="flex-1">
                <div className="font-medium">{beneficiary.full_name}</div>
                <div className="text-sm text-muted-foreground">
                  {beneficiary.national_id} • {beneficiary.category}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
