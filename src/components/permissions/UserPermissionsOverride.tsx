import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
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
import { Permission } from "@/hooks/usePermissions";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface UserPermissionsOverrideProps {
  userId: string;
  userName: string;
}

export function UserPermissionsOverride({ userId, userName }: UserPermissionsOverrideProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);
  const [overrideNotes, setOverrideNotes] = useState("");
  const [grantPermission, setGrantPermission] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch all permissions
  const { data: allPermissions = [] } = useQuery({
    queryKey: ["all-permissions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("permissions")
        .select("*")
        .order("category", { ascending: true })
        .order("name", { ascending: true });
      
      if (error) throw error;
      return data as Permission[];
    },
  });

  // Fetch user's permission overrides
  const { data: userOverrides = [], isLoading } = useQuery({
    queryKey: ["user-permissions-overrides", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_permissions")
        .select(`
          *,
          permissions (
            id,
            name,
            category,
            description
          )
        `)
        .eq("user_id", userId);
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  // Add permission override mutation
  const addOverrideMutation = useMutation({
    mutationFn: async ({ permissionId, granted, notes }: { permissionId: string; granted: boolean; notes: string }) => {
      const { error } = await supabase
        .from("user_permissions")
        .upsert({
          user_id: userId,
          permission_id: permissionId,
          granted,
          notes,
          granted_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,permission_id'
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-permissions-overrides"] });
      queryClient.invalidateQueries({ queryKey: ["user-permissions"] });
      toast({
        title: "تم الحفظ",
        description: "تم إضافة استثناء الصلاحية بنجاح",
      });
      setIsDialogOpen(false);
      setSelectedPermission(null);
      setOverrideNotes("");
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "فشل إضافة استثناء الصلاحية",
        variant: "destructive",
      });
    },
  });

  // Remove permission override mutation
  const removeOverrideMutation = useMutation({
    mutationFn: async (permissionId: string) => {
      const { error } = await supabase
        .from("user_permissions")
        .delete()
        .eq("user_id", userId)
        .eq("permission_id", permissionId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-permissions-overrides"] });
      queryClient.invalidateQueries({ queryKey: ["user-permissions"] });
      toast({
        title: "تم الحذف",
        description: "تم إزالة استثناء الصلاحية بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "فشل إزالة استثناء الصلاحية",
        variant: "destructive",
      });
    },
  });

  const handleAddOverride = async () => {
    if (!selectedPermission) return;
    
    await addOverrideMutation.mutateAsync({
      permissionId: selectedPermission.id,
      granted: grantPermission,
      notes: overrideNotes
    });
  };

  const handleRemoveOverride = async (permissionId: string) => {
    await removeOverrideMutation.mutateAsync(permissionId);
  };

  const filteredPermissions = allPermissions.filter(perm =>
    perm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    perm.description?.toLowerCase().includes(searchQuery.toLowerCase())
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
                            key={perm.id}
                            className={selectedPermission?.id === perm.id ? "bg-muted" : ""}
                          >
                            <TableCell className="font-mono text-xs">
                              {perm.name}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {perm.description || "-"}
                            </TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant={selectedPermission?.id === perm.id ? "default" : "outline"}
                                onClick={() => setSelectedPermission(perm)}
                              >
                                {selectedPermission?.id === perm.id ? "مختار" : "اختيار"}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {selectedPermission && (
                    <>
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

                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          ملاحظات (اختياري)
                        </label>
                        <Textarea
                          placeholder="سبب إضافة هذا الاستثناء..."
                          value={overrideNotes}
                          onChange={(e) => setOverrideNotes(e.target.value)}
                          rows={3}
                        />
                      </div>
                    </>
                  )}
                </div>

                <DialogFooter>
                  <Button
                    onClick={handleAddOverride}
                    disabled={!selectedPermission || addOverrideMutation.isPending}
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
              {userOverrides.map((override: any) => (
                <div
                  key={override.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-mono text-sm font-medium">
                        {override.permissions?.name}
                      </p>
                      <Badge variant={override.granted ? "default" : "destructive"}>
                        {override.granted ? "سماح" : "رفض"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {override.permissions?.description || "لا يوجد وصف"}
                    </p>
                    {override.notes && (
                      <p className="text-xs text-muted-foreground mt-2 italic">
                        ملاحظات: {override.notes}
                      </p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemoveOverride(override.permission_id)}
                    disabled={removeOverrideMutation.isPending}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
