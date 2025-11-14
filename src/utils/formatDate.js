// Format une date Firebase/JS en string lisible
export function formatDate(date) {
  if (!date) return "";

  const d = date instanceof Date ? date : new Date(date);

  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// Format une heure (si tu affiches les heures des matchs)
export function formatTime(date) {
  if (!date) return "";

  const d = date instanceof Date ? date : new Date(date);

  return d.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
