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
      className={`rounded-xl border border-[#1e2028] bg-[#111217] p-5 transition hover:border-[#2a2d37] ${className}`}
    >
      {children}
    </div>
  )
}
