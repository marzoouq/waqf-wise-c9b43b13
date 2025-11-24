import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Phone, Mail, MapPin, CreditCard, Users, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import type { Database } from "@/integrations/supabase/types";

type Beneficiary = Database['public']['Tables']['beneficiaries']['Row'];

interface BeneficiaryProfileTabProps {
  beneficiary: Beneficiary;
}

export function BeneficiaryProfileTab({ beneficiary }: BeneficiaryProfileTabProps) {
  return (
    <div className="space-y-6">
      {/* Personal Information */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>المعلومات الشخصية</CardTitle>
            <CardDescription>البيانات الأساسية للمستفيد</CardDescription>
          </div>
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 ml-2" />
            تعديل
          </Button>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-muted-foreground">الاسم الكامل</label>
            <p className="text-lg mt-1">{beneficiary.full_name}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">رقم الهوية</label>
            <p className="text-lg mt-1">{beneficiary.national_id}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">رقم المستفيد</label>
            <p className="text-lg mt-1">{beneficiary.beneficiary_number || "—"}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">تاريخ الميلاد</label>
            <p className="text-lg mt-1">
              {beneficiary.date_of_birth 
                ? format(new Date(beneficiary.date_of_birth), "dd MMMM yyyy", { locale: ar })
                : "—"}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">الجنس</label>
            <p className="text-lg mt-1">{beneficiary.gender === 'male' ? 'ذكر' : beneficiary.gender === 'female' ? 'أنثى' : '—'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">الحالة الاجتماعية</label>
            <p className="text-lg mt-1">{beneficiary.marital_status || "—"}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">الجنسية</label>
            <p className="text-lg mt-1">{beneficiary.nationality || "—"}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">الفئة</label>
            <Badge variant="secondary">{beneficiary.category}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>معلومات التواصل</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="flex items-center gap-3">
            <Phone className="h-5 w-5 text-muted-foreground" />
            <div>
              <label className="text-sm font-medium text-muted-foreground">الهاتف</label>
              <p className="text-lg">{beneficiary.phone}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <div>
              <label className="text-sm font-medium text-muted-foreground">البريد الإلكتروني</label>
              <p className="text-lg">{beneficiary.email || "—"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-muted-foreground" />
            <div>
              <label className="text-sm font-medium text-muted-foreground">المدينة</label>
              <p className="text-lg">{beneficiary.city || "—"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-muted-foreground" />
            <div>
              <label className="text-sm font-medium text-muted-foreground">العنوان</label>
              <p className="text-lg">{beneficiary.address || "—"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Banking Information */}
      <Card>
        <CardHeader>
          <CardTitle>المعلومات البنكية</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="flex items-center gap-3">
            <CreditCard className="h-5 w-5 text-muted-foreground" />
            <div>
              <label className="text-sm font-medium text-muted-foreground">البنك</label>
              <p className="text-lg">{beneficiary.bank_name || "—"}</p>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">رقم الحساب</label>
            <p className="text-lg font-mono">{beneficiary.bank_account_number || "—"}</p>
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-muted-foreground">رقم الآيبان</label>
            <p className="text-lg font-mono">{beneficiary.iban || "—"}</p>
          </div>
        </CardContent>
      </Card>

      {/* Family Information */}
      <Card>
        <CardHeader>
          <CardTitle>المعلومات العائلية</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-muted-foreground" />
            <div>
              <label className="text-sm font-medium text-muted-foreground">حجم الأسرة</label>
              <p className="text-lg">{beneficiary.family_size || "—"}</p>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">عدد الأبناء</label>
            <p className="text-lg">{beneficiary.number_of_sons || 0}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">عدد البنات</label>
            <p className="text-lg">{beneficiary.number_of_daughters || 0}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">عدد الزوجات</label>
            <p className="text-lg">{beneficiary.number_of_wives || 0}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
