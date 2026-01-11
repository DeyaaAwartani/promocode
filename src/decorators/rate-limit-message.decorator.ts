import { SetMetadata } from '@nestjs/common';

export const RATE_LIMIT_MESSAGE = 'rate_limit_message';

export const RateLimitMessage = (message: string) =>
  SetMetadata(RATE_LIMIT_MESSAGE, message);