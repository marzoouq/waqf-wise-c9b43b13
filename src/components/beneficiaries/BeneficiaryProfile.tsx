import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Users,
  Calendar,
  FileText,
  Activity,
} from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface BeneficiaryProfileProps {
  beneficiaryId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BeneficiaryProfile({
  beneficiaryId,
  open,
  onOpenChange,
}: BeneficiaryProfileProps) {
  const { data: beneficiary, isLoading } = useQuery({
    queryKey: ["beneficiary-profile", beneficiaryId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("beneficiaries")
        .select("*")
        .eq("id", beneficiaryId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: open && !!beneficiaryId,
  });

  const { data: activityLog = [] } = useQuery({
    queryKey: ["beneficiary-activity", beneficiaryId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("beneficiary_activity_log")
        .select("*")
        .eq("beneficiary_id", beneficiaryId)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
    enabled: open && !!beneficiaryId,
  });

  const { data: attachments = [] } = useQuery({
    queryKey: ["beneficiary-attachments", beneficiaryId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("beneficiary_attachments")
        .select("*")
        .eq("beneficiary_id", beneficiaryId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: open && !!beneficiaryId,
  });

  if (isLoading || !beneficiary) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            الملف الشخصي للمستفيد
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Basic Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">المعلومات الأساسية</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">الاسم الكامل</div>
                  <div className="font-medium">{beneficiary.full_name}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">رقم الهوية</div>
                  <div className="font-medium flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    {beneficiary.national_id}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">الجنس</div>
                  <div className="font-medium">{beneficiary.gender}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">صلة القرابة</div>
                  <Badge variant="secondary">{beneficiary.relationship}</Badge>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">الفئة</div>
                  <Badge>{beneficiary.category}</Badge>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">الحالة</div>
                  <Badge variant="outline">{beneficiary.status}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="contact" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="contact">
                <Phone className="ml-2 h-4 w-4" />
                الاتصال
              </TabsTrigger>
              <TabsTrigger value="family">
                <Users className="ml-2 h-4 w-4" />
                العائلة
              </TabsTrigger>
              <TabsTrigger value="documents">
                <FileText className="ml-2 h-4 w-4" />
                المستندات
              </TabsTrigger>
              <TabsTrigger value="activity">
                <Activity className="ml-2 h-4 w-4" />
                النشاط
              </TabsTrigger>
            </TabsList>

            <TabsContent value="contact" className="space-y-4">
              <Card>
                <CardContent className="pt-6 space-y-3">
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">رقم الجوال</div>
                      <div className="font-medium">{beneficiary.phone}</div>
                    </div>
                  </div>
                  {beneficiary.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm text-muted-foreground">البريد الإلكتروني</div>
                        <div className="font-medium">{beneficiary.email}</div>
                      </div>
                    </div>
                  )}
                  {beneficiary.city && (
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm text-muted-foreground">المدينة</div>
                        <div className="font-medium">{beneficiary.city}</div>
                      </div>
                    </div>
                  )}
                  {beneficiary.address && (
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm text-muted-foreground">العنوان</div>
                        <div className="font-medium">{beneficiary.address}</div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="family" className="space-y-4">
              <Card>
                <CardContent className="pt-6 space-y-3">
                  {beneficiary.family_name && (
                    <div>
                      <div className="text-sm text-muted-foreground">اسم العائلة</div>
                      <div className="font-medium">{beneficiary.family_name}</div>
                    </div>
                  )}
                  {beneficiary.tribe && (
                    <div>
                      <div className="text-sm text-muted-foreground">القبيلة</div>
                      <div className="font-medium">{beneficiary.tribe}</div>
                    </div>
                  )}
                  <Separator />
                  <div className="grid grid-cols-3 gap-4 text-center">
                    {beneficiary.number_of_sons !== null && (
                      <div>
                        <div className="text-2xl font-bold">{beneficiary.number_of_sons}</div>
                        <div className="text-sm text-muted-foreground">أبناء</div>
                      </div>
                    )}
                    {beneficiary.number_of_daughters !== null && (
                      <div>
                        <div className="text-2xl font-bold">{beneficiary.number_of_daughters}</div>
                        <div className="text-sm text-muted-foreground">بنات</div>
                      </div>
                    )}
                    {beneficiary.number_of_wives !== null && (
                      <div>
                        <div className="text-2xl font-bold">{beneficiary.number_of_wives}</div>
                        <div className="text-sm text-muted-foreground">زوجات</div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  {attachments.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      لا توجد مستندات مرفقة
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {attachments.map((attachment) => (
                        <div
                          key={attachment.id}
                          className="flex items-center justify-between p-3 rounded-lg border"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <div className="font-medium">{attachment.file_name}</div>
                              <div className="text-sm text-muted-foreground">
                                {attachment.file_type}
                              </div>
                            </div>
                          </div>
                          {attachment.is_verified && (
                            <Badge variant="outline" className="bg-success/10 text-success">
                              موثق
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  {activityLog.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      لا يوجد نشاط مسجل
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {activityLog.map((log) => (
                        <div
                          key={log.id}
                          className="flex items-start gap-3 p-3 rounded-lg border"
                        >
                          <Activity className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div className="flex-1">
                            <div className="font-medium">{log.action_description}</div>
                            <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                              <Calendar className="h-3 w-3" />
                              {log.created_at &&
                                format(new Date(log.created_at), "PPp", { locale: ar })}
                            </div>
                            {log.performed_by_name && (
                              <div className="text-sm text-muted-foreground mt-1">
                                بواسطة: {log.performed_by_name}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
