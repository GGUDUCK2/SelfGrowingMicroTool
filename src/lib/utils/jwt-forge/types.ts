export interface JwtHeader {
  alg: string;
  typ?: string;
  kid?: string;
  [key: string]: any;
}

export interface JwtPayload {
  iss?: string;
  sub?: string;
  aud?: string | string[];
  exp?: number;
  nbf?: number;
  iat?: number;
  jti?: string;
  [key: string]: any;
}

export interface JwtParts {
  header: JwtHeader | null;
  payload: JwtPayload | null;
  signature: string;
  rawHeader: string;
  rawPayload: string;
  rawSignature: string;
}

export interface VerificationResult {
  isValid: boolean;
  error?: string;
}
