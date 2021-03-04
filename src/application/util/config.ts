export namespace Config {
  export function isProductionMode(): boolean {
    return process.env.NODE_ENV !== 'development';
  }
}
