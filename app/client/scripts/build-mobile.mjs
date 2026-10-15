import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { build } from 'vite';

// Package the SAME Posts HTML, CSS, and JavaScript for the Expo screen.
// Run `npm run build:mobile` here after changing the web Posts frontend.
const root = new URL('../', import.meta.url);
const outputDirectory = new URL('../mobile/src/generated/', root);

const result = await build({
  configFile: false,
  root: fileURLToPath(root),
  logLevel: 'warn',
  build: {
    write: false,
    minify: false,
    target: 'safari16.4',
    lib: {
      entry: fileURLToPath(new URL('src/pages/posts.js', root)),
      name: 'SummitPosts',
      formats: ['iife'],
    },
  },
});

const bundles = (Array.isArray(result) ? result : [result])
  .flatMap((bundle) => bundle.output);
const script = bundles.find((item) => item.type === 'chunk' && item.isEntry);

if (!script || bundles.length !== 1) {
  throw new Error('The mobile Posts page must have one self-contained script.');
}

const [template, styles] = await Promise.all([
  readFile(new URL('index.html', root), 'utf8'),
  readFile(new URL('src/pages/posts.css', root), 'utf8'),
]);
const stylesheetTag = '<link rel="stylesheet" href="/src/pages/posts.css" />';
const scriptTag = '<script type="module" src="/src/pages/posts.js"></script>';

if (!template.includes(stylesheetTag) || !template.includes(scriptTag)) {
  throw new Error('Update the mobile builder to match the Posts entry tags.');
}

const html = template
  .replace(stylesheetTag, () => `<style>${styles}</style>`)
  .replace(scriptTag, () =>
    `<script>${script.code.replace(/<\/script/gi, '<\\/script')}</script>`,
  );

await mkdir(outputDirectory, { recursive: true });
await writeFile(
  new URL('postsHtml.ts', outputDirectory),
  '// Generated from app/client. Rebuild with: npm --prefix app/client run build:mobile\n' +
    `export const postsHtml = ${JSON.stringify(html)};\n`,
);

console.log('Updated app/mobile/src/generated/postsHtml.ts');
