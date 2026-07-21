import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  [
    'relative inline-flex items-center justify-center gap-2 whitespace-nowrap',
    'font-medium select-none',
    'rounded-button shadow-button',
    'transition-[background-color,color,box-shadow,opacity] duration-150',
    'focus-visible:outline-none focus-visible:shadow-[var(--focus-ring-shadow)]',
    'disabled:pointer-events-none disabled:opacity-[var(--state-disabled)]',
    '[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:size-4',
  ].join(' '),
  {
    variants: {
      variant: {
        primary:
          'bg-[var(--primary-default)] text-[var(--on-primary)] hover:bg-[var(--primary-hover)] active:bg-[var(--primary-active)]',
        secondary:
          'bg-white text-[var(--on-secondary)] border border-[var(--border-subtle)] shadow-none hover:bg-[var(--secondary-hover)]',
        ghost:
          'bg-transparent shadow-none text-[var(--text-primary)] hover:bg-[var(--state-hover-overlay)]',
        subtle: 'bg-[var(--primary-subtle)] text-[var(--sidebar-active-fg)] shadow-none hover:bg-[var(--primary-subtle)]/80',
        danger: 'bg-danger text-[var(--on-danger)] hover:bg-[var(--danger-hover)]',
        link: 'bg-transparent shadow-none text-[var(--link)] underline-offset-4 hover:underline hover:text-[var(--link-hover)] px-0 h-auto',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-9 px-4 text-sm',
        lg: 'h-11 px-6 text-base',
        icon: 'h-9 w-9 p-0',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'disabled'>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  disabled?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      disabled = false,
      children,
      type,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : 'button';
    const isDisabled = disabled || loading;

    return (
      <Comp
        ref={ref}
        type={asChild ? undefined : (type ?? 'button')}
        className={cn(buttonVariants({ variant, size }), className)}
        aria-busy={loading || undefined}
        aria-disabled={isDisabled || undefined}
        disabled={asChild ? undefined : isDisabled}
        {...props}
      >
        {asChild ? (
          children
        ) : (
          <>
            {loading ? <Loader2 className="animate-spin" aria-hidden /> : null}
            {children}
          </>
        )}
      </Comp>
    );
  },
);
Button.displayName = 'Button';

export { buttonVariants };
