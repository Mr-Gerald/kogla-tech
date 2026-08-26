const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generate() {
  const svgPath = path.join(__dirname, 'public', 'favicon.svg');
  const svgBuffer = fs.readFileSync(svgPath);

  const targets = [
    { file: 'favicon.png', size: 48 },
    { file: 'favicon.ico', size: 48 },
    { file: 'apple-touch-icon.png', size: 180 },
    { file: 'logo192.png', size: 192 },
    { file: 'logo512.png', size: 512 }
  ];

  for (const t of targets) {
    const outPath = path.join(__dirname, 'public', t.file);
    await sharp(svgBuffer)
      .resize(t.size, t.size)
      .png()
      .toFile(outPath);
    console.log(`Generated ${t.file} (${t.size}x${t.size})`);
  }
}

generate().catch(console.error);
