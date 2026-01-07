import { DiscountCard } from 'src/discount-card/entities/discount-card.entity';
import { Product } from 'src/products/entities/product.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class CouponAttempt {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.couponAttempts)
  user: User;

  @ManyToOne(() => Product, (product) => product.couponAttempts)
  product: Product;

  // the coupon code may be wrong, so it can be null
  @ManyToOne(() => DiscountCard, (discountCard) => discountCard.couponAttempts, { nullable: true })
  discountCard: DiscountCard | null;

  @Column()
  couponCode: string;

  @Column()
  status: string; // 'success' | 'failed'

  @Column({ type: 'text',nullable: true })
  failureReason: string | null; // 'wrong_code' | 'expired' | 'rate_limit' | null

  @Column('float')
  priceBefore: number;

  @Column('float')
  discountAmount: number;

  @Column('float')
  priceAfter: number;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;
}