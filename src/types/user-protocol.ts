export interface UserProtocol {
  active_protocol_ids: string[];
  protocol_goal: string | null;
  protocol_duration_weeks: number | null;
  protocol_started_at: string | null;
}
