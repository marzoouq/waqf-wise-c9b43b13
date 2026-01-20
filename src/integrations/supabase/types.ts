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
      account_year_balances: {
        Row: {
          account_id: string
          closed_at: string | null
          closed_by: string | null
          closing_balance: number | null
          created_at: string | null
          fiscal_year_id: string
          id: string
          is_final: boolean | null
          opening_balance: number | null
          total_credits: number | null
          total_debits: number | null
          updated_at: string | null
        }
        Insert: {
          account_id: string
          closed_at?: string | null
          closed_by?: string | null
          closing_balance?: number | null
          created_at?: string | null
          fiscal_year_id: string
          id?: string
          is_final?: boolean | null
          opening_balance?: number | null
          total_credits?: number | null
          total_debits?: number | null
          updated_at?: string | null
        }
        Update: {
          account_id?: string
          closed_at?: string | null
          closed_by?: string | null
          closing_balance?: number | null
          created_at?: string | null
          fiscal_year_id?: string
          id?: string
          is_final?: boolean | null
          opening_balance?: number | null
          total_credits?: number | null
          total_debits?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "account_year_balances_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "account_year_balances_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts_hierarchy"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "account_year_balances_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "general_ledger"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "account_year_balances_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "trial_balance"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "account_year_balances_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "waqf_balance_summary"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "account_year_balances_fiscal_year_id_fkey"
            columns: ["fiscal_year_id"]
            isOneToOne: false
            referencedRelation: "financial_summary"
            referencedColumns: ["fiscal_year_id"]
          },
          {
            foreignKeyName: "account_year_balances_fiscal_year_id_fkey"
            columns: ["fiscal_year_id"]
            isOneToOne: false
            referencedRelation: "fiscal_years"
            referencedColumns: ["id"]
          },
        ]
      }
      accounts: {
        Row: {
          account_nature: Database["public"]["Enums"]["account_nature"]
          account_type: Database["public"]["Enums"]["account_type"]
          code: string
          created_at: string
          current_balance: number | null
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
          current_balance?: number | null
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
          current_balance?: number | null
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
          {
            foreignKeyName: "accounts_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "accounts_hierarchy"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "general_ledger"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "accounts_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "trial_balance"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "accounts_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "waqf_balance_summary"
            referencedColumns: ["account_id"]
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
      ai_system_audits: {
        Row: {
          ai_analysis: string | null
          audit_type: string
          auto_fixes_applied: Json | null
          categories: Json | null
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          findings: Json
          fixed_issues: number | null
          id: string
          pending_fixes: Json | null
          severity_summary: Json | null
          slack_notified: boolean | null
          total_issues: number | null
        }
        Insert: {
          ai_analysis?: string | null
          audit_type?: string
          auto_fixes_applied?: Json | null
          categories?: Json | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          findings?: Json
          fixed_issues?: number | null
          id?: string
          pending_fixes?: Json | null
          severity_summary?: Json | null
          slack_notified?: boolean | null
          total_issues?: number | null
        }
        Update: {
          ai_analysis?: string | null
          audit_type?: string
          auto_fixes_applied?: Json | null
          categories?: Json | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          findings?: Json
          fixed_issues?: number | null
          id?: string
          pending_fixes?: Json | null
          severity_summary?: Json | null
          slack_notified?: boolean | null
          total_issues?: number | null
        }
        Relationships: []
      }
      annual_disclosures: {
        Row: {
          administrative_expenses: number | null
          bank_statement_url: string | null
          beneficiaries_details: Json | null
          charity_percentage: number
          charity_share: number
          closing_balance: number | null
          corpus_percentage: number
          corpus_share: number
          created_at: string | null
          daughters_count: number
          development_expenses: number | null
          disclosure_date: string
          expenses_breakdown: Json | null
          fiscal_year_id: string | null
          id: string
          maintenance_expenses: number | null
          monthly_data: Json | null
          nazer_percentage: number
          nazer_share: number
          net_income: number
          opening_balance: number | null
          other_expenses: number | null
          published_at: string | null
          published_by: string | null
          revenue_breakdown: Json | null
          sons_count: number
          status: string | null
          total_beneficiaries: number
          total_expenses: number
          total_revenues: number
          updated_at: string | null
          vat_amount: number | null
          waqf_name: string
          wives_count: number
          year: number
        }
        Insert: {
          administrative_expenses?: number | null
          bank_statement_url?: string | null
          beneficiaries_details?: Json | null
          charity_percentage?: number
          charity_share?: number
          closing_balance?: number | null
          corpus_percentage?: number
          corpus_share?: number
          created_at?: string | null
          daughters_count?: number
          development_expenses?: number | null
          disclosure_date?: string
          expenses_breakdown?: Json | null
          fiscal_year_id?: string | null
          id?: string
          maintenance_expenses?: number | null
          monthly_data?: Json | null
          nazer_percentage?: number
          nazer_share?: number
          net_income?: number
          opening_balance?: number | null
          other_expenses?: number | null
          published_at?: string | null
          published_by?: string | null
          revenue_breakdown?: Json | null
          sons_count?: number
          status?: string | null
          total_beneficiaries?: number
          total_expenses?: number
          total_revenues?: number
          updated_at?: string | null
          vat_amount?: number | null
          waqf_name: string
          wives_count?: number
          year: number
        }
        Update: {
          administrative_expenses?: number | null
          bank_statement_url?: string | null
          beneficiaries_details?: Json | null
          charity_percentage?: number
          charity_share?: number
          closing_balance?: number | null
          corpus_percentage?: number
          corpus_share?: number
          created_at?: string | null
          daughters_count?: number
          development_expenses?: number | null
          disclosure_date?: string
          expenses_breakdown?: Json | null
          fiscal_year_id?: string | null
          id?: string
          maintenance_expenses?: number | null
          monthly_data?: Json | null
          nazer_percentage?: number
          nazer_share?: number
          net_income?: number
          opening_balance?: number | null
          other_expenses?: number | null
          published_at?: string | null
          published_by?: string | null
          revenue_breakdown?: Json | null
          sons_count?: number
          status?: string | null
          total_beneficiaries?: number
          total_expenses?: number
          total_revenues?: number
          updated_at?: string | null
          vat_amount?: number | null
          waqf_name?: string
          wives_count?: number
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "annual_disclosures_fiscal_year_id_fkey"
            columns: ["fiscal_year_id"]
            isOneToOne: false
            referencedRelation: "financial_summary"
            referencedColumns: ["fiscal_year_id"]
          },
          {
            foreignKeyName: "annual_disclosures_fiscal_year_id_fkey"
            columns: ["fiscal_year_id"]
            isOneToOne: false
            referencedRelation: "fiscal_years"
            referencedColumns: ["id"]
          },
        ]
      }
      approval_history: {
        Row: {
          action: string
          approval_id: string
          approval_type: string
          created_at: string
          id: string
          notes: string | null
          performed_by: string | null
          performed_by_name: string | null
          reference_id: string
        }
        Insert: {
          action: string
          approval_id: string
          approval_type: string
          created_at?: string
          id?: string
          notes?: string | null
          performed_by?: string | null
          performed_by_name?: string | null
          reference_id: string
        }
        Update: {
          action?: string
          approval_id?: string
          approval_type?: string
          created_at?: string
          id?: string
          notes?: string | null
          performed_by?: string | null
          performed_by_name?: string | null
          reference_id?: string
        }
        Relationships: []
      }
      approval_stats: {
        Row: {
          approved_count: number | null
          avg_approval_time_hours: number | null
          created_at: string | null
          id: string
          pending_approvals: number | null
          rejected_count: number | null
          report_date: string
        }
        Insert: {
          approved_count?: number | null
          avg_approval_time_hours?: number | null
          created_at?: string | null
          id?: string
          pending_approvals?: number | null
          rejected_count?: number | null
          report_date?: string
        }
        Update: {
          approved_count?: number | null
          avg_approval_time_hours?: number | null
          created_at?: string | null
          id?: string
          pending_approvals?: number | null
          rejected_count?: number | null
          report_date?: string
        }
        Relationships: []
      }
      approval_status: {
        Row: {
          completed_at: string | null
          created_at: string | null
          current_level: number | null
          entity_id: string
          entity_type: string
          id: string
          started_at: string | null
          status: string | null
          total_levels: number
          workflow_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          current_level?: number | null
          entity_id: string
          entity_type: string
          id?: string
          started_at?: string | null
          status?: string | null
          total_levels: number
          workflow_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          current_level?: number | null
          entity_id?: string
          entity_type?: string
          id?: string
          started_at?: string | null
          status?: string | null
          total_levels?: number
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "approval_status_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "approval_workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      approval_steps: {
        Row: {
          action: string | null
          actioned_at: string | null
          approval_status_id: string | null
          approver_id: string | null
          approver_name: string | null
          approver_role: string
          created_at: string | null
          id: string
          level: number | null
          notes: string | null
        }
        Insert: {
          action?: string | null
          actioned_at?: string | null
          approval_status_id?: string | null
          approver_id?: string | null
          approver_name?: string | null
          approver_role: string
          created_at?: string | null
          id?: string
          level?: number | null
          notes?: string | null
        }
        Update: {
          action?: string | null
          actioned_at?: string | null
          approval_status_id?: string | null
          approver_id?: string | null
          approver_name?: string | null
          approver_role?: string
          created_at?: string | null
          id?: string
          level?: number | null
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "approval_steps_approval_status_id_fkey"
            columns: ["approval_status_id"]
            isOneToOne: false
            referencedRelation: "approval_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approval_steps_approval_status_id_fkey"
            columns: ["approval_status_id"]
            isOneToOne: false
            referencedRelation: "pending_approvals_view"
            referencedColumns: ["id"]
          },
        ]
      }
      approval_workflows: {
        Row: {
          approval_levels: Json
          conditions: Json | null
          created_at: string | null
          created_by: string | null
          entity_type: string
          id: string
          is_active: boolean | null
          updated_at: string | null
          workflow_name: string
        }
        Insert: {
          approval_levels: Json
          conditions?: Json | null
          created_at?: string | null
          created_by?: string | null
          entity_type: string
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
          workflow_name: string
        }
        Update: {
          approval_levels?: Json
          conditions?: Json | null
          created_at?: string | null
          created_by?: string | null
          entity_type?: string
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
          workflow_name?: string
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
            referencedRelation: "general_ledger"
            referencedColumns: ["entry_id"]
          },
          {
            foreignKeyName: "approvals_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approvals_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries_with_lines"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action_type: string
          created_at: string | null
          description: string | null
          id: string
          ip_address: string | null
          metadata: Json | null
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          request_id: string | null
          session_id: string | null
          severity: string | null
          table_name: string | null
          user_agent: string | null
          user_email: string | null
          user_id: string | null
          user_role: string | null
        }
        Insert: {
          action_type: string
          created_at?: string | null
          description?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          request_id?: string | null
          session_id?: string | null
          severity?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
          user_role?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string | null
          description?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          request_id?: string | null
          session_id?: string | null
          severity?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
          user_role?: string | null
        }
        Relationships: []
      }
      audit_logs_archive: {
        Row: {
          action_type: string
          archived_at: string | null
          created_at: string | null
          description: string | null
          id: string
          ip_address: string | null
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          severity: string | null
          table_name: string | null
          user_agent: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          action_type: string
          archived_at?: string | null
          created_at?: string | null
          description?: string | null
          id: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          severity?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          action_type?: string
          archived_at?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          severity?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      auto_fix_attempts: {
        Row: {
          completed_at: string | null
          created_at: string | null
          error_id: string | null
          error_message: string | null
          fix_strategy: string
          id: string
          result: string | null
          status: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          error_id?: string | null
          error_message?: string | null
          fix_strategy: string
          id?: string
          result?: string | null
          status?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          error_id?: string | null
          error_message?: string | null
          fix_strategy?: string
          id?: string
          result?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "auto_fix_attempts_error_id_fkey"
            columns: ["error_id"]
            isOneToOne: false
            referencedRelation: "system_error_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      auto_journal_log: {
        Row: {
          amount: number
          error_message: string | null
          executed_at: string | null
          id: string
          journal_entry_id: string | null
          metadata: Json | null
          reference_id: string | null
          reference_type: string | null
          success: boolean | null
          template_id: string | null
          trigger_event: string
        }
        Insert: {
          amount: number
          error_message?: string | null
          executed_at?: string | null
          id?: string
          journal_entry_id?: string | null
          metadata?: Json | null
          reference_id?: string | null
          reference_type?: string | null
          success?: boolean | null
          template_id?: string | null
          trigger_event: string
        }
        Update: {
          amount?: number
          error_message?: string | null
          executed_at?: string | null
          id?: string
          journal_entry_id?: string | null
          metadata?: Json | null
          reference_id?: string | null
          reference_type?: string | null
          success?: boolean | null
          template_id?: string | null
          trigger_event?: string
        }
        Relationships: [
          {
            foreignKeyName: "auto_journal_log_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "general_ledger"
            referencedColumns: ["entry_id"]
          },
          {
            foreignKeyName: "auto_journal_log_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "auto_journal_log_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries_with_lines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "auto_journal_log_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "auto_journal_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      auto_journal_templates: {
        Row: {
          created_at: string | null
          created_by: string | null
          credit_accounts: Json
          debit_accounts: Json
          deleted_at: string | null
          deleted_by: string | null
          deletion_reason: string | null
          description: string | null
          id: string
          is_active: boolean | null
          priority: number | null
          template_name: string
          trigger_event: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          credit_accounts: Json
          debit_accounts: Json
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          priority?: number | null
          template_name: string
          trigger_event: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          credit_accounts?: Json
          debit_accounts?: Json
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          priority?: number | null
          template_name?: string
          trigger_event?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      backup_logs: {
        Row: {
          backup_type: string
          completed_at: string | null
          created_at: string | null
          error_message: string | null
          file_path: string | null
          file_size: number | null
          id: string
          started_at: string | null
          status: string
          tables_included: string[] | null
        }
        Insert: {
          backup_type: string
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          file_path?: string | null
          file_size?: number | null
          id?: string
          started_at?: string | null
          status?: string
          tables_included?: string[] | null
        }
        Update: {
          backup_type?: string
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          file_path?: string | null
          file_size?: number | null
          id?: string
          started_at?: string | null
          status?: string
          tables_included?: string[] | null
        }
        Relationships: []
      }
      backup_schedules: {
        Row: {
          backup_type: string
          created_at: string | null
          frequency: string
          id: string
          include_storage: boolean | null
          is_active: boolean | null
          last_backup_at: string | null
          next_backup_at: string | null
          retention_days: number | null
          schedule_name: string
          tables_included: string[]
          updated_at: string | null
        }
        Insert: {
          backup_type: string
          created_at?: string | null
          frequency: string
          id?: string
          include_storage?: boolean | null
          is_active?: boolean | null
          last_backup_at?: string | null
          next_backup_at?: string | null
          retention_days?: number | null
          schedule_name: string
          tables_included: string[]
          updated_at?: string | null
        }
        Update: {
          backup_type?: string
          created_at?: string | null
          frequency?: string
          id?: string
          include_storage?: boolean | null
          is_active?: boolean | null
          last_backup_at?: string | null
          next_backup_at?: string | null
          retention_days?: number | null
          schedule_name?: string
          tables_included?: string[]
          updated_at?: string | null
        }
        Relationships: []
      }
      bank_accounts: {
        Row: {
          account_id: string | null
          account_number: string
          bank_name: string
          created_at: string
          currency: string
          current_balance: number
          deleted_at: string | null
          deleted_by: string | null
          deletion_reason: string | null
          iban: string | null
          id: string
          is_active: boolean
          swift_code: string | null
          updated_at: string
        }
        Insert: {
          account_id?: string | null
          account_number: string
          bank_name: string
          created_at?: string
          currency?: string
          current_balance?: number
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          iban?: string | null
          id?: string
          is_active?: boolean
          swift_code?: string | null
          updated_at?: string
        }
        Update: {
          account_id?: string | null
          account_number?: string
          bank_name?: string
          created_at?: string
          currency?: string
          current_balance?: number
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          iban?: string | null
          id?: string
          is_active?: boolean
          swift_code?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bank_accounts_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bank_accounts_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts_hierarchy"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bank_accounts_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "general_ledger"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "bank_accounts_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "trial_balance"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "bank_accounts_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "waqf_balance_summary"
            referencedColumns: ["account_id"]
          },
        ]
      }
      bank_integrations: {
        Row: {
          api_endpoint: string | null
          api_version: string | null
          auth_method: string | null
          bank_code: string
          bank_name: string
          configuration: Json | null
          created_at: string | null
          id: string
          is_active: boolean | null
          last_sync_at: string | null
          supports_balance_inquiry: boolean | null
          supports_statement: boolean | null
          supports_transfers: boolean | null
          updated_at: string | null
        }
        Insert: {
          api_endpoint?: string | null
          api_version?: string | null
          auth_method?: string | null
          bank_code: string
          bank_name: string
          configuration?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          supports_balance_inquiry?: boolean | null
          supports_statement?: boolean | null
          supports_transfers?: boolean | null
          updated_at?: string | null
        }
        Update: {
          api_endpoint?: string | null
          api_version?: string | null
          auth_method?: string | null
          bank_code?: string
          bank_name?: string
          configuration?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          supports_balance_inquiry?: boolean | null
          supports_statement?: boolean | null
          supports_transfers?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      bank_matching_rules: {
        Row: {
          account_mapping: Json
          conditions: Json
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          last_matched_at: string | null
          match_count: number | null
          priority: number | null
          rule_name: string
          updated_at: string | null
        }
        Insert: {
          account_mapping: Json
          conditions: Json
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          last_matched_at?: string | null
          match_count?: number | null
          priority?: number | null
          rule_name: string
          updated_at?: string | null
        }
        Update: {
          account_mapping?: Json
          conditions?: Json
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          last_matched_at?: string | null
          match_count?: number | null
          priority?: number | null
          rule_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      bank_reconciliation_matches: {
        Row: {
          bank_transaction_id: string | null
          confidence_score: number | null
          id: string
          journal_entry_id: string | null
          match_type: string
          matched_at: string | null
          matched_by: string | null
          matching_rule_id: string | null
          notes: string | null
        }
        Insert: {
          bank_transaction_id?: string | null
          confidence_score?: number | null
          id?: string
          journal_entry_id?: string | null
          match_type: string
          matched_at?: string | null
          matched_by?: string | null
          matching_rule_id?: string | null
          notes?: string | null
        }
        Update: {
          bank_transaction_id?: string | null
          confidence_score?: number | null
          id?: string
          journal_entry_id?: string | null
          match_type?: string
          matched_at?: string | null
          matched_by?: string | null
          matching_rule_id?: string | null
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bank_reconciliation_matches_bank_transaction_id_fkey"
            columns: ["bank_transaction_id"]
            isOneToOne: false
            referencedRelation: "bank_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bank_reconciliation_matches_bank_transaction_id_fkey"
            columns: ["bank_transaction_id"]
            isOneToOne: false
            referencedRelation: "unmatched_bank_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bank_reconciliation_matches_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "general_ledger"
            referencedColumns: ["entry_id"]
          },
          {
            foreignKeyName: "bank_reconciliation_matches_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bank_reconciliation_matches_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries_with_lines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bank_reconciliation_matches_matching_rule_id_fkey"
            columns: ["matching_rule_id"]
            isOneToOne: false
            referencedRelation: "bank_matching_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      bank_statements: {
        Row: {
          bank_account_id: string
          closing_balance: number
          created_at: string
          id: string
          opening_balance: number
          reconciled_at: string | null
          statement_date: string
          status: string
          updated_at: string
        }
        Insert: {
          bank_account_id: string
          closing_balance: number
          created_at?: string
          id?: string
          opening_balance: number
          reconciled_at?: string | null
          statement_date: string
          status?: string
          updated_at?: string
        }
        Update: {
          bank_account_id?: string
          closing_balance?: number
          created_at?: string
          id?: string
          opening_balance?: number
          reconciled_at?: string | null
          statement_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bank_statements_bank_account_id_fkey"
            columns: ["bank_account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      bank_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string
          id: string
          is_matched: boolean
          journal_entry_id: string | null
          reference_number: string | null
          statement_id: string
          transaction_date: string
          transaction_type: string
        }
        Insert: {
          amount: number
          created_at?: string
          description: string
          id?: string
          is_matched?: boolean
          journal_entry_id?: string | null
          reference_number?: string | null
          statement_id: string
          transaction_date: string
          transaction_type: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          id?: string
          is_matched?: boolean
          journal_entry_id?: string | null
          reference_number?: string | null
          statement_id?: string
          transaction_date?: string
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "bank_transactions_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "general_ledger"
            referencedColumns: ["entry_id"]
          },
          {
            foreignKeyName: "bank_transactions_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bank_transactions_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries_with_lines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bank_transactions_statement_id_fkey"
            columns: ["statement_id"]
            isOneToOne: false
            referencedRelation: "bank_statements"
            referencedColumns: ["id"]
          },
        ]
      }
      bank_transfer_details: {
        Row: {
          amount: number
          bank_name: string | null
          beneficiary_id: string | null
          beneficiary_name: string
          created_at: string | null
          description: string | null
          error_message: string | null
          iban: string
          id: string
          payment_voucher_id: string | null
          processed_at: string | null
          reference_number: string | null
          status: string
          transfer_file_id: string | null
        }
        Insert: {
          amount: number
          bank_name?: string | null
          beneficiary_id?: string | null
          beneficiary_name: string
          created_at?: string | null
          description?: string | null
          error_message?: string | null
          iban: string
          id?: string
          payment_voucher_id?: string | null
          processed_at?: string | null
          reference_number?: string | null
          status?: string
          transfer_file_id?: string | null
        }
        Update: {
          amount?: number
          bank_name?: string | null
          beneficiary_id?: string | null
          beneficiary_name?: string
          created_at?: string | null
          description?: string | null
          error_message?: string | null
          iban?: string
          id?: string
          payment_voucher_id?: string | null
          processed_at?: string | null
          reference_number?: string | null
          status?: string
          transfer_file_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bank_transfer_details_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bank_transfer_details_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries_masked"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bank_transfer_details_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bank_transfer_details_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiary_account_statement"
            referencedColumns: ["beneficiary_id"]
          },
          {
            foreignKeyName: "bank_transfer_details_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiary_statistics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bank_transfer_details_payment_voucher_id_fkey"
            columns: ["payment_voucher_id"]
            isOneToOne: false
            referencedRelation: "payment_vouchers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bank_transfer_details_payment_voucher_id_fkey"
            columns: ["payment_voucher_id"]
            isOneToOne: false
            referencedRelation: "payment_vouchers_masked"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bank_transfer_details_payment_voucher_id_fkey"
            columns: ["payment_voucher_id"]
            isOneToOne: false
            referencedRelation: "payment_vouchers_with_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bank_transfer_details_transfer_file_id_fkey"
            columns: ["transfer_file_id"]
            isOneToOne: false
            referencedRelation: "bank_transfer_files"
            referencedColumns: ["id"]
          },
        ]
      }
      bank_transfer_files: {
        Row: {
          bank_account_id: string | null
          created_at: string | null
          created_by: string | null
          distribution_id: string | null
          error_message: string | null
          file_content: string | null
          file_format: string
          file_number: string
          file_path: string | null
          generated_at: string | null
          id: string
          metadata: Json | null
          processed_at: string | null
          sent_at: string | null
          status: string
          total_amount: number
          total_transactions: number
          updated_at: string | null
        }
        Insert: {
          bank_account_id?: string | null
          created_at?: string | null
          created_by?: string | null
          distribution_id?: string | null
          error_message?: string | null
          file_content?: string | null
          file_format: string
          file_number: string
          file_path?: string | null
          generated_at?: string | null
          id?: string
          metadata?: Json | null
          processed_at?: string | null
          sent_at?: string | null
          status?: string
          total_amount: number
          total_transactions: number
          updated_at?: string | null
        }
        Update: {
          bank_account_id?: string | null
          created_at?: string | null
          created_by?: string | null
          distribution_id?: string | null
          error_message?: string | null
          file_content?: string | null
          file_format?: string
          file_number?: string
          file_path?: string | null
          generated_at?: string | null
          id?: string
          metadata?: Json | null
          processed_at?: string | null
          sent_at?: string | null
          status?: string
          total_amount?: number
          total_transactions?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bank_transfer_files_bank_account_id_fkey"
            columns: ["bank_account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bank_transfer_files_distribution_id_fkey"
            columns: ["distribution_id"]
            isOneToOne: false
            referencedRelation: "distribution_statistics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bank_transfer_files_distribution_id_fkey"
            columns: ["distribution_id"]
            isOneToOne: false
            referencedRelation: "distributions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bank_transfer_files_distribution_id_fkey"
            columns: ["distribution_id"]
            isOneToOne: false
            referencedRelation: "distributions_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bank_transfer_files_distribution_id_fkey"
            columns: ["distribution_id"]
            isOneToOne: false
            referencedRelation: "payment_vouchers_with_details"
            referencedColumns: ["distribution_id_ref"]
          },
        ]
      }
      beneficiaries: {
        Row: {
          account_balance: number | null
          address: string | null
          bank_account_number: string | null
          bank_name: string | null
          beneficiary_number: string | null
          beneficiary_type: string | null
          can_login: boolean | null
          category: string
          city: string | null
          created_at: string
          date_of_birth: string | null
          deleted_at: string | null
          deleted_by: string | null
          deletion_reason: string | null
          disabilities: Json | null
          eligibility_notes: string | null
          eligibility_status: string | null
          email: string | null
          employment_status: string | null
          family_id: string | null
          family_name: string | null
          family_size: number | null
          full_name: string
          gender: string | null
          housing_type: string | null
          iban: string | null
          id: string
          income_sources: Json | null
          is_head_of_family: boolean | null
          last_activity_at: string | null
          last_login_at: string | null
          last_notification_at: string | null
          last_review_date: string | null
          last_verification_date: string | null
          login_enabled_at: string | null
          marital_status: string | null
          medical_conditions: Json | null
          monthly_income: number | null
          national_id: string
          nationality: string | null
          next_review_date: string | null
          notes: string | null
          notification_preferences: Json | null
          number_of_daughters: number | null
          number_of_sons: number | null
          number_of_wives: number | null
          parent_beneficiary_id: string | null
          pending_amount: number | null
          pending_requests: number | null
          phone: string
          priority_level: number | null
          relationship: string | null
          risk_score: number | null
          social_status_details: Json | null
          status: string
          tags: string[] | null
          total_payments: number | null
          total_received: number | null
          tribe: string | null
          updated_at: string
          user_id: string | null
          username: string | null
          verification_documents: Json | null
          verification_method: string | null
          verification_notes: string | null
          verification_status: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          account_balance?: number | null
          address?: string | null
          bank_account_number?: string | null
          bank_name?: string | null
          beneficiary_number?: string | null
          beneficiary_type?: string | null
          can_login?: boolean | null
          category: string
          city?: string | null
          created_at?: string
          date_of_birth?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          disabilities?: Json | null
          eligibility_notes?: string | null
          eligibility_status?: string | null
          email?: string | null
          employment_status?: string | null
          family_id?: string | null
          family_name?: string | null
          family_size?: number | null
          full_name: string
          gender?: string | null
          housing_type?: string | null
          iban?: string | null
          id?: string
          income_sources?: Json | null
          is_head_of_family?: boolean | null
          last_activity_at?: string | null
          last_login_at?: string | null
          last_notification_at?: string | null
          last_review_date?: string | null
          last_verification_date?: string | null
          login_enabled_at?: string | null
          marital_status?: string | null
          medical_conditions?: Json | null
          monthly_income?: number | null
          national_id: string
          nationality?: string | null
          next_review_date?: string | null
          notes?: string | null
          notification_preferences?: Json | null
          number_of_daughters?: number | null
          number_of_sons?: number | null
          number_of_wives?: number | null
          parent_beneficiary_id?: string | null
          pending_amount?: number | null
          pending_requests?: number | null
          phone: string
          priority_level?: number | null
          relationship?: string | null
          risk_score?: number | null
          social_status_details?: Json | null
          status?: string
          tags?: string[] | null
          total_payments?: number | null
          total_received?: number | null
          tribe?: string | null
          updated_at?: string
          user_id?: string | null
          username?: string | null
          verification_documents?: Json | null
          verification_method?: string | null
          verification_notes?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          account_balance?: number | null
          address?: string | null
          bank_account_number?: string | null
          bank_name?: string | null
          beneficiary_number?: string | null
          beneficiary_type?: string | null
          can_login?: boolean | null
          category?: string
          city?: string | null
          created_at?: string
          date_of_birth?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          disabilities?: Json | null
          eligibility_notes?: string | null
          eligibility_status?: string | null
          email?: string | null
          employment_status?: string | null
          family_id?: string | null
          family_name?: string | null
          family_size?: number | null
          full_name?: string
          gender?: string | null
          housing_type?: string | null
          iban?: string | null
          id?: string
          income_sources?: Json | null
          is_head_of_family?: boolean | null
          last_activity_at?: string | null
          last_login_at?: string | null
          last_notification_at?: string | null
          last_review_date?: string | null
          last_verification_date?: string | null
          login_enabled_at?: string | null
          marital_status?: string | null
          medical_conditions?: Json | null
          monthly_income?: number | null
          national_id?: string
          nationality?: string | null
          next_review_date?: string | null
          notes?: string | null
          notification_preferences?: Json | null
          number_of_daughters?: number | null
          number_of_sons?: number | null
          number_of_wives?: number | null
          parent_beneficiary_id?: string | null
          pending_amount?: number | null
          pending_requests?: number | null
          phone?: string
          priority_level?: number | null
          relationship?: string | null
          risk_score?: number | null
          social_status_details?: Json | null
          status?: string
          tags?: string[] | null
          total_payments?: number | null
          total_received?: number | null
          tribe?: string | null
          updated_at?: string
          user_id?: string | null
          username?: string | null
          verification_documents?: Json | null
          verification_method?: string | null
          verification_notes?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "beneficiaries_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "beneficiaries_parent_beneficiary_id_fkey"
            columns: ["parent_beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "beneficiaries_parent_beneficiary_id_fkey"
            columns: ["parent_beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries_masked"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "beneficiaries_parent_beneficiary_id_fkey"
            columns: ["parent_beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "beneficiaries_parent_beneficiary_id_fkey"
            columns: ["parent_beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiary_account_statement"
            referencedColumns: ["beneficiary_id"]
          },
          {
            foreignKeyName: "beneficiaries_parent_beneficiary_id_fkey"
            columns: ["parent_beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiary_statistics"
            referencedColumns: ["id"]
          },
        ]
      }
      beneficiary_activity_log: {
        Row: {
          action_description: string
          action_type: string
          beneficiary_id: string
          created_at: string | null
          id: string
          ip_address: string | null
          new_values: Json | null
          old_values: Json | null
          performed_by: string | null
          performed_by_name: string | null
          user_agent: string | null
        }
        Insert: {
          action_description: string
          action_type: string
          beneficiary_id: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          performed_by?: string | null
          performed_by_name?: string | null
          user_agent?: string | null
        }
        Update: {
          action_description?: string
          action_type?: string
          beneficiary_id?: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          performed_by?: string | null
          performed_by_name?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "beneficiary_activity_log_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "beneficiary_activity_log_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries_masked"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "beneficiary_activity_log_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "beneficiary_activity_log_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiary_account_statement"
            referencedColumns: ["beneficiary_id"]
          },
          {
            foreignKeyName: "beneficiary_activity_log_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiary_statistics"
            referencedColumns: ["id"]
          },
        ]
      }
      beneficiary_attachments: {
        Row: {
          beneficiary_id: string
          created_at: string | null
          description: string | null
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string
          id: string
          is_verified: boolean | null
          mime_type: string | null
          updated_at: string | null
          uploaded_by: string | null
          uploaded_by_name: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          beneficiary_id: string
          created_at?: string | null
          description?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          file_type: string
          id?: string
          is_verified?: boolean | null
          mime_type?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
          uploaded_by_name?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          beneficiary_id?: string
          created_at?: string | null
          description?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string
          id?: string
          is_verified?: boolean | null
          mime_type?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
          uploaded_by_name?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "beneficiary_attachments_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "beneficiary_attachments_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries_masked"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "beneficiary_attachments_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "beneficiary_attachments_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiary_account_statement"
            referencedColumns: ["beneficiary_id"]
          },
          {
            foreignKeyName: "beneficiary_attachments_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiary_statistics"
            referencedColumns: ["id"]
          },
        ]
      }
      beneficiary_categories: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      beneficiary_changes_log: {
        Row: {
          beneficiary_id: string | null
          change_reason: string | null
          change_type: string
          changed_by: string | null
          changed_by_name: string | null
          changed_by_role: string | null
          created_at: string | null
          field_name: string | null
          id: string
          ip_address: string | null
          new_value: string | null
          old_value: string | null
          user_agent: string | null
        }
        Insert: {
          beneficiary_id?: string | null
          change_reason?: string | null
          change_type: string
          changed_by?: string | null
          changed_by_name?: string | null
          changed_by_role?: string | null
          created_at?: string | null
          field_name?: string | null
          id?: string
          ip_address?: string | null
          new_value?: string | null
          old_value?: string | null
          user_agent?: string | null
        }
        Update: {
          beneficiary_id?: string | null
          change_reason?: string | null
          change_type?: string
          changed_by?: string | null
          changed_by_name?: string | null
          changed_by_role?: string | null
          created_at?: string | null
          field_name?: string | null
          id?: string
          ip_address?: string | null
          new_value?: string | null
          old_value?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "beneficiary_changes_log_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "beneficiary_changes_log_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries_masked"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "beneficiary_changes_log_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "beneficiary_changes_log_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiary_account_statement"
            referencedColumns: ["beneficiary_id"]
          },
          {
            foreignKeyName: "beneficiary_changes_log_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiary_statistics"
            referencedColumns: ["id"]
          },
        ]
      }
      beneficiary_requests: {
        Row: {
          amount: number | null
          approved_at: string | null
          assigned_at: string | null
          assigned_to: string | null
          attachments_count: number | null
          beneficiary_id: string
          created_at: string | null
          decision_notes: string | null
          deleted_at: string | null
          deleted_by: string | null
          deletion_reason: string | null
          description: string
          id: string
          is_overdue: boolean | null
          last_message_at: string | null
          priority: string | null
          rejection_reason: string | null
          request_number: string | null
          request_type_id: string | null
          reviewed_at: string | null
          sla_due_at: string | null
          status: string | null
          submitted_at: string | null
          updated_at: string | null
        }
        Insert: {
          amount?: number | null
          approved_at?: string | null
          assigned_at?: string | null
          assigned_to?: string | null
          attachments_count?: number | null
          beneficiary_id: string
          created_at?: string | null
          decision_notes?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          description: string
          id?: string
          is_overdue?: boolean | null
          last_message_at?: string | null
          priority?: string | null
          rejection_reason?: string | null
          request_number?: string | null
          request_type_id?: string | null
          reviewed_at?: string | null
          sla_due_at?: string | null
          status?: string | null
          submitted_at?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number | null
          approved_at?: string | null
          assigned_at?: string | null
          assigned_to?: string | null
          attachments_count?: number | null
          beneficiary_id?: string
          created_at?: string | null
          decision_notes?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          description?: string
          id?: string
          is_overdue?: boolean | null
          last_message_at?: string | null
          priority?: string | null
          rejection_reason?: string | null
          request_number?: string | null
          request_type_id?: string | null
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
            foreignKeyName: "beneficiary_requests_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries_masked"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "beneficiary_requests_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "beneficiary_requests_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiary_account_statement"
            referencedColumns: ["beneficiary_id"]
          },
          {
            foreignKeyName: "beneficiary_requests_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiary_statistics"
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
      beneficiary_sessions: {
        Row: {
          beneficiary_id: string
          created_at: string | null
          current_page: string | null
          current_section: string | null
          id: string
          ip_address: string | null
          is_online: boolean | null
          last_activity: string | null
          session_start: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          beneficiary_id: string
          created_at?: string | null
          current_page?: string | null
          current_section?: string | null
          id?: string
          ip_address?: string | null
          is_online?: boolean | null
          last_activity?: string | null
          session_start?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          beneficiary_id?: string
          created_at?: string | null
          current_page?: string | null
          current_section?: string | null
          id?: string
          ip_address?: string | null
          is_online?: boolean | null
          last_activity?: string | null
          session_start?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "beneficiary_sessions_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "beneficiary_sessions_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries_masked"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "beneficiary_sessions_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "beneficiary_sessions_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiary_account_statement"
            referencedColumns: ["beneficiary_id"]
          },
          {
            foreignKeyName: "beneficiary_sessions_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiary_statistics"
            referencedColumns: ["id"]
          },
        ]
      }
      beneficiary_tags: {
        Row: {
          beneficiary_id: string
          created_at: string | null
          created_by: string | null
          id: string
          tag_category: string | null
          tag_color: string | null
          tag_name: string
        }
        Insert: {
          beneficiary_id: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          tag_category?: string | null
          tag_color?: string | null
          tag_name: string
        }
        Update: {
          beneficiary_id?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          tag_category?: string | null
          tag_color?: string | null
          tag_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "beneficiary_tags_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "beneficiary_tags_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries_masked"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "beneficiary_tags_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "beneficiary_tags_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiary_account_statement"
            referencedColumns: ["beneficiary_id"]
          },
          {
            foreignKeyName: "beneficiary_tags_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiary_statistics"
            referencedColumns: ["id"]
          },
        ]
      }
      beneficiary_visibility_audit: {
        Row: {
          changed_at: string | null
          changed_by: string | null
          changed_by_name: string | null
          id: string
          ip_address: string | null
          new_value: boolean | null
          old_value: boolean | null
          reason: string | null
          setting_name: string
        }
        Insert: {
          changed_at?: string | null
          changed_by?: string | null
          changed_by_name?: string | null
          id?: string
          ip_address?: string | null
          new_value?: boolean | null
          old_value?: boolean | null
          reason?: string | null
          setting_name: string
        }
        Update: {
          changed_at?: string | null
          changed_by?: string | null
          changed_by_name?: string | null
          id?: string
          ip_address?: string | null
          new_value?: boolean | null
          old_value?: boolean | null
          reason?: string | null
          setting_name?: string
        }
        Relationships: []
      }
      beneficiary_visibility_settings: {
        Row: {
          allow_download_documents: boolean | null
          allow_export_pdf: boolean | null
          allow_preview_documents: boolean | null
          allow_print: boolean | null
          allow_profile_edit: boolean | null
          created_at: string | null
          id: string
          mask_exact_amounts: boolean | null
          mask_iban: boolean | null
          mask_loan_amounts: boolean | null
          mask_national_ids: boolean | null
          mask_phone_numbers: boolean | null
          mask_tenant_info: boolean | null
          notes: string | null
          show_annual_budget: boolean | null
          show_approvals_log: boolean | null
          show_archive_contracts: boolean | null
          show_archive_financial_reports: boolean | null
          show_archive_legal_docs: boolean | null
          show_archive_meeting_minutes: boolean | null
          show_audit_reports: boolean | null
          show_bank_accounts: boolean | null
          show_bank_balances: boolean | null
          show_bank_statements: boolean | null
          show_bank_transactions: boolean | null
          show_beneficiaries_statistics: boolean | null
          show_beneficiary_categories: boolean | null
          show_budget_execution: boolean | null
          show_budgets: boolean | null
          show_compliance_reports: boolean | null
          show_contracts_details: boolean | null
          show_disclosures: boolean | null
          show_distributions: boolean | null
          show_documents: boolean | null
          show_emergency_aid: boolean | null
          show_emergency_statistics: boolean | null
          show_expenses_breakdown: boolean | null
          show_family_tree: boolean | null
          show_financial_reports: boolean | null
          show_governance: boolean | null
          show_governance_meetings: boolean | null
          show_inactive_beneficiaries: boolean | null
          show_internal_messages: boolean | null
          show_investment_plans: boolean | null
          show_invoices: boolean | null
          show_journal_entries: boolean | null
          show_ledger_details: boolean | null
          show_maintenance_costs: boolean | null
          show_nazer_decisions: boolean | null
          show_other_beneficiaries_amounts: boolean | null
          show_other_beneficiaries_names: boolean | null
          show_other_beneficiaries_personal_data: boolean | null
          show_other_loans: boolean | null
          show_overview: boolean | null
          show_own_loans: boolean | null
          show_policy_changes: boolean | null
          show_profile: boolean | null
          show_properties: boolean | null
          show_property_revenues: boolean | null
          show_requests: boolean | null
          show_reserve_funds: boolean | null
          show_statements: boolean | null
          show_strategic_plans: boolean | null
          show_support_tickets: boolean | null
          show_total_beneficiaries_count: boolean | null
          show_trial_balance: boolean | null
          target_role: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          allow_download_documents?: boolean | null
          allow_export_pdf?: boolean | null
          allow_preview_documents?: boolean | null
          allow_print?: boolean | null
          allow_profile_edit?: boolean | null
          created_at?: string | null
          id?: string
          mask_exact_amounts?: boolean | null
          mask_iban?: boolean | null
          mask_loan_amounts?: boolean | null
          mask_national_ids?: boolean | null
          mask_phone_numbers?: boolean | null
          mask_tenant_info?: boolean | null
          notes?: string | null
          show_annual_budget?: boolean | null
          show_approvals_log?: boolean | null
          show_archive_contracts?: boolean | null
          show_archive_financial_reports?: boolean | null
          show_archive_legal_docs?: boolean | null
          show_archive_meeting_minutes?: boolean | null
          show_audit_reports?: boolean | null
          show_bank_accounts?: boolean | null
          show_bank_balances?: boolean | null
          show_bank_statements?: boolean | null
          show_bank_transactions?: boolean | null
          show_beneficiaries_statistics?: boolean | null
          show_beneficiary_categories?: boolean | null
          show_budget_execution?: boolean | null
          show_budgets?: boolean | null
          show_compliance_reports?: boolean | null
          show_contracts_details?: boolean | null
          show_disclosures?: boolean | null
          show_distributions?: boolean | null
          show_documents?: boolean | null
          show_emergency_aid?: boolean | null
          show_emergency_statistics?: boolean | null
          show_expenses_breakdown?: boolean | null
          show_family_tree?: boolean | null
          show_financial_reports?: boolean | null
          show_governance?: boolean | null
          show_governance_meetings?: boolean | null
          show_inactive_beneficiaries?: boolean | null
          show_internal_messages?: boolean | null
          show_investment_plans?: boolean | null
          show_invoices?: boolean | null
          show_journal_entries?: boolean | null
          show_ledger_details?: boolean | null
          show_maintenance_costs?: boolean | null
          show_nazer_decisions?: boolean | null
          show_other_beneficiaries_amounts?: boolean | null
          show_other_beneficiaries_names?: boolean | null
          show_other_beneficiaries_personal_data?: boolean | null
          show_other_loans?: boolean | null
          show_overview?: boolean | null
          show_own_loans?: boolean | null
          show_policy_changes?: boolean | null
          show_profile?: boolean | null
          show_properties?: boolean | null
          show_property_revenues?: boolean | null
          show_requests?: boolean | null
          show_reserve_funds?: boolean | null
          show_statements?: boolean | null
          show_strategic_plans?: boolean | null
          show_support_tickets?: boolean | null
          show_total_beneficiaries_count?: boolean | null
          show_trial_balance?: boolean | null
          target_role?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          allow_download_documents?: boolean | null
          allow_export_pdf?: boolean | null
          allow_preview_documents?: boolean | null
          allow_print?: boolean | null
          allow_profile_edit?: boolean | null
          created_at?: string | null
          id?: string
          mask_exact_amounts?: boolean | null
          mask_iban?: boolean | null
          mask_loan_amounts?: boolean | null
          mask_national_ids?: boolean | null
          mask_phone_numbers?: boolean | null
          mask_tenant_info?: boolean | null
          notes?: string | null
          show_annual_budget?: boolean | null
          show_approvals_log?: boolean | null
          show_archive_contracts?: boolean | null
          show_archive_financial_reports?: boolean | null
          show_archive_legal_docs?: boolean | null
          show_archive_meeting_minutes?: boolean | null
          show_audit_reports?: boolean | null
          show_bank_accounts?: boolean | null
          show_bank_balances?: boolean | null
          show_bank_statements?: boolean | null
          show_bank_transactions?: boolean | null
          show_beneficiaries_statistics?: boolean | null
          show_beneficiary_categories?: boolean | null
          show_budget_execution?: boolean | null
          show_budgets?: boolean | null
          show_compliance_reports?: boolean | null
          show_contracts_details?: boolean | null
          show_disclosures?: boolean | null
          show_distributions?: boolean | null
          show_documents?: boolean | null
          show_emergency_aid?: boolean | null
          show_emergency_statistics?: boolean | null
          show_expenses_breakdown?: boolean | null
          show_family_tree?: boolean | null
          show_financial_reports?: boolean | null
          show_governance?: boolean | null
          show_governance_meetings?: boolean | null
          show_inactive_beneficiaries?: boolean | null
          show_internal_messages?: boolean | null
          show_investment_plans?: boolean | null
          show_invoices?: boolean | null
          show_journal_entries?: boolean | null
          show_ledger_details?: boolean | null
          show_maintenance_costs?: boolean | null
          show_nazer_decisions?: boolean | null
          show_other_beneficiaries_amounts?: boolean | null
          show_other_beneficiaries_names?: boolean | null
          show_other_beneficiaries_personal_data?: boolean | null
          show_other_loans?: boolean | null
          show_overview?: boolean | null
          show_own_loans?: boolean | null
          show_policy_changes?: boolean | null
          show_profile?: boolean | null
          show_properties?: boolean | null
          show_property_revenues?: boolean | null
          show_requests?: boolean | null
          show_reserve_funds?: boolean | null
          show_statements?: boolean | null
          show_strategic_plans?: boolean | null
          show_support_tickets?: boolean | null
          show_total_beneficiaries_count?: boolean | null
          show_trial_balance?: boolean | null
          target_role?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      broadcast_notifications: {
        Row: {
          action_url: string | null
          created_at: string | null
          id: string
          message: string
          priority: string | null
          recipient_count: number | null
          sent_by: string | null
          sent_by_name: string | null
          target_type: string
          target_value: string | null
          title: string
          type: string | null
        }
        Insert: {
          action_url?: string | null
          created_at?: string | null
          id?: string
          message: string
          priority?: string | null
          recipient_count?: number | null
          sent_by?: string | null
          sent_by_name?: string | null
          target_type: string
          target_value?: string | null
          title: string
          type?: string | null
        }
        Update: {
          action_url?: string | null
          created_at?: string | null
          id?: string
          message?: string
          priority?: string | null
          recipient_count?: number | null
          sent_by?: string | null
          sent_by_name?: string | null
          target_type?: string
          target_value?: string | null
          title?: string
          type?: string | null
        }
        Relationships: []
      }
      budget_items: {
        Row: {
          account_id: string | null
          actual_amount: number | null
          budget_id: string | null
          category: string
          created_at: string | null
          description: string | null
          id: string
          notes: string | null
          planned_amount: number
          updated_at: string | null
          variance: number | null
          waqf_unit_id: string | null
        }
        Insert: {
          account_id?: string | null
          actual_amount?: number | null
          budget_id?: string | null
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          notes?: string | null
          planned_amount?: number
          updated_at?: string | null
          variance?: number | null
          waqf_unit_id?: string | null
        }
        Update: {
          account_id?: string | null
          actual_amount?: number | null
          budget_id?: string | null
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          notes?: string | null
          planned_amount?: number
          updated_at?: string | null
          variance?: number | null
          waqf_unit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "budget_items_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_items_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts_hierarchy"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_items_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "general_ledger"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "budget_items_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "trial_balance"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "budget_items_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "waqf_balance_summary"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "budget_items_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "budgets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_items_waqf_unit_id_fkey"
            columns: ["waqf_unit_id"]
            isOneToOne: false
            referencedRelation: "waqf_units"
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
          notes: string | null
          period_end_date: string | null
          period_number: number | null
          period_start_date: string | null
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
          notes?: string | null
          period_end_date?: string | null
          period_number?: number | null
          period_start_date?: string | null
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
          notes?: string | null
          period_end_date?: string | null
          period_number?: number | null
          period_start_date?: string | null
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
            foreignKeyName: "budgets_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts_hierarchy"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budgets_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "general_ledger"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "budgets_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "trial_balance"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "budgets_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "waqf_balance_summary"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "budgets_fiscal_year_id_fkey"
            columns: ["fiscal_year_id"]
            isOneToOne: false
            referencedRelation: "financial_summary"
            referencedColumns: ["fiscal_year_id"]
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
      cash_flows: {
        Row: {
          closing_cash: number
          created_at: string
          financing_activities: number
          fiscal_year_id: string
          id: string
          investing_activities: number
          net_cash_flow: number
          opening_cash: number
          operating_activities: number
          period_end: string
          period_start: string
          updated_at: string
        }
        Insert: {
          closing_cash?: number
          created_at?: string
          financing_activities?: number
          fiscal_year_id: string
          id?: string
          investing_activities?: number
          net_cash_flow?: number
          opening_cash?: number
          operating_activities?: number
          period_end: string
          period_start: string
          updated_at?: string
        }
        Update: {
          closing_cash?: number
          created_at?: string
          financing_activities?: number
          fiscal_year_id?: string
          id?: string
          investing_activities?: number
          net_cash_flow?: number
          opening_cash?: number
          operating_activities?: number
          period_end?: string
          period_start?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cash_flows_fiscal_year_id_fkey"
            columns: ["fiscal_year_id"]
            isOneToOne: false
            referencedRelation: "financial_summary"
            referencedColumns: ["fiscal_year_id"]
          },
          {
            foreignKeyName: "cash_flows_fiscal_year_id_fkey"
            columns: ["fiscal_year_id"]
            isOneToOne: false
            referencedRelation: "fiscal_years"
            referencedColumns: ["id"]
          },
        ]
      }
      cashier_shifts: {
        Row: {
          cashier_id: string
          cashier_name: string | null
          closed_at: string | null
          closed_by: string | null
          closing_balance: number | null
          created_at: string
          expected_balance: number | null
          id: string
          notes: string | null
          opened_at: string
          opening_balance: number
          shift_number: string
          status: string
          total_collections: number | null
          total_payments: number | null
          transactions_count: number | null
          updated_at: string
          variance: number | null
        }
        Insert: {
          cashier_id: string
          cashier_name?: string | null
          closed_at?: string | null
          closed_by?: string | null
          closing_balance?: number | null
          created_at?: string
          expected_balance?: number | null
          id?: string
          notes?: string | null
          opened_at?: string
          opening_balance?: number
          shift_number: string
          status?: string
          total_collections?: number | null
          total_payments?: number | null
          transactions_count?: number | null
          updated_at?: string
          variance?: number | null
        }
        Update: {
          cashier_id?: string
          cashier_name?: string | null
          closed_at?: string | null
          closed_by?: string | null
          closing_balance?: number | null
          created_at?: string
          expected_balance?: number | null
          id?: string
          notes?: string | null
          opened_at?: string
          opening_balance?: number
          shift_number?: string
          status?: string
          total_collections?: number | null
          total_payments?: number | null
          transactions_count?: number | null
          updated_at?: string
          variance?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cashier_shifts_closed_by_fkey"
            columns: ["closed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chatbot_conversations: {
        Row: {
          context: Json | null
          created_at: string | null
          deleted_at: string | null
          deleted_by: string | null
          deletion_reason: string | null
          id: string
          message: string
          message_type: string
          quick_reply_id: string | null
          response: string | null
          user_id: string | null
        }
        Insert: {
          context?: Json | null
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          id?: string
          message: string
          message_type: string
          quick_reply_id?: string | null
          response?: string | null
          user_id?: string | null
        }
        Update: {
          context?: Json | null
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          id?: string
          message?: string
          message_type?: string
          quick_reply_id?: string | null
          response?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      chatbot_quick_replies: {
        Row: {
          category: string | null
          created_at: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          order_index: number | null
          prompt: string
          text: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          icon?: string | null
          id: string
          is_active?: boolean | null
          order_index?: number | null
          prompt: string
          text: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          order_index?: number | null
          prompt?: string
          text?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          read_at: string | null
          read_by: string | null
          replied_at: string | null
          replied_by: string | null
          reply_message: string | null
          sender_email: string
          sender_name: string
          sender_phone: string | null
          status: string
          subject: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          read_at?: string | null
          read_by?: string | null
          replied_at?: string | null
          replied_by?: string | null
          reply_message?: string | null
          sender_email: string
          sender_name: string
          sender_phone?: string | null
          status?: string
          subject: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          read_at?: string | null
          read_by?: string | null
          replied_at?: string | null
          replied_by?: string | null
          reply_message?: string | null
          sender_email?: string
          sender_name?: string
          sender_phone?: string | null
          status?: string
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      contract_attachments: {
        Row: {
          contract_id: string
          description: string | null
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string
          id: string
          uploaded_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          contract_id: string
          description?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          file_type: string
          id?: string
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          contract_id?: string
          description?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string
          id?: string
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contract_attachments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_notifications: {
        Row: {
          content: string
          contract_id: string
          created_at: string | null
          created_by: string | null
          created_by_name: string | null
          deleted_at: string | null
          deleted_by: string | null
          deletion_reason: string | null
          delivered_at: string | null
          delivery_method: string[] | null
          failure_reason: string | null
          id: string
          notification_type: string
          read_at: string | null
          recipient_email: string | null
          recipient_name: string | null
          recipient_phone: string | null
          sent_at: string | null
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          content: string
          contract_id: string
          created_at?: string | null
          created_by?: string | null
          created_by_name?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          delivered_at?: string | null
          delivery_method?: string[] | null
          failure_reason?: string | null
          id?: string
          notification_type: string
          read_at?: string | null
          recipient_email?: string | null
          recipient_name?: string | null
          recipient_phone?: string | null
          sent_at?: string | null
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          contract_id?: string
          created_at?: string | null
          created_by?: string | null
          created_by_name?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          delivered_at?: string | null
          delivery_method?: string[] | null
          failure_reason?: string | null
          id?: string
          notification_type?: string
          read_at?: string | null
          recipient_email?: string | null
          recipient_name?: string | null
          recipient_phone?: string | null
          sent_at?: string | null
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contract_notifications_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_renewals: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          new_contract_id: string | null
          new_end_date: string
          new_monthly_rent: number
          new_start_date: string
          notes: string | null
          original_contract_id: string
          renewal_date: string
          rent_increase_amount: number | null
          rent_increase_percentage: number | null
          status: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          new_contract_id?: string | null
          new_end_date: string
          new_monthly_rent: number
          new_start_date: string
          notes?: string | null
          original_contract_id: string
          renewal_date: string
          rent_increase_amount?: number | null
          rent_increase_percentage?: number | null
          status?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          new_contract_id?: string | null
          new_end_date?: string
          new_monthly_rent?: number
          new_start_date?: string
          notes?: string | null
          original_contract_id?: string
          renewal_date?: string
          rent_increase_amount?: number | null
          rent_increase_percentage?: number | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "contract_renewals_new_contract_id_fkey"
            columns: ["new_contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_renewals_original_contract_id_fkey"
            columns: ["original_contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_settlements: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          approved_by_name: string | null
          contract_id: string
          created_at: string | null
          created_by: string | null
          created_by_name: string | null
          damages_deduction: number | null
          early_termination_penalty: number | null
          id: string
          journal_entry_id: string | null
          net_settlement: number
          notes: string | null
          paid_rent: number | null
          security_deposit: number | null
          settlement_date: string
          settlement_number: string
          settlement_type: string
          status: string
          termination_reason: string | null
          total_contract_days: number | null
          updated_at: string | null
          used_days: number | null
          used_rent: number | null
          voucher_id: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          approved_by_name?: string | null
          contract_id: string
          created_at?: string | null
          created_by?: string | null
          created_by_name?: string | null
          damages_deduction?: number | null
          early_termination_penalty?: number | null
          id?: string
          journal_entry_id?: string | null
          net_settlement: number
          notes?: string | null
          paid_rent?: number | null
          security_deposit?: number | null
          settlement_date?: string
          settlement_number?: string
          settlement_type: string
          status?: string
          termination_reason?: string | null
          total_contract_days?: number | null
          updated_at?: string | null
          used_days?: number | null
          used_rent?: number | null
          voucher_id?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          approved_by_name?: string | null
          contract_id?: string
          created_at?: string | null
          created_by?: string | null
          created_by_name?: string | null
          damages_deduction?: number | null
          early_termination_penalty?: number | null
          id?: string
          journal_entry_id?: string | null
          net_settlement?: number
          notes?: string | null
          paid_rent?: number | null
          security_deposit?: number | null
          settlement_date?: string
          settlement_number?: string
          settlement_type?: string
          status?: string
          termination_reason?: string | null
          total_contract_days?: number | null
          updated_at?: string | null
          used_days?: number | null
          used_rent?: number | null
          voucher_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contract_settlements_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_settlements_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "general_ledger"
            referencedColumns: ["entry_id"]
          },
          {
            foreignKeyName: "contract_settlements_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_settlements_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries_with_lines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_settlements_voucher_id_fkey"
            columns: ["voucher_id"]
            isOneToOne: false
            referencedRelation: "payment_vouchers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_settlements_voucher_id_fkey"
            columns: ["voucher_id"]
            isOneToOne: false
            referencedRelation: "payment_vouchers_masked"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_settlements_voucher_id_fkey"
            columns: ["voucher_id"]
            isOneToOne: false
            referencedRelation: "payment_vouchers_with_details"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_termination_requests: {
        Row: {
          contract_id: string
          created_at: string | null
          created_by: string | null
          created_by_name: string | null
          deposit_refund: number | null
          id: string
          legal_basis: string | null
          penalty_amount: number | null
          reason: string
          request_number: string
          requested_by: string
          requested_date: string
          responded_at: string | null
          responded_by: string | null
          responded_by_name: string | null
          response_notes: string | null
          settlement_amount: number | null
          status: string
          termination_type: string
          updated_at: string | null
        }
        Insert: {
          contract_id: string
          created_at?: string | null
          created_by?: string | null
          created_by_name?: string | null
          deposit_refund?: number | null
          id?: string
          legal_basis?: string | null
          penalty_amount?: number | null
          reason: string
          request_number?: string
          requested_by: string
          requested_date?: string
          responded_at?: string | null
          responded_by?: string | null
          responded_by_name?: string | null
          response_notes?: string | null
          settlement_amount?: number | null
          status?: string
          termination_type: string
          updated_at?: string | null
        }
        Update: {
          contract_id?: string
          created_at?: string | null
          created_by?: string | null
          created_by_name?: string | null
          deposit_refund?: number | null
          id?: string
          legal_basis?: string | null
          penalty_amount?: number | null
          reason?: string
          request_number?: string
          requested_by?: string
          requested_date?: string
          responded_at?: string | null
          responded_by?: string | null
          responded_by_name?: string | null
          response_notes?: string | null
          settlement_amount?: number | null
          status?: string
          termination_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contract_termination_requests_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_units: {
        Row: {
          contract_id: string
          created_at: string | null
          id: string
          property_unit_id: string
          updated_at: string | null
        }
        Insert: {
          contract_id: string
          created_at?: string | null
          id?: string
          property_unit_id: string
          updated_at?: string | null
        }
        Update: {
          contract_id?: string
          created_at?: string | null
          id?: string
          property_unit_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contract_units_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_units_property_unit_id_fkey"
            columns: ["property_unit_id"]
            isOneToOne: false
            referencedRelation: "property_units"
            referencedColumns: ["id"]
          },
        ]
      }
      contracts: {
        Row: {
          auto_renew: boolean | null
          auto_renew_cancel_reason: string | null
          auto_renew_cancelled_at: string | null
          auto_renew_cancelled_by: string | null
          auto_renew_enabled: boolean | null
          contract_number: string
          contract_type: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          deletion_reason: string | null
          ejar_document_name: string | null
          ejar_document_url: string | null
          end_date: string
          id: string
          is_renewable: boolean | null
          monthly_rent: number
          notes: string | null
          payment_frequency: string
          property_id: string
          renewal_notice_days: number | null
          renewal_period_months: number | null
          security_deposit: number | null
          start_date: string
          status: string
          tax_percentage: number | null
          tenant_email: string | null
          tenant_id: string | null
          tenant_id_number: string
          tenant_name: string
          tenant_phone: string
          terms_and_conditions: string | null
          unit_id: string | null
          units_count: number | null
          updated_at: string
        }
        Insert: {
          auto_renew?: boolean | null
          auto_renew_cancel_reason?: string | null
          auto_renew_cancelled_at?: string | null
          auto_renew_cancelled_by?: string | null
          auto_renew_enabled?: boolean | null
          contract_number: string
          contract_type: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          ejar_document_name?: string | null
          ejar_document_url?: string | null
          end_date: string
          id?: string
          is_renewable?: boolean | null
          monthly_rent?: number
          notes?: string | null
          payment_frequency?: string
          property_id: string
          renewal_notice_days?: number | null
          renewal_period_months?: number | null
          security_deposit?: number | null
          start_date: string
          status?: string
          tax_percentage?: number | null
          tenant_email?: string | null
          tenant_id?: string | null
          tenant_id_number: string
          tenant_name: string
          tenant_phone: string
          terms_and_conditions?: string | null
          unit_id?: string | null
          units_count?: number | null
          updated_at?: string
        }
        Update: {
          auto_renew?: boolean | null
          auto_renew_cancel_reason?: string | null
          auto_renew_cancelled_at?: string | null
          auto_renew_cancelled_by?: string | null
          auto_renew_enabled?: boolean | null
          contract_number?: string
          contract_type?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          ejar_document_name?: string | null
          ejar_document_url?: string | null
          end_date?: string
          id?: string
          is_renewable?: boolean | null
          monthly_rent?: number
          notes?: string | null
          payment_frequency?: string
          property_id?: string
          renewal_notice_days?: number | null
          renewal_period_months?: number | null
          security_deposit?: number | null
          start_date?: string
          status?: string
          tax_percentage?: number | null
          tenant_email?: string | null
          tenant_id?: string | null
          tenant_id_number?: string
          tenant_name?: string
          tenant_phone?: string
          terms_and_conditions?: string | null
          unit_id?: string | null
          units_count?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contracts_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "property_performance"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "property_units"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_report_templates: {
        Row: {
          configuration: Json
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_favorite: boolean | null
          is_public: boolean | null
          name: string
          report_type: string
          updated_at: string | null
        }
        Insert: {
          configuration: Json
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_favorite?: boolean | null
          is_public?: boolean | null
          name: string
          report_type: string
          updated_at?: string | null
        }
        Update: {
          configuration?: Json
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_favorite?: boolean | null
          is_public?: boolean | null
          name?: string
          report_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      custom_reports: {
        Row: {
          configuration: Json
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_favorite: boolean | null
          is_shared: boolean | null
          last_run_at: string | null
          name: string
          report_type: string
          run_count: number | null
          updated_at: string | null
        }
        Insert: {
          configuration: Json
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_favorite?: boolean | null
          is_shared?: boolean | null
          last_run_at?: string | null
          name: string
          report_type: string
          run_count?: number | null
          updated_at?: string | null
        }
        Update: {
          configuration?: Json
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_favorite?: boolean | null
          is_shared?: boolean | null
          last_run_at?: string | null
          name?: string
          report_type?: string
          run_count?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      dashboard_configurations: {
        Row: {
          created_at: string | null
          dashboard_name: string
          id: string
          is_default: boolean | null
          is_shared: boolean | null
          layout_config: Json
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          dashboard_name: string
          id?: string
          is_default?: boolean | null
          is_shared?: boolean | null
          layout_config: Json
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          dashboard_name?: string
          id?: string
          is_default?: boolean | null
          is_shared?: boolean | null
          layout_config?: Json
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      dashboard_widgets: {
        Row: {
          config: Json | null
          created_at: string | null
          dashboard_id: string | null
          data_source: string | null
          height: number | null
          id: string
          is_visible: boolean | null
          position_x: number | null
          position_y: number | null
          refresh_interval: number | null
          updated_at: string | null
          widget_name: string
          widget_name_ar: string | null
          widget_type: string
          width: number | null
        }
        Insert: {
          config?: Json | null
          created_at?: string | null
          dashboard_id?: string | null
          data_source?: string | null
          height?: number | null
          id?: string
          is_visible?: boolean | null
          position_x?: number | null
          position_y?: number | null
          refresh_interval?: number | null
          updated_at?: string | null
          widget_name: string
          widget_name_ar?: string | null
          widget_type: string
          width?: number | null
        }
        Update: {
          config?: Json | null
          created_at?: string | null
          dashboard_id?: string | null
          data_source?: string | null
          height?: number | null
          id?: string
          is_visible?: boolean | null
          position_x?: number | null
          position_y?: number | null
          refresh_interval?: number | null
          updated_at?: string | null
          widget_name?: string
          widget_name_ar?: string | null
          widget_type?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "dashboard_widgets_dashboard_id_fkey"
            columns: ["dashboard_id"]
            isOneToOne: false
            referencedRelation: "dashboards"
            referencedColumns: ["id"]
          },
        ]
      }
      dashboards: {
        Row: {
          created_at: string | null
          created_by: string | null
          dashboard_name: string
          dashboard_name_ar: string | null
          description: string | null
          id: string
          is_default: boolean | null
          is_system: boolean | null
          layout_config: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          dashboard_name: string
          dashboard_name_ar?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          is_system?: boolean | null
          layout_config?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          dashboard_name?: string
          dashboard_name_ar?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          is_system?: boolean | null
          layout_config?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      disclosure_beneficiaries: {
        Row: {
          allocated_amount: number
          beneficiary_id: string | null
          beneficiary_name: string
          beneficiary_type: string
          created_at: string | null
          disclosure_id: string | null
          id: string
          payments_count: number | null
          relationship: string | null
        }
        Insert: {
          allocated_amount?: number
          beneficiary_id?: string | null
          beneficiary_name: string
          beneficiary_type: string
          created_at?: string | null
          disclosure_id?: string | null
          id?: string
          payments_count?: number | null
          relationship?: string | null
        }
        Update: {
          allocated_amount?: number
          beneficiary_id?: string | null
          beneficiary_name?: string
          beneficiary_type?: string
          created_at?: string | null
          disclosure_id?: string | null
          id?: string
          payments_count?: number | null
          relationship?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "disclosure_beneficiaries_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disclosure_beneficiaries_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries_masked"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disclosure_beneficiaries_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disclosure_beneficiaries_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiary_account_statement"
            referencedColumns: ["beneficiary_id"]
          },
          {
            foreignKeyName: "disclosure_beneficiaries_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiary_statistics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disclosure_beneficiaries_disclosure_id_fkey"
            columns: ["disclosure_id"]
            isOneToOne: false
            referencedRelation: "annual_disclosures"
            referencedColumns: ["id"]
          },
        ]
      }
      disclosure_documents: {
        Row: {
          content_summary: string | null
          created_at: string
          description: string | null
          disclosure_id: string
          document_name: string
          document_type: string
          extracted_content: Json | null
          file_path: string
          file_size: number | null
          fiscal_year: number
          id: string
          items_count: number | null
          total_amount: number | null
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          content_summary?: string | null
          created_at?: string
          description?: string | null
          disclosure_id: string
          document_name: string
          document_type: string
          extracted_content?: Json | null
          file_path: string
          file_size?: number | null
          fiscal_year: number
          id?: string
          items_count?: number | null
          total_amount?: number | null
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          content_summary?: string | null
          created_at?: string
          description?: string | null
          disclosure_id?: string
          document_name?: string
          document_type?: string
          extracted_content?: Json | null
          file_path?: string
          file_size?: number | null
          fiscal_year?: number
          id?: string
          items_count?: number | null
          total_amount?: number | null
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "disclosure_documents_disclosure_id_fkey"
            columns: ["disclosure_id"]
            isOneToOne: false
            referencedRelation: "annual_disclosures"
            referencedColumns: ["id"]
          },
        ]
      }
      distribution_approvals: {
        Row: {
          approval_level: number | null
          approved_at: string | null
          approver_id: string | null
          approver_name: string
          auto_approved: boolean | null
          created_at: string | null
          distribution_id: string
          id: string
          level: number
          notes: string | null
          notification_sent: boolean | null
          status: string
          updated_at: string | null
        }
        Insert: {
          approval_level?: number | null
          approved_at?: string | null
          approver_id?: string | null
          approver_name: string
          auto_approved?: boolean | null
          created_at?: string | null
          distribution_id: string
          id?: string
          level: number
          notes?: string | null
          notification_sent?: boolean | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          approval_level?: number | null
          approved_at?: string | null
          approver_id?: string | null
          approver_name?: string
          auto_approved?: boolean | null
          created_at?: string | null
          distribution_id?: string
          id?: string
          level?: number
          notes?: string | null
          notification_sent?: boolean | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "distribution_approvals_distribution_id_fkey"
            columns: ["distribution_id"]
            isOneToOne: false
            referencedRelation: "distribution_statistics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "distribution_approvals_distribution_id_fkey"
            columns: ["distribution_id"]
            isOneToOne: false
            referencedRelation: "distributions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "distribution_approvals_distribution_id_fkey"
            columns: ["distribution_id"]
            isOneToOne: false
            referencedRelation: "distributions_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "distribution_approvals_distribution_id_fkey"
            columns: ["distribution_id"]
            isOneToOne: false
            referencedRelation: "payment_vouchers_with_details"
            referencedColumns: ["distribution_id_ref"]
          },
        ]
      }
      distribution_details: {
        Row: {
          allocated_amount: number
          beneficiary_id: string
          beneficiary_type: string | null
          created_at: string | null
          distribution_id: string
          id: string
          notes: string | null
          payment_date: string | null
          payment_reference: string | null
          payment_status: string | null
          updated_at: string | null
        }
        Insert: {
          allocated_amount?: number
          beneficiary_id: string
          beneficiary_type?: string | null
          created_at?: string | null
          distribution_id: string
          id?: string
          notes?: string | null
          payment_date?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          updated_at?: string | null
        }
        Update: {
          allocated_amount?: number
          beneficiary_id?: string
          beneficiary_type?: string | null
          created_at?: string | null
          distribution_id?: string
          id?: string
          notes?: string | null
          payment_date?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "distribution_details_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "distribution_details_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries_masked"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "distribution_details_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "distribution_details_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiary_account_statement"
            referencedColumns: ["beneficiary_id"]
          },
          {
            foreignKeyName: "distribution_details_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiary_statistics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "distribution_details_distribution_id_fkey"
            columns: ["distribution_id"]
            isOneToOne: false
            referencedRelation: "distribution_statistics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "distribution_details_distribution_id_fkey"
            columns: ["distribution_id"]
            isOneToOne: false
            referencedRelation: "distributions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "distribution_details_distribution_id_fkey"
            columns: ["distribution_id"]
            isOneToOne: false
            referencedRelation: "distributions_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "distribution_details_distribution_id_fkey"
            columns: ["distribution_id"]
            isOneToOne: false
            referencedRelation: "payment_vouchers_with_details"
            referencedColumns: ["distribution_id_ref"]
          },
        ]
      }
      distributions: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          bank_statement_ref: string | null
          bank_transfer_file_id: string | null
          beneficiaries_count: number
          calculation_notes: string | null
          charity_percentage: number | null
          corpus_percentage: number | null
          created_at: string
          daughters_count: number | null
          deleted_at: string | null
          deleted_by: string | null
          deletion_reason: string | null
          distributable_amount: number | null
          distribution_date: string
          distribution_type: string | null
          executed_at: string | null
          executed_by: string | null
          expenses_amount: number | null
          id: string
          journal_entry_id: string | null
          maintenance_amount: number | null
          month: string
          nazer_percentage: number | null
          nazer_share: number | null
          net_revenues: number | null
          notes: string | null
          payment_method: string | null
          period_end: string | null
          period_start: string | null
          reserve_amount: number | null
          sons_count: number | null
          status: string
          total_amount: number
          total_expenses: number | null
          total_revenues: number | null
          updated_at: string
          waqf_corpus: number | null
          waqf_name: string | null
          waqf_unit_id: string | null
          waqif_charity: number | null
          wives_count: number | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          bank_statement_ref?: string | null
          bank_transfer_file_id?: string | null
          beneficiaries_count: number
          calculation_notes?: string | null
          charity_percentage?: number | null
          corpus_percentage?: number | null
          created_at?: string
          daughters_count?: number | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          distributable_amount?: number | null
          distribution_date: string
          distribution_type?: string | null
          executed_at?: string | null
          executed_by?: string | null
          expenses_amount?: number | null
          id?: string
          journal_entry_id?: string | null
          maintenance_amount?: number | null
          month: string
          nazer_percentage?: number | null
          nazer_share?: number | null
          net_revenues?: number | null
          notes?: string | null
          payment_method?: string | null
          period_end?: string | null
          period_start?: string | null
          reserve_amount?: number | null
          sons_count?: number | null
          status?: string
          total_amount: number
          total_expenses?: number | null
          total_revenues?: number | null
          updated_at?: string
          waqf_corpus?: number | null
          waqf_name?: string | null
          waqf_unit_id?: string | null
          waqif_charity?: number | null
          wives_count?: number | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          bank_statement_ref?: string | null
          bank_transfer_file_id?: string | null
          beneficiaries_count?: number
          calculation_notes?: string | null
          charity_percentage?: number | null
          corpus_percentage?: number | null
          created_at?: string
          daughters_count?: number | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          distributable_amount?: number | null
          distribution_date?: string
          distribution_type?: string | null
          executed_at?: string | null
          executed_by?: string | null
          expenses_amount?: number | null
          id?: string
          journal_entry_id?: string | null
          maintenance_amount?: number | null
          month?: string
          nazer_percentage?: number | null
          nazer_share?: number | null
          net_revenues?: number | null
          notes?: string | null
          payment_method?: string | null
          period_end?: string | null
          period_start?: string | null
          reserve_amount?: number | null
          sons_count?: number | null
          status?: string
          total_amount?: number
          total_expenses?: number | null
          total_revenues?: number | null
          updated_at?: string
          waqf_corpus?: number | null
          waqf_name?: string | null
          waqf_unit_id?: string | null
          waqif_charity?: number | null
          wives_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "distributions_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "general_ledger"
            referencedColumns: ["entry_id"]
          },
          {
            foreignKeyName: "distributions_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "distributions_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries_with_lines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "distributions_waqf_unit_id_fkey"
            columns: ["waqf_unit_id"]
            isOneToOne: false
            referencedRelation: "waqf_units"
            referencedColumns: ["id"]
          },
        ]
      }
      document_ocr_content: {
        Row: {
          confidence_score: number | null
          document_id: string
          extracted_at: string | null
          extracted_text: string | null
          id: string
          language: string | null
          metadata: Json | null
          page_number: number | null
        }
        Insert: {
          confidence_score?: number | null
          document_id: string
          extracted_at?: string | null
          extracted_text?: string | null
          id?: string
          language?: string | null
          metadata?: Json | null
          page_number?: number | null
        }
        Update: {
          confidence_score?: number | null
          document_id?: string
          extracted_at?: string | null
          extracted_text?: string | null
          id?: string
          language?: string | null
          metadata?: Json | null
          page_number?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "document_ocr_content_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_ocr_content_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents_with_links"
            referencedColumns: ["id"]
          },
        ]
      }
      document_tags: {
        Row: {
          confidence_score: number | null
          created_at: string | null
          created_by: string | null
          document_id: string
          id: string
          tag_name: string
          tag_type: string
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string | null
          created_by?: string | null
          document_id: string
          id?: string
          tag_name: string
          tag_type: string
        }
        Update: {
          confidence_score?: number | null
          created_at?: string | null
          created_by?: string | null
          document_id?: string
          id?: string
          tag_name?: string
          tag_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_tags_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_tags_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents_with_links"
            referencedColumns: ["id"]
          },
        ]
      }
      document_versions: {
        Row: {
          change_description: string | null
          created_at: string
          created_by: string | null
          document_id: string
          file_path: string
          file_size: number | null
          id: string
          is_current: boolean | null
          metadata: Json | null
          version_number: number
        }
        Insert: {
          change_description?: string | null
          created_at?: string
          created_by?: string | null
          document_id: string
          file_path: string
          file_size?: number | null
          id?: string
          is_current?: boolean | null
          metadata?: Json | null
          version_number?: number
        }
        Update: {
          change_description?: string | null
          created_at?: string
          created_by?: string | null
          document_id?: string
          file_path?: string
          file_size?: number | null
          id?: string
          is_current?: boolean | null
          metadata?: Json | null
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "document_versions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_versions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents_with_links"
            referencedColumns: ["id"]
          },
        ]
      }
      documentation_changelog: {
        Row: {
          change_type: string
          changed_by: string | null
          changed_by_name: string | null
          created_at: string | null
          doc_id: string | null
          id: string
          new_value: string | null
          notes: string | null
          old_value: string | null
        }
        Insert: {
          change_type: string
          changed_by?: string | null
          changed_by_name?: string | null
          created_at?: string | null
          doc_id?: string | null
          id?: string
          new_value?: string | null
          notes?: string | null
          old_value?: string | null
        }
        Update: {
          change_type?: string
          changed_by?: string | null
          changed_by_name?: string | null
          created_at?: string | null
          doc_id?: string | null
          id?: string
          new_value?: string | null
          notes?: string | null
          old_value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documentation_changelog_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documentation_changelog_doc_id_fkey"
            columns: ["doc_id"]
            isOneToOne: false
            referencedRelation: "project_documentation"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          beneficiary_id: string | null
          category: string
          contract_id: string | null
          created_at: string
          deleted_at: string | null
          deleted_by: string | null
          deletion_reason: string | null
          description: string | null
          file_path: string | null
          file_size: string
          file_size_bytes: number | null
          file_type: string
          folder_id: string | null
          id: string
          maintenance_request_id: string | null
          name: string
          payment_voucher_id: string | null
          property_id: string | null
          reference_id: string | null
          reference_type: string | null
          storage_path: string | null
          tenant_id: string | null
          uploaded_at: string
        }
        Insert: {
          beneficiary_id?: string | null
          category: string
          contract_id?: string | null
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          description?: string | null
          file_path?: string | null
          file_size: string
          file_size_bytes?: number | null
          file_type: string
          folder_id?: string | null
          id?: string
          maintenance_request_id?: string | null
          name: string
          payment_voucher_id?: string | null
          property_id?: string | null
          reference_id?: string | null
          reference_type?: string | null
          storage_path?: string | null
          tenant_id?: string | null
          uploaded_at?: string
        }
        Update: {
          beneficiary_id?: string | null
          category?: string
          contract_id?: string | null
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          description?: string | null
          file_path?: string | null
          file_size?: string
          file_size_bytes?: number | null
          file_type?: string
          folder_id?: string | null
          id?: string
          maintenance_request_id?: string | null
          name?: string
          payment_voucher_id?: string | null
          property_id?: string | null
          reference_id?: string | null
          reference_type?: string | null
          storage_path?: string | null
          tenant_id?: string | null
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries_masked"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiary_account_statement"
            referencedColumns: ["beneficiary_id"]
          },
          {
            foreignKeyName: "documents_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiary_statistics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_maintenance_request_id_fkey"
            columns: ["maintenance_request_id"]
            isOneToOne: false
            referencedRelation: "maintenance_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_payment_voucher_id_fkey"
            columns: ["payment_voucher_id"]
            isOneToOne: false
            referencedRelation: "payment_vouchers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_payment_voucher_id_fkey"
            columns: ["payment_voucher_id"]
            isOneToOne: false
            referencedRelation: "payment_vouchers_masked"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_payment_voucher_id_fkey"
            columns: ["payment_voucher_id"]
            isOneToOne: false
            referencedRelation: "payment_vouchers_with_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "property_performance"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      eligibility_assessments: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          assessed_by: string | null
          assessment_date: string | null
          beneficiary_id: string
          created_at: string | null
          criteria_scores: Json | null
          eligibility_status: string | null
          id: string
          notes: string | null
          recommendations: string | null
          total_score: number | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          assessed_by?: string | null
          assessment_date?: string | null
          beneficiary_id: string
          created_at?: string | null
          criteria_scores?: Json | null
          eligibility_status?: string | null
          id?: string
          notes?: string | null
          recommendations?: string | null
          total_score?: number | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          assessed_by?: string | null
          assessment_date?: string | null
          beneficiary_id?: string
          created_at?: string | null
          criteria_scores?: Json | null
          eligibility_status?: string | null
          id?: string
          notes?: string | null
          recommendations?: string | null
          total_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "eligibility_assessments_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eligibility_assessments_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries_masked"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eligibility_assessments_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eligibility_assessments_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiary_account_statement"
            referencedColumns: ["beneficiary_id"]
          },
          {
            foreignKeyName: "eligibility_assessments_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiary_statistics"
            referencedColumns: ["id"]
          },
        ]
      }
      eligibility_criteria: {
        Row: {
          created_at: string | null
          created_by: string | null
          criterion_name: string
          criterion_type: string
          criterion_value: Json
          description: string | null
          id: string
          is_active: boolean | null
          is_mandatory: boolean | null
          updated_at: string | null
          weight: number | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          criterion_name: string
          criterion_type: string
          criterion_value: Json
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_mandatory?: boolean | null
          updated_at?: string | null
          weight?: number | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          criterion_name?: string
          criterion_type?: string
          criterion_value?: Json
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_mandatory?: boolean | null
          updated_at?: string | null
          weight?: number | null
        }
        Relationships: []
      }
      emergency_aid: {
        Row: {
          aid_type: string
          amount: number
          approved_by: string | null
          approved_date: string | null
          beneficiary_id: string
          created_at: string | null
          deleted_at: string | null
          deleted_by: string | null
          deletion_reason: string | null
          disbursed_by: string | null
          disbursed_date: string | null
          id: string
          notes: string | null
          payment_voucher_id: string | null
          reason: string
          rejection_reason: string | null
          request_id: string | null
          requested_date: string
          status: string | null
          updated_at: string | null
          urgency_level: string | null
        }
        Insert: {
          aid_type?: string
          amount: number
          approved_by?: string | null
          approved_date?: string | null
          beneficiary_id: string
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          disbursed_by?: string | null
          disbursed_date?: string | null
          id?: string
          notes?: string | null
          payment_voucher_id?: string | null
          reason: string
          rejection_reason?: string | null
          request_id?: string | null
          requested_date?: string
          status?: string | null
          updated_at?: string | null
          urgency_level?: string | null
        }
        Update: {
          aid_type?: string
          amount?: number
          approved_by?: string | null
          approved_date?: string | null
          beneficiary_id?: string
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          disbursed_by?: string | null
          disbursed_date?: string | null
          id?: string
          notes?: string | null
          payment_voucher_id?: string | null
          reason?: string
          rejection_reason?: string | null
          request_id?: string | null
          requested_date?: string
          status?: string | null
          updated_at?: string | null
          urgency_level?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "emergency_aid_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emergency_aid_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries_masked"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emergency_aid_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emergency_aid_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiary_account_statement"
            referencedColumns: ["beneficiary_id"]
          },
          {
            foreignKeyName: "emergency_aid_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiary_statistics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emergency_aid_payment_voucher_id_fkey"
            columns: ["payment_voucher_id"]
            isOneToOne: false
            referencedRelation: "payment_vouchers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emergency_aid_payment_voucher_id_fkey"
            columns: ["payment_voucher_id"]
            isOneToOne: false
            referencedRelation: "payment_vouchers_masked"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emergency_aid_payment_voucher_id_fkey"
            columns: ["payment_voucher_id"]
            isOneToOne: false
            referencedRelation: "payment_vouchers_with_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emergency_aid_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "beneficiary_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      emergency_aid_requests: {
        Row: {
          amount_approved: number | null
          amount_requested: number
          annual_limit: number | null
          approved_at: string | null
          approved_by: string | null
          beneficiary_id: string | null
          created_at: string | null
          id: string
          notes: string | null
          payment_id: string | null
          reason: string
          rejected_at: string | null
          rejected_by: string | null
          rejection_reason: string | null
          request_number: string | null
          sla_due_at: string | null
          status: string | null
          updated_at: string | null
          urgency_level: string | null
          used_this_year: number | null
        }
        Insert: {
          amount_approved?: number | null
          amount_requested: number
          annual_limit?: number | null
          approved_at?: string | null
          approved_by?: string | null
          beneficiary_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          payment_id?: string | null
          reason: string
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          request_number?: string | null
          sla_due_at?: string | null
          status?: string | null
          updated_at?: string | null
          urgency_level?: string | null
          used_this_year?: number | null
        }
        Update: {
          amount_approved?: number | null
          amount_requested?: number
          annual_limit?: number | null
          approved_at?: string | null
          approved_by?: string | null
          beneficiary_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          payment_id?: string | null
          reason?: string
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          request_number?: string | null
          sla_due_at?: string | null
          status?: string | null
          updated_at?: string | null
          urgency_level?: string | null
          used_this_year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "emergency_aid_requests_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emergency_aid_requests_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries_masked"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emergency_aid_requests_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emergency_aid_requests_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiary_account_statement"
            referencedColumns: ["beneficiary_id"]
          },
          {
            foreignKeyName: "emergency_aid_requests_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiary_statistics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emergency_aid_requests_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emergency_aid_requests_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments_with_contract_details"
            referencedColumns: ["id"]
          },
        ]
      }
      families: {
        Row: {
          average_age: number | null
          contact_person_id: string | null
          created_at: string | null
          deleted_at: string | null
          deleted_by: string | null
          deletion_reason: string | null
          dependents_count: number | null
          emergency_contact: Json | null
          family_metadata: Json | null
          family_name: string
          family_type: string | null
          head_of_family_id: string | null
          housing_status: string | null
          id: string
          income_level: string | null
          notes: string | null
          special_needs: Json | null
          status: string | null
          total_members: number | null
          tribe: string | null
          updated_at: string | null
        }
        Insert: {
          average_age?: number | null
          contact_person_id?: string | null
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          dependents_count?: number | null
          emergency_contact?: Json | null
          family_metadata?: Json | null
          family_name: string
          family_type?: string | null
          head_of_family_id?: string | null
          housing_status?: string | null
          id?: string
          income_level?: string | null
          notes?: string | null
          special_needs?: Json | null
          status?: string | null
          total_members?: number | null
          tribe?: string | null
          updated_at?: string | null
        }
        Update: {
          average_age?: number | null
          contact_person_id?: string | null
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          dependents_count?: number | null
          emergency_contact?: Json | null
          family_metadata?: Json | null
          family_name?: string
          family_type?: string | null
          head_of_family_id?: string | null
          housing_status?: string | null
          id?: string
          income_level?: string | null
          notes?: string | null
          special_needs?: Json | null
          status?: string | null
          total_members?: number | null
          tribe?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "families_contact_person_id_fkey"
            columns: ["contact_person_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "families_contact_person_id_fkey"
            columns: ["contact_person_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries_masked"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "families_contact_person_id_fkey"
            columns: ["contact_person_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "families_contact_person_id_fkey"
            columns: ["contact_person_id"]
            isOneToOne: false
            referencedRelation: "beneficiary_account_statement"
            referencedColumns: ["beneficiary_id"]
          },
          {
            foreignKeyName: "families_contact_person_id_fkey"
            columns: ["contact_person_id"]
            isOneToOne: false
            referencedRelation: "beneficiary_statistics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "families_head_of_family_id_fkey"
            columns: ["head_of_family_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "families_head_of_family_id_fkey"
            columns: ["head_of_family_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries_masked"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "families_head_of_family_id_fkey"
            columns: ["head_of_family_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "families_head_of_family_id_fkey"
            columns: ["head_of_family_id"]
            isOneToOne: false
            referencedRelation: "beneficiary_account_statement"
            referencedColumns: ["beneficiary_id"]
          },
          {
            foreignKeyName: "families_head_of_family_id_fkey"
            columns: ["head_of_family_id"]
            isOneToOne: false
            referencedRelation: "beneficiary_statistics"
            referencedColumns: ["id"]
          },
        ]
      }
      family_members: {
        Row: {
          beneficiary_id: string
          created_at: string | null
          deleted_at: string | null
          deleted_by: string | null
          deletion_reason: string | null
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
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
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
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
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
            foreignKeyName: "family_members_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries_masked"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_members_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_members_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiary_account_statement"
            referencedColumns: ["beneficiary_id"]
          },
          {
            foreignKeyName: "family_members_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiary_statistics"
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
      family_relationships: {
        Row: {
          beneficiary_id: string
          created_at: string | null
          end_date: string | null
          family_id: string
          id: string
          is_dependent: boolean | null
          is_guardian: boolean | null
          notes: string | null
          related_to_id: string | null
          relationship_strength: string | null
          relationship_type: string
          start_date: string | null
        }
        Insert: {
          beneficiary_id: string
          created_at?: string | null
          end_date?: string | null
          family_id: string
          id?: string
          is_dependent?: boolean | null
          is_guardian?: boolean | null
          notes?: string | null
          related_to_id?: string | null
          relationship_strength?: string | null
          relationship_type: string
          start_date?: string | null
        }
        Update: {
          beneficiary_id?: string
          created_at?: string | null
          end_date?: string | null
          family_id?: string
          id?: string
          is_dependent?: boolean | null
          is_guardian?: boolean | null
          notes?: string | null
          related_to_id?: string | null
          relationship_strength?: string | null
          relationship_type?: string
          start_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "family_relationships_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_relationships_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries_masked"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_relationships_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_relationships_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiary_account_statement"
            referencedColumns: ["beneficiary_id"]
          },
          {
            foreignKeyName: "family_relationships_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiary_statistics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_relationships_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_relationships_related_to_id_fkey"
            columns: ["related_to_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_relationships_related_to_id_fkey"
            columns: ["related_to_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries_masked"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_relationships_related_to_id_fkey"
            columns: ["related_to_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_relationships_related_to_id_fkey"
            columns: ["related_to_id"]
            isOneToOne: false
            referencedRelation: "beneficiary_account_statement"
            referencedColumns: ["beneficiary_id"]
          },
          {
            foreignKeyName: "family_relationships_related_to_id_fkey"
            columns: ["related_to_id"]
            isOneToOne: false
            referencedRelation: "beneficiary_statistics"
            referencedColumns: ["id"]
          },
        ]
      }
      file_deletion_requests: {
        Row: {
          completed_at: string | null
          file_category: string
          file_id: string
          id: string
          metadata: Json | null
          priority: string | null
          reason: string
          requested_at: string | null
          requested_by: string | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
        }
        Insert: {
          completed_at?: string | null
          file_category: string
          file_id: string
          id?: string
          metadata?: Json | null
          priority?: string | null
          reason: string
          requested_at?: string | null
          requested_by?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
        }
        Update: {
          completed_at?: string | null
          file_category?: string
          file_id?: string
          id?: string
          metadata?: Json | null
          priority?: string | null
          reason?: string
          requested_at?: string | null
          requested_by?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
        }
        Relationships: []
      }
      file_retention_policies: {
        Row: {
          approval_role: string | null
          auto_delete: boolean | null
          created_at: string | null
          created_by: string | null
          file_category: string
          id: string
          is_active: boolean | null
          metadata: Json | null
          policy_name: string
          requires_approval: boolean | null
          retention_days: number
          updated_at: string | null
        }
        Insert: {
          approval_role?: string | null
          auto_delete?: boolean | null
          created_at?: string | null
          created_by?: string | null
          file_category: string
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          policy_name: string
          requires_approval?: boolean | null
          retention_days: number
          updated_at?: string | null
        }
        Update: {
          approval_role?: string | null
          auto_delete?: boolean | null
          created_at?: string | null
          created_by?: string | null
          file_category?: string
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          policy_name?: string
          requires_approval?: boolean | null
          retention_days?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      financial_forecasts: {
        Row: {
          account_id: string | null
          actual_amount: number | null
          confidence_level: number | null
          created_at: string | null
          forecast_type: string
          forecasted_amount: number
          id: string
          metadata: Json | null
          model_used: string | null
          period_end: string
          period_start: string
          variance: number | null
        }
        Insert: {
          account_id?: string | null
          actual_amount?: number | null
          confidence_level?: number | null
          created_at?: string | null
          forecast_type: string
          forecasted_amount: number
          id?: string
          metadata?: Json | null
          model_used?: string | null
          period_end: string
          period_start: string
          variance?: number | null
        }
        Update: {
          account_id?: string | null
          actual_amount?: number | null
          confidence_level?: number | null
          created_at?: string | null
          forecast_type?: string
          forecasted_amount?: number
          id?: string
          metadata?: Json | null
          model_used?: string | null
          period_end?: string
          period_start?: string
          variance?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "financial_forecasts_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_forecasts_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts_hierarchy"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_forecasts_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "general_ledger"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "financial_forecasts_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "trial_balance"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "financial_forecasts_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "waqf_balance_summary"
            referencedColumns: ["account_id"]
          },
        ]
      }
      financial_kpis: {
        Row: {
          created_at: string | null
          fiscal_year_id: string | null
          id: string
          kpi_category: string
          kpi_name: string
          kpi_target: number | null
          kpi_value: number
          metadata: Json | null
          period_end: string
          period_start: string
        }
        Insert: {
          created_at?: string | null
          fiscal_year_id?: string | null
          id?: string
          kpi_category: string
          kpi_name: string
          kpi_target?: number | null
          kpi_value: number
          metadata?: Json | null
          period_end: string
          period_start: string
        }
        Update: {
          created_at?: string | null
          fiscal_year_id?: string | null
          id?: string
          kpi_category?: string
          kpi_name?: string
          kpi_target?: number | null
          kpi_value?: number
          metadata?: Json | null
          period_end?: string
          period_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_kpis_fiscal_year_id_fkey"
            columns: ["fiscal_year_id"]
            isOneToOne: false
            referencedRelation: "financial_summary"
            referencedColumns: ["fiscal_year_id"]
          },
          {
            foreignKeyName: "financial_kpis_fiscal_year_id_fkey"
            columns: ["fiscal_year_id"]
            isOneToOne: false
            referencedRelation: "fiscal_years"
            referencedColumns: ["id"]
          },
        ]
      }
      fiscal_year_closings: {
        Row: {
          administrative_expenses: number | null
          closed_by: string | null
          closed_by_name: string | null
          closing_balance: number
          closing_date: string
          closing_journal_entry_id: string | null
          closing_type: string
          created_at: string
          development_expenses: number | null
          expense_breakdown: Json | null
          fiscal_year_id: string
          heir_distributions: Json | null
          heirs_count: number | null
          id: string
          maintenance_expenses: number | null
          nazer_percentage: number | null
          nazer_share: number | null
          net_income: number
          net_vat: number | null
          notes: string | null
          opening_balance: number | null
          other_expenses: number | null
          other_revenues: number | null
          rental_revenues: number | null
          revenue_breakdown: Json | null
          total_beneficiary_distributions: number | null
          total_expenses: number
          total_revenues: number
          total_vat_collected: number | null
          total_vat_paid: number | null
          updated_at: string
          waqf_corpus: number
          waqif_percentage: number | null
          waqif_share: number | null
          zakat_amount: number | null
        }
        Insert: {
          administrative_expenses?: number | null
          closed_by?: string | null
          closed_by_name?: string | null
          closing_balance?: number
          closing_date?: string
          closing_journal_entry_id?: string | null
          closing_type: string
          created_at?: string
          development_expenses?: number | null
          expense_breakdown?: Json | null
          fiscal_year_id: string
          heir_distributions?: Json | null
          heirs_count?: number | null
          id?: string
          maintenance_expenses?: number | null
          nazer_percentage?: number | null
          nazer_share?: number | null
          net_income?: number
          net_vat?: number | null
          notes?: string | null
          opening_balance?: number | null
          other_expenses?: number | null
          other_revenues?: number | null
          rental_revenues?: number | null
          revenue_breakdown?: Json | null
          total_beneficiary_distributions?: number | null
          total_expenses?: number
          total_revenues?: number
          total_vat_collected?: number | null
          total_vat_paid?: number | null
          updated_at?: string
          waqf_corpus?: number
          waqif_percentage?: number | null
          waqif_share?: number | null
          zakat_amount?: number | null
        }
        Update: {
          administrative_expenses?: number | null
          closed_by?: string | null
          closed_by_name?: string | null
          closing_balance?: number
          closing_date?: string
          closing_journal_entry_id?: string | null
          closing_type?: string
          created_at?: string
          development_expenses?: number | null
          expense_breakdown?: Json | null
          fiscal_year_id?: string
          heir_distributions?: Json | null
          heirs_count?: number | null
          id?: string
          maintenance_expenses?: number | null
          nazer_percentage?: number | null
          nazer_share?: number | null
          net_income?: number
          net_vat?: number | null
          notes?: string | null
          opening_balance?: number | null
          other_expenses?: number | null
          other_revenues?: number | null
          rental_revenues?: number | null
          revenue_breakdown?: Json | null
          total_beneficiary_distributions?: number | null
          total_expenses?: number
          total_revenues?: number
          total_vat_collected?: number | null
          total_vat_paid?: number | null
          updated_at?: string
          waqf_corpus?: number
          waqif_percentage?: number | null
          waqif_share?: number | null
          zakat_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fiscal_year_closings_closing_journal_entry_id_fkey"
            columns: ["closing_journal_entry_id"]
            isOneToOne: false
            referencedRelation: "general_ledger"
            referencedColumns: ["entry_id"]
          },
          {
            foreignKeyName: "fiscal_year_closings_closing_journal_entry_id_fkey"
            columns: ["closing_journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fiscal_year_closings_closing_journal_entry_id_fkey"
            columns: ["closing_journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries_with_lines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fiscal_year_closings_fiscal_year_id_fkey"
            columns: ["fiscal_year_id"]
            isOneToOne: true
            referencedRelation: "financial_summary"
            referencedColumns: ["fiscal_year_id"]
          },
          {
            foreignKeyName: "fiscal_year_closings_fiscal_year_id_fkey"
            columns: ["fiscal_year_id"]
            isOneToOne: true
            referencedRelation: "fiscal_years"
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
          is_published: boolean | null
          name: string
          published_at: string | null
          published_by: string | null
          start_date: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          is_active?: boolean
          is_closed?: boolean
          is_published?: boolean | null
          name: string
          published_at?: string | null
          published_by?: string | null
          start_date: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          is_active?: boolean
          is_closed?: boolean
          is_published?: boolean | null
          name?: string
          published_at?: string | null
          published_by?: string | null
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
      fund_transactions: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          fund_id: string | null
          id: string
          performed_by: string | null
          performed_by_name: string | null
          reference_id: string | null
          reference_type: string | null
          transaction_type: string
          waqf_unit_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          fund_id?: string | null
          id?: string
          performed_by?: string | null
          performed_by_name?: string | null
          reference_id?: string | null
          reference_type?: string | null
          transaction_type: string
          waqf_unit_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          fund_id?: string | null
          id?: string
          performed_by?: string | null
          performed_by_name?: string | null
          reference_id?: string | null
          reference_type?: string | null
          transaction_type?: string
          waqf_unit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fund_transactions_fund_id_fkey"
            columns: ["fund_id"]
            isOneToOne: false
            referencedRelation: "funds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fund_transactions_waqf_unit_id_fkey"
            columns: ["waqf_unit_id"]
            isOneToOne: false
            referencedRelation: "waqf_units"
            referencedColumns: ["id"]
          },
        ]
      }
      funds: {
        Row: {
          allocated_amount: number
          beneficiaries_count: number
          category: string
          created_at: string
          deleted_at: string | null
          deleted_by: string | null
          deletion_reason: string | null
          description: string | null
          id: string
          is_active: boolean
          name: string
          percentage: number
          spent_amount: number
          updated_at: string
          waqf_unit_id: string | null
        }
        Insert: {
          allocated_amount?: number
          beneficiaries_count?: number
          category: string
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          percentage?: number
          spent_amount?: number
          updated_at?: string
          waqf_unit_id?: string | null
        }
        Update: {
          allocated_amount?: number
          beneficiaries_count?: number
          category?: string
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          percentage?: number
          spent_amount?: number
          updated_at?: string
          waqf_unit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "funds_waqf_unit_id_fkey"
            columns: ["waqf_unit_id"]
            isOneToOne: false
            referencedRelation: "waqf_units"
            referencedColumns: ["id"]
          },
        ]
      }
      governance_board_members: {
        Row: {
          attendance_mandatory: boolean | null
          board_id: string | null
          created_at: string | null
          deleted_at: string | null
          deleted_by: string | null
          deletion_reason: string | null
          email: string | null
          end_date: string | null
          expertise_areas: string[] | null
          id: string
          is_active: boolean | null
          join_date: string
          member_name: string
          member_title: string | null
          membership_type: string
          notes: string | null
          phone: string | null
          position: string
          qualifications: string | null
          updated_at: string | null
          user_id: string | null
          voting_rights: boolean | null
        }
        Insert: {
          attendance_mandatory?: boolean | null
          board_id?: string | null
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          email?: string | null
          end_date?: string | null
          expertise_areas?: string[] | null
          id?: string
          is_active?: boolean | null
          join_date: string
          member_name: string
          member_title?: string | null
          membership_type: string
          notes?: string | null
          phone?: string | null
          position: string
          qualifications?: string | null
          updated_at?: string | null
          user_id?: string | null
          voting_rights?: boolean | null
        }
        Update: {
          attendance_mandatory?: boolean | null
          board_id?: string | null
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          email?: string | null
          end_date?: string | null
          expertise_areas?: string[] | null
          id?: string
          is_active?: boolean | null
          join_date?: string
          member_name?: string
          member_title?: string | null
          membership_type?: string
          notes?: string | null
          phone?: string | null
          position?: string
          qualifications?: string | null
          updated_at?: string | null
          user_id?: string | null
          voting_rights?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "governance_board_members_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "governance_boards"
            referencedColumns: ["id"]
          },
        ]
      }
      governance_boards: {
        Row: {
          board_code: string
          board_name_ar: string
          board_type: string
          chairman_name: string
          created_at: string | null
          decision_authority: string | null
          deleted_at: string | null
          deleted_by: string | null
          deletion_reason: string | null
          description: string | null
          dissolution_date: string | null
          established_date: string | null
          id: string
          meeting_frequency: string | null
          quorum_requirement: number | null
          responsibilities: string[] | null
          secretary_name: string | null
          status: string | null
          updated_at: string | null
          vice_chairman_name: string | null
          voting_rules: Json | null
        }
        Insert: {
          board_code: string
          board_name_ar: string
          board_type: string
          chairman_name: string
          created_at?: string | null
          decision_authority?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          description?: string | null
          dissolution_date?: string | null
          established_date?: string | null
          id?: string
          meeting_frequency?: string | null
          quorum_requirement?: number | null
          responsibilities?: string[] | null
          secretary_name?: string | null
          status?: string | null
          updated_at?: string | null
          vice_chairman_name?: string | null
          voting_rules?: Json | null
        }
        Update: {
          board_code?: string
          board_name_ar?: string
          board_type?: string
          chairman_name?: string
          created_at?: string | null
          decision_authority?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          description?: string | null
          dissolution_date?: string | null
          established_date?: string | null
          id?: string
          meeting_frequency?: string | null
          quorum_requirement?: number | null
          responsibilities?: string[] | null
          secretary_name?: string | null
          status?: string | null
          updated_at?: string | null
          vice_chairman_name?: string | null
          voting_rules?: Json | null
        }
        Relationships: []
      }
      governance_decisions: {
        Row: {
          attachments: string[] | null
          board_id: string | null
          created_at: string | null
          custom_voters: Json | null
          decision_date: string
          decision_number: string
          decision_status: string | null
          decision_text: string
          decision_title: string
          decision_type: string
          id: string
          implementation_deadline: string | null
          implementation_notes: string | null
          implementation_plan: string | null
          implementation_progress: number | null
          implemented_at: string | null
          meeting_id: string | null
          notes: string | null
          pass_threshold: number | null
          requires_voting: boolean | null
          responsible_person_name: string | null
          total_votes: number | null
          updated_at: string | null
          votes_abstain: number | null
          votes_against: number | null
          votes_for: number | null
          voting_completed: boolean | null
          voting_method: string | null
          voting_participants_type: string
          voting_quorum: number | null
        }
        Insert: {
          attachments?: string[] | null
          board_id?: string | null
          created_at?: string | null
          custom_voters?: Json | null
          decision_date: string
          decision_number: string
          decision_status?: string | null
          decision_text: string
          decision_title: string
          decision_type: string
          id?: string
          implementation_deadline?: string | null
          implementation_notes?: string | null
          implementation_plan?: string | null
          implementation_progress?: number | null
          implemented_at?: string | null
          meeting_id?: string | null
          notes?: string | null
          pass_threshold?: number | null
          requires_voting?: boolean | null
          responsible_person_name?: string | null
          total_votes?: number | null
          updated_at?: string | null
          votes_abstain?: number | null
          votes_against?: number | null
          votes_for?: number | null
          voting_completed?: boolean | null
          voting_method?: string | null
          voting_participants_type?: string
          voting_quorum?: number | null
        }
        Update: {
          attachments?: string[] | null
          board_id?: string | null
          created_at?: string | null
          custom_voters?: Json | null
          decision_date?: string
          decision_number?: string
          decision_status?: string | null
          decision_text?: string
          decision_title?: string
          decision_type?: string
          id?: string
          implementation_deadline?: string | null
          implementation_notes?: string | null
          implementation_plan?: string | null
          implementation_progress?: number | null
          implemented_at?: string | null
          meeting_id?: string | null
          notes?: string | null
          pass_threshold?: number | null
          requires_voting?: boolean | null
          responsible_person_name?: string | null
          total_votes?: number | null
          updated_at?: string | null
          votes_abstain?: number | null
          votes_against?: number | null
          votes_for?: number | null
          voting_completed?: boolean | null
          voting_method?: string | null
          voting_participants_type?: string
          voting_quorum?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "governance_decisions_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "governance_boards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "governance_decisions_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "governance_meetings"
            referencedColumns: ["id"]
          },
        ]
      }
      governance_disclosures: {
        Row: {
          attachments: string[] | null
          content: string
          created_at: string | null
          disclosure_category: string | null
          disclosure_date: string
          disclosure_summary: string | null
          disclosure_title: string
          disclosure_type: string
          document_url: string | null
          downloads_count: number | null
          id: string
          is_mandatory: boolean | null
          is_public: boolean | null
          publication_channels: string[] | null
          published_at: string | null
          related_decision_id: string | null
          related_policy_id: string | null
          reporting_period_end: string | null
          reporting_period_start: string | null
          status: string | null
          target_audience: string
          updated_at: string | null
          views_count: number | null
        }
        Insert: {
          attachments?: string[] | null
          content: string
          created_at?: string | null
          disclosure_category?: string | null
          disclosure_date: string
          disclosure_summary?: string | null
          disclosure_title: string
          disclosure_type: string
          document_url?: string | null
          downloads_count?: number | null
          id?: string
          is_mandatory?: boolean | null
          is_public?: boolean | null
          publication_channels?: string[] | null
          published_at?: string | null
          related_decision_id?: string | null
          related_policy_id?: string | null
          reporting_period_end?: string | null
          reporting_period_start?: string | null
          status?: string | null
          target_audience: string
          updated_at?: string | null
          views_count?: number | null
        }
        Update: {
          attachments?: string[] | null
          content?: string
          created_at?: string | null
          disclosure_category?: string | null
          disclosure_date?: string
          disclosure_summary?: string | null
          disclosure_title?: string
          disclosure_type?: string
          document_url?: string | null
          downloads_count?: number | null
          id?: string
          is_mandatory?: boolean | null
          is_public?: boolean | null
          publication_channels?: string[] | null
          published_at?: string | null
          related_decision_id?: string | null
          related_policy_id?: string | null
          reporting_period_end?: string | null
          reporting_period_start?: string | null
          status?: string | null
          target_audience?: string
          updated_at?: string | null
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "governance_disclosures_related_decision_id_fkey"
            columns: ["related_decision_id"]
            isOneToOne: false
            referencedRelation: "governance_decisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "governance_disclosures_related_policy_id_fkey"
            columns: ["related_policy_id"]
            isOneToOne: false
            referencedRelation: "governance_policies"
            referencedColumns: ["id"]
          },
        ]
      }
      governance_meeting_attendance: {
        Row: {
          arrival_time: string | null
          attendance_status: string
          contribution_notes: string | null
          created_at: string | null
          departure_time: string | null
          excuse_accepted: boolean | null
          excuse_reason: string | null
          id: string
          meeting_id: string | null
          member_id: string | null
          member_name: string
          notes: string | null
          participated: boolean | null
        }
        Insert: {
          arrival_time?: string | null
          attendance_status: string
          contribution_notes?: string | null
          created_at?: string | null
          departure_time?: string | null
          excuse_accepted?: boolean | null
          excuse_reason?: string | null
          id?: string
          meeting_id?: string | null
          member_id?: string | null
          member_name: string
          notes?: string | null
          participated?: boolean | null
        }
        Update: {
          arrival_time?: string | null
          attendance_status?: string
          contribution_notes?: string | null
          created_at?: string | null
          departure_time?: string | null
          excuse_accepted?: boolean | null
          excuse_reason?: string | null
          id?: string
          meeting_id?: string | null
          member_id?: string | null
          member_name?: string
          notes?: string | null
          participated?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "governance_meeting_attendance_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "governance_meetings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "governance_meeting_attendance_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "governance_board_members"
            referencedColumns: ["id"]
          },
        ]
      }
      governance_meetings: {
        Row: {
          actual_end_time: string | null
          actual_start_time: string | null
          agenda: Json
          agenda_items_count: number | null
          attendance_percentage: number | null
          attendees_count: number | null
          board_id: string | null
          cancellation_reason: string | null
          created_at: string | null
          decisions_count: number | null
          duration_minutes: number | null
          id: string
          is_virtual: boolean | null
          location: string | null
          meeting_number: string
          meeting_title: string
          meeting_type: string
          minutes: string | null
          minutes_approved: boolean | null
          minutes_approved_at: string | null
          minutes_document_url: string | null
          quorum_met: boolean | null
          scheduled_date: string
          status: string | null
          updated_at: string | null
          virtual_link: string | null
        }
        Insert: {
          actual_end_time?: string | null
          actual_start_time?: string | null
          agenda: Json
          agenda_items_count?: number | null
          attendance_percentage?: number | null
          attendees_count?: number | null
          board_id?: string | null
          cancellation_reason?: string | null
          created_at?: string | null
          decisions_count?: number | null
          duration_minutes?: number | null
          id?: string
          is_virtual?: boolean | null
          location?: string | null
          meeting_number: string
          meeting_title: string
          meeting_type: string
          minutes?: string | null
          minutes_approved?: boolean | null
          minutes_approved_at?: string | null
          minutes_document_url?: string | null
          quorum_met?: boolean | null
          scheduled_date: string
          status?: string | null
          updated_at?: string | null
          virtual_link?: string | null
        }
        Update: {
          actual_end_time?: string | null
          actual_start_time?: string | null
          agenda?: Json
          agenda_items_count?: number | null
          attendance_percentage?: number | null
          attendees_count?: number | null
          board_id?: string | null
          cancellation_reason?: string | null
          created_at?: string | null
          decisions_count?: number | null
          duration_minutes?: number | null
          id?: string
          is_virtual?: boolean | null
          location?: string | null
          meeting_number?: string
          meeting_title?: string
          meeting_type?: string
          minutes?: string | null
          minutes_approved?: boolean | null
          minutes_approved_at?: string | null
          minutes_document_url?: string | null
          quorum_met?: boolean | null
          scheduled_date?: string
          status?: string | null
          updated_at?: string | null
          virtual_link?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "governance_meetings_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "governance_boards"
            referencedColumns: ["id"]
          },
        ]
      }
      governance_policies: {
        Row: {
          approval_notes: string | null
          approved_at: string | null
          approved_by: string | null
          beneficiary_eligibility: Json | null
          category: string
          created_at: string | null
          deleted_at: string | null
          deleted_by: string | null
          deletion_reason: string | null
          description: string | null
          distribution_rules: Json | null
          effective_date: string
          expiry_date: string | null
          id: string
          objectives: string | null
          parent_policy_id: string | null
          policy_code: string
          policy_document_url: string | null
          policy_name_ar: string
          policy_name_en: string | null
          policy_type: string
          review_date: string | null
          scope: string | null
          status: string | null
          updated_at: string | null
          version: number | null
          waqf_conditions: Json | null
        }
        Insert: {
          approval_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          beneficiary_eligibility?: Json | null
          category: string
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          description?: string | null
          distribution_rules?: Json | null
          effective_date: string
          expiry_date?: string | null
          id?: string
          objectives?: string | null
          parent_policy_id?: string | null
          policy_code: string
          policy_document_url?: string | null
          policy_name_ar: string
          policy_name_en?: string | null
          policy_type: string
          review_date?: string | null
          scope?: string | null
          status?: string | null
          updated_at?: string | null
          version?: number | null
          waqf_conditions?: Json | null
        }
        Update: {
          approval_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          beneficiary_eligibility?: Json | null
          category?: string
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          description?: string | null
          distribution_rules?: Json | null
          effective_date?: string
          expiry_date?: string | null
          id?: string
          objectives?: string | null
          parent_policy_id?: string | null
          policy_code?: string
          policy_document_url?: string | null
          policy_name_ar?: string
          policy_name_en?: string | null
          policy_type?: string
          review_date?: string | null
          scope?: string | null
          status?: string | null
          updated_at?: string | null
          version?: number | null
          waqf_conditions?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "governance_policies_parent_policy_id_fkey"
            columns: ["parent_policy_id"]
            isOneToOne: false
            referencedRelation: "governance_policies"
            referencedColumns: ["id"]
          },
        ]
      }
      governance_risks: {
        Row: {
          control_effectiveness: string | null
          created_at: string | null
          current_controls: string | null
          id: string
          impact: string
          impact_score: number | null
          last_review_date: string | null
          likelihood: string
          likelihood_score: number | null
          mitigation_actions: Json | null
          mitigation_plan: string | null
          next_review_date: string
          potential_impact: string | null
          residual_risk_score: number | null
          review_frequency: string
          risk_category: string
          risk_code: string
          risk_description: string
          risk_level: string | null
          risk_owner_name: string
          risk_score: number | null
          risk_subcategory: string | null
          risk_title: string
          status: string | null
          trigger_events: string[] | null
          updated_at: string | null
        }
        Insert: {
          control_effectiveness?: string | null
          created_at?: string | null
          current_controls?: string | null
          id?: string
          impact: string
          impact_score?: number | null
          last_review_date?: string | null
          likelihood: string
          likelihood_score?: number | null
          mitigation_actions?: Json | null
          mitigation_plan?: string | null
          next_review_date: string
          potential_impact?: string | null
          residual_risk_score?: number | null
          review_frequency: string
          risk_category: string
          risk_code: string
          risk_description: string
          risk_level?: string | null
          risk_owner_name: string
          risk_score?: number | null
          risk_subcategory?: string | null
          risk_title: string
          status?: string | null
          trigger_events?: string[] | null
          updated_at?: string | null
        }
        Update: {
          control_effectiveness?: string | null
          created_at?: string | null
          current_controls?: string | null
          id?: string
          impact?: string
          impact_score?: number | null
          last_review_date?: string | null
          likelihood?: string
          likelihood_score?: number | null
          mitigation_actions?: Json | null
          mitigation_plan?: string | null
          next_review_date?: string
          potential_impact?: string | null
          residual_risk_score?: number | null
          review_frequency?: string
          risk_category?: string
          risk_code?: string
          risk_description?: string
          risk_level?: string | null
          risk_owner_name?: string
          risk_score?: number | null
          risk_subcategory?: string | null
          risk_title?: string
          status?: string | null
          trigger_events?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      governance_votes: {
        Row: {
          beneficiary_id: string | null
          created_at: string | null
          decision_id: string | null
          id: string
          ip_address: string | null
          is_secret: boolean | null
          user_agent: string | null
          vote: string
          vote_reason: string | null
          voted_at: string | null
          voter_id: string | null
          voter_name: string
          voter_type: string
        }
        Insert: {
          beneficiary_id?: string | null
          created_at?: string | null
          decision_id?: string | null
          id?: string
          ip_address?: string | null
          is_secret?: boolean | null
          user_agent?: string | null
          vote: string
          vote_reason?: string | null
          voted_at?: string | null
          voter_id?: string | null
          voter_name: string
          voter_type: string
        }
        Update: {
          beneficiary_id?: string | null
          created_at?: string | null
          decision_id?: string | null
          id?: string
          ip_address?: string | null
          is_secret?: boolean | null
          user_agent?: string | null
          vote?: string
          vote_reason?: string | null
          voted_at?: string | null
          voter_id?: string | null
          voter_name?: string
          voter_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "governance_votes_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "governance_votes_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries_masked"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "governance_votes_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "governance_votes_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiary_account_statement"
            referencedColumns: ["beneficiary_id"]
          },
          {
            foreignKeyName: "governance_votes_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiary_statistics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "governance_votes_decision_id_fkey"
            columns: ["decision_id"]
            isOneToOne: false
            referencedRelation: "governance_decisions"
            referencedColumns: ["id"]
          },
        ]
      }
      government_integrations: {
        Row: {
          api_endpoint: string | null
          configuration: Json | null
          created_at: string | null
          id: string
          is_active: boolean | null
          last_sync_at: string | null
          requires_authentication: boolean | null
          service_name: string
          service_type: string
          sync_frequency: string | null
          updated_at: string | null
        }
        Insert: {
          api_endpoint?: string | null
          configuration?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          requires_authentication?: boolean | null
          service_name: string
          service_type: string
          sync_frequency?: string | null
          updated_at?: string | null
        }
        Update: {
          api_endpoint?: string | null
          configuration?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          requires_authentication?: boolean | null
          service_name?: string
          service_type?: string
          sync_frequency?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      heir_distributions: {
        Row: {
          beneficiary_id: string | null
          created_at: string | null
          distribution_date: string
          executed_by_user_id: string | null
          fiscal_year_id: string | null
          heir_type: string
          id: string
          is_historical: boolean | null
          journal_entry_id: string | null
          notes: string | null
          share_amount: number
          status: string | null
          updated_at: string | null
          waqf_unit_id: string | null
        }
        Insert: {
          beneficiary_id?: string | null
          created_at?: string | null
          distribution_date: string
          executed_by_user_id?: string | null
          fiscal_year_id?: string | null
          heir_type: string
          id?: string
          is_historical?: boolean | null
          journal_entry_id?: string | null
          notes?: string | null
          share_amount?: number
          status?: string | null
          updated_at?: string | null
          waqf_unit_id?: string | null
        }
        Update: {
          beneficiary_id?: string | null
          created_at?: string | null
          distribution_date?: string
          executed_by_user_id?: string | null
          fiscal_year_id?: string | null
          heir_type?: string
          id?: string
          is_historical?: boolean | null
          journal_entry_id?: string | null
          notes?: string | null
          share_amount?: number
          status?: string | null
          updated_at?: string | null
          waqf_unit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "heir_distributions_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "heir_distributions_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries_masked"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "heir_distributions_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "heir_distributions_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiary_account_statement"
            referencedColumns: ["beneficiary_id"]
          },
          {
            foreignKeyName: "heir_distributions_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiary_statistics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "heir_distributions_fiscal_year_id_fkey"
            columns: ["fiscal_year_id"]
            isOneToOne: false
            referencedRelation: "financial_summary"
            referencedColumns: ["fiscal_year_id"]
          },
          {
            foreignKeyName: "heir_distributions_fiscal_year_id_fkey"
            columns: ["fiscal_year_id"]
            isOneToOne: false
            referencedRelation: "fiscal_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "heir_distributions_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "general_ledger"
            referencedColumns: ["entry_id"]
          },
          {
            foreignKeyName: "heir_distributions_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "heir_distributions_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries_with_lines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "heir_distributions_waqf_unit_id_fkey"
            columns: ["waqf_unit_id"]
            isOneToOne: false
            referencedRelation: "waqf_units"
            referencedColumns: ["id"]
          },
        ]
      }
      historical_invoices: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          document_path: string | null
          fiscal_year_id: string | null
          id: string
          invoice_date: string
          invoice_number: string
          is_historical: boolean | null
          journal_entry_id: string | null
          subtotal: number
          total_amount: number
          updated_at: string | null
          vat_amount: number | null
          vendor_name: string
          vendor_tax_id: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          document_path?: string | null
          fiscal_year_id?: string | null
          id?: string
          invoice_date: string
          invoice_number: string
          is_historical?: boolean | null
          journal_entry_id?: string | null
          subtotal?: number
          total_amount?: number
          updated_at?: string | null
          vat_amount?: number | null
          vendor_name: string
          vendor_tax_id?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          document_path?: string | null
          fiscal_year_id?: string | null
          id?: string
          invoice_date?: string
          invoice_number?: string
          is_historical?: boolean | null
          journal_entry_id?: string | null
          subtotal?: number
          total_amount?: number
          updated_at?: string | null
          vat_amount?: number | null
          vendor_name?: string
          vendor_tax_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "historical_invoices_fiscal_year_id_fkey"
            columns: ["fiscal_year_id"]
            isOneToOne: false
            referencedRelation: "financial_summary"
            referencedColumns: ["fiscal_year_id"]
          },
          {
            foreignKeyName: "historical_invoices_fiscal_year_id_fkey"
            columns: ["fiscal_year_id"]
            isOneToOne: false
            referencedRelation: "fiscal_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "historical_invoices_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "general_ledger"
            referencedColumns: ["entry_id"]
          },
          {
            foreignKeyName: "historical_invoices_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "historical_invoices_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries_with_lines"
            referencedColumns: ["id"]
          },
        ]
      }
      historical_rental_details: {
        Row: {
          annual_contract_value: number | null
          contract_end_date: string | null
          contract_number: string | null
          contract_start_date: string | null
          created_at: string | null
          deleted_at: string | null
          deleted_by: string | null
          deletion_reason: string | null
          fiscal_year_closing_id: string
          floor_number: number | null
          id: string
          month_date: string
          monthly_payment: number | null
          notes: string | null
          payment_status: string | null
          property_name: string | null
          tenant_name: string
          unit_number: string | null
          updated_at: string | null
        }
        Insert: {
          annual_contract_value?: number | null
          contract_end_date?: string | null
          contract_number?: string | null
          contract_start_date?: string | null
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          fiscal_year_closing_id: string
          floor_number?: number | null
          id?: string
          month_date: string
          monthly_payment?: number | null
          notes?: string | null
          payment_status?: string | null
          property_name?: string | null
          tenant_name: string
          unit_number?: string | null
          updated_at?: string | null
        }
        Update: {
          annual_contract_value?: number | null
          contract_end_date?: string | null
          contract_number?: string | null
          contract_start_date?: string | null
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          fiscal_year_closing_id?: string
          floor_number?: number | null
          id?: string
          month_date?: string
          monthly_payment?: number | null
          notes?: string | null
          payment_status?: string | null
          property_name?: string | null
          tenant_name?: string
          unit_number?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "historical_rental_details_fiscal_year_closing_id_fkey"
            columns: ["fiscal_year_closing_id"]
            isOneToOne: false
            referencedRelation: "fiscal_year_closings"
            referencedColumns: ["id"]
          },
        ]
      }
      identity_verifications: {
        Row: {
          beneficiary_id: string
          created_at: string | null
          documents: Json | null
          expiry_date: string | null
          id: string
          notes: string | null
          updated_at: string | null
          verification_data: Json | null
          verification_method: string
          verification_status: string | null
          verification_type: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          beneficiary_id: string
          created_at?: string | null
          documents?: Json | null
          expiry_date?: string | null
          id?: string
          notes?: string | null
          updated_at?: string | null
          verification_data?: Json | null
          verification_method: string
          verification_status?: string | null
          verification_type: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          beneficiary_id?: string
          created_at?: string | null
          documents?: Json | null
          expiry_date?: string | null
          id?: string
          notes?: string | null
          updated_at?: string | null
          verification_data?: Json | null
          verification_method?: string
          verification_status?: string | null
          verification_type?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "identity_verifications_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "identity_verifications_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries_masked"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "identity_verifications_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "identity_verifications_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiary_account_statement"
            referencedColumns: ["beneficiary_id"]
          },
          {
            foreignKeyName: "identity_verifications_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiary_statistics"
            referencedColumns: ["id"]
          },
        ]
      }
      integrations: {
        Row: {
          configuration: Json | null
          created_at: string
          created_by: string | null
          credentials: Json | null
          error_message: string | null
          id: string
          is_active: boolean | null
          last_sync_at: string | null
          metadata: Json | null
          name: string
          provider: string | null
          sync_status: string | null
          type: string
          updated_at: string
        }
        Insert: {
          configuration?: Json | null
          created_at?: string
          created_by?: string | null
          credentials?: Json | null
          error_message?: string | null
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          metadata?: Json | null
          name: string
          provider?: string | null
          sync_status?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          configuration?: Json | null
          created_at?: string
          created_by?: string | null
          credentials?: Json | null
          error_message?: string | null
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          metadata?: Json | null
          name?: string
          provider?: string | null
          sync_status?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      internal_messages: {
        Row: {
          body: string
          created_at: string | null
          deleted_at: string | null
          deleted_by: string | null
          deletion_reason: string | null
          id: string
          is_read: boolean | null
          parent_message_id: string | null
          priority: string | null
          read_at: string | null
          receiver_id: string
          request_id: string | null
          sender_id: string
          subject: string
          updated_at: string | null
        }
        Insert: {
          body: string
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          id?: string
          is_read?: boolean | null
          parent_message_id?: string | null
          priority?: string | null
          read_at?: string | null
          receiver_id: string
          request_id?: string | null
          sender_id: string
          subject: string
          updated_at?: string | null
        }
        Update: {
          body?: string
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          id?: string
          is_read?: boolean | null
          parent_message_id?: string | null
          priority?: string | null
          read_at?: string | null
          receiver_id?: string
          request_id?: string | null
          sender_id?: string
          subject?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "internal_messages_parent_message_id_fkey"
            columns: ["parent_message_id"]
            isOneToOne: false
            referencedRelation: "internal_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "internal_messages_parent_message_id_fkey"
            columns: ["parent_message_id"]
            isOneToOne: false
            referencedRelation: "messages_with_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "internal_messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "internal_messages_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "beneficiary_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "internal_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
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
          subtotal: number | null
          tax_amount: number | null
          tax_rate: number | null
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
          subtotal?: number | null
          tax_amount?: number | null
          tax_rate?: number | null
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
          subtotal?: number | null
          tax_amount?: number | null
          tax_rate?: number | null
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
            foreignKeyName: "invoice_lines_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts_hierarchy"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_lines_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "general_ledger"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "invoice_lines_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "trial_balance"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "invoice_lines_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "waqf_balance_summary"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "invoice_lines_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_lines_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices_summary"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          contract_id: string | null
          created_at: string
          customer_address: string | null
          customer_city: string | null
          customer_commercial_register: string | null
          customer_commercial_registration: string | null
          customer_email: string | null
          customer_name: string
          customer_national_address: string | null
          customer_phone: string | null
          customer_tax_number: string | null
          customer_vat_number: string | null
          deleted_at: string | null
          deleted_by: string | null
          deletion_reason: string | null
          due_date: string | null
          id: string
          invoice_date: string
          invoice_hash: string | null
          invoice_number: string
          invoice_time: string | null
          invoice_type: string | null
          is_zatca_compliant: boolean | null
          journal_entry_id: string | null
          notes: string | null
          ocr_confidence_score: number | null
          ocr_extracted: boolean | null
          ocr_processed_at: string | null
          qr_code_data: string | null
          rental_payment_id: string | null
          source_image_url: string | null
          status: string
          subtotal: number
          tax_amount: number
          tax_rate: number | null
          tenant_id: string | null
          total_amount: number
          updated_at: string
          vat_number: string | null
          waqf_unit_id: string | null
          zatca_hash: string | null
          zatca_qr_data: string | null
          zatca_status: string | null
          zatca_submitted_at: string | null
          zatca_uuid: string | null
        }
        Insert: {
          contract_id?: string | null
          created_at?: string
          customer_address?: string | null
          customer_city?: string | null
          customer_commercial_register?: string | null
          customer_commercial_registration?: string | null
          customer_email?: string | null
          customer_name: string
          customer_national_address?: string | null
          customer_phone?: string | null
          customer_tax_number?: string | null
          customer_vat_number?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          due_date?: string | null
          id?: string
          invoice_date: string
          invoice_hash?: string | null
          invoice_number: string
          invoice_time?: string | null
          invoice_type?: string | null
          is_zatca_compliant?: boolean | null
          journal_entry_id?: string | null
          notes?: string | null
          ocr_confidence_score?: number | null
          ocr_extracted?: boolean | null
          ocr_processed_at?: string | null
          qr_code_data?: string | null
          rental_payment_id?: string | null
          source_image_url?: string | null
          status?: string
          subtotal?: number
          tax_amount?: number
          tax_rate?: number | null
          tenant_id?: string | null
          total_amount?: number
          updated_at?: string
          vat_number?: string | null
          waqf_unit_id?: string | null
          zatca_hash?: string | null
          zatca_qr_data?: string | null
          zatca_status?: string | null
          zatca_submitted_at?: string | null
          zatca_uuid?: string | null
        }
        Update: {
          contract_id?: string | null
          created_at?: string
          customer_address?: string | null
          customer_city?: string | null
          customer_commercial_register?: string | null
          customer_commercial_registration?: string | null
          customer_email?: string | null
          customer_name?: string
          customer_national_address?: string | null
          customer_phone?: string | null
          customer_tax_number?: string | null
          customer_vat_number?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          due_date?: string | null
          id?: string
          invoice_date?: string
          invoice_hash?: string | null
          invoice_number?: string
          invoice_time?: string | null
          invoice_type?: string | null
          is_zatca_compliant?: boolean | null
          journal_entry_id?: string | null
          notes?: string | null
          ocr_confidence_score?: number | null
          ocr_extracted?: boolean | null
          ocr_processed_at?: string | null
          qr_code_data?: string | null
          rental_payment_id?: string | null
          source_image_url?: string | null
          status?: string
          subtotal?: number
          tax_amount?: number
          tax_rate?: number | null
          tenant_id?: string | null
          total_amount?: number
          updated_at?: string
          vat_number?: string | null
          waqf_unit_id?: string | null
          zatca_hash?: string | null
          zatca_qr_data?: string | null
          zatca_status?: string | null
          zatca_submitted_at?: string | null
          zatca_uuid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "general_ledger"
            referencedColumns: ["entry_id"]
          },
          {
            foreignKeyName: "invoices_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries_with_lines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_rental_payment_id_fkey"
            columns: ["rental_payment_id"]
            isOneToOne: false
            referencedRelation: "rental_payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_waqf_unit_id_fkey"
            columns: ["waqf_unit_id"]
            isOneToOne: false
            referencedRelation: "waqf_units"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_entries: {
        Row: {
          created_at: string
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          deletion_reason: string | null
          description: string
          distribution_id: string | null
          entry_date: string
          entry_number: string
          entry_type: Database["public"]["Enums"]["entry_type"] | null
          fiscal_year_id: string
          id: string
          is_historical: boolean | null
          posted: boolean | null
          posted_at: string | null
          reference_id: string | null
          reference_type: string | null
          rejection_reason: string | null
          status: Database["public"]["Enums"]["entry_status"]
          updated_at: string
          waqf_unit_id: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          description: string
          distribution_id?: string | null
          entry_date: string
          entry_number: string
          entry_type?: Database["public"]["Enums"]["entry_type"] | null
          fiscal_year_id: string
          id?: string
          is_historical?: boolean | null
          posted?: boolean | null
          posted_at?: string | null
          reference_id?: string | null
          reference_type?: string | null
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["entry_status"]
          updated_at?: string
          waqf_unit_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          description?: string
          distribution_id?: string | null
          entry_date?: string
          entry_number?: string
          entry_type?: Database["public"]["Enums"]["entry_type"] | null
          fiscal_year_id?: string
          id?: string
          is_historical?: boolean | null
          posted?: boolean | null
          posted_at?: string | null
          reference_id?: string | null
          reference_type?: string | null
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["entry_status"]
          updated_at?: string
          waqf_unit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "journal_entries_distribution_id_fkey"
            columns: ["distribution_id"]
            isOneToOne: false
            referencedRelation: "distribution_statistics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_entries_distribution_id_fkey"
            columns: ["distribution_id"]
            isOneToOne: false
            referencedRelation: "distributions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_entries_distribution_id_fkey"
            columns: ["distribution_id"]
            isOneToOne: false
            referencedRelation: "distributions_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_entries_distribution_id_fkey"
            columns: ["distribution_id"]
            isOneToOne: false
            referencedRelation: "payment_vouchers_with_details"
            referencedColumns: ["distribution_id_ref"]
          },
          {
            foreignKeyName: "journal_entries_fiscal_year_id_fkey"
            columns: ["fiscal_year_id"]
            isOneToOne: false
            referencedRelation: "financial_summary"
            referencedColumns: ["fiscal_year_id"]
          },
          {
            foreignKeyName: "journal_entries_fiscal_year_id_fkey"
            columns: ["fiscal_year_id"]
            isOneToOne: false
            referencedRelation: "fiscal_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_entries_waqf_unit_id_fkey"
            columns: ["waqf_unit_id"]
            isOneToOne: false
            referencedRelation: "waqf_units"
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
            foreignKeyName: "journal_entry_lines_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts_hierarchy"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_entry_lines_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "general_ledger"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "journal_entry_lines_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "trial_balance"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "journal_entry_lines_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "waqf_balance_summary"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "journal_entry_lines_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "general_ledger"
            referencedColumns: ["entry_id"]
          },
          {
            foreignKeyName: "journal_entry_lines_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_entry_lines_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries_with_lines"
            referencedColumns: ["id"]
          },
        ]
      }
      kb_articles: {
        Row: {
          author_id: string | null
          category: string
          content: string
          created_at: string
          helpful_count: number | null
          id: string
          is_featured: boolean | null
          metadata: Json | null
          not_helpful_count: number | null
          published_at: string | null
          slug: string | null
          sort_order: number | null
          status: string
          summary: string | null
          tags: string[] | null
          title: string
          updated_at: string
          views_count: number | null
        }
        Insert: {
          author_id?: string | null
          category: string
          content: string
          created_at?: string
          helpful_count?: number | null
          id?: string
          is_featured?: boolean | null
          metadata?: Json | null
          not_helpful_count?: number | null
          published_at?: string | null
          slug?: string | null
          sort_order?: number | null
          status?: string
          summary?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
          views_count?: number | null
        }
        Update: {
          author_id?: string | null
          category?: string
          content?: string
          created_at?: string
          helpful_count?: number | null
          id?: string
          is_featured?: boolean | null
          metadata?: Json | null
          not_helpful_count?: number | null
          published_at?: string | null
          slug?: string | null
          sort_order?: number | null
          status?: string
          summary?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          views_count?: number | null
        }
        Relationships: []
      }
      kb_faqs: {
        Row: {
          answer: string
          category: string
          created_at: string
          helpful_count: number | null
          id: string
          is_active: boolean | null
          question: string
          sort_order: number | null
          updated_at: string
          views_count: number | null
        }
        Insert: {
          answer: string
          category: string
          created_at?: string
          helpful_count?: number | null
          id?: string
          is_active?: boolean | null
          question: string
          sort_order?: number | null
          updated_at?: string
          views_count?: number | null
        }
        Update: {
          answer?: string
          category?: string
          created_at?: string
          helpful_count?: number | null
          id?: string
          is_active?: boolean | null
          question?: string
          sort_order?: number | null
          updated_at?: string
          views_count?: number | null
        }
        Relationships: []
      }
      knowledge_articles: {
        Row: {
          author_id: string | null
          category: string
          content: string
          created_at: string | null
          helpful_count: number | null
          id: string
          is_published: boolean | null
          not_helpful_count: number | null
          tags: string[] | null
          title: string
          updated_at: string | null
          views_count: number | null
        }
        Insert: {
          author_id?: string | null
          category?: string
          content: string
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          is_published?: boolean | null
          not_helpful_count?: number | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          views_count?: number | null
        }
        Update: {
          author_id?: string | null
          category?: string
          content?: string
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          is_published?: boolean | null
          not_helpful_count?: number | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          views_count?: number | null
        }
        Relationships: []
      }
      kpi_definitions: {
        Row: {
          calculation_formula: string
          category: string | null
          chart_type: string | null
          created_at: string | null
          data_source: string
          description: string | null
          id: string
          is_active: boolean | null
          kpi_code: string
          kpi_name: string
          target_value: number | null
          unit: string | null
        }
        Insert: {
          calculation_formula: string
          category?: string | null
          chart_type?: string | null
          created_at?: string | null
          data_source: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          kpi_code: string
          kpi_name: string
          target_value?: number | null
          unit?: string | null
        }
        Update: {
          calculation_formula?: string
          category?: string | null
          chart_type?: string | null
          created_at?: string | null
          data_source?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          kpi_code?: string
          kpi_name?: string
          target_value?: number | null
          unit?: string | null
        }
        Relationships: []
      }
      kpi_values: {
        Row: {
          change_percentage: number | null
          id: string
          kpi_id: string | null
          metadata: Json | null
          period_end: string | null
          period_start: string | null
          previous_value: number | null
          recorded_at: string | null
          value: number
        }
        Insert: {
          change_percentage?: number | null
          id?: string
          kpi_id?: string | null
          metadata?: Json | null
          period_end?: string | null
          period_start?: string | null
          previous_value?: number | null
          recorded_at?: string | null
          value: number
        }
        Update: {
          change_percentage?: number | null
          id?: string
          kpi_id?: string | null
          metadata?: Json | null
          period_end?: string | null
          period_start?: string | null
          previous_value?: number | null
          recorded_at?: string | null
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "kpi_values_kpi_id_fkey"
            columns: ["kpi_id"]
            isOneToOne: false
            referencedRelation: "kpi_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      landing_page_settings: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          setting_key: string
          setting_type: string
          setting_value: Json
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          setting_key: string
          setting_type?: string
          setting_value?: Json
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          setting_key?: string
          setting_type?: string
          setting_value?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      leaked_password_checks: {
        Row: {
          checked_at: string | null
          created_at: string | null
          id: string
          is_leaked: boolean | null
          password_hash: string
          user_id: string | null
        }
        Insert: {
          checked_at?: string | null
          created_at?: string | null
          id?: string
          is_leaked?: boolean | null
          password_hash: string
          user_id?: string | null
        }
        Update: {
          checked_at?: string | null
          created_at?: string | null
          id?: string
          is_leaked?: boolean | null
          password_hash?: string
          user_id?: string | null
        }
        Relationships: []
      }
      loan_approvals: {
        Row: {
          approved_at: string | null
          approver_id: string | null
          approver_name: string
          created_at: string
          id: string
          level: number
          loan_id: string
          notes: string | null
          status: string
        }
        Insert: {
          approved_at?: string | null
          approver_id?: string | null
          approver_name: string
          created_at?: string
          id?: string
          level: number
          loan_id: string
          notes?: string | null
          status?: string
        }
        Update: {
          approved_at?: string | null
          approver_id?: string | null
          approver_name?: string
          created_at?: string
          id?: string
          level?: number
          loan_id?: string
          notes?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "loan_approvals_loan_id_fkey"
            columns: ["loan_id"]
            isOneToOne: false
            referencedRelation: "active_loans_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loan_approvals_loan_id_fkey"
            columns: ["loan_id"]
            isOneToOne: false
            referencedRelation: "loans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loan_approvals_loan_id_fkey"
            columns: ["loan_id"]
            isOneToOne: false
            referencedRelation: "loans_summary"
            referencedColumns: ["id"]
          },
        ]
      }
      loan_installments: {
        Row: {
          created_at: string
          due_date: string
          id: string
          installment_number: number
          interest_amount: number | null
          loan_id: string
          paid_amount: number | null
          paid_at: string | null
          principal_amount: number
          remaining_amount: number | null
          status: string | null
          total_amount: number
        }
        Insert: {
          created_at?: string
          due_date: string
          id?: string
          installment_number: number
          interest_amount?: number | null
          loan_id: string
          paid_amount?: number | null
          paid_at?: string | null
          principal_amount: number
          remaining_amount?: number | null
          status?: string | null
          total_amount: number
        }
        Update: {
          created_at?: string
          due_date?: string
          id?: string
          installment_number?: number
          interest_amount?: number | null
          loan_id?: string
          paid_amount?: number | null
          paid_at?: string | null
          principal_amount?: number
          remaining_amount?: number | null
          status?: string | null
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "loan_installments_loan_id_fkey"
            columns: ["loan_id"]
            isOneToOne: false
            referencedRelation: "active_loans_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loan_installments_loan_id_fkey"
            columns: ["loan_id"]
            isOneToOne: false
            referencedRelation: "loans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loan_installments_loan_id_fkey"
            columns: ["loan_id"]
            isOneToOne: false
            referencedRelation: "loans_summary"
            referencedColumns: ["id"]
          },
        ]
      }
      loan_payments: {
        Row: {
          created_at: string
          id: string
          installment_id: string | null
          journal_entry_id: string | null
          loan_id: string
          notes: string | null
          payment_amount: number
          payment_date: string
          payment_method: string | null
          payment_number: string | null
          waqf_unit_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          installment_id?: string | null
          journal_entry_id?: string | null
          loan_id: string
          notes?: string | null
          payment_amount: number
          payment_date: string
          payment_method?: string | null
          payment_number?: string | null
          waqf_unit_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          installment_id?: string | null
          journal_entry_id?: string | null
          loan_id?: string
          notes?: string | null
          payment_amount?: number
          payment_date?: string
          payment_method?: string | null
          payment_number?: string | null
          waqf_unit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "loan_payments_installment_id_fkey"
            columns: ["installment_id"]
            isOneToOne: false
            referencedRelation: "loan_installments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loan_payments_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "general_ledger"
            referencedColumns: ["entry_id"]
          },
          {
            foreignKeyName: "loan_payments_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loan_payments_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries_with_lines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loan_payments_loan_id_fkey"
            columns: ["loan_id"]
            isOneToOne: false
            referencedRelation: "active_loans_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loan_payments_loan_id_fkey"
            columns: ["loan_id"]
            isOneToOne: false
            referencedRelation: "loans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loan_payments_loan_id_fkey"
            columns: ["loan_id"]
            isOneToOne: false
            referencedRelation: "loans_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loan_payments_waqf_unit_id_fkey"
            columns: ["waqf_unit_id"]
            isOneToOne: false
            referencedRelation: "waqf_units"
            referencedColumns: ["id"]
          },
        ]
      }
      loan_schedules: {
        Row: {
          created_at: string | null
          due_date: string
          id: string
          installment_number: number
          interest_amount: number | null
          loan_id: string
          notes: string | null
          paid_amount: number | null
          payment_date: string | null
          principal_amount: number
          status: string | null
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          due_date: string
          id?: string
          installment_number: number
          interest_amount?: number | null
          loan_id: string
          notes?: string | null
          paid_amount?: number | null
          payment_date?: string | null
          principal_amount: number
          status?: string | null
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          due_date?: string
          id?: string
          installment_number?: number
          interest_amount?: number | null
          loan_id?: string
          notes?: string | null
          paid_amount?: number | null
          payment_date?: string | null
          principal_amount?: number
          status?: string | null
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "loan_schedules_loan_id_fkey"
            columns: ["loan_id"]
            isOneToOne: false
            referencedRelation: "active_loans_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loan_schedules_loan_id_fkey"
            columns: ["loan_id"]
            isOneToOne: false
            referencedRelation: "loans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loan_schedules_loan_id_fkey"
            columns: ["loan_id"]
            isOneToOne: false
            referencedRelation: "loans_summary"
            referencedColumns: ["id"]
          },
        ]
      }
      loan_types: {
        Row: {
          created_at: string | null
          description: string | null
          grace_period_months: number | null
          id: string
          interest_rate: number | null
          is_active: boolean | null
          max_amount: number | null
          max_term_months: number | null
          min_amount: number | null
          name_ar: string
          name_en: string | null
          requires_guarantor: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          grace_period_months?: number | null
          id?: string
          interest_rate?: number | null
          is_active?: boolean | null
          max_amount?: number | null
          max_term_months?: number | null
          min_amount?: number | null
          name_ar: string
          name_en?: string | null
          requires_guarantor?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          grace_period_months?: number | null
          id?: string
          interest_rate?: number | null
          is_active?: boolean | null
          max_amount?: number | null
          max_term_months?: number | null
          min_amount?: number | null
          name_ar?: string
          name_en?: string | null
          requires_guarantor?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      loans: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          beneficiary_id: string
          created_at: string
          deleted_at: string | null
          deleted_by: string | null
          deletion_reason: string | null
          disbursement_date: string | null
          end_date: string | null
          id: string
          interest_rate: number | null
          loan_amount: number
          loan_number: string | null
          monthly_installment: number | null
          notes: string | null
          paid_amount: number | null
          principal_amount: number | null
          remaining_balance: number | null
          start_date: string
          status: string | null
          term_months: number
          updated_at: string
          waqf_unit_id: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          beneficiary_id: string
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          disbursement_date?: string | null
          end_date?: string | null
          id?: string
          interest_rate?: number | null
          loan_amount: number
          loan_number?: string | null
          monthly_installment?: number | null
          notes?: string | null
          paid_amount?: number | null
          principal_amount?: number | null
          remaining_balance?: number | null
          start_date: string
          status?: string | null
          term_months: number
          updated_at?: string
          waqf_unit_id?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          beneficiary_id?: string
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          disbursement_date?: string | null
          end_date?: string | null
          id?: string
          interest_rate?: number | null
          loan_amount?: number
          loan_number?: string | null
          monthly_installment?: number | null
          notes?: string | null
          paid_amount?: number | null
          principal_amount?: number | null
          remaining_balance?: number | null
          start_date?: string
          status?: string | null
          term_months?: number
          updated_at?: string
          waqf_unit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "loans_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "loans_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loans_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries_masked"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loans_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loans_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiary_account_statement"
            referencedColumns: ["beneficiary_id"]
          },
          {
            foreignKeyName: "loans_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiary_statistics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loans_waqf_unit_id_fkey"
            columns: ["waqf_unit_id"]
            isOneToOne: false
            referencedRelation: "waqf_units"
            referencedColumns: ["id"]
          },
        ]
      }
      login_attempts_log: {
        Row: {
          created_at: string | null
          failure_reason: string | null
          id: string
          ip_address: string | null
          location: Json | null
          success: boolean | null
          user_agent: string | null
          user_email: string | null
        }
        Insert: {
          created_at?: string | null
          failure_reason?: string | null
          id?: string
          ip_address?: string | null
          location?: Json | null
          success?: boolean | null
          user_agent?: string | null
          user_email?: string | null
        }
        Update: {
          created_at?: string | null
          failure_reason?: string | null
          id?: string
          ip_address?: string | null
          location?: Json | null
          success?: boolean | null
          user_agent?: string | null
          user_email?: string | null
        }
        Relationships: []
      }
      maintenance_providers: {
        Row: {
          active_jobs: number | null
          address: string | null
          average_cost: number | null
          average_response_time: number | null
          contact_person: string | null
          created_at: string | null
          email: string | null
          id: string
          is_active: boolean | null
          notes: string | null
          phone: string
          provider_name: string
          rating: number | null
          specialization: string[] | null
          total_jobs: number | null
          updated_at: string | null
        }
        Insert: {
          active_jobs?: number | null
          address?: string | null
          average_cost?: number | null
          average_response_time?: number | null
          contact_person?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          phone: string
          provider_name: string
          rating?: number | null
          specialization?: string[] | null
          total_jobs?: number | null
          updated_at?: string | null
        }
        Update: {
          active_jobs?: number | null
          address?: string | null
          average_cost?: number | null
          average_response_time?: number | null
          contact_person?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          phone?: string
          provider_name?: string
          rating?: number | null
          specialization?: string[] | null
          total_jobs?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      maintenance_requests: {
        Row: {
          actual_cost: number | null
          admin_response: string | null
          assigned_to: string | null
          category: string
          completed_at: string | null
          completed_date: string | null
          contact_email: string | null
          contact_phone: string | null
          contact_preference: string | null
          contract_id: string | null
          created_at: string
          description: string
          estimated_cost: number | null
          id: string
          images: string[] | null
          is_urgent: boolean | null
          journal_entry_id: string | null
          location_in_unit: string | null
          notes: string | null
          preferred_date: string | null
          preferred_time_slot: string | null
          priority: string
          property_id: string
          provider_id: string | null
          rating: number | null
          rating_feedback: string | null
          request_number: string
          requested_by: string
          requested_date: string
          scheduled_date: string | null
          status: string
          submitted_via: string | null
          tenant_id: string | null
          tenant_notes: string | null
          title: string
          unit_id: string | null
          updated_at: string
          vendor_name: string | null
          waqf_unit_id: string | null
        }
        Insert: {
          actual_cost?: number | null
          admin_response?: string | null
          assigned_to?: string | null
          category: string
          completed_at?: string | null
          completed_date?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          contact_preference?: string | null
          contract_id?: string | null
          created_at?: string
          description: string
          estimated_cost?: number | null
          id?: string
          images?: string[] | null
          is_urgent?: boolean | null
          journal_entry_id?: string | null
          location_in_unit?: string | null
          notes?: string | null
          preferred_date?: string | null
          preferred_time_slot?: string | null
          priority?: string
          property_id: string
          provider_id?: string | null
          rating?: number | null
          rating_feedback?: string | null
          request_number: string
          requested_by: string
          requested_date?: string
          scheduled_date?: string | null
          status?: string
          submitted_via?: string | null
          tenant_id?: string | null
          tenant_notes?: string | null
          title: string
          unit_id?: string | null
          updated_at?: string
          vendor_name?: string | null
          waqf_unit_id?: string | null
        }
        Update: {
          actual_cost?: number | null
          admin_response?: string | null
          assigned_to?: string | null
          category?: string
          completed_at?: string | null
          completed_date?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          contact_preference?: string | null
          contract_id?: string | null
          created_at?: string
          description?: string
          estimated_cost?: number | null
          id?: string
          images?: string[] | null
          is_urgent?: boolean | null
          journal_entry_id?: string | null
          location_in_unit?: string | null
          notes?: string | null
          preferred_date?: string | null
          preferred_time_slot?: string | null
          priority?: string
          property_id?: string
          provider_id?: string | null
          rating?: number | null
          rating_feedback?: string | null
          request_number?: string
          requested_by?: string
          requested_date?: string
          scheduled_date?: string | null
          status?: string
          submitted_via?: string | null
          tenant_id?: string | null
          tenant_notes?: string | null
          title?: string
          unit_id?: string | null
          updated_at?: string
          vendor_name?: string | null
          waqf_unit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_requests_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_requests_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "general_ledger"
            referencedColumns: ["entry_id"]
          },
          {
            foreignKeyName: "maintenance_requests_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_requests_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries_with_lines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_requests_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_requests_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_requests_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "property_performance"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_requests_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "maintenance_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_requests_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_requests_waqf_unit_id_fkey"
            columns: ["waqf_unit_id"]
            isOneToOne: false
            referencedRelation: "waqf_units"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_schedule_log: {
        Row: {
          actual_cost: number | null
          completed_date: string | null
          completion_notes: string | null
          created_at: string | null
          id: string
          issues_found: string | null
          maintenance_request_id: string | null
          quality_rating: number | null
          recommendations: string | null
          schedule_id: string
          scheduled_date: string
          status: string
          updated_at: string | null
        }
        Insert: {
          actual_cost?: number | null
          completed_date?: string | null
          completion_notes?: string | null
          created_at?: string | null
          id?: string
          issues_found?: string | null
          maintenance_request_id?: string | null
          quality_rating?: number | null
          recommendations?: string | null
          schedule_id: string
          scheduled_date: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          actual_cost?: number | null
          completed_date?: string | null
          completion_notes?: string | null
          created_at?: string | null
          id?: string
          issues_found?: string | null
          maintenance_request_id?: string | null
          quality_rating?: number | null
          recommendations?: string | null
          schedule_id?: string
          scheduled_date?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_schedule_log_maintenance_request_id_fkey"
            columns: ["maintenance_request_id"]
            isOneToOne: false
            referencedRelation: "maintenance_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_schedule_log_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "maintenance_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_schedules: {
        Row: {
          assigned_contractor: string | null
          average_actual_cost: number | null
          category: string
          checklist: Json | null
          contractor_phone: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          end_date: string | null
          estimated_cost: number | null
          frequency: string
          frequency_value: number
          id: string
          is_active: boolean | null
          last_maintenance_date: string | null
          maintenance_type: string
          next_maintenance_date: string
          notes: string | null
          priority: string | null
          property_id: string | null
          property_unit_id: string | null
          schedule_name: string
          start_date: string
          total_cost: number | null
          total_maintenances: number | null
          updated_at: string | null
        }
        Insert: {
          assigned_contractor?: string | null
          average_actual_cost?: number | null
          category: string
          checklist?: Json | null
          contractor_phone?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          estimated_cost?: number | null
          frequency: string
          frequency_value?: number
          id?: string
          is_active?: boolean | null
          last_maintenance_date?: string | null
          maintenance_type: string
          next_maintenance_date: string
          notes?: string | null
          priority?: string | null
          property_id?: string | null
          property_unit_id?: string | null
          schedule_name: string
          start_date: string
          total_cost?: number | null
          total_maintenances?: number | null
          updated_at?: string | null
        }
        Update: {
          assigned_contractor?: string | null
          average_actual_cost?: number | null
          category?: string
          checklist?: Json | null
          contractor_phone?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          estimated_cost?: number | null
          frequency?: string
          frequency_value?: number
          id?: string
          is_active?: boolean | null
          last_maintenance_date?: string | null
          maintenance_type?: string
          next_maintenance_date?: string
          notes?: string | null
          priority?: string | null
          property_id?: string | null
          property_unit_id?: string | null
          schedule_name?: string
          start_date?: string
          total_cost?: number | null
          total_maintenances?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_schedules_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_schedules_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_schedules_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "property_performance"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_schedules_property_unit_id_fkey"
            columns: ["property_unit_id"]
            isOneToOne: false
            referencedRelation: "property_units"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          attachments: Json | null
          beneficiary_id: string | null
          content: string
          created_at: string | null
          id: string
          is_read: boolean | null
          message_type: string | null
          parent_message_id: string | null
          priority: string | null
          read_at: string | null
          recipient_id: string | null
          sender_id: string | null
          subject: string | null
          updated_at: string | null
        }
        Insert: {
          attachments?: Json | null
          beneficiary_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message_type?: string | null
          parent_message_id?: string | null
          priority?: string | null
          read_at?: string | null
          recipient_id?: string | null
          sender_id?: string | null
          subject?: string | null
          updated_at?: string | null
        }
        Update: {
          attachments?: Json | null
          beneficiary_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message_type?: string | null
          parent_message_id?: string | null
          priority?: string | null
          read_at?: string | null
          recipient_id?: string | null
          sender_id?: string | null
          subject?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries_masked"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiary_account_statement"
            referencedColumns: ["beneficiary_id"]
          },
          {
            foreignKeyName: "messages_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiary_statistics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_parent_message_id_fkey"
            columns: ["parent_message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_logs: {
        Row: {
          channel: string
          created_at: string | null
          delivered_at: string | null
          error_message: string | null
          id: string
          metadata: Json | null
          notification_id: string | null
          notification_type: string
          sent_at: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          channel: string
          created_at?: string | null
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          notification_id?: string | null
          notification_type: string
          sent_at?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          channel?: string
          created_at?: string | null
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          notification_id?: string | null
          notification_type?: string
          sent_at?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_logs_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notifications"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          auto_escalate_after_minutes: number | null
          created_at: string | null
          enable_email: boolean | null
          enable_in_app: boolean | null
          enable_push: boolean | null
          enable_sms: boolean | null
          escalate_to_user_id: string | null
          id: string
          notify_critical: boolean | null
          notify_high: boolean | null
          notify_low: boolean | null
          notify_medium: boolean | null
          role: string
          updated_at: string | null
          user_id: string
          work_days: number[] | null
          work_hours_end: string | null
          work_hours_start: string | null
        }
        Insert: {
          auto_escalate_after_minutes?: number | null
          created_at?: string | null
          enable_email?: boolean | null
          enable_in_app?: boolean | null
          enable_push?: boolean | null
          enable_sms?: boolean | null
          escalate_to_user_id?: string | null
          id?: string
          notify_critical?: boolean | null
          notify_high?: boolean | null
          notify_low?: boolean | null
          notify_medium?: boolean | null
          role: string
          updated_at?: string | null
          user_id: string
          work_days?: number[] | null
          work_hours_end?: string | null
          work_hours_start?: string | null
        }
        Update: {
          auto_escalate_after_minutes?: number | null
          created_at?: string | null
          enable_email?: boolean | null
          enable_in_app?: boolean | null
          enable_push?: boolean | null
          enable_sms?: boolean | null
          escalate_to_user_id?: string | null
          id?: string
          notify_critical?: boolean | null
          notify_high?: boolean | null
          notify_low?: boolean | null
          notify_medium?: boolean | null
          role?: string
          updated_at?: string | null
          user_id?: string
          work_days?: number[] | null
          work_hours_end?: string | null
          work_hours_start?: string | null
        }
        Relationships: []
      }
      notification_rules: {
        Row: {
          channels: string[] | null
          created_at: string | null
          days_before: number | null
          id: string
          is_active: boolean | null
          rule_name: string
          template_body: string | null
          template_subject: string | null
          trigger_event: string
          updated_at: string | null
        }
        Insert: {
          channels?: string[] | null
          created_at?: string | null
          days_before?: number | null
          id?: string
          is_active?: boolean | null
          rule_name: string
          template_body?: string | null
          template_subject?: string | null
          trigger_event: string
          updated_at?: string | null
        }
        Update: {
          channels?: string[] | null
          created_at?: string | null
          days_before?: number | null
          id?: string
          is_active?: boolean | null
          rule_name?: string
          template_body?: string | null
          template_subject?: string | null
          trigger_event?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      notification_settings: {
        Row: {
          beneficiary_id: string | null
          created_at: string | null
          distribution_notifications: boolean | null
          email_enabled: boolean | null
          id: string
          in_app_enabled: boolean | null
          loan_notifications: boolean | null
          payment_notifications: boolean | null
          push_enabled: boolean | null
          request_notifications: boolean | null
          sms_enabled: boolean | null
          system_notifications: boolean | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          beneficiary_id?: string | null
          created_at?: string | null
          distribution_notifications?: boolean | null
          email_enabled?: boolean | null
          id?: string
          in_app_enabled?: boolean | null
          loan_notifications?: boolean | null
          payment_notifications?: boolean | null
          push_enabled?: boolean | null
          request_notifications?: boolean | null
          sms_enabled?: boolean | null
          system_notifications?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          beneficiary_id?: string | null
          created_at?: string | null
          distribution_notifications?: boolean | null
          email_enabled?: boolean | null
          id?: string
          in_app_enabled?: boolean | null
          loan_notifications?: boolean | null
          payment_notifications?: boolean | null
          push_enabled?: boolean | null
          request_notifications?: boolean | null
          sms_enabled?: boolean | null
          system_notifications?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_settings_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: true
            referencedRelation: "beneficiaries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_settings_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: true
            referencedRelation: "beneficiaries_masked"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_settings_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: true
            referencedRelation: "beneficiaries_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_settings_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: true
            referencedRelation: "beneficiary_account_statement"
            referencedColumns: ["beneficiary_id"]
          },
          {
            foreignKeyName: "notification_settings_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: true
            referencedRelation: "beneficiary_statistics"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_templates: {
        Row: {
          body_template: string
          created_at: string | null
          id: string
          is_active: boolean | null
          subject: string | null
          template_name: string
          template_type: string
          updated_at: string | null
          variables: Json | null
        }
        Insert: {
          body_template: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          subject?: string | null
          template_name: string
          template_type: string
          updated_at?: string | null
          variables?: Json | null
        }
        Update: {
          body_template?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          subject?: string | null
          template_name?: string
          template_type?: string
          updated_at?: string | null
          variables?: Json | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          channel: string | null
          created_at: string
          delivery_status: string | null
          error_message: string | null
          id: string
          is_read: boolean
          message: string
          priority: string | null
          read_at: string | null
          reference_id: string | null
          reference_type: string | null
          retry_count: number | null
          scheduled_for: string | null
          sent_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          channel?: string | null
          created_at?: string
          delivery_status?: string | null
          error_message?: string | null
          id?: string
          is_read?: boolean
          message: string
          priority?: string | null
          read_at?: string | null
          reference_id?: string | null
          reference_type?: string | null
          retry_count?: number | null
          scheduled_for?: string | null
          sent_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          channel?: string | null
          created_at?: string
          delivery_status?: string | null
          error_message?: string | null
          id?: string
          is_read?: boolean
          message?: string
          priority?: string | null
          read_at?: string | null
          reference_id?: string | null
          reference_type?: string | null
          retry_count?: number | null
          scheduled_for?: string | null
          sent_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      ocr_processing_log: {
        Row: {
          attachment_id: string | null
          completed_at: string | null
          confidence_score: number | null
          created_at: string | null
          document_id: string | null
          error_message: string | null
          extracted_text: string | null
          id: string
          processed_by: string | null
          processing_time_ms: number | null
          status: string
        }
        Insert: {
          attachment_id?: string | null
          completed_at?: string | null
          confidence_score?: number | null
          created_at?: string | null
          document_id?: string | null
          error_message?: string | null
          extracted_text?: string | null
          id?: string
          processed_by?: string | null
          processing_time_ms?: number | null
          status?: string
        }
        Update: {
          attachment_id?: string | null
          completed_at?: string | null
          confidence_score?: number | null
          created_at?: string | null
          document_id?: string | null
          error_message?: string | null
          extracted_text?: string | null
          id?: string
          processed_by?: string | null
          processing_time_ms?: number | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "ocr_processing_log_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ocr_processing_log_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents_with_links"
            referencedColumns: ["id"]
          },
        ]
      }
      opening_balances: {
        Row: {
          account_id: string | null
          balance_date: string
          closing_balance: number | null
          created_at: string | null
          fiscal_year_id: string | null
          id: string
          opening_balance: number | null
          updated_at: string | null
        }
        Insert: {
          account_id?: string | null
          balance_date: string
          closing_balance?: number | null
          created_at?: string | null
          fiscal_year_id?: string | null
          id?: string
          opening_balance?: number | null
          updated_at?: string | null
        }
        Update: {
          account_id?: string | null
          balance_date?: string
          closing_balance?: number | null
          created_at?: string | null
          fiscal_year_id?: string | null
          id?: string
          opening_balance?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "opening_balances_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opening_balances_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts_hierarchy"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opening_balances_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "general_ledger"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "opening_balances_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "trial_balance"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "opening_balances_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "waqf_balance_summary"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "opening_balances_fiscal_year_id_fkey"
            columns: ["fiscal_year_id"]
            isOneToOne: false
            referencedRelation: "financial_summary"
            referencedColumns: ["fiscal_year_id"]
          },
          {
            foreignKeyName: "opening_balances_fiscal_year_id_fkey"
            columns: ["fiscal_year_id"]
            isOneToOne: false
            referencedRelation: "fiscal_years"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_settings: {
        Row: {
          address_ar: string
          address_en: string | null
          city: string
          commercial_registration_number: string
          country: string | null
          created_at: string | null
          default_tax_percentage: number | null
          email: string | null
          governance_type: string | null
          id: string
          logo_url: string | null
          nazer_appointment_date: string | null
          nazer_contact_email: string | null
          nazer_contact_phone: string | null
          nazer_name: string | null
          nazer_title: string | null
          organization_name_ar: string
          organization_name_en: string | null
          phone: string | null
          postal_code: string | null
          updated_at: string | null
          vat_registration_number: string
          waqf_deed_url: string | null
          waqf_establishment_date: string | null
          waqf_registration_number: string | null
          waqf_type: string | null
        }
        Insert: {
          address_ar: string
          address_en?: string | null
          city: string
          commercial_registration_number: string
          country?: string | null
          created_at?: string | null
          default_tax_percentage?: number | null
          email?: string | null
          governance_type?: string | null
          id?: string
          logo_url?: string | null
          nazer_appointment_date?: string | null
          nazer_contact_email?: string | null
          nazer_contact_phone?: string | null
          nazer_name?: string | null
          nazer_title?: string | null
          organization_name_ar: string
          organization_name_en?: string | null
          phone?: string | null
          postal_code?: string | null
          updated_at?: string | null
          vat_registration_number: string
          waqf_deed_url?: string | null
          waqf_establishment_date?: string | null
          waqf_registration_number?: string | null
          waqf_type?: string | null
        }
        Update: {
          address_ar?: string
          address_en?: string | null
          city?: string
          commercial_registration_number?: string
          country?: string | null
          created_at?: string | null
          default_tax_percentage?: number | null
          email?: string | null
          governance_type?: string | null
          id?: string
          logo_url?: string | null
          nazer_appointment_date?: string | null
          nazer_contact_email?: string | null
          nazer_contact_phone?: string | null
          nazer_name?: string | null
          nazer_title?: string | null
          organization_name_ar?: string
          organization_name_en?: string | null
          phone?: string | null
          postal_code?: string | null
          updated_at?: string | null
          vat_registration_number?: string
          waqf_deed_url?: string | null
          waqf_establishment_date?: string | null
          waqf_registration_number?: string | null
          waqf_type?: string | null
        }
        Relationships: []
      }
      payment_approvals: {
        Row: {
          approved_at: string | null
          approver_id: string | null
          approver_name: string
          created_at: string
          id: string
          level: number
          notes: string | null
          payment_id: string
          status: string
        }
        Insert: {
          approved_at?: string | null
          approver_id?: string | null
          approver_name: string
          created_at?: string
          id?: string
          level: number
          notes?: string | null
          payment_id: string
          status?: string
        }
        Update: {
          approved_at?: string | null
          approver_id?: string | null
          approver_name?: string
          created_at?: string
          id?: string
          level?: number
          notes?: string | null
          payment_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_approvals_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_approvals_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments_with_contract_details"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_gateways: {
        Row: {
          configuration: Json | null
          created_at: string | null
          gateway_name: string
          gateway_type: string
          id: string
          is_active: boolean | null
          merchant_id: string | null
          success_rate: number | null
          supported_methods: string[] | null
          total_transactions: number | null
          updated_at: string | null
        }
        Insert: {
          configuration?: Json | null
          created_at?: string | null
          gateway_name: string
          gateway_type: string
          id?: string
          is_active?: boolean | null
          merchant_id?: string | null
          success_rate?: number | null
          supported_methods?: string[] | null
          total_transactions?: number | null
          updated_at?: string | null
        }
        Update: {
          configuration?: Json | null
          created_at?: string | null
          gateway_name?: string
          gateway_type?: string
          id?: string
          is_active?: boolean | null
          merchant_id?: string | null
          success_rate?: number | null
          supported_methods?: string[] | null
          total_transactions?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      payment_reminders: {
        Row: {
          created_at: string | null
          days_before_due: number | null
          error_message: string | null
          id: string
          message_body: string | null
          read_at: string | null
          recipient_email: string | null
          recipient_phone: string | null
          reminder_date: string
          reminder_type: string
          rental_payment_id: string
          retry_count: number | null
          send_method: string[] | null
          sent_at: string | null
          status: string
          subject: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          days_before_due?: number | null
          error_message?: string | null
          id?: string
          message_body?: string | null
          read_at?: string | null
          recipient_email?: string | null
          recipient_phone?: string | null
          reminder_date: string
          reminder_type: string
          rental_payment_id: string
          retry_count?: number | null
          send_method?: string[] | null
          sent_at?: string | null
          status?: string
          subject?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          days_before_due?: number | null
          error_message?: string | null
          id?: string
          message_body?: string | null
          read_at?: string | null
          recipient_email?: string | null
          recipient_phone?: string | null
          reminder_date?: string
          reminder_type?: string
          rental_payment_id?: string
          retry_count?: number | null
          send_method?: string[] | null
          sent_at?: string | null
          status?: string
          subject?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_reminders_rental_payment_id_fkey"
            columns: ["rental_payment_id"]
            isOneToOne: false
            referencedRelation: "rental_payments"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_schedules: {
        Row: {
          batch_number: string | null
          created_at: string
          deleted_at: string | null
          deleted_by: string | null
          deletion_reason: string | null
          distribution_id: string | null
          error_message: string | null
          id: string
          notes: string | null
          processed_at: string | null
          scheduled_amount: number
          scheduled_date: string
          status: string
          updated_at: string
        }
        Insert: {
          batch_number?: string | null
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          distribution_id?: string | null
          error_message?: string | null
          id?: string
          notes?: string | null
          processed_at?: string | null
          scheduled_amount: number
          scheduled_date: string
          status?: string
          updated_at?: string
        }
        Update: {
          batch_number?: string | null
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          distribution_id?: string | null
          error_message?: string | null
          id?: string
          notes?: string | null
          processed_at?: string | null
          scheduled_amount?: number
          scheduled_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_schedules_distribution_id_fkey"
            columns: ["distribution_id"]
            isOneToOne: false
            referencedRelation: "distribution_statistics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_schedules_distribution_id_fkey"
            columns: ["distribution_id"]
            isOneToOne: false
            referencedRelation: "distributions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_schedules_distribution_id_fkey"
            columns: ["distribution_id"]
            isOneToOne: false
            referencedRelation: "distributions_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_schedules_distribution_id_fkey"
            columns: ["distribution_id"]
            isOneToOne: false
            referencedRelation: "payment_vouchers_with_details"
            referencedColumns: ["distribution_id_ref"]
          },
        ]
      }
      payment_vouchers: {
        Row: {
          amount: number
          approved_at: string | null
          approved_by: string | null
          attachments: Json | null
          bank_account_id: string | null
          beneficiary_id: string | null
          contract_id: string | null
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          deletion_reason: string | null
          description: string
          distribution_id: string | null
          id: string
          journal_entry_id: string | null
          metadata: Json | null
          notes: string | null
          paid_at: string | null
          paid_by: string | null
          payment_id: string | null
          payment_method: string | null
          reference_number: string | null
          status: string
          tenant_id: string | null
          updated_at: string | null
          voucher_number: string
          voucher_type: string
          waqf_unit_id: string | null
        }
        Insert: {
          amount: number
          approved_at?: string | null
          approved_by?: string | null
          attachments?: Json | null
          bank_account_id?: string | null
          beneficiary_id?: string | null
          contract_id?: string | null
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          description: string
          distribution_id?: string | null
          id?: string
          journal_entry_id?: string | null
          metadata?: Json | null
          notes?: string | null
          paid_at?: string | null
          paid_by?: string | null
          payment_id?: string | null
          payment_method?: string | null
          reference_number?: string | null
          status?: string
          tenant_id?: string | null
          updated_at?: string | null
          voucher_number: string
          voucher_type: string
          waqf_unit_id?: string | null
        }
        Update: {
          amount?: number
          approved_at?: string | null
          approved_by?: string | null
          attachments?: Json | null
          bank_account_id?: string | null
          beneficiary_id?: string | null
          contract_id?: string | null
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          description?: string
          distribution_id?: string | null
          id?: string
          journal_entry_id?: string | null
          metadata?: Json | null
          notes?: string | null
          paid_at?: string | null
          paid_by?: string | null
          payment_id?: string | null
          payment_method?: string | null
          reference_number?: string | null
          status?: string
          tenant_id?: string | null
          updated_at?: string | null
          voucher_number?: string
          voucher_type?: string
          waqf_unit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_vouchers_bank_account_id_fkey"
            columns: ["bank_account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_vouchers_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_vouchers_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries_masked"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_vouchers_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_vouchers_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiary_account_statement"
            referencedColumns: ["beneficiary_id"]
          },
          {
            foreignKeyName: "payment_vouchers_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiary_statistics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_vouchers_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_vouchers_distribution_id_fkey"
            columns: ["distribution_id"]
            isOneToOne: false
            referencedRelation: "distribution_statistics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_vouchers_distribution_id_fkey"
            columns: ["distribution_id"]
            isOneToOne: false
            referencedRelation: "distributions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_vouchers_distribution_id_fkey"
            columns: ["distribution_id"]
            isOneToOne: false
            referencedRelation: "distributions_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_vouchers_distribution_id_fkey"
            columns: ["distribution_id"]
            isOneToOne: false
            referencedRelation: "payment_vouchers_with_details"
            referencedColumns: ["distribution_id_ref"]
          },
          {
            foreignKeyName: "payment_vouchers_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "general_ledger"
            referencedColumns: ["entry_id"]
          },
          {
            foreignKeyName: "payment_vouchers_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_vouchers_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries_with_lines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_vouchers_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_vouchers_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments_with_contract_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_vouchers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_vouchers_waqf_unit_id_fkey"
            columns: ["waqf_unit_id"]
            isOneToOne: false
            referencedRelation: "waqf_units"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          beneficiary_id: string | null
          contract_id: string | null
          created_at: string
          deleted_at: string | null
          deleted_by: string | null
          deletion_reason: string | null
          description: string
          executed_by_user_id: string | null
          id: string
          journal_entry_id: string | null
          notes: string | null
          payer_name: string
          payment_date: string
          payment_method: string
          payment_number: string | null
          payment_type: string
          reference_id: string | null
          reference_number: string | null
          reference_type: string | null
          rental_payment_id: string | null
          status: string | null
          updated_at: string
          waqf_unit_id: string | null
        }
        Insert: {
          amount: number
          beneficiary_id?: string | null
          contract_id?: string | null
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          description: string
          executed_by_user_id?: string | null
          id?: string
          journal_entry_id?: string | null
          notes?: string | null
          payer_name: string
          payment_date: string
          payment_method: string
          payment_number?: string | null
          payment_type: string
          reference_id?: string | null
          reference_number?: string | null
          reference_type?: string | null
          rental_payment_id?: string | null
          status?: string | null
          updated_at?: string
          waqf_unit_id?: string | null
        }
        Update: {
          amount?: number
          beneficiary_id?: string | null
          contract_id?: string | null
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          description?: string
          executed_by_user_id?: string | null
          id?: string
          journal_entry_id?: string | null
          notes?: string | null
          payer_name?: string
          payment_date?: string
          payment_method?: string
          payment_number?: string | null
          payment_type?: string
          reference_id?: string | null
          reference_number?: string | null
          reference_type?: string | null
          rental_payment_id?: string | null
          status?: string | null
          updated_at?: string
          waqf_unit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries_masked"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiary_account_statement"
            referencedColumns: ["beneficiary_id"]
          },
          {
            foreignKeyName: "payments_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiary_statistics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "general_ledger"
            referencedColumns: ["entry_id"]
          },
          {
            foreignKeyName: "payments_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries_with_lines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_rental_payment_id_fkey"
            columns: ["rental_payment_id"]
            isOneToOne: false
            referencedRelation: "rental_payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_waqf_unit_id_fkey"
            columns: ["waqf_unit_id"]
            isOneToOne: false
            referencedRelation: "waqf_units"
            referencedColumns: ["id"]
          },
        ]
      }
      pending_system_fixes: {
        Row: {
          applied_at: string | null
          approved_by: string | null
          audit_id: string | null
          auto_fixable: boolean | null
          category: string
          created_at: string | null
          description: string | null
          error_message: string | null
          fix_sql: string
          fix_type: string
          id: string
          rollback_sql: string | null
          rolled_back_at: string | null
          severity: string | null
          status: string | null
        }
        Insert: {
          applied_at?: string | null
          approved_by?: string | null
          audit_id?: string | null
          auto_fixable?: boolean | null
          category: string
          created_at?: string | null
          description?: string | null
          error_message?: string | null
          fix_sql: string
          fix_type: string
          id?: string
          rollback_sql?: string | null
          rolled_back_at?: string | null
          severity?: string | null
          status?: string | null
        }
        Update: {
          applied_at?: string | null
          approved_by?: string | null
          audit_id?: string | null
          auto_fixable?: boolean | null
          category?: string
          created_at?: string | null
          description?: string | null
          error_message?: string | null
          fix_sql?: string
          fix_type?: string
          id?: string
          rollback_sql?: string | null
          rolled_back_at?: string | null
          severity?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pending_system_fixes_audit_id_fkey"
            columns: ["audit_id"]
            isOneToOne: false
            referencedRelation: "ai_system_audits"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_metrics: {
        Row: {
          created_at: string | null
          id: string
          metadata: Json | null
          metric_name: string
          metric_type: string
          recorded_at: string | null
          session_id: string | null
          unit: string | null
          url: string | null
          user_id: string | null
          value: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          metric_name: string
          metric_type: string
          recorded_at?: string | null
          session_id?: string | null
          unit?: string | null
          url?: string | null
          user_id?: string | null
          value: number
        }
        Update: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          metric_name?: string
          metric_type?: string
          recorded_at?: string | null
          session_id?: string | null
          unit?: string | null
          url?: string | null
          user_id?: string | null
          value?: number
        }
        Relationships: []
      }
      permissions: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      pos_transactions: {
        Row: {
          amount: number
          beneficiary_id: string | null
          cashier_id: string
          contract_id: string | null
          created_at: string
          description: string | null
          expense_category: string | null
          id: string
          journal_entry_id: string | null
          net_amount: number | null
          payer_name: string | null
          payment_method: string
          receipt_printed: boolean | null
          reference_number: string | null
          rental_payment_id: string | null
          shift_id: string
          tax_amount: number | null
          transaction_number: string
          transaction_type: string
          void_reason: string | null
          voided: boolean | null
          voided_at: string | null
          voided_by: string | null
          waqf_unit_id: string | null
        }
        Insert: {
          amount: number
          beneficiary_id?: string | null
          cashier_id: string
          contract_id?: string | null
          created_at?: string
          description?: string | null
          expense_category?: string | null
          id?: string
          journal_entry_id?: string | null
          net_amount?: number | null
          payer_name?: string | null
          payment_method: string
          receipt_printed?: boolean | null
          reference_number?: string | null
          rental_payment_id?: string | null
          shift_id: string
          tax_amount?: number | null
          transaction_number: string
          transaction_type: string
          void_reason?: string | null
          voided?: boolean | null
          voided_at?: string | null
          voided_by?: string | null
          waqf_unit_id?: string | null
        }
        Update: {
          amount?: number
          beneficiary_id?: string | null
          cashier_id?: string
          contract_id?: string | null
          created_at?: string
          description?: string | null
          expense_category?: string | null
          id?: string
          journal_entry_id?: string | null
          net_amount?: number | null
          payer_name?: string | null
          payment_method?: string
          receipt_printed?: boolean | null
          reference_number?: string | null
          rental_payment_id?: string | null
          shift_id?: string
          tax_amount?: number | null
          transaction_number?: string
          transaction_type?: string
          void_reason?: string | null
          voided?: boolean | null
          voided_at?: string | null
          voided_by?: string | null
          waqf_unit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pos_transactions_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pos_transactions_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries_masked"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pos_transactions_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pos_transactions_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiary_account_statement"
            referencedColumns: ["beneficiary_id"]
          },
          {
            foreignKeyName: "pos_transactions_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiary_statistics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pos_transactions_cashier_id_fkey"
            columns: ["cashier_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pos_transactions_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pos_transactions_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "general_ledger"
            referencedColumns: ["entry_id"]
          },
          {
            foreignKeyName: "pos_transactions_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pos_transactions_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries_with_lines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pos_transactions_rental_payment_id_fkey"
            columns: ["rental_payment_id"]
            isOneToOne: false
            referencedRelation: "rental_payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pos_transactions_shift_id_fkey"
            columns: ["shift_id"]
            isOneToOne: false
            referencedRelation: "cashier_shifts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pos_transactions_voided_by_fkey"
            columns: ["voided_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pos_transactions_waqf_unit_id_fkey"
            columns: ["waqf_unit_id"]
            isOneToOne: false
            referencedRelation: "waqf_units"
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
          is_active: boolean | null
          last_login_at: string | null
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
          is_active?: boolean | null
          last_login_at?: string | null
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
          is_active?: boolean | null
          last_login_at?: string | null
          phone?: string | null
          position?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      project_documentation: {
        Row: {
          assigned_to: string | null
          category: string
          completion_date: string | null
          completion_percentage: number | null
          created_at: string | null
          deliverables: Json | null
          description: string | null
          id: string
          notes: string | null
          phase_name: string
          phase_number: number
          start_date: string | null
          status: string
          tasks: Json | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          assigned_to?: string | null
          category: string
          completion_date?: string | null
          completion_percentage?: number | null
          created_at?: string | null
          deliverables?: Json | null
          description?: string | null
          id?: string
          notes?: string | null
          phase_name: string
          phase_number: number
          start_date?: string | null
          status?: string
          tasks?: Json | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          assigned_to?: string | null
          category?: string
          completion_date?: string | null
          completion_percentage?: number | null
          created_at?: string | null
          deliverables?: Json | null
          description?: string | null
          id?: string
          notes?: string | null
          phase_name?: string
          phase_number?: number
          start_date?: string | null
          status?: string
          tasks?: Json | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_documentation_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_documentation_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      properties: {
        Row: {
          apartment_count: number | null
          available_units: number | null
          created_at: string
          deleted_at: string | null
          deleted_by: string | null
          deletion_reason: string | null
          description: string | null
          floors: number | null
          id: string
          location: string
          monthly_revenue: number
          name: string
          occupancy_percentage: number | null
          occupied: number
          occupied_units: number | null
          revenue_type: string | null
          shop_count: number | null
          status: string
          tax_percentage: number | null
          total_units: number | null
          type: string
          units: number
          updated_at: string
          waqf_unit_id: string | null
        }
        Insert: {
          apartment_count?: number | null
          available_units?: number | null
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          description?: string | null
          floors?: number | null
          id?: string
          location: string
          monthly_revenue?: number
          name: string
          occupancy_percentage?: number | null
          occupied?: number
          occupied_units?: number | null
          revenue_type?: string | null
          shop_count?: number | null
          status: string
          tax_percentage?: number | null
          total_units?: number | null
          type: string
          units?: number
          updated_at?: string
          waqf_unit_id?: string | null
        }
        Update: {
          apartment_count?: number | null
          available_units?: number | null
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          description?: string | null
          floors?: number | null
          id?: string
          location?: string
          monthly_revenue?: number
          name?: string
          occupancy_percentage?: number | null
          occupied?: number
          occupied_units?: number | null
          revenue_type?: string | null
          shop_count?: number | null
          status?: string
          tax_percentage?: number | null
          total_units?: number | null
          type?: string
          units?: number
          updated_at?: string
          waqf_unit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "properties_waqf_unit_id_fkey"
            columns: ["waqf_unit_id"]
            isOneToOne: false
            referencedRelation: "waqf_units"
            referencedColumns: ["id"]
          },
        ]
      }
      property_alerts: {
        Row: {
          action_url: string | null
          alert_type: string
          contract_id: string | null
          created_at: string | null
          id: string
          is_resolved: boolean | null
          message: string
          metadata: Json | null
          property_id: string | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          title: string
          updated_at: string | null
        }
        Insert: {
          action_url?: string | null
          alert_type: string
          contract_id?: string | null
          created_at?: string | null
          id?: string
          is_resolved?: boolean | null
          message: string
          metadata?: Json | null
          property_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          action_url?: string | null
          alert_type?: string
          contract_id?: string | null
          created_at?: string | null
          id?: string
          is_resolved?: boolean | null
          message?: string
          metadata?: Json | null
          property_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_alerts_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_alerts_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_alerts_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_alerts_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "property_performance"
            referencedColumns: ["id"]
          },
        ]
      }
      property_units: {
        Row: {
          amenities: Json | null
          annual_rent: number | null
          area: number | null
          bathrooms: number | null
          created_at: string | null
          current_contract_id: string | null
          current_tenant_id: string | null
          deleted_at: string | null
          deleted_by: string | null
          deletion_reason: string | null
          description: string | null
          estimated_value: number | null
          floor_number: number | null
          furnishing_status: string | null
          has_kitchen: boolean | null
          has_parking: boolean | null
          id: string
          images: string[] | null
          last_maintenance_date: string | null
          lease_end_date: string | null
          lease_start_date: string | null
          monthly_rent: number | null
          next_maintenance_date: string | null
          notes: string | null
          occupancy_status: string | null
          parking_spaces: number | null
          property_id: string | null
          rooms: number | null
          status: string | null
          unit_name: string | null
          unit_number: string
          unit_type: string
          updated_at: string | null
          utilities_included: string[] | null
        }
        Insert: {
          amenities?: Json | null
          annual_rent?: number | null
          area?: number | null
          bathrooms?: number | null
          created_at?: string | null
          current_contract_id?: string | null
          current_tenant_id?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          description?: string | null
          estimated_value?: number | null
          floor_number?: number | null
          furnishing_status?: string | null
          has_kitchen?: boolean | null
          has_parking?: boolean | null
          id?: string
          images?: string[] | null
          last_maintenance_date?: string | null
          lease_end_date?: string | null
          lease_start_date?: string | null
          monthly_rent?: number | null
          next_maintenance_date?: string | null
          notes?: string | null
          occupancy_status?: string | null
          parking_spaces?: number | null
          property_id?: string | null
          rooms?: number | null
          status?: string | null
          unit_name?: string | null
          unit_number: string
          unit_type: string
          updated_at?: string | null
          utilities_included?: string[] | null
        }
        Update: {
          amenities?: Json | null
          annual_rent?: number | null
          area?: number | null
          bathrooms?: number | null
          created_at?: string | null
          current_contract_id?: string | null
          current_tenant_id?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          description?: string | null
          estimated_value?: number | null
          floor_number?: number | null
          furnishing_status?: string | null
          has_kitchen?: boolean | null
          has_parking?: boolean | null
          id?: string
          images?: string[] | null
          last_maintenance_date?: string | null
          lease_end_date?: string | null
          lease_start_date?: string | null
          monthly_rent?: number | null
          next_maintenance_date?: string | null
          notes?: string | null
          occupancy_status?: string | null
          parking_spaces?: number | null
          property_id?: string | null
          rooms?: number | null
          status?: string | null
          unit_name?: string | null
          unit_number?: string
          unit_type?: string
          updated_at?: string | null
          utilities_included?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "property_units_current_contract_id_fkey"
            columns: ["current_contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_units_current_tenant_id_fkey"
            columns: ["current_tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_units_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_units_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_units_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "property_performance"
            referencedColumns: ["id"]
          },
        ]
      }
      protected_policies_log: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          last_verified_at: string | null
          policy_description: string
          policy_name: string
          protection_level: string
          table_name: string
          verification_notes: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          last_verified_at?: string | null
          policy_description: string
          policy_name: string
          protection_level: string
          table_name: string
          verification_notes?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          last_verified_at?: string | null
          policy_description?: string
          policy_name?: string
          protection_level?: string
          table_name?: string
          verification_notes?: string | null
        }
        Relationships: []
      }
      provider_ratings: {
        Row: {
          comments: string | null
          cost_score: number | null
          created_at: string | null
          id: string
          maintenance_request_id: string | null
          provider_id: string
          quality_score: number | null
          rated_by: string | null
          rating: number
          timeliness_score: number | null
        }
        Insert: {
          comments?: string | null
          cost_score?: number | null
          created_at?: string | null
          id?: string
          maintenance_request_id?: string | null
          provider_id: string
          quality_score?: number | null
          rated_by?: string | null
          rating: number
          timeliness_score?: number | null
        }
        Update: {
          comments?: string | null
          cost_score?: number | null
          created_at?: string | null
          id?: string
          maintenance_request_id?: string | null
          provider_id?: string
          quality_score?: number | null
          rated_by?: string | null
          rating?: number
          timeliness_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "provider_ratings_maintenance_request_id_fkey"
            columns: ["maintenance_request_id"]
            isOneToOne: false
            referencedRelation: "maintenance_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "provider_ratings_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "maintenance_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string | null
          endpoint: string
          id: string
          is_active: boolean | null
          last_used_at: string | null
          p256dh: string
          updated_at: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string | null
          endpoint: string
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          p256dh: string
          updated_at?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string | null
          endpoint?: string
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          p256dh?: string
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      rent_adjustment_requests: {
        Row: {
          adjustment_percentage: number | null
          adjustment_type: string
          contract_id: string
          created_at: string | null
          created_by: string | null
          created_by_name: string | null
          current_rent: number
          effective_date: string
          final_rent: number | null
          id: string
          reason: string
          request_number: string
          requested_by: string
          requested_rent: number
          responded_at: string | null
          responded_by: string | null
          responded_by_name: string | null
          response_notes: string | null
          status: string
          supporting_documents: string[] | null
          updated_at: string | null
        }
        Insert: {
          adjustment_percentage?: number | null
          adjustment_type: string
          contract_id: string
          created_at?: string | null
          created_by?: string | null
          created_by_name?: string | null
          current_rent: number
          effective_date: string
          final_rent?: number | null
          id?: string
          reason: string
          request_number?: string
          requested_by: string
          requested_rent: number
          responded_at?: string | null
          responded_by?: string | null
          responded_by_name?: string | null
          response_notes?: string | null
          status?: string
          supporting_documents?: string[] | null
          updated_at?: string | null
        }
        Update: {
          adjustment_percentage?: number | null
          adjustment_type?: string
          contract_id?: string
          created_at?: string | null
          created_by?: string | null
          created_by_name?: string | null
          current_rent?: number
          effective_date?: string
          final_rent?: number | null
          id?: string
          reason?: string
          request_number?: string
          requested_by?: string
          requested_rent?: number
          responded_at?: string | null
          responded_by?: string | null
          responded_by_name?: string | null
          response_notes?: string | null
          status?: string
          supporting_documents?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rent_adjustment_requests_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      rental_payments: {
        Row: {
          amount_due: number
          amount_paid: number | null
          contract_id: string
          created_at: string
          deleted_at: string | null
          deleted_by: string | null
          deletion_reason: string | null
          discount: number | null
          due_date: string
          id: string
          invoice_id: string | null
          journal_entry_id: string | null
          late_fee: number | null
          net_amount: number | null
          notes: string | null
          payment_date: string | null
          payment_method: string | null
          payment_number: string
          receipt_id: string | null
          receipt_number: string | null
          status: string
          tax_amount: number | null
          tax_percentage: number | null
          updated_at: string
          waqf_unit_id: string | null
        }
        Insert: {
          amount_due: number
          amount_paid?: number | null
          contract_id: string
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          discount?: number | null
          due_date: string
          id?: string
          invoice_id?: string | null
          journal_entry_id?: string | null
          late_fee?: number | null
          net_amount?: number | null
          notes?: string | null
          payment_date?: string | null
          payment_method?: string | null
          payment_number: string
          receipt_id?: string | null
          receipt_number?: string | null
          status?: string
          tax_amount?: number | null
          tax_percentage?: number | null
          updated_at?: string
          waqf_unit_id?: string | null
        }
        Update: {
          amount_due?: number
          amount_paid?: number | null
          contract_id?: string
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          discount?: number | null
          due_date?: string
          id?: string
          invoice_id?: string | null
          journal_entry_id?: string | null
          late_fee?: number | null
          net_amount?: number | null
          notes?: string | null
          payment_date?: string | null
          payment_method?: string | null
          payment_number?: string
          receipt_id?: string | null
          receipt_number?: string | null
          status?: string
          tax_amount?: number | null
          tax_percentage?: number | null
          updated_at?: string
          waqf_unit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rental_payments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rental_payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rental_payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rental_payments_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "general_ledger"
            referencedColumns: ["entry_id"]
          },
          {
            foreignKeyName: "rental_payments_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rental_payments_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries_with_lines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rental_payments_receipt_id_fkey"
            columns: ["receipt_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rental_payments_receipt_id_fkey"
            columns: ["receipt_id"]
            isOneToOne: false
            referencedRelation: "payments_with_contract_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rental_payments_waqf_unit_id_fkey"
            columns: ["waqf_unit_id"]
            isOneToOne: false
            referencedRelation: "waqf_units"
            referencedColumns: ["id"]
          },
        ]
      }
      report_execution_log: {
        Row: {
          completed_at: string | null
          error_message: string | null
          executed_by: string | null
          execution_type: string
          file_path: string | null
          file_size: number | null
          id: string
          metadata: Json | null
          report_template_id: string | null
          row_count: number | null
          scheduled_report_id: string | null
          started_at: string | null
          status: string
        }
        Insert: {
          completed_at?: string | null
          error_message?: string | null
          executed_by?: string | null
          execution_type: string
          file_path?: string | null
          file_size?: number | null
          id?: string
          metadata?: Json | null
          report_template_id?: string | null
          row_count?: number | null
          scheduled_report_id?: string | null
          started_at?: string | null
          status: string
        }
        Update: {
          completed_at?: string | null
          error_message?: string | null
          executed_by?: string | null
          execution_type?: string
          file_path?: string | null
          file_size?: number | null
          id?: string
          metadata?: Json | null
          report_template_id?: string | null
          row_count?: number | null
          scheduled_report_id?: string | null
          started_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_execution_log_report_template_id_fkey"
            columns: ["report_template_id"]
            isOneToOne: false
            referencedRelation: "report_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      report_generation_log: {
        Row: {
          created_at: string | null
          error_message: string | null
          file_format: string | null
          file_path: string | null
          generated_by: string | null
          generation_time_ms: number | null
          id: string
          report_id: string | null
          report_name: string
          status: string | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          file_format?: string | null
          file_path?: string | null
          generated_by?: string | null
          generation_time_ms?: number | null
          id?: string
          report_id?: string | null
          report_name: string
          status?: string | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          file_format?: string | null
          file_path?: string | null
          generated_by?: string | null
          generation_time_ms?: number | null
          id?: string
          report_id?: string | null
          report_name?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "report_generation_log_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "custom_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      report_templates: {
        Row: {
          columns: Json | null
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          deletion_reason: string | null
          description: string | null
          filters: Json | null
          id: string
          is_public: boolean | null
          report_type: string
          template_config: Json
          template_name: string
        }
        Insert: {
          columns?: Json | null
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          description?: string | null
          filters?: Json | null
          id?: string
          is_public?: boolean | null
          report_type: string
          template_config?: Json
          template_name: string
        }
        Update: {
          columns?: Json | null
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          description?: string | null
          filters?: Json | null
          id?: string
          is_public?: boolean | null
          report_type?: string
          template_config?: Json
          template_name?: string
        }
        Relationships: []
      }
      request_approvals: {
        Row: {
          approved_at: string | null
          approver_id: string | null
          approver_name: string
          created_at: string | null
          id: string
          level: number
          notes: string | null
          request_id: string
          status: string
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approver_id?: string | null
          approver_name: string
          created_at?: string | null
          id?: string
          level: number
          notes?: string | null
          request_id: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approver_id?: string | null
          approver_name?: string
          created_at?: string | null
          id?: string
          level?: number
          notes?: string | null
          request_id?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "request_approvals_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "beneficiary_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      request_attachments: {
        Row: {
          description: string | null
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          request_id: string
          uploaded_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          description?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          request_id: string
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          description?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          request_id?: string
          uploaded_at?: string | null
          uploaded_by?: string | null
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
          id: string
          is_active: boolean | null
          name_ar: string
          name_en: string | null
          requires_amount: boolean | null
          sla_hours: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name_ar: string
          name_en?: string | null
          requires_amount?: boolean | null
          sla_hours?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name_ar?: string
          name_en?: string | null
          requires_amount?: boolean | null
          sla_hours?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      request_workflows: {
        Row: {
          assigned_at: string | null
          assigned_to: string | null
          created_at: string | null
          current_step: number
          escalated: boolean | null
          escalated_at: string | null
          escalation_level: number | null
          id: string
          metadata: Json | null
          request_id: string
          sla_due_at: string | null
          total_steps: number
          updated_at: string | null
          workflow_status: string | null
        }
        Insert: {
          assigned_at?: string | null
          assigned_to?: string | null
          created_at?: string | null
          current_step?: number
          escalated?: boolean | null
          escalated_at?: string | null
          escalation_level?: number | null
          id?: string
          metadata?: Json | null
          request_id: string
          sla_due_at?: string | null
          total_steps?: number
          updated_at?: string | null
          workflow_status?: string | null
        }
        Update: {
          assigned_at?: string | null
          assigned_to?: string | null
          created_at?: string | null
          current_step?: number
          escalated?: boolean | null
          escalated_at?: string | null
          escalation_level?: number | null
          id?: string
          metadata?: Json | null
          request_id?: string
          sla_due_at?: string | null
          total_steps?: number
          updated_at?: string | null
          workflow_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "request_workflows_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "beneficiary_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      reserve_transactions: {
        Row: {
          amount: number
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          reference_number: string | null
          reserve_id: string | null
          transaction_date: string | null
          transaction_type: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          reference_number?: string | null
          reserve_id?: string | null
          transaction_date?: string | null
          transaction_type: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          reference_number?: string | null
          reserve_id?: string | null
          transaction_date?: string | null
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "reserve_transactions_reserve_id_fkey"
            columns: ["reserve_id"]
            isOneToOne: false
            referencedRelation: "waqf_reserves"
            referencedColumns: ["id"]
          },
        ]
      }
      retention_policies: {
        Row: {
          archive_before_delete: boolean | null
          auto_delete: boolean | null
          created_at: string | null
          document_type: string
          id: string
          is_active: boolean | null
          policy_name: string
          retention_days: number
          updated_at: string | null
        }
        Insert: {
          archive_before_delete?: boolean | null
          auto_delete?: boolean | null
          created_at?: string | null
          document_type: string
          id?: string
          is_active?: boolean | null
          policy_name: string
          retention_days: number
          updated_at?: string | null
        }
        Update: {
          archive_before_delete?: boolean | null
          auto_delete?: boolean | null
          created_at?: string | null
          document_type?: string
          id?: string
          is_active?: boolean | null
          policy_name?: string
          retention_days?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      risk_assessments: {
        Row: {
          assessment_date: string
          assessor_name: string
          created_at: string | null
          findings: string | null
          id: string
          impact_score: number | null
          likelihood_score: number | null
          overall_score: number | null
          recommendations: string | null
          risk_id: string | null
        }
        Insert: {
          assessment_date: string
          assessor_name: string
          created_at?: string | null
          findings?: string | null
          id?: string
          impact_score?: number | null
          likelihood_score?: number | null
          overall_score?: number | null
          recommendations?: string | null
          risk_id?: string | null
        }
        Update: {
          assessment_date?: string
          assessor_name?: string
          created_at?: string | null
          findings?: string | null
          id?: string
          impact_score?: number | null
          likelihood_score?: number | null
          overall_score?: number | null
          recommendations?: string | null
          risk_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "risk_assessments_risk_id_fkey"
            columns: ["risk_id"]
            isOneToOne: false
            referencedRelation: "governance_risks"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          created_at: string | null
          granted: boolean | null
          id: string
          permission_id: string | null
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          created_at?: string | null
          granted?: boolean | null
          id?: string
          permission_id?: string | null
          role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          created_at?: string | null
          granted?: boolean | null
          id?: string
          permission_id?: string | null
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_system_role: boolean | null
          permissions: Json | null
          role_name: string
          role_name_ar: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_system_role?: boolean | null
          permissions?: Json | null
          role_name: string
          role_name_ar: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_system_role?: boolean | null
          permissions?: Json | null
          role_name?: string
          role_name_ar?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      saved_filters: {
        Row: {
          created_at: string | null
          filter_criteria: Json
          filter_type: string
          id: string
          is_favorite: boolean | null
          name: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          filter_criteria: Json
          filter_type: string
          id?: string
          is_favorite?: boolean | null
          name: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          filter_criteria?: Json
          filter_type?: string
          id?: string
          is_favorite?: boolean | null
          name?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      saved_reports: {
        Row: {
          columns: Json | null
          created_at: string | null
          filters: Json | null
          id: string
          is_favorite: boolean | null
          report_name: string
          report_template_id: string | null
          sort_config: Json | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          columns?: Json | null
          created_at?: string | null
          filters?: Json | null
          id?: string
          is_favorite?: boolean | null
          report_name: string
          report_template_id?: string | null
          sort_config?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          columns?: Json | null
          created_at?: string | null
          filters?: Json | null
          id?: string
          is_favorite?: boolean | null
          report_name?: string
          report_template_id?: string | null
          sort_config?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "saved_reports_report_template_id_fkey"
            columns: ["report_template_id"]
            isOneToOne: false
            referencedRelation: "report_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_searches: {
        Row: {
          avg_execution_time_ms: number | null
          created_at: string | null
          description: string | null
          execution_count: number | null
          id: string
          is_favorite: boolean | null
          is_shared: boolean | null
          last_used_at: string | null
          name: string
          search_criteria: Json
          search_type: string | null
          shared_with: string[] | null
          tags: string[] | null
          updated_at: string | null
          usage_count: number | null
          user_id: string
        }
        Insert: {
          avg_execution_time_ms?: number | null
          created_at?: string | null
          description?: string | null
          execution_count?: number | null
          id?: string
          is_favorite?: boolean | null
          is_shared?: boolean | null
          last_used_at?: string | null
          name: string
          search_criteria: Json
          search_type?: string | null
          shared_with?: string[] | null
          tags?: string[] | null
          updated_at?: string | null
          usage_count?: number | null
          user_id: string
        }
        Update: {
          avg_execution_time_ms?: number | null
          created_at?: string | null
          description?: string | null
          execution_count?: number | null
          id?: string
          is_favorite?: boolean | null
          is_shared?: boolean | null
          last_used_at?: string | null
          name?: string
          search_criteria?: Json
          search_type?: string | null
          shared_with?: string[] | null
          tags?: string[] | null
          updated_at?: string | null
          usage_count?: number | null
          user_id?: string
        }
        Relationships: []
      }
      scheduled_report_jobs: {
        Row: {
          created_at: string | null
          created_by: string | null
          cron_expression: string | null
          delivery_method: string | null
          id: string
          is_active: boolean | null
          last_run_at: string | null
          next_run_at: string | null
          recipients: Json
          report_template_id: string | null
          schedule_type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          cron_expression?: string | null
          delivery_method?: string | null
          id?: string
          is_active?: boolean | null
          last_run_at?: string | null
          next_run_at?: string | null
          recipients: Json
          report_template_id?: string | null
          schedule_type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          cron_expression?: string | null
          delivery_method?: string | null
          id?: string
          is_active?: boolean | null
          last_run_at?: string | null
          next_run_at?: string | null
          recipients?: Json
          report_template_id?: string | null
          schedule_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_report_jobs_report_template_id_fkey"
            columns: ["report_template_id"]
            isOneToOne: false
            referencedRelation: "custom_report_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduled_reports: {
        Row: {
          created_at: string
          created_by: string | null
          filters: Json | null
          format: string | null
          id: string
          is_active: boolean | null
          last_run_at: string | null
          last_run_error: string | null
          last_run_status: string | null
          next_run_at: string | null
          recipients: Json | null
          report_name: string
          report_type: string
          schedule_config: Json | null
          schedule_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          filters?: Json | null
          format?: string | null
          id?: string
          is_active?: boolean | null
          last_run_at?: string | null
          last_run_error?: string | null
          last_run_status?: string | null
          next_run_at?: string | null
          recipients?: Json | null
          report_name: string
          report_type: string
          schedule_config?: Json | null
          schedule_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          filters?: Json | null
          format?: string | null
          id?: string
          is_active?: boolean | null
          last_run_at?: string | null
          last_run_error?: string | null
          last_run_status?: string | null
          next_run_at?: string | null
          recipients?: Json | null
          report_name?: string
          report_type?: string
          schedule_config?: Json | null
          schedule_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      search_history: {
        Row: {
          created_at: string | null
          filters: Json | null
          id: string
          results_count: number | null
          search_query: string
          search_type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          filters?: Json | null
          id?: string
          results_count?: number | null
          search_query: string
          search_type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          filters?: Json | null
          id?: string
          results_count?: number | null
          search_query?: string
          search_type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      security_events_log: {
        Row: {
          created_at: string | null
          description: string | null
          event_data: Json | null
          event_type: string
          id: string
          ip_address: unknown
          resolved: boolean | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      security_rules_config: {
        Row: {
          actions: Json
          conditions: Json
          created_at: string | null
          id: string
          is_active: boolean | null
          last_triggered_at: string | null
          priority: number | null
          rule_name: string
          rule_type: string
          trigger_count: number | null
          updated_at: string | null
        }
        Insert: {
          actions: Json
          conditions: Json
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_triggered_at?: string | null
          priority?: number | null
          rule_name: string
          rule_type: string
          trigger_count?: number | null
          updated_at?: string | null
        }
        Update: {
          actions?: Json
          conditions?: Json
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_triggered_at?: string | null
          priority?: number | null
          rule_name?: string
          rule_type?: string
          trigger_count?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      security_sessions: {
        Row: {
          created_at: string | null
          device_info: Json | null
          expires_at: string
          id: string
          ip_address: unknown
          is_active: boolean | null
          last_activity_at: string | null
          location: Json | null
          session_token: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          device_info?: Json | null
          expires_at: string
          id?: string
          ip_address?: unknown
          is_active?: boolean | null
          last_activity_at?: string | null
          location?: Json | null
          session_token: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          device_info?: Json | null
          expires_at?: string
          id?: string
          ip_address?: unknown
          is_active?: boolean | null
          last_activity_at?: string | null
          location?: Json | null
          session_token?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      sensitive_data_access_log: {
        Row: {
          access_reason: string | null
          access_type: string
          accessed_at: string | null
          column_name: string | null
          denial_reason: string | null
          id: string
          ip_address: string | null
          metadata: Json | null
          record_id: string | null
          session_id: string | null
          table_name: string
          user_agent: string | null
          user_email: string | null
          user_id: string | null
          was_granted: boolean | null
        }
        Insert: {
          access_reason?: string | null
          access_type: string
          accessed_at?: string | null
          column_name?: string | null
          denial_reason?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          record_id?: string | null
          session_id?: string | null
          table_name: string
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
          was_granted?: boolean | null
        }
        Update: {
          access_reason?: string | null
          access_type?: string
          accessed_at?: string | null
          column_name?: string | null
          denial_reason?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          record_id?: string | null
          session_id?: string | null
          table_name?: string
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
          was_granted?: boolean | null
        }
        Relationships: []
      }
      slow_query_log: {
        Row: {
          created_at: string | null
          execution_time_ms: number
          id: string
          parameters: Json | null
          query_text: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          execution_time_ms: number
          id?: string
          parameters?: Json | null
          query_text: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          execution_time_ms?: number
          id?: string
          parameters?: Json | null
          query_text?: string
          user_id?: string | null
        }
        Relationships: []
      }
      smart_alerts: {
        Row: {
          action_url: string | null
          alert_type: string
          created_at: string | null
          data: Json | null
          description: string
          expires_at: string | null
          id: string
          is_dismissed: boolean | null
          is_read: boolean | null
          severity: string
          title: string
          triggered_at: string | null
        }
        Insert: {
          action_url?: string | null
          alert_type: string
          created_at?: string | null
          data?: Json | null
          description: string
          expires_at?: string | null
          id?: string
          is_dismissed?: boolean | null
          is_read?: boolean | null
          severity?: string
          title: string
          triggered_at?: string | null
        }
        Update: {
          action_url?: string | null
          alert_type?: string
          created_at?: string | null
          data?: Json | null
          description?: string
          expires_at?: string | null
          id?: string
          is_dismissed?: boolean | null
          is_read?: boolean | null
          severity?: string
          title?: string
          triggered_at?: string | null
        }
        Relationships: []
      }
      support_agent_availability: {
        Row: {
          created_at: string | null
          current_load: number | null
          id: string
          is_available: boolean | null
          max_capacity: number | null
          priority_level: number | null
          skills: string[] | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          current_load?: number | null
          id?: string
          is_available?: boolean | null
          max_capacity?: number | null
          priority_level?: number | null
          skills?: string[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          current_load?: number | null
          id?: string
          is_available?: boolean | null
          max_capacity?: number | null
          priority_level?: number | null
          skills?: string[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      support_agent_stats: {
        Row: {
          avg_resolution_minutes: number | null
          avg_response_minutes: number | null
          created_at: string | null
          customer_satisfaction_avg: number | null
          date: string | null
          id: string
          total_assigned: number | null
          total_closed: number | null
          total_resolved: number | null
          user_id: string | null
        }
        Insert: {
          avg_resolution_minutes?: number | null
          avg_response_minutes?: number | null
          created_at?: string | null
          customer_satisfaction_avg?: number | null
          date?: string | null
          id?: string
          total_assigned?: number | null
          total_closed?: number | null
          total_resolved?: number | null
          user_id?: string | null
        }
        Update: {
          avg_resolution_minutes?: number | null
          avg_response_minutes?: number | null
          created_at?: string | null
          customer_satisfaction_avg?: number | null
          date?: string | null
          id?: string
          total_assigned?: number | null
          total_closed?: number | null
          total_resolved?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      support_assignment_settings: {
        Row: {
          assignment_type: string
          auto_assign: boolean | null
          consider_availability: boolean | null
          created_at: string | null
          id: string
          max_tickets_per_agent: number | null
          updated_at: string | null
        }
        Insert: {
          assignment_type?: string
          auto_assign?: boolean | null
          consider_availability?: boolean | null
          created_at?: string | null
          id?: string
          max_tickets_per_agent?: number | null
          updated_at?: string | null
        }
        Update: {
          assignment_type?: string
          auto_assign?: boolean | null
          consider_availability?: boolean | null
          created_at?: string | null
          id?: string
          max_tickets_per_agent?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      support_escalations: {
        Row: {
          created_at: string | null
          escalated_from: string | null
          escalated_to: string | null
          escalation_level: number | null
          escalation_reason: string
          id: string
          resolved: boolean | null
          resolved_at: string | null
          ticket_id: string | null
        }
        Insert: {
          created_at?: string | null
          escalated_from?: string | null
          escalated_to?: string | null
          escalation_level?: number | null
          escalation_reason: string
          id?: string
          resolved?: boolean | null
          resolved_at?: string | null
          ticket_id?: string | null
        }
        Update: {
          created_at?: string | null
          escalated_from?: string | null
          escalated_to?: string | null
          escalation_level?: number | null
          escalation_reason?: string
          id?: string
          resolved?: boolean | null
          resolved_at?: string | null
          ticket_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_escalations_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_messages: {
        Row: {
          attachments: Json | null
          created_at: string
          id: string
          is_internal: boolean | null
          message: string
          read_at: string | null
          sender_id: string | null
          sender_type: string | null
          ticket_id: string | null
          updated_at: string
        }
        Insert: {
          attachments?: Json | null
          created_at?: string
          id?: string
          is_internal?: boolean | null
          message: string
          read_at?: string | null
          sender_id?: string | null
          sender_type?: string | null
          ticket_id?: string | null
          updated_at?: string
        }
        Update: {
          attachments?: Json | null
          created_at?: string
          id?: string
          is_internal?: boolean | null
          message?: string
          read_at?: string | null
          sender_id?: string | null
          sender_type?: string | null
          ticket_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_notification_templates: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          message_ar: string
          notification_type: string | null
          template_key: string
          title_ar: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          message_ar: string
          notification_type?: string | null
          template_key: string
          title_ar: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          message_ar?: string
          notification_type?: string | null
          template_key?: string
          title_ar?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      support_statistics: {
        Row: {
          active_agents: number | null
          avg_first_response_minutes: number | null
          avg_rating: number | null
          avg_resolution_minutes: number | null
          closed_tickets: number | null
          created_at: string
          date: string
          id: string
          new_tickets: number | null
          reopened_tickets: number | null
          resolved_tickets: number | null
          sla_compliance_rate: number | null
          total_ratings: number | null
          total_responses: number | null
          total_tickets: number | null
        }
        Insert: {
          active_agents?: number | null
          avg_first_response_minutes?: number | null
          avg_rating?: number | null
          avg_resolution_minutes?: number | null
          closed_tickets?: number | null
          created_at?: string
          date: string
          id?: string
          new_tickets?: number | null
          reopened_tickets?: number | null
          resolved_tickets?: number | null
          sla_compliance_rate?: number | null
          total_ratings?: number | null
          total_responses?: number | null
          total_tickets?: number | null
        }
        Update: {
          active_agents?: number | null
          avg_first_response_minutes?: number | null
          avg_rating?: number | null
          avg_resolution_minutes?: number | null
          closed_tickets?: number | null
          created_at?: string
          date?: string
          id?: string
          new_tickets?: number | null
          reopened_tickets?: number | null
          resolved_tickets?: number | null
          sla_compliance_rate?: number | null
          total_ratings?: number | null
          total_responses?: number | null
          total_tickets?: number | null
        }
        Relationships: []
      }
      support_ticket_attachments: {
        Row: {
          comment_id: string | null
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id: string
          mime_type: string | null
          ticket_id: string
          uploaded_at: string
          uploaded_by: string | null
        }
        Insert: {
          comment_id?: string | null
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id?: string
          mime_type?: string | null
          ticket_id: string
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Update: {
          comment_id?: string | null
          file_name?: string
          file_path?: string
          file_size?: number
          file_type?: string
          id?: string
          mime_type?: string | null
          ticket_id?: string
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_ticket_attachments_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "support_ticket_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_ticket_attachments_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_ticket_comments: {
        Row: {
          comment: string
          created_at: string
          edited_at: string | null
          id: string
          is_internal: boolean | null
          is_solution: boolean | null
          metadata: Json | null
          ticket_id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          comment: string
          created_at?: string
          edited_at?: string | null
          id?: string
          is_internal?: boolean | null
          is_solution?: boolean | null
          metadata?: Json | null
          ticket_id: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          comment?: string
          created_at?: string
          edited_at?: string | null
          id?: string
          is_internal?: boolean | null
          is_solution?: boolean | null
          metadata?: Json | null
          ticket_id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_ticket_comments_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_ticket_history: {
        Row: {
          change_reason: string | null
          changed_at: string
          changed_by: string | null
          field_name: string
          id: string
          new_value: string | null
          old_value: string | null
          ticket_id: string
        }
        Insert: {
          change_reason?: string | null
          changed_at?: string
          changed_by?: string | null
          field_name: string
          id?: string
          new_value?: string | null
          old_value?: string | null
          ticket_id: string
        }
        Update: {
          change_reason?: string | null
          changed_at?: string
          changed_by?: string | null
          field_name?: string
          id?: string
          new_value?: string | null
          old_value?: string | null
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_ticket_history_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_ticket_ratings: {
        Row: {
          feedback: string | null
          id: string
          rated_at: string
          rated_by: string | null
          rating: number
          response_speed_rating: number | null
          solution_quality_rating: number | null
          staff_friendliness_rating: number | null
          ticket_id: string
        }
        Insert: {
          feedback?: string | null
          id?: string
          rated_at?: string
          rated_by?: string | null
          rating: number
          response_speed_rating?: number | null
          solution_quality_rating?: number | null
          staff_friendliness_rating?: number | null
          ticket_id: string
        }
        Update: {
          feedback?: string | null
          id?: string
          rated_at?: string
          rated_by?: string | null
          rating?: number
          response_speed_rating?: number | null
          solution_quality_rating?: number | null
          staff_friendliness_rating?: number | null
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_ticket_ratings_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: true
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          assigned_to: string | null
          auto_assigned: boolean | null
          beneficiary_id: string | null
          category: string
          closed_at: string | null
          created_at: string
          description: string
          escalation_count: number | null
          first_response_at: string | null
          id: string
          is_overdue: boolean | null
          last_activity_at: string | null
          last_escalated_at: string | null
          metadata: Json | null
          priority: string
          reopened_count: number | null
          resolved_at: string | null
          response_count: number | null
          sla_due_at: string | null
          source: string
          status: string
          subject: string
          tags: string[] | null
          ticket_number: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          assigned_to?: string | null
          auto_assigned?: boolean | null
          beneficiary_id?: string | null
          category: string
          closed_at?: string | null
          created_at?: string
          description: string
          escalation_count?: number | null
          first_response_at?: string | null
          id?: string
          is_overdue?: boolean | null
          last_activity_at?: string | null
          last_escalated_at?: string | null
          metadata?: Json | null
          priority?: string
          reopened_count?: number | null
          resolved_at?: string | null
          response_count?: number | null
          sla_due_at?: string | null
          source?: string
          status?: string
          subject: string
          tags?: string[] | null
          ticket_number: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          assigned_to?: string | null
          auto_assigned?: boolean | null
          beneficiary_id?: string | null
          category?: string
          closed_at?: string | null
          created_at?: string
          description?: string
          escalation_count?: number | null
          first_response_at?: string | null
          id?: string
          is_overdue?: boolean | null
          last_activity_at?: string | null
          last_escalated_at?: string | null
          metadata?: Json | null
          priority?: string
          reopened_count?: number | null
          resolved_at?: string | null
          response_count?: number | null
          sla_due_at?: string | null
          source?: string
          status?: string
          subject?: string
          tags?: string[] | null
          ticket_number?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries_masked"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiary_account_statement"
            referencedColumns: ["beneficiary_id"]
          },
          {
            foreignKeyName: "support_tickets_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiary_statistics"
            referencedColumns: ["id"]
          },
        ]
      }
      system_alerts: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          alert_type: string
          created_at: string | null
          description: string
          id: string
          metadata: Json | null
          occurrence_count: number | null
          related_error_type: string | null
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          source: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_type: string
          created_at?: string | null
          description: string
          id?: string
          metadata?: Json | null
          occurrence_count?: number | null
          related_error_type?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity: string
          source?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_type?: string
          created_at?: string | null
          description?: string
          id?: string
          metadata?: Json | null
          occurrence_count?: number | null
          related_error_type?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          source?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      system_error_logs: {
        Row: {
          additional_data: Json | null
          created_at: string | null
          error_message: string
          error_stack: string | null
          error_type: string
          id: string
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          status: string | null
          url: string
          user_agent: string
          user_id: string | null
        }
        Insert: {
          additional_data?: Json | null
          created_at?: string | null
          error_message: string
          error_stack?: string | null
          error_type: string
          id?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity: string
          status?: string | null
          url: string
          user_agent: string
          user_id?: string | null
        }
        Update: {
          additional_data?: Json | null
          created_at?: string | null
          error_message?: string
          error_stack?: string | null
          error_type?: string
          id?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          status?: string | null
          url?: string
          user_agent?: string
          user_id?: string | null
        }
        Relationships: []
      }
      system_health_checks: {
        Row: {
          check_name: string
          check_type: string
          checked_at: string | null
          created_at: string | null
          details: Json | null
          error_message: string | null
          id: string
          response_time_ms: number | null
          status: string
        }
        Insert: {
          check_name: string
          check_type: string
          checked_at?: string | null
          created_at?: string | null
          details?: Json | null
          error_message?: string | null
          id?: string
          response_time_ms?: number | null
          status: string
        }
        Update: {
          check_name?: string
          check_type?: string
          checked_at?: string | null
          created_at?: string | null
          details?: Json | null
          error_message?: string | null
          id?: string
          response_time_ms?: number | null
          status?: string
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          setting_key: string
          setting_type: string | null
          setting_value: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          setting_key: string
          setting_type?: string | null
          setting_value: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          setting_key?: string
          setting_type?: string | null
          setting_value?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assigned_to: string | null
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string
          priority: string
          status: string
          task: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority: string
          status?: string
          task: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          status?: string
          task?: string
          updated_at?: string
        }
        Relationships: []
      }
      tenant_ledger: {
        Row: {
          balance: number | null
          contract_id: string | null
          created_at: string | null
          created_by: string | null
          credit_amount: number | null
          debit_amount: number | null
          description: string | null
          fiscal_year_id: string | null
          id: string
          property_id: string | null
          reference_id: string | null
          reference_number: string | null
          reference_type: string | null
          tenant_id: string
          transaction_date: string
          transaction_type: string
        }
        Insert: {
          balance?: number | null
          contract_id?: string | null
          created_at?: string | null
          created_by?: string | null
          credit_amount?: number | null
          debit_amount?: number | null
          description?: string | null
          fiscal_year_id?: string | null
          id?: string
          property_id?: string | null
          reference_id?: string | null
          reference_number?: string | null
          reference_type?: string | null
          tenant_id: string
          transaction_date?: string
          transaction_type: string
        }
        Update: {
          balance?: number | null
          contract_id?: string | null
          created_at?: string | null
          created_by?: string | null
          credit_amount?: number | null
          debit_amount?: number | null
          description?: string | null
          fiscal_year_id?: string | null
          id?: string
          property_id?: string | null
          reference_id?: string | null
          reference_number?: string | null
          reference_type?: string | null
          tenant_id?: string
          transaction_date?: string
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_ledger_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_ledger_fiscal_year_id_fkey"
            columns: ["fiscal_year_id"]
            isOneToOne: false
            referencedRelation: "financial_summary"
            referencedColumns: ["fiscal_year_id"]
          },
          {
            foreignKeyName: "tenant_ledger_fiscal_year_id_fkey"
            columns: ["fiscal_year_id"]
            isOneToOne: false
            referencedRelation: "fiscal_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_ledger_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_ledger_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_ledger_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "property_performance"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_ledger_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          read_at: string | null
          related_request_id: string | null
          tenant_id: string
          title: string
          type: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          read_at?: string | null
          related_request_id?: string | null
          tenant_id: string
          title: string
          type?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          read_at?: string | null
          related_request_id?: string | null
          tenant_id?: string
          title?: string
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenant_notifications_related_request_id_fkey"
            columns: ["related_request_id"]
            isOneToOne: false
            referencedRelation: "maintenance_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_notifications_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_otp_codes: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          is_used: boolean | null
          otp_code: string
          phone: string
          tenant_id: string | null
          verified_at: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          is_used?: boolean | null
          otp_code: string
          phone: string
          tenant_id?: string | null
          verified_at?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          is_used?: boolean | null
          otp_code?: string
          phone?: string
          tenant_id?: string | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenant_otp_codes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_sessions: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          ip_address: string | null
          last_activity_at: string | null
          session_token: string
          tenant_id: string
          user_agent: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          ip_address?: string | null
          last_activity_at?: string | null
          session_token: string
          tenant_id: string
          user_agent?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          ip_address?: string | null
          last_activity_at?: string | null
          session_token?: string
          tenant_id?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenant_sessions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          address: string | null
          city: string | null
          commercial_register: string | null
          created_at: string | null
          deleted_at: string | null
          deleted_by: string | null
          deletion_reason: string | null
          email: string | null
          full_name: string
          id: string
          id_number: string
          id_type: string | null
          national_address: string | null
          notes: string | null
          phone: string | null
          status: string | null
          tax_number: string | null
          tenant_number: string | null
          tenant_type: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          commercial_register?: string | null
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          email?: string | null
          full_name: string
          id?: string
          id_number: string
          id_type?: string | null
          national_address?: string | null
          notes?: string | null
          phone?: string | null
          status?: string | null
          tax_number?: string | null
          tenant_number?: string | null
          tenant_type?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          commercial_register?: string | null
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          email?: string | null
          full_name?: string
          id?: string
          id_number?: string
          id_type?: string | null
          national_address?: string | null
          notes?: string | null
          phone?: string | null
          status?: string | null
          tax_number?: string | null
          tenant_number?: string | null
          tenant_type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      test_runs: {
        Row: {
          avg_duration: number
          categories_summary: Json | null
          created_by: string | null
          failed_tests: number
          failed_tests_details: Json | null
          id: string
          notes: string | null
          pass_rate: number
          passed_tests: number
          run_date: string
          run_duration_seconds: number | null
          total_tests: number
          triggered_by: string | null
        }
        Insert: {
          avg_duration?: number
          categories_summary?: Json | null
          created_by?: string | null
          failed_tests?: number
          failed_tests_details?: Json | null
          id?: string
          notes?: string | null
          pass_rate?: number
          passed_tests?: number
          run_date?: string
          run_duration_seconds?: number | null
          total_tests?: number
          triggered_by?: string | null
        }
        Update: {
          avg_duration?: number
          categories_summary?: Json | null
          created_by?: string | null
          failed_tests?: number
          failed_tests_details?: Json | null
          id?: string
          notes?: string | null
          pass_rate?: number
          passed_tests?: number
          run_date?: string
          run_duration_seconds?: number | null
          total_tests?: number
          triggered_by?: string | null
        }
        Relationships: []
      }
      ticket_comments: {
        Row: {
          attachments: Json | null
          content: string
          created_at: string | null
          id: string
          is_internal: boolean | null
          ticket_id: string | null
          updated_at: string | null
          user_id: string | null
          user_name: string | null
        }
        Insert: {
          attachments?: Json | null
          content: string
          created_at?: string | null
          id?: string
          is_internal?: boolean | null
          ticket_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Update: {
          attachments?: Json | null
          content?: string
          created_at?: string | null
          id?: string
          is_internal?: boolean | null
          ticket_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ticket_comments_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      translations: {
        Row: {
          ar: string
          created_at: string | null
          en: string | null
          fr: string | null
          id: string
          key: string
          updated_at: string | null
        }
        Insert: {
          ar: string
          created_at?: string | null
          en?: string | null
          fr?: string | null
          id?: string
          key: string
          updated_at?: string | null
        }
        Update: {
          ar?: string
          created_at?: string | null
          en?: string | null
          fr?: string | null
          id?: string
          key?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      tribes: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          deleted_by: string | null
          deletion_reason: string | null
          description: string | null
          id: string
          name: string
          total_beneficiaries: number | null
          total_families: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          description?: string | null
          id?: string
          name: string
          total_beneficiaries?: number | null
          total_families?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          description?: string | null
          id?: string
          name?: string
          total_beneficiaries?: number | null
          total_families?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      two_factor_auth: {
        Row: {
          backup_codes: string[] | null
          created_at: string | null
          id: string
          is_enabled: boolean | null
          last_used_at: string | null
          method: string | null
          phone_number: string | null
          secret: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          backup_codes?: string[] | null
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          last_used_at?: string | null
          method?: string | null
          phone_number?: string | null
          secret: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          backup_codes?: string[] | null
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          last_used_at?: string | null
          method?: string | null
          phone_number?: string | null
          secret?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      two_factor_secrets: {
        Row: {
          backup_codes: string[]
          created_at: string | null
          enabled: boolean | null
          id: string
          secret: string
          updated_at: string | null
          user_id: string
          verified_at: string | null
        }
        Insert: {
          backup_codes: string[]
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          secret: string
          updated_at?: string | null
          user_id: string
          verified_at?: string | null
        }
        Update: {
          backup_codes?: string[]
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          secret?: string
          updated_at?: string | null
          user_id?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      unit_handovers: {
        Row: {
          access_cards_count: number | null
          cleanliness: string | null
          condition_notes: string | null
          contract_id: string
          created_at: string | null
          created_by: string | null
          created_by_name: string | null
          damages: Json | null
          deleted_at: string | null
          deleted_by: string | null
          deletion_reason: string | null
          electricity_meter_reading: number | null
          gas_meter_reading: number | null
          general_condition: string | null
          handover_date: string
          handover_type: string
          id: string
          keys_count: number | null
          landlord_signature: string | null
          landlord_signed_at: string | null
          notes: string | null
          parking_cards_count: number | null
          photos: string[] | null
          remote_controls_count: number | null
          tenant_signature: string | null
          tenant_signed_at: string | null
          unit_id: string | null
          updated_at: string | null
          water_meter_reading: number | null
          witness_name: string | null
          witness_signature: string | null
        }
        Insert: {
          access_cards_count?: number | null
          cleanliness?: string | null
          condition_notes?: string | null
          contract_id: string
          created_at?: string | null
          created_by?: string | null
          created_by_name?: string | null
          damages?: Json | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          electricity_meter_reading?: number | null
          gas_meter_reading?: number | null
          general_condition?: string | null
          handover_date?: string
          handover_type: string
          id?: string
          keys_count?: number | null
          landlord_signature?: string | null
          landlord_signed_at?: string | null
          notes?: string | null
          parking_cards_count?: number | null
          photos?: string[] | null
          remote_controls_count?: number | null
          tenant_signature?: string | null
          tenant_signed_at?: string | null
          unit_id?: string | null
          updated_at?: string | null
          water_meter_reading?: number | null
          witness_name?: string | null
          witness_signature?: string | null
        }
        Update: {
          access_cards_count?: number | null
          cleanliness?: string | null
          condition_notes?: string | null
          contract_id?: string
          created_at?: string | null
          created_by?: string | null
          created_by_name?: string | null
          damages?: Json | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          electricity_meter_reading?: number | null
          gas_meter_reading?: number | null
          general_condition?: string | null
          handover_date?: string
          handover_type?: string
          id?: string
          keys_count?: number | null
          landlord_signature?: string | null
          landlord_signed_at?: string | null
          notes?: string | null
          parking_cards_count?: number | null
          photos?: string[] | null
          remote_controls_count?: number | null
          tenant_signature?: string | null
          tenant_signed_at?: string | null
          unit_id?: string | null
          updated_at?: string | null
          water_meter_reading?: number | null
          witness_name?: string | null
          witness_signature?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "unit_handovers_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "unit_handovers_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "property_units"
            referencedColumns: ["id"]
          },
        ]
      }
      user_permissions: {
        Row: {
          expires_at: string | null
          granted: boolean | null
          granted_at: string | null
          granted_by: string | null
          id: string
          permission_key: string
          user_id: string | null
        }
        Insert: {
          expires_at?: string | null
          granted?: boolean | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          permission_key: string
          user_id?: string | null
        }
        Update: {
          expires_at?: string | null
          granted?: boolean | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          permission_key?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_permissions_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_permissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      user_roles_audit: {
        Row: {
          action: string
          changed_at: string
          changed_by: string | null
          changed_by_name: string | null
          id: string
          notes: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          action: string
          changed_at?: string
          changed_by?: string | null
          changed_by_name?: string | null
          id?: string
          notes?: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          action?: string
          changed_at?: string
          changed_by?: string | null
          changed_by_name?: string | null
          id?: string
          notes?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          created_at: string | null
          device_info: Json | null
          ended_at: string | null
          id: string
          ip_address: string | null
          is_active: boolean | null
          last_activity_at: string | null
          session_token: string
          started_at: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          device_info?: Json | null
          ended_at?: string | null
          id?: string
          ip_address?: string | null
          is_active?: boolean | null
          last_activity_at?: string | null
          session_token: string
          started_at?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          device_info?: Json | null
          ended_at?: string | null
          id?: string
          ip_address?: string | null
          is_active?: boolean | null
          last_activity_at?: string | null
          session_token?: string
          started_at?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      users_profiles_cache: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string | null
          is_active: boolean | null
          last_login_at: string | null
          last_sign_in_at: string | null
          phone: string | null
          position: string | null
          roles: Json | null
          updated_at: string | null
          user_created_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          is_active?: boolean | null
          last_login_at?: string | null
          last_sign_in_at?: string | null
          phone?: string | null
          position?: string | null
          roles?: Json | null
          updated_at?: string | null
          user_created_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          is_active?: boolean | null
          last_login_at?: string | null
          last_sign_in_at?: string | null
          phone?: string | null
          position?: string | null
          roles?: Json | null
          updated_at?: string | null
          user_created_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      voting_delegations: {
        Row: {
          created_at: string | null
          decision_id: string | null
          delegate_id: string | null
          delegate_name: string
          delegated_at: string | null
          delegation_reason: string | null
          delegator_id: string | null
          delegator_name: string
          id: string
          is_active: boolean | null
        }
        Insert: {
          created_at?: string | null
          decision_id?: string | null
          delegate_id?: string | null
          delegate_name: string
          delegated_at?: string | null
          delegation_reason?: string | null
          delegator_id?: string | null
          delegator_name: string
          id?: string
          is_active?: boolean | null
        }
        Update: {
          created_at?: string | null
          decision_id?: string | null
          delegate_id?: string | null
          delegate_name?: string
          delegated_at?: string | null
          delegation_reason?: string | null
          delegator_id?: string | null
          delegator_name?: string
          id?: string
          is_active?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "voting_delegations_decision_id_fkey"
            columns: ["decision_id"]
            isOneToOne: false
            referencedRelation: "governance_decisions"
            referencedColumns: ["id"]
          },
        ]
      }
      waqf_branding: {
        Row: {
          created_at: string | null
          id: string
          nazer_name: string | null
          show_logo_in_pdf: boolean | null
          show_stamp_in_pdf: boolean | null
          signature_image_url: string | null
          stamp_image_url: string | null
          updated_at: string | null
          updated_by: string | null
          waqf_logo_url: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          nazer_name?: string | null
          show_logo_in_pdf?: boolean | null
          show_stamp_in_pdf?: boolean | null
          signature_image_url?: string | null
          stamp_image_url?: string | null
          updated_at?: string | null
          updated_by?: string | null
          waqf_logo_url?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          nazer_name?: string | null
          show_logo_in_pdf?: boolean | null
          show_stamp_in_pdf?: boolean | null
          signature_image_url?: string | null
          stamp_image_url?: string | null
          updated_at?: string | null
          updated_by?: string | null
          waqf_logo_url?: string | null
        }
        Relationships: []
      }
      waqf_distribution_settings: {
        Row: {
          auto_distribution: boolean | null
          calculation_order: string | null
          created_at: string | null
          distribution_day_of_month: number | null
          distribution_frequency: string | null
          distribution_months: number[] | null
          distribution_rule: string | null
          id: string
          is_active: boolean | null
          maintenance_percentage: number | null
          nazer_percentage: number | null
          notify_beneficiaries: boolean | null
          notify_nazer: boolean | null
          reserve_percentage: number | null
          updated_at: string | null
          waqf_corpus_percentage: number | null
          waqf_unit_id: string | null
          waqif_charity_percentage: number | null
          wives_share_ratio: number | null
        }
        Insert: {
          auto_distribution?: boolean | null
          calculation_order?: string | null
          created_at?: string | null
          distribution_day_of_month?: number | null
          distribution_frequency?: string | null
          distribution_months?: number[] | null
          distribution_rule?: string | null
          id?: string
          is_active?: boolean | null
          maintenance_percentage?: number | null
          nazer_percentage?: number | null
          notify_beneficiaries?: boolean | null
          notify_nazer?: boolean | null
          reserve_percentage?: number | null
          updated_at?: string | null
          waqf_corpus_percentage?: number | null
          waqf_unit_id?: string | null
          waqif_charity_percentage?: number | null
          wives_share_ratio?: number | null
        }
        Update: {
          auto_distribution?: boolean | null
          calculation_order?: string | null
          created_at?: string | null
          distribution_day_of_month?: number | null
          distribution_frequency?: string | null
          distribution_months?: number[] | null
          distribution_rule?: string | null
          id?: string
          is_active?: boolean | null
          maintenance_percentage?: number | null
          nazer_percentage?: number | null
          notify_beneficiaries?: boolean | null
          notify_nazer?: boolean | null
          reserve_percentage?: number | null
          updated_at?: string | null
          waqf_corpus_percentage?: number | null
          waqf_unit_id?: string | null
          waqif_charity_percentage?: number | null
          wives_share_ratio?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "waqf_distribution_settings_waqf_unit_id_fkey"
            columns: ["waqf_unit_id"]
            isOneToOne: false
            referencedRelation: "waqf_units"
            referencedColumns: ["id"]
          },
        ]
      }
      waqf_governance_config: {
        Row: {
          config_key: string
          config_value: Json
          created_at: string
          description_ar: string | null
          description_en: string | null
          id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          config_key: string
          config_value: Json
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          config_key?: string
          config_value?: Json
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      waqf_nazers: {
        Row: {
          address: string | null
          appointment_date: string
          appointment_decree: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          is_primary: boolean | null
          national_id: string | null
          nazer_name: string
          nazer_title: string | null
          notes: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          appointment_date: string
          appointment_decree?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_primary?: boolean | null
          national_id?: string | null
          nazer_name: string
          nazer_title?: string | null
          notes?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          appointment_date?: string
          appointment_decree?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_primary?: boolean | null
          national_id?: string | null
          nazer_name?: string
          nazer_title?: string | null
          notes?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      waqf_reserves: {
        Row: {
          amount: number
          created_at: string | null
          current_balance: number
          distribution_id: string | null
          fiscal_year_id: string | null
          id: string
          reserve_type: string
          updated_at: string | null
        }
        Insert: {
          amount?: number
          created_at?: string | null
          current_balance?: number
          distribution_id?: string | null
          fiscal_year_id?: string | null
          id?: string
          reserve_type: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          current_balance?: number
          distribution_id?: string | null
          fiscal_year_id?: string | null
          id?: string
          reserve_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "waqf_reserves_distribution_id_fkey"
            columns: ["distribution_id"]
            isOneToOne: false
            referencedRelation: "distribution_statistics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waqf_reserves_distribution_id_fkey"
            columns: ["distribution_id"]
            isOneToOne: false
            referencedRelation: "distributions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waqf_reserves_distribution_id_fkey"
            columns: ["distribution_id"]
            isOneToOne: false
            referencedRelation: "distributions_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waqf_reserves_distribution_id_fkey"
            columns: ["distribution_id"]
            isOneToOne: false
            referencedRelation: "payment_vouchers_with_details"
            referencedColumns: ["distribution_id_ref"]
          },
          {
            foreignKeyName: "waqf_reserves_fiscal_year_id_fkey"
            columns: ["fiscal_year_id"]
            isOneToOne: false
            referencedRelation: "financial_summary"
            referencedColumns: ["fiscal_year_id"]
          },
          {
            foreignKeyName: "waqf_reserves_fiscal_year_id_fkey"
            columns: ["fiscal_year_id"]
            isOneToOne: false
            referencedRelation: "fiscal_years"
            referencedColumns: ["id"]
          },
        ]
      }
      waqf_units: {
        Row: {
          acquisition_date: string | null
          acquisition_value: number | null
          annual_return: number | null
          code: string
          created_at: string
          current_balance: number | null
          current_value: number | null
          deleted_at: string | null
          deleted_by: string | null
          deletion_reason: string | null
          description: string | null
          documents: Json | null
          id: string
          is_active: boolean | null
          location: string | null
          name: string
          notes: string | null
          total_expenses: number | null
          total_income: number | null
          updated_at: string
          waqf_type: string | null
        }
        Insert: {
          acquisition_date?: string | null
          acquisition_value?: number | null
          annual_return?: number | null
          code: string
          created_at?: string
          current_balance?: number | null
          current_value?: number | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          description?: string | null
          documents?: Json | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          name: string
          notes?: string | null
          total_expenses?: number | null
          total_income?: number | null
          updated_at?: string
          waqf_type?: string | null
        }
        Update: {
          acquisition_date?: string | null
          acquisition_value?: number | null
          annual_return?: number | null
          code?: string
          created_at?: string
          current_balance?: number | null
          current_value?: number | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          description?: string | null
          documents?: Json | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          name?: string
          notes?: string | null
          total_expenses?: number | null
          total_income?: number | null
          updated_at?: string
          waqf_type?: string | null
        }
        Relationships: []
      }
      webauthn_credentials: {
        Row: {
          counter: number | null
          created_at: string | null
          credential_id: string
          device_name: string | null
          device_type: string | null
          id: string
          last_used_at: string | null
          public_key: string
          user_id: string
        }
        Insert: {
          counter?: number | null
          created_at?: string | null
          credential_id: string
          device_name?: string | null
          device_type?: string | null
          id?: string
          last_used_at?: string | null
          public_key: string
          user_id: string
        }
        Update: {
          counter?: number | null
          created_at?: string | null
          credential_id?: string
          device_name?: string | null
          device_type?: string | null
          id?: string
          last_used_at?: string | null
          public_key?: string
          user_id?: string
        }
        Relationships: []
      }
      zatca_submission_log: {
        Row: {
          error_code: string | null
          error_message: string | null
          id: string
          invoice_id: string | null
          request_payload: Json | null
          response_payload: Json | null
          status: string
          submission_type: string
          submitted_at: string | null
        }
        Insert: {
          error_code?: string | null
          error_message?: string | null
          id?: string
          invoice_id?: string | null
          request_payload?: Json | null
          response_payload?: Json | null
          status: string
          submission_type: string
          submitted_at?: string | null
        }
        Update: {
          error_code?: string | null
          error_message?: string | null
          id?: string
          invoice_id?: string | null
          request_payload?: Json | null
          response_payload?: Json | null
          status?: string
          submission_type?: string
          submitted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "zatca_submission_log_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "zatca_submission_log_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices_summary"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      accounts_hierarchy: {
        Row: {
          account_nature: Database["public"]["Enums"]["account_nature"] | null
          account_type: Database["public"]["Enums"]["account_type"] | null
          code: string | null
          created_at: string | null
          current_balance: number | null
          description: string | null
          id: string | null
          is_active: boolean | null
          is_header: boolean | null
          name_ar: string | null
          name_en: string | null
          parent_code: string | null
          parent_id: string | null
          parent_name: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "accounts_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "accounts_hierarchy"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "general_ledger"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "accounts_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "trial_balance"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "accounts_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "waqf_balance_summary"
            referencedColumns: ["account_id"]
          },
        ]
      }
      active_loans_summary: {
        Row: {
          beneficiary_name: string | null
          id: string | null
          loan_amount: number | null
          loan_number: string | null
          monthly_installment: number | null
          next_due_date: string | null
          paid_amount: number | null
          pending_installments: number | null
          remaining_balance: number | null
          status: string | null
        }
        Relationships: []
      }
      audit_logs_summary: {
        Row: {
          action_type: string | null
          action_type_ar: string | null
          created_at: string | null
          description: string | null
          id: string | null
          record_id: string | null
          severity: string | null
          severity_ar: string | null
          table_name: string | null
          user_email: string | null
          user_role: string | null
        }
        Insert: {
          action_type?: string | null
          action_type_ar?: never
          created_at?: string | null
          description?: string | null
          id?: string | null
          record_id?: string | null
          severity?: string | null
          severity_ar?: never
          table_name?: string | null
          user_email?: string | null
          user_role?: string | null
        }
        Update: {
          action_type?: string | null
          action_type_ar?: never
          created_at?: string | null
          description?: string | null
          id?: string | null
          record_id?: string | null
          severity?: string | null
          severity_ar?: never
          table_name?: string | null
          user_email?: string | null
          user_role?: string | null
        }
        Relationships: []
      }
      beneficiaries_by_category: {
        Row: {
          active_count: number | null
          avg_received: number | null
          category: string | null
          total_count: number | null
          total_received: number | null
        }
        Relationships: []
      }
      beneficiaries_masked: {
        Row: {
          beneficiary_number: string | null
          category: string | null
          family_id: string | null
          full_name_masked: string | null
          id: string | null
          national_id_masked: string | null
          status: string | null
        }
        Insert: {
          beneficiary_number?: string | null
          category?: string | null
          family_id?: string | null
          full_name_masked?: never
          id?: string | null
          national_id_masked?: never
          status?: string | null
        }
        Update: {
          beneficiary_number?: string | null
          category?: string | null
          family_id?: string | null
          full_name_masked?: never
          id?: string | null
          national_id_masked?: never
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "beneficiaries_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      beneficiaries_overview: {
        Row: {
          account_balance: number | null
          beneficiary_number: string | null
          category: string | null
          created_at: string | null
          family_id: string | null
          family_name: string | null
          full_name: string | null
          id: string | null
          status: string | null
          total_received: number | null
        }
        Relationships: [
          {
            foreignKeyName: "beneficiaries_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      beneficiary_account_statement: {
        Row: {
          account_balance: number | null
          beneficiary_id: string | null
          full_name: string | null
          national_id: string | null
          pending_amount: number | null
          total_received: number | null
        }
        Insert: {
          account_balance?: never
          beneficiary_id?: string | null
          full_name?: string | null
          national_id?: string | null
          pending_amount?: never
          total_received?: never
        }
        Update: {
          account_balance?: never
          beneficiary_id?: string | null
          full_name?: string | null
          national_id?: string | null
          pending_amount?: never
          total_received?: never
        }
        Relationships: []
      }
      beneficiary_statistics: {
        Row: {
          account_balance: number | null
          category: string | null
          full_name: string | null
          id: string | null
          status: string | null
          total_payments: number | null
          total_received: number | null
        }
        Insert: {
          account_balance?: never
          category?: string | null
          full_name?: string | null
          id?: string | null
          status?: string | null
          total_payments?: never
          total_received?: never
        }
        Update: {
          account_balance?: never
          category?: string | null
          full_name?: string | null
          id?: string | null
          status?: string | null
          total_payments?: never
          total_received?: never
        }
        Relationships: []
      }
      distribution_statistics: {
        Row: {
          beneficiaries_count: number | null
          distribution_date: string | null
          id: string | null
          status: string | null
          total_amount: number | null
          total_distributed: number | null
        }
        Relationships: []
      }
      distributions_summary: {
        Row: {
          beneficiaries_count: number | null
          created_at: string | null
          distribution_date: string | null
          distribution_type: string | null
          id: string | null
          month: string | null
          status: string | null
          total_amount: number | null
          waqf_name: string | null
        }
        Insert: {
          beneficiaries_count?: number | null
          created_at?: string | null
          distribution_date?: string | null
          distribution_type?: string | null
          id?: string | null
          month?: string | null
          status?: string | null
          total_amount?: number | null
          waqf_name?: string | null
        }
        Update: {
          beneficiaries_count?: number | null
          created_at?: string | null
          distribution_date?: string | null
          distribution_type?: string | null
          id?: string | null
          month?: string | null
          status?: string | null
          total_amount?: number | null
          waqf_name?: string | null
        }
        Relationships: []
      }
      documents_with_links: {
        Row: {
          beneficiary_id: string | null
          beneficiary_name: string | null
          category: string | null
          contract_id: string | null
          contract_number: string | null
          contract_tenant_name: string | null
          created_at: string | null
          description: string | null
          file_path: string | null
          file_size: string | null
          file_size_bytes: number | null
          file_type: string | null
          folder_id: string | null
          id: string | null
          maintenance_request_id: string | null
          maintenance_request_number: string | null
          name: string | null
          payment_voucher_id: string | null
          property_id: string | null
          property_name: string | null
          reference_id: string | null
          reference_type: string | null
          storage_path: string | null
          tenant_id: string | null
          tenant_name: string | null
          uploaded_at: string | null
          voucher_number: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries_masked"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiary_account_statement"
            referencedColumns: ["beneficiary_id"]
          },
          {
            foreignKeyName: "documents_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiary_statistics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_maintenance_request_id_fkey"
            columns: ["maintenance_request_id"]
            isOneToOne: false
            referencedRelation: "maintenance_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_payment_voucher_id_fkey"
            columns: ["payment_voucher_id"]
            isOneToOne: false
            referencedRelation: "payment_vouchers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_payment_voucher_id_fkey"
            columns: ["payment_voucher_id"]
            isOneToOne: false
            referencedRelation: "payment_vouchers_masked"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_payment_voucher_id_fkey"
            columns: ["payment_voucher_id"]
            isOneToOne: false
            referencedRelation: "payment_vouchers_with_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "property_performance"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_alerts: {
        Row: {
          alert_date: string | null
          alert_title: string | null
          alert_type: string | null
          reference: string | null
          related_entity: string | null
        }
        Relationships: []
      }
      financial_summary: {
        Row: {
          collection_percentage: number | null
          end_date: string | null
          fiscal_year_id: string | null
          fiscal_year_name: string | null
          fiscal_year_status: string | null
          is_active: boolean | null
          is_closed: boolean | null
          pending_amount: number | null
          pos_transaction_count: number | null
          rental_transaction_count: number | null
          start_date: string | null
          total_collected: number | null
          total_expected_revenue: number | null
          total_pos_collected: number | null
          total_rental_collected: number | null
        }
        Relationships: []
      }
      general_ledger: {
        Row: {
          account_code: string | null
          account_id: string | null
          account_name: string | null
          account_type: Database["public"]["Enums"]["account_type"] | null
          credit_amount: number | null
          debit_amount: number | null
          entry_date: string | null
          entry_description: string | null
          entry_id: string | null
          entry_number: string | null
          line_description: string | null
          status: Database["public"]["Enums"]["entry_status"] | null
        }
        Relationships: []
      }
      historical_rental_monthly_summary: {
        Row: {
          fiscal_year_closing_id: string | null
          month_date: string | null
          month_label: string | null
          month_year: string | null
          paid_amount: number | null
          paid_count: number | null
          total_collected: number | null
          total_units: number | null
          unpaid_count: number | null
          vacant_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: "historical_rental_details_fiscal_year_closing_id_fkey"
            columns: ["fiscal_year_closing_id"]
            isOneToOne: false
            referencedRelation: "fiscal_year_closings"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices_summary: {
        Row: {
          customer_name: string | null
          id: string | null
          invoice_date: string | null
          invoice_number: string | null
          invoice_type: string | null
          is_zatca_compliant: boolean | null
          lines_count: number | null
          status: string | null
          tax_amount: number | null
          total_amount: number | null
        }
        Insert: {
          customer_name?: string | null
          id?: string | null
          invoice_date?: string | null
          invoice_number?: string | null
          invoice_type?: string | null
          is_zatca_compliant?: boolean | null
          lines_count?: never
          status?: string | null
          tax_amount?: number | null
          total_amount?: number | null
        }
        Update: {
          customer_name?: string | null
          id?: string | null
          invoice_date?: string | null
          invoice_number?: string | null
          invoice_type?: string | null
          is_zatca_compliant?: boolean | null
          lines_count?: never
          status?: string | null
          tax_amount?: number | null
          total_amount?: number | null
        }
        Relationships: []
      }
      journal_entries_with_lines: {
        Row: {
          description: string | null
          entry_date: string | null
          entry_number: string | null
          fiscal_year: string | null
          id: string | null
          lines_count: number | null
          reference_id: string | null
          reference_type: string | null
          status: Database["public"]["Enums"]["entry_status"] | null
          total_credit: number | null
          total_debit: number | null
        }
        Relationships: []
      }
      loans_summary: {
        Row: {
          beneficiary_id: string | null
          beneficiary_name: string | null
          created_at: string | null
          end_date: string | null
          id: string | null
          loan_number: string | null
          monthly_installment: number | null
          principal_amount: number | null
          remaining_balance: number | null
          start_date: string | null
          status: string | null
        }
        Relationships: [
          {
            foreignKeyName: "loans_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loans_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries_masked"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loans_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loans_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiary_account_statement"
            referencedColumns: ["beneficiary_id"]
          },
          {
            foreignKeyName: "loans_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiary_statistics"
            referencedColumns: ["id"]
          },
        ]
      }
      messages_with_users: {
        Row: {
          body: string | null
          created_at: string | null
          id: string | null
          is_read: boolean | null
          parent_message_id: string | null
          priority: string | null
          read_at: string | null
          receiver_id: string | null
          receiver_name: string | null
          receiver_number: string | null
          request_id: string | null
          sender_id: string | null
          sender_name: string | null
          sender_number: string | null
          subject: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "internal_messages_parent_message_id_fkey"
            columns: ["parent_message_id"]
            isOneToOne: false
            referencedRelation: "internal_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "internal_messages_parent_message_id_fkey"
            columns: ["parent_message_id"]
            isOneToOne: false
            referencedRelation: "messages_with_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "internal_messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "internal_messages_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "beneficiary_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "internal_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      monthly_financial_summary: {
        Row: {
          entries_count: number | null
          month: string | null
          total_credits: number | null
          total_debits: number | null
        }
        Relationships: []
      }
      payment_vouchers_masked: {
        Row: {
          amount: number | null
          created_at: string | null
          id: string | null
          payee_name_masked: string | null
          payment_method: string | null
          status: string | null
          voucher_date: string | null
          voucher_number: string | null
        }
        Relationships: []
      }
      payment_vouchers_with_details: {
        Row: {
          amount: number | null
          approved_at: string | null
          approved_by: string | null
          attachments: Json | null
          bank_account_id: string | null
          bank_transfer_file_number: string | null
          bank_transfer_status: string | null
          beneficiary_id: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          distribution_date: string | null
          distribution_id: string | null
          distribution_id_ref: string | null
          id: string | null
          journal_entry_id: string | null
          metadata: Json | null
          notes: string | null
          paid_at: string | null
          paid_by: string | null
          payment_id: string | null
          payment_method: string | null
          reference_number: string | null
          status: string | null
          updated_at: string | null
          voucher_number: string | null
          voucher_type: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_vouchers_bank_account_id_fkey"
            columns: ["bank_account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_vouchers_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_vouchers_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries_masked"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_vouchers_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_vouchers_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiary_account_statement"
            referencedColumns: ["beneficiary_id"]
          },
          {
            foreignKeyName: "payment_vouchers_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiary_statistics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_vouchers_distribution_id_fkey"
            columns: ["distribution_id"]
            isOneToOne: false
            referencedRelation: "distribution_statistics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_vouchers_distribution_id_fkey"
            columns: ["distribution_id"]
            isOneToOne: false
            referencedRelation: "distributions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_vouchers_distribution_id_fkey"
            columns: ["distribution_id"]
            isOneToOne: false
            referencedRelation: "distributions_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_vouchers_distribution_id_fkey"
            columns: ["distribution_id"]
            isOneToOne: false
            referencedRelation: "payment_vouchers_with_details"
            referencedColumns: ["distribution_id_ref"]
          },
          {
            foreignKeyName: "payment_vouchers_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "general_ledger"
            referencedColumns: ["entry_id"]
          },
          {
            foreignKeyName: "payment_vouchers_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_vouchers_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries_with_lines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_vouchers_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_vouchers_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments_with_contract_details"
            referencedColumns: ["id"]
          },
        ]
      }
      payments_with_contract_details: {
        Row: {
          amount: number | null
          beneficiary_id: string | null
          contract_id: string | null
          contract_number: string | null
          created_at: string | null
          description: string | null
          id: string | null
          journal_entry_id: string | null
          notes: string | null
          payer_name: string | null
          payment_date: string | null
          payment_method: string | null
          payment_number: string | null
          payment_type: string | null
          property_location: string | null
          property_name: string | null
          property_type: string | null
          reference_number: string | null
          rental_payment_id: string | null
          status: string | null
          tenant_id_number: string | null
          tenant_name: string | null
          tenant_phone: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries_masked"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiary_account_statement"
            referencedColumns: ["beneficiary_id"]
          },
          {
            foreignKeyName: "payments_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiary_statistics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "general_ledger"
            referencedColumns: ["entry_id"]
          },
          {
            foreignKeyName: "payments_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries_with_lines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_rental_payment_id_fkey"
            columns: ["rental_payment_id"]
            isOneToOne: false
            referencedRelation: "rental_payments"
            referencedColumns: ["id"]
          },
        ]
      }
      pending_approvals_view: {
        Row: {
          created_at: string | null
          current_level: number | null
          entity_id: string | null
          entity_type: string | null
          id: string | null
          status: string | null
          total_levels: number | null
          workflow_name: string | null
        }
        Relationships: []
      }
      properties_overview: {
        Row: {
          created_at: string | null
          id: string | null
          location: string | null
          monthly_revenue: number | null
          occupied_units: number | null
          property_name: string | null
          property_type: string | null
          status: string | null
          total_units: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string | null
          location?: string | null
          monthly_revenue?: number | null
          occupied_units?: number | null
          property_name?: string | null
          property_type?: string | null
          status?: string | null
          total_units?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string | null
          location?: string | null
          monthly_revenue?: number | null
          occupied_units?: number | null
          property_name?: string | null
          property_type?: string | null
          status?: string | null
          total_units?: number | null
        }
        Relationships: []
      }
      property_performance: {
        Row: {
          active_contracts_count: number | null
          contracted_monthly_revenue: number | null
          current_monthly_revenue: number | null
          id: string | null
          name: string | null
          occupancy_rate: number | null
          occupied_units: number | null
          pending_maintenance: number | null
          total_units: number | null
          type: string | null
        }
        Insert: {
          active_contracts_count?: never
          contracted_monthly_revenue?: never
          current_monthly_revenue?: never
          id?: string | null
          name?: string | null
          occupancy_rate?: never
          occupied_units?: number | null
          pending_maintenance?: never
          total_units?: number | null
          type?: string | null
        }
        Update: {
          active_contracts_count?: never
          contracted_monthly_revenue?: never
          current_monthly_revenue?: never
          id?: string | null
          name?: string | null
          occupancy_rate?: never
          occupied_units?: number | null
          pending_maintenance?: never
          total_units?: number | null
          type?: string | null
        }
        Relationships: []
      }
      recent_activities: {
        Row: {
          action: string | null
          created_at: string | null
          id: string | null
          timestamp: string | null
          user_name: string | null
        }
        Relationships: []
      }
      trial_balance: {
        Row: {
          account_id: string | null
          account_nature: Database["public"]["Enums"]["account_nature"] | null
          account_type: Database["public"]["Enums"]["account_type"] | null
          balance: number | null
          code: string | null
          name_ar: string | null
          total_credit: number | null
          total_debit: number | null
        }
        Relationships: []
      }
      unified_revenue: {
        Row: {
          amount: number | null
          category: string | null
          created_at: string | null
          payer_name: string | null
          payment_method: string | null
          property_id: string | null
          property_name: string | null
          revenue_type: string | null
          source_id: string | null
          source_type: string | null
          status: string | null
          transaction_date: string | null
          unit_number: string | null
        }
        Relationships: []
      }
      unified_transactions_view: {
        Row: {
          amount: number | null
          created_at: string | null
          description: string | null
          id: string | null
          reference_number: string | null
          status: string | null
          transaction_date: string | null
          transaction_type: string | null
        }
        Relationships: []
      }
      unmatched_bank_transactions: {
        Row: {
          account_number: string | null
          amount: number | null
          bank_account_id: string | null
          bank_name: string | null
          description: string | null
          id: string | null
          is_matched: boolean | null
          reference_number: string | null
          statement_id: string | null
          transaction_date: string | null
          transaction_type: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bank_statements_bank_account_id_fkey"
            columns: ["bank_account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bank_transactions_statement_id_fkey"
            columns: ["statement_id"]
            isOneToOne: false
            referencedRelation: "bank_statements"
            referencedColumns: ["id"]
          },
        ]
      }
      waqf_balance_summary: {
        Row: {
          account_id: string | null
          account_nature: Database["public"]["Enums"]["account_nature"] | null
          account_type: Database["public"]["Enums"]["account_type"] | null
          code: string | null
          current_balance: number | null
          name_ar: string | null
        }
        Insert: {
          account_id?: string | null
          account_nature?: Database["public"]["Enums"]["account_nature"] | null
          account_type?: Database["public"]["Enums"]["account_type"] | null
          code?: string | null
          current_balance?: number | null
          name_ar?: string | null
        }
        Update: {
          account_id?: string | null
          account_nature?: Database["public"]["Enums"]["account_nature"] | null
          account_type?: Database["public"]["Enums"]["account_type"] | null
          code?: string | null
          current_balance?: number | null
          name_ar?: string | null
        }
        Relationships: []
      }
      waqf_branding_public: {
        Row: {
          created_at: string | null
          id: string | null
          nazer_name: string | null
          show_logo_in_pdf: boolean | null
          updated_at: string | null
          waqf_logo_url: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string | null
          nazer_name?: string | null
          show_logo_in_pdf?: boolean | null
          updated_at?: string | null
          waqf_logo_url?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string | null
          nazer_name?: string | null
          show_logo_in_pdf?: boolean | null
          updated_at?: string | null
          waqf_logo_url?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      analyze_table: { Args: { p_table_name: string }; Returns: undefined }
      archive_old_audit_logs: { Args: { months_old?: number }; Returns: number }
      archive_old_notifications: { Args: never; Returns: number }
      assign_user_role: {
        Args: {
          p_email: string
          p_role: Database["public"]["Enums"]["app_role"]
        }
        Returns: undefined
      }
      auto_assess_eligibility: {
        Args: { p_beneficiary_id: string }
        Returns: Json
      }
      auto_create_distribution_journal_entry: {
        Args: { p_distribution_id: string }
        Returns: string
      }
      auto_deduct_loan_installments: {
        Args: { p_distribution_id: string }
        Returns: {
          beneficiary_id: string
          deducted_amount: number
          final_amount: number
          installments_paid: number
          original_amount: number
        }[]
      }
      auto_escalate_overdue_tickets: { Args: never; Returns: undefined }
      auto_repair_missing_rls: {
        Args: never
        Returns: {
          action_taken: string
          table_name: string
        }[]
      }
      auto_update_expired_contracts: { Args: never; Returns: undefined }
      cache_user_roles: { Args: never; Returns: undefined }
      calculate_account_balance: {
        Args: { account_uuid: string }
        Returns: number
      }
      calculate_beneficiary_balance: {
        Args: { p_beneficiary_id: string }
        Returns: number
      }
      calculate_disclosure_balances: {
        Args: {
          p_fiscal_year_id: string
          p_period_end: string
          p_period_start: string
        }
        Returns: {
          administrative_expenses: number
          closing_balance: number
          development_expenses: number
          maintenance_expenses: number
          opening_balance: number
          other_expenses: number
          total_expenses: number
          total_revenues: number
        }[]
      }
      calculate_distribution_shares: {
        Args: {
          p_daughters_count: number
          p_sons_count: number
          p_total_amount: number
          p_wives_count: number
        }
        Returns: {
          daughter_share: number
          son_share: number
          wife_share: number
        }[]
      }
      calculate_fiscal_year_summary: {
        Args: { p_fiscal_year_id: string }
        Returns: Json
      }
      calculate_loan_schedule:
        | {
            Args: {
              p_interest_rate: number
              p_loan_id: string
              p_principal: number
              p_start_date: string
              p_term_months: number
            }
            Returns: undefined
          }
        | {
            Args: {
              p_interest_rate?: number
              p_principal: number
              p_term_months: number
            }
            Returns: {
              due_date: string
              installment_number: number
              interest_amount: number
              principal_amount: number
              remaining_balance: number
              total_amount: number
            }[]
          }
      calculate_monthly_payment:
        | {
            Args: {
              p_interest_rate?: number
              p_principal: number
              p_term_months: number
            }
            Returns: number
          }
        | {
            Args: { annual_rate: number; months: number; principal: number }
            Returns: number
          }
      calculate_occupied_units: {
        Args: { property_uuid: string }
        Returns: number
      }
      calculate_property_revenue: {
        Args: { property_id: string }
        Returns: number
      }
      calculate_shariah_distribution: {
        Args: { p_total_amount: number }
        Returns: {
          beneficiary_id: string
          heir_type: string
          share_amount: number
          share_percentage: number
        }[]
      }
      calculate_sla_due_date: {
        Args: { p_request_type_id: string }
        Returns: string
      }
      calculate_tenant_balance: {
        Args: { p_tenant_id: string }
        Returns: number
      }
      can_manage_data: { Args: never; Returns: boolean }
      can_view_sensitive_data: { Args: never; Returns: boolean }
      check_accounting_balance: {
        Args: never
        Returns: {
          difference: number
          entry_date: string
          entry_id: string
          is_balanced: boolean
          total_credit: number
          total_debit: number
        }[]
      }
      check_file_retention_eligibility: {
        Args: { p_file_category: string; p_uploaded_at: string }
        Returns: boolean
      }
      check_is_admin_direct: {
        Args: { check_user_id: string }
        Returns: boolean
      }
      check_is_staff_direct: {
        Args: { check_user_id: string }
        Returns: boolean
      }
      check_journal_entry_balance: {
        Args: { p_entry_id: string }
        Returns: boolean
      }
      check_overdue_requests: { Args: never; Returns: undefined }
      check_rate_limit: {
        Args: {
          p_email: string
          p_ip_address: string
          p_max_attempts?: number
          p_time_window_minutes?: number
        }
        Returns: boolean
      }
      check_units_availability: {
        Args: { unit_ids: string[] }
        Returns: boolean
      }
      check_user_permission: {
        Args: { p_permission_key: string; p_user_id: string }
        Returns: boolean
      }
      cleanup_expired_sessions: {
        Args: never
        Returns: {
          cleaned_count: number
          cleanup_time: string
        }[]
      }
      cleanup_expired_tenant_otps: { Args: never; Returns: undefined }
      cleanup_old_alerts: { Args: never; Returns: undefined }
      cleanup_old_chatbot_conversations: { Args: never; Returns: number }
      cleanup_old_error_logs: { Args: never; Returns: undefined }
      cleanup_old_read_notifications: { Args: never; Returns: number }
      cleanup_old_records: { Args: never; Returns: undefined }
      cleanup_test_data: {
        Args: never
        Returns: {
          deleted_count: number
          table_name: string
        }[]
      }
      close_fiscal_year: {
        Args: { p_fiscal_year_id: string }
        Returns: undefined
      }
      count_users_by_target: {
        Args: { p_target_type: string; p_target_value?: string }
        Returns: number
      }
      create_auto_journal_entry: {
        Args: {
          p_amount: number
          p_description: string
          p_reference_id: string
          p_transaction_date?: string
          p_trigger_event: string
        }
        Returns: string
      }
      create_distribution_with_details: {
        Args: {
          p_charity_percentage?: number
          p_corpus_percentage?: number
          p_distribution_date: string
          p_distribution_type: string
          p_nazer_percentage?: number
          p_total_amount: number
          p_waqf_name: string
        }
        Returns: string
      }
      create_journal_entry_for_payment: {
        Args: { p_payment_id: string }
        Returns: string
      }
      create_journal_entry_from_voucher: {
        Args: { p_voucher_id: string }
        Returns: string
      }
      create_loan_installments: {
        Args: {
          p_loan_id: string
          p_monthly_installment: number
          p_start_date: string
          p_term_months: number
        }
        Returns: undefined
      }
      create_notification: {
        Args: {
          p_action_url?: string
          p_message: string
          p_reference_id?: string
          p_reference_type?: string
          p_title: string
          p_type?: string
          p_user_id: string
        }
        Returns: string
      }
      create_payment_schedule: {
        Args: {
          p_contract_id: string
          p_end_date: string
          p_monthly_rent: number
          p_payment_frequency: string
          p_start_date: string
        }
        Returns: Json
      }
      create_rental_invoice_and_receipt: {
        Args: {
          p_amount: number
          p_contract_id: string
          p_payment_date: string
          p_payment_method: string
          p_property_name?: string
          p_rental_payment_id: string
          p_tenant_email?: string
          p_tenant_id?: string
          p_tenant_name?: string
          p_tenant_phone?: string
        }
        Returns: {
          invoice_id: string
          journal_entry_id: string
          message: string
          receipt_id: string
          success: boolean
        }[]
      }
      create_user_profile_and_role: {
        Args: {
          p_email: string
          p_full_name: string
          p_role?: Database["public"]["Enums"]["app_role"]
          p_user_id: string
        }
        Returns: undefined
      }
      create_user_session: {
        Args: {
          p_device_info?: Json
          p_ip_address: string
          p_session_token: string
          p_user_agent: string
          p_user_id: string
        }
        Returns: string
      }
      end_user_session: {
        Args: { p_session_id: string; p_user_id: string }
        Returns: boolean
      }
      escalate_overdue_requests: { Args: never; Returns: undefined }
      extract_date_immutable: { Args: { ts: string }; Returns: string }
      find_duplicate_distributions: {
        Args: never
        Returns: {
          beneficiary_id: string
          beneficiary_name: string
          duplicate_count: number
          month_year: string
          total_amount: number
        }[]
      }
      find_orphan_records: {
        Args: never
        Returns: {
          orphan_count: number
          sample_ids: string
          table_name: string
        }[]
      }
      fix_stuck_approvals: {
        Args: { max_age_days?: number }
        Returns: {
          action_taken: string
          approval_id: string
          days_pending: number
          entity_id: string
          entity_type: string
        }[]
      }
      generate_annual_disclosure: {
        Args: { p_waqf_name: string; p_year: number }
        Returns: string
      }
      generate_annual_disclosure_by_year: {
        Args: { p_waqf_name: string; p_year: number }
        Returns: string
      }
      generate_beneficiary_number: { Args: never; Returns: string }
      generate_budget_from_previous_year: {
        Args: { p_fiscal_year_id: string; p_increase_percentage?: number }
        Returns: number
      }
      generate_pos_transaction_number: { Args: never; Returns: string }
      generate_shift_number: { Args: never; Returns: string }
      generate_smart_insights: { Args: never; Returns: undefined }
      generate_transfer_file_number: { Args: never; Returns: string }
      generate_voucher_number: {
        Args: { voucher_type: string }
        Returns: string
      }
      get_admin_dashboard_kpis: { Args: never; Returns: Json }
      get_all_user_profiles: {
        Args: never
        Returns: {
          avatar_url: string
          created_at: string
          email: string
          full_name: string
          id: string
          is_active: boolean
          last_login_at: string
          phone: string
          updated_at: string
          user_id: string
          user_position: string
          user_roles: Json
        }[]
      }
      get_approval_summary: {
        Args: never
        Returns: {
          approved_count: number
          avg_approval_hours: number
          entity_type: string
          pending_count: number
          rejected_count: number
        }[]
      }
      get_available_recipients: {
        Args: { current_user_id: string }
        Returns: {
          id: string
          name: string
          role: string
          role_key: string
        }[]
      }
      get_beneficiary_email_by_national_id: {
        Args: { p_national_id: string }
        Returns: {
          email: string
          user_id: string
        }[]
      }
      get_beneficiary_number: { Args: { ben_id: string }; Returns: string }
      get_beneficiary_statistics: {
        Args: { p_beneficiary_id: string }
        Returns: Json
      }
      get_beneficiary_visibility_settings: {
        Args: never
        Returns: {
          allow_download_documents: boolean | null
          allow_export_pdf: boolean | null
          allow_preview_documents: boolean | null
          allow_print: boolean | null
          allow_profile_edit: boolean | null
          created_at: string | null
          id: string
          mask_exact_amounts: boolean | null
          mask_iban: boolean | null
          mask_loan_amounts: boolean | null
          mask_national_ids: boolean | null
          mask_phone_numbers: boolean | null
          mask_tenant_info: boolean | null
          notes: string | null
          show_annual_budget: boolean | null
          show_approvals_log: boolean | null
          show_archive_contracts: boolean | null
          show_archive_financial_reports: boolean | null
          show_archive_legal_docs: boolean | null
          show_archive_meeting_minutes: boolean | null
          show_audit_reports: boolean | null
          show_bank_accounts: boolean | null
          show_bank_balances: boolean | null
          show_bank_statements: boolean | null
          show_bank_transactions: boolean | null
          show_beneficiaries_statistics: boolean | null
          show_beneficiary_categories: boolean | null
          show_budget_execution: boolean | null
          show_budgets: boolean | null
          show_compliance_reports: boolean | null
          show_contracts_details: boolean | null
          show_disclosures: boolean | null
          show_distributions: boolean | null
          show_documents: boolean | null
          show_emergency_aid: boolean | null
          show_emergency_statistics: boolean | null
          show_expenses_breakdown: boolean | null
          show_family_tree: boolean | null
          show_financial_reports: boolean | null
          show_governance: boolean | null
          show_governance_meetings: boolean | null
          show_inactive_beneficiaries: boolean | null
          show_internal_messages: boolean | null
          show_investment_plans: boolean | null
          show_invoices: boolean | null
          show_journal_entries: boolean | null
          show_ledger_details: boolean | null
          show_maintenance_costs: boolean | null
          show_nazer_decisions: boolean | null
          show_other_beneficiaries_amounts: boolean | null
          show_other_beneficiaries_names: boolean | null
          show_other_beneficiaries_personal_data: boolean | null
          show_other_loans: boolean | null
          show_overview: boolean | null
          show_own_loans: boolean | null
          show_policy_changes: boolean | null
          show_profile: boolean | null
          show_properties: boolean | null
          show_property_revenues: boolean | null
          show_requests: boolean | null
          show_reserve_funds: boolean | null
          show_statements: boolean | null
          show_strategic_plans: boolean | null
          show_support_tickets: boolean | null
          show_total_beneficiaries_count: boolean | null
          show_trial_balance: boolean | null
          target_role: string | null
          updated_at: string | null
          updated_by: string | null
        }
        SetofOptions: {
          from: "*"
          to: "beneficiary_visibility_settings"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      get_cache_hit_ratio: {
        Args: never
        Returns: {
          cache_hit_ratio: number
        }[]
      }
      get_cash_flow_report: {
        Args: { p_end_date: string; p_start_date: string }
        Returns: {
          category: string
          inflows: number
          net_flow: number
          outflows: number
        }[]
      }
      get_collection_percentage: { Args: never; Returns: number }
      get_connection_stats: {
        Args: never
        Returns: {
          count: number
          max_idle_seconds: number
          state: string
        }[]
      }
      get_current_user_role: { Args: never; Returns: string }
      get_current_user_roles: {
        Args: never
        Returns: {
          role: string
        }[]
      }
      get_dashboard_stats: {
        Args: never
        Returns: {
          active_beneficiaries: number
          active_contracts: number
          active_loans: number
          pending_approvals: number
          pending_distributions: number
          total_bank_balance: number
          total_beneficiaries: number
          total_properties: number
        }[]
      }
      get_database_health_summary: {
        Args: never
        Returns: {
          cache_hit_ratio: number
          db_size_mb: number
          duplicate_indexes: number
          duplicate_policies: number
          tables_with_dead_rows: number
          total_dead_rows: number
          total_indexes: number
          total_tables: number
        }[]
      }
      get_database_size: {
        Args: never
        Returns: {
          size_mb: number
        }[]
      }
      get_dead_rows_percentage: {
        Args: never
        Returns: {
          dead_pct: number
          dead_rows: number
          last_autovacuum: string
          last_vacuum: string
          live_rows: number
          table_name: string
        }[]
      }
      get_duplicate_indexes: {
        Args: never
        Returns: {
          column_definition: string
          index1: string
          index1_size: string
          index2: string
          index2_size: string
          table_name: string
        }[]
      }
      get_duplicate_rls_policies: {
        Args: never
        Returns: {
          command: string
          policy1: string
          policy1_qual: string
          policy2: string
          policy2_qual: string
          table_name: string
        }[]
      }
      get_expected_contract_revenue: { Args: never; Returns: number }
      get_family_statistics: { Args: { p_family_id: string }; Returns: Json }
      get_financial_report: {
        Args: { p_end_date: string; p_start_date: string }
        Returns: {
          amount: number
          description: string
          report_section: string
        }[]
      }
      get_heir_beneficiary_id: { Args: never; Returns: string }
      get_idle_connections: {
        Args: never
        Returns: {
          application_name: string
          client_addr: string
          idle_hours: number
          pid: number
          query_start: string
          state: string
        }[]
      }
      get_inbox_messages: {
        Args: { p_user_id: string }
        Returns: {
          body: string
          created_at: string
          id: string
          is_read: boolean
          parent_message_id: string
          priority: string
          read_at: string
          receiver_id: string
          receiver_name: string
          request_id: string
          sender_id: string
          sender_name: string
          subject: string
          updated_at: string
        }[]
      }
      get_income_summary: {
        Args: { p_end_date?: string; p_start_date?: string }
        Returns: {
          net_income: number
          total_expenses: number
          total_revenues: number
        }[]
      }
      get_indexes: {
        Args: never
        Returns: {
          index_definition: string
          index_name: string
          is_primary: boolean
          is_unique: boolean
          size_bytes: number
          table_name: string
        }[]
      }
      get_performance_health: { Args: never; Returns: Json }
      get_pos_daily_stats: {
        Args: { p_date?: string }
        Returns: {
          card_amount: number
          cash_amount: number
          net_amount: number
          total_collections: number
          total_payments: number
          transactions_count: number
          transfer_amount: number
        }[]
      }
      get_property_collection_summary: {
        Args: { p_property_id: string }
        Returns: {
          collection_percentage: number
          total_collected: number
          total_expected: number
          transaction_count: number
        }[]
      }
      get_property_stats: {
        Args: { p_property_id?: string }
        Returns: {
          active_contracts: number
          annual_revenue: number
          monthly_revenue: number
          occupancy_rate: number
          occupied_units: number
          property_id: string
          property_name: string
          total_units: number
        }[]
      }
      get_recent_query_errors: {
        Args: { p_limit?: number }
        Returns: {
          created_at: string
          error_message: string
          error_stack: string
          error_type: string
          id: string
          severity: string
        }[]
      }
      get_rls_coverage: { Args: never; Returns: Json }
      get_rls_policies: {
        Args: never
        Returns: {
          cmd: string
          permissive: string
          policyname: string
          qual: string
          roles: string[]
          tablename: string
          with_check: string
        }[]
      }
      get_sent_messages: {
        Args: { p_user_id: string }
        Returns: {
          body: string
          created_at: string
          id: string
          is_read: boolean
          parent_message_id: string
          priority: string
          read_at: string
          receiver_id: string
          receiver_name: string
          request_id: string
          sender_id: string
          sender_name: string
          subject: string
          updated_at: string
        }[]
      }
      get_shift_stats: {
        Args: { p_shift_id: string }
        Returns: {
          card_collections: number
          cash_collections: number
          net_amount: number
          total_collections: number
          total_payments: number
          transactions_count: number
        }[]
      }
      get_shifts_report: {
        Args: { p_end_date: string; p_start_date: string }
        Returns: {
          cashier_name: string
          closed_at: string
          closing_balance: number
          opened_at: string
          opening_balance: number
          shift_id: string
          shift_number: string
          status: string
          total_collections: number
          total_payments: number
          variance: number
        }[]
      }
      get_system_stats: { Args: never; Returns: Json }
      get_table_info: {
        Args: never
        Returns: {
          has_rls: boolean
          row_count: number
          size_bytes: number
          table_name: string
          table_schema: string
        }[]
      }
      get_table_scan_stats: {
        Args: never
        Returns: {
          dead_rows: number
          idx_scan: number
          live_rows: number
          seq_pct: number
          seq_scan: number
          table_name: string
        }[]
      }
      get_tables_with_high_dead_rows: {
        Args: never
        Returns: {
          dead_ratio: number
          table_name: string
        }[]
      }
      get_total_collected: {
        Args: { p_end_date?: string; p_start_date?: string }
        Returns: number
      }
      get_trial_balance: {
        Args: { p_fiscal_year_id?: string }
        Returns: {
          account_code: string
          account_id: string
          account_name: string
          account_type: Database["public"]["Enums"]["account_type"]
          credit_balance: number
          debit_balance: number
        }[]
      }
      get_unused_indexes_count: { Args: never; Returns: number }
      get_user_messages: {
        Args: { p_user_id: string }
        Returns: {
          body: string
          created_at: string
          id: string
          is_read: boolean
          parent_message_id: string
          priority: string
          read_at: string
          receiver_id: string
          receiver_name: string
          request_id: string
          sender_id: string
          sender_name: string
          subject: string
          updated_at: string
        }[]
      }
      get_user_permissions: {
        Args: { _user_id: string }
        Returns: {
          granted: boolean
          permission_category: string
          permission_id: string
          permission_name: string
          source: string
        }[]
      }
      get_user_profile_by_id: {
        Args: { _user_id: string }
        Returns: {
          avatar_url: string
          created_at: string
          email: string
          full_name: string
          id: string
          is_active: boolean
          last_login_at: string
          phone: string
          updated_at: string
          user_id: string
          user_position: string
          user_roles: Json
        }[]
      }
      get_users_by_target: {
        Args: { p_target_type: string; p_target_value?: string }
        Returns: {
          full_name: string
          user_id: string
        }[]
      }
      get_vacuum_status: {
        Args: never
        Returns: {
          dead_pct: number
          dead_rows: number
          last_analyze: string
          last_autovacuum: string
          last_vacuum: string
          live_rows: number
          needs_vacuum: boolean
          table_name: string
        }[]
      }
      get_waqf_public_stats: { Args: never; Returns: Json }
      get_waqf_summary: {
        Args: never
        Returns: {
          metric_name: string
          metric_unit: string
          metric_value: number
        }[]
      }
      grant_user_permission: {
        Args: {
          p_expires_at?: string
          p_granted_by: string
          p_permission_key: string
          p_user_id: string
        }
        Returns: string
      }
      has_all_permissions: {
        Args: { _permissions: string[]; _user_id: string }
        Returns: boolean
      }
      has_any_permission: {
        Args: { _permissions: string[]; _user_id: string }
        Returns: boolean
      }
      has_any_role: {
        Args: {
          _roles: Database["public"]["Enums"]["app_role"][]
          _user_id: string
        }
        Returns: boolean
      }
      has_full_read_access: { Args: never; Returns: boolean }
      has_permission: {
        Args: { _permission: string; _user_id: string }
        Returns: boolean
      }
      has_role:
        | {
            Args: {
              _role: Database["public"]["Enums"]["app_role"]
              _user_id: string
            }
            Returns: boolean
          }
        | { Args: { _role: string; _user_id: string }; Returns: boolean }
      has_staff_access: { Args: never; Returns: boolean }
      increment_field: {
        Args: { field_name: string; increment_value: number; row_id: string }
        Returns: number
      }
      is_accountant: { Args: never; Returns: boolean }
      is_admin: { Args: never; Returns: boolean }
      is_admin_or_nazer: { Args: never; Returns: boolean }
      is_archivist: { Args: never; Returns: boolean }
      is_beneficiary: { Args: never; Returns: boolean }
      is_beneficiary_owner: {
        Args: { _beneficiary_id: string }
        Returns: boolean
      }
      is_cashier: { Args: never; Returns: boolean }
      is_financial_staff: { Args: never; Returns: boolean }
      is_first_class_beneficiary: { Args: never; Returns: boolean }
      is_first_degree_beneficiary: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      is_fiscal_year_published: { Args: { fy_id: string }; Returns: boolean }
      is_heir: { Args: never; Returns: boolean }
      is_heir_own_data: { Args: { _beneficiary_id: string }; Returns: boolean }
      is_nazer_or_admin: { Args: { user_id: string }; Returns: boolean }
      is_own_activity: { Args: { p_beneficiary_id: string }; Returns: boolean }
      is_own_beneficiary: {
        Args: { p_beneficiary_id: string }
        Returns: boolean
      }
      is_pos_user: { Args: never; Returns: boolean }
      is_staff: { Args: never; Returns: boolean }
      is_staff_only: { Args: never; Returns: boolean }
      is_waqf_heir:
        | { Args: never; Returns: boolean }
        | { Args: { _user_id?: string }; Returns: boolean }
      log_access_attempt: {
        Args: {
          p_action: string
          p_details?: Json
          p_success: boolean
          p_table_name: string
        }
        Returns: undefined
      }
      log_audit_event: {
        Args: {
          p_action_type: string
          p_description: string
          p_ip_address?: string
          p_new_values?: Json
          p_old_values?: Json
          p_record_id: string
          p_severity?: string
          p_table_name: string
          p_user_agent?: string
          p_user_id: string
        }
        Returns: string
      }
      log_login_attempt: {
        Args: {
          p_email: string
          p_ip_address: string
          p_success: boolean
          p_user_agent?: string
        }
        Returns: undefined
      }
      log_sensitive_data_access: {
        Args: {
          p_access_reason?: string
          p_access_type: string
          p_column_name: string
          p_record_id: string
          p_table_name: string
        }
        Returns: undefined
      }
      log_view_access: {
        Args: { _filters?: Json; _view_name: string }
        Returns: undefined
      }
      notify_contract_expiring: { Args: never; Returns: undefined }
      notify_overdue_invoices: { Args: never; Returns: undefined }
      notify_overdue_loan_installments: { Args: never; Returns: undefined }
      notify_payment_due: { Args: never; Returns: undefined }
      notify_rental_payment_due: { Args: never; Returns: undefined }
      owns_beneficiary: { Args: { p_beneficiary_id: string }; Returns: boolean }
      owns_support_ticket: { Args: { p_ticket_id: string }; Returns: boolean }
      payment_requires_approval: {
        Args: { p_amount: number }
        Returns: boolean
      }
      process_existing_rental_payments: {
        Args: never
        Returns: {
          journal_entry_id: string
          payment_id: string
          success: boolean
        }[]
      }
      process_payment_voucher: {
        Args: { p_voucher_id: string }
        Returns: undefined
      }
      refresh_financial_views: { Args: never; Returns: undefined }
      refresh_table_statistics: { Args: never; Returns: undefined }
      refresh_user_profile_cache: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      regenerate_payment_schedule: {
        Args: { p_contract_id: string }
        Returns: number
      }
      reset_performance_stats: { Args: never; Returns: Json }
      run_full_cleanup: { Args: never; Returns: Json }
      run_scheduled_cleanup: { Args: never; Returns: Json }
      run_vacuum_analyze: { Args: never; Returns: Json }
      save_smart_alert: {
        Args: {
          p_action_url: string
          p_alert_type: string
          p_description: string
          p_entity_id: string
          p_entity_type: string
          p_severity: string
          p_title: string
        }
        Returns: string
      }
      search_beneficiaries_advanced:
        | {
            Args: {
              p_category?: string
              p_city?: string
              p_family_id?: string
              p_full_name?: string
              p_gender?: string
              p_has_family?: boolean
              p_marital_status?: string
              p_max_income?: number
              p_min_income?: number
              p_national_id?: string
              p_phone?: string
              p_priority_level?: number
              p_status?: string
              p_tribe?: string
            }
            Returns: {
              category: string
              family_id: string
              full_name: string
              id: string
              monthly_income: number
              national_id: string
              phone: string
              priority_level: number
              status: string
            }[]
          }
        | {
            Args: {
              search_category?: string
              search_status?: string
              search_text?: string
              search_tribe?: string
            }
            Returns: {
              category: string
              full_name: string
              id: string
              national_id: string
              phone: string
              status: string
              total_received: number
              tribe: string
            }[]
          }
      secure_audit_log: {
        Args: {
          p_action_type: string
          p_description?: string
          p_new_values?: Json
          p_old_values?: Json
          p_record_id?: string
          p_severity?: string
          p_table_name?: string
        }
        Returns: string
      }
      secure_calculate_distribution_shares: {
        Args: {
          p_daughters_count: number
          p_sons_count: number
          p_total_amount: number
          p_wives_count: number
        }
        Returns: {
          daughter_share: number
          son_share: number
          wife_share: number
        }[]
      }
      secure_check_distribution_approvals: {
        Args: { p_distribution_id: string }
        Returns: boolean
      }
      seed_demo_data: { Args: never; Returns: Json }
      seed_journal_entries: { Args: never; Returns: Json }
      setup_demo_accounts: {
        Args: never
        Returns: {
          email: string
          role: string
          status: string
        }[]
      }
      smart_cleanup_monitoring_data: {
        Args: never
        Returns: {
          alerts_archived: number
          alerts_merged: number
          errors_resolved: number
          health_checks_deleted: number
        }[]
      }
      update_loan_balance_after_payment: {
        Args: { p_loan_id: string; p_payment_amount: number }
        Returns: undefined
      }
      update_overdue_installments: { Args: never; Returns: undefined }
      vacuum_all_tables: { Args: never; Returns: Json }
      vacuum_table: { Args: { p_table_name: string }; Returns: Json }
      verify_2fa_code: {
        Args: { p_code: string; p_user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      account_nature: "debit" | "credit"
      account_type: "asset" | "liability" | "equity" | "revenue" | "expense"
      app_role:
        | "admin"
        | "user"
        | "nazer"
        | "accountant"
        | "cashier"
        | "archivist"
        | "beneficiary"
        | "waqf_heir"
      entry_status: "draft" | "posted" | "cancelled"
      entry_type: "manual" | "auto" | "adjustment" | "opening" | "closing"
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
      app_role: [
        "admin",
        "user",
        "nazer",
        "accountant",
        "cashier",
        "archivist",
        "beneficiary",
        "waqf_heir",
      ],
      entry_status: ["draft", "posted", "cancelled"],
      entry_type: ["manual", "auto", "adjustment", "opening", "closing"],
    },
  },
} as const
