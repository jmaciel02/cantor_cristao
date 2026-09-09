const sharp = require('../frontend/node_modules/sharp');
const path = require('path');
const fs = require('fs');

const svgPath = path.join(__dirname, '../frontend/public/icons/icon.svg');
const svgBuffer = fs.readFileSync(svgPath);

async function generate() {
  const publicIcons = path.join(__dirname, '../frontend/public/icons');
  const publicDir = path.join(__dirname, '../frontend/public');

  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicIcons, 'icon-192x192.png'));
  console.log('Gerado: icon-192x192.png');

  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicIcons, 'icon-512x512.png'));
  console.log('Gerado: icon-512x512.png');

  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('Gerado: apple-touch-icon.png');

  await sharp(svgBuffer)
    .resize(64, 64)
    .png()
    .toFile(path.join(publicDir, 'favicon.ico'));
  console.log('Gerado: favicon.ico');

  // Also copy icon.svg to favicon.svg
  fs.copyFileSync(svgPath, path.join(publicDir, 'favicon.svg'));
}

generate().catch(console.error);
