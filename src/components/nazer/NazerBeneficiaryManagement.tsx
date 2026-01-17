/**
 * إدارة المستفيدين السريعة للناظر
 * عرض قائمة المستفيدين مع إجراءات سريعة
 */
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { useNazerBeneficiariesQuick } from "@/hooks/nazer/useNazerBeneficiariesQuick";
import { 
  Users, Search, Eye, Edit, UserPlus, 
  ChevronLeft, Phone, Mail, Wallet,
  UserCheck, UserX
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { matchesStatus } from "@/lib/constants";

export function NazerBeneficiaryManagement() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: beneficiaries = [], isLoading } = useNazerBeneficiariesQuick();

  const filteredBeneficiaries = beneficiaries.filter(b => 
    b.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.phone?.includes(searchQuery) ||
    b.national_id?.includes(searchQuery)
  );

  const stats = {
    total: beneficiaries.length,
    active: beneficiaries.filter(b => matchesStatus(b.status, 'active')).length,
    inactive: beneficiaries.filter(b => !matchesStatus(b.status, 'active')).length,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "نشط":
        return <Badge className="bg-status-success/10 text-status-success border-status-success/20">نشط</Badge>;
      case "متوقف":
        return <Badge className="bg-status-warning/10 text-status-warning border-status-warning/20">متوقف</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle>إدارة المستفيدين</CardTitle>
          </div>
          <Button onClick={() => navigate("/beneficiaries")} variant="ghost" size="sm" className="gap-1">
            عرض الكل
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>إدارة سريعة للمستفيدين والورثة</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* الإحصائيات السريعة */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-primary">{stats.total}</p>
            <p className="text-xs text-muted-foreground">إجمالي</p>
          </div>
          <div className="bg-status-success/10 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-status-success">{stats.active}</p>
            <p className="text-xs text-muted-foreground">نشط</p>
          </div>
          <div className="bg-status-warning/10 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-status-warning">{stats.inactive}</p>
            <p className="text-xs text-muted-foreground">غير نشط</p>
          </div>
        </div>

        {/* البحث */}
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="بحث بالاسم أو الهاتف أو الهوية..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pe-10"
          />
        </div>

        {/* قائمة المستفيدين */}
        <ScrollArea className="h-[300px]">
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredBeneficiaries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>لا يوجد مستفيدون</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredBeneficiaries.map((beneficiary) => (
                <div 
                  key={beneficiary.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {beneficiary.full_name?.charAt(0) || "؟"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{beneficiary.full_name}</p>
                        {getStatusBadge(beneficiary.status)}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                        {beneficiary.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {beneficiary.phone}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Wallet className="h-3 w-3" />
                          {formatCurrency(beneficiary.total_received || 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => navigate(`/beneficiaries/${beneficiary.id}`)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => navigate(`/beneficiaries/${beneficiary.id}`)}
                      title="تعديل المستفيد"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* زر إضافة مستفيد */}
        <Button 
          onClick={() => navigate("/beneficiaries")} 
          className="w-full gap-2"
          variant="outline"
        >
          <UserPlus className="h-4 w-4" />
          إضافة مستفيد جديد
        </Button>
      </CardContent>
    </Card>
  );
}
