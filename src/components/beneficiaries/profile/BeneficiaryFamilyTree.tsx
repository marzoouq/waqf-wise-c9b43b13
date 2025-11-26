import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { LoadingState } from '@/components/shared/LoadingState';
import { EmptyState } from '@/components/shared/EmptyState';
import { Users, User, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FamilyMember {
  id: string;
  full_name: string;
  relationship: string | null;
  gender: string | null;
  status: string;
  is_head_of_family: boolean | null;
}

interface BeneficiaryFamilyTreeProps {
  beneficiaryId: string;
  familyId: string | null;
}

/**
 * شجرة عائلة المستفيد - المرحلة 2
 */
export function BeneficiaryFamilyTree({ beneficiaryId, familyId }: BeneficiaryFamilyTreeProps) {
  const { data: familyMembers = [], isLoading } = useQuery({
    queryKey: ['family-members', familyId],
    queryFn: async () => {
      if (!familyId) return [];
      
      const { data, error } = await supabase
        .from('beneficiaries')
        .select('id, full_name, relationship, gender, status, is_head_of_family')
        .eq('family_id', familyId)
        .order('is_head_of_family', { ascending: false })
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as FamilyMember[];
    },
    enabled: !!familyId,
  });

  if (isLoading) {
    return <LoadingState />;
  }

  if (!familyId || familyMembers.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="لا توجد عائلة"
        description="لم يتم ربط المستفيد بأي عائلة"
      />
    );
  }

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    return parts.length >= 2 
      ? `${parts[0][0]}${parts[1][0]}`
      : name.substring(0, 2);
  };

  const getRelationshipColor = (relationship: string | null) => {
    if (!relationship) return 'default';
    if (relationship.includes('ابن')) return 'default';
    if (relationship.includes('بنت')) return 'secondary';
    if (relationship.includes('زوج')) return 'outline';
    return 'default';
  };

  const headOfFamily = familyMembers.find(m => m.is_head_of_family);
  const otherMembers = familyMembers.filter(m => !m.is_head_of_family);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          شجرة العائلة
        </CardTitle>
        <CardDescription>
          أفراد العائلة ({familyMembers.length} فرد)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* رب الأسرة */}
        {headOfFamily && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Crown className="h-4 w-4" />
              رب الأسرة
            </div>
            <div className={cn(
              "flex items-center gap-4 p-4 rounded-lg border-2",
              headOfFamily.id === beneficiaryId ? "border-primary bg-primary/5" : "border-border"
            )}>
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-primary/20">
                  {getInitials(headOfFamily.full_name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium">{headOfFamily.full_name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    <Crown className="h-3 w-3 ml-1" />
                    رب الأسرة
                  </Badge>
                  <Badge variant={headOfFamily.status === 'نشط' ? 'default' : 'secondary'} className="text-xs">
                    {headOfFamily.status}
                  </Badge>
                </div>
              </div>
              {headOfFamily.id === beneficiaryId && (
                <Badge variant="default">الملف الحالي</Badge>
              )}
            </div>
          </div>
        )}

        {/* باقي أفراد العائلة */}
        {otherMembers.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Users className="h-4 w-4" />
              أفراد العائلة ({otherMembers.length})
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {otherMembers.map((member) => (
                <div
                  key={member.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border",
                    member.id === beneficiaryId 
                      ? "border-primary bg-primary/5" 
                      : "border-border hover:bg-accent/50 transition-colors"
                  )}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className={cn(
                      member.gender === 'ذكر' ? 'bg-blue-100 dark:bg-blue-950' : 'bg-pink-100 dark:bg-pink-950'
                    )}>
                      {getInitials(member.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{member.full_name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {member.relationship && (
                        <Badge variant={getRelationshipColor(member.relationship)} className="text-xs">
                          {member.relationship}
                        </Badge>
                      )}
                      {member.id === beneficiaryId && (
                        <Badge variant="default" className="text-xs">الحالي</Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
