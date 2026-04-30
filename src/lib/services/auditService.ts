export type AuditEventType =
  | "transaction_scanned"
  | "opportunity_detected"
  | "confidence_calculated"
  | "automation_decided"
  | "message_generated"
  | "action_created"
  | "action_submitted"
  | "human_approved"
  | "recovered";

export interface AuditEntry {
  id: string;
  timestamp: string;
  eventType: AuditEventType;
  opportunityId?: string;
  merchant?: string;
  detail: string;
}

const auditTrail: AuditEntry[] = [];

export function logEvent(input: Omit<AuditEntry, "id" | "timestamp">): AuditEntry {
  const event: AuditEntry = {
    id: `audit-${auditTrail.length + 1}`,
    timestamp: new Date().toISOString(),
    ...input,
  };
  auditTrail.push(event);
  return event;
}

export function getAuditTrail(): AuditEntry[] {
  return [...auditTrail];
}

export function getAuditTimeline(opportunityId: string): AuditEntry[] {
  return auditTrail.filter((e) => e.opportunityId === opportunityId);
}

export function clearAuditTrail() {
  auditTrail.length = 0;
}
