export interface SystemError {
  id: string;
  error_type: string;
  error_message: string;
  severity: string;
  status: string;
  created_at: string;
  error_stack?: string;
  additional_data?: unknown;
}

export interface SystemAlert {
  id: string;
  alert_type: string;
  severity: string;
  title: string;
  description: string;
  status: string;
  occurrence_count?: number;
  created_at: string;
}

export interface AutoFixAttempt {
  id: string;
  fix_strategy: string;
  attempt_number: number;
  max_attempts: number;
  result?: string;
  status: string;
  error_message?: string;
}
