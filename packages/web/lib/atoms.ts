import { atomWithStorage } from "./atomWithStorage";

export const usernameAtom = atomWithStorage<string | null>("username", null);
