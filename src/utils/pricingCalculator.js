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

/**
 * Reverse calculate pricing from Final Payable Amount (Grand Total)
 * 
 * @param {number|string} finalAmount - The total payable amount (including GST)
 * @param {number|string} durationValue - The numeric value of duration
 * @param {string} durationUnit - The unit ('Months' or 'Years')
 * @param {number} gstPercentage - The GST rate (default 18)
 * @returns {Object} The complete pricing object
 */
export const calculateSubscriptionPricingFromFinal = (finalAmount, durationValue = 1, durationUnit = 'Months', gstPercentage = 18) => {
    const totalPayable = parseFloat(finalAmount) || 0;
    const contractValue = totalPayable / (1 + (gstPercentage / 100));
    
    const value = parseInt(durationValue) || 1;
    const unit = (durationUnit || 'Months').toLowerCase();
    const subscriptionMonths = unit.includes('year') ? value * 12 : value;
    
    const basePrice = contractValue / subscriptionMonths;
    
    return calculateSubscriptionPricing(basePrice, durationValue, durationUnit, gstPercentage);
};
