import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)']);
const isStaffRoute = createRouteMatcher(['/staff(.*)']);
const isUserRoute = createRouteMatcher(['/dashboard(.*)']);

type UserRole = 'USER' | 'STAFF' | 'ADMIN';

const getRedirectByRole = (role: UserRole): string => {
  switch (role) {
    case 'STAFF':
    case 'ADMIN':
      return '/staff';
    default:
      return '/dashboard';
  }
};

export default clerkMiddleware(async (auth, request) => {
  const { userId, sessionClaims } = await auth();
  const { pathname } = request.nextUrl;

  const role = (sessionClaims?.metadata as { role?: UserRole })?.role ?? 'USER';

  // Redirect signed-in users from home based on role
  if (userId && pathname === '/') {
    return NextResponse.redirect(new URL(getRedirectByRole(role), request.url));
  }

  // Redirect signed-out users from home to sign-in
  if (!userId && pathname === '/') {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  // Prevent regular users from accessing staff routes
  if (userId && isStaffRoute(request) && role === 'USER') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Redirect staff/admin from user dashboard to staff dashboard
  if (userId && isUserRoute(request) && (role === 'STAFF' || role === 'ADMIN')) {
    return NextResponse.redirect(new URL('/staff', request.url));
  }

  // Protect non-public routes
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
