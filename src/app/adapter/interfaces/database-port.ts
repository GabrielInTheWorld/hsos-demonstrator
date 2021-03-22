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

export interface DatabasePort {
  keys(prefix: string): Promise<string[]>;
  set<T>(prefix: string, key: string, obj: T): Promise<string>;
  get<T>(prefix: string, key: string, modelConstructor?: Constructor, defaultValue?: T): Promise<T>;
  getAll<T>(prefix: string, modelConstructor?: Constructor, defaultValue?: T): Promise<T[]>;
  remove(prefix: string, key: string): Promise<boolean>;
  find<T>(fieldKey: keyof T, fieldValue: any): Promise<T[]>;
  clear(): Promise<void>;
  getReplicaObject(
    prefix: string,
    modelConstructor?: new <T>(...args: any) => T,
    indexedFields?: string[]
  ): Promise<ReplicaObject>;
}
