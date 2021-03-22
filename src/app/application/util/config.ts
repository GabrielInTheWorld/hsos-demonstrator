export namespace Config {
  export const localClientUrl = 'http://localhost:4200';
  export const localServerUrl = 'http://localhost:8000';

  export function isProductionMode(): boolean {
    return process.env.NODE_ENV !== 'development';
  }
}
