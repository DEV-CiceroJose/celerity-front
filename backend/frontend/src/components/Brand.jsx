import { Link } from 'react-router-dom'

export function Brand({ compact = false, light = false, to = '/' }) {
  return (
    <Link className={`brand ${compact ? 'brand--compact' : ''} ${light ? 'brand--light' : ''}`} to={to} aria-label="Celerity Ambiental">
      <span className="brand__mark" aria-hidden="true">
        <span className="brand__sprout">◆</span>
      </span>
      {!compact && (
        <span className="brand__type">
          <strong>Celerity</strong>
          <span>Ambiental</span>
        </span>
      )}
    </Link>
  )
}
