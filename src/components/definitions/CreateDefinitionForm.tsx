"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Category, CreateDefinitionDTO, FieldSchema } from "@/types/definition";
import { Textarea } from "@/components/ui/textarea";

interface CreateDefinitionFormProps {
  category: Category;
  onSubmit: (data: CreateDefinitionDTO) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function CreateDefinitionForm({
  category,
  onSubmit,
  onCancel,
  isLoading = false,
}: CreateDefinitionFormProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
    // Clear error when user starts typing
    if (errors[fieldName]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    category.schemaDefinition.forEach((field: FieldSchema) => {
      if (field.required && !formData[field.name]) {
        newErrors[field.name] = `${field.label} là bắt buộc`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const submitData: CreateDefinitionDTO = {
      data: formData,
    };

    await onSubmit(submitData);
  };

  const renderField = (field: FieldSchema) => {
    const value = formData[field.name] ?? field.defaultValue ?? "";
    const error = errors[field.name];

    switch (field.type) {
      case "string":
      case "textarea":
        const InputComponent = field.type === "textarea" ? Textarea : Input;
        return (
          <div key={field.name} className="grid gap-2">
            <Label htmlFor={field.name}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <InputComponent
              id={field.name}
              placeholder={field.placeholder || `Nhập ${field.label.toLowerCase()}`}
              value={value}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              required={field.required}
              disabled={isLoading}
              className={error ? "border-red-500" : ""}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );

      case "number":
        return (
          <div key={field.name} className="grid gap-2">
            <Label htmlFor={field.name}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={field.name}
              type="number"
              placeholder={field.placeholder || `Nhập ${field.label.toLowerCase()}`}
              value={value}
              onChange={(e) =>
                handleFieldChange(field.name, e.target.value ? Number(e.target.value) : "")
              }
              required={field.required}
              disabled={isLoading}
              className={error ? "border-red-500" : ""}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );

      case "boolean":
        return (
          <div key={field.name} className="flex items-center gap-2">
            <input
              type="checkbox"
              id={field.name}
              checked={value || false}
              onChange={(e) => handleFieldChange(field.name, e.target.checked)}
              disabled={isLoading}
              className="h-4 w-4"
            />
            <Label htmlFor={field.name}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );

      case "date":
        return (
          <div key={field.name} className="grid gap-2">
            <Label htmlFor={field.name}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={field.name}
              type="date"
              value={value}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              required={field.required}
              disabled={isLoading}
              className={error ? "border-red-500" : ""}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );

      case "select":
        return (
          <div key={field.name} className="grid gap-2">
            <Label htmlFor={field.name}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Select
              value={value}
              onValueChange={(val) => handleFieldChange(field.name, val)}
              required={field.required}
              disabled={isLoading}
            >
              <SelectTrigger id={field.name} className={error ? "border-red-500" : ""}>
                <SelectValue placeholder={`Chọn ${field.label.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4">
        {category.schemaDefinition.map((field) => renderField(field))}
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Hủy
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Đang tạo..." : "Tạo định nghĩa"}
        </Button>
      </div>
    </form>
  );
}

