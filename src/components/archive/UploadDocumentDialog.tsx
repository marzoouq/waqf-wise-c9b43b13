import { useState } from "react";
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
import { useDocumentUpload } from "@/hooks/archive/useDocumentUpload";
import { useFolders } from "@/hooks/archive/useFolders";
import { Upload, Loader2, FileText } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { DocumentUploadData } from "@/types/documents";

const uploadSchema = z.object({
  name: z
    .string()
    .min(3, { message: "اسم المستند يجب أن يكون 3 أحرف على الأقل" })
    .max(100, { message: "اسم المستند يجب ألا يتجاوز 100 حرف" }),
  category: z.string().min(1, { message: "الفئة مطلوبة" }),
  description: z.string().optional(),
  folder_id: z.string().optional(),
  file: z.instanceof(FileList).refine((files) => files?.length > 0, "الملف مطلوب"),
});

type UploadFormValues = z.infer<typeof uploadSchema>;

interface UploadDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload?: (data: DocumentUploadData & { file: File }) => void;
}

const DOCUMENT_CATEGORIES = [
  { value: "contracts", label: "العقود" },
  { value: "legal", label: "المستندات القانونية" },
  { value: "reports", label: "التقارير المالية" },
  { value: "governance", label: "محاضر الاجتماعات" },
  { value: "beneficiary", label: "مستندات المستفيدين" },
  { value: "receipts", label: "سندات القبض والصرف" },
  { value: "other", label: "أخرى" },
];

export function UploadDocumentDialog({
  open,
  onOpenChange,
}: UploadDocumentDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { uploadDocument, isUploading } = useDocumentUpload();
  const { folders } = useFolders();

  const form = useForm<UploadFormValues>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      name: "",
      category: "",
      description: "",
      folder_id: "",
    },
  });

  const handleFileChange = (files: FileList | null) => {
    if (files && files[0]) {
      setSelectedFile(files[0]);
      // Auto-fill name from file name if empty
      if (!form.getValues('name')) {
        const fileName = files[0].name.replace(/\.[^/.]+$/, '');
        form.setValue('name', fileName);
      }
    }
  };

  const handleSubmit = async (data: UploadFormValues) => {
    const file = data.file[0];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (file.size > maxSize) {
      form.setError('file', { message: 'حجم الملف يجب ألا يتجاوز 10 ميجابايت' });
      return;
    }

    try {
      console.log('[UploadDocument] Starting upload...', { name: data.name, category: data.category });
      
      await uploadDocument({
        file,
        name: data.name,
        category: data.category,
        description: data.description,
        folder_id: data.folder_id || undefined,
      });
      
      console.log('[UploadDocument] Upload successful!');
      form.reset();
      setSelectedFile(null);
      onOpenChange(false);
    } catch (error) {
      console.error('[UploadDocument] Upload failed:', error);
      // Error handled by hook toast
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <ResponsiveDialog 
      open={open} 
      onOpenChange={onOpenChange}
      title="رفع مستند جديد"
      description="قم بإدخال بيانات المستند واختر الملف للرفع إلى الأرشيف"
      size="md"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="file"
            render={({ field: { onChange, value, ...field } }) => (
              <FormItem>
                <FormLabel>الملف *</FormLabel>
                <FormControl>
                  <div className="space-y-2">
                    <Input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                      onChange={(e) => {
                        onChange(e.target.files);
                        handleFileChange(e.target.files);
                      }}
                      {...field}
                      className="cursor-pointer"
                    />
                    {selectedFile && (
                      <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                        <FileText className="h-5 w-5 text-primary" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(selectedFile.size)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الفئة *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الفئة" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {DOCUMENT_CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="folder_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>المجلد</FormLabel>
                  <Select 
                    onValueChange={(val) => field.onChange(val === "__none__" ? "" : val)} 
                    value={field.value || "__none__"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر المجلد (اختياري)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="__none__">بدون مجلد</SelectItem>
                      {folders?.map((folder) => (
                        <SelectItem key={folder.id} value={folder.id}>
                          {folder.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

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

          {isUploading && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                جاري رفع المستند...
              </div>
              <Progress value={undefined} className="h-2" />
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isUploading}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={isUploading}>
              {isUploading ? (
                <>
                  <Loader2 className="ms-2 h-4 w-4 animate-spin" />
                  جاري الرفع...
                </>
              ) : (
                <>
                  <Upload className="ms-2 h-4 w-4" />
                  رفع المستند
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </ResponsiveDialog>
  );
}
