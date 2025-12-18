import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAutoJournalTemplates, type AutoJournalTemplate } from "@/hooks/accounting/useAutoJournalTemplates";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { AutoJournalTemplateForm } from "./AutoJournalTemplateForm";

export function AutoJournalTemplates() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<AutoJournalTemplate | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { 
    templates, 
    isLoading, 
    error, 
    refetch, 
    toggleActive, 
    deleteTemplate,
    createTemplate,
    updateTemplate,
  } = useAutoJournalTemplates();

  const handleSubmit = async (data: Parameters<typeof createTemplate>[0]) => {
    setIsSubmitting(true);
    try {
      if (editingTemplate) {
        await updateTemplate({ id: editingTemplate.id, ...data });
      } else {
        await createTemplate(data);
      }
      setIsDialogOpen(false);
      setEditingTemplate(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenDialog = (template?: AutoJournalTemplate) => {
    setEditingTemplate(template || null);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingTemplate(null);
  };

  if (isLoading) {
    return <LoadingState message="جاري تحميل قوالب القيود..." />;
  }

  if (error) {
    return <ErrorState title="خطأ في تحميل القوالب" message={error.message} onRetry={refetch} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">قوالب القيود التلقائية</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="ms-2 h-4 w-4" />
              قالب جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingTemplate ? "تعديل القالب" : "قالب جديد"}
              </DialogTitle>
            </DialogHeader>
            <AutoJournalTemplateForm
              template={editingTemplate}
              onSubmit={handleSubmit}
              onCancel={handleCloseDialog}
              isSubmitting={isSubmitting}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {templates?.map((template) => (
          <Card key={template.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold">{template.template_name}</h3>
                  <span className={`px-2 py-1 rounded text-xs ${
                    template.is_active 
                      ? "bg-success/10 text-success" 
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {template.is_active ? "مفعّل" : "معطّل"}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {template.description || "لا يوجد وصف"}
                </p>
                <div className="flex gap-4 text-sm">
                  <span className="text-muted-foreground">
                    الحدث المحفز: <span className="text-foreground">{template.trigger_event}</span>
                  </span>
                  <span className="text-muted-foreground">
                    الأولوية: <span className="text-foreground">{template.priority}</span>
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleActive({
                    id: template.id,
                    is_active: !template.is_active
                  })}
                >
                  {template.is_active ? (
                    <ToggleRight className="h-4 w-4 text-success" />
                  ) : (
                    <ToggleLeft className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleOpenDialog(template)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteTemplate(template.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {templates?.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            لا توجد قوالب قيود تلقائية. انقر على "قالب جديد" للبدء.
          </div>
        )}
      </div>
    </div>
  );
}
