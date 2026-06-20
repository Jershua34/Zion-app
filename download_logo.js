const fs = require('fs');
const path = require('path');
const https = require('https');

const logoUrl = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCOQpfP7jjArK5eB-1uySEQwAdrrAYYPdn-bF5BoFC320aeVGwVOaRlNWTXmLZ8VLleXGRaLJkM8MJpLqItxj6Fn722Vmg675CvOasL5yXV4eL_OC90--pOzfIltYeGmFlbaWH-aE9aF6X6IyHdi96ZyliZ-hX6NDwE_w3enY0-7jcCZn7Aq0GLO0pGwBaRxvKNXPYMsXr0uyPr1sF_A7rpsBNFUXgIWCGtT2H8kHU8Im3SqlkIJtaqW-5H1ESg6O4XqdYGy8BAXANC';

const iconsDir = path.join(__dirname, 'frontend', 'icons');

if (!fs.existsSync(iconsDir)){
  fs.mkdirSync(iconsDir, { recursive: true });
}

console.log('Downloading logo for PWA icons...');
https.get(logoUrl, (res) => {
  if (res.statusCode !== 200) {
    console.error(`Failed to download logo. HTTP status: ${res.statusCode}`);
    return;
  }

  const chunks = [];
  res.on('data', (chunk) => chunks.push(chunk));
  res.on('end', () => {
    const buffer = Buffer.concat(chunks);
    
    // Save to icon-192.png
    fs.writeFileSync(path.join(iconsDir, 'icon-192.png'), buffer);
    // Save to icon-512.png
    fs.writeFileSync(path.join(iconsDir, 'icon-512.png'), buffer);
    
    console.log('PWA Icons generated successfully!');
  });
}).on('error', (err) => {
  console.error('Error downloading logo:', err.message);
});
