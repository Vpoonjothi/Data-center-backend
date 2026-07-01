import Quote from './src/models/Quote.js';
import { calculateSubscriptionPricing } from './src/utils/pricingCalculator.js';

const fixQuotes = async () => {
    try {
        const quotes = await Quote.findAll();
        for (const quote of quotes) {
            const pricing = calculateSubscriptionPricing(quote.monthly_price, quote.duration_value, quote.duration_unit);
            quote.monthly_price = pricing.monthlySubscription;
            quote.subtotal_price = pricing.contractValue;
            quote.gst_amount = pricing.gstAmount;
            quote.grand_total = pricing.totalPayable;
            await quote.save();
        }
        console.log(`Successfully fixed ${quotes.length} quotes.`);
    } catch (error) {
        console.error('Error fixing quotes:', error);
    } process.exit(0);
};

fixQuotes();
