import OSS from "ali-oss";
import Core from "@alicloud/pop-core";

import { CloudStorageClient, STSResponse } from "../interfaces";

export interface AlibabaCloudGatewayConfig {
  accessKey: string;
  secret: string;
  apiVersion?: string;
  endpoint: string;
  timeout?: number;
  oss: {
    bucketName: string;
    region: string;
  };
  sts: {
    roleArn: string;
  };
}

export class AlibabaCloudGateway implements CloudStorageClient {
  protected coreClient: Core;
  protected ossClient: OSS;

  constructor(protected config: AlibabaCloudGatewayConfig) {
    this.coreClient = new Core({
      accessKeyId: config.accessKey,
      accessKeySecret: config.secret,
      apiVersion: config.apiVersion || "2015-04-01",
      endpoint: config.endpoint,
    });

    this.ossClient = new OSS({
      accessKeyId: config.accessKey,
      accessKeySecret: config.secret,
      region: config.oss.region,
      bucket: config.oss.bucketName,
      timeout: config.timeout || 3000,
    });
  }

  public async generateTmpCredentials(
    sessionID: string
  ): Promise<STSResponse["Credentials"]> {
    const requestResponse: STSResponse = await this.coreClient.request(
      "AssumeRole",
      {
        RoleArn: this.config.sts.roleArn,
        RoleSessionName: sessionID,
        DurationSeconds: this.config.timeout || 900,
      },
      {
        method: "POST",
        contentType: "application/json",
      }
    );

    return requestResponse.Credentials;
  }

  public getObjectReadStream(fileName: string): Promise<OSS.GetStreamResult> {
    return this.ossClient.getStream(fileName);
  }

  public writeFileToDestination(
    fileName: string,
    destination: string | WritableStream
  ): Promise<OSS.GetObjectResult> {
    return this.ossClient.get(fileName, destination);
  }
}
