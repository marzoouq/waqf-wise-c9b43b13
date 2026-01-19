/**
 * صفحة مجالس الحوكمة
 * @version 1.0.0
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Building2, Users, Plus, UserPlus, Trash2, Edit, Eye } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { UnifiedStatsGrid } from "@/components/unified/UnifiedStatsGrid";
import { UnifiedKPICard } from "@/components/unified/UnifiedKPICard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGovernanceBoards, useBoardsStats, useCreateBoard, useDeleteBoard, useBoardMembers, useAddBoardMember, useRemoveBoardMember } from "@/hooks/governance/useGovernanceBoards";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import type { Database } from "@/integrations/supabase/types";

type BoardInsert = Database['public']['Tables']['governance_boards']['Insert'];
type MemberInsert = Database['public']['Tables']['governance_board_members']['Insert'];

const GovernanceBoards = () => {
  const { data: boards, isLoading: boardsLoading } = useGovernanceBoards();
  const { data: stats, isLoading: statsLoading } = useBoardsStats();
  const createBoard = useCreateBoard();
  const deleteBoard = useDeleteBoard();
  
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);
  const [membersDialogOpen, setMembersDialogOpen] = useState(false);
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false);
  
  const [newBoard, setNewBoard] = useState<Partial<BoardInsert>>({
    board_name_ar: '',
    board_type: 'رئيسي',
    chairman_name: '',
    quorum_requirement: 3,
    status: 'نشط',
  });

  const [newMember, setNewMember] = useState<Partial<MemberInsert>>({
    member_name: '',
    position: '',
    member_title: '',
    membership_type: 'دائم',
    voting_rights: true,
    is_active: true,
  });

  const { data: boardMembers, isLoading: membersLoading } = useBoardMembers(selectedBoardId || '');
  const addMember = useAddBoardMember();
  const removeMember = useRemoveBoardMember();

  const handleCreateBoard = async () => {
    if (!newBoard.board_name_ar || !newBoard.chairman_name) return;
    
    const boardCode = `BOD-${Date.now().toString().slice(-6)}`;
    
    await createBoard.mutateAsync({
      board_code: boardCode,
      board_name_ar: newBoard.board_name_ar,
      board_type: newBoard.board_type || 'رئيسي',
      chairman_name: newBoard.chairman_name,
      quorum_requirement: newBoard.quorum_requirement || 3,
      status: newBoard.status || 'نشط',
      established_date: new Date().toISOString().split('T')[0],
    });
    
    setCreateDialogOpen(false);
    setNewBoard({
      board_name_ar: '',
      board_type: 'رئيسي',
      chairman_name: '',
      quorum_requirement: 3,
      status: 'نشط',
    });
  };

  const handleAddMember = async () => {
    if (!selectedBoardId || !newMember.member_name || !newMember.position) return;
    
    await addMember.mutateAsync({
      board_id: selectedBoardId,
      member_name: newMember.member_name,
      position: newMember.position,
      member_title: newMember.member_title || '',
      membership_type: newMember.membership_type || 'دائم',
      voting_rights: newMember.voting_rights ?? true,
      is_active: true,
      join_date: new Date().toISOString().split('T')[0],
    });
    
    setAddMemberDialogOpen(false);
    setNewMember({
      member_name: '',
      position: '',
      member_title: '',
      membership_type: 'دائم',
      voting_rights: true,
      is_active: true,
    });
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!selectedBoardId) return;
    await removeMember.mutateAsync({ memberId, boardId: selectedBoardId });
  };

  const handleDeleteBoard = async (id: string) => {
    await deleteBoard.mutateAsync(id);
  };

  const openMembersDialog = (boardId: string) => {
    setSelectedBoardId(boardId);
    setMembersDialogOpen(true);
  };

  return (
    <MainLayout>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-4 md:p-6 space-y-6"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">مجالس الحوكمة</h1>
            <p className="text-muted-foreground mt-1">إدارة مجالس الحوكمة وأعضائها</p>
          </div>
          
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                إنشاء مجلس جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>إنشاء مجلس حوكمة جديد</DialogTitle>
                <DialogDescription>أدخل بيانات المجلس الجديد</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="board_name">اسم المجلس *</Label>
                  <Input
                    id="board_name"
                    value={newBoard.board_name_ar || ''}
                    onChange={(e) => setNewBoard({ ...newBoard, board_name_ar: e.target.value })}
                    placeholder="مثال: مجلس إدارة الوقف"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="chairman">رئيس المجلس *</Label>
                  <Input
                    id="chairman"
                    value={newBoard.chairman_name || ''}
                    onChange={(e) => setNewBoard({ ...newBoard, chairman_name: e.target.value })}
                    placeholder="اسم رئيس المجلس"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">نوع المجلس</Label>
                    <Select
                      value={newBoard.board_type || 'رئيسي'}
                      onValueChange={(value) => setNewBoard({ ...newBoard, board_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="رئيسي">رئيسي</SelectItem>
                        <SelectItem value="فرعي">فرعي</SelectItem>
                        <SelectItem value="استشاري">استشاري</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quorum">النصاب المطلوب</Label>
                    <Input
                      id="quorum"
                      type="number"
                      min={1}
                      value={newBoard.quorum_requirement || 3}
                      onChange={(e) => setNewBoard({ ...newBoard, quorum_requirement: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
                <Button 
                  onClick={handleCreateBoard} 
                  className="w-full"
                  disabled={!newBoard.board_name_ar || !newBoard.chairman_name || createBoard.isPending}
                >
                  {createBoard.isPending ? 'جاري الإنشاء...' : 'إنشاء المجلس'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <UnifiedStatsGrid>
          <UnifiedKPICard
            title="إجمالي المجالس"
            value={statsLoading ? '-' : (stats?.totalBoards || 0)}
            icon={Building2}
          />
          <UnifiedKPICard
            title="المجالس النشطة"
            value={statsLoading ? '-' : (stats?.activeBoards || 0)}
            icon={Building2}
            variant="success"
          />
          <UnifiedKPICard
            title="إجمالي الأعضاء"
            value={statsLoading ? '-' : (stats?.totalMembers || 0)}
            icon={Users}
            variant="info"
          />
        </UnifiedStatsGrid>

        {/* Boards Table */}
        <Card>
          <CardHeader>
            <CardTitle>قائمة المجالس</CardTitle>
            <CardDescription>جميع مجالس الحوكمة المسجلة في النظام</CardDescription>
          </CardHeader>
          <CardContent>
            {boardsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : boards && boards.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>اسم المجلس</TableHead>
                    <TableHead>النوع</TableHead>
                    <TableHead>رئيس المجلس</TableHead>
                    <TableHead>عدد الأعضاء</TableHead>
                    <TableHead>النصاب</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {boards.map((board) => (
                    <TableRow key={board.id}>
                      <TableCell className="font-medium">{board.board_name_ar}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{board.board_type}</Badge>
                      </TableCell>
                      <TableCell>{board.chairman_name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{board.member_count} عضو</Badge>
                      </TableCell>
                      <TableCell>{board.quorum_requirement}</TableCell>
                      <TableCell>
                        <Badge variant={board.status === 'نشط' ? 'default' : 'secondary'}>
                          {board.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openMembersDialog(board.id)}
                            title="عرض الأعضاء"
                          >
                            <Users className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" title="حذف">
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                                <AlertDialogDescription>
                                  هل أنت متأكد من حذف المجلس "{board.board_name_ar}"؟ سيتم حذف جميع الأعضاء المرتبطين به.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteBoard(board.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  حذف
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>لا توجد مجالس مسجلة</p>
                <Button variant="link" onClick={() => setCreateDialogOpen(true)}>
                  إنشاء مجلس جديد
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Members Dialog */}
        <Dialog open={membersDialogOpen} onOpenChange={setMembersDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>أعضاء المجلس</DialogTitle>
              <DialogDescription>قائمة أعضاء المجلس المحدد</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="flex justify-end mb-4">
                <Dialog open={addMemberDialogOpen} onOpenChange={setAddMemberDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-2">
                      <UserPlus className="h-4 w-4" />
                      إضافة عضو
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>إضافة عضو جديد</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>اسم العضو *</Label>
                        <Input
                          value={newMember.member_name || ''}
                          onChange={(e) => setNewMember({ ...newMember, member_name: e.target.value })}
                          placeholder="الاسم الكامل"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>المنصب *</Label>
                        <Select
                          value={newMember.position || ''}
                          onValueChange={(value) => setNewMember({ ...newMember, position: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="اختر المنصب" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="رئيس">رئيس</SelectItem>
                            <SelectItem value="نائب">نائب الرئيس</SelectItem>
                            <SelectItem value="عضو">عضو</SelectItem>
                            <SelectItem value="أمين">أمين السر</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>المسمى الوظيفي</Label>
                        <Input
                          value={newMember.member_title || ''}
                          onChange={(e) => setNewMember({ ...newMember, member_title: e.target.value })}
                          placeholder="مثال: رئيس المجلس"
                        />
                      </div>
                      <Button 
                        onClick={handleAddMember} 
                        className="w-full"
                        disabled={!newMember.member_name || !newMember.position || addMember.isPending}
                      >
                        {addMember.isPending ? 'جاري الإضافة...' : 'إضافة العضو'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {membersLoading ? (
                <div className="space-y-2">
                  {[1, 2].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : boardMembers && boardMembers.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>الاسم</TableHead>
                      <TableHead>المنصب</TableHead>
                      <TableHead>نوع العضوية</TableHead>
                      <TableHead>حق التصويت</TableHead>
                      <TableHead>الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {boardMembers.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">{member.member_name}</TableCell>
                        <TableCell>{member.position}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{member.membership_type}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={member.voting_rights ? 'default' : 'secondary'}>
                            {member.voting_rights ? 'نعم' : 'لا'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                                <AlertDialogDescription>
                                  هل أنت متأكد من حذف العضو "{member.member_name}"؟
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleRemoveMember(member.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  حذف
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-10 w-10 mx-auto mb-3 opacity-50" />
                  <p>لا يوجد أعضاء في هذا المجلس</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>
    </MainLayout>
  );
};

export default GovernanceBoards;
