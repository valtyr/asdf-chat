import { PaperPlaneIcon } from "@radix-ui/react-icons";
import { useAtom } from "jotai";
import React, { useState } from "react";
import { usernameAtom } from "../../lib/atoms";
import { ChannelMessage, useChat } from "../../lib/useChat";
import Button from "../widgets/Button";
import Input from "../widgets/Input";

import { Virtuoso } from "react-virtuoso";
import classNames from "../../lib/classNames";

const Presence: React.FC<{ channelId: string }> = ({ channelId }) => {
  const [username] = useAtom(usernameAtom);
  const [inputValue, setInputValue] = useState("");

  const { channel, createMessage, startTyping } = useChat(
    channelId,
    username || ""
  );

  const onSubmit = () => {
    const trimmed = inputValue.trim();

    if (trimmed) {
      createMessage(inputValue.trim());
      setInputValue("");
    }
  };

  const messages = channel?.messages || [];
  const typing =
    channel?.typingState.filter((u) => u.username !== username) || [];

  return (
    <div className="flex flex-col min-h-screen p-4">
      <div className="border rounded-lg p-2 shadow-sm">#{channelId}</div>
      <Virtuoso
        className="flex-1 mx-3"
        followOutput="smooth"
        totalCount={messages.length || 0}
        alignToBottom
        itemContent={(index) => (
          <Message
            ownMessage={messages[index].username === username}
            message={messages[index]}
            showHeader={
              messages[index].username !== messages[index - 1]?.username
            }
          />
        )}
      />
      <div className="flex p-3">
        <Input
          className="flex-1 rounded-r-none"
          value={inputValue}
          onChange={(e) => {
            startTyping();
            setInputValue(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.code === "Enter") onSubmit();
          }}
          placeholder="Type a message"
        />
        <Button
          buttonStyle="secondary"
          className="rounded-l-none border-l-0 px-4"
          onPress={onSubmit}
        >
          <PaperPlaneIcon />
        </Button>
      </div>
      <div className="py-0.5 px-3 text-xs">
        &nbsp; {typing.map((u) => u.username).join(", ")}
        {(typing.length && " typing...") || ""}
      </div>
    </div>
  );
};

export default Presence;
