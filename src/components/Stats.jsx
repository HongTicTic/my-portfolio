  import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Stats() {
  const [counts, setCounts] = useState(null)
  const [error, setError] = useState(null)
  const [crashNow, setCrashNow] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function loadCounts() {
      const { data, error } = await supabase.from('habits').select('is_active')
      if (cancelled) return
      if (error) {
        setError(error.message)
        return
      }
      const active = data.filter((h) => h.is_active).length
      setCounts({ total: data.length, active })
    }

    loadCounts()
    return () => {
      cancelled = true
    }
  }, [])

  // Deliberately throws during render so you can screenshot the
  // ErrorBoundary catching it (audit checklist item #3). Remove this
  // button, or gate it behind an env flag, before shipping for real -
  // it exists purely to prove the boundary works.
  if (crashNow) {
    throw new Error('Simulated crash for ErrorBoundary demo')
  }

  if (error) {
    return (
      <p className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
        {error}
      </p>
    )
  }

  return (
    <section className="border border-zinc-200 bg-white p-4 shadow-sm sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Overview</p>
      <h2 className="mt-2 text-xl font-semibold tracking-tight text-zinc-950">Your progress</h2>
      {counts ? (
        <div className="mt-5 flex gap-8">
          <div>
            <p className="text-3xl font-semibold text-zinc-950">{counts.active}</p>
            <p className="mt-1 text-sm text-zinc-500">Active habits</p>
          </div>
          <div>
            <p className="text-3xl font-semibold text-zinc-400">{counts.total}</p>
            <p className="mt-1 text-sm text-zinc-500">Total habits</p>
          </div>
        </div>
      ) : (
        <p className="mt-5 text-sm text-zinc-500">Loading stats...</p>
      )}
      <button
        onClick={() => setCrashNow(true)}
        className="mt-5 text-xs text-zinc-400 underline underline-offset-4 hover:text-zinc-700"
      >
        Simulate crash (demo)
      </button>
    </section>
  )
}
