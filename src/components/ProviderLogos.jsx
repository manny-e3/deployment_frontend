import React from 'react'

export function DigitalOceanLogo({ className = 'w-6 h-6' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2C6.477 2 2 6.477 2 12c0 4.237 2.636 7.855 6.356 9.312v-3.79c-1.898-.946-3.2-2.91-3.2-5.176 0-3.195 2.59-5.786 5.785-5.786 3.195 0 5.786 2.59 5.786 5.786 0 2.265-1.302 4.23-3.2 5.176v3.79C17.364 19.855 20 16.237 20 12c0-5.523-4.477-10-10-10z"
        fill="#0080FF"
      />
      <rect x="7.44" y="18.84" width="3.2" height="3.2" rx="0.5" fill="#0080FF" />
      <rect x="4.4" y="16.4" width="2.4" height="2.4" rx="0.4" fill="#0080FF" />
      <rect x="2.4" y="13.2" width="1.6" height="1.6" rx="0.3" fill="#0080FF" />
    </svg>
  )
}

export function HetznerLogo({ className = 'w-6 h-6' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="4.5" fill="#D50C2D" />
      <path
        d="M6.5 6h2.8v4.6h5.4V6h2.8v12h-2.8v-5H9.3v5H6.5V6z"
        fill="#FFFFFF"
      />
    </svg>
  )
}

export function VultrLogo({ className = 'w-6 h-6' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M2.5 5.5l9.5 14.5 9.5-14.5h-4.2l-5.3 8.3-5.3-8.3H2.5z"
        fill="#007BFC"
      />
    </svg>
  )
}

export function LinodeLogo({ className = 'w-6 h-6' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="#00A95C" />
      <path
        d="M12 6c-2.8 0-5 2.2-5 5 0 3.9 5 8 5 8s5-4.1 5-8c0-2.8-2.2-5-5-5zm0 6.8c-1 0-1.8-.8-1.8-1.8s.8-1.8 1.8-1.8 1.8.8 1.8 1.8-.8 1.8-1.8 1.8z"
        fill="#FFFFFF"
      />
    </svg>
  )
}

export function AmazonEC2Logo({ className = 'w-6 h-6' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2l8 4.5v11L12 22l-8-4.5v-11L12 2z"
        fill="#FF9900"
      />
      <path
        d="M12 2v20M4 6.5l8 4.5 8-4.5"
        stroke="#FFFFFF"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <text
        x="12"
        y="17"
        fontSize="5"
        fontWeight="bold"
        fill="#232F3E"
        textAnchor="middle"
        fontFamily="sans-serif"
      >
        EC2
      </text>
    </svg>
  )
}

export function UpCloudLogo({ className = 'w-6 h-6' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M7.5 16.5A4.5 4.5 0 014 12a4.5 4.5 0 015-4.47 5.5 5.5 0 0110.5 1.97 4 4 0 01-3 7"
        stroke="#7B1FA2"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function KrystalLogo({ className = 'w-6 h-6' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <polygon
        points="12 2 21 7 21 17 12 22 3 17 3 7"
        stroke="#00A8A8"
        strokeWidth="2"
        fill="#E6F7F7"
      />
      <path
        d="M12 2v20M3 7l9 5 9-5M3 17l9-5 9 5"
        stroke="#00A8A8"
        strokeWidth="1.5"
      />
    </svg>
  )
}

export function HostingerLogo({ className = 'w-6 h-6' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="5" fill="#673AB7" />
      <path
        d="M7 6v12M17 6v12M7 12h10"
        stroke="#FFFFFF"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function CustomServerLogo({ className = 'w-6 h-6' }) {
  return (
    <div className={`flex items-center justify-center text-[#005459] dark:text-[#00DF8F] ${className}`}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
        <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
        <line x1="6" y1="6" x2="6.01" y2="6" />
        <line x1="6" y1="18" x2="6.01" y2="18" />
        <path d="m13 6 2 2-2 2" />
      </svg>
    </div>
  )
}

