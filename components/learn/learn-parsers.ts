import { parseAsString } from "nuqs";

export const learnParsers = {
  lesson: parseAsString,
} as const;
