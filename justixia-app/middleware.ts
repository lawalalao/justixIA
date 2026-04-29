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

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) auth().protect();
});

export const config = {
  matcher: ['/((?!_next|.*\\..*|favicon.ico).*)', '/(api|trpc)(.*)'],
};
