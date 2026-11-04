export function SlipwayLogo({ size = 'md', className = '' }) {
  const sizeMap = {
    sm: 'w-6 h-6 rounded-[5px]',
    md: 'w-7 h-7 rounded-[6px]',
    lg: 'w-9 h-9 rounded-[8px]',
  }

  const iconSizeMap = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }

  return (
    <div
      className={`bg-zinc-950 dark:bg-white flex items-center justify-center text-white dark:text-zinc-950 shrink-0 shadow-2xs transition-colors ${
        sizeMap[size] || sizeMap.md
      } ${className}`}
    >
      <svg
        className={`${iconSizeMap[size] || iconSizeMap.md}`}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="18 15 12 9 6 15" />
      </svg>
    </div>
  )
}

// Backwards-compatibility alias
export const DeployPortalLogo = SlipwayLogo

