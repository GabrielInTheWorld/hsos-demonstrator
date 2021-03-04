export interface PublicKeyCredentialCreationOptions {
  rp: PublicKeyCredentialRpEntity;
  user: PublicKeyCredentialUserEntity;
  challenge: BufferSource | string;
  pubKeyCredParams: PublicKeyCredentialParameters[];
  timeout?: number;
  excludeCredentials?: PublicKeycredentialDescriptor[];
  authenticatorSelection?: AuthenticatorSelectionCriteria;
  attestation?: string;
  extensions?: object;
}

interface PublicKeyCredentialRpEntity {
  id?: string;
  name: string;
}

interface PublicKeyCredentialUserEntity {
  id: string;
  name: string;
  displayName: string;
}

interface PublicKeyCredentialParameters {
  type: string;
  alg: number;
}

interface PublicKeycredentialDescriptor {
  type: string;
  id: BufferSource | string;
  transports: string[];
}

interface AuthenticatorSelectionCriteria {
  authenticatorAttachment: string;
  residentKey: string;
  requireResidentKey?: boolean;
  userVerification?: string;
}

export interface RegisterOptions {
  userId?: string;
  rpName?: string;
  username: string;
  authenticatorAttachment: string;
}

interface PartialCredentialLike {
  id: string;
  rawId: string;
  type: string;
}

export interface CredentialLike extends PartialCredentialLike {
  response: {
    attestationObject: string;
    clientDataJSON: string;
  };
}

export interface CredentialLikeLogin extends PartialCredentialLike {
  response: {
    authenticatorData: string;
    clientDataJSON: string;
    signature: string;
  };
}

export interface PublicKeyObject {
  publicKeyObject: string;
  credentialId: string;
  publicKeyBytes: string;
  x5c: string;
}

export interface MakeCredentialResponse {
  fmt: string;
  attStmt: {
    sig: Buffer;
    x5c: [Buffer];
  };
  authData: Buffer;
}
