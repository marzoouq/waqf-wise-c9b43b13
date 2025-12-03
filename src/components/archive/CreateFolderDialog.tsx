import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ResponsiveDialog, DialogFooter } from "@/components/shared/ResponsiveDialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/lib/toast";

const folderSchema = z.object({
  name: z
    .string()
    .min(3, { message: "اسم المجلد يجب أن يكون 3 أحرف على الأقل" })
    .max(50, { message: "اسم المجلد يجب ألا يتجاوز 50 حرف" })
    .regex(/^[\u0600-\u06FF\s\-]+$/, {
      message: "اسم المجلد يجب أن يحتوي على أحرف عربية فقط",
    }),
  description: z.string().optional(),
});

type FolderFormValues = z.infer<typeof folderSchema>;

interface CreateFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (data: FolderFormValues) => void;
}

export function CreateFolderDialog({
  open,
  onOpenChange,
  onCreate,
}: CreateFolderDialogProps) {
  const form = useForm<FolderFormValues>({
    resolver: zodResolver(folderSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const handleSubmit = async (data: FolderFormValues) => {
    try {
      await onCreate(data);
      form.reset();
      onOpenChange(false);
    } catch (error) {
      // Error is handled by the mutation's onError callback
    }
  };

  return (
    <ResponsiveDialog 
      open={open} 
      onOpenChange={onOpenChange}
      title="إنشاء مجلد جديد"
      description="قم بإدخال اسم المجلد ووصفه"
      size="md"
    >
      <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>اسم المجلد *</FormLabel>
                  <FormControl>
                    <Input placeholder="مثال: عقود الإيجار" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الوصف</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="أضف وصفاً للمجلد (اختياري)"
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                إلغاء
              </Button>
              <Button type="submit">إنشاء المجلد</Button>
            </DialogFooter>
          </form>
        </Form>
    </ResponsiveDialog>
  );
}
