import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { Users, User, Crown } from 'lucide-react';
import { useFamilyTree } from '@/hooks/beneficiary/useBeneficiaryProfileData';
import { matchesStatus } from '@/lib/constants';

interface ProfileFamilyTreeProps {
  beneficiaryId: string;
}

export function ProfileFamilyTree({ beneficiaryId }: ProfileFamilyTreeProps) {
  const { data: familyMembers = [], isLoading, error, refetch } = useFamilyTree(beneficiaryId);

  if (isLoading) {
    return <LoadingState message="جاري تحميل شجرة العائلة..." />;
  }

  if (error) {
    return <ErrorState title="خطأ في التحميل" message="فشل تحميل شجرة العائلة" onRetry={refetch} />;
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  // حساب العمر بكفاءة (new Date() مرة واحدة)
  const calculateAge = (dateOfBirth: string): number => {
    const currentYear = new Date().getFullYear();
    const birthYear = new Date(dateOfBirth).getFullYear();
    return currentYear - birthYear;
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
                          {calculateAge(member.date_of_birth)} سنة
                        </span>
                      )}
                    </div>
                  </div>

                  <Badge variant={matchesStatus(member.status, 'active') ? 'default' : 'secondary'}>
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
      </CardContent>
    </Card>
  );
}
