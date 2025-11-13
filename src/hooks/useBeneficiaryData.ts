import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type BeneficiaryRow = Database["public"]["Tables"]["beneficiaries"]["Row"];

export interface Beneficiary extends BeneficiaryRow {
  beneficiary_number?: string | null;
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
          .select("*")
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

        // Fetch payments separately to avoid type complexity
        const paymentsResponse = await supabase
          .from("payments")
          .select("*")
          .eq("beneficiary_id", benData.id)
          .order("payment_date", { ascending: false })
          .limit(50);
        
        if (paymentsResponse.data) {
          setPayments(paymentsResponse.data.map((p: any) => ({
            id: p.id,
            payment_number: p.payment_number,
            payment_date: p.payment_date,
            amount: p.amount,
            description: p.description || ''
          })));
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
  }, [userId, toast]);

  return { beneficiary, payments, loading };
};
