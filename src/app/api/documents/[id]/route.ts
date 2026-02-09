import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { requireAuth } from '@/lib/auth';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET - Get single document
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        
        const result = await db.execute({
            sql: `SELECT 
                    d.*,
                    dc.name as category_name,
                    dc.color as category_color
                  FROM documents d
                  LEFT JOIN document_categories dc ON d.category_id = dc.id
                  WHERE d.id = ?`,
            args: [id]
        });

        if (result.rows.length === 0) {
            return NextResponse.json(
                { error: 'Document not found' },
                { status: 404 }
            );
        }

        const row = result.rows[0] as Record<string, unknown>;
        return NextResponse.json({
            id: row.id,
            name: row.name,
            category: row.category_id ? {
                id: row.category_id,
                name: row.category_name,
                color: row.category_color
            } : null,
            file_url: row.file_url,
            file_public_id: row.file_public_id,
            file_size: row.file_size,
            file_type: row.file_type,
            original_filename: row.original_filename,
            download_count: row.download_count,
            published_at: row.published_at,
            created_at: row.created_at,
            updated_at: row.updated_at
        });
    } catch (error) {
        console.error('Error fetching document:', error);
        return NextResponse.json(
            { error: 'Failed to fetch document' },
            { status: 500 }
        );
    }
}

// PUT - Update document metadata
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const auth = await requireAuth();
        if (!auth) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const { name, category_id } = body;

        if (!name?.trim()) {
            return NextResponse.json(
                { error: 'Document name is required' },
                { status: 400 }
            );
        }

        const now = new Date().toISOString();

        const result = await db.execute({
            sql: `UPDATE documents 
                  SET name = ?, category_id = ?, updated_at = ?
                  WHERE id = ?`,
            args: [name.trim(), category_id || null, now, id]
        });

        if (result.rowsAffected === 0) {
            return NextResponse.json(
                { error: 'Document not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            id,
            name: name.trim(),
            category_id: category_id || null,
            updated_at: now
        });
    } catch (error) {
        console.error('Error updating document:', error);
        return NextResponse.json(
            { error: 'Failed to update document' },
            { status: 500 }
        );
    }
}

// DELETE - Delete document (also delete from Cloudinary)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const auth = await requireAuth();
        if (!auth) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        // Get document to get public_id for Cloudinary deletion
        const docResult = await db.execute({
            sql: 'SELECT file_public_id FROM documents WHERE id = ?',
            args: [id]
        });

        if (docResult.rows.length === 0) {
            return NextResponse.json(
                { error: 'Document not found' },
                { status: 404 }
            );
        }

        const publicId = docResult.rows[0].file_public_id as string;

        // Delete from Cloudinary using MCP if available, otherwise skip
        // Note: For raw files, we use the destroy endpoint
        try {
            const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
            const apiKey = process.env.CLOUDINARY_API_KEY;
            const apiSecret = process.env.CLOUDINARY_API_SECRET;

            if (cloudName && apiKey && apiSecret && publicId) {
                const timestamp = Math.floor(Date.now() / 1000);
                const crypto = await import('crypto');
                
                // Signature for destroy: only public_id and timestamp, sorted alphabetically
                const signatureString = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
                const signature = crypto.createHash('sha1').update(signatureString).digest('hex');

                // Use form-urlencoded format for destroy endpoint
                const deleteParams = new URLSearchParams({
                    public_id: publicId,
                    timestamp: timestamp.toString(),
                    api_key: apiKey,
                    signature: signature
                });

                const deleteResponse = await fetch(
                    `https://api.cloudinary.com/v1_1/${cloudName}/raw/destroy`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        body: deleteParams.toString()
                    }
                );
                
                const deleteResult = await deleteResponse.json();
                console.log('Cloudinary delete result:', deleteResult);
            }
        } catch (cloudinaryError) {
            console.error('Error deleting from Cloudinary:', cloudinaryError);
            // Continue with database deletion even if Cloudinary fails
        }

        // Delete from database
        await db.execute({
            sql: 'DELETE FROM documents WHERE id = ?',
            args: [id]
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting document:', error);
        return NextResponse.json(
            { error: 'Failed to delete document' },
            { status: 500 }
        );
    }
}
