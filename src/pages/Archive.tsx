import { useState } from "react";
import { Plus, Search, FolderOpen, FileText, Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Archive = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const folders = [
    { id: 1, name: "عقود الإيجار", files: 45, size: "12.3 MB", color: "bg-primary/10 text-primary" },
    { id: 2, name: "مستندات المستفيدين", files: 234, size: "45.7 MB", color: "bg-success/10 text-success" },
    { id: 3, name: "سندات القبض والصرف", files: 156, size: "28.9 MB", color: "bg-warning/10 text-warning" },
    { id: 4, name: "التقارير المالية", files: 78, size: "34.2 MB", color: "bg-accent/10 text-accent" },
  ];

  const recentFiles = [
    {
      id: 1,
      name: "عقد إيجار - مبنى النخيل",
      type: "PDF",
      size: "2.4 MB",
      date: "2024-08-15",
      category: "عقود الإيجار",
    },
    {
      id: 2,
      name: "هوية - أحمد محمد العلي",
      type: "PNG",
      size: "1.2 MB",
      date: "2024-08-14",
      category: "مستندات المستفيدين",
    },
    {
      id: 3,
      name: "سند صرف - محرم 1446",
      type: "PDF",
      size: "856 KB",
      date: "2024-08-13",
      category: "سندات القبض والصرف",
    },
    {
      id: 4,
      name: "تقرير مالي - Q2 2024",
      type: "PDF",
      size: "3.1 MB",
      date: "2024-08-12",
      category: "التقارير المالية",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gradient-primary">
              الأرشيف الإلكتروني
            </h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">
              إدارة وأرشفة المستندات والملفات
            </p>
          </div>
          <Button className="bg-primary hover:bg-primary-hover text-primary-foreground shadow-soft w-full md:w-auto">
            <Upload className="ml-2 h-4 w-4 md:h-5 md:w-5" />
            <span className="text-sm md:text-base">رفع مستند</span>
          </Button>
        </div>

        {/* Search */}
        <Card className="shadow-soft">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="البحث في الأرشيف (اسم الملف، المستفيد، نوع المستند...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                إجمالي المستندات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">3,456</div>
            </CardContent>
          </Card>
          <Card className="shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                المجلدات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-success">24</div>
            </CardContent>
          </Card>
          <Card className="shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                الحجم الكلي
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-warning">245 MB</div>
            </CardContent>
          </Card>
          <Card className="shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                مضاف هذا الشهر
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">87</div>
            </CardContent>
          </Card>
        </div>

        {/* Folders */}
        <Card className="shadow-soft">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl font-bold">المجلدات الرئيسية</CardTitle>
              <Button variant="outline" size="sm">
                <Plus className="ml-2 h-4 w-4" />
                مجلد جديد
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {folders.map((folder) => (
                <div
                  key={folder.id}
                  className="p-4 rounded-lg border border-border hover:border-primary hover:shadow-soft transition-all duration-300 cursor-pointer group"
                >
                  <div className={`w-12 h-12 rounded-lg ${folder.color} flex items-center justify-center mb-3`}>
                    <FolderOpen className="h-6 w-6" />
                  </div>
                  <h3 className="font-medium text-foreground group-hover:text-primary transition-colors mb-2">
                    {folder.name}
                  </h3>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{folder.files} ملف</span>
                    <span>{folder.size}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Files */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-xl font-bold">المستندات الأخيرة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">
                        {file.name}
                      </h4>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                        <span>{file.date}</span>
                        <span>•</span>
                        <Badge variant="outline" className="text-xs">
                          {file.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-left">
                      <div className="text-sm font-medium">{file.type}</div>
                      <div className="text-xs text-muted-foreground">{file.size}</div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Archive;
