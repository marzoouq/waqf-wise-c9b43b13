import { useState } from "react";
import { Database } from "@/integrations/supabase/types";
import { ResponsiveDialog } from "@/components/shared/ResponsiveDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Pencil, Trash2, Shield } from "lucide-react";
import { useTribes, useAddTribe, useUpdateTribe, useDeleteTribe } from "@/hooks/beneficiary/useTribes";
import { LoadingState } from "@/components/shared/LoadingState";
import { EmptyState } from "@/components/shared/EmptyState";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface TribeManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TribeManagementDialog = ({
  open,
  onOpenChange,
}: TribeManagementDialogProps) => {
  const { data: tribes, isLoading } = useTribes();
  const addTribe = useAddTribe();
  const updateTribe = useUpdateTribe();
  const deleteTribe = useDeleteTribe();

  const [editMode, setEditMode] = useState<"add" | "edit" | null>(null);
  const [selectedTribeId, setSelectedTribeId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tribeToDelete, setTribeToDelete] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!formData.name.trim()) return;

    if (editMode === "add") {
      await addTribe.mutateAsync(formData);
    } else if (editMode === "edit" && selectedTribeId) {
      await updateTribe.mutateAsync({ id: selectedTribeId, ...formData });
    }

    setEditMode(null);
    setFormData({ name: "", description: "" });
    setSelectedTribeId(null);
  };

  const handleEdit = (tribe: Database['public']['Tables']['tribes']['Row']) => {
    setEditMode("edit");
    setSelectedTribeId(tribe.id);
    setFormData({
      name: tribe.name,
      description: tribe.description || "",
    });
  };

  const handleDeleteConfirm = async () => {
    if (tribeToDelete) {
      await deleteTribe.mutateAsync(tribeToDelete);
      setDeleteDialogOpen(false);
      setTribeToDelete(null);
    }
  };

  return (
    <>
      <ResponsiveDialog
        open={open}
        onOpenChange={onOpenChange}
        title="إدارة القبائل"
        description="إضافة وتعديل قائمة القبائل في النظام"
        size="xl"
      >
        <div className="space-y-4">
            {/* Add/Edit Form */}
            {editMode && (
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <h3 className="font-medium">
                  {editMode === "add" ? "إضافة قبيلة جديدة" : "تعديل القبيلة"}
                </h3>
                <div className="space-y-3">
                  <div>
                    <Label>اسم القبيلة *</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="مثال: قبيلة عتيبة"
                    />
                  </div>
                  <div>
                    <Label>الوصف</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      placeholder="وصف موجز عن القبيلة..."
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSubmit} className="flex-1">
                      {editMode === "add" ? "إضافة" : "حفظ التعديلات"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditMode(null);
                        setFormData({ name: "", description: "" });
                        setSelectedTribeId(null);
                      }}
                      className="flex-1"
                    >
                      إلغاء
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Add Button */}
            {!editMode && (
              <Button
                onClick={() => setEditMode("add")}
                className="w-full"
                variant="outline"
              >
                <Plus className="h-4 w-4 ms-2" />
                إضافة قبيلة جديدة
              </Button>
            )}

            {/* Tribes List */}
            {isLoading ? (
              <LoadingState message="جاري تحميل القبائل..." />
            ) : !tribes || tribes.length === 0 ? (
              <EmptyState
                icon={Users}
                title="لا توجد قبائل"
                description="لم يتم إضافة أي قبائل بعد"
              />
            ) : (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>اسم القبيلة</TableHead>
                      <TableHead>الوصف</TableHead>
                      <TableHead className="text-center">العائلات</TableHead>
                      <TableHead className="text-center">المستفيدون</TableHead>
                      <TableHead className="text-left">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tribes.map((tribe) => (
                      <TableRow key={tribe.id}>
                        <TableCell className="font-medium">
                          {tribe.name}
                        </TableCell>
                        <TableCell className="max-w-md truncate">
                          {tribe.description || "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary">
                            {tribe.total_families}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary">
                            {tribe.total_beneficiaries}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-left">
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(tribe)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setTribeToDelete(tribe.id);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              إغلاق
            </Button>
          </div>
      </ResponsiveDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف القبيلة بشكل نهائي. لن يؤثر ذلك على العائلات والمستفيدين
              المرتبطين بها.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive hover:bg-destructive/90"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
