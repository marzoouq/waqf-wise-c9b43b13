import { useFamilyTree } from "@/hooks/beneficiary/useBeneficiaryProfileData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, User } from "lucide-react";
import { useVisibilitySettings } from "@/hooks/useVisibilitySettings";
import { MaskedValue } from "@/components/shared/MaskedValue";
import { useIsMobile } from "@/hooks/use-mobile";

interface FamilyTreeTabProps {
  beneficiaryId: string;
}

export function FamilyTreeTab({ beneficiaryId }: FamilyTreeTabProps) {
  const { settings } = useVisibilitySettings();
  const isMobile = useIsMobile();

  const { data: familyMembers, isLoading } = useFamilyTree(
    beneficiaryId,
    settings?.show_family_tree || false
  );

  if (!settings?.show_family_tree) {
    return (
      <Card>
        <CardContent className="p-4 sm:p-6 text-center text-muted-foreground text-xs sm:text-sm">
          غير مصرح بعرض شجرة العائلة
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4 sm:p-6 text-center">
          <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-primary mx-auto"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 sm:h-5 sm:w-5" />
            <CardTitle className="text-sm sm:text-base">شجرة العائلة</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          <div className="space-y-3 sm:space-y-4">
            {familyMembers?.map((member) => (
              <Card key={member.id} className={member.id === beneficiaryId ? "border-primary" : ""}>
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                      <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg shrink-0">
                        <User className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                          {settings?.show_other_beneficiaries_names ? (
                            <h4 className="font-medium text-xs sm:text-sm truncate">{member.full_name}</h4>
                          ) : member.id === beneficiaryId ? (
                            <h4 className="font-medium text-xs sm:text-sm truncate">{member.full_name}</h4>
                          ) : (
                            <h4 className="font-medium text-xs sm:text-sm">مستفيد</h4>
                          )}
                          {member.is_head_of_family && (
                            <Badge variant="outline" className="text-[10px] sm:text-xs">رب الأسرة</Badge>
                          )}
                          {member.id === beneficiaryId && (
                            <Badge className="text-[10px] sm:text-xs">أنت</Badge>
                          )}
                        </div>
                        
                        {settings?.show_other_beneficiaries_personal_data && (
                          <div className="mt-1.5 sm:mt-2 space-y-0.5 sm:space-y-1 text-xs sm:text-sm text-muted-foreground">
                            {member.relationship && (
                              <p className="truncate">الصلة: {member.relationship}</p>
                            )}
                            {member.gender && (
                              <p>الجنس: {member.gender}</p>
                            )}
                            {member.marital_status && (
                              <p>الحالة الاجتماعية: {member.marital_status}</p>
                            )}
                            {member.phone && (
                              <p className="truncate">
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
                          <div className="mt-1.5 sm:mt-2">
                            <p className="text-xs sm:text-sm text-muted-foreground">
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

                    <Badge 
                      variant={member.status === "نشط" ? "default" : "secondary"}
                      className="text-[10px] sm:text-xs shrink-0"
                    >
                      {member.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}

            {(!familyMembers || familyMembers.length === 0) && (
              <div className="text-center py-6 sm:py-8 text-muted-foreground text-xs sm:text-sm">
                لا توجد بيانات متاحة لشجرة العائلة
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
