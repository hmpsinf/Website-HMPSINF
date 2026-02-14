import db from '../src/lib/db';

async function setupPopupTable() {
  console.log('Setting up popup_settings table...');

  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS popup_settings (
        id TEXT PRIMARY KEY DEFAULT 'default',
        is_active INTEGER DEFAULT 0,
        image_url TEXT,
        title TEXT,
        description TEXT,
        btn_text TEXT,
        btn_link TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Insert default row if not exists
    const result = await db.execute("SELECT * FROM popup_settings WHERE id = 'default'");
    
    if (result.rows.length === 0) {
        await db.execute({
            sql: `INSERT INTO popup_settings (id, is_active, title, description, btn_text, btn_link) 
                  VALUES ('default', 0, 'Welcome!', 'Check out our latest updates.', 'Learn More', '#')`,
            args: []
        });
        console.log('Inserted default popup settings.');
    }

    console.log('popup_settings table setup completed successfully.');
  } catch (error) {
    console.error('Error setting up popup_settings table:', error);
  }
}

setupPopupTable();
