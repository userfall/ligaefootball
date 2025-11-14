export function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error("Erreur localStorage:", err);
  }
}

export function getFromStorage(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (err) {
    console.error("Erreur localStorage:", err);
    return defaultValue;
  }
}

export function removeFromStorage(key) {
  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.error("Erreur localStorage:", err);
  }
}
