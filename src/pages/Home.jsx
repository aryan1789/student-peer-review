import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../utils/supabaseClient'
import ProjectCard from '../components/ProjectCard'
import SearchBar from '../components/SearchBar'
import Navbar from '../components/Navbar' // or './components/Navbar' if in same folder

export default function Home() {
  const [projects, setProjects] = useState([])
  const [search, setSearch] = useState('')
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    // Check if user is authenticated
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    async function fetchProjects() {
      const { data, error } = await supabase.from('projects').select('*')
      if (error) {
        console.error('Error fetching projects:', error)
      } else {
        setProjects(data || [])
      }
    }

    fetchProjects()
  }, [])

  const filteredProjects = projects.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
    <Navbar />
    <div className="container">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Explore Projects</h1>
        <div>
          {user ? (
            <div>
              {/* <button 
                onClick={() => navigate('/dashboard')}
                style={{ marginRight: '1rem' }}
              >
                Dashboard
              </button>
              <button onClick={() => supabase.auth.signOut()}>
                Log Out
              </button> */}
            </div>
          ) : (
            <button onClick={() => navigate('/dashboard')}>
              Login
            </button>
          )}
        </div>
      </header>

      <SearchBar value={search} onChange={setSearch} />

      {filteredProjects.length === 0 ? (
        <p>No projects found.</p>
      ) : (
        <div className="projects-grid">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={() => navigate(`/project/${project.id}`)}
            />
          ))}
        </div>
      )}
    </div>
    </>
  )
}