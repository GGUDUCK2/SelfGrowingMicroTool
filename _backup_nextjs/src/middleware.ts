import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const locales = ["en", "ko"];
const defaultLocale = "en";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 정적 파일 요청은 리다이렉트하지 않음 (확장자가 있는 파일)
  if (pathname.includes(".")) {
    return NextResponse.next();
  }

  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  if (pathnameIsMissingLocale) {
    const locale = defaultLocale;
    return NextResponse.redirect(
      new URL(`/${locale}/${pathname}`, request.url)
    );
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next (static files)
     * - favicon.ico
     * - api routes
     * - public directory files (files with extensions)
     */
    "/((?!_next|api|favicon\\.ico|.*\\.xml|.*\\.txt|.*\\.svg|.*\\.png|.*\\.jpg|.*\\.ico).*)",
  ],
};
