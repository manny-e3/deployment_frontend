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
  const sizeClasses = size === 'compact' 
    ? 'h-[30px] px-2.5 text-[12px] rounded-[5px]' 
    : size === 'large'
      ? 'h-[38px] px-4 text-[13.5px] rounded-[6px]'
      : 'h-[34px] px-3 text-[12.5px] rounded-[6px]'

  let variantClasses = ''
  switch (variant) {
    case 'primary':
      variantClasses =
        'bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white active:bg-black dark:active:bg-zinc-200 text-white dark:text-zinc-950 border border-transparent shadow-[0_1px_2px_rgba(0,0,0,0.1)] focus:ring-2 focus:ring-zinc-400/30'
      break
    case 'secondary':
      variantClasses =
        'bg-white hover:bg-zinc-50 dark:bg-[#131A24] dark:hover:bg-[#1A2330] hover:border-zinc-300 dark:hover:border-[#2A3748] active:bg-zinc-100 dark:active:bg-[#0E1520] text-zinc-800 dark:text-zinc-200 border border-zinc-200/90 dark:border-[#1E2937] shadow-[0_1px_2px_rgba(0,0,0,0.02)] focus:ring-2 focus:ring-zinc-200'
      break
    case 'ghost':
      variantClasses =
        'bg-transparent hover:bg-zinc-100 dark:hover:bg-[#1A2330] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 border-0 focus:ring-2 focus:ring-zinc-200'
      break
    case 'destructive':
      variantClasses =
        'bg-white hover:bg-red-50 dark:bg-[#1A1215] dark:hover:bg-[#2A161B] hover:border-red-300 dark:hover:border-red-900 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 active:bg-red-100 focus:ring-2 focus:ring-red-200'
      break
  }

  return (
    <button
      type="button"
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-1.5 font-medium select-none cursor-pointer transition-colors duration-100 disabled:opacity-40 disabled:cursor-not-allowed ${sizeClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
      {iconRight && <span className="shrink-0">{iconRight}</span>}
    </button>
  )
}
