import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Landmark } from "lucide-react";
import { useVisibilitySettings } from "@/hooks/governance/useVisibilitySettings";
import { useBeneficiaryBankAccounts } from "@/hooks/beneficiary/useBeneficiaryTabsData";
import { MaskedValue } from "@/components/shared/MaskedValue";
import { ErrorState } from "@/components/shared/ErrorState";

export function BankAccountsTab() {
  const { settings } = useVisibilitySettings();
  const { data: bankAccounts, isLoading, error, refetch } = useBeneficiaryBankAccounts(settings?.show_bank_accounts || false);

  if (!settings?.show_bank_accounts) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          غير مصرح بعرض الحسابات البنكية
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return <ErrorState title="خطأ في تحميل الحسابات البنكية" message={error.message} onRetry={refetch} />;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        {bankAccounts?.map((account) => (
          <Card key={account.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Landmark className="h-5 w-5" />
                  <CardTitle className="text-lg">{account.bank_name}</CardTitle>
                </div>
                <Badge variant={account.is_active ? "default" : "secondary"}>
                  {account.is_active ? "نشط" : "غير نشط"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">رقم الحساب</label>
                <p className="text-lg font-mono mt-1">
                  <MaskedValue
                    value={account.account_number}
                    type="iban"
                    masked={settings?.mask_iban || false}
                  />
                </p>
              </div>

              {account.iban && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">IBAN</label>
                  <p className="text-lg font-mono mt-1">
                    <MaskedValue
                      value={account.iban}
                      type="iban"
                      masked={settings?.mask_iban || false}
                    />
                  </p>
                </div>
              )}

              {settings?.show_bank_balances && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">الرصيد الحالي</label>
                  <p className="text-2xl font-bold mt-1 text-success">
                    <MaskedValue
                      value={account.current_balance.toLocaleString("ar-SA")}
                      type="amount"
                      masked={settings?.mask_exact_amounts || false}
                    /> ريال
                  </p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-muted-foreground">العملة</label>
                <p className="text-lg mt-1">{account.currency}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {(!bankAccounts || bankAccounts.length === 0) && (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            لا توجد حسابات بنكية متاحة
          </CardContent>
        </Card>
      )}
    </div>
  );
}
