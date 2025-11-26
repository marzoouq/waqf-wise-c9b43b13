import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Plus, Edit, Trash2, User, UserPlus } from 'lucide-react';
import { useFamilyMembers } from '@/hooks/useFamilies';
import { LoadingState } from '@/components/shared/LoadingState';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

// Type للبيانات المعادة من الـ API
interface MemberWithBeneficiary {
  id: string;
  family_id: string;
  beneficiary_id: string;
  relationship_to_head: string;
  is_dependent: boolean;
  priority_level: number;
  notes?: string;
  beneficiary?: {
    id: string;
    full_name: string;
    national_id: string;
    phone?: string;
    email?: string;
    status: string;
    is_head_of_family?: boolean;
  };
}

interface FamilyTreeViewProps {
  familyId: string;
  familyName: string;
}

interface MemberFormData {
  beneficiary_id: string;
  relationship_to_head: string;
  is_dependent: boolean;
  priority_level: number;
  notes: string;
}

/**
 * مكون عرض شجرة العائلة
 * يعرض أفراد العائلة بشكل هرمي
 */
export function FamilyTreeView({ familyId, familyName }: FamilyTreeViewProps) {
  const { members, isLoading, addMember, updateMember, removeMember } = useFamilyMembers(familyId);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState<MemberFormData>({
    beneficiary_id: '',
    relationship_to_head: 'ابن',
    is_dependent: true,
    priority_level: 1,
    notes: '',
  });

  const handleAddMember = async () => {
    if (!formData.beneficiary_id) {
      toast.error('يرجى اختيار مستفيد');
      return;
    }

    try {
      await addMember.mutateAsync({
        family_id: familyId,
        beneficiary_id: formData.beneficiary_id,
        relationship_to_head: formData.relationship_to_head,
        is_dependent: formData.is_dependent,
        priority_level: formData.priority_level,
        notes: formData.notes || null,
      } as any);
      
      toast.success('تم إضافة الفرد بنجاح');
      setIsAddDialogOpen(false);
      setFormData({
        beneficiary_id: '',
        relationship_to_head: 'ابن',
        is_dependent: true,
        priority_level: 1,
        notes: '',
      });
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (window.confirm(`هل تريد فصل ${memberName} من العائلة؟`)) {
      removeMember.mutate(memberId, {
        onSuccess: () => {
          toast.success('تم فصل الفرد من العائلة');
        },
      });
    }
  };

  if (isLoading) {
    return <LoadingState />;
  }

  // تصنيف الأفراد حسب العلاقة  
  const membersTyped = members as unknown as MemberWithBeneficiary[];
  const head = membersTyped.find(m => m.beneficiary?.is_head_of_family);
  const sons = membersTyped.filter(m => m.relationship_to_head === 'ابن');
  const daughters = membersTyped.filter(m => m.relationship_to_head === 'بنت');
  const wives = membersTyped.filter(m => m.relationship_to_head === 'زوجة');
  const others = membersTyped.filter(
    m =>
      !['ابن', 'بنت', 'زوجة'].includes(m.relationship_to_head) &&
      !m.beneficiary?.is_head_of_family
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6" />
            شجرة عائلة {familyName}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            إجمالي الأفراد: {members.length}
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 ml-2" />
              إضافة فرد
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>إضافة فرد للعائلة</DialogTitle>
              <DialogDescription>
                اختر مستفيد وحدد علاقته برب الأسرة
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="relationship">العلاقة برب الأسرة</Label>
                <Select
                  value={formData.relationship_to_head}
                  onValueChange={(value) =>
                    setFormData({ ...formData, relationship_to_head: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ابن">ابن</SelectItem>
                    <SelectItem value="بنت">بنت</SelectItem>
                    <SelectItem value="زوجة">زوجة</SelectItem>
                    <SelectItem value="حفيد">حفيد</SelectItem>
                    <SelectItem value="حفيدة">حفيدة</SelectItem>
                    <SelectItem value="أخ">أخ</SelectItem>
                    <SelectItem value="أخت">أخت</SelectItem>
                    <SelectItem value="آخر">آخر</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">مستوى الأولوية</Label>
                <Select
                  value={formData.priority_level.toString()}
                  onValueChange={(value) =>
                    setFormData({ ...formData, priority_level: parseInt(value) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">أولوية 1 (عالية)</SelectItem>
                    <SelectItem value="2">أولوية 2 (متوسطة)</SelectItem>
                    <SelectItem value="3">أولوية 3 (منخفضة)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">ملاحظات</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="ملاحظات إضافية..."
                  rows={3}
                />
              </div>

              <Button onClick={handleAddMember} className="w-full" disabled={addMember.isPending}>
                {addMember.isPending ? 'جاري الإضافة...' : 'إضافة الفرد'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* رب الأسرة */}
      {head && (
        <Card className="border-2 border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              رب الأسرة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-lg">{head.beneficiary?.full_name}</p>
                <p className="text-sm text-muted-foreground">
                  رقم الهوية: {head.beneficiary?.national_id}
                </p>
              </div>
              <Badge variant="default">رب الأسرة</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* الزوجات */}
      {wives.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              الزوجات ({wives.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {wives.map((wife) => (
                <div
                  key={wife.id}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div>
                    <p className="font-medium">{wife.beneficiary?.full_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {wife.beneficiary?.national_id}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      أولوية {wife.priority_level}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleRemoveMember(wife.id, wife.beneficiary?.full_name || '')
                      }
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* الأبناء */}
      {sons.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              الأبناء ({sons.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              {sons.map((son) => (
                <div
                  key={son.id}
                  className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{son.beneficiary?.full_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {son.beneficiary?.national_id}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      أولوية {son.priority_level}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleRemoveMember(son.id, son.beneficiary?.full_name || '')
                      }
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* البنات */}
      {daughters.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              البنات ({daughters.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              {daughters.map((daughter) => (
                <div
                  key={daughter.id}
                  className="flex items-center justify-between p-3 bg-pink-50 dark:bg-pink-950 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{daughter.beneficiary?.full_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {daughter.beneficiary?.national_id}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      أولوية {daughter.priority_level}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleRemoveMember(daughter.id, daughter.beneficiary?.full_name || '')
                      }
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* أقارب آخرون */}
      {others.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              أفراد آخرون ({others.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {others.map((other) => (
                <div
                  key={other.id}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div>
                    <p className="font-medium">{other.beneficiary?.full_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {other.relationship_to_head} - {other.beneficiary?.national_id}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      أولوية {other.priority_level}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleRemoveMember(other.id, other.beneficiary?.full_name || '')
                      }
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {membersTyped.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">لا يوجد أفراد في العائلة</h3>
            <p className="text-sm text-muted-foreground mb-4">
              ابدأ بإضافة أفراد العائلة من المستفيدين المسجلين
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <UserPlus className="h-4 w-4 ml-2" />
              إضافة أول فرد
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
