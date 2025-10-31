export function formatCurrency(amount: number, currency = 'USD', locale = 'en-US'): string {
  // Convert from cents to dollars
  const value = amount / 100;
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2
  }).format(value);
}

export function formatNumber(value: number, locale = 'en-US'): string {
  return new Intl.NumberFormat(locale).format(value);
}

export function parseCurrencyInput(input: string): number {
  // Remove currency symbols and convert to cents
  const cleaned = input.replace(/[^0-9.]/g, '');
  const value = parseFloat(cleaned) || 0;
  return Math.round(value * 100);
}

export function calculateTax(amount: number, taxRate: number): number {
  return Math.round(amount * (taxRate / 100));
}

export function calculateLineTotal(quantity: number, unitPrice: number, taxRate: number): number {
  const subtotal = quantity * unitPrice;
  const tax = calculateTax(subtotal, taxRate);
  return subtotal + tax;
}