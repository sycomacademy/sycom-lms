/** biome-ignore-all lint/a11y/useFocusableInteractive: <enable for accessibility> */
/** biome-ignore-all lint/complexity/noExcessiveCognitiveComplexity: <enable for complexity> */
"use client";

import React from "react";
import { cn } from "@/packages/utils/cn";

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

interface JsonViewerProps {
  data: JsonValue;
  collapsed?: boolean | number;
  searchable?: boolean;
  copyPath?: boolean;
  maxDepth?: number;
  className?: string;
}

interface JsonNodeProps {
  keyName?: string;
  value: JsonValue;
  depth: number;
  path: string;
  defaultCollapsed: boolean | number;
  maxDepth: number;
  copyPath: boolean;
  searchQuery: string;
}

function getValueType(value: JsonValue): string {
  if (value === null) {
    return "null";
  }
  if (Array.isArray(value)) {
    return "array";
  }
  return typeof value;
}

function getPreview(value: JsonValue): string {
  if (Array.isArray(value)) {
    return `Array(${value.length})`;
  }
  if (typeof value === "object" && value !== null) {
    const keys = Object.keys(value);
    return `{${keys.length > 0 ? keys.slice(0, 3).join(", ") + (keys.length > 3 ? "..." : "") : ""}}`;
  }
  return String(value);
}

function matchesSearch(value: JsonValue, query: string): boolean {
  if (!query) {
    return true;
  }
  const lowerQuery = query.toLowerCase();

  if (typeof value === "string") {
    return value.toLowerCase().includes(lowerQuery);
  }
  if (typeof value === "number") {
    return String(value).includes(lowerQuery);
  }
  if (typeof value === "boolean") {
    return String(value).includes(lowerQuery);
  }
  if (value === null) {
    return "null".includes(lowerQuery);
  }
  if (Array.isArray(value)) {
    return value.some((v) => matchesSearch(v, query));
  }
  if (typeof value === "object") {
    return Object.entries(value).some(
      ([k, v]) =>
        k.toLowerCase().includes(lowerQuery) || matchesSearch(v, query)
    );
  }
  return false;
}

function JsonNode({
  keyName,
  value,
  depth,
  path,
  defaultCollapsed,
  maxDepth,
  copyPath,
  searchQuery,
}: JsonNodeProps) {
  const shouldDefaultCollapse =
    typeof defaultCollapsed === "number"
      ? depth >= defaultCollapsed
      : defaultCollapsed;

  const [isCollapsed, setIsCollapsed] = React.useState(shouldDefaultCollapse);
  const [copied, setCopied] = React.useState(false);

  const type = getValueType(value);
  const isExpandable = type === "object" || type === "array";
  const isVisible =
    matchesSearch(value, searchQuery) ||
    (keyName?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

  React.useEffect(() => {
    if (searchQuery && isExpandable && matchesSearch(value, searchQuery)) {
      setIsCollapsed(false);
    }
  }, [searchQuery, isExpandable, value]);

  const handleToggle = React.useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleToggle();
      } else if (e.key === "ArrowRight" && isCollapsed) {
        e.preventDefault();
        setIsCollapsed(false);
      } else if (e.key === "ArrowLeft" && !isCollapsed) {
        e.preventDefault();
        setIsCollapsed(true);
      }
    },
    [handleToggle, isCollapsed]
  );

  const handleCopyPath = React.useCallback(async () => {
    await navigator.clipboard.writeText(path);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [path]);

  if (!isVisible && searchQuery) {
    return null;
  }

  const renderValue = () => {
    if (type === "null") {
      return <span className="text-muted-foreground italic">null</span>;
    }
    if (type === "boolean") {
      return <span className="text-amber-500">{String(value)}</span>;
    }
    if (type === "number") {
      return <span className="text-blue-500">{value as number}</span>;
    }
    if (type === "string") {
      return (
        <span className="text-green-600 dark:text-green-400">
          "{value as string}"
        </span>
      );
    }
    return null;
  };

  if (!isExpandable) {
    return (
      <div className="group flex items-center gap-1 py-0.5" role="treeitem">
        {keyName !== undefined && (
          <>
            <span className="text-foreground">{keyName}</span>
            <span className="text-muted-foreground">:</span>
          </>
        )}
        {renderValue()}
        {copyPath && (
          <button
            aria-label={`Copy path ${path}`}
            className="ml-1 text-muted-foreground text-xs opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
            onClick={handleCopyPath}
            type="button"
          >
            {copied ? "✓" : "⎘"}
          </button>
        )}
      </div>
    );
  }

  if (depth >= maxDepth) {
    return (
      <div className="flex items-center gap-1 py-0.5">
        {keyName !== undefined && (
          <>
            <span className="text-foreground">{keyName}</span>
            <span className="text-muted-foreground">:</span>
          </>
        )}
        <span className="text-muted-foreground italic">
          {getPreview(value)}
        </span>
      </div>
    );
  }

  const entries =
    type === "array"
      ? (value as JsonValue[]).map(
          (v, i) => [String(i), v] as [string, JsonValue]
        )
      : Object.entries(value as Record<string, JsonValue>);

  const brackets = type === "array" ? ["[", "]"] : ["{", "}"];

  return (
    <div aria-expanded={!isCollapsed} className="py-0.5" role="treeitem">
      <div className="group flex items-center gap-1">
        <button
          aria-label={isCollapsed ? "Expand" : "Collapse"}
          className="flex h-4 w-4 items-center justify-center text-muted-foreground hover:text-foreground"
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          type="button"
        >
          {isCollapsed ? "▶" : "▼"}
        </button>
        {keyName !== undefined && (
          <>
            <span className="text-foreground">{keyName}</span>
            <span className="text-muted-foreground">:</span>
          </>
        )}
        <span className="text-muted-foreground">
          {brackets[0]}
          {isCollapsed && (
            <>
              <span className="mx-1 text-xs italic">{getPreview(value)}</span>
              {brackets[1]}
            </>
          )}
        </span>
        {copyPath && (
          <button
            aria-label={`Copy path ${path}`}
            className="ml-1 text-muted-foreground text-xs opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
            onClick={handleCopyPath}
            type="button"
          >
            {copied ? "✓" : "⎘"}
          </button>
        )}
      </div>
      {!isCollapsed && (
        <div className="ml-4 border-border border-l pl-2" role="group">
          {entries.map(([k, v]) => (
            <JsonNode
              copyPath={copyPath}
              defaultCollapsed={defaultCollapsed}
              depth={depth + 1}
              key={k}
              keyName={k}
              maxDepth={maxDepth}
              path={type === "array" ? `${path}[${k}]` : `${path}.${k}`}
              searchQuery={searchQuery}
              value={v}
            />
          ))}
          <div className="text-muted-foreground">{brackets[1]}</div>
        </div>
      )}
    </div>
  );
}

export function JsonViewer({
  data,
  collapsed = false,
  searchable = false,
  copyPath = true,
  maxDepth = 10,
  className,
}: JsonViewerProps) {
  const [searchQuery, setSearchQuery] = React.useState("");

  return (
    <div
      aria-label="JSON data"
      className={cn("font-mono text-sm", className)}
      data-slot="json-viewer"
      role="tree"
    >
      {searchable && (
        <div className="mb-2">
          <input
            className="w-full rounded border border-border bg-background px-2 py-1 text-sm"
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            type="text"
            value={searchQuery}
          />
        </div>
      )}
      <div className="overflow-auto">
        <JsonNode
          copyPath={copyPath}
          defaultCollapsed={collapsed}
          depth={0}
          maxDepth={maxDepth}
          path="$"
          searchQuery={searchQuery}
          value={data}
        />
      </div>
    </div>
  );
}

export type { JsonViewerProps, JsonValue };
