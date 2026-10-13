import type { Language } from "../i18n/translations";

export interface Currency {
  code: string;
  symbol: string;
  decimals: number;
  name: Record<Language, string>;
}

export const CURRENCIES: Currency[] = [
  {
    code: "XAF",
    symbol: "FCFA",
    decimals: 0,
    name: { fr: "Franc CFA", en: "CFA Franc" },
  },
  {
    code: "EUR",
    symbol: "€",
    decimals: 2,
    name: { fr: "Euro", en: "Euro" },
  },
  {
    code: "USD",
    symbol: "$",
    decimals: 2,
    name: { fr: "Dollar US", en: "US Dollar" },
  },
  {
    code: "GBP",
    symbol: "£",
    decimals: 2,
    name: { fr: "Livre sterling", en: "British Pound" },
  },
  {
    code: "CAD",
    symbol: "CA$",
    decimals: 2,
    name: { fr: "Dollar canadien", en: "Canadian Dollar" },
  },
  {
    code: "CHF",
    symbol: "CHF",
    decimals: 2,
    name: { fr: "Franc suisse", en: "Swiss Franc" },
  },
  {
    code: "DZD",
    symbol: "DA",
    decimals: 2,
    name: { fr: "Dinar algérien", en: "Algerian Dinar" },
  },
  {
    code: "MAD",
    symbol: "DH",
    decimals: 2,
    name: { fr: "Dirham marocain", en: "Moroccan Dirham" },
  },
  {
    code: "ZAR",
    symbol: "R",
    decimals: 2,
    name: { fr: "Rand", en: "South African Rand" },
  },
  {
    code: "JPY",
    symbol: "¥",
    decimals: 0,
    name: { fr: "Yen japonais", en: "Japanese Yen" },
  },
  {
    code: "CNY",
    symbol: "¥",
    decimals: 2,
    name: { fr: "Yuan chinois", en: "Chinese Yuan" },
  },
  {
    code: "INR",
    symbol: "₹",
    decimals: 2,
    name: { fr: "Roupie indienne", en: "Indian Rupee" },
  },
];

export const DEFAULT_CURRENCY_CODE = "XAF";

export function getCurrency(code: string): Currency {
  return CURRENCIES.find((currency) => currency.code === code) ?? CURRENCIES[0];
}
