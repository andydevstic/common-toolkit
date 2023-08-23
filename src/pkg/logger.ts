import pino from "pino";

import { Logger } from "../interfaces";

export class PinoLogger implements Logger {
  protected _logger: pino.Logger;

  constructor() {
    this._logger = pino();
  }

  public info(message: string, ...args: any[]): void {
    return this._logger.info(message, ...args);
  }

  public error(message: string, ...args: any[]): void {
    return this._logger.error(message, ...args);
  }

  public warn(message: string, ...args: any[]): void {
    return this._logger.warn(message, ...args);
  }
}
