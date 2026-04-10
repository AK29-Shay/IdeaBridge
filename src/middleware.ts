import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Protected routes that require authentication
const PROTECTED_PREFIXES = ["/profile", "/dashboard", "/posts/new"];

export function middleware(request: NextRequest) {
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
      const redirectUrl = new URL("/auth", request.url);
      redirectUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/profile/:path*", "/dashboard/:path*", "/posts/new"],
};
