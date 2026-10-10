export function Button({
  children,
  variant = 'secondary',
  size = 'regular',
  icon,
  iconRight,
  className = '',
  disabled,
  ...props
}) {
  const sizeClasses = size === 'compact' ? 'h-[32px] px-3 text-[13px]' : 'h-[36px] px-3.5 text-[13px]'

  let variantClasses = ''
  switch (variant) {
    case 'primary':
      variantClasses =
        'bg-[#0F6E74] hover:bg-[#0B5459] active:bg-[#083F43] text-white border-0 focus:ring-2 focus:ring-[#0F6E74]/20'
      break
    case 'secondary':
      variantClasses =
        'bg-[#FFFFFF] hover:bg-[#EDF0EE] hover:border-[#B0B9B3] text-[#17202A] border border-[#CDD4D0] active:bg-[#E2E7E4] focus:ring-2 focus:ring-[#0F6E74]/15'
      break
    case 'ghost':
      variantClasses =
        'bg-transparent hover:bg-[#EDF0EE] text-[#5E6B76] hover:text-[#17202A] border-0 focus:ring-2 focus:ring-[#0F6E74]/15'
      break
    case 'destructive':
      variantClasses =
        'bg-[#FAEBE9] hover:bg-[#C2412D] text-[#C2412D] hover:text-white border border-[#F1B5AC] focus:ring-2 focus:ring-[#C2412D]/20'
      break
  }

  return (
    <button
      type="button"
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-1.5 font-medium rounded-[6px] select-none cursor-pointer transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
      {iconRight && <span className="shrink-0">{iconRight}</span>}
    </button>
  )
}
