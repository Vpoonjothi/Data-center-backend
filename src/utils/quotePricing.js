/**
 * Central Pricing Engine
 * Calculates subtotal, taxable amount, gst, and grand total based on unit price, quantity, discount, and gst percentage.
 * 
 * Rules:
 * - Quantity >= 1
 * - Unit Price >= 0
 * - Discount >= 0 and <= Subtotal
 * - GST Percentage >= 0
 */

export const calculateQuotePricing = (unitPrice, quantity = 1, discountAmount = 0, gstPercentage = 18) => {
  // Parsing to floats to prevent string concatenation or NaN issues
  const parsedUnitPrice = Math.max(0, parseFloat(unitPrice) || 0);
  const parsedQuantity = Math.max(1, parseInt(quantity, 10) || 1);
  const parsedGstPercentage = Math.max(0, parseFloat(gstPercentage) || 0);
  let parsedDiscount = Math.max(0, parseFloat(discountAmount) || 0);

  const subtotal = parsedUnitPrice * parsedQuantity;

  // Discount cannot exceed subtotal
  if (parsedDiscount > subtotal) {
    parsedDiscount = subtotal;
  }

  const taxableAmount = subtotal - parsedDiscount;
  const gstAmount = taxableAmount * (parsedGstPercentage / 100);
  const grandTotal = taxableAmount + gstAmount;

  return {
    unitPrice: parsedUnitPrice,
    quantity: parsedQuantity,
    subtotal: parseFloat(subtotal.toFixed(2)),
    discountAmount: parseFloat(parsedDiscount.toFixed(2)),
    taxableAmount: parseFloat(taxableAmount.toFixed(2)),
    gstPercentage: parsedGstPercentage,
    gstAmount: parseFloat(gstAmount.toFixed(2)),
    grandTotal: parseFloat(grandTotal.toFixed(2))
  };
};
