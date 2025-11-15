import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Beneficiary } from "@/types/beneficiary";
import { fetchFromTable } from "@/utils/supabaseHelpers";
import { getErrorMessage } from "@/lib/errorService";

interface Payment {
  id: string;
  payment_number: string;
  payment_date: string;
  amount: number;
  description: string;
}

export const useBeneficiaryData = (userId?: string) => {
  const { toast } = useToast();
  const [beneficiary, setBeneficiary] = useState<Beneficiary | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const loadData = async () => {
      try {
        // جلب بيانات المستفيد
        const beneficiaryResult = await fetchFromTable<Beneficiary>("beneficiaries", {
          filters: [{ column: "user_id", operator: "eq", value: userId }],
          single: true,
        });

        if (beneficiaryResult.error) {
          toast({
            title: "خطأ في تحميل البيانات",
            description: getErrorMessage(beneficiaryResult.error),
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        if (!beneficiaryResult.data) {
          toast({
            title: "لم يتم العثور على حساب مستفيد",
            description: "يرجى التواصل مع الإدارة لتفعيل حسابك",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        setBeneficiary(beneficiaryResult.data as Beneficiary);

        // جلب المدفوعات
        const paymentsResult = await fetchFromTable<Payment>("payments", {
          filters: [{ column: "beneficiary_id", operator: "eq", value: (beneficiaryResult.data as Beneficiary).id }],
          order: { column: "payment_date", ascending: false },
          limit: 50,
        });

        if (paymentsResult.data) {
          setPayments(paymentsResult.data as Payment[]);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error loading beneficiary data:", error);
        toast({
          title: "خطأ في تحميل البيانات",
          description: "حدث خطأ غير متوقع",
          variant: "destructive",
        });
        setLoading(false);
      }
    };

    loadData();
  }, [userId, toast]);

  return { beneficiary, payments, loading };
};
