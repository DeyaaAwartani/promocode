
import { CouponAttempt } from "src/coupon-attempt/entities/coupon-attempt.entity";
import { DiscountType } from "src/discount-card/enums/discount-type.enum";
import { Column, CreateDateColumn, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class DiscountCard {

  @PrimaryGeneratedColumn()
  id:number;

  @Column()
  code: string;

  @Column({ type: 'simple-enum', enum: DiscountType })
  discountType: DiscountType;

  @Column()
  discountValue: number;

  @Column({ type: 'int' })
  expirationDurationMinutes: number;

  @Column({ type: 'datetime' })
  expirationDate: Date;

  @Column({default:false})
  isUsed: boolean;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @OneToMany(() => CouponAttempt, (attempt) => attempt.discountCard)
  couponAttempts: CouponAttempt[];
}
