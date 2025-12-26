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
      <div className="flex gap-2">
        {onRedo && (
          <Button
            type="button"
            variant="outline"
            onClick={onRedo}
            disabled={isLoading}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Làm lại
          </Button>
        )}

        {onSaveDraft && (
          <Button
            type="button"
            variant="outline"
            onClick={onSaveDraft}
            disabled={isLoading}
          >
            <Save className="w-4 h-4 mr-2" />
            Lưu nháp
          </Button>
        )}

        {canGoBack && onBack && currentStep > 1 && (
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={isLoading}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
        )}

        {isLastStep
          ? onSubmit && (
              <Button
                type="button"
                onClick={onSubmit}
                disabled={isLoading || !canGoNext}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Check className="w-4 h-4 mr-2" />
                Gửi phê duyệt
              </Button>
            )
          : onNext && (
              <Button
                type="button"
                onClick={onNext}
                disabled={isLoading || !canGoNext}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Tiếp theo
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
      </div>
    </div>
  );
}
