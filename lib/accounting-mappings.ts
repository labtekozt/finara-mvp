// Accounting category mappings between UI display names and Prisma enum values
export const ACCOUNT_CATEGORY_MAPPINGS = {
  // UI Display Name -> Prisma Enum Value
  "Kas & Bank": "CURRENT_ASSET",
  "Piutang": "CURRENT_ASSET",
  "Persediaan": "CURRENT_ASSET",
  "Aktiva Tetap": "FIXED_ASSET",
  "Utang": "CURRENT_LIABILITY",
  "Ekuitas": "OWNER_EQUITY",
  "Pendapatan": "OPERATING_REVENUE",
  "Beban Operasional": "OPERATING_EXPENSE",
  "Beban Lainnya": "OTHER_EXPENSE",
} as const;

export type AccountCategoryDisplay = keyof typeof ACCOUNT_CATEGORY_MAPPINGS;
export type AccountCategoryEnum = typeof ACCOUNT_CATEGORY_MAPPINGS[AccountCategoryDisplay];

/**
 * Convert UI display category name to Prisma enum value
 */
export function mapDisplayCategoryToEnum(displayCategory: string): AccountCategoryEnum | null {
  return ACCOUNT_CATEGORY_MAPPINGS[displayCategory as AccountCategoryDisplay] || null;
}

/**
 * Convert Prisma enum value to UI display category name
 */
export function mapEnumToDisplayCategory(enumValue: string): string | null {
  const reverseMapping = Object.entries(ACCOUNT_CATEGORY_MAPPINGS).find(
    ([, enumVal]) => enumVal === enumValue
  );
  return reverseMapping ? reverseMapping[0] : null;
}

/**
 * Get all available display category names
 */
export function getDisplayCategories(): AccountCategoryDisplay[] {
  return [
    "Kas & Bank",
    "Piutang",
    "Persediaan",
    "Aktiva Tetap",
    "Utang",
    "Ekuitas",
    "Pendapatan",
    "Beban Operasional",
    "Beban Lainnya",
  ];
}

/**
 * Get all available enum values
 */
export function getEnumCategories(): AccountCategoryEnum[] {
  return Object.values(ACCOUNT_CATEGORY_MAPPINGS);
}