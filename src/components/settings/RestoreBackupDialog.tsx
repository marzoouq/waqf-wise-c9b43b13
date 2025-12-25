import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Upload, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface RestoreBackupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRestore: (data: string, mode: "merge" | "replace") => void;
  isRestoring: boolean;
}

export function RestoreBackupDialog({
  open,
  onOpenChange,
  onRestore,
  isRestoring,
}: RestoreBackupDialogProps) {
  const [mode, setMode] = useState<"merge" | "replace">("merge");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/json" && !file.name.endsWith(".json")) {
        toast.error("يرجى اختيار ملف JSON صالح");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleRestore = async () => {
    if (!selectedFile) {
      toast.error("يرجى اختيار ملف النسخة الاحتياطية");
      return;
    }

    try {
      const text = await selectedFile.text();
      JSON.parse(text); // Validate JSON
      onRestore(text, mode);
    } catch {
      toast.error("ملف JSON غير صالح");
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setMode("merge");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            استعادة من نسخة احتياطية
          </DialogTitle>
          <DialogDescription>
            اختر ملف النسخة الاحتياطية وطريقة الاستعادة
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* File Upload */}
          <div className="space-y-2">
            <Label>ملف النسخة الاحتياطية</Label>
            <div className="flex gap-2">
              <Input
                type="file"
                accept=".json,application/json"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
              >
                <Upload className="h-4 w-4 ms-2" />
                {selectedFile ? selectedFile.name : "اختر ملف..."}
              </Button>
            </div>
          </div>

          {/* Restore Mode */}
          <div className="space-y-3">
            <Label>طريقة الاستعادة</Label>
            <RadioGroup value={mode} onValueChange={(v) => setMode(v as "merge" | "replace")}>
              <div className="flex items-center space-x-2 space-x-reverse">
                <RadioGroupItem value="merge" id="merge" />
                <Label htmlFor="merge" className="cursor-pointer">
                  دمج مع البيانات الحالية
                </Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <RadioGroupItem value="replace" id="replace" />
                <Label htmlFor="replace" className="cursor-pointer">
                  استبدال البيانات الحالية
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Warning */}
          {mode === "replace" && (
            <div className="flex items-start gap-2 p-3 bg-destructive/10 text-destructive rounded-lg">
              <AlertTriangle className="h-5 w-5 mt-0.5 shrink-0" />
              <p className="text-sm">
                تحذير: سيتم حذف جميع البيانات الحالية واستبدالها ببيانات النسخة الاحتياطية.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            إلغاء
          </Button>
          <Button onClick={handleRestore} disabled={!selectedFile || isRestoring}>
            {isRestoring ? "جاري الاستعادة..." : "استعادة"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
