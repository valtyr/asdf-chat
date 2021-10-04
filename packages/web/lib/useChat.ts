import create from "zustand";
import produce from "immer";

import { ChatEvent, TypingStateEvent } from "@asdf-chat/types/lib/chat";

import useWebSocket from "react-use-websocket";
import throttle from "./throttle";

export interface ChannelUser {
  id: string;
  username: string;
  lastMessageAt?: Date;
}

export interface ChannelMessage {
  message: string;
  username: string;
  timestamp: Date;
}

export interface TypingStateItem {
  id: string;
  lastTypingEvent: number;
  username: string;
}

export interface Channel {
  id: string;
  messages: ChannelMessage[];
  users: ChannelUser[];
  typingState: TypingStateItem[];
}

export interface Store {
  channels: Partial<Record<string, Channel>>;
  initializeChannel: (id: string) => void;
  appendMessage: (message: ChannelMessage, channelId: string) => void;
  setTypingState: (typingState: TypingStateItem[], channelId: string) => void;
}

export const useChatStore = create<Store>((set) => ({
  channels: {},
  initializeChannel: (id: string) =>
    set(
      produce<Store>((state) => {
        if (!state.channels[id])
          state.channels[id] = {
            id,
            messages: [],
            typingState: [],
            users: [],
          };
      })
    ),
  appendMessage: (message: ChannelMessage, channelId: string) =>
    set(
      produce<Store>((state) => {
        state.channels[channelId]?.messages.push(message);
      })
    ),
  setTypingState: (typingState: TypingStateItem[], channelId: string) =>
    set(
      produce<Store>((state) => {
        if (typeof state.channels[channelId] !== "undefined")
          state.channels[channelId]!.typingState = typingState;
      })
    ),
}));

export const useChat = (channelId: string, username: string) => {
  const initializeChannel = useChatStore((s) => s.initializeChannel);
  const appendMessage = useChatStore((s) => s.appendMessage);
  const setTypingState = useChatStore((s) => s.setTypingState);
  const channel = useChatStore((s) => s.channels[channelId] || null);

  const { sendJsonMessage, readyState } = useWebSocket(
    `ws://localhost:8787/room/${encodeURIComponent(channelId)}/websocket`,
    {
      onOpen: () => {
        sendJsonMessage({
          type: "setup",
          username: username,
        } as ChatEvent);
        initializeChannel(channelId);
      },
      onMessage: (e) => {
        const data = JSON.parse(e.data) as ChatEvent;
        switch (data.type) {
          case "newMessage": {
            appendMessage(
              {
                message: data.message,
                timestamp: new Date(data.timestamp),
                username: data.username,
              },
              channelId
            );
            break;
          }
          case "typingState": {
            setTypingState(data.typingState, channelId);
          }
        }
      },
    }
  );

  const createMessage = (message: string) =>
    sendJsonMessage({
      type: "createMessage",
      message: message.trim(),
    } as ChatEvent);

  const [startTyping] = throttle(
    () => sendJsonMessage({ type: "startTyping" } as ChatEvent),
    500
  );

  const [stopTyping] = throttle(
    () => sendJsonMessage({ type: "stopTyping" } as ChatEvent),
    500
  );

  return { channel, createMessage, readyState, startTyping, stopTyping };
};
