import { LOG_LEVEL } from "../constants";
import { AuditGateway, HttpService } from "../interfaces";

interface WebhookAuditGatewayConfig {
  projectName: string;
}

export class WebhookAuditGateway implements AuditGateway {
  public static contentField = "content";

  constructor(
    protected webhookURL: string,
    protected httpService: HttpService,
    protected config: WebhookAuditGatewayConfig
  ) {}

  public publish(logId: string, level: LOG_LEVEL, content: any): Promise<any> {
    const msg = `[${this.config.projectName}] | [${level}] | [${logId}]: ${content}`;

    return this.httpService.send("post", this.webhookURL, {
      headers: {
        "Content-Type": "application/json",
      },
      body: {
        [WebhookAuditGateway.contentField]: msg,
      },
    });
  }
}
