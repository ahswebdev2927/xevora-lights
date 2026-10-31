import fs from 'fs';
import path from 'path';
import https from 'https';

const htmlPath = fs.existsSync('stitch/02_landing_page.html')
  ? path.resolve('stitch/02_landing_page.html')
  : path.resolve('..', 'stitch', '02_landing_page.html');
const outDir = fs.existsSync('xevora-lights-web/public')
  ? path.resolve('xevora-lights-web/public/images/landing')
  : path.resolve('public/images/landing');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const html = fs.readFileSync(htmlPath, 'utf8');

// Match <img ... src="..." ...>
const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
let match;
const found = [];

while ((match = imgRegex.exec(html)) !== null) {
  const fullTag = match[0];
  const url = match[1];
  const altMatch = fullTag.match(/alt=["']([^"']*)["']/i) || fullTag.match(/data-alt=["']([^"']*)["']/i);
  const alt = altMatch ? altMatch[1] : `image_${found.length + 1}`;
  found.push({ url, alt, fullTag });
}

console.log(`Found ${found.length} images.`);

async function download(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to download ${url}: status code ${res.statusCode}`));
      }
      const fileStream = fs.createWriteStream(dest);
      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });
      fileStream.on('error', reject);
    }).on('error', reject);
  });
}

// Map recognizable names based on context/index
const nameMap = [
  'nav-logo.jpg',
  'hero-gflash.jpg',
  'product-10w-rgb.jpg',
  'product-30w-pro.jpg',
  'reel-1.jpg',
  'reel-2.jpg',
  'reel-3.jpg',
  'reel-4.jpg',
  'reel-5.jpg',
  'gobo-scenarios.jpg',
  'battery-architecture.jpg',
  'box-contents.jpg',
  'beam-power-30w.jpg',
  'flexible-beam-zoom.jpg'
];

async function main() {
  const mapping = [];
  for (let i = 0; i < found.length; i++) {
    const item = found[i];
    const fileName = nameMap[i] || `landing-asset-${i + 1}.jpg`;
    const destPath = path.join(outDir, fileName);
    console.log(`Downloading [${i + 1}/${found.length}] -> ${fileName}...`);
    try {
      await download(item.url, destPath);
      console.log(`Saved ${fileName}`);
      mapping.push({ url: item.url, localPath: `/images/landing/${fileName}` });
    } catch (err) {
      console.error(`Error downloading ${fileName}:`, err.message);
    }
  }
  fs.writeFileSync(path.join(outDir, 'mapping.json'), JSON.stringify(mapping, null, 2));
  console.log('Finished downloading all assets!');
}

main();
