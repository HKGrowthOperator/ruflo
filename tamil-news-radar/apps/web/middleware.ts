import { NextResponse, type NextRequest } from 'next/server';

/**
 * Basic Auth für das Admin-Dashboard (Frage 25: ein Admin in V1).
 * Ohne gesetztes ADMIN_PASSWORD bleibt /admin offen – nur für lokale
 * Entwicklung gedacht; in Produktion IMMER setzen.
 */
export function middleware(request: NextRequest): NextResponse {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return NextResponse.next();

  const user = process.env.ADMIN_USER || 'admin';
  const header = request.headers.get('authorization') ?? '';
  if (header.startsWith('Basic ')) {
    try {
      const [givenUser, givenPassword] = atob(header.slice(6)).split(':');
      if (givenUser === user && givenPassword === password) return NextResponse.next();
    } catch {
      /* ungültiger Header → 401 */
    }
  }
  return new NextResponse('Authentifizierung erforderlich', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Tamil News Radar Admin"' },
  });
}

export const config = { matcher: ['/admin/:path*'] };
