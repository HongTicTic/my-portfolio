import StatusBadge from './components/StatusBadge/StatusBadge';
import './App.css'

function App() {
  const name = "Kry Menghong"
  const goal = "My goal is to become a Full-Stack Developer and also able to create my own startup"
  return (
    <>
    <div className="profile">
      <h1>{name}</h1>
      <p>{goal}</p>
      <StatusBadge isAvailable={true}/>
    </div>
    </>
  )
}

export default App
