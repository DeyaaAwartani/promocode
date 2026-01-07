export const COUPON_ATTEMPT_STATUS = {
  SUCCESS: 'success',
  FAILED: 'failed',
} as const;

export const COUPON_FAILURE_REASON = {
  WRONG_CODE: 'wrong_code',
  EXPIRED: 'expired',
  RATE_LIMIT: 'rate_limit',
  ALREADY_USED: 'already_used'
} as const;

// failed per minute"
export const COUNTED_FAILURE_REASONS = [
  COUPON_FAILURE_REASON.WRONG_CODE,
  COUPON_FAILURE_REASON.EXPIRED,
  COUPON_FAILURE_REASON.ALREADY_USED
] as const;