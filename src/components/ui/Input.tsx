import React from 'react';
import { cn } from '../../design/components';
import { inputBase, inputStates } from '../../design/components';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  success?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ error, success, disabled, className, ...props }, ref) => {
    const stateClass = error 
      ? inputStates.error 
      : success 
      ? inputStates.success 
      : disabled 
      ? inputStates.disabled 
      : '';
    
    return (
      <input
        ref={ref}
        className={cn(inputBase, stateClass, className)}
        disabled={disabled}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
