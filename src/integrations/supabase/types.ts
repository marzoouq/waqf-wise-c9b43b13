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
          marital_status: string | null
          monthly_income: number | null
          national_id: string
          nationality: string | null
          notes: string | null
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
        }
        Insert: {
          address?: string | null
          bank_account_number?: string | null
          bank_name?: string | null
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
          marital_status?: string | null
          monthly_income?: number | null
          national_id: string
          nationality?: string | null
          notes?: string | null
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
        }
        Update: {
          address?: string | null
          bank_account_number?: string | null
          bank_name?: string | null
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
          marital_status?: string | null
          monthly_income?: number | null
          national_id?: string
          nationality?: string | null
          notes?: string | null
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
        }
        Relationships: [
          {
            foreignKeyName: "beneficiaries_parent_beneficiary_id_fkey"
            columns: ["parent_beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries"
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
        ]
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
      saved_searches: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_favorite: boolean | null
          last_used_at: string | null
          name: string
          search_criteria: Json
          updated_at: string | null
          usage_count: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_favorite?: boolean | null
          last_used_at?: string | null
          name: string
          search_criteria: Json
          updated_at?: string | null
          usage_count?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_favorite?: boolean | null
          last_used_at?: string | null
          name?: string
          search_criteria?: Json
          updated_at?: string | null
          usage_count?: number | null
          user_id?: string
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
      [_ in never]: never
    }
    Functions: {
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
      check_overdue_requests: { Args: never; Returns: undefined }
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      notify_contract_expiring: { Args: never; Returns: undefined }
      notify_rental_payment_due: { Args: never; Returns: undefined }
      update_overdue_installments: { Args: never; Returns: undefined }
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
