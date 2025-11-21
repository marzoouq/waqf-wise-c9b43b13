import { useState, useMemo, useCallback } from "react";
import { Plus, Search, Filter, Download, MoreVertical, Users, UserCheck, UserX, Home, Eye, FileText, Activity, Save, Star, Key, Shield, Edit, Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useBeneficiaries } from "@/hooks/useBeneficiaries";
import { useSavedSearches } from "@/hooks/useSavedSearches";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Beneficiary } from "@/types/beneficiary";
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
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import BeneficiaryDialog from "@/components/beneficiaries/BeneficiaryDialog";
import { AdvancedSearchDialog, SearchCriteria } from "@/components/beneficiaries/AdvancedSearchDialog";
import { AttachmentsDialog } from "@/components/beneficiaries/AttachmentsDialog";
import { ActivityLogDialog } from "@/components/beneficiaries/ActivityLogDialog";
import { EnableLoginDialog } from "@/components/beneficiaries/EnableLoginDialog";
import { TribeManagementDialog } from "@/components/beneficiaries/TribeManagementDialog";
import { BeneficiariesPrintButton } from "@/components/beneficiaries/BeneficiariesPrintButton";
import { BeneficiariesImporter } from "@/components/beneficiaries/BeneficiariesImporter";
import { FamilyManagement } from "@/components/beneficiaries/FamilyManagement";
import { BeneficiaryProfile } from "@/components/beneficiaries/BeneficiaryProfile";
import { Pagination } from "@/components/ui/pagination";
import { useNavigate } from "react-router-dom";
import { ScrollableTableWrapper } from "@/components/shared/ScrollableTableWrapper";
import { MobileScrollHint } from "@/components/shared/MobileScrollHint";
import { MobileOptimizedLayout, MobileOptimizedHeader } from "@/components/layout/MobileOptimizedLayout";

const ITEMS_PER_PAGE = 20;

const Beneficiaries = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [advancedSearchOpen, setAdvancedSearchOpen] = useState(false);
  const [attachmentsDialogOpen, setAttachmentsDialogOpen] = useState(false);
  const [activityLogDialogOpen, setActivityLogDialogOpen] = useState(false);
  const [enableLoginDialogOpen, setEnableLoginDialogOpen] = useState(false);
  const [tribeManagementDialogOpen, setTribeManagementDialogOpen] = useState(false);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<Beneficiary | null>(null);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [showFamilyManagement, setShowFamilyManagement] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [advancedCriteria, setAdvancedCriteria] = useState<SearchCriteria>({});

  const { beneficiaries, totalCount, isLoading, addBeneficiary, updateBeneficiary, deleteBeneficiary } = useBeneficiaries();
  const { searches, saveSearch, deleteSearch } = useSavedSearches();

  // Memoize filtered beneficiaries with advanced search
  const filteredBeneficiaries = useMemo(() => {
    let results = beneficiaries;
    
    // Apply quick search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        (b) =>
          b.full_name.toLowerCase().includes(query) ||
          b.national_id.includes(query) ||
          b.phone.includes(query) ||
          (b.family_name && b.family_name.toLowerCase().includes(query))
      );
    }
    
    // Apply advanced criteria
    if (advancedCriteria.fullName) {
      results = results.filter(b => b.full_name.toLowerCase().includes(advancedCriteria.fullName!.toLowerCase()));
    }
    if (advancedCriteria.nationalId) {
      results = results.filter(b => b.national_id.includes(advancedCriteria.nationalId!));
    }
    if (advancedCriteria.phone) {
      results = results.filter(b => b.phone.includes(advancedCriteria.phone!));
    }
    if (advancedCriteria.category) {
      results = results.filter(b => b.category === advancedCriteria.category);
    }
    if (advancedCriteria.status) {
      results = results.filter(b => b.status === advancedCriteria.status);
    }
    if (advancedCriteria.tribe) {
      results = results.filter(b => b.tribe && b.tribe.toLowerCase().includes(advancedCriteria.tribe!.toLowerCase()));
    }
    if (advancedCriteria.city) {
      results = results.filter(b => b.city && b.city.toLowerCase().includes(advancedCriteria.city!.toLowerCase()));
    }
    if (advancedCriteria.gender) {
      results = results.filter(b => b.gender === advancedCriteria.gender);
    }
    if (advancedCriteria.maritalStatus) {
      results = results.filter(b => b.marital_status === advancedCriteria.maritalStatus);
    }
    if (advancedCriteria.priorityLevel) {
      results = results.filter(b => String(b.priority_level || 1) === advancedCriteria.priorityLevel);
    }
    
    return results;
  }, [beneficiaries, searchQuery, advancedCriteria]);

  // Paginate filtered results
  const paginatedBeneficiaries = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredBeneficiaries.slice(startIndex, endIndex);
  }, [filteredBeneficiaries, currentPage]);

  const totalPages = Math.ceil(filteredBeneficiaries.length / ITEMS_PER_PAGE);

  // Memoize stats
  const stats = useMemo(() => ({
    total: beneficiaries.length,
    active: beneficiaries.filter(b => b.status === "نشط").length,
    suspended: beneficiaries.filter(b => b.status === "معلق").length,
    families: new Set(beneficiaries.map(b => b.family_name).filter(Boolean)).size,
  }), [beneficiaries]);

  const handleAddBeneficiary = useCallback(() => {
    setSelectedBeneficiary(null);
    setDialogOpen(true);
  }, []);

  const handleEditBeneficiary = useCallback((beneficiary: Beneficiary) => {
    setSelectedBeneficiary(beneficiary);
    setDialogOpen(true);
  }, []);

  const handleSaveBeneficiary = async (data: Omit<Beneficiary, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      if (selectedBeneficiary) {
        await updateBeneficiary({ id: selectedBeneficiary.id, ...data });
      } else {
        await addBeneficiary(data);
      }
      setDialogOpen(false);
    } catch (error) {
      // Error is handled by the mutation's onError callback
    }
  };

  const handleDeleteBeneficiary = useCallback(async (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذا المستفيد؟")) {
      await deleteBeneficiary(id);
    }
  }, [deleteBeneficiary]);

  const handleAdvancedSearch = (criteria: SearchCriteria) => {
    setAdvancedCriteria(criteria);
    setCurrentPage(1);
  };

  const handleViewProfile = (beneficiary: Beneficiary) => {
    setSelectedBeneficiary(beneficiary);
    setProfileDialogOpen(true);
  };

  const handleViewAttachments = (beneficiary: Beneficiary) => {
    setSelectedBeneficiary(beneficiary);
    setAttachmentsDialogOpen(true);
  };

  const handleViewActivity = (beneficiary: Beneficiary) => {
    setSelectedBeneficiary(beneficiary);
    setActivityLogDialogOpen(true);
  };

  const handleLoadSavedSearch = (search: { search_criteria: unknown }) => {
    setAdvancedCriteria(search.search_criteria as SearchCriteria);
    setCurrentPage(1);
  };

  const handleEnableLogin = (beneficiary: Beneficiary) => {
    setSelectedBeneficiary(beneficiary);
    setEnableLoginDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 md:p-8 lg:p-10 space-y-6 md:space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gradient-primary">
              سجل المستفيدين
            </h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">
              إدارة بيانات الأفراد المستفيدين من الوقف
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline"
              onClick={() => setShowFamilyManagement(!showFamilyManagement)}
              size="sm"
            >
              <Users className="ml-2 h-4 w-4" />
              {showFamilyManagement ? "المستفيدين" : "العائلات"}
            </Button>
            <BeneficiariesPrintButton beneficiaries={filteredBeneficiaries} />
            <BeneficiariesImporter onSuccess={() => queryClient.invalidateQueries({ queryKey: ['beneficiaries'] })} />
            <Button 
              className="bg-primary hover:bg-primary-hover text-primary-foreground shadow-soft hover:shadow-medium transition-all duration-300"
              onClick={handleAddBeneficiary}
              size="sm"
            >
              <Plus className="ml-2 h-4 w-4" />
              إضافة مستفيد
            </Button>
          </div>
        </div>

        {/* Filters and Search */}
        {!showFamilyManagement && (
          <Card className="shadow-soft">
            <CardContent className="pt-3 sm:pt-6 p-3 sm:p-6">
            <div className="flex flex-col gap-3 sm:gap-4">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                <Input
                  placeholder="البحث (الاسم، رقم الهوية، العائلة...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-9 sm:pr-10 text-sm sm:text-base"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setAdvancedSearchOpen(true)} 
                  className="flex-1 sm:flex-none gap-2 text-xs sm:text-sm" 
                  size="sm"
                >
                  <Filter className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">بحث متقدم</span>
                  <span className="sm:hidden">بحث</span>
                </Button>
                {searches.length > 0 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                        <Save className="h-3 w-3 sm:h-4 sm:w-4 ml-2" />
                        عمليات بحث
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {searches.map((search) => (
                        <DropdownMenuItem key={search.id} onClick={() => handleLoadSavedSearch(search)}>
                          {search.is_favorite && <Star className="ml-2 h-3 w-3 fill-current" />}
                          {search.name}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
                <Button 
                  variant="outline" 
                  onClick={() => setTribeManagementDialogOpen(true)}
                  className="flex-1 sm:flex-none gap-2 text-xs sm:text-sm"
                  size="sm"
                >
                  <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">القبائل</span>
                  <span className="sm:hidden">قبائل</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        )}

        {/* Family Management View */}
        {showFamilyManagement ? (
          <FamilyManagement />
        ) : (
          <>
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
              <div className="text-2xl md:text-3xl font-bold text-primary">{stats.total}</div>
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
              <div className="text-2xl md:text-3xl font-bold text-success">{stats.active}</div>
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
              <div className="text-2xl md:text-3xl font-bold text-warning">{stats.suspended}</div>
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
              <div className="text-2xl md:text-3xl font-bold text-accent">{stats.families}</div>
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
            <MobileScrollHint />
            <ScrollableTableWrapper>
              <div className="min-w-max">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="text-right font-semibold whitespace-nowrap text-xs sm:text-sm">رقم المستفيد</TableHead>
                      <TableHead className="text-right font-semibold whitespace-nowrap text-xs sm:text-sm">الاسم</TableHead>
                      <TableHead className="text-right font-semibold whitespace-nowrap text-xs sm:text-sm hidden md:table-cell">رقم الهوية</TableHead>
                      <TableHead className="text-right font-semibold whitespace-nowrap text-xs sm:text-sm hidden lg:table-cell">العائلة</TableHead>
                      <TableHead className="text-right font-semibold whitespace-nowrap text-xs sm:text-sm hidden lg:table-cell">الفئة</TableHead>
                      <TableHead className="text-right font-semibold whitespace-nowrap text-xs sm:text-sm">الحالة</TableHead>
                      <TableHead className="text-right font-semibold whitespace-nowrap text-xs sm:text-sm hidden md:table-cell">رقم الهاتف</TableHead>
                      <TableHead className="text-right font-semibold whitespace-nowrap text-xs sm:text-sm hidden lg:table-cell">إجمالي المدفوعات</TableHead>
                      <TableHead className="text-right font-semibold whitespace-nowrap text-xs sm:text-sm">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        جاري التحميل...
                      </TableCell>
                    </TableRow>
                  ) : paginatedBeneficiaries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        {searchQuery ? "لا توجد نتائج تطابق البحث" : "لا يوجد مستفيدين حالياً. قم بإضافة مستفيد جديد."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedBeneficiaries.map((beneficiary) => (
                      <TableRow key={beneficiary.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell className="font-mono text-xs sm:text-sm">
                          <Badge variant="secondary" className="whitespace-nowrap text-xs">
                            {beneficiary.beneficiary_number || 'قيد الإنشاء'}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium text-xs sm:text-sm">
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <span className="text-primary font-semibold text-xs sm:text-sm">
                                {beneficiary.full_name.charAt(0)}
                              </span>
                            </div>
                            <span className="truncate max-w-[100px] sm:max-w-[150px] md:max-w-none">{beneficiary.full_name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-xs sm:text-sm hidden md:table-cell">
                          {beneficiary.national_id}
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm hidden lg:table-cell">{beneficiary.family_name || "-"}</TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <Badge variant="outline" className="border-primary/30 text-xs">{beneficiary.category}</Badge>
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm">
                          <Badge
                            className={
                              beneficiary.status === "نشط"
                                ? "bg-success/10 text-success hover:bg-success/20 border border-success/30 text-xs"
                                : "bg-warning/10 text-warning hover:bg-warning/20 border border-warning/30 text-xs"
                            }
                          >
                            {beneficiary.status}
                          </Badge>
                          {beneficiary.can_login && (
                            <Badge variant="outline" className="mr-1 bg-primary/10 text-primary border-primary/30 text-xs">
                              <Key className="h-2 w-2 sm:h-3 sm:w-3 ml-1" />
                              مفعل
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-xs sm:text-sm hidden md:table-cell">
                          {beneficiary.phone}
                        </TableCell>
                        <TableCell className="font-semibold text-primary text-xs sm:text-sm hidden lg:table-cell">
                          -
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem onClick={() => handleViewProfile(beneficiary)}>
                                <Eye className="ml-2 h-4 w-4" />
                                عرض الملف الكامل
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleViewProfile(beneficiary)}>
                                <Eye className="ml-2 h-4 w-4" />
                                عرض الملف الشخصي
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditBeneficiary(beneficiary)}>
                                <Edit className="ml-2 h-4 w-4" />
                                تعديل البيانات
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleViewAttachments(beneficiary)}>
                                <FileText className="ml-2 h-4 w-4" />
                                المرفقات
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleViewActivity(beneficiary)}>
                                <Activity className="ml-2 h-4 w-4" />
                                سجل النشاط
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleEnableLogin(beneficiary)}>
                                <Key className="ml-2 h-4 w-4" />
                                {beneficiary.can_login ? "إدارة الحساب" : "تفعيل حساب الدخول"}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => handleDeleteBeneficiary(beneficiary.id)}
                              >
                                <Trash2 className="ml-2 h-4 w-4" />
                                حذف المستفيد
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </ScrollableTableWrapper>
          {totalPages > 1 && (
            <div className="p-4 border-t">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={ITEMS_PER_PAGE}
                totalItems={filteredBeneficiaries.length}
              />
            </div>
          )}
        </CardContent>
        </Card>
          </>
        )}

        {/* Beneficiary Dialog */}
        <BeneficiaryDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          beneficiary={selectedBeneficiary}
          onSave={handleSaveBeneficiary}
        />
        
        <AdvancedSearchDialog
          open={advancedSearchOpen}
          onOpenChange={setAdvancedSearchOpen}
          onSearch={handleAdvancedSearch}
        />

        {selectedBeneficiary && (
          <>
            <AttachmentsDialog
              open={attachmentsDialogOpen}
              onOpenChange={setAttachmentsDialogOpen}
              beneficiaryId={selectedBeneficiary.id}
              beneficiaryName={selectedBeneficiary.full_name}
            />

            <ActivityLogDialog
              open={activityLogDialogOpen}
              onOpenChange={setActivityLogDialogOpen}
              beneficiaryId={selectedBeneficiary.id}
              beneficiaryName={selectedBeneficiary.full_name}
            />

            <EnableLoginDialog
              open={enableLoginDialogOpen}
              onOpenChange={setEnableLoginDialogOpen}
              beneficiary={selectedBeneficiary}
              onSuccess={() => {
                queryClient.invalidateQueries({ queryKey: ["beneficiaries"] });
              }}
            />
            
            <BeneficiaryProfile
              beneficiaryId={selectedBeneficiary.id}
              open={profileDialogOpen}
              onOpenChange={setProfileDialogOpen}
            />
            
            <TribeManagementDialog
              open={tribeManagementDialogOpen}
              onOpenChange={setTribeManagementDialogOpen}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Beneficiaries;
