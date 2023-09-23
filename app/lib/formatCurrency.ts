const currency = process.env.CURRENCY || "€";
const decimalSeperator = process.env.CURRENCY_SEPERATOR || ".";
const currencyBefore = process.env.CURRENCY_BEFORE || false;

export default function formatCurrency(amount: number): string {
  const decimal = Math.abs(amount % 100);
  return (
    (currencyBefore ? currency : "") +
    Math.floor(amount / 100).toString() +
    decimalSeperator +
    (decimal < 10 ? "0" : "") +
    decimal +
    (currencyBefore ? "" : currency)
  );
}
