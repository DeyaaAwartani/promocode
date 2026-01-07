import { IsNumber, IsString, Max, Min } from "class-validator";

export class CreateProductDto {

  @IsString()
  name: string;

  @IsNumber()
  @Min(0)
  @Max(10000)
  price: number;
}
