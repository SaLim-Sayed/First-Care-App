'use client';

import { useCallback, useState } from 'react';

export function useDisclosure(initialOpen = false) {
  const [isOpen, setOpen] = useState(initialOpen);
  const onOpen = useCallback(() => setOpen(true), []);
  const onClose = useCallback(() => setOpen(false), []);
  const onOpenChange = useCallback((open) => {
    setOpen((prev) => (open !== undefined ? open : !prev));
  }, []);

  return { isOpen, onOpen, onClose, onOpenChange };
}
