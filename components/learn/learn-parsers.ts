import { parseAsArrayOf, parseAsString } from "nuqs";

export const learnParsers = {
  expandedSections: parseAsArrayOf(parseAsString).withDefault([] as string[]),
} as const;
