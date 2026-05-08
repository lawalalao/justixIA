import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Note: /api/chat and /api/feedback are NOT listed here because they
// support a demo case (no auth) and do their own auth check internally.
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/tribunal(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) await auth.protect();
});

export const config = {
  matcher: ['/((?!_next|.*\\..*|favicon.ico).*)', '/(api|trpc)(.*)'],
};
