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
      beneficiaries: {
        Row: {
          address: string | null
          bank_account_number: string | null
          bank_name: string | null
          beneficiary_number: string | null
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
            referencedRelation: "distributions"
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
          journal_entry_id: string | null
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
          journal_entry_id?: string | null
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
          journal_entry_id?: string | null
          month?: string
          notes?: string | null
          status?: string
          total_amount?: number
          updated_at?: string
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
          id: string
          logo_url: string | null
          organization_name_ar: string
          organization_name_en: string | null
          phone: string | null
          postal_code: string | null
          updated_at: string | null
          vat_registration_number: string
        }
        Insert: {
          address_ar: string
          address_en?: string | null
          city: string
          commercial_registration_number: string
          country?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          organization_name_ar: string
          organization_name_en?: string | null
          phone?: string | null
          postal_code?: string | null
          updated_at?: string | null
          vat_registration_number: string
        }
        Update: {
          address_ar?: string
          address_en?: string | null
          city?: string
          commercial_registration_number?: string
          country?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          organization_name_ar?: string
          organization_name_en?: string | null
          phone?: string | null
          postal_code?: string | null
          updated_at?: string | null
          vat_registration_number?: string
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
          waqf_unit_id: string | null
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
          waqf_unit_id?: string | null
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
          journal_entry_id: string | null
          late_fee: number | null
          notes: string | null
          payment_date: string | null
          payment_method: string | null
          payment_number: string
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
          journal_entry_id?: string | null
          late_fee?: number | null
          notes?: string | null
          payment_date?: string | null
          payment_method?: string | null
          payment_number: string
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
          journal_entry_id?: string | null
          late_fee?: number | null
          notes?: string | null
          payment_date?: string | null
          payment_method?: string | null
          payment_number?: string
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
            foreignKeyName: "rental_payments_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
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
          name_ar: string
          name_en: string | null
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
          name_ar: string
          name_en?: string | null
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
          name_ar?: string
          name_en?: string | null
          requires_approval?: boolean | null
          sla_hours?: number | null
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
          approved_requests: number | null
          attachments_count: number | null
          full_name: string | null
          id: string | null
          last_payment_date: string | null
          last_request_date: string | null
          payment_count: number | null
          pending_requests: number | null
          total_payments: number | null
          total_requests: number | null
          user_id: string | null
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
    }
    Functions: {
      assign_user_role: {
        Args: {
          p_email: string
          p_role: Database["public"]["Enums"]["app_role"]
        }
        Returns: undefined
      }
      calculate_account_balance: {
        Args: { account_uuid: string }
        Returns: number
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
      create_user_profile_and_role: {
        Args: {
          p_email: string
          p_full_name: string
          p_role?: Database["public"]["Enums"]["app_role"]
          p_user_id: string
        }
        Returns: undefined
      }
      generate_beneficiary_number: { Args: never; Returns: string }
      generate_smart_insights: { Args: never; Returns: undefined }
      get_beneficiary_number: { Args: { ben_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
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
      notify_contract_expiring: { Args: never; Returns: undefined }
      notify_rental_payment_due: { Args: never; Returns: undefined }
      payment_requires_approval: {
        Args: { p_amount: number }
        Returns: boolean
      }
      setup_demo_accounts: {
        Args: never
        Returns: {
          email: string
          role: string
          status: string
        }[]
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
