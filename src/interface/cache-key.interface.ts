export type CacheKeyGenerator = (args: any[], target: Object, propertyKey: string, descriptor: PropertyDescriptor) => CacheKey;
export type CacheKeyPrefixGenerator = (args: any[], target: Object, propertyKey: string, descriptor: PropertyDescriptor) => string;
export type CacheKeySuffixGenerator = (args: any[], target: Object, propertyKey: string, descriptor: PropertyDescriptor) => string;

export type CacheKey = string;
