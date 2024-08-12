import { IMessageQueueService } from "../interfaces";
import {
  Consumer,
  ConsumerConfig,
  ConsumerSubscribeTopics,
  Kafka,
  KafkaConfig,
  Producer,
  ProducerConfig,
  ConsumerRunConfig,
  ProducerRecord,
  TopicPartitionOffsetAndMetadata,
} from "kafkajs";

export class KafkaService implements IMessageQueueService {
  protected _kafka: Kafka;

  protected _producer: Producer;
  protected _consumer: Consumer;

  public get producer() {
    if (!this._producer) {
      throw new Error("producer not yet init");
    }

    return this._producer;
  }

  public get consumer() {
    if (!this._producer) {
      throw new Error("consumer not yet init");
    }

    return this._consumer;
  }

  constructor(config: KafkaConfig) {
    this._kafka = new Kafka(config);
  }

  async initProducer(config?: ProducerConfig) {
    if (this._producer) {
      console.warn("producer already initialized");

      return;
    }

    this._producer = this._kafka.producer(config);

    await this._producer.connect();
  }

  async initConsumer(config?: ConsumerConfig) {
    if (this._consumer) {
      console.warn("consumer already initialized");

      return;
    }

    this._consumer = this._kafka.consumer(config);

    await this._consumer.connect();
  }

  async listen(
    subscribeConfig: ConsumerSubscribeTopics,
    runConfig: ConsumerRunConfig
  ): Promise<void> {
    await this.consumer.subscribe(subscribeConfig);

    return this.consumer.run(runConfig);
  }

  async publish(record: ProducerRecord): Promise<void> {
    this._producer.send(record);
  }

  async commitOffsets(data: TopicPartitionOffsetAndMetadata[]): Promise<void> {
    return this.consumer.commitOffsets(data);
  }
}
