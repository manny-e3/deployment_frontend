export function Card({
  children,
  className = '',
  padding = 'standard',
  title,
  subtitle,
  action,
}) {
  const paddingClass = {
    standard: 'p-[16px]',
    compact: 'p-[12px]',
    none: 'p-0',
  }[padding] || 'p-[16px]'

  const hasHeader = title || action

  return (
    <div className={`bg-[#FFFFFF] border border-[#CDD4D0] rounded-[8px] overflow-hidden ${className}`}>
      {hasHeader && (
        <div className="px-[16px] py-[10px] border-b border-[#E2E7E4] flex items-center justify-between bg-[#FFFFFF]">
          <div>
            {title && (
              <div className="text-[14px] font-semibold text-[#17202A] tracking-tight">
                {title}
              </div>
            )}
            {subtitle && (
              <div className="text-[12px] text-[#5E6B76] mt-0.5 font-normal">
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
