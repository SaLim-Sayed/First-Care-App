export async function createManualPlace(payload) {
  const res = await fetch('/api/places', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.error || 'create_failed');
    err.code = data.error;
    throw err;
  }
  return data;
}
