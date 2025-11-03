import { useState } from "react";
import { Plus, Search, Filter, Download, MoreVertical } from "lucide-react";
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

const Beneficiaries = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const beneficiaries = [
    {
      id: 1,
      name: "أحمد محمد العلي",
      idNumber: "1234567890",
      family: "عائلة العلي",
      category: "الفئة الأولى",
      status: "نشط",
      phone: "0501234567",
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
      totalPayments: "6,200 ر.س",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gradient-primary">
              إدارة المستفيدين
            </h1>
            <p className="text-muted-foreground mt-1">
              إدارة حسابات المستفيدين والموقوف عليهم
            </p>
          </div>
          <Button className="bg-primary hover:bg-primary-hover text-primary-foreground shadow-soft">
            <Plus className="ml-2 h-5 w-5" />
            إضافة مستفيد جديد
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
              <Button variant="outline" className="shadow-soft">
                <Filter className="ml-2 h-5 w-5" />
                تصفية متقدمة
              </Button>
              <Button variant="outline" className="shadow-soft">
                <Download className="ml-2 h-5 w-5" />
                تصدير البيانات
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                إجمالي المستفيدين
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">1,247</div>
            </CardContent>
          </Card>
          <Card className="shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                المستفيدين النشطين
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-success">1,189</div>
            </CardContent>
          </Card>
          <Card className="shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                المعلقين
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-warning">58</div>
            </CardContent>
          </Card>
          <Card className="shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                العائلات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">324</div>
            </CardContent>
          </Card>
        </div>

        {/* Beneficiaries Table */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>قائمة المستفيدين</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">الاسم</TableHead>
                  <TableHead className="text-right">رقم الهوية</TableHead>
                  <TableHead className="text-right">العائلة</TableHead>
                  <TableHead className="text-right">الفئة</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">رقم الهاتف</TableHead>
                  <TableHead className="text-right">إجمالي المدفوعات</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {beneficiaries.map((beneficiary) => (
                  <TableRow key={beneficiary.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      {beneficiary.name}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {beneficiary.idNumber}
                    </TableCell>
                    <TableCell>{beneficiary.family}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{beneficiary.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          beneficiary.status === "نشط"
                            ? "bg-success/10 text-success hover:bg-success/20"
                            : "bg-warning/10 text-warning hover:bg-warning/20"
                        }
                      >
                        {beneficiary.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {beneficiary.phone}
                    </TableCell>
                    <TableCell className="font-semibold text-primary">
                      {beneficiary.totalPayments}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuItem>عرض التفاصيل</DropdownMenuItem>
                          <DropdownMenuItem>تعديل البيانات</DropdownMenuItem>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Beneficiaries;
