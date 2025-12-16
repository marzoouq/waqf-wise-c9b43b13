import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/ui/use-toast";
import { Search, Save, X, UserPlus, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useUserPermissionsOverride } from "@/hooks/permissions/useUserPermissionsOverride";

interface UserPermissionsOverrideProps {
  userId: string;
  userName: string;
}

// قائمة الصلاحيات المتاحة في النظام
const AVAILABLE_PERMISSIONS = [
  { key: 'users.manage', name: 'إدارة المستخدمين', description: 'إنشاء وتعديل وحذف المستخدمين', category: 'المستخدمون' },
  { key: 'settings.manage', name: 'إدارة الإعدادات', description: 'تعديل إعدادات النظام', category: 'الإعدادات' },
  { key: 'reports.view', name: 'عرض التقارير', description: 'الوصول للتقارير المالية والإدارية', category: 'التقارير' },
  { key: 'beneficiaries.manage', name: 'إدارة المستفيدين', description: 'إضافة وتعديل بيانات المستفيدين', category: 'المستفيدون' },
  { key: 'beneficiaries.view', name: 'عرض المستفيدين', description: 'الاطلاع على بيانات المستفيدين', category: 'المستفيدون' },
  { key: 'properties.manage', name: 'إدارة العقارات', description: 'إضافة وتعديل العقارات', category: 'العقارات' },
  { key: 'funds.manage', name: 'إدارة الصناديق', description: 'إدارة صناديق الوقف', category: 'المالية' },
  { key: 'accounting.manage', name: 'إدارة المحاسبة', description: 'الوصول الكامل للنظام المحاسبي', category: 'المالية' },
  { key: 'journal_entries.create', name: 'إنشاء قيود محاسبية', description: 'تسجيل القيود المحاسبية', category: 'المالية' },
  { key: 'bank_accounts.view', name: 'عرض الحسابات البنكية', description: 'الاطلاع على الحسابات البنكية', category: 'المالية' },
  { key: 'payments.execute', name: 'تنفيذ المدفوعات', description: 'صرف المستحقات', category: 'المالية' },
  { key: 'vouchers.create', name: 'إنشاء السندات', description: 'إنشاء سندات الصرف والقبض', category: 'المالية' },
  { key: 'documents.manage', name: 'إدارة المستندات', description: 'رفع وتعديل المستندات', category: 'الأرشيف' },
  { key: 'archive.manage', name: 'إدارة الأرشيف', description: 'إدارة نظام الأرشيف', category: 'الأرشيف' },
  { key: 'documents.upload', name: 'رفع المستندات', description: 'رفع مستندات جديدة', category: 'الأرشيف' },
  { key: 'profile.view', name: 'عرض الملف الشخصي', description: 'الاطلاع على الملف الشخصي', category: 'الملف الشخصي' },
  { key: 'requests.submit', name: 'تقديم الطلبات', description: 'تقديم طلبات جديدة', category: 'الطلبات' },
];

export function UserPermissionsOverride({ userId, userName }: UserPermissionsOverrideProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPermission, setSelectedPermission] = useState<typeof AVAILABLE_PERMISSIONS[0] | null>(null);
  const [overrideNotes, setOverrideNotes] = useState("");
  const [grantPermission, setGrantPermission] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { 
    userOverrides, 
    isLoading, 
    addOverride, 
    removeOverride, 
    isAdding, 
    isRemoving 
  } = useUserPermissionsOverride(userId);

  const handleAddOverride = async () => {
    if (!selectedPermission) return;
    
    try {
      await addOverride({
        permissionKey: selectedPermission.key,
        granted: grantPermission,
      });
      toast({
        title: "تم الحفظ",
        description: "تم إضافة استثناء الصلاحية بنجاح",
      });
      setIsDialogOpen(false);
      setSelectedPermission(null);
      setOverrideNotes("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "فشل إضافة استثناء الصلاحية";
      toast({
        title: "خطأ",
        description: message,
        variant: "destructive",
      });
    }
  };

  const handleRemoveOverride = async (permissionKey: string) => {
    try {
      await removeOverride(permissionKey);
      toast({
        title: "تم الحذف",
        description: "تم إزالة استثناء الصلاحية بنجاح",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "فشل إزالة استثناء الصلاحية";
      toast({
        title: "خطأ",
        description: message,
        variant: "destructive",
      });
    }
  };

  const filteredPermissions = AVAILABLE_PERMISSIONS.filter(perm =>
    perm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    perm.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    perm.key.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const hasOverrides = userOverrides.length > 0;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>استثناءات صلاحيات المستخدم</CardTitle>
              <CardDescription>
                إدارة صلاحيات خاصة لـ {userName}
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <UserPlus className="h-4 w-4" />
                  إضافة استثناء
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>إضافة استثناء صلاحية</DialogTitle>
                  <DialogDescription>
                    اختر صلاحية وحدد ما إذا كنت تريد منحها أو منعها
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="بحث عن صلاحية..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pr-10"
                    />
                  </div>

                  <div className="max-h-[300px] overflow-y-auto border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>الصلاحية</TableHead>
                          <TableHead>الوصف</TableHead>
                          <TableHead className="w-[100px]">اختيار</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredPermissions.map((perm) => (
                          <TableRow
                            key={perm.key}
                            className={selectedPermission?.key === perm.key ? "bg-muted" : ""}
                          >
                            <TableCell>
                              <div>
                                <p className="font-medium text-sm">{perm.name}</p>
                                <p className="font-mono text-xs text-muted-foreground">{perm.key}</p>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {perm.description}
                            </TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant={selectedPermission?.key === perm.key ? "default" : "outline"}
                                onClick={() => setSelectedPermission(perm)}
                              >
                                {selectedPermission?.key === perm.key ? "مختار" : "اختيار"}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {selectedPermission && (
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium">
                          {grantPermission ? "منح الصلاحية" : "منع الصلاحية"}
                        </span>
                        <Switch
                          checked={grantPermission}
                          onCheckedChange={setGrantPermission}
                        />
                      </div>
                      <Badge variant={grantPermission ? "default" : "destructive"}>
                        {grantPermission ? "سماح" : "رفض"}
                      </Badge>
                    </div>
                  )}
                </div>

                <DialogFooter>
                  <Button
                    onClick={handleAddOverride}
                    disabled={!selectedPermission || isAdding}
                    className="gap-2"
                  >
                    <Save className="h-4 w-4" />
                    حفظ الاستثناء
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {!hasOverrides ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                لا توجد استثناءات صلاحيات لهذا المستخدم. الصلاحيات الحالية مستمدة من الدور فقط.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-2">
              {userOverrides.map((override) => {
                const permInfo = AVAILABLE_PERMISSIONS.find(p => p.key === override.permission_key);
                return (
                  <div
                    key={override.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium">
                          {permInfo?.name || override.permission_key}
                        </p>
                        <Badge variant={override.granted ? "default" : "destructive"}>
                          {override.granted ? "سماح" : "رفض"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground font-mono">
                        {override.permission_key}
                      </p>
                      {permInfo?.description && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {permInfo.description}
                        </p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveOverride(override.permission_key)}
                      disabled={isRemoving}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
