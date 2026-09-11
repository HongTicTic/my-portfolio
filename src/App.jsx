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
      <StatusBadge isAvailable={false}/>
      <br/>
      <a href='https://github.com/HongTicTic/my-portfolio'>Github's repository: https://github.com/HongTicTic/my-portfolio </a>
    </div>
    </>
  )
}

export default App
