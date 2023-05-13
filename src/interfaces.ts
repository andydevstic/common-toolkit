import { Borders, CellValue, Style } from "exceljs";
import {
  ConsumerConfig,
  ConsumerRunConfig,
  ConsumerSubscribeTopics,
  ProducerConfig,
  ProducerRecord,
} from "kafkajs";

import { LOG_LEVEL } from "./constants";

export interface IMessageQueueService {
  initProducer(config?: any): Promise<void>;
  initConsumer(config?: any): Promise<void>;
  listen(subscribeConfig: any, runConfig: any): Promise<void>;
  publish(record: any): Promise<void>;
}

export interface IKafkaService extends IMessageQueueService {
  initProducer(config?: ProducerConfig): Promise<void>;
  initConsumer(config?: ConsumerConfig): Promise<void>;
  listen(
    subscribeConfig: ConsumerSubscribeTopics,
    runConfig: ConsumerRunConfig
  ): Promise<void>;
  publish(record: ProducerRecord): Promise<void>;
}

export interface CloudStorageClient {
  generateTmpCredentials(sessionId: string): Promise<any>;
  getObjectReadStream(fileName: string): Promise<any>;
}

export interface ISort {
  columnName: string;
  direction: "ASC" | "DESC";
}

export interface EmailSender {
  send(mailOptions: SendMailOptions): Promise<void>;
}

export interface SendMailOptions {
  from?: string;
  to?: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  subject: string;
  text?: string;
  html?: string;
}

export interface ICellOptions {
  style?: Partial<Style>;
  border?: Partial<Borders>;
}

export interface ICellData {
  value: CellValue;
  options?: ICellOptions;
}

export interface STSResponse {
  RequestId: string;
  AssumedRoleUser: any;
  Credentials: {
    SecurityToken: string;
    AccessKeyId: string;
    AccessKeySecret: string;
    Expiration: string;
  };
}

export interface AuditGateway {
  publish(logId: string, level: LOG_LEVEL, content: any): Promise<any>;
}

export interface OperationResult<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  code?: string;
  httpCode?: number;
  metadata?: any;
  action?: string;
}
