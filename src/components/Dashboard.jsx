import ErrorBoundary from './ErrorBoundary'
import Nav from './Nav'
import AvatarUpload from './AvatarUpload'
import Stats from './Stats'
import HabitTracker from './HabitTracker'

// Each major section gets its own boundary so a bug in one (say,
// Stats) can't white-screen Nav or the habit list next to it - the
// fallback is scoped to just that section.
export default function Dashboard() {
  return (
    <main className="min-h-screen bg-zinc-100 px-4 py-6 text-zinc-950 sm:px-8 sm:py-10">
      <div className="mx-auto max-w-3xl space-y-6">
      <ErrorBoundary label="the nav bar">
        <Nav />
      </ErrorBoundary>

      <ErrorBoundary label="the avatar uploader">
        <AvatarUpload />
      </ErrorBoundary>

      <ErrorBoundary label="stats">
        <Stats />
      </ErrorBoundary>

      <ErrorBoundary label="the habit list">
        <HabitTracker />
      </ErrorBoundary>
      </div>
    </main>
  )
}
