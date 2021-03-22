import crypto from 'crypto';

export namespace Random {
  export function id(length: number = 8): string {
    return cryptoKey(length);
  }

  export function cryptoKey(length: number = 32): string {
    return crypto
      .randomBytes(Math.ceil(length / 2))
      .toString('hex')
      .slice(0, length);
  }

  export function randomNumber(length: number = 32): number {
    const bytes = [];
    for (let i = 0; i < length; ++i) {
      const byte = Math.round(Math.random() * 255);
      bytes.push(byte);
    }
    const result = bytes.map(byte => byte.toString(10)).join('');
    return parseInt(result.slice(0, length), 10);
  }
}
