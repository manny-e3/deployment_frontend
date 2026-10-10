export function StatusBadge({ status, showPulse = true }) {
  if (status === 'success') {
    return (
      <span className="inline-flex items-center gap-1.5 h-[20px] px-[6px] rounded-[4px] bg-[#EAF5EE] border border-[#B8E0C5] text-[#2E8B57] font-mono text-[11px] font-semibold uppercase tracking-wider select-none shrink-0">
        <span className="w-[6px] h-[6px] rounded-full bg-[#2E8B57]" />
        <span>SUCCESS</span>
      </span>
    )
  }

  if (status === 'running') {
    return (
      <span className="inline-flex items-center gap-1.5 h-[20px] px-[6px] rounded-[4px] bg-[#FAF3E7] border border-[#F1D6A4] text-[#B87E0C] font-mono text-[11px] font-semibold uppercase tracking-wider select-none shrink-0">
        <span className={`w-[6px] h-[6px] rounded-full bg-[#B87E0C] ${showPulse ? 'animate-ping' : ''}`} />
        <span className="relative flex h-[6px] w-[6px] -ml-3">
          <span className="relative inline-flex rounded-full h-[6px] w-[6px] bg-[#B87E0C]"></span>
        </span>
        <span>IN PROGRESS</span>
      </span>
    )
  }

  // Failed / Incident
  return (
    <span className="inline-flex items-center gap-1.5 h-[20px] px-[6px] rounded-[4px] bg-[#FAEBE9] border border-[#F1B5AC] text-[#C2412D] font-mono text-[11px] font-semibold uppercase tracking-wider select-none shrink-0">
      <span className="w-[6px] h-[6px] rounded-full bg-[#C2412D]" />
      <span>FAILED</span>
    </span>
  )
}
