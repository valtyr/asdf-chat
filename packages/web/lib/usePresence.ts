import produce from "immer";
import { useThrottleCallback } from "@react-hook/throttle";

import {
  ClientPresenceEvent,
  PresenceUser,
  ServerPresenceEvent,
} from "@asdf-chat/types/lib/presence";

import useWebSocket from "react-use-websocket";
import { useCallback, useState } from "react";
import { wsUrl } from "./api";

export const socketUrl = (room: string, username: string) =>
  wsUrl(
    `/api/presence/${encodeURIComponent(
      room
    )}/websocket?username=${encodeURIComponent(username)}`
  );

export const usePresence = (roomId: string, username: string) => {
  const [users, setUsers] = useState<PresenceUser[]>([]);
  const [id, setId] = useState<string | null>(null);

  const { sendJsonMessage, readyState } = useWebSocket(
    socketUrl(roomId, username),
    {
      onMessage: (e) => {
        const data = JSON.parse(e.data) as ServerPresenceEvent;
        switch (data.type) {
          case "id": {
            setId(data.id);
            break;
          }
          case "tick": {
            setUsers(data.users);
            break;
          }
        }
      },
    }
  );

  const updateCursorRaw = useCallback(
    (position: { x: number; y: number }) => {
      const message = {
        type: "cursor",
        x: position.x,
        y: position.y,
      } as ClientPresenceEvent;

      sendJsonMessage(message);
    },
    [sendJsonMessage]
  );

  return {
    users: users.filter((u) => u.id !== id),
    updateCursor: useThrottleCallback(updateCursorRaw, 10, true),
  };
};
