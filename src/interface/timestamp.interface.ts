export type Timestamp = number;

export interface TimestampProvider {
  /**
   * @description provides current timestamp from EPOCH in milliseconds
   * @default new Date().getTime()
   */
  now(): Timestamp;
}