import { Panel } from '../components/Panel'

export function Placeholder({ title }: { title: string }) {
  return (
    <div className="mx-auto max-w-6xl p-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        <p className="mt-1 text-sm text-[#9ca3af]">
          This module is connected to the UAG portal and will be automated through
          the website or Discord bot commands.
        </p>
      </header>
      <Panel>
        <p className="text-sm text-[#9ca3af]">
          Coming soon — staff can access records, submit requests, and review status
          here once backend integration is live.
        </p>
      </Panel>
    </div>
  )
}
