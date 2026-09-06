import React from 'react';
import { cn, getCardClasses } from '../../design/components';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'bordered' | 'elevated' | 'interactive';
  padding?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'bordered', padding = 'md', className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(getCardClasses(variant, padding), className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
