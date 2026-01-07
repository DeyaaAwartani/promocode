import { Module } from '@nestjs/common';
import { DiscountCardService } from './discount-card.service';
import { DiscountCardController } from './discount-card.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiscountCard } from './entities/discount-card.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DiscountCard])],
  controllers: [DiscountCardController],
  providers: [DiscountCardService],
  exports: [DiscountCardService],
})
export class DiscountCardModule {}
