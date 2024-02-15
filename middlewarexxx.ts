import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const currentUser = request.cookies.get("authToken")?.value;
  if (!currentUser) {
    return NextResponse.redirect(new URL("/login", request.url));
  } 
}
//"/login", "/register", "/forgot-password",
export const config = {
  matcher: ["/(Chat)/:path*","/",  "/register", "/forgot-password"],
};
