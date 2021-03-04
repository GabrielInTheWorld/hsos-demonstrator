import { CredentialLikeLogin } from './../../../model-layer/core/models/fido/index';
import CBOR from 'cbor-sync';
import cbor from 'cbor';
import { Fido2Lib } from 'fido2-library';

import { Random } from '../../helper';
import { User } from '../../../model-layer/core/models/user';
import {
  CredentialLike,
  PublicKeyCredentialCreationOptions,
  PublicKeyObject,
  RegisterOptions
} from '../../../model-layer/core/models/fido';
import { CryptoService } from '../../helper/crypto';
import crypto from 'crypto';
import { Base64 } from 'base-coding';
import { Config } from '../../config';

// interface PublicKeyCredentialCreationOptions {
//   rp: PublicKeyCredentialRpEntity;
//   user: PublicKeyCredentialUserEntity;
//   challenge: BufferSource | string;
//   pubKeyCredParams: PublicKeyCredentialParameters[];
//   timeout?: number;
//   excludeCredentials?: PublicKeycredentialDescriptor[];
//   authenticatorSelection?: AuthenticatorSelectionCriteria;
//   attestation?: string;
//   extensions?: object;
// }

// interface PublicKeyCredentialRpEntity {
//   id?: string;
//   name: string;
// }

// interface PublicKeyCredentialUserEntity {
//   id: string;
//   name: string;
//   displayName: string;
// }

// interface PublicKeyCredentialParameters {
//   type: string;
//   alg: number;
// }

// interface PublicKeycredentialDescriptor {
//   type: string;
//   id: BufferSource | string;
//   transports: string[];
// }

// interface AuthenticatorSelectionCriteria {
//   authenticatorAttachment: string;
//   residentKey: string;
//   requireResidentKey?: boolean;
//   userVerification?: string;
// }

// interface RegisterOptions {
//   userId?: string;
//   rpName?: string;
//   username: string;
//   authenticatorAttachment: string;
// }

// interface CredentialLike {
//   id: string;
//   rawId: string;
//   response: {
//     attestationObject: string;
//     clientDataJSON: string;
//   };
//   type: string;
// }

// interface PublicKeyObject {
//   publicKeyObject: any;
//   credentialId: any;
// }

// /**
//  * Takes COSE encoded public key and converts it to RAW PKCS ECDHA key
//  * @param  {Buffer} COSEPublicKey - COSE encoded public key
//  * @return {Buffer}               - RAW PKCS encoded public key
//  */
// const COSEECDHAtoPKCS = (COSEPublicKey: Buffer): Buffer => {
//   /*
//        +------+-------+-------+---------+----------------------------------+
//        | name | key   | label | type    | description                      |
//        |      | type  |       |         |                                  |
//        +------+-------+-------+---------+----------------------------------+
//        | crv  | 2     | -1    | int /   | EC Curve identifier - Taken from |
//        |      |       |       | tstr    | the COSE Curves registry         |
//        |      |       |       |         |                                  |
//        | x    | 2     | -2    | bstr    | X Coordinate                     |
//        |      |       |       |         |                                  |
//        | y    | 2     | -3    | bstr /  | Y Coordinate                     |
//        |      |       |       | bool    |                                  |
//        |      |       |       |         |                                  |
//        | d    | 2     | -4    | bstr    | Private key                      |
//        +------+-------+-------+---------+----------------------------------+
//     */

//   console.log('Instanceof COSEPublicKey === ArrayBuffer', COSEPublicKey instanceof ArrayBuffer);
//   console.log('Instanceof COSEPublicKey === Buffer', COSEPublicKey instanceof Buffer);
//   console.log('Instanceof COSEPublicKey', (COSEPublicKey as any).name);

//   // if (COSEPublicKey instanceof ArrayBuffer) {
//   //   COSEPublicKey = Buffer.from(COSEPublicKey.buffer);
//   // }
//   COSEPublicKey = Buffer.from(COSEPublicKey);

//   let coseStruct = CBOR.decode(COSEPublicKey, 'buffer');
//   // let coseStruct = cbor.decodeAllSync(COSEPublicKey)[0];
//   console.log('coseStruct', coseStruct);
//   let tag = Buffer.from([0x04]);
//   let x = coseStruct.get(-2);
//   let y = coseStruct.get(-3);

//   return Buffer.concat([tag, x, y]);
// };

export class Fido {
  private static readonly pendingUsers: { [key: string]: any } = {};

  private static readonly f2l = new Fido2Lib({
    challengeSize: 128,
    attestation: 'direct',
    cryptoParams: [-7],
    authenticatorAttachment: 'cross-platform',
    authenticatorRequireResidentKey: false,
    authenticatorUserVerification: 'discouraged',
    rpName: 'http://localhost:8000'
  });

  // public static getRegisterOptions(args: RegisterOptions): PublicKeyCredentialCreationOptions {
  //   return {
  //     challenge: this.createChallenge(),
  //     rp: {
  //       name: args.rpName || 'http://localhost:8000'
  //     },
  //     user: {
  //       id: args.userId || Buffer.from(Uint8Array.from(Random.cryptoKey(8), c => c.charCodeAt(0))).toString('base64'),
  //       name: args.username,
  //       displayName: args.username
  //     },
  //     extensions: {
  //       txAuthSimple: ''
  //     },
  //     pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
  //     authenticatorSelection: {
  //       residentKey: 'discouraged',
  //       requireResidentKey: false,
  //       authenticatorAttachment: args.authenticatorAttachment,
  //       userVerification: 'discouraged'
  //     },
  //     timeout: 60000,
  //     attestation: 'direct'
  //   };
  // }

  // public static getLoginOptions(user: User): any {
  //   if (!user.fido) {
  //     throw new Error('Not fido registered');
  //   }
  //   console.log('user:', user.fido?.credentialId);
  //   const publicKeyCredentialRequestOptions = {
  //     challenge: this.createChallenge(),
  //     allowCredentials: [
  //       {
  //         id: Buffer.from(
  //           Uint8Array.from(Buffer.from(user.fido?.credentialId, 'base64').toString('hex'), (c: string) =>
  //             c.charCodeAt(0)
  //           )
  //         ).toString('base64'),
  //         type: 'public-key',
  //         transports: ['usb', 'ble', 'nfc']
  //       }
  //     ],
  //     userVerification: 'discouraged',
  //     timeout: 60000
  //   };
  //   return publicKeyCredentialRequestOptions;
  // }

  public static async getLoginOptionsLib(user: User): Promise<any> {
    if (!user.fido) {
      return;
    }
    const result: any = await this.f2l.assertionOptions();
    this.pendingUsers[user.userId] = result.challenge;
    result.challenge = this.bufferToString(result.challenge);
    result.allowCredentials = [
      {
        id: Buffer.from(
          Uint8Array.from(Buffer.from(user.fido?.credentialId, 'base64').toString('hex'), (c: string) =>
            c.charCodeAt(0)
          )
        ).toString('base64'),
        type: 'public-key',
        transports: ['usb', 'ble', 'nfc']
      }
    ];
    return result;
  }

  public static async isSignatureValidLib(user: User, credential: any): Promise<boolean> {
    const assertionExpectations: any = {
      challenge: this.bufferToString(this.pendingUsers[user.userId]),
      origin: Config.isProductionMode() ? 'http://localhost:8000' : 'http://localhost:4200',
      factor: 'either',
      publicKey: (user.fido as any).publicKeyPem,
      prevCounter: (user.fido as any).counter,
      userHandle: ''
    };

    console.log('credentials to assert:', credential);
    const clientDataJSON = JSON.parse(Base64.decode(credential.response.clientDataJSON));
    console.log('challenge:', Buffer.from(clientDataJSON.challenge, 'base64'));
    console.log('assertionExpectations', assertionExpectations);
    console.log('pendingUsers', this.pendingUsers);

    credential.rawId = Uint8Array.from(credential.rawId, (c: any) => c.charCodeAt(0)).buffer;

    const result = await this.f2l.assertionResult(credential, assertionExpectations);
    console.log('result:', result);
    return true;
  }

  // public static isSignatureValid(user: User, credential: CredentialLikeLogin): boolean {
  //   if (!user.fido?.publicKeyBytes) {
  //     return false;
  //   }
  //   console.log('user:', user.fido);
  //   const certificate = new crypto.Certificate();
  //   const pubKey = certificate.exportPublicKey(Buffer.from(user.fido.x5c));
  //   console.log('pubKey:', pubKey);
  //   const publicKeyBytes = Buffer.from(user.fido.publicKeyBytes);
  //   const publicKey = this.binaryToBuffer(user.fido.publicKeyBytes as any);
  //   console.log('publicKeyObject', user.fido.publicKeyObject);
  //   const x = Buffer.from(user.fido.publicKeyObject[-2] as any);
  //   const y = Buffer.from(user.fido.publicKeyObject[-3] as any);
  //   console.log('x + y', x, y);
  //   console.log('cose:', Buffer.concat([Buffer.from([0x04]), x, y]));
  //   console.log('buffer of publicKeyBytes', Buffer.from((publicKeyBytes as any).buffer));
  //   // console.log('Try again...', COSEECDHAtoPKCS(user.fido.publicKeyObject as any));
  //   // console.log('ECDH:', COSEECDHAtoPKCS(Buffer.from((publicKeyBytes as any).buffer)));
  //   // const signedData =
  //   //   Buffer.from(credential.response.authenticatorData, 'base64') +
  //   //   CryptoService.sha(credential.response.clientDataJSON);
  //   const hash = crypto.createHash('sha256');
  //   hash.update(Buffer.from(credential.response.clientDataJSON, 'base64'));
  //   const digest = hash.digest();
  //   // const clientDataHash = new Uint8Array(digest).buffer;
  //   console.log('digest', digest);
  //   // console.log('clientDataHash', clientDataHash);

  //   const verify = crypto.createVerify('sha256');
  //   verify.write(Buffer.from(credential.response.authenticatorData, 'base64'));
  //   verify.write(digest);
  //   verify.end();

  //   const signature = Buffer.from(credential.response.signature, 'base64');
  //   console.log('isArrayBuffer:', signature);
  //   console.log('is publicKey arrayBuffer', publicKey instanceof ArrayBuffer);
  //   console.log('are publicKeyBytes instanceof arrayBuffer:', Buffer.from(user.fido.publicKeyBytes as any).toJSON());

  //   return verify.verify(Buffer.concat([Buffer.from([0x04]), x, y]), signature);
  //   // return user.fido.publicKeyObject.verify(credential.response.signature, signedData);
  // }

  // public static isSignatureValid(user: User, credential: CredentialLikeLogin): boolean {
  //   if (!user.fido?.publicKeyObject) {
  //     return false;
  //   }
  //   console.log('user:', user.fido);
  //   const publicKey = this.binaryToBuffer(Buffer.from(user.fido.publicKeyObject, 'base64'));
  //   console.log('publicKeyObject', this.binaryToBuffer(Buffer.from(user.fido.publicKeyObject, 'base64')));
  //   // const signedData =
  //   //   Buffer.from(credential.response.authenticatorData, 'base64') +
  //   //   CryptoService.sha(credential.response.clientDataJSON);
  //   const hash = crypto.createHash('sha256');
  //   hash.update(this.binaryToBuffer(Buffer.from(credential.response.clientDataJSON, 'base64')));
  //   const clientDataHash = new Uint8Array(hash.digest()).buffer;

  //   const verify = crypto.createVerify('sha256');
  //   verify.write(this.binaryToBuffer(Buffer.from(credential.response.authenticatorData, 'base64')));
  //   verify.write(this.binaryToBuffer(clientDataHash));
  //   verify.end();

  //   return verify.verify(publicKey, this.binaryToBuffer(Buffer.from(credential.response.signature, 'base64')));
  //   // return user.fido.publicKeyObject.verify(credential.response.signature, signedData);
  // }

  // private static binaryToBuffer(binary: Buffer | ArrayBuffer): Buffer {
  //   return Buffer.from(new Uint8Array(binary));
  // }

  // public static getUserIdAndPublicKey(credential: CredentialLike): PublicKeyObject {
  //   // decode the clientDataJSON into a utf-8 string
  //   const utf8Decoder = new TextDecoder('utf-8');
  //   //  const credential = request.content.credential as CredentialLike;
  //   console.log('Received credential', credential);
  //   const clientDataJSON = Buffer.from(credential.response.clientDataJSON, 'base64');
  //   console.log('clientDataJSON', clientDataJSON);
  //   const attestationObject = Buffer.from(credential.response.attestationObject, 'base64');
  //   console.log('attestationObject', attestationObject);
  //   const decodedClientData = utf8Decoder.decode(clientDataJSON);

  //   // parse the string as an object
  //   const clientDataObj = JSON.parse(decodedClientData);

  //   const decodedAttestationObject = CBOR.decode(attestationObject);

  //   console.log('decodedAttestationObject', decodedAttestationObject);

  //   console.log('clientDataObj', clientDataObj);

  //   // console.log('typeof:', decodedAttestationObject.authData instanceof Uint8Array);

  //   const { authData }: { authData: any } = decodedAttestationObject;

  //   // get the length of the credential ID
  //   const dataView = new DataView(new ArrayBuffer(2));
  //   const idLenBytes = authData.slice(53, 55);
  //   idLenBytes.forEach((value: any, index: number) => dataView.setUint8(index, value));
  //   const credentialIdLength = dataView.getUint16(0);

  //   // get the credential ID
  //   const credentialId = authData.slice(55, 55 + credentialIdLength);
  //   console.log('credentialId:', credentialIdLength, credentialId);

  //   // get the public key object
  //   const publicKeyBytes = authData.slice(55 + credentialIdLength);
  //   console.log('publicKeyBytes', Buffer.from(publicKeyBytes.buffer));

  //   // the publicKeyBytes are encoded again as CBOR
  //   const publicKeyObject = CBOR.decode(Buffer.from(publicKeyBytes.buffer), 'buffer');

  //   throw new Error('Not implemented');
  //   // return { publicKeyObject, credentialId };
  // }

  // private static createChallenge(): string {
  //   return this.stringToBase64Buffer(Random.cryptoKey());
  //   // return Buffer.from(Uint8Array.from(Random.cryptoKey(), c => c.charCodeAt(0))).toString('base64');
  // }

  // private static stringToBase64Buffer(buffer: string): string {
  //   return Buffer.from(Uint8Array.from(buffer, c => c.charCodeAt(0))).toString('base64');
  // }

  public static bufferToString(buffer: ArrayBuffer): string {
    // const byteArray = new Uint8Array(buffer).forEach(byte => byte);
    const encoded = Buffer.from(
      new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
    ).toString('base64');
    return encoded;
    // return Buffer.from(encoded).toString('base64');
  }
}

// export namespace FidoService {
//   const pendingUserMap: { [key: string]: string } = {};

//   export function register(): void {}

//   export function login(): void {}
// }
