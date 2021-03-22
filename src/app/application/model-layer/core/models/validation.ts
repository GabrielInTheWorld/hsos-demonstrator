export interface Validation<T> {
  isValid: boolean;
  message: string;
  data?: { [key: string]: any };
  result?: T;
  reason?: any;
  header?: {
    token: string;
  };
}
