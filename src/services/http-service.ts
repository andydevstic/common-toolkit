import axios from "axios";
import { createId } from "@paralleldrive/cuid2";

import { PinoLogger } from "../pkg/logger";
import { APP_ERROR, HttpMethod } from "../constants";
import {
  HttpRequestOption,
  HttpService,
  Logger,
  OperationResult,
} from "../interfaces";
import { maskSensitiveData } from "../pkg/http-request-utils";

export class AxiosHttpService implements HttpService {
  constructor(protected logger: Logger = new PinoLogger()) {}

  public async send<T = any>(
    method: HttpMethod,
    url: string,
    options: HttpRequestOption = {}
  ): Promise<OperationResult<T>> {
    const reqId = options?.reqId || createId();

    try {
      this.logger.info(
        "[HttpService]",
        `[Id: ${reqId}]`,
        options?.serviceName || `[Service ${options.serviceName}]`,
        `Send ${method} request to ${url}.`,
        `Body: ${maskSensitiveData(options.body)}`,
        `Query: ${maskSensitiveData(options.query)}`
      );

      const response = await axios.request({
        method,
        url,
        headers: options.headers,
        data: options.body,
        params: options.query,
      });

      if (response.status >= 400) {
        return {
          success: false,
          httpCode: response.status,
          data: response.data,
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      this.logger.error(error.message, error.stack);

      // Due to timeout
      if (error?.code && error.code === APP_ERROR.HTTP_REQ_TIMEOUT) {
        return {
          success: false,
          code: APP_ERROR.HTTP_REQ_TIMEOUT,
          message: "request timeout",
        };
      }

      return {
        success: false,
        message: error.message,
      };
    }
  }
}
