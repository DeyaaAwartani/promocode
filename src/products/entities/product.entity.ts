
import { CouponAttempt } from "src/coupon-attempt/entities/coupon-attempt.entity";
import { Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class Product {

  @PrimaryGeneratedColumn()
  id: number;
  
  @Column()
  name: string;

  @Column()
  price: number;

  @OneToMany(() => CouponAttempt, (attempt) => attempt.product)
  couponAttempts: CouponAttempt[];
}
