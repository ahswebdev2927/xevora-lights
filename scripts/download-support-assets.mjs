import fs from 'fs';
import path from 'path';
import https from 'https';

const outDir = path.resolve('public', 'images', 'support');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const assets = [
  {
    name: 'optical-calibration.jpg',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCtuGf56ChnrS_SqowlYmx0nNAGDgnIj_u5j07ftx6zrz2VxNu9eEpr6cATL2pS8P-JlDusIJHBUmwzAKjYxQvmed2picEm-gM4M7sQF36iXvzJwayE2n6UCn6ypWd-3YBuP8eu1tQv7w4Sx1BCuF9fl7A7uoKyb1TjBWI6nJ5MVRqc12TbJfBLIVpXckS2oee_gUl4xO7gSB59NntsL5n8oiwzaToVLqaTAoCTSY8'
  }
];

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

async function main() {
  console.log(`Downloading support assets...`);
  for (const item of assets) {
    const dest = path.join(outDir, item.name);
    console.log(`Downloading ${item.name}...`);
    try {
      await download(item.url, dest);
      console.log(`Saved ${item.name}`);
    } catch (err) {
      console.error(`Error downloading ${item.name}:`, err.message);
    }
  }
  console.log('Finished downloading support assets!');
}

main();
