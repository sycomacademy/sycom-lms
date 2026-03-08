import {
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
} from "nuqs";

export const coursesListParsers = {
  view: parseAsStringLiteral(["card", "table"] as const).withDefault("card"),
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
  statuses: parseAsArrayOf(
    parseAsStringLiteral(["draft", "published"] as const)
  ).withDefault([]),
  sortBy: parseAsStringLiteral([
    "title",
    "createdAt",
    "updatedAt",
    "status",
  ] as const).withDefault("updatedAt"),
  sortDirection: parseAsStringLiteral(["asc", "desc"] as const).withDefault(
    "desc"
  ),
  page: parseAsInteger.withDefault(1),
  pageSize: parseAsInteger.withDefault(12),
} as const;
