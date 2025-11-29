import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageErrorBoundary } from "@/components/shared/PageErrorBoundary";
import { FileText, Users, DollarSign, Coins, Wallet, AlertTriangle, CheckSquare } from "lucide-react";
import { ApprovalsOverview } from "@/components/approvals/ApprovalsOverview";
import { JournalApprovalsTab } from "@/components/approvals/JournalApprovalsTab";
import { DistributionApprovalsTab } from "@/components/approvals/DistributionApprovalsTab";
import { RequestApprovalsTab } from "@/components/approvals/RequestApprovalsTab";
import { LoanApprovalsTab } from "@/components/approvals/LoanApprovalsTab";
import { PaymentApprovalsTab } from "@/components/approvals/PaymentApprovalsTab";
import { EmergencyAidApprovalsTab } from "@/components/approvals/EmergencyAidApprovalsTab";
import { MobileOptimizedLayout, MobileOptimizedHeader } from "@/components/layout/MobileOptimizedLayout";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const Approvals = () => {
  const [activeTab, setActiveTab] = useState("journal");

  return (
    <PageErrorBoundary pageName="الموافقات">
      <MobileOptimizedLayout>
        <MobileOptimizedHeader
          title="نظام الموافقات المتكامل"
          description="إدارة الموافقات متعددة المستويات"
          icon={<CheckSquare className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-primary" />}
        />

        {/* Overview Stats */}
        <ApprovalsOverview />

        {/* Tabs for different approval types */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <ScrollArea className="w-full whitespace-nowrap">
            <TabsList className="inline-flex w-full min-w-max sm:grid sm:grid-cols-6 mb-2">
              <TabsTrigger value="journal" className="flex items-center gap-1 px-3 sm:px-2">
                <FileText className="h-4 w-4" />
                <span className="text-xs sm:text-sm">القيود</span>
              </TabsTrigger>
              <TabsTrigger value="distributions" className="flex items-center gap-1 px-3 sm:px-2">
                <DollarSign className="h-4 w-4" />
                <span className="text-xs sm:text-sm">التوزيعات</span>
              </TabsTrigger>
              <TabsTrigger value="payments" className="flex items-center gap-1 px-3 sm:px-2">
                <Wallet className="h-4 w-4" />
                <span className="text-xs sm:text-sm">المدفوعات</span>
              </TabsTrigger>
              <TabsTrigger value="loans" className="flex items-center gap-1 px-3 sm:px-2">
                <Coins className="h-4 w-4" />
                <span className="text-xs sm:text-sm">القروض</span>
              </TabsTrigger>
              <TabsTrigger value="emergency" className="flex items-center gap-1 px-3 sm:px-2">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-xs sm:text-sm">الفزعات</span>
              </TabsTrigger>
              <TabsTrigger value="requests" className="flex items-center gap-1 px-3 sm:px-2">
                <Users className="h-4 w-4" />
                <span className="text-xs sm:text-sm">الطلبات</span>
              </TabsTrigger>
            </TabsList>
            <ScrollBar orientation="horizontal" className="sm:hidden" />
          </ScrollArea>

          <TabsContent value="journal" className="mt-6">
            <JournalApprovalsTab />
          </TabsContent>

          <TabsContent value="distributions" className="mt-6">
            <DistributionApprovalsTab />
          </TabsContent>

          <TabsContent value="payments" className="mt-6">
            <PaymentApprovalsTab />
          </TabsContent>

          <TabsContent value="loans" className="mt-6">
            <LoanApprovalsTab />
          </TabsContent>

          <TabsContent value="emergency" className="mt-6">
            <EmergencyAidApprovalsTab />
          </TabsContent>

          <TabsContent value="requests" className="mt-4 sm:mt-6">
            <RequestApprovalsTab />
          </TabsContent>
        </Tabs>
      </MobileOptimizedLayout>
    </PageErrorBoundary>
  );
};

export default Approvals;
