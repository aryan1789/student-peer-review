export default function SearchBar({ value, onChange }) {
  return (
    <input
      type="text"
      placeholder="Search projects by title..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: '100%',
        padding: '0.75rem',
        marginBottom: '1rem',
        borderRadius: '8px',
        border: '1px solid #ccc'
      }}
    />
  )
}
