import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Beneficiary {
  id: string;
  full_name: string;
  national_id: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  bank_name?: string | null;
  bank_account_number?: string | null;
  iban?: string | null;
  family_name?: string | null;
  relationship?: string | null;
  category: string;
  status: string;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  user_id?: string | null;
}

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

    const fetchData = async () => {
      try {
        // Use type assertion to avoid deep instantiation
        const benResult: any = await supabase
          .from("beneficiaries")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle();

        if (benResult.error) {
          toast({
            title: "خطأ في تحميل البيانات",
            description: benResult.error.message,
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        if (!benResult.data) {
          toast({
            title: "لم يتم العثور على حساب مستفيد",
            description: "يرجى التواصل مع الإدارة لتفعيل حسابك",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        setBeneficiary(benResult.data as Beneficiary);

        const payResult: any = await supabase
          .from("payments")
          .select("*")
          .eq("beneficiary_id", benResult.data.id)
          .order("payment_date", { ascending: false })
          .limit(50);

        if (!payResult.error && payResult.data) {
          setPayments(payResult.data as Payment[]);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error:", error);
        toast({
          title: "خطأ في تحميل البيانات",
          description: "حدث خطأ غير متوقع",
          variant: "destructive",
        });
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, toast]);

  return { beneficiary, payments, loading };
};
