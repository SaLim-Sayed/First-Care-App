'use client';

import { SessionProvider } from 'next-auth/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/lib/i18n';
import { LocaleSync } from '@/components/LocaleSync';
import { HeroUIProvider } from "@heroui/system";
import { ThemeProvider } from "@/lib/context/ThemeContext";

export function Providers({ children }) {
  return (
    <SessionProvider>
      <I18nextProvider i18n={i18n}>
        <LocaleSync>
          <HeroUIProvider>
            <ThemeProvider>
              {children}
            </ThemeProvider>
          </HeroUIProvider>
        </LocaleSync>
      </I18nextProvider>
    </SessionProvider>
  );
}
