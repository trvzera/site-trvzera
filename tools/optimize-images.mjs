import { mkdir, readdir } from 'node:fs/promises';
import { basename, extname } from 'node:path';
import sharp from 'sharp';

const output = 'assets/images';
await mkdir(output, { recursive: true });
const webp = (pipeline, name, quality = 82) => pipeline.webp({ quality, effort: 6 }).toFile(`${output}/${name}.webp`);

for (const [source, name, widths, quality] of [
  ['img/giovanni1.jpeg', 'avatar', [192, 384, 512], 82],
  ['img/giovanni2.jpeg', 'portrait', [240, 480, 560, 768], 82],
  ['img/Frieren-2.jpg', 'frieren', [128, 192, 256, 384], 68],
]) {
  for (const width of widths) await webp(sharp(source).rotate().resize({ width, withoutEnlargement: true }), `${name}-${width}`, quality);
}

// Match the original 16:9 card's 50% / 76% crop; the modal keeps the whole photo.
for (const width of [320, 384, 640, 768]) {
  await webp(sharp('img/setup.jpeg').rotate().extract({ left: 0, top: 450, width: 768, height: 432 }).resize({ width }), `setup-preview-${width}`);
}
await webp(sharp('img/setup.jpeg').rotate(), 'setup-full', 88);

for (const [directory, prefix, widths] of [
  ['jogos_img', 'game', [56, 112, 168]],
  ['animes_img', 'anime', [56, 112, 168]],
  ['musicas_img', 'album', [88, 176, 264]],
]) {
  for (const file of (await readdir(directory)).filter(file => /\.(jpe?g|jfif|webp|png)$/i.test(file))) {
    const slug = basename(file, extname(file)).toLowerCase().replaceAll(' ', '-');
    for (const width of widths) await webp(sharp(`${directory}/${file}`).rotate().resize(width, width, { fit: 'cover', withoutEnlargement: true }), `${prefix}-${slug}-${width}`);
  }
}
await sharp('img/favicon.png').resize(32, 32).png({ compressionLevel: 9 }).toFile(`${output}/favicon-32.png`);
await sharp('img/favicon.png').resize(180, 180).png({ compressionLevel: 9 }).toFile(`${output}/apple-touch-icon.png`);
console.log('Generated responsive WebP images and icons; source images preserved.');
