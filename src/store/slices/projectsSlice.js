import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  projects: [],
  filteredProjects: [],
  currentProject: null,
  loading: false,
  error: null,
  searchQuery: '',
  filterBy: 'title',
  sortBy: 'created_at',
  sortOrder: 'desc',
  // Future features
  likes: {}, // { projectId: { count: number, userLiked: boolean } }
  comments: {}, // { projectId: [comments] }
}

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    setProjects: (state, action) => {
      state.projects = action.payload
      state.filteredProjects = action.payload
      state.loading = false
      state.error = null
    },
    setFilteredProjects: (state, action) => {
      state.filteredProjects = action.payload
    },
    addProject: (state, action) => {
      state.projects.unshift(action.payload)
      state.filteredProjects.unshift(action.payload)
    },
    updateProject: (state, action) => {
      const index = state.projects.findIndex(p => p.id === action.payload.id)
      if (index !== -1) {
        state.projects[index] = action.payload
        const filteredIndex = state.filteredProjects.findIndex(p => p.id === action.payload.id)
        if (filteredIndex !== -1) {
          state.filteredProjects[filteredIndex] = action.payload
        }
      }
    },
    deleteProject: (state, action) => {
      state.projects = state.projects.filter(p => p.id !== action.payload)
      state.filteredProjects = state.filteredProjects.filter(p => p.id !== action.payload)
    },
    setCurrentProject: (state, action) => {
      state.currentProject = action.payload
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    setError: (state, action) => {
      state.error = action.payload
      state.loading = false
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload
    },
    setFilterBy: (state, action) => {
      state.filterBy = action.payload
    },
    setSortBy: (state, action) => {
      state.sortBy = action.payload
    },
    setSortOrder: (state, action) => {
      state.sortOrder = action.payload
    },
    // Future like functionality
    toggleLike: (state, action) => {
      const { projectId, userId } = action.payload
      if (!state.likes[projectId]) {
        state.likes[projectId] = { count: 0, userLiked: false }
      }
      
      const like = state.likes[projectId]
      if (like.userLiked) {
        like.count -= 1
        like.userLiked = false
      } else {
        like.count += 1
        like.userLiked = true
      }
    },
    setLikes: (state, action) => {
      state.likes = action.payload
    },
    // Future comment functionality
    addComment: (state, action) => {
      const { projectId, comment, parentId } = action.payload
      if (!state.comments[projectId]) {
        state.comments[projectId] = []
      }
      
      if (parentId) {
        // This is a reply - we'll handle it in the component by refetching
        // to maintain proper threading structure
        return
      } else {
        // This is a root comment
        state.comments[projectId].push({
          ...comment,
          replies: []
        })
      }
    },
    setComments: (state, action) => {
      const { projectId, comments } = action.payload
      if (typeof action.payload === 'object' && !Array.isArray(action.payload)) {
        // Handle object format: { projectId: comments }
        Object.keys(action.payload).forEach(pid => {
          state.comments[pid] = action.payload[pid]
        })
      } else {
        // Handle direct assignment
        state.comments = action.payload
      }
    },
  },
})

export const {
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
  toggleLike,
  setLikes,
  addComment,
  setComments,
} = projectsSlice.actions

export default projectsSlice.reducer
