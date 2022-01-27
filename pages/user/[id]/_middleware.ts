import type { NextRequest } from 'next/server';
import { verifyAuth } from '../../../lib/auth';
import { NextResponse as Response } from "next/server";

export async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const uid = url.pathname.split("/")[2];
  const isLoginURL = url.pathname.split("/")[3] === "login";
  const [valid] = await verifyAuth(req);
  if (!isLoginURL && !valid) {
    return Response.redirect(`/user/${uid}/login`);
  }
}
