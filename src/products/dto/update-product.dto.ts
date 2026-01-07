import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';
import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdateProductDto  {

  @IsString()
  @IsOptional()
  name:string;

  @IsNumber()
  @Min(0)
  @Max(10000)
  @IsOptional()
  price:number;
}
