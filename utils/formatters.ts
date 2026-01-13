export const formatPrice = (value: number): string => {
  // Use de-DE locale to ensure dots are used as thousands separators (e.g., 1.000,00)
  // This satisfies the request to "add . after every 3 0s" (thousands grouping)
  return new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};