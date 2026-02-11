
import fs from 'fs';
import path from 'path';
import { createClient } from '@libsql/client';

let envPath = path.resolve(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
    envPath = path.resolve(process.cwd(), '.env');
}

try {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const urlMatch = envContent.match(/TURSO_DATABASE_URL=["']?([^"'\r\n]+)["']?/);
    const tokenMatch = envContent.match(/TURSO_AUTH_TOKEN=["']?([^"'\r\n]+)["']?/);

    const client = createClient({
        url: urlMatch ? urlMatch[1] : '',
        authToken: tokenMatch ? tokenMatch[1] : '',
    });

    async function main() {
        try {
            const result = await client.execute("SELECT id, title, author_name, created_at FROM news ORDER BY created_at DESC LIMIT 1");
            const row = result.rows[0];
            console.log('LATEST NEWS:');
            console.log('Title:', row.title);
            console.log('Author Name:', row.author_name);
            console.log('Type of Author Name:', typeof row.author_name);
        } catch (e) {
            console.error(e);
        }
    }

    main();
} catch (err) { console.error(err); }
