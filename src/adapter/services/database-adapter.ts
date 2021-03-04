import PouchDB from 'pouchdb';
import * as PouchDBFind from 'pouchdb-find';

import { Constructor, DatabasePort, ReplicaObject } from '../interfaces/database-port';
import { Constructable } from '../../application/model-layer/core/modules/decorators';
import { Logger } from '../../application/services/logger';

type DTO<T> = T & DatabaseObject;

interface DatabaseObject {
  _id: string;
  _rev: string;
  key: string;
}

@Constructable(DatabasePort)
export class DatabaseAdapter extends DatabasePort {
  public name = 'DatabaseAdapter';

  private readonly database: PouchDB.Database;

  /**
   * Constructor.
   *
   * Initialize the database and redis commands declared above, if the database is not already initialized.
   */
  public constructor() {
    super();
    if (!this.database) {
      PouchDB.plugin(PouchDBFind);
      this.database = new PouchDB('db', { auto_compaction: true });
    }
  }

  public async keys(prefix: string): Promise<string[]> {
    Logger.debug('Search through keys:', this.getPrefix(prefix));
    const docResponse = await this.doPromise(
      'keys',
      this.database.allDocs({
        include_docs: false,
        startkey: this.getPrefix(prefix),
        endkey: `${this.getPrefix(prefix)}\ufff0`
      })
    );
    return docResponse.rows.map(doc => doc.key);
  }

  /**
   * Function to write a key/value-pair to the database. If the key is already existing, it will update the entry.
   *
   * @param key The key, where the object is found.
   * @param obj The object to store.
   *
   * @returns The key of the stored object.
   */
  public async set<T>(prefix: string, key: string, obj: T): Promise<string> {
    Logger.debug('Store new entry with: ', prefix, key, obj);
    const prefixedKey = this.getPrefixedKey(prefix, key);
    const existingDoc = await this.doPromise('set', this.database.get<T>(this.getPrefixedKey(prefix, key)));
    let update: any = {
      ...existingDoc,
      _id: Object.keys(existingDoc).length ? existingDoc._id : prefixedKey,
      key: prefixedKey
    };
    if (typeof obj === 'object' && !Array.isArray(obj)) {
      update = { ...update, ...obj };
    } else {
      update[prefixedKey] = obj;
    }
    console.log('store entry', update);
    await this.doPromise('insert', this.database.put(update));
    await this.doPromise('get', this.get(prefix, key)).then(value => console.log('stored entry:', value));
    return prefixedKey;
  }

  /**
   * This returns an object stored by the given key.
   *
   * @param key The key, where the object will be found.
   *
   * @returns The object - if there is no object stored by this key, it will return an empty object.
   */
  public async get<T>(
    prefix: string,
    key: string,
    modelConstructor?: Constructor,
    defaultValue: any = {}
  ): Promise<DTO<T>> {
    Logger.debug('Get entry by key: ', key);
    Logger.debug('Prefixed key: ', this.getPrefixedKey(prefix, key));
    const result = await this.database
      .get(this.getPrefixedKey(prefix, key))
      .then(value => value)
      .catch(() => null);
    Logger.debug('Get result:', result);
    if (modelConstructor && result) {
      Logger.debug('ModelConstructor && result');
      return new modelConstructor(result) as DTO<T>;
    }
    if (result && (result as any)[this.getPrefixedKey(prefix, key)]) {
      Logger.debug('result && key is in result');
      return (result as any)[this.getPrefixedKey(prefix, key)];
    }
    if (result) {
      Logger.debug('Only result');
      return result as DTO<T>;
    }
    Logger.debug('Nothing');
    return defaultValue as DTO<T>;
  }

  /**
   * This will delete an entry from the database.
   *
   * @param key The key of the related object to remove.
   *
   * @returns A boolean if the object was successfully deleted.
   */
  public async remove(prefix: string, key: string): Promise<boolean> {
    const result = await this.doPromise(
      'remove',
      this.database.get(this.getPrefixedKey(prefix, key)).then(doc => this.database.remove(doc))
    );
    return result.ok;
  }

  public async find<T>(fieldKey: keyof T, fieldValue: any): Promise<DTO<T>[]> {
    const result = await this.doPromise(
      'find',
      this.database.find({
        selector: { [fieldKey]: fieldValue }
      })
    );
    return result.docs as DTO<T>[];
  }

  public async getReplicaObject(
    prefix: string,
    modelConstructor?: new <T>(...args: any) => T,
    indexedFields?: string[]
  ): Promise<ReplicaObject> {
    if (indexedFields) {
      const index = await this.database.createIndex({
        index: { fields: indexedFields }
      });
    }
    return {
      find: <T>(fieldKey: keyof T, fieldValue: any) => this.find<T>(fieldKey, fieldValue),
      keys: () => this.keys(prefix),
      set: <T>(key: string, obj: T) => this.set<T>(prefix, key, obj),
      get: <T>(key: string, defaultValue: any = {}) => this.get<T>(prefix, key, modelConstructor, defaultValue),
      getAll: <T>() => this.getAll<T>(prefix),
      remove: (key: string) => this.remove(prefix, key),
      clear: () => this.clear()
    } as any;
  }

  public async getAll<T>(prefix: string, modelConstructor?: Constructor, defaultValue?: T): Promise<T[]> {
    const docResponse = await this.doPromise(
      'get-all',
      this.database.allDocs({
        include_docs: true,
        startkey: this.getPrefix(prefix),
        endkey: `${this.getPrefix(prefix)}\ufff0`
      })
    );
    console.log(
      'docResponse:',
      docResponse.rows.map(row => row.doc)
    );
    return docResponse.rows.map(row => row.doc as any);
  }

  /**
   * Clears the whole database.
   */
  public async clear(): Promise<void> {
    const docResponse = await this.doPromise('clear', this.database.allDocs());
    await Promise.all(docResponse.rows.map(doc => this.database.remove(doc.id, doc.value.rev)));
  }

  private getPrefix(prefix: string): string {
    return `${DatabasePort.PREFIX}:${prefix}`;
  }

  private getPrefixedKey(prefix: string, key: string): string {
    return `${this.getPrefix(prefix)}:${key}`;
  }

  //   private convertDocToObject<T>(result: PouchDB.Core.ExistingDocument<any>, modelConstructor?: Constructor): T {
  // if (modelConstructor && result) {
  //       Logger.debug('ModelConstructor && result');
  //       return new modelConstructor(result) as DTO<T>;
  //     }
  //     if (result && (result as any)[this.getPrefixedKey(prefix, key)]) {
  //       Logger.debug('result && key is in result');
  //       return (result as any)[this.getPrefixedKey(prefix, key)];
  //     }
  //     if (result) {
  //       Logger.debug('Only result');
  //       return result as DTO<T>;
  //     }
  //     Logger.debug('Nothing');
  //     return defaultValue as DTO<T>;
  //   }

  private async doPromise<T>(name: string, promise: Promise<T>): Promise<T> {
    Logger.debug(`Fulfill promise: ${name}`);
    try {
      return await promise;
    } catch (e) {
      Logger.error('Error while:', name);
      Logger.error(e);
      return {} as T;
    }
  }
}
