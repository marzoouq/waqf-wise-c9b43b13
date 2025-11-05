import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const uploadSchema = z.object({
  name: z
    .string()
    .min(3, { message: "اسم المستند يجب أن يكون 3 أحرف على الأقل" })
    .max(100, { message: "اسم المستند يجب ألا يتجاوز 100 حرف" }),
  category: z.string().min(1, { message: "الفئة مطلوبة" }),
  description: z.string().optional(),
  file: z.any().refine((file) => file?.length > 0, "الملف مطلوب"),
});

type UploadFormValues = z.infer<typeof uploadSchema>;

interface UploadDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (data: UploadFormValues) => void;
}

export function UploadDocumentDialog({
  open,
  onOpenChange,
  onUpload,
}: UploadDocumentDialogProps) {
  const { toast } = useToast();

  const form = useForm<UploadFormValues>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      name: "",
      category: "",
      description: "",
    },
  });

  const handleSubmit = async (data: UploadFormValues) => {
    const file = data.file[0];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (file.size > maxSize) {
      toast({
        title: "خطأ في حجم الملف",
        description: "حجم الملف يجب ألا يتجاوز 10 ميجابايت",
        variant: "destructive",
      });
      return;
    }

    // Format file size
    const formatFileSize = (bytes: number): string => {
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    // Get file extension
    const fileExtension = file.name.split(".").pop()?.toUpperCase() || "FILE";

    const documentData = {
      name: data.name,
      description: data.description || "",
      category: data.category,
      file_type: fileExtension,
      file_size: formatFileSize(file.size),
    };

    try {
      await onUpload(documentData);
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Upload error:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>رفع مستند جديد</DialogTitle>
          <DialogDescription>
            قم برفع المستند وإدخال البيانات المطلوبة
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="file"
              render={({ field: { onChange, value, ...field } }) => (
                <FormItem>
                  <FormLabel>الملف *</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                      onChange={(e) => onChange(e.target.files)}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>اسم المستند *</FormLabel>
                  <FormControl>
                    <Input placeholder="مثال: عقد إيجار - مبنى النخيل" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الفئة *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الفئة" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="عقود الإيجار">عقود الإيجار</SelectItem>
                      <SelectItem value="مستندات المستفيدين">مستندات المستفيدين</SelectItem>
                      <SelectItem value="سندات القبض والصرف">سندات القبض والصرف</SelectItem>
                      <SelectItem value="التقارير المالية">التقارير المالية</SelectItem>
                    </SelectContent>
                  </Select>
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
                      placeholder="أضف وصفاً للمستند (اختياري)"
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
              <Button type="submit">رفع المستند</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
