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
} from "kafkajs";

export class KafkaService implements IMessageQueueService {
  protected _kafka: Kafka;

  protected _producer: Producer;
  protected _consumer: Consumer;

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
    await this._consumer.subscribe(subscribeConfig);

    return this._consumer.run(runConfig);
  }

  async publish(record: ProducerRecord): Promise<void> {
    this._producer.send(record);
  }
}
