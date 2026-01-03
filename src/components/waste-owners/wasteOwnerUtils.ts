import { WasteOwnerType } from "@/types/waste-owner";

export function getWasteOwnerTypeLabel(type: WasteOwnerType | string): string {
  switch (type) {
    case "individual":
      return "Cá nhân";
    case "business":
      return "Doanh nghiệp";
    case "organization":
      return "Hộ kinh doanh";
    default:
      return type;
  }
}

export function getWasteOwnerTypeBadgeVariant(
  type: WasteOwnerType | string,
): "default" | "secondary" | "outline" {
  switch (type) {
    case "individual":
      return "outline";
    case "business":
      return "default";
    case "organization":
      return "secondary";
    default:
      return "outline";
  }
}

export function getNameLabel(type: WasteOwnerType | string): string {
  switch (type) {
    case "individual":
      return "Tên Cá nhân *";
    case "business":
      return "Tên Doanh nghiệp *";
    case "organization":
      return "Tên Hộ kinh doanh *";
    default:
      return "Tên *";
  }
}

export function getBusinessCodeLabel(type: WasteOwnerType | string): string {
  switch (type) {
    case "individual":
      return "Số CCCD *";
    case "business":
    case "organization":
      return "Mã số thuế (MST) *";
    default:
      return "Mã số thuế (MST) *";
  }
}
