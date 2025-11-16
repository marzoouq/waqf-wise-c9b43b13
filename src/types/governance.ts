export type VotingParticipantsType = 
  | 'board_only'
  | 'first_class_beneficiaries'
  | 'board_and_beneficiaries'
  | 'custom'
  | 'nazer_only';

export type VoteType = 'موافق' | 'معارض' | 'ممتنع';

export type DecisionStatus = 
  | 'قيد التصويت'
  | 'معتمد'
  | 'مرفوض'
  | 'قيد التنفيذ'
  | 'منفذ'
  | 'ملغي';

export interface CustomVoter {
  user_id: string;
  name: string;
  voter_type: 'board_member' | 'beneficiary' | 'nazer';
  beneficiary_id?: string;
}

export interface GovernanceDecision {
  id: string;
  meeting_id?: string;
  board_id?: string;
  
  decision_number: string;
  decision_date: string;
  decision_title: string;
  decision_text: string;
  decision_type: string;
  
  requires_voting: boolean;
  voting_participants_type: VotingParticipantsType;
  custom_voters?: CustomVoter[];
  voting_method: string;
  voting_quorum?: number;
  pass_threshold: number;
  
  votes_for: number;
  votes_against: number;
  votes_abstain: number;
  total_votes: number;
  voting_completed: boolean;
  
  decision_status: DecisionStatus;
  
  implementation_deadline?: string;
  responsible_person_name?: string;
  implementation_plan?: string;
  implementation_progress: number;
  implementation_notes?: string;
  implemented_at?: string;
  
  attachments?: string[];
  notes?: string;
  
  created_at: string;
  updated_at: string;
}

export interface GovernanceVote {
  id: string;
  decision_id: string;
  voter_id: string;
  voter_name: string;
  voter_type: 'board_member' | 'beneficiary' | 'nazer';
  beneficiary_id?: string;
  vote: VoteType;
  vote_reason?: string;
  voted_at: string;
  is_secret: boolean;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface PropertyUnit {
  id: string;
  property_id: string;
  unit_number: string;
  unit_name?: string;
  unit_type: string;
  floor_number?: number;
  
  area?: number;
  rooms: number;
  bathrooms: number;
  has_kitchen: boolean;
  has_parking: boolean;
  parking_spaces: number;
  
  monthly_rent?: number;
  annual_rent?: number;
  estimated_value?: number;
  
  status: string;
  occupancy_status: string;
  
  current_tenant_id?: string;
  current_contract_id?: string;
  lease_start_date?: string;
  lease_end_date?: string;
  
  amenities?: Record<string, boolean>;
  utilities_included?: string[];
  furnishing_status?: string;
  
  description?: string;
  notes?: string;
  images?: string[];
  
  last_maintenance_date?: string;
  next_maintenance_date?: string;
  
  created_at: string;
  updated_at: string;
}
