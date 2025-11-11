type LogLevel = "debug" | "info" | "warn" | "error";

interface LogFields {
  [key: string]: unknown;
}

function isDebugEnabled(): boolean {
  const flag = (process.env.ENABLE_DEBUG_LOGS || "").toLowerCase();
  return flag === "true" || process.env.NODE_ENV === "development";
}

function format(level: LogLevel, message: string, fields?: LogFields): string {
  const payload: Record<string, unknown> = {
    level,
    msg: message,
    time: new Date().toISOString(),
  };
  if (fields && typeof fields === "object") {
    for (const [k, v] of Object.entries(fields)) {
      payload[k] = v;
    }
  }
  try {
    return JSON.stringify(payload);
  } catch {
    return JSON.stringify({ level, msg: message, time: payload.time });
  }
}

export const logger = {
  debug(message: string, fields?: LogFields): void {
    if (!isDebugEnabled()) return;
    // eslint-disable-next-line no-console
    console.log(format("debug", message, fields));
  },
  info(message: string, fields?: LogFields): void {
    if (!isDebugEnabled()) return;
    // eslint-disable-next-line no-console
    console.log(format("info", message, fields));
  },
  warn(message: string, fields?: LogFields): void {
    // eslint-disable-next-line no-console
    console.warn(format("warn", message, fields));
  },
  error(message: string, fields?: LogFields): void {
    // eslint-disable-next-line no-console
    console.error(format("error", message, fields));
  },
};
