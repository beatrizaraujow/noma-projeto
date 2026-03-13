import { Injectable } from '@nestjs/common';

type RevokedTokenEntry = {
  expiresAtMs: number;
};

@Injectable()
export class TokenRevocationService {
  private readonly revokedTokens = new Map<string, RevokedTokenEntry>();

  revoke(jti: string, expiresAtSeconds: number): void {
    if (!jti || !expiresAtSeconds) {
      return;
    }

    this.cleanup();
    this.revokedTokens.set(jti, {
      expiresAtMs: expiresAtSeconds * 1000,
    });
  }

  isRevoked(jti?: string): boolean {
    if (!jti) {
      return false;
    }

    this.cleanup();
    return this.revokedTokens.has(jti);
  }

  private cleanup(): void {
    const now = Date.now();

    for (const [jti, entry] of this.revokedTokens.entries()) {
      if (entry.expiresAtMs <= now) {
        this.revokedTokens.delete(jti);
      }
    }
  }
}
