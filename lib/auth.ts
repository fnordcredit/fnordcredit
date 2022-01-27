import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { nanoid } from 'nanoid'
import { SignJWT, jwtVerify } from 'jose'

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY!;
const COOKIE_ID = 'fnordcredit_user_auth';

if (!JWT_SECRET_KEY) {
  throw new Error('JWT_SECRET_KEY is missing in environment variables');
}

interface UserJwtPayload {
  jti: string,
  iat: number
}

function jsonResponse(status: number, data: any, init?: ResponseInit) {
  return new Response(JSON.stringify(data), {
    ...init,
    status,
    headers: {
      ...init?.headers,
      'Content-Type': 'application/json',
    },
  })
}

/**
 * Verifies the user's JWT token and returns the payload if
 * it's valid or a response if it's not.
 */
export async function verifyAuth(request: NextRequest) {
  const token = request.cookies[COOKIE_ID] || request.headers.get('Authorization');

  if (!token) {
    return [
      false, jsonResponse(401, { error: { message: 'Missing user token' } })];
  }

  try {
    const verified = await jwtVerify(
      token,
      new TextEncoder().encode(JWT_SECRET_KEY),
      { algorithms: [ "HS256" ] }
    );
    return [true, verified.payload as UserJwtPayload];
  } catch (err) {
    return [
      false, jsonResponse(401, { error: { message: 'Your token has expired' } })
    ];
  }
}

/**
 * Adds the user token cookie to a response.
 */
export async function setUserCookie(
  request: NextRequest,
  response: NextResponse
) {
  const cookie = request.cookies[COOKIE_ID];

  if (!cookie) {
    const token = await new SignJWT({})
      .setProtectedHeader({ alg: 'HS256' })
      .setJti(nanoid())
      .setIssuedAt()
      .setExpirationTime('2h')
      .sign(new TextEncoder().encode(JWT_SECRET_KEY));
    response.cookie(COOKIE_ID, token, { httpOnly: true });
  }

  return response;
}
