import {
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
} from "nuqs";

export const libraryListParsers = {
  search: parseAsString.withDefault(""),
  categories: parseAsArrayOf(parseAsString).withDefault([]),
  difficulties: parseAsArrayOf(
    parseAsStringLiteral([
      "beginner",
      "intermediate",
      "advanced",
      "expert",
    ] as const)
  ).withDefault([]),
  sortBy: parseAsStringLiteral([
    "title",
    "createdAt",
    "updatedAt",
  ] as const).withDefault("updatedAt"),
  sortDirection: parseAsStringLiteral(["asc", "desc"] as const).withDefault(
    "desc"
  ),
  page: parseAsInteger.withDefault(1),
  pageSize: parseAsInteger.withDefault(12),
} as const;
