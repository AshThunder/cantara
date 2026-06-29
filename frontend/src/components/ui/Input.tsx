import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'w-full h-12 px-4 rounded-xl border border-gray-200 bg-white text-cantara-deep placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-cantara-teal/30 focus:border-cantara-teal transition-colors',
        className
      )}
      {...props}
    />
  )
);

Input.displayName = 'Input';
