import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

import { LOG_LEVEL } from "../constants";
import { AuditGateway } from "../interfaces";
import { maskFn } from "../pkg/string-utils";

export interface HttpAuditGatewayConfig {
  baseUrl: string;
  appName?: string;
  auth: {
    username: string;
    password: string;
  };
}

export class HttpAuditGateway implements AuditGateway {
  protected baseURL: string;
  protected access_token: string;

  constructor(protected config: HttpAuditGatewayConfig) {
    if (!config.baseUrl) {
      throw new Error("Missing base url config");
    }

    this.baseURL = config.baseUrl;
  }

  public async publish(
    logId: string,
    level: LOG_LEVEL,
    content: Record<string, any>
  ) {
    const response = await this.send(logId, {
      method: "POST",
      url: "/event/create",
      data: {
        ...content,
        level,
      },
    });

    return response?.data;
  }

  private async auth(logId = "system", forceReAuth = false) {
    if (this.access_token || forceReAuth) {
      return;
    }

    const authResponse = await this.send<{ access_token: string }>(
      logId,
      {
        method: "POST",
        url: "/auth/login",
        data: this.config.auth,
      },
      false,
      false
    ); // not retry, not use token

    this.access_token = authResponse?.data?.access_token;

    return !!this.access_token;
  }

  protected async send<T>(
    logId: string,
    options: AxiosRequestConfig,
    is_retry = false,
    use_access_token = true
  ): Promise<AxiosResponse<T>> {
    await this.auth();
    console.log(
      `[${logId}] ${
        is_retry ? "Resend" : "Send"
      } to Audit Service: ${JSON.stringify(options, maskFn)}`
    );

    options.baseURL = this.baseURL;
    if (use_access_token) {
      options.headers = {
        Authorization: `Bearer ${this.access_token}`,
      };
    }

    const response = await axios.request(options);

    // use token, status 401, not retry => auth & retry
    if (response?.status == 401 && use_access_token && !is_retry) {
      console.log(`[${logId}] Retrying...`);

      const isAuthSuccess = await this.auth(logId, true);

      if (isAuthSuccess) {
        return this.send(logId, options, true);
      }
    }

    return response;
  }
}
