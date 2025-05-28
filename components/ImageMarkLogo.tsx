import type React from "react"

interface ImageMarkLogoProps {
  className?: string
}

export const ImageMarkLogo: React.FC<ImageMarkLogoProps> = ({ className = "w-8 h-8" }) => (
  <svg
    className={className}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="ImageMark Logo"
  >
    <rect x="2" y="6" width="20" height="16" rx="2" fill="#0D9488" />
    <rect x="6" y="10" width="12" height="8" rx="1" fill="white" fillOpacity="0.3" />
    <circle cx="24" cy="8" r="6" fill="#14B8A6" />
    <path d="M21 8L23 10L27 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <rect x="4" y="8" width="2" height="2" rx="1" fill="white" fillOpacity="0.6" />
  </svg>
)
