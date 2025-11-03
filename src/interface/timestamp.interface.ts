export type Timestamp = number;

/**
 * Interface representing a timestamp provider.
 */
export interface TimestampProvider {
  /**
   * @description provides current timestamp from EPOCH in milliseconds
   * @default new Date().getTime()
   */
  now(): Timestamp;
}