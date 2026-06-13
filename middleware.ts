import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

type CookieToSet = {
  name: string;
  value: string;
  options?: Parameters<NextResponse["cookies"]["set"]>[2];
};

const brokerProtectedPrefixes = ["/dashboard", "/properties", "/leads", "/appointments", "/whatsapp"];

function isPublicRoute(pathname: string) {
  return (
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/catalogo") ||
    pathname.startsWith("/api/webhook") ||
    pathname.startsWith("/api/catalogo")
  );
}

function isAdminRoute(pathname: string) {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

function isBrokerProtectedRoute(pathname: string) {
  return brokerProtectedPrefixes.some((prefix) => pathname.startsWith(prefix));
}

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request });
  const { pathname } = request.nextUrl;

  if (isAdminRoute(pathname) && pathname !== "/admin/login") {
    const secretFromQuery = request.nextUrl.searchParams.get("secret");
    const secretFromCookie = request.cookies.get("admin_auth")?.value;
    const expectedSecret = process.env.ADMIN_SECRET;

    if (expectedSecret && secretFromQuery === expectedSecret) {
      response.cookies.set("admin_auth", expectedSecret, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/admin"
      });
      return response;
    }

    if (!expectedSecret || secretFromCookie !== expectedSecret) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/admin/login";
      return NextResponse.redirect(loginUrl);
    }

    return response;
  }

  if (isPublicRoute(pathname) || !isBrokerProtectedRoute(pathname)) return response;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) return response;

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      }
    }
  });

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("redirectedFrom", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/properties/:path*",
    "/leads/:path*",
    "/appointments/:path*",
    "/whatsapp/:path*"
  ]
};
