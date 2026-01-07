import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { DiscountCardModule } from './discount-card/discount-card.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/entities/user.entity';
import { Product } from './products/entities/product.entity';
import { DiscountCard } from './discount-card/entities/discount-card.entity';
//import { CouponAttemptResolver } from './coupon-attempt/coupon-attempt.resolver';
import { CouponAttemptModule } from './coupon-attempt/coupon-attempt.module';
import { CouponAttempt } from './coupon-attempt/entities/coupon-attempt.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'db.sqlite',
      entities:[User,Product,DiscountCard,CouponAttempt],
      synchronize: true,
    }),
    UsersModule,
    ProductsModule, 
    DiscountCardModule,
    CouponAttemptModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
