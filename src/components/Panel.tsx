import type { ReactNode } from 'react'

export function Panel({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={`glass-panel rounded-2xl p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#3d4b6a] ${className}`}
    >
      {children}
    </div>
  )
}
