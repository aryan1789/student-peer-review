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
  const [filteredProjects, setFilteredProjects] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterBy, setFilterBy] = useState('title')
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

  // Redirect to landing page if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/')
    }
  }, [user, navigate])

  useEffect(() => {
    async function fetchProjects() {
      try {
        // Limit projects for non-authenticated users
        const limit = user ? 50 : 6
        
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
          .limit(limit)
        
        if (!profilesError && projectsWithProfiles) {
          console.log('Fetched projects with profiles:', projectsWithProfiles)
          setProjects(projectsWithProfiles)
          return
        }

        // Fallback to basic projects
        const { data: basicProjects, error: basicError } = await supabase
          .from('projects')
          .select('*')
          .limit(limit)
        
        if (basicError) {
          console.error('Error fetching projects:', basicError)
        } else {
          console.log('Fetched basic projects:', basicProjects)
          const projectsArray = basicProjects || []
          setProjects(projectsArray)
          setFilteredProjects(projectsArray)
        }
      } catch (err) {
        console.error('Failed to fetch projects:', err)
      }
    }

    fetchProjects()
  }, [user])

  // Handle search functionality
  const handleSearch = (filterType, query) => {
    setFilterBy(filterType)
    setSearchQuery(query)
    
    if (!query.trim()) {
      setFilteredProjects(projects)
      return
    }

    const filtered = projects.filter((project) => {
      const searchTerm = query.toLowerCase()
      
      if (filterType === 'title') {
        return project.title?.toLowerCase().includes(searchTerm)
      } else if (filterType === 'tags') {
        return project.tags?.some(tag => 
          tag.toLowerCase().includes(searchTerm)
        )
      }
      return false
    })
    
    setFilteredProjects(filtered)
  }

  // Handle sorting
  const handleSort = (sortOption) => {
    const [sortBy, order] = sortOption.split('-')
    const sorted = [...filteredProjects].sort((a, b) => {
      let aValue, bValue
      
      if (sortBy === 'title') {
        aValue = a.title?.toLowerCase() || ''
        bValue = b.title?.toLowerCase() || ''
      } else if (sortBy === 'tags') {
        aValue = a.tags?.join(' ').toLowerCase() || ''
        bValue = b.tags?.join(' ').toLowerCase() || ''
      }
      
      if (order === 'asc') {
        return aValue.localeCompare(bValue)
      } else {
        return bValue.localeCompare(aValue)
      }
    })
    
    setFilteredProjects(sorted)
  }

  // Update filtered projects when projects change
  useEffect(() => {
    handleSearch(filterBy, searchQuery)
  }, [projects])

  // Separate projects into user's and others'
  const userProjects = filteredProjects.filter(project => project.user_id === user?.id)
  const othersProjects = filteredProjects.filter(project => project.user_id !== user?.id)

  return (
    <div className="home-container">
      <Navbar />
      
      <div className="main-content">
        <div className="projects-header">
          <h1>Student Projects</h1>
          <div className="total-projects-count">
            Total: {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''}
          </div>
        </div>
        
        <SearchBar 
          onSearch={handleSearch}
          onSort={handleSort}
          hasResults={filteredProjects.length > 0}
          totalItems={filteredProjects.length}
        />
        
        {filteredProjects.length > 0 ? (
          <div className="projects-sections">
            {/* Your Projects Section */}
            {userProjects.length > 0 && (
              <div className="projects-section">
                <div className="section-header">
                  <h2>Your Projects</h2>
                  <span className="section-count">{userProjects.length} project{userProjects.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="projects-grid">
                  {userProjects.map(project => (
                    <ProjectCard 
                      key={project.id} 
                      project={project}
                      onClick={() => navigate(`/project/${project.id}`)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Others' Projects Section */}
            {othersProjects.length > 0 && (
              <div className="projects-section">
                <div className="section-header">
                  <h2>Community Projects</h2>
                  <span className="section-count">{othersProjects.length} project{othersProjects.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="projects-grid">
                  {othersProjects.map(project => (
                    <ProjectCard 
                      key={project.id} 
                      project={project}
                      onClick={() => navigate(`/project/${project.id}`)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          !searchQuery ? (
            <div className="no-projects">No projects found.</div>
          ) : null
        )}
      </div>
    </div>
  )
}