import { cn } from '@/lib/utils';

interface CardProps {
  children:  React.ReactNode;
  className?: string;
  onClick?:   () => void;
}

export function Card({ children, className, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-surface rounded-2xl border border-brand-border shadow-card',
        onClick && 'cursor-pointer hover:bg-surface-raised transition-colors active:scale-[0.99]',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('px-5 py-4 border-b border-brand-border', className)}>{children}</div>;
}

export function CardBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('px-5 py-4', className)}>{children}</div>;
}
