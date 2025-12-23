import { useState, useRef } from "react";
import { Upload, X, File, Image, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/ui/use-toast";

export interface UploadedFile {
  id: string;
  file: File;
  preview?: string;
  progress?: number;
}

interface UnifiedFileUploadProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // بالميجابايت
  maxFiles?: number;
  value?: UploadedFile[];
  onChange?: (files: UploadedFile[]) => void;
  onUpload?: (files: File[]) => Promise<void>;
  disabled?: boolean;
  className?: string;
  variant?: "default" | "compact" | "avatar";
  showPreview?: boolean;
  dragDropText?: string;
  browseText?: string;
}

/**
 * مكون رفع ملفات موحد
 * يدعم السحب والإفلات، معاينة الصور، تحديد أنواع الملفات
 * 
 * @example
 * <UnifiedFileUpload
 *   accept="image/*"
 *   multiple
 *   maxSize={5}
 *   onChange={(files) => setUploadedFiles(files)}
 *   onUpload={handleUpload}
 * />
 */
export function UnifiedFileUpload({
  accept,
  multiple = false,
  maxSize = 10,
  maxFiles = 10,
  value = [],
  onChange,
  onUpload,
  disabled = false,
  className,
  variant = "default",
  showPreview = true,
  dragDropText = "اسحب الملفات هنا أو انقر للاختيار",
  browseText = "اختر ملفات",
}: UnifiedFileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<UploadedFile[]>(value);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFiles = async (newFiles: FileList | null) => {
    if (!newFiles || newFiles.length === 0) return;

    const fileArray = Array.from(newFiles);
    
    // التحقق من عدد الملفات
    if (!multiple && fileArray.length > 1) {
      toast({
        title: "خطأ",
        description: "يمكنك رفع ملف واحد فقط",
        variant: "destructive",
      });
      return;
    }

    if (files.length + fileArray.length > maxFiles) {
      toast({
        title: "خطأ",
        description: `لا يمكن رفع أكثر من ${maxFiles} ملف`,
        variant: "destructive",
      });
      return;
    }

    // التحقق من حجم الملفات
    const oversizedFiles = fileArray.filter(f => f.size > maxSize * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast({
        title: "خطأ",
        description: `حجم الملف يجب أن لا يتجاوز ${maxSize} ميجابايت`,
        variant: "destructive",
      });
      return;
    }

    // إنشاء معاينات للصور
    const uploadedFiles: UploadedFile[] = await Promise.all(
      fileArray.map(async (file) => {
        const id = Math.random().toString(36).substr(2, 9);
        let preview: string | undefined;

        if (file.type.startsWith("image/")) {
          preview = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });
        }

        return { id, file, preview };
      })
    );

    const newFilesList = multiple ? [...files, ...uploadedFiles] : uploadedFiles;
    setFiles(newFilesList);
    onChange?.(newFilesList);

    // رفع الملفات إذا كان هناك دالة رفع
    if (onUpload) {
      try {
        await onUpload(fileArray);
        toast({
          title: "تم الرفع بنجاح",
          description: `تم رفع ${fileArray.length} ملف`,
        });
      } catch (error) {
        toast({
          title: "خطأ في الرفع",
          description: "حدث خطأ أثناء رفع الملفات",
          variant: "destructive",
        });
      }
    }
  };

  const removeFile = (id: string) => {
    const newFiles = files.filter((f) => f.id !== id);
    setFiles(newFiles);
    onChange?.(newFiles);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) return Image;
    if (file.type.startsWith("text/") || file.type.includes("document")) return FileText;
    return File;
  };

  if (variant === "avatar") {
    const currentFile = files[0];
    return (
      <div className={cn("flex flex-col items-center gap-4", className)}>
        <div
          onClick={() => !disabled && fileInputRef.current?.click()}
          className={cn(
            "relative w-32 h-32 rounded-full overflow-hidden border-2 border-dashed cursor-pointer transition-colors",
            isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {currentFile?.preview ? (
            <img src={currentFile.preview} alt="صورة الملف المحمل" className="w-full h-full object-cover" />
          ) : (
            <div className="flex items-center justify-center w-full h-full">
              <Upload className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
        >
          {browseText}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={false}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
          disabled={disabled}
        />
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className={cn("space-y-2", className)}>
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="w-full"
        >
          <Upload className="h-4 w-4 ms-2" />
          {browseText}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
          disabled={disabled}
        />
        {files.length > 0 && (
          <div className="space-y-2">
            {files.map((file) => (
              <div key={file.id} className="flex items-center gap-2 p-2 bg-muted rounded-md">
                <File className="h-4 w-4 text-muted-foreground" />
                <span className="flex-1 text-sm truncate">{file.file.name}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(file.id)}
                  disabled={disabled}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <Card
        className={cn(
          "border-2 border-dashed transition-colors cursor-pointer",
          isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <div className="p-8 text-center">
          <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground mb-2">{dragDropText}</p>
          <p className="text-xs text-muted-foreground">
            الحد الأقصى: {maxSize} ميجابايت {multiple && `• حتى ${maxFiles} ملف`}
          </p>
        </div>
      </Card>

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
        disabled={disabled}
      />

      {showPreview && files.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {files.map((file) => {
            const Icon = getFileIcon(file.file);
            return (
              <Card key={file.id} className="relative group">
                <div className="aspect-square p-4 flex items-center justify-center">
                  {file.preview ? (
                    <img
                      src={file.preview}
                      alt={file.file.name}
                      className="w-full h-full object-cover rounded"
                    />
                  ) : (
                    <Icon className="h-12 w-12 text-muted-foreground" />
                  )}
                </div>
                <div className="p-2 border-t">
                  <p className="text-xs truncate">{file.file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.file.size / 1024 / 1024).toFixed(2)} ميجابايت
                  </p>
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(file.id);
                  }}
                  disabled={disabled}
                >
                  <X className="h-4 w-4" />
                </Button>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
