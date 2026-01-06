import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForToken } from '@/lib/etsy';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  if (!code || state !== 'etsy_oauth') {
    return NextResponse.json({ error: 'Invalid OAuth response' }, { status: 400 });
  }

  // Get the verifier from the cookie
  const verifier = request.cookies.get('etsy_verifier')?.value;

  if (!verifier) {
    return NextResponse.json({ error: 'Missing code verifier' }, { status: 400 });
  }

  try {
    // Exchange code for access token
    const tokenData = await exchangeCodeForToken(code, verifier);

    // In production, you should store these tokens securely in a database
    // For now, we'll store them in environment variables (requires manual setup)
    console.log('='.repeat(80));
    console.log('ETSY OAUTH SUCCESS!');
    console.log('='.repeat(80));
    console.log('Add these to your .env file:');
    console.log(`ETSY_ACCESS_TOKEN="${tokenData.access_token}"`);
    console.log(`ETSY_REFRESH_TOKEN="${tokenData.refresh_token}"`);
    console.log('='.repeat(80));

    // Try to write to a .env.tokens file for easy reference
    try {
      const tokensContent = `# Add these to your .env file\nETSY_ACCESS_TOKEN="${tokenData.access_token}"\nETSY_REFRESH_TOKEN="${tokenData.refresh_token}"\n`;
      await writeFile(path.join(process.cwd(), '.env.tokens'), tokensContent);
    } catch (err) {
      console.error('Could not write .env.tokens file:', err);
    }

    const response = NextResponse.redirect(new URL('/', request.url));

    // Clear the verifier cookie
    response.cookies.delete('etsy_verifier');

    return response;
  } catch (error) {
    console.error('OAuth error:', error);
    return NextResponse.json(
      { error: 'Failed to exchange code for token', details: String(error) },
      { status: 500 }
    );
  }
}
