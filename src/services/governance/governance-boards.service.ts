/**
 * Governance Boards Service - خدمة مجالس الحوكمة
 * @version 1.0.0
 */

import { supabase } from '@/integrations/supabase/client';
import { productionLogger } from '@/lib/logger/production-logger';
import type { Database } from '@/integrations/supabase/types';

type GovernanceBoardRow = Database['public']['Tables']['governance_boards']['Row'];
type GovernanceBoardInsert = Database['public']['Tables']['governance_boards']['Insert'];
type GovernanceBoardUpdate = Database['public']['Tables']['governance_boards']['Update'];
type BoardMemberRow = Database['public']['Tables']['governance_board_members']['Row'];
type BoardMemberInsert = Database['public']['Tables']['governance_board_members']['Insert'];

export class GovernanceBoardsService {
  /**
   * جلب جميع مجالس الحوكمة
   */
  static async getBoards(): Promise<GovernanceBoardRow[]> {
    try {
      const { data, error } = await supabase
        .from('governance_boards')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      productionLogger.error('Error fetching governance boards', error);
      throw error;
    }
  }

  /**
   * جلب مجلس بالمعرف
   */
  static async getBoardById(id: string): Promise<GovernanceBoardRow | null> {
    try {
      const { data, error } = await supabase
        .from('governance_boards')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      productionLogger.error('Error fetching governance board', error);
      throw error;
    }
  }

  /**
   * جلب أعضاء المجلس
   */
  static async getBoardMembers(boardId: string): Promise<BoardMemberRow[]> {
    try {
      const { data, error } = await supabase
        .from('governance_board_members')
        .select('*')
        .eq('board_id', boardId)
        .eq('is_active', true)
        .order('position', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      productionLogger.error('Error fetching board members', error);
      throw error;
    }
  }

  /**
   * جلب المجالس مع عدد الأعضاء
   */
  static async getBoardsWithMemberCount(): Promise<(GovernanceBoardRow & { member_count: number })[]> {
    try {
      const boards = await this.getBoards();
      
      const boardsWithCount = await Promise.all(
        boards.map(async (board) => {
          const { count } = await supabase
            .from('governance_board_members')
            .select('*', { count: 'exact', head: true })
            .eq('board_id', board.id)
            .eq('is_active', true);
          
          return {
            ...board,
            member_count: count || 0,
          };
        })
      );
      
      return boardsWithCount;
    } catch (error) {
      productionLogger.error('Error fetching boards with member count', error);
      throw error;
    }
  }

  /**
   * إنشاء مجلس جديد
   */
  static async createBoard(board: GovernanceBoardInsert): Promise<GovernanceBoardRow> {
    try {
      const { data, error } = await supabase
        .from('governance_boards')
        .insert([board])
        .select()
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('فشل إنشاء المجلس');
      return data;
    } catch (error) {
      productionLogger.error('Error creating governance board', error);
      throw error;
    }
  }

  /**
   * تحديث مجلس
   */
  static async updateBoard(id: string, updates: GovernanceBoardUpdate): Promise<GovernanceBoardRow> {
    try {
      const { data, error } = await supabase
        .from('governance_boards')
        .update(updates)
        .eq('id', id)
        .select()
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('المجلس غير موجود');
      return data;
    } catch (error) {
      productionLogger.error('Error updating governance board', error);
      throw error;
    }
  }

  /**
   * حذف مجلس
   */
  static async deleteBoard(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('governance_boards')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      productionLogger.error('Error deleting governance board', error);
      throw error;
    }
  }

  /**
   * إضافة عضو للمجلس
   */
  static async addMember(member: BoardMemberInsert): Promise<BoardMemberRow> {
    try {
      const { data, error } = await supabase
        .from('governance_board_members')
        .insert([member])
        .select()
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('فشل إضافة العضو');
      return data;
    } catch (error) {
      productionLogger.error('Error adding board member', error);
      throw error;
    }
  }

  /**
   * تحديث عضو
   */
  static async updateMember(id: string, updates: Partial<BoardMemberRow>): Promise<BoardMemberRow> {
    try {
      const { data, error } = await supabase
        .from('governance_board_members')
        .update(updates)
        .eq('id', id)
        .select()
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('العضو غير موجود');
      return data;
    } catch (error) {
      productionLogger.error('Error updating board member', error);
      throw error;
    }
  }

  /**
   * حذف عضو من المجلس
   */
  static async removeMember(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('governance_board_members')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      productionLogger.error('Error removing board member', error);
      throw error;
    }
  }

  /**
   * الحصول على إحصائيات المجالس
   */
  static async getBoardsStats(): Promise<{
    totalBoards: number;
    activeBoards: number;
    totalMembers: number;
  }> {
    try {
      const { count: totalBoards } = await supabase
        .from('governance_boards')
        .select('*', { count: 'exact', head: true });

      const { count: activeBoards } = await supabase
        .from('governance_boards')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'نشط');

      const { count: totalMembers } = await supabase
        .from('governance_board_members')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      return {
        totalBoards: totalBoards || 0,
        activeBoards: activeBoards || 0,
        totalMembers: totalMembers || 0,
      };
    } catch (error) {
      productionLogger.error('Error fetching boards stats', error);
      throw error;
    }
  }
}
