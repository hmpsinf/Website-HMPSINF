import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@libsql/client';

const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

interface DocumentRow {
    id: string;
    name: string | null;
    file_url: string | null;
    original_filename: string | null;
    download_count: number | null;
    file_type: string | null;
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Await params (required in Next.js 16)
        const { id } = await params;
        
        // Fetch doc info from database
        const result = await db.execute({
            sql: 'SELECT * FROM documents WHERE id = ?',
            args: [id]
        });
        
        const doc = result.rows[0] as unknown as DocumentRow;

        if (!doc || !doc.file_url) {
            return new NextResponse('Document not found', { status: 404 });
        }

        // Increment download count
        await db.execute({
            sql: 'UPDATE documents SET download_count = download_count + 1 WHERE id = ?',
            args: [id]
        });

        // Fetch file from Cloudinary 
        const fileUrl = doc.file_url as string;
        const response = await fetch(fileUrl);
        
        if (!response.ok) {
            throw new Error(`Cloudinary responded with ${response.status}`);
        }

        const blob = await response.blob();
        
        // Prepare headers
        const headers = new Headers();
        
        // Determine filename: use original_filename if available, otherwise name + extension from file_url or type
        let filename = (doc.original_filename as string) || (doc.name as string);
        
        // Ensure filename has extension if missing
        if (!filename.includes('.')) {
            // Try to guess from file_type or url
            const type = (doc.file_type as string)?.toLowerCase();
            if (type) filename += `.${type}`;
            else if (fileUrl.endsWith('.pdf')) filename += '.pdf';
            else if (fileUrl.endsWith('.docx')) filename += '.docx';
        }
        
        // Basic sanitization to prevent header injection or invalid characters
        filename = filename.replace(/[<>:"/\\|?*\x00-\x1F]+/g, '_');
        
        headers.set('Content-Disposition', `attachment; filename="${filename}"`);
        headers.set('Content-Type', response.headers.get('Content-Type') || 'application/octet-stream');
        headers.set('Content-Length', response.headers.get('Content-Length') || blob.size.toString());

        return new NextResponse(blob, { headers });

    } catch (error) {
        console.error('Download error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
