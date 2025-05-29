
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Circle, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export type BookingStep = 'details' | 'terms' | 'verification' | 'payment' | 'confirmation';

interface BookingStepsProps {
  currentStep: BookingStep;
  className?: string;
}

const steps = [
  { id: 'details', label: 'Booking Details' },
  { id: 'terms', label: 'Terms & Conditions' },
  { id: 'verification', label: 'Verification' },
  { id: 'payment', label: 'Payment' },
  { id: 'confirmation', label: 'Confirmation' }
];

export const BookingSteps = ({ currentStep, className }: BookingStepsProps) => {
  // Calculate progress percentage based on current step
  const stepIndex = steps.findIndex(step => step.id === currentStep);
  const progressPercentage = Math.round(((stepIndex + 1) / steps.length) * 100);

  return (
    <div className={cn("w-full space-y-4", className)}>
      <Progress value={progressPercentage} />
      
      <div className="flex justify-between">
        {steps.map((step, index) => {
          const isActive = step.id === currentStep;
          const isCompleted = steps.findIndex(s => s.id === currentStep) > index;
          
          return (
            <div key={step.id} className="flex flex-col items-center">
              <div className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full",
                isActive ? "bg-kasadya-purple text-white" : 
                isCompleted ? "bg-green-500 text-white" : 
                "bg-gray-200 text-gray-500"
              )}>
                {isCompleted ? <CheckCircle size={16} /> : (
                  isActive ? index + 1 : <Circle size={16} />
                )}
              </div>
              <span className={cn(
                "text-xs mt-1 hidden md:block",
                isActive ? "text-kasadya-purple font-semibold" : 
                isCompleted ? "text-green-500" : 
                "text-gray-500"
              )}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BookingSteps;
