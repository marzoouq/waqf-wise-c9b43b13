import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { LoadingState } from "@/components/shared/LoadingState";
import { EmptyState } from "@/components/shared/EmptyState";
import { Users } from "lucide-react";
import { format, arLocale as ar } from "@/lib/date";
import { useFamilyMembersDialog } from "@/hooks/distributions/useDistributionTabsData";

interface FamilyMembersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  familyId: string;
  familyName: string;
}

interface FamilyMember {
  id: string;
  full_name: string;
  national_id: string;
  relationship: string;
  gender: string;
  date_of_birth: string | null;
  status: string;
  is_head_of_family: boolean;
}

export function FamilyMembersDialog({ open, onOpenChange, familyId, familyName }: FamilyMembersDialogProps) {
  const { data: members = [], isLoading } = useFamilyMembersDialog(familyName, open);

  const getRelationshipBadge = (relationship: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      "رب الأسرة": "default",
      "زوجة": "secondary",
      "ابن": "outline",
      "ابنة": "outline",
    };
    return variants[relationship] || "outline";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>أفراد عائلة {familyName}</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <LoadingState />
        ) : (members as FamilyMember[]).length === 0 ? (
          <EmptyState
            icon={Users}
            title="لا يوجد أفراد"
            description="لم يتم إضافة أفراد لهذه العائلة بعد"
          />
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              إجمالي الأفراد: <span className="font-bold">{(members as FamilyMember[]).length}</span>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الاسم الكامل</TableHead>
                    <TableHead>رقم الهوية</TableHead>
                    <TableHead>العلاقة</TableHead>
                    <TableHead>الجنس</TableHead>
                    <TableHead>تاريخ الميلاد</TableHead>
                    <TableHead>الحالة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(members as FamilyMember[]).map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">
                        {member.full_name}
                        {member.is_head_of_family && (
                          <Badge variant="default" className="mr-2 text-xs">
                            رب الأسرة
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-sm">{member.national_id}</TableCell>
                      <TableCell>
                        <Badge variant={getRelationshipBadge(member.relationship)}>
                          {member.relationship || "-"}
                        </Badge>
                      </TableCell>
                      <TableCell>{member.gender || "-"}</TableCell>
                      <TableCell>
                        {member.date_of_birth
                          ? format(new Date(member.date_of_birth), "dd/MM/yyyy", { locale: ar })
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={member.status === "نشط" ? "default" : "secondary"}>
                          {member.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
