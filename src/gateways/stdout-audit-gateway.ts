import { LOG_LEVEL } from "../constants";
import { loggers } from "../pkg";
import { AuditGateway, Logger } from "../interfaces";

export class StdOutAuditGateway implements AuditGateway {
  protected logger: Logger;

  constructor() {
    this.logger = new loggers.PinoLogger();
  }

  public async publish(
    logId: string,
    level: LOG_LEVEL,
    content: any
  ): Promise<any> {
    return this.logger.info(
      `[LogId ${logId}]`,
      `[${level.toUpperCase}]`,
      content
    );
  }
}
