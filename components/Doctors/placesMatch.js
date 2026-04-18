/**
 * Multi-field, multi-token search for places (client-side list filtering).
 */
export function placeMatchesSearch(place, queryRaw) {
  const q = queryRaw.trim();
  if (!q) return true;

  const tokens = q
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
  if (!tokens.length) return true;

  const fields = [
    place.name,
    place.nameEn,
    place.address,
    place.specialty,
    place.operator,
    place.phone,
    place.phone2,
    place.email,
    place.website,
  ]
    .filter(Boolean)
    .map((s) => String(s).toLowerCase());

  return tokens.every((tok) => fields.some((f) => f.includes(tok)));
}
