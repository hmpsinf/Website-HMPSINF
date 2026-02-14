
import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function ensureTable() {
    await db.execute({
        sql: `
            CREATE TABLE IF NOT EXISTS popup_settings (
                id TEXT PRIMARY KEY DEFAULT 'default',
                is_active INTEGER DEFAULT 0,
                image_url TEXT,
                title TEXT,
                description TEXT,
                btn_text TEXT,
                btn_link TEXT,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        `,
        args: []
    });
}

export async function GET() {
    try {
        await ensureTable();

        const result = await db.execute({
            sql: "SELECT * FROM popup_settings WHERE id = 'default'",
            args: []
        });

        if (result.rows.length === 0) {
            return NextResponse.json({
                is_active: false,
                image_url: '',
                title: '',
                description: '',
                btn_text: '',
                btn_link: ''
            });
        }

        const row = result.rows[0];
        return NextResponse.json({
            is_active: Boolean(row.is_active),
            image_url: row.image_url,
            title: row.title,
            description: row.description,
            btn_text: row.btn_text,
            btn_link: row.btn_link
        });
    } catch (error) {
        console.error('Error fetching popup settings:', error);
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await ensureTable();

        console.log('Received POST request to /api/popup');
        const formData = await req.formData();
        
        // Extract fields
        const isActive = formData.get('is_active') === 'true';
        const title = formData.get('title') as string || '';
        const description = formData.get('description') as string || '';
        const btnText = formData.get('btn_text') as string || '';
        const btnLink = formData.get('btn_link') as string || '';
        const file = formData.get('file');
        
        console.log({ isActive, title, description, btnText, btnLink, fileType: typeof file });

        let imageUrl = formData.get('image_url') as string || '';

        // Upload image to Cloudinary if provided
        if (file instanceof File && file.size > 0) {
            console.log('File detected, size:', file.size);
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            
            // Convert buffer to base64
            const base64Image = `data:${file.type};base64,${buffer.toString('base64')}`;

            try {
                console.log('Uploading to Cloudinary...');
                const uploadResult = await cloudinary.uploader.upload(base64Image, {
                    folder: 'hmpsinf/popup',
                    resource_type: 'image',
                    width: 800,
                    crop: "limit" 
                });
                imageUrl = uploadResult.secure_url;
                console.log('Cloudinary upload success:', imageUrl);
            } catch (uploadError) {
                console.error("Cloudinary upload failed:", uploadError);
                return NextResponse.json({ error: 'Gagal upload gambar popup' }, { status: 500 });
            }
        }

        console.log('Updating database with imageUrl:', imageUrl);

        // Update database
        await db.execute({
            sql: `INSERT INTO popup_settings (id, is_active, image_url, title, description, btn_text, btn_link, updated_at)
                VALUES ('default', ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                ON CONFLICT(id) DO UPDATE SET
                    is_active = excluded.is_active,
                    image_url = excluded.image_url,
                    title = excluded.title,
                    description = excluded.description,
                    btn_text = excluded.btn_text,
                    btn_link = excluded.btn_link,
                    updated_at = excluded.updated_at`,
            args: [isActive ? 1 : 0, imageUrl, title, description, btnText, btnLink]
        });
        
        console.log('Database update successful');

        return NextResponse.json({ success: true, image_url: imageUrl });

    } catch (error) {
        console.error('Error updating popup settings:', error);
        return NextResponse.json({ error: 'Gagal menyimpan pengaturan popup' }, { status: 500 });
    }
}
