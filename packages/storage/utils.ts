import { FILE_CATEGORIES, type FileCategory } from "@/packages/db/schema/files";

/**
 * Generate a prefixed ID
 */
export function generateId(prefix: string): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 10);
  return `${prefix}_${timestamp}${randomPart}`;
}

/**
 * Sanitize a filename for safe storage
 * - Removes/replaces unsafe characters
 * - Preserves file extension
 * - Converts to lowercase
 */
export function sanitizeFilename(filename: string): string {
  // Get extension
  const lastDot = filename.lastIndexOf(".");
  const name = lastDot > 0 ? filename.slice(0, lastDot) : filename;
  const ext = lastDot > 0 ? filename.slice(lastDot) : "";

  // Sanitize name: remove unsafe chars, replace spaces with hyphens
  const sanitized = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\-_]/g, "-") // Replace unsafe chars with hyphen
    .replace(/-+/g, "-") // Collapse multiple hyphens
    .replace(/^-|-$/g, "") // Remove leading/trailing hyphens
    .slice(0, 100); // Limit length

  return `${sanitized || "file"}${ext.toLowerCase()}`;
}

/**
 * Build a storage key/path for a file
 *
 * Format: /{scope}/{scopeId}/{category}/{entityType}/{entityId}/{fileId}-{filename}
 *
 * Examples:
 * - /user/usr_abc123/avatar/profile/prf_xyz/fil_001-avatar.png
 * - /org/org_sycom/video/course/crs_001/fil_002-intro.mp4
 */
export function buildStorageKey(params: {
  scope: string;
  scopeId: string;
  category: string;
  entityType: string;
  entityId: string;
  fileId: string;
  filename: string;
}): string {
  const sanitizedFilename = sanitizeFilename(params.filename);

  return [
    params.scope,
    params.scopeId,
    params.category,
    params.entityType,
    params.entityId,
    `${params.fileId}-${sanitizedFilename}`,
  ].join("/");
}

/**
 * Validate file against category constraints
 */
export function validateFile(
  category: FileCategory,
  contentType: string,
  size: number
): { valid: boolean; error?: string } {
  const constraints = FILE_CATEGORIES[category];

  // Check size
  if (size > constraints.maxSize) {
    const maxSizeMB = Math.round(constraints.maxSize / (1024 * 1024));
    return {
      valid: false,
      error: `File size exceeds maximum of ${maxSizeMB}MB for ${category}`,
    };
  }

  // Check content type
  const allowedTypes = constraints.allowedTypes;

  if (allowedTypes !== null) {
    const isAllowed = allowedTypes.some((type) => {
      if (type.endsWith("*")) {
        // Wildcard match (e.g., "application/vnd.openxmlformats-*")
        return contentType.startsWith(type.slice(0, -1));
      }
      return contentType === type;
    });

    if (!isAllowed) {
      return {
        valid: false,
        error: `File type ${contentType} is not allowed for ${category}`,
      };
    }
  } else {
    // For 'attachment' category, check against all allowed types
    const allAllowedTypes: string[] = [];
    for (const c of Object.values(FILE_CATEGORIES)) {
      if (c.allowedTypes !== null) {
        allAllowedTypes.push(...c.allowedTypes);
      }
    }

    const isAllowed = allAllowedTypes.some((type) => {
      if (type.endsWith("*")) {
        return contentType.startsWith(type.slice(0, -1));
      }
      return contentType === type;
    });

    if (!isAllowed) {
      return {
        valid: false,
        error: `File type ${contentType} is not allowed`,
      };
    }
  }

  return { valid: true };
}

/**
 * Get file extension from content type
 */
export function getExtensionFromContentType(contentType: string): string {
  const map: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "video/mp4": ".mp4",
    "video/webm": ".webm",
    "video/quicktime": ".mov",
    "application/pdf": ".pdf",
    "application/msword": ".doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      ".docx",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
      ".xlsx",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation":
      ".pptx",
  };

  return map[contentType] || "";
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB"];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${Number.parseFloat((bytes / k ** i).toFixed(1))} ${units[i]}`;
}
