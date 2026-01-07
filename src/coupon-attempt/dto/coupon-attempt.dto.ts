import { IsNumber, IsString } from "class-validator";

export class CouponAttemptDto {

  @IsString()
  couponCode: string;

  @IsNumber()
  productId: number;

  @IsNumber()
  userId: number;
}
