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
      alert_escalations: {
        Row: {
          acknowledged_at: string | null
          alert_id: string | null
          created_at: string | null
          error_log_id: string | null
          escalated_from_user_id: string | null
          escalated_to_user_id: string
          escalation_level: number | null
          escalation_reason: string | null
          id: string
          resolved_at: string | null
          status: string | null
        }
        Insert: {
          acknowledged_at?: string | null
          alert_id?: string | null
          created_at?: string | null
          error_log_id?: string | null
          escalated_from_user_id?: string | null
          escalated_to_user_id: string
          escalation_level?: number | null
          escalation_reason?: string | null
          id?: string
          resolved_at?: string | null
          status?: string | null
        }
        Update: {
          acknowledged_at?: string | null
          alert_id?: string | null
          created_at?: string | null
          error_log_id?: string | null
          escalated_from_user_id?: string | null
          escalated_to_user_id?: string
          escalation_level?: number | null
          escalation_reason?: string | null
          id?: string
          resolved_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alert_escalations_alert_id_fkey"
            columns: ["alert_id"]
            isOneToOne: false
            referencedRelation: "system_alerts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alert_escalations_error_log_id_fkey"
            columns: ["error_log_id"]
            isOneToOne: false
            referencedRelation: "system_error_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      alert_rules: {
        Row: {
          auto_escalate: boolean | null
          auto_fix_attempts: number | null
          auto_fix_strategy: string | null
          created_at: string | null
          description: string | null
          error_type_pattern: string | null
          escalation_delay_minutes: number | null
          id: string
          is_active: boolean | null
          min_severity: string | null
          notify_roles: string[] | null
          occurrence_threshold: number | null
          priority: number | null
          rule_name: string
          time_window_minutes: number | null
          updated_at: string | null
        }
        Insert: {
          auto_escalate?: boolean | null
          auto_fix_attempts?: number | null
          auto_fix_strategy?: string | null
          created_at?: string | null
          description?: string | null
          error_type_pattern?: string | null
          escalation_delay_minutes?: number | null
          id?: string
          is_active?: boolean | null
          min_severity?: string | null
          notify_roles?: string[] | null
          occurrence_threshold?: number | null
          priority?: number | null
          rule_name: string
          time_window_minutes?: number | null
          updated_at?: string | null
        }
        Update: {
          auto_escalate?: boolean | null
          auto_fix_attempts?: number | null
          auto_fix_strategy?: string | null
          created_at?: string | null
          description?: string | null
          error_type_pattern?: string | null
          escalation_delay_minutes?: number | null
          id?: string
          is_active?: boolean | null
          min_severity?: string | null
          notify_roles?: string[] | null
          occurrence_threshold?: number | null
          priority?: number | null
          rule_name?: string
          time_window_minutes?: number | null
          updated_at?: string | null
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
          nazer_percentage: number
          nazer_share: number
          net_income: number
          opening_balance: number | null
          other_expenses: number | null
          published_at: string | null
          published_by: string | null
          sons_count: number
          status: string | null
          total_beneficiaries: number
          total_expenses: number
          total_revenues: number
          updated_at: string | null
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
          nazer_percentage?: number
          nazer_share?: number
          net_income?: number
          opening_balance?: number | null
          other_expenses?: number | null
          published_at?: string | null
          published_by?: string | null
          sons_count?: number
          status?: string | null
          total_beneficiaries?: number
          total_expenses?: number
          total_revenues?: number
          updated_at?: string | null
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
          nazer_percentage?: number
          nazer_share?: number
          net_income?: number
          opening_balance?: number | null
          other_expenses?: number | null
          published_at?: string | null
          published_by?: string | null
          sons_count?: number
          status?: string | null
          total_beneficiaries?: number
          total_expenses?: number
          total_revenues?: number
          updated_at?: string | null
          waqf_name?: string
          wives_count?: number
          year?: number
        }
        Relationships: [
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
      audit_logs: {
        Row: {
          action_type: string
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
        Update: {
          action_type?: string
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
          alert_rule_id: string | null
          attempt_number: number | null
          completed_at: string | null
          created_at: string | null
          error_log_id: string | null
          error_message: string | null
          fix_strategy: string
          id: string
          max_attempts: number | null
          result: string | null
          started_at: string | null
          status: string | null
        }
        Insert: {
          alert_rule_id?: string | null
          attempt_number?: number | null
          completed_at?: string | null
          created_at?: string | null
          error_log_id?: string | null
          error_message?: string | null
          fix_strategy: string
          id?: string
          max_attempts?: number | null
          result?: string | null
          started_at?: string | null
          status?: string | null
        }
        Update: {
          alert_rule_id?: string | null
          attempt_number?: number | null
          completed_at?: string | null
          created_at?: string | null
          error_log_id?: string | null
          error_message?: string | null
          fix_strategy?: string
          id?: string
          max_attempts?: number | null
          result?: string | null
          started_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "auto_fix_attempts_alert_rule_id_fkey"
            columns: ["alert_rule_id"]
            isOneToOne: false
            referencedRelation: "alert_rules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "auto_fix_attempts_error_log_id_fkey"
            columns: ["error_log_id"]
            isOneToOne: false
            referencedRelation: "system_error_logs"
            referencedColumns: ["id"]
          },
        ]
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
            referencedRelation: "journal_entries"
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
            referencedRelation: "payment_vouchers_with_details"
            referencedColumns: ["distribution_id_ref"]
          },
        ]
      }
      beneficiaries: {
        Row: {
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
          email: string | null
          employment_status: string | null
          family_name: string | null
          family_size: number | null
          full_name: string
          gender: string | null
          housing_type: string | null
          iban: string | null
          id: string
          is_head_of_family: boolean | null
          last_login_at: string | null
          last_notification_at: string | null
          login_enabled_at: string | null
          marital_status: string | null
          monthly_income: number | null
          national_id: string
          nationality: string | null
          notes: string | null
          notification_preferences: Json | null
          number_of_daughters: number | null
          number_of_sons: number | null
          number_of_wives: number | null
          parent_beneficiary_id: string | null
          phone: string
          priority_level: number | null
          relationship: string | null
          status: string
          tags: string[] | null
          tribe: string | null
          updated_at: string
          user_id: string | null
          username: string | null
        }
        Insert: {
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
          email?: string | null
          employment_status?: string | null
          family_name?: string | null
          family_size?: number | null
          full_name: string
          gender?: string | null
          housing_type?: string | null
          iban?: string | null
          id?: string
          is_head_of_family?: boolean | null
          last_login_at?: string | null
          last_notification_at?: string | null
          login_enabled_at?: string | null
          marital_status?: string | null
          monthly_income?: number | null
          national_id: string
          nationality?: string | null
          notes?: string | null
          notification_preferences?: Json | null
          number_of_daughters?: number | null
          number_of_sons?: number | null
          number_of_wives?: number | null
          parent_beneficiary_id?: string | null
          phone: string
          priority_level?: number | null
          relationship?: string | null
          status?: string
          tags?: string[] | null
          tribe?: string | null
          updated_at?: string
          user_id?: string | null
          username?: string | null
        }
        Update: {
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
          email?: string | null
          employment_status?: string | null
          family_name?: string | null
          family_size?: number | null
          full_name?: string
          gender?: string | null
          housing_type?: string | null
          iban?: string | null
          id?: string
          is_head_of_family?: boolean | null
          last_login_at?: string | null
          last_notification_at?: string | null
          login_enabled_at?: string | null
          marital_status?: string | null
          monthly_income?: number | null
          national_id?: string
          nationality?: string | null
          notes?: string | null
          notification_preferences?: Json | null
          number_of_daughters?: number | null
          number_of_sons?: number | null
          number_of_wives?: number | null
          parent_beneficiary_id?: string | null
          phone?: string
          priority_level?: number | null
          relationship?: string | null
          status?: string
          tags?: string[] | null
          tribe?: string | null
          updated_at?: string
          user_id?: string | null
          username?: string | null
        }
        Relationships: [
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
          description: string
          id: string
          is_overdue: boolean | null
          last_message_at: string | null
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
          assigned_at?: string | null
          assigned_to?: string | null
          attachments_count?: number | null
          beneficiary_id: string
          created_at?: string | null
          decision_notes?: string | null
          description: string
          id?: string
          is_overdue?: boolean | null
          last_message_at?: string | null
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
          assigned_at?: string | null
          assigned_to?: string | null
          attachments_count?: number | null
          beneficiary_id?: string
          created_at?: string | null
          decision_notes?: string | null
          description?: string
          id?: string
          is_overdue?: boolean | null
          last_message_at?: string | null
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
            referencedRelation: "fiscal_years"
            referencedColumns: ["id"]
          },
        ]
      }
      chatbot_conversations: {
        Row: {
          context: Json | null
          created_at: string | null
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
          contract_number: string
          contract_type: string
          created_at: string
          created_by: string | null
          end_date: string
          id: string
          is_renewable: boolean | null
          monthly_rent: number
          notes: string | null
          payment_frequency: string
          property_id: string
          renewal_notice_days: number | null
          security_deposit: number | null
          start_date: string
          status: string
          tenant_email: string | null
          tenant_id_number: string
          tenant_name: string
          tenant_phone: string
          terms_and_conditions: string | null
          units_count: number | null
          updated_at: string
        }
        Insert: {
          auto_renew?: boolean | null
          contract_number: string
          contract_type: string
          created_at?: string
          created_by?: string | null
          end_date: string
          id?: string
          is_renewable?: boolean | null
          monthly_rent?: number
          notes?: string | null
          payment_frequency?: string
          property_id: string
          renewal_notice_days?: number | null
          security_deposit?: number | null
          start_date: string
          status?: string
          tenant_email?: string | null
          tenant_id_number: string
          tenant_name: string
          tenant_phone: string
          terms_and_conditions?: string | null
          units_count?: number | null
          updated_at?: string
        }
        Update: {
          auto_renew?: boolean | null
          contract_number?: string
          contract_type?: string
          created_at?: string
          created_by?: string | null
          end_date?: string
          id?: string
          is_renewable?: boolean | null
          monthly_rent?: number
          notes?: string | null
          payment_frequency?: string
          property_id?: string
          renewal_notice_days?: number | null
          security_deposit?: number | null
          start_date?: string
          status?: string
          tenant_email?: string | null
          tenant_id_number?: string
          tenant_name?: string
          tenant_phone?: string
          terms_and_conditions?: string | null
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
        ]
      }
      custom_kpis: {
        Row: {
          calculation_formula: Json
          created_at: string | null
          created_by: string | null
          display_format: string | null
          id: string
          is_active: boolean | null
          kpi_name: string
          kpi_type: string
          target_value: number | null
          unit: string | null
          updated_at: string | null
        }
        Insert: {
          calculation_formula: Json
          created_at?: string | null
          created_by?: string | null
          display_format?: string | null
          id?: string
          is_active?: boolean | null
          kpi_name: string
          kpi_type: string
          target_value?: number | null
          unit?: string | null
          updated_at?: string | null
        }
        Update: {
          calculation_formula?: Json
          created_at?: string | null
          created_by?: string | null
          display_format?: string | null
          id?: string
          is_active?: boolean | null
          kpi_name?: string
          kpi_type?: string
          target_value?: number | null
          unit?: string | null
          updated_at?: string | null
        }
        Relationships: []
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
      deleted_files_audit: {
        Row: {
          backup_location: string | null
          can_restore: boolean | null
          deleted_at: string | null
          deleted_by: string | null
          deletion_reason: string | null
          file_category: string | null
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          metadata: Json | null
          original_file_id: string
          permanent_deletion_at: string | null
          restore_until: string | null
          retention_policy_id: string | null
        }
        Insert: {
          backup_location?: string | null
          can_restore?: boolean | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          file_category?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          metadata?: Json | null
          original_file_id: string
          permanent_deletion_at?: string | null
          restore_until?: string | null
          retention_policy_id?: string | null
        }
        Update: {
          backup_location?: string | null
          can_restore?: boolean | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          file_category?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          metadata?: Json | null
          original_file_id?: string
          permanent_deletion_at?: string | null
          restore_until?: string | null
          retention_policy_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deleted_files_audit_retention_policy_id_fkey"
            columns: ["retention_policy_id"]
            isOneToOne: false
            referencedRelation: "file_retention_policies"
            referencedColumns: ["id"]
          },
        ]
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
      distribution_approvals: {
        Row: {
          approved_at: string | null
          approver_id: string | null
          approver_name: string
          created_at: string | null
          distribution_id: string
          id: string
          level: number
          notes: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approver_id?: string | null
          approver_name: string
          created_at?: string | null
          distribution_id: string
          id?: string
          level: number
          notes?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approver_id?: string | null
          approver_name?: string
          created_at?: string | null
          distribution_id?: string
          id?: string
          level?: number
          notes?: string | null
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
            referencedRelation: "payment_vouchers_with_details"
            referencedColumns: ["distribution_id_ref"]
          },
        ]
      }
      distributions: {
        Row: {
          bank_statement_ref: string | null
          beneficiaries_count: number
          calculation_notes: string | null
          charity_percentage: number | null
          corpus_percentage: number | null
          created_at: string
          daughters_count: number | null
          distributable_amount: number | null
          distribution_date: string
          distribution_type: string | null
          expenses_amount: number | null
          id: string
          journal_entry_id: string | null
          maintenance_amount: number | null
          month: string
          nazer_percentage: number | null
          nazer_share: number | null
          net_revenues: number | null
          notes: string | null
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
          waqif_charity: number | null
          wives_count: number | null
        }
        Insert: {
          bank_statement_ref?: string | null
          beneficiaries_count: number
          calculation_notes?: string | null
          charity_percentage?: number | null
          corpus_percentage?: number | null
          created_at?: string
          daughters_count?: number | null
          distributable_amount?: number | null
          distribution_date: string
          distribution_type?: string | null
          expenses_amount?: number | null
          id?: string
          journal_entry_id?: string | null
          maintenance_amount?: number | null
          month: string
          nazer_percentage?: number | null
          nazer_share?: number | null
          net_revenues?: number | null
          notes?: string | null
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
          waqif_charity?: number | null
          wives_count?: number | null
        }
        Update: {
          bank_statement_ref?: string | null
          beneficiaries_count?: number
          calculation_notes?: string | null
          charity_percentage?: number | null
          corpus_percentage?: number | null
          created_at?: string
          daughters_count?: number | null
          distributable_amount?: number | null
          distribution_date?: string
          distribution_type?: string | null
          expenses_amount?: number | null
          id?: string
          journal_entry_id?: string | null
          maintenance_amount?: number | null
          month?: string
          nazer_percentage?: number | null
          nazer_share?: number | null
          net_revenues?: number | null
          notes?: string | null
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
          waqif_charity?: number | null
          wives_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "distributions_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
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
        ]
      }
      documents: {
        Row: {
          category: string
          created_at: string
          description: string | null
          file_size: string
          file_size_bytes: number | null
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
          file_size_bytes?: number | null
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
          file_size_bytes?: number | null
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
        ]
      }
      encrypted_data_registry: {
        Row: {
          access_count: number | null
          column_name: string
          encrypted_at: string | null
          encryption_algorithm: string
          encryption_key_id: string | null
          id: string
          is_decrypted: boolean | null
          last_accessed_at: string | null
          metadata: Json | null
          record_id: string
          table_name: string
        }
        Insert: {
          access_count?: number | null
          column_name: string
          encrypted_at?: string | null
          encryption_algorithm?: string
          encryption_key_id?: string | null
          id?: string
          is_decrypted?: boolean | null
          last_accessed_at?: string | null
          metadata?: Json | null
          record_id: string
          table_name: string
        }
        Update: {
          access_count?: number | null
          column_name?: string
          encrypted_at?: string | null
          encryption_algorithm?: string
          encryption_key_id?: string | null
          id?: string
          is_decrypted?: boolean | null
          last_accessed_at?: string | null
          metadata?: Json | null
          record_id?: string
          table_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "encrypted_data_registry_encryption_key_id_fkey"
            columns: ["encryption_key_id"]
            isOneToOne: false
            referencedRelation: "encryption_keys"
            referencedColumns: ["id"]
          },
        ]
      }
      encrypted_files: {
        Row: {
          checksum: string
          encrypted_file_path: string
          encryption_iv: string
          encryption_key_id: string | null
          encryption_tag: string | null
          expires_at: string | null
          file_size: number
          id: string
          is_deleted: boolean | null
          metadata: Json | null
          mime_type: string | null
          original_file_name: string
          uploaded_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          checksum: string
          encrypted_file_path: string
          encryption_iv: string
          encryption_key_id?: string | null
          encryption_tag?: string | null
          expires_at?: string | null
          file_size: number
          id?: string
          is_deleted?: boolean | null
          metadata?: Json | null
          mime_type?: string | null
          original_file_name: string
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          checksum?: string
          encrypted_file_path?: string
          encryption_iv?: string
          encryption_key_id?: string | null
          encryption_tag?: string | null
          expires_at?: string | null
          file_size?: number
          id?: string
          is_deleted?: boolean | null
          metadata?: Json | null
          mime_type?: string | null
          original_file_name?: string
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "encrypted_files_encryption_key_id_fkey"
            columns: ["encryption_key_id"]
            isOneToOne: false
            referencedRelation: "encryption_keys"
            referencedColumns: ["id"]
          },
        ]
      }
      encryption_key_rotation_history: {
        Row: {
          affected_records_count: number | null
          completed_at: string | null
          error_message: string | null
          id: string
          metadata: Json | null
          new_key_id: string | null
          old_key_id: string | null
          rotated_at: string | null
          rotated_by: string | null
          rotation_reason: string
          status: string | null
        }
        Insert: {
          affected_records_count?: number | null
          completed_at?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          new_key_id?: string | null
          old_key_id?: string | null
          rotated_at?: string | null
          rotated_by?: string | null
          rotation_reason: string
          status?: string | null
        }
        Update: {
          affected_records_count?: number | null
          completed_at?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          new_key_id?: string | null
          old_key_id?: string | null
          rotated_at?: string | null
          rotated_by?: string | null
          rotation_reason?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "encryption_key_rotation_history_new_key_id_fkey"
            columns: ["new_key_id"]
            isOneToOne: false
            referencedRelation: "encryption_keys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "encryption_key_rotation_history_old_key_id_fkey"
            columns: ["old_key_id"]
            isOneToOne: false
            referencedRelation: "encryption_keys"
            referencedColumns: ["id"]
          },
        ]
      }
      encryption_keys: {
        Row: {
          created_at: string | null
          created_by: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          key_name: string
          key_purpose: string
          key_type: string
          metadata: Json | null
          rotated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_name: string
          key_purpose: string
          key_type: string
          metadata?: Json | null
          rotated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_name?: string
          key_purpose?: string
          key_type?: string
          metadata?: Json | null
          rotated_at?: string | null
        }
        Relationships: []
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
          waqf_unit_id: string | null
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
          waqf_unit_id?: string | null
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
      internal_messages: {
        Row: {
          body: string
          created_at: string | null
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
            foreignKeyName: "internal_messages_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "beneficiary_requests"
            referencedColumns: ["id"]
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
          customer_city: string | null
          customer_commercial_registration: string | null
          customer_email: string | null
          customer_name: string
          customer_phone: string | null
          customer_vat_number: string | null
          due_date: string | null
          id: string
          invoice_date: string
          invoice_hash: string | null
          invoice_number: string
          invoice_time: string | null
          journal_entry_id: string | null
          notes: string | null
          qr_code_data: string | null
          rental_payment_id: string | null
          status: string
          subtotal: number
          tax_amount: number
          tax_rate: number | null
          total_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_address?: string | null
          customer_city?: string | null
          customer_commercial_registration?: string | null
          customer_email?: string | null
          customer_name: string
          customer_phone?: string | null
          customer_vat_number?: string | null
          due_date?: string | null
          id?: string
          invoice_date: string
          invoice_hash?: string | null
          invoice_number: string
          invoice_time?: string | null
          journal_entry_id?: string | null
          notes?: string | null
          qr_code_data?: string | null
          rental_payment_id?: string | null
          status?: string
          subtotal?: number
          tax_amount?: number
          tax_rate?: number | null
          total_amount?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_address?: string | null
          customer_city?: string | null
          customer_commercial_registration?: string | null
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string | null
          customer_vat_number?: string | null
          due_date?: string | null
          id?: string
          invoice_date?: string
          invoice_hash?: string | null
          invoice_number?: string
          invoice_time?: string | null
          journal_entry_id?: string | null
          notes?: string | null
          qr_code_data?: string | null
          rental_payment_id?: string | null
          status?: string
          subtotal?: number
          tax_amount?: number
          tax_rate?: number | null
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
          {
            foreignKeyName: "invoices_rental_payment_id_fkey"
            columns: ["rental_payment_id"]
            isOneToOne: false
            referencedRelation: "rental_payments"
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
            referencedRelation: "loans"
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
            referencedRelation: "loans"
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
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loan_payments_loan_id_fkey"
            columns: ["loan_id"]
            isOneToOne: false
            referencedRelation: "loans"
            referencedColumns: ["id"]
          },
        ]
      }
      loans: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          beneficiary_id: string
          created_at: string
          end_date: string | null
          id: string
          interest_rate: number | null
          loan_amount: number
          loan_number: string | null
          monthly_installment: number | null
          notes: string | null
          start_date: string
          status: string | null
          term_months: number
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          beneficiary_id: string
          created_at?: string
          end_date?: string | null
          id?: string
          interest_rate?: number | null
          loan_amount: number
          loan_number?: string | null
          monthly_installment?: number | null
          notes?: string | null
          start_date: string
          status?: string | null
          term_months: number
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          beneficiary_id?: string
          created_at?: string
          end_date?: string | null
          id?: string
          interest_rate?: number | null
          loan_amount?: number
          loan_number?: string | null
          monthly_installment?: number | null
          notes?: string | null
          start_date?: string
          status?: string | null
          term_months?: number
          updated_at?: string
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
            foreignKeyName: "loans_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users_with_roles"
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
            referencedRelation: "beneficiary_statistics"
            referencedColumns: ["id"]
          },
        ]
      }
      login_attempts: {
        Row: {
          attempted_at: string
          created_at: string | null
          email: string
          id: string
          ip_address: string
          success: boolean
          user_agent: string | null
        }
        Insert: {
          attempted_at?: string
          created_at?: string | null
          email: string
          id?: string
          ip_address: string
          success?: boolean
          user_agent?: string | null
        }
        Update: {
          attempted_at?: string
          created_at?: string | null
          email?: string
          id?: string
          ip_address?: string
          success?: boolean
          user_agent?: string | null
        }
        Relationships: []
      }
      maintenance_requests: {
        Row: {
          actual_cost: number | null
          assigned_to: string | null
          category: string
          completed_date: string | null
          contract_id: string | null
          created_at: string
          description: string
          estimated_cost: number | null
          id: string
          journal_entry_id: string | null
          notes: string | null
          priority: string
          property_id: string
          request_number: string
          requested_by: string
          requested_date: string
          scheduled_date: string | null
          status: string
          title: string
          updated_at: string
          vendor_name: string | null
        }
        Insert: {
          actual_cost?: number | null
          assigned_to?: string | null
          category: string
          completed_date?: string | null
          contract_id?: string | null
          created_at?: string
          description: string
          estimated_cost?: number | null
          id?: string
          journal_entry_id?: string | null
          notes?: string | null
          priority?: string
          property_id: string
          request_number: string
          requested_by: string
          requested_date?: string
          scheduled_date?: string | null
          status?: string
          title: string
          updated_at?: string
          vendor_name?: string | null
        }
        Update: {
          actual_cost?: number | null
          assigned_to?: string | null
          category?: string
          completed_date?: string | null
          contract_id?: string | null
          created_at?: string
          description?: string
          estimated_cost?: number | null
          id?: string
          journal_entry_id?: string | null
          notes?: string | null
          priority?: string
          property_id?: string
          request_number?: string
          requested_by?: string
          requested_date?: string
          scheduled_date?: string | null
          status?: string
          title?: string
          updated_at?: string
          vendor_name?: string | null
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
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_requests_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
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
            foreignKeyName: "maintenance_schedules_property_unit_id_fkey"
            columns: ["property_unit_id"]
            isOneToOne: false
            referencedRelation: "property_units"
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
            foreignKeyName: "ocr_processing_log_attachment_id_fkey"
            columns: ["attachment_id"]
            isOneToOne: false
            referencedRelation: "beneficiary_attachments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ocr_processing_log_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
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
        ]
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
      payment_vouchers: {
        Row: {
          amount: number
          approved_at: string | null
          approved_by: string | null
          attachments: Json | null
          bank_account_id: string | null
          beneficiary_id: string | null
          created_at: string | null
          created_by: string | null
          description: string
          distribution_id: string | null
          id: string
          journal_entry_id: string | null
          metadata: Json | null
          notes: string | null
          paid_at: string | null
          paid_by: string | null
          payment_method: string | null
          reference_number: string | null
          status: string
          updated_at: string | null
          voucher_number: string
          voucher_type: string
        }
        Insert: {
          amount: number
          approved_at?: string | null
          approved_by?: string | null
          attachments?: Json | null
          bank_account_id?: string | null
          beneficiary_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description: string
          distribution_id?: string | null
          id?: string
          journal_entry_id?: string | null
          metadata?: Json | null
          notes?: string | null
          paid_at?: string | null
          paid_by?: string | null
          payment_method?: string | null
          reference_number?: string | null
          status?: string
          updated_at?: string | null
          voucher_number: string
          voucher_type: string
        }
        Update: {
          amount?: number
          approved_at?: string | null
          approved_by?: string | null
          attachments?: Json | null
          bank_account_id?: string | null
          beneficiary_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string
          distribution_id?: string | null
          id?: string
          journal_entry_id?: string | null
          metadata?: Json | null
          notes?: string | null
          paid_at?: string | null
          paid_by?: string | null
          payment_method?: string | null
          reference_number?: string | null
          status?: string
          updated_at?: string | null
          voucher_number?: string
          voucher_type?: string
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
            referencedRelation: "payment_vouchers_with_details"
            referencedColumns: ["distribution_id_ref"]
          },
          {
            foreignKeyName: "payment_vouchers_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          beneficiary_id: string | null
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
          rental_payment_id: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          beneficiary_id?: string | null
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
          rental_payment_id?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          beneficiary_id?: string | null
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
          rental_payment_id?: string | null
          status?: string | null
          updated_at?: string
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
            referencedRelation: "beneficiary_statistics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
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
      policy_reviews: {
        Row: {
          action_required: boolean | null
          created_at: string | null
          findings: string | null
          id: string
          next_review_date: string | null
          policy_id: string | null
          recommendations: string | null
          review_date: string
          review_type: string | null
          reviewer_name: string
        }
        Insert: {
          action_required?: boolean | null
          created_at?: string | null
          findings?: string | null
          id?: string
          next_review_date?: string | null
          policy_id?: string | null
          recommendations?: string | null
          review_date: string
          review_type?: string | null
          reviewer_name: string
        }
        Update: {
          action_required?: boolean | null
          created_at?: string | null
          findings?: string | null
          id?: string
          next_review_date?: string | null
          policy_id?: string | null
          recommendations?: string | null
          review_date?: string
          review_type?: string | null
          reviewer_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "policy_reviews_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "governance_policies"
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
      properties: {
        Row: {
          apartment_count: number | null
          available_units: number | null
          created_at: string
          description: string | null
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
          description?: string | null
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
          description?: string | null
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
      property_units: {
        Row: {
          amenities: Json | null
          annual_rent: number | null
          area: number | null
          bathrooms: number | null
          created_at: string | null
          current_contract_id: string | null
          current_tenant_id: string | null
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
            referencedRelation: "beneficiaries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_units_current_tenant_id_fkey"
            columns: ["current_tenant_id"]
            isOneToOne: false
            referencedRelation: "beneficiary_statistics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_units_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
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
      rental_payments: {
        Row: {
          amount_due: number
          amount_paid: number | null
          contract_id: string
          created_at: string
          discount: number | null
          due_date: string
          id: string
          invoice_id: string | null
          journal_entry_id: string | null
          late_fee: number | null
          notes: string | null
          payment_date: string | null
          payment_method: string | null
          payment_number: string
          receipt_id: string | null
          receipt_number: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount_due: number
          amount_paid?: number | null
          contract_id: string
          created_at?: string
          discount?: number | null
          due_date: string
          id?: string
          invoice_id?: string | null
          journal_entry_id?: string | null
          late_fee?: number | null
          notes?: string | null
          payment_date?: string | null
          payment_method?: string | null
          payment_number: string
          receipt_id?: string | null
          receipt_number?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount_due?: number
          amount_paid?: number | null
          contract_id?: string
          created_at?: string
          discount?: number | null
          due_date?: string
          id?: string
          invoice_id?: string | null
          journal_entry_id?: string | null
          late_fee?: number | null
          notes?: string | null
          payment_date?: string | null
          payment_method?: string | null
          payment_number?: string
          receipt_id?: string | null
          receipt_number?: string | null
          status?: string
          updated_at?: string
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
            foreignKeyName: "rental_payments_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rental_payments_receipt_id_fkey"
            columns: ["receipt_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
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
          category: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          name_ar: string
          name_en: string | null
          requires_amount: boolean | null
          requires_approval: boolean | null
          requires_attachments: boolean | null
          sla_hours: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          name_ar: string
          name_en?: string | null
          requires_amount?: boolean | null
          requires_approval?: boolean | null
          requires_attachments?: boolean | null
          sla_hours?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          name_ar?: string
          name_en?: string | null
          requires_amount?: boolean | null
          requires_approval?: boolean | null
          requires_attachments?: boolean | null
          sla_hours?: number | null
        }
        Relationships: []
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
      saved_searches: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_favorite: boolean | null
          is_shared: boolean | null
          last_used_at: string | null
          name: string
          search_criteria: Json
          search_type: string | null
          updated_at: string | null
          usage_count: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_favorite?: boolean | null
          is_shared?: boolean | null
          last_used_at?: string | null
          name: string
          search_criteria: Json
          search_type?: string | null
          updated_at?: string | null
          usage_count?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_favorite?: boolean | null
          is_shared?: boolean | null
          last_used_at?: string | null
          name?: string
          search_criteria?: Json
          search_type?: string | null
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
          created_at: string | null
          created_by: string | null
          frequency: string
          id: string
          is_active: boolean | null
          name: string
          next_run: string
          recipients: string[]
          report_type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          frequency: string
          id?: string
          is_active?: boolean | null
          name: string
          next_run: string
          recipients: string[]
          report_type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          frequency?: string
          id?: string
          is_active?: boolean | null
          name?: string
          next_run?: string
          recipients?: string[]
          report_type?: string
          updated_at?: string | null
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
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          status: string | null
          title: string
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
          resolved_at?: string | null
          resolved_by?: string | null
          severity: string
          status?: string | null
          title: string
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
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          status?: string | null
          title?: string
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
          description: string | null
          id: string
          name: string
          total_beneficiaries: number | null
          total_families: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          total_beneficiaries?: number | null
          total_families?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          total_beneficiaries?: number | null
          total_families?: number | null
          updated_at?: string | null
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
          id: string
          reserve_type: string
          updated_at: string | null
        }
        Insert: {
          amount?: number
          created_at?: string | null
          current_balance?: number
          distribution_id?: string | null
          id?: string
          reserve_type: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          current_balance?: number
          distribution_id?: string | null
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
            referencedRelation: "payment_vouchers_with_details"
            referencedColumns: ["distribution_id_ref"]
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
          current_value: number | null
          description: string | null
          documents: Json | null
          id: string
          is_active: boolean | null
          location: string | null
          name: string
          notes: string | null
          updated_at: string
          waqf_type: string | null
        }
        Insert: {
          acquisition_date?: string | null
          acquisition_value?: number | null
          annual_return?: number | null
          code: string
          created_at?: string
          current_value?: number | null
          description?: string | null
          documents?: Json | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          name: string
          notes?: string | null
          updated_at?: string
          waqf_type?: string | null
        }
        Update: {
          acquisition_date?: string | null
          acquisition_value?: number | null
          annual_return?: number | null
          code?: string
          created_at?: string
          current_value?: number | null
          description?: string | null
          documents?: Json | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          name?: string
          notes?: string | null
          updated_at?: string
          waqf_type?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      beneficiary_statistics: {
        Row: {
          beneficiary_number: string | null
          category: string | null
          full_name: string | null
          id: string | null
          status: string | null
          total_attachments: number | null
          total_distributions: number | null
          total_requests: number | null
        }
        Relationships: []
      }
      current_user_roles: {
        Row: {
          role: Database["public"]["Enums"]["app_role"] | null
        }
        Insert: {
          role?: Database["public"]["Enums"]["app_role"] | null
        }
        Update: {
          role?: Database["public"]["Enums"]["app_role"] | null
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
            foreignKeyName: "internal_messages_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "beneficiary_requests"
            referencedColumns: ["id"]
          },
        ]
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
            referencedRelation: "payment_vouchers_with_details"
            referencedColumns: ["distribution_id_ref"]
          },
          {
            foreignKeyName: "payment_vouchers_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
        ]
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
      unified_transactions_view: {
        Row: {
          amount: number | null
          beneficiary_id: string | null
          contract_number: string | null
          created_at: string | null
          description: string | null
          id: string | null
          journal_entry_id: string | null
          party_name: string | null
          payment_method: string | null
          reference_number: string | null
          source: string | null
          source_name_ar: string | null
          source_name_en: string | null
          status: string | null
          transaction_date: string | null
          transaction_type: string | null
        }
        Relationships: []
      }
      users_with_roles: {
        Row: {
          avatar_url: string | null
          email: string | null
          full_name: string | null
          roles: Database["public"]["Enums"]["app_role"][] | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      assign_user_role: {
        Args: {
          p_email: string
          p_role: Database["public"]["Enums"]["app_role"]
        }
        Returns: undefined
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
      calculate_account_balance: {
        Args: { account_uuid: string }
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
      calculate_loan_schedule: {
        Args: {
          p_interest_rate: number
          p_loan_id: string
          p_principal: number
          p_start_date: string
          p_term_months: number
        }
        Returns: undefined
      }
      calculate_monthly_payment: {
        Args: { annual_rate: number; months: number; principal: number }
        Returns: number
      }
      check_file_retention_eligibility: {
        Args: { p_file_category: string; p_uploaded_at: string }
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
      cleanup_old_error_logs: { Args: never; Returns: undefined }
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
      create_rental_invoice_and_receipt: {
        Args: {
          p_amount: number
          p_contract_id: string
          p_payment_date: string
          p_payment_method?: string
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
      generate_annual_disclosure: {
        Args: { p_waqf_name: string; p_year: number }
        Returns: string
      }
      generate_beneficiary_number: { Args: never; Returns: string }
      generate_smart_insights: { Args: never; Returns: undefined }
      generate_transfer_file_number: { Args: never; Returns: string }
      generate_voucher_number: {
        Args: { voucher_type: string }
        Returns: string
      }
      get_admin_dashboard_kpis: { Args: never; Returns: Json }
      get_beneficiary_number: { Args: { ben_id: string }; Returns: string }
      has_any_role: {
        Args: {
          _roles: Database["public"]["Enums"]["app_role"][]
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_first_degree_beneficiary: {
        Args: { user_uuid: string }
        Returns: boolean
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
      notify_contract_expiring: { Args: never; Returns: undefined }
      notify_rental_payment_due: { Args: never; Returns: undefined }
      payment_requires_approval: {
        Args: { p_amount: number }
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
      update_loan_balance_after_payment: {
        Args: { p_loan_id: string; p_payment_amount: number }
        Returns: undefined
      }
      update_overdue_installments: { Args: never; Returns: undefined }
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
      app_role: [
        "admin",
        "user",
        "nazer",
        "accountant",
        "cashier",
        "archivist",
        "beneficiary",
      ],
      entry_status: ["draft", "posted", "cancelled"],
    },
  },
} as const
