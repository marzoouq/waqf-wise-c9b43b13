import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, User } from "lucide-react";
import { useVisibilitySettings } from "@/hooks/useVisibilitySettings";
import { MaskedValue } from "@/components/shared/MaskedValue";

interface FamilyTreeTabProps {
  beneficiaryId: string;
}

export function FamilyTreeTab({ beneficiaryId }: FamilyTreeTabProps) {
  const { settings } = useVisibilitySettings();

  const { data: familyMembers, isLoading } = useQuery({
    queryKey: ["family-tree", beneficiaryId],
    queryFn: async () => {
      // جلب المستفيد الحالي
      const { data: currentBeneficiary } = await supabase
        .from("beneficiaries")
        .select("*")
        .eq("id", beneficiaryId)
        .single();

      if (!currentBeneficiary) return [];

      // جلب جميع أفراد العائلة
      const { data: family } = await supabase
        .from("beneficiaries")
        .select("*")
        .or(`family_name.eq.${currentBeneficiary.family_name},parent_beneficiary_id.eq.${beneficiaryId},id.eq.${currentBeneficiary.parent_beneficiary_id}`)
        .eq("status", "نشط")
        .order("is_head_of_family", { ascending: false })
        .order("date_of_birth", { ascending: true });

      return family || [];
    },
    enabled: settings?.show_family_tree || false,
  });

  if (!settings?.show_family_tree) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          غير مصرح بعرض شجرة العائلة
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <CardTitle>شجرة العائلة</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {familyMembers?.map((member) => (
              <Card key={member.id} className={member.id === beneficiaryId ? "border-primary" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          {settings?.show_other_beneficiaries_names ? (
                            <h4 className="font-medium">{member.full_name}</h4>
                          ) : member.id === beneficiaryId ? (
                            <h4 className="font-medium">{member.full_name}</h4>
                          ) : (
                            <h4 className="font-medium">مستفيد</h4>
                          )}
                          {member.is_head_of_family && (
                            <Badge variant="outline" className="text-xs">رب الأسرة</Badge>
                          )}
                          {member.id === beneficiaryId && (
                            <Badge className="text-xs">أنت</Badge>
                          )}
                        </div>
                        
                        {settings?.show_other_beneficiaries_personal_data && (
                          <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                            {member.relationship && (
                              <p>الصلة: {member.relationship}</p>
                            )}
                            {member.gender && (
                              <p>الجنس: {member.gender}</p>
                            )}
                            {member.marital_status && (
                              <p>الحالة الاجتماعية: {member.marital_status}</p>
                            )}
                            {member.phone && (
                              <p>
                                الهاتف:{" "}
                                <MaskedValue
                                  value={member.phone}
                                  type="phone"
                                  masked={settings?.mask_phone_numbers || false}
                                />
                              </p>
                            )}
                          </div>
                        )}

                        {settings?.show_other_beneficiaries_amounts && member.total_received && (
                          <div className="mt-2">
                            <p className="text-sm text-muted-foreground">
                              إجمالي المستحقات:{" "}
                              <MaskedValue
                                value={member.total_received.toLocaleString("ar-SA")}
                                type="amount"
                                masked={settings?.mask_exact_amounts || false}
                              />{" "}
                              ريال
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <Badge variant={member.status === "نشط" ? "default" : "secondary"}>
                      {member.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}

            {(!familyMembers || familyMembers.length === 0) && (
              <div className="text-center py-8 text-muted-foreground">
                لا توجد بيانات متاحة لشجرة العائلة
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
