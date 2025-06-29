export default function ProjectCard({ project, onClick }) {
  return (
    <div className="project-card" onClick={onClick} style={{ cursor: 'pointer' }}>
      <h3>{project.title}</h3>
      <p>{project.description.slice(0, 100)}...</p>
      {project.tags?.length > 0 && (
        <div className="project-tags" style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
          {project.tags.map((tag, i) => (
            <span key={i} className="tag">{tag}</span>
          ))}
        </div>
      )}
    </div>
  )
}
