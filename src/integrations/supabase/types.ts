export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      accounts: {
        Row: {
          account_nature: Database["public"]["Enums"]["account_nature"]
          account_type: Database["public"]["Enums"]["account_type"]
          code: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          is_header: boolean
          name_ar: string
          name_en: string | null
          parent_id: string | null
          updated_at: string
        }
        Insert: {
          account_nature: Database["public"]["Enums"]["account_nature"]
          account_type: Database["public"]["Enums"]["account_type"]
          code: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_header?: boolean
          name_ar: string
          name_en?: string | null
          parent_id?: string | null
          updated_at?: string
        }
        Update: {
          account_nature?: Database["public"]["Enums"]["account_nature"]
          account_type?: Database["public"]["Enums"]["account_type"]
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_header?: boolean
          name_ar?: string
          name_en?: string | null
          parent_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "accounts_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      activities: {
        Row: {
          action: string
          created_at: string
          id: string
          timestamp: string
          user_name: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          timestamp?: string
          user_name: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          timestamp?: string
          user_name?: string
        }
        Relationships: []
      }
      approvals: {
        Row: {
          approved_at: string | null
          approver_name: string
          created_at: string
          id: string
          journal_entry_id: string
          notes: string | null
          status: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approver_name: string
          created_at?: string
          id?: string
          journal_entry_id: string
          notes?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approver_name?: string
          created_at?: string
          id?: string
          journal_entry_id?: string
          notes?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "approvals_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      beneficiaries: {
        Row: {
          category: string
          created_at: string
          email: string | null
          family_name: string | null
          full_name: string
          id: string
          national_id: string
          notes: string | null
          phone: string
          relationship: string | null
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          category: string
          created_at?: string
          email?: string | null
          family_name?: string | null
          full_name: string
          id?: string
          national_id: string
          notes?: string | null
          phone: string
          relationship?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          email?: string | null
          family_name?: string | null
          full_name?: string
          id?: string
          national_id?: string
          notes?: string | null
          phone?: string
          relationship?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      beneficiary_requests: {
        Row: {
          amount: number | null
          approved_at: string | null
          beneficiary_id: string
          created_at: string | null
          decision_notes: string | null
          description: string
          id: string
          is_overdue: boolean | null
          priority: string | null
          rejection_reason: string | null
          request_number: string | null
          request_type_id: string
          reviewed_at: string | null
          sla_due_at: string | null
          status: string | null
          submitted_at: string | null
          updated_at: string | null
        }
        Insert: {
          amount?: number | null
          approved_at?: string | null
          beneficiary_id: string
          created_at?: string | null
          decision_notes?: string | null
          description: string
          id?: string
          is_overdue?: boolean | null
          priority?: string | null
          rejection_reason?: string | null
          request_number?: string | null
          request_type_id: string
          reviewed_at?: string | null
          sla_due_at?: string | null
          status?: string | null
          submitted_at?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number | null
          approved_at?: string | null
          beneficiary_id?: string
          created_at?: string | null
          decision_notes?: string | null
          description?: string
          id?: string
          is_overdue?: boolean | null
          priority?: string | null
          rejection_reason?: string | null
          request_number?: string | null
          request_type_id?: string
          reviewed_at?: string | null
          sla_due_at?: string | null
          status?: string | null
          submitted_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "beneficiary_requests_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "beneficiary_requests_request_type_id_fkey"
            columns: ["request_type_id"]
            isOneToOne: false
            referencedRelation: "request_types"
            referencedColumns: ["id"]
          },
        ]
      }
      budgets: {
        Row: {
          account_id: string
          actual_amount: number | null
          budgeted_amount: number
          created_at: string
          fiscal_year_id: string
          id: string
          period_number: number | null
          period_type: string
          updated_at: string
          variance_amount: number | null
        }
        Insert: {
          account_id: string
          actual_amount?: number | null
          budgeted_amount: number
          created_at?: string
          fiscal_year_id: string
          id?: string
          period_number?: number | null
          period_type: string
          updated_at?: string
          variance_amount?: number | null
        }
        Update: {
          account_id?: string
          actual_amount?: number | null
          budgeted_amount?: number
          created_at?: string
          fiscal_year_id?: string
          id?: string
          period_number?: number | null
          period_type?: string
          updated_at?: string
          variance_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "budgets_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budgets_fiscal_year_id_fkey"
            columns: ["fiscal_year_id"]
            isOneToOne: false
            referencedRelation: "fiscal_years"
            referencedColumns: ["id"]
          },
        ]
      }
      distributions: {
        Row: {
          beneficiaries_count: number
          created_at: string
          distribution_date: string
          id: string
          month: string
          notes: string | null
          status: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          beneficiaries_count: number
          created_at?: string
          distribution_date: string
          id?: string
          month: string
          notes?: string | null
          status?: string
          total_amount: number
          updated_at?: string
        }
        Update: {
          beneficiaries_count?: number
          created_at?: string
          distribution_date?: string
          id?: string
          month?: string
          notes?: string | null
          status?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          category: string
          created_at: string
          description: string | null
          file_size: string
          file_type: string
          folder_id: string | null
          id: string
          name: string
          uploaded_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          file_size: string
          file_type: string
          folder_id?: string | null
          id?: string
          name: string
          uploaded_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          file_size?: string
          file_type?: string
          folder_id?: string | null
          id?: string
          name?: string
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "folders"
            referencedColumns: ["id"]
          },
        ]
      }
      families: {
        Row: {
          created_at: string | null
          family_name: string
          head_of_family_id: string | null
          id: string
          notes: string | null
          status: string | null
          total_members: number | null
          tribe: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          family_name: string
          head_of_family_id?: string | null
          id?: string
          notes?: string | null
          status?: string | null
          total_members?: number | null
          tribe?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          family_name?: string
          head_of_family_id?: string | null
          id?: string
          notes?: string | null
          status?: string | null
          total_members?: number | null
          tribe?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "families_head_of_family_id_fkey"
            columns: ["head_of_family_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries"
            referencedColumns: ["id"]
          },
        ]
      }
      family_members: {
        Row: {
          beneficiary_id: string
          created_at: string | null
          family_id: string
          id: string
          is_dependent: boolean | null
          priority_level: number | null
          relationship_to_head: string
          updated_at: string | null
        }
        Insert: {
          beneficiary_id: string
          created_at?: string | null
          family_id: string
          id?: string
          is_dependent?: boolean | null
          priority_level?: number | null
          relationship_to_head: string
          updated_at?: string | null
        }
        Update: {
          beneficiary_id?: string
          created_at?: string | null
          family_id?: string
          id?: string
          is_dependent?: boolean | null
          priority_level?: number | null
          relationship_to_head?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "family_members_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_members_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      fiscal_years: {
        Row: {
          created_at: string
          end_date: string
          id: string
          is_active: boolean
          is_closed: boolean
          name: string
          start_date: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          is_active?: boolean
          is_closed?: boolean
          name: string
          start_date: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          is_active?: boolean
          is_closed?: boolean
          name?: string
          start_date?: string
          updated_at?: string
        }
        Relationships: []
      }
      folders: {
        Row: {
          created_at: string
          description: string | null
          files_count: number
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          files_count?: number
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          files_count?: number
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      funds: {
        Row: {
          allocated_amount: number
          beneficiaries_count: number
          category: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          percentage: number
          spent_amount: number
          updated_at: string
        }
        Insert: {
          allocated_amount?: number
          beneficiaries_count?: number
          category: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          percentage?: number
          spent_amount?: number
          updated_at?: string
        }
        Update: {
          allocated_amount?: number
          beneficiaries_count?: number
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          percentage?: number
          spent_amount?: number
          updated_at?: string
        }
        Relationships: []
      }
      invoice_lines: {
        Row: {
          account_id: string | null
          created_at: string
          description: string
          id: string
          invoice_id: string
          line_number: number
          line_total: number
          quantity: number
          unit_price: number
        }
        Insert: {
          account_id?: string | null
          created_at?: string
          description: string
          id?: string
          invoice_id: string
          line_number: number
          line_total?: number
          quantity?: number
          unit_price?: number
        }
        Update: {
          account_id?: string | null
          created_at?: string
          description?: string
          id?: string
          invoice_id?: string
          line_number?: number
          line_total?: number
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_lines_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_lines_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          created_at: string
          customer_address: string | null
          customer_email: string | null
          customer_name: string
          customer_phone: string | null
          due_date: string | null
          id: string
          invoice_date: string
          invoice_number: string
          journal_entry_id: string | null
          notes: string | null
          status: string
          subtotal: number
          tax_amount: number
          total_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_address?: string | null
          customer_email?: string | null
          customer_name: string
          customer_phone?: string | null
          due_date?: string | null
          id?: string
          invoice_date: string
          invoice_number: string
          journal_entry_id?: string | null
          notes?: string | null
          status?: string
          subtotal?: number
          tax_amount?: number
          total_amount?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_address?: string | null
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string | null
          due_date?: string | null
          id?: string
          invoice_date?: string
          invoice_number?: string
          journal_entry_id?: string | null
          notes?: string | null
          status?: string
          subtotal?: number
          tax_amount?: number
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_entries: {
        Row: {
          created_at: string
          created_by: string | null
          description: string
          entry_date: string
          entry_number: string
          fiscal_year_id: string
          id: string
          posted_at: string | null
          reference_id: string | null
          reference_type: string | null
          status: Database["public"]["Enums"]["entry_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description: string
          entry_date: string
          entry_number: string
          fiscal_year_id: string
          id?: string
          posted_at?: string | null
          reference_id?: string | null
          reference_type?: string | null
          status?: Database["public"]["Enums"]["entry_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string
          entry_date?: string
          entry_number?: string
          fiscal_year_id?: string
          id?: string
          posted_at?: string | null
          reference_id?: string | null
          reference_type?: string | null
          status?: Database["public"]["Enums"]["entry_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "journal_entries_fiscal_year_id_fkey"
            columns: ["fiscal_year_id"]
            isOneToOne: false
            referencedRelation: "fiscal_years"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_entry_lines: {
        Row: {
          account_id: string
          created_at: string
          credit_amount: number
          debit_amount: number
          description: string | null
          id: string
          journal_entry_id: string
          line_number: number
        }
        Insert: {
          account_id: string
          created_at?: string
          credit_amount?: number
          debit_amount?: number
          description?: string | null
          id?: string
          journal_entry_id: string
          line_number: number
        }
        Update: {
          account_id?: string
          created_at?: string
          credit_amount?: number
          debit_amount?: number
          description?: string | null
          id?: string
          journal_entry_id?: string
          line_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "journal_entry_lines_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_entry_lines_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string
          id: string
          is_read: boolean
          message: string
          read_at: string | null
          reference_id: string | null
          reference_type: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          read_at?: string | null
          reference_id?: string | null
          reference_type?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          read_at?: string | null
          reference_id?: string | null
          reference_type?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          description: string
          id: string
          journal_entry_id: string | null
          notes: string | null
          payer_name: string
          payment_date: string
          payment_method: string
          payment_number: string
          payment_type: string
          reference_number: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          description: string
          id?: string
          journal_entry_id?: string | null
          notes?: string | null
          payer_name: string
          payment_date: string
          payment_method: string
          payment_number: string
          payment_type: string
          reference_number?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          id?: string
          journal_entry_id?: string | null
          notes?: string | null
          payer_name?: string
          payment_date?: string
          payment_method?: string
          payment_number?: string
          payment_type?: string
          reference_number?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          position: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          position?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          position?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      properties: {
        Row: {
          created_at: string
          description: string | null
          id: string
          location: string
          monthly_revenue: number
          name: string
          occupied: number
          status: string
          type: string
          units: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          location: string
          monthly_revenue?: number
          name: string
          occupied?: number
          status: string
          type: string
          units?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          location?: string
          monthly_revenue?: number
          name?: string
          occupied?: number
          status?: string
          type?: string
          units?: number
          updated_at?: string
        }
        Relationships: []
      }
      request_attachments: {
        Row: {
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          request_id: string
          uploaded_at: string | null
        }
        Insert: {
          file_name: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          request_id: string
          uploaded_at?: string | null
        }
        Update: {
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          request_id?: string
          uploaded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "request_attachments_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "beneficiary_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      request_comments: {
        Row: {
          comment: string
          created_at: string | null
          id: string
          is_internal: boolean | null
          request_id: string
          user_id: string
        }
        Insert: {
          comment: string
          created_at?: string | null
          id?: string
          is_internal?: boolean | null
          request_id: string
          user_id: string
        }
        Update: {
          comment?: string
          created_at?: string | null
          id?: string
          is_internal?: boolean | null
          request_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "request_comments_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "beneficiary_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      request_types: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          requires_approval: boolean | null
          sla_hours: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          requires_approval?: boolean | null
          sla_hours?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          requires_approval?: boolean | null
          sla_hours?: number | null
        }
        Relationships: []
      }
      tasks: {
        Row: {
          created_at: string
          id: string
          priority: string
          status: string
          task: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          priority: string
          status?: string
          task: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          priority?: string
          status?: string
          task?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      account_nature: "debit" | "credit"
      account_type: "asset" | "liability" | "equity" | "revenue" | "expense"
      app_role: "admin" | "user"
      entry_status: "draft" | "posted" | "cancelled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      account_nature: ["debit", "credit"],
      account_type: ["asset", "liability", "equity", "revenue", "expense"],
      app_role: ["admin", "user"],
      entry_status: ["draft", "posted", "cancelled"],
    },
  },
} as const
