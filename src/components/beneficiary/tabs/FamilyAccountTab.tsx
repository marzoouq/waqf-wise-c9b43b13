/**
 * FamilyAccountTab Component
 * تبويب مُدمج للعائلة والملف الشخصي والحسابات البنكية
 * @version 1.0.0
 */

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Users, CreditCard } from "lucide-react";
import { BeneficiaryProfileTab } from "./BeneficiaryProfileTab";
import { FamilyTreeTab } from "./FamilyTreeTab";
import { BankAccountsTab } from "./BankAccountsTab";
import type { Database } from "@/integrations/supabase/types";

type Beneficiary = Database['public']['Tables']['beneficiaries']['Row'];

interface FamilyAccountTabProps {
  beneficiaryId: string;
  beneficiary: Beneficiary;
}

export function FamilyAccountTab({ beneficiaryId, beneficiary }: FamilyAccountTabProps) {
  const [activeSubTab, setActiveSubTab] = useState("profile");

  return (
    <div className="space-y-4">
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="profile" className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">بياناتي</span>
            <span className="sm:hidden">بياناتي</span>
          </TabsTrigger>
          <TabsTrigger value="family" className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">شجرة العائلة</span>
            <span className="sm:hidden">العائلة</span>
          </TabsTrigger>
          <TabsTrigger value="bank" className="flex items-center gap-2 text-sm">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">الحسابات البنكية</span>
            <span className="sm:hidden">البنكية</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-0">
          <BeneficiaryProfileTab beneficiary={beneficiary} />
        </TabsContent>

        <TabsContent value="family" className="mt-0">
          <FamilyTreeTab beneficiaryId={beneficiaryId} />
        </TabsContent>

        <TabsContent value="bank" className="mt-0">
          <BankAccountsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
