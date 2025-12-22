"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Location } from "@/types/waste-owner";

interface WasteOwnerLocationFieldsProps {
  location: Location | null | undefined;
  disabled?: boolean;
}

export function WasteOwnerLocationFields({
  location,
  disabled = false,
}: WasteOwnerLocationFieldsProps) {
  if (!location) return null;

  return (
    <div className="grid gap-4">
      {location.address && (
        <div className="grid gap-2">
          <Label>Địa chỉ chi tiết</Label>
          <Input value={location.address} disabled={disabled} />
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        {location.province && (
          <div className="grid gap-2">
            <Label>Tỉnh/Thành phố</Label>
            <Input value={location.province} disabled={disabled} />
          </div>
        )}
        {location.district && (
          <div className="grid gap-2">
            <Label>Quận/Huyện</Label>
            <Input value={location.district} disabled={disabled} />
          </div>
        )}
      </div>
      {location.ward && (
        <div className="grid gap-2">
          <Label>Phường/Xã</Label>
          <Input value={location.ward} disabled={disabled} />
        </div>
      )}
    </div>
  );
}
