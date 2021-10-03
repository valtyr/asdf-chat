export interface PresenceCursorLocation {
  x: number;
  y: number;
}

export interface PresenceUser {
  id: string;
  username: string;
  cursor: PresenceCursorLocation | null;
}

export interface CursorEvent {
  type: "cursor";
  x: number;
  y: number;
}

export interface TickEvent {
  type: "tick";
  users: PresenceUser[];
}

export type ClientPresenceEvent = CursorEvent;
export type ServerPresenceEvent = TickEvent;
