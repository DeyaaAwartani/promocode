import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class CouponAttemptResponseDto {

  @Expose()
  status: string; 

  @Expose()
  reason?: string;
  
  @Expose()
  priceBefore: number;
  
  @Expose()
  discountAmount: number;
  
  @Expose()
  priceAfter: number;
  
  @Expose()
  retryAfterSeconds?: number;

}