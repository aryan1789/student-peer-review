import { useSelector, useDispatch } from 'react-redux'
import { useCallback } from 'react'
import { supabase } from '../utils/supabaseClient'
import {
  setProjects,
  setFilteredProjects,
  addProject,
  updateProject,
  deleteProject,
  setCurrentProject,
  setLoading,
  setError,
  setSearchQuery,
  setFilterBy,
  setSortBy,
  setSortOrder,
} from '../store/slices/projectsSlice'

export const useProjects = () => {
  const dispatch = useDispatch()
  const {
    projects,
    filteredProjects,
    currentProject,
    loading,
    error,
    searchQuery,
    filterBy,
    sortBy,
    sortOrder,
  } = useSelector(state => state.projects)

  const fetchProjects = useCallback(async () => {
    try {
      dispatch(setLoading(true))
      const { data, error } = await supabase
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
        .order(sortBy, { ascending: sortOrder === 'asc' })

      if (error) throw error
      dispatch(setProjects(data || []))
    } catch (error) {
      dispatch(setError(error.message))
    }
  }, [dispatch, sortBy, sortOrder])

  const createProject = useCallback(async (projectData) => {
    try {
      dispatch(setLoading(true))
      const { data, error } = await supabase
        .from('projects')
        .insert([projectData])
        .select(`
          *,
          profiles:user_id (
            id,
            email,
            full_name,
            avatar_url
          )
        `)
        .single()

      if (error) throw error
      dispatch(addProject(data))
      return data
    } catch (error) {
      dispatch(setError(error.message))
      throw error
    }
  }, [dispatch])

  const filterProjects = useCallback((filterType, query) => {
    dispatch(setFilterBy(filterType))
    dispatch(setSearchQuery(query))

    if (!query.trim()) {
      dispatch(setFilteredProjects(projects))
      return
    }

    const filtered = projects.filter((project) => {
      if (filterType === 'title') {
        return project.title.toLowerCase().includes(query.toLowerCase())
      } else if (filterType === 'tags') {
        return project.tags?.some(tag => 
          tag.toLowerCase().includes(query.toLowerCase())
        )
      }
      return false
    })
    
    dispatch(setFilteredProjects(filtered))
  }, [dispatch, projects])

  const sortProjects = useCallback((sortOption) => {
    const [field, order] = sortOption.split('-')
    dispatch(setSortBy(field))
    dispatch(setSortOrder(order))
    
    const sorted = [...filteredProjects].sort((a, b) => {
      let valueA, valueB
      
      if (field === 'title') {
        valueA = a.title.toLowerCase()
        valueB = b.title.toLowerCase()
      } else if (field === 'tags') {
        valueA = a.tags?.join(' ').toLowerCase() || ''
        valueB = b.tags?.join(' ').toLowerCase() || ''
      } else if (field === 'created_at') {
        valueA = new Date(a.created_at)
        valueB = new Date(b.created_at)
      } else {
        return 0
      }
      
      if (order === 'asc') {
        return valueA > valueB ? 1 : -1
      } else {
        return valueA < valueB ? 1 : -1
      }
    })
    
    dispatch(setFilteredProjects(sorted))
  }, [dispatch, filteredProjects])

  return {
    projects,
    filteredProjects,
    currentProject,
    loading,
    error,
    searchQuery,
    filterBy,
    sortBy,
    sortOrder,
    fetchProjects,
    createProject,
    filterProjects,
    sortProjects,
    setCurrentProject: (project) => dispatch(setCurrentProject(project)),
  }
}
