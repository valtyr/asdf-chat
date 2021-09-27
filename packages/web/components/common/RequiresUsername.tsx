import { useAtom } from "jotai";
import React, { useCallback, useState } from "react";
import { usernameAtom } from "../../lib/atoms";

import { motion, AnimatePresence } from "framer-motion";

import Button from "../widgets/Button";
import Input from "../widgets/Input";
import Label from "../widgets/Label";

const RequiresUsername: React.FC = ({ children }) => {
  const [username, setUsername] = useAtom(usernameAtom);
  const [inputValue, setInputValue] = useState("");

  const submit = useCallback(() => {
    setUsername(inputValue);
  }, [inputValue]);

  const validInput = !!inputValue.trim();

  return (
    <>
      <AnimatePresence initial={false}>
        {!username && (
          <motion.div
            className="flex fixed inset-0 flex-col items-center justify-center py-2 bg-white"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={{
              visible: { opacity: 1, y: 0 },
              hidden: { opacity: 0, y: -100 },
            }}
            transition={{
              opacity: {
                ease: "easeInOut",
              },
              y: {
                type: "spring",
                stiffness: 300,
              },
            }}
            key="modal"
          >
            <div className="w-full max-w-sm space-y-4" key="modal-container">
              <Label htmlFor="displayName" label="Display name">
                <Input
                  id="displayName"
                  placeholder="Display name"
                  autoComplete="off"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
              </Label>
              <Button
                buttonStyle="primary"
                isDisabled={!validInput}
                onPress={submit}
              >
                Let's go
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {username && children}
    </>
  );
};

export default RequiresUsername;
