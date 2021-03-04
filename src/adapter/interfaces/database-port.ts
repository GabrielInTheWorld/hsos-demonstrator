import { InjectableClass } from '../../application/model-layer/core/modules/decorators';

export type Constructor<T = {}> = new (...args: any) => T;

export interface ReplicaObject {
  keys: () => Promise<string[]>;
  set: <T>(key: string, obj: T) => Promise<string>;
  get: <T>(key: string, defaultValue?: T) => Promise<T>;
  getAll: <T>() => Promise<T[]>;
  remove: (key: string) => Promise<boolean>;
  find: <T>(fieldKey: keyof T, fieldValue: any) => Promise<T[]>;
  clear: () => Promise<void>;
}

export abstract class DatabasePort extends InjectableClass {
  public static readonly PREFIX = 'auth';

  public abstract keys(prefix: string): Promise<string[]>;
  public abstract set<T>(prefix: string, key: string, obj: T): Promise<string>;
  public abstract get<T>(prefix: string, key: string, modelConstructor?: Constructor, defaultValue?: T): Promise<T>;
  public abstract getAll<T>(prefix: string, modelConstructor?: Constructor, defaultValue?: T): Promise<T[]>;
  public abstract remove(prefix: string, key: string): Promise<boolean>;
  public abstract find<T>(fieldKey: keyof T, fieldValue: any): Promise<T[]>;
  public abstract clear(): Promise<void>;
  public abstract getReplicaObject(
    prefix: string,
    modelConstructor?: new <T>(...args: any) => T,
    indexedFields?: string[]
  ): Promise<ReplicaObject>;
}
