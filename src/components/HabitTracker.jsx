import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/useAuth'

export default function HabitTracker() {
  const { user } = useAuth()
  const cacheKey = `habits-cache-${user.id}`
  const queueKey = `habits-queue-${user.id}`
  const [habits, setHabits] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [newName, setNewName] = useState('')
  const [adding, setAdding] = useState(false)

  const [editingId, setEditingId] = useState(null)
  const [editingName, setEditingName] = useState('')
  const [savingId, setSavingId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [syncMessage, setSyncMessage] = useState(null)

  const saveCachedHabits = useCallback((nextHabits) => {
    localStorage.setItem(cacheKey, JSON.stringify(nextHabits))
  }, [cacheKey])

  const syncQueuedHabits = useCallback(async () => {
    const queued = JSON.parse(localStorage.getItem(queueKey) || '[]')
    if (!queued.length || !navigator.onLine) return

    const remaining = []
    for (const queuedHabit of queued) {
      const { data, error: syncError } = await supabase
        .from('habits')
        .insert({ name: queuedHabit.name, user_id: user.id, is_active: true })
        .select()
        .single()

      if (syncError) {
        remaining.push(queuedHabit)
      } else {
        setHabits((current) => {
          const next = current.map((habit) =>
            habit.id === queuedHabit.id ? data : habit,
          )
          saveCachedHabits(next)
          return next
        })
      }
    }

    localStorage.setItem(queueKey, JSON.stringify(remaining))
    if (!remaining.length) setSyncMessage('Queued habits synced.')
  }, [queueKey, saveCachedHabits, user.id])

  useEffect(() => {
    async function fetchHabits() {
      setLoading(true)
      setError(null)

      if (!navigator.onLine) {
        setHabits(JSON.parse(localStorage.getItem(cacheKey) || '[]'))
        setLoading(false)
        return
      }

      const { data, error } = await supabase.from('habits').select('*').order('created_at', { ascending: true })

      if (error) {
        setError(error.message)
      } else {
        setHabits(data)
        saveCachedHabits(data)
      }
      setLoading(false)
      syncQueuedHabits()
    }

    fetchHabits()
    window.addEventListener('online', syncQueuedHabits)
    return () => window.removeEventListener('online', syncQueuedHabits)
  }, [cacheKey, queueKey, saveCachedHabits, syncQueuedHabits])

  async function handleAdd(e) {
    e.preventDefault()
    if (!newName.trim()) return
    setAdding(true)
    setError(null)

    if (!navigator.onLine) {
      const queuedHabit = {
        id: `offline-${crypto.randomUUID()}`,
        name: newName.trim(),
        is_active: true,
        queued: true,
      }
      const queued = JSON.parse(localStorage.getItem(queueKey) || '[]')
      const nextHabits = [...habits, queuedHabit]
      localStorage.setItem(queueKey, JSON.stringify([...queued, queuedHabit]))
      setHabits(nextHabits)
      saveCachedHabits(nextHabits)
      setNewName('')
      setAdding(false)
      setSyncMessage('Saved offline. Will sync when you reconnect.')
      return
    }

    const { data, error } = await supabase
      .from('habits')
      .insert({ name: newName.trim(), user_id: user.id, is_active: true })
      .select()
      .single()

    setAdding(false)
    if (error) {
      setError(error.message)
      return
    }
    setHabits((prev) => [...prev, data])
    saveCachedHabits([...habits, data])
    setNewName('')
  }

  function startEdit(habit) {
    setEditingId(habit.id)
    setEditingName(habit.name)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditingName('')
  }

  async function saveEdit(habitId) {
    if (!editingName.trim()) return
    setSavingId(habitId)
    setError(null)

    const { data, error } = await supabase
      .from('habits')
      .update({ name: editingName.trim() })
      .eq('id', habitId)
      .select()
      .single()

    setSavingId(null)
    if (error) {
      setError(error.message)
      return
    }
    setHabits((prev) => prev.map((h) => (h.id === habitId ? data : h)))
    saveCachedHabits(habits.map((habit) => (habit.id === habitId ? data : habit)))
    cancelEdit()
  }

  async function toggleActive(habit) {
    setSavingId(habit.id)
    setError(null)

    const { data, error } = await supabase
      .from('habits')
      .update({ is_active: !habit.is_active })
      .eq('id', habit.id)
      .select()
      .single()

    setSavingId(null)
    if (error) {
      setError(error.message)
      return
    }
    setHabits((prev) => prev.map((h) => (h.id === habit.id ? data : h)))
    saveCachedHabits(habits.map((current) => (current.id === habit.id ? data : current)))
  }

  async function handleDelete(habitId) {
    if (!confirm('Delete this habit and all of its logs?')) return
    setDeletingId(habitId)
    setError(null)

    // ON DELETE CASCADE on daily_logs.habit_id takes care of the logs.
    const { error } = await supabase.from('habits').delete().eq('id', habitId)

    setDeletingId(null)
    if (error) {
      setError(error.message)
      return
    }
    setHabits((prev) => prev.filter((h) => h.id !== habitId))
    saveCachedHabits(habits.filter((habit) => habit.id !== habitId))
  }
  

  return (
    <section className="border border-zinc-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="mb-6 border-b border-zinc-200 pb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
          Daily practice
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950">
          Your habits
        </h2>
      </div>
          <form onSubmit={handleAdd} className="flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              placeholder="New habit, e.g. Drink water"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="min-w-0 flex-1 border border-zinc-300 px-3 py-2.5 text-sm outline-none placeholder:text-zinc-400 focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
            />
            <button
              type="submit"
              disabled={adding}
              className="bg-zinc-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
            >
              {adding ? 'Adding...' : 'Add habit'}
            </button>
          </form>

          {error && (
            <p className="mt-4 border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          {syncMessage && (
            <p className="mt-4 border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-600">
              {syncMessage}
            </p>
          )}

          {loading ? (
            <p className="mt-8 text-sm text-zinc-500">Loading habits...</p>
          ) : habits.length === 0 ? (
            <p className="mt-8 border-t border-zinc-200 pt-6 text-sm text-zinc-500">
              No habits yet - add your first one above.
            </p>
          ) : (
            <ul className="mt-6 divide-y divide-zinc-200 border-t border-zinc-200">
              {habits.map((habit) => (
                <li
                  key={habit.id}
                  className={`flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between ${habit.is_active ? '' : 'opacity-50'}`}
                >
                  {editingId === habit.id ? (
                    <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row">
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        autoFocus
                        className="min-w-0 flex-1 border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => saveEdit(habit.id)}
                          disabled={savingId === habit.id}
                          className="bg-zinc-950 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:bg-zinc-400"
                        >
                          {savingId === habit.id ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:border-zinc-950"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <span className="min-w-0 flex-1 wrap-break-word text-sm font-medium text-zinc-900">
                        {habit.name}
                        {habit.queued && (
                          <span className="ml-2 text-xs font-normal text-amber-700">Queued</span>
                        )}
                      </span>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => toggleActive(habit)}
                          disabled={savingId === habit.id}
                          className="border border-zinc-300 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-zinc-700 hover:border-zinc-950 hover:text-zinc-950 disabled:cursor-not-allowed"
                        >
                          {habit.is_active ? 'Active' : 'Paused'}
                        </button>
                        <button
                          onClick={() => startEdit(habit)}
                          className="px-2 py-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-950"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(habit.id)}
                          disabled={deletingId === habit.id}
                          className="px-2 py-1.5 text-xs font-medium text-zinc-500 hover:text-red-700 disabled:cursor-not-allowed"
                        >
                          {deletingId === habit.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
    </section>
  )
}

