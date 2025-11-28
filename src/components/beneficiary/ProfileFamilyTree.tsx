import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LoadingState } from '@/components/shared/LoadingState';
import { Users, User, Crown } from 'lucide-react';

interface ProfileFamilyTreeProps {
  beneficiaryId: string;
}

export function ProfileFamilyTree({ beneficiaryId }: ProfileFamilyTreeProps) {
  const { data: familyData, isLoading } = useQuery({
    queryKey: ['beneficiary-family', beneficiaryId],
    queryFn: async () => {
      // جلب بيانات المستفيد الحالي
      const { data: beneficiary, error: benError } = await supabase
        .from('beneficiaries')
        .select('id, full_name, family_name, category, relationship, is_head_of_family, gender, date_of_birth, status, number_of_sons, number_of_daughters, number_of_wives, family_size')
        .eq('id', beneficiaryId)
        .single();

      if (benError) throw benError;

      // جلب أفراد العائلة
      let familyMembers = [];
      
      if (beneficiary.family_name) {
        const { data: members, error: membersError } = await supabase
          .from('beneficiaries')
          .select('id, full_name, family_name, category, relationship, is_head_of_family, gender, date_of_birth, status')
          .eq('family_name', beneficiary.family_name)
          .neq('id', beneficiaryId)
          .order('is_head_of_family', { ascending: false });

        if (!membersError && members) {
          familyMembers = members;
        }
      }

      // جلب الأبناء المباشرين
      const { data: children, error: childrenError } = await supabase
        .from('beneficiaries')
        .select('id, full_name, family_name, category, relationship, is_head_of_family, gender, date_of_birth, status')
        .eq('parent_beneficiary_id', beneficiaryId);

      if (!childrenError && children) {
        familyMembers = [...familyMembers, ...children];
      }

      return {
        beneficiary,
        familyMembers: familyMembers.filter((m, index, self) => 
          index === self.findIndex(t => t.id === m.id)
        )
      };
    },
    staleTime: 60 * 1000,
  });

  if (isLoading) {
    return <LoadingState message="جاري تحميل شجرة العائلة..." />;
  }

  if (!familyData) return null;

  const { beneficiary, familyMembers } = familyData;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'الفئة الأولى':
        return 'bg-secondary text-secondary-foreground border-secondary/20';
      case 'الفئة الثانية':
        return 'bg-info-light text-info border-info/20';
      case 'الفئة الثالثة':
        return 'bg-accent/10 text-accent border-accent/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          شجرة العائلة
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* المستفيد الحالي */}
        <div className="mb-6 p-4 bg-primary/10 rounded-lg border-2 border-primary/20">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 ring-2 ring-primary">
              <AvatarFallback className="text-xl bg-primary/20 text-primary">
                {getInitials(beneficiary.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-bold text-foreground">
                  {beneficiary.full_name}
                </h3>
                {beneficiary.is_head_of_family && (
                  <Crown className="h-4 w-4 text-warning" />
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge className={getCategoryColor(beneficiary.category)}>
                  {beneficiary.category}
                </Badge>
                {beneficiary.relationship && (
                  <Badge variant="outline">{beneficiary.relationship}</Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* أفراد العائلة */}
        {familyMembers.length > 0 ? (
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              أفراد العائلة ({familyMembers.length})
            </h4>
            
            <div className="grid gap-3">
              {familyMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors"
                >
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials(member.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-foreground">
                        {member.full_name}
                      </h4>
                      {member.is_head_of_family && (
                        <Crown className="h-3 w-3 text-warning" />
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 text-sm">
                      <Badge variant="outline" className="text-xs">
                        {member.relationship || 'فرد من العائلة'}
                      </Badge>
                      <Badge className={`text-xs ${getCategoryColor(member.category)}`}>
                        {member.category}
                      </Badge>
                      {member.gender && (
                        <span className="text-muted-foreground">
                          {member.gender}
                        </span>
                      )}
                      {member.date_of_birth && (
                        <span className="text-muted-foreground">
                          {new Date().getFullYear() - new Date(member.date_of_birth).getFullYear()} سنة
                        </span>
                      )}
                    </div>
                  </div>

                  <Badge variant={member.status === 'نشط' ? 'default' : 'secondary'}>
                    {member.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">لا يوجد أفراد عائلة مسجلين</p>
          </div>
        )}

        {/* إحصائيات العائلة */}
        {beneficiary.family_name && (
          <div className="mt-6 pt-6 border-t border-border">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {beneficiary.number_of_sons || 0}
                </p>
                <p className="text-sm text-muted-foreground">أبناء</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {beneficiary.number_of_daughters || 0}
                </p>
                <p className="text-sm text-muted-foreground">بنات</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {beneficiary.number_of_wives || 0}
                </p>
                <p className="text-sm text-muted-foreground">زوجات</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {beneficiary.family_size || 0}
                </p>
                <p className="text-sm text-muted-foreground">حجم العائلة</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
