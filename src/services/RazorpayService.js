import Razorpay from 'razorpay';
import crypto from 'crypto';

class RazorpayService {
  constructor() {
    this.key_id = process.env.RAZORPAY_KEY_ID || 'dummy_key';
    this.key_secret = process.env.RAZORPAY_KEY_SECRET || 'dummy_secret';
    this.webhook_secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'dummy_webhook_secret';
    
    this.isDummy = this.key_id === 'dummy_key';

    if (!this.isDummy) {
      this.instance = new Razorpay({
        key_id: this.key_id,
        key_secret: this.key_secret,
      });
    }
  }

  /**
   * Check if we are running in Dummy / Test Mode based on ENV keys
   * @returns {boolean}
   */
  isTestMode() {
    return this.isDummy;
  }

  /**
   * Creates a Razorpay Order
   * @param {Object} params - { amount, currency, receipt }
   * @returns {Promise<Object>} The Razorpay order object
   */
  async createOrder({ amount, currency = 'INR', receipt }) {
    if (this.isDummy) {
      return {
        id: `dummy_order_${Math.floor(Math.random() * 1000000)}`,
        amount: Math.round(amount * 100),
        currency,
        receipt,
        status: 'created',
      };
    }

    const options = {
      amount: Math.round(amount * 100), // amount in smallest currency unit (paise)
      currency,
      receipt,
    };

    return await this.instance.orders.create(options);
  }

  /**
   * Verifies the Razorpay payment signature
   * @param {string} orderId 
   * @param {string} paymentId 
   * @param {string} signature 
   * @returns {boolean} True if signature is valid
   */
  verifySignature(orderId, paymentId, signature) {
    if (this.isDummy) {
      return true; // Auto-verify in dummy mode
    }

    const shasum = crypto.createHmac('sha256', this.key_secret);
    shasum.update(`${orderId}|${paymentId}`);
    const digest = shasum.digest('hex');

    return digest === signature;
  }

  /**
   * Verifies the Razorpay webhook signature
   * @param {string} rawBody The raw stringified request body
   * @param {string} signature The x-razorpay-signature header
   * @returns {boolean} True if webhook signature is valid
   */
  verifyWebhookSignature(rawBody, signature) {
    if (this.isDummy) {
      return true;
    }

    const shasum = crypto.createHmac('sha256', this.webhook_secret);
    shasum.update(rawBody);
    const digest = shasum.digest('hex');

    return digest === signature;
  }
}

export default new RazorpayService();
