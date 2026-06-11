import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { homeRouteFor, TEAM_ROLES } from '@/lib/auth/home-route';

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Rôle porté par app_metadata.user_role (raw_app_meta_data, migration 006).
  // Absent = vendeur. Les dashboards admin/équipe restent mock-first : seule
  // la porte d'entrée est réelle. Garde désactivable avec ADMIN_AUTH_ENABLED≠true (démo).
  const role = (user?.app_metadata as Record<string, unknown> | undefined)?.user_role;

  // Espace Admin (/admin) — réservé au rôle `admin`.
  if (pathname.startsWith('/admin')) {
    if (process.env.ADMIN_AUTH_ENABLED !== 'true') return supabaseResponse;  // démo ouverte
    if (!user) return NextResponse.redirect(new URL('/login', request.url));
    if (role !== 'admin') return NextResponse.redirect(new URL(homeRouteFor(role), request.url));
    return supabaseResponse;
  }

  // Espace Équipe (/equipe) — réservé aux rôles d'équipe (procurement, site_agent,
  // inspector, controller).
  if (pathname.startsWith('/equipe')) {
    if (process.env.ADMIN_AUTH_ENABLED !== 'true') return supabaseResponse;  // démo ouverte
    if (!user) return NextResponse.redirect(new URL('/login', request.url));
    if (!TEAM_ROLES.includes(role as (typeof TEAM_ROLES)[number])) {
      return NextResponse.redirect(new URL(homeRouteFor(role), request.url));
    }
    return supabaseResponse;
  }

  const isPublicRoute =
    pathname === '/' ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/reset-password') ||
    pathname.startsWith('/nos-terrains') ||
    pathname.startsWith('/blog') ||
    pathname.startsWith('/sara') ||
    pathname.startsWith('/mustaf') ||
    pathname.startsWith('/projet') ||   // espace client Mustaf (mock-first, sans auth pour l'instant)
    pathname.startsWith('/produits') ||
    pathname.startsWith('/a-propos') ||
    pathname.startsWith('/carrieres') ||
    pathname.startsWith('/mentions-legales') ||
    pathname.startsWith('/confidentialite') ||
    pathname.startsWith('/conditions');

  const isProtectedRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/terrains') ||   // dashboard vendeur — /terrains/[id], etc.
    pathname.startsWith('/clients') ||
    pathname.startsWith('/visites') ||
    pathname.startsWith('/parametres') ||
    pathname.startsWith('/aide');

  if (!user && isProtectedRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Déjà connecté sur /login ou /register → renvoyer vers SON espace
  // (admin → /admin, équipe → /equipe, vendeur → /dashboard).
  if (user && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL(homeRouteFor(role), request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
