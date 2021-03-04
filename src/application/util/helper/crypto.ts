import crypto from 'crypto';

export namespace CryptoService {
  type shaAlgorithm = 'sha256' | 'sha512';

  export function sha(value: string, algorithm: shaAlgorithm = 'sha256'): string {
    const hashValue = crypto
      .createHash(algorithm)
      .update(value)
      .digest('base64');
    return hashValue;
  }
}
