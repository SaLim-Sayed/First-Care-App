export async function fetchUserProfile() {
  const res = await fetch('/api/user/profile');
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'fail');
  return data.profile;
}

export async function patchUserProfile(name) {
  const res = await fetch('/api/user/profile', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'fail');
  return data;
}
