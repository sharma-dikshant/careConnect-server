import dotenv from 'dotenv';
import Razorpay from 'razorpay';
import crypto from 'node:crypto';

dotenv.config();

interface CreateOrderParams {
  amount: number; // in paise (e.g., ₹500 => 50000)
  currency: string;
}

interface VerifyPaymentParams {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

class Payment {
  private readonly gateway?: Razorpay;
  private readonly keySecret?: string;

  constructor() {
    const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
    const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      console.warn('⚠️ Missing Razorpay config');
      return;
    }

    this.keySecret = RAZORPAY_KEY_SECRET;

    this.gateway = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET,
    });
  }

  async createOrder({ amount, currency }: CreateOrderParams) {
    if (!this.gateway) {
      throw new Error('Payment gateway not initialized');
    }

    try {
      const order = await this.gateway.orders.create({
        amount,
        currency,
      });

      return order;
    } catch (error) {
      console.error('Create order error:', error);
      throw error;
    }
  }

  verifyPayment({
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  }: VerifyPaymentParams): boolean {
    if (!this.keySecret) {
      throw new Error('Missing Razorpay secret');
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSignature = crypto
      .createHmac('sha256', this.keySecret)
      .update(body)
      .digest('hex');

    return expectedSignature === razorpay_signature;
  }
}

const paymentUtility = new Payment();
export default paymentUtility;
