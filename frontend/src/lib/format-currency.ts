export function formatCurrency(amount: number): string {
  if (amount === undefined || amount === null) {
    return 'N/A';
  }

  // Convert to string and split by decimal point
  const [whole, decimal] = amount.toString().split('.');
  
  // Add commas to the whole number part
  const formattedWhole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  
  // If there's a decimal part, add it back
  const formattedAmount = `${formattedWhole}${decimal ? `.${decimal}` : ''}`;
  
  // Add the currency symbol
  return `${formattedAmount}`;
} 