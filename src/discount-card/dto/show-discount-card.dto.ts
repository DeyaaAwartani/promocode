import { Expose } from 'class-transformer';
import { DiscountType } from 'src/discount-card/enums/discount-type.enum';

export class ShowDiscountCardDto {

  @Expose()
  code: string;

  @Expose()
  discountType: DiscountType;

  @Expose()
  discountValue: number;

  @Expose()
  expirationDurationMinutes: number;
}