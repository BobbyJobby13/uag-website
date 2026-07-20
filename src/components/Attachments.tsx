import { useRef, useState } from 'react'
import { Download, Paperclip, Trash2 } from '../icons'
import type { Attachment } from '../lib/data'

interface AttachmentsProps {
  attachments: Attachment[]
  onChange: (attachments: Attachment[]) => void
}

function uid() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function Attachments({ attachments, onChange }: AttachmentsProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [busy, setBusy] = useState(false)

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setBusy(true)
    const added: Attachment[] = []
    for (const file of Array.from(files)) {
      const data = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onload = () => resolve((reader.result as string) || '')
        reader.readAsDataURL(file)
      })
      if (data) {
        added.push({
          id: uid(),
          name: file.name,
          type: file.type,
          size: file.size,
          data,
          createdAt: new Date().toISOString(),
        })
      }
    }
    setBusy(false)
    if (added.length) onChange([...(attachments || []), ...added])
  }

  const remove = (id: string) => {
    onChange((attachments || []).filter((a) => a.id !== id))
  }

  return (
    <div className="mt-3">
      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.gif,.webp,.mp3,.mp4,.mov,.xls,.xlsx,.ppt,.pptx,application/*,image/*,audio/*,video/*"
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className="flex items-center gap-2 rounded-lg border border-[#1c2335] bg-[#111827] px-3 py-1.5 text-xs font-medium text-[#8b92a8] transition hover:border-indigo-500/50 hover:text-white disabled:opacity-50"
      >
        <Paperclip size={14} />
        {busy ? 'Uploading...' : 'Attach file'}
      </button>

      {attachments && attachments.length > 0 && (
        <div className="mt-3 space-y-2">
          {attachments.map((a) => (
            <div
              key={a.id}
              className="flex items-center justify-between rounded-lg bg-[#111827] p-2"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-white">{a.name}</p>
                <p className="text-[10px] text-[#5d6a87]">{formatSize(a.size)}</p>
              </div>
              <div className="flex items-center gap-1">
                <a
                  href={a.data}
                  download={a.name}
                  className="rounded-md p-1.5 text-[#8b92a8] transition hover:bg-indigo-500/10 hover:text-indigo-400"
                  aria-label="Download"
                >
                  <Download size={14} />
                </a>
                <button
                  type="button"
                  onClick={() => remove(a.id)}
                  className="rounded-md p-1.5 text-[#8b92a8] transition hover:bg-rose-500/10 hover:text-rose-400"
                  aria-label="Remove"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
