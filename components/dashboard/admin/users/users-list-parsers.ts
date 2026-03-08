import {
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
} from "nuqs";

export const usersListParsers = {
  search: parseAsString.withDefault(""),
  roles: parseAsArrayOf(
    parseAsStringLiteral([
      "platform_admin",
      "content_creator",
      "platform_student",
    ] as const)
  ).withDefault([]),
  statuses: parseAsArrayOf(
    parseAsStringLiteral(["active", "banned", "unverified"] as const)
  ).withDefault([]),
  sortBy: parseAsStringLiteral([
    "name",
    "email",
    "createdAt",
  ] as const).withDefault("createdAt"),
  sortDirection: parseAsStringLiteral(["asc", "desc"] as const).withDefault(
    "desc"
  ),
  page: parseAsInteger.withDefault(1),
  pageSize: parseAsInteger.withDefault(10),
} as const;
