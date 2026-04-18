export function normalizePredictionPayload(data) {
  if (data == null) return data;
  if (typeof data === 'object') return data;
  if (typeof data === 'string') {
    const t = data.trim();
    if (t.startsWith('{') || t.startsWith('[')) {
      try {
        return JSON.parse(t);
      } catch {
        return data;
      }
    }
  }
  return data;
}
