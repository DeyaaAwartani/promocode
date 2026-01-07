
import { CouponAttempt } from "src/coupon-attempt/entities/coupon-attempt.entity";
import { Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class DiscountCard {

  @PrimaryGeneratedColumn()
  id:number;

  @Column()
  code: string;

  @Column()
  discountType: string;

  @Column()
  discountValue: number;

  @Column({ type: 'int' })
  expirationDurationMinutes: number;

  @Column({ type: 'datetime' })
  expirationDate: Date;

  @Column({default:false})
  isUsed: boolean;

  @OneToMany(() => CouponAttempt, (attempt) => attempt.discountCard)
  couponAttempts: CouponAttempt[];
}
