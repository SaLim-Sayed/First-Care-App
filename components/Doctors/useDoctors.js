import { useState, useEffect } from "react";
import axios from "axios";
import { buildQuery, parseEl } from "./utils";
import { MINIA_BBOX } from "./constants";

const API_BASE = "/api";

/**
 * Fetches healthcare facilities.
 * Strategy:
 *   1. Try our backend  GET /api/places → instant from DB
 *   2. If backend unreachable OR returns 0 results → POST /sync then retry
 *   3. If backend completely unavailable → fall back to direct Overpass call
 */
export function useDoctors(isAr) {
  const [places,  setPlaces]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchFromBackend() {
      // ── 1. Try backend cache ───────────────────────────────────────────────
      const res = await axios.get(`${API_BASE}/places`, { timeout: 8_000 });
      if (res.data.places && res.data.places.length > 0) {
        return res.data.places.map(normaliseBackendPlace);
      }

      // ── 2. DB is empty → trigger sync, wait, then retry ───────────────────
      console.log("[useDoctors] DB empty — triggering sync…");
      await axios.post(`${API_BASE}/places/sync`, {}, { timeout: 70_000 });
      const retry = await axios.get(`${API_BASE}/places`, { timeout: 8_000 });
      return (retry.data.places || []).map(normaliseBackendPlace);
    }

    async function fetchFromOverpass() {
      // Direct Overpass call (fallback when backend is unavailable)
      console.log("[useDoctors] Falling back to direct Overpass call…");
      const res = await axios.post(
        "https://overpass-api.de/api/interpreter",
        buildQuery(MINIA_BBOX),
        { headers: { "Content-Type": "text/plain" }, timeout: 60_000 },
      );
      return (res.data.elements || []).map(parseEl).filter(Boolean);
    }

    (async () => {
      try {
        let data;
        try {
          data = await fetchFromBackend();
        } catch (backendErr) {
          // Backend unreachable → fall back to Overpass directly
          console.warn("[useDoctors] Backend unavailable:", backendErr.message);
          data = await fetchFromOverpass();
        }

        if (!cancelled) setPlaces(data);
      } catch (err) {
        if (!cancelled)
          setError(
            isAr
              ? "تعذر تحميل البيانات. يرجى المحاولة لاحقاً."
              : "Failed to load data. Please try again later.",
          );
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, []); // fetch once on mount

  return { places, loading, error };
}

// ── Translate the backend document shape → frontend shape ─────────────────────
// Backend uses osm_id; frontend uses id. Everything else matches.
function normaliseBackendPlace(doc) {
  return {
    id:           doc.osm_id ?? doc._id,
    name:         doc.name,
    nameEn:       doc.nameEn,
    category:     doc.category,
    address:      doc.address,
    phone:        doc.phone,
    phone2:       doc.phone2,
    email:        doc.email,
    website:      doc.website,
    openingHours: doc.openingHours,
    specialty:    doc.specialty,
    operator:     doc.operator,
    beds:         doc.beds,
    emergency:    doc.emergency,
    wheelchair:   doc.wheelchair,
    lat:          doc.lat,
    lon:          doc.lon,
  };
}
