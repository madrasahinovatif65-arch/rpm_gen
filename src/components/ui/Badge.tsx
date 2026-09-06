import React from 'react';
import { badgeSizes, badgeVariants, cn, getBadgeClasses } from '../../design/components';

export interface BadgeProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'variant'> {
  variant?: keyof typeof badgeVariants;
  size?: keyof typeof badgeSizes;
  children: React.ReactNode;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'primary', size = 'sm', className, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(getBadgeClasses(variant as keyof typeof badgeVariants, size as keyof typeof badgeSizes), className)}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
