import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Public pages that should not be protected
    // /[org_name]/status is public
    // /external is public
    // / is public
    const isPublicStatusPage = /\/([^/]+)\/status/.test(path);
    const isPublicExplorePage = path === "/external";
    const isLandingPage = path === "/";
    const isApiAuth = path.startsWith("/api/auth");
    const isApiPublic =
      path.startsWith("/api/status") || path.startsWith("/api/check");

    if (
      isLandingPage ||
      isPublicStatusPage ||
      isPublicExplorePage ||
      isApiAuth ||
      isApiPublic
    ) {
      return NextResponse.next();
    }

    // If no token, withAuth handles the redirect to signIn page (which we've set to /)
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;

        // Define public paths that don't need a token
        const isPublicStatusPage = /\/([^/]+)\/status/.test(path);
        const isPublicExplorePage = path === "/external";
        const isLandingPage = path === "/";
        const isApiAuth = path.startsWith("/api/auth");
        const isApiPublic =
          path.startsWith("/api/status") || path.startsWith("/api/check");

        if (
          isLandingPage ||
          isPublicStatusPage ||
          isPublicExplorePage ||
          isApiAuth ||
          isApiPublic
        ) {
          return true;
        }

        return !!token;
      },
    },
    pages: {
      signIn: "/",
    },
  },
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.webp).*)",
  ],
};
