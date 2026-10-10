import React from 'react'

export const Input = React.forwardRef(
  ({ icon, className = '', error, ...props }, ref) => {
    return (
      <div className="relative flex items-center w-full">
        {icon && (
          <span className="absolute left-2.5 text-[#5E6B76] pointer-events-none flex items-center justify-center">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          className={`h-[32px] w-full bg-[#FFFFFF] border rounded-[6px] text-[13px] text-[#17202A] placeholder-[#5E6B76] transition-all duration-150 outline-none ${
            icon ? 'pl-8 pr-3' : 'px-3'
          } ${
            error
              ? 'border-[#C2412D] focus:border-[#C2412D] focus:ring-2 focus:ring-[#C2412D]/15'
              : 'border-[#CDD4D0] focus:border-[#0F6E74] focus:ring-2 focus:ring-[#0F6E74]/15'
          } ${className}`}
          {...props}
        />
      </div>
    )
  }
)

Input.displayName = 'Input'
