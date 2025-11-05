import { useState } from "react";
import { Plus, Search, Filter, Download, MoreVertical, Users, UserCheck, UserX, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import BeneficiaryDialog from "@/components/beneficiaries/BeneficiaryDialog";

const Beneficiaries = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<any>(null);

  const beneficiaries = [
    {
      id: 1,
      name: "أحمد محمد العلي",
      idNumber: "1234567890",
      family: "عائلة العلي",
      category: "الفئة الأولى",
      status: "نشط",
      phone: "0501234567",
      email: "ahmad@example.com",
      address: "الرياض - حي النخيل",
      notes: "مستفيد منتظم",
      totalPayments: "12,000 ر.س",
    },
    {
      id: 2,
      name: "فاطمة علي أحمد",
      idNumber: "0987654321",
      family: "عائلة أحمد",
      category: "الفئة الثانية",
      status: "نشط",
      phone: "0507654321",
      email: "fatima@example.com",
      address: "جدة - حي الزهراء",
      notes: "",
      totalPayments: "8,500 ر.س",
    },
    {
      id: 3,
      name: "محمد سالم خالد",
      idNumber: "1122334455",
      family: "عائلة خالد",
      category: "الفئة الأولى",
      status: "معلق",
      phone: "0509876543",
      email: "",
      address: "الدمام - حي الفيصلية",
      notes: "بحاجة إلى تحديث البيانات",
      totalPayments: "15,000 ر.س",
    },
    {
      id: 4,
      name: "سارة خالد محمد",
      idNumber: "5544332211",
      family: "عائلة محمد",
      category: "الفئة الثالثة",
      status: "نشط",
      phone: "0502345678",
      email: "sara@example.com",
      address: "مكة المكرمة - حي العزيزية",
      notes: "",
      totalPayments: "6,200 ر.س",
    },
  ];

  const handleAddBeneficiary = () => {
    setSelectedBeneficiary(null);
    setDialogOpen(true);
  };

  const handleEditBeneficiary = (beneficiary: any) => {
    setSelectedBeneficiary(beneficiary);
    setDialogOpen(true);
  };

  const handleSaveBeneficiary = (data: any) => {
    console.log("Saving beneficiary:", data);
    // TODO: Save to database using Supabase
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gradient-primary">
              إدارة المستفيدين
            </h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">
              إدارة حسابات المستفيدين والموقوف عليهم
            </p>
          </div>
          <Button 
            className="bg-primary hover:bg-primary-hover text-primary-foreground shadow-soft hover:shadow-medium transition-all duration-300 w-full md:w-auto"
            onClick={handleAddBeneficiary}
          >
            <Plus className="ml-2 h-4 w-4 md:h-5 md:w-5" />
            <span className="text-sm md:text-base">إضافة مستفيد جديد</span>
          </Button>
        </div>

        {/* Filters and Search */}
        <Card className="shadow-soft">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="البحث عن مستفيد (الاسم، رقم الهوية، العائلة...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
              </div>
              <Button variant="outline" className="shadow-soft hover:shadow-medium transition-all duration-300 hover:bg-primary hover:text-primary-foreground border-primary/20">
                <Filter className="ml-2 h-4 w-4 md:h-5 md:w-5" />
                <span className="hidden md:inline">تصفية متقدمة</span>
                <span className="md:hidden">تصفية</span>
              </Button>
              <Button variant="outline" className="shadow-soft hover:shadow-medium transition-all duration-300 hover:bg-accent hover:text-accent-foreground border-accent/20">
                <Download className="ml-2 h-4 w-4 md:h-5 md:w-5" />
                <span className="hidden md:inline">تصدير البيانات</span>
                <span className="md:hidden">تصدير</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <Card className="shadow-soft hover:shadow-medium transition-all duration-300 border-l-4 border-l-primary">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
                إجمالي المستفيدين
              </CardTitle>
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="h-4 w-4 md:h-5 md:w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl md:text-3xl font-bold text-primary">1,247</div>
              <p className="text-xs text-muted-foreground mt-1">جميع الحسابات</p>
            </CardContent>
          </Card>
          
          <Card className="shadow-soft hover:shadow-medium transition-all duration-300 border-l-4 border-l-success">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
                المستفيدين النشطين
              </CardTitle>
              <div className="p-2 bg-success/10 rounded-lg">
                <UserCheck className="h-4 w-4 md:h-5 md:w-5 text-success" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl md:text-3xl font-bold text-success">1,189</div>
              <p className="text-xs text-muted-foreground mt-1">حسابات نشطة</p>
            </CardContent>
          </Card>
          
          <Card className="shadow-soft hover:shadow-medium transition-all duration-300 border-l-4 border-l-warning">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
                المعلقين
              </CardTitle>
              <div className="p-2 bg-warning/10 rounded-lg">
                <UserX className="h-4 w-4 md:h-5 md:w-5 text-warning" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl md:text-3xl font-bold text-warning">58</div>
              <p className="text-xs text-muted-foreground mt-1">حسابات معلقة</p>
            </CardContent>
          </Card>
          
          <Card className="shadow-soft hover:shadow-medium transition-all duration-300 border-l-4 border-l-accent">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
                العائلات
              </CardTitle>
              <div className="p-2 bg-accent/10 rounded-lg">
                <Home className="h-4 w-4 md:h-5 md:w-5 text-accent" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl md:text-3xl font-bold text-accent">324</div>
              <p className="text-xs text-muted-foreground mt-1">عائلات مسجلة</p>
            </CardContent>
          </Card>
        </div>

        {/* Beneficiaries Table */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">قائمة المستفيدين</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="text-right font-semibold">الاسم</TableHead>
                    <TableHead className="text-right font-semibold hidden md:table-cell">رقم الهوية</TableHead>
                    <TableHead className="text-right font-semibold hidden lg:table-cell">العائلة</TableHead>
                    <TableHead className="text-right font-semibold hidden lg:table-cell">الفئة</TableHead>
                    <TableHead className="text-right font-semibold">الحالة</TableHead>
                    <TableHead className="text-right font-semibold hidden md:table-cell">رقم الهاتف</TableHead>
                    <TableHead className="text-right font-semibold hidden lg:table-cell">إجمالي المدفوعات</TableHead>
                    <TableHead className="text-right font-semibold">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {beneficiaries.map((beneficiary) => (
                    <TableRow key={beneficiary.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-primary font-semibold text-sm">
                              {beneficiary.name.charAt(0)}
                            </span>
                          </div>
                          <span className="truncate max-w-[150px] md:max-w-none">{beneficiary.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm hidden md:table-cell">
                        {beneficiary.idNumber}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">{beneficiary.family}</TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <Badge variant="outline" className="border-primary/30">{beneficiary.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            beneficiary.status === "نشط"
                              ? "bg-success/10 text-success hover:bg-success/20 border border-success/30"
                              : "bg-warning/10 text-warning hover:bg-warning/20 border border-warning/30"
                          }
                        >
                          {beneficiary.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm hidden md:table-cell">
                        {beneficiary.phone}
                      </TableCell>
                      <TableCell className="font-semibold text-primary hidden lg:table-cell">
                        {beneficiary.totalPayments}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start">
                            <DropdownMenuItem onClick={() => handleEditBeneficiary(beneficiary)}>
                              عرض التفاصيل
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditBeneficiary(beneficiary)}>
                              تعديل البيانات
                            </DropdownMenuItem>
                            <DropdownMenuItem>سجل النشاط</DropdownMenuItem>
                            <DropdownMenuItem>المستندات</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              تعطيل الحساب
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Beneficiary Dialog */}
        <BeneficiaryDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          beneficiary={selectedBeneficiary}
          onSave={handleSaveBeneficiary}
        />
      </div>
    </div>
  );
};

export default Beneficiaries;
