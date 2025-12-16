import { useState } from "react";
import { ResponsiveDialog } from "@/components/shared/ResponsiveDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Save, X } from "lucide-react";
import { useBeneficiaryCategories } from "@/hooks/beneficiary/useBeneficiaryCategories";
import { useSavedSearches } from "@/hooks/ui/useSavedSearches";

interface AdvancedSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSearch: (criteria: SearchCriteria) => void;
}

export interface SearchCriteria {
  fullName?: string;
  nationalId?: string;
  phone?: string;
  category?: string;
  status?: string;
  tribe?: string;
  city?: string;
  priorityLevel?: string;
  gender?: string;
  maritalStatus?: string;
  [key: string]: string | undefined;
}

export function AdvancedSearchDialog({ open, onOpenChange, onSearch }: AdvancedSearchDialogProps) {
  const { activeCategories } = useBeneficiaryCategories();
  const { saveSearch } = useSavedSearches();
  
  const [criteria, setCriteria] = useState<SearchCriteria>({});
  const [searchName, setSearchName] = useState("");
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const handleSearch = () => {
    onSearch(criteria);
    onOpenChange(false);
  };

  const handleClear = () => {
    setCriteria({});
  };

  const handleSave = async () => {
    if (!searchName.trim()) return;
    
    await saveSearch({
      name: searchName,
      search_criteria: criteria,
      is_favorite: false,
      last_used_at: new Date().toISOString(),
    });
    
    setSearchName("");
    setShowSaveDialog(false);
  };

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="البحث المتقدم"
      size="xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          {/* الاسم الكامل */}
          <div className="space-y-2">
            <Label htmlFor="fullName">الاسم الكامل</Label>
            <Input
              id="fullName"
              placeholder="ابحث بالاسم..."
              value={criteria.fullName || ""}
              onChange={(e) => setCriteria({ ...criteria, fullName: e.target.value })}
            />
          </div>

          {/* رقم الهوية */}
          <div className="space-y-2">
            <Label htmlFor="nationalId">رقم الهوية</Label>
            <Input
              id="nationalId"
              placeholder="ابحث برقم الهوية..."
              value={criteria.nationalId || ""}
              onChange={(e) => setCriteria({ ...criteria, nationalId: e.target.value })}
            />
          </div>

          {/* رقم الجوال */}
          <div className="space-y-2">
            <Label htmlFor="phone">رقم الجوال</Label>
            <Input
              id="phone"
              placeholder="ابحث برقم الجوال..."
              value={criteria.phone || ""}
              onChange={(e) => setCriteria({ ...criteria, phone: e.target.value })}
            />
          </div>

          {/* الفئة */}
          <div className="space-y-2">
            <Label htmlFor="category">الفئة</Label>
            <Select 
              value={criteria.category || "all"} 
              onValueChange={(value) => setCriteria({ ...criteria, category: value === "all" ? "" : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر الفئة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                {activeCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.name}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* الحالة */}
          <div className="space-y-2">
            <Label htmlFor="status">الحالة</Label>
            <Select 
              value={criteria.status || "all"} 
              onValueChange={(value) => setCriteria({ ...criteria, status: value === "all" ? "" : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="نشط">نشط</SelectItem>
                <SelectItem value="معلق">معلق</SelectItem>
                <SelectItem value="غير نشط">غير نشط</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* القبيلة */}
          <div className="space-y-2">
            <Label htmlFor="tribe">القبيلة</Label>
            <Input
              id="tribe"
              placeholder="ابحث بالقبيلة..."
              value={criteria.tribe || ""}
              onChange={(e) => setCriteria({ ...criteria, tribe: e.target.value })}
            />
          </div>

          {/* المدينة */}
          <div className="space-y-2">
            <Label htmlFor="city">المدينة</Label>
            <Input
              id="city"
              placeholder="ابحث بالمدينة..."
              value={criteria.city || ""}
              onChange={(e) => setCriteria({ ...criteria, city: e.target.value })}
            />
          </div>

          {/* مستوى الأولوية */}
          <div className="space-y-2">
            <Label htmlFor="priorityLevel">مستوى الأولوية</Label>
            <Select 
              value={criteria.priorityLevel || "all"} 
              onValueChange={(value) => setCriteria({ ...criteria, priorityLevel: value === "all" ? "" : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر الأولوية" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="1">عادي</SelectItem>
                <SelectItem value="2">متوسط</SelectItem>
                <SelectItem value="3">عالي</SelectItem>
                <SelectItem value="4">عاجل</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* الجنس */}
          <div className="space-y-2">
            <Label htmlFor="gender">الجنس</Label>
            <Select 
              value={criteria.gender || "all"} 
              onValueChange={(value) => setCriteria({ ...criteria, gender: value === "all" ? "" : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر الجنس" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="ذكر">ذكر</SelectItem>
                <SelectItem value="أنثى">أنثى</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* الحالة الاجتماعية */}
          <div className="space-y-2">
            <Label htmlFor="maritalStatus">الحالة الاجتماعية</Label>
            <Select 
              value={criteria.maritalStatus || "all"} 
              onValueChange={(value) => setCriteria({ ...criteria, maritalStatus: value === "all" ? "" : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="أعزب">أعزب</SelectItem>
                <SelectItem value="متزوج">متزوج</SelectItem>
                <SelectItem value="مطلق">مطلق</SelectItem>
                <SelectItem value="أرمل">أرمل</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
          <Button variant="outline" onClick={handleClear} className="w-full sm:w-auto">
            <X className="ms-2 h-4 w-4" />
            مسح
          </Button>
          <Button variant="outline" onClick={() => setShowSaveDialog(true)} className="w-full sm:w-auto">
            <Save className="ms-2 h-4 w-4" />
            حفظ البحث
          </Button>
          <Button onClick={handleSearch} className="w-full sm:w-auto">
            <Search className="ms-2 h-4 w-4" />
            بحث
          </Button>
        </div>

        {showSaveDialog && (
          <div className="mt-4 p-4 border rounded-lg space-y-3">
            <Label htmlFor="searchName">اسم البحث المحفوظ</Label>
            <Input
              id="searchName"
              placeholder="أدخل اسم البحث..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave}>حفظ</Button>
              <Button size="sm" variant="outline" onClick={() => setShowSaveDialog(false)}>إلغاء</Button>
            </div>
          </div>
        )}
    </ResponsiveDialog>
  );
}
