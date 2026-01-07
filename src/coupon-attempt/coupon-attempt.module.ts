import { Module } from '@nestjs/common';
import { CouponAttemptService } from './coupon-attempt.service';
import { CouponAttemptController } from './coupon-attempt.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CouponAttempt } from './entities/coupon-attempt.entity';
import { DiscountCardModule } from 'src/discount-card/discount-card.module';
import { ProductsModule } from 'src/products/products.module';
import { UsersModule } from 'src/users/users.module';


@Module({
  imports: [
    TypeOrmModule.forFeature([CouponAttempt]),
    DiscountCardModule,
    ProductsModule,
    UsersModule
  ],
  controllers: [CouponAttemptController],
  providers: [CouponAttemptService],
})
export class CouponAttemptModule {}
