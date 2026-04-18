import axios from 'axios';

import { MINIA_BBOX } from '@/components/Doctors/constants';
import { buildQuery, parseEl } from '@/components/Doctors/utils';

const API_BASE = '/api';

async function fetchFromBackend() {
  const res = await axios.get(`${API_BASE}/places`, { timeout: 8_000 });
  if (res.data.places && res.data.places.length > 0) {
    return res.data.places.map(normaliseBackendPlace);
  }

  console.log('[places] DB empty — triggering sync…');
  await axios.post(`${API_BASE}/places/sync`, {}, { timeout: 70_000 });
  const retry = await axios.get(`${API_BASE}/places`, { timeout: 8_000 });
  return (retry.data.places || []).map(normaliseBackendPlace);
}

async function fetchFromOverpass() {
  console.log('[places] Falling back to direct Overpass call…');
  const res = await axios.post(
    'https://overpass-api.de/api/interpreter',
    buildQuery(MINIA_BBOX),
    { headers: { 'Content-Type': 'text/plain' }, timeout: 60_000 },
  );
  return (res.data.elements || []).map(parseEl).filter(Boolean);
}

function normaliseBackendPlace(doc) {
  return {
    id: doc.osm_id ?? doc._id,
    name: doc.name,
    nameEn: doc.nameEn,
    category: doc.category,
    address: doc.address,
    phone: doc.phone,
    phone2: doc.phone2,
    email: doc.email,
    website: doc.website,
    openingHours: doc.openingHours,
    specialty: doc.specialty,
    operator: doc.operator,
    beds: doc.beds,
    emergency: doc.emergency,
    wheelchair: doc.wheelchair,
    lat: doc.lat,
    lon: doc.lon,
  };
}

/**
 * Used by React Query — loads facilities from our API, syncs if empty, or Overpass fallback.
 */
export async function fetchHealthcarePlaces() {
  try {
    return await fetchFromBackend();
  } catch (backendErr) {
    console.warn('[places] Backend unavailable:', backendErr.message);
    return await fetchFromOverpass();
  }
}
