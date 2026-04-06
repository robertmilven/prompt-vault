/**
 * Upload images from the Airtable download drive to Cloudinary
 * and update Supabase records with the URLs.
 *
 * Usage: node scripts/upload-images.js
 *
 * Set these env vars or edit below:
 *   CLOUDINARY_CLOUD_NAME
 *   CLOUDINARY_API_KEY
 *   CLOUDINARY_API_SECRET
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const cloudinary = require('cloudinary').v2;
const { createClient } = require('@supabase/supabase-js');

// ── Config ──
const SOURCE_DIR = 'D:\\airtable folder images with data';
const THUMB_WIDTH = 400; // thumbnail width in px
const THUMB_QUALITY = 75; // JPEG quality
const BATCH_SIZE = 10; // concurrent uploads
const TEMP_DIR = path.join(__dirname, '..', 'temp_thumbs');

// Cloudinary config - EDIT THESE or use env vars
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dwqcsvaed',
  api_key: process.env.CLOUDINARY_API_KEY || '988879692443611',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'lkOEAYPh8uZN21dVbYAvKaQ7PkY',
});

// Supabase
const supabase = createClient(
  'https://kvjientfaaewancbmzrr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2amllbnRmYWFld2FuY2JtenJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0MDg1MjcsImV4cCI6MjA5MDk4NDUyN30.Xsn6CWE3xQ2AYTNHmBpEMYL0W6RdyIlBlje_H74Y5Go'
);

// ── Helpers ──
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.tiff']);

function isImage(filename) {
  return IMAGE_EXTS.has(path.extname(filename).toLowerCase());
}

// Extract Airtable record ID from filename (e.g., "rec1c1IF2AAkEUFER_Still Shot_Video_0_file.jpg")
function extractRecordId(filename) {
  const match = filename.match(/^(rec[a-zA-Z0-9]{10,})/);
  return match ? match[1] : null;
}

async function generateThumbnail(srcPath, destPath) {
  try {
    await sharp(srcPath)
      .resize(THUMB_WIDTH, null, { withoutEnlargement: true })
      .jpeg({ quality: THUMB_QUALITY })
      .toFile(destPath);
    return true;
  } catch (err) {
    return false;
  }
}

async function uploadToCloudinary(filePath, publicId) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(filePath, {
      public_id: publicId,
      folder: 'prompt-vault',
      resource_type: 'image',
      overwrite: false,
      transformation: { quality: 'auto', fetch_format: 'auto' },
    }, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

async function updateSupabaseRecord(recordId, imageUrl, thumbnailUrl) {
  const { error } = await supabase
    .from('prompts')
    .update({ image_url: imageUrl, thumbnail_url: thumbnailUrl })
    .eq('source_record_id', recordId);
  return !error;
}

// ── Main ──
async function main() {
  console.log('=== IMAGE UPLOAD PIPELINE ===\n');

  // Check Cloudinary config
  if (cloudinary.config().cloud_name === 'EDIT_ME') {
    console.error('ERROR: Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET');
    console.error('Either edit the script or set environment variables.');
    process.exit(1);
  }

  // Create temp dir
  fs.mkdirSync(TEMP_DIR, { recursive: true });

  // Scan all image folders
  console.log(`Scanning ${SOURCE_DIR}...`);
  const baseFolders = fs.readdirSync(SOURCE_DIR).filter(f => {
    return fs.statSync(path.join(SOURCE_DIR, f)).isDirectory();
  });

  // Collect all images with their record IDs
  const imageJobs = [];

  for (const baseFolder of baseFolders) {
    const imagesDir = path.join(SOURCE_DIR, baseFolder, 'images');
    if (!fs.existsSync(imagesDir)) continue;

    const files = fs.readdirSync(imagesDir).filter(isImage);
    for (const file of files) {
      const recordId = extractRecordId(file);
      if (!recordId) continue;

      imageJobs.push({
        sourcePath: path.join(imagesDir, file),
        filename: file,
        recordId,
        baseFolder,
      });
    }
  }

  console.log(`Found ${imageJobs.length} images across ${baseFolders.length} bases.\n`);

  // Check which records already have images in Supabase
  console.log('Checking existing images in database...');
  const { data: existingWithImages } = await supabase
    .from('prompts')
    .select('source_record_id')
    .not('thumbnail_url', 'is', null);

  const alreadyDone = new Set((existingWithImages || []).map(r => r.source_record_id));
  const pendingJobs = imageJobs.filter(j => !alreadyDone.has(j.recordId));

  console.log(`Already uploaded: ${alreadyDone.size}`);
  console.log(`Pending: ${pendingJobs.length}\n`);

  if (pendingJobs.length === 0) {
    console.log('All images already uploaded!');
    return;
  }

  // Process in batches
  let uploaded = 0;
  let skipped = 0;
  let errors = 0;

  for (let i = 0; i < pendingJobs.length; i += BATCH_SIZE) {
    const batch = pendingJobs.slice(i, i + BATCH_SIZE);

    const promises = batch.map(async (job) => {
      try {
        // Generate thumbnail
        const thumbName = `thumb_${job.recordId}.jpg`;
        const thumbPath = path.join(TEMP_DIR, thumbName);

        const thumbOk = await generateThumbnail(job.sourcePath, thumbPath);
        if (!thumbOk) {
          skipped++;
          return;
        }

        // Upload thumbnail to Cloudinary
        const publicId = `prompt-vault/${job.recordId}`;
        const result = await uploadToCloudinary(thumbPath, publicId);

        if (!result || !result.secure_url) {
          errors++;
          return;
        }

        // Update Supabase record
        const thumbnailUrl = result.secure_url;
        // Generate a larger version URL using Cloudinary transformations
        const imageUrl = thumbnailUrl.replace('/upload/', '/upload/w_800,q_auto/');

        await updateSupabaseRecord(job.recordId, imageUrl, thumbnailUrl);
        uploaded++;

        // Clean up temp file
        try { fs.unlinkSync(thumbPath); } catch {}

      } catch (err) {
        errors++;
      }
    });

    await Promise.all(promises);

    const total = uploaded + skipped + errors;
    const pct = ((total / pendingJobs.length) * 100).toFixed(1);
    console.log(`  Progress: ${total}/${pendingJobs.length} (${pct}%) | Uploaded: ${uploaded} | Skipped: ${skipped} | Errors: ${errors}`);

    // Small delay between batches
    await sleep(200);
  }

  console.log('\n');
  console.log('=== UPLOAD COMPLETE ===');
  console.log(`  Uploaded: ${uploaded}`);
  console.log(`  Skipped: ${skipped}`);
  console.log(`  Errors: ${errors}`);

  // Clean up temp dir
  try { fs.rmdirSync(TEMP_DIR, { recursive: true }); } catch {}
}

main().catch(console.error);
