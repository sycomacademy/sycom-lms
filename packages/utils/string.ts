const NAME_WORDS = /\s+/;

export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function getInitials(name: string) {
  return name
    .split(NAME_WORDS)
    .map((s) => s[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
