export type CallContext = any;
export type CallArgs = any[];

export type CacheKeyGenerator = (args: CallArgs, target: Object, propertyKey: string, descriptor: PropertyDescriptor) => CacheKey;
export type CacheKeyPrefixGenerator = (args: CallArgs, target: Object, propertyKey: string, descriptor: PropertyDescriptor) => string;
export type CacheKeySuffixGenerator = (args: CallArgs, target: Object, propertyKey: string, descriptor: PropertyDescriptor) => string;

export type CacheKey = string;
