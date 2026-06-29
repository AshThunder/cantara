import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, disabled, children, ...props }, ref) => {
    const base =
      'inline-flex items-center justify-center font-semibold transition-all duration-200 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
      primary: 'bg-cantara-deep text-white hover:bg-cantara-teal-dark focus-visible:ring-cantara-teal',
      secondary: 'bg-cantara-teal/10 text-cantara-teal-dark hover:bg-cantara-teal/20',
      outline: 'border-2 border-cantara-teal text-cantara-teal-dark bg-white hover:bg-cantara-teal hover:text-white',
      ghost: 'text-cantara-teal-dark hover:bg-cantara-mint',
      accent: 'bg-cantara-accent text-cantara-deep hover:bg-amber-400',
    };

    const sizes = {
      sm: 'h-9 px-4 text-sm',
      md: 'h-11 px-6 text-base',
      lg: 'h-14 px-8 text-lg',
    };

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? 'Loading…' : children}
      </button>
    );
  }
);

Button.displayName = 'Button';
