import {  IsIn, IsISO8601, IsNotEmpty, IsNumber, IsString, Min } from "class-validator";


export class UpdateDiscountCardDto  {
    @IsString()
    @IsNotEmpty()
    code: string;
  
    @IsIn(['flat', 'percentile'] , {message: 'discountType must be either flat or percentile'})
    discountType: string;
  
  
    @IsNumber()
    @Min(1)
    discountValue: number;
  
    @IsIn([1, 5, 10] , {message: 'expirationDurationMinutes must be either 1, 5, or 10'})
    expirationDurationMinutes: number;

}
