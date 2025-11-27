// utils/date.ts

/**
 * Parse a string (ISO or dd/mm/yyyy) into a Date object.
 */
export const parseDate = (value: string): Date => {
  // If it's already in dd/mm/yyyy format
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
    const [day, month, year] = value.split("/").map(Number);
    return new Date(year, month - 1, day);
  }

  // Fallback to ISO parsing
  return new Date(value);
};

/**
 * Convert a Date object to dd/mm/yyyy format.
 */
export const formatToDDMMYYYY = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Handles both ISO strings and Date objects,
 * always returning dd/mm/yyyy.
 */
export const toDDMMYYYY = (value: Date | string): string => {
  const dateObj = value instanceof Date ? value : parseDate(value);
  return formatToDDMMYYYY(dateObj);
};
