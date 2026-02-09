import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { requireAuth } from '@/lib/auth';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET - Get single document category
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        
        const result = await db.execute({
            sql: `SELECT 
                    dc.*,
                    COUNT(d.id) as document_count
                  FROM document_categories dc
                  LEFT JOIN documents d ON d.category_id = dc.id
                  WHERE dc.id = ?
                  GROUP BY dc.id`,
            args: [id]
        });

        if (result.rows.length === 0) {
            return NextResponse.json(
                { error: 'Category not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching document category:', error);
        return NextResponse.json(
            { error: 'Failed to fetch document category' },
            { status: 500 }
        );
    }
}

// PUT - Update document category
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const auth = await requireAuth();
        if (!auth) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const { name, description, color } = body;

        if (!name?.trim()) {
            return NextResponse.json(
                { error: 'Category name is required' },
                { status: 400 }
            );
        }

        const now = new Date().toISOString();

        const result = await db.execute({
            sql: `UPDATE document_categories 
                  SET name = ?, description = ?, color = ?, updated_at = ?
                  WHERE id = ?`,
            args: [name.trim(), description?.trim() || null, color || '#3B82F6', now, id]
        });

        if (result.rowsAffected === 0) {
            return NextResponse.json(
                { error: 'Category not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            id,
            name: name.trim(),
            description: description?.trim() || null,
            color: color || '#3B82F6',
            updated_at: now
        });
    } catch (error) {
        console.error('Error updating document category:', error);
        return NextResponse.json(
            { error: 'Failed to update document category' },
            { status: 500 }
        );
    }
}

// DELETE - Delete document category
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const auth = await requireAuth();
        if (!auth) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        const result = await db.execute({
            sql: 'DELETE FROM document_categories WHERE id = ?',
            args: [id]
        });

        if (result.rowsAffected === 0) {
            return NextResponse.json(
                { error: 'Category not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting document category:', error);
        return NextResponse.json(
            { error: 'Failed to delete document category' },
            { status: 500 }
        );
    }
}
