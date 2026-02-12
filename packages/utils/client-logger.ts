/**
 * Thin client-side logger that routes to console.
 * Use this in client components instead of Pino (which is server-only).
 * Same API as server logger for consistency; can later add Sentry or backend transmission.
 */

interface ClientLogger {
  info: (message: string, data?: object) => void;
  error: (message: string, data?: object) => void;
  warn: (message: string, data?: object) => void;
  debug: (message: string, data?: object) => void;
}

function formatContext(ctx?: string): string {
  if (!ctx) {
    return "";
  }
  if (ctx.startsWith("[") && ctx.endsWith("]")) {
    return ctx;
  }
  return `[${ctx}]`;
}

function createClientLoggerAdapter(prefixContext?: string): ClientLogger {
  const formattedContext = formatContext(prefixContext);

  const formatMessage = (message: string): string =>
    formattedContext ? `${formattedContext} ${message}` : message;

  return {
    info: (message: string, data?: object) => {
      const msg = formatMessage(message);
      if (data) {
        console.info(msg, data);
      } else {
        console.info(msg);
      }
    },
    error: (message: string, data?: object) => {
      const msg = formatMessage(message);
      if (data) {
        console.error(msg, data);
      } else {
        console.error(msg);
      }
    },
    warn: (message: string, data?: object) => {
      const msg = formatMessage(message);
      if (data) {
        console.warn(msg, data);
      } else {
        console.warn(msg);
      }
    },
    debug: (message: string, data?: object) => {
      if (process.env.NODE_ENV !== "development") {
        return;
      }
      const msg = formatMessage(message);
      if (data) {
        console.debug(msg, data);
      } else {
        console.debug(msg);
      }
    },
  };
}

export const clientLogger = createClientLoggerAdapter();

/**
 * Create a child logger with additional context for client components.
 */
export function createClientLoggerWithContext(context: string): ClientLogger {
  return createClientLoggerAdapter(context);
}
