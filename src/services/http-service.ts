import axios from "axios";

import { PinoLogger } from "../pkg/logger";
import { APP_ERROR, HttpMethod } from "../constants";
import {
  HttpRequestOption,
  HttpService,
  Logger,
  OperationResult,
} from "../interfaces";

export class AxiosHttpService implements HttpService {
  constructor(protected logger: Logger = new PinoLogger()) {}

  public async send<T = any>(
    method: HttpMethod,
    url: string,
    options: HttpRequestOption = {}
  ): Promise<OperationResult<T>> {
    let response: any;

    try {
      response = await axios.request({
        method,
        url,
        headers: options.headers,
        data: options.body,
        params: options.query,
        ...options,
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
    } catch (error: any) {
      const errMsg =
        error?.message ||
        response?.data?.message ||
        "error sending http request";

      const errDetails = response.data?.data ||
        response.data || { stack: error.stack };
      this.logger.error(error);

      // Due to timeout
      if (error?.code && error.code === APP_ERROR.HTTP_REQ_TIMEOUT) {
        return {
          success: false,
          code: APP_ERROR.HTTP_REQ_TIMEOUT,
          httpCode: 408,
          message: "request timeout",
        };
      }

      return {
        success: false,
        message: error.message,
        data: response.data,
      };
    }
  }
}
