import { AuditGateway } from "../interfaces";
import { LogObject } from "../models/audit-log";

export class AuditService {
  constructor(protected auditCarrier: AuditGateway) {}

  public async emitLog(log: LogObject): Promise<any> {
    let result = null;
    try {
      result = await this.auditCarrier.publish(
        log.logId,
        log.level,
        log.toJSON()
      );
    } catch (error) {
      console.error(`[${log.logId}]failed to emit log: ` + log.toJSON());
      console.error(error);
    }

    return result;
  }
}
