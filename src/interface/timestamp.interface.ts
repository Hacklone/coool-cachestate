export type Timestamp = number;

export interface TimeStampProvider {
  /**
   * @description provides current timestamp from EPOCH in milliseconds
   * @default new Date().getTime()
   */
  now(): Timestamp;
}