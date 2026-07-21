import * as React from 'react';
import { cn } from '@/lib/utils';

type TextRole = 'body' | 'bodySmall' | 'caption' | 'overline';
type TextIntent = 'primary' | 'muted' | 'secondary';

const roleClass: Record<TextRole, string> = {
  body: 'text-base leading-normal',
  bodySmall: 'text-sm leading-normal',
  caption: 'text-xs leading-snug',
  overline: 'text-[0.6875rem] font-semibold uppercase tracking-[0.12em]',
};

const intentClass: Record<TextIntent, string> = {
  primary: 'text-[var(--text-primary)]',
  secondary: 'text-[var(--text-secondary)]',
  muted: 'text-[var(--text-muted)]',
};

export interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  role?: TextRole;
  intent?: TextIntent;
  as?: 'p' | 'span';
}

export function Text({
  className,
  role = 'body',
  intent = 'primary',
  as: Comp = 'p',
  ...props
}: TextProps) {
  return <Comp className={cn(roleClass[role], intentClass[intent], className)} {...props} />;
}
