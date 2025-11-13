import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Building2, FileText, Wrench, CreditCard, Printer } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LoadingState } from "@/components/shared/LoadingState";
import { EmptyState } from "@/components/shared/EmptyState";

export function FirstClassReports() {
  const [activeTab, setActiveTab] = useState("properties");

  // استعلام العقارات المؤجرة
  const { data: properties = [], isLoading: propertiesLoading } = useQuery({
    queryKey: ["rented-properties"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select(`
          *,
          contracts!inner (
            id,
            contract_number,
            tenant_name,
            monthly_rent,
            start_date,
            end_date,
            status
          )
        `)
        .eq("contracts.status", "نشط");
      
      if (error) throw error;
      return data || [];
    },
  });

  // استعلام العقود النشطة
  const { data: contracts = [], isLoading: contractsLoading } = useQuery({
    queryKey: ["active-contracts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contracts")
        .select(`
          *,
          properties (name, location, property_type)
        `)
        .eq("status", "نشط")
        .order("start_date", { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });

  // استعلام الصيانة
  const { data: maintenance = [], isLoading: maintenanceLoading } = useQuery({
    queryKey: ["maintenance-requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("maintenance_requests")
        .select(`
          *,
          properties (name, location)
        `)
        .order("request_date", { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data || [];
    },
  });

  // استعلام كشف البنك
  const { data: bankTransactions = [], isLoading: bankLoading } = useQuery({
    queryKey: ["bank-transactions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bank_transactions")
        .select(`
          *,
          bank_statements (
            bank_accounts (bank_name, account_number)
          )
        `)
        .order("transaction_date", { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data || [];
    },
  });

  const handlePrint = () => {
    // Add print-friendly CSS
    const style = document.createElement('style');
    style.textContent = `
      @media print {
        body * { visibility: hidden; }
        .print-area, .print-area * { visibility: visible; }
        .print-area { position: absolute; left: 0; top: 0; width: 100%; }
        .no-print { display: none !important; }
      }
    `;
    document.head.appendChild(style);
    window.print();
    document.head.removeChild(style);
  };

  if (propertiesLoading || contractsLoading || maintenanceLoading || bankLoading) {
    return <LoadingState message="جاري تحميل التقارير..." />;
  }

  return (
    <Card className="print-area">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          تقارير الدرجة الأولى (قراءة فقط)
        </CardTitle>
        <Button onClick={handlePrint} variant="outline" size="sm" className="no-print">
          <Printer className="h-4 w-4 ml-2" />
          طباعة
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="properties">
              <Building2 className="h-4 w-4 ml-2" />
              العقارات المؤجرة
            </TabsTrigger>
            <TabsTrigger value="contracts">
              <FileText className="h-4 w-4 ml-2" />
              العقود
            </TabsTrigger>
            <TabsTrigger value="maintenance">
              <Wrench className="h-4 w-4 ml-2" />
              الصيانة
            </TabsTrigger>
            <TabsTrigger value="bank">
              <CreditCard className="h-4 w-4 ml-2" />
              كشف البنك
            </TabsTrigger>
          </TabsList>

          {/* العقارات المؤجرة */}
          <TabsContent value="properties" className="space-y-4">
            {properties.length === 0 ? (
              <EmptyState 
                icon={Building2} 
                title="لا توجد عقارات مؤجرة" 
                description="لم يتم العثور على عقارات مؤجرة حالياً" 
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-right py-3 px-4">اسم العقار</th>
                      <th className="text-right py-3 px-4">الموقع</th>
                      <th className="text-right py-3 px-4">النوع</th>
                      <th className="text-right py-3 px-4">المستأجر</th>
                      <th className="text-right py-3 px-4">الإيجار الشهري</th>
                      <th className="text-right py-3 px-4">تاريخ الانتهاء</th>
                    </tr>
                  </thead>
                  <tbody>
                    {properties.map((property: any) => (
                      <tr key={property.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">{property.name}</td>
                        <td className="py-3 px-4">{property.location}</td>
                        <td className="py-3 px-4">{property.property_type}</td>
                        <td className="py-3 px-4">{property.contracts[0]?.tenant_name}</td>
                        <td className="py-3 px-4 font-semibold text-primary">
                          {Number(property.contracts[0]?.monthly_rent).toLocaleString("ar-SA")} ر.س
                        </td>
                        <td className="py-3 px-4">
                          {new Date(property.contracts[0]?.end_date).toLocaleDateString("ar-SA")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>

          {/* العقود */}
          <TabsContent value="contracts" className="space-y-4">
            {contracts.length === 0 ? (
              <EmptyState 
                icon={FileText} 
                title="لا توجد عقود نشطة" 
                description="لم يتم العثور على عقود نشطة" 
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-right py-3 px-4">رقم العقد</th>
                      <th className="text-right py-3 px-4">العقار</th>
                      <th className="text-right py-3 px-4">المستأجر</th>
                      <th className="text-right py-3 px-4">الإيجار الشهري</th>
                      <th className="text-right py-3 px-4">تاريخ البداية</th>
                      <th className="text-right py-3 px-4">تاريخ الانتهاء</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contracts.map((contract: any) => (
                      <tr key={contract.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">{contract.contract_number}</td>
                        <td className="py-3 px-4">{contract.properties?.name}</td>
                        <td className="py-3 px-4">{contract.tenant_name}</td>
                        <td className="py-3 px-4 font-semibold text-primary">
                          {Number(contract.monthly_rent).toLocaleString("ar-SA")} ر.س
                        </td>
                        <td className="py-3 px-4">
                          {new Date(contract.start_date).toLocaleDateString("ar-SA")}
                        </td>
                        <td className="py-3 px-4">
                          {new Date(contract.end_date).toLocaleDateString("ar-SA")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>

          {/* الصيانة */}
          <TabsContent value="maintenance" className="space-y-4">
            {maintenance.length === 0 ? (
              <EmptyState 
                icon={Wrench} 
                title="لا توجد طلبات صيانة" 
                description="لم يتم العثور على طلبات صيانة" 
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-right py-3 px-4">رقم الطلب</th>
                      <th className="text-right py-3 px-4">العقار</th>
                      <th className="text-right py-3 px-4">الوصف</th>
                      <th className="text-right py-3 px-4">الحالة</th>
                      <th className="text-right py-3 px-4">التكلفة</th>
                      <th className="text-right py-3 px-4">التاريخ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {maintenance.map((item: any) => (
                      <tr key={item.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">{item.request_number}</td>
                        <td className="py-3 px-4">{item.properties?.name}</td>
                        <td className="py-3 px-4">{item.description}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs ${
                            item.status === 'مكتمل' ? 'bg-success/20 text-success' :
                            item.status === 'قيد التنفيذ' ? 'bg-warning/20 text-warning' :
                            'bg-muted text-muted-foreground'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold">
                          {item.actual_cost ? `${Number(item.actual_cost).toLocaleString("ar-SA")} ر.س` : '-'}
                        </td>
                        <td className="py-3 px-4">
                          {new Date(item.request_date).toLocaleDateString("ar-SA")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>

          {/* كشف البنك */}
          <TabsContent value="bank" className="space-y-4">
            {bankTransactions.length === 0 ? (
              <EmptyState 
                icon={CreditCard} 
                title="لا توجد حركات بنكية" 
                description="لم يتم العثور على حركات بنكية" 
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-right py-3 px-4">التاريخ</th>
                      <th className="text-right py-3 px-4">الوصف</th>
                      <th className="text-right py-3 px-4">النوع</th>
                      <th className="text-right py-3 px-4">المبلغ</th>
                      <th className="text-right py-3 px-4">المرجع</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bankTransactions.map((transaction: any) => (
                      <tr key={transaction.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">
                          {new Date(transaction.transaction_date).toLocaleDateString("ar-SA")}
                        </td>
                        <td className="py-3 px-4">{transaction.description}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs ${
                            transaction.transaction_type === 'deposit' ? 'bg-success/20 text-success' :
                            'bg-destructive/20 text-destructive'
                          }`}>
                            {transaction.transaction_type === 'deposit' ? 'إيداع' : 'سحب'}
                          </span>
                        </td>
                        <td className={`py-3 px-4 font-semibold ${
                          transaction.transaction_type === 'deposit' ? 'text-success' : 'text-destructive'
                        }`}>
                          {transaction.transaction_type === 'deposit' ? '+' : '-'}
                          {Number(transaction.amount).toLocaleString("ar-SA")} ر.س
                        </td>
                        <td className="py-3 px-4 text-muted-foreground text-sm">
                          {transaction.reference_number || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}