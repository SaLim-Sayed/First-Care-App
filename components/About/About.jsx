import Footer from "@/components/Footer";
import { useTranslation } from "react-i18next";
import { useState, useEffect, useRef } from "react";
import { Button } from "@heroui/react/button";
import { FaHome, FaPhoneAlt, FaFax, FaEnvelopeOpenText, FaSpinner, FaMapMarkerAlt, FaTimes } from "react-icons/fa";
import { useDoctors } from "@/components/Doctors/useDoctors";

// Mini embedded map that shows the selected doctor's location
function DoctorMiniMap({ doctor, isAr, onClose }) {
  const mapRef = useRef(null);
  const mapDivRef = useRef(null);

  useEffect(() => {
    if (!doctor || typeof window === 'undefined') return;

    let L;
    let map;

    const init = async () => {
      await import('leaflet/dist/leaflet.css');
      L = (await import('leaflet')).default;

      // Fix default icons
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      if (!mapDivRef.current) return;

      map = L.map(mapDivRef.current, { zoomControl: true }).setView([doctor.lat, doctor.lon], 16);
      mapRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map);

      const popupContent = `
        <div style="font-family: system-ui; min-width: 160px; padding: 4px;">
          <strong style="font-size: 14px;">${isAr ? doctor.name : (doctor.nameEn || doctor.name)}</strong>
          ${doctor.address ? `<p style="font-size: 12px; color: #666; margin-top: 4px;">${doctor.address}</p>` : ''}
          ${doctor.phone ? `<p style="font-size: 12px; color: #0076f7; margin-top: 4px;">📞 ${doctor.phone}</p>` : ''}
        </div>
      `;

      L.marker([doctor.lat, doctor.lon])
        .addTo(map)
        .bindPopup(popupContent)
        .openPopup();
    };

    init();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [doctor, isAr]);

  if (!doctor) return null;

  return (
    <div
      className="mt-4 rounded-3xl overflow-hidden border border-[var(--border-color)] shadow-xl"
      style={{ position: 'relative' }}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-[var(--card-bg)] border-b border-[var(--border-color)]">
        <div className="flex items-center gap-2">
          <FaMapMarkerAlt className="text-[#0076f7]" />
          <span className="font-bold text-sm text-[var(--text-main)] truncate max-w-[200px]">
            {isAr ? doctor.name : (doctor.nameEn || doctor.name)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${doctor.lat},${doctor.lon}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold text-[#0076f7] hover:underline flex items-center gap-1 no-underline"
          >
            <FaMapMarkerAlt size={10} />
            {isAr ? 'الاتجاهات' : 'Directions'}
          </a>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-red-500 transition-colors ml-2">
            <FaTimes size={14} />
          </button>
        </div>
      </div>

      {/* Map */}
      <div ref={mapDivRef} style={{ height: 260, width: '100%' }} />
    </div>
  );
}

export default function About() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  
  const { places, loading } = useDoctors(isAr);
  const [selectedDocId, setSelectedDocId] = useState("");
  const [showMap, setShowMap] = useState(false);

  const doctors = places?.filter(p => p.category === 'doctors' || p.category === 'clinic') || [];
  const selectedDoc = doctors.find(d => d.id === selectedDocId);

  const getWaLink = (doc) => {
    if (!doc || !doc.phone) return "https://wa.me/201062913674";
    return `https://wa.me/${doc.phone.replace(/[^0-9]/g, '')}`;
  };

  const handleDocSelect = (e) => {
    const val = e.target.value;
    setSelectedDocId(val);
    setShowMap(false); // reset map when switching doctor
    if (val) {
      const doc = doctors.find(d => d.id === val);
      window.open(getWaLink(doc), '_blank');
    }
  };

  return (
    <section className="  py-20 bg-[var(--bg-color)] transition-colors duration-300" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col lg:flex-row gap-10">
          <div className="w-full lg:w-1/3">
            <div className={`content_left p-10 bg-[var(--card-bg)] rounded-[2.5rem] shadow-xl border border-[var(--border-color)] transition-all ${isAr ? 'text-right' : 'text-left'}`}>
              <div className="flex items-center gap-4 mb-10">
                <div className="p-3 bg-blue-50 dark:bg-slate-800 rounded-2xl">
                  <FaHome className="text-3xl text-[#0091ff]" />
                </div>
                <h3 className="text-3xl font-black text-[var(--text-main)] tracking-tight">
                  {t('about.contact_info_title')}
                </h3>
              </div>
              <ul className="space-y-8 text-xl text-[var(--text-main)]">
                <li className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-slate-800 flex items-center justify-center text-[#0091ff]">
                    <FaPhoneAlt size={18} />
                  </div>
                  <span className="font-medium text-lg"><strong className="opacity-50">{t('about.phone')} :</strong> 08684254254</span>
                </li>
                <li className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-slate-800 flex items-center justify-center text-[#0091ff]">
                    <FaFax size={18} />
                  </div>
                  <span className="font-medium text-lg"><strong className="opacity-50">{t('about.fax')} :</strong> (+20)000222988</span>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-slate-800 flex items-center justify-center text-[#0091ff] mt-1">
                    <FaEnvelopeOpenText size={18} />
                  </div>
                  <span className="break-all font-medium text-lg leading-relaxed"><strong className="opacity-50">{t('about.email')} :</strong> contact@firstcare.com</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="w-full lg:w-2/3 pb-5">
            <div className={`content_right p-8 lg:p-12 bg-[var(--card-bg)] rounded-[3rem] shadow-2xl border border-[var(--border-color)] transition-all ${isAr ? 'text-right' : 'text-left'}`}>
              <h3 className="text-4xl font-black mb-3 text-[#0076f7] tracking-tight">
                {isAr ? 'تواصل معنا' : 'Contact Us'}
              </h3>
              <p className="text-[var(--text-muted)] mb-10 text-lg font-medium leading-relaxed">
                {isAr 
                  ? 'اختر طبيباً وابدأ محادثة مباشرة، أو تواصل معنا فوراً عبر واتساب.' 
                  : 'Select a doctor to start a conversation, or contact us instantly via WhatsApp.'}
              </p>

              <div className="flex flex-col gap-6">
                
                {/* Doctor Selection */}
                <div className="space-y-3">
                  <label className="text-sm font-bold text-[var(--text-muted)] ml-2">
                    {isAr ? 'اختر طبيباً للتواصل معه:' : 'Select a doctor to chat with:'}
                  </label>
                  
                  {loading ? (
                    <div className="flex items-center gap-2 text-[#0076f7] p-4">
                      <FaSpinner className="animate-spin" /> 
                      <span className="text-sm font-bold">{isAr ? 'جاري تحميل الأطباء...' : 'Loading doctors...'}</span>
                    </div>
                  ) : (
                    <div className="relative">
                      <select 
                        value={selectedDocId}
                        onChange={handleDocSelect}
                        className="w-full appearance-none h-14 px-5 rounded-2xl bg-[var(--bg-color)] border border-[var(--border-color)] hover:border-[#0091ff] transition-all text-lg text-[var(--text-main)] font-semibold outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30"
                      >
                        <option value="">
                          {isAr ? '-- اختر طبيباً --' : '-- Select a doctor --'}
                        </option>
                        {doctors.map(doc => (
                          <option key={doc.id} value={doc.id}>
                            {isAr ? doc.name : (doc.nameEn || doc.name)} {doc.specialty ? ` - ${doc.specialty}` : ''}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[var(--text-muted)]">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                        </svg>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action buttons when doctor is selected */}
                {selectedDoc && (
                  <div className="flex gap-3">
                    <Button
                      as="a"
                      href={getWaLink(selectedDoc)}
                      target="_blank"
                      rel="noopener noreferrer"
                      size="lg"
                      className="flex-1 flex items-center justify-center font-black h-16 text-lg bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white shadow-xl shadow-green-500/30 hover:shadow-green-500/50 transform hover:-translate-y-1 transition-all rounded-2xl"
                    >
                      💬 {isAr ? `محادثة واتساب` : `WhatsApp Chat`}
                    </Button>
                    <button
                      onClick={() => setShowMap(v => !v)}
                      className="flex items-center justify-center gap-2 px-5 h-16 rounded-2xl border-2 font-bold text-sm transition-all"
                      style={{
                        borderColor: showMap ? '#0076f7' : 'var(--border-color)',
                        background: showMap ? '#0076f7' : 'var(--bg-color)',
                        color: showMap ? 'white' : '#0076f7',
                      }}
                    >
                      <FaMapMarkerAlt />
                      {isAr ? 'على الخريطة' : 'Show on Map'}
                    </button>
                  </div>
                )}

                {/* No doctor selected — show general WhatsApp */}
                {!selectedDoc && (
                  <Button
                    as="a"
                    href="https://wa.me/201062913674"
                    target="_blank"
                    rel="noopener noreferrer"
                    size="lg"
                    className="w-full flex items-center justify-center font-black px-10 h-20 text-2xl bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white shadow-xl shadow-green-500/30 hover:shadow-green-500/50 transform hover:-translate-y-1 transition-all rounded-3xl"
                  >
                    💬 {isAr ? 'تواصل عبر واتساب' : 'Contact via WhatsApp'}
                  </Button>
                )}

                {/* Embedded mini map */}
                {showMap && selectedDoc && (
                  <DoctorMiniMap
                    doctor={selectedDoc}
                    isAr={isAr}
                    onClose={() => setShowMap(false)}
                  />
                )}

                <div className="relative flex items-center py-2">
                  <div className="flex-grow border-t border-[var(--border-color)]"></div>
                  <span className="flex-shrink-0 mx-4 text-[var(--text-muted)] font-bold text-sm">
                    {isAr ? 'أو ابحث عن المزيد' : 'OR FIND MORE'}
                  </span>
                  <div className="flex-grow border-t border-[var(--border-color)]"></div>
                </div>

                <Button
                  as="a"
                  href={`/${i18n.language || 'en'}/Doctors`}
                  color="primary"
                  size="lg"
                  className="w-full flex items-center justify-center font-black px-10 h-16 text-lg bg-[var(--bg-color)] border-2 border-[#0076f7] text-[#0076f7] hover:bg-[#0076f7] hover:text-white shadow-sm hover:-translate-y-1 transition-all rounded-2xl"
                >
                  👨‍⚕️ {isAr ? 'استعرض خريطة الأطباء' : 'Browse Doctors Map'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-20">
        <Footer />
      </div>
    </section>
  );
}
