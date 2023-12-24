import {
  HttpService,
  InternalAuthGatewayOptions,
  InternalAuthLoginResult,
  InternalServiceAuthResult,
  OperationResult,
} from "../interfaces";

export class InternalAuthGateway {
  constructor(
    protected httpService: HttpService,
    protected options: InternalAuthGatewayOptions
  ) {}

  public async login(): Promise<OperationResult<InternalAuthLoginResult>> {
    return this.httpService.send(
      "post",
      `${this.options.endpointURL}/actors/login`,
      {
        body: {
          secret: this.options.secret,
        },
        serviceName: this.options.serviceName,
      }
    );
  }

  public async verify(
    accessToken: string
  ): Promise<OperationResult<InternalServiceAuthResult>> {
    return this.httpService.send(
      "post",
      `${this.options.endpointURL}/actors/verify`,
      {
        body: {
          accessToken,
        },
        serviceName: this.options.serviceName,
      }
    );
  }
}
