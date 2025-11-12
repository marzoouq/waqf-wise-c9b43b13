import { useState } from 'react';
import { Plus, Users, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useFamilies } from '@/hooks/useFamilies';
import { LoadingState } from '@/components/shared/LoadingState';
import { EmptyState } from '@/components/shared/EmptyState';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const Families = () => {
  const { families, isLoading } = useFamilies();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFamilies = families.filter(family =>
    family.family_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    family.tribe?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return <LoadingState size="lg" />;
  }

  return (
    <div className="space-y-6 p-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">إدارة العائلات</h1>
          <p className="text-muted-foreground mt-2">
            عرض وإدارة العائلات المستفيدة من الوقف
          </p>
        </div>
        <Button size="lg">
          <Plus className="ml-2 h-5 w-5" />
          إضافة عائلة جديدة
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              إجمالي العائلات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{families.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              العائلات النشطة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {families.filter(f => f.status === 'نشط').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              إجمالي الأفراد
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {families.reduce((sum, f) => sum + f.total_members, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>البحث والتصفية</CardTitle>
          <CardDescription>ابحث عن عائلة بالاسم أو القبيلة</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="ابحث عن عائلة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Families Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة العائلات</CardTitle>
          <CardDescription>
            عرض جميع العائلات المسجلة ({filteredFamilies.length})
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredFamilies.length === 0 ? (
            <EmptyState
              icon={Users}
              title="لا توجد عائلات"
              description={
                searchQuery
                  ? 'لا توجد نتائج مطابقة لبحثك'
                  : 'لم يتم إضافة أي عائلات بعد'
              }
            />
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">اسم العائلة</TableHead>
                    <TableHead className="text-right">رب الأسرة</TableHead>
                    <TableHead className="text-right">القبيلة</TableHead>
                    <TableHead className="text-right">عدد الأفراد</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="text-right">تاريخ التسجيل</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFamilies.map((family) => (
                    <TableRow key={family.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell className="font-medium">{family.family_name}</TableCell>
                      <TableCell>
                        {(family as any).head_of_family?.full_name || '-'}
                      </TableCell>
                      <TableCell>{family.tribe || '-'}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {family.total_members} أفراد
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={family.status === 'نشط' ? 'default' : 'secondary'}
                        >
                          {family.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(family.created_at).toLocaleDateString('ar-SA')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Families;
