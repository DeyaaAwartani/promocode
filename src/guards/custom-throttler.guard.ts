import { Injectable, ExecutionContext } from '@nestjs/common';
import * as throttler from '@nestjs/throttler';
import { Reflector } from '@nestjs/core';
import { RATE_LIMIT_MESSAGE } from 'src/decorators/rate-limit-message.decorator';

@Injectable()
export class CustomThrottlerGuard extends throttler.ThrottlerGuard {
  constructor(
    options: throttler.ThrottlerModuleOptions,
    storage: throttler.ThrottlerStorage,
    reflector: Reflector,
  ) {
    super(options, storage, reflector); 
  }

  protected async throwThrottlingException(
    context: ExecutionContext,
  ): Promise<void> {
    const message =
      this.reflector.get<string>(
        RATE_LIMIT_MESSAGE,
        context.getHandler(),
      ) ||
      'Too many requests. Please try again later please , from Guard.';

    throw new throttler.ThrottlerException(message);
  }
}
