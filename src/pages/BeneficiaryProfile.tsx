import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, Edit, FileText, Activity, Users, DollarSign, Mail, Phone, MapPin, Calendar, User, CreditCard } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useState } from "react";
import BeneficiaryDialog from "@/components/beneficiaries/BeneficiaryDialog";
import { AttachmentsDialog } from "@/components/beneficiaries/AttachmentsDialog";
import { ActivityLogDialog } from "@/components/beneficiaries/ActivityLogDialog";
import { useBeneficiaries } from "@/hooks/useBeneficiaries";
import { LoadingState } from "@/components/shared/LoadingState";

export default function BeneficiaryProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { updateBeneficiary } = useBeneficiaries();
  
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [attachmentsDialogOpen, setAttachmentsDialogOpen] = useState(false);
  const [activityLogDialogOpen, setActivityLogDialogOpen] = useState(false);

  const { data: beneficiary, isLoading } = useQuery({
    queryKey: ["beneficiary", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("beneficiaries")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const { data: payments = [] } = useQuery({
    queryKey: ["beneficiary-payments", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .eq("payer_name", beneficiary?.full_name)
        .order("payment_date", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!beneficiary,
  });

  const { data: familyMembers = [] } = useQuery({
    queryKey: ["beneficiary-family", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("beneficiaries")
        .select("*")
        .eq("parent_beneficiary_id", id);

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return <LoadingState size="lg" fullScreen />;
  }

  if (!beneficiary) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">لم يتم العثور على المستفيد</p>
        <Button onClick={() => navigate("/beneficiaries")} className="mt-4">
          العودة للقائمة
        </Button>
      </div>
    );
  }

  const totalPayments = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/beneficiaries")}>
            <ArrowRight className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{beneficiary.full_name}</h1>
            <p className="text-sm text-muted-foreground">{beneficiary.national_id}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setActivityLogDialogOpen(true)}>
            <Activity className="ml-2 h-4 w-4" />
            سجل النشاط
          </Button>
          <Button variant="outline" onClick={() => setAttachmentsDialogOpen(true)}>
            <FileText className="ml-2 h-4 w-4" />
            المرفقات
          </Button>
          <Button onClick={() => setEditDialogOpen(true)}>
            <Edit className="ml-2 h-4 w-4" />
            تعديل البيانات
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              إجمالي المدفوعات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPayments.toLocaleString()} ر.س</div>
            <p className="text-xs text-muted-foreground">من {payments.length} دفعة</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              أفراد الأسرة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{beneficiary.family_size || 1}</div>
            <p className="text-xs text-muted-foreground">{familyMembers.length} مسجل</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              الحالة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={beneficiary.status === "نشط" ? "default" : "secondary"}>
              {beneficiary.status}
            </Badge>
            <p className="text-xs text-muted-foreground mt-2">أولوية: {beneficiary.priority_level || 1}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              تاريخ التسجيل
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">{format(new Date(beneficiary.created_at), "dd MMMM yyyy", { locale: ar })}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="info" className="w-full">
        <TabsList>
          <TabsTrigger value="info">المعلومات الشخصية</TabsTrigger>
          <TabsTrigger value="family">أفراد الأسرة</TabsTrigger>
          <TabsTrigger value="payments">المدفوعات</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>البيانات الأساسية</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">الاسم الكامل</p>
                  <p className="font-medium">{beneficiary.full_name}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">رقم الهوية</p>
                  <p className="font-medium">{beneficiary.national_id}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">رقم الجوال</p>
                  <p className="font-medium">{beneficiary.phone}</p>
                </div>
              </div>

              {beneficiary.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">البريد الإلكتروني</p>
                    <p className="font-medium">{beneficiary.email}</p>
                  </div>
                </div>
              )}

              {beneficiary.city && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">المدينة</p>
                    <p className="font-medium">{beneficiary.city}</p>
                  </div>
                </div>
              )}

              {beneficiary.tribe && (
                <div>
                  <p className="text-xs text-muted-foreground">القبيلة</p>
                  <p className="font-medium">{beneficiary.tribe}</p>
                </div>
              )}

              <div>
                <p className="text-xs text-muted-foreground">الفئة</p>
                <Badge variant="outline">{beneficiary.category}</Badge>
              </div>

              {beneficiary.gender && (
                <div>
                  <p className="text-xs text-muted-foreground">الجنس</p>
                  <p className="font-medium">{beneficiary.gender}</p>
                </div>
              )}

              {beneficiary.marital_status && (
                <div>
                  <p className="text-xs text-muted-foreground">الحالة الاجتماعية</p>
                  <p className="font-medium">{beneficiary.marital_status}</p>
                </div>
              )}

              {beneficiary.date_of_birth && (
                <div>
                  <p className="text-xs text-muted-foreground">تاريخ الميلاد</p>
                  <p className="font-medium">{format(new Date(beneficiary.date_of_birth), "dd MMMM yyyy", { locale: ar })}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {(beneficiary.bank_name || beneficiary.iban) && (
            <Card>
              <CardHeader>
                <CardTitle>المعلومات البنكية</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {beneficiary.bank_name && (
                  <div>
                    <p className="text-xs text-muted-foreground">اسم البنك</p>
                    <p className="font-medium">{beneficiary.bank_name}</p>
                  </div>
                )}
                {beneficiary.iban && (
                  <div>
                    <p className="text-xs text-muted-foreground">رقم الآيبان</p>
                    <p className="font-medium">{beneficiary.iban}</p>
                  </div>
                )}
                {beneficiary.bank_account_number && (
                  <div>
                    <p className="text-xs text-muted-foreground">رقم الحساب</p>
                    <p className="font-medium">{beneficiary.bank_account_number}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {beneficiary.notes && (
            <Card>
              <CardHeader>
                <CardTitle>ملاحظات</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{beneficiary.notes}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="family">
          <Card>
            <CardHeader>
              <CardTitle>أفراد الأسرة المسجلين</CardTitle>
            </CardHeader>
            <CardContent>
              {familyMembers.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">لا توجد أفراد عائلة مسجلين</p>
              ) : (
                <div className="space-y-3">
                  {familyMembers.map((member: any) => (
                    <div key={member.id} className="border rounded-lg p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium">{member.full_name}</p>
                        <p className="text-sm text-muted-foreground">{member.relationship}</p>
                      </div>
                      <Badge variant="outline">{member.category}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>سجل المدفوعات</CardTitle>
            </CardHeader>
            <CardContent>
              {payments.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">لا توجد مدفوعات مسجلة</p>
              ) : (
                <div className="space-y-3">
                  {payments.map((payment: any) => (
                    <div key={payment.id} className="border rounded-lg p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium">{payment.payment_number}</p>
                        <p className="text-sm text-muted-foreground">{payment.description}</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(payment.payment_date), "dd MMMM yyyy", { locale: ar })}</p>
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-lg">{Number(payment.amount).toLocaleString()} ر.س</p>
                        <Badge variant="outline">{payment.payment_method}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <BeneficiaryDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        beneficiary={beneficiary}
        onSave={async (data) => {
          await updateBeneficiary({ id: beneficiary.id, ...data });
          setEditDialogOpen(false);
        }}
      />

      <AttachmentsDialog
        open={attachmentsDialogOpen}
        onOpenChange={setAttachmentsDialogOpen}
        beneficiaryId={beneficiary.id}
        beneficiaryName={beneficiary.full_name}
      />

      <ActivityLogDialog
        open={activityLogDialogOpen}
        onOpenChange={setActivityLogDialogOpen}
        beneficiaryId={beneficiary.id}
        beneficiaryName={beneficiary.full_name}
      />
    </div>
  );
}
