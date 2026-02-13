export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
