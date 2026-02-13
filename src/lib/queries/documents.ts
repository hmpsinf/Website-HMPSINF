
import db from '@/lib/db';

export interface Document {
    id: string;
    name: string;
    category: {
        id: string;
        name: string;
        color: string;
    } | null;
    file_url: string;
    file_size: number | null;
    file_type: string | null;
    original_filename: string | null;
    download_count: number;
    published_at: string;
    owner_type: 'hima' | 'division';
    division: {
        id: string;
        name: string;
    } | null;
}

export interface GetDocumentsParams {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    owner?: 'hima' | 'division' | '';
    divisionId?: string;
}

export interface GetDocumentsResponse {
    documents: Document[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export async function getDocuments({
    page = 1,
    limit = 10,
    search = '',
    category = '',
    owner = '',
    divisionId = '',
}: GetDocumentsParams): Promise<GetDocumentsResponse> {
    const offset = (page - 1) * limit;

    // Build WHERE clause
    const conditions: string[] = [];
    const args: (string | number)[] = [];

    // Filter by search term
    if (search) {
        conditions.push('(d.name LIKE ? OR d.original_filename LIKE ?)');
        args.push(`%${search}%`, `%${search}%`);
    }

    // Filter by category
    if (category) {
        conditions.push('d.category_id = ?');
        args.push(category);
    }

    // Filter by owner type
    if (owner) {
        conditions.push('d.owner_type = ?');
        args.push(owner);
    }

    // Filter by division
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

    // Get documents with related data
    const query = `
        SELECT 
            d.id, d.name, d.file_url, d.file_size, d.file_type, 
            d.original_filename, d.download_count, d.published_at,
            d.owner_type, d.division_id, d.category_id,
            dc.name as category_name, dc.color as category_color,
            div.name as division_name
        FROM documents d
        LEFT JOIN document_categories dc ON d.category_id = dc.id
        LEFT JOIN divisions div ON d.division_id = div.id
        ${whereClause}
        ORDER BY d.published_at DESC
        LIMIT ? OFFSET ?
    `;

    const result = await db.execute({
        sql: query,
        args: [...args, limit, offset]
    });

    const documents = result.rows.map((row: any) => ({
        id: row.id,
        name: row.name,
        category: row.category_id ? {
            id: row.category_id,
            name: row.category_name,
            color: row.category_color
        } : null,
        file_url: row.file_url,
        file_size: row.file_size,
        file_type: row.file_type,
        original_filename: row.original_filename,
        download_count: row.download_count,
        published_at: row.published_at,
        owner_type: row.owner_type as 'hima' | 'division',
        division: row.division_id ? {
            id: row.division_id,
            name: row.division_name
        } : null
    }));

    return {
        documents,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    };
}

export async function getDocumentCategories() {
    const result = await db.execute('SELECT * FROM document_categories ORDER BY name ASC');
    return result.rows.map((row: any) => ({
        id: row.id,
        name: row.name,
        color: row.color
    }));
}
