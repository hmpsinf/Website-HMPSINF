import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@libsql/client';

const db = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

export async function GET(request: NextRequest) {
    try {
        // Fetch favicon_url from site_settings key-value table
        const result = await db.execute({
            sql: `SELECT value FROM site_settings WHERE key = 'favicon_url' LIMIT 1`,
            args: []
        });

        const faviconUrl = result.rows[0]?.value as string | undefined;

        if (!faviconUrl) {
            // Return 404 if no favicon is set
            return new NextResponse(null, { status: 404 });
        }

        // Redirect to the Cloudinary favicon URL
        // This allows browser to cache and Google to index properly
        return NextResponse.redirect(faviconUrl, { status: 302 });

    } catch (error) {
        console.error('Favicon route error:', error);
        return new NextResponse(null, { status: 500 });
    }
}
