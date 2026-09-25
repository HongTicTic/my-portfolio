import { useRegisterSW } from 'virtual:pwa-register/react'

export default function UpdateToast() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  if (!needRefresh) return null

  return (
    <aside className="fixed bottom-4 left-4 right-4 z-50 flex items-center justify-between gap-4 border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white shadow-xl sm:left-auto sm:max-w-sm">
      <span>New version available</span>
      <button
        onClick={() => updateServiceWorker(true)}
        className="shrink-0 bg-white px-3 py-2 text-xs font-semibold text-zinc-950 hover:bg-zinc-200"
      >
        Refresh
      </button>
    </aside>
  )
}