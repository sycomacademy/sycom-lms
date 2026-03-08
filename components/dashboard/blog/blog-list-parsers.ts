import {
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
} from "nuqs";

export const blogListParsers = {
  view: parseAsStringLiteral(["card", "table"] as const).withDefault("card"),
  search: parseAsString.withDefault(""),
  statuses: parseAsArrayOf(
    parseAsStringLiteral(["draft", "published"] as const)
  ).withDefault([]),
  sortBy: parseAsStringLiteral([
    "title",
    "createdAt",
    "updatedAt",
    "publishedAt",
    "status",
  ] as const).withDefault("updatedAt"),
  sortDirection: parseAsStringLiteral(["asc", "desc"] as const).withDefault(
    "desc"
  ),
  page: parseAsInteger.withDefault(1),
  pageSize: parseAsInteger.withDefault(12),
} as const;
