
import fs from 'fs';
import path from 'path';
import { createClient } from '@libsql/client';

// Try .env.local first, then .env
let envPath = path.resolve(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
    envPath = path.resolve(process.cwd(), '.env');
}

try {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const urlMatch = envContent.match(/TURSO_DATABASE_URL=["']?([^"'\r\n]+)["']?/);
    const tokenMatch = envContent.match(/TURSO_AUTH_TOKEN=["']?([^"'\r\n]+)["']?/);

    const url = urlMatch ? urlMatch[1] : '';
    const authToken = tokenMatch ? tokenMatch[1] : '';

    if (!url) {
        console.error('TURSO_DATABASE_URL not found');
        process.exit(1);
    }

    const client = createClient({
        url,
        authToken,
    });

    async function main() {
        try {
            console.log('Querying recent news...');
            // Select id, title, author_name, created_at
            const result = await client.execute("SELECT id, title, author_name, created_at FROM news ORDER BY created_at DESC LIMIT 5");
            console.log(JSON.stringify(result.rows, null, 2));
        } catch (e) {
            console.error('Query error:', e);
        }
    }

    main();
} catch (err) {
    console.error('Error reading .env:', err);
}
