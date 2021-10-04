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

export type ClientPresenceEvent = CursorEvent;

export interface IdEvent {
  type: "id";
  id: string;
}

export interface TickEvent {
  type: "tick";
  users: PresenceUser[];
}

export type ServerPresenceEvent = TickEvent | IdEvent;
