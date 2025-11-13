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

    const loadData = async () => {
      try {
        const { data: benData, error: benError } = await supabase
          .from("beneficiaries")
          .select("id, full_name, national_id, phone, email, address, bank_name, bank_account_number, iban, family_name, relationship, category, status, notes, created_at, updated_at, user_id")
          .eq("user_id", userId)
          .maybeSingle();

        if (benError) {
          toast({
            title: "خطأ في تحميل البيانات",
            description: benError.message,
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        if (!benData) {
          toast({
            title: "لم يتم العثور على حساب مستفيد",
            description: "يرجى التواصل مع الإدارة لتفعيل حسابك",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        setBeneficiary(benData);

        const paymentQuery = (supabase.from("payments") as any)
          .select("id, payment_number, payment_date, amount, description")
          .eq("beneficiary_id", benData.id)
          .order("payment_date", { ascending: false })
          .limit(50);
        
        const { data: payData, error: payError } = await paymentQuery;

        if (!payError && payData) {
          setPayments(payData);
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

    loadData();
  }, [userId]);

  return { beneficiary, payments, loading };
};
