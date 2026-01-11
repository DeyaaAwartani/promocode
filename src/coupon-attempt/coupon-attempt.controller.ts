import { Controller, Post, Body, UseGuards, UseInterceptors, ClassSerializerInterceptor, } from '@nestjs/common';
import { CouponAttemptService } from './coupon-attempt.service';
import { CouponAttemptDto } from './dto/coupon-attempt.dto';
import { Serialize } from 'src/interceptor/serialize.interceptor';
import { CouponAttemptResponseDto } from './dto/coupon-attempt-response.dto';
import { seconds, Throttle } from '@nestjs/throttler';
import { RateLimitMessage } from 'src/decorators/rate-limit-message.decorator';
import { CustomThrottlerGuard } from 'src/guards/custom-throttler.guard';

@Controller('coupon-attempt')
export class CouponAttemptController {
  constructor(private couponAttemptService: CouponAttemptService) {}


  @UseGuards(CustomThrottlerGuard)
  @RateLimitMessage('Too many coupon attempts. Please try again later.')
  //@Throttle({ default: { limit: 1, ttl: seconds(1) } }) //blockDuration:hours(5)
  //@Serialize(CouponAttemptResponseDto)
  @UseInterceptors(ClassSerializerInterceptor)
  @Post('/apply')
  couponAttempts(@Body() couponAttemptDto: CouponAttemptDto) {
    return this.couponAttemptService.couponAttempt(couponAttemptDto);
  }
}
