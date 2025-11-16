export interface InternalMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  subject: string;
  body: string;
  is_read: boolean;
  created_at: string;
  read_at?: string;
}

export interface InternalMessageInsert {
  sender_id: string;
  receiver_id: string;
  subject: string;
  body: string;
  is_read?: boolean;
}

export interface InternalMessagePayload {
  new: InternalMessage;
  old?: InternalMessage;
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
}
