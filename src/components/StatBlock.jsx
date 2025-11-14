export default function StatBlock({ stats }) {
  return (
    <div className="stat-block">
      <p>Matchs: {stats.matchs}</p>
      <p>Victoires: {stats.victoires}</p>
      <p>Nuls: {stats.nul}</p>
      <p>Défaites: {stats.defaites}</p>
      <p>Buts Pour: {stats.butsPour}</p>
      <p>Buts Contre: {stats.butsContre}</p>
    </div>
  );
}
