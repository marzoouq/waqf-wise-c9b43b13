import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/lib/logger";
import { Checkbox } from "@/components/ui/checkbox";
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
import { ScrollArea } from "@/components/ui/scroll-area";

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

interface EligibleBeneficiary {
  id: string;
  full_name: string;
  national_id: string;
}

export function CreateBeneficiaryAccountsButton() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [loadingBeneficiaries, setLoadingBeneficiaries] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [showSelectionDialog, setShowSelectionDialog] = useState(false);
  const [eligibleBeneficiaries, setEligibleBeneficiaries] = useState<EligibleBeneficiary[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [results, setResults] = useState<{
    total: number;
    created: number;
    failed: number;
    details: CreateResult[];
    errorDetails: ErrorResult[];
  } | null>(null);

  // جلب المستفيدين المؤهلين
  const fetchEligibleBeneficiaries = async () => {
    setLoadingBeneficiaries(true);
    try {
      const { data, error } = await supabase
        .from('beneficiaries')
        .select('id, full_name, national_id')
        .eq('can_login', true)
        .is('user_id', null)
        .order('full_name');

      if (error) throw error;

      setEligibleBeneficiaries(data || []);
      // تحديد الكل افتراضياً
      setSelectedIds(new Set(data?.map(b => b.id) || []));
      
      if (data && data.length > 0) {
        setShowSelectionDialog(true);
      } else {
        toast({
          title: "لا توجد حسابات للإنشاء",
          description: "جميع المستفيدين لديهم حسابات بالفعل",
        });
      }
    } catch (error) {
      logger.error(error, { context: 'fetch_eligible_beneficiaries' });
      toast({
        title: "خطأ في جلب البيانات",
        description: "حدث خطأ أثناء جلب المستفيدين",
        variant: "destructive",
      });
    } finally {
      setLoadingBeneficiaries(false);
    }
  };

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleAll = () => {
    if (selectedIds.size === eligibleBeneficiaries.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(eligibleBeneficiaries.map(b => b.id)));
    }
  };

  const handleCreate = async () => {
    if (selectedIds.size === 0) {
      toast({
        title: "لم يتم تحديد مستفيدين",
        description: "يرجى تحديد مستفيد واحد على الأقل",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-beneficiary-accounts', {
        body: { beneficiary_ids: Array.from(selectedIds) }
      });

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
          description: "جميع المستفيدين المحددين لديهم حسابات بالفعل",
        });
      }

      setShowDialog(false);
      setShowSelectionDialog(false);
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
        onClick={fetchEligibleBeneficiaries}
        disabled={loadingBeneficiaries || loading}
        variant="outline"
        size="sm"
      >
        {loadingBeneficiaries ? (
          <Loader2 className="ml-2 h-4 w-4 animate-spin" />
        ) : (
          <UserPlus className="ml-2 h-4 w-4" />
        )}
        إنشاء حسابات المستفيدين
      </Button>

      {/* قائمة اختيار المستفيدين */}
      <AlertDialog open={showSelectionDialog} onOpenChange={setShowSelectionDialog}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>اختيار المستفيدين لإنشاء الحسابات</AlertDialogTitle>
            <AlertDialogDescription>
              يرجى تحديد المستفيدين الذين تريد إنشاء حسابات لهم ({selectedIds.size} من {eligibleBeneficiaries.length} محدد)
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-2 space-x-reverse pb-2 border-b">
              <Checkbox
                id="select-all"
                checked={selectedIds.size === eligibleBeneficiaries.length}
                onCheckedChange={toggleAll}
              />
              <label
                htmlFor="select-all"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                تحديد الكل
              </label>
            </div>

            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-2">
                {eligibleBeneficiaries.map((beneficiary) => (
                  <div
                    key={beneficiary.id}
                    className="flex items-start space-x-3 space-x-reverse p-3 rounded-lg border hover:bg-accent transition-colors"
                  >
                    <Checkbox
                      id={beneficiary.id}
                      checked={selectedIds.has(beneficiary.id)}
                      onCheckedChange={() => toggleSelection(beneficiary.id)}
                    />
                    <label
                      htmlFor={beneficiary.id}
                      className="flex-1 cursor-pointer space-y-1"
                    >
                      <p className="text-sm font-medium leading-none">
                        {beneficiary.full_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        رقم الهوية: {beneficiary.national_id}
                      </p>
                    </label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowSelectionDialog(false)}>
              إلغاء
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                setShowSelectionDialog(false);
                setShowDialog(true);
              }}
              disabled={selectedIds.size === 0}
            >
              التالي ({selectedIds.size})
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* تأكيد الإنشاء */}
      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد إنشاء الحسابات</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                سيتم إنشاء حسابات تسجيل الدخول لـ {selectedIds.size} مستفيد.
              </p>
              <div className="bg-primary/10 p-3 rounded-lg space-y-1">
                <p className="font-semibold text-sm">معلومات تسجيل الدخول:</p>
                <p className="text-sm">• البريد الإلكتروني: رقم_الهوية@waqf.internal</p>
                <p className="text-sm">• كلمة المرور: يتم توليدها تلقائياً وعرضها بعد الإنشاء</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowSelectionDialog(true)}>
              رجوع
            </AlertDialogCancel>
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
