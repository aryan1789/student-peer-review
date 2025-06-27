import { useState,useEffect } from 'react'
import './App.css'
import { supabase } from './utils/supabaseClient'
import Auth from './components/Auth'

function App() {

  const [user,setUser] = useState(null)
  const [projects, setProjects] = useState([])

  useEffect(() => {
    supabase.auth.getSession().then(({data}) => {
      setUser(data.session?.user ?? null)
    
  })

  const {data:listener} = supabase.auth.onAuthStateChange((_event,session) => {
    setUser(session?.user ?? null)
  })

  return () => listener.subscription.unsubscribe()
},[])

  useEffect(() => {
    if (!user) return

    async function fetchProjects() {
      const {data, error} = await supabase.from('projects').select('*')
      if (error) console.error('Error fetching projects:',error)
      else setProjects(data)
    }
    fetchProjects()
  },[user])

  if(!user) {
    return <Auth onAuth={setUser}/>
  }


  return (
    <div className="container">
      <h1>Student Peer Review Platform</h1>
      <p>Welcome, {user.email}!</p>
      <button onClick={() => supabase.auth.signOut()}>Log Out</button>

      <h2>Submitted Projects</h2>
      {projects.length === 0 ? (
        <p>No projects submitted yet.</p>
      ) : (
        <ul>
          {projects.map((project) => (
            <li key={project.id}>
              <strong>{projects.title}</strong> - {project.description}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
  }


export default App
