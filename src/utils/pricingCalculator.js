/**
 * Subscription Pricing Engine
 * Single source of truth for all pricing calculations.
 * 
 * @param {number|string} monthlyPrice - The base monthly subscription cost
 * @param {number|string} durationValue - The numeric value of duration
 * @param {string} durationUnit - The unit ('Months' or 'Years')
 * @param {number} gstPercentage - The GST rate (default 18)
 * @returns {Object} { monthlySubscription, subscriptionMonths, contractValue, gstAmount, totalPayable }
 */
export const calculateSubscriptionPricing = (monthlyPrice, durationValue = 1, durationUnit = 'Months', gstPercentage = 18) => {
    const basePrice = parseFloat(monthlyPrice) || 0;
    const value = parseInt(durationValue) || 1;
    const unit = (durationUnit || 'Months').toLowerCase();
    
    // Convert duration to months
    const subscriptionMonths = unit.includes('year') ? value * 12 : value;
    
    const contractValue = basePrice * subscriptionMonths;
    const gstAmount = contractValue * (gstPercentage / 100);
    const totalPayable = contractValue + gstAmount;

    return {
        monthlySubscription: basePrice,
        subscriptionMonths,
        contractValue,
        gstAmount,
        totalPayable
    };
};
