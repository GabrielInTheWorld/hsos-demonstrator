import { Collection } from './collection';

export abstract class BaseModel<T = any> implements Collection {
  protected constructor(public readonly collectionString: string, input?: Partial<T>) {
    const newObject = this.assign(input);
  }

  /**
   * Assigns given properties to the underlying model itself.
   *
   * @param input Any properties of the sub-model.
   *
   * @returns The resulted model.
   */
  protected assign(input?: Partial<T>): T {
    return Object.assign(this, input) as T;
  }

  public update(input?: Partial<T>): T {
    return Object.assign(this, input) as T;
  }
}
