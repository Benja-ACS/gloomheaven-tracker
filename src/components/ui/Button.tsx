import { forwardRef } from 'react'
import clsx from 'clsx'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'success'
  size?: 'sm' | 'default' | 'lg' | 'icon'
  children: React.ReactNode
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', children, ...props }, ref) => {
    const baseClasses = "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"
    
    const variantClasses = {
      default: "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105",
      secondary: "bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/30",
      outline: "border border-gray-400 hover:border-gray-300 text-gray-300 hover:text-white hover:bg-white/10",
      ghost: "text-gray-300 hover:text-white hover:bg-white/10",
      destructive: "bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl",
      success: "bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl"
    }
    
    const sizeClasses = {
      sm: "h-9 px-3 text-sm gap-2",
      default: "h-11 px-6 py-3 gap-2",
      lg: "h-12 px-8 py-4 text-lg gap-3",
      icon: "h-10 w-10"
    }
    
    return (
      <button
        className={clsx(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = "Button"

export { Button }
