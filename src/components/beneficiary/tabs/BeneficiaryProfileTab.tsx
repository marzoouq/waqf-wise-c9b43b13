/**
 * تبويب الملف الشخصي للمستفيد
 * مع دعم التعديل والتصميم المحسن
 */

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Edit, 
  Phone, 
  Mail, 
  MapPin, 
  CreditCard, 
  Users, 
  Calendar,
  User,
  Shield,
  Briefcase,
  Home,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building2,
} from "lucide-react";
import { format, arLocale as ar } from "@/lib/date";
import type { Database } from "@/integrations/supabase/types";
import { useVisibilitySettings, type VisibilitySettings } from "@/hooks/governance/useVisibilitySettings";
import { MaskedValue } from "@/components/shared/MaskedValue";
import { EditProfileDialog } from "../dialogs/EditProfileDialog";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/query-keys";
import { matchesStatus } from "@/lib/constants";

type Beneficiary = Database['public']['Tables']['beneficiaries']['Row'];

interface BeneficiaryProfileTabProps {
  beneficiary: Beneficiary;
}

// مكون عنصر المعلومات
function InfoItem({ 
  icon: Icon, 
  label, 
  value, 
  masked = false,
  maskType,
  settings,
  className = "",
}: { 
  icon?: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
  masked?: boolean;
  maskType?: 'phone' | 'national_id' | 'iban' | 'amount';
  settings?: VisibilitySettings;
  className?: string;
}) {
  const displayValue = masked && maskType && settings ? (
    <MaskedValue
      value={String(value || "—")}
      type={maskType}
      masked={
        maskType === 'phone' ? settings.mask_phone_numbers :
        maskType === 'national_id' ? settings.mask_national_ids :
        maskType === 'iban' ? settings.mask_iban :
        false
      }
    />
  ) : value || "—";

  return (
    <div className={`flex items-start gap-3 ${className}`}>
      {Icon && (
        <div className="p-2 rounded-lg bg-muted shrink-0">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-medium truncate">{displayValue}</p>
      </div>
    </div>
  );
}

// مكون بطاقة القسم
function SectionCard({ 
  title, 
  icon: Icon, 
  children,
  action,
}: { 
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Icon className="h-5 w-5 text-primary" />
            {title}
          </CardTitle>
          {action}
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export function BeneficiaryProfileTab({ beneficiary }: BeneficiaryProfileTabProps) {
  const { settings } = useVisibilitySettings();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  // التحقق من إمكانية التعديل
  const canEdit = (settings as VisibilitySettings & { allow_profile_edit?: boolean })?.allow_profile_edit !== false;

  const handleEditSuccess = () => {
    // إعادة تحميل بيانات المستفيد
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BENEFICIARY_PROFILE(beneficiary.id) });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BENEFICIARY(beneficiary.id) });
  };

  // تحديد حالة التحقق
  const getVerificationStatus = () => {
    if (beneficiary.verification_status === 'verified') {
      return { label: 'موثق', icon: CheckCircle2, color: 'text-success bg-success/10' };
    } else if (beneficiary.verification_status === 'pending') {
      return { label: 'قيد المراجعة', icon: Clock, color: 'text-warning bg-warning/10' };
    }
    return { label: 'غير موثق', icon: AlertCircle, color: 'text-muted-foreground bg-muted' };
  };

  const verificationStatus = getVerificationStatus();
  const VerificationIcon = verificationStatus.icon;

  // حساب العمر
  const calculateAge = (dateOfBirth: string | null) => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const age = calculateAge(beneficiary.date_of_birth);

  return (
    <div className="space-y-6">
      {/* بطاقة الرأس مع الملخص */}
      <Card className="bg-gradient-to-br from-primary/5 via-primary/10 to-transparent border-primary/20">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* الصورة الرمزية */}
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <User className="h-10 w-10 text-primary" />
            </div>

            {/* المعلومات الأساسية */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold">{beneficiary.full_name}</h2>
                <Badge className={`gap-1 ${verificationStatus.color}`}>
                  <VerificationIcon className="h-3 w-3" />
                  {verificationStatus.label}
                </Badge>
              </div>
              
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
                {beneficiary.beneficiary_number && (
                  <span className="flex items-center gap-1">
                    <Shield className="h-4 w-4" />
                    رقم المستفيد: {beneficiary.beneficiary_number}
                  </span>
                )}
                <Badge variant="secondary">{beneficiary.category}</Badge>
                {age && (
                  <span>{age} سنة</span>
                )}
              </div>
            </div>

            {/* زر التعديل */}
            {canEdit && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setEditDialogOpen(true)}
                className="shrink-0"
              >
                <Edit className="h-4 w-4 ms-2" />
                تعديل الملف
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* شبكة الأقسام */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* المعلومات الشخصية */}
        <SectionCard title="المعلومات الشخصية" icon={User}>
          <div className="grid gap-4">
            <InfoItem
              icon={User}
              label="الاسم الكامل"
              value={beneficiary.full_name}
            />
            <InfoItem
              icon={Shield}
              label="رقم الهوية"
              value={beneficiary.national_id}
              masked
              maskType="national_id"
              settings={settings}
            />
            <div className="grid grid-cols-2 gap-4">
              <InfoItem
                label="الجنس"
                value={beneficiary.gender === 'male' ? 'ذكر' : beneficiary.gender === 'female' ? 'أنثى' : undefined}
              />
              <InfoItem
                label="الجنسية"
                value={beneficiary.nationality}
              />
            </div>
            <InfoItem
              icon={Calendar}
              label="تاريخ الميلاد"
              value={beneficiary.date_of_birth 
                ? format(new Date(beneficiary.date_of_birth), "dd MMMM yyyy", { locale: ar })
                : undefined}
            />
          </div>
        </SectionCard>

        {/* معلومات التواصل */}
        <SectionCard title="معلومات التواصل" icon={Phone}>
          <div className="grid gap-4">
            <InfoItem
              icon={Phone}
              label="رقم الهاتف"
              value={beneficiary.phone}
              masked
              maskType="phone"
              settings={settings}
            />
            <InfoItem
              icon={Mail}
              label="البريد الإلكتروني"
              value={beneficiary.email}
            />
            <InfoItem
              icon={MapPin}
              label="المدينة"
              value={beneficiary.city}
            />
            <InfoItem
              icon={MapPin}
              label="العنوان"
              value={beneficiary.address}
            />
          </div>
        </SectionCard>

        {/* المعلومات البنكية */}
        <SectionCard title="المعلومات البنكية" icon={CreditCard}>
          <div className="grid gap-4">
            <InfoItem
              icon={Building2}
              label="اسم البنك"
              value={beneficiary.bank_name}
            />
            <InfoItem
              icon={CreditCard}
              label="رقم الحساب"
              value={beneficiary.bank_account_number}
              masked
              maskType="iban"
              settings={settings}
            />
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground mb-1">رقم الآيبان (IBAN)</p>
              <p className="font-mono text-sm">
                <MaskedValue
                  value={beneficiary.iban || "—"}
                  type="iban"
                  masked={settings?.mask_iban || false}
                />
              </p>
            </div>
          </div>
        </SectionCard>

        {/* المعلومات العائلية */}
        <SectionCard title="المعلومات العائلية" icon={Users}>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <InfoItem
                label="الحالة الاجتماعية"
                value={beneficiary.marital_status}
              />
              <InfoItem
                icon={Users}
                label="حجم الأسرة"
                value={beneficiary.family_size}
              />
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 rounded-lg bg-heir-son/10 border border-heir-son/20">
                <p className="text-2xl font-bold text-heir-son">{beneficiary.number_of_sons || 0}</p>
                <p className="text-xs text-muted-foreground">أبناء</p>
              </div>
              <div className="p-3 rounded-lg bg-heir-daughter/10 border border-heir-daughter/20">
                <p className="text-2xl font-bold text-heir-daughter">{beneficiary.number_of_daughters || 0}</p>
                <p className="text-xs text-muted-foreground">بنات</p>
              </div>
              <div className="p-3 rounded-lg bg-heir-wife/10 border border-heir-wife/20">
                <p className="text-2xl font-bold text-heir-wife">{beneficiary.number_of_wives || 0}</p>
                <p className="text-xs text-muted-foreground">زوجات</p>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* معلومات إضافية */}
        <SectionCard title="معلومات إضافية" icon={Briefcase}>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <InfoItem
                icon={Briefcase}
                label="الحالة الوظيفية"
                value={beneficiary.employment_status}
              />
              <InfoItem
                icon={Home}
                label="نوع السكن"
                value={beneficiary.housing_type}
              />
            </div>
            {beneficiary.notes && (
              <>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground mb-1">ملاحظات</p>
                  <p className="text-sm bg-muted/50 p-3 rounded-lg">{beneficiary.notes}</p>
                </div>
              </>
            )}
          </div>
        </SectionCard>

        {/* حالة الحساب */}
        <SectionCard title="حالة الحساب" icon={Shield}>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">حالة الحساب</p>
                <Badge 
                  variant={matchesStatus(beneficiary.status, 'active') ? 'default' : 'secondary'}
                  className="mt-1"
                >
                  {matchesStatus(beneficiary.status, 'active') ? 'نشط' : beneficiary.status}
                </Badge>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">تسجيل الدخول</p>
                <Badge 
                  variant={beneficiary.can_login ? 'default' : 'secondary'}
                  className="mt-1"
                >
                  {beneficiary.can_login ? 'مفعل' : 'غير مفعل'}
                </Badge>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">تاريخ الإنشاء</p>
                <p>{format(new Date(beneficiary.created_at), "dd/MM/yyyy", { locale: ar })}</p>
              </div>
              <div>
                <p className="text-muted-foreground">آخر تحديث</p>
                <p>{format(new Date(beneficiary.updated_at), "dd/MM/yyyy", { locale: ar })}</p>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* حوار التعديل */}
      <EditProfileDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        beneficiary={beneficiary}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
}
