import { Injectable, NotFoundException, HttpException, HttpStatus  } from '@nestjs/common';
import { CouponAttemptDto } from './dto/coupon-attempt.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CouponAttempt } from './entities/coupon-attempt.entity';
import { DiscountCardService } from 'src/discount-card/discount-card.service';
import { UsersService } from 'src/users/users.service';
import { ProductsService } from 'src/products/products.service';
import { LogAttemptDto } from './dto/log-attempt.dto';
import { plainToInstance } from 'class-transformer';
import { CouponAttemptResponseDto } from './dto/coupon-attempt-response.dto';
import { CouponAttemptStatus } from './enums/coupon-attempt-status.enum';
import { CouponFailureReason } from './enums/coupon-failure-reason.enum';
import { COUNTED_FAILURE_REASONS } from './constants/counted-failure-reasons';
import {
  RATE_LIMIT_MAX_FAILED_ATTEMPTS,
  RATE_LIMIT_LAST_ALLOWED_FAILURE_OFFSET,
  RATE_LIMIT_WINDOW_MS,
  RATE_LIMIT_WINDOW_SECONDS,
} from './constants/rate-limit.constants';

@Injectable()
export class CouponAttemptService {
  constructor(
    @InjectRepository(CouponAttempt) private repo: Repository<CouponAttempt>,
    private discountCardService: DiscountCardService,
    private usersService: UsersService,
    private productsService: ProductsService,
  ) {}
  


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
      status: CouponAttemptStatus.FAILED,
      failureReason: reason,
    });
    return plainToInstance(
      CouponAttemptResponseDto,
      {
        status: CouponAttemptStatus.FAILED,
        reason: reason,
        priceBefore: product.price,
        discountAmount: 0,
        priceAfter: product.price,
      },
      { excludeExtraneousValues: true },
    );
  };

    //check copon attempt for the same user (rate limit)
    const failedAttempts = await this.getFailedCouponAttemptsForUser(user.id);
    if(failedAttempts >= RATE_LIMIT_MAX_FAILED_ATTEMPTS){
      const retryAfterSeconds = await this.getRetryAfterSecondsForUser(user.id);
      const failed = await fail(CouponFailureReason.RATE_LIMIT, null);

    return { ...failed, retryAfterSeconds }
    }

    // get discountCard to check if discount card exists (wrong code)
    const discountCard = await this.discountCardService.findOneByCode(couponAttemptDto.couponCode);
    if(!discountCard){
    return await fail(CouponFailureReason.WRONG_CODE, null);
    }

    //check if discount card is expired (expierd)
    if(discountCard.expirationDate < new Date()){
      return await fail(CouponFailureReason.EXPIRED, discountCard.id);
    }

    // calculate discount amount 
    const priceBefore = product.price;
    let discountAmount = discountCard.discountType ==='percentile' ?
     (product.price * discountCard.discountValue) / 100 :
      discountCard.discountValue;
    discountAmount = discountAmount > priceBefore ? priceBefore : discountAmount;
    const priceAfter = Math.max(0, priceBefore - discountAmount);


    // const sleep = (ms: number) => new Promise<void>((r) => globalThis.setTimeout(r, ms));
    // await sleep(3000);

    const now = new Date();
    const claimed = await this.discountCardService.claimDiscountCard(discountCard.id, now);

    if (!claimed) {
      // get it to test what is fail
      const fresh = await this.discountCardService.findOne(discountCard.id);

      // small probability
      if (!fresh) {
        return await fail(CouponFailureReason.WRONG_CODE, null);
      }

      if (fresh.expirationDate < now) {
        return await fail(CouponFailureReason.EXPIRED, fresh.id);
      }

      if (fresh.isUsed) {
        return await fail(CouponFailureReason.ALREADY_USED, fresh.id);
      }

    }

    // log successful attempt
    await this.logAttempt({
        userId: user.id,
        productId: product.id,
        discountCardId: discountCard.id,
        priceBefore: priceBefore,
        priceAfter: priceAfter,
        discountAmount: discountAmount,
        couponCode: couponAttemptDto.couponCode,
        status: CouponAttemptStatus.SUCCESS,
        failureReason: null,
    })
    return plainToInstance(
      CouponAttemptResponseDto,
      {
        status: CouponAttemptStatus.SUCCESS,
        priceBefore,
        discountAmount,
        priceAfter,
      },
      { excludeExtraneousValues: true },
      );
  }

  // for rate limit
  async getFailedCouponAttemptsForUser(userId: number): Promise<number> {
  const oneMinuteAgo = new Date(Date.now() - RATE_LIMIT_WINDOW_MS);

  return this.repo
    .createQueryBuilder('attempt')
    .where('attempt.userId = :userId', { userId })
    .andWhere('attempt.status = :status', { status: CouponAttemptStatus.FAILED })
    .andWhere('attempt.createdAt >= :oneMinuteAgo', { oneMinuteAgo })
    .andWhere('attempt.failureReason IN (:...reasons)', { reasons: COUNTED_FAILURE_REASONS })
    .getCount();
  }

  // get retry seconds 
async getRetryAfterSecondsForUser(userId: number): Promise<number> {
  const now = Date.now();
  const oneMinuteAgo = new Date(now - RATE_LIMIT_WINDOW_MS);

  // get last one
  const fifthLatest = await this.repo
    .createQueryBuilder('attempt')
    .select(['attempt.createdAt'])
    .where('attempt.userId = :userId', { userId })
    .andWhere('attempt.status = :status', { status: CouponAttemptStatus.FAILED })
    .andWhere('attempt.createdAt >= :oneMinuteAgo', { oneMinuteAgo })
    .andWhere('attempt.failureReason IN (:...reasons)', { reasons: COUNTED_FAILURE_REASONS })
    .orderBy('attempt.createdAt', 'DESC')
    .skip(RATE_LIMIT_LAST_ALLOWED_FAILURE_OFFSET)  // offset 4 
    .take(1)  //get last one 
    .getOne();

  // if no fifth give 60 sec
  if (!fifthLatest?.createdAt) return RATE_LIMIT_WINDOW_SECONDS;

  const fifthTime = new Date(fifthLatest.createdAt).getTime(); // transform to milliseconds
  const elapsedSeconds = Math.floor((now - fifthTime) / 1000); // 
  const retryAfterSeconds = Math.max(0, RATE_LIMIT_WINDOW_SECONDS - elapsedSeconds);

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
