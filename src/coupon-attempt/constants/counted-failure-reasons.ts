import { CouponFailureReason } from "../enums/coupon-failure-reason.enum"; 

export const COUNTED_FAILURE_REASONS: readonly CouponFailureReason[] = [
  CouponFailureReason.WRONG_CODE,
  CouponFailureReason.EXPIRED,
  CouponFailureReason.ALREADY_USED,
];