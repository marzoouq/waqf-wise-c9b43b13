import { useState } from "react";
import { useFamilies } from "@/hooks/useFamilies";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2, Users } from "lucide-react";
import { toast } from "sonner";

export function FamilyManagement() {
  const { families, isLoading, addFamily, updateFamily, deleteFamily } = useFamilies();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedFamily, setSelectedFamily] = useState<any>(null);
  const [formData, setFormData] = useState({
    family_name: "",
    tribe: "",
    notes: "",
  });

  const handleAddFamily = async () => {
    try {
      await addFamily.mutateAsync({
        family_name: formData.family_name,
        tribe: formData.tribe,
        notes: formData.notes,
        head_of_family_id: null,
        status: "نشط",
      });
      setIsAddDialogOpen(false);
      setFormData({ family_name: "", tribe: "", notes: "" });
    } catch (error) {
      console.error("Error adding family:", error);
    }
  };

  const handleEditFamily = async () => {
    if (!selectedFamily) return;
    try {
      await updateFamily.mutateAsync({
        id: selectedFamily.id,
        updates: {
          family_name: formData.family_name,
          tribe: formData.tribe,
          notes: formData.notes,
        },
      });
      setIsEditDialogOpen(false);
      setSelectedFamily(null);
      setFormData({ family_name: "", tribe: "", notes: "" });
    } catch (error) {
      console.error("Error updating family:", error);
    }
  };

  const handleDeleteFamily = async (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذه العائلة؟")) {
      try {
        await deleteFamily.mutateAsync(id);
      } catch (error) {
        console.error("Error deleting family:", error);
      }
    }
  };

  const openEditDialog = (family: any) => {
    setSelectedFamily(family);
    setFormData({
      family_name: family.family_name,
      tribe: family.tribe || "",
      notes: family.notes || "",
    });
    setIsEditDialogOpen(true);
  };

  if (isLoading) {
    return <div className="text-center py-8">جاري التحميل...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          <h2 className="text-2xl font-bold">إدارة العائلات</h2>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="ml-2 h-4 w-4" />
              إضافة عائلة
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>إضافة عائلة جديدة</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="family_name">اسم العائلة *</Label>
                <Input
                  id="family_name"
                  value={formData.family_name}
                  onChange={(e) =>
                    setFormData({ ...formData, family_name: e.target.value })
                  }
                  placeholder="اسم العائلة"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tribe">القبيلة</Label>
                <Input
                  id="tribe"
                  value={formData.tribe}
                  onChange={(e) =>
                    setFormData({ ...formData, tribe: e.target.value })
                  }
                  placeholder="اسم القبيلة"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">ملاحظات</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="ملاحظات إضافية"
                />
              </div>
              <Button onClick={handleAddFamily} className="w-full">
                إضافة
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>اسم العائلة</TableHead>
              <TableHead>القبيلة</TableHead>
              <TableHead>عدد الأفراد</TableHead>
              <TableHead>رب الأسرة</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead className="text-center">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {families.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  لا توجد عائلات مسجلة
                </TableCell>
              </TableRow>
            ) : (
              families.map((family) => (
                <TableRow key={family.id}>
                  <TableCell className="font-medium">{family.family_name}</TableCell>
                  <TableCell>{family.tribe || "-"}</TableCell>
                  <TableCell>{family.total_members || 0}</TableCell>
                  <TableCell>
                    {(family as any).head_of_family?.[0]?.full_name || "-"}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-success/10 text-success">
                      {family.status || "نشط"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(family)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteFamily(family.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تعديل العائلة</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit_family_name">اسم العائلة *</Label>
              <Input
                id="edit_family_name"
                value={formData.family_name}
                onChange={(e) =>
                  setFormData({ ...formData, family_name: e.target.value })
                }
                placeholder="اسم العائلة"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_tribe">القبيلة</Label>
              <Input
                id="edit_tribe"
                value={formData.tribe}
                onChange={(e) =>
                  setFormData({ ...formData, tribe: e.target.value })
                }
                placeholder="اسم القبيلة"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_notes">ملاحظات</Label>
              <Textarea
                id="edit_notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="ملاحظات إضافية"
              />
            </div>
            <Button onClick={handleEditFamily} className="w-full">
              حفظ التعديلات
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
