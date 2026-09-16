import StatusBadge from './components/StatusBadge';
import InfoRow from './components/InfoRow';
import Card from './components/Card';
import ProjectCard from './components/ProjectCard';
import './App.css'

function App() {
  const name = "Kry Menghong"
  const goal = "My goal is to become a Full-Stack Developer and also able to create my own startup"
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto max-w-4xl flex flex-col md:flex-row gap-6">

        <main className="flex-1 flex flex-col gap-6">
          <Card>
            <h1 className="text-gray-900 text-2xl font-bold mb-2">{name}</h1>
            <p className="text-gray-700 mb-4">{goal}</p>
            <StatusBadge isAvailable={false} />
          </Card>

          <Card>
            <h2 className="text-gray-900 text-lg font-semibold mb-2">Projects</h2>
            <div className="flex flex-col md:flex-row gap-4">
              <ProjectCard
                title="Algorithm Visualizer"
                status="Live"
                url="#"
              />
              <ProjectCard
                title="Profile Page"
                status="In Progress"
                url="#"
              />
            </div>
          </Card>
        </main>
      <aside className="md:w-64 bg-white rounded-lg shadow p-6 h-fit">
          <h2 className="text-gray-900 font-semibold mb-2">Info</h2>
          <InfoRow label="Role" value="Full-Stack Developer (in training)" />
          <InfoRow label="Location" value="Phnom Penh" />
          
          <a  href="#"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-4 text-indigo-600 hover:text-indigo-800 transition-colors duration-200 text-sm">
            View on GitHub
          </a>
        </aside>

      </div>
    </div>
  );
}

export default App
