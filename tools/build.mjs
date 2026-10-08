import { readFile, writeFile } from 'node:fs/promises';
import { transform } from 'esbuild';

// Keep the authoring files readable; the static site serves these smaller copies.
const css = await Promise.all(['css/design.css', 'css/index.css'].map(file => readFile(file, 'utf8')));
const styles = await transform(css.join('\n'), { loader: 'css', minify: true, target: ['safari15', 'chrome100', 'firefox100'] });
await writeFile('css/site.min.css', styles.code);

for (const file of ['js/main.js', 'js/components/lottie-controller.js', 'js/components/photo-viewer.js']) {
  let source = await readFile(file, 'utf8');
  if (file === 'js/main.js') source = source.replaceAll("./components/lottie-controller.js", "./components/lottie-controller.min.js").replaceAll("./components/photo-viewer.js", "./components/photo-viewer.min.js");
  const result = await transform(source, { loader: 'js', minify: true, target: 'es2020', legalComments: 'inline' });
  await writeFile(file.replace(/\.js$/, '.min.js'), result.code);
}

const init = await transform(await readFile('js/transition-init.js', 'utf8'), { minify: true, target: 'es2020' });
const html = await readFile('index.html', 'utf8');
if (!html.includes('<script id="theme-init">')) throw new Error('Missing inline theme initializer in index.html');
await writeFile('index.html', html.replace(/<script id="theme-init">[\s\S]*?<\/script>/, `<script id="theme-init">${init.code.trim()}</script>`));
console.log('Built CSS, JavaScript and inline theme initializer.');
