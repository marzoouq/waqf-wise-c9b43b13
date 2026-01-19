/**
 * Governance Boards Hooks - هوكس مجالس الحوكمة
 * @version 1.0.0
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/ui/use-toast";
import { productionLogger } from "@/lib/logger/production-logger";
import { GovernanceBoardsService } from "@/services/governance/governance-boards.service";
import type { Database } from "@/integrations/supabase/types";

type BoardInsert = Database['public']['Tables']['governance_boards']['Insert'];
type BoardUpdate = Database['public']['Tables']['governance_boards']['Update'];
type MemberInsert = Database['public']['Tables']['governance_board_members']['Insert'];

const QUERY_KEYS = {
  GOVERNANCE_BOARDS: ['governance', 'boards'] as const,
  GOVERNANCE_BOARD: (id: string) => ['governance', 'boards', id] as const,
  BOARD_MEMBERS: (boardId: string) => ['governance', 'boards', boardId, 'members'] as const,
  BOARDS_STATS: ['governance', 'boards', 'stats'] as const,
};

/**
 * جلب جميع مجالس الحوكمة مع عدد الأعضاء
 */
export function useGovernanceBoards() {
  const { toast } = useToast();

  return useQuery({
    queryKey: QUERY_KEYS.GOVERNANCE_BOARDS,
    queryFn: () => GovernanceBoardsService.getBoardsWithMemberCount(),
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 دقائق
  });
}

/**
 * جلب مجلس محدد بالمعرف
 */
export function useGovernanceBoard(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.GOVERNANCE_BOARD(id),
    queryFn: () => GovernanceBoardsService.getBoardById(id),
    enabled: !!id,
    retry: 2,
  });
}

/**
 * جلب أعضاء مجلس محدد
 */
export function useBoardMembers(boardId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.BOARD_MEMBERS(boardId),
    queryFn: () => GovernanceBoardsService.getBoardMembers(boardId),
    enabled: !!boardId,
    retry: 2,
  });
}

/**
 * جلب إحصائيات المجالس
 */
export function useBoardsStats() {
  return useQuery({
    queryKey: QUERY_KEYS.BOARDS_STATS,
    queryFn: () => GovernanceBoardsService.getBoardsStats(),
    staleTime: 10 * 60 * 1000, // 10 دقائق
  });
}

/**
 * إنشاء مجلس جديد
 */
export function useCreateBoard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (board: BoardInsert) => GovernanceBoardsService.createBoard(board),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.GOVERNANCE_BOARDS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BOARDS_STATS });
      toast({
        title: "تم إنشاء المجلس بنجاح",
        description: "تم إضافة مجلس الحوكمة الجديد",
      });
    },
    onError: (error) => {
      productionLogger.error('Create board mutation error:', error);
      toast({
        title: "خطأ في إنشاء المجلس",
        description: "حدث خطأ أثناء إنشاء المجلس، يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    },
  });
}

/**
 * تحديث مجلس
 */
export function useUpdateBoard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: BoardUpdate }) =>
      GovernanceBoardsService.updateBoard(id, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.GOVERNANCE_BOARDS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.GOVERNANCE_BOARD(variables.id) });
      toast({
        title: "تم تحديث المجلس",
        description: "تم حفظ التغييرات بنجاح",
      });
    },
    onError: (error) => {
      productionLogger.error('Update board mutation error:', error);
      toast({
        title: "خطأ في تحديث المجلس",
        description: "حدث خطأ أثناء تحديث المجلس",
        variant: "destructive",
      });
    },
  });
}

/**
 * حذف مجلس
 */
export function useDeleteBoard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => GovernanceBoardsService.deleteBoard(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.GOVERNANCE_BOARDS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BOARDS_STATS });
      toast({
        title: "تم حذف المجلس",
        description: "تم حذف المجلس وجميع أعضائه",
      });
    },
    onError: (error) => {
      productionLogger.error('Delete board mutation error:', error);
      toast({
        title: "خطأ في حذف المجلس",
        description: "حدث خطأ أثناء حذف المجلس",
        variant: "destructive",
      });
    },
  });
}

/**
 * إضافة عضو للمجلس
 */
export function useAddBoardMember() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (member: MemberInsert) => GovernanceBoardsService.addMember(member),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BOARD_MEMBERS(variables.board_id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.GOVERNANCE_BOARDS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BOARDS_STATS });
      toast({
        title: "تم إضافة العضو",
        description: "تم إضافة العضو للمجلس بنجاح",
      });
    },
    onError: (error) => {
      productionLogger.error('Add member mutation error:', error);
      toast({
        title: "خطأ في إضافة العضو",
        description: "حدث خطأ أثناء إضافة العضو",
        variant: "destructive",
      });
    },
  });
}

/**
 * حذف عضو من المجلس
 */
export function useRemoveBoardMember() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ memberId, boardId }: { memberId: string; boardId: string }) =>
      GovernanceBoardsService.removeMember(memberId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BOARD_MEMBERS(variables.boardId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.GOVERNANCE_BOARDS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BOARDS_STATS });
      toast({
        title: "تم حذف العضو",
        description: "تم إزالة العضو من المجلس",
      });
    },
    onError: (error) => {
      productionLogger.error('Remove member mutation error:', error);
      toast({
        title: "خطأ في حذف العضو",
        description: "حدث خطأ أثناء حذف العضو",
        variant: "destructive",
      });
    },
  });
}
