import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/lib/logger";
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

interface CreateResult {
  beneficiary_id: string;
  national_id: string;
  status: string;
  user_id: string;
}

interface ErrorResult {
  beneficiary_id: string;
  national_id: string;
  error: string;
}

export function CreateBeneficiaryAccountsButton() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [results, setResults] = useState<{
    total: number;
    created: number;
    failed: number;
    details: CreateResult[];
    errorDetails: ErrorResult[];
  } | null>(null);

  const handleCreate = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-beneficiary-accounts');

      if (error) throw error;

      setResults({
        total: data.total,
        created: data.created,
        failed: data.failed,
        details: data.results || [],
        errorDetails: data.errors || [],
      });

      if (data.created > 0) {
        toast({
          title: "تم إنشاء الحسابات بنجاح",
          description: `تم إنشاء ${data.created} حساب من أصل ${data.total}`,
        });
      } else {
        toast({
          title: "لا توجد حسابات للإنشاء",
          description: "جميع المستفيدين لديهم حسابات بالفعل",
        });
      }

      setShowDialog(false);
    } catch (error) {
      logger.error(error, { context: 'create_beneficiary_accounts' });
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ أثناء إنشاء الحسابات';
      toast({
        title: "خطأ في إنشاء الحسابات",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setShowDialog(true)}
        disabled={loading}
        variant="outline"
        size="sm"
      >
        {loading ? (
          <Loader2 className="ml-2 h-4 w-4 animate-spin" />
        ) : (
          <UserPlus className="ml-2 h-4 w-4" />
        )}
        إنشاء حسابات المستفيدين
      </Button>

      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>إنشاء حسابات المستفيدين</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                سيتم إنشاء حسابات تسجيل الدخول لجميع المستفيدين المفعلين الذين لا يملكون حسابات.
              </p>
              <div className="bg-primary/10 p-3 rounded-lg space-y-1">
                <p className="font-semibold text-sm">معلومات تسجيل الدخول:</p>
                <p className="text-sm">• رقم الهوية: يستخدم كاسم مستخدم</p>
                <p className="text-sm">• كلمة المرور: رقم_الهوية@Waqf</p>
              </div>
              <p className="text-xs text-muted-foreground">
                مثال: إذا كان رقم الهوية 1234567890، ستكون كلمة المرور 1234567890@Waqf
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleCreate} disabled={loading}>
              {loading ? "جاري الإنشاء..." : "إنشاء الحسابات"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {results && (
        <AlertDialog open={!!results} onOpenChange={() => setResults(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>نتائج إنشاء الحسابات</AlertDialogTitle>
              <AlertDialogDescription className="space-y-3">
                <div className="space-y-2">
                  <p>إجمالي المستفيدين: {results.total}</p>
                  <p className="text-success">تم الإنشاء بنجاح: {results.created}</p>
                  {results.failed > 0 && (
                    <p className="text-destructive">فشل الإنشاء: {results.failed}</p>
                  )}
                </div>
                {results.errorDetails.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="font-semibold">الأخطاء:</p>
                    <div className="max-h-40 overflow-y-auto space-y-1">
                      {results.errorDetails.map((err, idx) => (
                        <p key={idx} className="text-xs text-destructive">
                          {err.national_id}: {err.error}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => setResults(null)}>
                إغلاق
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
