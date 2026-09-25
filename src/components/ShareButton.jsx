import { useState } from 'react'

export default function ShareButton() {
  const [shared, setShared] = useState(false)

  async function handleShare() {
    const shareData = { title: 'Habit Tracker', text: 'Track your daily habits.', url: window.location.href }
    if (navigator.share) {
      await navigator.share(shareData)
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(window.location.href)
    } else {
      const input = document.createElement('input')
      input.value = window.location.href
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      input.remove()
    }
    setShared(true)
    window.setTimeout(() => setShared(false), 2000)
  }

  return (
    <button
      onClick={handleShare}
      className="border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-950 hover:text-zinc-950"
    >
      {shared ? 'Copied' : 'Share'}
    </button>
  )
}