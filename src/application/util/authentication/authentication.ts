import { Digits } from 'final-otp';

export namespace Authentication {
  export interface OtpValues {
    type: 'hotp' | 'totp';
    secret: string; // base32
    digits?: Digits;
    issuer: string;
    to: string;
    period?: number;
    initialCounter?: number;
  }

  export interface InitialValues {
    emailSecret?: string;
    hotpUri?: string;
    totpUri?: string;
    password?: string;
    biometrics?: string;
  }

  export function otpToUri(options: OtpValues): string {
    let uri = `otpauth://${options.type}/${options.issuer}:${options.to}?secret=${options.secret}&issuer=${options.issuer}`;
    if (options.digits) {
      uri += `&digits=${options.digits}`;
    }
    if (options.period) {
      uri += `&period=${options.period}`;
    }
    if (options.initialCounter) {
      uri += `&counter=${options.initialCounter}`;
    }
    return uri;
  }

  export function uriToOtp(uri: string): OtpValues {
    const uriStart = 'otpauth://';
    if (!uri || !uri.startsWith(uriStart)) {
      throw new Error('Wrong URI!');
    }
    const rawValues = uri.slice(uriStart.length);
    const type = rawValues.slice(0, rawValues.indexOf('/')) as 'totp' | 'hotp';
    const to = rawValues.slice(rawValues.indexOf(':'), rawValues.indexOf('?'));
    const options = rawValues.slice(rawValues.indexOf('?') + 1).split('&');
    const otpValues: any = {
      type,
      to
    };
    for (const option of options) {
      const [key, value] = option.split('=');
      otpValues[key] = value;
    }
    return otpValues;
  }
}
