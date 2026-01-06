import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';

// Generate PKCE challenge
function base64URLEncode(str: Buffer): string {
  return str
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

export async function GET() {
  // Generate code verifier and challenge for PKCE
  const verifier = base64URLEncode(randomBytes(32));
  const challenge = base64URLEncode(
    require('crypto').createHash('sha256').update(verifier).digest()
  );

  // Store verifier in a cookie (in production, use a more secure method)
  const response = NextResponse.redirect(
    `https://www.etsy.com/oauth/connect?` +
      new URLSearchParams({
        response_type: 'code',
        redirect_uri: `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/etsy/callback`,
        scope: 'listings_r listings_w',
        client_id: process.env.ETSY_API_KEY!,
        state: 'etsy_oauth',
        code_challenge: challenge,
        code_challenge_method: 'S256',
      }).toString()
  );

  // Store verifier for the callback
  response.cookies.set('etsy_verifier', verifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 600, // 10 minutes
    path: '/',
  });

  return response;
}
