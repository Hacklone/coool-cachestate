import { TimeStampProvider } from '../interface/timestamp.interface';

export class LocalTimeStampProvider implements TimeStampProvider {
  public now(): number {
    return new Date().getTime();
  }
}