import { Panel } from '../components/Panel'
import { ArrowRight } from '../icons'

export function Placeholder({ title }: { title: string }) {
  return (
    <div className="animate-fade-in-up page">
      <header className="mb-8">
        <h1 className="glow-text text-3xl font-extrabold tracking-tight text-white">{title}</h1>
        <p className="mt-2 text-sm text-[#8b92a8]">
          This module is connected to the UAG portal and will be automated through
          the website or Discord bot commands.
        </p>
      </header>
      <Panel className="flex flex-col items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/20">
          <ArrowRight size={22} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Coming soon</h2>
          <p className="mt-1 max-w-xl text-sm text-[#8b92a8]">
            Staff can access records, submit requests, and review status here once
            backend integration is live.
          </p>
        </div>
      </Panel>
    </div>
  )
}
