import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Users, Plus, Loader2, User } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Family {
  id: string;
  family_name: string;
  head_of_family_id: string | null;
  tribe: string | null;
  total_members: number;
  total_sons: number;
  total_daughters: number;
  total_wives: number;
  status: string;
  notes: string | null;
  created_at: string;
}

/**
 * مكون إدارة العائلات
 * يدير ربط المستفيدين بعائلاتهم وعرض إحصائيات العائلة
 */
export function FamilyManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newFamily, setNewFamily] = useState({
    family_name: '',
    tribe: '',
    notes: '',
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // جلب جميع العائلات
  const { data: families = [], isLoading } = useQuery({
    queryKey: ['families'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('families')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(f => ({
        ...f,
        total_sons: f.total_members || 0,
        total_daughters: 0,
        total_wives: 0,
      })) as Family[];
    },
  });

  // إنشاء عائلة جديدة
  const createFamilyMutation = useMutation({
    mutationFn: async (familyData: typeof newFamily) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('families')
        .insert({
          ...familyData,
          created_by: user?.id,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['families'] });
      setIsDialogOpen(false);
      setNewFamily({ family_name: '', tribe: '', notes: '' });
      toast({
        title: 'تم إنشاء العائلة',
        description: 'تم إنشاء العائلة بنجاح',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ',
        description: error.message || 'فشل إنشاء العائلة',
        variant: 'destructive',
      });
    },
  });

  const handleCreateFamily = () => {
    if (!newFamily.family_name.trim()) {
      toast({
        title: 'تنبيه',
        description: 'يرجى إدخال اسم العائلة',
        variant: 'destructive',
      });
      return;
    }
    createFamilyMutation.mutate(newFamily);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Users className="h-6 w-6" />
          إدارة العائلات
        </h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 ml-2" />
              إضافة عائلة
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>إضافة عائلة جديدة</DialogTitle>
              <DialogDescription>
                أدخل معلومات العائلة الجديدة
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="family_name">اسم العائلة</Label>
                <Input
                  id="family_name"
                  value={newFamily.family_name}
                  onChange={(e) => setNewFamily({ ...newFamily, family_name: e.target.value })}
                  placeholder="عائلة..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tribe">القبيلة</Label>
                <Input
                  id="tribe"
                  value={newFamily.tribe}
                  onChange={(e) => setNewFamily({ ...newFamily, tribe: e.target.value })}
                  placeholder="اسم القبيلة"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">ملاحظات</Label>
                <Textarea
                  id="notes"
                  value={newFamily.notes}
                  onChange={(e) => setNewFamily({ ...newFamily, notes: e.target.value })}
                  placeholder="ملاحظات إضافية..."
                  rows={3}
                />
              </div>
              <Button
                onClick={handleCreateFamily}
                disabled={createFamilyMutation.isPending}
                className="w-full"
              >
                {createFamilyMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin ml-2" />
                ) : (
                  <Plus className="h-4 w-4 ml-2" />
                )}
                إنشاء العائلة
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* قائمة العائلات */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {families.map((family) => (
          <Card key={family.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{family.family_name}</span>
                <Badge variant="secondary">
                  <User className="h-3 w-3 ml-1" />
                  {family.total_members}
                </Badge>
              </CardTitle>
              {family.tribe && (
                <CardDescription>القبيلة: {family.tribe}</CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="text-center p-2 bg-blue-50 dark:bg-blue-950 rounded">
                  <p className="font-medium">{family.total_sons}</p>
                  <p className="text-xs text-muted-foreground">أبناء</p>
                </div>
                <div className="text-center p-2 bg-pink-50 dark:bg-pink-950 rounded">
                  <p className="font-medium">{family.total_daughters}</p>
                  <p className="text-xs text-muted-foreground">بنات</p>
                </div>
                <div className="text-center p-2 bg-purple-50 dark:bg-purple-950 rounded">
                  <p className="font-medium">{family.total_wives}</p>
                  <p className="text-xs text-muted-foreground">زوجات</p>
                </div>
              </div>
              {family.notes && (
                <p className="text-xs text-muted-foreground mt-2">{family.notes}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {families.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">لا توجد عائلات</h3>
            <p className="text-sm text-muted-foreground mb-4">
              ابدأ بإضافة عائلة جديدة للمستفيدين
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 ml-2" />
              إضافة أول عائلة
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}