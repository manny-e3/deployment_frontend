export function Card({
  children,
  className = '',
  padding = 'standard',
  title,
  subtitle,
  action,
}) {
  const paddingClass = {
    standard: 'p-4 sm:p-5',
    compact: 'p-3',
    none: 'p-0',
  }[padding] || 'p-4 sm:p-5'

  const hasHeader = title || action

  return (
    <div className={`bg-white dark:bg-[#0E131B] border border-zinc-200/90 dark:border-[#1A222D] rounded-[6px] shadow-[0_1px_2px_rgba(0,0,0,0.02)] overflow-hidden transition-colors duration-150 ${className}`}>
      {hasHeader && (
        <div className="px-4 py-3 border-b border-zinc-100 dark:border-[#1A222D] flex items-center justify-between bg-white dark:bg-[#0E131B] transition-colors duration-150">
          <div>
            {title && (
              <div className="text-[13.5px] font-semibold text-zinc-950 dark:text-zinc-100 tracking-tight">
                {title}
              </div>
            )}
            {subtitle && (
              <div className="text-[11.5px] text-zinc-500 dark:text-zinc-400 mt-0.5 font-normal">
                {subtitle}
              </div>
            )}
          </div>
          {action && <div className="flex items-center gap-2">{action}</div>}
        </div>
      )}
      <div className={paddingClass}>{children}</div>
    </div>
  )
}
