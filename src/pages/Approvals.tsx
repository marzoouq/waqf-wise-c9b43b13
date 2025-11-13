import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Users, DollarSign } from "lucide-react";
import { ApprovalsOverview } from "@/components/approvals/ApprovalsOverview";
import { JournalApprovalsTab } from "@/components/approvals/JournalApprovalsTab";
import { DistributionApprovalsTab } from "@/components/approvals/DistributionApprovalsTab";
import { RequestApprovalsTab } from "@/components/approvals/RequestApprovalsTab";

const Approvals = () => {
  const [activeTab, setActiveTab] = useState("journal");

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 md:p-8 lg:p-10 space-y-6 md:space-y-8">
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gradient-primary">
            نظام الموافقات المتكامل
          </h1>
          <p className="text-muted-foreground mt-1">
            إدارة الموافقات متعددة المستويات للقيود والتوزيعات والطلبات
          </p>
        </div>

        {/* Overview Stats */}
        <ApprovalsOverview />

        {/* Tabs for different approval types */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="journal" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>القيود المحاسبية</span>
            </TabsTrigger>
            <TabsTrigger value="distributions" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <span>التوزيعات</span>
            </TabsTrigger>
            <TabsTrigger value="requests" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>طلبات المستفيدين</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="journal" className="mt-6">
            <JournalApprovalsTab />
          </TabsContent>

          <TabsContent value="distributions" className="mt-6">
            <DistributionApprovalsTab />
          </TabsContent>

          <TabsContent value="requests" className="mt-6">
            <RequestApprovalsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Approvals;
