import { cn } from '@/lib/utils';

const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' };

export function Spinner({ size = 'md', className }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-brand-border border-t-primary',
        sizes[size],
        className,
      )}
    />
  );
}
