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
import { AlertTriangle } from "lucide-react";

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string;
  itemName?: string;
  isLoading?: boolean;
  isDestructive?: boolean;
}

export const DeleteConfirmDialog = ({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  itemName,
  isLoading = false,
  isDestructive = true,
}: DeleteConfirmDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            {isDestructive && (
              <div className="p-2 bg-destructive/10 rounded-full">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
            )}
            <AlertDialogTitle>{title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-right space-y-2">
            <p>{description}</p>
            {itemName && (
              <p className="font-semibold text-foreground">
                {itemName}
              </p>
            )}
            {isDestructive && (
              <p className="text-destructive font-medium">
                ⚠️ هذا الإجراء لا يمكن التراجع عنه
              </p>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-row gap-2">
          <AlertDialogCancel disabled={isLoading}>
            إلغاء
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className={isDestructive ? "bg-destructive hover:bg-destructive/90" : ""}
          >
            {isLoading ? "جاري الحذف..." : "تأكيد الحذف"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
