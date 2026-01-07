
export class LogAttemptDto {

  userId: number;
  productId: number;
  discountCardId?: number | null;
  couponCode: string;
  status: 'success' | 'failed';
  failureReason: string | null;
  priceBefore: number;
  discountAmount: number;
  priceAfter: number;
}
