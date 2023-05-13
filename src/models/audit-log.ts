import { LOG_LEVEL } from "../constants";

export type LogObject = ErrorLog | InfoLog | DebugLog;

export interface LogObjectData {
  logId: string;
  userId?: string;
  level: LOG_LEVEL;
  action: string;
  message?: any;
  payload?: any;
  metadata?: any;
}

export abstract class BaseLog {
  public logId: string;
  public userId: string;
  public level: LOG_LEVEL;
  public action: string;
  public message?: any;
  public payload?: any;
  public metadata?: any;

  constructor(data: Omit<LogObjectData, "level">) {
    this.logId = data.logId;
    this.userId = data.userId;
    this.action = data.action;
    this.message = data.message;
    this.metadata = data.metadata;
    this.payload = data.payload;
  }

  public abstract toJSON(): Record<string, any>;
}

export class ErrorLog extends BaseLog {
  constructor(data: Omit<LogObjectData, "level">) {
    super(data);

    this.level = LOG_LEVEL.ERROR;
  }

  public toJSON() {
    return {
      logId: this.logId,
      userId: this.userId,
      level: this.level,
      action: this.action,
      message: this.message,
      metadata: this.metadata,
      payload: this.payload,
    };
  }
}

export class FatalLog extends BaseLog {
  constructor(data: Omit<LogObjectData, "level">) {
    super(data);

    this.level = LOG_LEVEL.FATAL;
  }

  public toJSON() {
    return {
      logId: this.logId,
      userId: this.userId,
      level: this.level,
      action: this.action,
      message: this.message,
      metadata: this.metadata,
      payload: this.payload,
    };
  }
}

export class InfoLog extends BaseLog {
  constructor(data: Omit<LogObjectData, "level">) {
    super(data);

    this.level = LOG_LEVEL.INFO;
  }

  public toJSON() {
    return {
      logId: this.logId,
      userId: this.userId,
      level: this.level,
      action: this.action,
      message: this.message,
      metadata: this.metadata,
      payload: this.payload,
    };
  }
}

export class DebugLog extends BaseLog {
  parentLogId?: string;
  parentLogType?: LOG_LEVEL;

  constructor(
    data: Omit<LogObjectData, "level"> & {
      parentLogId?: string;
      parentLogType?: LOG_LEVEL;
    }
  ) {
    super(data);

    this.level = LOG_LEVEL.DEBUG;
    this.parentLogId = data.parentLogId;
    this.parentLogType = data.parentLogType;
  }

  public toJSON() {
    return {
      logId: this.logId,
      userId: this.userId,
      level: this.level,
      action: this.action,
      message: this.message,
      metadata: this.metadata,
      payload: this.payload,
      parentLogId: this.parentLogId,
      parentLogType: this.parentLogType,
    };
  }
}
