/**
 * Formats a USD numeric value or string into Indian Rupees (INR)
 * using an exchange rate of 1 USD = 83 INR.
 * 
 * @param {number|string} value - The price to convert
 * @returns {string} The formatted INR string
 */
export const formatINR = (value) => {
  if (value === null || value === undefined) return '';
  
  let numericValue;
  if (typeof value === 'string') {
    numericValue = parseFloat(value.replace(/[^0-9.]/g, ''));
    if (isNaN(numericValue)) return value;
  } else {
    numericValue = value;
  }

  const inrAmount = Math.round(numericValue * 83);
  return `₹${inrAmount.toLocaleString('en-IN')}`;
};
