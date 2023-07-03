import { Borders, CellValue, Style } from "exceljs";
import {
  ConsumerConfig,
  ConsumerRunConfig,
  ConsumerSubscribeTopics,
  ProducerConfig,
  ProducerRecord,
} from "kafkajs";

import { FILTER_OPERATOR, LOG_LEVEL, SET_CACHE_POLICY } from "./constants";

export interface SQLRunner {
  query<T = any>(sql: string, ...args: any[]): Promise<T>;
}

export interface CacheService {
  get(key: string): Promise<any>;
  set(key: string, value: any, option: SetCacheOption): Promise<any>;
  incrBy(key: string, value?: number): Promise<any>;
  decrBy(key: string, value?: number): Promise<any>;
}

export interface SetCacheOption {
  policy: SET_CACHE_POLICY;
  value: any;
}
export interface IMessageQueueService {
  initProducer(config?: any): Promise<void>;
  initConsumer(config?: any): Promise<void>;
  listen(subscribeConfig: any, runConfig: any): Promise<void>;
  publish(record: any): Promise<void>;
}

export interface HttpResponse<T = any> {
  success?: boolean;
  code?: string;
  httpCode?: number;
  message?: string;
  data?: T;
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

export interface IFilter {
  field: string;
  operator: FILTER_OPERATOR;
  value: any;
}

export type SORT_DIRECTION = "ASC" | "DESC";

export interface ISort {
  columnName: string;
  direction: SORT_DIRECTION;
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
