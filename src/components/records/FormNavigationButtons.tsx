"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, RotateCcw, Save, Check } from "lucide-react";

interface FormNavigationButtonsProps {
  currentStep: number;
  totalSteps: number;
  onBack?: () => void;
  onRedo?: () => void;
  onSaveDraft?: () => void;
  onNext?: () => void;
  onSubmit?: () => void;
  isLastStep?: boolean;
  isLoading?: boolean;
  canGoBack?: boolean;
  canGoNext?: boolean;
}

export function FormNavigationButtons({
  currentStep,
  totalSteps,
  onBack,
  onRedo,
  onSaveDraft,
  onNext,
  onSubmit,
  isLastStep = false,
  isLoading = false,
  canGoBack = true,
  canGoNext = true,
}: FormNavigationButtonsProps) {
  return (
    <div className="flex items-center justify-end pt-6 border-t">
      {/* Right side - Action buttons */}
      <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-end">
        {onRedo && (
          <Button
            type="button"
            variant="outline"
            onClick={onRedo}
            disabled={isLoading}
            className="flex-1 sm:flex-initial text-xs sm:text-sm"
          >
            <RotateCcw className="w-4 h-4 sm:mr-2" />
            <span>Làm lại</span>
          </Button>
        )}

        {onSaveDraft && (
          <Button
            type="button"
            variant="outline"
            onClick={onSaveDraft}
            disabled={isLoading}
            className="flex-1 sm:flex-initial text-xs sm:text-sm"
          >
            <Save className="w-4 h-4 sm:mr-2" />
            <span>Lưu nháp</span>
          </Button>
        )}

        {canGoBack && onBack && currentStep > 1 && (
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={isLoading}
            className="flex-1 sm:flex-initial text-xs sm:text-sm"
          >
            <ArrowLeft className="w-4 h-4 sm:mr-2" />
            <span>Quay lại</span>
          </Button>
        )}

        {isLastStep
          ? onSubmit && (
              <Button
                type="button"
                onClick={onSubmit}
                disabled={isLoading || !canGoNext}
                className="bg-green-600 hover:bg-green-700 text-white flex-1 sm:flex-initial text-xs sm:text-sm"
              >
                <Check className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Gửi phê duyệt</span>
                <span className="sm:hidden">Gửi</span>
              </Button>
            )
          : onNext && (
              <Button
                type="button"
                onClick={onNext}
                disabled={isLoading || !canGoNext}
                className="bg-red-600 hover:bg-red-700 text-white flex-1 sm:flex-initial text-xs sm:text-sm"
              >
                <span className="hidden sm:inline">Tiếp theo</span>
                <span className="sm:hidden">Tiếp</span>
                <ArrowRight className="w-4 h-4 sm:ml-2" />
              </Button>
            )}
      </div>
    </div>
  );
}
