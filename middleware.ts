import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "./actions/auth";

export async function middleware(request: NextRequest) {
	const session = await getSession();
	const { pathname } = request.nextUrl;

	// Redirect unauthenticated users from /todos to sign-in
	if (pathname.startsWith("/todos") && !session) {
		return NextResponse.redirect(new URL("/auth/sign-in", request.url));
	}

	// Redirect users from /admin if they're not authenticated or not an admin
	if (pathname.startsWith("/admin")) {
		if (!session) {
			return NextResponse.redirect(new URL("/auth/sign-in", request.url));
		}

		if (session.user.role !== "admin") {
			return NextResponse.redirect(new URL("/", request.url));
		}
	}

	return NextResponse.next();
}

export const config = {
	runtime: "nodejs",
	matcher: ["/todos/:path*", "/admin/:path*", "/schedule"],
};
