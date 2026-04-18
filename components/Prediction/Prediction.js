'use client';

import { useTranslation } from 'react-i18next';

import { useDisclosure } from '@/lib/hooks/useDisclosure';
import { Modal } from '@/components/ui/Modal';
import List from '@/components/Prediction/Prediction/List';
import { PredictionResultsContent } from '@/components/Prediction/PredictionResultsContent';
import { usePredictionApi } from '@/components/Prediction/usePredictionApi';
import { useSymptomSelection } from '@/components/Prediction/useSymptomSelection';
import { SYMPTOM_KEYS_AR, SYMPTOM_KEYS_EN } from '@/components/Prediction/symptomData';

function Main() {
  const { i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar');
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
  const { posts, getIsChecked, handleCheckboxUnified } = useSymptomSelection(isAr);
  const { prediction, isLoading, predictionHandle } = usePredictionApi({
    posts,
    isAr,
    onOpen,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <div className="App min-h-screen pt-10">
      <List
        keys={isAr ? SYMPTOM_KEYS_AR : SYMPTOM_KEYS_EN}
        onHandleCheckbox={handleCheckboxUnified}
        onHandleSubmit={handleSubmit}
        predictionHandle={predictionHandle}
        prediction={prediction}
        isLoading={isLoading}
        posts={posts}
        getIsChecked={getIsChecked}
      />

      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={isAr ? 'نتائج الفحص الذكي' : 'Smart Diagnosis Results'}
      >
        <PredictionResultsContent prediction={prediction} isAr={isAr} />
      </Modal>
    </div>
  );
}

export default Main;
