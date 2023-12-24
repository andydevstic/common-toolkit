import { Borders, CellValue, Style } from "exceljs";
import {
  ConsumerConfig,
  ConsumerRunConfig,
  ConsumerSubscribeTopics,
  ProducerConfig,
  ProducerRecord,
} from "kafkajs";

import {
  FILTER_OPERATOR,
  HttpMethod,
  LOG_LEVEL,
  SET_CACHE_POLICY,
} from "./constants";

export interface Subscription {
  unsubscribe(): Promise<void>;
}

export interface DelayedTaskOps {
  callback: () => void;
  startOnCreate?: boolean;
  timeout: number;
}

export interface TaskRescheduleOps {
  msFromNow?: number;
  runTime?: Date;
}

export type DelayFn = (callback: () => void, timeout: number) => Subscription;

export interface ITask {
  id: string;
  isRunning: boolean;
  isCancelled: boolean;
  isCron: boolean;
  start(): Promise<void>;
  cancel(): Promise<void>;
  lastRun(): Promise<Date>;
  nextRun(): Promise<Date>;
  reschedule(options: TaskRescheduleOps): Promise<void>;
}

export interface TaskRegistry {
  register(options: DelayedTaskOps): Promise<ITask>;
  count(): Promise<number>;
  getTasks(): Promise<ITask[]>;
  getTaskById(id: string): Promise<ITask>;
  cancelTaskById(id: string): Promise<void>;
  startTaskById(id: string): Promise<void>;
}

export interface SQLRunner {
  query<T = any>(sql: string, ...args: any[]): Promise<T>;
}

export interface HttpRequestOption {
  serviceName?: string;
  body?: any;
  query?: any;
  headers?: Record<string, string>;
  reqId?: string;
}

export interface Logger {
  info(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
}

export interface HttpService {
  send<T = any>(
    method: HttpMethod,
    url: string,
    options: HttpRequestOption
  ): Promise<OperationResult<T>>;
}

export interface InternalAuthGatewayOptions {
  endpointURL: string;
  secret: string;
  serviceName?: string;
}

export interface InternalAuthLoginResult {
  accessToken?: string;
  code?: string;
}

export interface InternalServiceAuthResult {
  name: string;
  type: "internal" | "external";
}

export interface CacheService {
  get(key: string): Promise<any>;
  set(key: string, value: any, option?: SetCacheOption): Promise<any>;
  del(...keys: string[]): Promise<void>;
  incrBy(key: string, value?: number): Promise<any>;
  decrBy(key: string, value?: number): Promise<any>;
}

export interface HashCacheService {
  hset(key: string, field: string, value: any): Promise<void>;
  hget(key: string, field: string): Promise<string>;
  hlen(key: string): Promise<number>;
}

export interface ListCacheService {
  lpush(key: string, value: any): Promise<void>;
  lset(key: string, index: number, value: any): Promise<void>;
  rpush(key: string, value: any): Promise<void>;
  lrange(key: string, start: number, end: number): Promise<string[]>;
  lindex(key: string, index: number): Promise<string>;
  llen(key: string): Promise<number>;
}

export interface LockResult {
  isLocked: boolean;
  attemptsLeft: number;
}

export interface CRUDService<T = any> {
  findById(userId: any, ...options: any[]): Promise<T>;
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

export interface PutObjectOption {
  domain: string;
  timeout?: number;
}

export interface CloudStorageClient {
  generateTmpCredentials(sessionId: string): Promise<any>;
  getObjectReadStream(fileName: string): Promise<any>;
  uploadRemoteObjectToBucket(
    fileName: string,
    remoteUrl: string,
    options?: PutObjectOption
  ): Promise<string>;
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
