import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, timingSafeEqual } from 'crypto';

import { EnvConfig } from '../../env.validation';

const BEARER_PREFIX = 'Bearer ';

const hash = (value: string) => createHash('sha256').update(value).digest();

@Injectable()
export class ApiKeyGuard implements CanActivate {
  private readonly expectedKeyHash: Buffer;

  constructor(config: ConfigService<EnvConfig, true>) {
    this.expectedKeyHash = hash(config.get('API_KEY', { infer: true }));
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{ headers: Record<string, string | string[] | undefined> }>();
    const authorization = request.headers.authorization;

    const providedKey =
      typeof authorization === 'string' && authorization.slice(0, BEARER_PREFIX.length).toLowerCase() === 'bearer '
        ? authorization.slice(BEARER_PREFIX.length).trim()
        : undefined;

    if (!providedKey || !timingSafeEqual(hash(providedKey), this.expectedKeyHash)) {
      throw new UnauthorizedException('Invalid or missing API key');
    }

    return true;
  }
}
