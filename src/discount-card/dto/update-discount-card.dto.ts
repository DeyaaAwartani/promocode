import { Transform } from "class-transformer";
import {  IsIn, IsISO8601, IsNotEmpty, IsNumber, IsString, Min } from "class-validator";


export class UpdateDiscountCardDto  {
    @IsString()
    @IsNotEmpty()
    code: string;


    @Transform(({ value }) => {
    if (value == null) return value;          
    const v = String(value).trim().toLowerCase(); 
    if (!v) return value;                      
    
    
    const first = v[0];
    
    if (first === 'f') return 'flat';
    if (first === 'p') return 'percentile';
    
    return value; 
    })
    @IsIn(['flat', 'percentile'] , {message: 'discountType must be either flat or percentile'})
    discountType: string;

    @IsNumber()
    @Min(1)
    discountValue: number;

    @IsIn([1, 5, 10] , {message: 'expirationDurationMinutes must be either 1, 5, or 10'})
    expirationDurationMinutes: number;

}
