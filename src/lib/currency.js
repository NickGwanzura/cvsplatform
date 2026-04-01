// Exchange rate — update as needed
export const ZWL_RATE = 2750; // 1 USD = 2750 ZWL

export function convert(amount, from, to) {
  if (from === to) return amount;
  if (from === 'USD' && to === 'ZWL') return amount * ZWL_RATE;
  if (from === 'ZWL' && to === 'USD') return amount / ZWL_RATE;
  return amount;
}

export function formatMoney(amount, currency = 'USD') {
  if (currency === 'ZWL') {
    return `ZWL ${Math.round(amount).toLocaleString()}`;
  }
  return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatMoneyShort(amount, currency = 'USD') {
  if (currency === 'ZWL') {
    return `ZWL${Math.round(amount).toLocaleString()}`;
  }
  return `$${amount.toLocaleString()}`;
}
