import React from 'react';
import { cardPadding, cardVariants, cn, getCardClasses } from '../../design/components';

export interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'variant'> {
  variant?: keyof typeof cardVariants;
  padding?: keyof typeof cardPadding;
  children: React.ReactNode;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'bordered', padding = 'md', className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(getCardClasses(variant as keyof typeof cardVariants, padding as keyof typeof cardPadding), className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
