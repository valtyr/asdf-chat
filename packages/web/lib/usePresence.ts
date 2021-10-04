import produce from "immer";
import { useThrottleCallback } from "@react-hook/throttle";

import {
  ClientPresenceEvent,
  PresenceUser,
  ServerPresenceEvent,
} from "@asdf-chat/types/lib/presence";

import useWebSocket from "react-use-websocket";
import { useCallback, useState } from "react";

export const usePresence = (roomId: string, username: string) => {
  const [users, setUsers] = useState<PresenceUser[]>([]);
  const [id, setId] = useState<string | null>(null);

  const { sendJsonMessage, readyState } = useWebSocket(
    `ws://localhost:8787/presence/${encodeURIComponent(
      roomId
    )}/websocket?username=${encodeURIComponent(username)}`,
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
