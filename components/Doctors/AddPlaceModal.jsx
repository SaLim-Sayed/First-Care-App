'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useCallback, useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'react-i18next';
import { FaTimes, FaMapMarkerAlt } from 'react-icons/fa';

import { createManualPlace } from '@/lib/api/placesClient';
import { FILTERS, MINIA_CENTER } from '@/components/Doctors/constants';

// ── Inline map picker ─────────────────────────────────────────────────────────
function MapPicker({ lat, lon, onPick, isAr }) {
  const divRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    let L;

    const init = async () => {
      await import('leaflet/dist/leaflet.css');
      L = (await import('leaflet')).default;

      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      if (mapRef.current) return; // already mounted
      if (!divRef.current) return;

      const initLat = parseFloat(lat) || MINIA_CENTER[0];
      const initLon = parseFloat(lon) || MINIA_CENTER[1];

      const map = L.map(divRef.current, { zoomControl: true }).setView([initLat, initLon], 14);
      mapRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map);

      // place initial marker
      const marker = L.marker([initLat, initLon], { draggable: true }).addTo(map);
      markerRef.current = marker;

      const updateCoords = (latlng) => {
        onPick(latlng.lat.toFixed(6), latlng.lng.toFixed(6));
      };

      marker.on('dragend', (e) => updateCoords(e.target.getLatLng()));
      map.on('click', (e) => {
        marker.setLatLng(e.latlng);
        updateCoords(e.latlng);
      });
    };

    init();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync marker when lat/lon change externally (e.g. URL paste)
  useEffect(() => {
    if (!markerRef.current) return;
    const la = parseFloat(lat);
    const lo = parseFloat(lon);
    if (!isNaN(la) && !isNaN(lo)) {
      markerRef.current.setLatLng([la, lo]);
      mapRef.current?.setView([la, lo], 16);
    }
  }, [lat, lon]);

  return (
    <div className="rounded-2xl overflow-hidden border border-[var(--border-color)] shadow-md">
      <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-xs font-bold text-[#0076f7]">
        <FaMapMarkerAlt />
        {isAr ? 'اضغط على الخريطة أو اسحب الدبوس لتحديد الموقع' : 'Click the map or drag the pin to set location'}
      </div>
      <div ref={divRef} style={{ height: 260, width: '100%' }} />
    </div>
  );
}

const MIN_LAT = 27.85;
const MAX_LAT = 28.35;
const MIN_LON = 30.55;
const MAX_LON = 31.05;

const CATEGORY_KEYS = FILTERS.filter((f) => f.key !== 'all').map((f) => f.key);

/**
 * Extracts {lat, lon} from Google Maps or OpenStreetMap URLs.
 * Supports:
 *  - https://maps.google.com/?q=LAT,LON
 *  - https://www.google.com/maps/place/.../@LAT,LON,ZOOM
 *  - https://maps.app.goo.gl/... (short links can't be parsed client-side)
 *  - https://www.google.com/maps?q=LAT,LON
 *  - https://www.openstreetmap.org/#map=ZOOM/LAT/LON
 *  - https://www.openstreetmap.org/node/...
 */
function parseMapUrl(input) {
  if (!input) return null;
  try {
    // 1. Plain coords: "28.0871, 30.7618"
    const plainCoords = input.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
    if (plainCoords) return { lat: parseFloat(plainCoords[1]), lon: parseFloat(plainCoords[2]) };

    const url = new URL(input);

    // 2. Google Maps ?q=lat,lon
    const q = url.searchParams.get('q');
    if (q) {
      const m = q.match(/^(-?\d+\.?\d*),(-?\d+\.?\d*)$/);
      if (m) return { lat: parseFloat(m[1]), lon: parseFloat(m[2]) };
    }

    // 3. Google Maps /@lat,lon,zoom in pathname
    const atMatch = url.pathname.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
    if (atMatch) return { lat: parseFloat(atMatch[1]), lon: parseFloat(atMatch[2]) };

    // 4. OpenStreetMap #map=zoom/lat/lon
    const osmHash = url.hash.match(/map=\d+\/(-?\d+\.?\d*)\/(-?\d+\.?\d*)/);
    if (osmHash) return { lat: parseFloat(osmHash[1]), lon: parseFloat(osmHash[2]) };

    // 5. Google Maps ll= parameter
    const ll = url.searchParams.get('ll');
    if (ll) {
      const m = ll.match(/^(-?\d+\.?\d*),(-?\d+\.?\d*)$/);
      if (m) return { lat: parseFloat(m[1]), lon: parseFloat(m[2]) };
    }

  } catch {
    // not a valid URL — ignore
  }
  return null;
}

export function AddPlaceModal({ isOpen, onClose, lng }) {
  const { t } = useTranslation();
  const { status } = useSession();
  const queryClient = useQueryClient();
  const isAr = lng === 'ar';

  const [name, setName] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [category, setCategory] = useState('doctors');
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState(String(MINIA_CENTER[0]));
  const [lon, setLon] = useState(String(MINIA_CENTER[1]));
  const [phone, setPhone] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [formError, setFormError] = useState('');
  const [showMapPicker, setShowMapPicker] = useState(false);

  const reset = useCallback(() => {
    setName('');
    setNameEn('');
    setCategory('doctors');
    setAddress('');
    setLat(String(MINIA_CENTER[0]));
    setLon(String(MINIA_CENTER[1]));
    setPhone('');
    setSpecialty('');
    setFormError('');
  }, []);

  const mutation = useMutation({
    mutationFn: createManualPlace,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['places', 'healthcare'] });
      reset();
      onClose();
    },
    onError: (err) => {
      const code = err?.code;
      const key =
        code === 'invalid_name'
          ? 'places.err_name'
          : code === 'invalid_coordinates'
            ? 'places.err_coords'
            : code === 'unauthorized'
              ? 'auth.error_generic'
              : null;
      setFormError(key ? t(key) : t('places.add_error'));
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');
    const latN = parseFloat(lat);
    const lonN = parseFloat(lon);
    if (!name.trim()) {
      setFormError(t('places.err_name'));
      return;
    }
    if (Number.isNaN(latN) || Number.isNaN(lonN)) {
      setFormError(t('places.err_coords'));
      return;
    }
    if (latN < MIN_LAT || latN > MAX_LAT || lonN < MIN_LON || lonN > MAX_LON) {
      setFormError(t('places.err_bounds'));
      return;
    }
    mutation.mutate({
      name: name.trim(),
      nameEn: nameEn.trim(),
      category,
      address: address.trim(),
      lat: latN,
      lon: lonN,
      phone: phone.trim() || undefined,
      specialty: specialty.trim() || undefined,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        aria-label="Close"
        onClick={onClose}
      />
      <div
        className="relative w-full max-w-lg rounded-3xl border border-[var(--border-color)] bg-[var(--card-bg)] shadow-2xl max-h-[90vh] overflow-y-auto"
        dir={isAr ? 'rtl' : 'ltr'}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-color)]">
          <h2 className="text-lg font-black text-[var(--text-main)]">{t('places.add_title')}</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-[var(--text-muted)]"
          >
            <FaTimes />
          </button>
        </div>

        {status !== 'authenticated' ? (
          <div className="p-6 space-y-4">
            <p className="text-sm text-[var(--text-muted)]">{t('places.sign_in_to_add')}</p>
            <Link
              href={`/${lng}/sign-in`}
              className="inline-flex items-center justify-center w-full py-3 rounded-2xl bg-[#0076f7] text-white font-bold"
            >
              {t('navbar.sign_in')}
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-[var(--text-muted)] mb-1">
                {t('places.field_name')} *
              </label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-color)] text-[var(--text-main)]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--text-muted)] mb-1">
                {t('places.field_name_en')}
              </label>
              <input
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-color)] text-[var(--text-main)]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--text-muted)] mb-1">
                {t('places.field_category')}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-color)] text-[var(--text-main)]"
              >
                {CATEGORY_KEYS.map((key) => {
                  const f = FILTERS.find((x) => x.key === key);
                  return (
                    <option key={key} value={key}>
                      {isAr ? f.labelAr : f.labelEn}
                    </option>
                  );
                })}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--text-muted)] mb-1">
                {t('places.field_address')}
              </label>
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-color)] text-[var(--text-main)]"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[var(--text-muted)] mb-1">
                {isAr ? 'الموقع على الخريطة *' : 'Location *'}
              </label>

              {/* URL paste input */}
              <input
                placeholder={isAr ? 'الصق رابط Google Maps أو OpenStreetMap هنا...' : 'Paste a Google Maps or OpenStreetMap link...'}
                value={lat === String(MINIA_CENTER[0]) && lon === String(MINIA_CENTER[1]) ? '' : `${lat}, ${lon}`}
                onChange={(e) => {
                  const raw = e.target.value.trim();
                  const parsed = parseMapUrl(raw);
                  if (parsed) {
                    setLat(String(parsed.lat));
                    setLon(String(parsed.lon));
                  } else {
                    const parts = raw.split(',');
                    if (parts.length === 2) {
                      setLat(parts[0].trim());
                      setLon(parts[1].trim());
                    }
                  }
                }}
                className="w-full px-4 py-3 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-color)] text-[var(--text-main)] text-sm"
              />

              {/* OR divider + pick on map toggle */}
              <div className="flex items-center gap-3">
                <div className="flex-1 border-t border-[var(--border-color)]" />
                <span className="text-xs text-[var(--text-muted)] font-bold">{isAr ? 'أو' : 'OR'}</span>
                <div className="flex-1 border-t border-[var(--border-color)]" />
              </div>

              <button
                type="button"
                onClick={() => setShowMapPicker(v => !v)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl border-2 font-bold text-sm transition-all"
                style={{
                  borderColor: showMapPicker ? '#0076f7' : 'var(--border-color)',
                  background: showMapPicker ? '#0076f7' : 'var(--bg-color)',
                  color: showMapPicker ? 'white' : '#0076f7',
                }}
              >
                <FaMapMarkerAlt />
                {isAr ? (showMapPicker ? 'إخفاء الخريطة' : 'اختر من الخريطة') : (showMapPicker ? 'Hide Map' : 'Pick on Map')}
              </button>

              {/* Inline map picker */}
              {showMapPicker && (
                <MapPicker
                  lat={lat}
                  lon={lon}
                  isAr={isAr}
                  onPick={(newLat, newLon) => {
                    setLat(newLat);
                    setLon(newLon);
                  }}
                />
              )}

              {/* Confirmed coords display */}
              {lat && lon && lat !== String(MINIA_CENTER[0]) && (
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  ✓ {isAr ? `الموقع: ${lat}, ${lon}` : `Location set: ${lat}, ${lon}`}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--text-muted)] mb-1">
                {t('places.field_phone')}
              </label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-color)] text-[var(--text-main)]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--text-muted)] mb-1">
                {t('places.field_specialty')}
              </label>
              <input
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-color)] text-[var(--text-main)]"
              />
            </div>

            {formError ? (
              <p className="text-sm font-semibold text-red-600">{formError}</p>
            ) : null}

            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#0076f7] to-[#00c6ff] text-white font-bold disabled:opacity-60"
            >
              {mutation.isPending ? '…' : t('places.add_submit')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
