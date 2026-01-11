import { Transform } from "class-transformer";
import {  IsEnum, IsIn, IsNumber, Min } from "class-validator";
import { DiscountType } from "src/discount-card/enums/discount-type.enum";

export class CreateDiscountCardDto {

  // @IsString()
  // @IsNotEmpty()
  // code: string;


@Transform(({ value }) => {
  if (value == null) return value;          
  const v = String(value).trim().toLowerCase(); 
  if (!v) return value;                      


  const first = v[0];

  if (first === 'f') return DiscountType.FLAT;
  if (first === 'p') return DiscountType.PERCENTILE;

  return value; 
})
  @IsEnum(DiscountType, {message: 'discountType must be either flat or percentile',})
  discountType?: DiscountType;


  @IsNumber()
  @Min(1)
  discountValue: number;

  @IsIn([1, 5, 10] , {message: 'expirationDurationMinutes must be either 1, 5, or 10'})
  expirationDurationMinutes: number;
}
