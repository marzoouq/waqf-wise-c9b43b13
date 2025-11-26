import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingState } from '@/components/shared/LoadingState';
import { EmptyState } from '@/components/shared/EmptyState';
import { Users, TrendingUp, UserPlus, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';

interface FamilyWithStats {
  id: string;
  family_name: string;
  tribe: string | null;
  total_members: number;
  stats?: {
    total_members: number;
    active_members: number;
    male_members: number;
    female_members: number;
    children_count: number;
    adults_count: number;
    average_age: number;
    total_income: number;
    verified_members: number;
  };
}

interface AdvancedFamilyManagementProps {
  familyId: string;
}

/**
 * إدارة العائلات المتقدمة - المرحلة 2
 * عرض تفصيلي لإحصائيات العائلة والعلاقات
 */
export function AdvancedFamilyManagement({ familyId }: AdvancedFamilyManagementProps) {
  const queryClient = useQueryClient();

  // جلب بيانات العائلة مع الإحصائيات
  const { data: family, isLoading } = useQuery({
    queryKey: ['family-details', familyId],
    queryFn: async () => {
      // جلب بيانات العائلة الأساسية
      const { data: familyData, error: familyError } = await supabase
        .from('families')
        .select('*')
        .eq('id', familyId)
        .single();

      if (familyError) throw familyError;

      // جلب الإحصائيات المتقدمة
      const { data: statsData } = await supabase.rpc('get_family_statistics', {
        p_family_id: familyId,
      });

      return {
        ...familyData,
        stats: statsData as any,
      } as unknown as FamilyWithStats;
    },
  });

  // جلب أفراد العائلة
  const { data: members = [] } = useQuery({
    queryKey: ['family-members', familyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('beneficiaries')
        .select('*')
        .eq('family_id', familyId)
        .order('is_head_of_family', { ascending: false })
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  // جلب العلاقات الأسرية
  const { data: relationships = [] } = useQuery({
    queryKey: ['family-relationships', familyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('family_relationships')
        .select(`
          *,
          beneficiary:beneficiaries!family_relationships_beneficiary_id_fkey(full_name),
          related_to:beneficiaries!family_relationships_related_to_id_fkey(full_name)
        `)
        .eq('family_id', familyId);

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <LoadingState />;
  }

  if (!family) {
    return <EmptyState icon={Users} title="العائلة غير موجودة" description="لم يتم العثور على العائلة المطلوبة" />;
  }

  const stats = family.stats || {
    total_members: 0,
    active_members: 0,
    male_members: 0,
    female_members: 0,
    children_count: 0,
    adults_count: 0,
    average_age: 0,
    total_income: 0,
    verified_members: 0,
  };

  return (
    <div className="space-y-6">
      {/* رأس العائلة */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {family.family_name}
          </CardTitle>
          {family.tribe && (
            <CardDescription>القبيلة: {family.tribe}</CardDescription>
          )}
        </CardHeader>
      </Card>

      {/* الإحصائيات المتقدمة */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              إجمالي الأفراد
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_members}</div>
            <p className="text-xs text-muted-foreground">
              {stats.active_members} نشط
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              التوزيع الجنسي
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>ذكور:</span>
                <span className="font-medium">{stats.male_members}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>إناث:</span>
                <span className="font-medium">{stats.female_members}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              الفئات العمرية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>أطفال:</span>
                <span className="font-medium">{stats.children_count}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>بالغون:</span>
                <span className="font-medium">{stats.adults_count}</span>
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                متوسط العمر: {stats.average_age?.toFixed(1) || 0} سنة
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              الدخل الإجمالي
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(stats.total_income || 0).toLocaleString()} ريال
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.verified_members} موثّق
            </p>
          </CardContent>
        </Card>
      </div>

      {/* التبويبات */}
      <Tabs defaultValue="members" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="members" className="gap-2">
            <Users className="h-4 w-4" />
            الأفراد ({members.length})
          </TabsTrigger>
          <TabsTrigger value="relationships" className="gap-2">
            <LinkIcon className="h-4 w-4" />
            العلاقات ({relationships.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-3">
          {members.map((member: any) => (
            <Card key={member.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{member.full_name}</p>
                      {member.is_head_of_family && (
                        <Badge variant="default">رب الأسرة</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {member.relationship && (
                        <Badge variant="outline">{member.relationship}</Badge>
                      )}
                      <span>{member.gender || '-'}</span>
                      {member.date_of_birth && (
                        <span>
                          {Math.floor(
                            (new Date().getTime() - new Date(member.date_of_birth).getTime()) /
                              (365.25 * 24 * 60 * 60 * 1000)
                          )}{' '}
                          سنة
                        </span>
                      )}
                    </div>
                  </div>
                  <Badge variant={member.status === 'نشط' ? 'default' : 'secondary'}>
                    {member.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="relationships" className="space-y-3">
          {relationships.length === 0 ? (
            <EmptyState
              icon={LinkIcon}
              title="لا توجد علاقات"
              description="لم يتم تحديد علاقات أسرية معقدة لهذه العائلة"
            />
          ) : (
            relationships.map((rel: any) => (
              <Card key={rel.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        {rel.beneficiary?.full_name} ← {rel.related_to?.full_name}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{rel.relationship_type}</Badge>
                        {rel.is_guardian && <Badge variant="default">ولي الأمر</Badge>}
                        {rel.is_dependent && <Badge variant="secondary">معال</Badge>}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
