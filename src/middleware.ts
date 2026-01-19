import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_PATHS = ['/dashboard', '/admin', '/checkout', '/confirmation'];
const AUTH_PATHS = ['/auth', '/auth/reset-password'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('__session')?.value;

  // 1. Ignorar archivos estáticos
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/api') || 
    /\.(png|jpg|jpeg|gif|svg|ico|css|js|webp)$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  const isAuthPath = AUTH_PATHS.some(path => pathname.startsWith(path));
  const isProtectedRoute = PROTECTED_PATHS.some((path) => pathname.startsWith(path));

  // 2. Si el usuario intenta ir a LOGIN pero YA tiene una cookie, lo mandamos al dashboard
  // (Aquí no validamos el rol, dejamos que la página lo haga para evitar el bucle de fetch)
  if (isAuthPath && sessionCookie) {
    return NextResponse.next(); // Permitimos entrar para que el cliente maneje la redirección
  }

  // 3. Lógica para RUTAS PROTEGIDAS
  if (isProtectedRoute) {
    if (!sessionCookie) {
      const url = request.nextUrl.clone();
      url.pathname = '/auth';
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
    
    // IMPORTANTE: En lugar de hacer un fetch que falla en Cloud Run, 
    // permitimos el paso y dejamos que el "Server Component" de la página
    // haga la validación (que ya vimos en tus logs que funciona perfectamente).
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};