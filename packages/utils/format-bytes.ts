/**
 * Formats bytes into a human-readable string
 * @param bytes - Number of bytes
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted string (e.g., "1.5 MB")
 */
export function formatBytes(
  bytes: number,
  decimals = 2,
  type: "accurate" | "normal" = "normal"
): string {
  const k = type === "accurate" ? 1000 : 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes =
    type === "accurate"
      ? ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
      : ["Bytes", "KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];

  if (bytes === 0) {
    return "0 Bytes";
  }

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${Number.parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`;
}
