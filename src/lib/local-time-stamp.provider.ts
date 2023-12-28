import { TimestampProvider } from '../interface/timestamp.interface';

export class LocalTimeStampProvider implements TimestampProvider {
  public now(): number {
    return new Date().getTime();
  }
}