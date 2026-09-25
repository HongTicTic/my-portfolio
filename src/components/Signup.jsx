import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

export default function Signup() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [info, setInfo] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setInfo(null)
    setLoading(true)
    const { data, error } = await signUp(email, password)
    setLoading(false)
    if (error) {
      setError(error.message)
      return
    }
    // If email confirmation is on, there's no session yet - tell the user.
    if (data.session) {
      navigate('/')
    } else {
      setInfo('Account created. Check your email to confirm, then sign in.')
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 py-12 text-zinc-950">
      <section className="w-full max-w-md border border-zinc-200 bg-white p-7 shadow-2xl shadow-black/20 sm:p-10">
        <div className="mb-9">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">
            Habit tracker
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-950">
            Create account
          </h1>
          <p className="mt-2 text-sm leading-6 text-zinc-500">
            Build a simple practice you can return to every day.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <label className="block text-sm font-medium text-zinc-700">
            Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
              className="mt-2 block w-full border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-950 outline-none transition focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
          />
          </label>
          <label className="block text-sm font-medium text-zinc-700">
            Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
              className="mt-2 block w-full border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-950 outline-none transition focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
          />
          </label>
          {error && (
            <p className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}
          {info && (
            <p className="border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-600">
              {info}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
          >
            {loading ? 'Creating...' : 'Sign up'}
          </button>
        </form>
        <p className="mt-7 text-center text-sm text-zinc-500">
          Already have an account?{' '}
          <Link className="font-semibold text-zinc-950 underline decoration-zinc-300 underline-offset-4 hover:decoration-zinc-950" to="/login">
            Sign in
          </Link>
        </p>
      </section>
    </main>
  )
}
