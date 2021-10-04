import {
  PresenceCursorLocation,
  PresenceUser,
} from "@asdf-chat/types/lib/presence";
import Avatar from "boring-avatars";
import { AnimatePresence, motion } from "framer-motion";
import { useAtom } from "jotai";
import React, {
  MouseEventHandler,
  useCallback,
  useEffect,
  useState,
} from "react";
import { usernameAtom } from "../../lib/atoms";
import { usePresence } from "../../lib/usePresence";

const Cursor: React.FC<{
  username: string;
  cursor: PresenceCursorLocation;
}> = ({ username, cursor }) => (
  <motion.div
    className="pointer-events-none absolute top-0 left-0"
    initial={{ opacity: 0, scale: 0, x: 100, y: 100 }}
    animate={{ x: cursor.x, y: cursor.y, opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0 }}
    transition={{
      ease: "anticipate",
      x: { type: "spring", damping: 15 },
      y: { type: "spring", damping: 15 },
    }}
  >
    <div className="relative">
      <img src="/cursor.svg" className="drop-shadow-md" />
      <div className="absolute top-4 left-2 bg-yellow-100 px-1 py-0.5 rounded-md text-yellow-700 text-xs opacity-60">
        {username}
      </div>
    </div>
  </motion.div>
);

const Cursors: React.FC<{ users: PresenceUser[] }> = ({ users }) => (
  <div className="h-0">
    <AnimatePresence>
      {users.map(
        (u) =>
          u.cursor && (
            <Cursor username={u.username} cursor={u.cursor} key={u.id} />
          )
      )}
    </AnimatePresence>
  </div>
);

const Presence: React.FC<{ roomId: string }> = ({ roomId }) => {
  const [username] = useAtom(usernameAtom);

  const { updateCursor, users } = usePresence(roomId, username || "");

  const onMouseMove = useCallback<MouseEventHandler>((e) => {
    const x = e.clientX;
    const y = e.clientY;
    updateCursor({ x, y });
  }, []);

  return (
    <>
      <Cursors users={users} />
      <div
        className="flex flex-col min-h-screen relative overflow-hidden"
        onMouseMove={onMouseMove}
      >
        <div className="border-b flex-row">
          <div className="ml-auto flex flex-row-reverse mr-5 my-2">
            {users.map((u) => (
              <div className="relative -ml-5 border-2 border-white rounded-full overflow-hidden">
                <Avatar name={u.username} variant="beam" size={35} square />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Presence;
