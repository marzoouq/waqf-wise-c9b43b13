/**
 * صفحة سياسات الحوكمة
 * @version 1.0.0
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { ScrollText, FileText, Plus, Trash2, Edit, CheckCircle, Clock, XCircle } from "lucide-react";
import { MobileOptimizedLayout } from "@/components/layout/MobileOptimizedLayout";
import { UnifiedStatsGrid } from "@/components/unified/UnifiedStatsGrid";
import { UnifiedKPICard } from "@/components/unified/UnifiedKPICard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGovernancePolicies, usePoliciesStats, useCreatePolicy, useDeletePolicy, useAvailableCategories } from "@/hooks/governance/useGovernancePolicies";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import type { Database } from "@/integrations/supabase/types";

type PolicyInsert = Database['public']['Tables']['governance_policies']['Insert'];

const GovernancePolicies = () => {
  const { data: policies, isLoading: policiesLoading } = useGovernancePolicies();
  const { data: stats, isLoading: statsLoading } = usePoliciesStats();
  const createPolicy = useCreatePolicy();
  const deletePolicy = useDeletePolicy();
  const categories = useAvailableCategories();
  
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const [newPolicy, setNewPolicy] = useState<Partial<PolicyInsert>>({
    policy_name_ar: '',
    category: 'توزيع',
    description: '',
    status: 'active',
    policy_type: 'distribution',
    version: 1,
  });

  const handleCreatePolicy = async () => {
    if (!newPolicy.policy_name_ar || !newPolicy.category) return;
    
    const policyCode = `POL-${Date.now().toString().slice(-6)}`;
    
    await createPolicy.mutateAsync({
      policy_name_ar: newPolicy.policy_name_ar,
      policy_code: policyCode,
      category: newPolicy.category,
      description: newPolicy.description || '',
      status: newPolicy.status || 'active',
      policy_type: newPolicy.policy_type || 'distribution',
      version: 1,
      effective_date: new Date().toISOString().split('T')[0],
    });
    
    setCreateDialogOpen(false);
    setNewPolicy({
      policy_name_ar: '',
      category: 'توزيع',
      description: '',
      status: 'active',
      policy_type: 'distribution',
      version: 1,
    });
  };

  const handleDeletePolicy = async (id: string) => {
    await deletePolicy.mutateAsync(id);
  };

  const filteredPolicies = policies?.filter(policy => 
    selectedCategory === 'all' || policy.category === selectedCategory
  ) || [];

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="gap-1"><CheckCircle className="h-3 w-3" /> نشط</Badge>;
      case 'draft':
        return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" /> مسودة</Badge>;
      case 'archived':
        return <Badge variant="outline" className="gap-1"><XCircle className="h-3 w-3" /> مؤرشف</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getCategoryColor = (category: string | null) => {
    switch (category) {
      case 'توزيع':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'صيانة':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'حوكمة':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'استثمار':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
      case 'إدارية':
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200';
      case 'قانونية':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <MobileOptimizedLayout>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">سياسات الحوكمة</h1>
            <p className="text-sm text-muted-foreground mt-1">إدارة سياسات ولوائح الوقف</p>
          </div>
          
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="w-full sm:w-auto gap-2">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">إضافة سياسة جديدة</span>
                <span className="sm:hidden">إضافة سياسة</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>إضافة سياسة جديدة</DialogTitle>
                <DialogDescription>أدخل بيانات السياسة الجديدة</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="policy_name">اسم السياسة *</Label>
                  <Input
                    id="policy_name"
                    value={newPolicy.policy_name_ar || ''}
                    onChange={(e) => setNewPolicy({ ...newPolicy, policy_name_ar: e.target.value })}
                    placeholder="مثال: سياسة التوزيع العادل"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">الفئة *</Label>
                    <Select
                      value={newPolicy.category || 'توزيع'}
                      onValueChange={(value) => setNewPolicy({ ...newPolicy, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">الحالة</Label>
                    <Select
                      value={newPolicy.status || 'active'}
                      onValueChange={(value) => setNewPolicy({ ...newPolicy, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">نشط</SelectItem>
                        <SelectItem value="draft">مسودة</SelectItem>
                        <SelectItem value="archived">مؤرشف</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">الوصف</Label>
                  <Textarea
                    id="description"
                    value={newPolicy.description || ''}
                    onChange={(e) => setNewPolicy({ ...newPolicy, description: e.target.value })}
                    placeholder="وصف مختصر للسياسة..."
                    rows={3}
                  />
                </div>
                <Button 
                  onClick={handleCreatePolicy} 
                  className="w-full"
                  disabled={!newPolicy.policy_name_ar || !newPolicy.category || createPolicy.isPending}
                >
                  {createPolicy.isPending ? 'جاري الإضافة...' : 'إضافة السياسة'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <UnifiedStatsGrid>
          <UnifiedKPICard
            title="إجمالي السياسات"
            value={statsLoading ? '-' : (stats?.totalPolicies || 0)}
            icon={ScrollText}
          />
          <UnifiedKPICard
            title="السياسات النشطة"
            value={statsLoading ? '-' : (stats?.activePolicies || 0)}
            icon={CheckCircle}
            variant="success"
          />
          <UnifiedKPICard
            title="عدد الفئات"
            value={statsLoading ? '-' : (stats?.categories?.length || 0)}
            icon={FileText}
            variant="info"
          />
        </UnifiedStatsGrid>

        {/* Category Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>قائمة السياسات</CardTitle>
            <CardDescription>جميع سياسات الحوكمة المسجلة في النظام</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-4">
              <TabsList className="flex-wrap h-auto gap-1">
                <TabsTrigger value="all">الكل</TabsTrigger>
                {categories.map((cat) => (
                  <TabsTrigger key={cat} value={cat}>{cat}</TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            {policiesLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : filteredPolicies.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>رمز السياسة</TableHead>
                    <TableHead>اسم السياسة</TableHead>
                    <TableHead>الفئة</TableHead>
                    <TableHead>الوصف</TableHead>
                    <TableHead>الإصدار</TableHead>
                    <TableHead>تاريخ السريان</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPolicies.map((policy) => (
                    <TableRow key={policy.id}>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          {policy.policy_code}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{policy.policy_name_ar}</TableCell>
                      <TableCell>
                        <Badge className={getCategoryColor(policy.category)}>
                          {policy.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-muted-foreground">
                        {policy.description || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">v{policy.version}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {policy.effective_date 
                          ? format(new Date(policy.effective_date), 'dd MMM yyyy', { locale: ar })
                          : '-'
                        }
                      </TableCell>
                      <TableCell>{getStatusBadge(policy.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" title="حذف">
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                                <AlertDialogDescription>
                                  هل أنت متأكد من حذف السياسة "{policy.policy_name_ar}"؟
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeletePolicy(policy.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  حذف
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <ScrollText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>لا توجد سياسات في هذه الفئة</p>
                <Button variant="link" onClick={() => setCreateDialogOpen(true)}>
                  إضافة سياسة جديدة
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Categories Overview */}
        {stats?.categories && stats.categories.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>توزيع السياسات حسب الفئة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                {stats.categories.map(({ category, count }) => (
                  <div
                    key={category}
                    className="p-4 rounded-lg border bg-card text-center hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedCategory(category)}
                  >
                    <Badge className={`${getCategoryColor(category)} mb-2`}>
                      {category}
                    </Badge>
                    <p className="text-2xl font-bold">{count}</p>
                    <p className="text-xs text-muted-foreground">سياسة</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </MobileOptimizedLayout>
  );
};

export default GovernancePolicies;
