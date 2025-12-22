"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  label: string;
  number: number;
}

interface ProgressStepperProps {
  steps: Step[];
  currentStep: number;
  completedSteps?: number[];
}

export function ProgressStepper({
  steps,
  currentStep,
  completedSteps = [],
}: ProgressStepperProps) {
  return (
    <div className="flex items-center justify-between w-full">
      {steps.map((step, index) => {
        const isCompleted = completedSteps.includes(step.number);
        const isCurrent = step.number === currentStep;
        const isPast = step.number < currentStep;

        return (
          <div key={step.number} className="flex items-center flex-1">
            {/* Step Circle */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors",
                  isCompleted
                    ? "bg-red-600 border-red-600 text-white"
                    : isCurrent
                      ? "bg-red-600 border-red-600 text-white"
                      : "bg-white border-gray-300 text-gray-400",
                )}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-semibold">{step.number}</span>
                )}
              </div>
              <span
                className={cn(
                  "mt-2 text-xs text-center max-w-[120px]",
                  isCompleted || isCurrent
                    ? "text-red-600 font-medium"
                    : "text-gray-400",
                )}
              >
                {step.label}
              </span>
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-0.5 mx-2 transition-colors",
                  isPast || isCompleted
                    ? "bg-red-600"
                    : "bg-gray-300",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

