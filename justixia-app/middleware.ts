import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/consultation(.*)',
  '/tribunal(.*)',
  '/api/chat(.*)',
  '/api/feedback(.*)',
  '/api/tts(.*)',
  '/api/stt(.*)',
  '/api/stripe/checkout(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) await auth.protect();
});

export const config = {
  matcher: ['/((?!_next|.*\\..*|favicon.ico).*)', '/(api|trpc)(.*)'],
};
