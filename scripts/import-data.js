const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// ─── Config ────────────────────────────────────────────────────────────────────
const SUPABASE_URL = 'https://kvjientfaaewancbmzrr.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2amllbnRmYWFld2FuY2JtenJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0MDg1MjcsImV4cCI6MjA5MDk4NDUyN30.Xsn6CWE3xQ2AYTNHmBpEMYL0W6RdyIlBlje_H74Y5Go';
const SOURCE_DIR = 'D:\\airtable folder images with data';
const BATCH_SIZE = 50;
const MIN_PROMPT_LENGTH = 20;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── Category keyword mapping ──────────────────────────────────────────────────
const CATEGORY_KEYWORDS = {
  'Camera Movements': ['camera', 'dolly', 'tracking', 'crane', 'pan', 'zoom', 'tilt', 'orbit', 'movement', 'shot type', 'angle'],
  'Atmospheric': ['rain', 'fire', 'smoke', 'neon', 'fog', 'atmosphere', 'mist', 'glow', 'particle', 'weather', 'haze'],
  'Product': ['product', 'showcase', 'commercial', 'brand', 'advertisement', 'ad ', 'packaging', 'bottle', 'perfume'],
  'UGC': ['ugc', 'testimonial', 'hook', 'tiktok', 'social', 'reel', 'content creator'],
  'Live-Action': ['live-action', 'live action', 'sports', 'person', 'real', 'documentary', 'interview'],
  'Cinematic': ['cinematic', 'warrior', 'noir', 'epic', 'dramatic', 'film', 'movie', 'fantasy', 'sci-fi', 'cyberpunk'],
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

function safeString(val) {
  if (val == null) return '';
  if (typeof val === 'string') return val.trim();
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);
  if (Array.isArray(val)) return val.map(safeString).join(', ');
  if (typeof val === 'object') return JSON.stringify(val);
  return String(val);
}

/**
 * Find the prompt text from fields.
 * Priority: explicit prompt field names, then longest string field.
 */
function extractPrompt(fields) {
  const promptKeys = ['Prompt', 'prompt', 'Prompt Example', 'prompt_text', 'Description', 'Text', 'description', 'text'];
  for (const key of promptKeys) {
    if (fields[key] && typeof fields[key] === 'string' && fields[key].trim().length >= MIN_PROMPT_LENGTH) {
      return fields[key].trim();
    }
  }
  // Fallback: longest string field (skip known non-prompt fields)
  const skipKeys = new Set(['id', 'ID', 'Date', 'Days Date', 'createdTime', 'Extract Prompt', 'Details']);
  let longest = '';
  for (const [key, val] of Object.entries(fields)) {
    if (skipKeys.has(key)) continue;
    if (typeof val === 'string' && val.trim().length > longest.length) {
      longest = val.trim();
    }
  }
  return longest;
}

/**
 * Extract a title from fields.
 * Priority: explicit name fields, then first 60 chars of prompt.
 */
function extractTitle(fields, promptText) {
  const titleKeys = ['Shot/Movement Name', 'Name', 'name', 'Title', 'title', 'Details'];
  for (const key of titleKeys) {
    if (fields[key] && typeof fields[key] === 'string' && fields[key].trim().length > 2) {
      let t = fields[key].trim();
      // Clean emoji prefixes like "🪄 "
      t = t.replace(/^[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{FE00}-\u{FEFF}]+\s*/gu, '').trim();
      if (t.length > 2) return t.substring(0, 120);
    }
  }
  // Fallback: first 60 chars of prompt
  if (promptText) {
    return promptText.substring(0, 60).replace(/\n/g, ' ').trim();
  }
  return 'Untitled';
}

/**
 * Extract type from fields.
 */
function extractType(fields) {
  const typeKeys = ['Type', 'type', 'Category', 'category'];
  for (const key of typeKeys) {
    if (fields[key] && typeof fields[key] === 'string') {
      // Strip markdown bold markers
      return fields[key].replace(/\*\*/g, '').trim();
    }
  }
  return null;
}

/**
 * Extract tags from fields (array or comma-separated string).
 */
function extractTags(fields) {
  const tagKeys = ['Tags', 'tags', 'AI Prompt Keyword', 'Keywords', 'keywords'];
  for (const key of tagKeys) {
    const val = fields[key];
    if (!val) continue;
    if (Array.isArray(val)) {
      return val.filter(t => typeof t === 'string').map(t => t.trim()).filter(Boolean);
    }
    if (typeof val === 'string') {
      return val.split(',').map(t => t.trim()).filter(Boolean);
    }
  }
  return [];
}

/**
 * Extract camera movement from fields.
 */
function extractCameraMovement(fields) {
  const camKeys = ['Camera', 'Camera Movement', 'camera_movement', 'Shot', 'Shot/Movement Name', 'Primary Purpose/Effect'];
  for (const key of camKeys) {
    if (fields[key] && typeof fields[key] === 'string') {
      return fields[key].replace(/\*\*/g, '').trim().substring(0, 200);
    }
  }
  return null;
}

/**
 * Determine category based on folder name, type, and prompt text.
 */
function categorize(folderName, type, promptText, categoryMap) {
  const combined = [folderName, type || '', promptText || ''].join(' ').toLowerCase();

  // Folder-name heuristics (most reliable)
  const folderLower = folderName.toLowerCase();

  // Prompt Generators - meta-prompts that improve other prompts
  if (folderLower.includes('prompt generator')) {
    return categoryMap['Prompt Generators'] || categoryMap['Cinematic'];
  }
  // Content King folders + text-only LLM prompts
  if (folderLower.includes('content king') || folderLower.includes('writing') || folderLower.includes('blogging')
      || folderLower.includes('seo') || folderLower.includes('e-commerce') || folderLower.includes('newsletter')
      || folderLower.includes('business') || folderLower.includes('youtube') || folderLower.includes('social media')) {
    return categoryMap['LLM Prompts'] || categoryMap['Cinematic'];
  }
  if (folderLower.includes('camera') || folderLower.includes('lens') || folderLower.includes('shot')) {
    return categoryMap['Camera Movements'] || categoryMap['Cinematic'];
  }
  if (folderLower.includes('atmosphere')) {
    return categoryMap['Atmospheric'];
  }
  if (folderLower.includes('product') || folderLower.includes('ad')) {
    return categoryMap['Product'];
  }
  if (folderLower.includes('cyberpunk') || folderLower.includes('futuristic')) {
    return categoryMap['Atmospheric'];
  }

  // Keyword matching on combined text
  for (const [catName, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const kw of keywords) {
      if (combined.includes(kw)) {
        return categoryMap[catName] || categoryMap['Cinematic'];
      }
    }
  }

  // Default
  return categoryMap['Cinematic'];
}

/**
 * Scan all data.json files in the source directory.
 */
function scanDataFiles() {
  const folders = fs.readdirSync(SOURCE_DIR);
  const allRecords = [];

  for (const folder of folders) {
    const dataPath = path.join(SOURCE_DIR, folder, 'data.json');
    if (!fs.existsSync(dataPath)) {
      console.log(`  [SKIP] No data.json in: ${folder}`);
      continue;
    }

    try {
      const raw = fs.readFileSync(dataPath, 'utf8');
      const data = JSON.parse(raw);
      const records = Array.isArray(data) ? data : (data.records || []);
      console.log(`  [LOAD] ${folder}: ${records.length} records`);

      for (const record of records) {
        allRecords.push({ ...record, _folderName: folder });
      }
    } catch (err) {
      console.error(`  [ERROR] Failed to parse ${folder}/data.json: ${err.message}`);
    }
  }

  return allRecords;
}

/**
 * Transform an Airtable record into a Supabase prompt row.
 */
function transformRecord(record, categoryMap) {
  try {
    const fields = record.fields || {};
    const promptText = extractPrompt(fields);

    if (!promptText || promptText.length < MIN_PROMPT_LENGTH) {
      return null; // skip
    }

    const title = extractTitle(fields, promptText);
    const type = extractType(fields);
    const tags = extractTags(fields);
    const cameraMovement = extractCameraMovement(fields);
    const categoryId = categorize(record._folderName, type, promptText, categoryMap);

    return {
      title: title,
      prompt_text: promptText,
      category_id: categoryId,
      type: type ? type.substring(0, 100) : null,
      tags: tags.length > 0 ? tags : null,
      camera_movement: cameraMovement,
      image_url: null,
      thumbnail_url: null,
      source_base: record._folderName,
      source_record_id: record.id,
      is_featured: false,
      is_free: false,
    };
  } catch (err) {
    console.error(`  [ERROR] Transform failed for ${record.id}: ${err.message}`);
    return null;
  }
}

/**
 * Insert records in batches.
 */
async function batchInsert(rows) {
  let inserted = 0;
  let errors = 0;

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(rows.length / BATCH_SIZE);

    const { data, error } = await supabase
      .from('prompts')
      .insert(batch)
      .select('id');

    if (error) {
      console.error(`  [BATCH ${batchNum}/${totalBatches}] ERROR: ${error.message}`);
      // Try inserting one by one to salvage what we can
      for (const row of batch) {
        const { error: singleErr } = await supabase.from('prompts').insert(row);
        if (singleErr) {
          errors++;
          console.error(`    [SINGLE] Failed ${row.source_record_id}: ${singleErr.message}`);
        } else {
          inserted++;
        }
      }
    } else {
      inserted += (data ? data.length : batch.length);
      console.log(`  [BATCH ${batchNum}/${totalBatches}] Inserted ${batch.length} records (${inserted}/${rows.length} total)`);
    }
  }

  return { inserted, errors };
}

// ─── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('=== Airtable → Supabase Import ===');
  console.log(`Source: ${SOURCE_DIR}`);
  console.log(`Target: ${SUPABASE_URL}`);
  console.log('');

  // 1. Fetch categories
  console.log('[1/4] Fetching categories from Supabase...');
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('id, name, slug');

  if (catError) {
    console.error('FATAL: Could not fetch categories:', catError.message);
    process.exit(1);
  }

  const categoryMap = {};
  for (const cat of categories) {
    categoryMap[cat.name] = cat.id;
  }
  console.log(`  Found ${categories.length} categories: ${categories.map(c => c.name).join(', ')}`);
  console.log('');

  // 2. Fetch existing source_record_ids to avoid duplicates
  console.log('[2/5] Checking existing records in Supabase...');
  const existingIds = new Set();
  let offset = 0;
  while (true) {
    const { data: batch, error: fetchErr } = await supabase
      .from('prompts')
      .select('source_record_id')
      .range(offset, offset + 999);
    if (fetchErr || !batch || batch.length === 0) break;
    for (const r of batch) existingIds.add(r.source_record_id);
    offset += batch.length;
    if (batch.length < 1000) break;
  }
  console.log(`  Found ${existingIds.size} existing records - will skip duplicates`);
  console.log('');

  // 3. Scan all data.json files
  console.log('[3/5] Scanning data files...');
  const allRecords = scanDataFiles();
  console.log(`  Total raw records: ${allRecords.length}`);
  console.log('');

  // 4. Transform records (skip duplicates)
  console.log('[4/5] Transforming records...');
  const rows = [];
  let skipped = 0;
  let duplicates = 0;

  for (const record of allRecords) {
    if (existingIds.has(record.id)) {
      duplicates++;
      continue;
    }
    const row = transformRecord(record, categoryMap);
    if (row) {
      rows.push(row);
    } else {
      skipped++;
    }
  }
  console.log(`  Ready to import: ${rows.length}`);
  console.log(`  Skipped (no/short prompt): ${skipped}`);
  console.log(`  Skipped (duplicate): ${duplicates}`);
  console.log('');

  if (rows.length === 0) {
    console.log('No new records to import!');
    return;
  }

  // 5. Batch insert
  console.log('[5/5] Inserting into Supabase...');
  const { inserted, errors } = await batchInsert(rows);
  console.log('');

  // Summary
  const summary = {
    timestamp: new Date().toISOString(),
    source: SOURCE_DIR,
    totalRaw: allRecords.length,
    transformed: rows.length,
    skipped: skipped,
    inserted: inserted,
    errors: errors,
    categories: categoryMap,
  };

  console.log('=== IMPORT COMPLETE ===');
  console.log(`  Total records scanned: ${allRecords.length}`);
  console.log(`  Imported: ${inserted}`);
  console.log(`  Skipped: ${skipped}`);
  console.log(`  Errors: ${errors}`);

  // Save log
  const logDir = path.join(__dirname, '..', 'logs');
  if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
  const logFile = path.join(logDir, `import-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
  fs.writeFileSync(logFile, JSON.stringify(summary, null, 2));
  console.log(`  Log saved: ${logFile}`);
}

main().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});
