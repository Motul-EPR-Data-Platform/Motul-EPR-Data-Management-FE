export const formatHazWasteCode = (code: string | undefined): string => {
  if (!code) return "";
  return code.replace(/\s/g, ""); // Remove spaces
};

export const formatRecycledDate = (date: string | undefined): string => {
  if (!date) return "";
  return date.replace(/-/g, ""); // Remove dashes
};

export const formatWasteOwnerType = (type: string | undefined): string => {
  if (!type) return "";
  switch (type.toLowerCase()) {
    case "company":
      return "DN";
    case "organizational":
      return "TC";
    case "individual":
      return "CN";
    default:
      return type;
  }
};