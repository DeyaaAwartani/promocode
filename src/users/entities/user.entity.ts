
import { CouponAttempt } from "src/coupon-attempt/entities/coupon-attempt.entity";
import { Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class User {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => CouponAttempt, (attempt) => attempt.user)
  couponAttempts: CouponAttempt[];
}
