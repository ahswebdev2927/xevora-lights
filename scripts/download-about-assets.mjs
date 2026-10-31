import fs from 'fs';
import path from 'path';
import https from 'https';

const outDir = path.resolve('public', 'images', 'about');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const assets = [
  {
    name: 'hero-optics-lab.jpg',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDB_aPxsEur6DtQPSPNeYizOfzTTxIYZGysnWr392iIfv_uXhYqjLkGb5tfVOi0-gTiEHJJXpRLF0-qqjuowEmC9D-JIbz2FjiADVivJT50yuQUvjKMYURjPIWZpFtH9VGkX1OeaFysoxjga8SjR0QKEDhBCLK-mvxIH2N3giyZJoDXkJA3TF9yTPIKHOaOhmxvCDbe8mzNHMdMmUggOOvje_a7FHGm-xC6U9kiVTw'
  },
  {
    name: 'pocket-optic-engine.jpg',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBmmO3AFOgTcxqqf6R4t4nTjqf0OImtfbfR29SuL-1JEZgvZyVOVlFWFL_c6Ax-YKf-08TkRsoXpMqdbBGzSDVvTzllDoM2gz37KNEDGiLT4DQM2e1e5YgjV-_QQO1ngmk4nx48RXnL-S-S8_Dd8UPxmFETnvcJkPD6qp0vfrGoxnLNEFSNfTBuhlDzGYgP1Vj_Ji0tlbrRz10C2HWEif-2Xei1ZvrTO-YwN5TorqM'
  },
  {
    name: 'cad-blueprint-lab.jpg',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCOdCU_3BIP7M2R-S7GqLB9eCB-NgOXAgL0XdOV0SUX4R5XK9GineM-hdr9DDkPJCFh10wAmSgDv5MxVM_D_KhflnyNLdEkeVjhXwR0CycjPZ8QwG140AJRqdWYZC2Eho0cJc7HiJXK6MD3QNAgKx-6RBT4iftR5sd73dNGYPwgpqN-3E4SPicoBAzKGuyAC23GGu25w8RE5Zs5Ll-s30_8cbBuXXvQBSArOZGzkC8'
  },
  {
    name: 'founders-workshop.jpg',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCr0DFp6Rc48wSEKkS4oAMsq1QH4rPTR1iV5ysWl5tAYGSDAK-9LFIZ8og9X8fdK78zV7YGB72JCTq7TsG8I2fHm83EjvPfE1rXIB70GW49y_Fq_bQT5Ilu1Tq-x4m-Usb9XvhHyB4WzZml2OA49u-tZ8VkmsenBECDPQ1g3ed2DbWi1U1PG5aAGbl7x_CWylP_84Rex0IVOjhXMEeENeGKyADw1EcF_iRJGmHH0Xw'
  },
  {
    name: 'director-marcus-thorne.jpg',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAYwUJXynlq8g_S4Ahq1kWe7025P7_5kpRRrT6fb96e7MGr2iyIG3M3Qzdzp6Lu7zu-c9U4n2OQqfgRamSnud7LAlGTwy543wW3MBzZXCCDELXjZxs6xPQMaZLVIIZ6b6xMKnKljJW47JeSjCpuhjz8l-skLMvxzk2lWYh8l0ytpI-44NpdOwmi14ykhnQmrtNpalYHAGtsSgHYA7Smi9HNwNA5gkc8OfDGCna8vvc'
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
  console.log(`Downloading ${assets.length} about assets...`);
  for (let i = 0; i < assets.length; i++) {
    const item = assets[i];
    const dest = path.join(outDir, item.name);
    console.log(`[${i + 1}/${assets.length}] Downloading ${item.name}...`);
    try {
      await download(item.url, dest);
      console.log(`Saved ${item.name}`);
    } catch (err) {
      console.error(`Error downloading ${item.name}:`, err.message);
    }
  }
  console.log('Finished downloading About page assets!');
}

main();
