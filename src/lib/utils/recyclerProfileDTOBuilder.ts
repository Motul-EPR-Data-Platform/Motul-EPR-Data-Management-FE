import { UpdateRecyclerProfileDTO } from "@/types/auth";
import { CompleteRecyclerAdminProfileFormData } from "@/lib/validations/recycler";
import { formatDateToDDMMYYYY } from "./dateHelper";

/**
 * Helper to normalize null/undefined/empty string for comparison
 */
export const normalizeValue = (value: any): any => {
  if (value === undefined || value === null || value === "") {
    return null;
  }
  return value;
};

/**
 * Helper to normalize date strings for comparison
 */
export const normalizeDateString = (dateStr: string | undefined | null): string | null => {
  if (!dateStr) return null;
  return dateStr.trim() || null;
};

/**
 * Original form data structure for comparison
 */
export interface OriginalRecyclerProfileData {
  vendor_name: string;
  tax_code: string;
  representative: string;
  company_registration_address: string;
  business_reg_number?: string;
  business_reg_issue_date?: string;
  phone: string;
  contact_email: string;
  contact_point?: string;
  contact_phone: string;
  google_map_link?: string;
  env_permit_number: string;
  env_permit_issue_date: string;
  env_permit_expiry_date: string;
  locationRefId?: string;
}

/**
 * Build partial DTO with only changed fields (for edit mode)
 */
export const buildPartialRecyclerProfileDTO = (
  formData: CompleteRecyclerAdminProfileFormData,
  locationRefId: string | undefined,
  formattedBusinessRegIssueDate: string | undefined,
  formattedEnvPermitIssueDate: string | undefined,
  formattedEnvPermitExpiryDate: string | undefined,
  original: OriginalRecyclerProfileData,
): Partial<UpdateRecyclerProfileDTO> => {
  const partialDTO: Partial<UpdateRecyclerProfileDTO> = {};

  // Compare vendor name
  const currentVendorName = normalizeValue(formData.vendor_name);
  const originalVendorName = normalizeValue(original.vendor_name);
  if (currentVendorName !== originalVendorName) {
    partialDTO.vendorName = formData.vendor_name;
  }

  // Compare location refId
  const currentLocationRefId = normalizeValue(locationRefId);
  const originalLocationRefId = normalizeValue(original.locationRefId);
  if (currentLocationRefId !== originalLocationRefId) {
    if (locationRefId) {
      partialDTO.location = { refId: locationRefId };
    }
  }

  // Compare tax code
  const currentTaxCode = normalizeValue(formData.tax_code);
  const originalTaxCode = normalizeValue(original.tax_code);
  if (currentTaxCode !== originalTaxCode) {
    partialDTO.taxCode = formData.tax_code;
  }

  // Compare representative
  const currentRepresentative = normalizeValue(formData.representative);
  const originalRepresentative = normalizeValue(original.representative);
  if (currentRepresentative !== originalRepresentative) {
    partialDTO.representative = formData.representative;
  }

  // Compare phone
  const currentPhone = normalizeValue(formData.phone);
  const originalPhone = normalizeValue(original.phone);
  if (currentPhone !== originalPhone) {
    partialDTO.phone = formData.phone;
  }

  // Compare contact email
  const currentContactEmail = normalizeValue(formData.contact_email);
  const originalContactEmail = normalizeValue(original.contact_email);
  if (currentContactEmail !== originalContactEmail) {
    partialDTO.contactEmail = formData.contact_email;
  }

  // Compare contact point
  const currentContactPoint = normalizeValue(formData.contact_point);
  const originalContactPoint = normalizeValue(original.contact_point);
  if (currentContactPoint !== originalContactPoint) {
    partialDTO.contactPoint = formData.contact_point;
  }

  // Compare contact phone
  const currentContactPhone = normalizeValue(formData.contact_phone);
  const originalContactPhone = normalizeValue(original.contact_phone);
  if (currentContactPhone !== originalContactPhone) {
    partialDTO.contactPhone = formData.contact_phone;
  }

  // Compare business reg number
  const currentBusinessRegNumber = normalizeValue(formData.business_reg_number);
  const originalBusinessRegNumber = normalizeValue(original.business_reg_number);
  if (currentBusinessRegNumber !== originalBusinessRegNumber) {
    partialDTO.businessRegNumber = formData.business_reg_number;
  }

  // Compare business reg issue date
  const currentBusinessRegIssueDate = normalizeDateString(formattedBusinessRegIssueDate);
  const originalBusinessRegIssueDate = normalizeDateString(original.business_reg_issue_date);
  if (currentBusinessRegIssueDate !== originalBusinessRegIssueDate) {
    partialDTO.businessRegIssueDate = formattedBusinessRegIssueDate;
  }

  // Compare google map link
  const currentGoogleMapLink = normalizeValue(formData.google_map_link);
  const originalGoogleMapLink = normalizeValue(original.google_map_link);
  if (currentGoogleMapLink !== originalGoogleMapLink) {
    partialDTO.googleMapLink = formData.google_map_link;
  }

  // Compare env permit number
  const currentEnvPermitNumber = normalizeValue(formData.env_permit_number);
  const originalEnvPermitNumber = normalizeValue(original.env_permit_number);
  if (currentEnvPermitNumber !== originalEnvPermitNumber) {
    partialDTO.envPermitNumber = formData.env_permit_number;
  }

  // Compare env permit issue date
  const currentEnvPermitIssueDate = normalizeDateString(formattedEnvPermitIssueDate);
  const originalEnvPermitIssueDate = normalizeDateString(original.env_permit_issue_date);
  if (currentEnvPermitIssueDate !== originalEnvPermitIssueDate) {
    partialDTO.envPermitIssueDate = formattedEnvPermitIssueDate;
  }

  // Compare env permit expiry date
  const currentEnvPermitExpiryDate = normalizeDateString(formattedEnvPermitExpiryDate);
  const originalEnvPermitExpiryDate = normalizeDateString(original.env_permit_expiry_date);
  if (currentEnvPermitExpiryDate !== originalEnvPermitExpiryDate) {
    partialDTO.envPermitExpiryDate = formattedEnvPermitExpiryDate;
  }

  return partialDTO;
};

