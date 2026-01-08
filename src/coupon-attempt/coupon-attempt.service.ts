import { Injectable, NotFoundException, HttpException, HttpStatus  } from '@nestjs/common';
import { CouponAttemptDto } from './dto/coupon-attempt.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CouponAttempt } from './entities/coupon-attempt.entity';
import { DiscountCardService } from 'src/discount-card/discount-card.service';
import { UsersService } from 'src/users/users.service';
import { ProductsService } from 'src/products/products.service';
import { LogAttemptDto } from './dto/log-attempt.dto';
import { COUNTED_FAILURE_REASONS, COUPON_ATTEMPT_STATUS, COUPON_FAILURE_REASON } from './constants/coupon-attempt.constants';
import { Serialize } from 'src/interceptor/serialize.interceptor';
import { CouponAttemptResponseDto } from './dto/coupon-attempt-response.dto';

@Injectable()
export class CouponAttemptService {
  constructor(
    @InjectRepository(CouponAttempt) private repo: Repository<CouponAttempt>,
    private discountCardService: DiscountCardService,
    private usersService: UsersService,
    private productsService: ProductsService,
  ) {}
  

  @Serialize(CouponAttemptResponseDto)
  async couponAttempt(couponAttemptDto: CouponAttemptDto) {

    // get user to check if user exists
    const user = await this.usersService.findOne(couponAttemptDto.userId);
    if(!user){
      throw new NotFoundException('User not found');
    }

    // get product to check if product exists and other info
    const product = await this.productsService.findOne(couponAttemptDto.productId);
    if(!product){
      throw new NotFoundException('Product not found');
    }

    //method for clean code
    const fail = async (reason: string, discountCardId: number | null) => {
    await this.logAttempt({
      userId: user.id,
      productId: product.id,
      discountCardId: discountCardId,
      priceBefore: product.price,
      priceAfter: product.price,
      discountAmount: 0,
      couponCode: couponAttemptDto.couponCode,
      status: COUPON_ATTEMPT_STATUS.FAILED,
      failureReason: reason,
    });
    return {
      status: COUPON_ATTEMPT_STATUS.FAILED,
      reason: reason,
      priceBefore: product.price,
      discountAmount: 0,
      priceAfter: product.price,
    };
  };

    //check copon attempt for the same user (rate limit)
    const failedAttempts = await this.getFailedCouponAttemptsForUser(user.id);
    if(failedAttempts >= 5){
      const retryAfterSeconds = await this.getRetryAfterSecondsForUser(user.id);
      return {
      status: COUPON_ATTEMPT_STATUS.FAILED,
      reason: COUPON_FAILURE_REASON.RATE_LIMIT,
      retryAfterSeconds,
      priceBefore: product.price,
      discountAmount: 0,
      priceAfter: product.price,
      };
    }

    // get discountCard to check if discount card exists (wrong code)
    const discountCard = await this.discountCardService.findOneByCode(couponAttemptDto.couponCode);
    if(!discountCard){
    return await fail(COUPON_FAILURE_REASON.WRONG_CODE, null);
    }

    //check if discount card is expired (expierd)
    if(discountCard.expirationDate < new Date()){
      return await fail(COUPON_FAILURE_REASON.EXPIRED, discountCard.id);
    }

    // check if promo coud is used (already used)
    if(discountCard.isUsed){
      return await fail(COUPON_FAILURE_REASON.ALREADY_USED, discountCard.id);
    }

    // calculate discount amount 
    const priceBefore = product.price;
    let discountAmount = discountCard.discountType ==='percentile' ?
     (product.price * discountCard.discountValue) / 100 :
      discountCard.discountValue;
    discountAmount = discountAmount > priceBefore ? priceBefore : discountAmount;
    const priceAfter = Math.max(0, priceBefore - discountAmount);

    //change isUsed to used in promo coud
    await this.discountCardService.update(discountCard.id,{isUsed:true});

    // log successful attempt
    await this.logAttempt({
        userId: user.id,
        productId: product.id,
        discountCardId: discountCard.id,
        priceBefore: priceBefore,
        priceAfter: priceAfter,
        discountAmount: discountAmount,
        couponCode: couponAttemptDto.couponCode,
        status: COUPON_ATTEMPT_STATUS.SUCCESS,
        failureReason: null,
    })
    return {
      status: COUPON_ATTEMPT_STATUS.SUCCESS,
      priceBefore,
      discountAmount,
      priceAfter
    };
  }

  // for rate limit
  async getFailedCouponAttemptsForUser(userId: number): Promise<number> {
  const oneMinuteAgo = new Date(Date.now() - 60 * 1000);

  return this.repo
    .createQueryBuilder('attempt')
    .where('attempt.userId = :userId', { userId })
    .andWhere('attempt.status = :status', { status: COUPON_ATTEMPT_STATUS.FAILED })
    .andWhere('attempt.createdAt >= :oneMinuteAgo', { oneMinuteAgo })
    .andWhere('attempt.failureReason IN (:...reasons)', { reasons: COUNTED_FAILURE_REASONS })
    .getCount();
  }

  // get retry seconds 
async getRetryAfterSecondsForUser(userId: number): Promise<number> {
  const now = Date.now();
  const oneMinuteAgo = new Date(now - 60 * 1000);

  // get last one
  const fifthLatest = await this.repo
    .createQueryBuilder('attempt')
    .select(['attempt.createdAt'])
    .where('attempt.userId = :userId', { userId })
    .andWhere('attempt.status = :status', { status: COUPON_ATTEMPT_STATUS.FAILED })
    .andWhere('attempt.createdAt >= :oneMinuteAgo', { oneMinuteAgo })
    .andWhere('attempt.failureReason IN (:...reasons)', { reasons: COUNTED_FAILURE_REASONS })
    .orderBy('attempt.createdAt', 'DESC')
    .skip(4)  // offset 4 
    .take(1)  //get last one 
    .getOne();

  // if no fifth give 60 sec
  if (!fifthLatest?.createdAt) return 60;

  const fifthTime = new Date(fifthLatest.createdAt).getTime(); // transform to milliseconds
  const elapsedSeconds = Math.floor((now - fifthTime) / 1000); // 
  const retryAfterSeconds = Math.max(0, 60 - elapsedSeconds);

  return retryAfterSeconds;
  }


  //fails attempts
  async logAttempt(logAttemptDto: LogAttemptDto) {
  const attempt = this.repo.create({
    couponCode: logAttemptDto.couponCode,
    status: logAttemptDto.status,
    failureReason: logAttemptDto.failureReason,
    priceBefore: logAttemptDto.priceBefore,
    discountAmount: logAttemptDto.discountAmount,
    priceAfter: logAttemptDto.priceAfter,
    user: { id: logAttemptDto.userId },
    product: { id: logAttemptDto.productId },
    discountCard: logAttemptDto.discountCardId? ({ id: logAttemptDto.discountCardId }): null,
  });
  return this.repo.save(attempt);
  }
}
