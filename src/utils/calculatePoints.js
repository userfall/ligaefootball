// scoreUser = "2-1", scoreReal = "2-1"
export function calculatePoints(scoreUser, scoreReal) {
  if (!scoreUser || !scoreReal) return 0;

  const [uh, ua] = scoreUser.split("-").map(Number);
  const [rh, ra] = scoreReal.split("-").map(Number);

  // Score exact
  if (uh === rh && ua === ra) return 3;

  const userWinner =
    uh > ua ? "HOME" : uh < ua ? "AWAY" : "DRAW";
  const realWinner =
    rh > ra ? "HOME" : rh < ra ? "AWAY" : "DRAW";

  // Bon résultat (gagnant ou nul)
  if (userWinner === realWinner) return 1;

  return 0;
}
