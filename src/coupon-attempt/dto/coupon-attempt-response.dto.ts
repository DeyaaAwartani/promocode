import { Expose } from 'class-transformer';

export class CouponAttemptResponseDto {
  @Expose()
  status: string; // 'success' | 'failed'

  @Expose()
  priceBefore: number;

  @Expose()
  discountAmount: number;

  @Expose()
  priceAfter: number;

  @Expose()
  reason?: string; // موجودة فقط في الفشل

//   @Expose()
//   retryAfterSeconds?: number;
  }