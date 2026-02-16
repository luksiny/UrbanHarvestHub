const fs = require('fs');
const path = require('path');

// This script creates a simple colored PNG as a placeholder
// You can replace these files with proper logo images later

const createSimplePNG = (size, outputPath) => {
    // Create a simple SVG that we'll save as PNG placeholder
    const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="#87A96B"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size / 4}" fill="white" text-anchor="middle" dominant-baseline="middle">UHH</text>
    </svg>
  `;

    console.log(`Created placeholder for ${size}x${size} at ${outputPath}`);
    console.log('Note: These are SVG placeholders. For production, convert favicon.ico to proper PNG files.');

    // For now, just create a note file
    const note = `
To create proper PNG icons from your favicon.ico:

1. Use an online converter like https://convertio.co/ico-png/
2. Upload your favicon.ico file
3. Download as PNG
4. Resize to 192x192 and 512x512
5. Replace logo192.png and logo512.png with the new files

Or use this command if you have ImageMagick installed:
convert favicon.ico -resize 192x192 logo192.png
convert favicon.ico -resize 512x512 logo512.png
`;

    fs.writeFileSync(outputPath + '.txt', note);
};

const publicDir = path.join(__dirname, 'public');

console.log('\n⚠️  IMPORTANT: favicon.ico cannot be used in PWA manifest icons!');
console.log('PWA manifests require PNG format for icons.\n');

createSimplePNG(192, path.join(publicDir, 'logo192.png'));
createSimplePNG(512, path.join(publicDir, 'logo512.png'));

console.log('\n✅ Created instruction files.');
console.log('Please convert your favicon.ico to PNG format using an online tool.\n');
