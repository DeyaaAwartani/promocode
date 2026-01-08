import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException, Query } from '@nestjs/common';
import { DiscountCardService } from './discount-card.service';
import { CreateDiscountCardDto } from './dto/create-discount-card.dto';
import { UpdateDiscountCardDto } from './dto/update-discount-card.dto';
import { Serialize } from 'src/interceptor/serialize.interceptor';
import { ShowDiscountCardDto } from './dto/show-discount-card.dto';

@Controller('discount-card')
export class DiscountCardController {
  constructor(private discountCardService: DiscountCardService) {}

  @Serialize(ShowDiscountCardDto)
  @Post('/create')
  createProduct(@Body() createDiscountCardDto: CreateDiscountCardDto) {
    return this.discountCardService.create(createDiscountCardDto);
  }

  @Get()
  findAllDiscountCards() {
    return this.discountCardService.findAll();
  }

  @Get('/code')
  getDiscountCard(@Query('code') code:string) {
    return this.discountCardService.findOneByCode(code);
  }

  @Get('/:id')
  async findDiscountCard(@Param('id') id: string) {
    const discountCard = await this.discountCardService.findOne(parseInt(id));
    if(!discountCard){
      throw new NotFoundException('Discount card not found');
    }
    return discountCard;
  }

  @Patch('/:id')
  updateUser(@Param('id') id: string, @Body() updateDiscountCardDto: UpdateDiscountCardDto) {
    return this.discountCardService.update(parseInt(id), updateDiscountCardDto);
  }

  @Delete('/:id')
  remove(@Param('id') id: string) {
    return this.discountCardService.remove(parseInt(id));
  }
}
