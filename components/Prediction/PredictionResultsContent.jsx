'use client';

export function PredictionResultsContent({ prediction, isAr }) {
  if (typeof prediction === 'object' && prediction !== null && !Array.isArray(prediction)) {
    return (
      <div className="space-y-6">
        <div className="text-center p-6 bg-blue-50 dark:bg-blue-900/20 rounded-3xl border border-blue-100 dark:border-blue-800">
          <span className="text-sm font-black text-[#0076f7] uppercase tracking-wider mb-2 block">
            {isAr ? 'التشخيص المقترح' : 'Suggested Diagnosis'}
          </span>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white">
            {isAr ? prediction.prediction_in_arabic : prediction.prediction}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-800">
            <h4 className="font-black text-emerald-600 mb-2 flex items-center gap-2 text-sm">
              <span className="w-1 h-4 bg-emerald-500 rounded-full" />
              {isAr ? 'الاحتياطات' : 'Precautions'}
            </h4>
            <ul className="text-xs font-bold text-gray-700 dark:text-gray-300 space-y-1">
              {[prediction.precaution_1, prediction.precaution_2, prediction.precaution_3, prediction.precaution_4].map(
                (_, i) => {
                  const txt = isAr
                    ? prediction?.[`precaution_${i + 1}_in_arabic`]
                    : prediction?.[`precaution_${i + 1}`];
                  return txt && txt !== 'NaN' ? (
                    <li key={i}>• {txt}</li>
                  ) : null;
                },
              )}
            </ul>
          </div>

          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-100 dark:border-amber-800">
            <h4 className="font-black text-amber-600 mb-2 flex items-center gap-2 text-sm">
              <span className="w-1 h-4 bg-amber-500 rounded-full" />
              {isAr ? 'عوامل الخطر' : 'Risk Factors'}
            </h4>
            <p className="text-xs font-bold text-gray-700 dark:text-gray-300">
              {isAr ? prediction.Risk_Factors_in_arabic : prediction.Risk_Factors}
            </p>
          </div>
        </div>

        <div className="p-4 bg-rose-50 dark:bg-rose-900/20 rounded-2xl border-2 border-rose-100 dark:border-rose-800">
          <h4 className="font-black text-rose-600 mb-1 flex items-center gap-2 text-sm">
            ⚠️ {isAr ? 'تنبيه هام' : 'Important Notice'}
          </h4>
          <p className="text-xs font-bold text-rose-900 dark:text-rose-200">{prediction.warning}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-[var(--bg-color)] rounded-3xl border border-[var(--border-color)] whitespace-pre-wrap leading-relaxed font-bold text-[var(--text-main)]">
      {prediction}
    </div>
  );
}
