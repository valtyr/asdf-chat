export interface CreateMessageEvent {
  type: "createMessage";
  message: string;
}

export interface NewMessageEvent {
  type: "newMessage";
  message: string;
  username: string;
  timestamp: string;
}

export interface SetupEvent {
  type: "setup";
  username: string;
}

export interface StartTypingEvent {
  type: "startTyping";
}

export interface StopTypingEvent {
  type: "stopTyping";
}

export interface TypingStateEvent {
  type: "typingState";
  typingState: {
    id: string;
    lastTypingEvent: number;
    username: string;
  }[];
}

export type ChatEvent =
  | CreateMessageEvent
  | NewMessageEvent
  | SetupEvent
  | StartTypingEvent
  | StopTypingEvent
  | TypingStateEvent;
