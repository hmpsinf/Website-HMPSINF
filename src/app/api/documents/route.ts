import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { requireAuth } from '@/lib/auth';

interface DocumentRow {
    id: string;
    name: string;
    category_id: string | null;
    category_name: string | null;
    category_color: string | null;
    file_url: string;
    file_public_id: string;
    file_size: number | null;
    file_type: string | null;
    original_filename: string | null;
    download_count: number;
    published_at: string;
    created_at: string;
    updated_at: string;
    owner_type: string;
    division_id: string | null;
}

// GET - List documents with pagination, search, category, and owner filter
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';
        const categoryId = searchParams.get('category') || '';
        const ownerType = searchParams.get('owner_type') || '';
        const divisionId = searchParams.get('division_id') || '';
        const offset = (page - 1) * limit;

        // Build WHERE clause
        const conditions: string[] = [];
        const args: (string | number)[] = [];

        if (search) {
            conditions.push('(d.name LIKE ? OR d.original_filename LIKE ?)');
            args.push(`%${search}%`, `%${search}%`);
        }

        if (categoryId) {
            conditions.push('d.category_id = ?');
            args.push(categoryId);
        }

        if (ownerType) {
            conditions.push('d.owner_type = ?');
            args.push(ownerType);
        }

        if (divisionId) {
            conditions.push('d.division_id = ?');
            args.push(divisionId);
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        // Get total count
        const countResult = await db.execute({
            sql: `SELECT COUNT(*) as total FROM documents d ${whereClause}`,
            args
        });
        const total = Number(countResult.rows[0]?.total || 0);

        // Get documents with category info
        const result = await db.execute({
            sql: `SELECT 
                    d.*,
                    dc.name as category_name,
                    dc.color as category_color
                  FROM documents d
                  LEFT JOIN document_categories dc ON d.category_id = dc.id
                  ${whereClause}
                  ORDER BY d.published_at DESC
                  LIMIT ? OFFSET ?`,
            args: [...args, limit, offset]
        });

        const documents = (result.rows as unknown as DocumentRow[]).map(row => ({
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
            updated_at: row.updated_at,
            owner_type: row.owner_type,
            division_id: row.division_id
        }));

        return NextResponse.json({
            documents,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching documents:', error);
        return NextResponse.json(
            { error: 'Failed to fetch documents' },
            { status: 500 }
        );
    }
}

// POST - Upload new document
export async function POST(request: NextRequest) {
    try {
        const auth = await requireAuth();
        if (!auth) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File | null;
        const name = formData.get('name') as string | null;
        const categoryId = formData.get('category_id') as string | null;
        const ownerType = formData.get('owner_type') as string || 'hima';
        const divisionId = formData.get('division_id') as string | null;

        if (!file) {
            return NextResponse.json(
                { error: 'File is required' },
                { status: 400 }
            );
        }

        // Convert file to buffer for Cloudinary upload
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64Data = buffer.toString('base64');
        const dataUri = `data:${file.type};base64,${base64Data}`;

        // Upload to Cloudinary using signed upload with API credentials
        const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
        const apiKey = process.env.CLOUDINARY_API_KEY;
        const apiSecret = process.env.CLOUDINARY_API_SECRET;

        if (!cloudName || !apiKey || !apiSecret) {
            return NextResponse.json(
                { error: 'Cloudinary configuration missing' },
                { status: 500 }
            );
        }

        // Generate signature for signed upload
        const timestamp = Math.round(new Date().getTime() / 1000);
        const uploadPreset = 'hmpsinf';
        
        // Generate a unique public_id with the original filename (including extension)
        const crypto = await import('crypto');
        const uniqueId = crypto.randomBytes(8).toString('hex');
        const safeFilename = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const publicId = `archive/documents/${uniqueId}_${safeFilename}`;
        
        // Create signature string (params must be sorted alphabetically)
        // public_id, timestamp, upload_preset, use_filename_as_display_name - sorted
        const signatureString = `public_id=${publicId}&timestamp=${timestamp}&upload_preset=${uploadPreset}&use_filename_as_display_name=false${apiSecret}`;
        
        // Create SHA1 hash for signature
        const signature = crypto.createHash('sha1').update(signatureString).digest('hex');

        const cloudinaryFormData = new FormData();
        cloudinaryFormData.append('file', dataUri);
        cloudinaryFormData.append('public_id', publicId);
        cloudinaryFormData.append('timestamp', timestamp.toString());
        cloudinaryFormData.append('upload_preset', uploadPreset);
        cloudinaryFormData.append('use_filename_as_display_name', 'false');
        cloudinaryFormData.append('api_key', apiKey);
        cloudinaryFormData.append('signature', signature);

        const uploadResponse = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`,
            {
                method: 'POST',
                body: cloudinaryFormData
            }
        );

        if (!uploadResponse.ok) {
            const errorData = await uploadResponse.json();
            console.error('Cloudinary upload error:', JSON.stringify(errorData, null, 2));
            return NextResponse.json(
                { error: `Cloudinary error: ${errorData.error?.message || 'Upload failed'}` },
                { status: 500 }
            );
        }

        const uploadResult = await uploadResponse.json();

        // Save to database
        const id = crypto.randomUUID();
        const now = new Date().toISOString();

        await db.execute({
            sql: `INSERT INTO documents (
                    id, name, category_id, file_url, file_public_id, 
                    file_size, file_type, original_filename, 
                    download_count, published_at, created_at, updated_at,
                    owner_type, division_id
                  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [
                id,
                name?.trim() || file.name,
                categoryId || null,
                uploadResult.secure_url,
                uploadResult.public_id,
                uploadResult.bytes || file.size,
                file.type || uploadResult.format,
                file.name,
                0,
                now,
                now,
                now,
                ownerType,
                divisionId || null
            ]
        });

        return NextResponse.json({
            id,
            name: name?.trim() || file.name,
            file_url: uploadResult.secure_url,
            file_public_id: uploadResult.public_id,
            file_size: uploadResult.bytes || file.size,
            file_type: file.type,
            original_filename: file.name,
            published_at: now,
            owner_type: ownerType,
            division_id: divisionId || null
        }, { status: 201 });
    } catch (error) {
        console.error('Error uploading document:', error);
        return NextResponse.json(
            { error: 'Failed to upload document' },
            { status: 500 }
        );
    }
}
