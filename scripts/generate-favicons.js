const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateFavicons() {
  const sourcePath = path.resolve('public/brand/cropped_circle.png');
  if (!fs.existsSync(sourcePath)) {
    console.error('Source cropped_circle.png not found at', sourcePath);
    process.exit(1);
  }

  console.log('Reading source image from:', sourcePath);
  const sourceBuffer = fs.readFileSync(sourcePath);

  // Generate 16, 32, 48 buffers
  const png16 = await sharp(sourceBuffer).resize(16, 16).png().toBuffer();
  const png32 = await sharp(sourceBuffer).resize(32, 32).png().toBuffer();
  const png48 = await sharp(sourceBuffer).resize(48, 48).png().toBuffer();
  const png180 = await sharp(sourceBuffer).resize(180, 180).png().toBuffer();
  const png192 = await sharp(sourceBuffer).resize(192, 192).png().toBuffer();
  const png512 = await sharp(sourceBuffer).resize(512, 512).png().toBuffer();

  // Helper to build a valid ICO file containing multiple PNG images
  function buildIco(images) {
    const headerSize = 6;
    const entrySize = 16;
    const numImages = images.length;
    let offset = headerSize + numImages * entrySize;

    const header = Buffer.alloc(headerSize);
    header.writeUInt16LE(0, 0); // reserved
    header.writeUInt16LE(1, 2); // 1 = ICO
    header.writeUInt16LE(numImages, 4);

    const entries = [];
    const imageBuffers = [];

    for (const img of images) {
      const entry = Buffer.alloc(entrySize);
      entry.writeUInt8(img.width >= 256 ? 0 : img.width, 0);
      entry.writeUInt8(img.height >= 256 ? 0 : img.height, 1);
      entry.writeUInt8(0, 2); // color count
      entry.writeUInt8(0, 3); // reserved
      entry.writeUInt16LE(1, 4); // color planes
      entry.writeUInt16LE(32, 6); // bpp
      entry.writeUInt32LE(img.buffer.length, 8); // size of image
      entry.writeUInt32LE(offset, 12); // offset

      entries.push(entry);
      imageBuffers.push(img.buffer);
      offset += img.buffer.length;
    }

    return Buffer.concat([header, ...entries, ...imageBuffers]);
  }

  const icoBuffer = buildIco([
    { width: 16, height: 16, buffer: png16 },
    { width: 32, height: 32, buffer: png32 },
    { width: 48, height: 48, buffer: png48 },
  ]);

  // Write ICO to src/app/favicon.ico (Next.js default)
  fs.writeFileSync(path.resolve('src/app/favicon.ico'), icoBuffer);
  console.log('✓ Overwrote src/app/favicon.ico');

  // Write ICO to public/favicon.ico (standard static fallback)
  fs.writeFileSync(path.resolve('public/favicon.ico'), icoBuffer);
  console.log('✓ Created public/favicon.ico');

  // Write PNG icons
  fs.writeFileSync(path.resolve('public/favicon.png'), png32);
  fs.writeFileSync(path.resolve('public/favicon-32x32.png'), png32);
  fs.writeFileSync(path.resolve('public/favicon-16x16.png'), png16);
  fs.writeFileSync(path.resolve('public/apple-touch-icon.png'), png180);
  fs.writeFileSync(path.resolve('public/icon-192.png'), png192);
  fs.writeFileSync(path.resolve('public/icon-512.png'), png512);

  // Overwrite App Router convention files in src/app/
  fs.writeFileSync(path.resolve('src/app/icon.png'), png32);
  fs.writeFileSync(path.resolve('src/app/apple-icon.png'), png180);
  console.log('✓ Updated App Router icon files (src/app/icon.png, src/app/apple-icon.png)');

  console.log('All favicons successfully generated!');
}

generateFavicons().catch((err) => {
  console.error(err);
  process.exit(1);
});
