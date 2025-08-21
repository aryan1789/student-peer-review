import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { supabase } from '../utils/supabaseClient'
import { setUser } from '../store/slices/authSlice'
import ProjectCard from '../components/ProjectCard'
import SearchBar from '../components/SearchBar'
import Navbar from '../components/Navbar'

export default function Home() {
  const [projects, setProjects] = useState([])
  const [search, setSearch] = useState('')
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const user = useSelector(state => state.auth.user)

  useEffect(() => {
    // Check if user is authenticated and update Redux
    supabase.auth.getSession().then(({ data: { session } }) => {
      dispatch(setUser(session?.user ?? null))
    })

    // Listen for auth changes and update Redux
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.email)
      dispatch(setUser(session?.user ?? null))
    })

    return () => subscription.unsubscribe()
  }, [dispatch])

  useEffect(() => {
    async function fetchProjects() {
      try {
        // Try to fetch projects with profiles
        const { data: projectsWithProfiles, error: profilesError } = await supabase
          .from('projects')
          .select(`
            *,
            profiles:user_id (
              id,
              email,
              full_name,
              avatar_url
            )
          `)
        
        if (!profilesError && projectsWithProfiles) {
          console.log('Fetched projects with profiles:', projectsWithProfiles)
          setProjects(projectsWithProfiles)
          return
        }

        // Fallback to basic projects
        const { data: basicProjects, error: basicError } = await supabase
          .from('projects')
          .select('*')
        
        if (basicError) {
          console.error('Error fetching projects:', basicError)
        } else {
          console.log('Fetched basic projects:', basicProjects)
          setProjects(basicProjects || [])
        }
      } catch (err) {
        console.error('Failed to fetch projects:', err)
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
        {/* Debug auth status */}
        <div style={{ fontSize: '0.9rem', padding: '0.5rem', background: '#f0f0f0', borderRadius: '4px' }}>
          Status: {user ? `Logged in as ${user.email}` : 'Not logged in'}
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