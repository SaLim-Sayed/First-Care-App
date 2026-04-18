'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useCallback, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'react-i18next';
import { FaTimes } from 'react-icons/fa';

import { createManualPlace } from '@/lib/api/placesClient';
import { FILTERS, MINIA_CENTER } from '@/components/Doctors/constants';

const MIN_LAT = 27.85;
const MAX_LAT = 28.35;
const MIN_LON = 30.55;
const MAX_LON = 31.05;

const CATEGORY_KEYS = FILTERS.filter((f) => f.key !== 'all').map((f) => f.key);

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
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[var(--text-muted)] mb-1">
                  {t('places.field_lat')}
                </label>
                <input
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  inputMode="decimal"
                  className="w-full px-4 py-3 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-color)] text-[var(--text-main)]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--text-muted)] mb-1">
                  {t('places.field_lon')}
                </label>
                <input
                  value={lon}
                  onChange={(e) => setLon(e.target.value)}
                  inputMode="decimal"
                  className="w-full px-4 py-3 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-color)] text-[var(--text-main)]"
                />
              </div>
            </div>
            <p className="text-[10px] text-[var(--text-muted)]">{t('places.coords_hint')}</p>
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
