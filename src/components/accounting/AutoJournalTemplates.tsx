import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { AutoJournalTemplate, AutoJournalTemplateRaw } from "@/types/auto-journal";
import { parseAutoJournalTemplate } from "@/types/auto-journal";

export function AutoJournalTemplates() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<AutoJournalTemplate | null>(null);

  const { data: templates, isLoading } = useQuery({
    queryKey: ["auto-journal-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("auto_journal_templates")
        .select("*")
        .order("priority", { ascending: true });
      if (error) throw error;
      return (data as unknown as AutoJournalTemplateRaw[]).map(parseAutoJournalTemplate);
    },
  });

  const toggleTemplateMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("auto_journal_templates")
        .update({ is_active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auto-journal-templates"] });
      toast({
        title: "تم التحديث",
        description: "تم تحديث حالة القالب بنجاح",
      });
    },
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("auto_journal_templates")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auto-journal-templates"] });
      toast({
        title: "تم الحذف",
        description: "تم حذف القالب بنجاح",
      });
    },
  });

  if (isLoading) {
    return <div className="text-center p-8">جاري التحميل...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">قوالب القيود التلقائية</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="ml-2 h-4 w-4" />
              قالب جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingTemplate ? "تعديل القالب" : "قالب جديد"}
              </DialogTitle>
            </DialogHeader>
            {/* Form content would go here */}
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
                  onClick={() => toggleTemplateMutation.mutate({
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
                  onClick={() => {
                    setEditingTemplate(template);
                    setIsDialogOpen(true);
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteTemplateMutation.mutate(template.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
