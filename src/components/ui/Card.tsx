import clsx from 'clsx'

interface CardProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'glass' | 'elevated'
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export function Card({ children, className = '', variant = 'default', padding = 'md' }: CardProps) {
  const variantClasses = {
    default: 'bg-white/10 backdrop-blur-sm border border-white/20',
    glass: 'bg-white/5 backdrop-blur-md border border-white/10',
    elevated: 'bg-white/10 backdrop-blur-sm border border-white/20 shadow-2xl'
  }

  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  }

  return (
    <div className={clsx(
      'rounded-xl',
      variantClasses[variant],
      paddingClasses[padding],
      className
    )}>
      {children}
    </div>
  )
}

interface CardHeaderProps {
  children: React.ReactNode
  className?: string
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
  return (
    <div className={clsx('mb-4', className)}>
      {children}
    </div>
  )
}

interface CardTitleProps {
  children: React.ReactNode
  className?: string
}

export function CardTitle({ children, className = '' }: CardTitleProps) {
  return (
    <h3 className={clsx('text-xl font-bold text-white', className)}>
      {children}
    </h3>
  )
}

interface CardContentProps {
  children: React.ReactNode
  className?: string
}

export function CardContent({ children, className = '' }: CardContentProps) {
  return (
    <div className={className}>
      {children}
    </div>
  )
}
