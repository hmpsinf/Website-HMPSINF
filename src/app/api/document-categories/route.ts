import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { requireAuth } from '@/lib/auth';

// GET - List all document categories
export async function GET() {
    try {
        const result = await db.execute(`
            SELECT 
                dc.*,
                COUNT(d.id) as document_count
            FROM document_categories dc
            LEFT JOIN documents d ON d.category_id = dc.id
            GROUP BY dc.id
            ORDER BY dc.name ASC
        `);
        
        return NextResponse.json(result.rows);
    } catch (error) {
        console.error('Error fetching document categories:', error);
        return NextResponse.json(
            { error: 'Failed to fetch document categories' },
            { status: 500 }
        );
    }
}

// POST - Create new document category
export async function POST(request: NextRequest) {
    try {
        const auth = await requireAuth();
        if (!auth) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { name, description, color } = body;

        if (!name?.trim()) {
            return NextResponse.json(
                { error: 'Category name is required' },
                { status: 400 }
            );
        }

        const id = crypto.randomUUID();
        const now = new Date().toISOString();

        await db.execute({
            sql: `INSERT INTO document_categories (id, name, description, color, created_at, updated_at)
                  VALUES (?, ?, ?, ?, ?, ?)`,
            args: [id, name.trim(), description?.trim() || null, color || '#3B82F6', now, now]
        });

        return NextResponse.json({
            id,
            name: name.trim(),
            description: description?.trim() || null,
            color: color || '#3B82F6',
            created_at: now,
            updated_at: now,
            document_count: 0
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating document category:', error);
        return NextResponse.json(
            { error: 'Failed to create document category' },
            { status: 500 }
        );
    }
}
