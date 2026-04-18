import { NextResponse } from 'next/server';

const locales = ['en', 'ar'];
const defaultLocale = 'en';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // 1. Check if the pathname already has a supported locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) return;

  // 2. Redirect if there is no locale
  // For production, you could detect the header: request.headers.get('accept-language')
  const locale = defaultLocale;
  request.nextUrl.pathname = `/${locale}${pathname}`;

  // e.g. /prediction -> /en/prediction
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: [
    // Skip all internal paths (_next, api, static files)
    '/((?!api|_next/static|_next/image|favicon.svg|.*\\.svg|.*\\.png|.*\\.jpg|.*\\.webp|.*\\.webmanifest|locales).*)',
  ],
};
