import { Controller, Post, Body, } from '@nestjs/common';
import { CouponAttemptService } from './coupon-attempt.service';
import { CouponAttemptDto } from './dto/coupon-attempt.dto';

@Controller('coupon-attempt')
export class CouponAttemptController {
  constructor(private couponAttemptService: CouponAttemptService) {}

  @Post()
  couponAttempts(@Body() couponAttemptDto: CouponAttemptDto) {
    return this.couponAttemptService.couponAttempt(couponAttemptDto);
  }
}
