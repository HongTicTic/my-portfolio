import { useAuth } from '../context/useAuth'

export default function Nav() {
  const { user, signOut } = useAuth()

  return (
    <header className="flex items-center justify-between border-b border-zinc-300 pb-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">
          Personal dashboard
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 sm:text-3xl">
          Habit Tracker
        </h1>
      </div>
      <div className="flex items-center gap-3">
        <span className="hidden max-w-48 truncate text-sm text-zinc-500 sm:block">{user.email}</span>
        <button
          onClick={signOut}
          className="border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-950 hover:text-zinc-950"
        >
          Sign out
        </button>
      </div>
    </header>
  )
}
