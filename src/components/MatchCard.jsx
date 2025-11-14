export default function MatchCard({ match, onEdit }) {
  return (
    <div className="match-card">
      <div className="teams">
        <span>{match.joueurs[0]}</span> vs <span>{match.joueurs[1]}</span>
      </div>
      <div className="score">{match.score || "–"}</div>
      <div className="status">{match.status}</div>
      {onEdit && <button onClick={() => onEdit(match)}>Edit</button>}
    </div>
  );
}
