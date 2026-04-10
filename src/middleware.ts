import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// This project currently uses client-side localStorage auth for demo flows.
// Keep middleware pass-through to avoid blocking dashboard routes without cookies.
const ENABLE_COOKIE_GUARD = false;

// Protected routes that require cookie-based authentication when guard is enabled.
const PROTECTED_PREFIXES = ["/profile", "/dashboard", "/posts/new"];

export function middleware(request: NextRequest) {
  if (!ENABLE_COOKIE_GUARD) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (isProtected) {
    // Check for Supabase session cookie
    const sessionCookie =
      request.cookies.get("sb-access-token") ||
      request.cookies.get("supabase-auth-token");

    if (!sessionCookie) {
      const redirectUrl = new URL("/login", request.url);
      redirectUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/profile/:path*", "/dashboard/:path*", "/posts/new"],
};
