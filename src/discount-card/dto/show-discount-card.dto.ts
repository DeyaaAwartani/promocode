import { Expose } from 'class-transformer';

export class ShowDiscountCardDto {

  @Expose()
  code: string;

  @Expose()
  discountType: string;

  @Expose()
  discountValue: number;

  @Expose()
  expirationDurationMinutes: number;
}